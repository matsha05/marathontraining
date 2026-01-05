/**
 * THE LONG GAME - Strength Training Engine
 * 
 * Implements coach-backed strength programming for runners.
 * Uses minimal effective dose (Barr/Dicharry principles) with
 * phase-appropriate volume modulation.
 * 
 * Source: COACHSPEC Section 8, Oracle Research
 */

import { TrainingPhase, StrengthFocus, StrengthWorkout, StrengthExercise } from './types';

// =============================================================================
// PHASE-BASED STRENGTH CONFIGURATION
// =============================================================================

export interface StrengthPhaseConfig {
    sessionsPerWeek: number;
    setsPerExercise: number;
    repRange: [number, number];
    intensityGuidance: string;
    focus: StrengthFocus[];
    allowHeavyLower: boolean;
}

/**
 * Get strength configuration by training phase.
 */
export function getStrengthPhaseConfig(phase: TrainingPhase): StrengthPhaseConfig {
    const configs: Record<TrainingPhase, StrengthPhaseConfig> = {
        base: {
            sessionsPerWeek: 2,
            setsPerExercise: 3,
            repRange: [8, 12],
            intensityGuidance: 'Moderate load, focus on movement quality',
            focus: ['glutes', 'core', 'single_leg'],
            allowHeavyLower: true,
        },
        build: {
            sessionsPerWeek: 2,
            setsPerExercise: 2,
            repRange: [6, 8],
            intensityGuidance: 'Heavier load, maintain strength',
            focus: ['glutes', 'hip_stability', 'calves'],
            allowHeavyLower: true,
        },
        peak: {
            sessionsPerWeek: 1,
            setsPerExercise: 2,
            repRange: [4, 6],
            intensityGuidance: 'Heavy but low volume, neural maintenance',
            focus: ['glutes', 'core'],
            allowHeavyLower: false, // Protect running quality
        },
        taper: {
            sessionsPerWeek: 1,
            setsPerExercise: 1,
            repRange: [4, 6],
            intensityGuidance: 'Maintenance only, no new movements',
            focus: ['core', 'hip_stability'],
            allowHeavyLower: false,
        },
    };

    return configs[phase];
}

// =============================================================================
// RUNNER-SPECIFIC EXERCISES
// =============================================================================

export interface ExerciseDefinition {
    name: string;
    focus: StrengthFocus;
    equipment: 'none' | 'minimal' | 'gym';
    eccentricLoad: 'low' | 'moderate' | 'high';
    runnerBenefit: string;
    substitutes?: string[];
}

