"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { COACHES } from '@/config/coach-spec/methodology';
import { AppHeader } from '@/components/ui/AppHeader';
import { FlameIcon } from '@/components/ui/flame';
import { ActivityIcon } from '@/components/ui/activity';
import { ChartBarIncreasingIcon } from '@/components/ui/chart-bar-increasing';
import { CalendarDaysIcon } from '@/components/ui/calendar-days';
import { CheckIcon } from '@/components/ui/check';
import { PlayIcon } from '@/components/ui/play';
import { usePlan } from '@/domain/plan/context';
import { useAuth } from '@/domain/auth/context';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { InsightsCard } from '@/components/insights/InsightsCard';
import { WorkoutLog } from '@/domain/insights';
import { formatPace, getDayName, getFullDayName } from '@/lib/format';

/**
 * THE LONG GAME - Dashboard
 *
 * "What do I do today?" answered immediately with REAL data
 *
 * V2: Wired to real plan data via usePlan() hook
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

// getDayName, getFullDayName, formatPace imported from @/lib/format

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

    // Fetch athlete data on mount (now using auth context for user)
    useEffect(() => {
        const fetchAthleteData = async () => {
            if (!athleteId) {
                setDataLoading(false);
                return;
            }

            try {
                const { createSupabaseBrowserClient } = await import('@/infrastructure/supabase');
                const supabase = createSupabaseBrowserClient();

                // Get athlete profile
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

                // Get latest readiness from Garmin health metrics
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

                // Calculate streak from completed workouts
                const { count } = await supabase
                    .from('completed_workouts')
                    .select('*', { count: 'exact', head: true })
                    .eq('athlete_id', athleteId);

                // Simple streak - just count recent completions (could be improved)
                setStreak(Math.min(count || 0, 30));

                // Fetch workout logs for insights (last 60 days)
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
                            sessionType: 'run', // Default, could be improved with planned_workout lookup
                            domain: 'running' as const,
                            completed: (session.completed === 'full' ? 'full' : session.completed === 'partial' ? 'partial' : 'skipped') as 'full' | 'partial' | 'skipped',
                            feelRating: session.feelRating,
                            plannedDuration: 45, // Default
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
            // Small delay to prevent flash
            const timer = setTimeout(() => {
                router.push('/onboarding');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [status, plan, router, authStatus]);

    // Show skeleton during initial load
    if (status === 'loading' || authStatus === 'loading' || (dataLoading && !athlete)) {
        return <DashboardSkeleton />;
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
            // Return empty week structure
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

    // Domain colors
    const domainColors: Record<string, string> = {
        running: 'var(--color-running)',
        strength: 'var(--color-strength)',
        durability: 'var(--color-durability)',
    };

    const domainTints: Record<string, string> = {
        running: 'var(--domain-running-tint)',
        strength: 'var(--domain-strength-tint)',
        durability: 'var(--domain-durability-tint)',
    };

    const displayName = athlete?.name || plan?.athleteName || 'Athlete';
    const displayVdot = athlete?.vdot || plan?.vdot || 45;
    const displayReadiness = readinessScore ?? 85; // Fallback if no Garmin data

    return (
        <div className="min-h-screen landing-shell">
            <AppHeader streak={streak} />

            <main className="container-page py-10">
                {/* Greeting + Readiness */}
                <div className="flex items-start justify-between mb-10">
                    <div>
                        <p className="text-body-sm text-[var(--text-muted)] mb-1">{getGreeting()}</p>
                        <h1 className="text-display-md">{displayName}</h1>
                    </div>

                    {/* Readiness Ring */}
                    <div className="text-center">
                        <div className="relative w-20 h-20">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle className="progress-ring-bg" cx="50" cy="50" r="42" strokeWidth="8" />
                                <circle
                                    className="progress-ring-value"
                                    cx="50" cy="50" r="42"
                                    strokeWidth="8"
                                    strokeDasharray="264"
                                    strokeDashoffset={264 * (1 - displayReadiness / 100)}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-heading-lg text-data">{displayReadiness}</span>
                            </div>
                        </div>
                        <p className="text-label mt-2">Readiness</p>
                    </div>
                </div>

                {/* Today's Workouts */}
                <section className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-heading-md">Today's Plan</h2>
                        <div className="flex items-center gap-2">
                            <CalendarDaysIcon size={16} className="text-[var(--text-subtle)]" />
                            <span className="text-label">
                                {getFullDayName(new Date().getDay())} • Week {currentWeek || 1}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {todaysWorkouts.length > 0 ? (
                            todaysWorkouts.map((workout, i) => (
                                <Link
                                    key={workout.id}
                                    href={`/workout/${workout.id}`}
                                    className="card card-interactive p-5 flex items-center gap-4 animate-fade-in"
                                    style={{ animationDelay: `${i * 50}ms` }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{
                                            backgroundColor: domainTints[workout.domain],
                                            color: domainColors[workout.domain]
                                        }}
                                    >
                                        {workout.type === 'run' ? (
                                            <PlayIcon size={20} />
                                        ) : workout.type === 'strength' ? (
                                            <ChartBarIncreasingIcon size={20} />
                                        ) : (
                                            <ActivityIcon size={20} />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-heading-sm">{workout.title}</p>
                                        <p className="text-body-sm text-[var(--text-muted)]">{workout.subtitle}</p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-body-sm text-[var(--text-subtle)]">{workout.duration} min</p>
                                    </div>

                                    <svg className="w-5 h-5 text-[var(--text-subtle)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            ))
                        ) : (
                            <div className="card p-8 text-center">
                                <CheckIcon size={40} className="mx-auto mb-4 text-[var(--color-accent)]" />
                                <p className="text-heading-sm mb-2">Rest Day</p>
                                <p className="text-body-sm text-[var(--text-muted)]">Recovery is part of the plan. Enjoy it!</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Week Overview */}
                <section className="mb-10">
                    <h2 className="text-heading-md mb-4">This Week</h2>

                    <div className="card p-6">
                        <div className="grid grid-cols-7 gap-2">
                            {weekOverview.map((day) => (
                                <div
                                    key={day.day}
                                    className={`text-center py-3 rounded-xl transition-all ${day.today
                                        ? 'bg-[var(--color-accent)] text-black'
                                        : day.done
                                            ? 'bg-[var(--bg-muted)]'
                                            : ''
                                        }`}
                                >
                                    <p className="text-label mb-1">{day.day}</p>
                                    <p className={`text-caption ${day.today ? 'text-black/70' : ''}`}>
                                        {day.type === 'rest' ? '—' : day.label.split(' ')[0]}
                                    </p>
                                    {day.done && !day.today && (
                                        <CheckIcon size={12} className="mx-auto mt-1 text-[var(--color-accent)]" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Plan Overview Card */}
                {plan && (
                    <section className="mb-10">
                        <Link href="/plan" className="card card-interactive p-6 block">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-label text-[var(--text-muted)] mb-1">TRAINING PLAN</p>
                                    <p className="text-heading-sm">
                                        {plan.raceName || `${plan.goalDistance.toUpperCase()} Training`}
                                    </p>
                                    <p className="text-body-sm text-[var(--text-muted)] mt-1">
                                        Week {currentWeek} of {plan.totalWeeks} • {currentWeekPlan?.phase.toUpperCase()} phase
                                    </p>
                                </div>
                                <svg className="w-6 h-6 text-[var(--text-subtle)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    </section>
                )}

                {/* Stats Row */}
                <section>
                    <h2 className="text-heading-md mb-4">Quick Stats</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="card p-4 text-center">
                            <FlameIcon size={24} className="mx-auto mb-2 text-[var(--color-accent)]" />
                            <p className="text-heading-lg text-data">{streak}</p>
                            <p className="text-caption text-[var(--text-muted)]">Day Streak</p>
                        </div>
                        <div className="card p-4 text-center">
                            <ChartBarIncreasingIcon size={24} className="mx-auto mb-2 text-[var(--color-accent)]" />
                            <p className="text-heading-lg text-data">{displayVdot}</p>
                            <p className="text-caption text-[var(--text-muted)]">VDOT</p>
                        </div>
                        <div className="card p-4 text-center">
                            <CalendarDaysIcon size={24} className="mx-auto mb-2 text-[var(--color-accent)]" />
                            <p className="text-heading-lg text-data">{plan?.totalWeeks || 0}</p>
                            <p className="text-caption text-[var(--text-muted)]">Total Weeks</p>
                        </div>
                    </div>
                </section>

                {/* Training Insights */}
                <section className="mt-10">
                    <h2 className="text-heading-md mb-4">Training Insights</h2>
                    <InsightsCard workoutLogs={workoutLogs} />
                </section>
            </main>
        </div>
    );
}
