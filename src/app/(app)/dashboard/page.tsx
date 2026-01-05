"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { COACHES } from '@/config/coach-spec/methodology';
import { FlameIcon } from '@/components/ui/flame';
import { ActivityIcon } from '@/components/ui/activity';
import { ChartBarIncreasingIcon } from '@/components/ui/chart-bar-increasing';
import { CalendarDaysIcon } from '@/components/ui/calendar-days';
import { CheckIcon } from '@/components/ui/check';
import { PlayIcon } from '@/components/ui/play';
import { usePlan } from '@/domain/plan/context';
import { useAuth } from '@/domain/auth/context';
import { InsightsCard } from '@/components/insights/InsightsCard';
import { WorkoutLog } from '@/domain/insights';
import { formatPace, getDayName, getFullDayName } from '@/lib/format';
import { motion } from 'framer-motion';

/**
 * THE LONG GAME - Dashboard V2
 *
 * "What do I do today?" answered immediately with REAL data
 * Week aesthetic: Dark, atmospheric, light typography
 */

// =============================================================================
// TYPES
// =============================================================================

interface DashboardWorkout {
    id: string;
    type: 'run' | 'strength' | 'durability';
    title: string;
    subtitle: string;
    domain: 'running' | 'strength' | 'durability';
    duration: number;
    completed: boolean;
}

interface DayOverview {
    day: string;
    type: string;
    label: string;
    done: boolean;
    today?: boolean;
}

