/**
 * THE LONG GAME - Pfitzinger Advanced Marathoning Coach Module
 *
 * Complete implementation of Pfitzinger Advanced Marathoning plans:
 * - 12/55: 12 weeks, 55 miles peak
 * - 18/55: 18 weeks, 55 miles peak
 * - 18/70: 18 weeks, 70 miles peak
 * - 18/85: 18 weeks, 85 miles peak
 *
 * Key patterns:
 * - Medium-long runs (MLR) as distinct workout type
 * - Marathon pace segments built into long runs
 * - Lactate threshold duration-based progression (20→45 min)
 * - VO2max sharpening phase (600m-1600m @ 5K pace)
 * - 20-22 mile long runs
 * - Tune-up races integrated
 *
 * Source: "Advanced Marathoning" 2nd/3rd Ed + research/23-pfitzinger-complete-library.md
 */

import { TrainingPhase } from '../types';

// =============================================================================
// TYPES
// =============================================================================

export type PfitzTier = 'pfitz_12_55' | 'pfitz_18_55' | 'pfitz_18_70' | 'pfitz_18_85';

export type PfitzPhase = 'endurance' | 'lactate_threshold' | 'race_prep' | 'taper';

export type PfitzDayType =
    | 'rest'
    | 'recovery'
    | 'general_aerobic'
    | 'medium_long'
    | 'long_run'
    | 'long_run_mp'
    | 'lactate_threshold'
    | 'vo2max'
    | 'tune_up_race';

export interface PfitzDaySlot {
    type: PfitzDayType;
    distanceRange?: [number, number];
    notes?: string;
}

export type PfitzMicrocycle = Record<string, PfitzDaySlot>;

export interface PfitzTierConfig {
    tier: PfitzTier;
    durationWeeks: number;
    runDays: 5 | 6;
    startMileage: number;
    peakMileage: number;
    maxLongRun: number;
    twentyMilerWeeks: number[];
    mlrDistanceRange: [number, number];
    mpLongRunWeeks: number[];
    mpDistances: number[];
    ltWeeks: number[];
    vo2Weeks: number[];
    tuneUpRaceWeeks: number[];
    phases: {
        endurance: number[];
        lactate_threshold: number[];
        race_prep: number[];
        taper: number[];
    };
}

// =============================================================================
// TIER CONFIGURATIONS
// =============================================================================

export const PFITZ_TIER_CONFIGS: Record<PfitzTier, PfitzTierConfig> = {
    pfitz_12_55: {
        tier: 'pfitz_12_55',
        durationWeeks: 12,
        runDays: 5,
        startMileage: 42,
        peakMileage: 55,
        maxLongRun: 20,
        twentyMilerWeeks: [7, 3],
        mlrDistanceRange: [10, 13],
        mpLongRunWeeks: [11, 8, 5],
        mpDistances: [8, 10, 12],
        ltWeeks: [12, 10, 6],
        vo2Weeks: [4, 2],
        tuneUpRaceWeeks: [],
        phases: {
            endurance: [12, 11, 10, 9],
            lactate_threshold: [8, 7, 6, 5],
            race_prep: [4, 3],
            taper: [2, 1],
        },
    },
    pfitz_18_55: {
        tier: 'pfitz_18_55',
        durationWeeks: 18,
        runDays: 5,
        startMileage: 33,
        peakMileage: 55,
        maxLongRun: 20,
        twentyMilerWeeks: [11, 8, 4],
        mlrDistanceRange: [11, 14],
        mpLongRunWeeks: [17, 14, 10, 6],
        mpDistances: [8, 10, 12, 14],
        ltWeeks: [18, 16, 14, 12, 8],
        vo2Weeks: [7, 6, 4, 2],
        tuneUpRaceWeeks: [5, 3],
        phases: {
            endurance: [18, 17, 16, 15, 14, 13],
            lactate_threshold: [12, 11, 10, 9, 8, 7],
            race_prep: [6, 5, 4, 3],
            taper: [2, 1],
        },
    },
    pfitz_18_70: {
        tier: 'pfitz_18_70',
        durationWeeks: 18,
        runDays: 6,
        startMileage: 48,
        peakMileage: 71,
        maxLongRun: 22,
        twentyMilerWeeks: [7, 8, 11, 13, 15],
        mlrDistanceRange: [11, 15],
        mpLongRunWeeks: [2, 5, 9, 13],
        mpDistances: [8, 10, 12, 14],
        ltWeeks: [1, 3, 5, 7, 8, 11],
        vo2Weeks: [10, 12, 13, 14, 15, 17],
        tuneUpRaceWeeks: [12, 14, 16],
        phases: {
            endurance: [1, 2, 3, 4, 5, 6],
            lactate_threshold: [7, 8, 9, 10, 11, 12],
            race_prep: [13, 14, 15, 16],
            taper: [17, 18],
        },
    },
    pfitz_18_85: {
        tier: 'pfitz_18_85',
        durationWeeks: 18,
        runDays: 6,
        startMileage: 57,
        peakMileage: 85,
        maxLongRun: 23,
        twentyMilerWeeks: [6, 7, 8, 10, 11, 13, 15],
        mlrDistanceRange: [12, 16],
        mpLongRunWeeks: [2, 5, 9, 13],
        mpDistances: [10, 12, 14, 16],
        ltWeeks: [1, 3, 5, 7, 8, 11],
        vo2Weeks: [10, 12, 13, 14, 15, 17],
        tuneUpRaceWeeks: [12, 14, 16],
        phases: {
            endurance: [1, 2, 3, 4, 5, 6],
            lactate_threshold: [7, 8, 9, 10, 11, 12],
            race_prep: [13, 14, 15, 16],
            taper: [17, 18],
        },
    },
};

