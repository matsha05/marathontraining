/**
 * THE LONG GAME - Ultra Training Engine
 * 
 * Implements ultra-specific training logic for 50K to 100M races.
 * Key differences from marathon: time-based volume, B2B weekends,
 * vertical training, fueling progression, night running.
 * 
 * Source: Oracle Research (15-ultra-training-master.md)
 */

import { TrainingPhase, UltraDistance, Terrain } from './types';

// =============================================================================
// ULTRA CONFIGURATION CONSTANTS
// =============================================================================

/**
 * Long run caps (hours) by race distance and terrain.
 * Ultra training is time-based, not distance-based.
 */
export const LONG_RUN_CAPS_HOURS: Record<UltraDistance, Record<Terrain, [number, number]>> = {
    ultra_50k: {
        road: [2.5, 3.5],
        trail: [3.0, 4.0],
        mountain: [3.0, 4.0],
    },
    ultra_50m: {
        road: [3.0, 4.0],
        trail: [4.0, 5.0],
        mountain: [4.0, 5.5],
    },
    ultra_100k: {
        road: [3.5, 4.5],
        trail: [4.0, 5.5],
        mountain: [4.5, 6.0],
    },
    ultra_100m: {
        road: [4.0, 5.5],
        trail: [5.0, 6.0],
        mountain: [5.0, 7.0],
    },
};

/**
 * Weekend total caps for B2B weeks (hours).
 */
export const WEEKEND_TOTAL_CAPS_HOURS: Record<UltraDistance, [number, number]> = {
    ultra_50k: [4.0, 6.0],
    ultra_50m: [6.0, 8.0],
    ultra_100k: [7.0, 10.0],
    ultra_100m: [8.0, 12.0],
};

/**
 * Percent of weekly time that can go to weekend.
 */
export const WEEKEND_PERCENT_OF_WEEKLY_MAX: Record<UltraDistance, number> = {
    ultra_50k: 0.50,
    ultra_50m: 0.55,
    ultra_100k: 0.55,
    ultra_100m: 0.60,
};

/**
 * Percent of weekly time that can go to a single long run.
 */
export const SINGLE_LONG_RUN_PERCENT_MAX: Record<UltraDistance, number> = {
    ultra_50k: 0.40,
    ultra_50m: 0.38,
    ultra_100k: 0.35,
    ultra_100m: 0.33,
};

// =============================================================================
// BACK-TO-BACK (B2B) LOGIC
// =============================================================================

export interface B2BConfig {
    enabled: boolean;
    day1Ratio: number; // Day 1 gets this fraction of weekend total
    day2Ratio: number; // Day 2 gets the rest
}

/**
 * Get B2B configuration for a given distance.
 */
export function getB2BConfig(distance: UltraDistance): B2BConfig {
    const configs: Record<UltraDistance, B2BConfig> = {
        ultra_50k: { enabled: false, day1Ratio: 0.65, day2Ratio: 0.35 }, // Optional
        ultra_50m: { enabled: true, day1Ratio: 0.60, day2Ratio: 0.40 },
        ultra_100k: { enabled: true, day1Ratio: 0.60, day2Ratio: 0.40 },
        ultra_100m: { enabled: true, day1Ratio: 0.55, day2Ratio: 0.45 },
    };
    return configs[distance];
}

/**
 * Get B2B frequency by phase.
 */
export function getB2BFrequency(
    distance: UltraDistance,
    phase: TrainingPhase
): 'every_week' | 'every_2_weeks' | 'every_3_weeks' | 'none' {
    if (distance === 'ultra_50k') return 'none';

    switch (phase) {
        case 'base':
            return 'every_3_weeks';
        case 'build':
            return 'every_2_weeks';
        case 'peak':
            return distance === 'ultra_100m' ? 'every_week' : 'every_2_weeks';
        case 'taper':
            return 'none';
        default:
            return 'every_3_weeks';
    }
}

/**
 * Check if athlete meets gates to introduce B2B.
 */
