'use client';

/**
 * THE LONG GAME - Onboarding Screens: Goal V2
 * 
 * Training goal, race details, fitness duration screens
 * Week aesthetic: Dark, atmospheric, light typography
 */

import { useState } from 'react';
import {
    QuestionScreen,
    QuestionHeader,
    TextInput,
    OptionButton,
    OptionGrid,
    ContinueButton,
    WarningBanner,
    useKeyboardNavigation,
} from '../ui';
import { DatePicker } from '@/components/ui/DatePicker';
import { OnboardingData, TrainingGoal, FitnessDuration } from '@/domain/onboarding/types';
import { STEP_TOOLTIPS } from '@/domain/onboarding/types';
import { calculateWeeksToRace } from '@/domain/plan/date-utils';
import { toDateKey } from '@/lib/dates';
import {
    TRAINING_GOALS,
    FITNESS_DURATION_OPTIONS,
    MINIMUM_WEEKS,
    RECOMMENDED_WEEKS,
} from '@/domain/onboarding/constants';

// =============================================================================
// TRAINING GOAL SCREEN
// =============================================================================

interface TrainingGoalScreenProps {
    selected: TrainingGoal | null;
    onSelect: (goal: TrainingGoal) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function TrainingGoalScreen({
    selected,
    onSelect,
    onContinue,
    onBack
}: TrainingGoalScreenProps) {
    // Track focused option for visual feedback during arrow navigation
    const [focusedIndex, setFocusedIndex] = useState<number>(() => {
        // Initialize to currently selected, or -1 if none
        if (selected) {
            const idx = TRAINING_GOALS.findIndex(g => g.value === selected);
            return idx >= 0 ? idx : 0;
        }
        return 0;
    });

    useKeyboardNavigation({
        onEnter: selected ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            const goal = TRAINING_GOALS[num - 1];
            if (goal) {
                onSelect(goal.value as TrainingGoal);
                setFocusedIndex(num - 1);
            }
        },
        // Arrow key navigation
        totalOptions: TRAINING_GOALS.length,
        selectedIndex: focusedIndex,
        onSelectIndex: (index) => {
            setFocusedIndex(index);
            // Auto-select on arrow navigation for fluid UX
            const goal = TRAINING_GOALS[index];
            if (goal) {
                onSelect(goal.value as TrainingGoal);
            }
        },
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="What are you training for?"
                tooltip={STEP_TOOLTIPS['training-goal']}
            />

            <OptionGrid>
                {TRAINING_GOALS.map((goal, index) => (
                    <OptionButton
                        key={goal.value}
                        label={goal.label}
                        description={goal.description}
                        shortcut={String(index + 1)}
                        selected={selected === goal.value}
                        onClick={() => {
                            onSelect(goal.value as TrainingGoal);
                            setFocusedIndex(index);
                        }}
                    />
                ))}
            </OptionGrid>

            <ContinueButton
                onClick={onContinue}
                disabled={!selected}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// RACE DETAILS SCREEN
// =============================================================================

interface RaceDetailsScreenProps {
    data: OnboardingData;
    onRaceNameChange: (name: string) => void;
    onRaceDateChange: (date: string | null) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function RaceDetailsScreen({
    data,
    onRaceNameChange,
    onRaceDateChange,
    onContinue,
    onBack
}: RaceDetailsScreenProps) {
    const [dateError, setDateError] = useState<string | null>(null);

    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const minDateStr = toDateKey(minDate);

    // Calculate weeks to race
    const weeksToRace = data.raceDate
        ? calculateWeeksToRace(data.raceDate)
        : null;

    const minWeeks = MINIMUM_WEEKS[data.trainingGoal ?? 'marathon'];
    const recommendedWeeks = RECOMMENDED_WEEKS[data.trainingGoal ?? 'marathon'];

    const handleDateChange = (date: string) => {
        const normalizedDate = date || null;
        onRaceDateChange(normalizedDate);

        if (normalizedDate) {
            const weeks = calculateWeeksToRace(normalizedDate);
            if (weeks < minWeeks) {
                setDateError(`A ${data.trainingGoal} requires at least ${minWeeks} weeks to prepare safely.`);
            } else {
                setDateError(null);
            }
        } else {
            setDateError(null);
        }
    };

    // Can continue with or without date (date is now optional)
    const canContinue = !dateError;

    useKeyboardNavigation({
        onEnter: canContinue ? onContinue : undefined,
        onBack,
    });

    const goalLabel = TRAINING_GOALS.find(g => g.value === data.trainingGoal)?.label ?? 'Race';

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title={`Tell us about your ${goalLabel.toLowerCase()}.`}
                subtitle="Don't have a race yet? No problem — you can skip this."
            />

            <div className="space-y-6">
                {/* Race name (optional) */}
                <div>
                    <label className="v3-label block mb-2">Race name (optional)</label>
                    <TextInput
                        value={data.raceName}
                        onChange={onRaceNameChange}
                        placeholder="e.g., Chicago Marathon, Turkey Trot 5K"
                    />
                    <p className="v3-body-xs mt-2" style={{ color: 'var(--text-subtle)' }}>
                        This personalizes your dashboard countdown
                    </p>
                </div>

                {/* Race date (optional) */}
                <div>
                    <label className="v3-label block mb-2">Race date (optional)</label>
                    <DatePicker
                        value={data.raceDate ?? ''}
                        onChange={handleDateChange}
                        minDate={minDateStr}
                        placeholder="Select your race date"
                    />
                    {dateError && (
                        <p className="v3-body-sm mt-2" style={{ color: 'var(--v3-error)' }}>{dateError}</p>
                    )}
                    {!data.raceDate && (
                        <p className="v3-body-xs mt-2" style={{ color: 'var(--text-subtle)' }}>
                            We&apos;ll build a flexible plan without a specific target date
                        </p>
                    )}
                </div>

                {/* Timeline warning/info */}
                {weeksToRace !== null && !dateError && (
                    <>
                        {weeksToRace < recommendedWeeks ? (
                            <WarningBanner title="Shorter than recommended">
                                Most {goalLabel.toLowerCase()} plans need {recommendedWeeks}+ weeks.
                                With {weeksToRace} weeks, we&apos;ll focus on finishing strong rather than a time goal.
                            </WarningBanner>
                        ) : (
                            <p className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>
                                {weeksToRace} weeks until race day — plenty of time to prepare!
                            </p>
                        )}
                    </>
                )}
            </div>

            <ContinueButton
                onClick={onContinue}
                disabled={!canContinue}
                label={data.raceDate ? 'Continue' : 'Continue without a race date'}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// FITNESS DURATION SCREEN (for general fitness goal)
// =============================================================================

interface FitnessDurationScreenProps {
    selected: FitnessDuration | null;
    onSelect: (duration: FitnessDuration) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function FitnessDurationScreen({
    selected,
    onSelect,
    onContinue,
    onBack
}: FitnessDurationScreenProps) {
    // Track focused option for arrow navigation
    const [focusedIndex, setFocusedIndex] = useState<number>(() => {
        if (selected) {
            const idx = FITNESS_DURATION_OPTIONS.findIndex(o => o.value === selected);
            return idx >= 0 ? idx : 0;
        }
        return 0;
    });

    useKeyboardNavigation({
        onEnter: selected ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            const option = FITNESS_DURATION_OPTIONS[num - 1];
            if (option) {
                onSelect(option.value as FitnessDuration);
                setFocusedIndex(num - 1);
            }
        },
        // Arrow key navigation
        totalOptions: FITNESS_DURATION_OPTIONS.length,
        selectedIndex: focusedIndex,
        onSelectIndex: (index) => {
            setFocusedIndex(index);
            const option = FITNESS_DURATION_OPTIONS[index];
            if (option) {
                onSelect(option.value as FitnessDuration);
            }
        },
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="How long do you want to train?"
            />

            <OptionGrid>
                {FITNESS_DURATION_OPTIONS.map((option, index) => (
                    <OptionButton
                        key={option.value}
                        label={option.label}
                        description={option.description}
                        shortcut={String(index + 1)}
                        selected={selected === option.value}
                        onClick={() => {
                            onSelect(option.value as FitnessDuration);
                            setFocusedIndex(index);
                        }}
                    />
                ))}
            </OptionGrid>

            <ContinueButton
                onClick={onContinue}
                disabled={!selected}
            />
        </QuestionScreen>
    );
}
