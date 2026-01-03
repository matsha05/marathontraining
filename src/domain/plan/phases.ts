/**
 * THE LONG GAME - Phase Calculator
 * 
 * Calculates training phases using Pfitzinger's periodization model.
 * Every phase has a PURPOSE toward race day.
 */

import { TrainingPhase, PhaseConfig, MINIMUM_WEEKS, IDEAL_WEEKS } from './types';

// =============================================================================
// PHASE CONFIGURATIONS (Pfitzinger Periodization)
// =============================================================================

/**
 * Phase definitions with their specific focus and characteristics.
 * Based on Pete Pfitzinger's Advanced Marathoning methodology.
 */
export const PHASE_DEFINITIONS: Record<TrainingPhase, Omit<PhaseConfig, 'phase' | 'weeks'>> = {
    base: {
        description: 'Build aerobic foundation, establish consistency',
        primaryFocus: ['aerobic_base', 'injury_prevention', 'consistency'],
        mileageMultiplier: 0.70, // 70% of peak
        qualityDaysPerWeek: 2,
        longRunPercentage: 25, // % of weekly mileage
    },
    build: {
        description: 'Increase volume and introduce race-specific work',
        primaryFocus: ['volume_increase', 'threshold_development', 'race_specificity'],
        mileageMultiplier: 0.90, // 90% of peak
        qualityDaysPerWeek: 3,
        longRunPercentage: 28,
    },
    peak: {
        description: 'Highest volume and hardest workouts',
        primaryFocus: ['peak_fitness', 'race_simulation', 'confidence'],
        mileageMultiplier: 1.00, // 100% of peak
        qualityDaysPerWeek: 3,
        longRunPercentage: 30,
    },
    taper: {
        description: 'Reduce volume, maintain intensity, sharpen',
        primaryFocus: ['recovery', 'sharpening', 'race_readiness'],
        mileageMultiplier: 0.55, // 55% of peak (average of 2-3 week taper)
        qualityDaysPerWeek: 1,
        longRunPercentage: 20,
    },
};

// =============================================================================
// PHASE DISTRIBUTION BY DISTANCE
// =============================================================================

/**
 * Default phase distribution ratios for each distance.
 * These are percentages of total training time.
 */
export const PHASE_RATIOS: Record<string, Record<TrainingPhase, number>> = {
    '5k': {
        base: 0.25,  // 25%
        build: 0.40, // 40%
        peak: 0.25,  // 25%
        taper: 0.10, // 10%
    },
    '10k': {
        base: 0.25,
        build: 0.40,
        peak: 0.25,
        taper: 0.10,
    },
    'half': {
        base: 0.22,
        build: 0.40,
        peak: 0.25,
        taper: 0.13,
    },
    'marathon': {
        base: 0.25,
        build: 0.38,
        peak: 0.22,
        taper: 0.15,
    },
    'general': {
        base: 0.30,
        build: 0.45,
        peak: 0.20,
        taper: 0.05, // Minimal taper for general fitness
    },
};

// =============================================================================
// PHASE CALCULATOR
// =============================================================================

export interface PhaseBreakdown {
    phase: TrainingPhase;
    startWeek: number;
    endWeek: number;
    weeks: number;
    config: PhaseConfig;
}

/**
 * Calculate phase breakdown for a given number of weeks and goal distance.
 * Returns the exact week numbers for each phase.
 */
