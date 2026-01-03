/**
 * Quality Session Builders
 * 
 * Pure functions for building interval, tempo, and long run sessions
 * Based on Daniels' VDOT pacing and CoachSpec session structures
 */

import type { PaceZones, RunPrescription, IntervalSet, RunBlock } from '../types/session';
import type { RaceDistance } from '../types/athlete';

/**
 * Build an interval session (I-pace work)
 * 
 * @param vdot - Athlete's current VDOT
 * @param paceZones - Pre-calculated pace zones
 * @param totalQualityMinutes - Target time at I-pace (typically 8-10% of weekly volume)
 * @param intervalLengthM - Length of each interval (400, 800, 1000, 1200, etc.)
 */
export function buildIntervalSession(
    paceZones: PaceZones,
    totalQualityMinutes: number,
    intervalLengthM: number = 1000
): RunPrescription {
    // Calculate reps based on target quality time
    const pacePerM = paceZones.I.secPerMile / 1609.34;
    const intervalTimeSeconds = pacePerM * intervalLengthM;
    const intervalTimeMinutes = intervalTimeSeconds / 60;

    const reps = Math.round(totalQualityMinutes / intervalTimeMinutes);

    // Recovery is typically equal distance for I-pace work
    const recoveryM = intervalLengthM <= 600 ? 200 : Math.round(intervalLengthM * 0.5);

    const mainSet: IntervalSet[] = [{
        reps,
        workDistanceM: intervalLengthM,
        workPaceZone: 'I',
        recoveryDistanceM: recoveryM,
        recoveryType: 'jog',
    }];

    // Standard warmup/cooldown
    const warmup: RunBlock = {
        distanceMiles: 1.5,
        paceZone: 'E',
        description: 'Easy warmup with strides',
    };

    const cooldown: RunBlock = {
        distanceMiles: 1.0,
        paceZone: 'E',
        description: 'Easy cooldown',
    };

    // Calculate total distance
    const mainSetDistanceMiles = (reps * intervalLengthM + reps * recoveryM) / 1609.34;
    const totalDistanceMiles = warmup.distanceMiles! + mainSetDistanceMiles + cooldown.distanceMiles!;

    // Estimate duration
    const warmupMin = warmup.distanceMiles! * (paceZones.E.maxSecPerMile / 60);
    const workMin = reps * intervalTimeMinutes;
    const restMin = reps * (recoveryM / 1609.34) * (paceZones.E.maxSecPerMile / 60);
    const cooldownMin = cooldown.distanceMiles! * (paceZones.E.maxSecPerMile / 60);
    const estimatedDurationMin = Math.round(warmupMin + workMin + restMin + cooldownMin);

    return {
        type: 'intervals',
        warmup,
        mainSet,
        cooldown,
        totalDistanceMiles: Math.round(totalDistanceMiles * 10) / 10,
        estimatedDurationMin,
        notes: `${reps}×${intervalLengthM}m @ I-pace with ${recoveryM}m jog recovery`,
    };
}

/**
 * Build a tempo session (T-pace work)
 * 
 * @param paceZones - Pre-calculated pace zones
 * @param tempoDistanceMiles - Continuous tempo distance (or total if cruise intervals)
 * @param variant - 'continuous' for traditional tempo, 'cruise' for cruise intervals
 */
export function buildTempoSession(
    paceZones: PaceZones,
    tempoDistanceMiles: number,
    variant: 'continuous' | 'cruise' = 'continuous'
): RunPrescription {
    const warmup: RunBlock = {
        distanceMiles: 2.0,
        paceZone: 'E',
        description: 'Easy warmup',
    };

    const cooldown: RunBlock = {
        distanceMiles: 1.0,
        paceZone: 'E',
        description: 'Easy cooldown',
    };

    let mainSet: RunBlock[] | IntervalSet[];
    let notes: string;

    if (variant === 'continuous') {
        mainSet = [{
            distanceMiles: tempoDistanceMiles,
            paceZone: 'T',
            description: 'Continuous tempo',
        }];
        notes = `${tempoDistanceMiles} mi continuous @ T-pace`;
    } else {
        // Cruise intervals: 1-mile reps with short recovery
        const reps = Math.round(tempoDistanceMiles);
        mainSet = [{
            reps,
            workDistanceM: 1609,
            workPaceZone: 'T',
            recoveryDistanceM: 400,
            recoveryType: 'jog',
        }];
        notes = `${reps}×1mi @ T-pace with 400m jog recovery (cruise intervals)`;
    }

    const totalDistanceMiles = warmup.distanceMiles! + tempoDistanceMiles + cooldown.distanceMiles!;

    // Estimate duration
    const warmupMin = warmup.distanceMiles! * (paceZones.E.maxSecPerMile / 60);
    const tempoMin = tempoDistanceMiles * (paceZones.T.secPerMile / 60);
    const cooldownMin = cooldown.distanceMiles! * (paceZones.E.maxSecPerMile / 60);
    const estimatedDurationMin = Math.round(warmupMin + tempoMin + cooldownMin);

    return {
        type: 'tempo',
        warmup,
        mainSet,
        cooldown,
        totalDistanceMiles: Math.round(totalDistanceMiles * 10) / 10,
        estimatedDurationMin,
        notes,
    };
}