export const RUNNER_EXERCISES: Record<string, ExerciseDefinition> = {
    // ==========================================================================
    // TIER 1: Highest transfer, keep year-round (research: 09-strength-protocols)
    // ==========================================================================

    // Squat pattern (force production, stiffness)
    back_squat: {
        name: 'Back Squat',
        focus: 'full_body',
        equipment: 'gym',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Force production and leg stiffness',
        substitutes: ['goblet_squat', 'front_squat'],
    },
    front_squat: {
        name: 'Front Squat',
        focus: 'full_body',
        equipment: 'gym',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Quad strength with upright posture',
        substitutes: ['goblet_squat'],
    },
    goblet_squat: {
        name: 'Goblet Squat',
        focus: 'full_body',
        equipment: 'minimal',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Leg strength with core engagement',
    },

    // Hinge pattern (posterior chain, propulsion)
    trap_bar_deadlift: {
        name: 'Trap Bar Deadlift',
        focus: 'full_body',
        equipment: 'gym',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Posterior chain power, spine-friendly',
        substitutes: ['romanian_deadlift', 'kb_deadlift'],
    },
    romanian_deadlift: {
        name: 'Romanian Deadlift',
        focus: 'glutes',
        equipment: 'minimal',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Hamstring loading, hip hinge pattern',
        substitutes: ['single_leg_rdl'],
    },
    kb_deadlift: {
        name: 'Kettlebell Deadlift',
        focus: 'glutes',
        equipment: 'minimal',
        eccentricLoad: 'low',
        runnerBenefit: 'Hinge pattern with minimal load',
    },

    // Single-leg knee-dominant (running-specific strength)
    bulgarian_split_squat: {
        name: 'Bulgarian Split Squat',
        focus: 'single_leg',
        equipment: 'minimal',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Unilateral leg strength, hip flexor stretch',
        substitutes: ['reverse_lunge'],
    },
    step_up: {
        name: 'Step Up',
        focus: 'single_leg',
        equipment: 'minimal',
        eccentricLoad: 'low',
        runnerBenefit: 'Concentric-dominant single leg power',
    },
    reverse_lunge: {
        name: 'Reverse Lunge',
        focus: 'single_leg',
        equipment: 'minimal',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Single leg strength with hip flexor stretch',
    },

    // Single-leg hinge (hamstrings + glute max + balance)
    single_leg_rdl: {
        name: 'Single Leg RDL',
        focus: 'single_leg',
        equipment: 'minimal',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Hamstring and balance, hip hinge pattern',
    },

    // Calf-ankle complex (stiffness + injury resistance)
    calf_raise: {
        name: 'Calf Raise',
        focus: 'calves',
        equipment: 'minimal',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Achilles tendon loading, calf endurance',
    },
    seated_calf_raise: {
        name: 'Seated Calf Raise',
        focus: 'calves',
        equipment: 'minimal',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Soleus strength, different from standing',
    },
    eccentric_calf_raise: {
        name: 'Eccentric Calf Raise',
        focus: 'calves',
        equipment: 'minimal',
        eccentricLoad: 'high',
        runnerBenefit: 'Achilles tendon resilience (use 48h+ before quality runs)',
    },
    tibialis_raise: {
        name: 'Tibialis Raise',
        focus: 'calves',
        equipment: 'minimal',
        eccentricLoad: 'low',
        runnerBenefit: 'Shin splint prevention, anterior lower leg',
    },

    // ==========================================================================
    // TIER 2: Keep most of year, rotate variants
    // ==========================================================================

    // Hamstring knee-flexion strength
    nordic_curl: {
        name: 'Nordic Curl',
        focus: 'single_leg',
        equipment: 'minimal',
        eccentricLoad: 'high',
        runnerBenefit: 'Hamstring eccentric strength, injury prevention',
        substitutes: ['slider_leg_curl'],
    },
    slider_leg_curl: {
        name: 'Slider Leg Curl',
        focus: 'single_leg',
        equipment: 'minimal',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Hamstring strength with core challenge',
    },
    swiss_ball_curl: {
        name: 'Swiss Ball Hamstring Curl',
        focus: 'single_leg',
        equipment: 'minimal',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Hamstring curl with hip bridge',
    },

    // Hip abductors and external rotation control
    band_walks: {
        name: 'Band Walks',
        focus: 'hip_stability',
        equipment: 'minimal',
        eccentricLoad: 'low',
        runnerBenefit: 'Hip abductor activation, pelvic stability',
    },
    clamshell: {
        name: 'Clamshell',
        focus: 'hip_stability',
        equipment: 'minimal',
        eccentricLoad: 'low',
        runnerBenefit: 'Hip abductor and rotator strength',
    },
    copenhagen_plank: {
        name: 'Copenhagen Plank',
        focus: 'hip_stability',
        equipment: 'none',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Adductor strength, groin injury prevention',
    },

    // Glute-focused
    hip_thrust: {
        name: 'Hip Thrust',
        focus: 'glutes',
        equipment: 'minimal',
        eccentricLoad: 'low',
        runnerBenefit: 'Hip extension power, minimal leg DOMS',
        substitutes: ['glute_bridge', 'single_leg_bridge'],
    },
    glute_bridge: {
        name: 'Glute Bridge',
        focus: 'glutes',
        equipment: 'none',
        eccentricLoad: 'low',
        runnerBenefit: 'Glute activation, hip extension',
    },
    single_leg_bridge: {
        name: 'Single Leg Glute Bridge',
        focus: 'glutes',
        equipment: 'none',
        eccentricLoad: 'low',
        runnerBenefit: 'Unilateral glute activation',
    },

    // Core
    dead_bug: {
        name: 'Dead Bug',
        focus: 'core',
        equipment: 'none',
        eccentricLoad: 'low',
        runnerBenefit: 'Anti-extension core stability',
    },
    plank: {
        name: 'Plank',
        focus: 'core',
        equipment: 'none',
        eccentricLoad: 'low',
        runnerBenefit: 'Isometric core endurance',
    },
    side_plank: {
        name: 'Side Plank',
        focus: 'core',
        equipment: 'none',
        eccentricLoad: 'low',
        runnerBenefit: 'Lateral stability, hip engagement',
    },
    pallof_press: {
        name: 'Pallof Press',
        focus: 'core',
        equipment: 'minimal',
        eccentricLoad: 'low',
        runnerBenefit: 'Anti-rotation stability',
    },
    v_ups: {
        name: 'V-Ups',
        focus: 'core',
        equipment: 'none',
        eccentricLoad: 'low',
        runnerBenefit: 'Core flexion strength',
    },

    // ==========================================================================
    // TIER 3: Power conversion (from research)
    // ==========================================================================

    // Plyometrics and reactive strength
    depth_jump: {
        name: 'Depth Jump',
        focus: 'full_body',
        equipment: 'minimal',
        eccentricLoad: 'high',
        runnerBenefit: 'Reactive strength, running economy',
    },
    box_jump: {
        name: 'Box Jump',
        focus: 'full_body',
        equipment: 'minimal',
        eccentricLoad: 'low', // Concentric-dominant when stepping down
        runnerBenefit: 'Lower body power, no eccentric on step-down',
    },
    jump_squat: {
        name: 'Jump Squat',
        focus: 'full_body',
        equipment: 'minimal',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Power development, fast rep intent',
    },
    pogo_hops: {
        name: 'Pogo Hops',
        focus: 'calves',
        equipment: 'none',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Ankle stiffness, elastic recoil',
    },

    // Low-load high-velocity lifts
    hang_clean: {
        name: 'Hang Clean',
        focus: 'full_body',
        equipment: 'gym',
        eccentricLoad: 'low',
        runnerBenefit: 'Triple extension power, neural activation',
    },
    kb_swing: {
        name: 'Kettlebell Swing',
        focus: 'glutes',
        equipment: 'minimal',
        eccentricLoad: 'low',
        runnerBenefit: 'Hip power, posterior chain conditioning',
    },

    // Upper body (from Eleiko template - running economy support)
    bench_press: {
        name: 'Bench Press',
        focus: 'full_body',
        equipment: 'gym',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Upper body strength, arm drive support',
        substitutes: ['push_up', 'db_bench_press'],
    },
    db_bench_press: {
        name: 'DB Bench Press',
        focus: 'full_body',
        equipment: 'minimal',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Upper body strength, unilateral balance',
    },
    push_up: {
        name: 'Push Up',
        focus: 'core',
        equipment: 'none',
        eccentricLoad: 'low',
        runnerBenefit: 'Upper body endurance, core integration',
    },
    bent_over_row: {
        name: 'Bent Over Row',
        focus: 'full_body',
        equipment: 'minimal',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Upper back strength, posture support',
    },
    strict_pull_up: {
        name: 'Strict Pull Up',
        focus: 'full_body',
        equipment: 'minimal',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Upper body pulling strength, core engagement',
        substitutes: ['ring_row'],
    },
    ring_row: {
        name: 'Ring Row',
        focus: 'full_body',
        equipment: 'minimal',
        eccentricLoad: 'low',
        runnerBenefit: 'Scalable pulling strength',
    },
    strict_press: {
        name: 'Strict Press',
        focus: 'full_body',
        equipment: 'minimal',
        eccentricLoad: 'low',
        runnerBenefit: 'Overhead strength, core stability',
    },

    // ==========================================================================
    // DICHARRY HIP CIRCUIT EXERCISES (Template H)
    // ==========================================================================

    twisted_warrior: {
        name: 'Twisted Warrior',
        focus: 'hip_stability',
        equipment: 'none',
        eccentricLoad: 'low',
        runnerBenefit: 'Hip rotation control, core integration',
    },
    butt_scoots: {
        name: 'Butt Scoots',
        focus: 'hip_stability',
        equipment: 'none',
        eccentricLoad: 'low',
        runnerBenefit: 'Hip flexor and rotator activation',
    },
    pigeon_hip_extension: {
        name: 'Pigeon Hip Extension',
        focus: 'hip_stability',
        equipment: 'none',
        eccentricLoad: 'low',
        runnerBenefit: 'Hip mobility with extension control',
    },
    glute_rainbow: {
        name: 'Glute Rainbow',
        focus: 'hip_stability',
        equipment: 'none',
        eccentricLoad: 'low',
        runnerBenefit: 'Hip abductor in multiple planes',
    },
    standing_hip_circles: {
        name: 'Standing Hip Circles',
        focus: 'hip_stability',
        equipment: 'none',
        eccentricLoad: 'low',
        runnerBenefit: 'Hip mobility and control',
    },
    tippy_twist: {
        name: 'Tippy Twist',
        focus: 'hip_stability',
        equipment: 'none',
        eccentricLoad: 'low',
        runnerBenefit: 'Single leg balance with rotation',
    },
    frog_bridge: {
        name: 'Frog Bridge',
        focus: 'glutes',
        equipment: 'none',
        eccentricLoad: 'low',
        runnerBenefit: 'Glute activation with external rotation',
    },
    lateral_hurdle_hop: {
        name: 'Lateral Hurdle Hop',
        focus: 'hip_stability',
        equipment: 'none',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Lateral power, ankle stability',
    },

    // Carries (from sled-free alternatives)
    farmer_carry: {
        name: 'Farmer Carry',
        focus: 'core',
        equipment: 'minimal',
        eccentricLoad: 'low',
        runnerBenefit: 'Grip, core, gait under load',
    },
    suitcase_carry: {
        name: 'Suitcase Carry',
        focus: 'core',
        equipment: 'minimal',
        eccentricLoad: 'low',
        runnerBenefit: 'Anti-lateral flexion, asymmetric load',
    },
};

