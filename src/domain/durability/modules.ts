/**
 * Durability Modules
 * 
 * Corrective exercise modules assigned based on assessment results
 * 
 * Research sources:
 * - Jay Dicharry's "Running Rewired" 
 * - Kelly Starrett's "Ready to Run" and "Becoming a Supple Leopard"
 * 
 * Each module includes:
 * - Exact protocols from the source books
 * - Coaching cues for proper form
 * - Stop rules for safety
 * - Progression/regression options
 */

export interface DurabilityExercise {
    id: string;
    name: string;
    sets: number;
    reps: string;
    holdSeconds?: number;
    notes?: string;
    /** Coaching cues - exactly what the books prescribe */
    cues?: string[];
}

export interface DurabilityModule {
    id: string;
    name: string;
    category: 'foot' | 'ankle' | 'hip' | 'core' | 'mobility' | 'balance';
    durationMin: number;
    frequency: 'daily' | 'every_other_day' | '3x_week';
    exercises: DurabilityExercise[];
    source: string;
    /** When to stop the exercise (safety/form breakdown) */
    stopRules?: string[];
    /** Detailed guidance on when to do this module */
    frequencyGuidance?: string;
    /** How to make it harder once mastered */
    progression?: string;
    /** How to scale down if too difficult */
    regression?: string;
}

