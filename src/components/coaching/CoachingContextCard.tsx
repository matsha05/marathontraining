/**
 * THE LONG GAME - Coaching Context Card
 * 
 * Elite UX component that displays coaching explanations for workouts.
 * Answers: WHY this workout? HOW should it feel? Coach insights.
 */

'use client';

import { useState } from 'react';
import {
    getWorkoutContext,
    getPhaseContext,
    detectCoachFromSource,
    type CoachPhilosophy,
    type WorkoutContext,
    type PhaseContext,
} from '@/domain/coaching/context';
import type { WorkoutType, TrainingPhase } from '@/domain/plan/types';

// =============================================================================
// COACH BRANDING
// =============================================================================

const COACH_BRANDING: Record<CoachPhilosophy, {
    name: string;
    color: string;
    icon: string;
}> = {
    higdon: {
        name: 'Hal Higdon',
        color: '#4A90D9',
        icon: '📘',
    },
    hansons: {
        name: 'Hansons',
        color: '#E74C3C',
        icon: '🔥',
    },
    pfitzinger: {
        name: 'Pfitzinger',
        color: '#27AE60',
        icon: '🧬',
    },
    daniels: {
        name: 'Daniels',
        color: '#9B59B6',
        icon: '⚗️',
    },
};

// =============================================================================
// COACHING CONTEXT CARD
// =============================================================================

interface CoachingContextCardProps {
    /** The workout type to explain */
    workoutType: WorkoutType;
    /** Optional coach source string from workout data */
    coachSource?: string;
    /** Force a specific coach */
    coach?: CoachPhilosophy;
    /** Compact mode for inline display */
    compact?: boolean;
}

export function CoachingContextCard({
    workoutType,
    coachSource,
    coach,
    compact = false,
}: CoachingContextCardProps) {
    const [expanded, setExpanded] = useState(!compact);

    // Detect coach from source string or use provided
    const detectedCoach = coach || (coachSource ? detectCoachFromSource(coachSource) : 'higdon');
    const context = getWorkoutContext(workoutType, detectedCoach);
    const branding = COACH_BRANDING[detectedCoach];

    if (compact) {
        return (
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full text-left"
            >
                <div
                    className="v2-card p-4 transition-all hover:border-opacity-100"
                    style={{
                        borderColor: `${branding.color}40`,
                        background: 'var(--v2-bg-elevated)',
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{branding.icon}</span>
                            <div>
                                <p className="text-sm font-medium" style={{ color: 'var(--v2-text-secondary)' }}>
                                    Why this workout?
                                </p>
                                <p className="text-xs" style={{ color: 'var(--v2-text-muted)' }}>
                                    Based on {branding.name}
                                </p>
                            </div>
                        </div>
                        <svg
                            className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
                            style={{ color: 'var(--v2-text-muted)' }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>

                    {expanded && (
                        <div className="mt-4 pt-4 space-y-4" style={{ borderTop: '1px solid var(--v2-border)' }}>
                            <ContextContent context={context} branding={branding} />
                        </div>
                    )}
                </div>
            </button>
        );
    }

    return (
        <div
            className="v2-card p-5 border-l-4"
            style={{
                borderLeftColor: branding.color,
                background: 'var(--v2-bg-elevated)',
            }}
        >
            <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{branding.icon}</span>
                <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--v2-text-secondary)' }}>
                        Coach&apos;s Perspective
                    </p>
                    <p className="text-xs" style={{ color: branding.color }}>
                        {branding.name}
                    </p>
                </div>
            </div>

            <ContextContent context={context} branding={branding} />
        </div>
    );
}

// =============================================================================
// CONTEXT CONTENT
// =============================================================================

function ContextContent({
    context,
    branding
}: {
    context: WorkoutContext;
    branding: typeof COACH_BRANDING[CoachPhilosophy];
}) {
    return (
        <div className="space-y-4">
            {/* Why Section */}
            <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: branding.color }}>
                    Why This Workout
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--v2-text-secondary)' }}>
                    {context.why}
                </p>
            </div>

            {/* Feel Section */}
            <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--v2-text-muted)' }}>
                    How It Should Feel
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--v2-text-muted)' }}>
                    {context.feel}
                </p>
            </div>

            {/* Effort Level (if available) */}
            {context.effortLevel && (
                <div
                    className="inline-block px-3 py-1 rounded-lg text-xs font-mono"
                    style={{
                        background: `${branding.color}20`,
                        color: branding.color,
                    }}
                >
                    {context.effortLevel}
                </div>
            )}

            {/* Coach Tip */}
            {context.coachTip && (
                <div
                    className="p-3 rounded-lg"
                    style={{ background: 'var(--v2-bg-deep)' }}
                >
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--v2-text-muted)' }}>
                        💡 Pro Tip
                    </p>
                    <p className="text-sm italic" style={{ color: 'var(--v2-text-secondary)' }}>
                        &quot;{context.coachTip}&quot;
                    </p>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// PHASE BANNER
// =============================================================================

interface PhaseBannerProps {
    phase: TrainingPhase;
    weekNumber: number;
    totalWeeks: number;
    coach?: CoachPhilosophy;
}

export function PhaseBanner({ phase, weekNumber, totalWeeks, coach = 'higdon' }: PhaseBannerProps) {
    const context = getPhaseContext(phase, coach);
    const branding = COACH_BRANDING[coach];

    const progress = Math.round((weekNumber / totalWeeks) * 100);

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span
                        className="text-xs font-medium uppercase tracking-wider"
                        style={{ color: branding.color }}
                    >
                        {context.title}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--v2-text-muted)' }}>
                        • Week {weekNumber} of {totalWeeks}
                    </span>
                </div>
                <span className="text-xs font-mono" style={{ color: 'var(--v2-text-muted)' }}>
                    {progress}%
                </span>
            </div>

            {/* Progress bar */}
            <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: 'var(--v2-bg-elevated)' }}
            >
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${progress}%`,
                        background: branding.color,
                    }}
                />
            </div>

            {/* Phase focus */}
            <p className="text-xs mt-2" style={{ color: 'var(--v2-text-muted)' }}>
                {context.focus}
            </p>
        </div>
    );
}

// =============================================================================
// INTENSITY BADGE
// =============================================================================

interface IntensityBadgeProps {
    zone: 'E' | 'M' | 'T' | 'I' | 'R';
    showTooltip?: boolean;
}

const ZONE_COLORS: Record<string, string> = {
    E: '#3498DB', // Easy - Blue
    M: '#27AE60', // Marathon - Green  
    T: '#F39C12', // Threshold - Orange
    I: '#E74C3C', // Interval - Red
    R: '#9B59B6', // Repetition - Purple
};

export function IntensityBadge({ zone, showTooltip = true }: IntensityBadgeProps) {
    const color = ZONE_COLORS[zone] || 'var(--v2-text-muted)';

    const zoneNames: Record<string, string> = {
        E: 'Easy',
        M: 'Marathon',
        T: 'Threshold',
        I: 'Interval',
        R: 'Repetition',
    };

    return (
        <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold"
            style={{
                background: `${color}20`,
                color: color,
            }}
            title={showTooltip ? zoneNames[zone] : undefined}
        >
            {zone}
        </span>
    );
}

// =============================================================================
// INDEX EXPORT
// =============================================================================

export { COACH_BRANDING };
