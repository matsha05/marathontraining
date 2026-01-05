'use client';

import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import {
    TrainingPhilosophy,
    QuizAnswers,
    PhilosophyRecommendation,
    PHILOSOPHIES,
    FOUNDATION_LAYERS,
    CurrentMileage,
    DaysPerWeek,
} from '@/domain/philosophy/types';
import { getOverrideWarnings, isPhilosophyAvailableForDistance } from '@/domain/philosophy/recommendation';
import { getPersonalizedPhilosophyCard, getDistanceSpecificPrinciples, getTypicalWeek } from '@/domain/philosophy/personalized-card';
import { PhilosophyCard } from './PhilosophyCard';
import { matchCoachesToUser } from '@/domain/philosophy/coach-matcher';

/**
 * RecommendationScreen - Quiz result component
 * V2 Design System - 100% token usage
 */

interface RecommendationScreenProps {
    recommendation: PhilosophyRecommendation;
    answers: QuizAnswers;
    onSelect: (philosophy: string) => void;
    onBack: () => void;
    /** Optional: Called when user clicks a fix suggestion to auto-adjust their answers */
    onUpdateAnswers?: (updates: Partial<QuizAnswers>) => void;
}

export function RecommendationScreen({
    recommendation,
    answers,
    onSelect,
    onBack,
    onUpdateAnswers,
}: RecommendationScreenProps) {
    const [showAlternatives, setShowAlternatives] = useState(false);
    const [selectedOverride, setSelectedOverride] = useState<TrainingPhilosophy | null>(null);
    const [showConfirmOverride, setShowConfirmOverride] = useState(false);

    const primary = PHILOSOPHIES[recommendation.primary];

    // Get personalized card data for the primary recommendation
    const personalizedPrimary = useMemo(() =>
        getPersonalizedPhilosophyCard(recommendation.primary, answers),
        [recommendation.primary, answers]
    );

    // Get distance-specific principles (replaces marathon-specific text)
    const personalizedPrinciples = useMemo(() =>
        getDistanceSpecificPrinciples(recommendation.primary, answers.targetDistance || 'marathon'),
        [recommendation.primary, answers.targetDistance]
    );

    // Get distance/tier-specific typical week
    const personalizedTypicalWeek = useMemo(() => {
        const tier = personalizedPrimary.adjustedTier || 'intermediate';
        return getTypicalWeek(recommendation.primary, answers.targetDistance || 'marathon', tier);
    }, [recommendation.primary, answers.targetDistance, personalizedPrimary.adjustedTier]);

    // Convert mileage string to number for coach matcher
    const mileageToNumber = (mileage: CurrentMileage | null): number => {
        if (!mileage) return 20;
        if (mileage === 'under_20') return 15;
        if (mileage === '20_40') return 30;
        return 50; // over_40
    };

    // Get coach matching results (shows excluded coaches with reasons)
    const coachMatch = useMemo(() =>
        matchCoachesToUser(
            answers.targetDistance || 'marathon',
            answers.daysPerWeek || 4,
            mileageToNumber(answers.currentMileage)
        ),
        [answers.targetDistance, answers.daysPerWeek, answers.currentMileage]
    );

    // Distance label for display
    const distanceLabel = answers.targetDistance === 'half' ? 'Half Marathon' :
        answers.targetDistance === '5k' ? '5K' :
            answers.targetDistance === '10k' ? '10K' :
                answers.targetDistance === 'marathon' ? 'Marathon' :
                    answers.targetDistance === 'base' ? 'Base Building' : 'Plan';

    // Only show alternatives that are eligible based on coach matcher
    const alternatives = Object.values(PHILOSOPHIES).filter(p =>
        p.id !== recommendation.primary &&
        coachMatch.eligibleCoaches.includes(p.id)
    );

    const handleSelectAlternative = (philosophy: TrainingPhilosophy) => {
        setSelectedOverride(philosophy);
        setShowConfirmOverride(true);
    };

    const handleConfirmOverride = () => {
        if (selectedOverride) {
            onSelect(selectedOverride);
        }
    };

    const overrideWarnings = selectedOverride
        ? getOverrideWarnings(answers, selectedOverride, recommendation.primary)
        : [];

    // Override confirmation modal
    if (showConfirmOverride && selectedOverride) {
        const selectedPhilosophy = PHILOSOPHIES[selectedOverride];
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
            >
                <div className="max-w-2xl w-full">
                    {/* Back */}
                    <button
                        onClick={() => setShowConfirmOverride(false)}
                        className="text-sm transition-colors mb-8"
                        style={{ color: 'var(--v2-text-subtle)' }}
                    >
                        ← Back to recommendation
                    </button>

                    <h1
                        className="text-3xl font-light mb-4"
                        style={{ color: 'var(--v2-text-primary)' }}
                    >
                        Switching to {selectedPhilosophy.name}
                    </h1>

                    {/* Warnings if any */}
                    {overrideWarnings.length > 0 && (
                        <div
                            className="mb-8 p-5 rounded-xl border"
                            style={{
                                background: 'rgba(245, 158, 11, 0.1)',
                                borderColor: 'rgba(245, 158, 11, 0.3)'
                            }}
                        >
                            <p
                                className="text-sm font-medium mb-3"
                                style={{ color: 'var(--v2-warning)' }}
                            >
                                Heads up
                            </p>
                            <ul className="space-y-2">
                                {overrideWarnings.map((warning, i) => (
                                    <li
                                        key={i}
                                        className="text-sm"
                                        style={{ color: 'var(--v2-text-tertiary)' }}
                                    >
                                        • {warning}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Full methodology display */}
                    <PhilosophyCard philosophy={selectedPhilosophy} expanded />

                    {/* Foundation reminder */}
                    <div className="v2-card mt-8 p-5">
                        <p
                            className="text-xs uppercase tracking-widest mb-4"
                            style={{ color: 'var(--v2-text-muted)' }}
                        >
                            Still included regardless
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {FOUNDATION_LAYERS.map((layer) => (
                                <div key={layer.coach} className="text-center">
                                    <p className="text-xs" style={{ color: 'var(--v2-text-tertiary)' }}>{layer.focus}</p>
                                    <p className="text-[10px] mt-1" style={{ color: 'var(--v2-text-subtle)' }}>{layer.coach}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Confirm */}
                    <button
                        onClick={handleConfirmOverride}
                        className="v2-btn v2-btn-primary w-full mt-8"
                    >
                        Start with {selectedPhilosophy.name}
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
            className="min-h-screen flex flex-col items-center px-6 py-16"
        >
            {/* Back button */}
            <button
                onClick={onBack}
                className="fixed top-8 left-6 text-sm transition-colors"
                style={{ color: 'var(--v2-text-subtle)' }}
            >
                ← Back
            </button>

            <div className="max-w-2xl w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <p
                        className="text-xs uppercase tracking-widest mb-3"
                        style={{ color: 'var(--v2-text-muted)' }}
                    >
                        Based on your answers
                    </p>
                    <h1
                        className="text-4xl md:text-5xl font-light"
                        style={{ color: 'var(--v2-text-primary)' }}
                    >
                        We recommend
                    </h1>
                </motion.div>

                {/* Primary recommendation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <PhilosophyCard
                        philosophy={primary}
                        expanded
                        recommended
                        personalizedRunDays={personalizedPrimary.personalizedRunDays}
                        personalizedLongRunCap={personalizedPrimary.personalizedLongRunCap}
                        personalizedDuration={personalizedPrimary.personalizedDuration}
                        personalizedKeyWorkouts={personalizedPrimary.personalizedKeyWorkouts}
                        personalizedPrinciples={personalizedPrinciples}
                        personalizedTypicalWeek={personalizedTypicalWeek}
                        userDistance={distanceLabel}
                    />

                    {/* Tier adjustment context (when auto-downgraded) */}
                    {personalizedPrimary.tierAdjusted && personalizedPrimary.adjustmentReason && (
                        <div
                            className="mt-4 p-4 rounded-xl border"
                            style={{
                                background: 'rgba(59, 130, 246, 0.1)',
                                borderColor: 'rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <span style={{ color: 'var(--v2-accent)', marginTop: '2px' }}>ℹ️</span>
                                <div>
                                    <p
                                        className="text-sm font-medium mb-1"
                                        style={{ color: 'var(--v2-text-secondary)' }}
                                    >
                                        Plan adjusted to fit your schedule
                                    </p>
                                    <p
                                        className="text-sm"
                                        style={{ color: 'var(--v2-text-tertiary)' }}
                                    >
                                        {personalizedPrimary.adjustmentReason}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reasoning */}
                    <div className="v2-card mt-6 p-5">
                        <p
                            className="text-xs uppercase tracking-widest mb-3"
                            style={{ color: 'var(--v2-text-muted)' }}
                        >
                            Why this fits you
                        </p>
                        <ul className="space-y-2">
                            {recommendation.reasoning.map((reason, i) => (
                                <li
                                    key={i}
                                    className="text-sm flex items-start gap-2"
                                    style={{ color: 'var(--v2-text-tertiary)' }}
                                >
                                    <span className="mt-0.5" style={{ color: 'var(--v2-accent)' }}>✓</span>
                                    {reason}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Warnings if any */}
                    {recommendation.warnings.length > 0 && (
                        <div
                            className="mt-4 p-4 rounded-xl border"
                            style={{
                                background: 'rgba(245, 158, 11, 0.1)',
                                borderColor: 'rgba(245, 158, 11, 0.3)'
                            }}
                        >
                            <ul className="space-y-2">
                                {recommendation.warnings.map((warning, i) => (
                                    <li
                                        key={i}
                                        className="text-sm"
                                        style={{ color: 'var(--v2-text-tertiary)' }}
                                    >
                                        • {warning}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Foundation reminder */}
                    <div className="v2-card mt-6 p-5">
                        <p
                            className="text-xs uppercase tracking-widest mb-4"
                            style={{ color: 'var(--v2-text-muted)' }}
                        >
                            Also included in every plan
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {FOUNDATION_LAYERS.map((layer) => (
                                <div key={layer.coach} className="text-center">
                                    <p className="text-xs" style={{ color: 'var(--v2-text-tertiary)' }}>{layer.focus}</p>
                                    <p className="text-[10px] mt-1" style={{ color: 'var(--v2-text-subtle)' }}>{layer.coach}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Primary CTA */}
                    <button
                        onClick={() => onSelect(recommendation.primary)}
                        className="v2-btn v2-btn-primary w-full mt-8"
                    >
                        Start with {primary.name}
                    </button>
                </motion.div>

                {/* Alternatives toggle */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12"
                >
                    <button
                        onClick={() => setShowAlternatives(!showAlternatives)}
                        className="w-full text-center text-sm transition-colors py-4"
                        style={{
                            color: 'var(--v2-text-muted)',
                            borderTop: '1px solid var(--v2-border)'
                        }}
                    >
                        {showAlternatives ? 'Hide alternatives' : 'See other approaches'}
                    </button>

                    {showAlternatives && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-6 mt-6"
                        >
                            {alternatives.map((alt) => (
                                <div key={alt.id}>
                                    <PhilosophyCard philosophy={alt} expanded />
                                    <button
                                        onClick={() => handleSelectAlternative(alt.id)}
                                        className="v2-btn v2-btn-secondary w-full mt-4"
                                    >
                                        Choose {alt.name} instead
                                    </button>
                                </div>
                            ))}

                            {/* Excluded coaches with reasons */}
                            {coachMatch.excludedCoaches.length > 0 && (
                                <div
                                    className="mt-8 p-5 rounded-xl border"
                                    style={{
                                        background: 'var(--v2-bg-elevated)',
                                        borderColor: 'var(--v2-border)'
                                    }}
                                >
                                    <p
                                        className="text-xs uppercase tracking-widest mb-4"
                                        style={{ color: 'var(--v2-text-muted)' }}
                                    >
                                        Not available for your profile
                                    </p>
                                    <div className="space-y-3">
                                        {coachMatch.excludedCoaches.map(({ coach, reason, fixSuggestion, requiredDays, fixType }) => {
                                            // Handler for fix suggestion click
                                            const handleFixClick = () => {
                                                if (onUpdateAnswers && fixType === 'days' && requiredDays) {
                                                    // Auto-adjust days to meet requirement
                                                    onUpdateAnswers({ daysPerWeek: requiredDays as DaysPerWeek });
                                                } else {
                                                    // Fallback: go back to manually adjust
                                                    onBack();
                                                }
                                            };

                                            return (
                                                <div key={coach} className="flex items-start gap-3">
                                                    <span
                                                        className="text-sm mt-0.5"
                                                        style={{ color: 'var(--v2-text-subtle)' }}
                                                    >
                                                        ×
                                                    </span>
                                                    <div>
                                                        <p
                                                            className="text-sm"
                                                            style={{ color: 'var(--v2-text-tertiary)' }}
                                                        >
                                                            {reason}
                                                        </p>
                                                        {fixSuggestion && (
                                                            <button
                                                                onClick={handleFixClick}
                                                                className="text-xs mt-1.5 flex items-center gap-1.5 transition-colors hover:opacity-80"
                                                                style={{ color: 'var(--v2-accent)' }}
                                                            >
                                                                <span style={{
                                                                    display: 'inline-block',
                                                                    width: '4px',
                                                                    height: '4px',
                                                                    borderRadius: '50%',
                                                                    background: 'var(--v2-accent)'
                                                                }} />
                                                                {fixType === 'days' && onUpdateAnswers
                                                                    ? `Bump to ${requiredDays} days →`
                                                                    : `${fixSuggestion} →`
                                                                }
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
