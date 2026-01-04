"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '@/components/ui/AppHeader';
import { usePlan } from '@/domain/plan/context';
import { TrainingPlan, WeekPlan, TrainingPhase } from '@/domain/plan/types';

/**
 * Training Plan View
 *
 * V2: Wired to real plan data from usePlan() hook
 * No more mock data!
 */

// =============================================================================
// TYPES
// =============================================================================

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

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatPhaseDisplay(plan: TrainingPlan, currentWeekNum: number): PhaseDisplay[] {
    if (!plan.phases || plan.phases.length === 0) {
        // Generate phases from weeks if not available
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
    // Show a window of weeks around current (±3)
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

// =============================================================================
// PLAN PAGE
// =============================================================================

export default function PlanPage() {
    const router = useRouter();
    const { status, plan, currentWeek } = usePlan();
    const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

    // Compute derived data
    const phases = useMemo(() => {
        if (!plan) return [];
        return formatPhaseDisplay(plan, currentWeek || 1);
    }, [plan, currentWeek]);

    const weeks = useMemo(() => {
        if (!plan) return [];
        return formatWeekDisplay(plan.weeks, currentWeek || 1);
    }, [plan, currentWeek]);

    const weeksUntilRace = plan?.raceDate ? getWeeksUntilRace(plan.raceDate) : null;

    // Set initial selected week
    if (selectedWeek === null && currentWeek) {
        setSelectedWeek(currentWeek);
    }

    // Loading state
    if (status === 'loading') {
        return (
            <div className="min-h-screen landing-shell">
                <AppHeader backHref="/dashboard" title="Training Plan" />
                <main className="container-page py-10">
                    <div className="animate-pulse space-y-6">
                        <div className="h-20 bg-[var(--bg-muted)] rounded-xl" />
                        <div className="h-60 bg-[var(--bg-muted)] rounded-xl" />
                        <div className="h-40 bg-[var(--bg-muted)] rounded-xl" />
                    </div>
                </main>
            </div>
        );
    }

    // No plan state
    if (!plan) {
        return (
            <div className="min-h-screen landing-shell">
                <AppHeader backHref="/dashboard" title="Training Plan" />
                <main className="container-page py-10">
                    <div className="card p-10 text-center">
                        <h2 className="text-heading-md mb-4">No Training Plan</h2>
                        <p className="text-body-sm text-[var(--text-muted)] mb-6">
                            Complete onboarding to generate your personalized training plan.
                        </p>
                        <Link href="/onboarding" className="btn btn-gradient">
                            Get Started
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    // Calculate plan stats
    const totalQualitySessions = plan.weeks.reduce((sum, w) => sum + w.keyWorkouts, 0);
    const totalStrengthSessions = plan.weeks.reduce((sum, w) =>
        sum + w.days.filter(d => d.strengthWorkout).length, 0
    );

    return (
        <div className="min-h-screen landing-shell">
            <AppHeader
                backHref="/dashboard"
                title="Training Plan"
                rightContent={
                    <div className="flex items-center gap-2">
                        <span className="text-label">
                            {plan.raceName || `${plan.goalDistance.toUpperCase()} Training`}
                        </span>
                        {weeksUntilRace !== null && weeksUntilRace > 0 && (
                            <>
                                <span className="text-[var(--text-subtle)]">•</span>
                                <span className="text-body-sm text-[var(--color-accent)]">
                                    {weeksUntilRace} weeks away
                                </span>
                            </>
                        )}
                    </div>
                }
            />

            <main className="container-page py-10">
                {/* Phase Timeline */}
                <section className="mb-10">
                    <h2 className="text-heading-md mb-4">Training Phases</h2>

                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {phases.map((phase) => (
                            <div
                                key={phase.name}
                                className={`flex-1 min-w-[100px] p-4 rounded-xl border transition-all ${phase.status === 'current'
                                    ? 'bg-[var(--color-accent)] text-black border-transparent'
                                    : phase.status === 'completed'
                                        ? 'bg-[var(--bg-muted)] border-transparent opacity-60'
                                        : 'bg-[var(--bg-elevated)] border-[var(--border-base)]'
                                    }`}
                            >
                                <p className="font-semibold">{phase.name}</p>
                                <p className={`text-body-sm ${phase.status === 'current' ? 'text-black/70' : 'text-[var(--text-muted)]'}`}>
                                    {phase.weeks.includes('-') ? `Weeks ${phase.weeks}` : `Week ${phase.weeks}`}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Weekly Overview */}
                <section className="mb-10">
                    <h2 className="text-heading-md mb-4">Weekly Plan</h2>

                    <div className="space-y-3">
                        {weeks.map((week) => (
                            <Link
                                key={week.number}
                                href={`/plan/week/${week.number}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedWeek(week.number);
                                }}
                                className={`card p-5 block cursor-pointer transition-all ${selectedWeek === week.number ? 'border-[var(--color-accent)]' : ''
                                    } ${week.isCurrent ? 'ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--bg-base)]' : ''}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[var(--bg-muted)] flex items-center justify-center font-bold">
                                            W{week.number}
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                Week {week.number}
                                                {week.isCurrent && <span className="ml-2 badge badge-accent">Current</span>}
                                                {week.cutback && <span className="ml-2 badge badge-warning">Cutback</span>}
                                            </p>
                                            <p className="text-body-sm text-[var(--text-muted)]">{week.phase} Phase</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 text-center">
                                        <div>
                                            <p className="text-heading-lg text-data">{week.mileage}</p>
                                            <p className="text-caption text-[var(--text-muted)]">miles</p>
                                        </div>
                                        <div>
                                            <p className="text-heading-lg text-data">{week.quality}</p>
                                            <p className="text-caption text-[var(--text-muted)]">quality</p>
                                        </div>
                                        <svg className="w-5 h-5 text-[var(--text-subtle)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Plan Stats */}
                <section>
                    <h2 className="text-heading-md mb-4">Plan Overview</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="card p-5">
                            <p className="text-display-md text-data mb-1">{plan.totalWeeks}</p>
                            <p className="text-label mb-1">Weeks</p>
                            <p className="text-caption text-[var(--text-muted)]">Total plan length</p>
                        </div>
                        <div className="card p-5">
                            <p className="text-display-md text-data mb-1">{plan.peakMileage}</p>
                            <p className="text-label mb-1">Peak Mi</p>
                            <p className="text-caption text-[var(--text-muted)]">Week {plan.peakWeek}</p>
                        </div>
                        <div className="card p-5">
                            <p className="text-display-md text-data mb-1">{totalQualitySessions}</p>
                            <p className="text-label mb-1">Quality</p>
                            <p className="text-caption text-[var(--text-muted)]">Total sessions</p>
                        </div>
                        <div className="card p-5">
                            <p className="text-display-md text-data mb-1">{totalStrengthSessions}</p>
                            <p className="text-label mb-1">Strength</p>
                            <p className="text-caption text-[var(--text-muted)]">Total sessions</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
