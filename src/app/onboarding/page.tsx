'use client';

/**
 * THE LONG GAME - Onboarding Page
 * 
 * Main orchestrator for the coach-backed onboarding flow.
 * Implements Typeform-style one-question-per-screen with full state machine.
 */

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/components/onboarding/ui';
import { createPlanFromOnboarding, savePlan } from '@/domain/plan/service';
import { calculateReadiness } from '@/domain/onboarding/readiness';

import {
    OnboardingStep,
    OnboardingData,
    INITIAL_ONBOARDING_DATA,
    getNextStep,
    getPreviousStep,
    getStepProgress,
    saveOnboardingProgress,
    loadOnboardingProgress,
    clearOnboardingProgress,
    Sex,
    TrainingGoal,
    FitnessDuration,
    CalibrationMethod,
    RaceDistance,
    RaceRecency,
    ExperienceLevel,
    EffortType,
    InjuryLocation,
    PainSeverity,
    TrainingIntensity,
    TrainingMindset,
} from '@/domain/onboarding/types';

import { EXPERIENCE_LEVELS, RACE_RECENCY_OPTIONS } from '@/domain/onboarding/constants';
import { calculateAgeFromDob } from '@/domain/onboarding/utils';
import { calculateVdotFromRace, vdotFromVO2max } from '@/domain/vdot/vdot-estimator';
import { useAuth } from '@/domain/auth/context';

// Screen components
import { WelcomeScreen, MileGateScreen, NameScreen, DemographicsScreen } from '@/components/onboarding/screens/identity';
import { AvatarSelectionScreen } from '@/components/onboarding/screens/avatar';
import { TrainingGoalScreen, RaceDetailsScreen, FitnessDurationScreen } from '@/components/onboarding/screens/goal';
import {
    CalibrationMethodScreen,
    RaceInputScreen,
    EasyPaceInputScreen,
    ManualVo2maxInputScreen,
    HardEffortInputScreen,
    EstimationFlowScreen,
    VdotRevealScreen,
} from '@/components/onboarding/screens/calibration';
import {
    WeeklyMileageScreen,
    RunsPerWeekScreen,
    LongestRunScreen,
    AvailableDaysScreen,
    LongRunDayScreen,
    PlanStartDateScreen,
} from '@/components/onboarding/screens/training-load';
import {
    CurrentPainScreen,
    PainDetailsScreen,
    InjuryHistoryScreen,
    InjuryDetailsScreen,
} from '@/components/onboarding/screens/safety';
import {
    TrainingIntensityScreen,
    TrainingMindsetScreen,
    StrengthTrainingScreen,
    CoachRevealScreen,
    ReadinessCheckScreen,
    GeneratingScreen,
    CompleteScreen,
} from '@/components/onboarding/screens/preferences';

// =============================================================================
// VDOT CALCULATION HELPERS
// =============================================================================

