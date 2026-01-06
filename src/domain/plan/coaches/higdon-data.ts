/**
 * HIGDON EXACT WEEK-BY-WEEK DATA
 *
 * These arrays are extracted directly from halhigdon.com (verified 2026-01-05).
 * DO NOT modify these values - they represent the exact official Higdon plans.
 *
 * Array index = week number - 1 (0-indexed)
 * Value of 0 = race week (no long run that week)
 */

import { HigdonTier } from '../types';

// =============================================================================
// MARATHON LONG RUN PROGRESSIONS (18 weeks)
// =============================================================================

const MARATHON_NOVICE_1_LONG_RUNS = [6, 7, 5, 9, 10, 7, 12, 0, 10, 15, 16, 12, 18, 14, 20, 12, 8, 0];
const MARATHON_NOVICE_2_LONG_RUNS = [8, 9, 6, 11, 12, 9, 14, 15, 0, 17, 18, 13, 19, 12, 20, 12, 8, 0];
const MARATHON_INTERMEDIATE_1_LONG_RUNS = [8, 9, 6, 11, 12, 9, 14, 15, 0, 17, 18, 13, 20, 12, 20, 12, 8, 0];
const MARATHON_INTERMEDIATE_2_LONG_RUNS = [10, 11, 8, 13, 14, 10, 16, 17, 0, 19, 20, 12, 20, 12, 20, 12, 8, 0];
const MARATHON_ADVANCED_1_LONG_RUNS = [10, 11, 8, 13, 14, 10, 16, 17, 0, 19, 20, 12, 20, 12, 20, 12, 8, 0];
const MARATHON_ADVANCED_2_LONG_RUNS = [10, 11, 8, 13, 14, 10, 16, 17, 0, 19, 20, 12, 20, 12, 20, 12, 8, 0];

// =============================================================================
// MARATHON WEDNESDAY RUN PROGRESSIONS (18 weeks)
// =============================================================================

const MARATHON_NOVICE_1_WED_RUNS = [3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 8, 6, 4];
const MARATHON_NOVICE_2_WED_RUNS = [5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 5, 8, 5, 4, 3, 2];
const MARATHON_INTERMEDIATE_1_WED_RUNS = [5, 5, 5, 6, 6, 5, 7, 7, 5, 8, 8, 5, 8, 5, 8, 6, 5, 4];
const MARATHON_INTERMEDIATE_2_WED_RUNS = [5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 6, 10, 6, 10, 8, 6, 4];
const MARATHON_ADVANCED_1_WED_RUNS = [3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 4, 2];
const MARATHON_ADVANCED_2_WED_RUNS = [3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 4, 3];

// =============================================================================
// MARATHON TUESDAY RUN PROGRESSIONS (18 weeks)
// =============================================================================

const MARATHON_NOVICE_1_TUE_RUNS = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5, 4, 3];
const MARATHON_NOVICE_2_TUE_RUNS = [3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 4, 3];
const MARATHON_INTERMEDIATE_1_TUE_RUNS = [3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 4, 3];
const MARATHON_INTERMEDIATE_2_TUE_RUNS = [3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 4, 3];
const MARATHON_ADVANCED_1_TUE_RUNS = [5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 6, 10, 6, 10, 8, 6, 0]; // 0 = 4x400
const MARATHON_ADVANCED_2_TUE_RUNS = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // All speedwork

// =============================================================================
// MARATHON THURSDAY RUN PROGRESSIONS (18 weeks)
// =============================================================================

const MARATHON_NOVICE_1_THU_RUNS = [3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 4, 3, 2];
const MARATHON_NOVICE_2_THU_RUNS = [3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 4, 0]; // Race week
const MARATHON_INTERMEDIATE_1_THU_RUNS = [3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 4, 0];
const MARATHON_INTERMEDIATE_2_THU_RUNS = [3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 4, 0];
const MARATHON_ADVANCED_1_THU_RUNS = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // All speedwork
const MARATHON_ADVANCED_2_THU_RUNS = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // All speedwork

// =============================================================================
// MARATHON SATURDAY RUN PROGRESSIONS (18 weeks)
// =============================================================================

