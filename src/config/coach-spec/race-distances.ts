/**
 * Race Distance Configuration
 * 
 * Defines training parameters that vary by goal race distance
 * Based on CoachSpec sections 6 and 7
 */

import type { RaceDistance } from '@/domain/types/athlete';
import type { TrainingPhase } from '@/domain/types/plan';

export interface RaceDistanceConfig {
    distance: RaceDistance;
    distanceMeters: number;

    // Quality session emphasis (weights sum to 1.0)
    qualityWeights: {
        vo2max: number;      // I-pace intervals
        threshold: number;   // T-pace tempo runs
        marathon: number;    // M-pace work
        speed: number;       // R-pace reps
    };

    // Long run configuration
    longRun: {
        maxMiles: number;
        maxMinutes: number;
        percentOfWeeklyMileage: number;
        marathonPaceBlocksAllowed: boolean;
        backToBackAllowed: boolean;
    };

    // Weekly quality session count
    qualitySessionsPerWeek: number;

    // Taper configuration
    taper: {
        durationDays: number;
        volumeReductionPercent: number;
        lastLongRunDaysBefore: number;
        lastHardWorkoutDaysBefore: number;
        lastStrengthDaysBefore: number;
    };

    // Phase durations (weeks)
    phaseDurations: Record<TrainingPhase, number>;
}

/**
 * Race distance configurations
 */