export function calculatePhases(
    totalWeeks: number,
    goalDistance: '5k' | '10k' | 'half' | 'marathon' | 'general'
): PhaseBreakdown[] {
    const ratios = PHASE_RATIOS[goalDistance];
    const phases: TrainingPhase[] = ['base', 'build', 'peak', 'taper'];

    // Calculate week counts (ensure at least 1 week per phase for short plans)
    let weekCounts: Record<TrainingPhase, number> = {
        base: Math.max(1, Math.round(totalWeeks * ratios.base)),
        build: Math.max(1, Math.round(totalWeeks * ratios.build)),
        peak: Math.max(1, Math.round(totalWeeks * ratios.peak)),
        taper: Math.max(1, Math.round(totalWeeks * ratios.taper)),
    };

    // Adjust to match exact total (prioritize build phase for adjustments)
    const sum = weekCounts.base + weekCounts.build + weekCounts.peak + weekCounts.taper;
    const diff = totalWeeks - sum;
    weekCounts.build += diff;

    // Ensure taper is at least 1 week, max 3 weeks
    weekCounts.taper = Math.max(1, Math.min(3, weekCounts.taper));

    // Build phase breakdown
    let currentWeek = 1;
    const breakdown: PhaseBreakdown[] = [];

    for (const phase of phases) {
        const weeks = weekCounts[phase];
        const def = PHASE_DEFINITIONS[phase];

        breakdown.push({
            phase,
            startWeek: currentWeek,
            endWeek: currentWeek + weeks - 1,
            weeks,
            config: {
                phase,
                weeks,
                ...def,
            },
        });

        currentWeek += weeks;
    }

    return breakdown;
}

/**
 * Get the phase for a specific week number
 */
export function getPhaseForWeek(weekNumber: number, phases: PhaseBreakdown[]): PhaseBreakdown | undefined {
    return phases.find(p => weekNumber >= p.startWeek && weekNumber <= p.endWeek);
}

/**
 * Check if enough weeks are available for proper training
 */
export function validateWeeksAvailable(
    weeksAvailable: number,
    goalDistance: '5k' | '10k' | 'half' | 'marathon' | 'general'
): {
    isValid: boolean;
    isIdeal: boolean;
    message: string;
    minimumWeeks: number;
    idealWeeks: number;
} {
    const minimum = MINIMUM_WEEKS[goalDistance];
    const ideal = IDEAL_WEEKS[goalDistance];

    if (weeksAvailable < minimum) {
        return {
            isValid: false,
            isIdeal: false,
            message: `You need at least ${minimum} weeks to train for a ${goalDistance}. You have ${weeksAvailable} weeks.`,
            minimumWeeks: minimum,
            idealWeeks: ideal,
        };
    }

    if (weeksAvailable < ideal) {
        return {
            isValid: true,
            isIdeal: false,
            message: `${weeksAvailable} weeks is doable for a ${goalDistance}, but ${ideal}+ weeks would be ideal.`,
            minimumWeeks: minimum,
            idealWeeks: ideal,
        };
    }

    return {
        isValid: true,
        isIdeal: true,
        message: `${weeksAvailable} weeks is great for ${goalDistance} training.`,
        minimumWeeks: minimum,
        idealWeeks: ideal,
    };
}

// =============================================================================
// RECOVERY WEEK SCHEDULER
// =============================================================================

/**
 * Mark recovery weeks in the training plan.
 * Based on Pfitzinger's recommendation: recovery every 3-4 weeks.
 */
export function scheduleRecoveryWeeks(
    totalWeeks: number,
    phases: PhaseBreakdown[]
): number[] {
    const recoveryWeeks: number[] = [];
    let weeksSinceRecovery = 0;

    for (let week = 1; week <= totalWeeks; week++) {
        const phase = getPhaseForWeek(week, phases);

        // Taper weeks are inherently recovery-oriented
        if (phase?.phase === 'taper') {
            continue;
        }

        weeksSinceRecovery++;

        // Schedule recovery week every 3-4 weeks
        // Use 3 weeks in base phase (building), 4 weeks in build/peak (more stress)
        const interval = phase?.phase === 'base' ? 3 : 4;

        if (weeksSinceRecovery >= interval) {
            recoveryWeeks.push(week);
            weeksSinceRecovery = 0;
        }
    }

    return recoveryWeeks;
}

/**
 * Check if a week should be a recovery week
 */
export function isRecoveryWeek(weekNumber: number, recoveryWeeks: number[]): boolean {
    return recoveryWeeks.includes(weekNumber);
}
