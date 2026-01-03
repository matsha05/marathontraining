/**
 * THE LONG GAME - Workout Templates
 * 
 * Coach-backed workout definitions. Every template has a PURPOSE
 * and is attributed to the coach/methodology it comes from.
 */

import { WorkoutType, Workout, WorkoutSegment, TrainingZone } from '../types';

// =============================================================================
// WORKOUT TEMPLATE DEFINITIONS
// =============================================================================

/**
 * Template for generating workouts. Distances/durations are in relative terms
 * and get scaled based on athlete's fitness and training phase.
 */
export interface WorkoutTemplate {
    type: WorkoutType;
    name: string;
    purpose: string;
    coachSource: string;
    primaryZone: TrainingZone;
    segments: {
        type: 'warmup' | 'main' | 'cooldown' | 'recovery';
        paceZone: TrainingZone;
        durationMinutes?: number;
        distanceMiles?: number;
        repeats?: number;
        recoverySeconds?: number;
    }[];
    minMiles: number;
    maxMiles: number;
    qualityPercentage: number; // What % of this workout is NOT easy
    phaseAppropriate: ('base' | 'build' | 'peak' | 'taper')[];
    notes?: string;
}

// =============================================================================
// EASY & RECOVERY WORKOUTS
// =============================================================================

export const EASY_TEMPLATES: WorkoutTemplate[] = [
    {
        type: 'easy',
        name: 'Easy Run',
        purpose: 'Aerobic base building, active recovery, endurance',
        coachSource: 'Daniels - Foundation of the pyramid',
        primaryZone: 'E',
        segments: [
            { type: 'main', paceZone: 'E' }
        ],
        minMiles: 3,
        maxMiles: 8,
        qualityPercentage: 0,
        phaseAppropriate: ['base', 'build', 'peak', 'taper'],
        notes: 'Should feel conversational. If you cannot talk, slow down.',
    },
    {
        type: 'recovery',
        name: 'Recovery Run',
        purpose: 'Active recovery, blood flow, loosening up',
        coachSource: 'Pfitzinger - Recovery is training',
        primaryZone: 'E',
        segments: [
            { type: 'main', paceZone: 'E' }
        ],
        minMiles: 3,
        maxMiles: 5,
        qualityPercentage: 0,
        phaseAppropriate: ['base', 'build', 'peak', 'taper'],
        notes: 'Very easy. Day after hard workout.',
    },
    {
        type: 'strides',
        name: 'Easy + Strides',
        purpose: 'Neuromuscular activation, running economy, form work',
        coachSource: 'Daniels - R pace for economy',
        primaryZone: 'E',
        segments: [
            { type: 'main', paceZone: 'E' },
            { type: 'main', paceZone: 'R', repeats: 6, recoverySeconds: 60 }
        ],
        minMiles: 4,
        maxMiles: 6,
        qualityPercentage: 5,
        phaseAppropriate: ['base', 'build', 'peak', 'taper'],
        notes: '6x20sec strides with 60sec easy jog between. Not a sprint, just smooth and quick.',
    },
];

// =============================================================================
// THRESHOLD WORKOUTS (T Pace)
// =============================================================================

