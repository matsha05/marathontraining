'use client';

/**
 * THE LONG GAME - Onboarding Screens: Preferences & Completion V2
 * 
 * Training intensity, training mindset, strength training, coach reveal,
 * readiness check, generating, complete
 * Week aesthetic: Dark, atmospheric, light typography
 */

import { useState, useEffect } from 'react';
import { Loader2, Check, AlertTriangle, ArrowRight } from 'lucide-react';
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
    TrainingMindset,
    ReadinessStatus,
} from '@/domain/onboarding/types';
import { STEP_TOOLTIPS } from '@/domain/onboarding/types';
import {
    TRAINING_INTENSITY_OPTIONS,
    TRAINING_GOALS,
} from '@/domain/onboarding/constants';
import { formatDistance, formatDuration } from '@/lib/format';
import type { TierSelectionInput } from '@/domain/philosophy/tier-selector';
import type { HigdonTier } from '@/domain/plan/types';
import { calculateWeeksToRace } from '@/domain/plan/date-utils';

function mapExperienceToTierFormat(intensity: TrainingIntensity | null): 'beginner' | 'intermediate' | 'advanced' {
    if (intensity === 'aggressive') return 'advanced';
    if (intensity === 'conservative') return 'beginner';
    return 'intermediate';
}

function mapMileageToTierFormat(weeklyMiles: number | null): 'under_20' | '20_40' | 'over_40' {
    const mileage = weeklyMiles ?? 20;
    if (mileage >= 40) return 'over_40';
    if (mileage >= 20) return '20_40';
    return 'under_20';
}

function mapGoalToDistance(goal: OnboardingData['trainingGoal']): '5k' | '10k' | 'half' | 'marathon' | 'base' | null {
    if (goal === 'general') return 'base';
    return goal;
}

