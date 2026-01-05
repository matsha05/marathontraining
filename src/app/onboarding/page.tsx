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

// Types and utilities
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
    ReadinessStatus,
} from '@/domain/onboarding/types';

import { EXPERIENCE_LEVELS, RACE_RECENCY_OPTIONS } from '@/domain/onboarding/constants';
import { calculateVdotFromRace, vdotFromVO2max } from '@/domain/vdot/vdot-estimator';

// Screen components
import { WelcomeScreen, NameScreen, DemographicsScreen } from '@/components/onboarding/screens/identity';
import { TrainingGoalScreen, RaceDetailsScreen, FitnessDurationScreen } from '@/components/onboarding/screens/goal';
import {
    CalibrationMethodScreen,
    RaceInputScreen,
    EasyPaceInputScreen,
    DeviceImportScreen,
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
} from '@/components/onboarding/screens/training-load';
import {
    CurrentPainScreen,
    PainDetailsScreen,
    InjuryHistoryScreen,
    InjuryDetailsScreen,
} from '@/components/onboarding/screens/safety';
import {
    TrainingIntensityScreen,
    StrengthTrainingScreen,
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

    // From easy pace (rough estimation)
    if (data.calibrationMethod === 'easy_pace' && data.easyPaceMinutes !== null) {
        const paceSeconds = (data.easyPaceMinutes * 60) + (data.easyPaceSeconds ?? 0);
        // Rough conversion: easy pace of 10:00/mi ≈ VDOT 40
        // Each 30 seconds faster ≈ +3 VDOT
        const basePace = 600; // 10:00
        const diff = basePace - paceSeconds;
        const vdot = 40 + Math.round(diff / 10);
        return { vdot: Math.max(25, Math.min(70, vdot)), confidence: 'medium' };
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

function calculateReadiness(data: OnboardingData): { status: ReadinessStatus; baseWeeksNeeded: number } {
    const weeklyMiles = data.weeklyMiles ?? 0;
    const longestRun = data.longestRecentRun ?? 0;

    // Determine required starting point based on goal
    const requirements: Record<string, { weeklyMiles: number; longRun: number }> = {
        '5k': { weeklyMiles: 10, longRun: 4 },
        '10k': { weeklyMiles: 15, longRun: 6 },
        'half': { weeklyMiles: 20, longRun: 8 },
        'marathon': { weeklyMiles: 25, longRun: 10 },
        'general': { weeklyMiles: 0, longRun: 0 },
    };

    const req = requirements[data.trainingGoal ?? 'marathon'];

    // Check if they need base building
    const needsMoreMiles = weeklyMiles < req.weeklyMiles * 0.7;
    const needsLongerRun = longestRun < req.longRun * 0.7;

    if (needsMoreMiles || needsLongerRun) {
        // Calculate how many weeks of base building needed
        const mileGap = Math.max(0, req.weeklyMiles - weeklyMiles);
        const weeksForMiles = Math.ceil(mileGap / 3); // ~3 miles increase per week max

        const runGap = Math.max(0, req.longRun - longestRun);
        const weeksForRun = Math.ceil(runGap / 1.5); // ~1.5 mile increase per week for long run

        const baseWeeks = Math.max(weeksForMiles, weeksForRun, 2);

        return { status: 'needs_base', baseWeeksNeeded: Math.min(baseWeeks, 8) };
    }

    // Check timeline
    if (data.raceDate) {
        const weeksToRace = Math.floor(
            (new Date(data.raceDate).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)
        );

        const minWeeks: Record<string, number> = {
            '5k': 4,
            '10k': 6,
            'half': 8,
            'marathon': 12,
        };

        if (weeksToRace < (minWeeks[data.trainingGoal ?? 'marathon'] ?? 8)) {
            return { status: 'timeline_short', baseWeeksNeeded: 0 };
        }
    }

    return { status: 'ready', baseWeeksNeeded: 0 };
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

function OnboardingContent() {
    const searchParams = useSearchParams();
    const [step, setStep] = useState<OnboardingStep>('welcome');
    const [data, setData] = useState<OnboardingData>(INITIAL_ONBOARDING_DATA);
    const [mounted, setMounted] = useState(false);
    const [showResumePrompt, setShowResumePrompt] = useState(false);
    const [savedProgress, setSavedProgress] = useState<{ step: OnboardingStep; data: OnboardingData } | null>(null);
    const connectProvider = searchParams.get('connect');
    const connectError = searchParams.get('error');
    const connectErrorMessage = formatConnectError(connectProvider, connectError);
    const [planGenerated, setPlanGenerated] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const router = useRouter();

    // Load saved progress on mount
    useEffect(() => {
        setMounted(true);

        // Check for philosophy selected from quiz (before auth)
        const selectedPhilosophy = localStorage.getItem('selected-philosophy');
        if (selectedPhilosophy && ['hansons', 'higdon', 'pfitzinger', 'daniels'].includes(selectedPhilosophy)) {
            setData(prev => ({
                ...prev,
                trainingPhilosophy: selectedPhilosophy as 'hansons' | 'higdon' | 'pfitzinger' | 'daniels'
            }));
            localStorage.removeItem('selected-philosophy'); // Clear after use
        }

        const saved = loadOnboardingProgress();
        if (saved && saved.step !== 'welcome' && saved.step !== 'complete') {
            setSavedProgress(saved);
            setShowResumePrompt(true);
        }
    }, []);

    // Save progress on every change
    useEffect(() => {
        if (mounted && step !== 'welcome' && step !== 'generating' && step !== 'complete') {
            saveOnboardingProgress(step, data);
        }
    }, [step, data, mounted]);

    // Navigation handlers
    const goToNext = useCallback(() => {
        const nextStep = getNextStep(step, data);

        // Calculate VDOT before revealing
        if (nextStep === 'vdot-reveal' && data.vdot === null) {
            const { vdot, confidence } = calculateVdotFromData(data);
            setData(prev => ({ ...prev, vdot, vdotConfidence: confidence }));
        }

        // Calculate readiness before check
        if (nextStep === 'readiness-check') {
            const { status, baseWeeksNeeded } = calculateReadiness(data);
            setData(prev => ({ ...prev, readinessStatus: status, baseWeeksNeeded }));
        }

        setStep(nextStep);
    }, [step, data]);

    const goBack = useCallback(() => {
        const prevStep = getPreviousStep(step, data);
        if (prevStep) {
            setStep(prevStep);
        }
    }, [step, data]);

    const handleResume = () => {
        if (savedProgress) {
            setStep(savedProgress.step);
            setData(savedProgress.data);
        }
        setShowResumePrompt(false);
    };

    const handleStartFresh = () => {
        setShowResumePrompt(false);
        setSavedProgress(null);
    };

    // Don't render until mounted (prevents hydration mismatch)
    if (!mounted) {
        return null;
    }

    // Resume prompt
    if (showResumePrompt && savedProgress) {
        return (
            <div className="v2-root min-h-screen flex items-center justify-center px-6 py-12">
                <div className="v2-card p-8 text-center max-w-md w-full">
                    <h1 className="v2-heading-md mb-4">Welcome back!</h1>
                    <p className="v2-body-md mb-8" style={{ color: 'var(--v2-text-muted)' }}>
                        You have saved progress. Would you like to continue where you left off?
                    </p>
                    <div className="space-y-3">
                        <button onClick={handleResume} className="v2-btn v2-btn-primary v2-btn-lg w-full">
                            Continue where I left off
                        </button>
                        <button onClick={handleStartFresh} className="v2-btn v2-btn-secondary w-full">
                            Start fresh
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                        onAgeChange={(age) => setData(prev => ({ ...prev, age }))}
                        onSexChange={(sex) => setData(prev => ({ ...prev, sex: sex as Sex }))}
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

                {step === 'device-import' && (
                    <DeviceImportScreen
                        onStravaConnect={() => {
                            if (typeof window !== 'undefined') {
                                window.open('/api/strava/connect?from=onboarding', '_blank', 'noopener,noreferrer');
                            }
                        }}
                        onContinue={goToNext}
                        connectError={connectErrorMessage}
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
                        onRecalculate={() => setStep('calibration-method')}
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
                        value={data.longRunDay}
                        onChange={(longRunDay) => setData(prev => ({ ...prev, longRunDay }))}
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

                {step === 'strength-training' && (
                    <StrengthTrainingScreen
                        value={data.includeStrength}
                        onChange={(includeStrength) => setData(prev => ({ ...prev, includeStrength }))}
                        onContinue={goToNext}
                        onBack={goBack}
                    />
                )}

                {step === 'readiness-check' && (
                    <ReadinessCheckScreen
                        data={data}
                        readinessStatus={data.readinessStatus ?? 'ready'}
                        baseWeeksNeeded={data.baseWeeksNeeded ?? 0}
                        onProceed={goToNext}
                        onProceedAnyway={goToNext}
                        onBack={goBack}
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
                                        age: data.age || null,
                                        sex: data.sex || null,
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
                            const saveResult = await savePlan(result.data);
                            if (saveResult.success) {
                                setPlanGenerated(true);
                                goToNext();
                            } else {
                                setGenerationError('Failed to save your plan. Please try again.');
                                setStep('readiness-check');
                            }
                        }}
                    />
                )}

                {step === 'complete' && (
                    <CompleteScreen
                        data={data}
                        onViewDashboard={() => {
                            clearOnboardingProgress();
                            router.push('/dashboard');
                        }}
                        onViewPlan={() => {
                            clearOnboardingProgress();
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
        <div className="v2-root min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-2 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--v2-accent)', borderTopColor: 'transparent' }} />
                <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>Loading...</p>
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
