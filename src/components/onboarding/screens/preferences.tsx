'use client';

/**
 * THE LONG GAME - Onboarding Screens: Preferences & Completion
 * 
 * Training intensity, strength training, readiness check, generating, complete
 */

import { useState, useEffect } from 'react';
import { Loader2, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    QuestionScreen,
    QuestionHeader,
    OptionButton,
    OptionGrid,
    ContinueButton,
    WarningBanner,
    SuccessBanner,
    useKeyboardNavigation,
} from '../ui';
import {
    OnboardingData,
    TrainingIntensity,
    ReadinessStatus,
    clearOnboardingProgress,
} from '@/domain/onboarding/types';
import { STEP_TOOLTIPS } from '@/domain/onboarding/types';
import {
    TRAINING_INTENSITY_OPTIONS,
    TRAINING_GOALS,
} from '@/domain/onboarding/constants';

// =============================================================================
// TRAINING INTENSITY SCREEN
// =============================================================================

interface TrainingIntensityScreenProps {
    value: TrainingIntensity | null;
    onChange: (intensity: TrainingIntensity) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function TrainingIntensityScreen({
    value,
    onChange,
    onContinue,
    onBack
}: TrainingIntensityScreenProps) {
    useKeyboardNavigation({
        onEnter: value !== null ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            const option = TRAINING_INTENSITY_OPTIONS[num - 1];
            if (option) {
                onChange(option.value as TrainingIntensity);
            }
        },
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="How aggressive should your training be?"
                tooltip={STEP_TOOLTIPS['training-intensity']}
            />

            <OptionGrid>
                {TRAINING_INTENSITY_OPTIONS.map((option, index) => (
                    <OptionButton
                        key={option.value}
                        label={option.label}
                        description={option.description}
                        shortcut={String(index + 1)}
                        selected={value === option.value}
                        onClick={() => onChange(option.value as TrainingIntensity)}
                        recommended={option.recommended}
                    />
                ))}
            </OptionGrid>

            <ContinueButton
                onClick={onContinue}
                disabled={value === null}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// STRENGTH TRAINING SCREEN
// =============================================================================

interface StrengthTrainingScreenProps {
    value: boolean | null;
    onChange: (include: boolean) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function StrengthTrainingScreen({
    value,
    onChange,
    onContinue,
    onBack
}: StrengthTrainingScreenProps) {
    useKeyboardNavigation({
        onEnter: value !== null ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            if (num === 1) onChange(true);
            if (num === 2) onChange(false);
        },
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="Include strength training in your plan?"
                tooltip={STEP_TOOLTIPS['strength-training']}
            />

            <OptionGrid>
                <OptionButton
                    label="Yes — I want running-specific strength work"
                    shortcut="1"
                    selected={value === true}
                    onClick={() => onChange(true)}
                    recommended
                />
                <OptionButton
                    label="No — I'll handle strength separately"
                    shortcut="2"
                    selected={value === false}
                    onClick={() => onChange(false)}
                />
            </OptionGrid>

            {value === true && (
                <p className="text-body-sm text-[var(--text-muted)] mt-4">
                    Our strength work is mostly bodyweight — no gym required.
                    It&apos;s designed to prevent injury and improve running economy.
                </p>
            )}

            <ContinueButton
                onClick={onContinue}
                disabled={value === null}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// READINESS CHECK SCREEN
// =============================================================================

interface ReadinessCheckScreenProps {
    data: OnboardingData;
    readinessStatus: ReadinessStatus;
    baseWeeksNeeded: number;
    onProceed: () => void;
    onProceedAnyway: () => void;
    onBack: () => void;
}

export function ReadinessCheckScreen({
    data,
    readinessStatus,
    baseWeeksNeeded,
    onProceed,
    onProceedAnyway,
    onBack
}: ReadinessCheckScreenProps) {
    const goalLabel = TRAINING_GOALS.find(g => g.value === data.trainingGoal)?.label ?? 'Race';
    const weeksToRace = data.raceDate
        ? Math.floor((new Date(data.raceDate).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))
        : null;

    useKeyboardNavigation({
        onEnter: onProceed,
        onBack,
    });

    // Ready to go!
    if (readinessStatus === 'ready') {
        return (
            <QuestionScreen onBack={onBack}>
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/15 flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-[var(--color-success)]" />
                    </div>
                    <h1 className="text-display-md mb-4">You&apos;re ready to start your plan.</h1>
                    <p className="text-[var(--text-muted)] mb-8">
                        Based on what you told us:
                    </p>

                    <div className="text-left space-y-2 mb-8">
                        <div className="flex items-center gap-2 text-body-sm">
                            <Check className="w-4 h-4 text-[var(--color-success)]" />
                            <span>Your current mileage supports Week 1 volume</span>
                        </div>
                        <div className="flex items-center gap-2 text-body-sm">
                            <Check className="w-4 h-4 text-[var(--color-success)]" />
                            <span>Your longest run matches plan requirements</span>
                        </div>
                        <div className="flex items-center gap-2 text-body-sm">
                            <Check className="w-4 h-4 text-[var(--color-success)]" />
                            <span>Training days align with plan structure</span>
                        </div>
                    </div>

                    <button
                        onClick={onProceed}
                        className="btn btn-gradient btn-lg w-full"
                    >
                        Generate my plan
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                </div>
            </QuestionScreen>
        );
    }

    // Needs base building
    if (readinessStatus === 'needs_base') {
        return (
            <QuestionScreen onBack={onBack}>
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-warning)]/15 flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-8 h-8 text-[var(--color-warning)]" />
                    </div>
                    <h1 className="text-display-sm mb-4">Let&apos;s build your foundation first.</h1>
                </div>

                <div className="text-left mb-6">
                    <p className="text-[var(--text-muted)] mb-4">Based on your current training:</p>
                    <ul className="space-y-1 text-body-sm text-[var(--text-muted)]">
                        <li>• Weekly miles: {data.weeklyMiles} mi/wk</li>
                        <li>• Longest run: {data.longestRecentRun} miles</li>
                        {weeksToRace && <li>• Race date: {weeksToRace} weeks away</li>}
                    </ul>
                </div>

                <WarningBanner title="Why we recommend base building">
                    Week 1 of your {goalLabel.toLowerCase()} plan needs more mileage than you&apos;re
                    currently running. Big jumps in volume cause injuries.
                    <br /><br />
                    Pete Pfitzinger calls this &quot;base readiness&quot; — making sure you can
                    absorb Week 1 before you start Week 1.
                </WarningBanner>

                <div className="mt-6 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-base)]">
                    <p className="text-label mb-3">Here&apos;s what we recommend:</p>
                    <div className="space-y-2 text-body-sm">
                        <div className="flex justify-between">
                            <span className="text-[var(--text-muted)]">Weeks 1-{baseWeeksNeeded}</span>
                            <span>Base Building</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[var(--text-muted)]">Weeks {baseWeeksNeeded + 1}+</span>
                            <span>{goalLabel} Plan</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    <button
                        onClick={onProceed}
                        className="btn btn-gradient btn-lg w-full"
                    >
                        Start with base building
                    </button>
                    <button
                        onClick={onProceedAnyway}
                        className="btn btn-secondary w-full"
                    >
                        I know my limits — start plan anyway
                    </button>
                </div>
            </QuestionScreen>
        );
    }

    // Timeline too short
    return (
        <QuestionScreen onBack={onBack}>
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-warning)]/15 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-[var(--color-warning)]" />
                </div>
                <h1 className="text-display-sm mb-4">
                    Heads up: You only have {weeksToRace} weeks until your race.
                </h1>
                <p className="text-[var(--text-muted)] mb-8">
                    That&apos;s on the short side for a {goalLabel.toLowerCase()}. We can build you
                    a condensed plan, but expectations should be adjusted.
                </p>
            </div>

            <div className="space-y-3">
                <button
                    onClick={onProceed}
                    className="btn btn-gradient btn-lg w-full"
                >
                    Build me a {weeksToRace}-week plan
                </button>
                <button
                    onClick={onBack}
                    className="btn btn-secondary w-full"
                >
                    Go back and change my race date
                </button>
            </div>
        </QuestionScreen>
    );
}

// =============================================================================
// GENERATING SCREEN
// =============================================================================

interface GeneratingScreenProps {
    onComplete: () => void;
}

export function GeneratingScreen({ onComplete }: GeneratingScreenProps) {
    const [stage, setStage] = useState(0);
    const stages = [
        'Calculating training paces...',
        'Structuring periodization...',
        'Adding coach-backed workouts...',
        'Setting your peak week...',
        'Planning your taper...',
        'Done!',
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStage((prev) => {
                if (prev >= stages.length - 1) {
                    clearInterval(interval);
                    setTimeout(onComplete, 500);
                    return prev;
                }
                return prev + 1;
            });
        }, 600);

        return () => clearInterval(interval);
    }, [onComplete, stages.length]);

    return (
        <QuestionScreen showBack={false}>
            <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-[var(--color-accent)] mb-8" />
                <h1 className="text-display-sm mb-6">Building your plan...</h1>

                <div className="space-y-2">
                    {stages.slice(0, stage + 1).map((text, i) => (
                        <div
                            key={i}
                            className={`text-body-sm transition-opacity ${i === stage ? 'text-[var(--text-primary)]' : 'text-[var(--text-subtle)]'
                                }`}
                        >
                            {i < stage && <Check className="w-4 h-4 inline mr-2 text-[var(--color-success)]" />}
                            {text}
                        </div>
                    ))}
                </div>
            </div>
        </QuestionScreen>
    );
}

