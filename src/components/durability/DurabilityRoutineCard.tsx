"use client";

/**
 * DurabilityRoutineCard
 * 
 * Displays a complete daily durability routine (8-12 min per Starrett/Dicharry).
 * Shows all modules in the routine with expandable exercise details.
 * 
 * Research mandate: 04-starrett-dicharry-durability.md
 * "Daily micro-dose template (8 to 12 minutes)"
 */

import { motion } from 'framer-motion';
import { Clock, Sparkles, Target, Zap } from 'lucide-react';
import { DailyDurabilityRoutine, DurabilityModule } from '@/domain/plan/types';
import { ExerciseCard } from './ExerciseCard';

interface DurabilityRoutineCardProps {
    routine: DailyDurabilityRoutine;
    onComplete?: () => void;
}

export function DurabilityRoutineCard({ routine, onComplete }: DurabilityRoutineCardProps) {
    // Get icon based on day type
    const getDayTypeIcon = () => {
        switch (routine.dayType) {
            case 'quality':
                return <Zap size={18} className="text-[var(--color-accent)]" />;
            case 'long':
                return <Target size={18} className="text-[var(--v3-durability)]" />;
            case 'easy':
                return <Sparkles size={18} className="text-emerald-500" />;
            case 'rest':
                return <Clock size={18} className="text-blue-400" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Header */}
            <div className="v3-card p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {getDayTypeIcon()}
                        <div>
                            <h2 className="v3-heading-md">{routine.name}</h2>
                            <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>
                                {routine.modules.length} exercise{routine.modules.length > 1 ? 's' : ''} · ~{routine.totalMinutes} min
                            </p>
                        </div>
                    </div>
                    <div
                        className="px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{
                            background: 'var(--v3-gradient-glow)',
                            color: 'var(--color-accent)',
                        }}
                    >
                        {routine.dayType === 'quality' || routine.dayType === 'long' ? 'Pre-Run' : 'Anytime'}
                    </div>
                </div>

                {/* Research Attribution */}
                <div
                    className="p-3 rounded-lg text-xs"
                    style={{
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-subtle)',
                    }}
                >
                    <strong style={{ color: 'var(--text-muted)' }}>Daily Micro-Dose Template</strong> —
                    Combining Dicharry's control work with Starrett's daily maintenance.
                    Small daily work matters: 10-15 minutes on these basics.
                </div>
            </div>

            {/* Modules */}
            <div className="space-y-6">
                {routine.modules.map((module, moduleIndex) => (
                    <ModuleSection key={module.id} module={module} index={moduleIndex} />
                ))}
            </div>

            {/* Complete Button */}
            {onComplete && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onComplete}
                    className="w-full mt-6 py-4 rounded-xl text-lg font-semibold transition-all"
                    style={{
                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-muted))',
                        color: 'white',
                    }}
                >
                    Complete Routine ✓
                </motion.button>
            )}
        </motion.div>
    );
}

interface ModuleSectionProps {
    module: DurabilityModule;
    index: number;
}

function ModuleSection({ module, index }: ModuleSectionProps) {
    // Module category styling
    const getCategoryStyle = () => {
        switch (module.category) {
            case 'mobility':
                return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
            case 'control':
                return { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
            case 'capacity':
                return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
            case 'tissue':
                return { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' };
            case 'integration':
                return { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' };
            default:
                return { color: 'var(--color-accent)', bg: 'var(--v3-gradient-glow)' };
        }
    };

    const style = getCategoryStyle();

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
        >
            {/* Module Header */}
            <div className="flex items-center gap-3 mb-3">
                <div
                    className="w-1 h-8 rounded-full"
                    style={{ background: style.color }}
                />
                <div>
                    <h3 className="v3-heading-sm">{module.name}</h3>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-subtle)' }}>
                        <span
                            className="px-2 py-0.5 rounded-full capitalize"
                            style={{ background: style.bg, color: style.color }}
                        >
                            {module.category}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {module.durationMinutes} min
                        </span>
                    </div>
                </div>
            </div>

            {/* Exercises */}
            <div className="space-y-3 pl-6">
                {module.exercises.map((exercise, exerciseIndex) => (
                    <ExerciseCard
                        key={exerciseIndex}
                        exercise={exercise}
                        index={exerciseIndex}
                        showVideo
                    />
                ))}
            </div>
        </motion.div>
    );
}
