/**
 * THE LONG GAME - Movement Interference Matrix
 * 
 * Tracks DOMS timelines, leg fatigue scores, and scheduling rules
 * to prevent WOD/strength work from interfering with running quality.
 * 
 * Key insight: Not all movements are equal. Concentric-dominant (sled, erg)
 * have minimal DOMS. Eccentric-intensive (lunges, box jumps) can wreck legs
 * for 4-5 days.
 * 
 * Source: Oracle Research (17-wod-engine-master.md)
 */

// =============================================================================
// MOVEMENT CLASSIFICATION
// =============================================================================

export type MovementCategory = 'green' | 'yellow' | 'red';

export interface MovementProfile {
    name: string;
    category: MovementCategory;
    legFatigue: number; // 1-10 scale
    domsPeakHours?: [number, number]; // Min/max hours to DOMS peak
    qualityRunNormalHours?: [number, number]; // Hours until quality run is safe
    eccentricLoad: 'none' | 'low' | 'moderate' | 'high';
    impactLevel: 'none' | 'low' | 'moderate' | 'high';
    cnsLoad: 'low' | 'moderate' | 'high';
}

// =============================================================================
// GREEN MOVEMENTS (Leg fatigue 1-3)
// Best ROI during high mileage phases
// =============================================================================

export const GREEN_MOVEMENTS: Record<string, MovementProfile> = {
    bike_erg: {
        name: 'Bike Erg',
        category: 'green',
        legFatigue: 1,
        domsPeakHours: [8, 24],
        qualityRunNormalHours: [6, 12],
        eccentricLoad: 'none',
        impactLevel: 'none',
        cnsLoad: 'low',
    },
    ski_erg: {
        name: 'Ski Erg',
        category: 'green',
        legFatigue: 1,
        domsPeakHours: [8, 24],
        qualityRunNormalHours: [6, 12],
        eccentricLoad: 'none',
        impactLevel: 'none',
        cnsLoad: 'low',
    },
    assault_bike: {
        name: 'Assault Bike',
        category: 'green',
        legFatigue: 2,
        domsPeakHours: [8, 24],
        qualityRunNormalHours: [8, 16],
        eccentricLoad: 'none',
        impactLevel: 'low',
        cnsLoad: 'low',
    },
    row_erg: {
        name: 'Row Erg',
        category: 'green',
        legFatigue: 2,
        domsPeakHours: [12, 24],
        qualityRunNormalHours: [12, 24],
        eccentricLoad: 'low',
        impactLevel: 'none',
        cnsLoad: 'low',
    },
    sled_push: {
        name: 'Sled Push',
        category: 'green',
        legFatigue: 2,
        domsPeakHours: [12, 24],
        qualityRunNormalHours: [12, 24],
        eccentricLoad: 'none',
        impactLevel: 'none',
        cnsLoad: 'low',
    },
    sled_pull: {
        name: 'Sled Pull',
        category: 'green',
        legFatigue: 2,
        domsPeakHours: [12, 24],
        qualityRunNormalHours: [12, 24],
        eccentricLoad: 'none',
        impactLevel: 'none',
        cnsLoad: 'low',
    },
    farmer_carry: {
        name: 'Farmer Carry',
        category: 'green',
        legFatigue: 2,
        domsPeakHours: [12, 24],
        qualityRunNormalHours: [12, 24],
        eccentricLoad: 'low',
        impactLevel: 'low',
        cnsLoad: 'moderate',
    },
    sandbag_carry: {
        name: 'Sandbag Carry',
        category: 'green',
        legFatigue: 3,
        domsPeakHours: [12, 24],
        qualityRunNormalHours: [12, 24],
        eccentricLoad: 'low',
        impactLevel: 'low',
        cnsLoad: 'moderate',
    },
};

// =============================================================================
// YELLOW MOVEMENTS (Leg fatigue 4-7)
// Dose matters - can be used carefully
// =============================================================================

