/**
 * THE LONG GAME - Hal Higdon Coach Module
 *
 * Complete implementation of all 22 Hal Higdon training plans:
 * - Base Training: Novice, Intermediate, Advanced, Spring Training
 * - 5K: Novice, Intermediate, Advanced
 * - 10K: Novice, Intermediate, Advanced
 * - Half Marathon: Novice 1, Novice 2, Intermediate 1, Advanced, HM3
 * - Marathon: Novice 1, Novice 2, Supreme, Intermediate 1, Intermediate 2, Advanced 1, Advanced 2
 *
 * Key patterns:
 * - Distance-specific long run caps and progressions
 * - Stepback every 3rd week (varies by distance)
 * - Tune-up races integrated
 * - 3-week taper for marathon, 1-2 weeks for shorter distances
 * - Weekend back-to-back (Intermediate+)
 * - 3/1 long run pattern (Advanced)
 *
 * Source: Official halhigdon.com plans + Oracle Research
 */

import {
    TrainingPhase,
    HigdonTier,
    HigdonDistance,
    HIGDON_TIER_CONFIGS,
} from '../types';

// =============================================================================
// MICROCYCLE TEMPLATES
// =============================================================================

export type HigdonDayType =
    | 'rest'
    | 'cross_train'
    | 'easy_run'
    | 'race_pace_run'
    | 'long_run'
    | 'speedwork'
    | 'tempo'
    | 'intervals'
    | 'hills'
    | 'fartlek'
    | 'strength'
    | 'walk'
    | 'stretch';

export interface HigdonDaySlot {
    type: HigdonDayType;
    distanceRange?: [number, number]; // [min, max] miles
    durationRange?: [number, number]; // [min, max] minutes
    notes?: string;
}

export type HigdonMicrocycle = Record<string, HigdonDaySlot>;

// =============================================================================
// BASE TRAINING MICROCYCLES
// =============================================================================

const BASE_NOVICE_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'rest' },
    tue: { type: 'easy_run', distanceRange: [3, 3] },
    wed: { type: 'easy_run', distanceRange: [3, 3] },
    thu: { type: 'easy_run', distanceRange: [3, 3] },
    fri: { type: 'rest' },
    sat: { type: 'walk', durationRange: [30, 30] },
    sun: { type: 'long_run' },
};

const BASE_INTERMEDIATE_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'easy_run', distanceRange: [3, 3] },
    tue: { type: 'easy_run', distanceRange: [3, 3], notes: '+ strength' },
    wed: { type: 'easy_run', distanceRange: [4, 8] },
    thu: { type: 'easy_run', distanceRange: [3, 3] },
    fri: { type: 'easy_run', distanceRange: [3, 3], notes: '+ strength' },
    sat: { type: 'easy_run', distanceRange: [3, 3] },
    sun: { type: 'long_run' },
};

const BASE_ADVANCED_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'easy_run', distanceRange: [3, 3], notes: '+ strength' },
    tue: { type: 'hills', notes: '5-10 reps OR 16x200/10x400' },
    wed: { type: 'easy_run', distanceRange: [3, 6], notes: '+ stretch' },
    thu: { type: 'tempo', durationRange: [30, 45], notes: 'or fartlek' },
    fri: { type: 'easy_run', distanceRange: [3, 3], notes: '+ strength' },
    sat: { type: 'fartlek', durationRange: [30, 30], notes: 'or tempo/rest' },
    sun: { type: 'long_run' },
};

const BASE_SPRING_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'rest' },
    tue: { type: 'easy_run', durationRange: [30, 45], notes: '+ strength on odd weeks' },
    wed: { type: 'cross_train', durationRange: [30, 40], notes: 'bike' },
    thu: { type: 'intervals', notes: '6-10 x 400m OR run + strength' },
    fri: { type: 'strength', notes: 'or tempo 30-50min' },
    sat: { type: 'long_run', notes: 'time-based: 50-90min' },
    sun: { type: 'cross_train', notes: 'or time trial' },
};

// =============================================================================
// 5K MICROCYCLES
// =============================================================================

const FIVEK_NOVICE_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'rest', notes: 'or run/walk' },
    tue: { type: 'easy_run', distanceRange: [1.5, 3] },
    wed: { type: 'rest', notes: 'or run/walk' },
    thu: { type: 'easy_run', distanceRange: [1.5, 2] },
    fri: { type: 'rest' },
    sat: { type: 'easy_run', distanceRange: [1.5, 3] },
    sun: { type: 'walk', durationRange: [30, 60] },
};

