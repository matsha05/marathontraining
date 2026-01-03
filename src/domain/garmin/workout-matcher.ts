/**
 * Match Garmin activities to planned workouts
 */

import type { PaceZone, PaceZones, PlannedWorkout, RunPrescription, SessionType } from '@/domain/types/session';
import type { GarminActivitySummary } from './types';

const METERS_PER_MILE = 1609.344;

export interface WorkoutMatchOptions {
    timeWindowHours?: number;
    distanceTolerance?: number;
    paceTolerancePct?: number;
    minMatchScore?: number;
}

export interface WorkoutMatchResult {
    plannedWorkoutId?: string;
    matchScore: number;
    completion?: number;
    distanceVariance?: number;
    paceVariance?: number;
    matched: boolean;
    reasons: string[];
}

export function matchGarminActivityToPlannedWorkouts(
    activity: GarminActivitySummary,
    plannedWorkouts: PlannedWorkout[],
    paceZones?: PaceZones,
    options: WorkoutMatchOptions = {}
): WorkoutMatchResult {
    const timeWindowHours = options.timeWindowHours ?? 36;
    const distanceTolerance = options.distanceTolerance ?? 0.2;
    const paceTolerancePct = options.paceTolerancePct ?? 0.06;
    const minMatchScore = options.minMatchScore ?? 0.6;

    if (!activity.startTime) {
        return { matchScore: 0, matched: false, reasons: ['Missing activity start time'] };
    }

    if (!activity.distanceMeters && !activity.durationSeconds) {
        return { matchScore: 0, matched: false, reasons: ['Missing activity distance and duration'] };
    }

    if (plannedWorkouts.length === 0) {
        return { matchScore: 0, matched: false, reasons: ['No planned workouts in range'] };
    }

    const activityDate = new Date(activity.startTime);
    const activityDistanceMiles = activity.distanceMeters ? activity.distanceMeters / METERS_PER_MILE : null;
    const activityPace = activity.avgPaceSecPerMile;
    const activityType = normalizeActivityType(activity.activityType);

    if (activityType === 'other') {
        return { matchScore: 0, matched: false, reasons: ['Non-run activity'] };
    }

    const candidates = plannedWorkouts.filter(workout => isRunWorkout(workout.sessionType));

    let best: WorkoutMatchResult = {
        matchScore: 0,
        matched: false,
        reasons: ['No candidates matched'],
    };

    let secondBestScore = 0;

    for (const workout of candidates) {
        const reasons: string[] = [];
        const targetDistanceMiles = workout.prescription.run?.totalDistanceMiles;

        const timeScore = activityDate
            ? scoreTimeDelta(activityDate, workout.scheduledDate, timeWindowHours)
            : 0.5;

        const distanceScore = targetDistanceMiles && activityDistanceMiles
            ? scoreDistance(activityDistanceMiles, targetDistanceMiles)
            : 0.5;

        const typeScore = scoreType(workout.sessionType, activityType);

        const targetPaceRange = paceZones && workout.prescription.run
            ? deriveTargetPaceRange(workout.prescription.run, paceZones, paceTolerancePct)
            : null;

        const paceScore = targetPaceRange && activityPace
            ? scorePace(activityPace, targetPaceRange)
            : 0.5;

        const weightedScore = weightedAverage(
            [distanceScore, paceScore, typeScore, timeScore],
            [0.4, 0.25, 0.2, 0.15],
            [
                Boolean(targetDistanceMiles && activityDistanceMiles),
                Boolean(targetPaceRange && activityPace),
                true,
                Boolean(activityDate),
            ]
        );

        const completion = targetDistanceMiles && activityDistanceMiles
            ? activityDistanceMiles / targetDistanceMiles
            : undefined;

        if (!targetDistanceMiles) {
            reasons.push('Missing target distance');
        }

        if (!activityDistanceMiles) {
            reasons.push('Missing activity distance');
        }

        const paceVariance = targetPaceRange && activityPace
            ? (activityPace - targetPaceRange.target) / targetPaceRange.target
            : undefined;

        const distanceVariance = targetDistanceMiles && activityDistanceMiles
            ? (activityDistanceMiles - targetDistanceMiles) / targetDistanceMiles
            : undefined;

        const matched = weightedScore >= minMatchScore
            && (completion === undefined || completion >= (1 - distanceTolerance));

        if (weightedScore > best.matchScore) {
            secondBestScore = best.matchScore;
            best = {
                plannedWorkoutId: workout.id,
                matchScore: round(weightedScore),
                completion,
                distanceVariance,
                paceVariance,
                matched,
                reasons,
            };
        } else if (weightedScore > secondBestScore) {
            secondBestScore = weightedScore;
        }
    }

    if (best.matched && Math.abs(best.matchScore - secondBestScore) < 0.05) {
        best.matched = false;
        best.reasons.push('Ambiguous match; confirm manually');
    }

    if (!best.matched && best.matchScore < minMatchScore) {
        best.reasons.push('Match score below threshold');
    }

    return best;
}