export const TEMPO_TEMPLATES: WorkoutTemplate[] = [
    {
        type: 'tempo',
        name: 'Classic Tempo',
        purpose: 'Raise lactate threshold, improve metabolic clearance',
        coachSource: 'Daniels - T pace is the most important workout',
        primaryZone: 'T',
        segments: [
            { type: 'warmup', paceZone: 'E', durationMinutes: 15 },
            { type: 'main', paceZone: 'T', durationMinutes: 20 },
            { type: 'cooldown', paceZone: 'E', durationMinutes: 10 },
        ],
        minMiles: 5,
        maxMiles: 8,
        qualityPercentage: 50,
        phaseAppropriate: ['base', 'build', 'peak'],
        notes: 'Comfortably hard. You should be able to say a few words but not hold conversation.',
    },
    {
        type: 'tempo',
        name: 'Extended Tempo',
        purpose: 'Extended threshold work for race-specific endurance',
        coachSource: 'Hansons - Longer tempo builds cumulative fatigue tolerance',
        primaryZone: 'T',
        segments: [
            { type: 'warmup', paceZone: 'E', distanceMiles: 2 },
            { type: 'main', paceZone: 'T', durationMinutes: 35 },
            { type: 'cooldown', paceZone: 'E', distanceMiles: 2 },
        ],
        minMiles: 8,
        maxMiles: 12,
        qualityPercentage: 55,
        phaseAppropriate: ['build', 'peak'],
        notes: 'Hansons signature workout. Builds mental and physical fatigue tolerance.',
    },
    {
        type: 'cruise_intervals',
        name: 'Cruise Intervals',
        purpose: 'Threshold work with recovery to maintain form',
        coachSource: 'Daniels - Cruise intervals for controlled threshold training',
        primaryZone: 'T',
        segments: [
            { type: 'warmup', paceZone: 'E', distanceMiles: 2 },
            { type: 'main', paceZone: 'T', distanceMiles: 1, repeats: 5, recoverySeconds: 60 },
            { type: 'cooldown', paceZone: 'E', distanceMiles: 1 },
        ],
        minMiles: 7,
        maxMiles: 10,
        qualityPercentage: 55,
        phaseAppropriate: ['base', 'build'],
        notes: '5x1mile at T pace with 1min standing/walking recovery. Recover enough to hit same pace.',
    },
    {
        type: 'threshold',
        name: 'Lactate Shuttle',
        purpose: 'Alternate tempo efforts - simulate race surges',
        coachSource: 'Magness - Modern threshold training',
        primaryZone: 'T',
        segments: [
            { type: 'warmup', paceZone: 'E', distanceMiles: 2 },
            { type: 'main', paceZone: 'T', durationMinutes: 8, repeats: 3, recoverySeconds: 180 },
            { type: 'cooldown', paceZone: 'E', distanceMiles: 1 },
        ],
        minMiles: 7,
        maxMiles: 9,
        qualityPercentage: 50,
        phaseAppropriate: ['build', 'peak'],
    },
];

// =============================================================================
// INTERVAL WORKOUTS (I Pace - VO2max)
// =============================================================================

export const INTERVAL_TEMPLATES: WorkoutTemplate[] = [
    {
        type: 'vo2max_800s',
        name: '800m Repeats',
        purpose: 'VO2max development, aerobic power',
        coachSource: 'Daniels - Classic VO2max interval',
        primaryZone: 'I',
        segments: [
            { type: 'warmup', paceZone: 'E', distanceMiles: 2 },
            { type: 'main', paceZone: 'I', distanceMiles: 0.5, repeats: 6, recoverySeconds: 180 },
            { type: 'cooldown', paceZone: 'E', distanceMiles: 1 },
        ],
        minMiles: 6,
        maxMiles: 8,
        qualityPercentage: 40,
        phaseAppropriate: ['build', 'peak'],
        notes: 'Recovery jog should be 50-90% of rep time. Stay controlled.',
    },
    {
        type: 'vo2max_1000s',
        name: '1000m Repeats',
        purpose: 'Extended VO2max intervals for deeper aerobic development',
        coachSource: 'Daniels',
        primaryZone: 'I',
        segments: [
            { type: 'warmup', paceZone: 'E', distanceMiles: 2 },
            { type: 'main', paceZone: 'I', distanceMiles: 0.62, repeats: 5, recoverySeconds: 240 },
            { type: 'cooldown', paceZone: 'E', distanceMiles: 1 },
        ],
        minMiles: 6,
        maxMiles: 8,
        qualityPercentage: 45,
        phaseAppropriate: ['build', 'peak'],
    },
    {
        type: 'vo2max_1200s',
        name: '1200m Repeats',
        purpose: 'Sustained VO2max work - race simulation for 5K',
        coachSource: 'Pfitzinger - 5K specific preparation',
        primaryZone: 'I',
        segments: [
            { type: 'warmup', paceZone: 'E', distanceMiles: 2 },
            { type: 'main', paceZone: 'I', distanceMiles: 0.75, repeats: 4, recoverySeconds: 240 },
            { type: 'cooldown', paceZone: 'E', distanceMiles: 1 },
        ],
        minMiles: 6,
        maxMiles: 8,
        qualityPercentage: 45,
        phaseAppropriate: ['build', 'peak'],
    },
    {
        type: 'vo2max_mile',
        name: 'Mile Repeats',
        purpose: 'Race simulation, sustained hard effort',
        coachSource: 'Pfitzinger - The king of workouts',
        primaryZone: 'I',
        segments: [
            { type: 'warmup', paceZone: 'E', distanceMiles: 2 },
            { type: 'main', paceZone: 'I', distanceMiles: 1, repeats: 3, recoverySeconds: 300 },
            { type: 'cooldown', paceZone: 'E', distanceMiles: 1 },
        ],
        minMiles: 7,
        maxMiles: 10,
        qualityPercentage: 40,
        phaseAppropriate: ['build', 'peak'],
        notes: 'Full 5min recovery between reps. Quality over quantity.',
    },
    {
        type: 'fartlek',
        name: 'Fartlek',
        purpose: 'Unstructured speed play, mental break from track',
        coachSource: 'Swedish tradition - Gosta Holmer',
        primaryZone: 'I',
        segments: [
            { type: 'warmup', paceZone: 'E', durationMinutes: 10 },
            { type: 'main', paceZone: 'I', durationMinutes: 20 }, // Mix of paces
            { type: 'cooldown', paceZone: 'E', durationMinutes: 10 },
        ],
        minMiles: 5,
        maxMiles: 8,
        qualityPercentage: 35,
        phaseAppropriate: ['base', 'build'],
        notes: 'Structured as 1-3min pickups with equal recovery. Follow how you feel.',
    },
];