// =============================================================================
// WORKOUT TEMPLATES (from research: 09-strength-protocols-for-runners.md)
// =============================================================================

export type WorkoutTemplate = 'A' | 'B' | 'P' | 'H' | 'N';

/**
 * Template A: Max Strength + Posterior Chain (45-60 min)
 * Best for: BASE_2 and early BUILD, on hard run days (after run)
 */
function getTemplateA(equipment: 'none' | 'minimal' | 'gym'): StrengthExercise[] {
    const exercises: StrengthExercise[] = [];

    // Main lift (squat or deadlift pattern)
    if (equipment === 'gym') {
        exercises.push({ name: 'Back Squat', sets: 4, reps: '4 @ 85-90% 1RM', rest: '180-240s' });
    } else {
        exercises.push({ name: 'Goblet Squat', sets: 4, reps: '6-8 @ RPE 8', rest: '180s' });
    }

    // Secondary lift (RDL)
    exercises.push({ name: 'Romanian Deadlift', sets: 3, reps: '6 @ RPE 7-8', rest: '120-180s' });

    // Hamstring knee-flexion
    exercises.push({ name: 'Swiss Ball Hamstring Curl', sets: 3, reps: '10', rest: '60-90s' });

    // Calves (superset)
    exercises.push({ name: 'Calf Raise', sets: 4, reps: '6-8 heavy', rest: '60-90s' });
    exercises.push({ name: 'Seated Calf Raise', sets: 3, reps: '10-12', rest: '60s' });

    // Core (anti-rotation)
    exercises.push({ name: 'Side Plank', sets: 2, reps: '30-45s each side' });
    exercises.push({ name: 'Pallof Press', sets: 2, reps: '10 each side' });

    return exercises;
}

