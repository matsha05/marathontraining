/**
 * THE LONG GAME - Hansons Marathon Method Coach Module
 *
 * Complete implementation of Hansons Marathon Method training plans:
 * - Beginner Marathon: 18 weeks, 12→57.5 mpw
 * - Advanced Marathon: 18 weeks, 38→61.5 mpw
 *
 * Key patterns:
 * - 6 days running (cumulative fatigue)
 * - SOS pattern: Speed/Strength (Tue), Tempo (Thu), Long (Sun)
 * - 16-mile long run cap (no 20-miler philosophy)
 * - Speed phase (5K-10K intervals) → Strength phase (MP-10s intervals)
 * - Alternating 16/10 long run pattern
 *
 * Source: Official Hansons Coaching PDFs + research/22-hansons-complete-library.md
 */

import { TrainingPhase } from '../types';

// =============================================================================
// TYPES
// =============================================================================

export type HansonsTier =
    | 'hansons_beginner'
    | 'hansons_advanced'
    | 'hansons_half_beginner'
    | 'hansons_half_advanced';

export type HansonsPhase = 'base' | 'speed' | 'strength' | 'taper';

export type HansonsDayType =
    | 'rest'
    | 'cross_train'
    | 'easy_run'
    | 'speed_intervals'
    | 'strength_intervals'
    | 'tempo'
    | 'long_run';

export interface HansonsDaySlot {
    type: HansonsDayType;
    distanceRange?: [number, number];
    notes?: string;
}

export type HansonsMicrocycle = Record<string, HansonsDaySlot>;

export interface HansonsTierConfig {
    tier: HansonsTier;
    durationWeeks: 18;
    runDays: 6;
    restDays: 1;
    /** 
     * Long run cap varies by distance:
     * - Half Marathon Beginner: 12 miles
     * - Half Marathon Advanced: 14 miles
     * - Marathon (both tiers): 16 miles
     */
    longRunCap: 12 | 14 | 16;
    peakWeeklyMileage: number;
    phases: {
        base: number[];
        speed: number[];
        strength: number[];
        taper: number[];
    };
    speedPhaseStart: number;
    strengthPhaseStart: number;
}

// =============================================================================
// TIER CONFIGURATIONS
// =============================================================================

export const HANSONS_TIER_CONFIGS: Record<HansonsTier, HansonsTierConfig> = {
    hansons_beginner: {
        tier: 'hansons_beginner',
        durationWeeks: 18,
        runDays: 6,
        restDays: 1,
        longRunCap: 16,
        peakWeeklyMileage: 57.5,
        phases: {
            base: [1, 2, 3, 4, 5],
            speed: [6, 7, 8, 9, 10],
            strength: [11, 12, 13, 14, 15, 16],
            taper: [17, 18],
        },
        speedPhaseStart: 6,
        strengthPhaseStart: 11,
    },
    hansons_advanced: {
        tier: 'hansons_advanced',
        durationWeeks: 18,
        runDays: 6,
        restDays: 1,
        longRunCap: 16,
        peakWeeklyMileage: 61.5,
        phases: {
            base: [1],
            speed: [2, 3, 4, 5, 6, 7, 8, 9, 10],
            strength: [11, 12, 13, 14, 15, 16, 17],
            taper: [18],
        },
        speedPhaseStart: 2,
        strengthPhaseStart: 11,
    },
    // Half Marathon Beginner: 18 weeks, 12mi long run cap, 42mpw peak
    // Source: research/27-hansons-half-marathon.md
    hansons_half_beginner: {
        tier: 'hansons_half_beginner',
        durationWeeks: 18,
        runDays: 6,
        restDays: 1,
        longRunCap: 12,
        peakWeeklyMileage: 42,
        phases: {
            base: [1, 2, 3, 4, 5],
            speed: [6, 7, 8, 9, 10],
            strength: [11, 12, 13, 14, 15, 16],
            taper: [17, 18],
        },
        speedPhaseStart: 6,
        strengthPhaseStart: 11,
    },
    // Half Marathon Advanced: 18 weeks, 14mi long run cap, 50mpw peak
    // Source: research/27-hansons-half-marathon.md
    hansons_half_advanced: {
        tier: 'hansons_half_advanced',
        durationWeeks: 18,
        runDays: 6,
        restDays: 1,
        longRunCap: 14,
        peakWeeklyMileage: 50,
        phases: {
            base: [1],
            speed: [2, 3, 4, 5, 6, 7, 8, 9, 10],
            strength: [11, 12, 13, 14, 15, 16, 17],
            taper: [18],
        },
        speedPhaseStart: 2,
        strengthPhaseStart: 11,
    },
};