// =============================================================================
// WEEKLY MILEAGE DATA
// =============================================================================

const PFITZ_18_55_MILEAGE = [
    33, 36, 40, 42, 45, 37, 50, 54, 48, 43,
    55, 52, 51, 45, 32, 32, 22, 26.2
];

const PFITZ_18_70_MILEAGE = [
    52, 54, 56, 60, 59, 52, 67, 65, 62, 55,
    67, 61, 67, 59, 67, 55, 43, 50
];

const PFITZ_18_85_MILEAGE = [
    62, 65, 68, 72, 70, 63, 80, 78, 72, 65,
    82, 75, 82, 72, 82, 68, 52, 60
];

const PFITZ_12_55_MILEAGE = [
    42, 45, 48, 50, 52, 55, 55, 52, 48, 45, 32, 26.2
];

// =============================================================================
// LONG RUN DATA
// =============================================================================

const PFITZ_18_55_LONG_RUNS: Array<{ distance: number; mpSegment?: number }> = [
    { distance: 12 },                    // Week 18
    { distance: 13, mpSegment: 8 },      // Week 17
    { distance: 14 },                    // Week 16
    { distance: 15 },                    // Week 15
    { distance: 16, mpSegment: 10 },     // Week 14
    { distance: 12 },                    // Week 13 (recovery)
    { distance: 18 },                    // Week 12
    { distance: 20 },                    // Week 11
    { distance: 16, mpSegment: 12 },     // Week 10
    { distance: 14 },                    // Week 9
    { distance: 20 },                    // Week 8
    { distance: 17 },                    // Week 7
    { distance: 18, mpSegment: 14 },     // Week 6
    { distance: 17 },                    // Week 5 (tune-up)
    { distance: 20 },                    // Week 4
    { distance: 16 },                    // Week 3 (tune-up)
    { distance: 16 },                    // Week 2
    { distance: 26.2 },                  // Week 1 (RACE)
];

const PFITZ_18_70_LONG_RUNS: Array<{ distance: number; mpSegment?: number }> = [
    { distance: 14 },                    // Week 1
    { distance: 16, mpSegment: 8 },      // Week 2
    { distance: 15 },                    // Week 3
    { distance: 18 },                    // Week 4
    { distance: 18, mpSegment: 10 },     // Week 5
    { distance: 15 },                    // Week 6 (recovery)
    { distance: 20 },                    // Week 7
    { distance: 20 },                    // Week 8
    { distance: 19, mpSegment: 12 },     // Week 9
    { distance: 15 },                    // Week 10
    { distance: 22 },                    // Week 11 (peak)
    { distance: 17 },                    // Week 12 (tune-up)
    { distance: 20, mpSegment: 14 },     // Week 13
    { distance: 17 },                    // Week 14 (tune-up)
    { distance: 20 },                    // Week 15
    { distance: 17 },                    // Week 16 (tune-up)
    { distance: 13 },                    // Week 17
    { distance: 26.2 },                  // Week 18 (RACE)
];

// =============================================================================
// LACTATE THRESHOLD WORKOUTS
// =============================================================================

export interface PfitzLTWorkout {
    totalMiles: number;
    ltDurationMinutes: number;
    warmupCooldownMiles: number;
    pace: string;
}

