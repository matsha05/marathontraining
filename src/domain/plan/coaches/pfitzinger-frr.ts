/**
 * THE LONG GAME - Pfitzinger Faster Road Racing Coach Module
 *
 * Complete implementation of Pfitzinger's "Faster Road Racing" plans:
 * - 5K: 3 schedules (30-40, 45-55, 60-70 mpw)
 * - 10K: 3 schedules (30-42, 45-57, 60-70 mpw)
 * - Half Marathon: 4 schedules (31-47, 46-63, 61-84, 81-100 mpw)
 *
 * Key patterns:
 * - 12-week duration for all plans
 * - LT intervals and tempo runs
 * - VO2max intervals (600m-1200m @ 5K pace)
 * - Speed work (200m-300m @ mile pace)
 * - Progression runs in long runs (HM plans)
 * - Tune-up races at weeks 8 and 10
 *
 * Source: "Faster Road Racing: 5K to Half Marathon" (2014)
 *         research/25-pfitzinger-faster-road-racing.md
 */

import { TrainingPhase, PfitzFRRTier, PfitzFRRTierConfig, PfitzFRRDistance } from '../types';

// =============================================================================
// TYPES
// =============================================================================

export type FRRPhase = 'base' | 'build' | 'peak' | 'taper';

export type FRRDayType =
    | 'rest'
    | 'recovery'
    | 'general_aerobic'
    | 'endurance'
    | 'medium_long'
    | 'long_run'
    | 'long_progression'
    | 'lactate_threshold'
    | 'vo2max'
    | 'speed'
    | 'tune_up_race';

export interface FRRLTWorkout {
    totalMiles: number;
    intervals: string; // e.g., "3×8 min" or "20 min tempo"
    pace: string;
}

export interface FRRVO2maxWorkout {
    totalMiles: number;
    reps: number;
    distance: string;
    pace: string;
}

export interface FRRSpeedWorkout {
    totalMiles: number;
    sets: number;
    repsPerSet: number;
    distance: string;
    pace: string;
}

export interface FRRWeekData {
    week: number;
    mileage: number;
    longRun: number;
    longRunType: 'endurance' | 'progression' | 'ga' | 'recovery';
    mlr?: number;
    keyWorkout: {
        type: 'LT' | 'VO2max' | 'Speed' | 'Race' | 'Recovery' | 'GA';
        description: string;
    };
    secondaryWorkout?: {
        type: 'LT' | 'VO2max' | 'Speed';
        description: string;
    };
}

// =============================================================================
// TIER CONFIGURATIONS
// =============================================================================

