/**
 * THE LONG GAME - Coach Matcher
 * 
 * Central aggregator that imports eligibility from each coach module and
 * provides a unified interface for matching users to coaches based on
 * their days/week, weekly mileage, and target distance.
 * 
 * Philosophy: Each coach module owns its eligibility thresholds because
 * they're derived from that coach's training philosophy. This file aggregates
 * them for the recommendation engine.
 */

import { TrainingPhilosophy, TargetDistance, Experience } from './types';
import { HANSONS_ELIGIBILITY, type CoachEligibility } from '../plan/coaches/hansons';
import { HIGDON_ELIGIBILITY, HIGDON_DAYS_BY_DISTANCE } from '../plan/coaches/higdon';
import { PFITZ_ELIGIBILITY } from '../plan/coaches/pfitzinger';
import { DANIELS_ELIGIBILITY } from '../plan/coaches/daniels';

// =============================================================================
// AGGREGATED ELIGIBILITY
// =============================================================================

/**
 * All coach eligibility criteria in one place.
 * Each value is imported from the respective coach module.
 */
export const COACH_ELIGIBILITY: Record<TrainingPhilosophy, CoachEligibility> = {
    higdon: HIGDON_ELIGIBILITY,
    hansons: HANSONS_ELIGIBILITY,
    pfitzinger: PFITZ_ELIGIBILITY,
    daniels: DANIELS_ELIGIBILITY,
};

/**
 * Distance-specific day requirements for Higdon.
 * Higdon is the only coach with per-distance variations (3-day HM vs 4-day marathon).
 */
export { HIGDON_DAYS_BY_DISTANCE };

// =============================================================================
// COACH MATCHING
// =============================================================================

export interface CoachMatchResult {
    /** Coaches that fit the user's criteria */
    eligibleCoaches: TrainingPhilosophy[];

    /** Coaches excluded with reasons */
    excludedCoaches: {
        coach: TrainingPhilosophy;
        reason: string;
        fixSuggestion?: string;
        /** If excluded due to days, the minimum days needed */
        requiredDays?: number;
        /** If excluded due to mileage, the minimum mileage needed */
        requiredMileage?: number;
        /** Type of fix needed */
        fixType?: 'days' | 'mileage' | 'distance';
    }[];

    /** Inferred tier for each eligible coach (mileage-based) */
    inferredTiers: Record<TrainingPhilosophy, string>;

    /** Warnings about potential issues (e.g., aggressive ramp) */
    warnings: string[];

    /** Whether ANY coach is available */
    hasMatch: boolean;

    /** Suggestions if no match */
    noMatchSuggestions?: string[];
}

/**
 * Match coaches to user profile.
 * 
 * @param distance - Target race distance
 * @param daysPerWeek - Available training days
 * @param weeklyMileage - Current weekly mileage (last 4 weeks average)
 */