const PFITZ_18_70_LT_WORKOUTS: Record<number, PfitzLTWorkout> = {
    1: { totalMiles: 9, ltDurationMinutes: 22, warmupCooldownMiles: 4, pace: '15K-HM' },
    3: { totalMiles: 10, ltDurationMinutes: 27, warmupCooldownMiles: 4, pace: '15K-HM' },
    5: { totalMiles: 9, ltDurationMinutes: 32, warmupCooldownMiles: 4, pace: '15K-HM' },
    7: { totalMiles: 10, ltDurationMinutes: 32, warmupCooldownMiles: 4, pace: '15K-HM' },
    8: { totalMiles: 11, ltDurationMinutes: 37, warmupCooldownMiles: 4, pace: '15K-HM' },
    11: { totalMiles: 12, ltDurationMinutes: 42, warmupCooldownMiles: 4, pace: '15K-HM' },
};

const PFITZ_18_55_LT_WORKOUTS: Record<number, PfitzLTWorkout> = {
    18: { totalMiles: 8, ltDurationMinutes: 20, warmupCooldownMiles: 3, pace: '15K-HM' },
    16: { totalMiles: 8, ltDurationMinutes: 20, warmupCooldownMiles: 3, pace: '15K-HM' },
    14: { totalMiles: 9, ltDurationMinutes: 25, warmupCooldownMiles: 3.5, pace: '15K-HM' },
    12: { totalMiles: 10, ltDurationMinutes: 30, warmupCooldownMiles: 3.5, pace: '15K-HM' },
    8: { totalMiles: 11, ltDurationMinutes: 40, warmupCooldownMiles: 3.5, pace: '15K-HM' },
};

// =============================================================================
// VO2MAX WORKOUTS
// =============================================================================

export interface PfitzVO2maxWorkout {
    totalMiles: number;
    reps: number;
    distance: string;
    distanceMeters: number;
    pace: string;
    recovery: string;
}

const PFITZ_18_70_VO2_WORKOUTS: Record<number, PfitzVO2maxWorkout> = {
    10: { totalMiles: 9, reps: 7, distance: '600m', distanceMeters: 600, pace: '5K', recovery: '200-400m jog' },
    12: { totalMiles: 8, reps: 5, distance: '600m', distanceMeters: 600, pace: '5K', recovery: '200-400m jog' },
    13: { totalMiles: 11, reps: 6, distance: '1km', distanceMeters: 1000, pace: '5K', recovery: '400m jog' },
    14: { totalMiles: 8, reps: 5, distance: '600m', distanceMeters: 600, pace: '5K', recovery: '200-400m jog' },
    15: { totalMiles: 12, reps: 6, distance: '1km', distanceMeters: 1000, pace: '5K', recovery: '400m jog' },
    17: { totalMiles: 9, reps: 5, distance: '1km', distanceMeters: 1000, pace: '5K', recovery: '400m jog' },
};

const PFITZ_18_55_VO2_WORKOUTS: Record<number, PfitzVO2maxWorkout> = {
    7: { totalMiles: 8, reps: 5, distance: '600m', distanceMeters: 600, pace: '5K', recovery: '200-400m jog' },
    6: { totalMiles: 9, reps: 5, distance: '1000m', distanceMeters: 1000, pace: '5K', recovery: '400m jog' },
    4: { totalMiles: 9, reps: 4, distance: '1200m', distanceMeters: 1200, pace: '5K', recovery: '400-600m jog' },
    2: { totalMiles: 8, reps: 3, distance: '1600m', distanceMeters: 1600, pace: '5K', recovery: '600m jog' },
};

// =============================================================================
// MLR DATA
// =============================================================================

const PFITZ_18_55_MLR: Record<number, number> = {
    12: 11, 11: 12, 10: 14, 8: 12, 7: 12, 6: 12, 5: 11, 4: 11, 2: 12
};

const PFITZ_18_70_MLR: Record<number, number> = {
    1: 12, 2: 12, 3: 13, 4: 14, 5: 14, 6: 12, 7: 15, 8: 15, 9: 15,
    11: 15, 13: 15, 15: 15, 18: 7
};

// =============================================================================
// MICROCYCLE TEMPLATES
// =============================================================================

