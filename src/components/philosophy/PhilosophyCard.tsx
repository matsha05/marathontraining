'use client';

import { PhilosophyMetadata } from '@/domain/philosophy/types';

/**
 * PhilosophyCard - Training philosophy display component
 * V2 Design System - 100% token usage
 */

interface PhilosophyCardProps {
    philosophy: PhilosophyMetadata;
    expanded?: boolean;
    recommended?: boolean;
}

export function PhilosophyCard({ philosophy, expanded = false, recommended = false }: PhilosophyCardProps) {
    return (
        <div
            className="rounded-2xl border transition-all"
            style={{
                background: recommended ? 'var(--v2-bg-hover)' : 'var(--v2-bg-elevated)',
                borderColor: recommended ? 'var(--v2-border-active)' : 'var(--v2-border-hover)',
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
                        style={{ color: 'var(--v2-text-primary)' }}
                    >
                        {philosophy.name}
                    </h3>
                    <span
                        className="text-xs uppercase tracking-wider"
                        style={{ color: 'var(--v2-text-muted)' }}
                    >
                        {philosophy.tagline}
                    </span>
                    {recommended && (
                        <span
                            className="ml-auto px-2 py-1 text-[10px] rounded-full uppercase tracking-wider"
                            style={{ background: 'var(--v2-accent-subtle)', color: 'var(--v2-accent)' }}
                        >
                            Recommended
                        </span>
                    )}
                </div>

                {/* Quick stats */}
                <div className="flex gap-6 text-sm">
                    <div>
                        <span style={{ color: 'var(--v2-text-muted)' }}>Run days:</span>{' '}
                        <span style={{ color: 'var(--v2-text-secondary)' }}>{philosophy.runDays}</span>
                    </div>
                    <div>
                        <span style={{ color: 'var(--v2-text-muted)' }}>Long run cap:</span>{' '}
                        <span style={{ color: 'var(--v2-text-secondary)' }}>{philosophy.longRunCap}</span>
                    </div>
                </div>
            </div>

            {/* Core beliefs */}
            <div className="px-6 pb-4">
                <p
                    className="text-xs uppercase tracking-widest mb-3"
                    style={{ color: 'var(--v2-text-muted)' }}
                >
                    Core beliefs
                </p>
                <ul className="space-y-2">
                    {philosophy.coreBeliefs.map((belief, i) => (
                        <li
                            key={i}
                            className="text-sm flex items-start gap-2"
                            style={{ color: 'var(--v2-text-tertiary)' }}
                        >
                            <span className="mt-0.5" style={{ color: 'var(--v2-text-subtle)' }}>•</span>
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
                        style={{ borderTop: '1px solid var(--v2-border)' }}
                    >
                        <p
                            className="text-sm leading-relaxed"
                            style={{ color: 'var(--v2-text-tertiary)' }}
                        >
                            {philosophy.methodology.summary}
                        </p>
                    </div>

                    {/* Key principles */}
                    <div
                        className="px-6 py-4"
                        style={{ borderTop: '1px solid var(--v2-border)' }}
                    >
                        <p
                            className="text-xs uppercase tracking-widest mb-3"
                            style={{ color: 'var(--v2-text-muted)' }}
                        >
                            Key principles
                        </p>
                        <ul className="space-y-3">
                            {philosophy.methodology.keyPrinciples.map((principle, i) => (
                                <li
                                    key={i}
                                    className="text-sm flex items-start gap-2"
                                    style={{ color: 'var(--v2-text-tertiary)' }}
                                >
                                    <span
                                        className="font-mono text-xs mt-0.5"
                                        style={{ color: 'var(--v2-text-subtle)' }}
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
                        style={{ borderTop: '1px solid var(--v2-border)' }}
                    >
                        <p
                            className="text-xs uppercase tracking-widest mb-3"
                            style={{ color: 'var(--v2-text-muted)' }}
                        >
                            Typical week
                        </p>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {philosophy.methodology.typicalWeek.map((day, i) => {
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
                                                ? 'var(--v2-accent-subtle)'
                                                : isQuality
                                                    ? 'var(--v2-secondary-subtle)'
                                                    : isRest
                                                        ? 'var(--v2-bg-elevated)'
                                                        : 'var(--v2-bg-hover)',
                                        }}
                                    >
                                        <p
                                            className="text-[10px] mb-1"
                                            style={{ color: 'var(--v2-text-subtle)' }}
                                        >
                                            {dayLetter}
                                        </p>
                                        <p
                                            className="text-[10px]"
                                            style={{ color: isRest ? 'var(--v2-text-subtle)' : 'var(--v2-text-tertiary)' }}
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
                        style={{ borderTop: '1px solid var(--v2-border)' }}
                    >
                        <p
                            className="text-xs uppercase tracking-widest mb-3"
                            style={{ color: 'var(--v2-text-muted)' }}
                        >
                            Best for
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {philosophy.methodology.bestFor.map((item, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 text-xs rounded-full"
                                    style={{
                                        background: 'var(--v2-bg-active)',
                                        color: 'var(--v2-text-tertiary)'
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
                        style={{ borderTop: '1px solid var(--v2-border)' }}
                    >
                        <p
                            className="text-xs uppercase tracking-widest mb-3"
                            style={{ color: 'var(--v2-text-muted)' }}
                        >
                            Challenges to consider
                        </p>
                        <ul className="space-y-2">
                            {philosophy.methodology.challenges.map((challenge, i) => (
                                <li
                                    key={i}
                                    className="text-sm flex items-start gap-2"
                                    style={{ color: 'var(--v2-text-tertiary)' }}
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
                            borderTop: '1px solid var(--v2-border)',
                            background: 'var(--v2-bg-section)'
                        }}
                    >
                        <p
                            className="text-xs leading-relaxed"
                            style={{ color: 'var(--v2-text-subtle)' }}
                        >
                            {philosophy.alwaysIncluded}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