export const YELLOW_MOVEMENTS: Record<string, MovementProfile> = {
    hip_thrust: {
        name: 'Hip Thrust',
        category: 'yellow',
        legFatigue: 4,
        eccentricLoad: 'low',
        impactLevel: 'none',
        cnsLoad: 'low',
    },
    hang_power_clean: {
        name: 'Hang Power Clean',
        category: 'yellow',
        legFatigue: 4,
        eccentricLoad: 'low',
        impactLevel: 'low',
        cnsLoad: 'high',
    },
    goblet_squat: {
        name: 'Goblet Squat',
        category: 'yellow',
        legFatigue: 5,
        eccentricLoad: 'moderate',
        impactLevel: 'none',
        cnsLoad: 'low',
    },
    kettlebell_swing: {
        name: 'Kettlebell Swing',
        category: 'yellow',
        legFatigue: 5,
        eccentricLoad: 'low',
        impactLevel: 'low',
        cnsLoad: 'moderate',
    },
    power_clean: {
        name: 'Power Clean',
        category: 'yellow',
        legFatigue: 5,
        eccentricLoad: 'low',
        impactLevel: 'low',
        cnsLoad: 'high',
    },
    front_squat: {
        name: 'Front Squat',
        category: 'yellow',
        legFatigue: 5,
        eccentricLoad: 'moderate',
        impactLevel: 'none',
        cnsLoad: 'moderate',
    },
    deadlift: {
        name: 'Deadlift',
        category: 'yellow',
        legFatigue: 5,
        eccentricLoad: 'low',
        impactLevel: 'none',
        cnsLoad: 'high',
    },
    back_squat: {
        name: 'Back Squat',
        category: 'yellow',
        legFatigue: 6,
        domsPeakHours: [24, 48],
        qualityRunNormalHours: [24, 48],
        eccentricLoad: 'moderate',
        impactLevel: 'none',
        cnsLoad: 'high',
    },
    calf_raise_heavy: {
        name: 'Heavy Calf Raise',
        category: 'yellow',
        legFatigue: 6,
        qualityRunNormalHours: [48, 72],
        eccentricLoad: 'high',
        impactLevel: 'none',
        cnsLoad: 'low',
    },
    box_jump_low_rep: {
        name: 'Box Jump (Low Rep)',
        category: 'yellow',
        legFatigue: 7,
        qualityRunNormalHours: [48, 72],
        eccentricLoad: 'moderate',
        impactLevel: 'high',
        cnsLoad: 'moderate',
    },
    double_unders: {
        name: 'Double Unders',
        category: 'yellow',
        legFatigue: 7,
        qualityRunNormalHours: [48, 72],
        eccentricLoad: 'moderate',
        impactLevel: 'high',
        cnsLoad: 'low',
    },
};

// =============================================================================
// RED MOVEMENTS (Leg fatigue 8-10)
// Avoid during BUILD/PEAK phases
// =============================================================================

export const RED_MOVEMENTS: Record<string, MovementProfile> = {
    burpee_high_rep: {
        name: 'Burpee (High Rep)',
        category: 'red',
        legFatigue: 8,
        qualityRunNormalHours: [48, 96],
        eccentricLoad: 'moderate',
        impactLevel: 'high',
        cnsLoad: 'high',
    },
    single_leg_rdl: {
        name: 'Single Leg RDL',
        category: 'red',
        legFatigue: 8,
        qualityRunNormalHours: [72, 120],
        eccentricLoad: 'high',
        impactLevel: 'none',
        cnsLoad: 'moderate',
    },
    romanian_deadlift: {
        name: 'Romanian Deadlift',
        category: 'red',
        legFatigue: 8,
        qualityRunNormalHours: [60, 96],
        eccentricLoad: 'high',
        impactLevel: 'none',
        cnsLoad: 'moderate',
    },
    bulgarian_split_squat: {
        name: 'Bulgarian Split Squat',
        category: 'red',
        legFatigue: 8,
        qualityRunNormalHours: [96, 144],
        eccentricLoad: 'high',
        impactLevel: 'none',
        cnsLoad: 'moderate',
    },
    reverse_lunge: {
        name: 'Reverse Lunge',
        category: 'red',
        legFatigue: 8,
        qualityRunNormalHours: [72, 120],
        eccentricLoad: 'high',
        impactLevel: 'low',
        cnsLoad: 'low',
    },
    pistol_squat: {
        name: 'Pistol Squat',
        category: 'red',
        legFatigue: 8,
        qualityRunNormalHours: [72, 120],
        eccentricLoad: 'high',
        impactLevel: 'low',
        cnsLoad: 'high',
    },
    box_jump_high_rep: {
        name: 'Box Jump (High Rep)',
        category: 'red',
        legFatigue: 9,
        qualityRunNormalHours: [72, 120],
        eccentricLoad: 'high',
        impactLevel: 'high',
        cnsLoad: 'moderate',
    },
    nordic_curl: {
        name: 'Nordic Curl',
        category: 'red',
        legFatigue: 9,
        qualityRunNormalHours: [96, 144],
        eccentricLoad: 'high',
        impactLevel: 'none',
        cnsLoad: 'low',
    },
    walking_lunge: {
        name: 'Walking Lunge',
        category: 'red',
        legFatigue: 9,
        qualityRunNormalHours: [96, 144],
        eccentricLoad: 'high',
        impactLevel: 'low',
        cnsLoad: 'low',
    },
    wall_ball: {
        name: 'Wall Ball',
        category: 'red',
        legFatigue: 9,
        qualityRunNormalHours: [72, 120],
        eccentricLoad: 'high',
        impactLevel: 'moderate',
        cnsLoad: 'moderate',
    },
    thruster: {
        name: 'Thruster',
        category: 'red',
        legFatigue: 9,
        qualityRunNormalHours: [72, 120],
        eccentricLoad: 'high',
        impactLevel: 'low',
        cnsLoad: 'high',
    },
    jump_lunge: {
        name: 'Jump Lunge',
        category: 'red',
        legFatigue: 10,
        qualityRunNormalHours: [96, 144],
        eccentricLoad: 'high',
        impactLevel: 'high',
        cnsLoad: 'moderate',
    },
    depth_jump: {
        name: 'Depth Jump',
        category: 'red',
        legFatigue: 10,
        qualityRunNormalHours: [96, 144],
        eccentricLoad: 'high',
        impactLevel: 'high',
        cnsLoad: 'high',
    },
};

