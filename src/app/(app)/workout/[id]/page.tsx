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

/**
 * Workout Detail Page
 *
 * V2: Fetches real workout data from plan context
 * Shows the full workout prescription with pace targets,
 * clear structure, and one-tap logging.
 */

// formatPace, formatPaceRange, getPaceForZone imported from @/lib/format

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
    const [showLogging, setShowLogging] = useState(false);
    const [workout, setWorkout] = useState<DayPlan | null>(null);
    const [loading, setLoading] = useState(true);

    // Find the workout from the plan
    useEffect(() => {
        const findWorkout = () => {
            if (!plan) {
                setLoading(false);
                return;
            }

            // Parse the workout ID
            // Expected formats: "2026-01-15-run", "w8-d2-run", or just use today's workout
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
        running: 'var(--color-running)',
        strength: 'var(--color-strength)',
        durability: 'var(--color-durability)',
    };

    const domainTints: Record<string, string> = {
        running: 'var(--domain-running-tint)',
        strength: 'var(--domain-strength-tint)',
        durability: 'var(--domain-durability-tint)',
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen landing-shell">
                <AppHeader backHref="/dashboard" />
                <main className="max-w-3xl mx-auto px-6 py-10">
                    <div className="animate-pulse space-y-6">
                        <div className="h-24 bg-[var(--bg-muted)] rounded-xl" />
                        <div className="h-48 bg-[var(--bg-muted)] rounded-xl" />
                        <div className="h-24 bg-[var(--bg-muted)] rounded-xl" />
                    </div>
                </main>
            </div>
        );
    }

    // No workout found
    if (!workout || !workout.runWorkout) {
        return (
            <div className="min-h-screen landing-shell">
                <AppHeader backHref="/dashboard" />
                <main className="max-w-3xl mx-auto px-6 py-10">
                    <div className="card p-10 text-center">
                        <h2 className="text-heading-md mb-4">Rest Day</h2>
                        <p className="text-body-sm text-[var(--text-muted)] mb-6">
                            No workout scheduled. Enjoy your recovery!
                        </p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="btn btn-secondary"
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

    // Find phase and week info
    const weekPlan = plan?.weeks.find(w =>
        w.days.some(d => d.date === workout.date)
    );
    const phase = weekPlan?.phase?.toUpperCase() || 'BUILD';
    const weekNumber = weekPlan?.weekNumber || currentWeek || 1;

    return (
        <div className="min-h-screen landing-shell">
            <AppHeader
                backHref="/dashboard"
                rightContent={<span className="text-label">{phase} • Week {weekNumber}</span>}
            />

            <main className="max-w-3xl mx-auto px-6 py-10">
                {/* Workout Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div
                                className="inline-block px-3 py-1 rounded-lg text-label mb-3"
                                style={{
                                    backgroundColor: domainTints.running,
                                    color: domainColors.running
                                }}
                            >
                                {run.type.replace(/_/g, ' ')}
                            </div>
                            <h1 className="text-display-md">{run.name}</h1>
                        </div>

                        <div className="text-right">
                            <p className="text-heading-lg text-data">{run.totalDistance}</p>
                            <p className="text-caption text-[var(--text-muted)] uppercase">miles</p>
                        </div>
                    </div>

                    <p className="text-body-sm text-[var(--text-muted)]">
                        ~{run.estimatedDuration} min total
                    </p>
                </div>

                {/* Workout Structure */}
                <section className="mb-8">
                    <h2 className="text-label mb-4">Workout Structure</h2>

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
                                    className={`card p-5 ${isMain ? 'border-l-4' : ''}`}
                                    style={isMain ? { borderLeftColor: domainColors.running } : {}}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-body-sm font-semibold ${isMain ? '' : 'bg-[var(--bg-muted)]'
                                                    }`}
                                                style={isMain ? { backgroundColor: domainColors.running, color: '#04110b' } : {}}
                                            >
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold capitalize">{segment.type}</p>
                                                <p className="text-body-sm text-[var(--text-muted)]">
                                                    {segment.description || `${segment.distance || ''} mi`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-mono font-semibold ${isMain ? 'text-heading-lg text-data' : ''}`}
                                                style={isMain ? { color: domainColors.running } : {}}
                                            >
                                                {pace}{segment.pace !== 'E' ? '/mi' : ''}
                                            </p>
                                            <p className="text-caption text-[var(--text-muted)]">{duration}</p>
                                        </div>
                                    </div>

                                    {isMain && run.purpose && (
                                        <p className="text-body-sm text-[var(--text-muted)] bg-[var(--bg-tertiary)] rounded-lg p-3">
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
                        <h2 className="text-label mb-4">Coach Notes</h2>
                        <div className="card p-5 bg-[var(--bg-muted)]">
                            <p className="text-body-sm text-[var(--text-muted)] italic">"{run.notes}"</p>
                            <p className="text-caption mt-3">— Based on {run.coachSource}</p>
                        </div>
                    </section>
                )}

                {/* Strength Work */}
                {workout.strengthWorkout && (
                    <section className="mb-8">
                        <h2 className="text-label mb-4">Strength Training</h2>
                        <div
                            className="card p-5 border-l-4"
                            style={{ borderLeftColor: domainColors.strength }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="font-semibold">{workout.strengthWorkout.name}</p>
                                    <p className="text-body-sm text-[var(--text-muted)]">
                                        {workout.strengthWorkout.focus.join(' + ')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">{workout.strengthWorkout.duration} min</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {workout.strengthWorkout.exercises.slice(0, 4).map((ex, i) => (
                                    <div key={i} className="flex justify-between text-body-sm">
                                        <span>{ex.name}</span>
                                        <span className="text-[var(--text-muted)]">{ex.sets}×{ex.reps}</span>
                                    </div>
                                ))}
                                {workout.strengthWorkout.exercises.length > 4 && (
                                    <p className="text-caption text-[var(--text-muted)]">
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
                        className="btn btn-primary btn-lg w-full shadow-lg"
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
                        // TODO: Save completed workout to Supabase
                        setShowLogging(false);
                        router.push('/dashboard');
                    }}
                />
            )}
        </div>
    );
}

