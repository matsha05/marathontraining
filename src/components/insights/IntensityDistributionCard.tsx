"use client";

/**
 * Intensity Distribution Card
 * 
 * Premium visualization of weekly 80/20 intensity distribution.
 * Based on Seiler/Fitzgerald polarized training principles.
 * 
 * This is EDUCATIONAL ONLY — shows users their intensity breakdown
 * without modifying the plan itself. (Guided Mode)
 * 
 * Design principles:
 * - Glanceable: User understands their week in 2 seconds
 * - Premium: Smooth animations, precise typography
 * - Coach-rooted: Messages from Seiler/Fitzgerald research
 */

import { useMemo, useEffect, useState } from 'react';
import {
    calculateIntensityDistribution,
    WeeklyIntensityDistribution,
    WorkoutForIntensity,
    getVerdictEmoji,
    formatDuration,
    IntensityZone,
} from '@/domain/insights';

// ============================================================================
// TYPES
// ============================================================================

interface IntensityDistributionCardProps {
    workouts: WorkoutForIntensity[];
    className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function IntensityDistributionCard({
    workouts,
    className = '',
}: IntensityDistributionCardProps) {
    const [hasAnimated, setHasAnimated] = useState(false);

    const distribution = useMemo(() => {
        return calculateIntensityDistribution(workouts);
    }, [workouts]);

    // Trigger animation on mount
    useEffect(() => {
        const timer = setTimeout(() => setHasAnimated(true), 50);
        return () => clearTimeout(timer);
    }, []);

    // Empty state
    if (!distribution) {
        return (
            <div className={`card p-6 ${className}`}>
                <div className="flex items-center gap-2 mb-4">
                    <IntensityIcon />
                    <h3 className="text-label">YOUR WEEK: 80/20 CHECK</h3>
                </div>
                <p className="text-body-sm" style={{ color: 'var(--text-muted)' }}>
                    Complete a few workouts to see your intensity distribution.
                </p>
                <p className="text-caption mt-2" style={{ color: 'var(--text-subtle)' }}>
                    Based on Seiler's polarized training research.
                </p>
            </div>
        );
    }

    return (
        <div className={`card p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <IntensityIcon />
                    <h3 className="text-label">YOUR WEEK: 80/20 CHECK</h3>
                </div>
                <span
                    className="text-caption font-mono"
                    style={{ color: 'var(--text-subtle)' }}
                >
                    {formatDuration(distribution.totalMinutes)} total
                </span>
            </div>

            {/* Zone Bar Chart */}
            <div className="mb-5">
                <ZoneBarChart
                    zones={distribution.zones}
                    animated={hasAnimated}
                />
            </div>

            {/* Zone Legend */}
            <div className="flex justify-between mb-6">
                {distribution.zones.map((zone) => (
                    <ZoneLegendItem key={zone.zone} zone={zone} />
                ))}
            </div>

            {/* Insufficient Data Warning */}
            {distribution.insufficientData && (
                <div
                    className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg text-caption"
                    style={{
                        background: 'color-mix(in srgb, var(--text-subtle) 10%, transparent)',
                        color: 'var(--text-muted)',
                    }}
                >
                    <span>ℹ️</span>
                    <span>Based on {distribution.workoutCount} workout{distribution.workoutCount !== 1 ? 's' : ''} — complete more for reliable trends.</span>
                </div>
            )}

            {/* Verdict */}
            <VerdictDisplay distribution={distribution} />
        </div>
    );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function IntensityIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ color: 'var(--color-coach-seiler)' }}
        >
            <path
                d="M2 12L5 9L8 11L14 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

interface ZoneBarChartProps {
    zones: IntensityZone[];
    animated: boolean;
}

function ZoneBarChart({ zones, animated }: ZoneBarChartProps) {
    // Filter out zero-percentage zones for cleaner visualization
    const visibleZones = zones.filter(z => z.percentage > 0);

    return (
        <div
            className="flex h-3 rounded-full overflow-hidden"
            style={{ background: 'var(--bg-muted)', gap: '2px' }}
        >
            {visibleZones.map((zone, index) => (
                <div
                    key={zone.zone}
                    className="h-full transition-all duration-700 ease-out"
                    style={{
                        background: zone.color,
                        width: animated ? `${zone.percentage}%` : '0%',
                        borderRadius:
                            index === 0 && index === visibleZones.length - 1
                                ? '6px'
                                : index === 0
                                    ? '6px 0 0 6px'
                                    : index === visibleZones.length - 1
                                        ? '0 6px 6px 0'
                                        : '0',
                        transitionDelay: `${index * 100}ms`,
                    }}
                />
            ))}
        </div>
    );
}

interface ZoneLegendItemProps {
    zone: IntensityZone;
}

function ZoneLegendItem({ zone }: ZoneLegendItemProps) {
    return (
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 mb-1">
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: zone.color }}
                />
                <span
                    className="font-mono text-lg font-semibold"
                    style={{ color: 'var(--text-base)', letterSpacing: '-0.02em' }}
                >
                    {zone.percentage}%
                </span>
            </div>
            <span
                className="text-caption text-center"
                style={{ color: 'var(--text-subtle)', fontSize: '0.6875rem' }}
            >
                {zone.zone === 'easy' && 'Easy'}
                {zone.zone === 'moderate' && 'Moderate'}
                {zone.zone === 'hard' && 'Hard'}
            </span>
        </div>
    );
}

interface VerdictDisplayProps {
    distribution: WeeklyIntensityDistribution;
}

function VerdictDisplay({ distribution }: VerdictDisplayProps) {
    const verdictColors: Record<string, string> = {
        excellent: 'var(--color-accent)',
        good: 'var(--color-accent)',
        needs_attention: 'var(--color-warning)',
    };

    const bgColors: Record<string, string> = {
        excellent: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
        good: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
        needs_attention: 'color-mix(in srgb, var(--color-warning) 10%, transparent)',
    };

    const borderColors: Record<string, string> = {
        excellent: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
        good: 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
        needs_attention: 'color-mix(in srgb, var(--color-warning) 20%, transparent)',
    };

    return (
        <div
            className="p-4 rounded-xl"
            style={{
                background: bgColors[distribution.verdict],
                border: `1px solid ${borderColors[distribution.verdict]}`,
            }}
        >
            <div className="flex items-start gap-3">
                <span
                    className="text-lg"
                    style={{ color: verdictColors[distribution.verdict] }}
                >
                    {getVerdictEmoji(distribution.verdict)}
                </span>
                <div className="flex-1">
                    <p
                        className="text-body-sm font-medium"
                        style={{ color: 'var(--text-base)' }}
                    >
                        {distribution.message}
                    </p>
                    <p
                        className="text-caption mt-1"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {distribution.subtext}
                    </p>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default IntensityDistributionCard;
