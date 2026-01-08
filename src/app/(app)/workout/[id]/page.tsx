"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/ui/SiteHeader';
import { handleMissedWorkout, MissedWorkoutDecision } from '@/domain/plan-generator/missed-workout-handler';
import { usePlan } from '@/domain/plan/context';
import { useAuth } from '@/domain/auth/context';
import { DayPlan, Workout, TrainingZone, WorkoutType } from '@/domain/plan/types';
import { WorkoutSkeleton } from '@/components/ui/Skeleton';
import { formatPace, formatPaceRange, getPaceForZone, formatDuration } from '@/lib/format';
import { paceZoneToHRZone, estimateMaxHR } from '@/domain/hr/zones';
import { HeartIcon } from '@/components/ui/heart';
import { CoachingContextCard, PhaseBanner } from '@/components/coaching';

/**
 * Workout Detail Page
 *
 * V2 Design System - Shows full workout prescription with pace targets
 */

function getZonePace(
    zone: TrainingZone,
    paces: { easy: { min: number; max: number }; marathon: number; threshold: number; interval: number; repetition: number }
): string {
    return getPaceForZone(zone, paces);
}

function estimateDuration(distanceMiles: number, paceSecondsPerMile: number): string {
    const totalSeconds = distanceMiles * paceSecondsPerMile;
    const minutes = Math.round(totalSeconds / 60);
    return `${minutes} min`;
}

// Human-readable zone names
const ZONE_NAMES: Record<TrainingZone, string> = {
    E: 'Easy Pace',
    M: 'Marathon Pace',
    T: 'Threshold Pace',
    I: 'Interval Pace',
    R: 'Repetition Pace',
};

// =============================================================================
// WORKOUT DETAIL PAGE
// =============================================================================