const FIVEK_INTERMEDIATE_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'rest' },
    tue: { type: 'easy_run', distanceRange: [3, 3] },
    wed: { type: 'intervals', notes: '5-8 x 400m OR tempo 30-35min' },
    thu: { type: 'easy_run', distanceRange: [2, 3] },
    fri: { type: 'rest' },
    sat: { type: 'easy_run', distanceRange: [3, 3], notes: 'or fast' },
    sun: { type: 'long_run', distanceRange: [5, 7] },
};

const FIVEK_ADVANCED_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'easy_run', distanceRange: [2, 3] },
    tue: { type: 'intervals', notes: '5-8 x 400m OR 6-10 x 200m' },
    wed: { type: 'rest', notes: 'or easy run' },
    thu: { type: 'tempo', durationRange: [30, 45] },
    fri: { type: 'rest' },
    sat: { type: 'easy_run', distanceRange: [4, 6], notes: 'fast' },
    sun: { type: 'long_run', notes: 'time-based: 60-90min' },
};

// =============================================================================
// 10K MICROCYCLES
// =============================================================================

const TENK_NOVICE_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'rest' },
    tue: { type: 'easy_run', distanceRange: [2, 3] },
    wed: { type: 'cross_train', durationRange: [30, 35] },
    thu: { type: 'easy_run', distanceRange: [2, 2] },
    fri: { type: 'rest' },
    sat: { type: 'cross_train', durationRange: [40, 40] },
    sun: { type: 'long_run', distanceRange: [3, 5.5] },
};

const TENK_INTERMEDIATE_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'easy_run', distanceRange: [3, 3] },
    tue: { type: 'easy_run', distanceRange: [3, 6] },
    wed: { type: 'tempo', durationRange: [35, 50], notes: 'or 8-10 x 400m' },
    thu: { type: 'easy_run', distanceRange: [3, 4] },
    fri: { type: 'rest' },
    sat: { type: 'cross_train', durationRange: [60, 60] },
    sun: { type: 'long_run', distanceRange: [4, 8] },
};

const TENK_ADVANCED_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'easy_run', distanceRange: [3, 3] },
    tue: { type: 'tempo', durationRange: [30, 60] },
    wed: { type: 'intervals', notes: '6-12 x 400m' },
    thu: { type: 'easy_run', distanceRange: [3, 6] },
    fri: { type: 'rest', notes: 'or 3mi easy' },
    sat: { type: 'race_pace_run', distanceRange: [5, 6], notes: '2-3mi at pace' },
    sun: { type: 'long_run', distanceRange: [6, 10] },
};

// =============================================================================
// HALF MARATHON MICROCYCLES
// =============================================================================

const HALF_NOVICE_1_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'rest' },
    tue: { type: 'easy_run', distanceRange: [3, 5] },
    wed: { type: 'easy_run', distanceRange: [2, 3], notes: 'or cross-train' },
    thu: { type: 'easy_run', distanceRange: [3, 5] },
    fri: { type: 'rest' },
    sat: { type: 'cross_train', durationRange: [30, 30] },
    sun: { type: 'long_run', distanceRange: [4, 10] },
};

const HALF_NOVICE_2_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'rest' },
    tue: { type: 'easy_run', distanceRange: [3, 5] },
    wed: { type: 'race_pace_run', distanceRange: [3, 5], notes: 'even weeks' },
    thu: { type: 'easy_run', distanceRange: [3, 5] },
    fri: { type: 'rest' },
    sat: { type: 'long_run', distanceRange: [4, 10] },
    sun: { type: 'cross_train', durationRange: [60, 60] },
};

const HALF_INTERMEDIATE_1_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'cross_train', durationRange: [30, 60] },
    tue: { type: 'easy_run', distanceRange: [3, 5] },
    wed: { type: 'race_pace_run', distanceRange: [4, 8] },
    thu: { type: 'easy_run', distanceRange: [3, 5] },
    fri: { type: 'rest' },
    sat: { type: 'race_pace_run', distanceRange: [3, 5], notes: 'alternating weeks' },
    sun: { type: 'long_run', distanceRange: [4, 12] },
};

