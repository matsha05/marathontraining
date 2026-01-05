/**
 * THE LONG GAME - Daniels Running Formula Coach Module
 *
 * Complete implementation of Jack Daniels' training plans:
 * - 5K (24-week 4-phase)
 * - 10K (24-week 4-phase)
 * - Marathon 2Q (18-week, 4 mileage levels: 40, 55, 70, 85 mpw)
 *
 * Key patterns:
 * - VDOT-based individualized pacing (E, M, T, I, R zones)
 * - 4-phase periodization for 5K/10K (Base→Rep→Interval→Competition)
 * - 2Q structure for marathon (two quality workouts per week)
 * - Flexible week structure based on % of peak mileage
 *
 * Source: "Daniels' Running Formula" (3rd/4th Ed)
 *         research/26-daniels-running-formula.md
 */

import { TrainingPhase, DanielsTier, DanielsTierConfig, DanielsPhase, DanielsIntensity, DanielsWorkout, DanielsWorkoutSegment } from '../types';

// =============================================================================
// TYPES
// =============================================================================

export interface Daniels2QWorkout {
    week: number;
    q1: DanielsWorkout;       // Sunday - typically long run
    q2: DanielsWorkout;       // Midweek - tempo/intervals
    mileagePercent: number;   // % of peak mileage (80, 90, 100)
}

export interface DanielsWeekData {
    week: number;
    phase: DanielsPhase;
    mileagePercent: number;  // For 2Q: 80, 90, 100
    q1?: DanielsWorkout;     // For 2Q marathon
    q2?: DanielsWorkout;     // For 2Q marathon
    keyWorkouts?: string[];  // For 5K/10K phase-based plans
    focus: string;
}

// =============================================================================
// TIER CONFIGURATIONS
// =============================================================================

export const DANIELS_TIER_CONFIGS: Record<DanielsTier, DanielsTierConfig> = {
    // =========================================================================
    // 5K/10K 24-WEEK 4-PHASE PLANS
    // =========================================================================
    daniels_5k_24wk: {
        tier: 'daniels_5k_24wk',
        distance: '5k',
        durationWeeks: 24,
        qualityDaysPerWeek: 3,
        peakMileage: 50, // Varies by runner
        structure: '4phase',
        phases: {
            base: [1, 2, 3, 4, 5, 6],
            repetition: [7, 8, 9, 10, 11, 12],
            interval: [13, 14, 15, 16, 17, 18],
            competition: [19, 20, 21, 22, 23, 24],
            taper: [23, 24],
        },
    },
    daniels_10k_24wk: {
        tier: 'daniels_10k_24wk',
        distance: '10k',
        durationWeeks: 24,
        qualityDaysPerWeek: 3,
        peakMileage: 55,
        structure: '4phase',
        phases: {
            base: [1, 2, 3, 4, 5, 6],
            repetition: [7, 8, 9, 10, 11, 12],
            interval: [13, 14, 15, 16, 17, 18],
            competition: [19, 20, 21, 22, 23, 24],
            taper: [23, 24],
        },
    },

    // =========================================================================
    // MARATHON 2Q PLANS (18 weeks, 4 mileage levels)
    // =========================================================================
    daniels_2q_marathon_40: {
        tier: 'daniels_2q_marathon_40',
        distance: 'marathon',
        durationWeeks: 18,
        qualityDaysPerWeek: 2,
        peakMileage: 40,
        structure: '2q',
        phases: {
            base: [1, 2, 3, 4, 5, 6],
            build: [7, 8, 9, 10, 11, 12],
            peak: [13, 14, 15, 16],
            taper: [17, 18],
        },
    },
    daniels_2q_marathon_55: {
        tier: 'daniels_2q_marathon_55',
        distance: 'marathon',
        durationWeeks: 18,
        qualityDaysPerWeek: 2,
        peakMileage: 55,
        structure: '2q',
        phases: {
            base: [1, 2, 3, 4, 5, 6],
            build: [7, 8, 9, 10, 11, 12],
            peak: [13, 14, 15, 16],
            taper: [17, 18],
        },
    },
    daniels_2q_marathon_70: {
        tier: 'daniels_2q_marathon_70',
        distance: 'marathon',
        durationWeeks: 18,
        qualityDaysPerWeek: 2,
        peakMileage: 70,
        structure: '2q',
        phases: {
            base: [1, 2, 3, 4, 5, 6],
            build: [7, 8, 9, 10, 11, 12],
            peak: [13, 14, 15, 16],
            taper: [17, 18],
        },
    },
    daniels_2q_marathon_85: {
        tier: 'daniels_2q_marathon_85',
        distance: 'marathon',
        durationWeeks: 18,
        qualityDaysPerWeek: 2,
        peakMileage: 85,
        structure: '2q',
        phases: {
            base: [1, 2, 3, 4, 5, 6],
            build: [7, 8, 9, 10, 11, 12],
            peak: [13, 14, 15, 16],
            taper: [17, 18],
        },
    },
};