interface Athlete {
    name: string;
    vdot: number;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

// =============================================================================
// SKELETON
// =============================================================================

function DashboardSkeletonV2() {
    return (
        <div className="v2-root min-h-screen">
            <header className="v2-nav">
                <div className="v2-container flex items-center justify-between py-4">
                    <div className="v2-skeleton" style={{ width: '120px', height: '24px' }} />
                    <div className="v2-skeleton" style={{ width: '100px', height: '32px' }} />
                </div>
            </header>
            <main className="v2-container py-10">
                <div className="flex items-start justify-between mb-10">
                    <div>
                        <div className="v2-skeleton mb-2" style={{ width: '100px', height: '14px' }} />
                        <div className="v2-skeleton" style={{ width: '180px', height: '32px' }} />
                    </div>
                    <div className="v2-skeleton rounded-full" style={{ width: '80px', height: '80px' }} />
                </div>
                <div className="v2-skeleton mb-6" style={{ width: '150px', height: '24px' }} />
                <div className="v2-skeleton mb-4" style={{ width: '100%', height: '80px', borderRadius: '12px' }} />
                <div className="v2-skeleton" style={{ width: '100%', height: '80px', borderRadius: '12px' }} />
            </main>
        </div>
    );
}

// =============================================================================
// DASHBOARD PAGE
// =============================================================================

export default function DashboardPage() {
    const router = useRouter();
    const { status, plan, currentWeek, todayWorkout, currentWeekPlan } = usePlan();
    const { user, athleteId, status: authStatus } = useAuth();
    const [athlete, setAthlete] = useState<Athlete | null>(null);
    const [readinessScore, setReadinessScore] = useState<number | null>(null);
    const [streak, setStreak] = useState(0);
    const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    // Fetch athlete data on mount
    useEffect(() => {
        const fetchAthleteData = async () => {
            if (!athleteId) {
                setDataLoading(false);
                return;
            }

            try {
                const { createSupabaseBrowserClient } = await import('@/infrastructure/supabase');
                const supabase = createSupabaseBrowserClient();

                const { data: athleteData } = await supabase
                    .from('athletes')
                    .select('name, age')
                    .eq('id', athleteId)
                    .single();

                if (athleteData) {
                    setAthlete({
                        name: athleteData.name || user?.email?.split('@')[0] || 'Athlete',
                        vdot: plan?.vdot || 45,
                    });
                } else if (plan) {
                    setAthlete({
                        name: plan.athleteName || user?.email?.split('@')[0] || 'Athlete',
                        vdot: plan.vdot,
                    });
                }

                const { data: healthData } = await supabase
                    .from('garmin_health_metrics')
                    .select('readiness_score')
                    .eq('athlete_id', athleteId)
                    .order('summary_date', { ascending: false })
                    .limit(1)
                    .single();

                if (healthData?.readiness_score) {
                    setReadinessScore(healthData.readiness_score);
                }

                const { count } = await supabase
                    .from('completed_workouts')
                    .select('*', { count: 'exact', head: true })
                    .eq('athlete_id', athleteId);

                setStreak(Math.min(count || 0, 30));

                const sixtyDaysAgo = new Date();
                sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
                const { data: completedWorkouts } = await supabase
                    .from('completed_workouts')
                    .select('id, completed_date, actual_session, planned_workout_id')
                    .eq('athlete_id', athleteId)
                    .gte('completed_date', sixtyDaysAgo.toISOString().split('T')[0])
                    .order('completed_date', { ascending: false });

                if (completedWorkouts && completedWorkouts.length > 0) {
                    const logs: WorkoutLog[] = completedWorkouts.map(w => {
                        const session = w.actual_session as { completed?: string; feelRating?: number } || {};
                        return {
                            id: w.id,
                            date: new Date(w.completed_date),
                            sessionType: 'run',
                            domain: 'running' as const,
                            completed: (session.completed === 'full' ? 'full' : session.completed === 'partial' ? 'partial' : 'skipped') as 'full' | 'partial' | 'skipped',
                            feelRating: session.feelRating,
                            plannedDuration: 45,
                        };
                    });
                    setWorkoutLogs(logs);
                }
            } catch (error) {
                console.warn('Failed to fetch athlete data:', error);
            } finally {
                setDataLoading(false);
            }
        };

        if (authStatus === 'authenticated' && (status === 'ready' || status === 'idle')) {
            fetchAthleteData();
        } else if (authStatus !== 'loading' && status !== 'loading') {
            setDataLoading(false);
        }
    }, [status, plan, athleteId, user, authStatus]);

    // Redirect to onboarding if no plan
    useEffect(() => {
        if (status === 'idle' && !plan && authStatus === 'authenticated') {
            const timer = setTimeout(() => {
                router.push('/onboarding');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [status, plan, router, authStatus]);

    // Show skeleton during initial load
    if (status === 'loading' || authStatus === 'loading' || (dataLoading && !athlete)) {
        return <DashboardSkeletonV2 />;
    }

    // Build today's workouts from plan data
    const todaysWorkouts = useMemo<DashboardWorkout[]>(() => {
        if (!todayWorkout) return [];

        const workouts: DashboardWorkout[] = [];

        if (todayWorkout.runWorkout) {
            const run = todayWorkout.runWorkout;
            const paceStr = plan?.paces
                ? formatPace(plan.paces.easy.min)
                : '';

            workouts.push({
                id: `${todayWorkout.date}-run`,
                type: 'run',
                title: run.name,
                subtitle: `${run.totalDistance} mi${paceStr ? ` @ ${paceStr}` : ''}`,
                domain: 'running',
                duration: run.estimatedDuration,
                completed: false,
            });
        }

        if (todayWorkout.strengthWorkout) {
            const strength = todayWorkout.strengthWorkout;
            const exerciseSummary = strength.exercises
                .slice(0, 2)
                .map(e => `${e.name} ${e.sets}×${e.reps}`)
                .join(' • ');

            workouts.push({
                id: `${todayWorkout.date}-strength`,
                type: 'strength',
                title: strength.name,
                subtitle: exerciseSummary || 'Strength session',
                domain: 'strength',
                duration: strength.duration,
                completed: false,
            });
        }

        return workouts;
    }, [todayWorkout, plan]);

    // Build week overview from plan data
    const weekOverview = useMemo<DayOverview[]>(() => {
        if (!currentWeekPlan) {
            return [0, 1, 2, 3, 4, 5, 6].map(i => ({
                day: getDayName(i),
                type: 'rest',
                label: '—',
                done: false,
                today: i === new Date().getDay(),
            }));
        }

        const todayDayOfWeek = new Date().getDay();

        return [0, 1, 2, 3, 4, 5, 6].map(dayNum => {
            const dayPlan = currentWeekPlan.days.find(d => d.dayOfWeek === dayNum);
            const isToday = dayNum === todayDayOfWeek;
            const isPast = dayNum < todayDayOfWeek;

            if (!dayPlan || !dayPlan.runWorkout) {
                return {
                    day: getDayName(dayNum),
                    type: 'rest',
                    label: 'Rest',
                    done: isPast,
                    today: isToday,
                };
            }

            const workout = dayPlan.runWorkout;
            const typeMap: Record<string, string> = {
                'easy': 'easy',
                'recovery': 'easy',
                'tempo': 'tempo',
                'threshold': 'tempo',
                'cruise_intervals': 'intervals',
                'vo2max_800s': 'intervals',
                'vo2max_1000s': 'intervals',
                'vo2max_1200s': 'intervals',
                'vo2max_mile': 'intervals',
                'long_easy': 'long',
                'long_progression': 'long',
                'long_mp_finish': 'long',
                'long_fast_finish': 'long',
            };

            return {
                day: getDayName(dayNum),
                type: typeMap[workout.type] || 'easy',
                label: `${workout.type.replace(/_/g, ' ')} ${dayPlan.totalMiles}mi`,
                done: isPast,
                today: isToday,
            };
        });
    }, [currentWeekPlan]);

    const displayName = athlete?.name || plan?.athleteName || 'Athlete';
    const displayVdot = athlete?.vdot || plan?.vdot || 45;
    const displayReadiness = readinessScore ?? 85;

    return (
        <div className="v2-root min-h-screen">
            {/* Header */}
            <header className="v2-nav sticky top-0 z-50">
                <div className="v2-container flex items-center justify-between py-4">
                    <Link href="/" className="v2-nav-logo">The Long Game</Link>
                    <nav className="flex items-center gap-4">
                        <Link href="/settings" className="v2-nav-link">Settings</Link>
                        {streak > 0 && (
                            <span className="v2-badge v2-badge-accent flex items-center gap-1">
                                <FlameIcon size={12} /> {streak} day streak
                            </span>
                        )}
                    </nav>
                </div>
            </header>

            <main className="v2-container py-10">
                {/* Greeting + Readiness */}
                <motion.div
                    className="flex items-start justify-between mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div>
                        <p className="v2-body-sm mb-1" style={{ color: 'var(--v2-text-muted)' }}>{getGreeting()}</p>
                        <h1 className="v2-heading-lg">{displayName}</h1>
                    </div>

                    {/* Readiness Ring */}
                    <div className="text-center">
                        <div className="relative w-20 h-20">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    cx="50" cy="50" r="42"
                                    strokeWidth="8"
                                    fill="none"
                                    stroke="var(--v2-bg-elevated)"
                                />
                                <circle
                                    cx="50" cy="50" r="42"
                                    strokeWidth="8"
                                    fill="none"
                                    stroke="var(--v2-accent)"
                                    strokeDasharray="264"
                                    strokeDashoffset={264 * (1 - displayReadiness / 100)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="v2-heading-md v2-mono">{displayReadiness}</span>
                            </div>
                        </div>
                        <p className="v2-label mt-2">Readiness</p>
                    </div>
                </motion.div>

                {/* Today's Workouts */}
                <motion.section
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="v2-heading-md">Today&apos;s Plan</h2>
                        <div className="flex items-center gap-2">
                            <CalendarDaysIcon size={16} className="v2-icon-color-muted" />
                            <span className="v2-label">
                                {getFullDayName(new Date().getDay())} • Week {currentWeek || 1}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {todaysWorkouts.length > 0 ? (
                            todaysWorkouts.map((workout, i) => (
                                <motion.div
                                    key={workout.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                                >
                                    <Link
                                        href={`/workout/${workout.id}`}
                                        className="v2-card v2-card-interactive p-5 flex items-center gap-4"
                                    >
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                                            style={{
                                                backgroundColor: workout.domain === 'running'
                                                    ? 'var(--v2-accent-subtle)'
                                                    : workout.domain === 'strength'
                                                        ? 'var(--v2-secondary-subtle)'
                                                        : 'var(--v2-bg-elevated)',
                                            }}
                                        >
                                            {workout.type === 'run' ? (
                                                <PlayIcon size={20} className="v2-accent" />
                                            ) : workout.type === 'strength' ? (
                                                <ChartBarIncreasingIcon size={20} style={{ color: 'var(--v2-secondary)' }} />
                                            ) : (
                                                <ActivityIcon size={20} />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <p className="v2-heading-sm">{workout.title}</p>
                                            <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>{workout.subtitle}</p>
                                        </div>

                                        <div className="text-right">
                                            <p className="v2-mono" style={{ fontSize: '12px', color: 'var(--v2-text-subtle)' }}>{workout.duration} min</p>
                                        </div>

                                        <svg className="w-5 h-5" style={{ color: 'var(--v2-text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </motion.div>
                            ))
                        ) : (
                            <div className="v2-card p-8 text-center">
                                <CheckIcon size={40} className="mx-auto mb-4 v2-accent" />
                                <p className="v2-heading-sm mb-2">Rest Day</p>
                                <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>Recovery is part of the plan. Enjoy it!</p>
                            </div>
                        )}
                    </div>
                </motion.section>

                {/* Week Overview - Week Grid Style */}
                <motion.section
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="v2-heading-md">This Week</h2>
                        {plan && (
                            <span className="v2-mono" style={{ fontSize: '11px', color: 'var(--v2-text-subtle)' }}>
                                Week {currentWeek} • {currentWeekPlan?.phase.toUpperCase()} • {currentWeekPlan?.totalMiles || 0} miles
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {weekOverview.map((day, i) => (
                            <motion.div
                                key={day.day}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.25 + i * 0.03 }}
                                className={`v2-card text-center py-4 px-2 ${day.today ? 'v2-card-accent' : ''}`}
                                style={{
                                    background: day.today
                                        ? 'var(--v2-bg-active)'
                                        : day.done
                                            ? 'var(--v2-bg-elevated)'
                                            : 'var(--v2-bg-elevated)',
                                    borderColor: day.today ? 'var(--v2-accent)' : undefined,
                                }}
                            >
                                <p className="v2-label mb-2" style={{ color: day.today ? 'var(--v2-accent)' : 'var(--v2-text-muted)' }}>
                                    {day.day}
                                </p>
                                <p className="v2-mono mb-1" style={{
                                    fontSize: '11px',
                                    color: day.today ? 'var(--v2-text-primary)' : 'var(--v2-text-tertiary)'
                                }}>
                                    {day.type === 'rest' ? '—' : day.label.split(' ')[0]}
                                </p>
                                {day.done && !day.today && (
                                    <CheckIcon size={12} className="mx-auto v2-accent" />
                                )}
                                {day.today && (
                                    <div className="w-1.5 h-1.5 rounded-full mx-auto mt-1" style={{ background: 'var(--v2-accent)' }} />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Plan Overview Card */}
                {plan && (
                    <motion.section
                        className="mb-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Link href="/plan" className="v2-card v2-card-interactive p-6 block">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="v2-label mb-1" style={{ color: 'var(--v2-text-muted)' }}>TRAINING PLAN</p>
                                    <p className="v2-heading-sm">
                                        {plan.raceName || `${plan.goalDistance.toUpperCase()} Training`}
                                    </p>
                                    <p className="v2-body-sm mt-1" style={{ color: 'var(--v2-text-muted)' }}>
                                        Week {currentWeek} of {plan.totalWeeks} • {currentWeekPlan?.phase.toUpperCase()} phase
                                    </p>
                                </div>
                                <svg className="w-6 h-6" style={{ color: 'var(--v2-text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    </motion.section>
                )}

                {/* Stats Row */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                >
                    <h2 className="v2-heading-md mb-4">Quick Stats</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="v2-card p-4 text-center">
                            <FlameIcon size={24} className="mx-auto mb-2 v2-accent" />
                            <p className="v2-heading-md v2-mono">{streak}</p>
                            <p className="v2-mono" style={{ fontSize: '10px', color: 'var(--v2-text-muted)' }}>Day Streak</p>
                        </div>
                        <div className="v2-card p-4 text-center">
                            <ChartBarIncreasingIcon size={24} className="mx-auto mb-2 v2-accent" />
                            <p className="v2-heading-md v2-mono">{displayVdot}</p>
                            <p className="v2-mono" style={{ fontSize: '10px', color: 'var(--v2-text-muted)' }}>VDOT</p>
                        </div>
                        <div className="v2-card p-4 text-center">
                            <CalendarDaysIcon size={24} className="mx-auto mb-2 v2-accent" />
                            <p className="v2-heading-md v2-mono">{plan?.totalWeeks || 0}</p>
                            <p className="v2-mono" style={{ fontSize: '10px', color: 'var(--v2-text-muted)' }}>Total Weeks</p>
                        </div>
                    </div>
                </motion.section>

                {/* Training Insights */}
                <motion.section
                    className="mt-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <h2 className="v2-heading-md mb-4">Training Insights</h2>
                    <InsightsCard workoutLogs={workoutLogs} />
                </motion.section>
            </main>
        </div>
    );
}