/**
 * Workout Logging Modal
 *
 * Simple, coach-rooted logging:
 * 1. Did you complete it?
 * 2. How did it feel? (1-5 scale with meaning)
 * 3. Quick notes (optional)
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

    // Coach-rooted feel scale
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
                // Find the planned_workout_id by looking up the workout for this date
                let plannedWorkoutId: string | null = null;

                // Try to find the planned workout
                const { data: plannedWorkout } = await supabase
                    .from('planned_workouts')
                    .select('id')
                    .eq('athlete_id', user.id)
                    .eq('scheduled_date', workout.date)
                    .single();

                if (plannedWorkout) {
                    plannedWorkoutId = plannedWorkout.id;

                    // Also update the planned workout status
                    await supabase
                        .from('planned_workouts')
                        .update({ status: completed === 'full' ? 'completed' : completed === 'partial' ? 'partial' : 'skipped' })
                        .eq('id', plannedWorkoutId);
                }

                // Save to completed_workouts table
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
            onComplete(); // Still close modal
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div className="modal-backdrop" onClick={onClose} />

            {/* Modal */}
            <div className="modal-content w-full sm:max-w-md max-h-[90vh] overflow-auto rounded-t-3xl sm:rounded-3xl animate-slide-in-up">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-heading-md">Log Workout</h2>
                        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-base)]">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Step 1: Completion */}
                    <div className="mb-6">
                        <p className="text-label mb-3">Did you complete it?</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'full', label: 'Full', emoji: '✅' },
                                { value: 'partial', label: 'Partial', emoji: '🔶' },
                                { value: 'skipped', label: 'Skipped', emoji: '⏭️' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setCompleted(option.value as typeof completed)}
                                    className={`p-4 rounded-xl border transition-all ${completed === option.value
                                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                                        : 'border-[var(--border-base)]'
                                        }`}
                                >
                                    <span className="text-2xl block mb-1">{option.emoji}</span>
                                    <span className="text-body-sm">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Feel Rating */}
                    {completed && completed !== 'skipped' && (
                        <div className="mb-6">
                            <p className="text-label mb-3">How did it feel?</p>
                            <div className="space-y-2">
                                {feelOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setFeelRating(option.value)}
                                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${feelRating === option.value
                                            ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                                            : 'border-[var(--border-base)]'
                                            }`}
                                    >
                                        <span className="text-2xl">{option.emoji}</span>
                                        <div>
                                            <p className="font-semibold">{option.label}</p>
                                            <p className="text-body-sm text-[var(--text-muted)]">{option.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Notes */}
                    {completed && (
                        <div className="mb-6">
                            <p className="text-label mb-3">Notes (optional)</p>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="How your body felt, weather conditions, etc..."
                                className="input w-full min-h-[100px] resize-none"
                            />
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={!completed || saving}
                        className="btn btn-primary w-full"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