// =============================================================================
// 2Q MARATHON 55 MPW - COMPLETE 18-WEEK SCHEDULE
// Source: research/26-daniels-running-formula.md (FetchEveryone extract)
// =============================================================================

const DANIELS_2Q_55_WEEKS: Daniels2QWorkout[] = [
    {
        week: 1,
        mileagePercent: 80,
        q1: {
            description: '14mi: 4E + 8M + 1T + 1E', totalMiles: 14, qualityMiles: 9, segments: [
                { distance: 4, intensity: 'E' },
                { distance: 8, intensity: 'M' },
                { distance: 1, intensity: 'T' },
                { distance: 1, intensity: 'E' },
            ]
        },
        q2: {
            description: '15mi: 8E + 2×2T (2\') + 1T + 2E', totalMiles: 15, qualityMiles: 5, segments: [
                { distance: 8, intensity: 'E' },
                { distance: 2, intensity: 'T', reps: 2, recoveryMinutes: 2 },
                { distance: 1, intensity: 'T' },
                { distance: 2, intensity: 'E' },
            ]
        },
    },
    {
        week: 2,
        mileagePercent: 80,
        q1: {
            description: '13mi: 2E + 3T + 40\'E + 2T + 1E', totalMiles: 13, qualityMiles: 5, segments: [
                { distance: 2, intensity: 'E' },
                { distance: 3, intensity: 'T' },
                { distance: 5, intensity: 'E' }, // ~40 min
                { distance: 2, intensity: 'T' },
                { distance: 1, intensity: 'E' },
            ]
        },
        q2: {
            description: '13mi: 6E + 5×3\'I (2\') + 6×1\'R (1\') + 2E', totalMiles: 13, qualityMiles: 4, segments: [
                { distance: 6, intensity: 'E' },
                { distance: 2.5, intensity: 'I', reps: 5, recoveryMinutes: 2 },
                { distance: 1.5, intensity: 'R', reps: 6, recoveryMinutes: 1 },
                { distance: 2, intensity: 'E' },
            ]
        },
    },
    {
        week: 3,
        mileagePercent: 90,
        q1: {
            description: '15mi: 90-120 min steady Easy', totalMiles: 15, qualityMiles: 0, segments: [
                { distance: 15, intensity: 'E' },
            ]
        },
        q2: {
            description: '13mi: 6E + 2T + 2\'E + 2T + 2\'E + 1T + 2E', totalMiles: 13, qualityMiles: 5, segments: [
                { distance: 6, intensity: 'E' },
                { distance: 2, intensity: 'T' },
                { distance: 0.5, intensity: 'E' },
                { distance: 2, intensity: 'T' },
                { distance: 0.5, intensity: 'E' },
                { distance: 1, intensity: 'T' },
                { distance: 2, intensity: 'E' },
            ]
        },
    },
    {
        week: 4,
        mileagePercent: 90,
        q1: {
            description: '16mi: 2E + 4T + 60\'E + 2T + 1E', totalMiles: 16, qualityMiles: 6, segments: [
                { distance: 2, intensity: 'E' },
                { distance: 4, intensity: 'T' },
                { distance: 7, intensity: 'E' },
                { distance: 2, intensity: 'T' },
                { distance: 1, intensity: 'E' },
            ]
        },
        q2: {
            description: '13mi: 2E + 4×2mi T (2\') + 2E', totalMiles: 13, qualityMiles: 8, segments: [
                { distance: 2, intensity: 'E' },
                { distance: 2, intensity: 'T', reps: 4, recoveryMinutes: 2 },
                { distance: 2, intensity: 'E' },
            ]
        },
    },
    {
        week: 5,
        mileagePercent: 100,
        q1: {
            description: '17mi: 2E + 10M + 1T + 4E', totalMiles: 17, qualityMiles: 11, segments: [
                { distance: 2, intensity: 'E' },
                { distance: 10, intensity: 'M' },
                { distance: 1, intensity: 'T' },
                { distance: 4, intensity: 'E' },
            ]
        },
        q2: {
            description: '13mi: 6E + 4×1200m I (3\') + 4×200R (200) + 2E', totalMiles: 13, qualityMiles: 4, segments: [
                { distance: 6, intensity: 'E' },
                { distance: 3, intensity: 'I', reps: 4, recoveryMinutes: 3 },
                { distance: 0.5, intensity: 'R', reps: 4 },
                { distance: 2, intensity: 'E' },
            ]
        },
    },
    {
        week: 6,
        mileagePercent: 100,
        q1: {
            description: '17mi: 2E + 2T + 1E + 2T + 1E + 2T + 1E + 2T + 1E', totalMiles: 17, qualityMiles: 8, segments: [
                { distance: 2, intensity: 'E' },
                { distance: 2, intensity: 'T' },
                { distance: 1, intensity: 'E' },
                { distance: 2, intensity: 'T' },
                { distance: 1, intensity: 'E' },
                { distance: 2, intensity: 'T' },
                { distance: 1, intensity: 'E' },
                { distance: 2, intensity: 'T' },
                { distance: 1, intensity: 'E' },
            ]
        },
        q2: {
            description: '13mi: 2E + 3T + 30\'E + 2T + 2E', totalMiles: 13, qualityMiles: 5, segments: [
                { distance: 2, intensity: 'E' },
                { distance: 3, intensity: 'T' },
                { distance: 4, intensity: 'E' },
                { distance: 2, intensity: 'T' },
                { distance: 2, intensity: 'E' },
            ]
        },
    },
    {
        week: 7,
        mileagePercent: 90,
        q1: {
            description: '15mi: 90-120 min steady Easy', totalMiles: 15, qualityMiles: 0, segments: [
                { distance: 15, intensity: 'E' },
            ]
        },
        q2: {
            description: '13mi: 6E + 2T + 1E + 2T + 1E + 1T + 2E', totalMiles: 13, qualityMiles: 5, segments: [
                { distance: 6, intensity: 'E' },
                { distance: 2, intensity: 'T' },
                { distance: 1, intensity: 'E' },
                { distance: 2, intensity: 'T' },
                { distance: 1, intensity: 'E' },
                { distance: 1, intensity: 'T' },
                { distance: 2, intensity: 'E' },
            ]
        },
    },
    {
        week: 8,
        mileagePercent: 100,
        q1: {
            description: '17mi: 2E + 2×4mi T (2\') + 1T + 2E', totalMiles: 17, qualityMiles: 9, segments: [
                { distance: 2, intensity: 'E' },
                { distance: 4, intensity: 'T', reps: 2, recoveryMinutes: 2 },
                { distance: 1, intensity: 'T' },
                { distance: 2, intensity: 'E' },
            ]
        },
        q2: {
            description: '14mi: 2E + 12M + 2E', totalMiles: 14, qualityMiles: 12, segments: [
                { distance: 2, intensity: 'E' },
                { distance: 12, intensity: 'M' },
                { distance: 2, intensity: 'E' },
            ]
        },
    },
    {
        week: 9,
        mileagePercent: 100,
        q1: {
            description: '16mi: 2E + 13M + 1E', totalMiles: 16, qualityMiles: 13, segments: [
                { distance: 2, intensity: 'E' },
                { distance: 13, intensity: 'M' },
                { distance: 1, intensity: 'E' },
            ]
        },
        q2: {
            description: '13mi: 6E + 5×1000I (3\') + 4×200R (200) + 2E', totalMiles: 13, qualityMiles: 4, segments: [
                { distance: 6, intensity: 'E' },
                { distance: 3, intensity: 'I', reps: 5, recoveryMinutes: 3 },
                { distance: 0.5, intensity: 'R', reps: 4 },
                { distance: 2, intensity: 'E' },
            ]
        },
    },
    {
        week: 10,
        mileagePercent: 100,
        q1: {
            description: '17mi: 2E + 3×3mi T (2\') + 2E', totalMiles: 17, qualityMiles: 9, segments: [
                { distance: 2, intensity: 'E' },
                { distance: 3, intensity: 'T', reps: 3, recoveryMinutes: 2 },
                { distance: 2, intensity: 'E' },
            ]
        },
        q2: {
            description: '13mi: 2E + 2T + 1E + 2T + 1E + 1T + 2E', totalMiles: 13, qualityMiles: 5, segments: [
                { distance: 2, intensity: 'E' },
                { distance: 2, intensity: 'T' },
                { distance: 1, intensity: 'E' },
                { distance: 2, intensity: 'T' },
                { distance: 1, intensity: 'E' },
                { distance: 1, intensity: 'T' },
                { distance: 2, intensity: 'E' },
            ]
        },
    },
    {
        week: 11,
        mileagePercent: 90,
        q1: {
            description: '15mi: 90-120 min steady Easy', totalMiles: 15, qualityMiles: 0, segments: [
                { distance: 15, intensity: 'E' },
            ]
        },
        q2: {
            description: '13mi: 6E + 2×1mi I (3\') + 10×400R (400) + 2E', totalMiles: 13, qualityMiles: 4.5, segments: [
                { distance: 6, intensity: 'E' },
                { distance: 1, intensity: 'I', reps: 2, recoveryMinutes: 3 },
                { distance: 2.5, intensity: 'R', reps: 10 },
                { distance: 2, intensity: 'E' },
            ]
        },
    },
    {
        week: 12,
        mileagePercent: 100,
        q1: {
            description: '17mi: 2E + 12M + 1T + 2E', totalMiles: 17, qualityMiles: 13, segments: [
                { distance: 2, intensity: 'E' },
                { distance: 12, intensity: 'M' },
                { distance: 1, intensity: 'T' },
                { distance: 2, intensity: 'E' },
            ]
        },
        q2: {
            description: '13mi: 2E + 3×2mi T (2\') + 2E', totalMiles: 13, qualityMiles: 6, segments: [
                { distance: 2, intensity: 'E' },
                { distance: 2, intensity: 'T', reps: 3, recoveryMinutes: 2 },
                { distance: 2, intensity: 'E' },
            ]
        },
    },
    {
        week: 13,
        mileagePercent: 100,
        q1: {
            description: '18mi: 2E + 4T + 60\'E + 2T + 1E', totalMiles: 18, qualityMiles: 6, segments: [
                { distance: 2, intensity: 'E' },
                { distance: 4, intensity: 'T' },
                { distance: 8, intensity: 'E' },
                { distance: 2, intensity: 'T' },
                { distance: 1, intensity: 'E' },
            ]
        },
        q2: {
            description: '14mi: 2E + 2T + 8M + 1T + 1E', totalMiles: 14, qualityMiles: 11, segments: [
                { distance: 2, intensity: 'E' },
                { distance: 2, intensity: 'T' },
                { distance: 8, intensity: 'M' },
                { distance: 1, intensity: 'T' },
                { distance: 1, intensity: 'E' },
            ]
        },
    },
    {
        week: 14,
        mileagePercent: 100,
        q1: {
            description: '17mi: 2E + 3×3mi T (2\') + 2E', totalMiles: 17, qualityMiles: 9, segments: [
                { distance: 2, intensity: 'E' },
                { distance: 3, intensity: 'T', reps: 3, recoveryMinutes: 2 },
                { distance: 2, intensity: 'E' },
            ]
        },
        q2: {
            description: '13mi: 6E + 5×3\'I (2\') + 4×200R (200) + 2E', totalMiles: 13, qualityMiles: 4, segments: [
                { distance: 6, intensity: 'E' },
                { distance: 2.5, intensity: 'I', reps: 5, recoveryMinutes: 2 },
                { distance: 0.5, intensity: 'R', reps: 4 },
                { distance: 2, intensity: 'E' },
            ]
        },
    },
    {
        week: 15,
        mileagePercent: 90,
        q1: {
            description: '17mi: 150 min steady Easy', totalMiles: 17, qualityMiles: 0, segments: [
                { distance: 17, intensity: 'E' },
            ]
        },
        q2: {
            description: '13mi: 6E + 5×3\'I (2\') + 4E', totalMiles: 13, qualityMiles: 2.5, segments: [
                { distance: 6, intensity: 'E' },
                { distance: 2.5, intensity: 'I', reps: 5, recoveryMinutes: 2 },
                { distance: 4, intensity: 'E' },
            ]
        },
    },
    {
        week: 16,
        mileagePercent: 90,
        q1: {
            description: '17mi: 1E + 8M + 1E + 6M + 1E', totalMiles: 17, qualityMiles: 14, segments: [
                { distance: 1, intensity: 'E' },
                { distance: 8, intensity: 'M' },
                { distance: 1, intensity: 'E' },
                { distance: 6, intensity: 'M' },
                { distance: 1, intensity: 'E' },
            ]
        },
        q2: {
            description: '13mi: 4E + 2×2T (2\') + 3×1T (1\') + 2E', totalMiles: 13, qualityMiles: 7, segments: [
                { distance: 4, intensity: 'E' },
                { distance: 2, intensity: 'T', reps: 2, recoveryMinutes: 2 },
                { distance: 1, intensity: 'T', reps: 3, recoveryMinutes: 1 },
                { distance: 2, intensity: 'E' },
            ]
        },
    },
    {
        week: 17,
        mileagePercent: 90,
        q1: {
            description: '15mi: 1E + 3×2T (2\') + 60\'E', totalMiles: 15, qualityMiles: 6, segments: [
                { distance: 1, intensity: 'E' },
                { distance: 2, intensity: 'T', reps: 3, recoveryMinutes: 2 },
                { distance: 8, intensity: 'E' },
            ]
        },
        q2: {
            description: '13mi: 4E + 1T + 2M + 1E + 1T + 2M + 2E', totalMiles: 13, qualityMiles: 6, segments: [
                { distance: 4, intensity: 'E' },
                { distance: 1, intensity: 'T' },
                { distance: 2, intensity: 'M' },
                { distance: 1, intensity: 'E' },
                { distance: 1, intensity: 'T' },
                { distance: 2, intensity: 'M' },
                { distance: 2, intensity: 'E' },
            ]
        },
    },
    {
        week: 18,
        mileagePercent: 50, // Taper
        q1: {
            description: '12mi: 90 min Easy', totalMiles: 12, qualityMiles: 0, segments: [
                { distance: 12, intensity: 'E' },
            ]
        },
        q2: {
            description: '7mi: 2E + 3×1T (2\') + 2E', totalMiles: 7, qualityMiles: 3, segments: [
                { distance: 2, intensity: 'E' },
                { distance: 1, intensity: 'T', reps: 3, recoveryMinutes: 2 },
                { distance: 2, intensity: 'E' },
            ]
        },
    },
];