export const PFITZ_FRR_TIER_CONFIGS: Record<PfitzFRRTier, PfitzFRRTierConfig> = {
    // =========================================================================
    // 5K PLANS
    // =========================================================================
    pfitz_frr_5k_sch1: {
        tier: 'pfitz_frr_5k_sch1',
        distance: '5k',
        durationWeeks: 12,
        runDays: 5,
        startMileage: 30,
        peakMileage: 40,
        maxLongRun: 10,
        hasDoubles: false,
        tuneUpRaceWeeks: [8, 10],
        ltWeeks: [1, 3, 6],
        vo2maxWeeks: [2, 5, 6, 7, 9, 11],
        speedWeeks: [3, 4],
        phases: {
            base: [1, 2, 3],
            build: [4, 5, 6, 7],
            peak: [8, 9, 10],
            taper: [11, 12],
        },
    },
    pfitz_frr_5k_sch2: {
        tier: 'pfitz_frr_5k_sch2',
        distance: '5k',
        durationWeeks: 12,
        runDays: 5,
        startMileage: 45,
        peakMileage: 55,
        maxLongRun: 11,
        hasDoubles: false,
        tuneUpRaceWeeks: [8, 10],
        ltWeeks: [1, 3, 6],
        vo2maxWeeks: [2, 5, 6, 7, 9, 11],
        speedWeeks: [3, 4],
        phases: {
            base: [1, 2, 3],
            build: [4, 5, 6, 7],
            peak: [8, 9, 10],
            taper: [11, 12],
        },
    },
    pfitz_frr_5k_sch3: {
        tier: 'pfitz_frr_5k_sch3',
        distance: '5k',
        durationWeeks: 12,
        runDays: 6,
        startMileage: 60,
        peakMileage: 70,
        maxLongRun: 13,
        hasDoubles: true,
        tuneUpRaceWeeks: [8, 10],
        ltWeeks: [1, 3, 6],
        vo2maxWeeks: [2, 5, 6, 7, 9, 11],
        speedWeeks: [3, 4],
        phases: {
            base: [1, 2, 3],
            build: [4, 5, 6, 7],
            peak: [8, 9, 10],
            taper: [11, 12],
        },
    },

    // =========================================================================
    // 10K PLANS
    // =========================================================================
    pfitz_frr_10k_sch1: {
        tier: 'pfitz_frr_10k_sch1',
        distance: '10k',
        durationWeeks: 12,
        runDays: 5,
        startMileage: 30,
        peakMileage: 42,
        maxLongRun: 11,
        hasDoubles: false,
        tuneUpRaceWeeks: [8, 10],
        ltWeeks: [1, 6],
        vo2maxWeeks: [3, 5, 9, 11],
        speedWeeks: [2, 4],
        phases: {
            base: [1, 2, 3],
            build: [4, 5, 6, 7],
            peak: [8, 9, 10],
            taper: [11, 12],
        },
    },
    pfitz_frr_10k_sch2: {
        tier: 'pfitz_frr_10k_sch2',
        distance: '10k',
        durationWeeks: 12,
        runDays: 5,
        startMileage: 45,
        peakMileage: 57,
        maxLongRun: 13,
        hasDoubles: false,
        tuneUpRaceWeeks: [8, 10],
        ltWeeks: [1, 6],
        vo2maxWeeks: [3, 5, 9, 11],
        speedWeeks: [2, 4],
        phases: {
            base: [1, 2, 3],
            build: [4, 5, 6, 7],
            peak: [8, 9, 10],
            taper: [11, 12],
        },
    },
    pfitz_frr_10k_sch3: {
        tier: 'pfitz_frr_10k_sch3',
        distance: '10k',
        durationWeeks: 12,
        runDays: 6,
        startMileage: 60,
        peakMileage: 70,
        maxLongRun: 14,
        hasDoubles: true,
        tuneUpRaceWeeks: [8, 10],
        ltWeeks: [1, 6],
        vo2maxWeeks: [3, 5, 9, 11],
        speedWeeks: [2, 4],
        phases: {
            base: [1, 2, 3],
            build: [4, 5, 6, 7],
            peak: [8, 9, 10],
            taper: [11, 12],
        },
    },

    // =========================================================================
    // HALF MARATHON PLANS
    // =========================================================================
    pfitz_frr_hm_sch1: {
        tier: 'pfitz_frr_hm_sch1',
        distance: 'half',
        durationWeeks: 12,
        runDays: 5,
        startMileage: 31,
        peakMileage: 47,
        maxLongRun: 14,
        hasDoubles: false,
        tuneUpRaceWeeks: [8, 10],
        ltWeeks: [1, 2, 3, 5, 7],
        vo2maxWeeks: [6, 9, 11],
        mlrDistanceRange: [6, 11],
        progressionRunWeeks: [3, 5, 7],
        phases: {
            base: [1, 2, 3],
            build: [4, 5, 6, 7],
            peak: [8, 9, 10],
            taper: [11, 12],
        },
    },
    pfitz_frr_hm_sch2: {
        tier: 'pfitz_frr_hm_sch2',
        distance: 'half',
        durationWeeks: 12,
        runDays: 5,
        startMileage: 46,
        peakMileage: 63,
        maxLongRun: 16,
        hasDoubles: false,
        tuneUpRaceWeeks: [8, 10],
        ltWeeks: [1, 2, 3, 5, 7],
        vo2maxWeeks: [6, 9, 11],
        mlrDistanceRange: [9, 12],
        progressionRunWeeks: [3, 5, 7],
        phases: {
            base: [1, 2, 3],
            build: [4, 5, 6, 7],
            peak: [8, 9, 10],
            taper: [11, 12],
        },
    },
    pfitz_frr_hm_sch3: {
        tier: 'pfitz_frr_hm_sch3',
        distance: 'half',
        durationWeeks: 12,
        runDays: 6,
        startMileage: 61,
        peakMileage: 84,
        maxLongRun: 18,
        hasDoubles: true,
        tuneUpRaceWeeks: [8, 10],
        ltWeeks: [1, 2, 3, 5, 7],
        vo2maxWeeks: [6, 9, 11],
        mlrDistanceRange: [10, 14],
        progressionRunWeeks: [3, 5, 7],
        phases: {
            base: [1, 2, 3],
            build: [4, 5, 6, 7],
            peak: [8, 9, 10],
            taper: [11, 12],
        },
    },
    pfitz_frr_hm_sch4: {
        tier: 'pfitz_frr_hm_sch4',
        distance: 'half',
        durationWeeks: 12,
        runDays: 6,
        startMileage: 81,
        peakMileage: 100,
        maxLongRun: 19,
        hasDoubles: true,
        tuneUpRaceWeeks: [8, 10],
        ltWeeks: [1, 2, 3, 5, 7],
        vo2maxWeeks: [6, 9, 11],
        mlrDistanceRange: [10, 15],
        progressionRunWeeks: [3, 5, 7],
        phases: {
            base: [1, 2, 3],
            build: [4, 5, 6, 7],
            peak: [8, 9, 10],
            taper: [11, 12],
        },
    },
};

