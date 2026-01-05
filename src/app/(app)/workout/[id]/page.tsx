"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/ui/AppHeader';
import { handleMissedWorkout, MissedWorkoutDecision } from '@/domain/plan-generator/missed-workout-handler';
import { usePlan } from '@/domain/plan/context';
import { useAuth } from '@/domain/auth/context';
import { DayPlan, Workout, TrainingZone } from '@/domain/plan/types';
import { WorkoutSkeleton } from '@/components/ui/Skeleton';
import { formatPace, formatPaceRange, getPaceForZone, formatDuration } from '@/lib/format';
import { paceZoneToHRZone, estimateMaxHR } from '@/domain/hr/zones';

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
    return `~${minutes} min`;
}

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
            if (idParts.length >= 3 && !isNaN(parseInt(idParts[0]))) {
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
                    const weekNum = parseInt(match[1]);
                    const dayNum = parseInt(match[2]);
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
            <div className="min-h-screen" style={{ background: 'var(--v2-bg-deep)', color: 'var(--v2-text-primary)' }}>
                <AppHeader backHref="/dashboard" />
                <main className="max-w-3xl mx-auto px-6 py-10">
                    <div className="animate-pulse space-y-6">
                        <div className="h-24 rounded-xl" style={{ background: 'var(--v2-bg-elevated)' }} />
                        <div className="h-48 rounded-xl" style={{ background: 'var(--v2-bg-elevated)' }} />
                        <div className="h-24 rounded-xl" style={{ background: 'var(--v2-bg-elevated)' }} />
                    </div>
                </main>
            </div>
        );
    }

    // No workout found
    if (!workout || !workout.runWorkout) {
        return (
            <div className="min-h-screen" style={{ background: 'var(--v2-bg-deep)', color: 'var(--v2-text-primary)' }}>
                <AppHeader backHref="/dashboard" />
                <main className="max-w-3xl mx-auto px-6 py-10">
                    <div className="v2-card p-10 text-center">
                        <h2 className="text-xl font-light mb-4" style={{ color: 'var(--v2-text-primary)' }}>Rest Day</h2>
                        <p className="text-sm mb-6" style={{ color: 'var(--v2-text-muted)' }}>
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
        <div className="min-h-screen" style={{ background: 'var(--v2-bg-deep)', color: 'var(--v2-text-primary)' }}>
            <AppHeader
                backHref="/dashboard"
                rightContent={<span className="v2-label">{phase} • Week {weekNumber}</span>}
            />

            <main className="max-w-3xl mx-auto px-6 py-10">
                {/* Workout Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div
                                className="inline-block px-3 py-1 rounded-lg mb-3"
                                style={{
                                    background: 'var(--v2-accent-subtle)',
                                    color: 'var(--v2-accent)'
                                }}
                            >
                                <span className="text-[10px] uppercase tracking-wider font-medium">{run.type.replace(/_/g, ' ')}</span>
                            </div>
                            <h1 className="text-3xl font-light" style={{ color: 'var(--v2-text-primary)' }}>{run.name}</h1>
                        </div>

                        <div className="text-right">
                            <p className="text-2xl font-mono" style={{ color: 'var(--v2-accent)' }}>{run.totalDistance}</p>
                            <p className="text-[10px] uppercase" style={{ color: 'var(--v2-text-muted)' }}>miles</p>
                        </div>
                    </div>

                    <p className="text-sm" style={{ color: 'var(--v2-text-muted)' }}>
                        ~{run.estimatedDuration} min total
                    </p>
                </div>

                {/* Workout Structure */}
                <section className="mb-8">
                    <h2 className="v2-label mb-4">Workout Structure</h2>

                    <div className="space-y-3">
                        {run.segments.map((segment, index) => {
                            const isMain = segment.type === 'main';
                            const pace = segment.pace ? getZonePace(segment.pace, paces) : '';
                            const avgPace = segment.pace === 'E'
                                ? (paces.easy.min + paces.easy.max) / 2
                                : segment.pace === 'T' ? paces.threshold
                                    : segment.pace === 'I' ? paces.interval
                                        : segment.pace === 'M' ? paces.marathon
                                            : paces.easy.max;
                            const duration = segment.distance
                                ? estimateDuration(segment.distance, avgPace)
                                : `~${segment.duration || 10} min`;

                            return (
                                <div
                                    key={index}
                                    className={`v2-card p-5 ${isMain ? 'border-l-4' : ''}`}
                                    style={isMain ? { borderLeftColor: 'var(--v2-accent)' } : {}}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold"
                                                style={isMain
                                                    ? { background: 'var(--v2-accent)', color: '#04110b' }
                                                    : { background: 'var(--v2-bg-elevated)', color: 'var(--v2-text-muted)' }
                                                }
                                            >
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium capitalize" style={{ color: 'var(--v2-text-secondary)' }}>{segment.type}</p>
                                                <p className="text-sm" style={{ color: 'var(--v2-text-muted)' }}>
                                                    {segment.description || `${segment.distance || ''} mi`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className={`font-mono font-semibold ${isMain ? 'text-lg' : ''}`}
                                                style={{ color: isMain ? 'var(--v2-accent)' : 'var(--v2-text-secondary)' }}
                                            >
                                                {pace}{segment.pace !== 'E' ? '/mi' : ''}
                                            </p>
                                            {maxHR && segment.pace && (
                                                <p className="text-[10px]" style={{ color: 'var(--v2-text-subtle)' }}>
                                                    ❤️ {paceZoneToHRZone(segment.pace, maxHR).min}-{paceZoneToHRZone(segment.pace, maxHR).max} bpm
                                                </p>
                                            )}
                                            <p className="text-[10px]" style={{ color: 'var(--v2-text-muted)' }}>{duration}</p>
                                        </div>
                                    </div>

                                    {isMain && run.purpose && (
                                        <p className="text-sm rounded-lg p-3" style={{ background: 'var(--v2-bg-elevated)', color: 'var(--v2-text-muted)' }}>
                                            💡 {run.purpose}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Coach Notes */}
                {run.notes && (
                    <section className="mb-8">
                        <h2 className="v2-label mb-4">Coach Notes</h2>
                        <div className="v2-card p-5" style={{ background: 'var(--v2-bg-elevated)' }}>
                            <p className="text-sm italic" style={{ color: 'var(--v2-text-muted)' }}>"{run.notes}"</p>
                            <p className="text-[10px] mt-3" style={{ color: 'var(--v2-text-subtle)' }}>— Based on {run.coachSource}</p>
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
                                    <p className="font-medium" style={{ color: 'var(--v2-text-secondary)' }}>{workout.strengthWorkout.name}</p>
                                    <p className="text-sm" style={{ color: 'var(--v2-text-muted)' }}>
                                        {workout.strengthWorkout.focus.join(' + ')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium" style={{ color: 'var(--v2-text-secondary)' }}>{workout.strengthWorkout.duration} min</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {workout.strengthWorkout.exercises.slice(0, 4).map((ex, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span style={{ color: 'var(--v2-text-secondary)' }}>{ex.name}</span>
                                        <span style={{ color: 'var(--v2-text-muted)' }}>{ex.sets}×{ex.reps}</span>
                                    </div>
                                ))}
                                {workout.strengthWorkout.exercises.length > 4 && (
                                    <p className="text-[10px]" style={{ color: 'var(--v2-text-muted)' }}>
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
        { value: 1, label: 'Struggled', emoji: '😫', description: 'Way harder than expected' },
        { value: 2, label: 'Tough', emoji: '😓', description: 'Harder than it should be' },
        { value: 3, label: 'Right', emoji: '😌', description: 'Effort matched the workout' },
        { value: 4, label: 'Strong', emoji: '💪', description: 'Felt easier than expected' },
        { value: 5, label: 'Crushing', emoji: '🔥', description: 'Could\'ve done more' },
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
                style={{ background: 'var(--v2-bg-deep)', border: '1px solid var(--v2-border)' }}
            >
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-light" style={{ color: 'var(--v2-text-primary)' }}>Log Workout</h2>
                        <button onClick={onClose} style={{ color: 'var(--v2-text-muted)' }}>
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
                                { value: 'full', label: 'Full', emoji: '✅' },
                                { value: 'partial', label: 'Partial', emoji: '🔶' },
                                { value: 'skipped', label: 'Skipped', emoji: '⏭️' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setCompleted(option.value as typeof completed)}
                                    className="p-4 rounded-xl border transition-all"
                                    style={{
                                        borderColor: completed === option.value ? 'var(--v2-accent)' : 'var(--v2-border)',
                                        background: completed === option.value ? 'var(--v2-accent-subtle)' : 'transparent'
                                    }}
                                >
                                    <span className="text-2xl block mb-1">{option.emoji}</span>
                                    <span className="text-sm" style={{ color: 'var(--v2-text-secondary)' }}>{option.label}</span>
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
                                            borderColor: feelRating === option.value ? 'var(--v2-accent)' : 'var(--v2-border)',
                                            background: feelRating === option.value ? 'var(--v2-accent-subtle)' : 'transparent'
                                        }}
                                    >
                                        <span className="text-2xl">{option.emoji}</span>
                                        <div>
                                            <p className="font-medium" style={{ color: 'var(--v2-text-secondary)' }}>{option.label}</p>
                                            <p className="text-sm" style={{ color: 'var(--v2-text-muted)' }}>{option.description}</p>
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