// Map week data for all tiers
const DANIELS_2Q_WEEK_DATA: Record<DanielsTier, Daniels2QWorkout[] | null> = {
    daniels_5k_24wk: null, // Uses phase-based structure, not 2Q
    daniels_10k_24wk: null,
    daniels_2q_marathon_40: DANIELS_2Q_55_WEEKS, // Scale by mileage %
    daniels_2q_marathon_55: DANIELS_2Q_55_WEEKS, // Base data
    daniels_2q_marathon_70: DANIELS_2Q_55_WEEKS, // Scale by mileage %
    daniels_2q_marathon_85: DANIELS_2Q_55_WEEKS, // Scale by mileage %
};

// =============================================================================
// PHASE DETECTION
// =============================================================================

/**
 * Get the Daniels-specific training phase for a given week.
 */
export function getDanielsPhase(tier: DanielsTier, weekNumber: number): DanielsPhase {
    const config = DANIELS_TIER_CONFIGS[tier];

    if (config.structure === '4phase') {
        if (config.phases.competition?.includes(weekNumber)) return 'competition';
        if (config.phases.interval?.includes(weekNumber)) return 'interval';
        if (config.phases.repetition?.includes(weekNumber)) return 'repetition';
        return 'base';
    } else {
        // 2Q marathon
        if (config.phases.taper.includes(weekNumber)) return 'competition';
        if (config.phases.peak?.includes(weekNumber)) return 'interval';
        if (config.phases.build?.includes(weekNumber)) return 'repetition';
        return 'base';
    }
}

