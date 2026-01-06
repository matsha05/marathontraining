/**
 * THE LONG GAME - Unified Coaching Context Service
 * 
 * Elite engineering: Single source of truth for ALL coaching explanations.
 * This service aggregates explanations from all coach modules and provides
 * type-safe access for UI components.
 * 
 * Philosophy: Every workout should tell the athlete WHY they're doing it,
 * HOW it should feel, and what it's BUILDING toward.
 */

import type { WorkoutType, TrainingPhase, TrainingZone } from '../plan/types';

// Import coach-specific explanations
import {
    HANSONS_COACHING_EXPLANATIONS,
    HANSONS_PHASE_EXPLANATIONS,
    HANSONS_WHY_16_EXPLANATION,
    type HansonsWorkoutExplanation,
} from '../plan/coaches/hansons';

import {
    PFITZ_COACHING_EXPLANATIONS,
    PFITZ_PHASE_EXPLANATIONS,
    PFITZ_MLR_EXPLANATION,
    PFITZ_MP_LONG_RUN_EXPLANATION,
    type PfitzWorkoutExplanation,
} from '../plan/coaches/pfitzinger';

import {
    DANIELS_INTENSITY_EXPLANATIONS,
    DANIELS_PHASE_EXPLANATIONS,
    DANIELS_VDOT_EXPLANATION,
    DANIELS_2Q_EXPLANATION,
    type DanielsIntensityExplanation,
} from '../plan/coaches/daniels';

// =============================================================================
// TYPES
// =============================================================================

export type CoachPhilosophy = 'higdon' | 'hansons' | 'pfitzinger' | 'daniels';

export interface WorkoutContext {
    /** Display title for the workout type */
    title: string;
    /** Brief description of what this workout is */
    description: string;
    /** The WHY - physiological purpose */
    why: string;
    /** How it should FEEL during execution */
    feel: string;
    /** Optional coach-specific tip */
    coachTip?: string;
    /** Optional effort level indicator */
    effortLevel?: string;
    /** The source coach/methodology */
    source: CoachPhilosophy;
}

export interface PhaseContext {
    /** Display title for the phase */
    title: string;
    /** Brief description */
    description: string;
    /** What this phase is building */
    focus: string;
    /** The source coach/methodology */
    source: CoachPhilosophy;
}

export interface IntensityContext {
    /** Display title */
    title: string;
    /** Zone abbreviation (E, M, T, I, R) */
    abbreviation: TrainingZone;
    /** Brief description */
    description: string;
    /** The WHY */
    why: string;
    /** How it should feel */
    feel: string;
    /** Effort level as percentage of VDOT */
    effortLevel: string;
    /** Coach tip */
    coachTip?: string;
}

// =============================================================================
// HIGDON COACHING EXPLANATIONS
// =============================================================================

/**
 * Higdon workout explanations in Hal's voice.
 * Source: halhigdon.com + research/higdon-master.md
 */
const HIGDON_WORKOUT_EXPLANATIONS: Record<string, WorkoutContext> = {
    easy: {
        title: 'Easy Run',
        description: 'Comfortable, conversational pace.',
        why: 'Easy running builds your aerobic base without accumulating significant fatigue. It allows you to add volume while staying healthy.',
        feel: 'You should be able to hold a full conversation. If you can\'t talk, you\'re running too fast.',
        coachTip: 'Don\'t worry about pace. Just run at a comfortable effort.',
        source: 'higdon',
    },
    long_easy: {
        title: 'Long Run',
        description: 'The cornerstone of marathon training.',
        why: 'Long runs teach your body to burn fat for fuel, build mental toughness, and prepare your legs for hours on the road.',
        feel: 'Run 30-90 seconds per mile slower than marathon pace. Walking breaks are fine and encouraged.',
        coachTip: 'The purpose is time on your feet, not speed. Slow down.',
        source: 'higdon',
    },
    tempo: {
        title: 'Tempo Run',
        description: 'A controlled, moderately hard effort.',
        why: 'Tempo runs improve your lactate threshold - the pace you can sustain without accumulating fatigue.',
        feel: 'Start easy for 10-15 minutes, build gradually to near 10K effort, hold for 6-8 minutes, then ease back.',
        coachTip: 'The "peak" effort is only held for 6-8 minutes maximum. This isn\'t a race.',
        source: 'higdon',
    },
    hills: {
        title: 'Hill Repeats',
        description: 'Running hard up a moderate hill with recovery jog down.',
        why: 'Hills build leg strength and running power. They\'re speedwork in disguise without the impact stress of the track.',
        feel: 'Run up hard (not all-out), jog/walk down. Use a 3:1 ratio of up to recovery time at first.',
        coachTip: 'Find a hill about 1/4 mile long. Focus on form, not speed.',
        source: 'higdon',
    },
    vo2max_800s: {
        title: '800m Intervals',
        description: 'Track repeats at faster than marathon pace.',
        why: 'Intervals improve your VO2max and running economy at faster speeds. They teach your legs to turn over quickly.',
        feel: 'Faster than marathon pace, but controlled. 400m recovery jog between repeats.',
        coachTip: 'If you want to run a 3:10 marathon, do your 800s in 3:10 (per 800m).',
        source: 'higdon',
    },
    cross_train: {
        title: 'Cross Training',
        description: 'Any aerobic exercise other than running.',
        why: 'Cross training maintains aerobic fitness while giving your running muscles a break. It reduces injury risk.',
        feel: 'Keep it easy - 30-60 minutes. Swimming, cycling, walking are all great options.',
        coachTip: 'Avoid sports with sudden or sideways movements.',
        source: 'higdon',
    },
    rest: {
        title: 'Rest Day',
        description: 'Complete rest from training.',
        why: 'Rest is when your muscles rebuild and adapt to training stress. It\'s an essential part of the program.',
        feel: 'Take the day completely off. Your body is getting stronger.',
        source: 'higdon',
    },
    long_fast_finish: {
        title: '3/1 Long Run',
        description: 'Long run with a faster finish.',
        why: 'Teaches your body to run faster on tired legs - exactly what you need in the marathon.',
        feel: 'Run the first 3/4 easy, then pick up to "steady" for the final 1/4. Not race pace.',
        coachTip: 'Do this pattern at most once every 3 weeks.',
        source: 'higdon',
    },
};

