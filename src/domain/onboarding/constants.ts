/**
 * THE LONG GAME - Onboarding Constants
 * 
 * All constants, options, and configuration for the onboarding flow.
 */

import { Dumbbell, Footprints, Timer, Mountain, Heart, Zap } from 'lucide-react';

// =============================================================================
// TRAINING GOALS
// =============================================================================

export const TRAINING_GOALS = [
    { value: '5k', label: '5K', description: 'Speed and efficiency' },
    { value: '10k', label: '10K', description: 'Building endurance' },
    { value: 'half', label: 'Half Marathon', description: '13.1 miles of grit' },
    { value: 'marathon', label: 'Marathon', description: '26.2 miles of glory' },
    { value: 'general', label: 'General Fitness', description: 'Just get faster' },
] as const;

// =============================================================================
// MINIMUM WEEKS BY GOAL
// =============================================================================

export const MINIMUM_WEEKS: Record<string, number> = {
    '5k': 4,
    '10k': 6,
    'half': 8,
    'marathon': 12,
    'general': 4,
};

export const RECOMMENDED_WEEKS: Record<string, number> = {
    '5k': 8,
    '10k': 10,
    'half': 12,
    'marathon': 16,
    'general': 12,
};

// =============================================================================
// RACE DISTANCES
// =============================================================================

export const RACE_DISTANCES = [
    { value: 'mile', label: 'Mile', meters: 1609 },
    { value: '5k', label: '5K', meters: 5000 },
    { value: '10k', label: '10K', meters: 10000 },
    { value: 'half', label: 'Half Marathon', meters: 21097 },
    { value: 'marathon', label: 'Marathon', meters: 42195 },
] as const;

// =============================================================================
// RACE TIME VALIDATION BOUNDS
// =============================================================================

export const RACE_TIME_BOUNDS: Record<string, { min: number; max: number; unit: string }> = {
    'mile': { min: 4 * 60, max: 15 * 60, unit: 'MM:SS' },         // 4:00 - 15:00
    '5k': { min: 12 * 60, max: 60 * 60, unit: 'MM:SS' },          // 12:00 - 60:00
    '10k': { min: 25 * 60, max: 90 * 60, unit: 'MM:SS' },         // 25:00 - 90:00
    'half': { min: 60 * 60, max: 4 * 60 * 60, unit: 'H:MM:SS' },  // 1:00:00 - 4:00:00
    'marathon': { min: 2 * 60 * 60, max: 7 * 60 * 60, unit: 'H:MM:SS' }, // 2:00:00 - 7:00:00
};

// =============================================================================
// RACE RECENCY OPTIONS
// =============================================================================

export const RACE_RECENCY_OPTIONS = [
    {
        value: 'recent',
        label: 'Last 3 months',
        description: 'Very accurate',
        vdotAdjustment: 0,
    },
    {
        value: 'moderate',
        label: '3-6 months ago',
        description: 'Good baseline',
        vdotAdjustment: -1,
    },
    {
        value: 'old',
        label: '6-12 months ago',
        description: 'We\'ll be conservative',
        vdotAdjustment: -2,
    },
    {
        value: 'very_old',
        label: 'Over a year ago',
        description: 'Use as floor only',
        vdotAdjustment: -3,
    },
] as const;

// =============================================================================
// EXPERIENCE LEVELS
// =============================================================================

export const EXPERIENCE_LEVELS = [
    {
        value: 'new',
        label: 'New to running',
        description: 'Less than 1 year, still building',
        baseVdot: 30,
    },
    {
        value: 'recreational',
        label: 'Recreational runner',
        description: '1-3 years, running casually',
        baseVdot: 38,
    },
    {
        value: 'experienced',
        label: 'Experienced runner',
        description: '3+ years, consistent training',
        baseVdot: 45,
    },
    {
        value: 'returning',
        label: 'Returning after break',
        description: 'Was experienced, took time off',
        baseVdot: 40,
    },
] as const;

// =============================================================================
// FITNESS DURATION OPTIONS
// =============================================================================

export const FITNESS_DURATION_OPTIONS = [
    { value: '8weeks', label: '8 weeks', description: 'Short block, build habit' },
    { value: '12weeks', label: '12 weeks', description: 'Standard training cycle' },
    { value: 'ongoing', label: 'Ongoing', description: 'Keep going until I stop' },
] as const;