/**
 * Template B: Single-Leg Strength + Hip Control (35-55 min)
 * Best for: BASE_1 through BUILD, especially for runners with pelvis/hip drop
 */
function getTemplateB(equipment: 'none' | 'minimal' | 'gym'): StrengthExercise[] {
    const exercises: StrengthExercise[] = [];

    // Single-leg strength
    exercises.push({ name: 'Bulgarian Split Squat', sets: 4, reps: '6 each leg @ RPE 7-8', rest: '120s' });
    exercises.push({ name: 'Step Up', sets: 3, reps: '6-8 each leg @ RPE 7', rest: '90-120s' });
    exercises.push({ name: 'Single Leg RDL', sets: 3, reps: '6-10 each leg @ RPE 7', rest: '60-120s' });

    // Hip stability
    exercises.push({ name: 'Band Walks', sets: 2, reps: '10 steps each direction' });
    exercises.push({ name: 'Clamshell', sets: 2, reps: '15 each side' });

    // Optional finisher: hip circuit subset
    exercises.push({ name: 'Glute Bridge', sets: 2, reps: '15' });
    exercises.push({ name: 'Dead Bug', sets: 2, reps: '10 each side' });

    return exercises;
}

/**
 * Template P: Power Primer (10-18 min add-on)
 * Best for: Start of Template A or B, or standalone micro session in BASE_2/BUILD
 */
