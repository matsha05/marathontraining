/**
 * Personalized Philosophy Card Generator
 * 
 * Generates dynamic recommendation card content based on user's
 * selected distance, days, and experience level.
 * 
 * DATA SOURCE: research/*.md files and COACHSPEC.md
 * All values verified against source materials.
 */

import {
    TrainingPhilosophy,
    TargetDistance,
    DaysPerWeek,
    Experience,
    PhilosophyMetadata,
    PHILOSOPHIES,
    QuizAnswers
} from './types';

// =============================================================================
// VERIFIED PLAN DATA (from research files)
// =============================================================================

/**
 * Long run caps by coach and distance
 * Source: research/21-higdon-complete-library.md, research/22-hansons, etc.
 */
const LONG_RUN_CAPS: Record<TrainingPhilosophy, Record<TargetDistance, string>> = {
    higdon: {
        '5k': '3 miles',        // research/21 line 183
        '10k': '5.5 miles',     // research/21 line 277
        'half': '10 miles',     // research/21 lines 374, 410, 518
        'marathon': '20 miles', // COACHSPEC & research/14
        'base': '8 miles',      // research/21 line 32
    },
    hansons: {
        '5k': 'N/A',
        '10k': 'N/A',
        'half': 'N/A',
        'marathon': '16 miles', // research/22 line 10
        'base': 'N/A',
    },
    pfitzinger: {
        '5k': '10-13 miles',    // research/25 lines 27-72
        '10k': '11 miles',      // research/25 line 93
        'half': '14-19 miles',  // research/25 lines 107-171
        'marathon': '20-22 miles', // research/23 lines 11, 99, 103
        'base': 'N/A',
    },
    daniels: {
        '5k': '10-12 miles',    // research/26 (30% of weekly volume)
        '10k': '10-12 miles',   // research/26
        'half': 'N/A',
        'marathon': '18 miles', // research/26 line 50
        'base': 'N/A',
    },
};

/**
 * Minimum and typical run days by coach, distance, and experience
 * Source: research files verified above
 */
interface PlanSpec {
    minDays: number;
    typicalDays: string;
    planDuration: string;
    keyWorkouts: string[];
}

