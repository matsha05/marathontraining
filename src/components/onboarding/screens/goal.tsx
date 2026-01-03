'use client';

/**
 * THE LONG GAME - Onboarding Screens: Goal
 * 
 * Training goal, race details, fitness duration screens
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
import { OnboardingData, TrainingGoal, FitnessDuration } from '@/domain/onboarding/types';
import { STEP_TOOLTIPS } from '@/domain/onboarding/types';
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
    useKeyboardNavigation({
        onEnter: selected ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            const goal = TRAINING_GOALS[num - 1];
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
                        onClick={() => onSelect(goal.value as TrainingGoal)}
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
    onRaceDateChange: (date: string) => void;
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
    const minDateStr = minDate.toISOString().split('T')[0];

    // Calculate weeks to race
    const weeksToRace = data.raceDate
        ? Math.floor((new Date(data.raceDate).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))
        : null;

    const minWeeks = MINIMUM_WEEKS[data.trainingGoal ?? 'marathon'];
    const recommendedWeeks = RECOMMENDED_WEEKS[data.trainingGoal ?? 'marathon'];

    const handleDateChange = (date: string) => {
        onRaceDateChange(date);

        if (date) {
            const weeks = Math.floor((new Date(date).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000));
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
                    <label className="text-label block mb-2">Race name (optional)</label>
                    <TextInput
                        value={data.raceName}
                        onChange={onRaceNameChange}
                        placeholder="e.g., Chicago Marathon, Turkey Trot 5K"
                    />
                    <p className="text-caption text-[var(--text-subtle)] mt-2">
                        This personalizes your dashboard countdown
                    </p>
                </div>

                {/* Race date (optional) */}
                <div>
                    <label className="text-label block mb-2">Race date (optional)</label>
                    <input
                        type="date"
                        value={data.raceDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        min={minDateStr}
                        aria-invalid={Boolean(dateError)}
                        className="input text-lg w-full"
                    />
                    {dateError && (
                        <p className="text-body-sm text-[var(--color-error)] mt-2">{dateError}</p>
                    )}
                    {!data.raceDate && (
                        <p className="text-caption text-[var(--text-subtle)] mt-2">
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
                            <p className="text-body-sm text-[var(--text-muted)]">
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
    useKeyboardNavigation({
        onEnter: selected ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            const option = FITNESS_DURATION_OPTIONS[num - 1];
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
                        onClick={() => onSelect(option.value as FitnessDuration)}
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
