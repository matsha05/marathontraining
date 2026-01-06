'use client';

import { PhilosophyMetadata } from '@/domain/philosophy/types';

/**
 * PhilosophyCard - Training philosophy display component
 * V2 Design System - 100% token usage
 * 
 * Supports personalized display when provided with user's specific plan details.
 */

interface PhilosophyCardProps {
    philosophy: PhilosophyMetadata;
    expanded?: boolean;
    recommended?: boolean;
    // Personalized data (overrides static values when provided)
    personalizedRunDays?: string;
    personalizedLongRunCap?: string;
    personalizedDuration?: string;
    personalizedKeyWorkouts?: string[];
    personalizedPrinciples?: string[];
    personalizedTypicalWeek?: string[];
    userDistance?: string;
}

export function PhilosophyCard({
    philosophy,
    expanded = false,
    recommended = false,
    personalizedRunDays,
    personalizedLongRunCap,
    personalizedDuration,
    personalizedKeyWorkouts,
    personalizedPrinciples,
    personalizedTypicalWeek,
    userDistance,
}: PhilosophyCardProps) {
    // Use personalized values if provided, otherwise fall back to static
    const displayRunDays = personalizedRunDays || philosophy.runDays;
    const displayLongRunCap = personalizedLongRunCap || philosophy.longRunCap;
    const displayPrinciples = personalizedPrinciples || philosophy.methodology.keyPrinciples;
    const displayTypicalWeek = personalizedTypicalWeek || philosophy.methodology.typicalWeek;

    return (
        <div
            className="rounded-2xl border transition-all"
            style={{
                background: recommended ? 'var(--bg-muted)' : 'var(--bg-elevated)',
                borderColor: recommended ? 'var(--border-base-active)' : 'var(--border-base-hover)',
            }}
        >
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-center gap-3 mb-4">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: philosophy.color }}
                    />
                    <h3
                        className="text-2xl font-light"
                        style={{ color: 'var(--text-base)' }}
                    >
                        {philosophy.name}
                    </h3>
                    <span
                        className="text-xs uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {philosophy.tagline}
                    </span>
                    {recommended && (
                        <span
                            className="ml-auto px-2 py-1 text-[10px] rounded-full uppercase tracking-wider"
                            style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
                        >
                            Recommended
                        </span>
                    )}
                </div>

                {/* Your plan summary (personalized) */}
                {(personalizedDuration || personalizedKeyWorkouts) && (
                    <div
                        className="mb-4 p-3 rounded-lg"
                        style={{ background: 'var(--bg-subtle)' }}
                    >
                        <p
                            className="text-xs uppercase tracking-wider mb-2"
                            style={{ color: 'var(--color-accent)' }}
                        >
                            Your {userDistance || 'plan'}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                            {personalizedDuration && (
                                <span style={{ color: 'var(--text-muted)' }}>
                                    {personalizedDuration}
                                </span>
                            )}
                            {displayRunDays && (
                                <span style={{ color: 'var(--text-muted)' }}>
                                    {displayRunDays}
                                </span>
                            )}
                            {displayLongRunCap && (
                                <span style={{ color: 'var(--text-muted)' }}>
                                    Long runs: {displayLongRunCap}
                                </span>
                            )}
                        </div>
                        {personalizedKeyWorkouts && personalizedKeyWorkouts.length > 0 && (
                            <p
                                className="text-xs mt-2"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Key workouts: {personalizedKeyWorkouts.join(' · ')}
                            </p>
                        )}
                    </div>
                )}

                {/* Quick stats (fallback when not personalized) */}
                {!personalizedDuration && !personalizedKeyWorkouts && (
                    <div className="flex gap-6 text-sm">
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>Run days:</span>{' '}
                            <span style={{ color: 'var(--text-muted)' }}>{displayRunDays}</span>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>Long run cap:</span>{' '}
                            <span style={{ color: 'var(--text-muted)' }}>{displayLongRunCap}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Core beliefs */}
            <div className="px-6 pb-4">
                <p
                    className="text-xs uppercase tracking-widest mb-3"
                    style={{ color: 'var(--text-muted)' }}
                >
                    Core beliefs
                </p>
                <ul className="space-y-2">
                    {philosophy.coreBeliefs.map((belief, i) => (
                        <li
                            key={i}
                            className="text-sm flex items-start gap-2"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <span className="mt-0.5" style={{ color: 'var(--text-subtle)' }}>•</span>
                            {belief}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Expanded methodology */}
            {expanded && (
                <>
                    {/* Summary */}
                    <div
                        className="px-6 py-4"
                        style={{ borderTop: '1px solid var(--border-base)' }}
                    >
                        <p
                            className="text-sm leading-relaxed"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            {philosophy.methodology.summary}
                        </p>
                    </div>

                    {/* Key principles */}
                    <div
                        className="px-6 py-4"
                        style={{ borderTop: '1px solid var(--border-base)' }}
                    >
                        <p
                            className="text-xs uppercase tracking-widest mb-3"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Key principles
                        </p>
                        <ul className="space-y-3">
                            {displayPrinciples.map((principle, i) => (
                                <li
                                    key={i}
                                    className="text-sm flex items-start gap-2"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <span
                                        className="font-mono text-xs mt-0.5"
                                        style={{ color: 'var(--text-subtle)' }}
                                    >
                                        {i + 1}.
                                    </span>
                                    {principle}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Typical week */}
                    <div
                        className="px-6 py-4"
                        style={{ borderTop: '1px solid var(--border-base)' }}
                    >
                        <p
                            className="text-xs uppercase tracking-widest mb-3"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Typical week
                        </p>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {displayTypicalWeek.map((day, i) => {
                                const [, ...rest] = day.split(': ');
                                const activity = rest.join(': ');
                                const dayLetter = ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i];
                                const isRest = activity.toLowerCase().includes('rest');
                                const isLong = activity.toLowerCase().includes('long');
                                const isQuality = activity.toLowerCase().includes('tempo') ||
                                    activity.toLowerCase().includes('speed') ||
                                    activity.toLowerCase().includes('threshold') ||
                                    activity.toLowerCase().includes('vo2');

                                return (
                                    <div
                                        key={i}
                                        className="p-2 rounded-lg text-center"
                                        style={{
                                            background: isLong
                                                ? 'var(--color-accent-subtle)'
                                                : isQuality
                                                    ? 'var(--color-strength-subtle)'
                                                    : isRest
                                                        ? 'var(--bg-elevated)'
                                                        : 'var(--bg-muted)',
                                        }}
                                    >
                                        <p
                                            className="text-[10px] mb-1"
                                            style={{ color: 'var(--text-subtle)' }}
                                        >
                                            {dayLetter}
                                        </p>
                                        <p
                                            className="text-[10px]"
                                            style={{ color: isRest ? 'var(--text-subtle)' : 'var(--text-muted)' }}
                                        >
                                            {activity.split(' ').slice(0, 2).join(' ')}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Best for */}
                    <div
                        className="px-6 py-4"
                        style={{ borderTop: '1px solid var(--border-base)' }}
                    >
                        <p
                            className="text-xs uppercase tracking-widest mb-3"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Best for
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {philosophy.methodology.bestFor.map((item, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 text-xs rounded-full"
                                    style={{
                                        background: 'var(--bg-subtle)',
                                        color: 'var(--text-muted)'
                                    }}
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Challenges */}
                    <div
                        className="px-6 py-4"
                        style={{ borderTop: '1px solid var(--border-base)' }}
                    >
                        <p
                            className="text-xs uppercase tracking-widest mb-3"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Challenges to consider
                        </p>
                        <ul className="space-y-2">
                            {philosophy.methodology.challenges.map((challenge, i) => (
                                <li
                                    key={i}
                                    className="text-sm flex items-start gap-2"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <span className="mt-0.5" style={{ color: 'var(--v2-warning)' }}>⚠</span>
                                    {challenge}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Always included note */}
                    <div
                        className="px-6 py-4 rounded-b-2xl"
                        style={{
                            borderTop: '1px solid var(--border-base)',
                            background: 'var(--bg-muted)'
                        }}
                    >
                        <p
                            className="text-xs leading-relaxed"
                            style={{ color: 'var(--text-subtle)' }}
                        >
                            {philosophy.alwaysIncluded}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