/**
 * Map Daniels phase to generic TrainingPhase
 */
export function toTrainingPhase(danielsPhase: DanielsPhase): TrainingPhase {
    switch (danielsPhase) {
        case 'base': return 'base';
        case 'repetition': return 'build';
        case 'interval': return 'peak';
        case 'competition': return 'taper';
    }
}

// =============================================================================
// DATA ACCESSORS
// =============================================================================

/**
 * Get 2Q workout data for a specific week.
 */
export function getDaniels2QWorkout(tier: DanielsTier, weekNumber: number): Daniels2QWorkout | null {
    const weeks = DANIELS_2Q_WEEK_DATA[tier];
    if (!weeks) return null;

    const baseWorkout = weeks.find(w => w.week === weekNumber);
    if (!baseWorkout) return null;

    // Scale for different mileage tiers
    const config = DANIELS_TIER_CONFIGS[tier];
    const scaleFactor = config.peakMileage / 55; // 55 is base data

    if (scaleFactor === 1) return baseWorkout;

    // Scale the workouts
    return {
        ...baseWorkout,
        q1: scaleWorkout(baseWorkout.q1, scaleFactor),
        q2: scaleWorkout(baseWorkout.q2, scaleFactor),
    };
}

/**
 * Scale a workout by a factor.
 */
