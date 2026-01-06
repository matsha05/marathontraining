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
                    <span className="v2-badge flex items-center gap-1" style={{ background: 'var(--v2-accent-subtle)', color: 'var(--v2-accent)' }}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.451-.404l-2.068 1.653a1 1 0 00-.348.53l-.645 2.644-2.2-.637a1 1 0 00-.95.227l-2.3 2.3a1 1 0 00.387 1.645l2.556.853-.855 2.556a1 1 0 00.387 1.645l1.817.606a1 1 0 001.034-.204l2.2-2.2-.637-2.2 2.644-.647a1 1 0 00.53-.348l1.653-2.068a1 1 0 00-.404-1.451l-1.923-.962.962-1.923z" clipRule="evenodd" />
                        </svg>
                        {insights.currentStreak} day streak
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
                        {Math.round(insights.averageFeel30Days)}/5
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
                        {insights.easyDayAverageFeel.toFixed(1)}/5
                    </p>
                </div>
                <div className="w-px h-8" style={{ background: 'var(--v2-border)' }} />
                <div className="flex-1">
                    <p className="text-[10px]" style={{ color: 'var(--v2-text-subtle)' }}>Hard days feel</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--v2-text-secondary)' }}>
                        {insights.hardDayAverageFeel.toFixed(1)}/5
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
                            <svg className="w-5 h-5 shrink-0" style={{ color: flag.severity === 'alert' ? '#ef4444' : '#f59e0b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-sm" style={{ color: 'var(--v2-text-secondary)' }}>{flag.message}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Feel Trend */}
            {!hasRedFlags && (
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--v2-text-muted)' }}>
                    <svg className="w-4 h-4" style={{ color: insights.feelTrend === 'improving' ? 'var(--v2-accent)' : insights.feelTrend === 'declining' ? '#f59e0b' : 'var(--v2-text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {insights.feelTrend === 'improving' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />}
                        {insights.feelTrend === 'stable' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />}
                        {insights.feelTrend === 'declining' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />}
                    </svg>
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
