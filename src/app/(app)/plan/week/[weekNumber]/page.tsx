"use client";

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePlan } from '@/domain/plan/context';
import { formatPace, getDayName } from '@/lib/format';
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
                result.runWorkout = {
                    name: run.name,
                    type: run.type.replace(/_/g, ' '),
                    distance: run.totalDistance,
                    duration: run.estimatedDuration,
                    paceGuidance: plan?.paces ? formatPace(plan.paces.easy.min) : undefined,
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
            <div className="v2-root min-h-screen">
                <header className="v2-nav sticky top-0 z-50">
                    <div className="v2-container flex items-center justify-between py-4">
                        <Link href="/plan" className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>← Back to Plan</Link>
                    </div>
                </header>
                <main className="v2-container py-10">
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <div key={i} className="v2-skeleton" style={{ height: '80px', borderRadius: '12px' }} />
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    // No plan state
    if (!plan || !weekPlan) {
        return (
            <div className="v2-root min-h-screen">
                <header className="v2-nav sticky top-0 z-50">
                    <div className="v2-container flex items-center justify-between py-4">
                        <Link href="/plan" className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>← Back to Plan</Link>
                    </div>
                </header>
                <main className="v2-container py-10">
                    <div className="v2-card p-10 text-center">
                        <h2 className="v2-heading-md mb-4">Week Not Found</h2>
                        <p className="v2-body-sm mb-6" style={{ color: 'var(--v2-text-muted)' }}>
                            This training week doesn&apos;t exist in your plan.
                        </p>
                        <Link href="/plan" className="v2-btn v2-btn-primary">
                            Back to Plan
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const isCurrent = weekNumber === currentWeek;
    const phaseLabel = weekPlan.phase.charAt(0).toUpperCase() + weekPlan.phase.slice(1);

    return (
        <div className="v2-root min-h-screen">
            {/* Header */}
            <header className="v2-nav sticky top-0 z-50">
                <div className="v2-container flex items-center justify-between py-4">
                    <Link href="/plan" className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>← Back to Plan</Link>
                    <div className="flex items-center gap-2">
                        {isCurrent && <span className="v2-badge v2-badge-accent">Current Week</span>}
                        {weekPlan.isRecoveryWeek && <span className="v2-badge">Cutback</span>}
                    </div>
                </div>
            </header>

            <main className="v2-container py-10">
                {/* Week Header */}
                <motion.div
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="v2-heading-xl mb-2">Week {weekNumber}</h1>
                    <div className="flex items-center gap-4">
                        <span className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>{phaseLabel} Phase</span>
                        <span className="v2-mono" style={{ fontSize: '12px', color: 'var(--v2-text-subtle)' }}>•</span>
                        <span className="v2-mono" style={{ fontSize: '12px' }}>{Math.round(weekPlan.totalMiles)} miles</span>
                        <span className="v2-mono" style={{ fontSize: '12px', color: 'var(--v2-text-subtle)' }}>•</span>
                        <span className="v2-mono" style={{ fontSize: '12px' }}>{weekPlan.keyWorkouts} quality sessions</span>
                    </div>
                </motion.div>

                {/* Daily Schedule */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <h2 className="v2-heading-md mb-4">Daily Schedule</h2>
                    <div className="space-y-3">
                        {days.map((day, i) => (
                            <motion.div
                                key={day.dayOfWeek}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
                                className="v2-card p-5"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Day Label */}
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center v2-mono shrink-0"
                                        style={{
                                            background: day.isRest ? 'var(--v2-bg-hover)' : 'var(--v2-accent-subtle)',
                                            fontWeight: 600,
                                            fontSize: '11px',
                                        }}
                                    >
                                        {day.dayName}
                                    </div>

                                    {/* Workouts */}
                                    <div className="flex-1 space-y-3">
                                        {day.isRest ? (
                                            <div>
                                                <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>Rest Day</p>
                                                <p className="v2-mono" style={{ fontSize: '11px', color: 'var(--v2-text-subtle)' }}>Recovery is training</p>
                                            </div>
                                        ) : (
                                            <>
                                                {day.runWorkout && (
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="v2-heading-sm">{day.runWorkout.name}</p>
                                                            <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>
                                                                {day.runWorkout.distance} mi • {day.runWorkout.type}
                                                                {day.runWorkout.paceGuidance && ` @ ${day.runWorkout.paceGuidance}`}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="v2-mono" style={{ fontSize: '12px' }}>{day.runWorkout.duration} min</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {day.strengthWorkout && (
                                                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--v2-border)' }}>
                                                        <div>
                                                            <p className="v2-heading-sm" style={{ fontSize: '14px' }}>{day.strengthWorkout.name}</p>
                                                            <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>
                                                                {day.strengthWorkout.exercises} exercises
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="v2-mono" style={{ fontSize: '12px' }}>{day.strengthWorkout.duration} min</p>
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
                    <h2 className="v2-heading-md mb-4">Week Summary</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="v2-card p-5 text-center">
                            <p className="v2-heading-lg v2-mono mb-1">{Math.round(weekPlan.totalMiles)}</p>
                            <p className="v2-label">Total Miles</p>
                        </div>
                        <div className="v2-card p-5 text-center">
                            <p className="v2-heading-lg v2-mono mb-1">{weekPlan.keyWorkouts}</p>
                            <p className="v2-label">Quality Sessions</p>
                        </div>
                        <div className="v2-card p-5 text-center">
                            <p className="v2-heading-lg v2-mono mb-1">{weekPlan.days.filter(d => d.strengthWorkout).length}</p>
                            <p className="v2-label">Strength Days</p>
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
                        <Link href={`/plan/week/${weekNumber - 1}`} className="v2-btn v2-btn-secondary">
                            ← Week {weekNumber - 1}
                        </Link>
                    ) : <div />}
                    {weekNumber < (plan?.totalWeeks || 1) ? (
                        <Link href={`/plan/week/${weekNumber + 1}`} className="v2-btn v2-btn-secondary">
                            Week {weekNumber + 1} →
                        </Link>
                    ) : <div />}
                </motion.div>
            </main>
        </div>
    );
}