function scaleWorkout(workout: DanielsWorkout, factor: number): DanielsWorkout {
    return {
        ...workout,
        totalMiles: Math.round(workout.totalMiles * factor * 10) / 10,
        qualityMiles: Math.round(workout.qualityMiles * factor * 10) / 10,
        segments: workout.segments.map(s => ({
            ...s,
            distance: Math.round(s.distance * factor * 10) / 10,
        })),
    };
}

/**
 * Get the prescribed weekly mileage for a given week.
 */
export function getDanielsWeeklyMileage(tier: DanielsTier, weekNumber: number): number {
    const config = DANIELS_TIER_CONFIGS[tier];

    if (config.structure === '2q') {
        const workout = getDaniels2QWorkout(tier, weekNumber);
        if (!workout) return 0;

        // Calculate based on mileage percent and peak
        return Math.round(config.peakMileage * (workout.mileagePercent / 100));
    } else {
        // 4-phase: mileage varies by phase
        const phase = getDanielsPhase(tier, weekNumber);
        const multipliers: Record<DanielsPhase, number> = {
            base: 0.75,
            repetition: 0.85,
            interval: 0.95,
            competition: 0.90,
        };
        return Math.round(config.peakMileage * multipliers[phase]);
    }
}

/**
 * Get Q1 (long run) for marathon 2Q plans.
 */
