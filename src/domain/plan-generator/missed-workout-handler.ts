/**
 * Missed Workout Handler
 * 
 * Implements the decision tree from Oracle research:
 * - Hansons: "Nothing is make or break" - never try to make up
 * - Daniels: Spacing between Q sessions matters
 * - Pfitzinger: Missing time changes what's realistic
 * 
 * Key principles:
 * 1. Protect the training week's intent
 * 2. Never cram A workouts together
 * 3. Skip is better than compromise
 */

export type MissReason = 'ILLNESS' | 'INJURY' | 'LIFE';
export type WorkoutPriority = 'A' | 'B' | 'C';

export interface MissedWorkoutContext {
    daysMissed: number;
    weeksToRace: number;
    reason: MissReason;
    workoutType: 'quality' | 'long_run' | 'easy' | 'strength' | 'durability';
    priority: WorkoutPriority;
    dayOfWeek: number;
}

export interface MissedWorkoutDecision {
    action: 'SKIP' | 'RESCHEDULE' | 'REVISE_GOAL' | 'REDUCE_AND_CONTINUE';
    rescheduleTo?: number; // Day of week to reschedule to
    adjustments?: {
        reduceVolumePercent?: number;
        reduceIntensity?: boolean;
        goalRevisionNeeded?: boolean;
        message: string;
    };
}

/**
 * Workout priority defaults by type
 * A = Sacred (Long Run, Q1, Q2)
 * B = Important (Strength, Medium-Long)
 * C = Flexible (Easy runs, extra mobility)
 */
export function getWorkoutPriority(workoutType: MissedWorkoutContext['workoutType']): WorkoutPriority {
    switch (workoutType) {
        case 'quality':
        case 'long_run':
            return 'A';
        case 'strength':
            return 'B';
        case 'easy':
        case 'durability':
            return 'C';
    }
}

/**
 * Main decision engine for missed workouts
 * Based on Oracle synthesis of Hansons/Daniels/Pfitzinger
 */
export function handleMissedWorkout(ctx: MissedWorkoutContext): MissedWorkoutDecision {
    // === ILLNESS/INJURY PATH ===
    if (ctx.reason === 'ILLNESS' || ctx.reason === 'INJURY') {
        return handlePhysiologicalMiss(ctx);
    }

    // === LIFE/SCHEDULE PATH ===
    return handleLogisticalMiss(ctx);
}

/**
 * Handle missed workout due to illness or injury
 * Pfitzinger's guidelines: 
 * - <10 days: return to schedule, ease into quality
 * - 10+ days & ≤8 weeks to race: revise goal
 */
function handlePhysiologicalMiss(ctx: MissedWorkoutContext): MissedWorkoutDecision {
    // Critical threshold: 10+ days missed and close to race
    if (ctx.daysMissed >= 10 && ctx.weeksToRace <= 8) {
        return {
            action: 'REVISE_GOAL',
            adjustments: {
                goalRevisionNeeded: true,
                reduceIntensity: true,
                message: `You've missed ${ctx.daysMissed} days with only ${ctx.weeksToRace} weeks to race. ` +
                    `Consider adjusting your goal pace. First 3 sessions back should be easy only.`,
            },
        };
    }

    // Standard illness return: ease back in
    if (ctx.daysMissed >= 3) {
        return {
            action: 'REDUCE_AND_CONTINUE',
            adjustments: {
                reduceVolumePercent: 50, // First Q back at 50%
                reduceIntensity: true,
                message: `Welcome back! First ${Math.min(3, ctx.daysMissed)} sessions should be easy. ` +
                    `When you do your next quality workout, we'll reduce it by 50%.`,
            },
        };
    }

    // Minor 1-2 day illness: just skip and continue
    return {
        action: 'SKIP',
        adjustments: {
            message: `No worries—${ctx.daysMissed} day(s) won't impact your fitness. ` +
                `Resume your normal schedule.`,
        },
    };
}

/**
 * Handle missed workout due to life/schedule constraints
 * Rules:
 * - Never stack A workouts
 * - 2+ easy days between Q sessions (Daniels)
 * - No heavy lower-body within 36h of long run
 */
function handleLogisticalMiss(ctx: MissedWorkoutContext): MissedWorkoutDecision {
    switch (ctx.workoutType) {
        case 'easy':
            // Easy runs: just drop them
            return {
                action: 'SKIP',
                adjustments: {
                    message: `Skipping an easy run is fine. Don't try to redistribute the mileage.`,
                },
            };

        case 'durability':
            // Durability: skip if not convenient
            return {
                action: 'SKIP',
                adjustments: {
                    message: `Durability work can be skipped occasionally. Try to catch it tomorrow if possible.`,
                },
            };

        case 'strength':
            // Strength: can move within week if doesn't impair Q/LR
            const strengthRescheduleDay = findStrengthRescheduleDay(ctx.dayOfWeek);
            if (strengthRescheduleDay !== null) {
                return {
                    action: 'RESCHEDULE',
                    rescheduleTo: strengthRescheduleDay,
                    adjustments: {
                        message: `Moved strength session to ${getDayName(strengthRescheduleDay)}. ` +
                            `This keeps you fresh for your quality runs.`,
                    },
                };
            }
            return {
                action: 'SKIP',
                adjustments: {
                    message: `Can't fit strength in this week without impacting run quality. Skip it.`,
                },
            };

        case 'quality':
            // Quality runs: only move within 48h if spacing preserved
            return handleMissedQuality(ctx);

        case 'long_run':
            // Long run: can move 1 day if recovery allows
            return handleMissedLongRun(ctx);
    }
}