// =============================================================================
// WEEKLY MILEAGE DATA (from official PDFs)
// =============================================================================

const BEGINNER_WEEKLY_MILEAGE = [
    12, 15, 21, 20, 24, 40, 39, 42, 49, 48,
    54.5, 50, 56.5, 49, 57.5, 51, 49.5, 50.2
];

const ADVANCED_WEEKLY_MILEAGE = [
    38, 41, 45, 44, 47, 53, 51, 49, 56, 50,
    59.5, 54, 61, 53, 61.5, 55, 53.5, 52.2
];

// =============================================================================
// SPEED WORKOUT PROGRESSIONS (5K-10K pace)
// =============================================================================

export interface HansonsSpeedWorkout {
    reps: number;
    distance: string;
    distanceMeters: number;
    pace: string;
    recovery: string;
    totalMiles: number;
}

const BEGINNER_SPEED_WORKOUTS: Record<number, HansonsSpeedWorkout> = {
    6: { reps: 12, distance: '400m', distanceMeters: 400, pace: '5K-10K', recovery: '400m jog', totalMiles: 5 },
    7: { reps: 8, distance: '600m', distanceMeters: 600, pace: '5K-10K', recovery: '400m jog', totalMiles: 5 },
    8: { reps: 6, distance: '800m', distanceMeters: 800, pace: '5K-10K', recovery: '400m jog', totalMiles: 5 },
    9: { reps: 5, distance: '1km', distanceMeters: 1000, pace: '5K-10K', recovery: '400m jog', totalMiles: 5 },
    10: { reps: 4, distance: '1200m', distanceMeters: 1200, pace: '5K-10K', recovery: '400m jog', totalMiles: 5 },
};

const ADVANCED_SPEED_WORKOUTS: Record<number, HansonsSpeedWorkout> = {
    2: { reps: 12, distance: '400m', distanceMeters: 400, pace: '5K-10K', recovery: '400m jog', totalMiles: 9 },
    3: { reps: 8, distance: '600m', distanceMeters: 600, pace: '5K-10K', recovery: '400m jog', totalMiles: 8 },
    4: { reps: 6, distance: '800m', distanceMeters: 800, pace: '5K-10K', recovery: '400m jog', totalMiles: 8 },
    5: { reps: 5, distance: '1km', distanceMeters: 1000, pace: '5K-10K', recovery: '400m jog', totalMiles: 8 },
    6: { reps: 4, distance: '1200m', distanceMeters: 1200, pace: '5K-10K', recovery: '400m jog', totalMiles: 9 },
    7: { reps: 3, distance: '1 mile', distanceMeters: 1609, pace: '5K-10K', recovery: '400m jog', totalMiles: 8 },
    8: { reps: 4, distance: '1200m', distanceMeters: 1200, pace: '5K-10K', recovery: '400m jog', totalMiles: 8 },
    9: { reps: 5, distance: '1km', distanceMeters: 1000, pace: '5K-10K', recovery: '400m jog', totalMiles: 8 },
    10: { reps: 6, distance: '800m', distanceMeters: 800, pace: '5K-10K', recovery: '400m jog', totalMiles: 8 },
};

// =============================================================================
// STRENGTH WORKOUT PROGRESSIONS (MP - 10 seconds)
// =============================================================================

export interface HansonsStrengthWorkout {
    reps: number;
    distance: string;
    distanceMiles: number;
    pace: string;
    recovery: string;
    totalMiles: number;
}

const BEGINNER_STRENGTH_WORKOUTS: Record<number, HansonsStrengthWorkout> = {
    11: { reps: 6, distance: '1 mile', distanceMiles: 1, pace: 'MP-10s', recovery: '400m jog', totalMiles: 8 },
    12: { reps: 4, distance: '1.5 miles', distanceMiles: 1.5, pace: 'MP-10s', recovery: '800m jog', totalMiles: 9 },
    13: { reps: 3, distance: '2 miles', distanceMiles: 2, pace: 'MP-10s', recovery: '800m jog', totalMiles: 9 },
    14: { reps: 2, distance: '3 miles', distanceMiles: 3, pace: 'MP-10s', recovery: '1 mile jog', totalMiles: 9 },
    15: { reps: 3, distance: '2 miles', distanceMiles: 2, pace: 'MP-10s', recovery: '800m jog', totalMiles: 9 },
    16: { reps: 4, distance: '1.5 miles', distanceMiles: 1.5, pace: 'MP-10s', recovery: '800m jog', totalMiles: 9 },
    17: { reps: 3, distance: '2 miles', distanceMiles: 2, pace: 'MP-10s', recovery: '400m jog', totalMiles: 9 },
};