function getTemplateP(equipment: 'none' | 'minimal' | 'gym'): StrengthExercise[] {
    const exercises: StrengthExercise[] = [];

    if (equipment === 'gym') {
        // Eleiko-style with hang clean
        exercises.push({ name: 'Depth Jump', sets: 3, reps: '4', rest: '90-120s' });
        exercises.push({ name: 'Hang Clean', sets: 3, reps: '4 @ 80% 1RM', rest: '150-240s' });
    } else {
        // Low equipment option
        exercises.push({ name: 'Pogo Hops', sets: 3, reps: '20 contacts', rest: '60s' });
        exercises.push({ name: 'Jump Squat', sets: 3, reps: '5', rest: '120s' });
    }

    exercises.push({ name: 'Box Jump', sets: 3, reps: '5 (step down)', rest: '90s' });

    return exercises;
}

/**
 * Template H: Jay Dicharry Hip Circuit (15-20 min)
 * Source: Running Rewired, published in Triathlete
 * Best for: Most days as warmup or standalone, especially for hip drop patterns
 */
function getTemplateH(): StrengthExercise[] {
    // Exact protocol from research: 2 rounds, 30-45s rest between exercises
    return [
        { name: 'Twisted Warrior', sets: 2, reps: '10 each leg' },
        { name: 'Butt Scoots', sets: 2, reps: '20 each side' },
        { name: 'Pigeon Hip Extension', sets: 2, reps: '10 each side' },
        { name: 'Glute Rainbow', sets: 2, reps: '10 each side' },
        { name: 'Standing Hip Circles', sets: 2, reps: '5 each side' },
        { name: 'Tippy Twist', sets: 2, reps: '8 each side' },
        { name: 'Push Up', sets: 2, reps: '10' }, // Burpees scaled to push-ups
        { name: 'Frog Bridge', sets: 2, reps: '25' },
        { name: 'Lateral Hurdle Hop', sets: 2, reps: '20 hops total' },
    ];
}

/**
 * Template N: Neural Day (12-20 min)
 * Source: Carrie Lane (Authentic Performance Center)
 * Best for: PEAK phase or when you want zero soreness but high neural output
 */