const HIGDON_PHASE_EXPLANATIONS: Record<TrainingPhase, PhaseContext> = {
    base: {
        title: 'Base Phase',
        description: 'Building your aerobic foundation.',
        focus: 'Easy running, building weekly mileage gradually. No quality sessions yet.',
        source: 'higdon',
    },
    build: {
        title: 'Build Phase',
        description: 'Adding quality and long runs.',
        focus: 'Increasing long run distance, introducing tempo and pace runs. Building toward peak.',
        source: 'higdon',
    },
    peak: {
        title: 'Peak Phase',
        description: 'Highest mileage and longest runs.',
        focus: 'Your 20-milers happen here. This is the hard work phase. Trust the process.',
        source: 'higdon',
    },
    taper: {
        title: 'Taper Phase',
        description: 'Reducing volume before race day.',
        focus: 'Your body absorbs the training. Mileage drops dramatically. Arrive fresh.',
        source: 'higdon',
    },
};

// =============================================================================
// UNIFIED CONTEXT GETTERS
// =============================================================================

/**
 * Get coaching context for a workout type, with coach-specific customization.
 */
export function getWorkoutContext(
    workoutType: WorkoutType,
    coach: CoachPhilosophy = 'higdon'
): WorkoutContext {
    // Map workout types to explanation keys
    const typeMapping: Partial<Record<WorkoutType, string>> = {
        easy: 'easy',
        recovery: 'recovery',
        tempo: 'tempo',
        long_easy: 'long_run',
        long_progression: 'long_run',
        long_mp_finish: 'long_run_mp',
        long_fast_finish: 'long_run',
        vo2max_800s: 'vo2max',
        vo2max_1000s: 'vo2max',
        vo2max_1200s: 'vo2max',
        vo2max_mile: 'vo2max',
        hills: 'hills',
        rest: 'rest',
        cross_train: 'cross_train',
        threshold: 'lactate_threshold',
        cruise_intervals: 'lactate_threshold',
        strides: 'general_aerobic',
        speed_200s: 'speed',
        speed_400s: 'speed',
        race_simulation: 'tune_up_race',
        fartlek: 'tempo',
    };

    const key = typeMapping[workoutType] || workoutType.toString();

    // Coach-specific context
    switch (coach) {
        case 'hansons': {
            const hsKey = key as keyof typeof HANSONS_COACHING_EXPLANATIONS;
            if (HANSONS_COACHING_EXPLANATIONS[hsKey]) {
                const exp = HANSONS_COACHING_EXPLANATIONS[hsKey];
                return {
                    title: exp.title,
                    description: exp.description,
                    why: exp.why,
                    feel: exp.feel,
                    coachTip: exp.coachTip,
                    source: 'hansons',
                };
            }
            break;
        }

        case 'pfitzinger': {
            const pfKey = key as keyof typeof PFITZ_COACHING_EXPLANATIONS;
            if (PFITZ_COACHING_EXPLANATIONS[pfKey]) {
                const exp = PFITZ_COACHING_EXPLANATIONS[pfKey];
                return {
                    title: exp.title,
                    description: exp.description,
                    why: exp.why,
                    feel: exp.feel,
                    coachTip: exp.coachTip,
                    source: 'pfitzinger',
                };
            }
            break;
        }

        case 'daniels': {
            // Daniels uses intensity zones rather than workout types
            // Map to the closest intensity
            const zoneMapping: Partial<Record<string, TrainingZone>> = {
                easy: 'E',
                recovery: 'E',
                long_run: 'E',
                tempo: 'T',
                lactate_threshold: 'T',
                vo2max: 'I',
                speed: 'R',
            };
            const zone = zoneMapping[key];
            if (zone && DANIELS_INTENSITY_EXPLANATIONS[zone]) {
                const exp = DANIELS_INTENSITY_EXPLANATIONS[zone];
                return {
                    title: exp.title,
                    description: exp.description,
                    why: exp.why,
                    feel: exp.feel,
                    effortLevel: exp.effortLevel,
                    coachTip: exp.coachTip,
                    source: 'daniels',
                };
            }
            break;
        }
    }

    // Fall back to Higdon (most complete coverage)
    if (HIGDON_WORKOUT_EXPLANATIONS[key]) {
        return HIGDON_WORKOUT_EXPLANATIONS[key];
    }

    // Generic fallback
    return {
        title: workoutType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        description: 'Training workout.',
        why: 'This workout builds your fitness for race day.',
        feel: 'Run at the prescribed effort level.',
        source: 'higdon',
    };
}