const PLAN_SPECS: Record<TrainingPhilosophy, Partial<Record<TargetDistance, Partial<Record<Experience, PlanSpec>>>>> = {
    higdon: {
        '5k': {
            beginner: { minDays: 3, typicalDays: '3', planDuration: '8 weeks', keyWorkouts: ['Easy runs', 'Long run'] },
            intermediate: { minDays: 5, typicalDays: '5', planDuration: '8 weeks', keyWorkouts: ['Intervals', 'Fast runs', 'Long run'] },
            advanced: { minDays: 5, typicalDays: '5-6', planDuration: '8 weeks', keyWorkouts: ['400m repeats', 'Tempo', 'Fast runs'] },
        },
        '10k': {
            beginner: { minDays: 3, typicalDays: '3', planDuration: '8 weeks', keyWorkouts: ['Easy runs', 'Cross-train', 'Long run'] },
            intermediate: { minDays: 5, typicalDays: '5', planDuration: '8 weeks', keyWorkouts: ['Tempo', 'Intervals', 'Long run'] },
            advanced: { minDays: 6, typicalDays: '6', planDuration: '8 weeks', keyWorkouts: ['Tempo', '400m repeats', 'Pace runs'] },
        },
        'half': {
            beginner: { minDays: 3, typicalDays: '3-4', planDuration: '12 weeks', keyWorkouts: ['Easy runs', 'Long run', 'Tune-up races'] },
            intermediate: { minDays: 5, typicalDays: '5', planDuration: '12 weeks', keyWorkouts: ['Pace runs', 'Long run', 'Cross-train'] },
            advanced: { minDays: 6, typicalDays: '6', planDuration: '12 weeks', keyWorkouts: ['Hills', 'Tempo', 'Pace runs'] },
        },
        'marathon': {
            beginner: { minDays: 4, typicalDays: '4', planDuration: '18 weeks', keyWorkouts: ['Easy runs', 'Long run', 'Cross-train'] },
            intermediate: { minDays: 5, typicalDays: '5', planDuration: '18 weeks', keyWorkouts: ['Race pace runs', 'Long run', 'Back-to-back'] },
            advanced: { minDays: 6, typicalDays: '6', planDuration: '18 weeks', keyWorkouts: ['Speedwork', 'Tempo', 'Race pace', '3/1 long runs'] },
        },
        'base': {
            beginner: { minDays: 4, typicalDays: '4', planDuration: '12 weeks', keyWorkouts: ['Easy runs', 'Long run', 'Walking'] },
            intermediate: { minDays: 6, typicalDays: '6-7', planDuration: '12 weeks', keyWorkouts: ['Easy runs', 'Strength', 'Long run'] },
            advanced: { minDays: 6, typicalDays: '6-7', planDuration: '12 weeks', keyWorkouts: ['Hills', 'Fartlek', 'Tempo', 'Intervals'] },
        },
    },
    hansons: {
        'half': {
            // Hansons Half Marathon - uses HMP for tempo, 10K for strength
            // Source: research/27-hansons-half-marathon.md
            beginner: { minDays: 6, typicalDays: '6', planDuration: '18 weeks', keyWorkouts: ['Speed intervals', 'Tempo at HMP', 'Long run (12mi cap)'] },
            intermediate: { minDays: 6, typicalDays: '6', planDuration: '18 weeks', keyWorkouts: ['Speed intervals', 'Tempo at HMP', 'Long run (12mi cap)'] },
            advanced: { minDays: 6, typicalDays: '6', planDuration: '18 weeks', keyWorkouts: ['5K-10K intervals', 'Tempo at HMP', 'Long run (14mi cap)', '10K pace work'] },
        },
        'marathon': {
            beginner: { minDays: 6, typicalDays: '6', planDuration: '18 weeks', keyWorkouts: ['Speed intervals', 'Tempo at MP', 'Long run (16mi cap)'] },
            intermediate: { minDays: 6, typicalDays: '6', planDuration: '18 weeks', keyWorkouts: ['Speed intervals', 'Tempo at MP', 'Long run (16mi cap)'] },
            advanced: { minDays: 6, typicalDays: '6', planDuration: '18 weeks', keyWorkouts: ['Speed intervals', 'Tempo at MP', 'Long run (16mi cap)', 'MP-10s work'] },
        },
    },
    pfitzinger: {
        '5k': {
            intermediate: { minDays: 5, typicalDays: '5-6', planDuration: '12 weeks', keyWorkouts: ['LT intervals', 'VO2max', 'Speed work'] },
            advanced: { minDays: 6, typicalDays: '6', planDuration: '12 weeks', keyWorkouts: ['LT intervals', 'VO2max', 'Speed work', 'Tune-up races'] },
        },
        '10k': {
            intermediate: { minDays: 5, typicalDays: '5-6', planDuration: '12 weeks', keyWorkouts: ['LT intervals', 'VO2max', 'Race pace work'] },
            advanced: { minDays: 6, typicalDays: '6', planDuration: '12 weeks', keyWorkouts: ['LT intervals', 'VO2max', 'Race pace work'] },
        },
        'half': {
            intermediate: { minDays: 5, typicalDays: '5-6', planDuration: '12 weeks', keyWorkouts: ['LT tempo', 'VO2max intervals', 'Progression runs'] },
            advanced: { minDays: 6, typicalDays: '6', planDuration: '12 weeks', keyWorkouts: ['LT tempo', 'VO2max intervals', 'Progression runs', 'MLR'] },
        },
        'marathon': {
            intermediate: { minDays: 6, typicalDays: '6', planDuration: '18 weeks', keyWorkouts: ['LT tempo', 'MP long runs', 'Medium-long runs'] },
            advanced: { minDays: 6, typicalDays: '6', planDuration: '18 weeks', keyWorkouts: ['LT tempo', 'MP long runs', 'VO2max', 'MLR'] },
        },
    },
    daniels: {
        '5k': {
            intermediate: { minDays: 4, typicalDays: '4-5', planDuration: '24 weeks', keyWorkouts: ['I pace intervals', 'R pace repeats', 'T pace tempo'] },
            advanced: { minDays: 5, typicalDays: '5-6', planDuration: '24 weeks', keyWorkouts: ['I pace intervals', 'R pace repeats', 'T pace tempo'] },
        },
        '10k': {
            intermediate: { minDays: 4, typicalDays: '4-5', planDuration: '24 weeks', keyWorkouts: ['I pace intervals', 'T pace tempo', 'Long runs'] },
            advanced: { minDays: 5, typicalDays: '5-6', planDuration: '24 weeks', keyWorkouts: ['I pace intervals', 'T pace tempo', 'Long runs'] },
        },
        'marathon': {
            intermediate: { minDays: 4, typicalDays: '4-5', planDuration: '18 weeks', keyWorkouts: ['Q1 long run with work', 'Q2 tempo/intervals'] },
            advanced: { minDays: 5, typicalDays: '5-6', planDuration: '18 weeks', keyWorkouts: ['Q1 long run with M/T work', 'Q2 tempo/intervals'] },
        },
    },
};

