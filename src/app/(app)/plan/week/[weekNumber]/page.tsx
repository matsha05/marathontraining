"use client";

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePlan } from '@/domain/plan/context';
import { WeekBlockType } from '@/domain/plan/types';
import { formatPace, getDayName } from '@/lib/format';
import { CheckIcon } from '@/components/ui/check';
import { AppHeader } from '@/components/ui/SiteHeader';
import { motion } from 'framer-motion';

/**
 * Week Detail View - Shows all workouts for a specific training week
 */

interface DayDisplay {
    dayOfWeek: number;
    dayName: string;
    isRest: boolean;
    runWorkout?: {
        name: string;
        type: string;
        distance: number;
        duration: number;
        paceGuidance?: string;
    };
    strengthWorkout?: {
        name: string;
        duration: number;
        exercises: number;
    };
}

function getBlockLabel(blockType?: WeekBlockType): string | null {
    if (blockType === 'base_official') return 'Base';
    if (blockType === 'maintenance') return 'Maintenance';
    return null;
}

export default function WeekDetailPage() {
    const params = useParams();
    const weekNumber = parseInt(params.weekNumber as string, 10);
    const { status, plan, currentWeek } = usePlan();

    const weekPlan = useMemo(() => {
        if (!plan) return null;
        return plan.weeks.find(w => w.weekNumber === weekNumber);
    }, [plan, weekNumber]);

    const days = useMemo<DayDisplay[]>(() => {
        if (!weekPlan) {
            return [0, 1, 2, 3, 4, 5, 6].map(i => ({
                dayOfWeek: i,
                dayName: getDayName(i),
                isRest: true,
            }));
        }

        return [0, 1, 2, 3, 4, 5, 6].map(dayNum => {
            const dayPlan = weekPlan.days.find(d => d.dayOfWeek === dayNum);
            const dayName = getDayName(dayNum);

            if (!dayPlan) {
                return { dayOfWeek: dayNum, dayName, isRest: true };
            }

            const result: DayDisplay = {
                dayOfWeek: dayNum,
                dayName,
                isRest: !dayPlan.runWorkout && !dayPlan.strengthWorkout,
            };

            if (dayPlan.runWorkout) {
                const run = dayPlan.runWorkout;
                // Get appropriate pace based on workout type
                let paceGuidance: string | undefined;
                if (plan?.paces) {
                    const paceMap: Record<string, string> = {
                        'easy': `${formatPace(plan.paces.easy.min)}-${formatPace(plan.paces.easy.max)}`,
                        'recovery': `${formatPace(plan.paces.easy.min)}-${formatPace(plan.paces.easy.max)}`,
                        'tempo': formatPace(plan.paces.threshold),
                        'threshold': formatPace(plan.paces.threshold),
                        'long_easy': `${formatPace(plan.paces.easy.min)}-${formatPace(plan.paces.easy.max)}`,
                        'long_progression': `${formatPace(plan.paces.easy.min)} → ${formatPace(plan.paces.marathon)}`,
                        'long_mp_finish': `${formatPace(plan.paces.easy.min)} → ${formatPace(plan.paces.marathon)}`,
                        'cruise_intervals': formatPace(plan.paces.threshold),
                        'vo2max_800s': formatPace(plan.paces.interval),
                        'vo2max_1000s': formatPace(plan.paces.interval),
                        'vo2max_1200s': formatPace(plan.paces.interval),
                        'fartlek': 'varied',
                    };
                    paceGuidance = paceMap[run.type] || `${formatPace(plan.paces.easy.min)}-${formatPace(plan.paces.easy.max)}`;
                }
                result.runWorkout = {
                    name: run.name,
                    type: run.type.replace(/_/g, ' '),
                    distance: Math.round(run.totalDistance * 10) / 10, // Fix floating point
                    duration: run.estimatedDuration,
                    paceGuidance,
                };
            }

            if (dayPlan.strengthWorkout) {
                const strength = dayPlan.strengthWorkout;
                result.strengthWorkout = {
                    name: strength.name,
                    duration: strength.duration,
                    exercises: strength.exercises.length,
                };
            }

            return result;
        });
    }, [weekPlan, plan]);

    // Loading state
    if (status === 'loading') {
        return (
            <div className="v3-root min-h-screen">
                <AppHeader backHref="/plan" title="Back to Plan" />
                <main className="v3-container py-10">
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <div key={i} className="v3-skeleton" style={{ height: '80px', borderRadius: '12px' }} />
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    // No plan state
    if (!plan || !weekPlan) {
        return (
            <div className="v3-root min-h-screen">
                <AppHeader backHref="/plan" title="Back to Plan" />
                <main className="v3-container py-10">
                    <div className="v3-card p-10 text-center">
                        <h2 className="v3-heading-md mb-4">Week Not Found</h2>
                        <p className="v3-body-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                            This training week doesn&apos;t exist in your plan.
                        </p>
                        <Link href="/plan" className="v3-btn v3-btn-primary">
                            Back to Plan
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const isCurrent = weekNumber === currentWeek;
    const phaseLabel = weekPlan.phase.charAt(0).toUpperCase() + weekPlan.phase.slice(1);
    const blockLabel = getBlockLabel(weekPlan.blockType);

    return (
        <div className="v3-root min-h-screen">
            {/* Header */}
            <AppHeader
                backHref="/plan"
                title="Back to Plan"
                rightContent={
                    <div className="flex items-center gap-2">
                        {isCurrent && <span className="v3-badge v3-badge-accent">Current Week</span>}
                        {weekPlan.isRecoveryWeek && <span className="v3-badge">Cutback</span>}
                        {blockLabel && <span className="v3-badge">{blockLabel}</span>}
                    </div>
                }
            />

            <main className="v3-container py-10">
                {/* Week Header */}
                <motion.div
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="v3-heading-xl mb-2">Week {weekNumber}</h1>
                    <div className="flex items-center gap-4">
                        <span className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>{phaseLabel} Phase</span>
                        <span className="v3-mono" style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>•</span>
                        <span className="v3-mono" style={{ fontSize: '12px' }}>{Math.round(weekPlan.totalMiles * 10) / 10} miles</span>
                        <span className="v3-mono" style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>•</span>
                        <span className="v3-mono" style={{ fontSize: '12px' }}>{weekPlan.keyWorkouts} quality sessions</span>
                    </div>
                </motion.div>

                {/* Coach Notes */}
                {weekPlan.coachNotes && (
                    <motion.div
                        className="mb-8 p-4 rounded-xl"
                        style={{ background: 'var(--v3-bg-inset)', borderLeft: '3px solid var(--color-accent)' }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                    >
                        <p className="v3-label mb-1" style={{ color: 'var(--color-accent)' }}>Coach&apos;s Note</p>
                        <p className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>
                            {weekPlan.coachNotes}
                        </p>
                    </motion.div>
                )}

                {/* Daily Schedule */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <h2 className="v3-heading-md mb-4">Daily Schedule</h2>
                    <div className="space-y-3">
                        {days.map((day, i) => (
                            <motion.div
                                key={day.dayOfWeek}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
                                className="v3-card p-5"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Day Label */}
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center v3-mono text-[11px] shrink-0"
                                        style={{
                                            background: day.isRest ? 'var(--bg-muted)' : 'var(--color-accent-subtle)',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {day.dayName}
                                    </div>

                                    {/* Workouts */}
                                    <div className="flex-1 space-y-3">
                                        {day.isRest ? (
                                            <div>
                                                <p className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>Rest Day</p>
                                                <p className="v3-mono text-[11px]" style={{ color: 'var(--text-subtle)' }}>Recovery is training</p>
                                            </div>
                                        ) : (
                                            <>
                                                {day.runWorkout && (
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="v3-heading-sm">{day.runWorkout.name}</p>
                                                            <p className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>
                                                                {day.runWorkout.distance} mi • {day.runWorkout.type}
                                                                {day.runWorkout.paceGuidance && ` @ ${day.runWorkout.paceGuidance}`}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="v3-mono" style={{ fontSize: '12px' }}>{day.runWorkout.duration} min</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {day.strengthWorkout && (
                                                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-base)' }}>
                                                        <div>
                                                            <p className="v3-heading-sm" style={{ fontSize: '14px' }}>{day.strengthWorkout.name}</p>
                                                            <p className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>
                                                                {day.strengthWorkout.exercises} exercises
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="v3-mono" style={{ fontSize: '12px' }}>{day.strengthWorkout.duration} min</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Week Summary */}
                <motion.section
                    className="mt-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <h2 className="v3-heading-md mb-4">Week Summary</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="v3-card p-5 text-center">
                            <p className="v3-heading-lg v3-mono mb-1">{Math.round(weekPlan.totalMiles)}</p>
                            <p className="v3-label">Total Miles</p>
                        </div>
                        <div className="v3-card p-5 text-center">
                            <p className="v3-heading-lg v3-mono mb-1">{weekPlan.keyWorkouts}</p>
                            <p className="v3-label">Quality Sessions</p>
                        </div>
                        <div className="v3-card p-5 text-center">
                            <p className="v3-heading-lg v3-mono mb-1">{weekPlan.days.filter(d => d.strengthWorkout).length}</p>
                            <p className="v3-label">Strength Days</p>
                        </div>
                    </div>
                </motion.section>

                {/* Navigation */}
                <motion.div
                    className="mt-10 flex justify-between"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                >
                    {weekNumber > 1 ? (
                        <Link href={`/plan/week/${weekNumber - 1}`} className="v3-btn v3-btn-secondary">
                            ← Week {weekNumber - 1}
                        </Link>
                    ) : <div />}
                    {weekNumber < (plan?.totalWeeks || 1) ? (
                        <Link href={`/plan/week/${weekNumber + 1}`} className="v3-btn v3-btn-secondary">
                            Week {weekNumber + 1} →
                        </Link>
                    ) : <div />}
                </motion.div>
            </main>
        </div>
    );
}