// =============================================================================
// WEEK-BY-WEEK DATA (Single Source of Truth)
// =============================================================================

/**
 * 5K Schedule 1: 30-40 mpw
 * Source: research/25-pfitzinger-faster-road-racing.md
 */
const FRR_5K_SCH1_WEEKS: FRRWeekData[] = [
    { week: 1, mileage: 30, longRun: 9, longRunType: 'endurance', keyWorkout: { type: 'LT', description: '7mi (4×6 min LT)' } },
    { week: 2, mileage: 32, longRun: 9, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '7mi (5×3 min hills)' } },
    { week: 3, mileage: 34, longRun: 10, longRunType: 'endurance', keyWorkout: { type: 'LT', description: '8mi (3×8 min)' }, secondaryWorkout: { type: 'Speed', description: '5mi (300m sets)' } },
    { week: 4, mileage: 30, longRun: 8, longRunType: 'ga', keyWorkout: { type: 'Speed', description: '6mi (200m sets)' } },
    { week: 5, mileage: 36, longRun: 10, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '8mi (5×1000m @ 5K)' } },
    { week: 6, mileage: 37, longRun: 10, longRunType: 'endurance', keyWorkout: { type: 'LT', description: '7mi (20min tempo)' }, secondaryWorkout: { type: 'VO2max', description: '8mi (8×600m)' } },
    { week: 7, mileage: 38, longRun: 10, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '9mi (3×1k, 3×800m)' } },
    { week: 8, mileage: 33, longRun: 8, longRunType: 'endurance', keyWorkout: { type: 'Race', description: 'Tune-up 5K' } },
    { week: 9, mileage: 40, longRun: 10, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '9mi (2 sets 1.2k, 800, 800)' } },
    { week: 10, mileage: 33, longRun: 8, longRunType: 'endurance', keyWorkout: { type: 'Race', description: 'Tune-up 5K/3K TT' } },
    { week: 11, mileage: 29, longRun: 7, longRunType: 'ga', keyWorkout: { type: 'VO2max', description: '8mi (4×800, 2×600)' } },
    { week: 12, mileage: 29, longRun: 4, longRunType: 'recovery', keyWorkout: { type: 'Race', description: 'GOAL 5K RACE' } },
];

/**
 * 5K Schedule 2: 45-55 mpw
 */
const FRR_5K_SCH2_WEEKS: FRRWeekData[] = [
    { week: 1, mileage: 45, longRun: 10, longRunType: 'endurance', keyWorkout: { type: 'LT', description: '3×8 min (3\' jog)' } },
    { week: 2, mileage: 47, longRun: 10, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '6×3 min hills' } },
    { week: 3, mileage: 49, longRun: 10, longRunType: 'endurance', keyWorkout: { type: 'LT', description: '10\', 10\', 8\' (3\' jog)' }, secondaryWorkout: { type: 'Speed', description: '2×4×300m' } },
    { week: 4, mileage: 44, longRun: 9, longRunType: 'endurance', keyWorkout: { type: 'Speed', description: '2×5×200m @ mile pace' } },
    { week: 5, mileage: 50, longRun: 11, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '5×1000m @ 5K pace' } },
    { week: 6, mileage: 51, longRun: 11, longRunType: 'endurance', keyWorkout: { type: 'LT', description: '20 min tempo' }, secondaryWorkout: { type: 'VO2max', description: '8×600m' } },
    { week: 7, mileage: 53, longRun: 11, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '4×1000m + 2×800m' } },
    { week: 8, mileage: 46, longRun: 9, longRunType: 'endurance', keyWorkout: { type: 'Race', description: 'Tune-up 5K' } },
    { week: 9, mileage: 55, longRun: 11, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '2×(1200m, 800m, 800m)' } },
    { week: 10, mileage: 46, longRun: 9, longRunType: 'endurance', keyWorkout: { type: 'Race', description: 'Tune-up 5K/3K TT' } },
    { week: 11, mileage: 39, longRun: 8, longRunType: 'ga', keyWorkout: { type: 'VO2max', description: '5×1000m' } },
    { week: 12, mileage: 36, longRun: 9, longRunType: 'recovery', keyWorkout: { type: 'Race', description: 'GOAL 5K RACE' } },
];

/**
 * 5K Schedule 3: 60-70 mpw
 */