// =============================================================================
// ALL MOVEMENTS
// =============================================================================

export const ALL_MOVEMENTS: Record<string, MovementProfile> = {
    ...GREEN_MOVEMENTS,
    ...YELLOW_MOVEMENTS,
    ...RED_MOVEMENTS,
};

// =============================================================================
// SCHEDULING RULES
// =============================================================================

export interface SchedulingResult {
    allowed: boolean;
    reason?: string;
    suggestedAlternative?: string;
}

/**
 * Check if a movement is allowed before a long run.
 */
export function canScheduleBeforeLongRun(
    movementName: string,
    hoursBeforeLongRun: number
): SchedulingResult {
    const movement = ALL_MOVEMENTS[movementName.toLowerCase().replace(/\s+/g, '_')];
    if (!movement) {
        return { allowed: true }; // Unknown movement, allow by default
    }

    // 72-hour rules (RED movements with fatigue >= 9)
    if (movement.legFatigue >= 9 && hoursBeforeLongRun < 72) {
        return {
            allowed: false,
            reason: `${movement.name} has high leg fatigue (${movement.legFatigue}/10). Needs 72+ hours before long run.`,
            suggestedAlternative: 'bike_erg',
        };
    }

    // 48-hour rules (fatigue 7-8)
    if (movement.legFatigue >= 7 && hoursBeforeLongRun < 48) {
        return {
            allowed: false,
            reason: `${movement.name} needs 48+ hours before long run.`,
            suggestedAlternative: 'sled_push',
        };
    }

    // 24-hour rules (fatigue 5-6, heavy compound)
    if (movement.legFatigue >= 5 && hoursBeforeLongRun < 24) {
        return {
            allowed: false,
            reason: `${movement.name} needs 24+ hours before long run.`,
            suggestedAlternative: 'farmer_carry',
        };
    }

    return { allowed: true };
}

/**
 * Check if a movement is allowed before a quality (interval/tempo) session.
 */
export function canScheduleBeforeQualityRun(
    movementName: string,
    hoursBeforeRun: number
): SchedulingResult {
    const movement = ALL_MOVEMENTS[movementName.toLowerCase().replace(/\s+/g, '_')];
    if (!movement) {
        return { allowed: true };
    }

    // 48-hour rules for quality sessions
    if (movement.legFatigue >= 8 && hoursBeforeRun < 48) {
        return {
            allowed: false,
            reason: `${movement.name} has high fatigue. Needs 48+ hours before intervals/tempo.`,
        };
    }

    // 24-hour rules
    if (movement.legFatigue >= 6 && hoursBeforeRun < 24) {
        return {
            allowed: false,
            reason: `${movement.name} needs 24+ hours before quality run.`,
        };
    }

    return { allowed: true };
}

/**
 * Get movements safe for a given phase.
 */
export function getMovementsForPhase(
    phase: 'base' | 'build' | 'peak' | 'taper'
): MovementProfile[] {
    switch (phase) {
        case 'base':
            return [
                ...Object.values(GREEN_MOVEMENTS),
                ...Object.values(YELLOW_MOVEMENTS),
            ];
        case 'build':
            return [
                ...Object.values(GREEN_MOVEMENTS),
                ...Object.values(YELLOW_MOVEMENTS).filter(m => m.legFatigue <= 6),
            ];
        case 'peak':
            return [
                ...Object.values(GREEN_MOVEMENTS),
                ...Object.values(YELLOW_MOVEMENTS).filter(m => m.legFatigue <= 4),
            ];
        case 'taper':
            return Object.values(GREEN_MOVEMENTS);
        default:
            return Object.values(GREEN_MOVEMENTS);
    }
}
