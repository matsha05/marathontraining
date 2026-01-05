"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePlan } from '@/domain/plan/context';
import { TrainingPlan, WeekPlan, TrainingPhase } from '@/domain/plan/types';
import { motion } from 'framer-motion';

/**
 * Training Plan View V2
 * Week aesthetic: Dark, atmospheric, light typography
 */

interface PhaseDisplay {
    name: string;
    weeks: string;
    status: 'completed' | 'current' | 'upcoming';
}

interface WeekDisplay {
    number: number;
    mileage: number;
    quality: number;
    phase: string;
    isCurrent: boolean;
    cutback?: boolean;
}

function formatPhaseDisplay(plan: TrainingPlan, currentWeekNum: number): PhaseDisplay[] {
    if (!plan.phases || plan.phases.length === 0) {
        const phaseMap = new Map<TrainingPhase, { start: number; end: number }>();

        for (const week of plan.weeks) {
            const existing = phaseMap.get(week.phase);
            if (existing) {
                existing.end = week.weekNumber;
            } else {
                phaseMap.set(week.phase, { start: week.weekNumber, end: week.weekNumber });
            }
        }

        return Array.from(phaseMap.entries()).map(([phase, range]) => {
            const status: PhaseDisplay['status'] =
                currentWeekNum > range.end ? 'completed' :
                    currentWeekNum >= range.start && currentWeekNum <= range.end ? 'current' :
                        'upcoming';

            const phaseNames: Record<TrainingPhase, string> = {
                base: 'Base',
                build: 'Build',
                peak: 'Peak',
                taper: 'Taper',
            };

            return {
                name: phaseNames[phase] || phase,
                weeks: range.start === range.end
                    ? `${range.start}`
                    : `${range.start}-${range.end}`,
                status,
            };
        });
    }

    return plan.phases.map(phase => {
        const status: PhaseDisplay['status'] =
            currentWeekNum > phase.endWeek ? 'completed' :
                currentWeekNum >= phase.startWeek && currentWeekNum <= phase.endWeek ? 'current' :
                    'upcoming';

        const phaseNames: Record<TrainingPhase, string> = {
            base: 'Base',
            build: 'Build',
            peak: 'Peak',
            taper: 'Taper',
        };

        return {
            name: phaseNames[phase.phase] || phase.phase,
            weeks: phase.startWeek === phase.endWeek
                ? `${phase.startWeek}`
                : `${phase.startWeek}-${phase.endWeek}`,
            status,
        };
    });
}

function formatWeekDisplay(weeks: WeekPlan[], currentWeekNum: number): WeekDisplay[] {
    const startWeek = Math.max(1, currentWeekNum - 2);
    const endWeek = Math.min(weeks.length, currentWeekNum + 5);

    return weeks
        .filter(w => w.weekNumber >= startWeek && w.weekNumber <= endWeek)
        .map(week => ({
            number: week.weekNumber,
            mileage: Math.round(week.totalMiles),
            quality: week.keyWorkouts,
            phase: week.phase.charAt(0).toUpperCase() + week.phase.slice(1),
            isCurrent: week.weekNumber === currentWeekNum,
            cutback: week.isRecoveryWeek,
        }));
}

function getWeeksUntilRace(raceDate: string | undefined): number | null {
    if (!raceDate) return null;
    const today = new Date();
    const race = new Date(raceDate);
    const diffMs = race.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));
}