const FRR_5K_SCH3_WEEKS: FRRWeekData[] = [
    { week: 1, mileage: 60, longRun: 11, longRunType: 'endurance', keyWorkout: { type: 'LT', description: '10\', 8\', 8\' (3\' jog)' } },
    { week: 2, mileage: 62, longRun: 11, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '7×3 min hills' } },
    { week: 3, mileage: 64, longRun: 11, longRunType: 'endurance', keyWorkout: { type: 'LT', description: '3×10 min (3\' jog)' }, secondaryWorkout: { type: 'Speed', description: '2×5×300m' } },
    { week: 4, mileage: 55, longRun: 10, longRunType: 'endurance', keyWorkout: { type: 'Speed', description: '3×4×200m @ mile pace' } },
    { week: 5, mileage: 65, longRun: 12, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '6×1000m @ 5K pace' } },
    { week: 6, mileage: 66, longRun: 12, longRunType: 'endurance', keyWorkout: { type: 'LT', description: '22 min tempo' }, secondaryWorkout: { type: 'VO2max', description: '9×600m' } },
    { week: 7, mileage: 68, longRun: 12, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '2×1200m, 2×1000m, 2×800m' } },
    { week: 8, mileage: 60, longRun: 10, longRunType: 'endurance', keyWorkout: { type: 'Race', description: 'Tune-up 5K' } },
    { week: 9, mileage: 70, longRun: 13, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '2×(1200m, 1000m, 800m)' } },
    { week: 10, mileage: 60, longRun: 10, longRunType: 'endurance', keyWorkout: { type: 'Race', description: 'Tune-up 5K/3K TT' } },
    { week: 11, mileage: 51, longRun: 10, longRunType: 'ga', keyWorkout: { type: 'VO2max', description: '5×1000m' } },
    { week: 12, mileage: 40, longRun: 9, longRunType: 'recovery', keyWorkout: { type: 'Race', description: 'GOAL 5K RACE' } },
];

/**
 * 10K Schedule 1: 30-42 mpw
 */
const FRR_10K_SCH1_WEEKS: FRRWeekData[] = [
    { week: 1, mileage: 30, longRun: 9, longRunType: 'endurance', keyWorkout: { type: 'LT', description: '3×8 min (3\' jog)' } },
    { week: 2, mileage: 32, longRun: 10, longRunType: 'endurance', keyWorkout: { type: 'Speed', description: '2×4×200m @ 800m-mile pace' } },
    { week: 3, mileage: 34, longRun: 10, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '6×3 min hills' } },
    { week: 4, mileage: 30, longRun: 9, longRunType: 'ga', keyWorkout: { type: 'Speed', description: '2×4×200m' } },
    { week: 5, mileage: 37, longRun: 10, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '5×1000m @ 5K pace' } },
    { week: 6, mileage: 39, longRun: 11, longRunType: 'endurance', keyWorkout: { type: 'LT', description: '12\', 10\', 10\' (4\' jog)' } },
    { week: 7, mileage: 41, longRun: 11, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '4×1200m + 2×1000m (race pace)' } },
    { week: 8, mileage: 34, longRun: 9, longRunType: 'endurance', keyWorkout: { type: 'Race', description: 'Tune-up 5K' } },
    { week: 9, mileage: 42, longRun: 11, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '3×1000m + 3×800m' } },
    { week: 10, mileage: 34, longRun: 9, longRunType: 'endurance', keyWorkout: { type: 'Race', description: 'Tune-up 5K' } },
    { week: 11, mileage: 30, longRun: 8, longRunType: 'ga', keyWorkout: { type: 'VO2max', description: '4×800m + 2×600m' } },
    { week: 12, mileage: 31, longRun: 0, longRunType: 'recovery', keyWorkout: { type: 'Race', description: 'GOAL 10K RACE (11mi total)' } },
];

/**
 * 10K Schedule 2: 45-57 mpw (scaled from Schedule 1)
 */
const FRR_10K_SCH2_WEEKS: FRRWeekData[] = [
    { week: 1, mileage: 45, longRun: 11, longRunType: 'endurance', keyWorkout: { type: 'LT', description: '3×10 min (3\' jog)' } },
    { week: 2, mileage: 47, longRun: 12, longRunType: 'endurance', keyWorkout: { type: 'Speed', description: '2×5×200m @ 800m-mile pace' } },
    { week: 3, mileage: 49, longRun: 12, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '7×3 min hills' } },
    { week: 4, mileage: 44, longRun: 11, longRunType: 'ga', keyWorkout: { type: 'Speed', description: '2×5×200m' } },
    { week: 5, mileage: 52, longRun: 12, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '6×1000m @ 5K pace' } },
    { week: 6, mileage: 54, longRun: 13, longRunType: 'endurance', keyWorkout: { type: 'LT', description: '14\', 12\', 12\' (4\' jog)' } },
    { week: 7, mileage: 56, longRun: 13, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '5×1200m + 2×1000m (race pace)' } },
    { week: 8, mileage: 48, longRun: 11, longRunType: 'endurance', keyWorkout: { type: 'Race', description: 'Tune-up 5K' } },
    { week: 9, mileage: 57, longRun: 13, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '4×1000m + 3×800m' } },
    { week: 10, mileage: 48, longRun: 11, longRunType: 'endurance', keyWorkout: { type: 'Race', description: 'Tune-up 5K' } },
    { week: 11, mileage: 42, longRun: 10, longRunType: 'ga', keyWorkout: { type: 'VO2max', description: '5×800m + 2×600m' } },
    { week: 12, mileage: 40, longRun: 0, longRunType: 'recovery', keyWorkout: { type: 'Race', description: 'GOAL 10K RACE (12mi total)' } },
];

