/**
 * THE LONG GAME - Hal Higdon Coach Module
 * 
 * Implements Hal Higdon's marathon training methodology with
 * named tiers (Novice 1, Novice 2, Intermediate 1, Intermediate 2, Advanced 1, Advanced 2).
 * 
 * Key patterns:
 * - 20-mile long run cap
 * - Stepback every 3rd week
 * - 3-week taper
 * - Weekend back-to-back (Intermediate+)
 * - 3/1 long run pattern (Advanced)
 * 
 * Source: Oracle Research (14-hal-higdon-master.md)
 */

import { DayPlan, TrainingPhase, HigdonTier, HIGDON_TIER_CONFIGS } from '../types';

// =============================================================================
// MICROCYCLE TEMPLATES
// =============================================================================

export type HigdonDayType =
    | 'rest'
    | 'cross_train'
    | 'easy_run'
    | 'race_pace_run'
    | 'long_run'
    | 'speedwork';

export interface HigdonDaySlot {
    type: HigdonDayType;
    distanceRange?: [number, number]; // [min, max] miles
    durationRange?: [number, number]; // [min, max] minutes (for cross-train)
}

export type HigdonMicrocycle = Record<string, HigdonDaySlot>;

const NOVICE_1_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'rest' },
    tue: { type: 'easy_run', distanceRange: [3, 5] },
    wed: { type: 'easy_run', distanceRange: [3, 10] }, // "Sorta-Long Run"
    thu: { type: 'easy_run', distanceRange: [3, 5] },
    fri: { type: 'rest' },
    sat: { type: 'long_run' },
    sun: { type: 'cross_train', durationRange: [30, 60] },
};

const NOVICE_2_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'rest' },
    tue: { type: 'easy_run', distanceRange: [3, 5] },
    wed: { type: 'race_pace_run', distanceRange: [5, 8] },
    thu: { type: 'easy_run', distanceRange: [3, 5] },
    fri: { type: 'rest' },
    sat: { type: 'long_run' },
    sun: { type: 'cross_train', durationRange: [30, 60] },
};

const INTERMEDIATE_1_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'cross_train', durationRange: [30, 60] },
    tue: { type: 'easy_run', distanceRange: [3, 5] },
    wed: { type: 'easy_run', distanceRange: [5, 8] },
    thu: { type: 'easy_run', distanceRange: [3, 5] },
    fri: { type: 'rest' },
    sat: { type: 'race_pace_run', distanceRange: [5, 8] }, // Back-to-back day 1
    sun: { type: 'long_run' }, // Back-to-back day 2
};

const INTERMEDIATE_2_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'cross_train', durationRange: [30, 60] },
    tue: { type: 'easy_run', distanceRange: [3, 5] },
    wed: { type: 'easy_run', distanceRange: [5, 10] },
    thu: { type: 'easy_run', distanceRange: [3, 5] },
    fri: { type: 'rest' },
    sat: { type: 'race_pace_run', distanceRange: [5, 10] },
    sun: { type: 'long_run' },
};

const ADVANCED_1_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'easy_run', distanceRange: [3, 5] },
    tue: { type: 'easy_run', distanceRange: [5, 10] },
    wed: { type: 'easy_run', distanceRange: [3, 5] },
    thu: { type: 'speedwork' }, // Tempo, hills, or 800s
    fri: { type: 'rest' },
    sat: { type: 'race_pace_run', distanceRange: [5, 10] },
    sun: { type: 'long_run' },
};

const ADVANCED_2_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'easy_run', distanceRange: [3, 5] },
    tue: { type: 'speedwork' }, // Tempo, hills, 800s, or 400s
    wed: { type: 'easy_run', distanceRange: [3, 5] },
    thu: { type: 'speedwork' }, // Can swap with race_pace
    fri: { type: 'rest' },
    sat: { type: 'race_pace_run', distanceRange: [4, 10] },
    sun: { type: 'long_run' },
};

export const HIGDON_MICROCYCLES: Record<HigdonTier, HigdonMicrocycle> = {
    novice_1: NOVICE_1_MICROCYCLE,
    novice_2: NOVICE_2_MICROCYCLE,
    novice_supreme: NOVICE_1_MICROCYCLE, // Uses Novice 1 structure
    intermediate_1: INTERMEDIATE_1_MICROCYCLE,
    intermediate_2: INTERMEDIATE_2_MICROCYCLE,
    advanced_1: ADVANCED_1_MICROCYCLE,
    advanced_2: ADVANCED_2_MICROCYCLE,
};

// =============================================================================
// STEPBACK WEEK LOGIC
// =============================================================================

/**
 * Check if a week is a stepback week.
 * Higdon pattern: every 3rd week (weeks 3, 6, 9, 12...) UNLESS it's taper.
 */
export function isHigdonStepbackWeek(
    weekNumber: number,
    totalWeeks: number,
    phase: TrainingPhase
): boolean {
    if (phase === 'taper') return false;
    return weekNumber % 3 === 0;
}