/**
 * Typical week schedules by coach, distance, and tier
 * Source: research/21-higdon-complete-library.md, research/22-hansons, etc.
 */
const TYPICAL_WEEKS: Record<TrainingPhilosophy, Partial<Record<TargetDistance, Partial<Record<Experience, string[]>>>>> = {
    higdon: {
        '5k': {
            beginner: [
                'M: Rest/r-w', 'T: 1.5-3 mi', 'W: Rest/r-w', 'Th: 1.5-2 mi',
                'F: Rest', 'S: 1.5-3 mi', 'Su: 30-60 min walk'
            ],
            intermediate: [
                'M: Rest', 'T: 3 mi', 'W: 5-8×400m', 'Th: 3 mi',
                'F: Rest', 'S: 3 mi fast', 'Su: 5-7 mi'
            ],
            advanced: [
                'M: 3 mi', 'T: 400/200 intervals', 'W: Rest/easy', 'Th: 30-45 min tempo',
                'F: Rest', 'S: 4-6 mi fast', 'Su: 60-90 min'
            ],
        },
        '10k': {
            beginner: [
                'M: Rest', 'T: 2.5-3 mi', 'W: 30-35 min XT', 'Th: 2 mi',
                'F: Rest', 'S: 40 min XT', 'Su: Long run'
            ],
            intermediate: [
                'M: 3 mi', 'T: 3.5-6 mi', 'W: Tempo or 8-10×400', 'Th: 3-4 mi',
                'F: Rest', 'S: 60 min XT', 'Su: Long run'
            ],
            advanced: [
                'M: 3 mi', 'T: 30-60 min tempo', 'W: 6-12×400', 'Th: 3-6 mi',
                'F: Rest/3 mi', 'S: 5-6 mi pace', 'Su: Long run (3/1)'
            ],
        },
        'half': {
            beginner: [
                'M: Rest', 'T: 3-5 mi', 'W: 2-3 mi/XT', 'Th: 3-5 mi',
                'F: Rest', 'S: 30 min XT', 'Su: Long run'
            ],
            intermediate: [
                'M: 30-60 min XT', 'T: 3-5 mi', 'W: 4-8 mi pace', 'Th: 3-5 mi',
                'F: Rest', 'S: 3-5 mi pace', 'Su: Long run'
            ],
            advanced: [
                'M: 3 mi', 'T: Hills/Intervals', 'W: 3 mi', 'Th: 30-50 min tempo',
                'F: Rest', 'S: 3-4 mi pace', 'Su: 90-100 min (3/1)'
            ],
        },
        'marathon': {
            beginner: [
                'M: Rest', 'T: 3-4 mi', 'W: Cross-train', 'Th: 3-4 mi',
                'F: Rest', 'S: Cross-train (opt)', 'Su: Long run'
            ],
            intermediate: [
                'M: Rest', 'T: 5 mi', 'W: 5-8 mi pace', 'Th: 5 mi',
                'F: Rest', 'S: Cross-train', 'Su: Long run'
            ],
            advanced: [
                'M: 3 mi', 'T: Intervals', 'W: 6-10 mi', 'Th: 3 mi',
                'F: Tempo', 'S: Race pace (3/1)', 'Su: Long run'
            ],
        },
        'base': {
            beginner: [
                'M: Rest', 'T: 3 mi', 'W: 3 mi', 'Th: 3 mi',
                'F: Rest', 'S: 30 min walk', 'Su: Long run'
            ],
            intermediate: [
                'M: 3 mi', 'T: 3 mi + str', 'W: 4-8 mi', 'Th: 3 mi',
                'F: 3 mi + str', 'S: 3 mi', 'Su: Long run'
            ],
            advanced: [
                'M: 3 mi + str', 'T: Hills/Intervals', 'W: 3 mi + stretch', 'Th: Tempo/Fartlek',
                'F: 3 mi + str', 'S: 30 min fartlek', 'Su: Long run or Race'
            ],
        },
    },
    hansons: {
        'marathon': {
            beginner: [
                'M: Easy', 'T: Speed intervals', 'W: Rest/XT', 'Th: Tempo at MP',
                'F: Easy', 'S: Easy (pre-long)', 'Su: Long run (16mi cap)'
            ],
            intermediate: [
                'M: Easy', 'T: Speed intervals', 'W: Rest/XT', 'Th: Tempo at MP',
                'F: Easy', 'S: Easy (pre-long)', 'Su: Long run (16mi cap)'
            ],
            advanced: [
                'M: Easy', 'T: Speed intervals', 'W: Rest/XT', 'Th: Tempo at MP-10s',
                'F: Easy', 'S: Easy (pre-long)', 'Su: Long run (16mi cap)'
            ],
        },
        'half': {
            // Half marathon uses HMP (Half Marathon Pace) for tempo, 10K pace for strength
            // Source: research/27-hansons-half-marathon.md
            beginner: [
                'M: Easy', 'T: Speed intervals (5K-10K)', 'W: Rest/XT', 'Th: Tempo at HMP',
                'F: Easy', 'S: Easy', 'Su: Long run (12mi cap)'
            ],
            intermediate: [
                'M: Easy', 'T: Speed intervals (5K-10K)', 'W: Rest/XT', 'Th: Tempo at HMP',
                'F: Easy', 'S: Easy', 'Su: Long run (12mi cap)'
            ],
            advanced: [
                'M: Easy', 'T: Strength intervals (10K)', 'W: Rest/XT', 'Th: Tempo at HMP',
                'F: Easy', 'S: Easy', 'Su: Long run (14mi cap)'
            ],
        },
    },
    pfitzinger: {
        '5k': {
            intermediate: [
                'M: Recovery', 'T: LT intervals', 'W: Recovery', 'Th: VO2max',
                'F: Rest/easy', 'S: Speed', 'Su: Endurance (10-13 mi)'
            ],
            advanced: [
                'M: Recovery', 'T: LT intervals', 'W: Recovery (AM)/Speed (PM)', 'Th: VO2max',
                'F: Rest', 'S: Tune-up race', 'Su: Endurance (10-13 mi)'
            ],
        },
        '10k': {
            intermediate: [
                'M: Recovery', 'T: LT tempo', 'W: Recovery', 'Th: VO2max',
                'F: Rest/easy', 'S: Race pace', 'Su: Endurance (11 mi)'
            ],
            advanced: [
                'M: Recovery', 'T: LT intervals', 'W: Recovery', 'Th: VO2max',
                'F: Rest', 'S: Race pace', 'Su: Endurance (11 mi)'
            ],
        },
        'half': {
            intermediate: [
                'M: Recovery', 'T: LT tempo', 'W: Recovery', 'Th: VO2max',
                'F: Rest/easy', 'S: Progression', 'Su: Long run (14-19 mi)'
            ],
            advanced: [
                'M: Recovery', 'T: LT tempo', 'W: Medium-long', 'Th: VO2max',
                'F: Rest', 'S: Progression', 'Su: Long run (14-19 mi)'
            ],
        },
        'marathon': {
            intermediate: [
                'M: Recovery (5-7 mi)', 'T: LT tempo (8-10 mi)', 'W: MLR (12-15 mi)', 'Th: Recovery (5-7 mi)',
                'F: Rest/easy (4-6 mi)', 'S: VO2max or tune-up', 'Su: Long run (18-22 mi + MP)'
            ],
            advanced: [
                'M: Recovery', 'T: LT tempo', 'W: MLR (12-15 mi)', 'Th: Recovery',
                'F: Rest/easy', 'S: VO2max', 'Su: Long run (20-22 mi + MP)'
            ],
        },
    },
    daniels: {
        '5k': {
            intermediate: [
                'M: E pace', 'T: Quality #1 (I/T)', 'W: E pace', 'Th: E/off',
                'F: E pace', 'S: Strides', 'Su: Quality #2 (Long + work)'
            ],
            advanced: [
                'M: E pace', 'T: Quality #1 (I or R)', 'W: E pace', 'Th: E/off',
                'F: E pace', 'S: Strides', 'Su: Quality #2 (Long + T)'
            ],
        },
        '10k': {
            intermediate: [
                'M: E pace', 'T: Quality #1 (I/T)', 'W: E pace', 'Th: E/off',
                'F: E pace', 'S: Strides', 'Su: Quality #2 (Long + work)'
            ],
            advanced: [
                'M: E pace', 'T: Quality #1 (I/T)', 'W: E pace', 'Th: E/off',
                'F: E pace', 'S: Strides', 'Su: Quality #2 (Long + M/T)'
            ],
        },
        'marathon': {
            intermediate: [
                'M: E pace', 'T: Quality #1 (T session)', 'W: E pace', 'Th: E/off',
                'F: E pace', 'S: Recovery/strides', 'Su: Quality #2 (Long + M/T work)'
            ],
            advanced: [
                'M: E pace', 'T: Quality #1 (I/T)', 'W: E pace', 'Th: E/off',
                'F: E pace', 'S: Recovery', 'Su: Quality #2 (Long + M/T work)'
            ],
        },
    },
};

