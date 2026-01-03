/**
 * Garmin readiness score calculator
 */

import type { GarminHealthMetrics, ReadinessResult, ReadinessWeights } from './types';

const DEFAULT_WEIGHTS: ReadinessWeights = {
    sleep: 0.35,
    hrv: 0.25,
    bodyBattery: 0.25,
    stress: 0.15,
    restingHeartRate: 0,
};

export interface ReadinessOptions {
    weights?: Partial<ReadinessWeights>;
    restingHeartRateBaseline?: number;
}

export function calculateReadiness(metrics: GarminHealthMetrics, options: ReadinessOptions = {}): ReadinessResult {
    const notes: string[] = [];
    const components: ReadinessResult['components'] = [];
    const baseWeights: ReadinessWeights = { ...DEFAULT_WEIGHTS, ...options.weights };
    if (options.restingHeartRateBaseline && metrics.restingHeartRate !== undefined && baseWeights.restingHeartRate === 0) {
        baseWeights.restingHeartRate = 0.1;
    }

    const sleepScore = clamp(metrics.sleepScore);
    if (sleepScore !== null) {
        components.push({ key: 'sleep', score: sleepScore, weight: baseWeights.sleep });
    } else {
        notes.push('Missing sleep score');
    }

    const hrvScore = normalizeHrv(metrics.hrvStatus);
    if (hrvScore !== null) {
        components.push({ key: 'hrv', score: hrvScore, weight: baseWeights.hrv });
    } else {
        notes.push('Missing HRV status');
    }

    const bodyBatteryScore = clamp(metrics.bodyBattery);
    if (bodyBatteryScore !== null) {
        components.push({ key: 'bodyBattery', score: bodyBatteryScore, weight: baseWeights.bodyBattery });
    } else {
        notes.push('Missing Body Battery');
    }

    const stressScore = metrics.stressAvg !== undefined ? clamp(100 - metrics.stressAvg) : null;
    if (stressScore !== null) {
        components.push({ key: 'stress', score: stressScore, weight: baseWeights.stress });
    } else {
        notes.push('Missing stress average');
    }

    if (options.restingHeartRateBaseline && metrics.restingHeartRate !== undefined) {
        const restingScore = restingHeartRateScore(metrics.restingHeartRate, options.restingHeartRateBaseline);
        components.push({ key: 'restingHeartRate', score: restingScore, weight: baseWeights.restingHeartRate });
    }

    const availableKeys = components.map(component => component.key);
    const availableWeightTotal = availableKeys.reduce((sum, key) => sum + baseWeights[key], 0);
    const totalWeightSum = Object.values(baseWeights).reduce((sum, weight) => sum + weight, 0);
    const normalizedWeights: Partial<ReadinessWeights> = {};

    if (availableWeightTotal > 0) {
        for (const component of components) {
            normalizedWeights[component.key] = component.weight / availableWeightTotal;
        }
    }

    const score = components.reduce((sum, component) => {
        const weight = normalizedWeights[component.key] ?? 0;
        return sum + component.score * weight;
    }, 0);

    return {
        score: Math.round(score),
        components: components.map(component => ({
            ...component,
            weight: normalizedWeights[component.key] ?? 0,
        })),
        normalizedWeights,
        completeness: totalWeightSum > 0 ? availableWeightTotal / totalWeightSum : 0,
        notes,
    };
}

function clamp(value: number | undefined, min = 0, max = 100): number | null {
    if (value === undefined || Number.isNaN(value)) return null;
    return Math.min(max, Math.max(min, value));
}

function normalizeHrv(hrvStatus: number | undefined): number | null {
    if (hrvStatus === undefined || Number.isNaN(hrvStatus)) return null;
    const normalized = hrvStatus <= 3 ? (hrvStatus / 3) * 100 : (hrvStatus / 5) * 100;
    return clamp(normalized);
}

function restingHeartRateScore(restingHeartRate: number, baseline: number): number {
    if (!baseline || baseline <= 0) return 50;
    const delta = Math.max(0, restingHeartRate - baseline);
    const penalty = delta * 2.5; // 10 bpm above baseline = -25 points
    return clamp(100 - penalty) ?? 50;
}
