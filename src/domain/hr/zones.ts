/**
 * Heart Rate Zone Calculator
 * 
 * Calculates HR training zones from max HR based on Seiler's polarized model.
 * Provides mapping from pace zones to HR zones.
 * 
 * Max HR estimation: 220 - age (fallback when no test data)
 */

// =============================================================================
// TYPES
// =============================================================================

export interface HRZone {
    name: string;
    minPercent: number;
    maxPercent: number;
    minBpm: number;
    maxBpm: number;
    description: string;
}

export interface HRZones {
    zone1: HRZone; // Recovery/Very Easy
    zone2: HRZone; // Easy/Aerobic
    zone3: HRZone; // Moderate/Tempo
    zone4: HRZone; // Threshold
    zone5: HRZone; // VO2max/Interval
}

export type TrainingZone = 'E' | 'M' | 'T' | 'I' | 'R';

// =============================================================================
// MAX HR ESTIMATION
// =============================================================================

/**
 * Estimate max HR from age using the classic formula
 * Note: This is a rough estimate. For accuracy, use measured max HR.
 */
export function estimateMaxHR(age: number): number {
    // Tanaka formula (more accurate for trained athletes): 208 - 0.7 * age
    // Classic formula: 220 - age
    // Using Tanaka for runners
    return Math.round(208 - 0.7 * age);
}

// =============================================================================
// HR ZONE CALCULATION
// =============================================================================

/**
 * Calculate all HR zones from max HR
 * Based on Seiler's 3-zone polarized model, expanded to 5 zones
 */
export function calculateHRZones(maxHR: number): HRZones {
    return {
        zone1: {
            name: 'Recovery',
            minPercent: 50,
            maxPercent: 60,
            minBpm: Math.round(maxHR * 0.50),
            maxBpm: Math.round(maxHR * 0.60),
            description: 'Very easy, conversation pace',
        },
        zone2: {
            name: 'Easy',
            minPercent: 60,
            maxPercent: 70,
            minBpm: Math.round(maxHR * 0.60),
            maxBpm: Math.round(maxHR * 0.70),
            description: 'Aerobic base building',
        },
        zone3: {
            name: 'Moderate',
            minPercent: 70,
            maxPercent: 80,
            minBpm: Math.round(maxHR * 0.70),
            maxBpm: Math.round(maxHR * 0.80),
            description: 'Marathon pace effort',
        },
        zone4: {
            name: 'Threshold',
            minPercent: 80,
            maxPercent: 88,
            minBpm: Math.round(maxHR * 0.80),
            maxBpm: Math.round(maxHR * 0.88),
            description: 'Comfortably hard, tempo effort',
        },
        zone5: {
            name: 'VO2max',
            minPercent: 88,
            maxPercent: 100,
            minBpm: Math.round(maxHR * 0.88),
            maxBpm: maxHR,
            description: 'Hard intervals',
        },
    };
}

// =============================================================================
// PACE TO HR ZONE MAPPING
// =============================================================================

/**
 * Map Daniels pace zone to HR zone
 * 
 * When pace and HR conflict:
 * - Easy runs: Trust HR (heat/fatigue affect perceived pace)
 * - Intervals: Trust pace (HR lags effort)
 */
export function paceZoneToHRZone(paceZone: TrainingZone, maxHR: number): { min: number; max: number; percent: string } {
    const zones = calculateHRZones(maxHR);

    switch (paceZone) {
        case 'E': // Easy
            return {
                min: zones.zone2.minBpm,
                max: zones.zone2.maxBpm,
                percent: '60-70%',
            };
        case 'M': // Marathon
            return {
                min: zones.zone3.minBpm,
                max: zones.zone3.maxBpm,
                percent: '70-80%',
            };
        case 'T': // Threshold
            return {
                min: zones.zone4.minBpm,
                max: zones.zone4.maxBpm,
                percent: '80-88%',
            };
        case 'I': // Interval
            return {
                min: zones.zone5.minBpm,
                max: Math.round(maxHR * 0.95),
                percent: '88-95%',
            };
        case 'R': // Repetition
            return {
                min: Math.round(maxHR * 0.95),
                max: maxHR,
                percent: '95-100%',
            };
        default:
            return {
                min: zones.zone2.minBpm,
                max: zones.zone2.maxBpm,
                percent: '60-70%',
            };
    }
}

/**
 * Format HR zone for display
 */
export function formatHRZone(paceZone: TrainingZone, maxHR: number): string {
    const zone = paceZoneToHRZone(paceZone, maxHR);
    return `${zone.min}-${zone.max} bpm (${zone.percent})`;
}

/**
 * Get warning threshold - if HR exceeds this, slow down
 */
export function getHRWarningThreshold(paceZone: TrainingZone, maxHR: number): number {
    const zone = paceZoneToHRZone(paceZone, maxHR);
    // Warning at ~5% above target max for that zone
    return Math.min(zone.max + Math.round(maxHR * 0.05), maxHR);
}