export function getDanielsQ1(tier: DanielsTier, weekNumber: number): DanielsWorkout | null {
    const workout = getDaniels2QWorkout(tier, weekNumber);
    return workout?.q1 ?? null;
}

/**
 * Get Q2 (midweek quality) for marathon 2Q plans.
 */
export function getDanielsQ2(tier: DanielsTier, weekNumber: number): DanielsWorkout | null {
    const workout = getDaniels2QWorkout(tier, weekNumber);
    return workout?.q2 ?? null;
}

// =============================================================================
// WORKOUT NOTATION PARSER
// =============================================================================

/**
 * Parse Daniels workout notation (e.g., "2E + 3×2T + 2E") into segments.
 * Note: This is a simplified parser for common patterns.
 */
export function parseDanielsNotation(notation: string): DanielsWorkoutSegment[] {
    const segments: DanielsWorkoutSegment[] = [];
    const parts = notation.split('+').map(p => p.trim());

    for (const part of parts) {
        // Match patterns like "2E", "3×2T", "5×1000I"
        const simpleMatch = part.match(/^(\d+(?:\.\d+)?)(E|M|T|I|R)$/);
        const repMatch = part.match(/^(\d+)×(\d+(?:\.\d+)?)\s*(mi)?\s*(E|M|T|I|R)/i);
        const distanceMatch = part.match(/^(\d+)×(\d+)m\s*(E|M|T|I|R)/i);

        if (simpleMatch) {
            segments.push({
                distance: parseFloat(simpleMatch[1]),
                intensity: simpleMatch[2] as DanielsIntensity,
            });
        } else if (repMatch) {
            segments.push({
                distance: parseFloat(repMatch[2]),
                intensity: repMatch[4] as DanielsIntensity,
                reps: parseInt(repMatch[1]),
            });
        } else if (distanceMatch) {
            // Convert meters to miles
            const meters = parseInt(distanceMatch[2]);
            const miles = meters / 1609.34;
            segments.push({
                distance: Math.round(miles * 100) / 100,
                intensity: distanceMatch[3] as DanielsIntensity,
                reps: parseInt(distanceMatch[1]),
            });
        }
    }

    return segments;
}