function getTemplateN(equipment: 'none' | 'minimal' | 'gym'): StrengthExercise[] {
    const exercises: StrengthExercise[] = [];

    // In-place jump circuit
    exercises.push({ name: 'Pogo Hops', sets: 1, reps: '15s on, 30s rest' });
    exercises.push({ name: 'Box Jump', sets: 4, reps: '5 (step down)', rest: 'full recovery' });

    // Power work with full recovery
    if (equipment === 'gym') {
        exercises.push({ name: 'Front Squat', sets: 5, reps: '2 @ RPE 6-7 (fast reps)', rest: '120s' });
    } else {
        exercises.push({ name: 'Jump Squat', sets: 4, reps: '3 (explosive)', rest: '120s' });
    }

    exercises.push({ name: 'Strict Pull Up', sets: 4, reps: '4', rest: '90s' });

    return exercises;
}

/**
 * Get the appropriate template based on phase and session type.
 * Research mapping (from 09-strength-protocols-for-runners.md):
 * - BASE_1: Template B (2x/week) + optional Template H
 * - BASE_2: Template A + Template B + Template P (power primer)
 * - BUILD: Template A (reduced sets) + Template B + Template P
 * - PEAK: Template N (1x/week) or Template A (very low volume)
 * - TAPER: Template H only or nothing
 */
function selectTemplate(phase: TrainingPhase, sessionNumber: 1 | 2): WorkoutTemplate {
    switch (phase) {
        case 'base':
            // BASE: Alternate between A and B, with power
            return sessionNumber === 1 ? 'A' : 'B';
        case 'build':
            // BUILD: Same as base but will reduce volume in generator
            return sessionNumber === 1 ? 'A' : 'B';
        case 'peak':
            // PEAK: Neural or low-volume A
            return sessionNumber === 1 ? 'N' : 'A';
        case 'taper':
            // TAPER: Hip circuit only
            return 'H';
    }
}

/**
 * Generate strength workout for a given phase and equipment level.
 * Uses research-based templates A/B/P/H/N.
 */
export function generateStrengthWorkout(
    phase: TrainingPhase,
    equipment: 'none' | 'minimal' | 'gym',
    sessionNumber: 1 | 2 = 1
): StrengthWorkout {
    const config = getStrengthPhaseConfig(phase);
    const template = selectTemplate(phase, sessionNumber);

    let exercises: StrengthExercise[];
    let duration: number;
    let templateName: string;

    switch (template) {
        case 'A':
            exercises = getTemplateA(equipment);
            duration = phase === 'peak' ? 35 : 50; // Reduced in peak
            templateName = 'Max Strength + Posterior Chain';
            break;
        case 'B':
            exercises = getTemplateB(equipment);
            duration = 45;
            templateName = 'Single-Leg + Hip Control';
            break;
        case 'P':
            exercises = getTemplateP(equipment);
            duration = 18;
            templateName = 'Power Primer';
            break;
        case 'H':
            exercises = getTemplateH();
            duration = 18;
            templateName = 'Dicharry Hip Circuit';
            break;
        case 'N':
            exercises = getTemplateN(equipment);
            duration = 20;
            templateName = 'Neural Day';
            break;
    }

    // Adjust sets based on phase (from research)
    if (phase === 'peak' || phase === 'taper') {
        exercises = exercises.map(ex => ({
            ...ex,
            sets: Math.max(1, Math.ceil(ex.sets * 0.6)), // Reduce to ~60% of sets
        }));
    }

    const focusAreas: StrengthFocus[] = [...new Set(exercises.map(ex => {
        const def = Object.values(RUNNER_EXERCISES).find(r => r.name === ex.name);
        return def?.focus || 'core';
    }))] as StrengthFocus[];

    return {
        id: `strength-${phase}-${template}-${sessionNumber}-${Date.now()}`,
        name: `${templateName} (${phase.charAt(0).toUpperCase() + phase.slice(1)} ${sessionNumber === 1 ? 'A' : 'B'})`,
        focus: focusAreas,
        duration,
        exercises,
        equipmentNeeded: equipment,
    };
}

/**
 * Get power primer as an add-on to a strength session.
 */
