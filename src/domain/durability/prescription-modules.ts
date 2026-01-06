/**
 * Durability Prescription Modules
 * 
 * Research-backed corrective exercise protocols from:
 * - Jay Dicharry's "Running Rewired"
 * - Kelly Starrett's "Ready to Run"
 * 
 * Each module includes specific dosage, cues, and stop rules
 * exactly as prescribed in the source materials.
 */

export interface PrescriptionStep {
    name: string;
    dosage: string;
    cues: string[];
}

export interface PrescriptionModule {
    id: string;
    name: string;
    category: 'mobility' | 'control' | 'capacity' | 'tissue' | 'integration';
    source: 'dicharry' | 'starrett' | 'both';
    sourceBook: string;
    durationMinutes: number;
    equipment: string[];
    steps: PrescriptionStep[];
    stopRules: string[];
    frequencyGuidance: string;
    progression: string;
    regression: string;
    retestAssessments: string[];
}

/**
 * Complete module library from Dicharry + Starrett research
 */
export const PRESCRIPTION_MODULES: Record<string, PrescriptionModule> = {
    // ============ FOOT CONTROL MODULES ============

    toe_yoga: {
        id: 'toe_yoga',
        name: 'Toe Yoga',
        category: 'control',
        source: 'dicharry',
        sourceBook: 'Running Rewired',
        durationMinutes: 4,
        equipment: ['optional ruler for assist'],
        steps: [
            {
                name: 'Toe Yoga - Left Foot',
                dosage: '2:00 practice',
                cues: [
                    'Big toe up, others stay down',
                    'Big toe down without curling, others up',
                    'Arch stays lifted throughout',
                    'Do not cheat by rolling ankle in',
                ],
            },
            {
                name: 'Toe Yoga - Right Foot',
                dosage: '2:00 practice',
                cues: [
                    'Use ruler assist if big toe won\'t lift',
                    'Control the movement slowly',
                    'Focus on isolation, not speed',
                ],
            },
        ],
        stopRules: ['Stop if cramping becomes painful; take short breaks'],
        frequencyGuidance: 'Daily if foot control is a limiter.',
        progression: 'Perform during single-leg stance.',
        regression: 'Seated toe yoga.',
        retestAssessments: ['toe_yoga', 'single_leg_balance'],
    },

    foot_screws: {
        id: 'foot_screws',
        name: 'Foot Screws',
        category: 'control',
        source: 'dicharry',
        sourceBook: 'Running Rewired',
        durationMinutes: 3,
        equipment: [],
        steps: [
            {
                name: 'Foot Screws',
                dosage: '20 reps each foot',
                cues: [
                    'Big toe stays grounded',
                    'Rearfoot twists out then in',
                    'Controlled, specific motion',
                    'Feel the arch lift as you twist',
                ],
            },
        ],
        stopRules: ['Stop if you feel sharp big toe joint pain'],
        frequencyGuidance: '2-4x/week or as part of foot-focused days.',
        progression: 'Add slight heel raise control; slow tempo.',
        regression: 'Reduce heel raise height.',
        retestAssessments: ['toe_yoga', 'hallux_df'],
    },

    // ============ ANKLE MOBILITY MODULES ============

    ankle_df_mobility: {
        id: 'ankle_df_mobility',
        name: 'Ankle Dorsiflexion Mobility',
        category: 'mobility',
        source: 'both',
        sourceBook: 'Running Rewired + Ready to Run',
        durationMinutes: 4,
        equipment: ['wall'],
        steps: [
            {
                name: 'Knee-to-Wall Dorsiflexion - Left',
                dosage: '2-3 sets × 10 reps',
                cues: [
                    'Heel stays down',
                    'Knee tracks over 2nd toe',
                    'Move slowly and controlled',
                    'Focus on end-range glide',
                ],
            },
            {
                name: 'Knee-to-Wall Dorsiflexion - Right',
                dosage: '2-3 sets × 10 reps',
                cues: [
                    'Heel stays down',
                    'Knee tracks over 2nd toe',
                    'Push knee forward, not in',
                ],
            },
        ],
        stopRules: ['Stop if sharp anterior ankle pinch persists'],
        frequencyGuidance: 'Daily until dorsiflexion is sufficient.',
        progression: 'Increase toe distance slightly while staying clean.',
        regression: 'Reduce distance, smaller range.',
        retestAssessments: ['ankle_df'],
    },

    calf_tissue_work: {
        id: 'calf_tissue_work',
        name: 'Calf Tissue + Pressure Wave',
        category: 'tissue',
        source: 'starrett',
        sourceBook: 'Ready to Run',
        durationMinutes: 4,
        equipment: ['foam roller or lacrosse ball'],
        steps: [
            {
                name: 'Calf Smash + Pressure Wave - Left',
                dosage: '2:00 total',
                cues: [
                    'Sink and breathe',
                    'Slow side-to-side wave',
                    'Add ankle pumps on tender spots',
                    'Work from Achilles to below knee',
                ],
            },
            {
                name: 'Calf Smash + Pressure Wave - Right',
                dosage: '2:00 total',
                cues: [
                    'Find the sticky spots',
                    'Don\'t just roll - pressure wave',
                    'Breathe through it',
                ],
            },
        ],
        stopRules: ['Avoid aggressive numbness or nerve zing'],
        frequencyGuidance: 'As-needed for calf stiffness/hotspots, often post-run.',
        progression: 'Pin-and-move with ankle flex/extend.',
        regression: 'Lighter pressure, shorter duration.',
        retestAssessments: ['ankle_df', 'calf_endurance'],
    },

    // ============ HIP MOBILITY MODULES ============

    hip_flexor_stretch: {
        id: 'hip_flexor_stretch',
        name: 'Kneeling Hip Flexor Stretch',
        category: 'mobility',
        source: 'dicharry',
        sourceBook: 'Running Rewired',
        durationMinutes: 6,
        equipment: ['pad', 'optional doorframe'],
        steps: [
            {
                name: 'Kneeling Hip Flexor Stretch - Left',
                dosage: '3:00 hold',
                cues: [
                    'Posterior pelvic tilt (tuck tailbone)',
                    'Thigh stays vertical',
                    'No low-back arch!',
                    'Squeeze glute on stretching side',
                ],
            },
            {
                name: 'Kneeling Hip Flexor Stretch - Right',
                dosage: '3:00 hold',
                cues: [
                    'Maintain pelvic tilt throughout',
                    'Breathe into the stretch',
                    'Feel stretch in front of hip, not back',
                ],
            },
        ],
        stopRules: ['Stop if you get front-hip pinch or numbness'],
        frequencyGuidance: 'Only when doorway test produces a huge pull. 3-5x/week.',
        progression: 'Slightly move kneeling foot outward before tilting pelvis.',
        regression: 'Shorter hold; reduced tilt intensity.',
        retestAssessments: ['hip_extension'],
    },

    couch_stretch: {
        id: 'couch_stretch',
        name: 'Couch Stretch',
        category: 'mobility',
        source: 'starrett',
        sourceBook: 'Ready to Run',
        durationMinutes: 4,
        equipment: ['wall or couch', 'knee pad'],
        steps: [
            {
                name: 'Couch Stretch - Left',
                dosage: '2:00 hold',
                cues: [
                    'Glute squeeze on rear leg',
                    'Ribs down',
                    'Tall torso',
                    'Do NOT over-arch low back',
                ],
            },
            {
                name: 'Couch Stretch - Right',
                dosage: '2:00 hold',
                cues: [
                    'Glute squeeze on rear leg',
                    'Ribs down',
                    'Tall torso',
                    'Breathe and relax into it',
                ],
            },
        ],
        stopRules: ['Stop if sharp pain or numbness/tingling'],
        frequencyGuidance: 'Daily when hip extension/quad tightness limits squat or run mechanics.',
        progression: 'More upright torso; reduce support; add gentle reach overhead without rib flare.',
        regression: 'Use a box/couch support in front to offload.',
        retestAssessments: ['hip_extension', 'squat_shape'],
    },

    hip_rotation_90_90: {
        id: 'hip_rotation_90_90',
        name: '90/90 Hip Rotation Stretch',
        category: 'mobility',
        source: 'both',
        sourceBook: 'Running Rewired + Ready to Run',
        durationMinutes: 5,
        equipment: [],
        steps: [
            {
                name: '90/90 Position Holds',
                dosage: '90 seconds each side',
                cues: [
                    'Both legs at 90°',
                    'Sit tall with neutral spine',
                    'Feel the stretch in the hip, not the knee',
                ],
            },
            {
                name: '90/90 Transitions',
                dosage: '10 reps side to side',
                cues: [
                    'Keep torso upright while switching',
                    'Control the motion',
                    'Use hands for balance only',
                ],
            },
        ],
        stopRules: ['Stop if knee pain develops'],
        frequencyGuidance: 'Daily for those with limited hip rotation. 3x/week for maintenance.',
        progression: 'Add forward lean in front hip position.',
        regression: 'Support with hands, reduce range.',
        retestAssessments: ['hip_rotation'],
    },

    // ============ HIP STABILITY/STRENGTH MODULES ============

    glute_activation: {
        id: 'glute_activation',
        name: 'Glute Activation Sequence',
        category: 'control',
        source: 'dicharry',
        sourceBook: 'Running Rewired',
        durationMinutes: 5,
        equipment: ['optional mini band'],
        steps: [
            {
                name: 'Clam Shells',
                dosage: '15 reps each side',
                cues: [
                    'Keep heels together',
                    'Don\'t rotate the pelvis',
                    'Feel the glute med, not hip flexor',
                ],
            },
            {
                name: 'Side-Lying Hip Abduction',
                dosage: '15 reps each side',
                cues: [
                    'Top leg straight',
                    'Lead with heel, not toe',
                    'Control the descent',
                ],
            },
            {
                name: 'Fire Hydrants',
                dosage: '12 reps each side',
                cues: [
                    'Keep core stable',
                    'Don\'t shift weight to opposite side',
                    'Squeeze at top',
                ],
            },
        ],
        stopRules: ['Stop if hip flexor cramps instead of glute working'],
        frequencyGuidance: '3-4x/week before runs for those with hip drop issues.',
        progression: 'Add mini band resistance.',
        regression: 'Reduce reps, focus on activation quality.',
        retestAssessments: ['single_leg_stance_hip', 'hip_abduction_strength'],
    },

    bridge_control: {
        id: 'bridge_control',
        name: 'Bridge Control Progression',
        category: 'capacity',
        source: 'dicharry',
        sourceBook: 'Running Rewired',
        durationMinutes: 5,
        equipment: [],
        steps: [
            {
                name: 'Two-Leg Glute Bridge',
                dosage: '10 reps, 3s hold at top',
                cues: [
                    'Drive through heels',
                    'Squeeze glutes at top',
                    'Don\'t hyperextend low back',
                ],
            },
            {
                name: 'Single-Leg Bridge Holds',
                dosage: '3 rounds × 10s each side',
                cues: [
                    'Hips level',
                    'Glute does the work',
                    'No hamstring cramp',
                    'Ribs down',
                ],
            },
        ],
        stopRules: ['Stop if hamstring cramps repeatedly; switch to two-leg bridge'],
        frequencyGuidance: 'Every other day until the test is clean.',
        progression: 'Longer holds or march bridges.',
        regression: 'Two-leg bridge holds only.',
        retestAssessments: ['glute_bridge'],
    },

    // ============ CORE STABILITY MODULES ============

    deep_core_mini: {
        id: 'deep_core_mini',
        name: 'Deep Core Stability Series',
        category: 'control',
        source: 'dicharry',
        sourceBook: 'Running Rewired',
        durationMinutes: 6,
        equipment: ['optional foam roller'],
        steps: [
            {
                name: 'Kneeling Side Plank Pulses',
                dosage: '20 reps each side',
                cues: [
                    'Elbow under shoulder',
                    'Long line from neck to knee',
                    'No trunk twist',
                    'Control the pulse',
                ],
            },
            {
                name: 'Dead Bug - Alternating',
                dosage: '10 reps each side',
                cues: [
                    'Low back stays flat on floor',
                    'Move slowly - don\'t rush',
                    'Exhale as you extend',
                    'Opposite arm/leg move together',
                ],
            },
            {
                name: 'Roller/Bird Dogs',
                dosage: '2:00 alternating',
                cues: [
                    'Neutral spine',
                    'Move slow enough to stay stable',
                    'Don\'t rotate pelvis',
                ],
            },
        ],
        stopRules: ['Stop if low back pain starts to build'],
        frequencyGuidance: '2-4x/week, or micro-dose when trunk feels unstable.',
        progression: 'Add opposite arm reach in bird dogs.',
        regression: 'Shorter lever; fewer reps.',
        retestAssessments: ['dead_bug', 'glute_bridge'],
    },

    // ============ CALF CAPACITY MODULES ============

    calf_raise_capacity: {
        id: 'calf_raise_capacity',
        name: 'Calf Raise Capacity Builder',
        category: 'capacity',
        source: 'both',
        sourceBook: 'Running Rewired + Ready to Run',
        durationMinutes: 6,
        equipment: ['step (optional)'],
        steps: [
            {
                name: 'Single-Leg Calf Raises - Left',
                dosage: '3 sets, stop 2 reps before failure',
                cues: [
                    'Full range - go all the way up and down',
                    'Control the descent - 2 seconds down',
                    'No ankle wobble',
                    'Stay balanced on forefoot',
                ],
            },
            {
                name: 'Single-Leg Calf Raises - Right',
                dosage: '3 sets, stop 2 reps before failure',
                cues: [
                    'Match reps on each side',
                    'Quality over quantity',
                    'Feel the calf, not the foot',
                ],
            },
        ],
        stopRules: ['Stop if Achilles pain increases during set'],
        frequencyGuidance: '2-3x/week consistently. Goal: 25+ reps pain-free.',
        progression: 'Add load once 25 reps is easy.',
        regression: 'Two-leg raises; reduce range.',
        retestAssessments: ['calf_endurance'],
    },

    // ============ INTEGRATION MODULES ============

    squat_practice: {
        id: 'squat_practice',
        name: 'Squat Movement Practice',
        category: 'integration',
        source: 'starrett',
        sourceBook: 'Ready to Run',
        durationMinutes: 4,
        equipment: [],
        steps: [
            {
                name: 'Deep Squat Hold',
                dosage: 'Accumulated 1:00-2:00',
                cues: [
                    'Heels stay down',
                    'Knees track out over toes',
                    'Long spine - no rounding',
                    'Breathe and relax into it',
                ],
            },
            {
                name: 'Air Squats',
                dosage: '2 × 10 reps, controlled',
                cues: [
                    'Screw feet into floor',
                    'No knee cave',
                    'Stay balanced on midfoot',
                    'Full depth if possible',
                ],
            },
        ],
        stopRules: ['Stop if knee/hip pinch appears'],
        frequencyGuidance: 'Most days as a movement skill.',
        progression: 'Add load 2-3x/week once pattern is clean.',
        regression: 'Box squat to a target.',
        retestAssessments: ['squat_shape'],
    },

    single_leg_integration: {
        id: 'single_leg_integration',
        name: 'Single-Leg Integration',
        category: 'integration',
        source: 'dicharry',
        sourceBook: 'Running Rewired',
        durationMinutes: 6,
        equipment: ['light weight (8-10 lb)'],
        steps: [
            {
                name: 'Single-Leg Shoulder Press',
                dosage: '15 reps each side',
                cues: [
                    'Set tripod through forefoot',
                    'Big toe down',
                    'Ribs down, neutral spine',
                    'Do not lean back',
                ],
            },
            {
                name: 'Tippy Twist',
                dosage: '2 sets × 10 reps each foot',
                cues: [
                    'Tripod strong',
                    'Hips level',
                    'Neutral spine',
                    'Twist from hip, not spine',
                ],
            },
        ],
        stopRules: ['Stop if low back arches or balance collapses repeatedly', 'Stop if knee twist pain'],
        frequencyGuidance: '2-3x/week for foot-to-core integration.',
        progression: 'Increase overhead tempo control; slightly heavier load.',
        regression: 'Two-leg stance press with tripod cues.',
        retestAssessments: ['single_leg_balance', 'single_leg_stance_hip'],
    },

    // ============ BALANCE MODULES ============

    balance_progression: {
        id: 'balance_progression',
        name: 'Balance Progression',
        category: 'control',
        source: 'both',
        sourceBook: 'Running Rewired + Ready to Run',
        durationMinutes: 5,
        equipment: [],
        steps: [
            {
                name: 'Single-Leg Stance Eyes Open',
                dosage: '45 seconds each side',
                cues: [
                    'Hands on shoulders',
                    'Find your tripod through the foot',
                    'Quiet the ankle wobble',
                ],
            },
            {
                name: 'Single-Leg Stance Eyes Closed',
                dosage: '30 seconds each side (goal: 45s)',
                cues: [
                    'Same position as above',
                    'Close eyes and maintain',
                    'Use small ankle adjustments, not hip sway',
                ],
            },
            {
                name: 'Single-Leg Reaches',
                dosage: '8 reaches each direction',
                cues: [
                    'Forward, side, back reaches',
                    'Standing leg stays stable',
                    'Hip hinge, don\'t round spine',
                ],
            },
        ],
        stopRules: ['Take breaks if you\'re just falling repeatedly'],
        frequencyGuidance: 'Daily if balance is a limiter.',
        progression: 'Add eyes-closed reaching or unstable surface.',
        regression: 'Eyes open only, use wall for safety.',
        retestAssessments: ['single_leg_balance'],
    },
};

