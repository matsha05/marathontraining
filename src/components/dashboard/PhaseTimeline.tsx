'use client';

import { motion } from 'framer-motion';
import { TrainingPhase, WeekBlockType } from '@/domain/plan/types';
import { getBlockLabel } from '@/domain/plan/block-labels';

/**
 * PhaseTimeline - Horizontal phase indicator
 * 
 * Shows all phases with current position highlighted
 */

interface PhaseTimelineProps {
    phases: Array<{
        name: TrainingPhase;
        startWeek: number;
        endWeek: number;
    }>;
    blocks?: Array<{
        type: WeekBlockType;
        startWeek: number;
        endWeek: number;
    }>;
    currentWeek: number;
    totalWeeks: number;
}

const PHASE_DISPLAY: Record<TrainingPhase, { label: string; color: string }> = {
    base: { label: 'Base', color: 'var(--color-zone-easy)' },
    build: { label: 'Build', color: 'var(--color-zone-marathon)' },
    peak: { label: 'Peak', color: 'var(--color-zone-threshold)' },
    taper: { label: 'Taper', color: 'var(--color-zone-interval)' },
};

const BLOCK_DISPLAY: Record<WeekBlockType, { color: string }> = {
    base_official: { color: 'var(--color-zone-easy)' },
    maintenance: { color: 'var(--color-accent)' },
    race_plan: { color: 'var(--color-zone-threshold)' },
};

export function PhaseTimeline({ phases, blocks, currentWeek, totalWeeks }: PhaseTimelineProps) {
    const isPrePlan = currentWeek < 1;

    const currentPhaseName = (() => {
        if (isPrePlan) return null;
        for (const phase of phases) {
            if (currentWeek >= phase.startWeek && currentWeek <= phase.endWeek) {
                return phase.name;
            }
        }
        return phases[0]?.name || 'base';
    })();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mb-8"
        >
            <div
                className="rounded-xl p-4"
                style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-base)',
                }}
            >
                {blocks && blocks.length > 0 && (
                    <div className="mb-4">
                        <p className="text-caption text-[10px] mb-2" style={{ color: 'var(--text-subtle)' }}>
                            Plan Blocks
                        </p>
                        <div className="flex gap-2">
                            {blocks.map(block => {
                                const weeks = block.endWeek - block.startWeek + 1;
                                const display = BLOCK_DISPLAY[block.type];
                                const label = getBlockLabel(block.type, { includeRacePlan: true }) ?? 'Block';
                                return (
                                    <div
                                        key={`${block.type}-${block.startWeek}`}
                                        className="rounded-lg px-3 py-2 text-xs font-medium"
                                        style={{
                                            flex: `${weeks} 1 0%`,
                                            border: `1px solid color-mix(in srgb, ${display.color} 30%, transparent)`,
                                            background: `color-mix(in srgb, ${display.color} 12%, var(--bg-elevated))`,
                                            color: display.color,
                                        }}
                                    >
                                        {label} · W{block.startWeek}-{block.endWeek}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Phase dots and labels */}
                <div className="flex items-center justify-between">
                    {phases.map((phase, index) => {
                        const isActive = !!currentPhaseName && phase.name === currentPhaseName;
                        const isPast = !isPrePlan && currentWeek > phase.endWeek;
                        const display = PHASE_DISPLAY[phase.name] || PHASE_DISPLAY.base;

                        return (
                            <div key={phase.name} className="flex-1 flex flex-col items-center relative">
                                {/* Connector line (except for first) */}
                                {index > 0 && (
                                    <div
                                        className="absolute top-3 right-1/2 h-0.5"
                                        style={{
                                            width: '100%',
                                            background: isPast || isActive
                                                ? 'var(--color-accent)'
                                                : 'var(--border-base)',
                                        }}
                                    />
                                )}

                                {/* Phase dot */}
                                <div
                                    className="relative z-10 flex items-center justify-center"
                                    style={{
                                        width: isActive ? 28 : 20,
                                        height: isActive ? 28 : 20,
                                        borderRadius: '50%',
                                        background: isActive
                                            ? display.color
                                            : isPast
                                                ? 'var(--color-accent)'
                                                : 'var(--bg-muted)',
                                        border: isActive
                                            ? `3px solid color-mix(in srgb, ${display.color} 30%, transparent)`
                                            : 'none',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    {isPast && !isActive && (
                                        <svg
                                            width="10"
                                            height="10"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>

                                {/* Phase label */}
                                <p
                                    className="mt-2 text-caption font-medium"
                                    style={{
                                        color: isActive ? display.color : isPast ? 'var(--text-muted)' : 'var(--text-subtle)',
                                    }}
                                >
                                    {display.label}
                                </p>

                                {/* Week range */}
                                <p
                                    className="text-caption text-[10px]"
                                    style={{ color: 'var(--text-subtle)' }}
                                >
                                    {phase.startWeek === phase.endWeek
                                        ? `Wk ${phase.startWeek}`
                                        : `Wks ${phase.startWeek}-${phase.endWeek}`}
                                </p>

                                {/* Current week indicator */}
                                {isActive && currentWeek > 0 && (
                                    <p
                                        className="mt-1 text-caption font-medium"
                                        style={{ color: 'var(--color-accent)' }}
                                    >
                                        Week {currentWeek}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}

/**
 * Extract phases from a training plan's weeks
 */
export function extractPhasesFromWeeks(
    weeks: Array<{ weekNumber: number; phase: TrainingPhase }>
): PhaseTimelineProps['phases'] {
    if (!weeks.length) return [];

    const phases: PhaseTimelineProps['phases'] = [];
    let currentPhase: TrainingPhase | null = null;
    let startWeek = 1;

    weeks.forEach((week, index) => {
        if (week.phase !== currentPhase) {
            if (currentPhase !== null) {
                phases.push({
                    name: currentPhase,
                    startWeek,
                    endWeek: week.weekNumber - 1,
                });
            }
            currentPhase = week.phase;
            startWeek = week.weekNumber;
        }

        // Handle last week
        if (index === weeks.length - 1 && currentPhase) {
            phases.push({
                name: currentPhase,
                startWeek,
                endWeek: week.weekNumber,
            });
        }
    });

    return phases;
}

export function extractBlockSegmentsFromWeeks(
    weeks: Array<{ weekNumber: number; blockType?: WeekBlockType }>
): PhaseTimelineProps['blocks'] {
    if (!weeks.length) return [];

    const blocks: NonNullable<PhaseTimelineProps['blocks']> = [];
    let currentType: WeekBlockType | null = null;
    let startWeek = 1;

    weeks.forEach((week, index) => {
        const blockType = week.blockType ?? 'race_plan';
        if (blockType !== currentType) {
            if (currentType !== null) {
                blocks.push({
                    type: currentType,
                    startWeek,
                    endWeek: week.weekNumber - 1,
                });
            }
            currentType = blockType;
            startWeek = week.weekNumber;
        }

        if (index === weeks.length - 1 && currentType) {
            blocks.push({
                type: currentType,
                startWeek,
                endWeek: week.weekNumber,
            });
        }
    });

    return blocks;
}