/**
 * Handle missed quality session (Q1 or Q2)
 * Constraint: 2+ easy days between Q sessions
 */
function handleMissedQuality(ctx: MissedWorkoutContext): MissedWorkoutDecision {
    // Try next day
    const nextDay = (ctx.dayOfWeek + 1) % 7;

    // Check if next day would violate spacing (simplified check)
    // In real implementation, check against the week's actual schedule
    const canRescheduleNextDay = !isQualityDay(nextDay) && !isLongRunDay(nextDay);

    if (canRescheduleNextDay) {
        return {
            action: 'RESCHEDULE',
            rescheduleTo: nextDay,
            adjustments: {
                message: `Quality session moved to ${getDayName(nextDay)}. ` +
                    `Make sure to keep tomorrow easy.`,
            },
        };
    }

    // Can't reschedule without breaking constraints
    return {
        action: 'SKIP',
        adjustments: {
            message: `Skipping this quality session to protect your spacing. ` +
                `Focus on the next one—one missed Q won't hurt you.`,
        },
    };
}

/**
 * Handle missed long run
 * Options: move 1 day (reduced) or skip
 */
function handleMissedLongRun(ctx: MissedWorkoutContext): MissedWorkoutDecision {
    // Try next day with reduced duration
    const nextDay = (ctx.dayOfWeek + 1) % 7;

    // Check if we can still recover for next week
    const canMoveToNextDay = ctx.dayOfWeek !== 0; // Don't push Sunday to Monday

    if (canMoveToNextDay) {
        return {
            action: 'RESCHEDULE',
            rescheduleTo: nextDay,
            adjustments: {
                reduceVolumePercent: 25, // Do at 75% duration
                message: `Long run moved to ${getDayName(nextDay)} at 75% planned duration. ` +
                    `Keep it easy—this is about time on feet, not pace.`,
            },
        };
    }

    return {
        action: 'SKIP',
        adjustments: {
            message: `Missing one long run won't derail your plan. ` +
                `Focus on next week's long run and don't try to make up distance.`,
        },
    };
}

// === Helper functions ===

function findStrengthRescheduleDay(missedDay: number): number | null {
    // Try to find a non-Q, non-LR day within 2 days
    const candidates = [
        (missedDay + 1) % 7,
        (missedDay + 2) % 7,
    ];

    for (const day of candidates) {
        if (!isQualityDay(day) && !isLongRunDay(day) && !isPreLongRunDay(day)) {
            return day;
        }
    }
    return null;
}

// Default schedule assumptions (should be passed from actual schedule)
function isQualityDay(day: number): boolean {
    // Default: Tuesday (2) and Thursday (4) are Q days
    return day === 2 || day === 4;
}

function isLongRunDay(day: number): boolean {
    // Default: Sunday (0) is long run
    return day === 0;
}

function isPreLongRunDay(day: number): boolean {
    // Default: Saturday (6) is pre-long-run
    return day === 6;
}

function getDayName(day: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
}

/**
 * Bulk assessment: should user revise their goal?
 * Based on Pfitzinger/Hansons thresholds
 */
export function shouldReviseGoal(ctx: {
    totalDaysMissedLast8Weeks: number;
    missedQualitySessions: number;
    weeksToRace: number;
}): { shouldRevise: boolean; suggestedAdjustmentPercent: number; reason: string } {
    // Hansons: Missing 2+ SOS in a week = reassess
    if (ctx.missedQualitySessions >= 4 && ctx.weeksToRace <= 6) {
        return {
            shouldRevise: true,
            suggestedAdjustmentPercent: 5,
            reason: 'Missed 4+ quality sessions in training block. Consider a 5% slower goal pace.',
        };
    }

    // Pfitzinger: 7-13 days missed = ~4% slower
    if (ctx.totalDaysMissedLast8Weeks >= 7 && ctx.totalDaysMissedLast8Weeks <= 13) {
        return {
            shouldRevise: true,
            suggestedAdjustmentPercent: 4,
            reason: 'Based on research, 7-13 missed days typically results in ~4% slower finish.',
        };
    }

    // Pfitzinger: 14+ days = ~8% slower
    if (ctx.totalDaysMissedLast8Weeks >= 14) {
        return {
            shouldRevise: true,
            suggestedAdjustmentPercent: 8,
            reason: 'Extended time off suggests adjusting goal by ~8%. Focus on finishing strong.',
        };
    }

    return {
        shouldRevise: false,
        suggestedAdjustmentPercent: 0,
        reason: 'Your training is on track. Keep going!',
    };
}