// =============================================================================
// CALIBRATION METHODS
// =============================================================================

export const CALIBRATION_METHODS = [
    {
        value: 'race',
        label: 'I have a recent race time',
        description: 'Best option — actual performance data',
        icon: Timer,
    },
    {
        value: 'easy_pace',
        label: 'I know my comfortable easy pace',
        description: 'Good fallback — we can estimate from this',
        icon: Footprints,
    },
    {
        value: 'device',
        label: 'Import from Garmin or Strava',
        description: 'Uses your device\'s VO2max estimate',
        icon: Heart,
    },
    {
        value: 'effort',
        label: 'I did a hard effort recently',
        description: 'Parkrun, tempo run, time trial',
        icon: Zap,
    },
    {
        value: 'estimate',
        label: 'I have no idea — estimate for me',
        description: 'We\'ll use training data + calibration run in Week 1',
        icon: Mountain,
    },
] as const;

// =============================================================================
// EFFORT TYPES
// =============================================================================

export const EFFORT_TYPES = [
    { value: 'parkrun', label: 'Parkrun (5K, all-out)', defaultDistance: '5k' },
    { value: 'tempo', label: 'Tempo run (comfortably hard 20-40 min)', defaultDistance: '' },
    { value: 'time_trial', label: 'Time trial (all-out for set distance)', defaultDistance: '' },
    { value: 'race_sim', label: 'Race simulation or unofficial race', defaultDistance: '' },
] as const;

// =============================================================================
// RUNS PER WEEK OPTIONS
// =============================================================================

export const RUNS_PER_WEEK_OPTIONS = [
    { value: 2, label: '1-2 times', description: 'Minimal commitment' },
    { value: 3, label: '3 times', description: 'Building base' },
    { value: 4, label: '4 times', description: 'Solid foundation' },
    { value: 5, label: '5 times', description: 'Serious training' },
    { value: 6, label: '6-7 times', description: 'High volume' },
] as const;

// =============================================================================
// AVAILABLE DAYS OPTIONS
// =============================================================================

export const AVAILABLE_DAYS_OPTIONS = [
    { value: 3, label: '3 days', description: 'Quality over quantity' },
    { value: 4, label: '4 days', description: 'Balanced approach' },
    { value: 5, label: '5 days', description: 'Room for variety' },
    { value: 6, label: '6 days', description: 'Maximum adaptation' },
] as const;

// =============================================================================
// LONG RUN DAY OPTIONS
// =============================================================================

export const LONG_RUN_DAY_OPTIONS = [
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
    { value: 'other', label: 'Another day' },
] as const;

// =============================================================================
// INJURY LOCATIONS
// =============================================================================

export const INJURY_LOCATIONS = [
    { value: 'knee', label: 'Knee', prehab: 'Hip and glute strengthening' },
    { value: 'shin_calf', label: 'Shin / Calf', prehab: 'Calf raises, eccentric work' },
    { value: 'achilles', label: 'Achilles', prehab: 'Eccentric heel drops' },
    { value: 'foot_plantar', label: 'Foot / Plantar', prehab: 'Foot strengthening, arch work' },
    { value: 'hip_glute', label: 'Hip / Glute', prehab: 'Single-leg stability' },
    { value: 'back', label: 'Back', prehab: 'Core strengthening' },
    { value: 'other', label: 'Other', prehab: 'General mobility' },
] as const;

// =============================================================================
// PAIN SEVERITY OPTIONS
// =============================================================================

export const PAIN_SEVERITY_OPTIONS = [
    { value: 'mild', label: 'Mild', description: 'I can run but I notice it', warning: false },
    { value: 'moderate', label: 'Moderate', description: 'It affects my running', warning: true },
    { value: 'severe', label: 'Severe', description: 'I probably shouldn\'t run', warning: true },
] as const;

// =============================================================================
// TRAINING INTENSITY OPTIONS
// =============================================================================