const ADVANCED_STRENGTH_WORKOUTS: Record<number, HansonsStrengthWorkout> = {
    11: { reps: 6, distance: '1 mile', distanceMiles: 1, pace: 'MP-10s', recovery: '400m jog', totalMiles: 10.5 },
    12: { reps: 4, distance: '1.5 miles', distanceMiles: 1.5, pace: 'MP-10s', recovery: '800m jog', totalMiles: 11 },
    13: { reps: 3, distance: '2 miles', distanceMiles: 2, pace: 'MP-10s', recovery: '800m jog', totalMiles: 10.5 },
    14: { reps: 2, distance: '3 miles', distanceMiles: 3, pace: 'MP-10s', recovery: '1 mile jog', totalMiles: 10 },
    15: { reps: 3, distance: '2 miles', distanceMiles: 2, pace: 'MP-10s', recovery: '800m jog', totalMiles: 10.5 },
    16: { reps: 4, distance: '1.5 miles', distanceMiles: 1.5, pace: 'MP-10s', recovery: '800m jog', totalMiles: 11 },
    17: { reps: 6, distance: '1 mile', distanceMiles: 1, pace: 'MP-10s', recovery: '400m jog', totalMiles: 10.5 },
};

// Half Marathon Strength Workouts - uses 10K pace (NOT MP-10s like marathon)
// Source: research/27-hansons-half-marathon.md
const HALF_BEGINNER_STRENGTH_WORKOUTS: Record<number, HansonsStrengthWorkout> = {
    11: { reps: 4, distance: '1 mile', distanceMiles: 1, pace: '10K', recovery: '400m jog', totalMiles: 7 },
    12: { reps: 3, distance: '1.5 miles', distanceMiles: 1.5, pace: '10K', recovery: '600m jog', totalMiles: 8 },
    13: { reps: 4, distance: '1 mile', distanceMiles: 1, pace: '10K', recovery: '400m jog', totalMiles: 7.5 },
    14: { reps: 3, distance: '1.5 miles', distanceMiles: 1.5, pace: '10K', recovery: '600m jog', totalMiles: 8 },
    15: { reps: 4, distance: '1 mile', distanceMiles: 1, pace: '10K', recovery: '400m jog', totalMiles: 7.5 },
    16: { reps: 3, distance: '1.5 miles', distanceMiles: 1.5, pace: '10K', recovery: '600m jog', totalMiles: 8 },
};

const HALF_ADVANCED_STRENGTH_WORKOUTS: Record<number, HansonsStrengthWorkout> = {
    11: { reps: 5, distance: '1 mile', distanceMiles: 1, pace: '10K', recovery: '400m jog', totalMiles: 9 },
    12: { reps: 4, distance: '1.5 miles', distanceMiles: 1.5, pace: '10K', recovery: '600m jog', totalMiles: 10 },
    13: { reps: 5, distance: '1 mile', distanceMiles: 1, pace: '10K', recovery: '400m jog', totalMiles: 9 },
    14: { reps: 3, distance: '2 miles', distanceMiles: 2, pace: '10K', recovery: '800m jog', totalMiles: 10 },
    15: { reps: 4, distance: '1.5 miles', distanceMiles: 1.5, pace: '10K', recovery: '600m jog', totalMiles: 9.5 },
    16: { reps: 5, distance: '1 mile', distanceMiles: 1, pace: '10K', recovery: '400m jog', totalMiles: 9 },
    17: { reps: 3, distance: '2 miles', distanceMiles: 2, pace: '10K', recovery: '800m jog', totalMiles: 9 },
};

// =============================================================================
// TEMPO PROGRESSION (Marathon Pace)
// =============================================================================

const BEGINNER_TEMPO_MILES: Record<number, number> = {
    6: 5, 7: 5, 8: 5,
    9: 8, 10: 8,
    11: 8, 12: 9, 13: 9, 14: 9,
    15: 10, 16: 10, 17: 10,
};

const ADVANCED_TEMPO_MILES: Record<number, number> = {
    3: 6, 4: 6, 5: 6,
    6: 7, 7: 7, 8: 7,
    9: 8, 10: 8,
    11: 8, 12: 9, 13: 9, 14: 9,
    15: 10, 16: 10, 17: 10,
};

// =============================================================================
// LONG RUN PROGRESSION
// =============================================================================