export function meetsB2BGates(
    distance: UltraDistance,
    currentLongRunMinutes: number,
    weeklyMinutes: number,
    injuryStatus: 'green' | 'amber' | 'red',
    amberFreeDays: number
): { allowed: boolean; reason?: string } {
    if (injuryStatus !== 'green') {
        return { allowed: false, reason: 'Injury status must be green to introduce B2B' };
    }

    if (amberFreeDays < 14) {
        return { allowed: false, reason: 'Need 14+ days without amber status' };
    }

    const minLongRunMinutes: Record<UltraDistance, number> = {
        ultra_50k: 135,
        ultra_50m: 150,
        ultra_100k: 165,
        ultra_100m: 180,
    };

    const minWeeklyMinutes: Record<UltraDistance, number> = {
        ultra_50k: 300,
        ultra_50m: 360,
        ultra_100k: 420,
        ultra_100m: 450,
    };

    if (currentLongRunMinutes < minLongRunMinutes[distance]) {
        return {
            allowed: false,
            reason: `Long run must be ${minLongRunMinutes[distance]}+ min before B2B`,
        };
    }

    if (weeklyMinutes < minWeeklyMinutes[distance]) {
        return {
            allowed: false,
            reason: `Weekly volume must be ${minWeeklyMinutes[distance]}+ min before B2B`,
        };
    }

    return { allowed: true };
}

/**
 * Calculate B2B weekend split.
 */
export function calculateB2BSplit(
    distance: UltraDistance,
    weekendTotalMinutes: number
): { day1Minutes: number; day2Minutes: number } {
    const config = getB2BConfig(distance);
    return {
        day1Minutes: Math.round(weekendTotalMinutes * config.day1Ratio),
        day2Minutes: Math.round(weekendTotalMinutes * config.day2Ratio),
    };
}

// =============================================================================
// VERTICAL TRAINING
// =============================================================================

/**
 * Get uphill minutes target by phase and distance.
 */
export function getUphillMinutesTarget(
    distance: UltraDistance,
    phase: TrainingPhase
): [number, number] {
    const targets: Record<UltraDistance, Record<TrainingPhase, [number, number]>> = {
        ultra_50k: {
            base: [20, 45],
            build: [40, 75],
            peak: [60, 120],
            taper: [15, 30],
        },
        ultra_50m: {
            base: [30, 60],
            build: [60, 120],
            peak: [90, 180],
            taper: [20, 40],
        },
        ultra_100k: {
            base: [40, 75],
            build: [75, 150],
            peak: [120, 240],
            taper: [25, 50],
        },
        ultra_100m: {
            base: [45, 90],
            build: [90, 180],
            peak: [150, 300],
            taper: [30, 60],
        },
    };

    return targets[distance][phase];
}

/**
 * Get weekly vertical gain target (feet) by distance.
 */
export function getWeeklyVertTarget(
    distance: UltraDistance,
    phase: TrainingPhase
): [number, number] {
    const peakTargets: Record<UltraDistance, [number, number]> = {
        ultra_50k: [4000, 8000],
        ultra_50m: [6000, 12000],
        ultra_100k: [8000, 16000],
        ultra_100m: [10000, 20000],
    };

    const phaseMultipliers: Record<TrainingPhase, number> = {
        base: 0.50,
        build: 0.75,
        peak: 1.00,
        taper: 0.40,
    };

    const [min, max] = peakTargets[distance];
    const multiplier = phaseMultipliers[phase];

    return [Math.round(min * multiplier), Math.round(max * multiplier)];
}

// =============================================================================
// FUELING PROGRESSION
// =============================================================================

export interface FuelingTarget {
    carbsPerHour: [number, number]; // g/hour range
    fluidMlPerHour: [number, number];
    sodiumMgPerHour: [number, number];
}

/**
 * Get fueling targets by phase.
 */
export function getFuelingTargets(phase: TrainingPhase): FuelingTarget {
    const targets: Record<TrainingPhase, FuelingTarget> = {
        base: {
            carbsPerHour: [30, 60],
            fluidMlPerHour: [400, 600],
            sodiumMgPerHour: [300, 500],
        },
        build: {
            carbsPerHour: [60, 75],
            fluidMlPerHour: [500, 700],
            sodiumMgPerHour: [400, 600],
        },
        peak: {
            carbsPerHour: [75, 90],
            fluidMlPerHour: [600, 800],
            sodiumMgPerHour: [500, 700],
        },
        taper: {
            carbsPerHour: [60, 75],
            fluidMlPerHour: [500, 700],
            sodiumMgPerHour: [400, 600],
        },
    };

    return targets[phase];
}

/**
 * Check if session requires fueling practice.
 */
export function requiresFuelingPractice(sessionMinutes: number): boolean {
    return sessionMinutes >= 90;
}

/**
 * Get gut training ramp (progressive carb increase).
 */
