'use client';

import { Suspense, type ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ProgressBar } from '@/components/onboarding/ui';
import {
    EffortType,
    ExperienceLevel,
    FitnessDuration,
    InjuryLocation,
    OnboardingStep,
    PainSeverity,
    RaceDistance,
    RaceRecency,
    Sex,
    TrainingGoal,
    TrainingIntensity,
    TrainingMindset,
    CalibrationMethod,
} from '@/domain/onboarding/types';
import { useOnboardingController } from '@/domain/onboarding/useOnboardingController';

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
    CoachRevealScreen,
    ReadinessCheckScreen,
    GeneratingScreen,
    CompleteScreen,
} from '@/components/onboarding/screens/preferences';

type OnboardingController = ReturnType<typeof useOnboardingController>;

function renderExistingPlanGuard(controller: OnboardingController) {
    return (
        <div className="v3-root min-h-screen flex items-center justify-center px-6 py-12">
            <div className="v3-card p-8 text-center max-w-md w-full">
                <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: 'var(--color-accent-subtle)' }}
                >
                    <svg className="w-7 h-7" style={{ color: 'var(--color-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="v3-heading-md mb-4">You already have a plan</h1>
                <p className="v3-body-md mb-8" style={{ color: 'var(--text-muted)' }}>
                    Creating a new plan will replace your current training. Are you sure?
                </p>
                <div className="space-y-3">
                    <button onClick={controller.viewDashboard} className="v3-btn v3-btn-primary v3-btn-lg w-full">
                        View Current Plan
                    </button>
                    <button onClick={controller.handleCreateNewPlan} className="v3-btn v3-btn-secondary w-full">
                        Create New Plan
                    </button>
                </div>
            </div>
        </div>
    );
}

function renderResumeGuard(controller: OnboardingController) {
    return (
        <div className="v3-root min-h-screen flex items-center justify-center px-6 py-12">
            <div className="v3-card p-8 text-center max-w-md w-full">
                <h1 className="v3-heading-md mb-4">Welcome back!</h1>
                <p className="v3-body-md mb-8" style={{ color: 'var(--text-muted)' }}>
                    You have saved progress. Would you like to continue where you left off?
                </p>
                <div className="space-y-3">
                    <button onClick={controller.handleResume} className="v3-btn v3-btn-primary v3-btn-lg w-full">
                        Continue where I left off
                    </button>
                    <button onClick={controller.handleStartFresh} className="v3-btn v3-btn-secondary w-full">
                        Start fresh
                    </button>
                </div>
            </div>
        </div>
    );
}

