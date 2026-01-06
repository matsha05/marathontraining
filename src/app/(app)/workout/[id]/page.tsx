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
        running: 'var(--v2-running)',
        strength: 'var(--v2-strength)',
        durability: 'var(--v2-durability)',
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
                    <div className="v2-card p-10 text-center">
                        <h2 className="text-xl font-light mb-4" style={{ color: 'var(--text-base)' }}>Rest Day</h2>
                        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                            No workout scheduled. Enjoy your recovery!
                        </p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="v2-btn v2-btn-secondary"
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
        <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}>
            <SiteHeader />

            <main className="max-w-3xl mx-auto px-6 pt-24 pb-10">
                {/* THE DATE - Like a Journal Entry */}
                <div className="text-center mb-8">
                    <p className="v2-date-hero">
                        {(() => {
                            const date = new Date(workout.date + 'T12:00:00');
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                            const monthDay = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
                            return `${dayName}, ${monthDay}`;
                        })()}
                    </p>
                </div>

                {/* Phase Progress Banner */}
                <PhaseBanner
                    phase={(weekPlan?.phase || 'build') as 'base' | 'build' | 'peak' | 'taper'}
                    weekNumber={weekNumber}
                    totalWeeks={plan?.weeks.length || 18}
                    coach={run.coachSource ? (
                        run.coachSource.toLowerCase().includes('hansons') ? 'hansons' :
                            run.coachSource.toLowerCase().includes('pfitz') ? 'pfitzinger' :
                                run.coachSource.toLowerCase().includes('daniels') ? 'daniels' : 'higdon'
                    ) : 'higdon'}
                />

                {/* TODAY'S WORKOUT - Crystal Clear */}
                <div className="mb-10">
                    {/* Main Headline */}
                    <div className="text-center mb-8">
                        <div className="v2-badge v2-badge-accent inline-block mb-4">
                            <span className="v2-label">{run.type.replace(/_/g, ' ')}</span>
                        </div>

                        <h1 className="v2-heading-lg mb-6">
                            {run.name}
                        </h1>

                        {/* THE KEY NUMBERS - Clear & Bold */}
                        <div className="flex items-center justify-center gap-8 text-center">
                            <div>
                                <p className="v2-metric-hero v2-metric-hero-accent">
                                    {run.totalDistance}
                                </p>
                                <p className="v2-metric-label mt-1">miles</p>
                            </div>
                            <div className="v2-heading-md" style={{ color: 'var(--text-subtle)' }}>≈</div>
                            <div>
                                <p className="v2-metric-hero v2-metric-hero-muted">
                                    {run.estimatedDuration}
                                </p>
                                <p className="v2-metric-label mt-1">minutes</p>
                            </div>
                        </div>
                    </div>

                    {/* Simple Effort Instruction */}
                    <div
                        className="p-6 rounded-2xl text-center"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-base)' }}
                    >
                        <p className="text-lg mb-2" style={{ color: 'var(--text-muted)' }}>
                            Run at <strong style={{ color: 'var(--color-accent)' }}>
                                {run.segments[0]?.pace === 'E' ? 'Easy Pace'
                                    : run.segments[0]?.pace === 'M' ? 'Marathon Pace'
                                        : run.segments[0]?.pace === 'T' ? 'Threshold Pace'
                                            : run.segments[0]?.pace === 'I' ? 'Interval Pace'
                                                : run.segments[0]?.pace === 'R' ? 'Repetition Pace'
                                                    : 'Comfortable Pace'}
                            </strong>
                        </p>
                        <p className="text-2xl font-mono" style={{ color: 'var(--color-accent)' }}>
                            {getPaceForZone(run.segments[0]?.pace || 'E', paces)}/mile
                        </p>
                        {run.segments[0]?.pace === 'E' && (
                            <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
                                Should feel conversational — if you can&apos;t talk, slow down
                            </p>
                        )}
                    </div>
                </div>

                {/* Workout Structure - Only show for complex workouts with multiple segments or intervals */}
                {(run.segments.length > 1 || ['interval', 'tempo', 'quality', 'speed', 'threshold', 'tempo_run', 'vo2max'].some(t => run.type.toLowerCase().includes(t))) && (
                    <section className="mb-8">
                        <h2 className="v2-label mb-4">Workout Breakdown</h2>

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
                                        className={`v2-card p-5 ${isMain ? 'border-l-4' : ''}`}
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
                                                            <HeartIcon size={10} />
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
                    <h2 className="v2-label mb-4">Why This Workout</h2>
                    <CoachingContextCard
                        workoutType={run.type as WorkoutType}
                        coachSource={run.coachSource}
                    />
                </section>

                {/* Coach Notes (if present) */}
                {run.notes && (
                    <section className="mb-8">
                        <h2 className="v2-label mb-4">Coach Notes</h2>
                        <div className="v2-card p-5" style={{ background: 'var(--bg-elevated)' }}>
                            <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>"{run.notes}"</p>
                            <p className="text-[10px] mt-3" style={{ color: 'var(--text-subtle)' }}>— Based on {run.coachSource}</p>
                        </div>
                    </section>
                )}

                {/* Strength Work */}
                {workout.strengthWorkout && (
                    <section className="mb-8">
                        <h2 className="v2-label mb-4">Strength Training</h2>
                        <div
                            className="v2-card p-5 border-l-4"
                            style={{ borderLeftColor: 'var(--v2-strength)' }}
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

                {/* Action Button */}
                <div className="sticky bottom-6">
                    <button
                        onClick={() => setShowLogging(true)}
                        className="v2-btn v2-btn-primary v2-btn-lg w-full"
                        style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)' }}
                    >
                        Log Workout
                    </button>
                </div>
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
                        <p className="v2-label mb-3">Did you complete it?</p>
                        <div className="grid grid-cols-3 gap-2">
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
                                                'var(--v2-bg-inset)'
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
                            <p className="v2-label mb-3">How did it feel?</p>
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
                                            background: feelRating === option.value ? 'var(--color-accent)' : 'var(--v2-bg-inset)',
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
                            <p className="v2-label mb-3">Notes (optional)</p>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="How your body felt, weather conditions, etc..."
                                className="v2-input w-full min-h-[100px] resize-none"
                            />
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={!completed || saving}
                        className="v2-btn v2-btn-primary w-full"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