// =============================================================================
// PERSONALIZATION FUNCTION
// =============================================================================

export interface PersonalizedPhilosophyCard extends PhilosophyMetadata {
    personalizedRunDays: string;
    personalizedLongRunCap: string;
    personalizedDuration: string;
    personalizedKeyWorkouts: string[];
    personalizedTypicalWeek: string[];
    // The actual tier being used (may differ from requested due to day constraints)
    effectiveTier: Experience;
    // Adjustment context (when tier was auto-downgraded)
    tierAdjusted: boolean;
    adjustedTier: Experience | null;
    adjustmentReason: string | null;
}

/**
 * Find the best-fitting tier for a user's available days.
 * Prioritizes the user's selected tier, then downgrades if needed.
 */
function findBestFittingTier(
    coach: TrainingPhilosophy,
    distance: TargetDistance,
    preferredTier: Experience,
    userDays: number
): { tier: Experience; adjusted: boolean; reason: string | null } {
    const distanceSpecs = PLAN_SPECS[coach]?.[distance];
    if (!distanceSpecs) {
        return { tier: preferredTier, adjusted: false, reason: null };
    }

    // Check if preferred tier fits
    const preferredSpec = distanceSpecs[preferredTier];
    if (preferredSpec && userDays >= preferredSpec.minDays) {
        return { tier: preferredTier, adjusted: false, reason: null };
    }

    // Tier priority for downgrade: beginner > intermediate > advanced
    const tierPriority: Experience[] = ['beginner', 'intermediate', 'advanced'];

    // Find the most demanding tier that the user can handle
    let bestFit: { tier: Experience; minDays: number } | null = null;

    for (const tier of tierPriority) {
        const spec = distanceSpecs[tier];
        if (spec && userDays >= spec.minDays) {
            // User can handle this tier - take the most demanding one they can do
            if (!bestFit || spec.minDays > bestFit.minDays) {
                bestFit = { tier, minDays: spec.minDays };
            }
        }
    }

    if (bestFit) {
        const originalSpec = preferredSpec;
        const originalDays = originalSpec?.minDays || 'N/A';
        return {
            tier: bestFit.tier,
            adjusted: true,
            reason: `Adjusted to ${bestFit.tier} tier to fit your ${userDays}-day schedule. ${preferredTier.charAt(0).toUpperCase() + preferredTier.slice(1)} requires ${originalDays} days/week.`,
        };
    }

    // No tier fits - return preferred with a warning
    const lowestTier = tierPriority.find(t => distanceSpecs[t]);
    const lowestSpec = lowestTier ? distanceSpecs[lowestTier] : null;

    return {
        tier: lowestTier || preferredTier,
        adjusted: true,
        reason: lowestSpec
            ? `Your ${userDays} days/week is below the minimum (${lowestSpec.minDays} days) for any ${distance} plan with this coach. Consider a shorter distance or adding a training day.`
            : null,
    };
}