/**
 * Get modules prescribed for a specific failed/partial assessment
 */
export function getModulesForAssessment(assessmentId: string): PrescriptionModule[] {
    // Map assessment IDs to their prescribed modules
    const ASSESSMENT_TO_MODULES: Record<string, string[]> = {
        toe_yoga: ['toe_yoga', 'foot_screws'],
        ankle_df: ['ankle_df_mobility', 'calf_tissue_work'],
        single_leg_balance: ['balance_progression', 'toe_yoga', 'single_leg_integration'],
        single_leg_stance_hip: ['glute_activation', 'bridge_control'],
        squat_shape: ['squat_practice', 'ankle_df_mobility', 'couch_stretch'],
        hip_extension: ['hip_flexor_stretch', 'couch_stretch', 'bridge_control'],
        hip_rotation: ['hip_rotation_90_90'],
        glute_bridge: ['bridge_control', 'deep_core_mini'],
        dead_bug: ['deep_core_mini'],
        thoracic_rotation: ['hip_rotation_90_90'], // Thoracic-specific coming later
        calf_endurance: ['calf_raise_capacity', 'calf_tissue_work'],
        hip_abduction_strength: ['glute_activation'],
    };

    const moduleIds = ASSESSMENT_TO_MODULES[assessmentId] || [];
    return moduleIds
        .map(id => PRESCRIPTION_MODULES[id])
        .filter(Boolean);
}

/**
 * Get all modules for a list of failed assessments, prioritized by frequency
 */
export function getPrescriptionForResults(
    results: { assessmentId: string; result: 'pass' | 'fail' | 'partial' }[]
): {
    priorityModules: PrescriptionModule[];
    maintenanceModules: PrescriptionModule[];
} {
    const failedModules = new Set<string>();
    const partialModules = new Set<string>();

    for (const { assessmentId, result } of results) {
        const modules = getModulesForAssessment(assessmentId);
        for (const mod of modules) {
            if (result === 'fail') {
                failedModules.add(mod.id);
            } else if (result === 'partial') {
                partialModules.add(mod.id);
            }
        }
    }

    // Priority: all failed modules
    const priorityModules = Array.from(failedModules)
        .map(id => PRESCRIPTION_MODULES[id])
        .filter(Boolean);

    // Maintenance: partial modules not already in priority
    const maintenanceModules = Array.from(partialModules)
        .filter(id => !failedModules.has(id))
        .map(id => PRESCRIPTION_MODULES[id])
        .filter(Boolean);

    return { priorityModules, maintenanceModules };
}