function isRunWorkout(sessionType: SessionType): boolean {
    return ['easy', 'tempo', 'intervals', 'long_run', 'recovery', 'progression'].includes(sessionType);
}

function normalizeActivityType(activityType?: string): 'run' | 'other' | 'unknown' {
    if (!activityType) return 'unknown';
    const normalized = activityType.toLowerCase();
    if (normalized.includes('run')) return 'run';
    if (normalized.includes('treadmill')) return 'run';
    return 'other';
}

function scoreTimeDelta(activityDate: Date, plannedDate: Date, windowHours: number): number {
    const deltaHours = Math.abs(activityDate.getTime() - plannedDate.getTime()) / (1000 * 60 * 60);
    if (deltaHours >= windowHours) return 0;
    return 1 - deltaHours / windowHours;
}

function scoreDistance(actualMiles: number, targetMiles: number): number {
    const variance = Math.abs(actualMiles - targetMiles) / targetMiles;
    return Math.max(0, 1 - variance);
}

function scoreType(sessionType: SessionType, activityType: 'run' | 'other' | 'unknown'): number {
    if (activityType === 'other') return 0.3;
    if (activityType === 'unknown') return 0.6;
    return isRunWorkout(sessionType) ? 1 : 0.3;
}

function deriveTargetPaceRange(run: RunPrescription, paceZones: PaceZones, tolerancePct: number) {
    const paceZone = primaryPaceZone(run);

    if (!paceZone) return null;

    if (paceZone === 'E') {
        return {
            min: paceZones.E.minSecPerMile,
            max: paceZones.E.maxSecPerMile,
            target: (paceZones.E.minSecPerMile + paceZones.E.maxSecPerMile) / 2,
        };
    }

    const base = paceZones[paceZone].secPerMile;
    return {
        min: base * (1 - tolerancePct),
        max: base * (1 + tolerancePct),
        target: base,
    };
}

function primaryPaceZone(run: RunPrescription): PaceZone | null {
    if (Array.isArray(run.mainSet) && run.mainSet.length > 0) {
        const first = run.mainSet[0] as { paceZone?: string; workPaceZone?: string };
        if (first.paceZone) return first.paceZone as 'E' | 'T' | 'I' | 'R' | 'M';
        if (first.workPaceZone) return first.workPaceZone as 'E' | 'T' | 'I' | 'R' | 'M';
    }

    switch (run.type) {
        case 'tempo':
            return 'T';
        case 'intervals':
            return 'I';
        case 'long_run':
            return 'E';
        case 'easy':
        case 'recovery':
            return 'E';
        case 'progression':
            return 'M';
        default:
            return null;
    }
}

function scorePace(actualPace: number, range: { min: number; max: number; target: number }): number {
    if (actualPace >= range.min && actualPace <= range.max) return 1;
    const variance = Math.abs(actualPace - range.target) / range.target;
    return Math.max(0, 1 - variance);
}

function weightedAverage(values: number[], weights: number[], present: boolean[]): number {
    const totalWeight = values.reduce((sum, value, index) => sum + (present[index] ? weights[index] : 0), 0);
    if (totalWeight === 0) return 0;

    return values.reduce((sum, value, index) => {
        if (!present[index]) return sum;
        return sum + value * (weights[index] / totalWeight);
    }, 0);
}

function round(value: number): number {
    return Math.round(value * 100) / 100;
}
