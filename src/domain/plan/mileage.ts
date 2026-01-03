/**
 * THE LONG GAME - Mileage Progression
 * 
 * Calculate weekly mileage using the 10% rule with smart periodization.
 * Based on Pfitzinger's volume management principles.
 */

import { TrainingPhase } from './types';
import { PhaseBreakdown, isRecoveryWeek, PHASE_DEFINITIONS } from './phases';

// =============================================================================
// PEAK MILEAGE CALCULATIONS
// =============================================================================

/**
 * Peak mileage targets by distance and available training days.
 * Based on Pfitzinger and Hansons recommendations.
 */
export const PEAK_MILEAGE_TARGETS: Record<string, Record<number, { min: number; moderate: number; aggressive: number }>> = {
    '5k': {
        3: { min: 20, moderate: 25, aggressive: 30 },
        4: { min: 25, moderate: 35, aggressive: 45 },
        5: { min: 35, moderate: 45, aggressive: 55 },
        6: { min: 40, moderate: 50, aggressive: 60 },
    },
    '10k': {
        3: { min: 25, moderate: 30, aggressive: 35 },
        4: { min: 30, moderate: 40, aggressive: 50 },
        5: { min: 40, moderate: 50, aggressive: 60 },
        6: { min: 45, moderate: 55, aggressive: 70 },
    },
    'half': {
        3: { min: 25, moderate: 35, aggressive: 40 },
        4: { min: 35, moderate: 45, aggressive: 55 },
        5: { min: 45, moderate: 55, aggressive: 70 },
        6: { min: 50, moderate: 65, aggressive: 80 },
    },
    'marathon': {
        3: { min: 30, moderate: 40, aggressive: 50 },
        4: { min: 40, moderate: 50, aggressive: 60 },
        5: { min: 50, moderate: 60, aggressive: 75 },
        6: { min: 55, moderate: 70, aggressive: 90 },
    },
    'general': {
        3: { min: 15, moderate: 20, aggressive: 25 },
        4: { min: 20, moderate: 30, aggressive: 40 },
        5: { min: 30, moderate: 40, aggressive: 50 },
        6: { min: 35, moderate: 45, aggressive: 55 },
    },
};

/**
 * Calculate appropriate peak mileage based on:
 * - Goal distance
 * - Current weekly mileage
 * - Available training days
 * - Intensity preference
 */
export function calculatePeakMileage(
    goalDistance: '5k' | '10k' | 'half' | 'marathon' | 'general',
    currentWeeklyMiles: number,
    availableDays: 3 | 4 | 5 | 6,
    intensity: 'conservative' | 'moderate' | 'aggressive',
    totalWeeks: number
): number {
    // Get target based on distance and days
    const targets = PEAK_MILEAGE_TARGETS[goalDistance][availableDays];
    const targetMileage = targets[intensity === 'conservative' ? 'min' : intensity === 'aggressive' ? 'aggressive' : 'moderate'];

    // Calculate max achievable based on 10% rule
    // If we have N weeks, we can increase ~10% per non-recovery week
    // Roughly 3 build weeks per 4 (1 recovery)
    const buildWeeks = Math.floor(totalWeeks * 0.75);
    const maxGrowthFactor = Math.pow(1.10, buildWeeks);
    const maxAchievable = currentWeeklyMiles * maxGrowthFactor;

    // Peak mileage should not require more than safe progression
    // But also should allow starting athletes to reach reasonable targets
    const minimumPeak = currentWeeklyMiles * 1.5; // At least 50% increase if training is long enough

    // Return the smaller of target vs achievable, but at least minimumPeak
    return Math.max(
        minimumPeak,
        Math.min(targetMileage, maxAchievable)
    );
}

// =============================================================================
// WEEKLY MILEAGE PROGRESSION
// =============================================================================

/**
 * Generate weekly mileage progression for the entire plan.
 * Respects 10% rule, recovery weeks, and phase-appropriate volume.
 */
