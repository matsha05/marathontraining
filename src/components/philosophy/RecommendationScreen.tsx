'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    TrainingPhilosophy,
    QuizAnswers,
    PhilosophyRecommendation,
    PHILOSOPHIES,
    FOUNDATION_LAYERS,
} from '@/domain/philosophy/types';
import { getOverrideWarnings, isPhilosophyAvailableForDistance } from '@/domain/philosophy/recommendation';
import { PhilosophyCard } from './PhilosophyCard';

/**
 * RecommendationScreen - Quiz result component
 * V2 Design System - 100% token usage
 */

interface RecommendationScreenProps {
    recommendation: PhilosophyRecommendation;
    answers: QuizAnswers;
    onSelect: (philosophy: string) => void;
    onBack: () => void;
}

export function RecommendationScreen({
    recommendation,
    answers,
    onSelect,
    onBack,
}: RecommendationScreenProps) {
    const [showAlternatives, setShowAlternatives] = useState(false);
    const [selectedOverride, setSelectedOverride] = useState<TrainingPhilosophy | null>(null);
    const [showConfirmOverride, setShowConfirmOverride] = useState(false);

    const primary = PHILOSOPHIES[recommendation.primary];
    // Only show alternatives that can actually deliver plans for this distance
    const alternatives = Object.values(PHILOSOPHIES).filter(p =>
        p.id !== recommendation.primary &&
        isPhilosophyAvailableForDistance(p.id, answers.targetDistance)
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
                    <PhilosophyCard philosophy={primary} expanded recommended />

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
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