/**
 * 10K Schedule 3: 60-70 mpw (scaled from Schedule 1)
 */
const FRR_10K_SCH3_WEEKS: FRRWeekData[] = [
    { week: 1, mileage: 60, longRun: 12, longRunType: 'endurance', keyWorkout: { type: 'LT', description: '3×12 min (3\' jog)' } },
    { week: 2, mileage: 62, longRun: 13, longRunType: 'endurance', keyWorkout: { type: 'Speed', description: '3×5×200m @ 800m-mile pace' } },
    { week: 3, mileage: 64, longRun: 13, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '8×3 min hills' } },
    { week: 4, mileage: 56, longRun: 12, longRunType: 'ga', keyWorkout: { type: 'Speed', description: '3×5×200m' } },
    { week: 5, mileage: 66, longRun: 13, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '7×1000m @ 5K pace' } },
    { week: 6, mileage: 68, longRun: 14, longRunType: 'endurance', keyWorkout: { type: 'LT', description: '15\', 12\', 12\' (4\' jog)' } },
    { week: 7, mileage: 69, longRun: 14, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '6×1200m + 2×1000m (race pace)' } },
    { week: 8, mileage: 60, longRun: 12, longRunType: 'endurance', keyWorkout: { type: 'Race', description: 'Tune-up 5K' } },
    { week: 9, mileage: 70, longRun: 14, longRunType: 'endurance', keyWorkout: { type: 'VO2max', description: '4×1200m + 3×800m' } },
    { week: 10, mileage: 60, longRun: 12, longRunType: 'endurance', keyWorkout: { type: 'Race', description: 'Tune-up 5K' } },
    { week: 11, mileage: 52, longRun: 11, longRunType: 'ga', keyWorkout: { type: 'VO2max', description: '5×1000m + 2×600m' } },
    { week: 12, mileage: 44, longRun: 0, longRunType: 'recovery', keyWorkout: { type: 'Race', description: 'GOAL 10K RACE (14mi total)' } },
];

/**
 * Half Marathon Schedule 1: 31-47 mpw
 */
const FRR_HM_SCH1_WEEKS: FRRWeekData[] = [
    { week: 1, mileage: 31, longRun: 10, longRunType: 'endurance', mlr: 8, keyWorkout: { type: 'LT', description: '7mi (14+12 min)' } },
    { week: 2, mileage: 34, longRun: 11, longRunType: 'endurance', mlr: 8, keyWorkout: { type: 'LT', description: '8mi (18+12 min)' } },
    { week: 3, mileage: 37, longRun: 12, longRunType: 'progression', mlr: 9, keyWorkout: { type: 'LT', description: '8mi (18+15 min)' } },
    { week: 4, mileage: 32, longRun: 9, longRunType: 'ga', mlr: 8, keyWorkout: { type: 'Recovery', description: 'Recovery week' } },
    { week: 5, mileage: 40, longRun: 12, longRunType: 'progression', mlr: 9, keyWorkout: { type: 'LT', description: '8mi (20+16 min)' } },
    { week: 6, mileage: 43, longRun: 12, longRunType: 'endurance', mlr: 9, keyWorkout: { type: 'VO2max', description: '9mi (6×1000m)' } },
    { week: 7, mileage: 45, longRun: 13, longRunType: 'progression', mlr: 10, keyWorkout: { type: 'LT', description: '9mi (38 min tempo)' } },
    { week: 8, mileage: 38, longRun: 10, longRunType: 'endurance', mlr: 8, keyWorkout: { type: 'Race', description: 'Tune-up 8K-10K' } },
    { week: 9, mileage: 47, longRun: 14, longRunType: 'endurance', mlr: 11, keyWorkout: { type: 'VO2max', description: '10mi (2×1200, 1×800 sets)' } },
    { week: 10, mileage: 38, longRun: 10, longRunType: 'endurance', mlr: 8, keyWorkout: { type: 'Race', description: 'Tune-up 8K-10K' } },
    { week: 11, mileage: 32, longRun: 10, longRunType: 'endurance', mlr: 6, keyWorkout: { type: 'VO2max', description: '9mi (2×1200, 2×1000, 1×800)' } },
    { week: 12, mileage: 32.1, longRun: 13.1, longRunType: 'endurance', mlr: 5, keyWorkout: { type: 'Race', description: 'HM RACE' } },
];

