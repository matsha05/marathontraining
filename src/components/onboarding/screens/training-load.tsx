'use client';

/**
 * THE LONG GAME - Onboarding Screens: Training Load & Schedule V2
 * 
 * Weekly mileage, runs per week, longest run, available days, long run day
 * Week aesthetic: Dark, atmospheric, light typography
 */

import {
    QuestionScreen,
    QuestionHeader,
    TextInput,
    OptionButton,
    OptionGrid,
    ContinueButton,
    useKeyboardNavigation,
} from '../ui';
import { OnboardingData } from '@/domain/onboarding/types';
import { STEP_TOOLTIPS } from '@/domain/onboarding/types';
import {
    RUNS_PER_WEEK_OPTIONS,
    AVAILABLE_DAYS_OPTIONS,
    LONG_RUN_DAY_OPTIONS,
} from '@/domain/onboarding/constants';

// =============================================================================
// WEEKLY MILEAGE SCREEN
// =============================================================================

interface WeeklyMileageScreenProps {
    value: number | null;
    onChange: (value: number | null) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function WeeklyMileageScreen({
    value,
    onChange,
    onContinue,
    onBack
}: WeeklyMileageScreenProps) {
    const canContinue = value !== null && value >= 0;

    useKeyboardNavigation({
        onEnter: canContinue ? onContinue : undefined,
        onBack,
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="How many miles have you averaged per week lately?"
                subtitle="Think about the last 4 weeks."
                tooltip={STEP_TOOLTIPS['weekly-mileage']}
            />

            <TextInput
                type="number"
                value={value?.toString() ?? ''}
                onChange={(v) => onChange(v ? parseFloat(v) : null)}
                placeholder="0"
                suffix="miles/week"
                min={0}
                max={150}
                step={0.1}
            />

            <ContinueButton
                onClick={onContinue}
                disabled={!canContinue}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// RUNS PER WEEK SCREEN
// =============================================================================

interface RunsPerWeekScreenProps {
    value: number | null;
    onChange: (value: number) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function RunsPerWeekScreen({
    value,
    onChange,
    onContinue,
    onBack
}: RunsPerWeekScreenProps) {
    useKeyboardNavigation({
        onEnter: value !== null ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            const option = RUNS_PER_WEEK_OPTIONS[num - 1];
            if (option) {
                onChange(option.value);
            }
        },
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="How many times per week do you typically run?"
                tooltip={STEP_TOOLTIPS['runs-per-week']}
            />

            <OptionGrid>
                {RUNS_PER_WEEK_OPTIONS.map((option, index) => (
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
// LONGEST RUN SCREEN
// =============================================================================

interface LongestRunScreenProps {
    value: number | null;
    onChange: (value: number | null) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function LongestRunScreen({
    value,
    onChange,
    onContinue,
    onBack
}: LongestRunScreenProps) {
    const canContinue = value !== null && value >= 0;

    useKeyboardNavigation({
        onEnter: canContinue ? onContinue : undefined,
        onBack,
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="What's the longest run you've done in the last month?"
            />

            <TextInput
                type="number"
                value={value?.toString() ?? ''}
                onChange={(v) => onChange(v ? parseFloat(v) : null)}
                placeholder="0"
                suffix="miles"
                min={0}
                max={50}
                step={0.1}
            />

            <ContinueButton
                onClick={onContinue}
                disabled={!canContinue}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// AVAILABLE DAYS SCREEN
// =============================================================================

interface AvailableDaysScreenProps {
    value: number | null;
    onChange: (value: number) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function AvailableDaysScreen({
    value,
    onChange,
    onContinue,
    onBack
}: AvailableDaysScreenProps) {
    useKeyboardNavigation({
        onEnter: value !== null ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            const option = AVAILABLE_DAYS_OPTIONS[num - 1];
            if (option) {
                onChange(option.value);
            }
        },
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="How many days per week can you commit to training?"
            />

            <OptionGrid columns={2}>
                {AVAILABLE_DAYS_OPTIONS.map((option, index) => (
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

            <p className="v2-body-sm mt-4" style={{ color: 'var(--text-subtle)' }}>
                More days = more adaptation stimulus. But quality beats quantity.
                A focused 4-day plan often outperforms a half-hearted 6-day plan.
            </p>

            <ContinueButton
                onClick={onContinue}
                disabled={value === null}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// LONG RUN DAY SCREEN
// =============================================================================

interface LongRunDayScreenProps {
    value: string;
    onChange: (value: string) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function LongRunDayScreen({
    value,
    onChange,
    onContinue,
    onBack
}: LongRunDayScreenProps) {
    useKeyboardNavigation({
        onEnter: value !== '' ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            const option = LONG_RUN_DAY_OPTIONS[num - 1];
            if (option) {
                onChange(option.value);
            }
        },
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="Which day works best for your long run?"
                subtitle="This is typically your biggest training day of the week."
            />

            <OptionGrid>
                {LONG_RUN_DAY_OPTIONS.map((option, index) => (
                    <OptionButton
                        key={option.value}
                        label={option.label}
                        shortcut={String(index + 1)}
                        selected={value === option.value}
                        onClick={() => onChange(option.value)}
                    />
                ))}
            </OptionGrid>

            <ContinueButton
                onClick={onContinue}
                disabled={value === ''}
            />
        </QuestionScreen>
    );
}