function calculateVdotFromData(data: OnboardingData): { vdot: number; confidence: 'high' | 'medium' | 'low' } {
    // From race result (gold standard)
    if (data.calibrationMethod === 'race' && data.raceDistance && data.raceTimeMinutes !== null) {
        const totalSeconds = (data.raceTimeMinutes * 60) + (data.raceTimeSeconds ?? 0);
        const result = calculateVdotFromRace(data.raceDistance, totalSeconds);

        // Apply recency adjustment
        const recencyOption = RACE_RECENCY_OPTIONS.find(r => r.value === data.raceRecency);
        const adjustment = recencyOption?.vdotAdjustment ?? 0;

        return {
            vdot: Math.round(result.vdot + adjustment),
            confidence: data.raceRecency === 'recent' ? 'high' : 'medium'
        };
    }

    // From easy pace (rough estimation based on Daniels tables)
    if (data.calibrationMethod === 'easy_pace' && data.easyPaceMinutes !== null) {
        const paceSeconds = (data.easyPaceMinutes * 60) + (data.easyPaceSeconds ?? 0);
        // Daniels easy pace reference points (seconds per mile -> VDOT):
        // 8:00/mi (480s) ≈ VDOT 55
        // 10:00/mi (600s) ≈ VDOT 40
        // 12:00/mi (720s) ≈ VDOT 30
        // This gives us ~8 seconds per VDOT point
        const basePace = 600; // 10:00/mi = VDOT 40
        const diffSeconds = basePace - paceSeconds;
        const vdot = 40 + Math.round(diffSeconds / 8);
        return { vdot: Math.max(25, Math.min(75, vdot)), confidence: 'medium' };
    }

    // From hard effort
    if (data.calibrationMethod === 'effort' && data.effortType && data.effortTimeMinutes !== null) {
        // Parkrun is a 5K
        if (data.effortType === 'parkrun') {
            const totalSeconds = (data.effortTimeMinutes * 60) + (data.effortTimeSeconds ?? 0);
            // Adjust for effort level (10 = max, 8 = typical hard effort)
            const effortAdjust = data.effortLevel ? (10 - data.effortLevel) * 0.5 : 0;
            const result = calculateVdotFromRace('5k', totalSeconds);
            return { vdot: Math.round(result.vdot + effortAdjust), confidence: 'medium' };
        }
        // For other efforts, estimate conservatively
        return { vdot: 38, confidence: 'low' };
    }

    // From experience level estimate (when user picks "I have no idea")
    if (data.calibrationMethod === 'estimate' && data.experienceLevel) {
        const level = EXPERIENCE_LEVELS.find(l => l.value === data.experienceLevel);
        return { vdot: level?.baseVdot ?? 35, confidence: 'low' };
    }

    // From VO2max with flat 10% conservative discount
    if (data.calibrationMethod === 'vo2max' && data.garminVO2max !== null) {
        const result = vdotFromVO2max(data.garminVO2max);
        return { vdot: result.vdot, confidence: result.confidence };
    }

    // Default fallback
    return { vdot: 35, confidence: 'low' };
}

function formatConnectError(provider: string | null, error: string | null): string | null {
    if (!provider || !error) return null;
    const label = provider === 'strava' ? 'Strava' : 'Device';
    if (error === 'missing_config') {
        return `${label} isn’t configured yet. Add the ${label.toUpperCase()} client ID, secret, and redirect URL, then try again.`;
    }
    if (error === 'unauthorized') {
        return `Sign in to connect ${label}, then try again.`;
    }
    if (error === 'invalid_state' || error === 'expired_state') {
        return `${label} connection expired. Try connecting again.`;
    }
    if (error === 'connect_failed') {
        return `We couldn’t start the ${label} connection. Try again, or continue without syncing.`;
    }
    return `We couldn’t start the ${label} connection.`;
}

// =============================================================================
// MAIN ONBOARDING PAGE
// =============================================================================

/**
 * Onboarding State Machine
 * 
 * Single `phase` state replaces multiple booleans.
 * Uses shared AuthProvider from root for auth state.
 */
type OnboardingPhase =
    | 'initializing'    // Waiting for auth + checking for existing plan
    | 'has-plan'        // User has a plan (show "You already have a plan" guard)
    | 'resume-prompt'   // User has saved progress (show resume/start-fresh picker)
    | 'active';         // Onboarding in progress

function OnboardingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { status: authStatus, athleteId } = useAuth();

    // ==========================================================================
    // STATE MACHINE - Single source of truth for which UI to show
    // ==========================================================================

    const [phase, setPhase] = useState<OnboardingPhase>('initializing');
    const [step, setStep] = useState<OnboardingStep>('welcome');
    const [data, setData] = useState<OnboardingData>(INITIAL_ONBOARDING_DATA);
    const [savedProgress, setSavedProgress] = useState<{ step: OnboardingStep; data: OnboardingData } | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);

    // URL params for connection errors
    const connectProvider = searchParams.get('connect');
    const connectError = searchParams.get('error');
    const connectErrorMessage = formatConnectError(connectProvider, connectError);

    // ==========================================================================
    // INITIALIZATION - Runs once when auth is ready
    // ==========================================================================

    useEffect(() => {
        // Wait for auth to be determined
        if (authStatus === 'loading') return;

        async function initialize() {
            try {
                // 1. Check if user has an existing plan
                const { hasPlanV2 } = await import('@/domain/plan/repository');
                const planExists = await hasPlanV2(athleteId);

                if (planExists) {
                    // Clear any stale onboarding progress
                    clearOnboardingProgress(athleteId);
                    setPhase('has-plan');
                    return;
                }

                // 2. Check for saved onboarding progress
                const saved = loadOnboardingProgress(athleteId);
                if (saved && saved.step !== 'welcome' && saved.step !== 'complete') {
                    setSavedProgress(saved);
                    setPhase('resume-prompt');
                    return;
                }

                // 3. No existing plan, no saved progress - start fresh
                setPhase('active');
            } catch (error) {
                console.error('Onboarding initialization error:', error);
                // On error, just start the flow fresh
                setPhase('active');
            }
        }

        initialize();
    }, [authStatus, athleteId]);

    // ==========================================================================
    // SAVE PROGRESS (only when actively onboarding)
    // ==========================================================================

    useEffect(() => {
        if (phase === 'active' && step !== 'welcome' && step !== 'generating' && step !== 'complete') {
            saveOnboardingProgress(step, data, athleteId);
        }
    }, [phase, step, data, athleteId]);

    // ==========================================================================
    // NAVIGATION HANDLERS
    // ==========================================================================

    const goToNext = useCallback(() => {
        const nextStep = getNextStep(step, data);

        // Always recalculate VDOT when transitioning to vdot-reveal
        // This ensures changes to calibration data are reflected
        if (nextStep === 'vdot-reveal') {
            const { vdot, confidence } = calculateVdotFromData(data);
            setData(prev => ({ ...prev, vdot, vdotConfidence: confidence }));
        }

        // Calculate readiness before check
        if (nextStep === 'readiness-check') {
            const { status, baseWeeksNeeded, maintenanceWeeksNeeded } = calculateReadiness(data);
            setData(prev => ({ ...prev, readinessStatus: status, baseWeeksNeeded, maintenanceWeeksNeeded }));
        }

        setStep(nextStep);
    }, [step, data]);

    const goBack = useCallback(() => {
        const prevStep = getPreviousStep(step, data);
        if (prevStep) {
            setStep(prevStep);
        }
    }, [step, data]);

    // Resume saved progress
    const handleResume = () => {
        if (savedProgress) {
            setStep(savedProgress.step);
            setData(savedProgress.data);
        }
        setPhase('active');
    };

    // Start fresh (discard saved progress)
    const handleStartFresh = () => {
        clearOnboardingProgress(athleteId);
        setSavedProgress(null);
        setPhase('active');
    };

    // User wants to create new plan despite having one
    const handleCreateNewPlan = () => {
        clearOnboardingProgress(athleteId);
        setPhase('active');
    };

    // ==========================================================================
    // RENDER BASED ON PHASE
    // ==========================================================================

    // Phase 1: Initializing (waiting for auth + plan check)
    if (phase === 'initializing') {
        return (
            <div className="v3-root min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
                    <p className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>Preparing your coaching experience...</p>
                </div>
            </div>
        );
    }

    // Phase 2: User has existing plan
    if (phase === 'has-plan') {
        return (
            <div className="v3-root min-h-screen flex items-center justify-center px-6 py-12">
                <div className="v3-card p-8 text-center max-w-md w-full">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{ background: 'var(--color-accent-subtle)' }}>
                        <svg className="w-7 h-7" style={{ color: 'var(--color-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="v3-heading-md mb-4">You already have a plan</h1>
                    <p className="v3-body-md mb-8" style={{ color: 'var(--text-muted)' }}>
                        Creating a new plan will replace your current training. Are you sure?
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="v3-btn v3-btn-primary v3-btn-lg w-full"
                        >
                            View Current Plan
                        </button>
                        <button
                            onClick={handleCreateNewPlan}
                            className="v3-btn v3-btn-secondary w-full"
                        >
                            Create New Plan
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Phase 3: Resume prompt
    if (phase === 'resume-prompt' && savedProgress) {
        return (
            <div className="v3-root min-h-screen flex items-center justify-center px-6 py-12">
                <div className="v3-card p-8 text-center max-w-md w-full">
                    <h1 className="v3-heading-md mb-4">Welcome back!</h1>
                    <p className="v3-body-md mb-8" style={{ color: 'var(--text-muted)' }}>
                        You have saved progress. Would you like to continue where you left off?
                    </p>
                    <div className="space-y-3">
                        <button onClick={handleResume} className="v3-btn v3-btn-primary v3-btn-lg w-full">
                            Continue where I left off
                        </button>
                        <button onClick={handleStartFresh} className="v3-btn v3-btn-secondary w-full">
                            Start fresh
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Phase 4: Active onboarding (falls through from all other phases)

    const progress = getStepProgress(step);

    return (
        <>
            {step !== 'welcome' && step !== 'complete' && (
                <ProgressBar progress={progress} />
            )}

            <AnimatePresence mode="wait">
                {/* WELCOME */}
                {step === 'welcome' && (
                    <WelcomeScreen onContinue={goToNext} />
                )}

                {/* MILE GATE - Can you run 1 mile? */}
                {step === 'mile-gate' && (
                    <MileGateScreen
                        value={data.canRunMile}
                        onChange={(canRunMile) => setData(prev => ({ ...prev, canRunMile }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {/* IDENTITY */}
                {step === 'name' && (
                    <NameScreen
                        name={data.name}
                        onNameChange={(name) => setData(prev => ({ ...prev, name }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {step === 'demographics' && (
                    <DemographicsScreen
                        data={data}
                        onDobChange={(dateOfBirth) => setData(prev => ({ ...prev, dateOfBirth }))}
                        onSexChange={(sex) => setData(prev => ({ ...prev, sex: sex as Sex }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {/* AVATAR SELECTION */}
                {step === 'avatar' && (
                    <AvatarSelectionScreen
                        value={data.avatar}
                        onChange={(avatar) => setData(prev => ({ ...prev, avatar }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {/* GOAL */}
                {step === 'training-goal' && (
                    <TrainingGoalScreen
                        selected={data.trainingGoal}
                        onSelect={(goal) => setData(prev => ({ ...prev, trainingGoal: goal as TrainingGoal }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {step === 'race-details' && (
                    <RaceDetailsScreen
                        data={data}
                        onRaceNameChange={(raceName) => setData(prev => ({ ...prev, raceName }))}
                        onRaceDateChange={(raceDate) => setData(prev => ({ ...prev, raceDate }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {step === 'fitness-duration' && (
                    <FitnessDurationScreen
                        selected={data.fitnessDuration}
                        onSelect={(duration) => setData(prev => ({ ...prev, fitnessDuration: duration as FitnessDuration }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {/* CALIBRATION */}
                {step === 'calibration-method' && (
                    <CalibrationMethodScreen
                        selected={data.calibrationMethod}
                        onSelect={(method) => setData(prev => ({ ...prev, calibrationMethod: method as CalibrationMethod }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {step === 'race-input' && (
                    <RaceInputScreen
                        data={data}
                        onDistanceChange={(distance) => setData(prev => ({ ...prev, raceDistance: distance as RaceDistance }))}
                        onTimeChange={(mins, secs) => setData(prev => ({
                            ...prev,
                            raceTimeMinutes: mins,
                            raceTimeSeconds: secs
                        }))}
                        onRecencyChange={(recency) => setData(prev => ({ ...prev, raceRecency: recency as RaceRecency }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {step === 'easy-pace-input' && (
                    <EasyPaceInputScreen
                        data={data}
                        onPaceChange={(mins, secs) => setData(prev => ({
                            ...prev,
                            easyPaceMinutes: mins,
                            easyPaceSeconds: secs
                        }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}



                {step === 'manual-vo2max' && (
                    <ManualVo2maxInputScreen
                        value={data.garminVO2max}
                        onChange={(vo2max) => setData(prev => ({
                            ...prev,
                            garminVO2max: vo2max,
                            // Note: VDOT will be calculated in calculateVdotFromData using experience adjustment
                        }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {step === 'hard-effort-input' && (
                    <HardEffortInputScreen
                        data={data}
                        onEffortTypeChange={(type) => setData(prev => ({ ...prev, effortType: type as EffortType }))}
                        onDistanceChange={(distance) => setData(prev => ({ ...prev, effortDistance: distance }))}
                        onTimeChange={(mins, secs) => setData(prev => ({
                            ...prev,
                            effortTimeMinutes: mins,
                            effortTimeSeconds: secs
                        }))}
                        onEffortLevelChange={(level) => setData(prev => ({ ...prev, effortLevel: level }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {step === 'estimation-flow' && (
                    <EstimationFlowScreen
                        selected={data.experienceLevel}
                        onSelect={(level) => setData(prev => ({ ...prev, experienceLevel: level as ExperienceLevel }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {step === 'vdot-reveal' && (
                    <VdotRevealScreen
                        data={data}
                        onRecalculate={() => {
                            // Clear VDOT so it will be recalculated on next reveal
                            setData(prev => ({ ...prev, vdot: null, vdotConfidence: null }));
                            setStep('calibration-method');
                        }}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {/* TRAINING LOAD */}
                {step === 'weekly-mileage' && (
                    <WeeklyMileageScreen
                        value={data.weeklyMiles}
                        onChange={(weeklyMiles) => setData(prev => ({ ...prev, weeklyMiles }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {step === 'runs-per-week' && (
                    <RunsPerWeekScreen
                        value={data.runsPerWeek}
                        onChange={(runsPerWeek) => setData(prev => ({ ...prev, runsPerWeek }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {step === 'longest-run' && (
                    <LongestRunScreen
                        value={data.longestRecentRun}
                        onChange={(longestRecentRun) => setData(prev => ({ ...prev, longestRecentRun }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {step === 'available-days' && (
                    <AvailableDaysScreen
                        value={data.availableDays}
                        onChange={(availableDays) => setData(prev => ({ ...prev, availableDays }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {step === 'long-run-day' && (
                    <LongRunDayScreen
                        value={data.longRunDays}
                        onChange={(longRunDays) => setData(prev => ({ ...prev, longRunDays }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {step === 'plan-start-date' && (
                    <PlanStartDateScreen
                        value={data.planStartDate}
                        raceDate={data.raceDate}
                        onChange={(planStartDate) => setData(prev => ({ ...prev, planStartDate }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {/* SAFETY */}
                {step === 'current-pain' && (
                    <CurrentPainScreen
                        value={data.hasCurrentPain}
                        onChange={(hasCurrentPain) => setData(prev => ({ ...prev, hasCurrentPain }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {step === 'pain-details' && (
                    <PainDetailsScreen
                        data={data}
                        onLocationChange={(painLocation) => setData(prev => ({ ...prev, painLocation: painLocation as InjuryLocation }))}
                        onSeverityChange={(painSeverity) => setData(prev => ({ ...prev, painSeverity: painSeverity as PainSeverity }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {step === 'injury-history' && (
                    <InjuryHistoryScreen
                        value={data.hasRecentInjury}
                        onChange={(hasRecentInjury) => setData(prev => ({ ...prev, hasRecentInjury }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {step === 'injury-details' && (
                    <InjuryDetailsScreen
                        value={data.injuryLocation}
                        onChange={(injuryLocation) => setData(prev => ({ ...prev, injuryLocation: injuryLocation as InjuryLocation }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {/* PREFERENCES */}
                {step === 'training-intensity' && (
                    <TrainingIntensityScreen
                        value={data.trainingIntensity}
                        onChange={(intensity) => setData(prev => ({ ...prev, trainingIntensity: intensity as TrainingIntensity }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {step === 'training-mindset' && (
                    <TrainingMindsetScreen
                        value={data.trainingMindset}
                        onChange={(mindset) => setData(prev => ({ ...prev, trainingMindset: mindset as TrainingMindset }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {step === 'strength-training' && (
                    <StrengthTrainingScreen
                        value={data.includeStrength}
                        onChange={(includeStrength) => setData(prev => ({ ...prev, includeStrength }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {/* COACH REVEAL - The payoff moment */}
                {step === 'coach-reveal' && (
                    <CoachRevealScreen
                        data={data}
                        onConfirm={(philosophy) => {
                            const updated = { ...data, trainingPhilosophy: philosophy };
                            const { status, baseWeeksNeeded, maintenanceWeeksNeeded } = calculateReadiness(updated);
                            setData(prev => ({
                                ...prev,
                                trainingPhilosophy: philosophy,
                                readinessStatus: status,
                                baseWeeksNeeded,
                                maintenanceWeeksNeeded,
                            }));
                            setStep('readiness-check');
                        }}
                        onBack={goBack}
                    />
                )}


                {step === 'readiness-check' && (
                    <ReadinessCheckScreen
                        data={data}
                        readinessStatus={data.readinessStatus ?? 'ready'}
                        baseWeeksNeeded={data.baseWeeksNeeded ?? 0}
                        maintenanceWeeksNeeded={data.maintenanceWeeksNeeded ?? 0}
                        onProceed={() => {
                            setGenerationError(null); // Clear any previous errors
                            goToNext();
                        }}
                        onProceedAnyway={() => {
                            setGenerationError(null);
                            goToNext();
                        }}
                        onBack={goBack}
                        error={generationError}
                    />
                )}

                {step === 'generating' && (
                    <GeneratingScreen
                        onComplete={async () => {
                            // Generate the plan
                            const result = createPlanFromOnboarding(data);
                            if (!result.success) {
                                setGenerationError(result.error.message);
                                setStep('readiness-check');
                                return;
                            }

                            // Save athlete profile and goal race to Supabase
                            try {
                                const supabase = (await import('@/infrastructure/supabase')).createSupabaseBrowserClient();
                                const { data: { user } } = await supabase.auth.getUser();

                                if (user) {
                                    // 1. Save athlete profile (name is required)
                                    await supabase.from('athletes').upsert({
                                        id: user.id,
                                        name: data.name || 'Athlete', // Default if empty
                                        age: data.dateOfBirth ? calculateAgeFromDob(data.dateOfBirth) : (data.age || null),
                                        sex: data.sex || null,
                                        avatar: data.avatar || 'marathon', // Default avatar
                                    }, { onConflict: 'id' });

                                    // 2. Save goal race if we have race details
                                    if (data.raceDate) {
                                        const goalRaceId = `${user.id}-${data.raceDate}`;
                                        await supabase.from('goal_races').upsert({
                                            id: goalRaceId,
                                            athlete_id: user.id,
                                            race_name: data.raceName || `${data.trainingGoal?.toUpperCase() || 'Marathon'} Race`,
                                            race_date: data.raceDate,
                                            distance: data.trainingGoal || 'marathon',
                                            is_active: true,
                                        }, { onConflict: 'id' });
                                    }
                                }
                            } catch (error) {
                                console.warn('Failed to save athlete/goal data:', error);
                                // Continue anyway - plan is more important
                            }

                            // 3. Save the training plan
                            const saveResult = await savePlan(result.data, athleteId);
                            if (saveResult.success) {
                                goToNext();
                            } else {
                                setGenerationError(saveResult.error.message || 'Failed to save your plan. Please try again.');
                                setStep('readiness-check');
                            }
                        }}
                    />
                )}

                {step === 'complete' && (
                    <CompleteScreen
                        data={data}
                        onViewDashboard={() => {
                            clearOnboardingProgress(athleteId);
                            router.push('/dashboard');
                        }}
                        onViewPlan={() => {
                            clearOnboardingProgress(athleteId);
                            router.push('/plan');
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

// Loading fallback for Suspense
function OnboardingLoading() {
    return (
        <div className="v3-root min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-2 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
                <p className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
            </div>
        </div>
    );
}

// Wrap in Suspense for useSearchParams
export default function OnboardingPage() {
    return (
        <Suspense fallback={<OnboardingLoading />}>
            <OnboardingContent />
        </Suspense>
    );
}
