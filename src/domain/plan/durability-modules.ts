/**
 * THE LONG GAME - Durability Modules
 * 
 * Quick-check and corrective modules from research: 04-starrett-dicharry-durability.md
 * Based on Jay Dicharry's Running Rewired and Kelly Starrett's Ready to Run.
 * 
 * Structure:
 * - Daily readiness scan (1-2 min)
 * - Mobility modules (3-5 min) - only for failed tests
 * - Control modules (3-5 min) - always beneficial
 * - Capacity modules (2-4 min) - for building capacity
 */

import { DurabilityModule } from './types';

// =============================================================================
// DAILY READINESS SCAN (1-2 min)
// =============================================================================

export const READINESS_SCAN: DurabilityModule = {
    id: 'readiness-scan',
    name: 'Daily Readiness Scan',
    category: 'control',
    durationMinutes: 2,
    frequency: 'daily',
    exercises: [
        {
            name: 'Toe Yoga Check',
            dosage: '30-45s',
            cues: ['Big toe up, others down', 'Reverse: big toe down, others up', 'Arch stays lifted'],
        },
        {
            name: 'Single-Leg Balance Check',
            dosage: '10-20s each side',
            cues: ['Eyes open', 'Hands on shoulders', 'Note any wobble'],
        },
        {
            name: '5 Squats',
            dosage: '20-30s',
            cues: ['Heels down', 'Knees track over toes', 'Note any pinch or pain'],
        },
    ],
};

// =============================================================================
// MOBILITY MODULES (3-5 min each) - only when test indicates need
// =============================================================================

export const MOBILITY_MODULES: Record<string, DurabilityModule> = {
    couch_stretch: {
        id: 'couch-stretch',
        name: 'Couch Stretch (Hip Flexor)',
        category: 'mobility',
        durationMinutes: 4,
        frequency: 'daily when hip extension is limited',
        basedOnAssessment: 'hip_extension',
        exercises: [
            {
                name: 'Couch Stretch Left',
                dosage: '2:00 hold',
                cues: ['Glute squeeze on rear leg', 'Ribs down', 'Tall torso', 'Do not over-arch low back'],
            },
            {
                name: 'Couch Stretch Right',
                dosage: '2:00 hold',
                cues: ['Same cues', 'Stop if sharp pain or numbness'],
            },
        ],
    },
    ankle_df: {
        id: 'ankle-df',
        name: 'Ankle Dorsiflexion Work',
        category: 'mobility',
        durationMinutes: 4,
        frequency: 'daily until dorsiflexion is sufficient',
        basedOnAssessment: 'ankle_df',
        exercises: [
            {
                name: 'Knee-to-Wall Dorsiflexion Left',
                dosage: '2-3 sets x 10 reps',
                cues: ['Heel down', 'Knee over 2nd toe', 'Move slowly'],
            },
            {
                name: 'Knee-to-Wall Dorsiflexion Right',
                dosage: '2-3 sets x 10 reps',
                cues: ['Same cues', 'Stop if sharp anterior ankle pinch'],
            },
        ],
    },
    hip_flexor_3min: {
        id: 'hip-flexor-3min',
        name: 'Hip Flexor Mobility',
        category: 'mobility',
        durationMinutes: 6,
        frequency: 'only when doorway test produces huge pull',
        basedOnAssessment: 'hip_extension',
        exercises: [
            {
                name: 'Kneeling Hip Flexor Stretch Left',
                dosage: '3:00 hold',
                cues: ['Posterior pelvic tilt', 'Thigh vertical', 'No low-back arch'],
            },
            {
                name: 'Kneeling Hip Flexor Stretch Right',
                dosage: '3:00 hold',
                cues: ['Same cues', 'Stop if you get front-hip pinch'],
            },
        ],
    },
    calf_tissue: {
        id: 'calf-tissue',
        name: 'Calf Tissue Work',
        category: 'tissue',
        durationMinutes: 4,
        frequency: 'as-needed for calf stiffness, often post-run',
        exercises: [
            {
                name: 'Calf Smash + Pressure Wave Left',
                dosage: '2:00 total',
                cues: ['Sink and breathe', 'Slow side-to-side wave', 'Add ankle pumps'],
            },
            {
                name: 'Calf Smash + Pressure Wave Right',
                dosage: '2:00 total',
                cues: ['Same cues', 'Avoid aggressive numbness or nerve zing'],
            },
        ],
    },
};

// =============================================================================
// CONTROL MODULES (3-5 min each) - always beneficial
// =============================================================================