const BEGINNER_LONG_RUNS = [
    4, 4, 5, 4, 6, 8, 10, 10, 15, 10,
    16, 10, 16, 10, 16, 10, 8, 26.2
];

const ADVANCED_LONG_RUNS = [
    8, 8, 10, 8, 12, 10, 14, 10, 15, 10,
    16, 10, 16, 10, 16, 10, 8, 26.2
];

// Half Marathon long run progressions (alternating 12/10 and 14/10)
// Source: research/27-hansons-half-marathon.md
const HALF_BEGINNER_LONG_RUNS = [
    4, 4, 5, 5, 6, 6, 8, 8, 10, 10,
    10, 12, 10, 12, 10, 12, 6, 13.1
];

const HALF_ADVANCED_LONG_RUNS = [
    6, 6, 7, 8, 10, 12, 10, 12, 10, 12,
    10, 14, 10, 14, 10, 14, 8, 13.1
];

// Half Marathon weekly mileage (from official PDFs)
const HALF_BEGINNER_WEEKLY_MILEAGE = [
    10, 12, 17, 18, 21, 27, 31, 32, 36, 37,
    40, 42, 40, 42, 40, 42, 36, 31.1
];

const HALF_ADVANCED_WEEKLY_MILEAGE = [
    17, 33, 34, 36, 40, 44, 41, 46, 41, 47,
    45, 49, 47, 50, 48, 50, 44, 37.1
];

// Half Marathon tempo progressions (at HMP - Half Marathon Pace)
const HALF_BEGINNER_TEMPO_MILES: Record<number, number> = {
    6: 3, 7: 3, 8: 3,
    9: 4, 10: 4,
    11: 4, 12: 4, 13: 5, 14: 5,
    15: 5, 16: 5, 17: 4,
};

const HALF_ADVANCED_TEMPO_MILES: Record<number, number> = {
    2: 3, 3: 3, 4: 3,
    5: 4, 6: 4, 7: 4,
    8: 5, 9: 5, 10: 5,
    11: 6, 12: 6, 13: 6, 14: 7,
    15: 7, 16: 7, 17: 5,
};

// =============================================================================
// MICROCYCLE TEMPLATES
// =============================================================================

const HANSONS_BASE_MICROCYCLE: HansonsMicrocycle = {
    mon: { type: 'rest', notes: 'or cross-train' },
    tue: { type: 'easy_run', distanceRange: [2, 6] },
    wed: { type: 'rest', notes: 'or cross-train' },
    thu: { type: 'easy_run', distanceRange: [3, 6] },
    fri: { type: 'easy_run', distanceRange: [3, 5] },
    sat: { type: 'easy_run', distanceRange: [3, 8] },
    sun: { type: 'long_run' },
};

const HANSONS_SOS_MICROCYCLE: HansonsMicrocycle = {
    mon: { type: 'easy_run', distanceRange: [4, 8] },
    tue: { type: 'speed_intervals', notes: 'Speed (weeks 6-10) or Strength (weeks 11+)' },
    wed: { type: 'rest', notes: 'or cross-train' },
    thu: { type: 'tempo', notes: 'Marathon pace' },
    fri: { type: 'easy_run', distanceRange: [4, 7] },
    sat: { type: 'easy_run', distanceRange: [5, 10] },
    sun: { type: 'long_run' },
};

const HANSONS_TAPER_MICROCYCLE: HansonsMicrocycle = {
    mon: { type: 'easy_run', distanceRange: [5, 8] },
    tue: { type: 'strength_intervals', notes: 'Reduced volume' },
    wed: { type: 'rest' },
    thu: { type: 'easy_run', distanceRange: [5, 6] },
    fri: { type: 'easy_run', distanceRange: [5, 6] },
    sat: { type: 'easy_run', distanceRange: [3, 3] },
    sun: { type: 'long_run', notes: 'Race week: MARATHON' },
};

export const HANSONS_MICROCYCLES: Record<HansonsTier, Record<HansonsPhase, HansonsMicrocycle>> = {
    hansons_beginner: {
        base: HANSONS_BASE_MICROCYCLE,
        speed: HANSONS_SOS_MICROCYCLE,
        strength: HANSONS_SOS_MICROCYCLE,
        taper: HANSONS_TAPER_MICROCYCLE,
    },
    hansons_advanced: {
        base: HANSONS_BASE_MICROCYCLE,
        speed: HANSONS_SOS_MICROCYCLE,
        strength: HANSONS_SOS_MICROCYCLE,
        taper: HANSONS_TAPER_MICROCYCLE,
    },
    // Half marathon uses same structure but tempo is at HMP (Half Marathon Pace)
    hansons_half_beginner: {
        base: HANSONS_BASE_MICROCYCLE,
        speed: HANSONS_SOS_MICROCYCLE, // Same structure, tempo notes differ
        strength: HANSONS_SOS_MICROCYCLE,
        taper: { ...HANSONS_TAPER_MICROCYCLE, sun: { type: 'long_run', notes: 'Race week: HALF MARATHON' } },
    },
    hansons_half_advanced: {
        base: HANSONS_BASE_MICROCYCLE,
        speed: HANSONS_SOS_MICROCYCLE,
        strength: HANSONS_SOS_MICROCYCLE,
        taper: { ...HANSONS_TAPER_MICROCYCLE, sun: { type: 'long_run', notes: 'Race week: HALF MARATHON' } },
    },
};