/**
 * Build a long run session
 * 
 * @param paceZones - Pre-calculated pace zones
 * @param distanceMiles - Long run distance
 * @param includeMarathonPace - Whether to include M-pace blocks
 * @param marathonPaceMiles - Miles at M-pace (if included)
 */
export function buildLongRunSession(
    paceZones: PaceZones,
    distanceMiles: number,
    includeMarathonPace: boolean = false,
    marathonPaceMiles: number = 0
): RunPrescription {
    const mainSet: RunBlock[] = [];

    if (includeMarathonPace && marathonPaceMiles > 0) {
        // Split long run: easy → M-pace → easy
        const warmupMiles = Math.max(2, Math.round((distanceMiles - marathonPaceMiles) * 0.4));
        const cooldownMiles = distanceMiles - warmupMiles - marathonPaceMiles;

        mainSet.push({
            distanceMiles: warmupMiles,
            paceZone: 'E',
            description: 'Easy warmup',
        });

        mainSet.push({
            distanceMiles: marathonPaceMiles,
            paceZone: 'M',
            description: 'Marathon pace block',
        });

        mainSet.push({
            distanceMiles: cooldownMiles,
            paceZone: 'E',
            description: 'Easy finish',
        });
    } else {
        // Pure easy long run
        mainSet.push({
            distanceMiles,
            paceZone: 'E',
            description: 'Easy long run',
        });
    }

    // Estimate duration using easy pace
    const easyPaceMin = paceZones.E.maxSecPerMile / 60;
    const mPaceMin = paceZones.M.secPerMile / 60;

    let estimatedDurationMin: number;
    if (includeMarathonPace && marathonPaceMiles > 0) {
        const easyMiles = distanceMiles - marathonPaceMiles;
        estimatedDurationMin = Math.round(easyMiles * easyPaceMin + marathonPaceMiles * mPaceMin);
    } else {
        estimatedDurationMin = Math.round(distanceMiles * easyPaceMin);
    }

    return {
        type: 'long_run',
        mainSet,
        totalDistanceMiles: distanceMiles,
        estimatedDurationMin,
        notes: includeMarathonPace
            ? `Long run with ${marathonPaceMiles} mi @ M-pace`
            : 'Easy long run',
    };
}

/**
 * Build a speed/repetition session (R-pace work)
 * 
 * @param paceZones - Pre-calculated pace zones
 * @param reps - Number of repetitions
 * @param repDistanceM - Distance of each rep (200, 300, 400)
 */
export function buildSpeedSession(
    paceZones: PaceZones,
    reps: number,
    repDistanceM: number = 400
): RunPrescription {
    const warmup: RunBlock = {
        distanceMiles: 2.0,
        paceZone: 'E',
        description: 'Easy warmup with drills and strides',
    };

    const cooldown: RunBlock = {
        distanceMiles: 1.0,
        paceZone: 'E',
        description: 'Easy cooldown',
    };

    // R-pace recovery is typically 2-3x the rep time (full recovery)
    const recoveryM = repDistanceM * 2;

    const mainSet: IntervalSet[] = [{
        reps,
        workDistanceM: repDistanceM,
        workPaceZone: 'R',
        recoveryDistanceM: recoveryM,
        recoveryType: 'jog',
    }];

    const mainSetDistanceMiles = (reps * repDistanceM + reps * recoveryM) / 1609.34;
    const totalDistanceMiles = warmup.distanceMiles! + mainSetDistanceMiles + cooldown.distanceMiles!;

    const pacePerM = paceZones.R.secPerMile / 1609.34;
    const workMin = (reps * repDistanceM * pacePerM) / 60;
    const restMin = reps * 1.5; // ~1.5 min recovery per rep
    const warmupMin = warmup.distanceMiles! * (paceZones.E.maxSecPerMile / 60);
    const cooldownMin = cooldown.distanceMiles! * (paceZones.E.maxSecPerMile / 60);
    const estimatedDurationMin = Math.round(warmupMin + workMin + restMin + cooldownMin);

    return {
        type: 'intervals',
        warmup,
        mainSet,
        cooldown,
        totalDistanceMiles: Math.round(totalDistanceMiles * 10) / 10,
        estimatedDurationMin,
        notes: `${reps}×${repDistanceM}m @ R-pace with full recovery`,
    };
}

/**
 * Build an easy run session
 */
export function buildEasyRun(
    paceZones: PaceZones,
    distanceMiles: number
): RunPrescription {
    const estimatedDurationMin = Math.round(distanceMiles * (paceZones.E.maxSecPerMile / 60));

    return {
        type: 'easy',
        mainSet: [{
            distanceMiles,
            paceZone: 'E',
            description: 'Easy run',
        }],
        totalDistanceMiles: distanceMiles,
        estimatedDurationMin,
        notes: 'Easy aerobic run',
    };
}

/**
 * Calculate weekly quality minutes based on mileage and phase
 * Daniels recommends I-pace work be 8-10% of weekly mileage in time
 */
export function calculateQualityMinutes(weeklyMileage: number, easyPaceSecPerMile: number): {
    intervalMinutes: number;
    tempoMinutes: number;
} {
    const weeklyMinutes = weeklyMileage * (easyPaceSecPerMile / 60);

    return {
        intervalMinutes: Math.round(weeklyMinutes * 0.08), // 8% at I-pace
        tempoMinutes: Math.round(weeklyMinutes * 0.10),    // 10% at T-pace
    };
}
