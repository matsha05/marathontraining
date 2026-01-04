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
    // Glute-focused
    hip_thrust: {
        name: 'Hip Thrust',
        focus: 'glutes',
        equipment: 'minimal',
        eccentricLoad: 'low',
        runnerBenefit: 'Hip extension power, minimal leg DOMS',
        substitutes: ['glute_bridge', 'single_leg_bridge'],
    },
    single_leg_bridge: {
        name: 'Single Leg Glute Bridge',
        focus: 'glutes',
        equipment: 'none',
        eccentricLoad: 'low',
        runnerBenefit: 'Unilateral glute activation',
    },
    clamshell: {
        name: 'Clamshell',
        focus: 'hip_stability',
        equipment: 'minimal',
        eccentricLoad: 'low',
        runnerBenefit: 'Hip abductor and rotator strength',
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

    // Single-leg
    single_leg_rdl: {
        name: 'Single Leg RDL',
        focus: 'single_leg',
        equipment: 'minimal',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Hamstring and balance, hip hinge pattern',
        substitutes: ['single_leg_deadlift_bodyweight'],
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

    // Calf
    calf_raise: {
        name: 'Calf Raise',
        focus: 'calves',
        equipment: 'minimal',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Achilles tendon loading, calf endurance',
    },
    eccentric_calf_raise: {
        name: 'Eccentric Calf Raise',
        focus: 'calves',
        equipment: 'minimal',
        eccentricLoad: 'high',
        runnerBenefit: 'Achilles tendon resilience (use 48h+ before quality runs)',
    },

    // Compound (gym)
    trap_bar_deadlift: {
        name: 'Trap Bar Deadlift',
        focus: 'full_body',
        equipment: 'gym',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Posterior chain power, spine-friendly',
    },
    goblet_squat: {
        name: 'Goblet Squat',
        focus: 'full_body',
        equipment: 'minimal',
        eccentricLoad: 'moderate',
        runnerBenefit: 'Leg strength with core engagement',
    },
};

// =============================================================================
// WORKOUT TEMPLATES
// =============================================================================

/**
 * Generate strength workout for a given phase and equipment level.
 */
export function generateStrengthWorkout(
    phase: TrainingPhase,
    equipment: 'none' | 'minimal' | 'gym',
    sessionNumber: 1 | 2 = 1
): StrengthWorkout {
    const config = getStrengthPhaseConfig(phase);
    const availableExercises = Object.values(RUNNER_EXERCISES).filter(
        ex =>
            ex.equipment === equipment ||
            (equipment === 'gym' && ex.equipment !== 'gym') ||
            (equipment === 'minimal' && ex.equipment === 'none')
    );

    // Select exercises based on focus and phase
    const selectedExercises: StrengthExercise[] = [];

    // Always include core
    const coreExercises = availableExercises.filter(ex => ex.focus === 'core');
    if (coreExercises.length > 0) {
        const core = coreExercises[sessionNumber % coreExercises.length];
        selectedExercises.push({
            name: core.name,
            sets: config.setsPerExercise,
            reps: `${config.repRange[0]}-${config.repRange[1]}`,
        });
    }

    // Add glute work
    const gluteExercises = availableExercises.filter(ex => ex.focus === 'glutes');
    if (gluteExercises.length > 0) {
        const glute = gluteExercises[sessionNumber % gluteExercises.length];
        selectedExercises.push({
            name: glute.name,
            sets: config.setsPerExercise,
            reps: `${config.repRange[0]}-${config.repRange[1]}`,
        });
    }

    // Add single-leg work (if not peak/taper)
    if (phase === 'base' || phase === 'build') {
        const singleLeg = availableExercises.filter(ex => ex.focus === 'single_leg');
        if (singleLeg.length > 0) {
            const leg = singleLeg[sessionNumber % singleLeg.length];
            selectedExercises.push({
                name: leg.name,
                sets: config.setsPerExercise,
                reps: `${config.repRange[0]}-${config.repRange[1]} each`,
            });
        }
    }

    // Add calf work on session 2
    if (sessionNumber === 2) {
        const calfExercises = availableExercises.filter(ex => ex.focus === 'calves');
        if (calfExercises.length > 0) {
            selectedExercises.push({
                name: calfExercises[0].name,
                sets: 2,
                reps: '15-20',
            });
        }
    }

    const focusAreas: StrengthFocus[] = [...new Set(selectedExercises.map(ex => {
        const def = Object.values(RUNNER_EXERCISES).find(r => r.name === ex.name);
        return def?.focus || 'core';
    }))] as StrengthFocus[];

    return {
        id: `strength-${phase}-${sessionNumber}-${Date.now()}`,
        name: sessionNumber === 1
            ? `${phase.charAt(0).toUpperCase() + phase.slice(1)} Strength A`
            : `${phase.charAt(0).toUpperCase() + phase.slice(1)} Strength B`,
        focus: focusAreas,
        duration: 25 + selectedExercises.length * 5,
        exercises: selectedExercises,
        equipmentNeeded: equipment,
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