/**
 * Half Marathon Schedule 2: 46-63 mpw
 */
const FRR_HM_SCH2_WEEKS: FRRWeekData[] = [
    { week: 1, mileage: 46, longRun: 12, longRunType: 'endurance', mlr: 10, keyWorkout: { type: 'LT', description: '15+12 min (4\' jog)' } },
    { week: 2, mileage: 49, longRun: 13, longRunType: 'endurance', mlr: 11, keyWorkout: { type: 'LT', description: '18+14 min (4\' jog)' } },
    { week: 3, mileage: 52, longRun: 14, longRunType: 'progression', mlr: 11, keyWorkout: { type: 'LT', description: '20+16 min (4\' jog)' } },
    { week: 4, mileage: 47, longRun: 11, longRunType: 'endurance', mlr: 9, keyWorkout: { type: 'Recovery', description: 'Recovery week' } },
    { week: 5, mileage: 55, longRun: 14, longRunType: 'progression', mlr: 11, keyWorkout: { type: 'LT', description: '22+18 min (4\' jog)' } },
    { week: 6, mileage: 58, longRun: 15, longRunType: 'endurance', mlr: 12, keyWorkout: { type: 'VO2max', description: '3×1200m, 3×1000m' } },
    { week: 7, mileage: 61, longRun: 16, longRunType: 'progression', mlr: 12, keyWorkout: { type: 'LT', description: '40 min tempo' } },
    { week: 8, mileage: 52, longRun: 12, longRunType: 'endurance', mlr: 10, keyWorkout: { type: 'Race', description: 'Tune-up 8K-10K' } },
    { week: 9, mileage: 63, longRun: 16, longRunType: 'endurance', mlr: 11, keyWorkout: { type: 'VO2max', description: '6×1200m' } },
    { week: 10, mileage: 52, longRun: 12, longRunType: 'endurance', mlr: 10, keyWorkout: { type: 'Race', description: 'Tune-up 8K-10K' } },
    { week: 11, mileage: 43, longRun: 11, longRunType: 'endurance', mlr: 10, keyWorkout: { type: 'VO2max', description: '2×1200m, 4×800m' } },
    { week: 12, mileage: 42, longRun: 13.1, longRunType: 'endurance', mlr: 8, keyWorkout: { type: 'Race', description: 'HM RACE' } },
];

/**
 * Half Marathon Schedule 3: 61-84 mpw
 */
const FRR_HM_SCH3_WEEKS: FRRWeekData[] = [
    { week: 1, mileage: 61, longRun: 14, longRunType: 'endurance', mlr: 12, keyWorkout: { type: 'LT', description: '16+13 min (4\' jog)' } },
    { week: 2, mileage: 65, longRun: 15, longRunType: 'endurance', mlr: 13, keyWorkout: { type: 'LT', description: '18+16 min (4\' jog)' } },
    { week: 3, mileage: 69, longRun: 16, longRunType: 'progression', mlr: 13, keyWorkout: { type: 'LT', description: '20+18 min (4\' jog)' } },
    { week: 4, mileage: 63, longRun: 13, longRunType: 'endurance', mlr: 12, keyWorkout: { type: 'Recovery', description: 'Recovery week' } },
    { week: 5, mileage: 73, longRun: 16, longRunType: 'progression', mlr: 13, keyWorkout: { type: 'LT', description: '24+18 min (4\' jog)' } },
    { week: 6, mileage: 77, longRun: 17, longRunType: 'endurance', mlr: 13, keyWorkout: { type: 'VO2max', description: '6×1200m' } },
    { week: 7, mileage: 80, longRun: 17, longRunType: 'progression', mlr: 14, keyWorkout: { type: 'LT', description: '44 min change-of-pace' } },
    { week: 8, mileage: 68, longRun: 13, longRunType: 'endurance', mlr: 11, keyWorkout: { type: 'Race', description: 'Tune-up 8K-10K' } },
    { week: 9, mileage: 84, longRun: 18, longRunType: 'endurance', mlr: 12, keyWorkout: { type: 'VO2max', description: '2×1600, 2×1200, 2×1000' } },
    { week: 10, mileage: 68, longRun: 13, longRunType: 'endurance', mlr: 11, keyWorkout: { type: 'Race', description: 'Tune-up 8K-10K' } },
    { week: 11, mileage: 56, longRun: 12, longRunType: 'endurance', mlr: 10, keyWorkout: { type: 'VO2max', description: '3×1200m, 3×800m' } },
    { week: 12, mileage: 48, longRun: 13.1, longRunType: 'endurance', mlr: 9, keyWorkout: { type: 'Race', description: 'HM RACE' } },
];

