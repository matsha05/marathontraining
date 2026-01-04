"use client";

/**
 * Training Insights Card
 *
 * Displays coach-rooted insights on the dashboard:
 * - Consistency metrics (Hansons)
 * - Effort calibration warnings (Seiler)
 * - Red flags that need attention
 */

import { useMemo } from 'react';
import {
    calculateInsights,
    WorkoutLog,
    TrainingInsights,
    getFeelEmoji,
} from '@/domain/insights';

interface InsightsCardProps {
    workoutLogs: WorkoutLog[];
    className?: string;
}

export function InsightsCard({ workoutLogs, className = '' }: InsightsCardProps) {
    const insights = useMemo(() => {
        if (!workoutLogs.length) return null;
        return calculateInsights(workoutLogs);
    }, [workoutLogs]);

    if (!insights) {
        return (
            <div className={`card p-6 ${className}`}>
                <h3 className="text-label mb-4 text-[var(--text-muted)]">Training Insights</h3>
                <p className="text-body-sm text-[var(--text-subtle)]">
                    Complete more workouts to unlock insights.
                </p>
            </div>
        );
    }

    const hasRedFlags = insights.redFlags.length > 0;

    return (
        <div className={`card p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-label text-[var(--text-muted)]">Training Insights</h3>
                {insights.currentStreak > 0 && (
                    <span className="badge badge-accent">
                        🔥 {insights.currentStreak} day streak
                    </span>
                )}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                    <p className="text-data text-2xl">{insights.completionRate30Days}%</p>
                    <p className="text-caption text-[var(--text-subtle)]">Completion</p>
                </div>
                <div className="text-center">
                    <p className="text-data text-2xl">
                        {getFeelEmoji(Math.round(insights.averageFeel30Days))}
                    </p>
                    <p className="text-caption text-[var(--text-subtle)]">Avg Feel</p>
                </div>
                <div className="text-center">
                    <p className="text-data text-2xl">{insights.longestStreak}</p>
                    <p className="text-caption text-[var(--text-subtle)]">Best Streak</p>
                </div>
            </div>

            {/* Effort Calibration (Seiler) */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-[var(--bg-muted)] mb-4">
                <div className="flex-1">
                    <p className="text-caption text-[var(--text-subtle)]">Easy days feel</p>
                    <p className="text-body-sm font-medium">
                        {getFeelEmoji(Math.round(insights.easyDayAverageFeel))} {insights.easyDayAverageFeel.toFixed(1)}/5
                    </p>
                </div>
                <div className="w-px h-8 bg-[var(--border-subtle)]" />
                <div className="flex-1">
                    <p className="text-caption text-[var(--text-subtle)]">Hard days feel</p>
                    <p className="text-body-sm font-medium">
                        {getFeelEmoji(Math.round(insights.hardDayAverageFeel))} {insights.hardDayAverageFeel.toFixed(1)}/5
                    </p>
                </div>
            </div>

            {/* Red Flags */}
            {hasRedFlags && (
                <div className="space-y-2">
                    {insights.redFlags.map((flag, i) => (
                        <div
                            key={i}
                            className={`flex items-start gap-3 p-3 rounded-lg ${flag.severity === 'alert'
                                    ? 'bg-red-500/10 border border-red-500/20'
                                    : 'bg-yellow-500/10 border border-yellow-500/20'
                                }`}
                        >
                            <span className="text-lg">
                                {flag.severity === 'alert' ? '🚨' : '⚠️'}
                            </span>
                            <p className="text-body-sm">{flag.message}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Feel Trend */}
            {!hasRedFlags && (
                <div className="flex items-center gap-2 text-body-sm text-[var(--text-muted)]">
                    <span>
                        {insights.feelTrend === 'improving' && '📈'}
                        {insights.feelTrend === 'stable' && '➡️'}
                        {insights.feelTrend === 'declining' && '📉'}
                    </span>
                    <span>
                        Feel trend: {insights.feelTrend}
                        {insights.feelTrend === 'improving' && ' — nice work!'}
                        {insights.feelTrend === 'declining' && ' — watch your recovery'}
                    </span>
                </div>
            )}
        </div>
    );
}

export default InsightsCard;
