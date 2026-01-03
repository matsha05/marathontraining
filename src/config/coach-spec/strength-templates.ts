/**
 * Strength Training Configuration
 * 
 * Templates and periodization rules for strength sessions
 * Based on CoachSpec section 8
 */

import type { TrainingPhase } from '@/domain/types/plan';
import type { StrengthSessionType, ExercisePrescription } from '@/domain/types/session';

/**
 * Strength template IDs
 */
export type StrengthTemplateId = 'A' | 'B' | 'P' | 'H' | 'N';

/**
 * Strength template definition
 */
export interface StrengthTemplate {
    id: StrengthTemplateId;
    name: string;
    type: StrengthSessionType;
    durationMinRange: [number, number];
    phases: TrainingPhase[];
    exercises: ExercisePrescription[];
    notes?: string;
}

/**
 * Template A: Max Strength + Posterior Chain (45-60 min)
 */
export const TEMPLATE_A: StrengthTemplate = {
    id: 'A',
    name: 'Max Strength + Posterior Chain',
    type: 'max_strength',
    durationMinRange: [45, 60],
    phases: ['BASE_2', 'BUILD'],
    exercises: [
        { exerciseId: 'back_squat', exerciseName: 'Back Squat', sets: 4, reps: 4, intensity: '85-90% 1RM', restSeconds: 180 },
        { exerciseId: 'rdl', exerciseName: 'Romanian Deadlift', sets: 3, reps: 6, intensity: 'RPE 7-8', restSeconds: 150 },
        { exerciseId: 'fitball_flexion', exerciseName: 'Fitball Hamstring Curl', sets: 3, reps: 10, restSeconds: 90 },
        { exerciseId: 'standing_calf', exerciseName: 'Standing Calf Raise', sets: 4, reps: '6-8', intensity: 'Heavy', restSeconds: 60 },
        { exerciseId: 'seated_calf', exerciseName: 'Seated Calf Raise', sets: 3, reps: '10-12', restSeconds: 60 },
        { exerciseId: 'side_plank', exerciseName: 'Side Plank', sets: 2, reps: '30-45s each', restSeconds: 45 },
        { exerciseId: 'pallof_press', exerciseName: 'Pallof Press', sets: 2, reps: 10, notes: 'Each side', restSeconds: 45 },
    ],
    notes: 'Place on hard run days, after run. Focus on heavy, low rep main lifts.',
};

/**
 * Template B: Single-Leg Strength + Hip Control (35-55 min)
 */
export const TEMPLATE_B: StrengthTemplate = {
    id: 'B',
    name: 'Single-Leg + Hip Control',
    type: 'single_leg',
    durationMinRange: [35, 55],
    phases: ['BASE_1', 'BASE_2', 'BUILD'],
    exercises: [
        { exerciseId: 'bulgarian_split', exerciseName: 'Bulgarian Split Squat', sets: 4, reps: '6/leg', intensity: 'RPE 7-8', restSeconds: 120 },
        { exerciseId: 'step_up', exerciseName: 'Step Up', sets: 3, reps: '6-8/leg', intensity: 'RPE 7', restSeconds: 100 },
        { exerciseId: 'single_leg_rdl', exerciseName: 'Single-Leg RDL', sets: 3, reps: '6-10/leg', intensity: 'RPE 7', restSeconds: 90 },
        { exerciseId: 'band_walks', exerciseName: 'Band Walks', sets: 2, reps: '10 each way', notes: 'Linear or lateral', restSeconds: 45 },
    ],
    notes: 'Especially useful for athletes with pelvic drop patterns.',
};

/**
 * Template P: Power Primer (10-18 min add-on)
 */
export const TEMPLATE_P: StrengthTemplate = {
    id: 'P',
    name: 'Power Primer',
    type: 'power',
    durationMinRange: [10, 18],
    phases: ['BASE_2', 'BUILD'],
    exercises: [
        { exerciseId: 'depth_jumps', exerciseName: 'Depth Jumps', sets: 3, reps: 4, restSeconds: 100, notes: '12-18 inch box' },
        { exerciseId: 'hang_clean', exerciseName: 'Hang Clean', sets: 3, reps: 4, intensity: '80% 1RM', restSeconds: 180 },
    ],
    notes: 'Add to start of Template A/B or standalone. Stop if jump quality drops.',
};

/**
 * Template H: Dicharry Hip Circuit (15-20 min)
 */