// =============================================================================
// COMPLETE SCREEN
// =============================================================================

interface CompleteScreenProps {
    data: OnboardingData;
}

export function CompleteScreen({ data }: CompleteScreenProps) {
    const router = useRouter();

    const goalLabel = TRAINING_GOALS.find(g => g.value === data.trainingGoal)?.label ?? 'Training';
    const weeksToRace = data.raceDate
        ? Math.floor((new Date(data.raceDate).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))
        : null;

    const handleViewPlan = () => {
        clearOnboardingProgress();
        router.push('/plan');
    };

    const handleViewDashboard = () => {
        clearOnboardingProgress();
        router.push('/dashboard');
    };

    return (
        <QuestionScreen showBack={false}>
            <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-[var(--color-success)]/15 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-[var(--color-success)]" />
                </div>

                <h1 className="text-display-md mb-2">Your plan is ready, {data.name}.</h1>

                {data.raceName && data.raceDate && weeksToRace && (
                    <p className="text-body-lg text-[var(--color-accent)] mb-6">
                        {weeksToRace * 7} days until {data.raceName}
                    </p>
                )}
            </div>

            <SuccessBanner title={`${weeksToRace ?? 12}-Week ${goalLabel} Plan`}>
                <div className="space-y-1 mt-2 text-body-sm text-[var(--text-muted)]">
                    <p>• Starting VDOT: {data.vdot}</p>
                    <p>• {data.availableDays} training days per week</p>
                    <p>• Long runs on {data.longRunDay}</p>
                    {data.includeStrength && <p>• Strength training included</p>}
                </div>
            </SuccessBanner>

            <div className="mt-8 space-y-3">
                <button
                    onClick={handleViewPlan}
                    className="btn btn-gradient btn-lg w-full"
                >
                    View full plan
                </button>
                <button
                    onClick={handleViewDashboard}
                    className="btn btn-secondary w-full"
                >
                    Go to dashboard
                </button>
            </div>
        </QuestionScreen>
    );
}
