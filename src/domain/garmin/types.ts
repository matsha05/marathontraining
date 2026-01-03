/**
 * Garmin integration domain types
 */

export type GarminSource = 'garmin' | 'garmin_export' | 'manual' | 'strava' | 'unknown';

export interface GarminHealthMetrics {
    summaryDate: string; // YYYY-MM-DD
    sleepDurationSec?: number;
    sleepScore?: number; // 0-100
    hrvStatus?: number; // 0-3 or 1-5 depending on device
    restingHeartRate?: number;
    bodyBattery?: number; // 0-100
    stressAvg?: number; // 0-100
}

export interface ReadinessWeights {
    sleep: number;
    hrv: number;
    bodyBattery: number;
    stress: number;
    restingHeartRate: number;
}

export interface ReadinessComponent {
    key: keyof ReadinessWeights;
    score: number;
    weight: number;
}

export interface ReadinessResult {
    score: number;
    components: ReadinessComponent[];
    normalizedWeights: Partial<ReadinessWeights>;
    completeness: number; // 0-1 based on available inputs
    notes: string[];
}

export interface GarminActivitySummary {
    startTime?: string;
    durationSeconds?: number;
    distanceMeters?: number;
    avgSpeedMetersPerSecond?: number;
    avgPaceSecPerMile?: number;
    avgHeartRate?: number;
    maxHeartRate?: number;
    avgCadence?: number;
    activityType?: string;
    source?: GarminSource;
    laps?: FitLapSummary[];
}

export interface FitLapSummary {
    lapNumber: number;
    distanceMeters?: number;
    durationSeconds?: number;
    avgPaceSecPerMile?: number;
    avgHeartRate?: number;
    maxHeartRate?: number;
}

export interface FitParseResult {
    session?: Record<string, unknown>;
    records: Record<string, unknown>[];
    laps: Record<string, unknown>[];
    summary: GarminActivitySummary;
    errors?: string[];
}