/**
 * Calculate stepback reductions.
 * Long run: -25% to -35%
 * Weekly mileage: -10% to -20%
 */
export function getStepbackReduction(weekNumber: number): {
    longRunReduction: number;
    weeklyMileageReduction: number;
} {
    // Vary slightly to avoid monotony
    const cycle = weekNumber % 9;
    if (cycle === 3) {
        return { longRunReduction: 0.25, weeklyMileageReduction: 0.10 };
    } else if (cycle === 6) {
        return { longRunReduction: 0.30, weeklyMileageReduction: 0.15 };
    }
    return { longRunReduction: 0.35, weeklyMileageReduction: 0.20 };
}

// =============================================================================
// LONG RUN PROGRESSION
// =============================================================================

/**
 * Generate Higdon-style long run progression.
 * Key rule: Cap at 20 miles, with 1-3 20-milers depending on tier.
 */
export function generateHigdonLongRunProgression(
    tier: HigdonTier,
    totalWeeks: number
): number[] {
    const config = HIGDON_TIER_CONFIGS[tier];
    const progression: number[] = [];

    // Starting long run distances by tier
    const startDistance: Record<HigdonTier, number> = {
        novice_1: 6,
        novice_2: 8,
        novice_supreme: 6,
        intermediate_1: 8,
        intermediate_2: 10,
        advanced_1: 10,
        advanced_2: 10,
    };

    let currentDistance = startDistance[tier];

    for (let week = 1; week <= totalWeeks; week++) {
        const phase = getHigdonPhase(week, totalWeeks);

        // Check if this is a 20-miler week
        if (config.twentyMilerWeeks.includes(week)) {
            progression.push(20);
            currentDistance = 20;
            continue;
        }

        // Taper weeks
        if (phase === 'taper') {
            const tapering = getTaperLongRun(week, totalWeeks);
            progression.push(tapering);
            continue;
        }

        // Stepback week
        if (isHigdonStepbackWeek(week, totalWeeks, phase)) {
            const reduction = getStepbackReduction(week);
            const stepbackDistance = Math.round(currentDistance * (1 - reduction.longRunReduction));
            progression.push(Math.max(stepbackDistance, startDistance[tier]));
            continue;
        }

        // Normal progression: +1 mile per week
        currentDistance = Math.min(currentDistance + 1, 20);
        progression.push(currentDistance);
    }

    return progression;
}

/**
 * Get taper long run distances.
 * Pattern: 20 → 12 → 8 → Race (26.2)
 */
function getTaperLongRun(weekNumber: number, totalWeeks: number): number {
    const weeksToRace = totalWeeks - weekNumber;
    if (weeksToRace === 2) return 12;
    if (weeksToRace === 1) return 8;
    if (weeksToRace === 0) return 0; // Race week - no long run before race
    return 12; // Default for early taper
}

// =============================================================================
// PHASE CALCULATION
// =============================================================================

/**
 * Determine training phase for Higdon plans.
 * Standard 18-week: base (1-6), build (7-12), peak (13-15), taper (16-18)
 */
export function getHigdonPhase(weekNumber: number, totalWeeks: number): TrainingPhase {
    const weeksToRace = totalWeeks - weekNumber;

    if (weeksToRace <= 2) return 'taper';
    if (weekNumber >= totalWeeks * 0.72) return 'peak'; // Weeks 13-15 of 18
    if (weekNumber >= totalWeeks * 0.33) return 'build'; // Weeks 7-12 of 18
    return 'base';
}

// =============================================================================
// SPECIAL PATTERNS
// =============================================================================

/**
 * Check if this week should use the 3/1 long run pattern.
 * Pattern: 75% easy, 25% faster (not race pace, just "steady")
 * Frequency: Once every 3 weekends in a cycle: [easy, 3/1, stepback]
 */
export function shouldUseThreeOneLongRun(
    tier: HigdonTier,
    weekNumber: number,
    phase: TrainingPhase
): boolean {
    const config = HIGDON_TIER_CONFIGS[tier];
    if (!config.hasThreeOneLongRun) return false;
    if (phase !== 'build' && phase !== 'peak') return false;
    if (isHigdonStepbackWeek(weekNumber, 18, phase)) return false;

    // Use 3/1 pattern on week 2 of every 3-week block
    return weekNumber % 3 === 2;
}

/**
 * Build the 3/1 long run structure.
 */
export function buildThreeOneLongRun(totalMiles: number): {
    easyMiles: number;
    fastMiles: number;
} {
    return {
        easyMiles: Math.round(totalMiles * 0.75 * 10) / 10,
        fastMiles: Math.round(totalMiles * 0.25 * 10) / 10,
    };
}

// =============================================================================
// EXPORTS
// =============================================================================

export function getHigdonTierConfig(tier: HigdonTier) {
    return HIGDON_TIER_CONFIGS[tier];
}

export function getMicrocycleForTier(tier: HigdonTier): HigdonMicrocycle {
    return HIGDON_MICROCYCLES[tier];
}