export const CONTROL_MODULES: Record<string, DurabilityModule> = {
    toe_yoga: {
        id: 'toe-yoga',
        name: 'Toe Yoga Practice',
        category: 'control',
        durationMinutes: 4,
        frequency: 'daily if foot control is a limiter',
        basedOnAssessment: 'toe_yoga',
        exercises: [
            {
                name: 'Toe Yoga Left',
                dosage: '2:00 practice',
                cues: ['Big toe up, others down', 'Big toe down without curling, others up', 'Arch stays lifted'],
            },
            {
                name: 'Toe Yoga Right',
                dosage: '2:00 practice',
                cues: ['Use ruler assist if big toe won\'t lift', 'Do not cheat by rolling ankle in'],
            },
        ],
    },
    foot_screws: {
        id: 'foot-screws',
        name: 'Foot Screws',
        category: 'control',
        durationMinutes: 3,
        frequency: '2-4x/week',
        exercises: [
            {
                name: 'Foot Screws',
                dosage: '20 reps',
                cues: ['Big toe grounded', 'Rearfoot twists out then in', 'Controlled, specific motion'],
            },
        ],
    },
    deep_core_mini: {
        id: 'deep-core-mini',
        name: 'Deep Core Mini',
        category: 'control',
        durationMinutes: 6,
        frequency: '2-4x/week, or when trunk feels unstable',
        exercises: [
            {
                name: 'Kneeling Side Plank Pulses',
                dosage: '20 reps each side',
                cues: ['Elbow under shoulder', 'Long line neck-to-knee', 'No trunk twist'],
            },
            {
                name: 'Roller Dogs / Dead Bug',
                dosage: '2:00 alternating',
                cues: ['Neutral spine', 'Move slow enough to stay stable'],
            },
        ],
    },
    single_leg_integration: {
        id: 'single-leg-integration',
        name: 'Single Leg Integration',
        category: 'integration',
        durationMinutes: 5,
        frequency: '2-3x/week for foot-to-core integration',
        exercises: [
            {
                name: 'Single-Leg Shoulder Press',
                dosage: '15 reps each side',
                cues: ['Set tripod through forefoot', 'Big toe down', 'Ribs down, neutral spine', 'Do not lean back'],
            },
        ],
    },
    tippy_twist: {
        id: 'tippy-twist',
        name: 'Tippy Twist',
        category: 'integration',
        durationMinutes: 5,
        frequency: '2-3x/week',
        exercises: [
            {
                name: 'Tippy Twist',
                dosage: '2 sets x 10 reps each foot',
                cues: ['Tripod strong', 'Hips level', 'Neutral spine', 'Twist from hip, not spine'],
            },
        ],
    },
};

// =============================================================================
// CAPACITY MODULES (2-4 min each) - for building capacity
// =============================================================================

export const CAPACITY_MODULES: Record<string, DurabilityModule> = {
    bridge_control: {
        id: 'bridge-control',
        name: 'Bridge Control',
        category: 'capacity',
        durationMinutes: 5,
        frequency: 'every other day until the test is clean',
        basedOnAssessment: 'glute_bridge',
        exercises: [
            {
                name: 'Single-Leg Bridge Holds',
                dosage: '3 rounds x 10s each side',
                cues: ['Hips level', 'Glute does the work', 'No hamstring cramp', 'Ribs down'],
            },
        ],
    },
    calf_raise_capacity: {
        id: 'calf-capacity',
        name: 'Calf Raise Capacity',
        category: 'capacity',
        durationMinutes: 6,
        frequency: '2-3x/week consistently',
        basedOnAssessment: 'calf_endurance',
        exercises: [
            {
                name: 'Single-Leg Calf Raises',
                dosage: '3 sets each side, stop 2 reps before failure',
                cues: ['Full range', 'Control down', 'No ankle wobble'],
            },
        ],
    },
};

/**
 * Get modules prescribed for failed assessments.
 * From research routing rules (04-starrett-dicharry-durability.md):
 * - Pain overrides everything
 * - Foundation first: foot and ankle control/mobility
 * - Then: hip extension without lumbar compensation
 * - Then: trunk control (deep core, anti-rotation)
 * - Finally: capacity targets
 */
export function getModulesForAssessmentResults(
    failedAssessments: string[]
): DurabilityModule[] {
    const modules: DurabilityModule[] = [];

    // Check each assessment and add relevant modules
    for (const assessmentId of failedAssessments) {
        // Mobility modules
        if (assessmentId === 'ankle_df') {
            modules.push(MOBILITY_MODULES.ankle_df);
        }
        if (assessmentId === 'hip_extension') {
            modules.push(MOBILITY_MODULES.hip_flexor_3min);
            modules.push(MOBILITY_MODULES.couch_stretch);
        }

        // Control modules
        if (assessmentId === 'toe_yoga') {
            modules.push(CONTROL_MODULES.toe_yoga);
            modules.push(CONTROL_MODULES.foot_screws);
        }
        if (assessmentId === 'dead_bug') {
            modules.push(CONTROL_MODULES.deep_core_mini);
        }
        if (assessmentId === 'single_leg_balance' || assessmentId === 'single_leg_stance_hip') {
            modules.push(CONTROL_MODULES.tippy_twist);
            modules.push(CONTROL_MODULES.single_leg_integration);
        }

        // Capacity modules
        if (assessmentId === 'glute_bridge') {
            modules.push(CAPACITY_MODULES.bridge_control);
        }
        if (assessmentId === 'calf_endurance') {
            modules.push(CAPACITY_MODULES.calf_raise_capacity);
        }
    }

    // Remove duplicates
    const uniqueModules = modules.filter((module, index, self) =>
        index === self.findIndex((m) => m.id === module.id)
    );

    return uniqueModules;
}