const MARATHON_NOVICE_1_SAT_RUNS = [6, 7, 5, 9, 10, 7, 12, 0, 10, 15, 16, 12, 18, 14, 20, 12, 8, 0]; // Same as long run
const MARATHON_NOVICE_2_SAT_RUNS = [8, 9, 6, 11, 12, 9, 14, 15, 0, 17, 18, 13, 19, 12, 20, 12, 8, 2];
const MARATHON_INTERMEDIATE_1_SAT_RUNS = [5, 5, 5, 6, 6, 6, 7, 7, 0, 8, 8, 8, 5, 8, 5, 4, 3, 2]; // Pace runs
const MARATHON_INTERMEDIATE_2_SAT_RUNS = [5, 5, 6, 6, 7, 7, 8, 8, 0, 9, 10, 6, 10, 6, 10, 4, 4, 2]; // Pace runs
const MARATHON_ADVANCED_1_SAT_RUNS = [5, 5, 6, 6, 7, 7, 8, 8, 0, 9, 10, 6, 10, 6, 10, 4, 4, 2]; // Pace runs
const MARATHON_ADVANCED_2_SAT_RUNS = [5, 5, 6, 6, 7, 7, 8, 8, 0, 9, 10, 6, 10, 6, 10, 4, 4, 2]; // Pace runs

// =============================================================================
// MARATHON SPEEDWORK PROGRESSIONS (Advanced tiers)
// =============================================================================

/**
 * Thursday speedwork for Advanced 1 (one quality day)
 * Format: [type, value] where type is 'hill'|'tempo'|'800' and value is reps or minutes
 */
export const MARATHON_ADVANCED_1_SPEEDWORK: Array<{ type: 'hill' | 'tempo' | '800' | 'rest'; value: number }> = [
    { type: 'hill', value: 3 },
    { type: 'tempo', value: 30 },
    { type: '800', value: 4 },
    { type: 'hill', value: 4 },
    { type: 'tempo', value: 35 },
    { type: '800', value: 5 },
    { type: 'hill', value: 5 },
    { type: 'tempo', value: 40 },
    { type: '800', value: 6 },
    { type: 'hill', value: 6 },
    { type: 'tempo', value: 45 },
    { type: '800', value: 7 },
    { type: 'hill', value: 7 },
    { type: 'tempo', value: 45 },
    { type: '800', value: 8 },
    { type: 'hill', value: 6 },
    { type: 'tempo', value: 30 },
    { type: 'rest', value: 0 },
];

/**
 * Tuesday speedwork for Advanced 2 (first quality day)
 */
export const MARATHON_ADVANCED_2_TUE_SPEEDWORK: Array<{ type: 'hill' | 'tempo' | '800' | '400' | 'pace'; value: number }> = [
    { type: 'hill', value: 3 },
    { type: 'tempo', value: 30 },
    { type: '800', value: 4 },
    { type: 'hill', value: 4 },
    { type: 'tempo', value: 35 },
    { type: '800', value: 5 },
    { type: 'hill', value: 5 },
    { type: 'tempo', value: 40 },
    { type: '800', value: 6 },
    { type: 'hill', value: 6 },
    { type: 'tempo', value: 45 },
    { type: '800', value: 7 },
    { type: 'hill', value: 7 },
    { type: 'tempo', value: 45 },
    { type: '800', value: 8 },
    { type: 'hill', value: 6 },
    { type: 'tempo', value: 30 },
    { type: '400', value: 4 },
];

/**
 * Thursday speedwork for Advanced 2 (second quality day)
 */
export const MARATHON_ADVANCED_2_THU_SPEEDWORK: Array<{ type: 'tempo' | 'pace' | 'rest'; value: number }> = [
    { type: 'tempo', value: 30 },
    { type: 'pace', value: 3 },
    { type: 'tempo', value: 30 },
    { type: 'tempo', value: 35 },
    { type: 'pace', value: 3 },
    { type: 'tempo', value: 35 },
    { type: 'tempo', value: 40 },
    { type: 'pace', value: 3 },
    { type: 'tempo', value: 40 },
    { type: 'tempo', value: 45 },
    { type: 'pace', value: 4 },
    { type: 'tempo', value: 45 },
    { type: 'tempo', value: 50 },
    { type: 'pace', value: 5 },
    { type: 'tempo', value: 40 },
    { type: 'tempo', value: 30 },
    { type: 'pace', value: 4 },
    { type: 'rest', value: 0 },
];

// =============================================================================
// HALF MARATHON LONG RUN PROGRESSIONS (12 weeks)
// =============================================================================