export function generateMileageProgression(
    startingMileage: number,
    peakMileage: number,
    phases: PhaseBreakdown[],
    recoveryWeeks: number[]
): number[] {
    const totalWeeks = phases[phases.length - 1].endWeek;
    const weeklyMileage: number[] = [];

    let currentMileage = startingMileage;

    for (let week = 1; week <= totalWeeks; week++) {
        const phase = phases.find(p => week >= p.startWeek && week <= p.endWeek);
        if (!phase) continue;

        // Target for this phase
        const phaseMultiplier = PHASE_DEFINITIONS[phase.phase].mileageMultiplier;
        const phasePeakTarget = peakMileage * phaseMultiplier;

        // Recovery week: reduce by 15-20%
        if (isRecoveryWeek(week, recoveryWeeks)) {
            currentMileage = Math.round(currentMileage * 0.82);
            weeklyMileage.push(currentMileage);
            continue;
        }

        // Taper: graduated reduction
        if (phase.phase === 'taper') {
            const taperWeeks = phase.weeks;
            const weeksIntoTaper = week - phase.startWeek + 1;
            const taperRatio = getTaperRatio(weeksIntoTaper, taperWeeks);
            currentMileage = Math.round(peakMileage * taperRatio);
            weeklyMileage.push(currentMileage);
            continue;
        }

        // Normal progression: increase toward phase target
        // But never more than 10% from last non-recovery week
        const lastNonRecoveryMileage = findLastNonRecoveryMileage(weeklyMileage, recoveryWeeks);
        const maxIncrease = lastNonRecoveryMileage ? lastNonRecoveryMileage * 1.10 : currentMileage * 1.10;

        // Calculate target for this week based on linear progression within phase
        const weeksInPhase = phase.weeks;
        const weekInPhase = week - phase.startWeek + 1;
        const progressRatio = weekInPhase / weeksInPhase;

        // Interpolate from current to phase target
        const startOfPhaseMileage = week === phase.startWeek ? currentMileage : weeklyMileage[phase.startWeek - 2] || startingMileage;
        const targetThisWeek = startOfPhaseMileage + (phasePeakTarget - startOfPhaseMileage) * progressRatio;

        // Apply 10% cap
        currentMileage = Math.round(Math.min(targetThisWeek, maxIncrease));

        // Don't exceed peak
        currentMileage = Math.min(currentMileage, peakMileage);

        weeklyMileage.push(currentMileage);
    }

    return weeklyMileage;
}

/**
 * Find the last non-recovery week's mileage for 10% rule calculation
 */
function findLastNonRecoveryMileage(mileages: number[], recoveryWeeks: number[]): number | null {
    for (let i = mileages.length; i > 0; i--) {
        if (!recoveryWeeks.includes(i)) {
            return mileages[i - 1];
        }
    }
    return null;
}

/**
 * Get taper ratio for a specific week of taper.
 * Based on Pfitzinger's 2-3 week taper protocol.
 */
function getTaperRatio(weekIntoTaper: number, totalTaperWeeks: number): number {
    // Graduated reduction: 60% -> 40% -> 30% (for 3-week taper)
    // Or 50% -> 30% (for 2-week taper)
    if (totalTaperWeeks === 3) {
        const ratios = [0.60, 0.40, 0.30];
        return ratios[Math.min(weekIntoTaper - 1, 2)];
    } else if (totalTaperWeeks === 2) {
        const ratios = [0.50, 0.30];
        return ratios[Math.min(weekIntoTaper - 1, 1)];
    } else {
        // Single week taper
        return 0.40;
    }
}

// =============================================================================
// LONG RUN PROGRESSION
// =============================================================================

/**
 * Calculate long run distance for a given week.
 * Based on Hansons (cap at 16 for marathon, 33% of weekly)
 * and Pfitzinger (longer runs for experienced).
 */
export function calculateLongRun(
    weeklyMileage: number,
    goalDistance: '5k' | '10k' | 'half' | 'marathon' | 'general',
    phase: TrainingPhase,
    intensity: 'conservative' | 'moderate' | 'aggressive'
): number {
    // Base percentage from phase definitions
    const basePercentage = PHASE_DEFINITIONS[phase].longRunPercentage / 100;

    // Adjust for intensity
    const intensityMultiplier = intensity === 'conservative' ? 0.90 : intensity === 'aggressive' ? 1.10 : 1.00;

    const longRunMiles = weeklyMileage * basePercentage * intensityMultiplier;

    // Apply Hansons caps
    const caps: Record<string, number> = {
        '5k': 10,
        '10k': 12,
        'half': 14,
        'marathon': 16, // Hansons cap
        'general': 10,
    };

    // Conservative plans use stricter caps
    const cap = intensity === 'aggressive' ? caps[goalDistance] * 1.25 : caps[goalDistance];

    // Never more than 33% of weekly (Hansons rule)
    const maxAllowed = weeklyMileage * 0.33;

    return Math.round(Math.min(longRunMiles, cap, maxAllowed) * 2) / 2; // Round to nearest 0.5
}

// =============================================================================
// 80/20 DISTRIBUTION
// =============================================================================

/**
 * Calculate easy vs quality mile distribution for a week.
 * Enforces Seiler's 80/20 rule.
 */
export function calculateIntensityDistribution(
    weeklyMileage: number,
    phase: TrainingPhase,
    isRecovery: boolean
): { easyMiles: number; qualityMiles: number; easyPercentage: number } {
    // Recovery weeks are 95%+ easy
    if (isRecovery) {
        const qualityMiles = Math.round(weeklyMileage * 0.05 * 2) / 2;
        return {
            easyMiles: weeklyMileage - qualityMiles,
            qualityMiles,
            easyPercentage: 95,
        };
    }

    // Phase-based distribution
    const qualityPercentages: Record<TrainingPhase, number> = {
        base: 15,  // 85/15 - foundation phase
        build: 20, // 80/20 - standard polarized
        peak: 22,  // 78/22 - slight increase for peak
        taper: 15, // 85/15 - reduce quality slightly
    };

    const qualityPercent = qualityPercentages[phase];
    const qualityMiles = Math.round(weeklyMileage * (qualityPercent / 100) * 2) / 2;

    return {
        easyMiles: weeklyMileage - qualityMiles,
        qualityMiles,
        easyPercentage: 100 - qualityPercent,
    };
}