const HALF_ADVANCED_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'easy_run', distanceRange: [3, 3] },
    tue: { type: 'hills', notes: '6-10 reps OR 7-10 x 400m' },
    wed: { type: 'easy_run', distanceRange: [3, 3] },
    thu: { type: 'tempo', durationRange: [30, 50] },
    fri: { type: 'rest' },
    sat: { type: 'race_pace_run', distanceRange: [3, 4] },
    sun: { type: 'long_run', notes: 'time-based: 75-100min' },
};

const HALF_HM3_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'rest' },
    tue: { type: 'easy_run', distanceRange: [4, 6] },
    wed: { type: 'cross_train', durationRange: [30, 60] },
    thu: { type: 'easy_run', distanceRange: [3, 6], notes: '3-week rotation: easy/tempo/pace' },
    fri: { type: 'rest' },
    sat: { type: 'long_run', distanceRange: [6, 10] },
    sun: { type: 'cross_train', durationRange: [30, 60] },
};

// =============================================================================
// MARATHON MICROCYCLES
// =============================================================================

const MARATHON_NOVICE_1_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'rest' },
    tue: { type: 'easy_run', distanceRange: [3, 5] },
    wed: { type: 'easy_run', distanceRange: [3, 10] },
    thu: { type: 'easy_run', distanceRange: [3, 5] },
    fri: { type: 'rest' },
    sat: { type: 'long_run' },
    sun: { type: 'cross_train', durationRange: [30, 60] },
};

const MARATHON_NOVICE_2_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'rest' },
    tue: { type: 'easy_run', distanceRange: [3, 5] },
    wed: { type: 'race_pace_run', distanceRange: [5, 8] },
    thu: { type: 'easy_run', distanceRange: [3, 5] },
    fri: { type: 'rest' },
    sat: { type: 'long_run' },
    sun: { type: 'cross_train', durationRange: [30, 60] },
};

const MARATHON_INTERMEDIATE_1_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'cross_train', durationRange: [30, 60] },
    tue: { type: 'easy_run', distanceRange: [3, 5] },
    wed: { type: 'easy_run', distanceRange: [5, 8] },
    thu: { type: 'easy_run', distanceRange: [3, 5] },
    fri: { type: 'rest' },
    sat: { type: 'race_pace_run', distanceRange: [5, 8] },
    sun: { type: 'long_run' },
};

const MARATHON_INTERMEDIATE_2_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'cross_train', durationRange: [30, 60] },
    tue: { type: 'easy_run', distanceRange: [3, 5] },
    wed: { type: 'easy_run', distanceRange: [5, 10] },
    thu: { type: 'easy_run', distanceRange: [3, 5] },
    fri: { type: 'rest' },
    sat: { type: 'race_pace_run', distanceRange: [5, 10] },
    sun: { type: 'long_run' },
};

const MARATHON_ADVANCED_1_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'easy_run', distanceRange: [3, 5] },
    tue: { type: 'easy_run', distanceRange: [5, 10] },
    wed: { type: 'easy_run', distanceRange: [3, 5] },
    thu: { type: 'speedwork', notes: 'hills, tempo, or 800s' },
    fri: { type: 'rest' },
    sat: { type: 'race_pace_run', distanceRange: [5, 10] },
    sun: { type: 'long_run' },
};

const MARATHON_ADVANCED_2_MICROCYCLE: HigdonMicrocycle = {
    mon: { type: 'easy_run', distanceRange: [3, 5] },
    tue: { type: 'speedwork', notes: 'hills, tempo, 800s, or 400s' },
    wed: { type: 'easy_run', distanceRange: [3, 5] },
    thu: { type: 'speedwork', notes: 'or race pace' },
    fri: { type: 'rest' },
    sat: { type: 'race_pace_run', distanceRange: [4, 10] },
    sun: { type: 'long_run' },
};

// =============================================================================
// MICROCYCLE REGISTRY
// =============================================================================