const HALF_NOVICE_1_LONG_RUNS = [4, 4, 5, 6, 7, 0, 8, 8, 0, 9, 10, 0];
const HALF_NOVICE_2_LONG_RUNS = [4, 5, 6, 7, 8, 0, 9, 10, 0, 10, 10, 0];
const HALF_INTERMEDIATE_1_LONG_RUNS = [4, 5, 6, 7, 8, 0, 9, 10, 0, 11, 12, 0];
const HALF_ADVANCED_LONG_RUNS = [90, 90, 0, 90, 90, 0, 100, 100, 0, 90, 75, 0]; // Minutes
const HALF_HM3_LONG_RUNS = [6, 6, 7, 7, 8, 0, 9, 9, 0, 10, 10, 0];

// =============================================================================
// 10K LONG RUN PROGRESSIONS (8 weeks)
// =============================================================================

const TENK_NOVICE_LONG_RUNS = [3, 3.5, 4, 4.5, 5, 5, 5.5, 0];
const TENK_INTERMEDIATE_LONG_RUNS = [4, 5, 6, 0, 6, 7, 8, 0]; // Week 4 = 5K race
const TENK_ADVANCED_LONG_RUNS = [6, 7, 8, 0, 8, 0, 10, 0]; // Weeks 4, 6 = races

// =============================================================================
// 5K LONG RUN PROGRESSIONS (8 weeks)
// =============================================================================

const FIVEK_NOVICE_LONG_RUNS = [1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 0];
const FIVEK_INTERMEDIATE_LONG_RUNS = [5, 5, 6, 6, 6, 7, 7, 0];
const FIVEK_ADVANCED_LONG_RUNS = [60, 65, 70, 0, 75, 85, 90, 0]; // Minutes

// =============================================================================
// BASE TRAINING LONG RUN PROGRESSIONS (10-12 weeks)
// =============================================================================

const BASE_NOVICE_LONG_RUNS = [3, 4, 3, 5, 3, 6, 3, 7, 3, 8, 4, 5];
const BASE_INTERMEDIATE_LONG_RUNS = [4, 5, 6, 5, 7, 8, 6, 9, 7, 10, 8, 10];
const BASE_ADVANCED_LONG_RUNS = [6, 7, 8, 9, 0, 10, 0, 10, 0, 10, 0, 0];
const BASE_SPRING_LONG_RUNS = [50, 0, 60, 0, 70, 0, 80, 0, 90, 0]; // Minutes, alternates with TT

// =============================================================================
// MASTER LOOKUP TABLE
// =============================================================================

export const HIGDON_LONG_RUN_ARRAYS: Record<HigdonTier, number[]> = {
    // Base Training
    base_novice: BASE_NOVICE_LONG_RUNS,
    base_intermediate: BASE_INTERMEDIATE_LONG_RUNS,
    base_advanced: BASE_ADVANCED_LONG_RUNS,
    base_spring: BASE_SPRING_LONG_RUNS,
    // 5K
    '5k_novice': FIVEK_NOVICE_LONG_RUNS,
    '5k_intermediate': FIVEK_INTERMEDIATE_LONG_RUNS,
    '5k_advanced': FIVEK_ADVANCED_LONG_RUNS,
    // 10K
    '10k_novice': TENK_NOVICE_LONG_RUNS,
    '10k_intermediate': TENK_INTERMEDIATE_LONG_RUNS,
    '10k_advanced': TENK_ADVANCED_LONG_RUNS,
    // Half Marathon
    half_novice_1: HALF_NOVICE_1_LONG_RUNS,
    half_novice_2: HALF_NOVICE_2_LONG_RUNS,
    half_intermediate_1: HALF_INTERMEDIATE_1_LONG_RUNS,
    half_advanced: HALF_ADVANCED_LONG_RUNS,
    half_hm3: HALF_HM3_LONG_RUNS,
    // Marathon
    marathon_novice_1: MARATHON_NOVICE_1_LONG_RUNS,
    marathon_novice_2: MARATHON_NOVICE_2_LONG_RUNS,
    marathon_novice_supreme: MARATHON_NOVICE_1_LONG_RUNS, // Uses Novice 1 after base
    marathon_intermediate_1: MARATHON_INTERMEDIATE_1_LONG_RUNS,
    marathon_intermediate_2: MARATHON_INTERMEDIATE_2_LONG_RUNS,
    marathon_advanced_1: MARATHON_ADVANCED_1_LONG_RUNS,
    marathon_advanced_2: MARATHON_ADVANCED_2_LONG_RUNS,
};