export function matchCoachesToUser(
    distance: TargetDistance,
    daysPerWeek: number,
    weeklyMileage: number
): CoachMatchResult {
    const eligibleCoaches: TrainingPhilosophy[] = [];
    const excludedCoaches: CoachMatchResult['excludedCoaches'] = [];
    const inferredTiers: Record<TrainingPhilosophy, string> = {} as Record<TrainingPhilosophy, string>;
    const warnings: string[] = [];

    const allCoaches: TrainingPhilosophy[] = ['higdon', 'hansons', 'pfitzinger', 'daniels'];

    for (const coach of allCoaches) {
        const eligibility = COACH_ELIGIBILITY[coach];

        // Check 1: Does coach support this distance?
        if (!eligibility.distances.includes(distance)) {
            excludedCoaches.push({
                coach,
                reason: `${formatCoachName(coach)} doesn't have a ${formatDistance(distance)} plan`,
                fixType: 'distance',
            });
            continue;
        }

        // Check 2: Does user have enough days?
        const minDays = getMinDaysForCoach(coach, distance);
        if (daysPerWeek < minDays) {
            excludedCoaches.push({
                coach,
                reason: `${formatCoachName(coach)} requires ${minDays}+ days/week for ${formatDistance(distance)}`,
                fixSuggestion: `Add ${minDays - daysPerWeek} training day${minDays - daysPerWeek > 1 ? 's' : ''} to unlock`,
                requiredDays: minDays,
                fixType: 'days',
            });
            continue;
        }

        // Check 3: Does user have enough base mileage?
        if (weeklyMileage < eligibility.minMileage) {
            excludedCoaches.push({
                coach,
                reason: `${formatCoachName(coach)} recommends ${eligibility.minMileage}+ mpw base`,
                fixSuggestion: 'Start with base building to increase weekly mileage',
                requiredMileage: eligibility.minMileage,
                fixType: 'mileage',
            });
            continue;
        }

        // Coach is eligible!
        eligibleCoaches.push(coach);

        // Infer tier from mileage
        inferredTiers[coach] = inferTierFromMileage(coach, weeklyMileage);

        // Check for ramp rate warnings
        const tierConfig = eligibility.tiers[inferredTiers[coach]];
        if (tierConfig && tierConfig.startMileage > weeklyMileage * 1.2) {
            warnings.push(
                `${formatCoachName(coach)}'s ${inferredTiers[coach]} plan starts at ${tierConfig.startMileage} mpw. ` +
                `Your ${weeklyMileage} mpw base may make this aggressive.`
            );
        }
    }

    // Generate suggestions if no match
    const noMatchSuggestions: string[] = [];
    if (eligibleCoaches.length === 0) {
        // Find the closest option
        if (daysPerWeek < 4) {
            noMatchSuggestions.push(
                `Add 1 training day to unlock more options`,
                `Try 5K or 10K which work with ${daysPerWeek} days/week`
            );
        }
        if (weeklyMileage < 25) {
            noMatchSuggestions.push(
                `Start with Higdon Base Building to increase your weekly mileage`
            );
        }
    }

    return {
        eligibleCoaches,
        excludedCoaches,
        inferredTiers,
        warnings,
        hasMatch: eligibleCoaches.length > 0,
        noMatchSuggestions: noMatchSuggestions.length > 0 ? noMatchSuggestions : undefined,
    };
}

// =============================================================================
// TIER INFERENCE
// =============================================================================

/**
 * Infer the best tier for a coach based on user's weekly mileage.
 */
export function inferTierFromMileage(coach: TrainingPhilosophy, weeklyMileage: number): string {
    const eligibility = COACH_ELIGIBILITY[coach];

    // Find the highest tier the user qualifies for
    let bestTier = Object.keys(eligibility.tiers)[0];

    for (const [tierName, tierConfig] of Object.entries(eligibility.tiers)) {
        const [min, max] = tierConfig.mileageRange;
        if (weeklyMileage >= min && weeklyMileage <= max) {
            bestTier = tierName;
            // Don't break - continue to find highest qualifying tier
        }
    }

    return bestTier;
}

/**
 * Map inferred tier to the Experience type used in recommendation system.
 */
export function tierToExperience(tier: string): Experience {
    const lowerTier = tier.toLowerCase();

    if (lowerTier.includes('novice') || lowerTier.includes('beginner')) {
        return 'beginner';
    }
    if (lowerTier.includes('advanced') || lowerTier.includes('85') || lowerTier.includes('70')) {
        return 'advanced';
    }
    return 'intermediate';
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get minimum days required for a coach at a specific distance.
 */
function getMinDaysForCoach(coach: TrainingPhilosophy, distance: TargetDistance): number {
    if (coach === 'higdon') {
        // Higdon has per-distance requirements
        return HIGDON_DAYS_BY_DISTANCE[distance as keyof typeof HIGDON_DAYS_BY_DISTANCE] ?? 4;
    }
    return COACH_ELIGIBILITY[coach].minDays;
}

/**
 * Format coach name for display.
 */
function formatCoachName(coach: TrainingPhilosophy): string {
    switch (coach) {
        case 'higdon': return 'Hal Higdon';
        case 'hansons': return 'Hansons';
        case 'pfitzinger': return 'Pfitzinger';
        case 'daniels': return 'Jack Daniels';
    }
}

/**
 * Format distance for display.
 */
function formatDistance(distance: TargetDistance): string {
    switch (distance) {
        case '5k': return '5K';
        case '10k': return '10K';
        case 'half': return 'Half Marathon';
        case 'marathon': return 'Marathon';
        case 'base': return 'Base Building';
        default: return distance;
    }
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { CoachEligibility };