// =============================================================================
// PHASE DETECTION
// =============================================================================

/**
 * Get the Hansons-specific training phase for a given week.
 */
export function getHansonsPhase(tier: HansonsTier, weekNumber: number): HansonsPhase {
    const config = HANSONS_TIER_CONFIGS[tier];
    if (config.phases.taper.includes(weekNumber)) return 'taper';
    if (config.phases.strength.includes(weekNumber)) return 'strength';
    if (config.phases.speed.includes(weekNumber)) return 'speed';
    return 'base';
}

/**
 * Map Hansons phase to generic TrainingPhase
 */
export function toTrainingPhase(hansonsPhase: HansonsPhase): TrainingPhase {
    switch (hansonsPhase) {
        case 'base': return 'base';
        case 'speed': return 'build';
        case 'strength': return 'peak';
        case 'taper': return 'taper';
    }
}

// =============================================================================
// WORKOUT GENERATORS
// =============================================================================

/**
 * Get the speed workout for a given week (5K-10K pace intervals).
 * Same workouts used for both marathon and half marathon.
 */
export function getHansonsSpeedWorkout(
    tier: HansonsTier,
    weekNumber: number
): HansonsSpeedWorkout | null {
    // Speed workouts use same 5K-10K intervals for both marathon and half
    // Beginner variants use beginner data, advanced variants use advanced data
    switch (tier) {
        case 'hansons_beginner':
        case 'hansons_half_beginner':
            return BEGINNER_SPEED_WORKOUTS[weekNumber] ?? null;
        case 'hansons_advanced':
        case 'hansons_half_advanced':
            return ADVANCED_SPEED_WORKOUTS[weekNumber] ?? null;
    }
}

/**
 * Get the strength workout for a given week.
 * Marathon uses MP-10s pace, Half Marathon uses 10K pace.
 */
export function getHansonsStrengthWorkout(
    tier: HansonsTier,
    weekNumber: number
): HansonsStrengthWorkout | null {
    switch (tier) {
        case 'hansons_beginner':
            return BEGINNER_STRENGTH_WORKOUTS[weekNumber] ?? null;
        case 'hansons_advanced':
            return ADVANCED_STRENGTH_WORKOUTS[weekNumber] ?? null;
        case 'hansons_half_beginner':
            return HALF_BEGINNER_STRENGTH_WORKOUTS[weekNumber] ?? null;
        case 'hansons_half_advanced':
            return HALF_ADVANCED_STRENGTH_WORKOUTS[weekNumber] ?? null;
    }
}

/**
 * Get the Tuesday SOS workout (Speed or Strength depending on phase).
 */
export function getHansonsTuesdayWorkout(
    tier: HansonsTier,
    weekNumber: number
): { type: 'speed'; workout: HansonsSpeedWorkout } | { type: 'strength'; workout: HansonsStrengthWorkout } | null {
    const phase = getHansonsPhase(tier, weekNumber);

    if (phase === 'speed') {
        const workout = getHansonsSpeedWorkout(tier, weekNumber);
        if (workout) return { type: 'speed', workout };
    }

    if (phase === 'strength' || phase === 'taper') {
        const workout = getHansonsStrengthWorkout(tier, weekNumber);
        if (workout) return { type: 'strength', workout };
    }

    return null;
}

/**
 * Get tempo run distance for a given week.
 */
export function getHansonsTempoMiles(tier: HansonsTier, weekNumber: number): number {
    switch (tier) {
        case 'hansons_beginner':
            return BEGINNER_TEMPO_MILES[weekNumber] ?? 0;
        case 'hansons_advanced':
            return ADVANCED_TEMPO_MILES[weekNumber] ?? 0;
        case 'hansons_half_beginner':
            return HALF_BEGINNER_TEMPO_MILES[weekNumber] ?? 0;
        case 'hansons_half_advanced':
            return HALF_ADVANCED_TEMPO_MILES[weekNumber] ?? 0;
    }
}