export const HIGDON_TUE_RUN_ARRAYS: Record<HigdonTier, number[]> = {
    base_novice: Array(12).fill(3),
    base_intermediate: Array(12).fill(3),
    base_advanced: Array(12).fill(3),
    base_spring: [30, 45, 30, 45, 30, 45, 30, 45, 30, 45], // Minutes
    '5k_novice': [1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3],
    '5k_intermediate': Array(8).fill(3),
    '5k_advanced': Array(8).fill(3),
    '10k_novice': [2.5, 2.5, 2.5, 3, 3, 3, 2.5, 2],
    '10k_intermediate': [3, 3.5, 4, 4.5, 5, 5.5, 6, 3],
    '10k_advanced': Array(8).fill(3),
    half_novice_1: [3, 3, 3.5, 3.5, 4, 4, 4.5, 4.5, 5, 5, 5, 4],
    half_novice_2: [3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 4],
    half_intermediate_1: [3, 3, 3.5, 3.5, 4, 4, 4.5, 4.5, 5, 5, 5, 4],
    half_advanced: Array(12).fill(3),
    half_hm3: [4, 4, 5, 5, 4, 4, 6, 6, 4, 6, 6, 4],
    marathon_novice_1: MARATHON_NOVICE_1_TUE_RUNS,
    marathon_novice_2: MARATHON_NOVICE_2_TUE_RUNS,
    marathon_novice_supreme: MARATHON_NOVICE_1_TUE_RUNS,
    marathon_intermediate_1: MARATHON_INTERMEDIATE_1_TUE_RUNS,
    marathon_intermediate_2: MARATHON_INTERMEDIATE_2_TUE_RUNS,
    marathon_advanced_1: MARATHON_ADVANCED_1_TUE_RUNS,
    marathon_advanced_2: MARATHON_ADVANCED_2_TUE_RUNS,
};

export const HIGDON_WED_RUN_ARRAYS: Record<HigdonTier, number[]> = {
    base_novice: Array(12).fill(3),
    base_intermediate: [4, 4, 5, 4, 5, 6, 5, 6, 7, 8, 6, 4],
    base_advanced: [3, 4, 5, 6, 3, 3, 3, 3, 3, 3, 3, 3],
    base_spring: [30, 0, 30, 0, 40, 0, 40, 0, 40, 0], // Cross-train
    '5k_novice': Array(8).fill(0), // Rest or run/walk
    '5k_intermediate': [5, 30, 6, 35, 7, 35, 8, 4], // 400s or tempo
    '5k_advanced': Array(8).fill(0), // Rest or easy
    '10k_novice': [30, 30, 35, 30, 35, 30, 35, 30], // Cross-train
    '10k_intermediate': [35, 8, 40, 9, 45, 10, 50, 5], // Tempo or 400s
    '10k_advanced': [6, 7, 8, 9, 10, 11, 12, 6], // 400s
    half_novice_1: [2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 2],
    half_novice_2: [3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 4, 3],
    half_intermediate_1: [4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 6, 4],
    half_advanced: Array(12).fill(3),
    half_hm3: [30, 35, 40, 45, 50, 30, 50, 50, 30, 60, 60, 30],
    marathon_novice_1: MARATHON_NOVICE_1_WED_RUNS,
    marathon_novice_2: MARATHON_NOVICE_2_WED_RUNS,
    marathon_novice_supreme: MARATHON_NOVICE_1_WED_RUNS,
    marathon_intermediate_1: MARATHON_INTERMEDIATE_1_WED_RUNS,
    marathon_intermediate_2: MARATHON_INTERMEDIATE_2_WED_RUNS,
    marathon_advanced_1: MARATHON_ADVANCED_1_WED_RUNS,
    marathon_advanced_2: MARATHON_ADVANCED_2_WED_RUNS,
};

