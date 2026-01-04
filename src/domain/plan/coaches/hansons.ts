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

export type HansonsTier = 'hansons_beginner' | 'hansons_advanced';

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
    longRunCap: 16;
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
 */
export function getHansonsSpeedWorkout(
    tier: HansonsTier,
    weekNumber: number
): HansonsSpeedWorkout | null {
    const workouts = tier === 'hansons_beginner'
        ? BEGINNER_SPEED_WORKOUTS
        : ADVANCED_SPEED_WORKOUTS;
    return workouts[weekNumber] ?? null;
}

/**
 * Get the strength workout for a given week (MP-10s intervals).
 */
export function getHansonsStrengthWorkout(
    tier: HansonsTier,
    weekNumber: number
): HansonsStrengthWorkout | null {
    const workouts = tier === 'hansons_beginner'
        ? BEGINNER_STRENGTH_WORKOUTS
        : ADVANCED_STRENGTH_WORKOUTS;
    return workouts[weekNumber] ?? null;
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
    const tempos = tier === 'hansons_beginner' ? BEGINNER_TEMPO_MILES : ADVANCED_TEMPO_MILES;
    return tempos[weekNumber] ?? 0;
}

// =============================================================================
// LONG RUN PROGRESSION
// =============================================================================

/**
 * Generate the complete long run progression for a Hansons plan.
 */
export function generateHansonsLongRunProgression(tier: HansonsTier): number[] {
    return tier === 'hansons_beginner' ? [...BEGINNER_LONG_RUNS] : [...ADVANCED_LONG_RUNS];
}

/**
 * Get long run distance for a specific week.
 */
export function getHansonsLongRunMiles(tier: HansonsTier, weekNumber: number): number {
    const progression = tier === 'hansons_beginner' ? BEGINNER_LONG_RUNS : ADVANCED_LONG_RUNS;
    return progression[weekNumber - 1] ?? 0;
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
    const mileage = tier === 'hansons_beginner' ? BEGINNER_WEEKLY_MILEAGE : ADVANCED_WEEKLY_MILEAGE;
    return mileage[weekNumber - 1] ?? 0;
}

/**
 * Generate the complete weekly mileage progression.
 */
export function generateHansonsWeeklyMileageProgression(tier: HansonsTier): number[] {
    return tier === 'hansons_beginner' ? [...BEGINNER_WEEKLY_MILEAGE] : [...ADVANCED_WEEKLY_MILEAGE];
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
