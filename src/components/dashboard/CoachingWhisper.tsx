'use client';

import { motion } from 'framer-motion';
import { COACHES } from '@/config/coach-spec/methodology';
import { TrainingPhase, WorkoutType } from '@/domain/plan/types';

/**
 * CoachingWhisper - Context-specific coaching wisdom
 * 
 * Pulls from real coach methodology, not canned slogans.
 * Contextual to: philosophy, phase, workout type, week number
 */

interface CoachingWhisperProps {
    philosophy?: 'hansons' | 'higdon' | 'pfitzinger' | 'daniels' | 'fitzgerald' | 'magness';
    phase: TrainingPhase;
    workoutType?: WorkoutType;
    workoutNotes?: string;
    coachSource?: string;
    weekNumber: number;
    totalWeeks: number;
}

export function CoachingWhisper({
    philosophy,
    phase,
    workoutType,
    workoutNotes,
    coachSource,
    weekNumber,
    totalWeeks,
}: CoachingWhisperProps) {
    const whisper = getCoachingWhisper({
        philosophy,
        phase,
        workoutType,
        workoutNotes,
        coachSource,
        weekNumber,
        totalWeeks,
    });

    if (!whisper) return null;

    // Get coach color
    const coachColor = philosophy
        ? `var(--color-coach-${philosophy})`
        : 'var(--color-accent)';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-6"
        >
            <div
                className="rounded-xl p-4"
                style={{
                    background: 'color-mix(in srgb, var(--bg-elevated) 80%, transparent)',
                    border: '1px solid var(--border-muted)',
                    backdropFilter: 'blur(8px)',
                }}
            >
                <div className="flex items-start gap-3">
                    {/* Coach indicator */}
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `color-mix(in srgb, ${coachColor} 15%, transparent)` }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={coachColor}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>

                    {/* Whisper content */}
                    <div className="flex-1 min-w-0">
                        <p className="text-body-sm leading-relaxed" style={{ color: 'var(--text-base)' }}>
                            {whisper}
                        </p>
                        {philosophy && COACHES[philosophy] && (
                            <p className="text-caption mt-2" style={{ color: 'var(--text-subtle)' }}>
                                — {COACHES[philosophy].name} methodology
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/**
 * Generate contextual coaching wisdom
 */
function getCoachingWhisper({
    philosophy,
    phase,
    workoutType,
    workoutNotes,
    coachSource,
    weekNumber,
    totalWeeks,
}: Omit<CoachingWhisperProps, 'display'>): string | null {
    const coach = philosophy ? COACHES[philosophy] : null;
    const progressPercent = Math.round((weekNumber / totalWeeks) * 100);

    // Phase-specific wisdom
    const phaseWisdom: Record<TrainingPhase, string[]> = {
        base: [
            "This is foundation work. Every easy mile you run now builds the aerobic base that supports faster running later.",
            "Base phase is about consistency, not intensity. Show up, run easy, build the engine.",
            "Your mitochondria are multiplying. Your capillary density is increasing. Trust the easy miles.",
        ],
        build: [
            "Build phase intensifies the work. Your body is adapting to handle more stress — lean into it.",
            "The quality sessions matter now. Recovery runs between them matter just as much.",
            "This is where the magic happens. Trust the process, even when your legs feel heavy.",
        ],
        peak: [
            "Peak phase: maximum race-specific preparation. Every workout has purpose.",
            "You're as fit as you'll get. Now it's about sharpening, not building.",
            "The hay is almost in the barn. Execute these workouts with precision.",
        ],
        taper: [
            "Taper anxiety is real. Trust the work you've done. Your job now is to arrive fresh.",
            "Less is more. The fitness is there — now let your body absorb it.",
            "You can't gain fitness in taper, but you can lose it by doing too much. Rest well.",
        ],
    };

    // Workout-type specific additions
    const workoutWisdom: Partial<Record<WorkoutType, string>> = {
        tempo: "Tempo pace should feel 'comfortably hard' — you can say a few words, but not hold a conversation.",
        long_easy: "Long runs build your aerobic engine and mental resilience. Start easy, stay easy, finish strong.",
        long_mp_finish: "The MP finish simulates racing on tired legs. This is where marathons are made.",
        vo2max_800s: "VO2max intervals develop your aerobic ceiling. Run them controlled, not all-out.",
        easy: "Easy days are for recovery. If you can't hold a conversation, you're going too hard.",
        recovery: "Recovery runs increase blood flow without adding stress. Keep them truly easy.",
    };

    // Build the whisper
    let whisper = '';

    // Start with coach-specific context if available
    if (coach && philosophy) {
        // Hansons-specific wisdom
        if (philosophy === 'hansons') {
            if (phase === 'build' || phase === 'peak') {
                whisper = "The Hansons method builds cumulative fatigue. Your legs should feel tired going into workouts — that's by design. You're simulating how you'll feel at mile 20 of the marathon.";
            } else {
                whisper = coach.whatThisMeans;
            }
        }
        // Higdon-specific wisdom
        else if (philosophy === 'higdon') {
            if (phase === 'base') {
                whisper = "Higdon's approach prioritizes consistency and gradual progression. Don't rush the early weeks — foundation before intensity.";
            } else if (phase === 'taper') {
                whisper = "Higdon's taper is about trusting the long runs you've banked. The fitness is there. Rest up.";
            } else {
                whisper = coach.whatThisMeans;
            }
        }
        // Pfitzinger-specific wisdom  
        else if (philosophy === 'pfitzinger') {
            if (workoutType?.includes('long')) {
                whisper = "Pfitzinger emphasizes long runs as the foundation. Start conservatively and finish under control — these aren't races.";
            } else if (phase === 'peak') {
                whisper = "Pfitzinger's peak phase focuses on race-specific work. Every session has purpose — execute with precision.";
            } else {
                whisper = coach.whatThisMeans;
            }
        }
        // Daniels-specific wisdom
        else if (philosophy === 'daniels') {
            whisper = "Every pace in your plan is calculated from your VDOT. Trust the numbers — they're based on your proven fitness.";
        }
        // Fitzgerald-specific wisdom
        else if (philosophy === 'fitzgerald') {
            whisper = "The 80/20 principle: 80% of your running should feel genuinely easy. Save the intensity for when it counts.";
        }
        // Default to whatThisMeans
        else {
            whisper = coach.whatThisMeans;
        }
    }

    // If no coach wisdom, use phase wisdom
    if (!whisper) {
        const phaseOptions = phaseWisdom[phase] || phaseWisdom.base;
        whisper = phaseOptions[weekNumber % phaseOptions.length];
    }

    // Add workout-specific note if highly relevant
    if (workoutType && workoutWisdom[workoutType] && !whisper.includes('tempo') && !whisper.includes('long run')) {
        // Only append if it adds value and doesn't repeat
        const workoutNote = workoutWisdom[workoutType];
        if (workoutNote && whisper.length < 150) {
            whisper += ' ' + workoutNote;
        }
    }

    // Use workout notes if available and whisper is short
    if (workoutNotes && whisper.length < 100) {
        whisper += ' ' + workoutNotes;
    }

    return whisper;
}