export const HIGDON_THU_RUN_ARRAYS: Record<HigdonTier, number[]> = {
    base_novice: Array(12).fill(3),
    base_intermediate: Array(12).fill(3),
    base_advanced: [40, 40, 45, 45, 30, 45, 30, 45, 30, 45, 30, 30], // Tempo or fartlek
    base_spring: [6, 30, 7, 40, 8, 40, 9, 50, 10, 50], // Intervals or tempo
    '5k_novice': [1.5, 1.5, 1.5, 1.5, 2, 2, 2, 2],
    '5k_intermediate': Array(8).fill(3),
    '5k_advanced': [30, 30, 35, 35, 40, 40, 45, 0], // Tempo
    '10k_novice': Array(8).fill(2),
    '10k_intermediate': [3, 4, 3, 4, 3, 4, 4, 1],
    '10k_advanced': [3, 4, 5, 3, 6, 3, 6, 3],
    half_novice_1: [3, 3, 3.5, 3.5, 4, 4, 4.5, 4.5, 5, 5, 4, 3],
    half_novice_2: [3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 4, 2],
    half_intermediate_1: [3, 3, 3.5, 3.5, 4, 4, 4.5, 4.5, 5, 5, 4, 2],
    half_advanced: [40, 45, 30, 40, 45, 30, 50, 50, 30, 45, 40, 30], // Tempo
    half_hm3: [3, 30, 3, 4, 40, 3, 5, 50, 3, 6, 60, 3],
    marathon_novice_1: MARATHON_NOVICE_1_THU_RUNS,
    marathon_novice_2: MARATHON_NOVICE_2_THU_RUNS,
    marathon_novice_supreme: MARATHON_NOVICE_1_THU_RUNS,
    marathon_intermediate_1: MARATHON_INTERMEDIATE_1_THU_RUNS,
    marathon_intermediate_2: MARATHON_INTERMEDIATE_2_THU_RUNS,
    marathon_advanced_1: MARATHON_ADVANCED_1_THU_RUNS,
    marathon_advanced_2: MARATHON_ADVANCED_2_THU_RUNS,
};

export const HIGDON_SAT_RUN_ARRAYS: Record<HigdonTier, number[]> = {
    base_novice: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], // Walk
    base_intermediate: Array(12).fill(3),
    base_advanced: [30, 30, 30, 30, 3, 30, 3, 30, 3, 30, 0, 0], // Fartlek or rest
    base_spring: [50, 0, 60, 0, 70, 0, 80, 0, 90, 0], // Strength or LR
    '5k_novice': [1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 0],
    '5k_intermediate': [3, 3, 3, 3, 3, 3, 3, 0], // Fast
    '5k_advanced': [4, 4, 5, 0, 5, 6, 6, 0], // Fast
    '10k_novice': [40, 40, 40, 40, 40, 40, 40, 0], // Cross-train
    '10k_intermediate': [60, 60, 60, 0, 60, 60, 60, 0], // Cross-train or race
    '10k_advanced': [5, 5, 5, 0, 6, 0, 6, 0], // Pace runs
    half_novice_1: [30, 30, 0, 30, 30, 0, 30, 30, 0, 30, 30, 0], // Cross-train
    half_novice_2: [4, 5, 6, 7, 8, 0, 9, 10, 0, 10, 10, 0], // Long run (on Sat)
    half_intermediate_1: [3, 3, 3, 3, 3, 0, 4, 5, 0, 5, 3, 0], // Pace runs
    half_advanced: [3, 3, 0, 3, 3, 0, 4, 4, 0, 4, 3, 0], // Pace runs
    half_hm3: [6, 6, 7, 7, 8, 0, 9, 9, 0, 10, 10, 0], // Long run
    marathon_novice_1: MARATHON_NOVICE_1_SAT_RUNS,
    marathon_novice_2: MARATHON_NOVICE_2_SAT_RUNS,
    marathon_novice_supreme: MARATHON_NOVICE_1_SAT_RUNS,
    marathon_intermediate_1: MARATHON_INTERMEDIATE_1_SAT_RUNS,
    marathon_intermediate_2: MARATHON_INTERMEDIATE_2_SAT_RUNS,
    marathon_advanced_1: MARATHON_ADVANCED_1_SAT_RUNS,
    marathon_advanced_2: MARATHON_ADVANCED_2_SAT_RUNS,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the exact long run distance for a specific week.
 * Returns 0 for race weeks.
 */
export function getHigdonLongRunForWeek(tier: HigdonTier, weekNumber: number): number {
    const array = HIGDON_LONG_RUN_ARRAYS[tier];
    const index = weekNumber - 1;
    if (index < 0 || index >= array.length) {
        console.warn(`Week ${weekNumber} out of range for tier ${tier}`);
        return 0;
    }
    return array[index];
}

/**
 * Get the complete long run progression array for a tier.
 */
export function getHigdonLongRunProgression(tier: HigdonTier): number[] {
    return [...HIGDON_LONG_RUN_ARRAYS[tier]];
}

/**
 * Check if a week is a race week (long run = 0).
 */
export function isHigdonRaceWeek(tier: HigdonTier, weekNumber: number): boolean {
    return getHigdonLongRunForWeek(tier, weekNumber) === 0;
}