function resolveTierRunDays(tier: string): number | null {
    const { HIGDON_TIER_CONFIGS } = require('@/domain/plan/types');
    const { HANSONS_TIER_CONFIGS } = require('@/domain/plan/coaches/hansons');
    const { PFITZ_TIER_CONFIGS } = require('@/domain/plan/coaches/pfitzinger');
    const { PFITZ_FRR_TIER_CONFIGS } = require('@/domain/plan/coaches/pfitzinger-frr');

    if (tier.startsWith('hansons_')) return HANSONS_TIER_CONFIGS[tier]?.runDays ?? null;
    if (tier.startsWith('pfitz_frr_')) return PFITZ_FRR_TIER_CONFIGS[tier]?.runDays ?? null;
    if (tier.startsWith('pfitz_')) return PFITZ_TIER_CONFIGS[tier]?.runDays ?? null;
    if (
        tier.startsWith('base_') ||
        tier.startsWith('5k_') ||
        tier.startsWith('10k_') ||
        tier.startsWith('half_') ||
        tier.startsWith('marathon_')
    ) {
        return HIGDON_TIER_CONFIGS[tier]?.runDays ?? null;
    }
    return null;
}

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
    const [focusedIndex, setFocusedIndex] = useState<number>(() => {
        if (value) {
            const idx = TRAINING_INTENSITY_OPTIONS.findIndex(o => o.value === value);
            return idx >= 0 ? idx : 1; // Default to moderate (index 1)
        }
        return 1; // Start at "Moderate" as the recommended default
    });

    useKeyboardNavigation({
        onEnter: value !== null ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            const option = TRAINING_INTENSITY_OPTIONS[num - 1];
            if (option) {
                onChange(option.value as TrainingIntensity);
                setFocusedIndex(num - 1);
            }
        },
        // Arrow key navigation
        totalOptions: TRAINING_INTENSITY_OPTIONS.length,
        selectedIndex: focusedIndex,
        onSelectIndex: (index) => {
            setFocusedIndex(index);
            const option = TRAINING_INTENSITY_OPTIONS[index];
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
                        onClick={() => {
                            onChange(option.value as TrainingIntensity);
                            setFocusedIndex(index);
                        }}
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
// TRAINING MINDSET SCREEN
// =============================================================================

const MINDSET_OPTIONS: Array<{ value: TrainingMindset; label: string; description: string }> = [
    {
        value: 'rest_focus',
        label: 'I need built-in rest',
        description: 'Structure my recovery — I need guardrails to keep me from overdoing it.',
    },
    {
        value: 'consistency',
        label: 'I thrive on consistency',
        description: 'Daily routine keeps me going — I\'d rather run 6 easy days than 4 hard ones.',
    },
    {
        value: 'push_limits',
        label: 'I want to push limits',
        description: 'Challenge drives me — I\'m motivated by hard workouts and PRs.',
    },
];

interface TrainingMindsetScreenProps {
    value: TrainingMindset | null;
    onChange: (mindset: TrainingMindset) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function TrainingMindsetScreen({
    value,
    onChange,
    onContinue,
    onBack
}: TrainingMindsetScreenProps) {
    useKeyboardNavigation({
        onEnter: value !== null ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            const option = MINDSET_OPTIONS[num - 1];
            if (option) {
                onChange(option.value);
            }
        },
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="Which resonates more with you?"
                subtitle="Your psychology shapes what you'll stick with."
            />

            <OptionGrid>
                {MINDSET_OPTIONS.map((option, index) => (
                    <OptionButton
                        key={option.value}
                        label={option.label}
                        description={option.description}
                        shortcut={String(index + 1)}
                        selected={value === option.value}
                        onClick={() => onChange(option.value)}
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
                <p className="v3-body-sm mt-4" style={{ color: 'var(--text-muted)' }}>
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
// COACH REVEAL SCREEN - The payoff moment
// =============================================================================

interface CoachRevealScreenProps {
    data: OnboardingData;
    onConfirm: (philosophy: 'hansons' | 'higdon' | 'pfitzinger' | 'daniels') => void;
    onBack: () => void;
}

export function CoachRevealScreen({ data, onConfirm, onBack }: CoachRevealScreenProps) {
    // Import recommendation logic
    const { calculateRecommendation } = require('@/domain/philosophy/recommendation');
    const { PHILOSOPHIES } = require('@/domain/philosophy/types');
    const { selectPlanTier } = require('@/domain/philosophy/tier-selector');
    const { HIGDON_TIER_CONFIGS } = require('@/domain/plan/types');

    // Map onboarding data to quiz answers format
    const mapMileageToQuizFormat = (weeklyMiles: number | null): 'under_20' | '20_40' | 'over_40' | null => {
        if (weeklyMiles === null) return null;
        if (weeklyMiles < 20) return 'under_20';
        if (weeklyMiles <= 40) return '20_40';
        return 'over_40';
    };

    const mapMindsetToQuizFormat = (mindset: TrainingMindset | null) => mindset;

    const quizAnswers = {
        targetDistance: mapGoalToDistance(data.trainingGoal),
        raceTiming: data.raceDate ? 'specific' : 'no_race',
        raceDate: data.raceDate || null,
        daysPerWeek: data.availableDays as 3 | 4 | 5 | 6 | null,
        experience: null, // Will be inferred from mileage
        currentMileage: mapMileageToQuizFormat(data.weeklyMiles),
        mindset: mapMindsetToQuizFormat(data.trainingMindset),
    };

    const recommendation = calculateRecommendation(quizAnswers);
    const coach = PHILOSOPHIES[recommendation.primary];
    const targetDistance = mapGoalToDistance(data.trainingGoal) ?? 'base';

    const tierInput: TierSelectionInput = {
        philosophy: recommendation.primary,
        distance: targetDistance,
        experience: mapExperienceToTierFormat(data.trainingIntensity),
        currentMileage: mapMileageToTierFormat(data.weeklyMiles),
        daysPerWeek: data.availableDays ?? 4,
    };
    const tierResult = selectPlanTier(tierInput);
    const requiredRunDays = resolveTierRunDays(tierResult.tier);
    const runDaysMismatch = requiredRunDays !== null
        && data.availableDays !== null
        && requiredRunDays > data.availableDays;

    let longRunCap = coach.longRunCap;

    if (recommendation.primary === 'higdon') {
        const higdonConfig = HIGDON_TIER_CONFIGS[tierResult.tier as HigdonTier];

        if (higdonConfig?.peakLongRunMinutes) {
            longRunCap = `${formatDuration(higdonConfig.peakLongRunMinutes)} max`;
        } else if (higdonConfig?.peakLongRunMiles) {
            longRunCap = `${formatDistance(higdonConfig.peakLongRunMiles)} max`;
        }
    }

    useKeyboardNavigation({
        onEnter: () => onConfirm(recommendation.primary),
        onBack,
    });

    return (
        <QuestionScreen onBack={onBack}>
            <div className="text-center">
                {/* Coach reveal hero */}
                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{
                        background: `linear-gradient(135deg, ${coach.color}20 0%, ${coach.color}40 100%)`,
                        border: `2px solid ${coach.color}`
                    }}
                >
                    <span className="text-3xl font-light" style={{ color: coach.color }}>
                        {coach.name[0]}
                    </span>
                </div>

                <h1 className="v3-heading-lg mb-2">Your Coach: {coach.name}</h1>
                <p className="v3-body-md mb-6" style={{ color: coach.color }}>
                    {coach.tagline}
                </p>
            </div>

            {/* Reasoning summary */}
            <div className="v3-card p-5 mb-6">
                <p className="v3-label mb-3">Why {coach.name}?</p>
                <ul className="space-y-2">
                    {recommendation.reasoning.slice(0, 3).map((reason: string, i: number) => (
                        <li key={i} className="v3-body-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                            <span style={{ color: coach.color }}>•</span>
                            <span>{reason}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Plan preview */}
            <div className="v3-card p-5 mb-8">
                <p className="v3-label mb-3">Your Plan Structure</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="v3-body-lg font-medium">
                            {runDaysMismatch
                                ? `${data.availableDays} to ${requiredRunDays} days/week`
                                : `${requiredRunDays ?? data.availableDays ?? '?'} days/week`}
                        </p>
                        <p className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>
                            {runDaysMismatch ? 'Run days (adjusted)' : 'Run days'}
                        </p>
                    </div>
                    <div>
                        <p className="v3-body-lg font-medium">{longRunCap}</p>
                        <p className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>Long run</p>
                    </div>
                    <div>
                        <p className="v3-body-lg font-medium">{data.weeklyMiles || '?'}+</p>
                        <p className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>Peak MPW</p>
                    </div>
                </div>
            </div>

            {/* Warnings if any */}
            {recommendation.warnings.length > 0 && (
                <WarningBanner title="Heads up">
                    {recommendation.warnings[0]}
                </WarningBanner>
            )}

            {runDaysMismatch && (
                <WarningBanner title="Schedule check">
                    You selected {data.availableDays} run days/week, but this plan uses {requiredRunDays}.
                    If that doesn&apos;t work, go back and change your days.
                </WarningBanner>
            )}

            <button
                onClick={() => onConfirm(recommendation.primary)}
                className="v3-btn v3-btn-primary v3-btn-lg w-full"
                style={{ background: coach.color }}
            >
                Continue with {coach.name}
            </button>
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
    maintenanceWeeksNeeded: number;
    onProceed: () => void;
    onProceedAnyway: () => void;
    onBack: () => void;
    error?: string | null; // Generation error to display
}

export function ReadinessCheckScreen({
    data,
    readinessStatus,
    baseWeeksNeeded,
    maintenanceWeeksNeeded,
    onProceed,
    onProceedAnyway,
    onBack,
    error
}: ReadinessCheckScreenProps) {
    const goalLabel = TRAINING_GOALS.find(g => g.value === data.trainingGoal)?.label ?? 'Race';
    const weeksToRace = data.raceDate ? calculateWeeksToRace(data.raceDate) : null;
    const isHigdon = data.trainingPhilosophy === 'higdon';
    const baseLabel = isHigdon ? 'Higdon Base' : 'Base Building';
    const targetDistance = mapGoalToDistance(data.trainingGoal) ?? 'base';
    const { selectPlanTier } = require('@/domain/philosophy/tier-selector');
    const tierResult = selectPlanTier({
        philosophy: (data.trainingPhilosophy ?? 'higdon') as 'hansons' | 'higdon' | 'pfitzinger' | 'daniels',
        distance: targetDistance,
        experience: mapExperienceToTierFormat(data.trainingIntensity),
        currentMileage: mapMileageToTierFormat(data.weeklyMiles),
        daysPerWeek: data.availableDays ?? 4,
    } as TierSelectionInput);
    const requiredRunDays = resolveTierRunDays(tierResult.tier);
    const runDaysMismatch = requiredRunDays !== null
        && data.availableDays !== null
        && requiredRunDays > data.availableDays;

    useKeyboardNavigation({
        onEnter: onProceed,
        onBack,
    });

    // Ready to go!
    if (readinessStatus === 'ready') {
        return (
            <QuestionScreen onBack={onBack}>
                {error && (
                    <WarningBanner title="Plan generation failed">
                        {error}
                    </WarningBanner>
                )}
                <div className="text-center">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{ background: 'var(--v3-success-subtle)' }}
                    >
                        <Check className="w-8 h-8" style={{ color: 'var(--v3-success)' }} />
                    </div>
                    <h1 className="v3-heading-lg mb-4">You&apos;re ready to start your plan.</h1>
                    <p className="v3-body-md mb-8" style={{ color: 'var(--text-muted)' }}>
                        Based on what you told us:
                    </p>

                    <div className="text-left space-y-2 mb-8">
                        <div className="flex items-center gap-2 v3-body-sm">
                            <Check className="w-4 h-4" style={{ color: 'var(--v3-success)' }} />
                            <span>Your current mileage supports Week 1 volume</span>
                        </div>
                        <div className="flex items-center gap-2 v3-body-sm">
                            <Check className="w-4 h-4" style={{ color: 'var(--v3-success)' }} />
                            <span>Your longest run matches plan requirements</span>
                        </div>
                        {!runDaysMismatch && (
                            <div className="flex items-center gap-2 v3-body-sm">
                                <Check className="w-4 h-4" style={{ color: 'var(--v3-success)' }} />
                                <span>Training days align with plan structure</span>
                            </div>
                        )}
                        {runDaysMismatch && (
                            <div className="flex items-center gap-2 v3-body-sm">
                                <AlertTriangle className="w-4 h-4" style={{ color: 'var(--v3-warning)' }} />
                                <span>Plan uses {requiredRunDays} run days/week (you selected {data.availableDays})</span>
                            </div>
                        )}
                    </div>

                    {runDaysMismatch && (
                        <WarningBanner title="Schedule note">
                            This plan needs {requiredRunDays} run days/week. If that&apos;s too much,
                            go back and adjust your availability.
                        </WarningBanner>
                    )}

                    <button
                        onClick={onProceed}
                        className="v3-btn v3-btn-primary v3-btn-lg w-full"
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
                {error && (
                    <WarningBanner title="Plan generation failed">
                        {error}
                    </WarningBanner>
                )}
                <div className="text-center">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{ background: 'var(--v3-warning-subtle)' }}
                    >
                        <AlertTriangle className="w-8 h-8" style={{ color: 'var(--v3-warning)' }} />
                    </div>
                    <h1 className="v3-heading-md mb-4">Let&apos;s build your foundation first.</h1>
                </div>

                <div className="text-left mb-6">
                    <p className="v3-body-md mb-4" style={{ color: 'var(--text-muted)' }}>Based on your current training:</p>
                    <ul className="space-y-1 v3-body-sm" style={{ color: 'var(--text-muted)' }}>
                        <li>• Weekly miles: {data.weeklyMiles} mi/wk</li>
                        <li>• Longest run: {data.longestRecentRun} miles</li>
                        {weeksToRace && <li>• Race date: {weeksToRace} weeks away</li>}
                    </ul>
                </div>

                {runDaysMismatch && (
                    <WarningBanner title="Schedule note">
                        This plan uses {requiredRunDays} run days/week, but you selected {data.availableDays}.
                        If that&apos;s too much, go back and change your days.
                    </WarningBanner>
                )}

                <WarningBanner title="Why we recommend base building">
                    Week 1 of your {goalLabel.toLowerCase()} plan needs more mileage than you&apos;re
                    currently running. Big jumps in volume cause injuries.
                    <br /><br />
                    Pete Pfitzinger calls this &quot;base readiness&quot; — making sure you can
                    absorb Week 1 before you start Week 1.
                    {maintenanceWeeksNeeded > 0 && (
                        <>
                            <br /><br />
                            Your timeline is longer than the official base plan, so we&apos;ll add a
                            short maintenance block after the base weeks. That maintenance block is
                            not part of Higdon&apos;s official plan.
                        </>
                    )}
                </WarningBanner>

                <div
                    className="mt-6 p-4 rounded-xl v3-card"
                >
                    <p className="v3-label mb-3">Here&apos;s what we recommend:</p>
                    <div className="space-y-2 v3-body-sm">
                        <div className="flex justify-between">
                            <span style={{ color: 'var(--text-muted)' }}>Weeks 1-{baseWeeksNeeded}</span>
                            <span>{baseLabel}</span>
                        </div>
                        {maintenanceWeeksNeeded > 0 && (
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--text-muted)' }}>
                                    Weeks {baseWeeksNeeded + 1}-{baseWeeksNeeded + maintenanceWeeksNeeded}
                                </span>
                                <span>Maintenance (not Higdon)</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span style={{ color: 'var(--text-muted)' }}>
                                Weeks {baseWeeksNeeded + maintenanceWeeksNeeded + 1}+
                            </span>
                            <span>{goalLabel} Plan</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    <button
                        onClick={onProceed}
                        className="v3-btn v3-btn-primary v3-btn-lg w-full"
                    >
                        Start with base building
                    </button>
                    <button
                        onClick={onProceedAnyway}
                        className="v3-btn v3-btn-secondary w-full"
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
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: 'var(--v3-warning-subtle)' }}
                >
                    <AlertTriangle className="w-8 h-8" style={{ color: 'var(--v3-warning)' }} />
                </div>
                <h1 className="v3-heading-md mb-4">
                    Heads up: You only have {weeksToRace} weeks until your race.
                </h1>
                <p className="v3-body-md mb-8" style={{ color: 'var(--text-muted)' }}>
                    That&apos;s on the short side for a {goalLabel.toLowerCase()}. We can build you
                    a condensed plan, but expectations should be adjusted.
                </p>
            </div>

            <div className="space-y-3">
                <button
                    onClick={onProceed}
                    className="v3-btn v3-btn-primary v3-btn-lg w-full"
                >
                    Build me a {weeksToRace}-week plan
                </button>
                <button
                    onClick={onBack}
                    className="v3-btn v3-btn-secondary w-full"
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
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-8 v3-accent" />
                <h1 className="v3-heading-md mb-6">Building your plan...</h1>

                <div className="space-y-2">
                    {stages.slice(0, stage + 1).map((text, i) => (
                        <div
                            key={i}
                            className="v3-body-sm transition-opacity"
                            style={{ color: i === stage ? 'var(--text-base)' : 'var(--text-subtle)' }}
                        >
                            {i < stage && <Check className="w-4 h-4 inline mr-2" style={{ color: 'var(--v3-success)' }} />}
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
    onViewDashboard: () => void;
    onViewPlan: () => void;
}

export function CompleteScreen({ data, onViewDashboard, onViewPlan }: CompleteScreenProps) {
    const goalLabel = TRAINING_GOALS.find(g => g.value === data.trainingGoal)?.label ?? 'Training';
    const weeksToRace = data.raceDate
        ? calculateWeeksToRace(data.raceDate)
        : null;

    return (
        <QuestionScreen showBack={false}>
            <div className="text-center">
                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: 'var(--v3-success-subtle)' }}
                >
                    <Check className="w-10 h-10" style={{ color: 'var(--v3-success)' }} />
                </div>

                <h1 className="v3-heading-lg mb-2">Your plan is ready, {data.name}.</h1>

                {data.raceName && data.raceDate && weeksToRace && (
                    <p className="v3-body-lg v3-accent mb-6">
                        {weeksToRace * 7} days until {data.raceName}
                    </p>
                )}
            </div>

            <SuccessBanner title={`${weeksToRace ?? 12}-Week ${goalLabel} Plan`}>
                <div className="space-y-1 mt-2 v3-body-sm" style={{ color: 'var(--text-muted)' }}>
                    <p>• Starting VDOT: {data.vdot}</p>
                    <p>• {data.availableDays} training days per week</p>
                    <p>• Long runs on {data.longRunDays?.length > 0
                        ? data.longRunDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(' & ')
                        : 'Weekend'}</p>
                </div>
            </SuccessBanner>

            <div className="mt-8 space-y-3">
                <button
                    onClick={onViewPlan}
                    className="v3-btn v3-btn-primary v3-btn-lg w-full"
                >
                    View full plan
                </button>
                <button
                    onClick={onViewDashboard}
                    className="v3-btn v3-btn-secondary w-full"
                >
                    Go to dashboard
                </button>
            </div>
        </QuestionScreen>
    );
}