function OnboardingContent() {
    const controller = useOnboardingController();
    const {
        data,
        generationError,
        goBack,
        goToNext,
        phase,
        progress,
        resetCalibration,
        setData,
        step,
    } = controller;

    if (phase === 'initializing') {
        return <OnboardingLoading message="Preparing your coaching experience..." />;
    }

    if (phase === 'has-plan') {
        return renderExistingPlanGuard(controller);
    }

    if (phase === 'resume-prompt' && controller.savedProgress) {
        return renderResumeGuard(controller);
    }

    const screenRenderers: Record<OnboardingStep, () => ReactNode> = {
        'welcome': () => <WelcomeScreen onContinue={goToNext} />,
        'mile-gate': () => (
            <MileGateScreen
                value={data.canRunMile}
                onChange={(canRunMile) => setData(prev => ({ ...prev, canRunMile }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'name': () => (
            <NameScreen
                name={data.name}
                onNameChange={(name) => setData(prev => ({ ...prev, name }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'demographics': () => (
            <DemographicsScreen
                data={data}
                onDobChange={(dateOfBirth) => setData(prev => ({ ...prev, dateOfBirth }))}
                onSexChange={(sex) => setData(prev => ({ ...prev, sex: sex as Sex }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'avatar': () => (
            <AvatarSelectionScreen
                value={data.avatar}
                onChange={(avatar) => setData(prev => ({ ...prev, avatar }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'training-goal': () => (
            <TrainingGoalScreen
                selected={data.trainingGoal}
                onSelect={(goal) => setData(prev => ({ ...prev, trainingGoal: goal as TrainingGoal }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'race-details': () => (
            <RaceDetailsScreen
                data={data}
                onRaceNameChange={(raceName) => setData(prev => ({ ...prev, raceName }))}
                onRaceDateChange={(raceDate) => setData(prev => ({ ...prev, raceDate }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'fitness-duration': () => (
            <FitnessDurationScreen
                selected={data.fitnessDuration}
                onSelect={(duration) => setData(prev => ({ ...prev, fitnessDuration: duration as FitnessDuration }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'calibration-method': () => (
            <CalibrationMethodScreen
                selected={data.calibrationMethod}
                onSelect={(method) => setData(prev => ({ ...prev, calibrationMethod: method as CalibrationMethod }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'race-input': () => (
            <RaceInputScreen
                data={data}
                onDistanceChange={(distance) => setData(prev => ({ ...prev, raceDistance: distance as RaceDistance }))}
                onTimeChange={(mins, secs) => setData(prev => ({ ...prev, raceTimeMinutes: mins, raceTimeSeconds: secs }))}
                onRecencyChange={(recency) => setData(prev => ({ ...prev, raceRecency: recency as RaceRecency }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'easy-pace-input': () => (
            <EasyPaceInputScreen
                data={data}
                onPaceChange={(mins, secs) => setData(prev => ({ ...prev, easyPaceMinutes: mins, easyPaceSeconds: secs }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'manual-vo2max': () => (
            <ManualVo2maxInputScreen
                value={data.garminVO2max}
                onChange={(garminVO2max) => setData(prev => ({ ...prev, garminVO2max }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'hard-effort-input': () => (
            <HardEffortInputScreen
                data={data}
                onEffortTypeChange={(effortType) => setData(prev => ({ ...prev, effortType: effortType as EffortType }))}
                onDistanceChange={(effortDistance) => setData(prev => ({ ...prev, effortDistance }))}
                onTimeChange={(mins, secs) => setData(prev => ({ ...prev, effortTimeMinutes: mins, effortTimeSeconds: secs }))}
                onEffortLevelChange={(effortLevel) => setData(prev => ({ ...prev, effortLevel }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'estimation-flow': () => (
            <EstimationFlowScreen
                selected={data.experienceLevel}
                onSelect={(experienceLevel) => setData(prev => ({ ...prev, experienceLevel: experienceLevel as ExperienceLevel }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'vdot-reveal': () => (
            <VdotRevealScreen
                data={data}
                onRecalculate={resetCalibration}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'weekly-mileage': () => (
            <WeeklyMileageScreen
                value={data.weeklyMiles}
                onChange={(weeklyMiles) => setData(prev => ({ ...prev, weeklyMiles }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'runs-per-week': () => (
            <RunsPerWeekScreen
                value={data.runsPerWeek}
                onChange={(runsPerWeek) => setData(prev => ({ ...prev, runsPerWeek }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'longest-run': () => (
            <LongestRunScreen
                value={data.longestRecentRun}
                onChange={(longestRecentRun) => setData(prev => ({ ...prev, longestRecentRun }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'available-days': () => (
            <AvailableDaysScreen
                value={data.availableDays}
                onChange={(availableDays) => setData(prev => ({ ...prev, availableDays }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'long-run-day': () => (
            <LongRunDayScreen
                value={data.longRunDays}
                onChange={(longRunDays) => setData(prev => ({ ...prev, longRunDays }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'plan-start-date': () => (
            <PlanStartDateScreen
                value={data.planStartDate}
                raceDate={data.raceDate}
                onChange={(planStartDate) => setData(prev => ({ ...prev, planStartDate }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'current-pain': () => (
            <CurrentPainScreen
                value={data.hasCurrentPain}
                onChange={(hasCurrentPain) => setData(prev => ({ ...prev, hasCurrentPain }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'pain-details': () => (
            <PainDetailsScreen
                data={data}
                onLocationChange={(painLocation) => setData(prev => ({ ...prev, painLocation: painLocation as InjuryLocation }))}
                onSeverityChange={(painSeverity) => setData(prev => ({ ...prev, painSeverity: painSeverity as PainSeverity }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'injury-history': () => (
            <InjuryHistoryScreen
                value={data.hasRecentInjury}
                onChange={(hasRecentInjury) => setData(prev => ({ ...prev, hasRecentInjury }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'injury-details': () => (
            <InjuryDetailsScreen
                value={data.injuryLocation}
                onChange={(injuryLocation) => setData(prev => ({ ...prev, injuryLocation: injuryLocation as InjuryLocation }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'training-intensity': () => (
            <TrainingIntensityScreen
                value={data.trainingIntensity}
                onChange={(trainingIntensity) => setData(prev => ({ ...prev, trainingIntensity: trainingIntensity as TrainingIntensity }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'training-mindset': () => (
            <TrainingMindsetScreen
                value={data.trainingMindset}
                onChange={(trainingMindset) => setData(prev => ({ ...prev, trainingMindset: trainingMindset as TrainingMindset }))}
                onContinue={goToNext}
                onBack={goBack}
            />
        ),
        'coach-reveal': () => (
            <CoachRevealScreen
                data={data}
                onConfirm={controller.confirmCoach}
                onBack={goBack}
            />
        ),
        'readiness-check': () => (
            <ReadinessCheckScreen
                data={data}
                readinessStatus={data.readinessStatus ?? 'ready'}
                baseWeeksNeeded={data.baseWeeksNeeded ?? 0}
                maintenanceWeeksNeeded={data.maintenanceWeeksNeeded ?? 0}
                onProceed={controller.continueFromReadinessCheck}
                onProceedAnyway={controller.continueFromReadinessCheck}
                onBack={goBack}
                error={generationError}
            />
        ),
        'generating': () => (
            <GeneratingScreen
                onComplete={() => {
                    void controller.generatePlanAndAdvance();
                }}
            />
        ),
        'complete': () => (
            <CompleteScreen
                data={data}
                onViewDashboard={controller.viewDashboard}
                onViewPlan={controller.viewPlan}
            />
        ),
    };

    const renderStep = screenRenderers[step];

    return (
        <>
            {step !== 'welcome' && step !== 'complete' && (
                <ProgressBar progress={progress} />
            )}

            <AnimatePresence mode="wait">
                {renderStep()}
            </AnimatePresence>
        </>
    );
}

function OnboardingLoading({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="v3-root min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-2 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
                <p className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
            </div>
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<OnboardingLoading />}>
            <OnboardingContent />
        </Suspense>
    );
}