export const RACE_DISTANCE_CONFIGS: Record<RaceDistance, RaceDistanceConfig> = {
    '5k': {
        distance: '5k',
        distanceMeters: 5000,
        qualityWeights: {
            vo2max: 0.50,
            threshold: 0.25,
            marathon: 0.05,
            speed: 0.20,
        },
        longRun: {
            maxMiles: 12,
            maxMinutes: 90,
            percentOfWeeklyMileage: 25,
            marathonPaceBlocksAllowed: false,
            backToBackAllowed: false,
        },
        qualitySessionsPerWeek: 3,
        taper: {
            durationDays: 7,
            volumeReductionPercent: 40,
            lastLongRunDaysBefore: 7,
            lastHardWorkoutDaysBefore: 4,
            lastStrengthDaysBefore: 5,
        },
        phaseDurations: {
            BASE_1: 2,
            BASE_2: 2,
            BUILD: 3,
            PEAK: 2,
            TAPER: 1,
            RECOVERY: 1,
        },
    },

    '10k': {
        distance: '10k',
        distanceMeters: 10000,
        qualityWeights: {
            vo2max: 0.40,
            threshold: 0.35,
            marathon: 0.10,
            speed: 0.15,
        },
        longRun: {
            maxMiles: 14,
            maxMinutes: 100,
            percentOfWeeklyMileage: 25,
            marathonPaceBlocksAllowed: false,
            backToBackAllowed: false,
        },
        qualitySessionsPerWeek: 3,
        taper: {
            durationDays: 10,
            volumeReductionPercent: 40,
            lastLongRunDaysBefore: 10,
            lastHardWorkoutDaysBefore: 5,
            lastStrengthDaysBefore: 7,
        },
        phaseDurations: {
            BASE_1: 2,
            BASE_2: 3,
            BUILD: 4,
            PEAK: 2,
            TAPER: 1,
            RECOVERY: 1,
        },
    },

    'half': {
        distance: 'half',
        distanceMeters: 21097.5,
        qualityWeights: {
            vo2max: 0.25,
            threshold: 0.45,
            marathon: 0.20,
            speed: 0.10,
        },
        longRun: {
            maxMiles: 15,
            maxMinutes: 135,
            percentOfWeeklyMileage: 28,
            marathonPaceBlocksAllowed: true,
            backToBackAllowed: false,
        },
        qualitySessionsPerWeek: 3,
        taper: {
            durationDays: 10,
            volumeReductionPercent: 35,
            lastLongRunDaysBefore: 14,
            lastHardWorkoutDaysBefore: 5,
            lastStrengthDaysBefore: 7,
        },
        phaseDurations: {
            BASE_1: 3,
            BASE_2: 3,
            BUILD: 4,
            PEAK: 2,
            TAPER: 2,
            RECOVERY: 1,
        },
    },

    'marathon': {
        distance: 'marathon',
        distanceMeters: 42195,
        qualityWeights: {
            vo2max: 0.15,
            threshold: 0.40,
            marathon: 0.40,
            speed: 0.05,
        },
        longRun: {
            maxMiles: 16,           // Hansons cap
            maxMinutes: 180,
            percentOfWeeklyMileage: 30,
            marathonPaceBlocksAllowed: true,
            backToBackAllowed: false,
        },
        qualitySessionsPerWeek: 3,
        taper: {
            durationDays: 14,
            volumeReductionPercent: 40,
            lastLongRunDaysBefore: 21,
            lastHardWorkoutDaysBefore: 7,
            lastStrengthDaysBefore: 10,
        },
        phaseDurations: {
            BASE_1: 4,
            BASE_2: 4,
            BUILD: 4,
            PEAK: 2,
            TAPER: 2,
            RECOVERY: 2,
        },
    },

    'ultra_50k': {
        distance: 'ultra_50k',
        distanceMeters: 50000,
        qualityWeights: {
            vo2max: 0.10,
            threshold: 0.30,
            marathon: 0.45,
            speed: 0.15,
        },
        longRun: {
            maxMiles: 22,
            maxMinutes: 240,
            percentOfWeeklyMileage: 30,
            marathonPaceBlocksAllowed: true,
            backToBackAllowed: true,
        },
        qualitySessionsPerWeek: 2,
        taper: {
            durationDays: 14,
            volumeReductionPercent: 45,
            lastLongRunDaysBefore: 21,
            lastHardWorkoutDaysBefore: 10,
            lastStrengthDaysBefore: 10,
        },
        phaseDurations: {
            BASE_1: 4,
            BASE_2: 4,
            BUILD: 6,
            PEAK: 2,
            TAPER: 2,
            RECOVERY: 2,
        },
    },

    'ultra_50m': {
        distance: 'ultra_50m',
        distanceMeters: 80467.2,
        qualityWeights: {
            vo2max: 0.05,
            threshold: 0.25,
            marathon: 0.50,
            speed: 0.20,
        },
        longRun: {
            maxMiles: 30,
            maxMinutes: 300,
            percentOfWeeklyMileage: 28,
            marathonPaceBlocksAllowed: true,
            backToBackAllowed: true,
        },
        qualitySessionsPerWeek: 2,
        taper: {
            durationDays: 14,
            volumeReductionPercent: 50,
            lastLongRunDaysBefore: 21,
            lastHardWorkoutDaysBefore: 10,
            lastStrengthDaysBefore: 10,
        },
        phaseDurations: {
            BASE_1: 4,
            BASE_2: 6,
            BUILD: 6,
            PEAK: 2,
            TAPER: 2,
            RECOVERY: 2,
        },
    },

    'ultra_100k': {
        distance: 'ultra_100k',
        distanceMeters: 100000,
        qualityWeights: {
            vo2max: 0.05,
            threshold: 0.20,
            marathon: 0.50,
            speed: 0.25,
        },
        longRun: {
            maxMiles: 35,
            maxMinutes: 360,
            percentOfWeeklyMileage: 25,
            marathonPaceBlocksAllowed: true,
            backToBackAllowed: true,
        },
        qualitySessionsPerWeek: 2,
        taper: {
            durationDays: 21,
            volumeReductionPercent: 55,
            lastLongRunDaysBefore: 28,
            lastHardWorkoutDaysBefore: 14,
            lastStrengthDaysBefore: 14,
        },
        phaseDurations: {
            BASE_1: 6,
            BASE_2: 6,
            BUILD: 8,
            PEAK: 2,
            TAPER: 3,
            RECOVERY: 2,
        },
    },

    'ultra_100m': {
        distance: 'ultra_100m',
        distanceMeters: 160934.4,
        qualityWeights: {
            vo2max: 0.05,
            threshold: 0.15,
            marathon: 0.50,
            speed: 0.30,
        },
        longRun: {
            maxMiles: 40,
            maxMinutes: 420,
            percentOfWeeklyMileage: 22,
            marathonPaceBlocksAllowed: true,
            backToBackAllowed: true,
        },
        qualitySessionsPerWeek: 2,
        taper: {
            durationDays: 21,
            volumeReductionPercent: 60,
            lastLongRunDaysBefore: 28,
            lastHardWorkoutDaysBefore: 14,
            lastStrengthDaysBefore: 14,
        },
        phaseDurations: {
            BASE_1: 8,
            BASE_2: 8,
            BUILD: 8,
            PEAK: 2,
            TAPER: 3,
            RECOVERY: 3,
        },
    },
};

/**
 * Get config for a race distance
 */
export function getRaceDistanceConfig(distance: RaceDistance): RaceDistanceConfig {
    return RACE_DISTANCE_CONFIGS[distance];
}