// =============================================================================
// LONG RUN PROGRESSION
// =============================================================================

/**
 * Generate the complete long run progression for a Hansons plan.
 */
export function generateHansonsLongRunProgression(tier: HansonsTier): number[] {
    switch (tier) {
        case 'hansons_beginner':
            return [...BEGINNER_LONG_RUNS];
        case 'hansons_advanced':
            return [...ADVANCED_LONG_RUNS];
        case 'hansons_half_beginner':
            return [...HALF_BEGINNER_LONG_RUNS];
        case 'hansons_half_advanced':
            return [...HALF_ADVANCED_LONG_RUNS];
    }
}

/**
 * Get long run distance for a specific week.
 */
export function getHansonsLongRunMiles(tier: HansonsTier, weekNumber: number): number {
    const progressionMap: Record<HansonsTier, number[]> = {
        hansons_beginner: BEGINNER_LONG_RUNS,
        hansons_advanced: ADVANCED_LONG_RUNS,
        hansons_half_beginner: HALF_BEGINNER_LONG_RUNS,
        hansons_half_advanced: HALF_ADVANCED_LONG_RUNS,
    };
    return progressionMap[tier][weekNumber - 1] ?? 0;
}

/**
 * Check if this is an alternating "short" long run week (10 miles).
 * Hansons uses a 16/10 alternating pattern after building to 16.
 */
export function isAlternatingShortLongRun(tier: HansonsTier, weekNumber: number): boolean {
    const longRun = getHansonsLongRunMiles(tier, weekNumber);
    const phase = getHansonsPhase(tier, weekNumber);
    return (phase === 'strength' || phase === 'speed') && longRun === 10;
}

// =============================================================================
// WEEKLY MILEAGE
// =============================================================================

/**
 * Get the prescribed weekly mileage for a given week.
 */
export function getHansonsWeeklyMileage(tier: HansonsTier, weekNumber: number): number {
    const mileageMap: Record<HansonsTier, number[]> = {
        hansons_beginner: BEGINNER_WEEKLY_MILEAGE,
        hansons_advanced: ADVANCED_WEEKLY_MILEAGE,
        hansons_half_beginner: HALF_BEGINNER_WEEKLY_MILEAGE,
        hansons_half_advanced: HALF_ADVANCED_WEEKLY_MILEAGE,
    };
    return mileageMap[tier][weekNumber - 1] ?? 0;
}

/**
 * Generate the complete weekly mileage progression.
 */
export function generateHansonsWeeklyMileageProgression(tier: HansonsTier): number[] {
    const mileageMap: Record<HansonsTier, number[]> = {
        hansons_beginner: BEGINNER_WEEKLY_MILEAGE,
        hansons_advanced: ADVANCED_WEEKLY_MILEAGE,
        hansons_half_beginner: HALF_BEGINNER_WEEKLY_MILEAGE,
        hansons_half_advanced: HALF_ADVANCED_WEEKLY_MILEAGE,
    };
    return [...mileageMap[tier]];
}

// =============================================================================
// MICROCYCLE ACCESS
// =============================================================================

/**
 * Get the microcycle template for a tier and phase.
 */
export function getHansonsMicrocycle(tier: HansonsTier, weekNumber: number): HansonsMicrocycle {
    const phase = getHansonsPhase(tier, weekNumber);
    return HANSONS_MICROCYCLES[tier][phase];
}

// =============================================================================
// TIER HELPERS
// =============================================================================

/**
 * Get all available Hansons tiers.
 */
export function getHansonsTiers(): HansonsTier[] {
    return Object.keys(HANSONS_TIER_CONFIGS) as HansonsTier[];
}

/**
 * Get tier configuration.
 */
export function getHansonsTierConfig(tier: HansonsTier): HansonsTierConfig {
    return HANSONS_TIER_CONFIGS[tier];
}

/**
 * Recommend a Hansons tier based on runner profile.
 */