/**
 * Get phase-specific coaching context.
 */
export function getPhaseContext(
    phase: TrainingPhase,
    coach: CoachPhilosophy = 'higdon'
): PhaseContext {
    switch (coach) {
        case 'hansons': {
            const hsPhase = phase as keyof typeof HANSONS_PHASE_EXPLANATIONS;
            if (HANSONS_PHASE_EXPLANATIONS[hsPhase]) {
                const exp = HANSONS_PHASE_EXPLANATIONS[hsPhase];
                return {
                    title: exp.title,
                    description: exp.description,
                    focus: exp.focus,
                    source: 'hansons',
                };
            }
            break;
        }

        case 'pfitzinger': {
            // Map generic phases to Pfitz phases
            const pfitzPhaseMap: Record<TrainingPhase, keyof typeof PFITZ_PHASE_EXPLANATIONS> = {
                base: 'endurance',
                build: 'lactate_threshold',
                peak: 'race_prep',
                taper: 'taper',
            };
            const pfPhase = pfitzPhaseMap[phase];
            if (PFITZ_PHASE_EXPLANATIONS[pfPhase]) {
                const exp = PFITZ_PHASE_EXPLANATIONS[pfPhase];
                return {
                    title: exp.title,
                    description: exp.description,
                    focus: exp.focus,
                    source: 'pfitzinger',
                };
            }
            break;
        }

        case 'daniels': {
            // Map generic phases to Daniels phases
            const danielsPhaseMap: Record<TrainingPhase, keyof typeof DANIELS_PHASE_EXPLANATIONS> = {
                base: 'base',
                build: 'repetition',
                peak: 'interval',
                taper: 'competition',
            };
            const dPhase = danielsPhaseMap[phase];
            if (DANIELS_PHASE_EXPLANATIONS[dPhase]) {
                const exp = DANIELS_PHASE_EXPLANATIONS[dPhase];
                return {
                    title: exp.title,
                    description: exp.description,
                    focus: exp.focus,
                    source: 'daniels',
                };
            }
            break;
        }
    }

    // Fall back to Higdon
    return HIGDON_PHASE_EXPLANATIONS[phase];
}

/**
 * Get intensity zone context (Daniels-specific).
 */
export function getIntensityContext(zone: TrainingZone): IntensityContext {
    const exp = DANIELS_INTENSITY_EXPLANATIONS[zone];
    return {
        title: exp.title,
        abbreviation: zone,
        description: exp.description,
        why: exp.why,
        feel: exp.feel,
        effortLevel: exp.effortLevel,
        coachTip: exp.coachTip,
    };
}

/**
 * Get signature methodology explanations for a coach.
 */
export function getSignatureExplanations(coach: CoachPhilosophy): Record<string, unknown> {
    switch (coach) {
        case 'hansons':
            return {
                why16: HANSONS_WHY_16_EXPLANATION,
            };
        case 'pfitzinger':
            return {
                mlr: PFITZ_MLR_EXPLANATION,
                mpLongRun: PFITZ_MP_LONG_RUN_EXPLANATION,
            };
        case 'daniels':
            return {
                vdot: DANIELS_VDOT_EXPLANATION,
                twoQ: DANIELS_2Q_EXPLANATION,
            };
        default:
            return {};
    }
}

/**
 * Get all available intensity explanations (for methodology pages).
 */
export function getAllIntensityExplanations(): Record<TrainingZone, IntensityContext> {
    return {
        E: getIntensityContext('E'),
        M: getIntensityContext('M'),
        T: getIntensityContext('T'),
        I: getIntensityContext('I'),
        R: getIntensityContext('R'),
    };
}

/**
 * Detect coach from plan or workout metadata.
 */
export function detectCoachFromSource(coachSource: string): CoachPhilosophy {
    const source = coachSource.toLowerCase();
    if (source.includes('hansons') || source.includes('hanson')) return 'hansons';
    if (source.includes('pfitz') || source.includes('advanced marathon')) return 'pfitzinger';
    if (source.includes('daniels') || source.includes('vdot')) return 'daniels';
    return 'higdon';
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
    HIGDON_WORKOUT_EXPLANATIONS,
    HIGDON_PHASE_EXPLANATIONS,
};
