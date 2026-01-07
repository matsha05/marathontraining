'use client';

import { motion } from 'framer-motion';

/**
 * MileageGauge - Weekly mileage progress bar
 * 
 * Shows completed vs planned mileage with gradient fill
 */

interface MileageGaugeProps {
    completed: number;
    planned: number;
    /** Optional label override */
    label?: string;
}

export function MileageGauge({ completed, planned, label }: MileageGaugeProps) {
    const percentage = planned > 0 ? Math.min(100, Math.round((completed / planned) * 100)) : 0;

    // Color based on progress
    const getProgressColor = () => {
        if (percentage >= 100) return 'var(--color-accent)';
        if (percentage >= 70) return 'var(--color-accent)';
        if (percentage >= 40) return 'var(--color-warning)';
        return 'var(--text-muted)';
    };

    return (
        <div className="flex items-center gap-3">
            {label && (
                <span className="text-caption shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {label}
                </span>
            )}

            <div className="flex-1 flex items-center gap-3">
                {/* Progress bar */}
                <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: 'var(--bg-muted)' }}
                >
                    <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={{
                            background: percentage >= 100
                                ? 'linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-light) 100%)'
                                : getProgressColor(),
                        }}
                    />
                </div>

                {/* Numeric display */}
                <span
                    className="text-data text-body-sm shrink-0"
                    style={{ color: 'var(--text-base)', minWidth: '70px', textAlign: 'right' }}
                >
                    {Math.round(completed)}<span style={{ color: 'var(--text-muted)' }}>/</span>{Math.round(planned)} mi
                </span>
            </div>
        </div>
    );
}