// =============================================================================
// DAILY ROUTINE (from research: 04-starrett-dicharry-durability.md)
// The research is explicit: 8-12 minutes daily, structured as:
// 1. Readiness scan (1-2 min)
// 2. 1 mobility module (3-5 min) - only if test indicates need
// 3. 1 control module (3-5 min) - always beneficial
// 4. Optional capacity micro-dose (2-4 min)
// =============================================================================

export interface DailyDurabilityRoutine {
    id: string;
    name: string;
    totalMinutes: number;
    dayType: 'quality' | 'easy' | 'rest' | 'long';
    modules: DurabilityModule[];
}

/**
 * Build the complete daily durability routine.
 * THIS is what the research prescribes - not a single module.
 * 
 * From 04-starrett-dicharry-durability.md Section 4:
 * "Daily micro-dose template (8 to 12 minutes)"
 */
export function getDailyDurabilityRoutine(
    dayType: 'quality' | 'easy' | 'rest' | 'long',
    failedAssessments: string[] = []
): DailyDurabilityRoutine {
    const modules: DurabilityModule[] = [];

    // Step 1: ALWAYS start with readiness scan (research: 1-2 min)
    // "Dicharry-style daily readiness quick checks"
    modules.push(READINESS_SCAN);

    // Step 2: Add mobility module IF an assessment indicates need
    // Research: "Only for the joint/position that fails today"
    // "Dicharry also uses 'only stretch if test says you need it' logic"
    if (failedAssessments.length > 0) {
        const mobilityNeeds = failedAssessments.filter(a =>
            a === 'ankle_df' || a === 'hip_extension'
        );
        if (mobilityNeeds.length > 0) {
            // Prioritize distal to proximal (ankle before hip) per research
            if (mobilityNeeds.includes('ankle_df')) {
                modules.push(MOBILITY_MODULES.ankle_df);
            } else if (mobilityNeeds.includes('hip_extension')) {
                modules.push(MOBILITY_MODULES.couch_stretch);
            }
        }
    }

    // Step 3: Add control module (research: "3-5 min, always beneficial")
    // Foot tripod or deep core or hip control
    if (failedAssessments.includes('toe_yoga')) {
        modules.push(CONTROL_MODULES.toe_yoga);
    } else if (failedAssessments.includes('single_leg_balance')) {
        modules.push(CONTROL_MODULES.tippy_twist);
    } else {
        // Default: deep core is always valuable
        modules.push(CONTROL_MODULES.deep_core_mini);
    }

    // Step 4: Optional capacity micro-dose on easy/rest days
    // Research: "2-4 min, calf raises or bridges depending on what is lagging"
    if (dayType === 'easy' || dayType === 'rest') {
        if (failedAssessments.includes('calf_endurance')) {
            modules.push(CAPACITY_MODULES.calf_raise_capacity);
        } else if (failedAssessments.includes('glute_bridge')) {
            modules.push(CAPACITY_MODULES.bridge_control);
        }
        // If no specific need, skip capacity to keep routine short
    }

    // Calculate total time
    const totalMinutes = modules.reduce((sum, m) => sum + m.durationMinutes, 0);

    // Name the routine based on day type
    let routineName: string;
    switch (dayType) {
        case 'quality':
            routineName = 'Pre-Quality Quick Check';
            break;
        case 'long':
            routineName = 'Pre-Long Run Readiness';
            break;
        case 'easy':
            routineName = 'Easy Day Durability';
            break;
        case 'rest':
            routineName = 'Rest Day Maintenance';
            break;
    }

    return {
        id: `routine-${dayType}-${Date.now()}`,
        name: routineName,
        totalMinutes,
        dayType,
        modules,
    };
}

/**
 * Simplified module getter for generator compatibility.
 * Returns the FIRST module of the daily routine for display purposes.
 * The full routine is accessible via getDailyDurabilityRoutine.
 */
export function getDailyDurabilityModule(
    dayType: 'quality' | 'easy' | 'rest' | 'long',
    failedAssessments: string[] = []
): DurabilityModule | null {
    const routine = getDailyDurabilityRoutine(dayType, failedAssessments);
    return routine.modules[0] || null;
}

/**
 * Export all modules for display in UI.
 */
export function getAllModules(): DurabilityModule[] {
    return [
        READINESS_SCAN,
        ...Object.values(MOBILITY_MODULES),
        ...Object.values(CONTROL_MODULES),
        ...Object.values(CAPACITY_MODULES),
    ];
}