export const HIGDON_MICROCYCLES: Record<HigdonTier, HigdonMicrocycle> = {
    // Base Training
    base_novice: BASE_NOVICE_MICROCYCLE,
    base_intermediate: BASE_INTERMEDIATE_MICROCYCLE,
    base_advanced: BASE_ADVANCED_MICROCYCLE,
    base_spring: BASE_SPRING_MICROCYCLE,
    // 5K
    '5k_novice': FIVEK_NOVICE_MICROCYCLE,
    '5k_intermediate': FIVEK_INTERMEDIATE_MICROCYCLE,
    '5k_advanced': FIVEK_ADVANCED_MICROCYCLE,
    // 10K
    '10k_novice': TENK_NOVICE_MICROCYCLE,
    '10k_intermediate': TENK_INTERMEDIATE_MICROCYCLE,
    '10k_advanced': TENK_ADVANCED_MICROCYCLE,
    // Half Marathon
    half_novice_1: HALF_NOVICE_1_MICROCYCLE,
    half_novice_2: HALF_NOVICE_2_MICROCYCLE,
    half_intermediate_1: HALF_INTERMEDIATE_1_MICROCYCLE,
    half_advanced: HALF_ADVANCED_MICROCYCLE,
    half_hm3: HALF_HM3_MICROCYCLE,
    // Marathon
    marathon_novice_1: MARATHON_NOVICE_1_MICROCYCLE,
    marathon_novice_2: MARATHON_NOVICE_2_MICROCYCLE,
    marathon_novice_supreme: MARATHON_NOVICE_1_MICROCYCLE, // Uses Novice 1 structure
    marathon_intermediate_1: MARATHON_INTERMEDIATE_1_MICROCYCLE,
    marathon_intermediate_2: MARATHON_INTERMEDIATE_2_MICROCYCLE,
    marathon_advanced_1: MARATHON_ADVANCED_1_MICROCYCLE,
    marathon_advanced_2: MARATHON_ADVANCED_2_MICROCYCLE,
};

// =============================================================================
// TUNE-UP RACE DETECTION
// =============================================================================

/**
 * Check if a week is a tune-up race week.
 * Tune-up races affect scheduling: typically replace the long run with a race.
 */
export function isTuneUpRaceWeek(tier: HigdonTier, weekNumber: number): boolean {
    const config = HIGDON_TIER_CONFIGS[tier];
    if (!config.tuneUpRaceWeeks) return false;
    return config.tuneUpRaceWeeks.some((r) => r.week === weekNumber);
}

/**
 * Get tune-up race details for a given week.
 */
export function getTuneUpRaceDetails(
    tier: HigdonTier,
    weekNumber: number
): { week: number; distance: string } | null {
    const config = HIGDON_TIER_CONFIGS[tier];
    if (!config.tuneUpRaceWeeks) return null;
    return config.tuneUpRaceWeeks.find((r) => r.week === weekNumber) ?? null;
}

// =============================================================================
// STEPBACK WEEK LOGIC
// =============================================================================

/**
 * Check if a week is a stepback week.
 * Pattern varies by distance:
 * - Marathon: every 3rd week (3, 6, 9, 12...) unless taper or tune-up
 * - Half/10K/5K: specified in stepbackWeeks or natural recovery
 * - Base: specified stepback weeks
 */
