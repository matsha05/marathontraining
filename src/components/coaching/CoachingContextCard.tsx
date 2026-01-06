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
    initials: string;
}> = {
    higdon: {
        name: 'Hal Higdon',
        color: 'var(--color-coach-higdon)',
        initials: 'HH',
    },
    hansons: {
        name: 'Hansons',
        color: 'var(--color-coach-hansons)',
        initials: 'HM',
    },
    pfitzinger: {
        name: 'Pfitzinger',
        color: 'var(--color-coach-pfitzinger)',
        initials: 'PP',
    },
    daniels: {
        name: 'Daniels',
        color: 'var(--color-coach-daniels)',
        initials: 'JD',
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
                    className="v3-card p-4 transition-all hover:border-opacity-100"
                    style={{
                        borderColor: `${branding.color}40`,
                        background: 'var(--bg-elevated)',
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                                style={{ background: `${branding.color}20`, color: branding.color }}
                            >
                                {branding.initials}
                            </div>
                            <div>
                                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                                    Why this workout?
                                </p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    Based on {branding.name}
                                </p>
                            </div>
                        </div>
                        <svg
                            className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
                            style={{ color: 'var(--text-muted)' }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>

                    {expanded && (
                        <div className="mt-4 pt-4 space-y-4" style={{ borderTop: '1px solid var(--border-base)' }}>
                            <ContextContent context={context} branding={branding} />
                        </div>
                    )}
                </div>
            </button>
        );
    }

    return (
        <div
            className="v3-card p-5 border-l-4"
            style={{
                borderLeftColor: branding.color,
                background: 'var(--bg-elevated)',
            }}
        >
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{ background: `${branding.color}20`, color: branding.color }}
                >
                    {branding.initials}
                </div>
                <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
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
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {context.why}
                </p>
            </div>

            {/* Feel Section */}
            <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                    How It Should Feel
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
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
                    style={{ background: 'var(--bg-base)' }}
                >
                    <p className="text-xs font-medium mb-1 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                        <svg className="w-3.5 h-3.5" style={{ color: branding.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Pro Tip
                    </p>
                    <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
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
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        • Week {weekNumber} of {totalWeeks}
                    </span>
                </div>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {progress}%
                </span>
            </div>

            {/* Progress bar */}
            <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: 'var(--bg-elevated)' }}
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
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
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
    E: 'var(--color-zone-easy)',
    M: 'var(--color-zone-marathon)',
    T: 'var(--color-zone-threshold)',
    I: 'var(--color-zone-interval)',
    R: 'var(--color-zone-repetition)',
};

export function IntensityBadge({ zone, showTooltip = true }: IntensityBadgeProps) {
    const color = ZONE_COLORS[zone] || 'var(--text-muted)';

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
