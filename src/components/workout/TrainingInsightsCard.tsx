"use client";

import { TrainingInsights, getFeelEmoji } from '@/domain/insights';

/**
 * Training Insights Card
 * 
 * Displays meaningful, gamified metrics that coaches would care about:
 * - Current streak (Hansons: consistency)
 * - Completion rate (shows up matters)
 * - Average feel (early warning for overtraining)
 * - Red flags
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
                <div className="card p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🔥</span>
                        <span className="text-label">Streak</span>
                    </div>
                    <p className="text-heading-lg text-data">{insights.currentStreak}</p>
                    <p className="text-caption text-[var(--text-muted)]">
                        Best: {insights.longestStreak} days
                    </p>
                </div>

                {/* Completion Rate */}
                <div className="card p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">📊</span>
                        <span className="text-label">Completed</span>
                    </div>
                    <p className="text-heading-lg text-data">{insights.completionRate30Days}%</p>
                    <p className="text-caption text-[var(--text-muted)]">
                        Last 30 days
                    </p>
                </div>

                {/* Average Feel */}
                <div className="card p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getFeelEmoji(Math.round(insights.averageFeel30Days))}</span>
                        <span className="text-label">Avg Feel</span>
                    </div>
                    <p className="text-heading-lg text-data">{insights.averageFeel30Days}</p>
                    <p className="text-caption text-[var(--text-muted)]">
                        {insights.feelTrend === 'improving' ? '↑ Improving' :
                            insights.feelTrend === 'declining' ? '↓ Declining' : '→ Stable'}
                    </p>
                </div>

                {/* Missed Workouts */}
                <div className="card p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">📅</span>
                        <span className="text-label">Missed</span>
                    </div>
                    <p className="text-heading-lg text-data">{insights.missedWorkouts30Days}</p>
                    <p className="text-caption text-[var(--text-muted)]">
                        This month
                    </p>
                </div>
            </div>

            {/* Effort Calibration (Seiler insight) */}
            <div className="card p-4">
                <p className="text-label mb-3">Effort Calibration</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-body-sm text-[var(--text-muted)] mb-1">Easy days</p>
                        <div className="flex items-center gap-2">
                            <span className="text-heading-md text-data">{insights.easyDayAverageFeel}</span>
                            <span className="text-body-sm text-[var(--text-muted)]">/ 5</span>
                            {insights.easyDayAverageFeel < 2.5 && (
                                <span className="badge badge-warning">
                                    Too hard
                                </span>
                            )}
                        </div>
                        <p className="text-caption text-[var(--text-muted)]">
                            Target: ~3 (Right)
                        </p>
                    </div>

                    <div>
                        <p className="text-body-sm text-[var(--text-muted)] mb-1">Hard days</p>
                        <div className="flex items-center gap-2">
                            <span className="text-heading-md text-data">{insights.hardDayAverageFeel}</span>
                            <span className="text-body-sm text-[var(--text-muted)]">/ 5</span>
                        </div>
                        <p className="text-caption text-[var(--text-muted)]">
                            Target: 2-3 (Tough/Right)
                        </p>
                    </div>
                </div>

                <p className="text-caption text-[var(--text-muted)] mt-3 pt-3 border-t border-[var(--border-base)]">
                    💡 Based on Seiler's 80/20 principle: easy should feel easy
                </p>
            </div>

            {/* Red Flags */}
            {insights.redFlags.length > 0 && (
                <div className="space-y-2">
                    {insights.redFlags.map((flag, i) => (
                        <div
                            key={i}
                            className={`p-4 rounded-xl border-l-4 ${flag.severity === 'alert'
                                ? 'bg-[var(--color-error)]/10 border-[var(--color-error)]'
                                : 'bg-[var(--color-warning)]/10 border-[var(--color-warning)]'
                                }`}
                        >
                            <p className="text-body-sm font-medium">{flag.message}</p>
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
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-running)]/15 text-[var(--color-running)]">
            <span>🔥</span>
            <span className="text-caption font-bold">{streak}</span>
        </div>
    );
}

/**
 * Feel Trend Arrow
 */
export function FeelTrendIndicator({ trend }: { trend: TrainingInsights['feelTrend'] }) {
    const config = {
        improving: { arrow: '↑', color: 'var(--color-running)', label: 'Improving' },
        stable: { arrow: '→', color: 'var(--text-muted)', label: 'Stable' },
        declining: { arrow: '↓', color: 'var(--color-warning)', label: 'Declining' },
    };

    const { arrow, color, label } = config[trend];

    return (
        <div className="flex items-center gap-1" style={{ color }}>
            <span className="font-bold">{arrow}</span>
            <span className="text-caption">{label}</span>
        </div>
    );
}
