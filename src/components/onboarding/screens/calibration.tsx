'use client';

/**
 * THE LONG GAME - Onboarding Screens: Calibration V2
 * 
 * Fitness calibration method selection, race input, easy pace, 
 * device import, hard effort, estimation, and VDOT reveal screens
 * Week aesthetic: Dark, atmospheric, light typography
 */

import { useState, useEffect, useCallback } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import {
    QuestionScreen,
    QuestionHeader,
    OptionButton,
    OptionGrid,
    ContinueButton,
    TimeInput,
    TextInput,
    CollapsibleInstructions,
    SuccessBanner,
    useKeyboardNavigation,
} from '../ui';
import {
    OnboardingData,
    CalibrationMethod,
    RaceDistance,
    RaceRecency,
    ExperienceLevel,
    EffortType,
} from '@/domain/onboarding/types';
import { STEP_TOOLTIPS } from '@/domain/onboarding/types';
import {
    CALIBRATION_METHODS,
    RACE_DISTANCES,
    RACE_RECENCY_OPTIONS,
    RACE_TIME_BOUNDS,
    EXPERIENCE_LEVELS,
    EFFORT_TYPES,
    TIME_TRIAL_INSTRUCTIONS,
    getVdotPercentile,
} from '@/domain/onboarding/constants';
import { calculateVdotFromRace, calculateTrainingPaces, formatPace } from '@/domain/vdot/vdot-estimator';

// =============================================================================
// CALIBRATION METHOD SCREEN
// =============================================================================