// =============================================================================
// TIER HELPERS
// =============================================================================

/**
 * Get all available Daniels tiers.
 */
export function getDanielsTiers(): DanielsTier[] {
    return Object.keys(DANIELS_TIER_CONFIGS) as DanielsTier[];
}

/**
 * Get tier configuration.
 */
export function getDanielsTierConfig(tier: DanielsTier): DanielsTierConfig {
    return DANIELS_TIER_CONFIGS[tier];
}

/**
 * Get tier display name.
 */
export function getDanielsTierDisplayName(tier: DanielsTier): string {
    const config = DANIELS_TIER_CONFIGS[tier];

    if (config.structure === '2q') {
        return `Daniels 2Q Marathon (${config.peakMileage} mpw)`;
    } else {
        const distanceLabel = config.distance.toUpperCase();
        return `Daniels ${distanceLabel} (${config.durationWeeks}-week)`;
    }
}

/**
 * Get tiers for a specific distance.
 */
export function getDanielsTiersByDistance(distance: '5k' | '10k' | 'marathon'): DanielsTier[] {
    return getDanielsTiers().filter(tier => DANIELS_TIER_CONFIGS[tier].distance === distance);
}

/**
 * Recommend a Daniels tier based on runner profile.
 */
export function recommendDanielsTier(
    weeklyMiles: number,
    goalDistance: '5k' | '10k' | 'marathon',
    weeksAvailable: number
): DanielsTier | null {
    // For 5K/10K, need 24 weeks
    if ((goalDistance === '5k' || goalDistance === '10k') && weeksAvailable >= 20) {
        return goalDistance === '5k' ? 'daniels_5k_24wk' : 'daniels_10k_24wk';
    }

    // For marathon with 2Q
    if (goalDistance === 'marathon' && weeksAvailable >= 16) {
        if (weeklyMiles >= 70) return 'daniels_2q_marathon_85';
        if (weeklyMiles >= 55) return 'daniels_2q_marathon_70';
        if (weeklyMiles >= 40) return 'daniels_2q_marathon_55';
        return 'daniels_2q_marathon_40';
    }

    return null;
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate that a Daniels plan meets key criteria.
 */
export function validateDanielsPlan(tier: DanielsTier): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    const config = DANIELS_TIER_CONFIGS[tier];

    if (config.structure === '2q') {
        const weeks = DANIELS_2Q_WEEK_DATA[tier];
        if (!weeks) {
            errors.push('No week data found for 2Q plan');
        } else if (weeks.length !== 18) {
            errors.push(`Expected 18 weeks, got ${weeks.length}`);
        }
    }

    // Check phase coverage
    const allWeeks = [
        ...config.phases.base,
        ...(config.phases.repetition ?? []),
        ...(config.phases.interval ?? []),
        ...(config.phases.build ?? []),
        ...(config.phases.peak ?? []),
        ...(config.phases.competition ?? []),
        ...config.phases.taper,
    ];

    const uniqueWeeks = [...new Set(allWeeks)];
    if (uniqueWeeks.length !== config.durationWeeks) {
        errors.push(`Phase weeks don't cover all ${config.durationWeeks} weeks`);
    }

    return { valid: errors.length === 0, errors };
}

