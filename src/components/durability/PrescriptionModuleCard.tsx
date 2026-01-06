"use client";

/**
 * PrescriptionModuleCard
 * 
 * World-class UI for displaying durability prescription modules.
 * Features premium animations, progressive disclosure, and video integration.
 * 
 * Design principles:
 * - Progressive disclosure: summary → expanded details
 * - Scannable: clear hierarchy with visual anchors
 * - Actionable: each exercise has clear dosage and cues
 * - Premium feel: subtle gradients, smooth animations, glass effects
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    Clock,
    Play,
    ExternalLink,
    Calendar,
    CheckCircle2,
    Sparkles,
} from 'lucide-react';
import { DurabilityModule } from '@/domain/durability/modules';

interface PrescriptionModuleCardProps {
    module: DurabilityModule;
    index: number;
    isCompleted?: boolean;
    onComplete?: (id: string) => void;
}

// Map exercise IDs to video URLs where available
const EXERCISE_VIDEOS: Record<string, string> = {
    'toe_yoga': 'https://www.youtube.com/watch?v=QwJJL3k9Z3c',
    'short_foot': 'https://www.youtube.com/watch?v=QwJJL3k9Z3c',
    'couch_stretch': 'https://www.youtube.com/watch?v=JawPBvtf7Qs',
    'wall_ankle': 'https://www.youtube.com/watch?v=IikP_teeLkI',
    'dead_bug': 'https://www.youtube.com/watch?v=I5xbsA71v1A',
    'single_leg_bridge': 'https://www.youtube.com/watch?v=AVAXhy6pl7o',
    'single_leg_calf': 'https://www.youtube.com/watch?v=GcDX2R6BhWc',
    'calf_foam_roll': 'https://www.youtube.com/watch?v=6-rPEpnJvvU',
};

// Category colors for visual distinction
const CATEGORY_STYLES: Record<string, { gradient: string; color: string; bg: string }> = {
    'foot': { gradient: 'linear-gradient(135deg, #10b981, #059669)', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    'ankle': { gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    'hip': { gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    'core': { gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    'mobility': { gradient: 'linear-gradient(135deg, #ec4899, #be185d)', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
    'balance': { gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
};

const FREQUENCY_LABELS: Record<string, string> = {
    'daily': 'Every day',
    'every_other_day': 'Every other day',
    '3x_week': '3× per week',
};

export function PrescriptionModuleCard({
    module,
    index,
    isCompleted = false,
    onComplete
}: PrescriptionModuleCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const style = CATEGORY_STYLES[module.category] || CATEGORY_STYLES['mobility'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="relative overflow-hidden rounded-2xl"
            style={{
                background: 'var(--v2-bg-card)',
                border: `1px solid ${isCompleted ? 'rgba(74, 222, 128, 0.3)' : 'var(--border-base)'}`,
            }}
        >
            {/* Gradient accent line at top */}
            <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: style.gradient }}
            />

            {/* Main clickable header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-5 text-left transition-colors hover:bg-[var(--bg-elevated)]"
            >
                <div className="flex items-start gap-4">
                    {/* Module number with gradient background */}
                    <div
                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-lg"
                        style={{ background: style.gradient }}
                    >
                        {isCompleted ? <CheckCircle2 size={20} /> : index + 1}
                    </div>

                    {/* Module info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-full"
                                style={{ background: style.bg, color: style.color }}
                            >
                                {module.category}
                            </span>
                            <span
                                className="text-[10px] flex items-center gap-1"
                                style={{ color: 'var(--text-subtle)' }}
                            >
                                <Calendar size={10} />
                                {FREQUENCY_LABELS[module.frequency] || module.frequency}
                            </span>
                        </div>
                        <h3
                            className="text-lg font-medium mb-1"
                            style={{ color: 'var(--text-base)' }}
                        >
                            {module.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {module.durationMin} min
                            </span>
                            <span>
                                {module.exercises.length} exercise{module.exercises.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    {/* Expand indicator */}
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0"
                        style={{ color: 'var(--text-subtle)' }}
                    >
                        <ChevronDown size={20} />
                    </motion.div>
                </div>
            </button>

            {/* Expanded content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                    >
                        <div
                            className="px-5 pb-5 border-t"
                            style={{ borderColor: 'var(--border-base)' }}
                        >
                            {/* Exercise list */}
                            <div className="mt-4 space-y-3">
                                {module.exercises.map((exercise, exIndex) => {
                                    const videoUrl = EXERCISE_VIDEOS[exercise.id];

                                    return (
                                        <motion.div
                                            key={exercise.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: exIndex * 0.05 }}
                                            className="p-4 rounded-xl relative overflow-hidden"
                                            style={{ background: 'var(--bg-elevated)' }}
                                        >
                                            {/* Exercise number indicator */}
                                            <div
                                                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                                                style={{ background: style.gradient }}
                                            />

                                            <div className="flex items-start justify-between gap-4 pl-3">
                                                <div className="flex-1">
                                                    <h4
                                                        className="font-medium text-sm mb-2"
                                                        style={{ color: 'var(--text-base)' }}
                                                    >
                                                        {exercise.name}
                                                    </h4>

                                                    {/* Dosage pills */}
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        <span
                                                            className="text-xs px-2 py-1 rounded-md font-mono"
                                                            style={{
                                                                background: 'rgba(74, 222, 128, 0.1)',
                                                                color: '#4ade80'
                                                            }}
                                                        >
                                                            {exercise.sets}×{exercise.reps}
                                                        </span>
                                                        {exercise.holdSeconds && (
                                                            <span
                                                                className="text-xs px-2 py-1 rounded-md"
                                                                style={{
                                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                                    color: '#3b82f6'
                                                                }}
                                                            >
                                                                Hold {exercise.holdSeconds}s
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Notes */}
                                                    {exercise.notes && (
                                                        <p
                                                            className="text-xs italic"
                                                            style={{ color: 'var(--text-subtle)' }}
                                                        >
                                                            💡 {exercise.notes}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Video button */}
                                                {videoUrl && (
                                                    <a
                                                        href={videoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform hover:scale-105"
                                                        style={{
                                                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))',
                                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Play size={18} className="text-red-500" fill="currentColor" />
                                                    </a>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Source attribution */}
                            <div
                                className="mt-4 pt-4 flex items-center justify-between border-t"
                                style={{ borderColor: 'var(--border-base)' }}
                            >
                                <p
                                    className="text-xs italic"
                                    style={{ color: 'var(--text-subtle)' }}
                                >
                                    Source: {module.source}
                                </p>

                                {onComplete && (
                                    <button
                                        onClick={() => onComplete(module.id)}
                                        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                                        style={{
                                            background: isCompleted ? 'rgba(74, 222, 128, 0.15)' : 'var(--color-accent-subtle)',
                                            color: isCompleted ? '#4ade80' : 'var(--color-accent)',
                                        }}
                                    >
                                        {isCompleted ? '✓ Completed' : 'Mark Complete'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/**
 * PrescriptionSummaryHeader
 * 
 * Premium header for the prescription results section
 */
interface PrescriptionSummaryHeaderProps {
    moduleCount: number;
    totalMinutes: number;
    failCount: number;
}

export function PrescriptionSummaryHeader({
    moduleCount,
    totalMinutes,
    failCount
}: PrescriptionSummaryHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl p-6"
            style={{
                background: 'linear-gradient(135deg, var(--v2-bg-card), var(--bg-elevated))',
                border: '1px solid var(--color-accent)',
            }}
        >
            {/* Subtle glow effect */}
            <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl"
                style={{ background: 'var(--color-accent)', opacity: 0.1 }}
            />

            <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={18} className="text-[var(--color-accent)]" />
                    <p
                        className="text-xs uppercase tracking-widest font-medium"
                        style={{ color: 'var(--color-accent)' }}
                    >
                        Your Daily Micro-Dose
                    </p>
                </div>

                <h2
                    className="text-2xl font-light mb-4"
                    style={{ color: 'var(--text-base)' }}
                >
                    {failCount === 0
                        ? 'Outstanding Durability'
                        : `${moduleCount} Module${moduleCount > 1 ? 's' : ''} Prescribed`
                    }
                </h2>

                {failCount > 0 && (
                    <div className="flex items-center gap-6">
                        <div>
                            <p className="text-3xl font-mono font-light" style={{ color: 'var(--color-accent)' }}>
                                ~{totalMinutes}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                                minutes daily
                            </p>
                        </div>
                        <div className="h-12 w-px" style={{ background: 'var(--border-base)' }} />
                        <div>
                            <p className="text-3xl font-mono font-light" style={{ color: '#f59e0b' }}>
                                {failCount}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                                area{failCount > 1 ? 's' : ''} to address
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
