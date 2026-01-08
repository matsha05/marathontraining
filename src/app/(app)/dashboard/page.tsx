"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { COACHES } from '@/config/coach-spec/methodology';
import { CheckIcon } from '@/components/ui/check';
import { PlayIcon } from '@/components/ui/play';
import { ActivityIcon } from '@/components/ui/activity';
import { ChartBarIncreasingIcon } from '@/components/ui/chart-bar-increasing';
import { CalendarDaysIcon } from '@/components/ui/calendar-days';
import { usePlan } from '@/domain/plan/context';
import { useAuth } from '@/domain/auth/context';
import { IntensityDistributionCard } from '@/components/insights/IntensityDistributionCard';
import { WorkoutLog, WorkoutForIntensity } from '@/domain/insights';
import { getDayName, getFullDayName, formatPace } from '@/lib/format';
import { motion } from 'framer-motion';
import { PacesCard } from '@/components/paces/PacesCard';
import { RecalibrationModal } from '@/components/vdot/RecalibrationModal';
import { DurabilityStatusCard } from '@/components/durability';
import { SiteHeader } from '@/components/ui/SiteHeader';
import { WeeklyCalendar } from '@/components/ui/WeeklyCalendar';
import confetti from 'canvas-confetti';
import { RaceCommandBar, CoachingWhisper, MileageGauge, PhaseTimeline, extractPhasesFromWeeks } from '@/components/dashboard';
import { toDateKey } from '@/lib/dates';

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
    age: number | null;
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
        <div className="v3-root min-h-screen">
            <header className="v3-nav">
                <div className="v3-container flex items-center justify-between py-4">
                    <div className="v3-skeleton" style={{ width: '120px', height: '24px' }} />
                    <div className="v3-skeleton" style={{ width: '100px', height: '32px' }} />
                </div>
            </header>
            <main className="v3-container py-10">
                <div className="flex items-start justify-between mb-10">
                    <div>
                        <div className="v3-skeleton mb-2" style={{ width: '100px', height: '14px' }} />
                        <div className="v3-skeleton" style={{ width: '180px', height: '32px' }} />
                    </div>
                    <div className="v3-skeleton rounded-full" style={{ width: '80px', height: '80px' }} />
                </div>
                <div className="v3-skeleton mb-6" style={{ width: '150px', height: '24px' }} />
                <div className="v3-skeleton mb-4" style={{ width: '100%', height: '80px', borderRadius: '12px' }} />
                <div className="v3-skeleton" style={{ width: '100%', height: '80px', borderRadius: '12px' }} />
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

    const [streak, setStreak] = useState(0);
    const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [showRecalibrationModal, setShowRecalibrationModal] = useState(false);
    const [displayVdotOverride, setDisplayVdotOverride] = useState<number | null>(null);
    const [maxHROverride, setMaxHROverride] = useState<number | null>(null);
    const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
    const [viewingWeek, setViewingWeek] = useState<number | null>(null);  // null = current week

    // Handle VDOT recalibration
    const handleRecalibrate = async (newVdot: number) => {
        setDisplayVdotOverride(newVdot);
        // VDOT override persisted in display state; future: sync to Supabase
    };

    // Handle max HR update
    const handleMaxHRUpdate = (newMaxHR: number) => {
        setMaxHROverride(newMaxHR);
        // Max HR override persisted in display state; future: sync to Supabase
    };

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
                        age: athleteData.age || null,
                    });
                } else if (plan) {
                    setAthlete({
                        name: plan.athleteName || user?.email?.split('@')[0] || 'Athlete',
                        vdot: plan.vdot,
                        age: null,
                    });
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
                    .gte('completed_date', toDateKey(sixtyDaysAgo))
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
    // Safety checks:
    // - Only redirect when status is DEFINITIVELY 'idle' (plan load complete, no plan found)
    // - Never redirect while 'loading' (plan load in progress)
    // - Only redirect when authenticated (middleware handles unauthenticated)
    useEffect(() => {
        // Don't redirect while loading - wait for definitive answer
        if (status === 'loading') return;

        if (status === 'idle' && !plan && authStatus === 'authenticated') {
            const timer = setTimeout(() => {
                router.push('/onboarding');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [status, plan, router, authStatus]);

    // Build today's workouts from plan data - MUST be before any conditional returns
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

    // Build week overview from plan data - MUST be before any conditional returns
    const weekOverview = useMemo(() => {
        const today = new Date();
        const todayDayOfWeek = today.getDay();

        // Calculate start of the current week (Sunday)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - todayDayOfWeek);

        if (!currentWeekPlan) {
            return [0, 1, 2, 3, 4, 5, 6].map(i => {
                const dayDate = new Date(startOfWeek);
                dayDate.setDate(startOfWeek.getDate() + i);
                const dateStr = toDateKey(dayDate);

                return {
                    day: getDayName(i).toUpperCase(),
                    type: 'rest',
                    label: 'Rest',
                    done: false,
                    today: i === todayDayOfWeek,
                    distance: undefined,
                    workoutType: 'rest' as const,
                    date: dateStr,
                    hasStrength: false,
                };
            });
        }

        // Use viewing week if navigating, otherwise current week
        const activeWeekNum = viewingWeek ?? currentWeek ?? 1;
        const activeWeekPlan = plan?.weeks.find(w => w.weekNumber === activeWeekNum) ?? currentWeekPlan;

        if (!activeWeekPlan) {
            return [0, 1, 2, 3, 4, 5, 6].map(i => ({
                day: getDayName(i).toUpperCase(),
                type: 'rest',
                label: 'Rest',
                done: false,
                today: false,
                distance: undefined,
                workoutType: 'rest' as const,
                date: '',
                hasStrength: false,
            }));
        }

        // Calculate the start of this specific week based on plan start date
        const planStartDate = plan?.weeks[0]?.weekOf;
        const planStart = planStartDate ? new Date(planStartDate + 'T12:00:00') : new Date();
        const weekStart = new Date(planStart);
        weekStart.setDate(planStart.getDate() + (activeWeekNum - 1) * 7);

        // today is already defined at the start of the useMemo
        const isCurrentWeek = activeWeekNum === currentWeek;

        return [0, 1, 2, 3, 4, 5, 6].map(dayNum => {
            const dayPlan = activeWeekPlan.days.find(d => d.dayOfWeek === dayNum);

            // Calculate the actual date for this day
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + dayNum);
            const dateStr = toDateKey(dayDate);

            const isToday = isCurrentWeek && toDateKey(today) === dateStr;
            const isPast = dayDate < today && !isToday;

            if (!dayPlan || !dayPlan.runWorkout) {
                return {
                    day: getDayName(dayNum).toUpperCase(),
                    type: 'rest',
                    label: 'Rest',
                    done: isPast,
                    today: isToday,
                    distance: undefined,
                    workoutType: 'rest' as const,
                    date: dateStr,
                };
            }

            const workout = dayPlan.runWorkout;

            // Map workout type to display type and color category
            const typeInfo: Record<string, { label: string; workoutType: 'easy' | 'long' | 'quality' | 'recovery' | 'rest' }> = {
                'easy': { label: 'Easy', workoutType: 'easy' },
                'recovery': { label: 'Recovery', workoutType: 'recovery' },
                'tempo': { label: 'Tempo', workoutType: 'quality' },
                'threshold': { label: 'Threshold', workoutType: 'quality' },
                'cruise_intervals': { label: 'Intervals', workoutType: 'quality' },
                'vo2max_800s': { label: 'VO2', workoutType: 'quality' },
                'vo2max_1000s': { label: 'VO2', workoutType: 'quality' },
                'vo2max_1200s': { label: 'VO2', workoutType: 'quality' },
                'vo2max_mile': { label: 'VO2', workoutType: 'quality' },
                'long_easy': { label: 'Long', workoutType: 'long' },
                'long_progression': { label: 'Long', workoutType: 'long' },
                'long_mp_finish': { label: 'Long', workoutType: 'long' },
                'long_fast_finish': { label: 'Long', workoutType: 'long' },
            };

            const info = typeInfo[workout.type] || { label: 'Easy', workoutType: 'easy' as const };
            const hasStrength = !!dayPlan.strengthWorkout;

            return {
                day: getDayName(dayNum).toUpperCase(),
                type: info.label.toLowerCase(),
                label: info.label,
                done: isPast,
                today: isToday,
                distance: dayPlan.totalMiles,
                workoutType: info.workoutType,
                hasStrength,
                date: dateStr,
            };
        });
    }, [currentWeekPlan, viewingWeek, currentWeek, plan]);

    // Determine if today is a quality session (Starrett: "before I go smash myself")
    const isQualityDay = useMemo(() => {
        if (!todayWorkout?.runWorkout) return false;
        const workoutType = todayWorkout.runWorkout.type;
        const qualityTypes = ['tempo', 'threshold', 'cruise_intervals', 'vo2max_800s', 'vo2max_1000s',
            'vo2max_1200s', 'vo2max_mile', 'long_easy', 'long_progression', 'long_mp_finish', 'long_fast_finish'];
        return qualityTypes.includes(workoutType);
    }, [todayWorkout]);

    // Show skeleton during initial load - AFTER all hooks are declared
    if (status === 'loading' || authStatus === 'loading' || (dataLoading && !athlete)) {
        return <DashboardSkeletonV2 />;
    }

    const displayName = athlete?.name || plan?.athleteName || 'Athlete';
    const displayVdot = displayVdotOverride || athlete?.vdot || plan?.vdot || 45;


    return (
        <div className="v3-root min-h-screen">
            {/* Use shared SiteHeader for consistency */}
            <SiteHeader />

            <main className="v3-container py-10" style={{ paddingTop: 'calc(var(--v3-space-10) + 80px)' }}>
                {/* Race Command Bar - Premium Dense Hero */}
                {plan && (
                    <RaceCommandBar
                        plan={plan}
                        currentWeek={currentWeek}
                        currentWeekPlan={currentWeekPlan}
                        vdot={displayVdot}
                        athleteName={displayName}
                    />
                )}

                {/* Phase Timeline */}
                {plan && plan.weeks.length > 0 && (
                    <PhaseTimeline
                        phases={extractPhasesFromWeeks(plan.weeks.map(w => ({ weekNumber: w.weekNumber, phase: w.phase })))}
                        currentWeek={currentWeek || 1}
                        totalWeeks={plan.totalWeeks}
                    />
                )}

                {/* Pre-workout readiness nudge on quality days (Starrett methodology) */}
                {isQualityDay && (
                    <motion.div
                        className="mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.08 }}
                    >
                        <DurabilityStatusCard compact isQualityDay={isQualityDay} />
                    </motion.div>
                )}

                {/* Today's Workouts */}
                <motion.section
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="v3-heading-md">Today&apos;s Plan</h2>
                        <div className="flex items-center gap-2">
                            <CalendarDaysIcon size={16} className="v3-icon-color-muted" />
                            <span className="v3-label">
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
                                    className="flex items-center gap-2"
                                >
                                    <Link
                                        href={`/workout/${workout.id}`}
                                        className="v3-card v3-card-interactive p-5 flex items-center gap-4 flex-1"
                                    >
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                                            style={{
                                                backgroundColor: workout.domain === 'running'
                                                    ? 'var(--color-accent-subtle)'
                                                    : workout.domain === 'strength'
                                                        ? 'var(--color-strength-subtle)'
                                                        : 'var(--bg-elevated)',
                                            }}
                                        >
                                            {workout.type === 'run' ? (
                                                <PlayIcon size={20} className="v3-accent" />
                                            ) : workout.type === 'strength' ? (
                                                <ChartBarIncreasingIcon size={20} style={{ color: 'var(--color-strength)' }} />
                                            ) : (
                                                <ActivityIcon size={20} />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <p className="v3-heading-md" style={{ fontWeight: 600 }}>{workout.title}</p>
                                            <p className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>{workout.subtitle}</p>
                                        </div>

                                        <div className="text-right">
                                            <p className="v3-mono" style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>{workout.duration} min</p>
                                        </div>

                                        <svg className="w-5 h-5" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>

                                    {/* Mark Complete Button - Apple-style circle */}
                                    {!completedToday.has(workout.id) ? (
                                        <button
                                            onClick={(e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                const x = (rect.left + rect.width / 2) / window.innerWidth;
                                                const y = (rect.top + rect.height / 2) / window.innerHeight;

                                                // Sleek confetti burst
                                                confetti({
                                                    particleCount: 80,
                                                    spread: 60,
                                                    origin: { x, y },
                                                    colors: ['#19e38c', '#10b981', '#34d399', '#6ee7b7'],
                                                    ticks: 150,
                                                    gravity: 1.2,
                                                    scalar: 0.9,
                                                });

                                                setCompletedToday(prev => new Set([...prev, workout.id]));
                                            }}
                                            className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                                            style={{
                                                background: 'var(--color-accent)',
                                                boxShadow: '0 2px 8px rgba(25, 227, 140, 0.3)',
                                            }}
                                            aria-label="Mark as complete"
                                        >
                                            <CheckIcon size={20} className="text-black" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setCompletedToday(prev => {
                                                    const newSet = new Set(prev);
                                                    newSet.delete(workout.id);
                                                    return newSet;
                                                });
                                            }}
                                            className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
                                            style={{
                                                background: 'var(--color-accent)',
                                            }}
                                            aria-label="Undo completion"
                                        >
                                            <CheckIcon size={20} className="text-black group-hover:hidden" />
                                            <svg
                                                className="w-5 h-5 text-black hidden group-hover:block"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <div className="v3-card p-8 text-center">
                                <CheckIcon size={40} className="mx-auto mb-4 v3-accent" />
                                <p className="v3-heading-sm mb-2">Rest Day</p>
                                <p className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>Recovery is part of the plan. Enjoy it!</p>
                            </div>
                        )}
                    </div>
                </motion.section>

                {/* Coaching Whisper - Contextual coach wisdom */}
                {plan && currentWeekPlan && (
                    <CoachingWhisper
                        philosophy={plan.philosophy as 'hansons' | 'higdon' | 'pfitzinger' | 'daniels' | 'fitzgerald' | 'magness' | undefined}
                        phase={currentWeekPlan.phase}
                        workoutType={todayWorkout?.runWorkout?.type}
                        workoutNotes={todayWorkout?.runWorkout?.notes?.[0]}
                        weekNumber={currentWeek || 1}
                        totalWeeks={plan.totalWeeks}
                    />
                )}

                {/* Week Overview - Week Grid Style */}
                <motion.section
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="v3-heading-md">Week Overview</h2>
                        {viewingWeek && viewingWeek !== currentWeek && (
                            <button
                                onClick={() => setViewingWeek(null)}
                                className="v3-body-sm v3-accent hover:underline"
                            >
                                Back to current week
                            </button>
                        )}
                    </div>

                    {/* Weekly Mileage Progress */}
                    {currentWeekPlan && (
                        <div className="mb-4">
                            <MileageGauge
                                completed={weekOverview.filter(d => d.done && d.distance).reduce((sum, d) => sum + (d.distance || 0), 0)}
                                planned={currentWeekPlan.totalMiles || 0}
                                label="This week"
                            />
                        </div>
                    )}

                    <WeeklyCalendar
                        days={weekOverview.map(day => ({
                            day: day.day,
                            label: day.label,
                            status: day.today ? 'today' : day.done ? 'completed' : day.type === 'rest' ? 'rest' : 'upcoming',
                            workoutType: day.workoutType,
                            distance: day.distance,
                            hasStrength: day.hasStrength,
                            date: day.date,
                        }))}
                        weekLabel={(() => {
                            const activeWeekNum = viewingWeek ?? currentWeek ?? 1;
                            const activeWeekPlan = plan?.weeks.find(w => w.weekNumber === activeWeekNum);
                            return `Week ${activeWeekNum} • ${activeWeekPlan?.phase.toUpperCase() || 'BASE'} • ${Math.round((activeWeekPlan?.totalMiles || 0) * 10) / 10} mi`;
                        })()}
                        currentWeek={viewingWeek ?? currentWeek ?? 1}
                        totalWeeks={plan?.weeks.length || 1}
                        onPrevWeek={() => setViewingWeek(prev => Math.max(1, (prev ?? currentWeek ?? 1) - 1))}
                        onNextWeek={() => setViewingWeek(prev => Math.min(plan?.weeks.length || 1, (prev ?? currentWeek ?? 1) + 1))}
                    />
                </motion.section>

                {/* 80/20 Intensity Distribution - Seiler/Fitzgerald Integration */}
                <motion.section
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                >
                    <IntensityDistributionCard
                        workouts={workoutLogs.map((log): WorkoutForIntensity => ({
                            sessionType: log.sessionType,
                            durationMinutes: log.plannedDuration,
                            completed: log.completed,
                            date: log.date,
                        }))}
                    />
                </motion.section>

                {/* Plan Overview Card */}
                {plan && (
                    <motion.section
                        className="mb-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        {(() => {
                            // Phase color mapping
                            const phaseColors: Record<string, string> = {
                                'base': '#3b82f6',      // Blue
                                'build': '#f97316',     // Orange  
                                'peak': '#ef4444',      // Red
                                'taper': '#22c55e',     // Green
                                'race': '#a855f7',      // Purple
                            };
                            const phaseColor = phaseColors[currentWeekPlan?.phase?.toLowerCase() || 'base'] || '#3b82f6';

                            return (
                                <Link
                                    href="/plan"
                                    className="v3-card v3-card-interactive p-6 block"
                                    style={{
                                        borderLeft: `4px solid ${phaseColor}`,
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="v3-label mb-1" style={{ color: 'var(--text-muted)' }}>TRAINING PLAN</p>
                                            <p className="v3-heading-sm">
                                                {plan.raceName || `${plan.goalDistance.toUpperCase()} Training`}
                                            </p>
                                            <p className="v3-body-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                                                Week {currentWeek} of {plan.totalWeeks} • <span style={{ color: phaseColor, fontWeight: 500 }}>{currentWeekPlan?.phase.toUpperCase()}</span> phase
                                            </p>
                                        </div>
                                        <svg className="w-6 h-6" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            );
                        })()}
                    </motion.section>
                )}

                {/* Durability Status - Dicharry/Starrett Integration */}
                <motion.section
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.32 }}
                >
                    <DurabilityStatusCard
                        isQualityDay={isQualityDay}
                    // Note: lastQuickCheck, lastFullAssessment, failedCount props available
                    // when assessment data is persisted in Supabase athletes table
                    />
                </motion.section>

                {/* Training Zones & Paces */}
                <motion.section
                    className="mt-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.38 }}
                >
                    <PacesCard
                        vdot={displayVdot}
                        age={athlete?.age}
                        maxHR={maxHROverride}
                        onRecalibrate={() => setShowRecalibrationModal(true)}
                        onMaxHRUpdate={handleMaxHRUpdate}
                    />
                </motion.section>
            </main>

            {/* Recalibration Modal */}
            <RecalibrationModal
                isOpen={showRecalibrationModal}
                currentVdot={displayVdot}
                onClose={() => setShowRecalibrationModal(false)}
                onConfirm={handleRecalibrate}
            />
        </div >
    );
}
