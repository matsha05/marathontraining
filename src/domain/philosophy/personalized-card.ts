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
        'ultra': '30 miles',    // research/15
        'base': '8 miles',      // research/21 line 32
    },
    hansons: {
        '5k': 'N/A',
        '10k': 'N/A',
        'half': 'N/A',
        'marathon': '16 miles', // research/22 line 10
        'ultra': 'N/A',
        'base': 'N/A',
    },
    pfitzinger: {
        '5k': '10-13 miles',    // research/25 lines 27-72
        '10k': '11 miles',      // research/25 line 93
        'half': '14-19 miles',  // research/25 lines 107-171
        'marathon': '20-22 miles', // research/23 lines 11, 99, 103
        'ultra': 'N/A',
        'base': 'N/A',
    },
    daniels: {
        '5k': '10-12 miles',    // research/26 (30% of weekly volume)
        '10k': '10-12 miles',   // research/26
        'half': 'N/A',
        'marathon': '18 miles', // research/26 line 50
        'ultra': 'N/A',
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

// =============================================================================
// PERSONALIZATION FUNCTION
// =============================================================================

export interface PersonalizedPhilosophyCard extends PhilosophyMetadata {
    personalizedRunDays: string;
    personalizedLongRunCap: string;
    personalizedDuration: string;
    personalizedKeyWorkouts: string[];
}

/**
 * Generate a personalized philosophy card based on user's quiz answers.
 * All values are verified against COACHSPEC and research files.
 */
export function getPersonalizedPhilosophyCard(
    coach: TrainingPhilosophy,
    answers: QuizAnswers
): PersonalizedPhilosophyCard {
    const basePhilosophy = PHILOSOPHIES[coach];
    const distance = answers.targetDistance || 'marathon';
    const experience = answers.experience || 'intermediate';
    const userDays = answers.daysPerWeek || 4;

    // Get verified data for this combination
    const longRunCap = LONG_RUN_CAPS[coach][distance] || basePhilosophy.longRunCap;

    // Get plan spec if available
    const planSpec = PLAN_SPECS[coach]?.[distance]?.[experience];

    // Determine actual run days (user's selection if meets minimum, otherwise minimum)
    let actualDays: string;
    let keyWorkouts: string[];
    let duration: string;

    if (planSpec) {
        const meetsMinimum = userDays >= planSpec.minDays;
        actualDays = meetsMinimum
            ? `${userDays} days/week`
            : `${planSpec.minDays}+ days/week (minimum)`;
        keyWorkouts = planSpec.keyWorkouts;
        duration = planSpec.planDuration;
    } else {
        // Fallback to base philosophy data
        actualDays = basePhilosophy.runDays;
        keyWorkouts = [];
        duration = 'Variable';
    }

    return {
        ...basePhilosophy,
        personalizedRunDays: actualDays,
        personalizedLongRunCap: longRunCap,
        personalizedDuration: duration,
        personalizedKeyWorkouts: keyWorkouts,
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
        case 'ultra': return 'ultra';
        case 'base': return 'base fitness';
        default: return 'race';
    }
}