export function getPowerPrimer(equipment: 'none' | 'minimal' | 'gym'): StrengthWorkout {
    const exercises = getTemplateP(equipment);
    return {
        id: `power-primer-${Date.now()}`,
        name: 'Power Primer',
        focus: ['full_body'],
        duration: 15,
        exercises,
        equipmentNeeded: equipment,
    };
}

/**
 * Get Dicharry hip circuit as standalone.
 */
export function getDicharryHipCircuit(): StrengthWorkout {
    const exercises = getTemplateH();
    return {
        id: `dicharry-hip-${Date.now()}`,
        name: 'Dicharry Hip Circuit',
        focus: ['hip_stability', 'glutes'],
        duration: 18,
        exercises,
        equipmentNeeded: 'none',
    };
}

// =============================================================================
// ULTRA-SPECIFIC STRENGTH MODULES
// =============================================================================

/**
 * Downhill eccentric preparation module.
 * For mountain ultras with significant descent.
 */
export function getDownhillEccentricModule(): StrengthWorkout {
    return {
        id: `downhill-eccentric-${Date.now()}`,
        name: 'Downhill Prep',
        focus: ['single_leg', 'calves'],
        duration: 20,
        exercises: [
            { name: 'Eccentric Step Down', sets: 3, reps: '8 each leg' },
            { name: 'Slow Eccentric Squat', sets: 3, reps: '6 (5 sec down)' },
            { name: 'Eccentric Calf Raise', sets: 2, reps: '12 (5 sec down)' },
        ],
        equipmentNeeded: 'minimal',
        injuryPrevention: ['quad_tendon', 'knee', 'achilles'],
    };
}

/**
 * Power hiking/poles module.
 * For mountainous terrain training.
 */
export function getPoleHikingModule(): StrengthWorkout {
    return {
        id: `pole-hiking-${Date.now()}`,
        name: 'Pole Hiking Prep',
        focus: ['core', 'full_body'],
        duration: 15,
        exercises: [
            { name: 'Lat Pulldown or Band Pulldown', sets: 3, reps: '12' },
            { name: 'Tricep Dip', sets: 2, reps: '15' },
            { name: 'Farmer Carry', sets: 3, reps: '60 sec' },
        ],
        equipmentNeeded: 'minimal',
    };
}

/**
 * Foot/ankle durability module.
 * Essential for trail ultras.
 */
export function getFootAnkleDurabilityModule(): StrengthWorkout {
    return {
        id: `foot-ankle-${Date.now()}`,
        name: 'Foot & Ankle Durability',
        focus: ['calves'],
        duration: 10,
        exercises: [
            { name: 'Single Leg Balance', sets: 3, reps: '30 sec each' },
            { name: 'Toe Yoga', sets: 2, reps: '10 each' },
            { name: 'Banded Ankle Circles', sets: 2, reps: '10 each direction' },
            { name: 'Short Foot Drill', sets: 3, reps: '10 each' },
        ],
        equipmentNeeded: 'none',
        injuryPrevention: ['ankle', 'plantar_fascia'],
    };
}

// =============================================================================
// SCHEDULING HELPERS
// =============================================================================

/**
 * Check if strength session is safe relative to running schedule.
 */
export function isStrengthTimingSafe(
    hoursAfterRun: number,
    hoursBeforeNextRun: number,
    nextRunIsQuality: boolean
): { safe: boolean; recommendation: string } {
    // Ideal: 6+ hours after any run
    if (hoursAfterRun < 3) {
        return {
            safe: false,
            recommendation: 'Wait at least 3 hours after run (6+ preferred)',
        };
    }

    // Before quality run: need more buffer
    if (nextRunIsQuality && hoursBeforeNextRun < 24) {
        return {
            safe: false,
            recommendation: 'Need 24+ hours before quality run',
        };
    }

    // Before easy run: less buffer needed
    if (!nextRunIsQuality && hoursBeforeNextRun < 12) {
        return {
            safe: false,
            recommendation: 'Need 12+ hours before easy run',
        };
    }

    return {
        safe: true,
        recommendation: 'Good timing for strength session',
    };
}
