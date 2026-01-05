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
            instructions: [
                '1. Stand barefoot with feet flat on the floor',
                '2. Press your four small toes into the ground while lifting ONLY your big toe',
                '3. Hold for 2 seconds, then lower your big toe',
                '4. Now press your big toe down while lifting your four small toes',
                '5. Repeat 5 times each direction',
                '6. If you cannot isolate the movements, that indicates foot control is limiting'
            ],
            source: 'Dicharry - Running Rewired',
            videoUrl: 'https://www.youtube.com/watch?v=QwJJL3k9Z3c', // MOBO Board: Toe Yoga
        },
        {
            name: 'Single-Leg Balance Check',
            dosage: '10-20s each side',
            cues: ['Eyes open', 'Hands on shoulders', 'Note any wobble'],
            instructions: [
                '1. Stand on one leg, barefoot',
                '2. Cross your hands to opposite shoulders (arms forming an X)',
                '3. Look straight ahead (eyes open)',
                '4. Hold steady for 20 seconds',
                '5. Note: excessive wobble indicates balance/stability limitation',
                '6. Repeat on other leg'
            ],
            source: 'Dicharry - Running Rewired',
            videoUrl: 'https://www.youtube.com/watch?v=8xsHMKqoWsk', // Running balance drill
        },
        {
            name: '5 Squats',
            dosage: '20-30s',
            cues: ['Heels down', 'Knees track over toes', 'Note any pinch or pain'],
            instructions: [
                '1. Stand with feet shoulder-width apart',
                '2. Squat down as deep as comfortable, keeping heels on the ground',
                '3. Watch that knees track over your second toe (not collapsing inward)',
                '4. Rise back up with control',
                '5. Repeat 5 times, noting any pain, pinching, or loss of balance'
            ],
            source: 'Starrett - Ready to Run',
            videoUrl: 'https://www.youtube.com/watch?v=Dy28eq2PjcM', // The Ready State: Squat Test
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
                instructions: [
                    '1. Kneel facing away from a wall (or couch)',
                    '2. Place your left knee at the base of the wall, shin going up the wall behind you',
                    '3. Step your right foot forward into a lunge position',
                    '4. Squeeze your LEFT glute hard — this is key',
                    '5. Keep your torso tall and ribs down (not arched)',
                    '6. You should feel a deep stretch in your left hip flexor/quad',
                    '7. Hold for 2 minutes, breathing deeply'
                ],
                source: 'Starrett - Ready to Run',
                videoUrl: 'https://www.youtube.com/watch?v=JawPBvtf7Qs', // The Ready State: Couch Stretch
            },
            {
                name: 'Couch Stretch Right',
                dosage: '2:00 hold',
                cues: ['Same cues', 'Stop if sharp pain or numbness'],
                instructions: [
                    '1. Switch sides: right knee at wall, left foot forward',
                    '2. Squeeze your RIGHT glute',
                    '3. Keep torso tall, ribs down',
                    '4. Hold for 2 minutes',
                    '5. Stop if you feel sharp pain or numbness'
                ],
                source: 'Starrett - Ready to Run',
                videoUrl: 'https://www.youtube.com/watch?v=JawPBvtf7Qs', // Same video
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
                instructions: [
                    '1. Stand facing a wall, left foot about 4-5 inches from the wall',
                    '2. Keep your left heel flat on the ground',
                    '3. Bend your left knee forward, trying to touch it to the wall',
                    '4. Make sure your knee tracks over your second toe (not inward)',
                    '5. Rock slowly in and out, feeling the stretch in your calf',
                    '6. If you can easily touch the wall, move your foot further back'
                ],
                source: 'Starrett - Ready to Run',
                videoUrl: 'https://www.youtube.com/watch?v=IikP_teeLkI', // Ankle dorsiflexion mobility
            },
            {
                name: 'Knee-to-Wall Dorsiflexion Right',
                dosage: '2-3 sets x 10 reps',
                cues: ['Same cues', 'Stop if sharp anterior ankle pinch'],
                instructions: [
                    '1. Switch to right foot forward',
                    '2. Keep heel down, knee tracks over 2nd toe',
                    '3. Rock forward until knee touches wall',
                    '4. Work on matching the range of your left side'
                ],
                source: 'Starrett - Ready to Run',
                videoUrl: 'https://www.youtube.com/watch?v=IikP_teeLkI',
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
                instructions: [
                    '1. Kneel on your left knee, right foot forward',
                    '2. Tuck your pelvis under (posterior pelvic tilt)',
                    '3. Keep your torso upright and tall',
                    '4. Do NOT arch your low back',
                    '5. Lean forward slightly from the hips',
                    '6. Feel the stretch in the front of your left hip/thigh',
                    '7. Hold for 3 full minutes, breathing deeply'
                ],
                source: 'Dicharry - Running Rewired',
                videoUrl: 'https://www.youtube.com/watch?v=JawPBvtf7Qs', // Hip flexor stretch
            },
            {
                name: 'Kneeling Hip Flexor Stretch Right',
                dosage: '3:00 hold',
                cues: ['Same cues', 'Stop if you get front-hip pinch'],
                instructions: [
                    '1. Switch: right knee down, left foot forward',
                    '2. Same pelvic tilt and posture cues',
                    '3. Hold for 3 minutes'
                ],
                source: 'Dicharry - Running Rewired',
                videoUrl: 'https://www.youtube.com/watch?v=JawPBvtf7Qs',
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
                instructions: [
                    '1. Sit on the floor with left calf on a foam roller or lacrosse ball',
                    '2. Cross your right leg over your left to add pressure',
                    '3. Find a tender spot and let your body weight sink in',
                    '4. Slowly rock side-to-side (pressure wave)',
                    '5. Add ankle pumps: point and flex your foot 10 times',
                    '6. Move to a new spot and repeat'
                ],
                source: 'Starrett - Ready to Run',
                videoUrl: 'https://www.youtube.com/watch?v=6-rPEpnJvvU', // Calf smash
            },
            {
                name: 'Calf Smash + Pressure Wave Right',
                dosage: '2:00 total',
                cues: ['Same cues', 'Avoid aggressive numbness or nerve zing'],
                instructions: [
                    '1. Switch to right calf',
                    '2. Same technique: sink, wave, pumps',
                    '3. Stop if you feel numbness or nerve symptoms'
                ],
                source: 'Starrett - Ready to Run',
                videoUrl: 'https://www.youtube.com/watch?v=6-rPEpnJvvU',
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
                instructions: [
                    '1. Stand barefoot, weight even on both feet',
                    '2. Press your four small toes into the floor, lift ONLY your big toe',
                    '3. Hold 2-3 seconds, then lower',
                    '4. Now press big toe down (without curling it), lift smaller toes',
                    '5. Your arch should naturally lift',
                    '6. Continue alternating for 2 minutes',
                    '7. Use a ruler under your toes to assist if needed'
                ],
                source: 'Dicharry - Running Rewired',
                videoUrl: 'https://www.youtube.com/watch?v=QwJJL3k9Z3c', // MOBO Board toe yoga
            },
            {
                name: 'Toe Yoga Right',
                dosage: '2:00 practice',
                cues: ['Use ruler assist if big toe won\'t lift', 'Do not cheat by rolling ankle in'],
                instructions: [
                    '1. Same exercise, focus on right foot',
                    '2. Note any differences between sides',
                    '3. Work the weaker side more'
                ],
                source: 'Dicharry - Running Rewired',
                videoUrl: 'https://www.youtube.com/watch?v=QwJJL3k9Z3c',
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
                dosage: '20 reps each foot',
                cues: ['Big toe grounded', 'Rearfoot twists out then in', 'Controlled, specific motion'],
                instructions: [
                    '1. Stand on one foot, barefoot',
                    '2. Keep your big toe pressed firmly into the ground',
                    '3. Without moving your big toe, twist your rearfoot outward (like unscrewing a jar lid)',
                    '4. Then twist inward (screwing it back in)',
                    '5. This motion activates your foot\'s intrinsic muscles',
                    '6. Do 20 slow, controlled reps per foot'
                ],
                source: 'Dicharry - Running Rewired',
                videoUrl: 'https://www.youtube.com/watch?v=QwJJL3k9Z3c', // MOBO board foot control
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
                instructions: [
                    '1. Start on your right side, right elbow directly under shoulder',
                    '2. Stack your knees (bent 90°) and lift your hips off the ground',
                    '3. Form a straight line from your neck to your knees',
                    '4. Lower your hips slightly, then lift back up (that\'s one pulse)',
                    '5. Complete 20 pulses without twisting your trunk',
                    '6. Switch to left side and repeat'
                ],
                source: 'Dicharry - Running Rewired',
                videoUrl: 'https://www.youtube.com/watch?v=B7B0JOqJ8Ww', // Side plank for runners
            },
            {
                name: 'Dead Bug',
                dosage: '2:00 alternating',
                cues: ['Neutral spine', 'Move slow enough to stay stable'],
                instructions: [
                    '1. Lie on your back, arms straight up toward ceiling',
                    '2. Lift your legs so knees are over hips, bent at 90°',
                    '3. Press your low back into the floor (no gap!)',
                    '4. Slowly extend your RIGHT arm overhead and LEFT leg out',
                    '5. Return to start, then switch sides',
                    '6. Move slowly enough that your low back never arches',
                    '7. Continue alternating for 2 minutes'
                ],
                source: 'Dicharry - Running Rewired',
                videoUrl: 'https://www.youtube.com/watch?v=I5xbsA71v1A', // Dead bug for runners
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
                instructions: [
                    '1. Stand on one leg, holding a light weight in the opposite hand',
                    '2. Set your foot tripod: big toe, pinky toe, and heel all in contact',
                    '3. Keep your ribs down and spine neutral',
                    '4. Press the weight overhead without arching your back',
                    '5. Lower with control',
                    '6. Complete 15 reps, then switch sides',
                    '7. Focus: your standing leg should stay rock solid'
                ],
                source: 'Dicharry - Running Rewired',
                videoUrl: 'https://www.youtube.com/watch?v=8xsHMKqoWsk', // Single leg balance
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
                instructions: [
                    '1. Stand on one leg with a slight knee bend',
                    '2. Keep your standing foot tripod engaged (big toe, pinky toe, heel)',
                    '3. Reach your arms forward, hands together',
                    '4. Rotate your entire torso to the side of your standing leg',
                    '5. Keep your hips facing forward—the rotation comes from your hip, not your spine',
                    '6. Return to center and repeat',
                    '7. Focus: your standing leg should not wobble'
                ],
                source: 'Dicharry - Running Rewired',
                videoUrl: 'https://www.youtube.com/watch?v=8xsHMKqoWsk', // Balance and control
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
                instructions: [
                    '1. Lie on your back, knees bent, feet flat on floor hip-width apart',
                    '2. Lift your hips into a bridge position',
                    '3. Extend one leg straight out, keeping thighs parallel',
                    '4. Hold for 10 seconds—focus on your GLUTE doing the work, not hamstring',
                    '5. Keep your hips level (don\'t let them dip on the extended side)',
                    '6. Lower and switch legs',
                    '7. Complete 3 rounds per side'
                ],
                source: 'Dicharry - Running Rewired',
                videoUrl: 'https://www.youtube.com/watch?v=AVAXhy6pl7o', // Single leg glute bridge
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
                instructions: [
                    '1. Stand on a step with your heel hanging off the edge',
                    '2. Use a wall for balance if needed',
                    '3. Lower your heel below the step level (full stretch)',
                    '4. Rise up onto your toes as high as possible',
                    '5. Take 2-3 seconds on the way up, 2-3 seconds on the way down',
                    '6. Stop 2 reps before failure to avoid excessive soreness',
                    '7. Goal: work up to 25+ continuous reps per leg'
                ],
                source: 'Dicharry - Running Rewired',
                videoUrl: 'https://www.youtube.com/watch?v=GcDX2R6BhWc', // Single leg calf raise
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

