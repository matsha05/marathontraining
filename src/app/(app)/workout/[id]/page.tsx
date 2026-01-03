"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/ui/AppHeader';
import { handleMissedWorkout, MissedWorkoutDecision } from '@/domain/plan-generator/missed-workout-handler';

/**
 * Workout Detail Page
 * 
 * Shows the full workout prescription with pace targets,
 * clear structure, and one-tap logging.
 */

// Mock data - would come from API
const MOCK_WORKOUT = {
    id: '1',
    date: new Date(),
    sessionType: 'tempo',
    domain: 'running',
    title: 'Tempo Run',
    phase: 'BUILD',
    weekNumber: 8,

    prescription: {
        warmup: {
            distanceMiles: 2,
            paceZone: 'E',
            paceRange: '8:12 - 9:00',
            duration: '~18 min',
        },
        mainSet: {
            type: 'continuous',
            distanceMiles: 5,
            paceZone: 'T',
            pace: '7:04',
            duration: '~35 min',
            description: 'Comfortably hard. You should be able to speak in short sentences.',
        },
        cooldown: {
            distanceMiles: 1,
            paceZone: 'E',
            paceRange: '8:12 - 9:00',
            duration: '~9 min',
        },
    },

    totalDistance: 8,
    estimatedDuration: 62,

    coachNotes: 'Tempo runs build your lactate threshold. Focus on staying relaxed at T-pace—if you\'re straining, you\'re going too fast.',

    strength: null,
    durability: {
        modules: ['hip_stability', 'core_stability'],
        estimatedDuration: 25,
    },
};

