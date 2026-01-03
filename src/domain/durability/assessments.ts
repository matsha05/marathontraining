/**
 * Durability Assessment Definitions
 * 
 * Based on Jay Dicharry's Running Rewired assessments
 * These tests identify movement quality issues before they become injuries
 */

export type AssessmentResult = 'pass' | 'fail' | 'partial';

export type BodySide = 'left' | 'right' | 'both';

export interface DurabilityAssessment {
    id: string;
    name: string;
    category: 'foot' | 'ankle' | 'knee' | 'hip' | 'spine' | 'balance';
    description: string;
    testProcedure: string;
    passStandard: string;
    failImplications: string[];
    prescribedModules: string[];  // Module IDs to assign if failed
    bilateral: boolean;
}

/**
 * Dicharry's 12 key durability assessments
 */
export const DURABILITY_ASSESSMENTS: Record<string, DurabilityAssessment> = {
    toe_yoga: {
        id: 'toe_yoga',
        name: 'Toe Yoga',
        category: 'foot',
        description: 'Ability to isolate big toe from lesser toes',
        testProcedure: 'Stand with feet flat. Lift big toe while keeping lesser toes down, then reverse.',
        passStandard: 'Can perform 10 reps each direction with isolation',
        failImplications: ['Poor foot intrinsic activation', 'Reduced push-off power'],
        prescribedModules: ['foot_intrinsics', 'toe_isolation'],
        bilateral: true,
    },

    ankle_df: {
        id: 'ankle_df',
        name: 'Ankle Dorsiflexion',
        category: 'ankle',
        description: 'Ankle range of motion in dorsiflexion',
        testProcedure: 'Half-kneeling, knee over toes. Measure distance from wall.',
        passStandard: '4+ inches from wall with heel down',
        failImplications: ['Compensatory hip drop', 'Achilles strain risk', 'Knee valgus'],
        prescribedModules: ['ankle_mobility', 'calf_eccentric'],
        bilateral: true,
    },

    single_leg_balance: {
        id: 'single_leg_balance',
        name: 'Single Leg Balance',
        category: 'balance',
        description: 'Static balance on one leg with eyes closed',
        testProcedure: 'Stand on one leg, close eyes, time until loss of balance',
        passStandard: '45+ seconds eyes closed',
        failImplications: ['Poor proprioception', 'Ankle instability risk'],
        prescribedModules: ['balance_progression', 'ankle_stability'],
        bilateral: true,
    },

    single_leg_stance_hip: {
        id: 'single_leg_stance_hip',
        name: 'Single Leg Stance (Hip Control)',
        category: 'hip',
        description: 'Hip stability during single leg stance',
        testProcedure: 'Stand on one leg, watch for pelvis drop or trunk lean',
        passStandard: 'Level pelvis, no trunk lean for 30 seconds',
        failImplications: ['Hip drop during running', 'IT band syndrome risk', 'Knee pain'],
        prescribedModules: ['hip_stability', 'glute_med_activation'],
        bilateral: true,
    },

    squat_shape: {
        id: 'squat_shape',
        name: 'Squat Shape Assessment',
        category: 'hip',
        description: 'Quality of bodyweight squat pattern',
        testProcedure: 'Perform 5 bodyweight squats, observe depth, knee tracking, trunk position',
        passStandard: 'Thighs parallel, neutral spine, knees track over toes',
        failImplications: ['Poor hip mobility', 'Quad dominance', 'Low back compensation'],
        prescribedModules: ['squat_mobility', 'hip_hinge_pattern'],
        bilateral: false,
    },

    hip_extension: {
        id: 'hip_extension',
        name: 'Hip Extension (Thomas Test)',
        category: 'hip',
        description: 'Hip flexor length and hip extension ROM',
        testProcedure: 'Lie supine at table edge, pull one knee to chest, let other leg hang',
        passStandard: 'Hanging thigh reaches horizontal, knee bends to 90°',
        failImplications: ['Hip flexor tightness', 'Reduced stride length', 'Low back pain'],
        prescribedModules: ['hip_flexor_mobility', 'hip_ext_activation'],
        bilateral: true,
    },

    hip_rotation: {
        id: 'hip_rotation',
        name: 'Hip Rotation',
        category: 'hip',
        description: 'Internal and external hip rotation ROM',
        testProcedure: 'Seated with 90° hip/knee flexion, measure IR and ER',
        passStandard: '40°+ internal rotation, 45°+ external rotation',
        failImplications: ['Hip impingement risk', 'Compensatory motion'],
        prescribedModules: ['hip_rotation_mobility', '90_90_stretch'],
        bilateral: true,
    },

    glute_bridge: {
        id: 'glute_bridge',
        name: 'Single Leg Glute Bridge',
        category: 'hip',
        description: 'Hip extensor strength and control',
        testProcedure: 'Single leg bridge, hold at top for time',
        passStandard: '30+ seconds with level pelvis',
        failImplications: ['Hamstring dominance', 'Poor hip extension power'],
        prescribedModules: ['glute_activation', 'bridge_progression'],
        bilateral: true,
    },

    dead_bug: {
        id: 'dead_bug',
        name: 'Dead Bug (Core Stability)',
        category: 'spine',
        description: 'Core stability during limb movement',
        testProcedure: 'Dead bug position, alternate arm/leg extension without back arching',
        passStandard: '10 reps each side with neutral spine',
        failImplications: ['Poor core stability', 'Energy leakage', 'Low back pain'],
        prescribedModules: ['dead_bug_progression', 'core_stability'],
        bilateral: false,
    },

    thoracic_rotation: {
        id: 'thoracic_rotation',
        name: 'Thoracic Rotation',
        category: 'spine',
        description: 'Thoracic spine rotation ROM',
        testProcedure: 'Seated with arms crossed, rotate trunk, measure ROM',
        passStandard: '45°+ rotation each direction',
        failImplications: ['Reduced arm swing efficiency', 'Compensatory lumbar rotation'],
        prescribedModules: ['thoracic_mobility', 'rotation_pattern'],
        bilateral: true,
    },

    calf_endurance: {
        id: 'calf_endurance',
        name: 'Calf Raise Endurance',
        category: 'ankle',
        description: 'Single leg calf raise endurance',
        testProcedure: 'Single leg calf raises at controlled tempo to failure',
        passStandard: '25+ reps with full ROM',
        failImplications: ['Achilles injury risk', 'Reduced push-off power'],
        prescribedModules: ['calf_strength', 'eccentric_calf'],
        bilateral: true,
    },

    hip_abduction_strength: {
        id: 'hip_abduction_strength',
        name: 'Hip Abduction Strength',
        category: 'hip',
        description: 'Side-lying hip abduction strength and endurance',
        testProcedure: 'Side-lying leg lifts with resistance band, count to fatigue',
        passStandard: '30+ reps with controlled movement',
        failImplications: ['Pelvic drop', 'IT band syndrome', 'Knee valgus'],
        prescribedModules: ['hip_abduction', 'clam_progression'],
        bilateral: true,
    },
};

/**
 * Get all assessments
 */
export function getAllAssessments(): DurabilityAssessment[] {
    return Object.values(DURABILITY_ASSESSMENTS);
}

/**
 * Get assessments by category
 */
export function getAssessmentsByCategory(category: DurabilityAssessment['category']): DurabilityAssessment[] {
    return Object.values(DURABILITY_ASSESSMENTS).filter(a => a.category === category);
}

/**
 * Get prescribed modules for failed assessments
 */
export function getModulesForFailedAssessments(failedAssessmentIds: string[]): string[] {
    const modules = new Set<string>();

    for (const id of failedAssessmentIds) {
        const assessment = DURABILITY_ASSESSMENTS[id];
        if (assessment) {
            assessment.prescribedModules.forEach(m => modules.add(m));
        }
    }

    return Array.from(modules);
}