// =============================================================================
// LONG RUN WORKOUTS
// =============================================================================

export const LONG_RUN_TEMPLATES: WorkoutTemplate[] = [
    {
        type: 'long_easy',
        name: 'Long Run (Easy)',
        purpose: 'Aerobic endurance, time on feet, fat adaptation',
        coachSource: 'Pfitzinger - The foundation of distance running',
        primaryZone: 'E',
        segments: [
            { type: 'main', paceZone: 'E' }
        ],
        minMiles: 10,
        maxMiles: 22,
        qualityPercentage: 0,
        phaseAppropriate: ['base', 'build', 'peak', 'taper'],
        notes: 'Stay conversational. Long runs build you up, they should not break you down.',
    },
    {
        type: 'long_progression',
        name: 'Progression Long Run',
        purpose: 'Race simulation, negative split practice',
        coachSource: 'Pfitzinger - Teach the body to finish strong',
        primaryZone: 'E',
        segments: [
            { type: 'main', paceZone: 'E', distanceMiles: 8 },
            { type: 'main', paceZone: 'M', distanceMiles: 4 },
        ],
        minMiles: 12,
        maxMiles: 20,
        qualityPercentage: 35,
        phaseAppropriate: ['build', 'peak'],
        notes: 'Start easy, finish at marathon pace. Last 4-6 miles at M pace.',
    },
    {
        type: 'long_mp_finish',
        name: 'Long Run with MP Finish',
        purpose: 'Race-specific endurance under cumulative fatigue',
        coachSource: 'Hansons - Run tired to race strong',
        primaryZone: 'E',
        segments: [
            { type: 'main', paceZone: 'E', distanceMiles: 10 },
            { type: 'main', paceZone: 'M', distanceMiles: 6 },
        ],
        minMiles: 14,
        maxMiles: 20,
        qualityPercentage: 40,
        phaseAppropriate: ['build', 'peak'],
        notes: 'Hansons philosophy: simulating miles 10-16 of the marathon when you\'re already tired.',
    },
    {
        type: 'long_fast_finish',
        name: 'Fast Finish Long Run',
        purpose: 'Teach the body to accelerate when tired',
        coachSource: 'Pfitzinger / Fitzgerald',
        primaryZone: 'E',
        segments: [
            { type: 'main', paceZone: 'E', distanceMiles: 12 },
            { type: 'main', paceZone: 'T', distanceMiles: 2 },
        ],
        minMiles: 13,
        maxMiles: 18,
        qualityPercentage: 15,
        phaseAppropriate: ['build', 'peak'],
        notes: 'Final 2 miles at T pace. Teaches finishing kick.',
    },
    {
        type: 'race_simulation',
        name: 'Race Simulation',
        purpose: 'Full dress rehearsal - pacing, nutrition, gear',
        coachSource: 'Pfitzinger - Practice makes perfect',
        primaryZone: 'M',
        segments: [
            { type: 'warmup', paceZone: 'E', distanceMiles: 2 },
            { type: 'main', paceZone: 'M', distanceMiles: 10 },
            { type: 'cooldown', paceZone: 'E', distanceMiles: 2 },
        ],
        minMiles: 12,
        maxMiles: 16,
        qualityPercentage: 70,
        phaseAppropriate: ['peak'],
        notes: 'Full race gear, race nutrition, race pacing. Usually 2-3 weeks before race.',
    },
];

// =============================================================================
// HILL WORKOUTS
// =============================================================================