// =============================================================================
// ELIGIBILITY CRITERIA
// Source: "Daniels' Running Formula" (3rd/4th Ed) + research/26-daniels-running-formula.md
// =============================================================================

import type { CoachEligibility } from './hansons';

/**
 * Daniels eligibility criteria.
 * 
 * Philosophy: Science-based, VDOT-driven training. Requires commitment to
 * precise pacing and structured workouts. Best for runners who want to
 * understand the "why" behind every workout.
 */
export const DANIELS_ELIGIBILITY: CoachEligibility = {
    // Daniels has 5K, 10K (24-week 4-phase) and Marathon (18-week 2Q)
    distances: ['5k', '10k', 'marathon'] as const,

    // Daniels 2Q marathon is 2 quality days, easy days flexible
    // 5K/10K plans are 3 quality days (research/26-daniels-running-formula.md)
    // Minimum 4 days to hit quality + recovery pattern
    minDays: 4,

    // Daniels 2Q 40mpw is lowest marathon plan
    // 5K/10K can start lower but benefit from consistent mileage
    // Use 25 as minimum to properly execute quality workouts
    minMileage: 25,

    tiers: {
        // Marathon 2Q tiers - explicitly mileage-based
        '2q_40': {
            mileageRange: [25, 45],
            startMileage: 32,  // 80% of 40mpw peak (week 1)
        },
        '2q_55': {
            mileageRange: [40, 60],
            startMileage: 44,  // 80% of 55mpw peak (week 1)
        },
        '2q_70': {
            mileageRange: [55, 75],
            startMileage: 56,  // 80% of 70mpw peak (week 1)
        },
        '2q_85': {
            mileageRange: [70, Infinity],
            startMileage: 68,  // 80% of 85mpw peak (week 1)
        },
        // 5K/10K use phase-based, not mileage-based tier selection
        '5k_10k': {
            mileageRange: [25, 70],
            startMileage: 30,  // Flexible based on runner
        },
    },
};