/**
 * Generate a personalized philosophy card based on user's quiz answers.
 * Auto-downgrades tier when days don't fit, with clear context.
 */
export function getPersonalizedPhilosophyCard(
    coach: TrainingPhilosophy,
    answers: QuizAnswers
): PersonalizedPhilosophyCard {
    const basePhilosophy = PHILOSOPHIES[coach];
    const distance = answers.targetDistance || 'marathon';
    const userDays = answers.daysPerWeek || 4;

    // Infer experience from mileage when not explicitly provided (quiz removed experience question)
    let preferredExperience: Experience;
    if (answers.experience) {
        preferredExperience = answers.experience;
    } else if (answers.currentMileage === 'under_20') {
        preferredExperience = 'beginner';
    } else if (answers.currentMileage === 'over_40') {
        preferredExperience = 'advanced';
    } else {
        preferredExperience = 'intermediate'; // 20-40 mpw
    }

    // Get verified data for this combination
    const longRunCap = LONG_RUN_CAPS[coach][distance] || basePhilosophy.longRunCap;

    // Find best-fitting tier with auto-downgrade
    const tierResult = findBestFittingTier(coach, distance, preferredExperience, userDays);
    const effectiveTier = tierResult.tier;

    // Get plan spec for the effective tier
    const planSpec = PLAN_SPECS[coach]?.[distance]?.[effectiveTier];

    // Determine actual run days and workouts
    let actualDays: string;
    let keyWorkouts: string[];
    let duration: string;

    if (planSpec) {
        // User fits this tier - show their actual days
        actualDays = `${userDays} days/week`;
        keyWorkouts = planSpec.keyWorkouts;
        duration = planSpec.planDuration;
    } else {
        // Fallback to base philosophy data
        actualDays = basePhilosophy.runDays;
        keyWorkouts = [];
        duration = 'Variable';
    }

    // Get the typical week for this coach/distance/tier
    const typicalWeek = TYPICAL_WEEKS[coach]?.[distance]?.[effectiveTier]
        || PHILOSOPHIES[coach].methodology.typicalWeek;

    return {
        ...basePhilosophy,
        personalizedRunDays: actualDays,
        personalizedLongRunCap: longRunCap,
        personalizedDuration: duration,
        personalizedKeyWorkouts: keyWorkouts,
        personalizedTypicalWeek: typicalWeek,
        effectiveTier,
        tierAdjusted: tierResult.adjusted,
        adjustedTier: tierResult.adjusted ? effectiveTier : null,
        adjustmentReason: tierResult.reason,
    };
}

