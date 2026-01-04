'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    QuizAnswers,
    TargetDistance,
    DaysPerWeek,
    Experience,
    CurrentMileage,
    Mindset,
    INITIAL_QUIZ_ANSWERS,
} from '@/domain/philosophy/types';
import { calculateRecommendation } from '@/domain/philosophy/recommendation';
import { useState, useCallback } from 'react';
import { QuestionScreen } from './QuestionScreen';
import { RecommendationScreen } from './RecommendationScreen';

type QuestionStep = 'distance' | 'days' | 'experience' | 'mileage' | 'mindset' | 'result';

const STEP_ORDER: QuestionStep[] = ['distance', 'days', 'experience', 'mileage', 'mindset', 'result'];

interface PhilosophyQuizProps {
    onComplete: (philosophy: string) => void;
    onSkip?: () => void;
}

export function PhilosophyQuiz({ onComplete, onSkip }: PhilosophyQuizProps) {
    const [step, setStep] = useState<QuestionStep>('distance');
    const [answers, setAnswers] = useState<QuizAnswers>(INITIAL_QUIZ_ANSWERS);

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
        <div className="min-h-screen bg-[#08080a] text-white">
            {/* Progress bar */}
            {step !== 'result' && (
                <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5">
                    <motion.div
                        className="h-full bg-[#19e38c]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                    />
                </div>
            )}

            <AnimatePresence mode="wait">
                {/* Question 1: Target Distance */}
                {step === 'distance' && (
                    <QuestionScreen
                        key="distance"
                        question="What distance are you training for?"
                        subtitle="This shapes how we structure your plan."
                        options={[
                            { value: '5k' as TargetDistance, label: '5K', description: 'Speed and sharpness' },
                            { value: '10k' as TargetDistance, label: '10K', description: 'The balanced race' },
                            { value: 'half' as TargetDistance, label: 'Half Marathon', description: 'The sweet spot' },
                            { value: 'marathon' as TargetDistance, label: 'Marathon', description: 'The classic 26.2' },
                            { value: 'ultra' as TargetDistance, label: 'Ultra', description: 'Beyond the marathon' },
                        ]}
                        onSelect={handleDistanceSelect}
                        onBack={onSkip}
                        backLabel="Skip quiz"
                    />
                )}

                {/* Question 2: Days per week */}
                {step === 'days' && (
                    <QuestionScreen
                        key="days"
                        question="How many days can you realistically run?"
                        subtitle="Be honest — life happens. Pick what you can consistently do."
                        options={[
                            { value: 3, label: '3 days', description: 'Minimal but effective' },
                            { value: 4, label: '4 days', description: 'Room for life' },
                            { value: 5, label: '5 days', description: 'Balanced frequency' },
                            { value: 6, label: '6 days', description: 'Serious commitment' },
                        ]}
                        onSelect={handleDaysSelect}
                        onBack={goBack}
                    />
                )}

                {/* Question 3: Experience */}
                {step === 'experience' && (
                    <QuestionScreen
                        key="experience"
                        question="What's your experience level?"
                        subtitle="Your background shapes the approach."
                        options={[
                            {
                                value: 'beginner' as Experience,
                                label: 'Beginner',
                                description: 'New to this distance or returning'
                            },
                            {
                                value: 'intermediate' as Experience,
                                label: 'Intermediate',
                                description: 'Some races under my belt'
                            },
                            {
                                value: 'advanced' as Experience,
                                label: 'Advanced',
                                description: 'Experienced, chasing PRs'
                            },
                        ]}
                        onSelect={handleExperienceSelect}
                        onBack={goBack}
                    />
                )}

                {/* Question 4: Current mileage */}
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

                {/* Question 5: Mindset */}
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