const PFITZ_ENDURANCE_MICROCYCLE: PfitzMicrocycle = {
    mon: { type: 'rest' },
    tue: { type: 'general_aerobic', distanceRange: [7, 10], notes: 'with strides' },
    wed: { type: 'medium_long', distanceRange: [10, 14] },
    thu: { type: 'recovery', distanceRange: [4, 6] },
    fri: { type: 'lactate_threshold', notes: 'or GA' },
    sat: { type: 'recovery', distanceRange: [4, 6] },
    sun: { type: 'long_run' },
};

const PFITZ_LT_MICROCYCLE: PfitzMicrocycle = {
    mon: { type: 'rest' },
    tue: { type: 'lactate_threshold' },
    wed: { type: 'medium_long', distanceRange: [12, 15] },
    thu: { type: 'recovery', distanceRange: [5, 7] },
    fri: { type: 'general_aerobic', distanceRange: [8, 10] },
    sat: { type: 'recovery', distanceRange: [5, 7] },
    sun: { type: 'long_run' },
};

const PFITZ_RACE_PREP_MICROCYCLE: PfitzMicrocycle = {
    mon: { type: 'rest' },
    tue: { type: 'vo2max' },
    wed: { type: 'medium_long', distanceRange: [10, 14] },
    thu: { type: 'recovery', distanceRange: [5, 7] },
    fri: { type: 'general_aerobic', distanceRange: [7, 9] },
    sat: { type: 'recovery', distanceRange: [4, 6] },
    sun: { type: 'long_run_mp', notes: 'with MP segment' },
};

const PFITZ_TAPER_MICROCYCLE: PfitzMicrocycle = {
    mon: { type: 'rest' },
    tue: { type: 'vo2max', notes: 'Reduced volume' },
    wed: { type: 'general_aerobic', distanceRange: [6, 8] },
    thu: { type: 'recovery', distanceRange: [4, 5] },
    fri: { type: 'recovery', distanceRange: [4, 5] },
    sat: { type: 'recovery', distanceRange: [3, 4] },
    sun: { type: 'long_run', notes: 'Race week: MARATHON' },
};

export const PFITZ_MICROCYCLES: Record<PfitzTier, Record<PfitzPhase, PfitzMicrocycle>> = {
    pfitz_12_55: {
        endurance: PFITZ_ENDURANCE_MICROCYCLE,
        lactate_threshold: PFITZ_LT_MICROCYCLE,
        race_prep: PFITZ_RACE_PREP_MICROCYCLE,
        taper: PFITZ_TAPER_MICROCYCLE,
    },
    pfitz_18_55: {
        endurance: PFITZ_ENDURANCE_MICROCYCLE,
        lactate_threshold: PFITZ_LT_MICROCYCLE,
        race_prep: PFITZ_RACE_PREP_MICROCYCLE,
        taper: PFITZ_TAPER_MICROCYCLE,
    },
    pfitz_18_70: {
        endurance: PFITZ_ENDURANCE_MICROCYCLE,
        lactate_threshold: PFITZ_LT_MICROCYCLE,
        race_prep: PFITZ_RACE_PREP_MICROCYCLE,
        taper: PFITZ_TAPER_MICROCYCLE,
    },
    pfitz_18_85: {
        endurance: PFITZ_ENDURANCE_MICROCYCLE,
        lactate_threshold: PFITZ_LT_MICROCYCLE,
        race_prep: PFITZ_RACE_PREP_MICROCYCLE,
        taper: PFITZ_TAPER_MICROCYCLE,
    },
};

// =============================================================================
// PHASE DETECTION
// =============================================================================

/**
 * Get the Pfitzinger-specific training phase for a given week.
 * Note: Pfitz counts weeks DOWN to race (Week 18 = first week for 18-week plans)
 */
export function getPfitzPhase(tier: PfitzTier, weekNumber: number): PfitzPhase {
    const config = PFITZ_TIER_CONFIGS[tier];
    if (config.phases.taper.includes(weekNumber)) return 'taper';
    if (config.phases.race_prep.includes(weekNumber)) return 'race_prep';
    if (config.phases.lactate_threshold.includes(weekNumber)) return 'lactate_threshold';
    return 'endurance';
}

/**
 * Map Pfitz phase to generic TrainingPhase
 */
export function toTrainingPhase(pfitzPhase: PfitzPhase): TrainingPhase {
    switch (pfitzPhase) {
        case 'endurance': return 'base';
        case 'lactate_threshold': return 'build';
        case 'race_prep': return 'peak';
        case 'taper': return 'taper';
    }
}

// =============================================================================
// WORKOUT GENERATORS
// =============================================================================

/**
 * Get the LT workout for a given week.
 */
