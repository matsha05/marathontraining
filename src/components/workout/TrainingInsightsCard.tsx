"use client";

import { TrainingInsights, getFeelEmoji } from '@/domain/insights';

/**
 * Training Insights Card
 * 
 * V2 Design System - Displays meaningful, gamified metrics
 */

interface TrainingInsightsCardProps {
    insights: TrainingInsights;
}

export function TrainingInsightsCard({ insights }: TrainingInsightsCardProps) {
    return (
        <div className="space-y-4">
            {/* Primary Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* Streak */}
                <div className="v2-card p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🔥</span>
                        <span className="v2-label">Streak</span>
                    </div>
                    <p className="text-lg font-mono" style={{ color: 'var(--v2-accent)' }}>{insights.currentStreak}</p>
                    <p className="text-[10px]" style={{ color: 'var(--v2-text-muted)' }}>
                        Best: {insights.longestStreak} days
                    </p>
                </div>

                {/* Completion Rate */}
                <div className="v2-card p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">📊</span>
                        <span className="v2-label">Completed</span>
                    </div>
                    <p className="text-lg font-mono" style={{ color: 'var(--v2-accent)' }}>{insights.completionRate30Days}%</p>
                    <p className="text-[10px]" style={{ color: 'var(--v2-text-muted)' }}>
                        Last 30 days
                    </p>
                </div>

                {/* Average Feel */}
                <div className="v2-card p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getFeelEmoji(Math.round(insights.averageFeel30Days))}</span>
                        <span className="v2-label">Avg Feel</span>
                    </div>
                    <p className="text-lg font-mono" style={{ color: 'var(--v2-accent)' }}>{insights.averageFeel30Days}</p>
                    <p className="text-[10px]" style={{ color: 'var(--v2-text-muted)' }}>
                        {insights.feelTrend === 'improving' ? '↑ Improving' :
                            insights.feelTrend === 'declining' ? '↓ Declining' : '→ Stable'}
                    </p>
                </div>

                {/* Missed Workouts */}
                <div className="v2-card p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">📅</span>
                        <span className="v2-label">Missed</span>
                    </div>
                    <p className="text-lg font-mono" style={{ color: 'var(--v2-accent)' }}>{insights.missedWorkouts30Days}</p>
                    <p className="text-[10px]" style={{ color: 'var(--v2-text-muted)' }}>
                        This month
                    </p>
                </div>
            </div>

            {/* Effort Calibration (Seiler insight) */}
            <div className="v2-card p-4">
                <p className="v2-label mb-3">Effort Calibration</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm mb-1" style={{ color: 'var(--v2-text-muted)' }}>Easy days</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-mono" style={{ color: 'var(--v2-accent)' }}>{insights.easyDayAverageFeel}</span>
                            <span className="text-sm" style={{ color: 'var(--v2-text-muted)' }}>/ 5</span>
                            {insights.easyDayAverageFeel < 2.5 && (
                                <span
                                    className="v2-badge"
                                    style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}
                                >
                                    Too hard
                                </span>
                            )}
                        </div>
                        <p className="text-[10px]" style={{ color: 'var(--v2-text-muted)' }}>
                            Target: ~3 (Right)
                        </p>
                    </div>

                    <div>
                        <p className="text-sm mb-1" style={{ color: 'var(--v2-text-muted)' }}>Hard days</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-mono" style={{ color: 'var(--v2-accent)' }}>{insights.hardDayAverageFeel}</span>
                            <span className="text-sm" style={{ color: 'var(--v2-text-muted)' }}>/ 5</span>
                        </div>
                        <p className="text-[10px]" style={{ color: 'var(--v2-text-muted)' }}>
                            Target: 2-3 (Tough/Right)
                        </p>
                    </div>
                </div>

                <p
                    className="text-[10px] mt-3 pt-3"
                    style={{ color: 'var(--v2-text-muted)', borderTop: '1px solid var(--v2-border)' }}
                >
                    💡 Based on Seiler's 80/20 principle: easy should feel easy
                </p>
            </div>

            {/* Red Flags */}
            {insights.redFlags.length > 0 && (
                <div className="space-y-2">
                    {insights.redFlags.map((flag, i) => (
                        <div
                            key={i}
                            className="p-4 rounded-xl border-l-4"
                            style={{
                                background: flag.severity === 'alert' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                borderLeftColor: flag.severity === 'alert' ? '#ef4444' : '#f59e0b'
                            }}
                        >
                            <p className="text-sm font-medium" style={{ color: 'var(--v2-text-secondary)' }}>{flag.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Mini Streak Display (for header/dashboard)
 */
export function StreakBadge({ streak }: { streak: number }) {
    if (streak === 0) return null;

    return (
        <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'var(--v2-accent-subtle)', color: 'var(--v2-accent)' }}
        >
            <span>🔥</span>
            <span className="text-[10px] font-bold">{streak}</span>
        </div>
    );
}

/**
 * Feel Trend Arrow
 */
export function FeelTrendIndicator({ trend }: { trend: TrainingInsights['feelTrend'] }) {
    const config = {
        improving: { arrow: '↑', color: 'var(--v2-accent)', label: 'Improving' },
        stable: { arrow: '→', color: 'var(--v2-text-muted)', label: 'Stable' },
        declining: { arrow: '↓', color: '#f59e0b', label: 'Declining' },
    };

    const { arrow, color, label } = config[trend];

    return (
        <div className="flex items-center gap-1" style={{ color }}>
            <span className="font-bold">{arrow}</span>
            <span className="text-[10px]">{label}</span>
        </div>
    );
}