/**
 * Half Marathon Schedule 4: 81-100 mpw
 */
const FRR_HM_SCH4_WEEKS: FRRWeekData[] = [
    { week: 1, mileage: 81, longRun: 15, longRunType: 'endurance', mlr: 13, keyWorkout: { type: 'LT', description: '18+12 min (4\' jog)' } },
    { week: 2, mileage: 85, longRun: 16, longRunType: 'endurance', mlr: 13, keyWorkout: { type: 'LT', description: '20+16 min (4\' jog)' } },
    { week: 3, mileage: 89, longRun: 17, longRunType: 'progression', mlr: 14, keyWorkout: { type: 'LT', description: '22+18 min (4\' jog)' } },
    { week: 4, mileage: 81, longRun: 14, longRunType: 'endurance', mlr: 13, keyWorkout: { type: 'Recovery', description: 'Recovery week' } },
    { week: 5, mileage: 93, longRun: 18, longRunType: 'progression', mlr: 14, keyWorkout: { type: 'LT', description: '38 min change-of-pace' } },
    { week: 6, mileage: 96, longRun: 18, longRunType: 'endurance', mlr: 15, keyWorkout: { type: 'VO2max', description: '2×1600, 2×1200, 2×1000' } },
    { week: 7, mileage: 100, longRun: 18, longRunType: 'progression', mlr: 15, keyWorkout: { type: 'LT', description: '44 min change-of-pace' } },
    { week: 8, mileage: 86, longRun: 14, longRunType: 'endurance', mlr: 12, keyWorkout: { type: 'Race', description: 'Tune-up 8K-10K' } },
    { week: 9, mileage: 95, longRun: 19, longRunType: 'endurance', mlr: 13, keyWorkout: { type: 'VO2max', description: '2×1600, 4×1200' } },
    { week: 10, mileage: 86, longRun: 14, longRunType: 'endurance', mlr: 12, keyWorkout: { type: 'Race', description: 'Tune-up 8K-10K' } },
    { week: 11, mileage: 69, longRun: 12, longRunType: 'endurance', mlr: 10, keyWorkout: { type: 'VO2max', description: '3×1200m, 3×1000m' } },
    { week: 12, mileage: 64, longRun: 13.1, longRunType: 'endurance', mlr: 9, keyWorkout: { type: 'Race', description: 'HM RACE' } },
];

// Map tier to week data
const FRR_WEEK_DATA: Record<PfitzFRRTier, FRRWeekData[]> = {
    pfitz_frr_5k_sch1: FRR_5K_SCH1_WEEKS,
    pfitz_frr_5k_sch2: FRR_5K_SCH2_WEEKS,
    pfitz_frr_5k_sch3: FRR_5K_SCH3_WEEKS,
    pfitz_frr_10k_sch1: FRR_10K_SCH1_WEEKS,
    pfitz_frr_10k_sch2: FRR_10K_SCH2_WEEKS,
    pfitz_frr_10k_sch3: FRR_10K_SCH3_WEEKS,
    pfitz_frr_hm_sch1: FRR_HM_SCH1_WEEKS,
    pfitz_frr_hm_sch2: FRR_HM_SCH2_WEEKS,
    pfitz_frr_hm_sch3: FRR_HM_SCH3_WEEKS,
    pfitz_frr_hm_sch4: FRR_HM_SCH4_WEEKS,
};


// =============================================================================
// PHASE DETECTION
// =============================================================================

/**
 * Get the FRR-specific training phase for a given week.
 */
export function getFRRPhase(tier: PfitzFRRTier, weekNumber: number): FRRPhase {
    const config = PFITZ_FRR_TIER_CONFIGS[tier];
    if (config.phases.taper.includes(weekNumber)) return 'taper';
    if (config.phases.peak.includes(weekNumber)) return 'peak';
    if (config.phases.build.includes(weekNumber)) return 'build';
    return 'base';
}

/**
 * Map FRR phase to generic TrainingPhase
 */
export function toTrainingPhase(frrPhase: FRRPhase): TrainingPhase {
    return frrPhase; // They map 1:1
}

// =============================================================================
// DATA ACCESSORS (Single Source of Truth Pattern)
// =============================================================================

/**
 * Get week data for a specific week.
 */
export function getFRRWeekData(tier: PfitzFRRTier, weekNumber: number): FRRWeekData | null {
    const weeks = FRR_WEEK_DATA[tier];
    return weeks.find(w => w.week === weekNumber) ?? null;
}

/**
 * Get the prescribed weekly mileage for a given week.
 */
export function getFRRWeeklyMileage(tier: PfitzFRRTier, weekNumber: number): number {
    const weekData = getFRRWeekData(tier, weekNumber);
    return weekData?.mileage ?? 0;
}