export function getPfitzLTWorkout(tier: PfitzTier, weekNumber: number): PfitzLTWorkout | null {
    if (tier === 'pfitz_18_70' || tier === 'pfitz_18_85') {
        return PFITZ_18_70_LT_WORKOUTS[weekNumber] ?? null;
    }
    return PFITZ_18_55_LT_WORKOUTS[weekNumber] ?? null;
}

/**
 * Get the VO2max workout for a given week.
 */
export function getPfitzVO2maxWorkout(tier: PfitzTier, weekNumber: number): PfitzVO2maxWorkout | null {
    if (tier === 'pfitz_18_70' || tier === 'pfitz_18_85') {
        return PFITZ_18_70_VO2_WORKOUTS[weekNumber] ?? null;
    }
    return PFITZ_18_55_VO2_WORKOUTS[weekNumber] ?? null;
}

/**
 * Get MLR distance for a given week.
 */
export function getPfitzMLRDistance(tier: PfitzTier, weekNumber: number): number | null {
    if (tier === 'pfitz_18_70' || tier === 'pfitz_18_85') {
        return PFITZ_18_70_MLR[weekNumber] ?? null;
    }
    return PFITZ_18_55_MLR[weekNumber] ?? null;
}

/**
 * Check if this is a tune-up race week.
 */
export function isPfitzTuneUpRaceWeek(tier: PfitzTier, weekNumber: number): boolean {
    return PFITZ_TIER_CONFIGS[tier].tuneUpRaceWeeks.includes(weekNumber);
}

// =============================================================================
// LONG RUN PROGRESSION
// =============================================================================

/**
 * Get long run data for a specific week.
 */
export function getPfitzLongRun(
    tier: PfitzTier,
    weekNumber: number
): { distance: number; mpSegment?: number } | null {
    if (tier === 'pfitz_18_70') {
        return PFITZ_18_70_LONG_RUNS[weekNumber - 1] ?? null;
    }
    if (tier === 'pfitz_18_55') {
        // 18/55 counts down: week 18 = index 0
        const index = 18 - weekNumber;
        return PFITZ_18_55_LONG_RUNS[index] ?? null;
    }
    return null;
}

/**
 * Generate complete long run progression.
 */
export function generatePfitzLongRunProgression(tier: PfitzTier): number[] {
    const config = PFITZ_TIER_CONFIGS[tier];
    const progression: number[] = [];

    for (let week = 1; week <= config.durationWeeks; week++) {
        const longRun = getPfitzLongRun(tier, week);
        progression.push(longRun?.distance ?? 0);
    }

    return progression;
}

/**
 * Check if a long run has a marathon pace segment.
 */
export function hasMPSegment(tier: PfitzTier, weekNumber: number): boolean {
    return PFITZ_TIER_CONFIGS[tier].mpLongRunWeeks.includes(weekNumber);
}

/**
 * Get MP segment distance for a given week.
 */
export function getMPSegmentDistance(tier: PfitzTier, weekNumber: number): number | null {
    const config = PFITZ_TIER_CONFIGS[tier];
    const mpIndex = config.mpLongRunWeeks.indexOf(weekNumber);
    if (mpIndex === -1) return null;
    return config.mpDistances[mpIndex] ?? null;
}

// =============================================================================
// WEEKLY MILEAGE
// =============================================================================

/**
 * Get the prescribed weekly mileage for a given week.
 */
export function getPfitzWeeklyMileage(tier: PfitzTier, weekNumber: number): number {
    switch (tier) {
        case 'pfitz_18_70':
            return PFITZ_18_70_MILEAGE[weekNumber - 1] ?? 0;
        case 'pfitz_18_55':
            return PFITZ_18_55_MILEAGE[weekNumber - 1] ?? 0;
        case 'pfitz_18_85':
            return PFITZ_18_85_MILEAGE[weekNumber - 1] ?? 0;
        case 'pfitz_12_55':
            return PFITZ_12_55_MILEAGE[weekNumber - 1] ?? 0;
    }
}

/**
 * Generate complete weekly mileage progression.
 */
export function generatePfitzWeeklyMileageProgression(tier: PfitzTier): number[] {
    switch (tier) {
        case 'pfitz_18_70':
            return [...PFITZ_18_70_MILEAGE];
        case 'pfitz_18_55':
            return [...PFITZ_18_55_MILEAGE];
        case 'pfitz_18_85':
            return [...PFITZ_18_85_MILEAGE];
        case 'pfitz_12_55':
            return [...PFITZ_12_55_MILEAGE];
    }
}