export default function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { plan, currentWeek, currentWeekPlan, todayWorkout } = usePlan();
    const { athleteId } = useAuth();
    const [showLogging, setShowLogging] = useState(false);
    const [workout, setWorkout] = useState<DayPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [athleteAge, setAthleteAge] = useState<number | null>(null);
    const [maxHR, setMaxHR] = useState<number | null>(null);

    // Fetch athlete age for HR zones
    useEffect(() => {
        const fetchAthleteAge = async () => {
            if (!athleteId) return;
            try {
                const { createSupabaseBrowserClient } = await import('@/infrastructure/supabase');
                const supabase = createSupabaseBrowserClient();
                const { data } = await supabase
                    .from('athletes')
                    .select('age')
                    .eq('id', athleteId)
                    .single();
                if (data?.age) {
                    setAthleteAge(data.age);
                    setMaxHR(estimateMaxHR(data.age));
                }
            } catch (e) {
                console.warn('Failed to fetch athlete age:', e);
            }
        };
        fetchAthleteAge();
    }, [athleteId]);

    // Find the workout from the plan
    useEffect(() => {
        const findWorkout = () => {
            if (!plan) {
                setLoading(false);
                return;
            }

            const idParts = resolvedParams.id.split('-');

            // Try to find by date first
            if (idParts.length >= 3 && !Number.isNaN(parseInt(idParts[0], 10))) {
                const dateStr = `${idParts[0]}-${idParts[1]}-${idParts[2]}`;
                for (const week of plan.weeks) {
                    const day = week.days.find(d => d.date === dateStr);
                    if (day) {
                        setWorkout(day);
                        setLoading(false);
                        return;
                    }
                }
            }

            // Try week-day format (w8-d2)
            if (resolvedParams.id.startsWith('w')) {
                const match = resolvedParams.id.match(/w(\d+)-d(\d+)/);
                if (match) {
                    const weekNum = parseInt(match[1], 10);
                    const dayNum = parseInt(match[2], 10);
                    const week = plan.weeks.find(w => w.weekNumber === weekNum);
                    const day = week?.days.find(d => d.dayOfWeek === dayNum);
                    if (day) {
                        setWorkout(day);
                        setLoading(false);
                        return;
                    }
                }
            }

            // Fall back to today's workout
            if (todayWorkout) {
                setWorkout(todayWorkout);
            }

            setLoading(false);
        };

        findWorkout();
    }, [plan, resolvedParams.id, todayWorkout]);

    const domainColors: Record<string, string> = {
        running: 'var(--v3-running)',
        strength: 'var(--v3-strength)',
        durability: 'var(--v3-durability)',
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}>
                <SiteHeader />
                <main className="max-w-3xl mx-auto px-6 py-10">
                    <div className="animate-pulse space-y-6">
                        <div className="h-24 rounded-xl" style={{ background: 'var(--bg-elevated)' }} />
                        <div className="h-48 rounded-xl" style={{ background: 'var(--bg-elevated)' }} />
                        <div className="h-24 rounded-xl" style={{ background: 'var(--bg-elevated)' }} />
                    </div>
                </main>
            </div>
        );
    }

    // No workout found
    if (!workout || !workout.runWorkout) {
        return (
            <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}>
                <SiteHeader />
                <main className="max-w-3xl mx-auto px-6 py-10">
                    <div className="v3-card p-10 text-center">
                        <h2 className="text-xl font-light mb-4" style={{ color: 'var(--text-base)' }}>Rest Day</h2>
                        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                            No workout scheduled. Enjoy your recovery!
                        </p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="v3-btn v3-btn-secondary"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const run = workout.runWorkout;
    const paces = plan?.paces || {
        easy: { min: 480, max: 540 },
        marathon: 420,
        threshold: 390,
        interval: 360,
        repetition: 330,
    };

    const weekPlan = plan?.weeks.find(w =>
        w.days.some(d => d.date === workout.date)
    );
    const phase = weekPlan?.phase?.toUpperCase() || 'BUILD';
    const weekNumber = weekPlan?.weekNumber || currentWeek || 1;

    return (
        <div className="v3-root min-h-screen">
            <SiteHeader />

            <main className="v3-container py-10" style={{ paddingTop: 'calc(var(--v3-space-10) + 80px)' }}>
                {/* Header: Date + Phase Context */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <p className="v3-label" style={{ color: 'var(--text-subtle)' }}>
                            {(() => {
                                const date = new Date(workout.date + 'T12:00:00');
                                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                                const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                return `${dayName.toUpperCase()} • ${monthDay.toUpperCase()}`;
                            })()}
                        </p>
                        <p className="v3-label" style={{ color: 'var(--text-subtle)' }}>
                            WEEK {weekNumber} • {phase}
                        </p>
                    </div>
                </div>

                {/* Main Workout Card - Like Dashboard "Today's Plan" */}
                <div className="v3-card p-6 mb-8">
                    <div className="flex items-center gap-4">
                        {/* Workout Type Icon */}
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: 'var(--color-accent-subtle)' }}
                        >
                            <svg className="w-6 h-6 v3-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        {/* Workout Title + Subtitle */}
                        <div className="flex-1 min-w-0">
                            <h1 className="v3-heading-md" style={{ fontWeight: 600 }}>{run.name}</h1>
                            <p className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>
                                {run.totalDistance} mi @ {getPaceForZone(run.segments[0]?.pace || 'E', paces)}/mi
                            </p>
                        </div>

                        {/* Duration */}
                        <div className="text-right shrink-0">
                            <p className="v3-mono" style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                                {run.estimatedDuration} min
                            </p>
                        </div>

                        {/* Circular Complete Button */}
                        <button
                            onClick={() => setShowLogging(true)}
                            className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                            style={{
                                background: 'var(--color-accent)',
                                boxShadow: '0 2px 8px rgba(25, 227, 140, 0.3)',
                            }}
                            aria-label="Log workout"
                        >
                            <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Key Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="v3-card p-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: 'var(--color-accent-subtle)' }}
                            >
                                <svg className="w-5 h-5 v3-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div>
                                <p className="v3-heading-md v3-mono" style={{ lineHeight: 1 }}>{run.totalDistance}</p>
                                <p className="v3-body-xs" style={{ color: 'var(--text-muted)' }}>Miles</p>
                            </div>
                        </div>
                    </div>
                    <div className="v3-card p-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: 'var(--color-accent-subtle)' }}
                            >
                                <svg className="w-5 h-5 v3-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="v3-heading-md v3-mono" style={{ lineHeight: 1 }}>{run.estimatedDuration}</p>
                                <p className="v3-body-xs" style={{ color: 'var(--text-muted)' }}>Minutes</p>
                            </div>
                        </div>
                    </div>
                    <div className="v3-card p-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: 'var(--color-accent-subtle)' }}
                            >
                                <svg className="w-5 h-5 v3-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="v3-heading-md v3-mono" style={{ lineHeight: 1 }}>
                                    {run.segments[0]?.pace === 'E' ? 'Easy'
                                        : run.segments[0]?.pace === 'M' ? 'Marathon'
                                            : run.segments[0]?.pace === 'T' ? 'Tempo'
                                                : run.segments[0]?.pace === 'I' ? 'Interval'
                                                    : run.segments[0]?.pace === 'R' ? 'Speed'
                                                        : 'Easy'}
                                </p>
                                <p className="v3-body-xs" style={{ color: 'var(--text-muted)' }}>Effort</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Target Pace Card */}
                <div className="v3-card p-5 mb-8" style={{ borderLeft: '4px solid var(--color-accent)' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="v3-label mb-1" style={{ color: 'var(--text-muted)' }}>TARGET PACE</p>
                            <p className="v3-heading-lg v3-mono v3-accent">
                                {getPaceForZone(run.segments[0]?.pace || 'E', paces)}/mile
                            </p>
                            {run.segments[0]?.pace === 'E' && (
                                <p className="v3-body-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                                    Should feel conversational — if you can&apos;t talk, slow down
                                </p>
                            )}
                        </div>
                        {maxHR && run.segments[0]?.pace && (
                            <div className="text-right">
                                <div className="flex items-center gap-1" style={{ color: '#ef4444' }}>
                                    <HeartIcon size={16} filled pulsing style={{ color: '#ef4444' }} />
                                    <span className="v3-mono v3-body-sm">
                                        {(() => {
                                            const hrZone = paceZoneToHRZone(run.segments[0].pace, maxHR);
                                            return `${hrZone.min}-${hrZone.max}`;
                                        })()}
                                    </span>
                                </div>
                                <p className="v3-body-xs" style={{ color: 'var(--text-subtle)' }}>bpm</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Workout Structure - Only show for complex workouts with multiple segments or intervals */}
                {(run.segments.length > 1 || ['interval', 'tempo', 'quality', 'speed', 'threshold', 'tempo_run', 'vo2max'].some(t => run.type.toLowerCase().includes(t))) && (
                    <section className="mb-8">
                        <h2 className="v3-heading-sm mb-4">Workout Breakdown</h2>

                        <div className="space-y-3">
                            {run.segments.map((segment, index) => {
                                const isMain = segment.type === 'main';
                                const pace = segment.pace ? getZonePace(segment.pace, paces) : '';
                                const zoneName = segment.pace ? ZONE_NAMES[segment.pace] : '';
                                const avgPace = segment.pace === 'E'
                                    ? (paces.easy.min + paces.easy.max) / 2
                                    : segment.pace === 'T' ? paces.threshold
                                        : segment.pace === 'I' ? paces.interval
                                            : segment.pace === 'M' ? paces.marathon
                                                : paces.easy.max;

                                // Calculate duration based on distance OR use provided duration
                                const durationMins = segment.distance
                                    ? Math.round(segment.distance * avgPace / 60)
                                    : segment.duration || 10;

                                // More descriptive segment labeling
                                const segmentLabel = segment.type === 'warmup' ? 'Warm-up'
                                    : segment.type === 'cooldown' ? 'Cool-down'
                                        : segment.type === 'main' ? 'Main Set'
                                            : segment.type.charAt(0).toUpperCase() + segment.type.slice(1);

                                // Descriptive distance text
                                const distanceText = segment.distance
                                    ? `${segment.distance} ${segment.distance === 1 ? 'mile' : 'miles'}`
                                    : '';

                                return (
                                    <div
                                        key={index}
                                        className={`v3-card p-5 ${isMain ? 'border-l-4' : ''}`}
                                        style={isMain ? { borderLeftColor: 'var(--color-accent)' } : {}}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                {/* Segment Label */}
                                                <p className="font-medium mb-1" style={{ color: isMain ? 'var(--color-accent)' : 'var(--text-muted)' }}>
                                                    {segmentLabel}
                                                </p>

                                                {/* Pace Zone - spelled out */}
                                                {zoneName && (
                                                    <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                                                        {zoneName}
                                                    </p>
                                                )}

                                                {/* Description or distance */}
                                                {segment.description ? (
                                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                                        {segment.description}
                                                    </p>
                                                ) : distanceText && (
                                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                                        {distanceText}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Right side - Pace & Duration */}
                                            <div className="text-right shrink-0">
                                                {/* Target Pace */}
                                                {pace && (
                                                    <p className="font-mono font-semibold text-lg" style={{ color: isMain ? 'var(--color-accent)' : 'var(--text-muted)' }}>
                                                        {pace}/mi
                                                    </p>
                                                )}

                                                {/* Heart Rate Zone - clearer format */}
                                                {maxHR && segment.pace && (() => {
                                                    const hrZone = paceZoneToHRZone(segment.pace, maxHR);
                                                    return (
                                                        <p className="text-xs mt-1 flex items-center justify-end gap-1" style={{ color: 'var(--text-subtle)' }}>
                                                            <HeartIcon size={10} filled pulsing style={{ color: '#ef4444' }} />
                                                            <span>{hrZone.min}-{hrZone.max} bpm</span>
                                                        </p>
                                                    );
                                                })()}

                                                {/* Duration - with context */}
                                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                                    ~{durationMins} min
                                                </p>
                                            </div>
                                        </div>

                                        {isMain && run.purpose && (
                                            <p className="text-sm rounded-lg p-3 mt-3 flex items-start gap-2" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                                                <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                                {run.purpose}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Coaching Context - WHY this workout */}
                <section className="mb-8">
                    <h2 className="v3-heading-sm mb-4">Why This Workout</h2>
                    <CoachingContextCard
                        workoutType={run.type as WorkoutType}
                        coachSource={run.coachSource}
                    />
                </section>

                {/* Coach Notes (if present) */}
                {run.notes && (
                    <section className="mb-8">
                        <h2 className="v3-heading-sm mb-4">Coach Notes</h2>
                        <div className="v3-card p-5" style={{ background: 'var(--bg-elevated)' }}>
                            <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>"{run.notes}"</p>
                            <p className="text-[10px] mt-3" style={{ color: 'var(--text-subtle)' }}>— Based on {run.coachSource}</p>
                        </div>
                    </section>
                )}

                {/* Strength Work */}
                {workout.strengthWorkout && (
                    <section className="mb-8">
                        <h2 className="v3-heading-sm mb-4">Strength Training</h2>
                        <div
                            className="v3-card p-5 border-l-4"
                            style={{ borderLeftColor: 'var(--v3-strength)' }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="font-medium" style={{ color: 'var(--text-muted)' }}>{workout.strengthWorkout.name}</p>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                        {workout.strengthWorkout.focus.join(' + ')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium" style={{ color: 'var(--text-muted)' }}>{workout.strengthWorkout.duration} min</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {workout.strengthWorkout.exercises.slice(0, 4).map((ex, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span style={{ color: 'var(--text-muted)' }}>{ex.name}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>{ex.sets}×{ex.reps}</span>
                                    </div>
                                ))}
                                {workout.strengthWorkout.exercises.length > 4 && (
                                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                        + {workout.strengthWorkout.exercises.length - 4} more exercises
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                )}


            </main>

            {/* Logging Modal */}
            {showLogging && (
                <WorkoutLoggingModal
                    workout={workout}
                    onClose={() => setShowLogging(false)}
                    onComplete={async () => {
                        setShowLogging(false);
                        router.push('/dashboard');
                    }}
                />
            )}
        </div>
    );
}

/**
 * Workout Logging Modal - V2 Design System
 */
function WorkoutLoggingModal({
    workout,
    onClose,
    onComplete
}: {
    workout: DayPlan;
    onClose: () => void;
    onComplete: () => void;
}) {
    const [completed, setCompleted] = useState<'full' | 'partial' | 'skipped' | null>(null);
    const [feelRating, setFeelRating] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    const feelOptions = [
        { value: 1, label: 'Struggled', description: 'Way harder than expected' },
        { value: 2, label: 'Tough', description: 'Harder than it should be' },
        { value: 3, label: 'Right', description: 'Effort matched the workout' },
        { value: 4, label: 'Strong', description: 'Felt easier than expected' },
        { value: 5, label: 'Crushing', description: 'Could\'ve done more' },
    ];

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const { createSupabaseBrowserClient } = await import('@/infrastructure/supabase');
            const supabase = createSupabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                let plannedWorkoutId: string | null = null;

                const { data: plannedWorkout } = await supabase
                    .from('planned_workouts')
                    .select('id')
                    .eq('athlete_id', user.id)
                    .eq('scheduled_date', workout.date)
                    .single();

                if (plannedWorkout) {
                    plannedWorkoutId = plannedWorkout.id;

                    await supabase
                        .from('planned_workouts')
                        .update({ status: completed === 'full' ? 'completed' : completed === 'partial' ? 'partial' : 'skipped' })
                        .eq('id', plannedWorkoutId);
                }

                await supabase.from('completed_workouts').insert({
                    athlete_id: user.id,
                    completed_date: workout.date,
                    planned_workout_id: plannedWorkoutId,
                    actual_session: JSON.parse(JSON.stringify({
                        completed,
                        feelRating,
                        notes,
                        runWorkout: workout.runWorkout,
                        strengthWorkout: workout.strengthWorkout,
                    })),
                });
            }

            onComplete();
        } catch (error) {
            console.error('Failed to log workout:', error);
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0"
                style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full sm:max-w-md max-h-[90vh] overflow-auto rounded-t-3xl sm:rounded-3xl"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border-base)' }}
            >
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-light" style={{ color: 'var(--text-base)' }}>Log Workout</h2>
                        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Step 1: Completion */}
                    <div className="mb-6">
                        <p className="v3-label mb-3">Did you complete it?</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {[
                                { value: 'full', label: 'Full' },
                                { value: 'partial', label: 'Partial' },
                                { value: 'skipped', label: 'Skipped' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setCompleted(option.value as typeof completed)}
                                    className="p-4 rounded-xl border transition-all"
                                    style={{
                                        borderColor: completed === option.value ? 'var(--color-accent)' : 'var(--border-base)',
                                        background: completed === option.value ? 'var(--color-accent-subtle)' : 'transparent'
                                    }}
                                >
                                    <div className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center" style={{
                                        background: option.value === 'full' ? 'var(--color-accent-subtle)' :
                                            option.value === 'partial' ? 'rgba(251, 191, 36, 0.15)' :
                                                'var(--v3-bg-inset)'
                                    }}>
                                        {option.value === 'full' && (
                                            <svg className="w-4 h-4" style={{ color: 'var(--color-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                        {option.value === 'partial' && (
                                            <svg className="w-4 h-4" style={{ color: '#fbbf24' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                                            </svg>
                                        )}
                                        {option.value === 'skipped' && (
                                            <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M6 5l7 7-7 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Feel Rating */}
                    {completed && completed !== 'skipped' && (
                        <div className="mb-6">
                            <p className="v3-label mb-3">How did it feel?</p>
                            <div className="space-y-2">
                                {feelOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setFeelRating(option.value)}
                                        className="w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4"
                                        style={{
                                            borderColor: feelRating === option.value ? 'var(--color-accent)' : 'var(--border-base)',
                                            background: feelRating === option.value ? 'var(--color-accent-subtle)' : 'transparent'
                                        }}
                                    >
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium" style={{
                                            background: feelRating === option.value ? 'var(--color-accent)' : 'var(--v3-bg-inset)',
                                            color: feelRating === option.value ? 'var(--bg-base)' : 'var(--text-muted)'
                                        }}>
                                            {option.value}
                                        </div>
                                        <div>
                                            <p className="font-medium" style={{ color: 'var(--text-muted)' }}>{option.label}</p>
                                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{option.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Notes */}
                    {completed && (
                        <div className="mb-6">
                            <p className="v3-label mb-3">Notes (optional)</p>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="How your body felt, weather conditions, etc..."
                                className="v3-input w-full min-h-[100px] resize-none"
                            />
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={!completed || saving}
                        className="v3-btn v3-btn-primary w-full"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