/**
 * Get long run distance for a given week.
 */
export function getFRRLongRunMiles(tier: PfitzFRRTier, weekNumber: number): number {
    const weekData = getFRRWeekData(tier, weekNumber);
    return weekData?.longRun ?? 0;
}

/**
 * Get MLR distance for a given week (HM plans only).
 */
export function getFRRMLRMiles(tier: PfitzFRRTier, weekNumber: number): number | null {
    const weekData = getFRRWeekData(tier, weekNumber);
    return weekData?.mlr ?? null;
}

/**
 * Get key workout for a given week.
 */
export function getFRRKeyWorkout(tier: PfitzFRRTier, weekNumber: number): { type: string; description: string } | null {
    const weekData = getFRRWeekData(tier, weekNumber);
    return weekData?.keyWorkout ?? null;
}

/**
 * Check if this is a tune-up race week.
 */
export function isFRRTuneUpRaceWeek(tier: PfitzFRRTier, weekNumber: number): boolean {
    return PFITZ_FRR_TIER_CONFIGS[tier].tuneUpRaceWeeks.includes(weekNumber);
}

// =============================================================================
// PROGRESSION GENERATORS
// =============================================================================

/**
 * Generate complete weekly mileage progression.
 */
export function generateFRRWeeklyMileageProgression(tier: PfitzFRRTier): number[] {
    const weeks = FRR_WEEK_DATA[tier];
    return weeks.map(w => w.mileage);
}

/**
 * Generate complete long run progression.
 */
export function generateFRRLongRunProgression(tier: PfitzFRRTier): number[] {
    const weeks = FRR_WEEK_DATA[tier];
    return weeks.map(w => w.longRun);
}

// =============================================================================
// TIER HELPERS
// =============================================================================

/**
 * Get all available FRR tiers.
 */
export function getFRRTiers(): PfitzFRRTier[] {
    return Object.keys(PFITZ_FRR_TIER_CONFIGS) as PfitzFRRTier[];
}

/**
 * Get tier configuration.
 */
export function getFRRTierConfig(tier: PfitzFRRTier): PfitzFRRTierConfig {
    return PFITZ_FRR_TIER_CONFIGS[tier];
}

/**
 * Get tier display name.
 */
export function getFRRTierDisplayName(tier: PfitzFRRTier): string {
    const config = PFITZ_FRR_TIER_CONFIGS[tier];
    const distanceLabel = config.distance === 'half' ? 'Half Marathon' : config.distance.toUpperCase();
    return `Pfitzinger FRR ${distanceLabel} (${config.startMileage}-${config.peakMileage} mpw)`;
}

/**
 * Get tiers for a specific distance.
 */
export function getFRRTiersByDistance(distance: PfitzFRRDistance): PfitzFRRTier[] {
    return getFRRTiers().filter(tier => PFITZ_FRR_TIER_CONFIGS[tier].distance === distance);
}

/**
 * Recommend a FRR tier based on runner profile.
 */
export function recommendFRRTier(
    weeklyMiles: number,
    runsPerWeek: number,
    goalDistance: PfitzFRRDistance
): PfitzFRRTier | null {
    const tiersForDistance = getFRRTiersByDistance(goalDistance);

    // Find best match based on current weekly mileage
    for (const tier of tiersForDistance.reverse()) { // Start with highest
        const config = PFITZ_FRR_TIER_CONFIGS[tier];
        // Recommend if runner is within 15% of start mileage
        if (weeklyMiles >= config.startMileage * 0.85) {
            // Check run days compatibility
            if (runsPerWeek >= config.runDays - 1) {
                return tier;
            }
        }
    }

    // Default to lowest tier for the distance
    return tiersForDistance[0] ?? null;
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate that an FRR plan meets key criteria.
 */
export function validateFRRPlan(tier: PfitzFRRTier): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    const config = PFITZ_FRR_TIER_CONFIGS[tier];
    const weeks = FRR_WEEK_DATA[tier];

    // Check week count
    if (weeks.length !== 12) {
        errors.push(`Expected 12 weeks, got ${weeks.length}`);
    }

    // Check peak mileage achieved
    const maxMileage = Math.max(...weeks.map(w => w.mileage));
    if (maxMileage < config.peakMileage * 0.9) {
        errors.push(`Peak mileage ${maxMileage} < expected ${config.peakMileage}`);
    }

    // Check phase coverage
    const allWeeks = [
        ...config.phases.base,
        ...config.phases.build,
        ...config.phases.peak,
        ...config.phases.taper,
    ];
    for (let w = 1; w <= 12; w++) {
        if (!allWeeks.includes(w)) {
            errors.push(`Week ${w} not assigned to any phase`);
        }
    }

    return { valid: errors.length === 0, errors };
}