export function recommendHansonsTier(
    weeklyMiles: number,
    runsPerWeek: number,
    experience: 'beginner' | 'intermediate' | 'advanced'
): HansonsTier {
    // Hansons Advanced requires significant base (35+ mpw, 5+ days)
    if (experience === 'advanced' && weeklyMiles >= 35 && runsPerWeek >= 5) {
        return 'hansons_advanced';
    }

    // Everyone else starts with Beginner
    return 'hansons_beginner';
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate that a Hansons plan meets key criteria.
 */
export function validateHansonsPlan(tier: HansonsTier): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    const config = HANSONS_TIER_CONFIGS[tier];

    // Check long run cap
    const longRuns = generateHansonsLongRunProgression(tier);
    const maxLongRun = Math.max(...longRuns.filter(d => d < 26));
    if (maxLongRun > 16) {
        errors.push(`Long run cap exceeded: ${maxLongRun} > 16`);
    }

    // Check plan duration
    if (config.durationWeeks !== 18) {
        errors.push(`Invalid duration: ${config.durationWeeks} !== 18`);
    }

    // Check phase coverage
    const allWeeks = [
        ...config.phases.base,
        ...config.phases.speed,
        ...config.phases.strength,
        ...config.phases.taper,
    ];
    for (let w = 1; w <= 18; w++) {
        if (!allWeeks.includes(w)) {
            errors.push(`Week ${w} not assigned to any phase`);
        }
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Format a speed workout for display.
 */
export function formatSpeedWorkout(workout: HansonsSpeedWorkout): string {
    return `${workout.reps}×${workout.distance} @ ${workout.pace} (${workout.recovery})`;
}

/**
 * Format a strength workout for display.
 */
export function formatStrengthWorkout(workout: HansonsStrengthWorkout): string {
    return `${workout.reps}×${workout.distance} @ ${workout.pace} (${workout.recovery})`;
}

// =============================================================================
// ELIGIBILITY CRITERIA
// Source: research/16-hansons-method.md + official PDFs
// =============================================================================

export interface CoachEligibility {
    distances: readonly string[];
    minDays: number;
    minMileage: number;
    tiers: Record<string, { mileageRange: [number, number]; startMileage: number }>;
}

/**
 * Hansons eligibility criteria.
 * 
 * Philosophy: Cumulative fatigue requires 6 days of running - this is core to the method.
 * The 16-mile long run cap only works because of consistent daily volume.
 */
export const HANSONS_ELIGIBILITY: CoachEligibility = {
    // Hansons supports Half (unofficially) and Marathon
    distances: ['half', 'marathon'] as const,

    // Core philosophy: Cumulative fatigue requires 6 days
    // Source: "Running on tired legs is the cornerstone of the Hansons Method"
    minDays: 6,

    // Beginner plan starts at 12 mpw but ramps quickly to 40 mpw by week 6
    // Need base of ~25-30 mpw to safely handle that ramp (10-15% rule)
    minMileage: 25,

    tiers: {
        beginner: {
            // Beginner plan: 12→57.5 mpw
            // Suitable for runners with 25-40 mpw base
            mileageRange: [25, 40],
            startMileage: 12,  // Week 1 mileage (research/22-hansons-complete-library.md)
        },
        advanced: {
            // Advanced plan: 38→61.5 mpw
            // Requires 35+ mpw base to safely start at 38
            mileageRange: [35, Infinity],
            startMileage: 38,  // Week 1 mileage (research/22-hansons-complete-library.md)
        },
    },
};

// =============================================================================
// COACHING EXPLANATIONS (Hansons Voice)
// =============================================================================

export interface HansonsWorkoutExplanation {
    title: string;
    description: string;
    why: string;
    feel: string;
    coachTip?: string;
}

/**
 * Coaching explanations in the Hansons voice.
 * Use these to populate workout detail pages and methodology sections.
 */
export const HANSONS_COACHING_EXPLANATIONS: Record<HansonsDayType, HansonsWorkoutExplanation> = {
    easy_run: {
        title: 'Easy Run',
        description: 'Run at a conversational pace. If you can\'t hold a conversation, slow down.',
        why: 'Easy runs build your aerobic base without accumulating stress. They allow you to recover from SOS days while still adding beneficial volume.',
        feel: 'Relaxed, conversational. You should be able to chat without gasping.',
        coachTip: 'The most common mistake is running easy days too fast. This steals energy from your SOS days. Easy means easy.',
    },
    long_run: {
        title: 'Long Run',
        description: 'Your 16-miler on tired legs is harder than a 20-miler on fresh legs. That\'s the point.',
        why: 'Long runs teach your body to burn fat, build time on feet, and simulate race conditions. Because you\'re running on yesterday\'s miles, the last 10 miles of your 16-miler feel like the last 10 miles of a marathon.',
        feel: 'Controlled, patient. 30-90 seconds per mile slower than marathon pace.',
        coachTip: 'Don\'t obsess over the 20-miler. Research shows aerobic adaptations diminish significantly after ~2.5 hours. Our 16-miler on fatigued legs is physiologically equivalent.',
    },
    tempo: {
        title: 'Tempo Run',
        description: 'Thursday tempo runs are the heart of this program. You\'re practicing exactly race pace.',
        why: 'Tempo runs teach your body to sustain goal marathon pace under fatigue. You\'re building the metabolic and mental pathways to hold pace when everything wants you to slow down.',
        feel: 'Challenging but sustainable. This is race pace, not harder, not easier.',
        coachTip: 'Tempo progression builds from 5 miles to 10 miles at goal pace. By the end of the plan, you\'ll have done multiple 10-mile tempo runs. That confidence is priceless on race day.',
    },
    speed_intervals: {
        title: 'Speed Intervals',
        description: 'Short, sharp intervals at 5K-10K pace with jog recovery.',
        why: 'Speed work develops your VO2max, running economy, and ability to clear lactate. It makes race pace feel easier by training at harder intensities.',
        feel: 'Hard but controlled. These should feel fast but not all-out.',
        coachTip: 'The pace is between your current 5K and 10K race pace. Recovery jogs (not rest) maintain the aerobic training effect.',
    },
    strength_intervals: {
        title: 'Strength Intervals',
        description: 'Longer repeats at marathon pace minus 10 seconds per mile.',
        why: 'Strength workouts are marathon-specific. We\'re building the "muscle memory" to hold pace when everything in your body wants to slow down. Tempo + Strength + Long Run = the marathon simulation trifecta.',
        feel: 'Strong, sustainable effort. Slightly faster than marathon pace but you could hold it for a long time if needed.',
        coachTip: 'MP-10s means 10 seconds per mile faster than your goal marathon pace. This teaches your body that marathon pace is actually "easy" by comparison.',
    },
    rest: {
        title: 'Rest Day',
        description: 'One day per week, you don\'t run. But you still move.',
        why: 'Rest allows muscular repair and mental recovery. But complete inactivity isn\'t better than active recovery.',
        feel: 'Refreshed, recovered. Use this day to stay loose without impact.',
        coachTip: 'Swimming, cycling, elliptical, yoga - anything that gives your legs a break while keeping blood flowing. We put the rest day midweek, not adjacent to the long run.',
    },
    cross_train: {
        title: 'Cross-Training',
        description: 'Non-impact aerobic activity for 30-60 minutes.',
        why: 'Cross-training maintains aerobic fitness while giving your running muscles a break. It\'s active recovery that keeps you ready for tomorrow.',
        feel: 'Easy, flowy. Heart rate up but not stressful.',
        coachTip: 'Swimming, cycling, elliptical are best. Avoid sports with sudden direction changes.',
    },
};

/**
 * Phase-specific coaching explanations.
 */
export const HANSONS_PHASE_EXPLANATIONS: Record<HansonsPhase, { title: string; description: string; focus: string }> = {
    base: {
        title: 'Base Phase',
        description: 'Building your foundation with easy miles.',
        focus: 'Establish consistent running habit. All easy running, no quality sessions yet. We\'re preparing your body for what\'s coming.',
    },
    speed: {
        title: 'Speed Phase',
        description: 'Developing VO2max and leg turnover.',
        focus: 'Tuesday intervals at 5K-10K pace. Long runs begin building. We\'re teaching your body to run fast before we teach it to run long.',
    },
    strength: {
        title: 'Strength Phase',
        description: 'Marathon-specific conditioning.',
        focus: 'Tuesday intervals shift to MP-10s (strength). Tempo runs lengthen toward 10 miles. Long runs peak at 16 miles on alternating weeks. This is where the marathon is won.',
    },
    taper: {
        title: 'Taper Phase',
        description: 'Sharpening for race day.',
        focus: 'Volume drops but intensity stays. We maintain sharpness while allowing full recovery. Trust the hay is in the barn.',
    },
};

/**
 * The "Why 16?" explanation - a core Hansons philosophy concept.
 */
export const HANSONS_WHY_16_EXPLANATION = {
    title: 'Why We Cap Long Runs at 16 Miles',
    summary: 'A 16-mile run as part of an overall program that accumulates fatigue is physiologically equivalent to - or better than - a 20-mile run done by a runner who rests before and after it.',
    details: [
        'Research shows aerobic adaptations diminish significantly after ~2.5-3 hours',
        'Running 16 miles in the Hansons system happens on fatigued legs',
        'The last 10 miles of your 16-miler feel like the last 10 miles of a marathon',
        'Injury risk increases dramatically beyond 16 miles',
        'You preserve energy for consistent quality throughout the week, not just one "big" workout',
    ],
    source: 'Luke Humphrey, "Hansons Marathon Method"',
};