export const HILL_TEMPLATES: WorkoutTemplate[] = [
    {
        type: 'hills',
        name: 'Hill Repeats',
        purpose: 'Strength, power, running economy',
        coachSource: 'Lydiard - Hills for strength',
        primaryZone: 'I',
        segments: [
            { type: 'warmup', paceZone: 'E', distanceMiles: 2 },
            { type: 'main', paceZone: 'I', durationMinutes: 1, repeats: 8, recoverySeconds: 90 },
            { type: 'cooldown', paceZone: 'E', distanceMiles: 1 },
        ],
        minMiles: 5,
        maxMiles: 7,
        qualityPercentage: 30,
        phaseAppropriate: ['base', 'build'],
        notes: '8x60sec uphill hard, jog down recovery. Maintains form when tired.',
    },
];

// =============================================================================
// ALL TEMPLATES COMBINED
// =============================================================================

export const ALL_WORKOUT_TEMPLATES: WorkoutTemplate[] = [
    ...EASY_TEMPLATES,
    ...TEMPO_TEMPLATES,
    ...INTERVAL_TEMPLATES,
    ...LONG_RUN_TEMPLATES,
    ...HILL_TEMPLATES,
];

/**
 * Get workout templates appropriate for a specific phase
 */
export function getTemplatesForPhase(phase: 'base' | 'build' | 'peak' | 'taper'): WorkoutTemplate[] {
    return ALL_WORKOUT_TEMPLATES.filter(t => t.phaseAppropriate.includes(phase));
}

/**
 * Get a specific workout template by type
 */
export function getTemplate(type: WorkoutType): WorkoutTemplate | undefined {
    return ALL_WORKOUT_TEMPLATES.find(t => t.type === type);
}

// =============================================================================
// WORKOUT BUILDER
// =============================================================================

/**
 * Build a concrete workout from a template with actual paces
 */
export function buildWorkout(
    template: WorkoutTemplate,
    paces: { easy: { min: number; max: number }; marathon: number; threshold: number; interval: number; repetition: number },
    targetMiles: number,
): Workout {
    // Clamp target miles to template bounds
    const miles = Math.max(template.minMiles, Math.min(template.maxMiles, targetMiles));

    const segments: WorkoutSegment[] = template.segments.map(seg => {
        const targetPace = getPaceForZone(seg.paceZone, paces);
        return {
            type: seg.type,
            description: formatSegmentDescription(seg),
            distance: seg.distanceMiles,
            duration: seg.durationMinutes,
            pace: seg.paceZone,
            targetPaceSeconds: targetPace,
            repeats: seg.repeats,
            recoveryDuration: seg.recoverySeconds,
        };
    });

    const qualityMiles = (miles * template.qualityPercentage) / 100;

    // Estimate duration based on average pace
    const avgPace = (paces.easy.min + paces.easy.max) / 2;
    const estimatedDuration = Math.round((miles * avgPace) / 60);

    return {
        id: `${template.type}-${Date.now()}`,
        name: template.name,
        type: template.type,
        segments,
        totalDistance: miles,
        estimatedDuration,
        primaryZone: template.primaryZone,
        purpose: template.purpose,
        coachSource: template.coachSource,
        qualityMiles,
        notes: template.notes,
    };
}

function getPaceForZone(
    zone: TrainingZone,
    paces: { easy: { min: number; max: number }; marathon: number; threshold: number; interval: number; repetition: number }
): number {
    switch (zone) {
        case 'E': return paces.easy.max; // Use slower end of easy
        case 'M': return paces.marathon;
        case 'T': return paces.threshold;
        case 'I': return paces.interval;
        case 'R': return paces.repetition;
        default: return paces.easy.max;
    }
}

function formatSegmentDescription(seg: WorkoutTemplate['segments'][0]): string {
    if (seg.repeats) {
        if (seg.distanceMiles) {
            return `${seg.repeats}x ${seg.distanceMiles}mi at ${seg.paceZone} pace`;
        }
        if (seg.durationMinutes) {
            return `${seg.repeats}x ${seg.durationMinutes}min at ${seg.paceZone} pace`;
        }
    }
    if (seg.distanceMiles) {
        return `${seg.distanceMiles}mi at ${seg.paceZone} pace`;
    }
    if (seg.durationMinutes) {
        return `${seg.durationMinutes}min at ${seg.paceZone} pace`;
    }
    return `${seg.paceZone} pace`;
}