// =============================================================================
// MICROCYCLE ACCESS
// =============================================================================

/**
 * Get the microcycle template for a tier and phase.
 */
export function getPfitzMicrocycle(tier: PfitzTier, weekNumber: number): PfitzMicrocycle {
    const phase = getPfitzPhase(tier, weekNumber);
    return PFITZ_MICROCYCLES[tier][phase];
}

// =============================================================================
// TIER HELPERS
// =============================================================================

/**
 * Get all available Pfitz tiers.
 */
export function getPfitzTiers(): PfitzTier[] {
    return Object.keys(PFITZ_TIER_CONFIGS) as PfitzTier[];
}

/**
 * Get tier configuration.
 */
export function getPfitzTierConfig(tier: PfitzTier): PfitzTierConfig {
    return PFITZ_TIER_CONFIGS[tier];
}

/**
 * Recommend a Pfitz tier based on runner profile.
 */
export function recommendPfitzTier(
    weeklyMiles: number,
    runsPerWeek: number,
    experience: 'beginner' | 'intermediate' | 'advanced',
    weeksAvailable: number
): PfitzTier {
    // If only 12 weeks available, use 12/55
    if (weeksAvailable <= 14) {
        return 'pfitz_12_55';
    }

    // Advanced with high mileage base
    if (experience === 'advanced') {
        if (weeklyMiles >= 60 && runsPerWeek >= 6) {
            return 'pfitz_18_85';
        }
        if (weeklyMiles >= 45 && runsPerWeek >= 5) {
            return 'pfitz_18_70';
        }
    }

    // Intermediate
    if (experience === 'intermediate' && weeklyMiles >= 35 && runsPerWeek >= 5) {
        return 'pfitz_18_70';
    }

    // Default to 18/55
    return 'pfitz_18_55';
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate that a Pfitz plan meets key criteria.
 */
export function validatePfitzPlan(tier: PfitzTier): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    const config = PFITZ_TIER_CONFIGS[tier];

    // Check 20-miler count
    const twentyMilers = config.twentyMilerWeeks.length;
    if (twentyMilers < 2) {
        errors.push(`Insufficient 20-milers: ${twentyMilers} < 2`);
    }

    // Check MP long run progression
    const mpCount = config.mpLongRunWeeks.length;
    if (mpCount < 3) {
        errors.push(`Insufficient MP long runs: ${mpCount} < 3`);
    }

    // Check phase coverage
    const allWeeks = [
        ...config.phases.endurance,
        ...config.phases.lactate_threshold,
        ...config.phases.race_prep,
        ...config.phases.taper,
    ];
    for (let w = 1; w <= config.durationWeeks; w++) {
        if (!allWeeks.includes(w)) {
            errors.push(`Week ${w} not assigned to any phase`);
        }
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Format an LT workout for display.
 */
export function formatLTWorkout(workout: PfitzLTWorkout): string {
    return `${workout.totalMiles}mi w/ ${workout.ltDurationMinutes}min @ ${workout.pace}`;
}

/**
 * Format a VO2max workout for display.
 */
export function formatVO2maxWorkout(workout: PfitzVO2maxWorkout): string {
    return `${workout.reps}×${workout.distance} @ ${workout.pace} (${workout.recovery})`;
}

/**
 * Get tier display name.
 */
export function getPfitzTierDisplayName(tier: PfitzTier): string {
    switch (tier) {
        case 'pfitz_12_55': return 'Pfitzinger 12/55';
        case 'pfitz_18_55': return 'Pfitzinger 18/55';
        case 'pfitz_18_70': return 'Pfitzinger 18/70';
        case 'pfitz_18_85': return 'Pfitzinger 18/85';
    }
}

// =============================================================================
// ELIGIBILITY CRITERIA
// Source: "Advanced Marathoning" 2nd/3rd Ed + research/23-pfitzinger-complete-library.md
// =============================================================================

import type { CoachEligibility } from './hansons';

/**
 * Pfitzinger eligibility criteria.
 * 
 * Philosophy: Serious training for committed marathoners. Requires solid base
 * and consistent training history. Not a beginner's program.
 */
export const PFITZ_ELIGIBILITY: CoachEligibility = {
    // Pfitz marathon plans - FRR covers 5K-Half but implemented separately
    distances: ['marathon'] as const,

    // Pfitz 18/55 is 5-day, 18/70+ is 6-day (research/23-pfitzinger-complete-library.md)
    minDays: 5,

    // Pfitz 18/55 starts at 33 mpw, needs ~75% of that as base (~25)
    // Pfitz 12/55 starts at 42 mpw, needs ~75% of that as base (~32)
    // Use 30 as reasonable minimum to safely start any Pfitz plan
    minMileage: 30,

    tiers: {
        '12_55': {
            // 12-week plan starting at 42 mpw
            // For time-crunched runners with established base
            mileageRange: [35, 50],
            startMileage: 42,  // Week 1 mileage from plan
        },
        '18_55': {
            // 18-week 55 mpw peak - lowest full Pfitz plan
            // Source: research/23-pfitzinger-complete-library.md
            mileageRange: [30, 50],
            startMileage: 33,  // Week 1 mileage from plan
        },
        '18_70': {
            // 18-week 70 mpw peak - serious competitor
            // Requires 6 days (PFITZ_TIER_CONFIGS.pfitz_18_70.runDays)
            mileageRange: [45, 65],
            startMileage: 48,  // Week 1 mileage from plan
        },
        '18_85': {
            // 18-week 85 mpw peak - elite/sub-elite
            // Only for very experienced high-mileage runners
            mileageRange: [55, Infinity],
            startMileage: 57,  // Week 1 mileage from plan
        },
    },
};

// =============================================================================
// COACHING EXPLANATIONS (Pfitzinger Voice)
// =============================================================================

export interface PfitzWorkoutExplanation {
    title: string;
    description: string;
    why: string;
    feel: string;
    coachTip?: string;
}

/**
 * Coaching explanations in the Pfitzinger voice.
 * Use these to populate workout detail pages and methodology sections.
 */
export const PFITZ_COACHING_EXPLANATIONS: Record<PfitzDayType, PfitzWorkoutExplanation> = {
    rest: {
        title: 'Rest Day',
        description: 'Complete rest from running. May include light stretching or walking.',
        why: 'Recovery days allow your muscles and connective tissues to repair and strengthen. Training adaptation happens during rest, not during the workout itself.',
        feel: 'Refreshed, recovered. Resist the urge to "sneak in" extra miles.',
        coachTip: 'If you feel you need more rest days than scheduled, that\'s valuable feedback about your recovery capacity.',
    },
    recovery: {
        title: 'Recovery Run',
        description: 'Very easy running, 2+ minutes per mile slower than marathon pace.',
        why: 'Recovery runs promote blood flow to tired muscles without adding significant stress. They help clear metabolic waste and prepare you for the next quality session.',
        feel: 'Almost embarrassingly easy. You should feel like you could run forever.',
        coachTip: 'The biggest mistake runners make is running recovery days too fast. This steals from your hard days.',
    },
    general_aerobic: {
        title: 'General Aerobic',
        description: 'Easy running with strides at the end. Building your aerobic base.',
        why: 'General aerobic runs develop the cardiovascular system that powers your marathon. Strides add neuromuscular stimulus without significant fatigue.',
        feel: 'Comfortable, conversational. The strides should feel smooth and controlled.',
        coachTip: 'Do 6-8 strides of 100m at the end. Accelerate to 5K pace, hold briefly, decelerate. Full recovery between.',
    },
    medium_long: {
        title: 'Medium-Long Run (MLR)',
        description: 'Your second most important weekly workout. 10-15 miles at endurance pace.',
        why: 'The MLR adds significant endurance stimulus without the recovery cost of a full 20-miler. It\'s the unsung hero of marathon preparation.',
        feel: 'Steady, sustainable. Same effort as your easy runs, just longer.',
        coachTip: 'Don\'t turn this into a tempo run or mini-long run. The value is in the additional easy volume.',
    },
    long_run: {
        title: 'Long Run',
        description: 'The cornerstone of marathon training. 45-90 seconds slower than marathon pace.',
        why: 'Long runs teach your body to burn fat for fuel, build mental toughness, and prepare your legs for the unique stress of 26.2 miles.',
        feel: 'Controlled, patient. Resist the urge to push pace early. You should feel strong through 15 miles.',
        coachTip: 'Start conservative. The last 5 miles should feel challenging but manageable. If you\'re struggling at mile 12, you started too fast.',
    },
    long_run_mp: {
        title: 'Long Run with Marathon Pace',
        description: 'Long run with a significant portion at your goal marathon pace.',
        why: 'MP long runs are race rehearsals. You\'re teaching your body exactly what race day feels like, building both physiological and mental race confidence.',
        feel: 'The easy portion should feel easy. The MP portion should feel like race effort - sustainable but purposeful.',
        coachTip: 'Run the first miles easy, then transition to MP. The final 14-mile @ MP long run is your marathon dress rehearsal.',
    },
    lactate_threshold: {
        title: 'Lactate Threshold',
        description: 'Tempo running at 15K-Half Marathon pace. 20-45 minutes at LT.',
        why: 'LT training raises the pace you can sustain before lactate accumulates. As your LT improves, marathon pace feels progressively easier.',
        feel: 'Comfortably hard. You can speak in short sentences but not hold a conversation.',
        coachTip: 'LT pace is roughly 25-30 seconds per mile faster than your goal marathon pace. It should feel sustainable for 40-60 minutes if you had to.',
    },
    vo2max: {
        title: 'VO2max Intervals',
        description: 'Hard intervals at 5K race pace. 600m-1600m repeats with jog recovery.',
        why: 'VO2max training improves your body\'s ability to use oxygen at high intensities. This "sharpens" your fitness in the final weeks before the race.',
        feel: 'Hard but controlled. These should feel significantly faster than tempo but not all-out.',
        coachTip: 'VO2max work appears in the Race Prep phase, not throughout training. It\'s the finishing touch, not the foundation.',
    },
    tune_up_race: {
        title: 'Tune-Up Race',
        description: '8K-Half Marathon race as part of training. A hard workout with race excitement.',
        why: 'Tune-up races serve multiple purposes: fitness check, race routine practice, mental confidence builder, and a very hard workout you couldn\'t replicate in training.',
        feel: 'Race effort! Go for a good time. This is the one day you can push.',
        coachTip: 'Run these races at your current fitness, not at a target pace. They tell you where you are, not where you want to be.',
    },
};

/**
 * Phase-specific coaching explanations.
 */
export const PFITZ_PHASE_EXPLANATIONS: Record<PfitzPhase, { title: string; description: string; focus: string }> = {
    endurance: {
        title: 'Endurance Phase',
        description: 'Building your aerobic base.',
        focus: 'Establish consistent mileage, introduce LT running, build toward peak volume. The aerobic engine you build now powers your marathon.',
    },
    lactate_threshold: {
        title: 'Lactate Threshold Phase',
        description: 'Peak mileage and longest tempo sessions.',
        focus: 'This is the hard work phase. You\'re pushing your lactate threshold higher so marathon pace feels easier on race day.',
    },
    race_prep: {
        title: 'Race Preparation Phase',
        description: 'Sharpening for race day.',
        focus: 'VO2max intervals, tune-up races, and your final 20-miler with 14 miles @ MP. You\'re sharpening the blade you\'ve already forged.',
    },
    taper: {
        title: 'Taper Phase',
        description: 'Reduce volume, maintain intensity, arrive fresh.',
        focus: 'The hay is in the barn. Trust your training. Reduce volume dramatically but keep some intensity to stay sharp.',
    },
};

/**
 * The MLR explanation - a signature Pfitz concept.
 */
export const PFITZ_MLR_EXPLANATION = {
    title: 'The Medium-Long Run: Marathon Training\'s Secret Weapon',
    summary: 'The MLR is your second most important weekly workout. It builds endurance without the recovery cost of a true long run.',
    details: [
        '10-15 miles at the same easy pace as your regular runs',
        'Done midweek (usually Wednesday) to break up the training week',
        'Allows you to accumulate more weekly mileage without excessive fatigue',
        'Provides a second significant aerobic stimulus beyond just the Sunday long run',
        'Critical for runners moving up to higher-mileage plans',
    ],
    source: 'Pete Pfitzinger, "Advanced Marathoning"',
};

/**
 * The MP Long Run explanation - another signature Pfitz concept.
 */
export const PFITZ_MP_LONG_RUN_EXPLANATION = {
    title: 'Marathon Pace Long Runs: The Dress Rehearsal',
    summary: 'By running 8-14 miles at marathon pace within your long run, you\'re teaching your body exactly what race day feels like.',
    progression: [
        { week: 'Early training', distance: 8, context: 'Introduction to MP running' },
        { week: 'Mid training', distance: 10, context: 'Building race-specific endurance' },
        { week: 'Peak training', distance: 12, context: 'Extended race simulation' },
        { week: 'Final preparation', distance: 14, context: 'Full dress rehearsal' },
    ],
    source: 'Pete Pfitzinger, "Advanced Marathoning"',
};