/**
 * Get distance-specific key principles for a coach.
 * Adapts the methodology description to the user's selected distance.
 */
export function getDistanceSpecificPrinciples(
    coach: TrainingPhilosophy,
    distance: TargetDistance
): string[] {
    const base = PHILOSOPHIES[coach].methodology.keyPrinciples;

    // For non-marathon distances, adapt marathon-specific language
    if (distance !== 'marathon') {
        return base.map(principle => {
            // Replace marathon-specific references
            return principle
                .replace(/20 miles/g, LONG_RUN_CAPS[coach][distance] || '10 miles')
                .replace(/26\.2/g, getDistanceLabel(distance))
                .replace(/marathon/gi, getDistanceLabel(distance));
        });
    }

    return base;
}

function getDistanceLabel(distance: TargetDistance): string {
    switch (distance) {
        case '5k': return '5K';
        case '10k': return '10K';
        case 'half': return 'half marathon';
        case 'marathon': return 'marathon';
        case 'base': return 'base fitness';
        default: return 'race';
    }
}

/**
 * Get the typical week schedule for a coach/distance/tier combination.
 * Returns research-verified week structure, falling back to static data if not found.
 * NOTE: This is now private - use PersonalizedPhilosophyCard.personalizedTypicalWeek instead
 */
function getTypicalWeek(
    coach: TrainingPhilosophy,
    distance: TargetDistance,
    tier: Experience
): string[] {
    return TYPICAL_WEEKS[coach]?.[distance]?.[tier]
        || PHILOSOPHIES[coach].methodology.typicalWeek;
}

/**
 * Get minimum days required for a distance across ALL coaches.
 * Returns the lowest minDays from any coach that supports this distance.
 */
export function getMinDaysForDistance(distance: TargetDistance): number {
    let minDays = 99;

    // Check all coaches and all tiers
    for (const coach of Object.keys(PLAN_SPECS) as TrainingPhilosophy[]) {
        const distanceSpec = PLAN_SPECS[coach]?.[distance];
        if (distanceSpec) {
            for (const tierSpec of Object.values(distanceSpec)) {
                if (tierSpec?.minDays && tierSpec.minDays < minDays) {
                    minDays = tierSpec.minDays;
                }
            }
        }
    }

    // Default fallback if no data found
    return minDays < 99 ? minDays : 4;
}