export default function WorkoutDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [showLogging, setShowLogging] = useState(false);
    const workout = MOCK_WORKOUT;

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

    return (
        <div className="min-h-screen landing-shell">
            <AppHeader
                backHref="/dashboard"
                rightContent={<span className="text-label">{workout.phase} • Week {workout.weekNumber}</span>}
            />

            <main className="max-w-3xl mx-auto px-6 py-10">
                {/* Workout Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div
                                className="inline-block px-3 py-1 rounded-lg text-label mb-3"
                                style={{
                                    backgroundColor: domainTints[workout.domain],
                                    color: domainColors[workout.domain]
                                }}
                            >
                                {workout.sessionType}
                            </div>
                            <h1 className="text-display-md">{workout.title}</h1>
                        </div>

                        <div className="text-right">
                            <p className="text-heading-lg text-data">{workout.totalDistance}</p>
                            <p className="text-caption text-[var(--text-muted)] uppercase">miles</p>
                        </div>
                    </div>

                    <p className="text-body-sm text-[var(--text-muted)]">
                        ~{workout.estimatedDuration} min total
                    </p>
                </div>

                {/* Workout Structure */}
                <section className="mb-8">
                    <h2 className="text-label mb-4">Workout Structure</h2>

                    <div className="space-y-3">
                        {/* Warmup */}
                        <div className="card p-5">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-muted)] flex items-center justify-center text-body-sm font-semibold">
                                        1
                                    </div>
                                    <div>
                                        <p className="font-semibold">Warmup</p>
                                        <p className="text-body-sm text-[var(--text-muted)]">{workout.prescription.warmup.distanceMiles} mi easy</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-semibold">{workout.prescription.warmup.paceRange}</p>
                                    <p className="text-caption text-[var(--text-muted)]">{workout.prescription.warmup.duration}</p>
                                </div>
                            </div>
                        </div>

                        {/* Main Set - Highlighted */}
                        <div
                            className="card p-5 border-l-4"
                            style={{ borderLeftColor: domainColors.running }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-body-sm font-bold"
                                        style={{ backgroundColor: domainColors.running, color: '#04110b' }}
                                    >
                                        2
                                    </div>
                                    <div>
                                        <p className="font-semibold">Main Set</p>
                                        <p className="text-body-sm text-[var(--text-muted)]">{workout.prescription.mainSet.distanceMiles} mi @ T-pace</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-heading-lg text-data" style={{ color: domainColors.running }}>
                                        {workout.prescription.mainSet.pace}/mi
                                    </p>
                                    <p className="text-caption text-[var(--text-muted)]">{workout.prescription.mainSet.duration}</p>
                                </div>
                            </div>

                            <p className="text-body-sm text-[var(--text-muted)] bg-[var(--bg-tertiary)] rounded-lg p-3">
                                💡 {workout.prescription.mainSet.description}
                            </p>
                        </div>

                        {/* Cooldown */}
                        <div className="card p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-body-sm font-semibold">
                                        3
                                    </div>
                                    <div>
                                        <p className="font-semibold">Cooldown</p>
                                        <p className="text-body-sm text-[var(--text-muted)]">{workout.prescription.cooldown.distanceMiles} mi easy</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-semibold">{workout.prescription.cooldown.paceRange}</p>
                                    <p className="text-caption text-[var(--text-muted)]">{workout.prescription.cooldown.duration}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Coach Notes */}
                {workout.coachNotes && (
                    <section className="mb-8">
                        <h2 className="text-label mb-4">Coach Notes</h2>
                        <div className="card p-5 bg-[var(--bg-muted)]">
                            <p className="text-body-sm text-[var(--text-muted)] italic">"{workout.coachNotes}"</p>
                            <p className="text-caption mt-3">— Based on Daniels' Running Formula</p>
                        </div>
                    </section>
                )}

                {/* Durability Work */}
                {workout.durability && (
                    <section className="mb-8">
                        <h2 className="text-label mb-4">Post-Run Durability</h2>
                        <div
                            className="card p-5 border-l-4"
                            style={{ borderLeftColor: domainColors.durability }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">Movement Work</p>
                                    <p className="text-body-sm text-[var(--text-muted)]">
                                        Hip Stability + Core Stability circuits
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">{workout.durability.estimatedDuration} min</p>
                                </div>
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
                    onComplete={() => {
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
    workout: typeof MOCK_WORKOUT;
    onClose: () => void;
    onComplete: () => void;
}) {
    const [completed, setCompleted] = useState<'full' | 'partial' | 'skipped' | null>(null);
    const [feelRating, setFeelRating] = useState<number | null>(null);
    const [notes, setNotes] = useState('');

    // Coach-rooted feel scale
    const feelOptions = [
        { value: 1, label: 'Struggled', emoji: '😫', description: 'Way harder than expected' },
        { value: 2, label: 'Tough', emoji: '😓', description: 'Harder than it should be' },
        { value: 3, label: 'Right', emoji: '😌', description: 'Effort matched the workout' },
        { value: 4, label: 'Strong', emoji: '💪', description: 'Felt easier than expected' },
        { value: 5, label: 'Crushing', emoji: '🔥', description: 'Could\'ve done more' },
    ];

    const handleSubmit = () => {
        // TODO: Save to database
        console.log({ completed, feelRating, notes });
        onComplete();
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

                    {/* Completion Status */}
                    <div className="mb-6">
                        <p className="text-label mb-3">Did you complete it?</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'full', label: 'Yes', icon: '✓' },
                                { value: 'partial', label: 'Partial', icon: '½' },
                                { value: 'skipped', label: 'Skipped', icon: '✗' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setCompleted(opt.value as any)}
                                    className={`p-4 rounded-xl text-center transition-all ${completed === opt.value
                                        ? opt.value === 'full'
                                            ? 'bg-[var(--color-accent)] text-black'
                                            : opt.value === 'partial'
                                                ? 'bg-[var(--color-warning)] text-black'
                                                : 'bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]'
                                        : 'bg-[var(--bg-tertiary)]'
                                        }`}
                                >
                                    <span className="text-2xl block mb-1">{opt.icon}</span>
                                    <span className="text-body-sm font-medium">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Feel Rating - Only show if completed or partial */}
                    {(completed === 'full' || completed === 'partial') && (
                        <div className="mb-6 animate-fade-in">
                            <p className="text-label mb-3">How did it feel?</p>
                            <p className="text-caption mb-3">
                                This helps calibrate your training load over time
                            </p>

                            <div className="space-y-2">
                                {feelOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setFeelRating(opt.value)}
                                    className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-all ${feelRating === opt.value
                                            ? 'bg-[var(--color-accent)] text-black'
                                            : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-base)]'
                                            }`}
                                >
                                    <span className="text-2xl">{opt.emoji}</span>
                                    <div className="flex-1">
                                        <p className="font-semibold">{opt.label}</p>
                                        <p className={`text-caption ${feelRating === opt.value ? 'text-black/70' : 'text-[var(--text-muted)]'}`}>
                                            {opt.description}
                                        </p>
                                    </div>
                                </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {completed && (
                        <div className="mb-6 animate-fade-in">
                            <p className="text-label mb-3">Notes (optional)</p>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Anything notable? Weather, how legs felt, etc."
                                className="input h-20 resize-none py-3"
                            />
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={!completed || (completed !== 'skipped' && !feelRating)}
                        className="btn btn-primary btn-lg w-full disabled:opacity-40"
                    >
                        Save Workout
                    </button>
                </div>
            </div>
        </div>
    );
}
