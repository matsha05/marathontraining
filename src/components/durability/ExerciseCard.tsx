"use client";

/**
 * ExerciseCard
 * 
 * Displays a single exercise with full instructions, video link, and source attribution.
 * Used in durability routines and strength workouts.
 * 
 * Based on Dicharry/Starrett methodology - detailed enough for users to actually do the exercise.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    ChevronUp,
    Play,
    ExternalLink,
    Clock,
    BookOpen,
} from 'lucide-react';
import { DurabilityExercise } from '@/domain/plan/types';

interface ExerciseCardProps {
    exercise: DurabilityExercise;
    index?: number;
    showVideo?: boolean;
}

export function ExerciseCard({ exercise, index, showVideo = true }: ExerciseCardProps) {
    const [expanded, setExpanded] = useState(false);
    const hasInstructions = exercise.instructions && exercise.instructions.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: (index || 0) * 0.05 }}
            className="v2-card overflow-hidden"
        >
            {/* Main Exercise Header */}
            <button
                onClick={() => hasInstructions && setExpanded(!expanded)}
                className={`w-full p-4 flex items-start gap-4 text-left ${hasInstructions ? 'hover:bg-[var(--bg-elevated)] cursor-pointer' : ''
                    } transition-colors`}
            >
                {/* Step Number */}
                {index !== undefined && (
                    <div
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-muted))',
                            color: 'white',
                        }}
                    >
                        {index + 1}
                    </div>
                )}

                {/* Exercise Info */}
                <div className="flex-1 min-w-0">
                    <h4 className="v2-heading-sm mb-1">{exercise.name}</h4>

                    {/* Dosage */}
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={14} className="text-[var(--color-accent)]" />
                        <span className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
                            {exercise.dosage}
                        </span>
                    </div>

                    {/* Cues (always visible) */}
                    <div className="flex flex-wrap gap-1.5">
                        {exercise.cues.map((cue, i) => (
                            <span
                                key={i}
                                className="px-2 py-0.5 rounded-full text-xs"
                                style={{
                                    background: 'var(--v2-gradient-glow)',
                                    color: 'var(--text-muted)',
                                }}
                            >
                                {cue}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Expand/Collapse */}
                {hasInstructions && (
                    <div className="flex-shrink-0 text-[var(--text-subtle)]">
                        {expanded ? (
                            <ChevronUp size={20} />
                        ) : (
                            <ChevronDown size={20} />
                        )}
                    </div>
                )}
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
                {expanded && hasInstructions && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 border-t border-[var(--border-base)]">
                            {/* Step-by-Step Instructions */}
                            <div className="mt-4 mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <BookOpen size={14} className="text-[var(--v2-durability)]" />
                                    <span
                                        className="text-xs uppercase tracking-wide font-medium"
                                        style={{ color: 'var(--text-subtle)' }}
                                    >
                                        How to Perform
                                    </span>
                                </div>
                                <ol className="space-y-2">
                                    {exercise.instructions?.map((step, i) => (
                                        <li
                                            key={i}
                                            className="text-sm leading-relaxed pl-4"
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Video Link */}
                            {showVideo && exercise.videoUrl && (
                                <a
                                    href={exercise.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.02]"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                    }}
                                >
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{ background: 'rgba(239, 68, 68, 0.15)' }}
                                    >
                                        <Play size={18} className="text-red-500" fill="currentColor" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm font-medium" style={{ color: 'var(--text-base)' }}>
                                            Watch Video Demo
                                        </span>
                                        <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                                            Opens in YouTube
                                        </p>
                                    </div>
                                    <ExternalLink size={14} className="text-[var(--text-subtle)]" />
                                </a>
                            )}

                            {/* Source Attribution */}
                            {exercise.source && (
                                <p
                                    className="text-xs text-center mt-3 italic"
                                    style={{ color: 'var(--text-subtle)' }}
                                >
                                    Source: {exercise.source}
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