export function isHigdonStepbackWeek(
    tier: HigdonTier,
    weekNumber: number,
    totalWeeks: number,
    phase: TrainingPhase
): boolean {
    const config = HIGDON_TIER_CONFIGS[tier];

    // Never stepback during taper
    if (phase === 'taper') return false;

    // Tune-up race weeks are natural stepbacks
    if (isTuneUpRaceWeek(tier, weekNumber)) return true;

    // Check explicit stepback weeks
    if (config.stepbackWeeks?.includes(weekNumber)) return true;

    // Marathon: every 3rd week
    if (config.distance === 'marathon') {
        return weekNumber % 3 === 0;
    }

    return false;
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
 * Get distance category from tier
 */
export function getDistanceFromTier(tier: HigdonTier): HigdonDistance {
    return HIGDON_TIER_CONFIGS[tier].distance;
}

/**
 * Starting long run distances by tier
 */
const START_DISTANCES: Record<HigdonTier, number> = {
    // Base Training
    base_novice: 3,
    base_intermediate: 4,
    base_advanced: 6,
    base_spring: 50, // minutes, not miles
    // 5K
    '5k_novice': 1.5,
    '5k_intermediate': 5,
    '5k_advanced': 60, // minutes
    // 10K
    '10k_novice': 3,
    '10k_intermediate': 4,
    '10k_advanced': 6,
    // Half Marathon
    half_novice_1: 4,
    half_novice_2: 4,
    half_intermediate_1: 4,
    half_advanced: 90, // minutes
    half_hm3: 6,
    // Marathon
    marathon_novice_1: 6,
    marathon_novice_2: 8,
    marathon_novice_supreme: 6,
    marathon_intermediate_1: 8,
    marathon_intermediate_2: 10,
    marathon_advanced_1: 10,
    marathon_advanced_2: 10,
};

/**
 * Long run caps by distance
 */
const LONG_RUN_CAPS: Record<HigdonDistance, number> = {
    base: 10,
    '5k': 7,
    '10k': 10,
    half: 12,
    marathon: 20,
};

/**
 * Generate Higdon-style long run progression.
 * Handles all distances with appropriate caps.
 */
export function generateHigdonLongRunProgression(
    tier: HigdonTier,
    totalWeeks: number
): number[] {
    const config = HIGDON_TIER_CONFIGS[tier];
    const progression: number[] = [];
    const distance = config.distance;
    const cap = LONG_RUN_CAPS[distance];
    const isTimeBasedPlan =
        config.peakLongRunMinutes !== undefined && config.peakLongRunMiles === undefined;

    let currentDistance = START_DISTANCES[tier];
    const increment = isTimeBasedPlan ? 5 : 1;

    for (let week = 1; week <= totalWeeks; week++) {
        const phase = getHigdonPhase(tier, week, totalWeeks);

        // Marathon 20-miler weeks
        if (distance === 'marathon' && config.twentyMilerWeeks?.includes(week)) {
            progression.push(20);
            currentDistance = 20;
            continue;
        }

        // Tune-up race week - typically shorter (replaces long run)
        if (isTuneUpRaceWeek(tier, week)) {
            progression.push(0); // Race replaces long run
            continue;
        }

        // Taper weeks
        if (phase === 'taper') {
            const tapering = getTaperLongRun(tier, week, totalWeeks);
            progression.push(tapering);
            continue;
        }

        // Stepback week
        if (isHigdonStepbackWeek(tier, week, totalWeeks, phase)) {
            const reduction = getStepbackReduction(week);
            const stepbackDistance = Math.round(
                currentDistance * (1 - reduction.longRunReduction)
            );
            progression.push(Math.max(stepbackDistance, START_DISTANCES[tier]));
            continue;
        }

        // Week 1: use starting distance, no increment
        if (week === 1) {
            progression.push(currentDistance);
            continue;
        }

        // Normal progression: +1 mile/5min per week (capped)
        currentDistance = Math.min(currentDistance + increment, cap);
        progression.push(currentDistance);
    }

    return progression;
}

/**
 * Get taper long run distances.
 * Pattern varies by distance.
 */
function getTaperLongRun(
    tier: HigdonTier,
    weekNumber: number,
    totalWeeks: number
): number {
    const config = HIGDON_TIER_CONFIGS[tier];
    const weeksToRace = totalWeeks - weekNumber;

    // Marathon: 20 → 12 → 8 → Race
    if (config.distance === 'marathon') {
        if (weeksToRace === 2) return 12;
        if (weeksToRace === 1) return 8;
        if (weeksToRace === 0) return 0;
        return 12;
    }

    // Half Marathon: 10 → 8 → Race or shorter
    if (config.distance === 'half') {
        if (weeksToRace === 1) return 4;
        if (weeksToRace === 0) return 0;
        return 8;
    }

    // 10K: ~4-5 miles then race
    if (config.distance === '10k') {
        if (weeksToRace === 0) return 0;
        return 4;
    }

    // 5K: minimal taper
    if (config.distance === '5k') {
        if (weeksToRace === 0) return 0;
        return START_DISTANCES[tier];
    }

    return START_DISTANCES[tier];
}

// =============================================================================
// PHASE CALCULATION
// =============================================================================

/**
 * Determine training phase for Higdon plans.
 * Phase structure varies by distance.
 */
export function getHigdonPhase(
    tier: HigdonTier,
    weekNumber: number,
    totalWeeks: number
): TrainingPhase {
    const config = HIGDON_TIER_CONFIGS[tier];
    const weeksToRace = totalWeeks - weekNumber;

    // Taper calculations by distance
    if (config.distance === 'marathon') {
        if (weeksToRace <= 2) return 'taper';
        if (weekNumber >= totalWeeks * 0.72) return 'peak';
        if (weekNumber >= totalWeeks * 0.33) return 'build';
        return 'base';
    }

    if (config.distance === 'half') {
        if (weeksToRace <= 1) return 'taper';
        if (weekNumber >= totalWeeks * 0.75) return 'peak';
        if (weekNumber >= totalWeeks * 0.33) return 'build';
        return 'base';
    }

    if (config.distance === '10k' || config.distance === '5k') {
        if (weeksToRace === 0) return 'taper';
        if (weekNumber >= totalWeeks * 0.75) return 'peak';
        if (weekNumber >= totalWeeks * 0.37) return 'build';
        return 'base';
    }

    // Base training - no race taper
    if (config.distance === 'base') {
        if (weekNumber >= totalWeeks * 0.83) return 'peak';
        if (weekNumber >= totalWeeks * 0.33) return 'build';
        return 'base';
    }

    return 'base';
}

// =============================================================================
// SPECIAL PATTERNS
// =============================================================================

/**
 * Check if this week should use the 3/1 long run pattern.
 * Pattern: 75% easy, 25% faster (not race pace, just "steady")
 * Used in: 10K Advanced, HM Advanced, Marathon Advanced 1/2
 */
export function shouldUseThreeOneLongRun(
    tier: HigdonTier,
    weekNumber: number,
    phase: TrainingPhase
): boolean {
    const config = HIGDON_TIER_CONFIGS[tier];
    if (!config.hasThreeOneLongRun) return false;
    if (phase !== 'build' && phase !== 'peak') return false;
    if (isHigdonStepbackWeek(tier, weekNumber, config.durationWeeks, phase)) return false;
    if (isTuneUpRaceWeek(tier, weekNumber)) return false;

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

/**
 * Check if weekend back-to-back pattern applies.
 * Pattern: Saturday race pace + Sunday long run
 */
export function hasBackToBackWeekend(tier: HigdonTier): boolean {
    return HIGDON_TIER_CONFIGS[tier].hasWeekendBackToBack;
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

/**
 * Get all tiers for a given distance
 */
export function getTiersForDistance(distance: HigdonDistance): HigdonTier[] {
    return (Object.keys(HIGDON_TIER_CONFIGS) as HigdonTier[]).filter(
        (tier) => HIGDON_TIER_CONFIGS[tier].distance === distance
    );
}

/**
 * Get tier recommendation based on runner profile
 */
export function recommendHigdonTier(
    distance: HigdonDistance,
    weeklyMiles: number,
    runsPerWeek: number,
    experience: 'beginner' | 'intermediate' | 'advanced'
): HigdonTier {
    const tiers = getTiersForDistance(distance);

    // Simple tier selection logic
    if (experience === 'beginner' || weeklyMiles < 15 || runsPerWeek < 4) {
        return tiers[0]; // First/easiest tier
    }

    if (experience === 'advanced' && weeklyMiles >= 35 && runsPerWeek >= 5) {
        return tiers[tiers.length - 1]; // Last/hardest tier
    }

    // Intermediate - pick middle tier
    const middleIndex = Math.floor(tiers.length / 2);
    return tiers[middleIndex];
}

// =============================================================================
// ELIGIBILITY CRITERIA
// Source: research/21-higdon-complete-library.md + halhigdon.com
// =============================================================================

import type { CoachEligibility } from './hansons';

/**
 * Higdon eligibility criteria.
 * 
 * Philosophy: Accessibility is core to Higdon. Plans exist for nearly all
 * runner types, with lowest barrier to entry of any coach.
 */
export const HIGDON_ELIGIBILITY: CoachEligibility = {
    // Higdon has plans for all distances
    distances: ['5k', '10k', 'half', 'marathon', 'base'] as const,

    // Higdon has 3-day plans for shorter distances (research/21-higdon-complete-library.md)
    // Marathon needs 4 days, Base needs 4 days
    // Use the minimum across all distances for the global check
    minDays: 3,

    // Higdon welcomes everyone - no minimum weekly mileage
    // Novice 1 plans start from zero/couch-to-race
    minMileage: 0,

    tiers: {
        // Mileage thresholds for tier inference
        // Source: Weekly mileage ranges in research/21-higdon-complete-library.md
        novice: {
            mileageRange: [0, 20],
            startMileage: 0,  // Truly beginner-friendly
        },
        intermediate: {
            mileageRange: [15, 40],
            startMileage: 15,
        },
        advanced: {
            mileageRange: [30, Infinity],
            startMileage: 30,
        },
    },
};

/**
 * Distance-specific day requirements for Higdon.
 * Use this for filtering when we know the target distance.
 */
export const HIGDON_DAYS_BY_DISTANCE: Record<HigdonDistance, number> = {
    '5k': 3,    // 5K Novice is 3 days (research/21-higdon-complete-library.md)
    '10k': 3,   // 10K Novice is 3 days
    half: 3,    // HM3 is 3 days
    marathon: 4,  // Novice 1 is 4 days - marathon minimum
    base: 4,    // Base Novice is 4 days
};

