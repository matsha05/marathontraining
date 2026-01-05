"use client";

/**
 * DurabilityStatusCard
 * 
 * Dashboard component showing durability assessment status.
 * Implements Dicharry/Starrett methodology:
 * - Quick Check: Before runs (especially quality sessions)
 * - Full Assessment: Weekly (typically Sunday/Monday)
 * 
 * Shows status and prompts action at appropriate times.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Zap,
    ClipboardList,
    Check,
    AlertCircle,
    ArrowRight,
} from 'lucide-react';

interface DurabilityStatusCardProps {
    /** Last quick check date (ISO string) */
    lastQuickCheck?: string | null;
    /** Last full assessment date (ISO string) */
    lastFullAssessment?: string | null;
    /** Number of failed assessments from last full check */
    failedCount?: number;
    /** Is today a quality session day? (tempo, intervals, long run) */
    isQualityDay?: boolean;
    /** Compact mode for inline display */
    compact?: boolean;
}

export function DurabilityStatusCard({
    lastQuickCheck,
    lastFullAssessment,
    failedCount = 0,
    isQualityDay = false,
    compact = false,
}: DurabilityStatusCardProps) {
    const today = new Date().toDateString();
    const quickCheckDoneToday = lastQuickCheck && new Date(lastQuickCheck).toDateString() === today;

    const daysSinceFullAssessment = lastFullAssessment
        ? Math.floor((Date.now() - new Date(lastFullAssessment).getTime()) / (1000 * 60 * 60 * 24))
        : null;

    const fullAssessmentDue = daysSinceFullAssessment === null || daysSinceFullAssessment >= 7;

    // Starrett: "Can I hit the positions today? Do I have any hotspots?"
    // Show Quick Check prompt on quality days when not done today
    const showQuickCheckPrompt = isQualityDay && !quickCheckDoneToday;

    if (compact) {
        // Inline nudge for pre-workout display
        if (!showQuickCheckPrompt) return null;

        return (
            <Link
                href="/durability?mode=quick"
                className="v2-card p-4 flex items-center gap-3 hover:border-[var(--v2-accent)] transition-colors"
            >
                <Zap size={20} className="text-[var(--v2-accent)]" />
                <div className="flex-1">
                    <p className="text-sm" style={{ color: 'var(--v2-text-secondary)' }}>
                        Quick readiness check recommended
                    </p>
                    <p className="text-xs" style={{ color: 'var(--v2-text-subtle)' }}>
                        1-2 min before your quality session
                    </p>
                </div>
                <ArrowRight size={16} className="text-[var(--v2-text-subtle)]" />
            </Link>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="v2-card p-5"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ClipboardList size={18} className="text-[var(--v2-durability)]" />
                    <h3 className="v2-heading-sm">Durability</h3>
                </div>
                {failedCount > 0 && (
                    <span className="v2-badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                        {failedCount} area{failedCount > 1 ? 's' : ''} to work on
                    </span>
                )}
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Quick Check Status */}
                <div className="p-3 rounded-lg" style={{ background: 'var(--v2-bg-elevated)' }}>
                    <div className="flex items-center gap-2 mb-1">
                        <Zap size={14} className="text-[var(--v2-accent)]" />
                        <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--v2-text-subtle)' }}>
                            Quick Check
                        </span>
                    </div>
                    {quickCheckDoneToday ? (
                        <div className="flex items-center gap-1">
                            <Check size={14} className="text-[var(--v2-accent)]" />
                            <span className="text-sm" style={{ color: 'var(--v2-text-secondary)' }}>
                                Today
                            </span>
                        </div>
                    ) : (
                        <span className="text-sm" style={{ color: 'var(--v2-text-muted)' }}>
                            {lastQuickCheck ? formatRelativeDate(lastQuickCheck) : 'Not done yet'}
                        </span>
                    )}
                </div>

                {/* Full Assessment Status */}
                <div className="p-3 rounded-lg" style={{ background: 'var(--v2-bg-elevated)' }}>
                    <div className="flex items-center gap-2 mb-1">
                        <ClipboardList size={14} className="text-[var(--v2-durability)]" />
                        <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--v2-text-subtle)' }}>
                            Full Assessment
                        </span>
                    </div>
                    {fullAssessmentDue ? (
                        <div className="flex items-center gap-1">
                            <AlertCircle size={14} style={{ color: '#f59e0b' }} />
                            <span className="text-sm" style={{ color: '#f59e0b' }}>
                                {daysSinceFullAssessment !== null ? `${daysSinceFullAssessment}d ago` : 'Not done yet'}
                            </span>
                        </div>
                    ) : (
                        <span className="text-sm" style={{ color: 'var(--v2-text-secondary)' }}>
                            {daysSinceFullAssessment}d ago
                        </span>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Link
                    href="/durability?mode=quick"
                    className={`v2-btn flex-1 ${showQuickCheckPrompt ? 'v2-btn-primary' : 'v2-btn-secondary'}`}
                >
                    <Zap size={16} className="mr-2" />
                    Quick Check
                </Link>
                <Link
                    href="/durability?mode=full"
                    className={`v2-btn flex-1 ${fullAssessmentDue ? 'v2-btn-primary' : 'v2-btn-secondary'}`}
                >
                    <ClipboardList size={16} className="mr-2" />
                    Full Assessment
                </Link>
            </div>

            {/* Dicharry Quote */}
            {showQuickCheckPrompt && (
                <p className="text-xs text-center mt-4" style={{ color: 'var(--v2-text-subtle)' }}>
                    "Can I hit the positions today? Do I need maintenance before I go smash myself?"
                    <span className="block mt-1" style={{ color: 'var(--v2-text-ghost)' }}>— Starrett</span>
                </p>
            )}
        </motion.div>
    );
}

function formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
}
