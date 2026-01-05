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

type QuestionStep = 'distance' | 'timing' | 'date_input' | 'days' | 'experience' | 'mileage' | 'mindset' | 'result';

// Base step order (date_input is conditionally inserted)
const BASE_STEP_ORDER: QuestionStep[] = ['distance', 'timing', 'days', 'experience', 'mileage', 'mindset', 'result'];

interface PhilosophyQuizProps {
    onComplete: (philosophy: string) => void;
    onSkip?: () => void;
}

export function PhilosophyQuiz({ onComplete, onSkip }: PhilosophyQuizProps) {
    const [step, setStep] = useState<QuestionStep>('distance');
    const [answers, setAnswers] = useState<QuizAnswers>(INITIAL_QUIZ_ANSWERS);

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
            {/* Progress bar */}
            {step !== 'result' && (
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
                        onBack={onSkip}
                        backLabel="Skip quiz"
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
                {step === 'date_input' && (
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
                                When is race day?
                            </h1>
                            <p
                                className="text-lg mb-8"
                                style={{ color: 'var(--v2-text-muted)' }}
                            >
                                We&apos;ll calculate how many weeks you have to train.
                            </p>
                            <input
                                type="date"
                                className="v2-input text-center text-lg py-4 px-6 w-full max-w-xs mx-auto"
                                style={{ background: 'var(--v2-bg-elevated)', border: '1px solid var(--v2-border)' }}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleDateSelect(e.target.value);
                                    }
                                }}
                            />
                            <p
                                className="text-sm mt-4"
                                style={{ color: 'var(--v2-text-subtle)' }}
                            >
                                Pick your target race date
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Question 3: Days per week */}
                {step === 'days' && (
                    <QuestionScreen
                        key="days"
                        question="How many days can you RUN each week?"
                        subtitle="Just running — strength and cross-training are separate."
                        options={[
                            { value: 3, label: '3 days', description: 'Fits busy schedules' },
                            { value: 4, label: '4 days', description: 'Room for life and recovery' },
                            { value: 5, label: '5 days', description: 'Solid commitment' },
                            { value: 6, label: '6 days', description: 'Unlocks advanced methods' },
                        ]}
                        onSelect={handleDaysSelect}
                        onBack={goBack}
                    />
                )}

                {/* Question 4: Experience */}
                {step === 'experience' && (
                    <QuestionScreen
                        key="experience"
                        question="What best describes you right now?"
                        subtitle="Be honest — this protects you from overtraining."
                        options={[
                            {
                                value: 'beginner' as Experience,
                                label: 'Brand new to running',
                                description: 'Never trained for a race before'
                            },
                            {
                                value: 'intermediate' as Experience,
                                label: 'Currently running regularly',
                                description: 'Running at least 2-3 times per week'
                            },
                            {
                                value: 'advanced' as Experience,
                                label: 'Experienced & chasing PRs',
                                description: 'Consistent training, ready to push'
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
