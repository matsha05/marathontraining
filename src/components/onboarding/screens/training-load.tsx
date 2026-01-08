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
import { toDateKey } from '@/lib/dates';
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

            <p className="v3-body-sm mt-4" style={{ color: 'var(--text-subtle)' }}>
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
// LONG RUN DAY SCREEN - Multi-select week grid
// =============================================================================

interface LongRunDayScreenProps {
    value: string[];  // Changed to array
    onChange: (value: string[]) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function LongRunDayScreen({
    value,
    onChange,
    onContinue,
    onBack
}: LongRunDayScreenProps) {
    const canContinue = value.length > 0 && value.length <= 2;

    const toggleDay = (day: string) => {
        if (value.includes(day)) {
            onChange(value.filter(d => d !== day));
        } else if (value.length < 2) {
            onChange([...value, day]);
        }
    };

    useKeyboardNavigation({
        onEnter: canContinue ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            const option = LONG_RUN_DAY_OPTIONS[num - 1];
            if (option) {
                toggleDay(option.value);
            }
        },
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="Which day(s) work best for your long run?"
                subtitle="Select 1-2 days. This is typically your biggest training day."
            />

            {/* Week grid - all 7 days, horizontal scroll on mobile */}
            <div className="mobile-scroll-x gap-2 pb-2 mb-4 -mx-4 px-4 scroll-hint-right md:mx-0 md:px-0 md:grid md:grid-cols-7 md:gap-2 md:overflow-visible">
                {LONG_RUN_DAY_OPTIONS.map((option, index) => (
                    <button
                        key={option.value}
                        onClick={() => toggleDay(option.value)}
                        className="flex flex-col items-center p-3 min-w-[56px] rounded-lg transition-all snap-center flex-shrink-0 md:flex-shrink active:scale-95 touch-target"
                        style={{
                            background: value.includes(option.value)
                                ? 'var(--color-accent)'
                                : 'var(--bg-elevated)',
                            border: `1px solid ${value.includes(option.value) ? 'var(--color-accent)' : 'var(--border-base)'}`,
                            color: value.includes(option.value)
                                ? 'white'
                                : 'var(--text-base)',
                        }}
                    >
                        <span className="text-xs font-medium mb-1" style={{
                            color: value.includes(option.value) ? 'rgba(255,255,255,0.7)' : 'var(--text-subtle)'
                        }}>
                            {String(index + 1)}
                        </span>
                        <span className="text-sm font-medium">
                            {option.label.slice(0, 3)}
                        </span>
                    </button>
                ))}
            </div>

            {value.length === 2 && (
                <p className="text-xs mb-4" style={{ color: 'var(--text-subtle)' }}>
                    ✓ Two days selected. Your plan will alternate long runs between these days.
                </p>
            )}

            {value.length === 0 && (
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                    Select at least one day for your long run.
                </p>
            )}

            <ContinueButton
                onClick={onContinue}
                disabled={!canContinue}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// PLAN START DATE SCREEN
// =============================================================================

interface PlanStartDateScreenProps {
    value: string | null;
    raceDate: string | null;
    onChange: (value: string | null) => void;
    onContinue: () => void;
    onBack: () => void;
}

// Helper to get next Monday
function getNextMonday(): string {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return toDateKey(nextMonday);
}

// Helper to get this weekend (Saturday)
function getThisWeekend(): string {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + (dayOfWeek === 6 ? 0 : daysUntilSaturday));
    return toDateKey(saturday);
}

// Helper to format date nicely
function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T12:00:00'); // Avoid timezone issues
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function PlanStartDateScreen({
    value,
    raceDate,
    onChange,
    onContinue,
    onBack
}: PlanStartDateScreenProps) {
    const nextMonday = getNextMonday();
    const thisWeekend = getThisWeekend();

    // Validate: start date must be before race date (if set)
    const isValid = !value || !raceDate || new Date(value) < new Date(raceDate);
    const canContinue = value !== null && isValid;

    useKeyboardNavigation({
        onEnter: canContinue ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            if (num === 1) onChange(nextMonday);
            if (num === 2) onChange(thisWeekend);
        },
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="When would you like to start training?"
                subtitle="Pick a date, and we'll build your plan from there."
            />

            {/* Quick options */}
            <OptionGrid columns={2}>
                <OptionButton
                    label="Next Monday"
                    description={formatDate(nextMonday)}
                    shortcut="1"
                    selected={value === nextMonday}
                    onClick={() => onChange(nextMonday)}
                    recommended
                />
                <OptionButton
                    label="This Weekend"
                    description={formatDate(thisWeekend)}
                    shortcut="2"
                    selected={value === thisWeekend}
                    onClick={() => onChange(thisWeekend)}
                />
            </OptionGrid>

            {/* Custom date picker */}
            <div className="mt-6">
                <label className="text-xs font-medium block mb-2" style={{ color: 'var(--text-subtle)' }}>
                    Or pick a different date:
                </label>
                <input
                    type="date"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value || null)}
                    min={toDateKey(new Date())}
                    max={raceDate || undefined}
                    className="w-full p-3 rounded-xl"
                    style={{
                        background: 'var(--bg-elevated)',
                        border: `1px solid ${value && value !== nextMonday && value !== thisWeekend ? 'var(--color-accent)' : 'var(--border-base)'}`,
                        color: 'var(--text-base)',
                        colorScheme: 'dark',
                    }}
                />
            </div>

            {!isValid && (
                <p className="text-xs mt-3" style={{ color: 'var(--color-error)' }}>
                    Start date must be before your race date.
                </p>
            )}

            {value && isValid && raceDate && (
                <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                    That gives you {Math.ceil((new Date(raceDate).getTime() - new Date(value).getTime()) / (7 * 24 * 60 * 60 * 1000))} weeks of training.
                </p>
            )}

            <ContinueButton
                onClick={onContinue}
                disabled={!canContinue}
            />
        </QuestionScreen>
    );
}
