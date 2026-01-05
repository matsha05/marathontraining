"use client";

/**
 * Training Insights Card
 *
 * V2 Design System - Displays coach-rooted insights on the dashboard
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
            <div className={`v2-card p-6 ${className}`}>
                <h3 className="v2-label mb-4" style={{ color: 'var(--v2-text-muted)' }}>Training Insights</h3>
                <p className="text-sm" style={{ color: 'var(--v2-text-subtle)' }}>
                    Complete more workouts to unlock insights.
                </p>
            </div>
        );
    }

    const hasRedFlags = insights.redFlags.length > 0;

    return (
        <div className={`v2-card p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="v2-label" style={{ color: 'var(--v2-text-muted)' }}>Training Insights</h3>
                {insights.currentStreak > 0 && (
                    <span className="v2-badge" style={{ background: 'var(--v2-accent-subtle)', color: 'var(--v2-accent)' }}>
                        🔥 {insights.currentStreak} day streak
                    </span>
                )}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                    <p className="text-2xl font-mono" style={{ color: 'var(--v2-accent)' }}>{insights.completionRate30Days}%</p>
                    <p className="text-[10px]" style={{ color: 'var(--v2-text-subtle)' }}>Completion</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-mono" style={{ color: 'var(--v2-accent)' }}>
                        {getFeelEmoji(Math.round(insights.averageFeel30Days))}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--v2-text-subtle)' }}>Avg Feel</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-mono" style={{ color: 'var(--v2-accent)' }}>{insights.longestStreak}</p>
                    <p className="text-[10px]" style={{ color: 'var(--v2-text-subtle)' }}>Best Streak</p>
                </div>
            </div>

            {/* Effort Calibration (Seiler) */}
            <div className="flex items-center gap-4 p-3 rounded-lg mb-4" style={{ background: 'var(--v2-bg-elevated)' }}>
                <div className="flex-1">
                    <p className="text-[10px]" style={{ color: 'var(--v2-text-subtle)' }}>Easy days feel</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--v2-text-secondary)' }}>
                        {getFeelEmoji(Math.round(insights.easyDayAverageFeel))} {insights.easyDayAverageFeel.toFixed(1)}/5
                    </p>
                </div>
                <div className="w-px h-8" style={{ background: 'var(--v2-border)' }} />
                <div className="flex-1">
                    <p className="text-[10px]" style={{ color: 'var(--v2-text-subtle)' }}>Hard days feel</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--v2-text-secondary)' }}>
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
                            className="flex items-start gap-3 p-3 rounded-lg"
                            style={{
                                background: flag.severity === 'alert' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                border: `1px solid ${flag.severity === 'alert' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                            }}
                        >
                            <span className="text-lg">
                                {flag.severity === 'alert' ? '🚨' : '⚠️'}
                            </span>
                            <p className="text-sm" style={{ color: 'var(--v2-text-secondary)' }}>{flag.message}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Feel Trend */}
            {!hasRedFlags && (
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--v2-text-muted)' }}>
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