export const DURABILITY_MODULES: Record<string, DurabilityModule> = {
    foot_intrinsics: {
        id: 'foot_intrinsics',
        name: 'Foot Intrinsic Activation',
        category: 'foot',
        durationMin: 8,
        frequency: 'daily',
        exercises: [
            {
                id: 'toe_yoga',
                name: 'Toe Yoga',
                sets: 2,
                reps: '10 each direction',
                cues: [
                    'Big toe up while others stay down',
                    'Big toe down without curling, others up',
                    'Arch stays lifted throughout',
                    'Do NOT roll ankle inward to cheat',
                ],
            },
            {
                id: 'short_foot',
                name: 'Short Foot',
                sets: 3,
                reps: '10',
                holdSeconds: 5,
                cues: [
                    'Draw ball of foot toward heel without curling toes',
                    'Arch lifts and shortens',
                    'All 5 toes stay flat on ground',
                ],
            },
            {
                id: 'towel_scrunches',
                name: 'Towel Scrunches',
                sets: 2,
                reps: '20',
                cues: ['Use the toes to pull towel, not the ankle'],
            },
            {
                id: 'marble_pickups',
                name: 'Marble Pickups',
                sets: 1,
                reps: '10 each foot',
                cues: ['Pick up and place with control'],
            },
        ],
        source: 'Dicharry Running Rewired',
        stopRules: ['Stop if cramping becomes painful; take short breaks'],
        frequencyGuidance: 'Daily if toe yoga test fails. Continue until you pass consistently.',
        progression: 'Perform toe yoga during single-leg stance.',
        regression: 'Start seated before progressing to standing.',
    },

    ankle_mobility: {
        id: 'ankle_mobility',
        name: 'Ankle Dorsiflexion Mobility',
        category: 'ankle',
        durationMin: 10,
        frequency: 'daily',
        exercises: [
            {
                id: 'wall_ankle',
                name: 'Wall Ankle Stretch (Knee-to-Wall)',
                sets: 3,
                reps: '10 reps each',
                cues: [
                    'Heel stays flat on ground',
                    'Knee tracks over 2nd toe',
                    'Push knee forward, not inward',
                    'Move slowly - feel the end range',
                ],
            },
            {
                id: 'banded_df',
                name: 'Banded Dorsiflexion',
                sets: 2,
                reps: '15 each',
                cues: [
                    'Band pulls talus backward',
                    'Drive knee forward with band tension',
                    'Creates joint space for better glide',
                ],
            },
            {
                id: 'calf_foam_roll',
                name: 'Calf Pressure Wave',
                sets: 1,
                reps: '90s each',
                holdSeconds: 90,
                cues: [
                    'Sink and breathe - don\'t just roll',
                    'Slow side-to-side wave on tender spots',
                    'Add ankle pumps while holding pressure',
                    'Work from Achilles to below knee',
                ],
            },
        ],
        source: 'Starrett Ready to Run',
        stopRules: ['Stop if sharp anterior ankle pinch persists', 'Avoid nerve sensations while rolling'],
        frequencyGuidance: 'Daily until you pass the 4-inch knee-to-wall test.',
        progression: 'Increase toe distance from wall while maintaining clean form.',
        regression: 'Start closer to wall, smaller range of motion.',
    },

    calf_strength: {
        id: 'calf_strength',
        name: 'Calf Strength Progression',
        category: 'ankle',
        durationMin: 12,
        frequency: 'every_other_day',
        exercises: [
            {
                id: 'standing_calf',
                name: 'Standing Calf Raise',
                sets: 3,
                reps: '15',
                cues: [
                    'Full range - all the way up and down',
                    'Control the descent',
                    'Weight through big toe side',
                ],
            },
            {
                id: 'single_leg_calf',
                name: 'Single Leg Calf Raise',
                sets: 3,
                reps: '12 each (goal: 25)',
                cues: [
                    'Full range of motion',
                    '2 seconds up, 2 seconds down',
                    'No ankle wobble',
                    'Match reps on each side',
                ],
            },
            {
                id: 'eccentric_calf',
                name: 'Eccentric Calf Lower',
                sets: 3,
                reps: '10 each',
                notes: '3s lower',
                cues: [
                    'Use both legs to rise up',
                    'Lower on ONE leg for 3 full seconds',
                    'Control is everything',
                    'Critical for Achilles health',
                ],
            },
        ],
        source: 'Dicharry Running Rewired',
        stopRules: ['Stop if Achilles pain increases during set', 'Stop if sharp pain anywhere'],
        frequencyGuidance: '2-3x/week consistently. Goal: 25+ reps single leg pain-free.',
        progression: 'Add weight once 25 reps is easy.',
        regression: 'Two-leg raises only; reduce range.',
    },

    hip_stability: {
        id: 'hip_stability',
        name: 'Hip Stability Circuit',
        category: 'hip',
        durationMin: 15,
        frequency: 'every_other_day',
        exercises: [
            {
                id: 'side_lying_clam',
                name: 'Side Lying Clam',
                sets: 3,
                reps: '15 each',
                cues: [
                    'Keep heels together throughout',
                    'Don\'t rotate pelvis - it stays stacked',
                    'Feel glute med, not hip flexor',
                    'Control the movement, no momentum',
                ],
            },
            {
                id: 'side_plank_lift',
                name: 'Side Plank + Hip Lift',
                sets: 2,
                reps: '10 each',
                cues: [
                    'Elbow directly under shoulder',
                    'Long line from head to heels',
                    'Lower hip to floor and back to neutral',
                ],
            },
            {
                id: 'single_leg_bridge',
                name: 'Single Leg Bridge',
                sets: 3,
                reps: '10 each',
                holdSeconds: 3,
                cues: [
                    'Drive through heel',
                    'Keep hips level - don\'t drop!',
                    'Glute does the work, not hamstring',
                    'Ribs stay down, don\'t over-arch',
                ],
            },
            {
                id: 'banded_monster_walk',
                name: 'Banded Monster Walk',
                sets: 2,
                reps: '20 steps',
                cues: [
                    'Maintain tension in band throughout',
                    'Athletic stance - slight bend in knees',
                    'Don\'t let knees cave inward',
                    'Step with control, full range',
                ],
            },
        ],
        source: 'Dicharry Running Rewired',
        stopRules: ['Stop if hip flexor cramps instead of glute', 'Stop if low back starts to ache'],
        frequencyGuidance: 'Every other day. Critical if you have hip drop during running.',
        progression: 'Add band resistance to all exercises.',
        regression: 'Fewer reps, focus on perfect glute activation.',
    },

    glute_activation: {
        id: 'glute_activation',
        name: 'Glute Activation Series',
        category: 'hip',
        durationMin: 10,
        frequency: 'daily',
        exercises: [
            {
                id: 'bridge',
                name: 'Glute Bridge',
                sets: 2,
                reps: '15',
                holdSeconds: 2,
                cues: [
                    'Drive through heels',
                    'Squeeze glutes hard at top',
                    'Don\'t hyperextend low back',
                    'Feel it in glutes, not hamstrings',
                ],
            },
            {
                id: 'fire_hydrant',
                name: 'Fire Hydrant',
                sets: 2,
                reps: '12 each',
                cues: [
                    'Keep core stable - no shifting',
                    'Don\'t lean away from lifting leg',
                    'Small, controlled movement',
                    'Squeeze at top position',
                ],
            },
            {
                id: 'donkey_kick',
                name: 'Donkey Kick',
                sets: 2,
                reps: '12 each',
                cues: [
                    'Keep spine neutral',
                    'Don\'t arch back as leg lifts',
                    'Focus on glute squeeze, not height',
                ],
            },
            {
                id: 'standing_hip_circle',
                name: 'Standing Hip Circle',
                sets: 1,
                reps: '10 each direction',
                cues: [
                    'Support leg stays stable',
                    'Controlled circles through full range',
                ],
            },
        ],
        source: 'Dicharry Running Rewired',
        stopRules: ['Stop if hip flexor cramps instead of glute working'],
        frequencyGuidance: 'Pre-run warmup or daily if glutes won\'t fire during running.',
        progression: 'Add mini band resistance.',
        regression: 'Reduce reps, focus on activation quality over quantity.',
    },

    hip_flexor_mobility: {
        id: 'hip_flexor_mobility',
        name: 'Hip Flexor Mobility',
        category: 'mobility',
        durationMin: 8,
        frequency: 'daily',
        exercises: [
            {
                id: 'couch_stretch',
                name: 'Couch Stretch',
                sets: 2,
                reps: '90s each',
                holdSeconds: 90,
                cues: [
                    'Squeeze glute on rear leg',
                    'Ribs DOWN - don\'t flare',
                    'Tall torso, don\'t lean forward',
                    'Do NOT over-arch low back',
                ],
            },
            {
                id: 'half_kneeling_hip',
                name: 'Half-Kneeling Hip Flexor Stretch',
                sets: 2,
                reps: '60s each',
                holdSeconds: 60,
                cues: [
                    'Posterior pelvic tilt (tuck tailbone)',
                    'Keep thigh vertical',
                    'No low-back arch!',
                    'Feel stretch in front of hip',
                ],
            },
            {
                id: 'psoas_march',
                name: 'Supine Psoas March',
                sets: 2,
                reps: '10 each',
                cues: [
                    'Low back stays flat on floor',
                    'Controlled lowering',
                    'Core stays braced throughout',
                ],
            },
        ],
        source: 'Starrett Ready to Run',
        stopRules: ['Stop if you get front-hip pinch or numbness'],
        frequencyGuidance: 'Only when doorway test shows tightness. 3-5x/week until resolved.',
        progression: 'Slight reach overhead without rib flare.',
        regression: 'Use box/couch for support, shorter holds.',
    },

    core_stability: {
        id: 'core_stability',
        name: 'Runner Core Stability',
        category: 'core',
        durationMin: 12,
        frequency: 'every_other_day',
        exercises: [
            {
                id: 'dead_bug',
                name: 'Dead Bug',
                sets: 3,
                reps: '10 each side',
                cues: [
                    'Low back STAYS FLAT on floor',
                    'Move slowly - don\'t rush',
                    'Exhale as you extend',
                    'Opposite arm/leg move together',
                ],
            },
            {
                id: 'bird_dog',
                name: 'Bird Dog',
                sets: 3,
                reps: '10 each side',
                holdSeconds: 3,
                cues: [
                    'Neutral spine - don\'t sag or arch',
                    'Reach long, not high',
                    'Don\'t rotate pelvis',
                    'Move slow enough to stay stable',
                ],
            },
            {
                id: 'pallof_press',
                name: 'Pallof Press',
                sets: 2,
                reps: '10 each side',
                cues: [
                    'Resist rotation - that\'s the work',
                    'Press straight out from chest',
                    'Athletic stance, slight knee bend',
                    'Core braced throughout',
                ],
            },
            {
                id: 'plank',
                name: 'Plank',
                sets: 2,
                reps: '45s',
                holdSeconds: 45,
                cues: [
                    'Long line from head to heels',
                    'Don\'t let hips sag',
                    'Don\'t pike hips up',
                    'Breathe - don\'t hold breath',
                ],
            },
        ],
        source: 'Dicharry Running Rewired',
        stopRules: ['Stop if low back pain builds', 'Stop if you can\'t maintain neutral spine'],
        frequencyGuidance: '2-4x/week. Critical for energy transfer during running.',
        progression: 'Add limb reaches to plank, longer holds.',
        regression: 'Kneeling versions, shorter holds.',
    },

    balance_progression: {
        id: 'balance_progression',
        name: 'Balance Progression',
        category: 'balance',
        durationMin: 8,
        frequency: '3x_week',
        exercises: [
            {
                id: 'single_leg_stand',
                name: 'Single Leg Stand Eyes Closed',
                sets: 3,
                reps: '30s each (goal: 45s)',
                cues: [
                    'Hands on shoulders',
                    'Find your tripod through foot',
                    'Quiet the ankle wobble',
                    'Small corrections, not big sways',
                ],
            },
            {
                id: 'single_leg_reaches',
                name: 'Single Leg Reaches',
                sets: 2,
                reps: '8 each direction',
                cues: [
                    'Forward, side, and back reaches',
                    'Standing leg stays stable',
                    'Hip hinge, don\'t round spine',
                    'Control the return',
                ],
            },
            {
                id: 'bosu_balance',
                name: 'BOSU Balance (if available)',
                sets: 2,
                reps: '30s each',
                cues: [
                    'Start with eyes open',
                    'Progress to eyes closed',
                    'Tripod foot position',
                ],
            },
        ],
        source: 'Dicharry Running Rewired',
        stopRules: ['Take breaks if you\'re just falling repeatedly'],
        frequencyGuidance: 'Daily if balance is a limiter. Goal: 45s eyes closed.',
        progression: 'Eyes-closed reaching or unstable surface.',
        regression: 'Eyes open only, use wall for safety.',
    },

    thoracic_mobility: {
        id: 'thoracic_mobility',
        name: 'Thoracic Spine Mobility',
        category: 'mobility',
        durationMin: 8,
        frequency: 'daily',
        exercises: [
            {
                id: 't_spine_rotation',
                name: 'Thread the Needle',
                sets: 2,
                reps: '10 each side',
                cues: [
                    'Reach arm through and rotate thoracic',
                    'Keep hips square - don\'t rotate pelvis',
                    'Follow hand with eyes',
                    'Exhale as you rotate through',
                ],
            },
            {
                id: 'cat_cow',
                name: 'Cat-Cow',
                sets: 2,
                reps: '10',
                cues: [
                    'Segment by segment movement',
                    'Full flexion to full extension',
                    'Breathe with the movement',
                ],
            },
            {
                id: 'foam_roll_thoracic',
                name: 'Foam Roll Thoracic Extension',
                sets: 1,
                reps: '60s',
                holdSeconds: 60,
                cues: [
                    'Roller under upper back',
                    'Support head with hands',
                    'Extend over roller segment by segment',
                    'Don\'t roll the low back',
                ],
            },
            {
                id: 'open_book',
                name: 'Open Book Stretch',
                sets: 2,
                reps: '8 each side',
                holdSeconds: 5,
                cues: [
                    'Keep knees stacked',
                    'Rotate through upper back',
                    'Reach arm to ceiling then across',
                    'Follow hand with eyes',
                ],
            },
        ],
        source: 'Starrett Becoming a Supple Leopard',
        stopRules: ['Stop if low back pain develops - you\'re rotating wrong segment'],
        frequencyGuidance: 'Daily if stiff. Critical for arm swing efficiency.',
        progression: 'Add rotation with breathing holds.',
        regression: 'Smaller range, more support.',
    },
};

export function getModule(id: string): DurabilityModule | undefined {
    return DURABILITY_MODULES[id];
}

export function getModulesByCategory(category: DurabilityModule['category']): DurabilityModule[] {
    return Object.values(DURABILITY_MODULES).filter(m => m.category === category);
}

export function calculateTotalDurabilityTime(moduleIds: string[]): number {
    return moduleIds.reduce((sum, id) => {
        const module = DURABILITY_MODULES[id];
        return sum + (module?.durationMin || 0);
    }, 0);
}
