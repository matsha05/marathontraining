'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    QuizAnswers,
    TargetDistance,
    DaysPerWeek,
    Experience,
    CurrentMileage,
    Mindset,
    RaceTiming,
    INITIAL_QUIZ_ANSWERS,
} from '@/domain/philosophy/types';
import { calculateRecommendation } from '@/domain/philosophy/recommendation';
import { useState, useCallback } from 'react';
import { QuestionScreen } from './QuestionScreen';
import { RecommendationScreen } from './RecommendationScreen';

/**
 * Philosophy Quiz - V2 Design System
 * 100% token usage, zero hardcoded colors
 */

type QuestionStep = 'beginner_gate' | 'distance' | 'timing' | 'date_input' | 'days' | 'experience' | 'mileage' | 'mindset' | 'result';

// Base step order (date_input is conditionally inserted)
const BASE_STEP_ORDER: QuestionStep[] = ['beginner_gate', 'distance', 'timing', 'days', 'experience', 'mileage', 'mindset', 'result'];

interface PhilosophyQuizProps {
    onComplete: (philosophy: string) => void;
    onSkip?: () => void;
}

export function PhilosophyQuiz({ onComplete, onSkip }: PhilosophyQuizProps) {
    const [step, setStep] = useState<QuestionStep>('beginner_gate');
    const [answers, setAnswers] = useState<QuizAnswers>(INITIAL_QUIZ_ANSWERS);
    const [canRunMile, setCanRunMile] = useState<boolean | null>(null);
    const [showTooFewDays, setShowTooFewDays] = useState<'2_or_fewer' | '3_for_marathon' | null>(null);

    // Dynamic step order based on timing selection
    const STEP_ORDER = answers.raceTiming === 'specific'
        ? ['distance', 'timing', 'date_input', 'days', 'experience', 'mileage', 'mindset', 'result'] as QuestionStep[]
        : BASE_STEP_ORDER;

    const currentIndex = STEP_ORDER.indexOf(step);
    const progress = ((currentIndex) / (STEP_ORDER.length - 1)) * 100;

    const goNext = useCallback(() => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < STEP_ORDER.length) {
            setStep(STEP_ORDER[nextIndex]);
        }
    }, [currentIndex]);

    const goBack = useCallback(() => {
        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
            setStep(STEP_ORDER[prevIndex]);
        }
    }, [currentIndex]);

    const handleDistanceSelect = (value: TargetDistance) => {
        setAnswers(prev => ({ ...prev, targetDistance: value }));
        goNext();
    };

    const handleTimingSelect = (value: RaceTiming) => {
        setAnswers(prev => ({ ...prev, raceTiming: value }));
        // If specific date selected, go to date input; otherwise go to days
        if (value === 'specific') {
            setStep('date_input');
        } else {
            setStep('days');
        }
    };

    const handleDateSelect = (date: string) => {
        setAnswers(prev => ({ ...prev, raceDate: date }));
        setStep('days');
    };

    const handleDaysSelect = (value: DaysPerWeek) => {
        setAnswers(prev => ({ ...prev, daysPerWeek: value }));
        goNext();
    };

    const handleExperienceSelect = (value: Experience) => {
        setAnswers(prev => ({ ...prev, experience: value }));
        goNext();
    };

    const handleMileageSelect = (value: CurrentMileage) => {
        setAnswers(prev => ({ ...prev, currentMileage: value }));
        goNext();
    };

    const handleMindsetSelect = (value: Mindset) => {
        setAnswers(prev => ({ ...prev, mindset: value }));
        goNext();
    };

    const recommendation = step === 'result' ? calculateRecommendation(answers) : null;

    return (
        <div className="v2-root min-h-screen" style={{ background: 'var(--v2-bg-deep)', color: 'var(--v2-text-primary)' }}>
            {/* Progress bar - hide on beginner gate and result */}
            {step !== 'result' && step !== 'beginner_gate' && (
                <div className="fixed top-0 left-0 right-0 z-50">
                    <div className="h-1" style={{ background: 'var(--v2-border)' }}>
                        <motion.div
                            className="h-full"
                            style={{ background: 'var(--v2-accent)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                        />
                    </div>
                    <div className="v2-container py-2">
                        <p className="v2-mono text-center" style={{ fontSize: '11px', color: 'var(--v2-text-muted)' }}>
                            Step {currentIndex + 1} of 6
                        </p>
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {/* Beginner Gate: Can you run 1 mile? */}
                {step === 'beginner_gate' && canRunMile === null && (
                    <motion.div
                        key="beginner_gate"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
                        className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
                    >
                        <div className="max-w-xl w-full text-center">
                            <h1
                                className="text-3xl md:text-4xl font-light mb-4"
                                style={{ color: 'var(--v2-text-primary)' }}
                            >
                                Quick check first
                            </h1>
                            <p
                                className="text-lg mb-8"
                                style={{ color: 'var(--v2-text-muted)' }}
                            >
                                Can you run 1 mile without stopping?
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        setCanRunMile(true);
                                        setStep('distance');
                                    }}
                                    className="w-full v2-card v2-card-interactive p-5 text-left"
                                >
                                    <p className="v2-heading-sm">Yes, I can run a mile</p>
                                    <p className="v2-body-sm mt-1" style={{ color: 'var(--v2-text-muted)' }}>
                                        Great! Let&apos;s find your training approach.
                                    </p>
                                </button>
                                <button
                                    onClick={() => setCanRunMile(false)}
                                    className="w-full v2-card v2-card-interactive p-5 text-left"
                                >
                                    <p className="v2-heading-sm">Not yet</p>
                                    <p className="v2-body-sm mt-1" style={{ color: 'var(--v2-text-muted)' }}>
                                        That&apos;s okay — we&apos;ll point you in the right direction.
                                    </p>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Beginner Gate: Not ready message */}
                {step === 'beginner_gate' && canRunMile === false && (
                    <motion.div
                        key="not_ready"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
                    >
                        <div className="max-w-xl w-full text-center">
                            <h1
                                className="text-3xl md:text-4xl font-light mb-4"
                                style={{ color: 'var(--v2-text-primary)' }}
                            >
                                Build your foundation first
                            </h1>
                            <p
                                className="text-lg mb-6"
                                style={{ color: 'var(--v2-text-muted)' }}
                            >
                                Our training plans assume you can run continuously.
                                The Couch to 5K program is perfect for building up to that point.
                            </p>
                            <div className="v2-card p-6 mb-8 text-left">
                                <p className="v2-label mb-2">Recommended: Couch to 5K (C25K)</p>
                                <p className="v2-body-sm mb-4" style={{ color: 'var(--v2-text-muted)' }}>
                                    A proven 9-week walk/run program that gradually builds you up to running 3 miles without stopping.
                                </p>
                                <a
                                    href="https://c25k.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="v2-btn v2-btn-primary"
                                >
                                    Start C25K Program
                                </a>
                            </div>
                            <button
                                onClick={() => setCanRunMile(null)}
                                className="v2-btn v2-btn-ghost"
                            >
                                ← Go back
                            </button>
                            <p
                                className="text-sm mt-6"
                                style={{ color: 'var(--v2-text-subtle)' }}
                            >
                                Once you can run 1 mile, come back and we&apos;ll build your training plan!
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Question 1: Goal */}
                {step === 'distance' && (
                    <QuestionScreen
                        key="distance"
                        question="What's your goal right now?"
                        subtitle="This shapes how we structure your training."
                        options={[
                            { value: 'base' as TargetDistance, label: 'Build general fitness', description: 'No race target — build your aerobic engine' },
                            { value: '5k' as TargetDistance, label: '5K Race', description: 'Speed and sharpness' },
                            { value: '10k' as TargetDistance, label: '10K Race', description: 'The balanced challenge' },
                            { value: 'half' as TargetDistance, label: 'Half Marathon', description: 'The sweet spot' },
                            { value: 'marathon' as TargetDistance, label: 'Marathon', description: 'The classic 26.2' },
                        ]}
                        onSelect={handleDistanceSelect}
                        onBack={() => {
                            setCanRunMile(null);
                            setStep('beginner_gate');
                        }}
                        backLabel="Back"
                    />
                )}

                {/* Question 2: Race Timing */}
                {step === 'timing' && (
                    <QuestionScreen
                        key="timing"
                        question="When is your race?"
                        subtitle="This helps match you with the right training approach."
                        options={[
                            { value: 'specific' as RaceTiming, label: 'I have a specific date', description: 'We\'ll calculate the weeks' },
                            { value: 'soon' as RaceTiming, label: 'Sometime in 3-6 months', description: 'Standard 18-24 week plans' },
                            { value: 'no_race' as RaceTiming, label: 'No race planned', description: 'Focus on building fitness' },
                        ]}
                        onSelect={handleTimingSelect}
                        onBack={goBack}
                    />
                )}

                {/* Question 2b: Date Input (only when specific timing selected) */}
                {step === 'date_input' && (() => {
                    // Calculate weeks to race when date is selected
                    const selectedDate = answers.raceDate;
                    const weeksToRace = selectedDate
                        ? Math.floor((new Date(selectedDate).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))
                        : null;

                    // Minimum weeks based on distance
                    const minWeeks: Record<string, number> = {
                        '5k': 6, '10k': 8, 'half': 10, 'marathon': 14, 'base': 4
                    };
                    const requiredWeeks = answers.targetDistance ? (minWeeks[answers.targetDistance] || 8) : 8;
                    const isTooSoon = weeksToRace !== null && weeksToRace < requiredWeeks;

                    return (
                        <motion.div
                            key="date_input"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
                            className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
                        >
                            <button
                                onClick={goBack}
                                className="fixed top-8 left-6 text-sm transition-colors"
                                style={{ color: 'var(--v2-text-subtle)' }}
                            >
                                ← Back
                            </button>
                            <div className="max-w-xl w-full text-center">
                                <h1
                                    className="text-3xl md:text-4xl font-light mb-4"
                                    style={{ color: 'var(--v2-text-primary)' }}
                                >
                                    When is your {answers.targetDistance === 'half' ? 'half marathon' : answers.targetDistance}?
                                </h1>
                                <p
                                    className="text-lg mb-8"
                                    style={{ color: 'var(--v2-text-muted)' }}
                                >
                                    We&apos;ll calculate how many weeks you have to prepare.
                                </p>
                                <input
                                    type="date"
                                    value={answers.raceDate || ''}
                                    className="v2-input text-center text-lg py-4 px-6 w-full max-w-xs mx-auto"
                                    style={{ background: 'var(--v2-bg-elevated)', border: '1px solid var(--v2-border)' }}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            setAnswers(prev => ({ ...prev, raceDate: e.target.value }));
                                        }
                                    }}
                                />

                                {/* Week countdown preview */}
                                {weeksToRace !== null && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6"
                                    >
                                        <p className="v2-heading-md v2-mono" style={{ color: 'var(--v2-accent)' }}>
                                            {weeksToRace} weeks
                                        </p>
                                        <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>
                                            until race day
                                        </p>

                                        {/* Warning if too short */}
                                        {isTooSoon && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="mt-4 p-4 rounded-lg border"
                                                style={{
                                                    background: 'var(--v2-warning-subtle)',
                                                    borderColor: 'var(--v2-warning)'
                                                }}
                                            >
                                                <p className="v2-body-sm" style={{ color: 'var(--v2-warning)' }}>
                                                    ⚠️ We recommend at least {requiredWeeks} weeks for a {answers.targetDistance === 'half' ? 'half marathon' : answers.targetDistance}.
                                                    You can still proceed, but we&apos;ll adjust expectations.
                                                </p>
                                            </motion.div>
                                        )}

                                        {/* Continue button */}
                                        <button
                                            onClick={() => handleDateSelect(answers.raceDate!)}
                                            className="v2-btn v2-btn-primary v2-btn-lg mt-6"
                                        >
                                            Continue
                                        </button>
                                    </motion.div>
                                )}

                                {!selectedDate && (
                                    <p
                                        className="text-sm mt-4"
                                        style={{ color: 'var(--v2-text-subtle)' }}
                                    >
                                        Pick your target race date
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    );
                })()}

                {/* Question 3: Days per week */}
                {step === 'days' && (() => {
                    // Marathon requires 4+ days (no 3-day marathon plans exist)
                    const minDaysForDistance: Record<string, number> = {
                        '5k': 3,
                        '10k': 3,
                        'half': 3,
                        'marathon': 4,
                        'base': 3,
                    };
                    const minDays = answers.targetDistance ? (minDaysForDistance[answers.targetDistance] || 3) : 3;

                    const handleDaysClick = (value: number) => {
                        if (value <= 2) {
                            setShowTooFewDays('2_or_fewer');
                        } else if (value === 3 && minDays === 4) {
                            // Marathon with 3 days
                            setShowTooFewDays('3_for_marathon');
                        } else {
                            handleDaysSelect(value as DaysPerWeek);
                        }
                    };

                    if (showTooFewDays) {
                        return (
                            <motion.div
                                key="too_few_days"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
                            >
                                <div className="max-w-xl w-full text-center">
                                    <h1
                                        className="text-3xl md:text-4xl font-light mb-4"
                                        style={{ color: 'var(--v2-text-primary)' }}
                                    >
                                        {showTooFewDays === '2_or_fewer'
                                            ? 'We need a bit more time'
                                            : 'Marathon training needs more days'
                                        }
                                    </h1>
                                    <p
                                        className="text-lg mb-8"
                                        style={{ color: 'var(--v2-text-muted)' }}
                                    >
                                        {showTooFewDays === '2_or_fewer'
                                            ? 'Our structured training plans require at least 3 running days per week to build fitness safely and effectively.'
                                            : 'Every marathon method we offer requires at least 4 running days per week. This isn\'t arbitrary — it\'s what the science and proven programs require.'
                                        }
                                    </p>
                                    <div className="v2-card p-6 mb-8 text-left" style={{ borderColor: 'var(--v2-border)' }}>
                                        <p className="v2-heading-sm mb-2">
                                            {showTooFewDays === '2_or_fewer'
                                                ? 'Can you find one more day?'
                                                : 'Can you commit to 4 days?'
                                            }
                                        </p>
                                        <p className="v2-body-sm mb-4" style={{ color: 'var(--v2-text-muted)' }}>
                                            {showTooFewDays === '2_or_fewer'
                                                ? 'Even short 20-30 minute runs count. Many people find morning runs before work, lunch runs, or runs with kids in a stroller.'
                                                : 'Two of those days can be short easy runs (20-30 minutes). The key is consistency, not crushing volume every day.'
                                            }
                                        </p>
                                        <button
                                            onClick={() => setShowTooFewDays(null)}
                                            className="v2-btn v2-btn-primary"
                                        >
                                            Let me reconsider
                                        </button>
                                    </div>
                                    <p
                                        className="text-sm"
                                        style={{ color: 'var(--v2-text-subtle)' }}
                                    >
                                        {showTooFewDays === '2_or_fewer'
                                            ? 'If you truly can\'t commit to 3 days, consider building your base with casual runs until your schedule opens up.'
                                            : 'If 4 days isn\'t possible, consider a half marathon or 10K first — both work great with 3 days.'
                                        }
                                    </p>
                                    <button
                                        onClick={goBack}
                                        className="v2-btn v2-btn-ghost mt-4"
                                    >
                                        Change my goal
                                    </button>
                                </div>
                            </motion.div>
                        );
                    }

                    // Build options based on distance
                    const daysOptions = [
                        { value: 2, label: '2 days or fewer', description: 'Limited availability' },
                        ...(minDays <= 3 ? [{ value: 3, label: '3 days', description: 'Fits busy schedules' }] : []),
                        ...(minDays <= 3 && answers.targetDistance === 'marathon'
                            ? [{ value: 3, label: '3 days', description: 'Not available for marathon' }]
                            : []),
                        { value: 4, label: '4 days', description: 'Room for life and recovery' },
                        { value: 5, label: '5 days', description: 'Solid commitment' },
                        { value: 6, label: '6 days', description: 'Unlocks advanced methods' },
                    ];

                    // Filtered options (marathon doesn't show 3 days as valid)
                    const filteredOptions = answers.targetDistance === 'marathon'
                        ? [
                            { value: 2, label: '2 days or fewer', description: 'Limited availability' },
                            { value: 3, label: '3 days', description: 'Not enough for marathon' },
                            { value: 4, label: '4 days', description: 'Minimum for marathon' },
                            { value: 5, label: '5 days', description: 'Solid commitment' },
                            { value: 6, label: '6 days', description: 'Unlocks advanced methods' },
                        ]
                        : [
                            { value: 2, label: '2 days or fewer', description: 'Limited availability' },
                            { value: 3, label: '3 days', description: 'Fits busy schedules' },
                            { value: 4, label: '4 days', description: 'Room for life and recovery' },
                            { value: 5, label: '5 days', description: 'Solid commitment' },
                            { value: 6, label: '6 days', description: 'Unlocks advanced methods' },
                        ];

                    return (
                        <motion.div
                            key="days"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
                            className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
                        >
                            <button
                                onClick={goBack}
                                className="fixed top-8 left-6 text-sm transition-colors"
                                style={{ color: 'var(--v2-text-subtle)' }}
                            >
                                Back
                            </button>
                            <div className="max-w-xl w-full text-center">
                                <h1
                                    className="text-3xl md:text-4xl font-light mb-4"
                                    style={{ color: 'var(--v2-text-primary)' }}
                                >
                                    How many days can you RUN each week?
                                </h1>
                                <p
                                    className="text-lg mb-2"
                                    style={{ color: 'var(--v2-text-muted)' }}
                                >
                                    Just running — strength and cross-training are separate.
                                </p>
                                <p
                                    className="text-sm mb-8"
                                    style={{ color: 'var(--v2-text-subtle)' }}
                                >
                                    You can always adjust this later if life changes.
                                </p>
                                <div className="space-y-3">
                                    {filteredOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleDaysClick(option.value)}
                                            className="w-full v2-card v2-card-interactive p-5 text-left"
                                        >
                                            <p className="v2-heading-sm">{option.label}</p>
                                            <p className="v2-body-sm mt-1" style={{ color: 'var(--v2-text-muted)' }}>
                                                {option.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    );
                })()}

                {/* Question 4: Experience */}
                {step === 'experience' && (
                    <QuestionScreen
                        key="experience"
                        question="Where are you right now?"
                        subtitle="This helps us set the right starting intensity."
                        options={[
                            {
                                value: 'beginner' as Experience,
                                label: 'Just starting out',
                                description: 'New to running, returning after a break, or not following a structured plan'
                            },
                            {
                                value: 'intermediate' as Experience,
                                label: 'Building steadily',
                                description: 'Running regularly, ready for structure, or getting back into shape after time off'
                            },
                            {
                                value: 'advanced' as Experience,
                                label: 'Training hard',
                                description: 'High volume, structured workouts, chasing PRs'
                            },
                            {
                                value: 'unsure' as Experience,
                                label: 'Not sure',
                                description: 'We\'ll start moderate and calibrate from your mileage'
                            },
                        ]}
                        onSelect={handleExperienceSelect}
                        onBack={goBack}
                    />
                )}

                {/* Question 5: Current mileage */}
                {step === 'mileage' && (
                    <QuestionScreen
                        key="mileage"
                        question="What's a typical week for you right now?"
                        subtitle="Your current base determines what training load you can absorb."
                        options={[
                            {
                                value: 'under_20' as CurrentMileage,
                                label: 'Under 20 miles',
                                description: 'Building or returning'
                            },
                            {
                                value: '20_40' as CurrentMileage,
                                label: '20-40 miles',
                                description: 'Solid recreational base'
                            },
                            {
                                value: 'over_40' as CurrentMileage,
                                label: '40+ miles',
                                description: 'High-mileage runner'
                            },
                        ]}
                        onSelect={handleMileageSelect}
                        onBack={goBack}
                    />
                )}

                {/* Question 6: Mindset */}
                {step === 'mindset' && (
                    <QuestionScreen
                        key="mindset"
                        question="Which resonates more with you?"
                        subtitle="Your psychology shapes what you'll stick with."
                        options={[
                            {
                                value: 'rest_focus' as Mindset,
                                label: 'I need built-in rest',
                                description: 'Structure my recovery'
                            },
                            {
                                value: 'consistency' as Mindset,
                                label: 'I thrive on consistency',
                                description: 'Daily routine keeps me going'
                            },
                            {
                                value: 'push_limits' as Mindset,
                                label: 'I want to push limits',
                                description: 'Challenge drives me'
                            },
                        ]}
                        onSelect={handleMindsetSelect}
                        onBack={goBack}
                    />
                )}

                {/* Result */}
                {step === 'result' && recommendation && (
                    <RecommendationScreen
                        key="result"
                        recommendation={recommendation}
                        answers={answers}
                        onSelect={onComplete}
                        onBack={goBack}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