export function getGutTrainingRamp(currentWeek: number): {
    targetCarbsPerHour: number;
    notes: string;
} {
    // Start at 45g/hr and increase by 10g every 2 weeks
    const baseCarbs = 45;
    const increasePerPeriod = 10;
    const weeksPerPeriod = 2;

    const periods = Math.floor(currentWeek / weeksPerPeriod);
    const targetCarbs = Math.min(baseCarbs + periods * increasePerPeriod, 90);

    return {
        targetCarbsPerHour: targetCarbs,
        notes:
            targetCarbs < 60
                ? 'Building gut tolerance. Focus on consistency.'
                : targetCarbs < 75
                    ? 'Intermediate fueling. Test race nutrition.'
                    : 'Race-level fueling. Fine-tune specific products.',
    };
}

// =============================================================================
// NIGHT RUNNING (100K/100M only)
// =============================================================================

export interface NightTrainingConfig {
    enabled: boolean;
    totalSessions: [number, number];
    scheduleWeeksOut: [number, number]; // Range of weeks before race
    sessionDurationMinutes: [number, number];
}

/**
 * Get night training configuration.
 */
export function getNightTrainingConfig(distance: UltraDistance): NightTrainingConfig {
    if (distance === 'ultra_50k' || distance === 'ultra_50m') {
        return {
            enabled: false,
            totalSessions: [0, 0],
            scheduleWeeksOut: [0, 0],
            sessionDurationMinutes: [0, 0],
        };
    }

    const configs: Record<'ultra_100k' | 'ultra_100m', NightTrainingConfig> = {
        ultra_100k: {
            enabled: true,
            totalSessions: [1, 2],
            scheduleWeeksOut: [14, 4],
            sessionDurationMinutes: [45, 90],
        },
        ultra_100m: {
            enabled: true,
            totalSessions: [2, 4],
            scheduleWeeksOut: [14, 4],
            sessionDurationMinutes: [60, 120],
        },
    };

    return configs[distance];
}

// =============================================================================
// WALKING/POWER HIKING
// =============================================================================

export interface WalkingStrategy {
    enabled: boolean;
    powerHikeTriggerGradeDegrees: number;
    microWalkProtocol: string;
    structuredRunWalk: string;
}

/**
 * Get walking strategy for ultra distance.
 */
export function getWalkingStrategy(
    distance: UltraDistance,
    terrain: Terrain
): WalkingStrategy {
    if (distance === 'ultra_50k' && terrain === 'road') {
        return {
            enabled: false,
            powerHikeTriggerGradeDegrees: 20,
            microWalkProtocol: 'Not recommended for road 50K',
            structuredRunWalk: 'Not recommended for road 50K',
        };
    }

    const runWalkPatterns: Record<UltraDistance, string> = {
        ultra_50k: 'Run 30 / Walk 2 on climbs',
        ultra_50m: 'Run 25 / Walk 5',
        ultra_100k: 'Run 25 / Walk 5',
        ultra_100m: 'Run 20 / Walk 5 (early), Run 15 / Walk 5 (late)',
    };

    return {
        enabled: true,
        powerHikeTriggerGradeDegrees: 15,
        microWalkProtocol: '30-45 sec walk every 20-30 min for fueling',
        structuredRunWalk: runWalkPatterns[distance],
    };
}

// =============================================================================
// PHASE CONFIGURATION FOR ULTRA
// =============================================================================

/**
 * Get ultra-specific phase lengths (weeks).
 */
export function getUltraPhaseWeeks(distance: UltraDistance): {
    base: number;
    build: number;
    peak: number;
    taper: number;
    total: number;
} {
    const configs: Record<UltraDistance, { base: number; build: number; peak: number; taper: number }> = {
        ultra_50k: { base: 4, build: 6, peak: 4, taper: 2 },
        ultra_50m: { base: 5, build: 8, peak: 4, taper: 3 },
        ultra_100k: { base: 6, build: 10, peak: 5, taper: 3 },
        ultra_100m: { base: 8, build: 12, peak: 6, taper: 4 },
    };

    const config = configs[distance];
    return {
        ...config,
        total: config.base + config.build + config.peak + config.taper,
    };
}

// =============================================================================
// PROGRESSION GUARDRAILS
// =============================================================================

/**
 * Check if duration increase is safe.
 * Rule: No more than 10% increase OR 30 minutes, whichever is stricter.
 */
export function isDurationIncreaseAllowed(
    previousMinutes: number,
    proposedMinutes: number
): { allowed: boolean; reason?: string } {
    const percentIncrease = ((proposedMinutes - previousMinutes) / previousMinutes) * 100;
    const absoluteIncrease = proposedMinutes - previousMinutes;

    if (percentIncrease > 10 && absoluteIncrease > 30) {
        return {
            allowed: false,
            reason: `Increase of ${proposedMinutes - previousMinutes} min (${percentIncrease.toFixed(1)}%) exceeds both 10% and 30min limits`,
        };
    }

    return { allowed: true };
}