export const TRAINING_INTENSITY_OPTIONS = [
    {
        value: 'conservative',
        label: 'Conservative',
        description: 'Priority is staying healthy and finishing strong. Lower injury risk, sustainable progression.',
        multiplier: 0.85,
        recommended: false,
    },
    {
        value: 'moderate',
        label: 'Moderate',
        description: 'Balanced approach — push yourself but stay smart.',
        multiplier: 1.0,
        recommended: true,
    },
    {
        value: 'aggressive',
        label: 'Aggressive',
        description: 'Maximize performance. Higher volume and intensity. Best for experienced runners.',
        multiplier: 1.15,
        recommended: false,
    },
] as const;

// =============================================================================
// EQUIPMENT OPTIONS
// =============================================================================

export const EQUIPMENT_OPTIONS = [
    { id: 'bodyweight', label: 'Bodyweight Only', icon: Footprints, description: 'That\'s enough! Our durability work is mostly bodyweight.' },
    { id: 'resistance_bands', label: 'Resistance Bands', icon: Zap },
    { id: 'dumbbells', label: 'Dumbbells', icon: Dumbbell },
    { id: 'kettlebell', label: 'Kettlebell', icon: Dumbbell },
    { id: 'foam_roller', label: 'Foam Roller', icon: Footprints },
    { id: 'pull_up_bar', label: 'Pull-up Bar', icon: Mountain },
] as const;

// =============================================================================
// VDOT PERCENTILE DATA
// =============================================================================

export const VDOT_PERCENTILES: { vdot: number; percentile: number; label: string }[] = [
    { vdot: 25, percentile: 10, label: 'Beginner' },
    { vdot: 30, percentile: 20, label: 'Novice' },
    { vdot: 35, percentile: 35, label: 'Developing' },
    { vdot: 40, percentile: 50, label: 'Recreational' },
    { vdot: 45, percentile: 65, label: 'Competitive' },
    { vdot: 50, percentile: 80, label: 'Advanced' },
    { vdot: 55, percentile: 90, label: 'Sub-elite' },
    { vdot: 60, percentile: 95, label: 'Elite' },
    { vdot: 70, percentile: 99, label: 'World-class' },
];

export function getVdotPercentile(vdot: number): { percentile: number; label: string } {
    // Find the closest match
    for (let i = VDOT_PERCENTILES.length - 1; i >= 0; i--) {
        if (vdot >= VDOT_PERCENTILES[i].vdot) {
            return {
                percentile: VDOT_PERCENTILES[i].percentile,
                label: VDOT_PERCENTILES[i].label
            };
        }
    }
    return { percentile: 5, label: 'Getting started' };
}

// =============================================================================
// TIME TRIAL INSTRUCTIONS
// =============================================================================

export const TIME_TRIAL_INSTRUCTIONS = {
    title: 'How to run a time trial',
    steps: [
        'Warm up for 10-15 minutes at an easy pace',
        'Find a flat, measured course (a track is ideal)',
        'Run at a sustainable hard effort—not a sprint',
        'You should feel exhausted at the end',
        'Cool down for 10 minutes',
    ],
    tips: [
        'Pick a day when you\'re well-rested',
        'Avoid hot or windy conditions if possible',
        'A friend or crowd helps motivation',
    ],
};

// =============================================================================
// COACH INFO FOR TOOLTIPS
// =============================================================================

export const COACHES = {
    daniels: {
        name: 'Jack Daniels',
        title: 'Exercise Physiologist & Olympic Coach',
        known_for: 'VDOT system, training zones',
        book: 'Daniels\' Running Formula',
    },
    pfitzinger: {
        name: 'Pete Pfitzinger',
        title: '2x Olympic Marathoner',
        known_for: 'Periodization, lactate threshold training',
        book: 'Advanced Marathoning',
    },
    hansons: {
        name: 'Hansons Brothers',
        title: 'Brooks-Hansons Team Coaches',
        known_for: 'Cumulative fatigue, high frequency',
        book: 'Hansons Marathon Method',
    },
    dicharry: {
        name: 'Jay Dicharry',
        title: 'Physical Therapist & Biomechanics Expert',
        known_for: 'Movement quality, injury prevention',
        book: 'Running Rewired',
    },
    seiler: {
        name: 'Stephen Seiler',
        title: 'Exercise Scientist',
        known_for: '80/20 polarized training',
        book: 'Research papers on intensity distribution',
    },
};
