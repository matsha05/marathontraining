/**
 * THE LONG GAME - VDOT Calibration System
 * 
 * Calibrates training VDOT (tVDOT) for athletes whose running economy
 * has not yet developed to match their aerobic capacity.
 * 
 * Key insight: Athletic beginners (CrossFit converts, cyclists) often have
 * high VO2max but poor running economy. Training at their "theoretical" VDOT
 * leads to overtraining. tVDOT protects them.
 * 
 * Source: Oracle Research (16-vdot-calibration-oracle.md)
 */

import { VDOTCalibration, VDOTSource, CalibrationFactors } from '../plan/types';

// =============================================================================
// EXPERIENCE MULTIPLIERS
// =============================================================================

/**
 * Running experience multiplier for tVDOT calculation.
 * New runners train at lower % of theoretical VDOT.
 */
function getExperienceMultiplier(experienceMonths: number): number {
    if (experienceMonths <= 6) return 0.80;
    if (experienceMonths <= 12) return 0.85;
    if (experienceMonths <= 18) return 0.90;
    if (experienceMonths <= 24) return 0.95;
    return 1.00;
}

/**
 * Weekly running volume multiplier.
 * Low-volume runners have less adaptation.
 */
function getVolumeMultiplier(weeklyMinutes: number): number {
    if (weeklyMinutes < 90) return 0.85;
    if (weeklyMinutes < 150) return 0.90;
    if (weeklyMinutes < 240) return 0.95;
    if (weeklyMinutes < 300) return 1.00;
    return 1.00;
}

/**
 * CrossFit/strength convert penalty.
 * Athletic beginners often have inflated VO2max relative to running ability.
 */
function getCrossFitConvertPenalty(
    strengthBackground: 'none' | 'recreational' | 'intermediate' | 'advanced',
    experienceMonths: number
): number {
    if (strengthBackground !== 'advanced') return 0;
    if (experienceMonths >= 12) return 0;
    // Advanced strength + <12mo running = 5% additional penalty
    return 0.05;
}

/**
 * Source confidence adjustment.
 * Race results are most reliable; estimated VDOT is least.
 */
function getSourceConfidence(source: VDOTSource): 'high' | 'medium' | 'low' {
    switch (source) {
        case 'race':
            return 'high';
        case 'time_trial':
            return 'high';
        case 'strava':
            return 'medium';
        case 'garmin':
            return 'medium';
        case 'vo2max':
            return 'medium';
        case 'estimated':
            return 'low';
        default:
            return 'low';
    }
}

// =============================================================================
// MAIN CALIBRATION FUNCTION
// =============================================================================

/**
 * Calculate calibrated VDOT values for training.
 * 
 * Returns:
 * - seedVDOT: Original input (from race, Garmin, etc.)
 * - tVDOT: Training VDOT (paces for daily training)
 * - rVDOT: Race VDOT (validated from actual race performance, starts equal to seed)
 */
export function calibrateTVDOT(
    seedVDOT: number,
    source: VDOTSource,
    factors: CalibrationFactors
): VDOTCalibration {
    const experienceMultiplier = getExperienceMultiplier(factors.runningExperienceMonths);
    const volumeMultiplier = getVolumeMultiplier(factors.weeklyVolumeMinutes);
    const convertPenalty = getCrossFitConvertPenalty(
        factors.strengthBackground,
        factors.runningExperienceMonths
    );

    // Calculate combined adjustment
    // Use the LOWER of experience/volume multipliers, then apply convert penalty
    const combinedMultiplier = Math.min(experienceMultiplier, volumeMultiplier) - convertPenalty;

    // Apply floor: tVDOT cannot go below 70% of seedVDOT
    const floor = 0.70;
    const effectiveMultiplier = Math.max(combinedMultiplier, floor);

    const tVDOT = Math.round(seedVDOT * effectiveMultiplier * 10) / 10;

    return {
        seedVDOT,
        tVDOT,
        rVDOT: seedVDOT, // Race VDOT starts equal to seed, updated after races
        source,
        confidence: getSourceConfidence(source),
        lastUpdated: new Date().toISOString(),
    };
}

// =============================================================================
// AUTO-CALIBRATION LOGIC
// =============================================================================

/**
 * Check if tVDOT should be adjusted down (athlete struggling).
 * Trigger: Failed to complete rep 3+ of interval workout 2x in 14 days.
 */
export function shouldReduceTVDOT(
    rep3Failures: number,
    windowDays: number = 14
): boolean {
    return rep3Failures >= 2;
}

/**
 * Check if tVDOT should be adjusted up (athlete ready for more).
 * Trigger: 4+ weeks of consistent training with no failures and positive trends.
 */
export function shouldIncreaseTVDOT(
    weeksSinceLastAdjustment: number,
    failureCountLast30Days: number,
    tVDOT: number,
    seedVDOT: number
): boolean {
    if (weeksSinceLastAdjustment < 4) return false;
    if (failureCountLast30Days > 0) return false;
    if (tVDOT >= seedVDOT) return false; // Already at ceiling
    return true;
}

/**
 * Calculate new tVDOT after adjustment.
 * Adjustments are conservative: +/- 1-2 VDOT points.
 */
export function adjustTVDOT(
    currentTVDOT: number,
    direction: 'up' | 'down',
    magnitude: 'small' | 'large' = 'small'
): number {
    const adjustment = magnitude === 'small' ? 1 : 2;
    return direction === 'up'
        ? currentTVDOT + adjustment
        : currentTVDOT - adjustment;
}

// =============================================================================
// VDOT ESTIMATION METHOD ACCURACY
// =============================================================================

export const VDOT_SOURCE_ACCURACY: Record<VDOTSource, number> = {
    race: 0.95,        // Most accurate (actual running performance)
    time_trial: 0.90,  // Controlled but not race conditions
    strava: 0.80,      // Algorithm estimate from HR + pace
    garmin: 0.80,      // Similar to Strava
    vo2max: 0.70,      // Lab test doesn't capture running economy
    estimated: 0.60,   // Based on training data, least reliable
};

/**
 * Get the recommended method for VDOT validation.
 * Priority: race > time_trial > strava/garmin > vo2max > estimated
 */
export function getRecommendedVDOTMethod(
    currentSource: VDOTSource
): { method: VDOTSource; reason: string } | null {
    const rank: VDOTSource[] = ['race', 'time_trial', 'strava', 'garmin', 'vo2max', 'estimated'];
    const currentRank = rank.indexOf(currentSource);

    if (currentRank <= 1) {
        return null; // Already using a good method
    }

    return {
        method: rank[0],
        reason: 'Race result provides the most accurate VDOT for training paces',
    };
}