export default function PlanPage() {
    const router = useRouter();
    const { status, plan, currentWeek } = usePlan();
    const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

    const phases = useMemo(() => {
        if (!plan) return [];
        return formatPhaseDisplay(plan, currentWeek || 1);
    }, [plan, currentWeek]);

    const weeks = useMemo(() => {
        if (!plan) return [];
        return formatWeekDisplay(plan.weeks, currentWeek || 1);
    }, [plan, currentWeek]);

    const weeksUntilRace = plan?.raceDate ? getWeeksUntilRace(plan.raceDate) : null;

    if (selectedWeek === null && currentWeek) {
        setSelectedWeek(currentWeek);
    }

    // Loading state
    if (status === 'loading') {
        return (
            <div className="v2-root min-h-screen">
                <header className="v2-nav sticky top-0 z-50">
                    <div className="v2-container flex items-center justify-between py-4">
                        <Link href="/dashboard" className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>← Back</Link>
                        <span className="v2-heading-sm">Training Plan</span>
                    </div>
                </header>
                <main className="v2-container py-10">
                    <div className="space-y-6">
                        <div className="v2-skeleton" style={{ height: '80px', borderRadius: '12px' }} />
                        <div className="v2-skeleton" style={{ height: '200px', borderRadius: '12px' }} />
                    </div>
                </main>
            </div>
        );
    }

    // No plan state
    if (!plan) {
        return (
            <div className="v2-root min-h-screen">
                <header className="v2-nav sticky top-0 z-50">
                    <div className="v2-container flex items-center justify-between py-4">
                        <Link href="/dashboard" className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>← Back</Link>
                        <span className="v2-heading-sm">Training Plan</span>
                    </div>
                </header>
                <main className="v2-container py-10">
                    <div className="v2-card p-10 text-center">
                        <h2 className="v2-heading-md mb-4">No Training Plan</h2>
                        <p className="v2-body-sm mb-6" style={{ color: 'var(--v2-text-muted)' }}>
                            Complete onboarding to generate your personalized training plan.
                        </p>
                        <Link href="/onboarding" className="v2-btn v2-btn-primary">
                            Get Started
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const totalQualitySessions = plan.weeks.reduce((sum, w) => sum + w.keyWorkouts, 0);
    const totalStrengthSessions = plan.weeks.reduce((sum, w) =>
        sum + w.days.filter(d => d.strengthWorkout).length, 0
    );

    return (
        <div className="v2-root min-h-screen">
            {/* Header */}
            <header className="v2-nav sticky top-0 z-50">
                <div className="v2-container flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>← Back</Link>
                        <span className="v2-heading-sm">Training Plan</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/plans/history" className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>
                            History
                        </Link>
                        <span className="v2-label">{plan.raceName || `${plan.goalDistance.toUpperCase()} Training`}</span>
                        {weeksUntilRace !== null && weeksUntilRace > 0 && (
                            <>
                                <span className="v2-mono" style={{ fontSize: '10px', color: 'var(--v2-text-subtle)' }}>•</span>
                                <span className="v2-body-sm v2-accent">{weeksUntilRace} weeks away</span>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="v2-container py-10">
                {/* Phase Timeline */}
                <motion.section
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h2 className="v2-heading-md mb-4">Training Phases</h2>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {phases.map((phase, i) => (
                            <motion.div
                                key={phase.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                className={`flex-1 min-w-[100px] p-4 rounded-xl transition-all ${phase.status === 'current'
                                    ? 'v2-card-accent'
                                    : phase.status === 'completed'
                                        ? 'v2-card opacity-60'
                                        : 'v2-card'
                                    }`}
                                style={{
                                    background: phase.status === 'current' ? 'var(--v2-bg-active)' : 'var(--v2-bg-elevated)',
                                    borderColor: phase.status === 'current' ? 'var(--v2-accent)' : 'var(--v2-border)',
                                }}
                            >
                                <p className="v2-heading-sm">{phase.name}</p>
                                <p className="v2-body-sm" style={{ color: phase.status === 'current' ? 'var(--v2-text-secondary)' : 'var(--v2-text-muted)' }}>
                                    {phase.weeks.includes('-') ? `Weeks ${phase.weeks}` : `Week ${phase.weeks}`}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Weekly Overview */}
                <motion.section
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <h2 className="v2-heading-md mb-4">Weekly Plan</h2>
                    <div className="space-y-3">
                        {weeks.map((week, i) => (
                            <motion.div
                                key={week.number}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
                            >
                                <Link
                                    href={`/plan/week/${week.number}`}
                                    className={`v2-card v2-card-interactive p-5 block ${selectedWeek === week.number ? 'v2-card-selected' : ''
                                        } ${week.isCurrent ? 'ring-2 ring-[var(--v2-accent)] ring-offset-2 ring-offset-[var(--v2-bg-base)]' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center v2-mono"
                                                style={{ background: 'var(--v2-bg-hover)', fontWeight: 600 }}
                                            >
                                                W{week.number}
                                            </div>
                                            <div>
                                                <p className="v2-heading-sm flex items-center gap-2">
                                                    Week {week.number}
                                                    {week.isCurrent && <span className="v2-badge v2-badge-accent">Current</span>}
                                                    {week.cutback && <span className="v2-badge">Cutback</span>}
                                                </p>
                                                <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>{week.phase} Phase</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 text-center">
                                            <div>
                                                <p className="v2-heading-md v2-mono">{week.mileage}</p>
                                                <p className="v2-mono" style={{ fontSize: '10px', color: 'var(--v2-text-muted)' }}>miles</p>
                                            </div>
                                            <div>
                                                <p className="v2-heading-md v2-mono">{week.quality}</p>
                                                <p className="v2-mono" style={{ fontSize: '10px', color: 'var(--v2-text-muted)' }}>quality</p>
                                            </div>
                                            <svg className="w-5 h-5" style={{ color: 'var(--v2-text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Plan Stats */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <h2 className="v2-heading-md mb-4">Plan Overview</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="v2-card p-5">
                            <p className="v2-heading-lg v2-mono mb-1">{plan.totalWeeks}</p>
                            <p className="v2-label mb-1">Weeks</p>
                            <p className="v2-mono" style={{ fontSize: '10px', color: 'var(--v2-text-muted)' }}>Total plan length</p>
                        </div>
                        <div className="v2-card p-5">
                            <p className="v2-heading-lg v2-mono mb-1">{plan.peakMileage}</p>
                            <p className="v2-label mb-1">Peak Mi</p>
                            <p className="v2-mono" style={{ fontSize: '10px', color: 'var(--v2-text-muted)' }}>Week {plan.peakWeek}</p>
                        </div>
                        <div className="v2-card p-5">
                            <p className="v2-heading-lg v2-mono mb-1">{totalQualitySessions}</p>
                            <p className="v2-label mb-1">Quality</p>
                            <p className="v2-mono" style={{ fontSize: '10px', color: 'var(--v2-text-muted)' }}>Total sessions</p>
                        </div>
                        <div className="v2-card p-5">
                            <p className="v2-heading-lg v2-mono mb-1">{totalStrengthSessions}</p>
                            <p className="v2-label mb-1">Strength</p>
                            <p className="v2-mono" style={{ fontSize: '10px', color: 'var(--v2-text-muted)' }}>Total sessions</p>
                        </div>
                    </div>
                </motion.section>
            </main>
        </div>
    );
}