interface CalibrationMethodScreenProps {
    selected: CalibrationMethod | null;
    onSelect: (method: CalibrationMethod) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function CalibrationMethodScreen({
    selected,
    onSelect,
    onContinue,
    onBack
}: CalibrationMethodScreenProps) {
    useKeyboardNavigation({
        onEnter: selected ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            const method = CALIBRATION_METHODS[num - 1];
            if (method) {
                onSelect(method.value as CalibrationMethod);
            }
        },
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="Set your VO2max (required)"
                subtitle="We use this to set every training pace. Choose the most accurate way to calculate it."
                tooltip={STEP_TOOLTIPS['calibration-method']}
            />

            <OptionGrid>
                {CALIBRATION_METHODS.map((method, index) => {
                    const Icon = method.icon;
                    return (
                        <OptionButton
                            key={method.value}
                            label={method.label}
                            description={method.description}
                            shortcut={String(index + 1)}
                            icon={<Icon className="w-5 h-5" />}
                            selected={selected === method.value}
                            onClick={() => onSelect(method.value as CalibrationMethod)}
                        />
                    );
                })}
            </OptionGrid>

            <ContinueButton
                onClick={onContinue}
                disabled={!selected}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// RACE INPUT SCREEN
// =============================================================================

interface RaceInputScreenProps {
    data: OnboardingData;
    onDistanceChange: (distance: RaceDistance) => void;
    onTimeChange: (minutes: number | null, seconds: number | null) => void;
    onRecencyChange: (recency: RaceRecency) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function RaceInputScreen({
    data,
    onDistanceChange,
    onTimeChange,
    onRecencyChange,
    onContinue,
    onBack
}: RaceInputScreenProps) {
    const [timeError, setTimeError] = useState<string | null>(null);

    // Validate time bounds
    useEffect(() => {
        if (data.raceDistance && data.raceTimeMinutes !== null) {
            const totalSeconds = (data.raceTimeMinutes * 60) + (data.raceTimeSeconds ?? 0);
            const bounds = RACE_TIME_BOUNDS[data.raceDistance];

            if (bounds && totalSeconds > 0) {
                if (totalSeconds < bounds.min) {
                    setTimeError(`That seems too fast for a ${data.raceDistance}. Please double-check.`);
                } else if (totalSeconds > bounds.max) {
                    setTimeError(`That seems too slow for a ${data.raceDistance}. Please double-check.`);
                } else {
                    setTimeError(null);
                }
            }
        }
    }, [data.raceDistance, data.raceTimeMinutes, data.raceTimeSeconds]);

    const needsHours = data.raceDistance === 'half' || data.raceDistance === 'marathon';

    const canContinue = data.raceDistance !== null &&
        data.raceTimeMinutes !== null &&
        data.raceRecency !== null &&
        !timeError;

    useKeyboardNavigation({
        onEnter: canContinue ? onContinue : undefined,
        onBack,
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="What was your most recent race?"
            />

            <div className="space-y-6">
                {/* Distance */}
                <div>
                    <label className="v3-label block mb-2">Distance</label>
                    <OptionGrid columns={3}>
                        {RACE_DISTANCES.map((dist) => (
                            <OptionButton
                                key={dist.value}
                                label={dist.label}
                                selected={data.raceDistance === dist.value}
                                onClick={() => onDistanceChange(dist.value as RaceDistance)}
                            />
                        ))}
                    </OptionGrid>
                </div>

                {/* Time */}
                <div>
                    <label className="v3-label block mb-2">Finish time</label>
                    <TimeInput
                        minutes={data.raceTimeMinutes}
                        seconds={data.raceTimeSeconds}
                        onMinutesChange={(m) => onTimeChange(m, data.raceTimeSeconds)}
                        onSecondsChange={(s) => onTimeChange(data.raceTimeMinutes, s)}
                        showHours={needsHours}
                        error={timeError ?? undefined}
                    />
                </div>

                {/* Recency */}
                <div>
                    <label className="v3-label block mb-2">When was this race?</label>
                    <OptionGrid columns={2}>
                        {RACE_RECENCY_OPTIONS.map((option) => (
                            <OptionButton
                                key={option.value}
                                label={option.label}
                                description={option.description}
                                selected={data.raceRecency === option.value}
                                onClick={() => onRecencyChange(option.value as RaceRecency)}
                            />
                        ))}
                    </OptionGrid>
                </div>
            </div>

            <ContinueButton
                onClick={onContinue}
                disabled={!canContinue}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// EASY PACE INPUT SCREEN
// =============================================================================

interface EasyPaceInputScreenProps {
    data: OnboardingData;
    onPaceChange: (minutes: number | null, seconds: number | null) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function EasyPaceInputScreen({
    data,
    onPaceChange,
    onContinue,
    onBack
}: EasyPaceInputScreenProps) {
    const canContinue = data.easyPaceMinutes !== null && data.easyPaceSeconds !== null;

    useKeyboardNavigation({
        onEnter: canContinue ? onContinue : undefined,
        onBack,
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="What's your comfortable, conversational easy pace?"
            />

            <div className="space-y-4">
                <TimeInput
                    minutes={data.easyPaceMinutes}
                    seconds={data.easyPaceSeconds}
                    onMinutesChange={(m) => onPaceChange(m, data.easyPaceSeconds)}
                    onSecondsChange={(s) => onPaceChange(data.easyPaceMinutes, s)}
                />
                <p style={{ color: 'var(--text-muted)' }}>per mile</p>
            </div>

            <p className="v3-body-sm mt-4" style={{ color: 'var(--text-subtle)' }}>
                This should feel like you could chat with a friend.<br />
                If you&apos;re breathing hard, that&apos;s not easy pace.
            </p>

            <ContinueButton
                onClick={onContinue}
                disabled={!canContinue}
            />
        </QuestionScreen>
    );
}


// =============================================================================
// MANUAL VO2MAX INPUT SCREEN
// =============================================================================

interface ManualVo2maxInputScreenProps {
    value: number | null;
    onChange: (value: number | null) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function ManualVo2maxInputScreen({
    value,
    onChange,
    onContinue,
    onBack,
}: ManualVo2maxInputScreenProps) {
    const canContinue = value !== null && value >= 20 && value <= 90;

    useKeyboardNavigation({
        onEnter: canContinue ? onContinue : undefined,
        onBack,
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="Enter your VO2max"
                subtitle="Use the number from your fitness watch or running app."
            />

            <TextInput
                value={value?.toString() ?? ''}
                onChange={(nextValue) => {
                    if (!nextValue.trim()) {
                        onChange(null);
                        return;
                    }
                    const parsed = Number(nextValue);
                    onChange(Number.isFinite(parsed) ? parsed : null);
                }}
                type="number"
                min={20}
                max={90}
                step={1}
                placeholder="e.g. 52"
                autoFocus
                suffix="VO2max"
            />

            <p className="mt-4 v3-body-sm" style={{ color: 'var(--text-muted)' }}>
                Most runners fall between 30 and 70. We use this to set your training paces.
            </p>
            <p className="mt-2 v3-body-sm" style={{ color: 'var(--text-muted)' }}>
                Update your VO2max every 4-6 weeks or after a race in Settings.
            </p>

            <ContinueButton onClick={onContinue} disabled={!canContinue} />
        </QuestionScreen>
    );
}

// =============================================================================
// HARD EFFORT INPUT SCREEN
// =============================================================================

interface HardEffortInputScreenProps {
    data: OnboardingData;
    onEffortTypeChange: (type: EffortType) => void;
    onDistanceChange: (distance: string) => void;
    onTimeChange: (minutes: number | null, seconds: number | null) => void;
    onEffortLevelChange: (level: number) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function HardEffortInputScreen({
    data,
    onEffortTypeChange,
    onDistanceChange,
    onTimeChange,
    onEffortLevelChange,
    onContinue,
    onBack
}: HardEffortInputScreenProps) {
    const canContinue = data.effortType !== null && data.effortTimeMinutes !== null;

    useKeyboardNavigation({
        onEnter: canContinue ? onContinue : undefined,
        onBack,
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="Tell us about your recent hard effort."
            />

            <div className="space-y-6">
                {/* Effort type */}
                <div>
                    <label className="v3-label block mb-2">What was it?</label>
                    <OptionGrid columns={2}>
                        {EFFORT_TYPES.map((type) => (
                            <OptionButton
                                key={type.value}
                                label={type.label}
                                selected={data.effortType === type.value}
                                onClick={() => {
                                    onEffortTypeChange(type.value as EffortType);
                                    if (type.defaultDistance) {
                                        onDistanceChange(type.defaultDistance);
                                    }
                                }}
                            />
                        ))}
                    </OptionGrid>
                </div>

                {/* Distance (if needed) */}
                {data.effortType && data.effortType !== 'parkrun' && (
                    <div>
                        <label className="v3-label block mb-2">Distance</label>
                        <TextInput
                            value={data.effortDistance}
                            onChange={onDistanceChange}
                            placeholder="e.g., 3 miles, 5K"
                        />
                    </div>
                )}

                {/* Time */}
                <div>
                    <label className="v3-label block mb-2">Time</label>
                    <TimeInput
                        minutes={data.effortTimeMinutes}
                        seconds={data.effortTimeSeconds}
                        onMinutesChange={(m) => onTimeChange(m, data.effortTimeSeconds)}
                        onSecondsChange={(s) => onTimeChange(data.effortTimeMinutes, s)}
                    />
                </div>

                {/* Effort level */}
                <div>
                    <label className="v3-label block mb-2">Effort level (1-10)</label>
                    <div className="flex items-center gap-2">
                        {[6, 7, 8, 9, 10].map((level) => (
                            <button
                                key={level}
                                onClick={() => onEffortLevelChange(level)}
                                className="w-10 h-10 rounded-lg border transition-all"
                                style={{
                                    background: data.effortLevel === level ? 'var(--color-accent)' : 'var(--bg-elevated)',
                                    borderColor: data.effortLevel === level ? 'transparent' : 'var(--border-base)',
                                    color: data.effortLevel === level ? 'var(--v3-bg-base)' : 'var(--text-base)',
                                }}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                    <p className="v3-body-xs mt-2" style={{ color: 'var(--text-subtle)' }}>
                        10 = absolute max effort, 6 = comfortably hard
                    </p>
                </div>
            </div>

            <ContinueButton
                onClick={onContinue}
                disabled={!canContinue}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// ESTIMATION FLOW SCREEN
// =============================================================================

interface EstimationFlowScreenProps {
    selected: ExperienceLevel | null;
    onSelect: (level: ExperienceLevel) => void;
    onContinue: () => void;
    onBack: () => void;
    context?: 'estimate' | 'vo2max';
}

export function EstimationFlowScreen({
    selected,
    onSelect,
    onContinue,
    onBack,
    context = 'estimate',
}: EstimationFlowScreenProps) {
    const header = context === 'vo2max'
        ? {
            title: 'How would you describe your running background?',
            subtitle: 'We adjust VO2max to training paces based on running economy.',
        }
        : {
            title: "No problem — we'll estimate based on your training.",
            subtitle: "We'll set conservative paces and include a calibration run in Week 1 to dial them in.",
        };
    const promptLabel = context === 'vo2max'
        ? 'Running background'
        : 'How would you describe your current running?';

    useKeyboardNavigation({
        onEnter: selected ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            const level = EXPERIENCE_LEVELS[num - 1];
            if (level) {
                onSelect(level.value as ExperienceLevel);
            }
        },
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title={header.title}
                subtitle={header.subtitle}
            />

            <div>
                <label className="v3-label block mb-3">{promptLabel}</label>
                <OptionGrid>
                    {EXPERIENCE_LEVELS.map((level, index) => (
                        <OptionButton
                            key={level.value}
                            label={level.label}
                            description={level.description}
                            shortcut={String(index + 1)}
                            selected={selected === level.value}
                            onClick={() => onSelect(level.value as ExperienceLevel)}
                        />
                    ))}
                </OptionGrid>
            </div>

            <CollapsibleInstructions
                title={TIME_TRIAL_INSTRUCTIONS.title}
                steps={TIME_TRIAL_INSTRUCTIONS.steps}
                tips={TIME_TRIAL_INSTRUCTIONS.tips}
            />

            <ContinueButton
                onClick={onContinue}
                disabled={!selected}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// VDOT REVEAL SCREEN
// =============================================================================

interface VdotRevealScreenProps {
    data: OnboardingData;
    onRecalculate: () => void;
    onContinue: () => void;
    onBack: () => void;
}

export function VdotRevealScreen({
    data,
    onRecalculate,
    onContinue,
    onBack
}: VdotRevealScreenProps) {
    const [loading, setLoading] = useState(true);

    // Simulate calculation delay
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    useKeyboardNavigation({
        onEnter: !loading ? onContinue : undefined,
        onBack,
    });

    if (loading || !data.vdot) {
        return (
            <QuestionScreen onBack={onBack}>
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto v3-accent" />
                    <p className="mt-4" style={{ color: 'var(--text-muted)' }}>Calculating your VDOT...</p>
                </div>
            </QuestionScreen>
        );
    }

    const paces = calculateTrainingPaces(data.vdot);
    const percentileInfo = getVdotPercentile(data.vdot);

    // Predicted marathon time using VDOT-based formula
    const marathonPaceSeconds = paces.marathon;
    const marathonTimeMinutes = Math.round((marathonPaceSeconds * 26.2) / 60);
    const marathonHours = Math.floor(marathonTimeMinutes / 60);
    const marathonMins = marathonTimeMinutes % 60;

    return (
        <QuestionScreen onBack={onBack}>
            <div className="text-center mb-6">
                <p className="v3-heading-sm" style={{ color: 'var(--color-accent)' }}>Your VDOT</p>
                <div className="v3-heading-2xl" style={{ color: 'var(--text-base)', fontSize: 'clamp(4rem, 10vw, 6rem)' }}>{data.vdot}</div>
                <p className="v3-body-md" style={{ color: 'var(--text-muted)' }}>
                    {percentileInfo.label} • Top {100 - percentileInfo.percentile}% of recreational runners
                </p>
                {data.vdotConfidence === 'low' && (
                    <p className="v3-body-sm mt-2" style={{ color: 'var(--v3-warning)' }}>
                        This is an estimate — we&apos;ll refine it with your calibration run
                    </p>
                )}
            </div>

            {/* What is VDOT? - Collapsible */}
            <details className="mb-4">
                <summary
                    className="p-4 rounded-xl cursor-pointer flex items-center justify-between transition-colors group"
                    style={{ background: 'var(--v3-bg-inset)' }}
                >
                    <span className="v3-body font-medium" style={{ color: 'var(--text-muted)' }}>What is VDOT?</span>
                    <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" style={{ color: 'var(--text-subtle)' }} />
                </summary>
                <div className="p-4 pt-2" style={{ background: 'var(--v3-bg-inset)', borderRadius: '0 0 12px 12px', marginTop: '-8px' }}>
                    <p className="v3-body-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        VDOT is your "running fitness score" developed by legendary coach Jack Daniels.
                        It&apos;s calculated from your race performance and accounts for both your aerobic capacity
                        and running efficiency. Higher number = fitter. This single number determines all your
                        training paces — so every run is at the right intensity for YOUR current fitness.
                    </p>
                </div>
            </details>

            <SuccessBanner title={`Predicts a ~${marathonHours}:${marathonMins.toString().padStart(2, '0')} marathon`}>
                This gives us the data we need to set your training zones perfectly.
            </SuccessBanner>
            <p className="mt-4 v3-body-sm" style={{ color: 'var(--text-muted)' }}>
                You can update VO2max anytime in Settings → Fitness and we&apos;ll adjust your plan.
            </p>

            {/* Training Paces - Always visible */}
            <div className="mt-6 p-4 rounded-xl v3-card">
                <p className="v3-body font-medium mb-4">Your training paces</p>
                <div className="space-y-3">
                    {/* Easy Pace */}
                    <div className="flex justify-between items-center">
                        <span className="v3-body" style={{ color: 'var(--text-muted)' }}>Easy</span>
                        <span className="v3-body font-medium" style={{ fontFamily: 'var(--font-plex-mono)' }}>{formatPace(paces.easy.min)} - {formatPace(paces.easy.max)}/mi</span>
                    </div>

                    {/* Marathon Pace */}
                    <div className="flex justify-between items-center">
                        <span className="v3-body" style={{ color: 'var(--text-muted)' }}>Marathon Pace</span>
                        <span className="v3-body font-medium" style={{ fontFamily: 'var(--font-plex-mono)' }}>{formatPace(paces.marathon)}/mi</span>
                    </div>

                    {/* Tempo/Threshold Pace */}
                    <div className="flex justify-between items-center">
                        <span className="v3-body" style={{ color: 'var(--text-muted)' }}>Tempo (Threshold)</span>
                        <span className="v3-body font-medium" style={{ fontFamily: 'var(--font-plex-mono)' }}>{formatPace(paces.threshold)}/mi</span>
                    </div>

                    {/* Interval Pace */}
                    <div className="flex justify-between items-center">
                        <span className="v3-body" style={{ color: 'var(--text-muted)' }}>Interval</span>
                        <span className="v3-body font-medium" style={{ fontFamily: 'var(--font-plex-mono)' }}>{formatPace(paces.interval)}/mi</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex gap-3">
                <button
                    onClick={onRecalculate}
                    className="flex-1 v3-btn v3-btn-secondary"
                >
                    This seems off — recalculate
                </button>
                <button
                    onClick={onContinue}
                    className="flex-1 v3-btn v3-btn-primary"
                >
                    Looks right →
                </button>
            </div>
        </QuestionScreen>
    );
}
