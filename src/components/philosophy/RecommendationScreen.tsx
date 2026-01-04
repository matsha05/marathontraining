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
import { getOverrideWarnings } from '@/domain/philosophy/recommendation';
import { PhilosophyCard } from './PhilosophyCard';

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
    const alternatives = Object.values(PHILOSOPHIES).filter(p => p.id !== recommendation.primary);

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
                        className="text-sm text-white/30 hover:text-white/60 transition-colors mb-8"
                    >
                        ← Back to recommendation
                    </button>

                    <h1 className="text-3xl font-light text-white/90 mb-4">
                        Switching to {selectedPhilosophy.name}
                    </h1>

                    {/* Warnings if any */}
                    {overrideWarnings.length > 0 && (
                        <div className="mb-8 p-5 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30">
                            <p className="text-sm text-[#f59e0b] font-medium mb-3">Heads up</p>
                            <ul className="space-y-2">
                                {overrideWarnings.map((warning, i) => (
                                    <li key={i} className="text-sm text-white/60">
                                        • {warning}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Full methodology display */}
                    <PhilosophyCard philosophy={selectedPhilosophy} expanded />

                    {/* Foundation reminder */}
                    <div className="mt-8 p-5 rounded-xl bg-white/[0.02] border border-white/10">
                        <p className="text-xs text-white/40 uppercase tracking-widest mb-4">
                            Still included regardless
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {FOUNDATION_LAYERS.map((layer) => (
                                <div key={layer.coach} className="text-center">
                                    <p className="text-xs text-white/60">{layer.focus}</p>
                                    <p className="text-[10px] text-white/30 mt-1">{layer.coach}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Confirm */}
                    <button
                        onClick={handleConfirmOverride}
                        className="w-full mt-8 py-4 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors"
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
                className="fixed top-8 left-6 text-sm text-white/30 hover:text-white/60 transition-colors"
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
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
                        Based on your answers
                    </p>
                    <h1 className="text-4xl md:text-5xl font-light text-white/90">
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
                    <div className="mt-6 p-5 rounded-xl bg-white/[0.02] border border-white/10">
                        <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
                            Why this fits you
                        </p>
                        <ul className="space-y-2">
                            {recommendation.reasoning.map((reason, i) => (
                                <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                                    <span className="text-[#19e38c] mt-0.5">✓</span>
                                    {reason}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Warnings if any */}
                    {recommendation.warnings.length > 0 && (
                        <div className="mt-4 p-4 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30">
                            <ul className="space-y-2">
                                {recommendation.warnings.map((warning, i) => (
                                    <li key={i} className="text-sm text-white/60">
                                        • {warning}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Foundation reminder */}
                    <div className="mt-6 p-5 rounded-xl bg-white/[0.02] border border-white/10">
                        <p className="text-xs text-white/40 uppercase tracking-widest mb-4">
                            Also included in every plan
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {FOUNDATION_LAYERS.map((layer) => (
                                <div key={layer.coach} className="text-center">
                                    <p className="text-xs text-white/60">{layer.focus}</p>
                                    <p className="text-[10px] text-white/30 mt-1">{layer.coach}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Primary CTA */}
                    <button
                        onClick={() => onSelect(recommendation.primary)}
                        className="w-full mt-8 py-4 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors"
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
                        className="w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors py-4 border-t border-white/5"
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
                                        className="w-full mt-4 py-3 bg-white/[0.05] border border-white/10 text-white/70 font-medium rounded-xl hover:bg-white/[0.08] hover:border-white/20 transition-all"
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