export const TEMPLATE_H: StrengthTemplate = {
    id: 'H',
    name: 'Dicharry Hip Circuit',
    type: 'hip_circuit',
    durationMinRange: [15, 20],
    phases: ['BASE_1', 'BASE_2', 'BUILD', 'PEAK', 'TAPER', 'RECOVERY'],
    exercises: [
        { exerciseId: 'twisted_warrior', exerciseName: 'Twisted Warrior', sets: 2, reps: '10 each', restSeconds: 30 },
        { exerciseId: 'butt_scoots', exerciseName: 'Butt Scoots', sets: 2, reps: '20 each', restSeconds: 30 },
        { exerciseId: 'pigeon_hip_ext', exerciseName: 'Pigeon Hip Extension', sets: 2, reps: '10 each', restSeconds: 30 },
        { exerciseId: 'glute_rainbow', exerciseName: 'Glute Rainbow', sets: 2, reps: '10 each', restSeconds: 30 },
        { exerciseId: 'standing_circles', exerciseName: 'Standing Hip Circles', sets: 2, reps: '5 each', restSeconds: 30 },
        { exerciseId: 'tippy_twist', exerciseName: 'Tippy Twist', sets: 2, reps: '8 each', restSeconds: 30 },
        { exerciseId: 'burpees', exerciseName: 'Burpees', sets: 1, reps: 10, restSeconds: 45 },
        { exerciseId: 'frog_bridge', exerciseName: 'Frog Bridge', sets: 1, reps: 25, restSeconds: 30 },
        { exerciseId: 'lateral_hurdle', exerciseName: 'Lateral Hurdle Hop', sets: 1, reps: 20, restSeconds: 0 },
    ],
    notes: 'Source: Jay Dicharry Running Rewired. Do 2 rounds with 30-45s rest between exercises.',
};

/**
 * Template N: Neural Day (12-20 min)
 */
export const TEMPLATE_N: StrengthTemplate = {
    id: 'N',
    name: 'Neural Day',
    type: 'neural',
    durationMinRange: [12, 20],
    phases: ['PEAK'],
    exercises: [
        { exerciseId: 'jump_circuit', exerciseName: 'In-Place Jump Circuit', sets: 1, reps: '12 exercises, 15s each', restSeconds: 30, notes: '9 min total' },
        { exerciseId: 'bounds', exerciseName: 'Bounds', sets: 1, reps: 5, restSeconds: 60 },
        { exerciseId: 'db_jumps', exerciseName: 'DB Jumps', sets: 4, reps: 5, intensity: '15% bodyweight', restSeconds: 120, notes: 'Full recovery' },
    ],
    notes: 'Zero soreness goal. Near-complete recovery between reps. High neural output, not conditioning.',
};

/**
 * All templates
 */
export const STRENGTH_TEMPLATES: Record<StrengthTemplateId, StrengthTemplate> = {
    A: TEMPLATE_A,
    B: TEMPLATE_B,
    P: TEMPLATE_P,
    H: TEMPLATE_H,
    N: TEMPLATE_N,
};

/**
 * Phase-based strength rules
 */
export interface PhaseStrengthRules {
    sessionsPerWeek: number;
    powerSessionsPerWeek: number;
    microdosePerWeek: number;
    templates: StrengthTemplateId[];
    intensityCapRpe?: number;
}

export const PHASE_STRENGTH_RULES: Record<TrainingPhase, PhaseStrengthRules> = {
    BASE_1: { sessionsPerWeek: 2, powerSessionsPerWeek: 0, microdosePerWeek: 3, templates: ['B', 'H'] },
    BASE_2: { sessionsPerWeek: 2, powerSessionsPerWeek: 1, microdosePerWeek: 2, templates: ['A', 'B', 'P', 'H'] },
    BUILD: { sessionsPerWeek: 2, powerSessionsPerWeek: 1, microdosePerWeek: 1, templates: ['A', 'B', 'P', 'H'] },
    PEAK: { sessionsPerWeek: 1, powerSessionsPerWeek: 1, microdosePerWeek: 1, templates: ['A', 'N', 'H'], intensityCapRpe: 8 },
    TAPER: { sessionsPerWeek: 0, powerSessionsPerWeek: 0, microdosePerWeek: 1, templates: ['H'], intensityCapRpe: 7 },
    RECOVERY: { sessionsPerWeek: 1, powerSessionsPerWeek: 0, microdosePerWeek: 2, templates: ['B', 'H'] },
};

/**
 * Get strength template by ID
 */
export function getStrengthTemplate(id: StrengthTemplateId): StrengthTemplate {
    return STRENGTH_TEMPLATES[id];
}

/**
 * Get strength rules for a phase
 */
export function getPhaseStrengthRules(phase: TrainingPhase): PhaseStrengthRules {
    return PHASE_STRENGTH_RULES[phase];
}

/**
 * Check if strength is appropriate for a phase
 */
export function getAvailableTemplates(phase: TrainingPhase): StrengthTemplate[] {
    const rules = PHASE_STRENGTH_RULES[phase];
    return rules.templates.map(id => STRENGTH_TEMPLATES[id]);
}
