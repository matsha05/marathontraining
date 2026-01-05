/**
 * THE LONG GAME - WOD Library
 * 
 * Runner-friendly WODs from research: 11-crossfit-running-hybrid-programming.md
 * These are designed to BUILD running capacity, not interfere with it.
 * 
 * Three jobs only:
 * 1. Strength maintenance / durability (low soreness, low volume)
 * 2. Aerobic volume (extra engine without extra pounding)
 * 3. Neuromuscular pop (short power, long rest; minimal fatigue)
 */

import { WodWorkout, WodType, TrainingPhase } from './types';

// =============================================================================
// WOD LIBRARY (from research: 11-crossfit-running-hybrid-programming.md)
// =============================================================================

export const WOD_LIBRARY: WodWorkout[] = [
    // -------------------------------------------------------------------------
    // AEROBIC MIXED-MODAL (Zone 2 engine work, 20-45 min)
    // -------------------------------------------------------------------------
    {
        id: 'sled-ski-aerobic',
        name: 'Sled-Ski Aerobic Intervals',
        type: 'WOD_AEROBIC_MIXED_MODAL',
        timeDomain: 24,
        format: '6 rounds for quality',
        movements: [
            { name: 'Sled Push', reps: '20-30m @ heavy but smooth' },
            { name: 'Ski Erg', reps: '250m @ RPE 6' },
            { name: 'Farmer Carry', reps: '40m heavy' },
            { name: 'Rest', reps: '60 sec easy walk' },
        ],
        equipmentNeeded: ['sled', 'ski_erg', 'dumbbells'],
        notes: ['Goal: steady breathing, no leg burn', 'Low impact, low eccentric'],
    },
    {
        id: 'zone2-mixed-modal',
        name: 'Zone 2 Mixed-Modal AMRAP',
        type: 'WOD_AEROBIC_MIXED_MODAL',
        timeDomain: 30,
        format: 'AMRAP 30',
        movements: [
            { name: 'Bike Erg', reps: '12/10 calories @ RPE 5-6' },
            { name: 'Ring Row', reps: '12 reps (strict)' },
            { name: 'Push Up', reps: '12 reps' },
            { name: 'Suitcase Carry', reps: '50m (switch at 25m)' },
        ],
        equipmentNeeded: ['bike_erg', 'rings', 'kettlebell'],
        notes: ['Never sprint. Stay conversational.'],
    },
    {
        id: 'emom30-engine',
        name: 'EMOM 30 Low-Impact Engine',
        type: 'WOD_AEROBIC_MIXED_MODAL',
        timeDomain: 30,
        format: 'EMOM 30 (10 cycles)',
        movements: [
            { name: 'Row', reps: '12/10 calories (min 1)', notes: 'Minute 1' },
            { name: 'KB Swing', reps: '12 reps moderate (min 2)', notes: 'Minute 2' },
            { name: 'Plank', reps: '45 sec (min 3)', notes: 'Minute 3' },
        ],
        equipmentNeeded: ['rower', 'kettlebell'],
        notes: ['This should feel like aerobic work, not a metcon death spiral'],
    },
    {
        id: 'carry-density',
        name: 'Carry Density Builder',
        type: 'WOD_AEROBIC_MIXED_MODAL',
        timeDomain: 25,
        format: 'Every 5:00 for 5 sets',
        movements: [
            { name: 'Farmer Carry', reps: '200m (break as needed)' },
            { name: 'Rest', reps: 'remaining time in 5:00 window' },
        ],
        equipmentNeeded: ['dumbbells', 'kettlebells'],
        notes: ['Go heavy enough that grip is challenged, but posture stays perfect'],
    },
    {
        id: 'upper-metcon-engine',
        name: 'Upper Metcon + Easy Engine',
        type: 'WOD_AEROBIC_MIXED_MODAL',
        timeDomain: 18,
        format: 'AMRAP 18',
        movements: [
            { name: 'Ski Erg', reps: '10/8 calories @ steady' },
            { name: 'Strict Pull Up', reps: '6-10' },
            { name: 'Hand Release Push Up', reps: '10-15' },
            { name: 'Hollow Hold', reps: '20-30 sec' },
        ],
        equipmentNeeded: ['ski_erg', 'pull_up_bar'],
        notes: ['Keep ski pace controlled so limiter is upper-body stamina, not legs'],
    },

    // -------------------------------------------------------------------------
    // THRESHOLD MACHINE (12-30 min controlled hard)
    // -------------------------------------------------------------------------
    {
        id: 'bike-threshold',
        name: 'Bike Threshold Blocks + Upper Accessory',
        type: 'WOD_THRESHOLD_MACHINE',
        timeDomain: 32,
        format: '3 sets',
        movements: [
            { name: 'Bike Erg', reps: '8:00 @ RPE 7-8' },
            { name: 'Rest', reps: '2:00 easy spin' },
            { name: 'Strict Pull Up', reps: '6-10 (or Ring Row 10-15)' },
            { name: 'DB Strict Press', reps: '8-12 reps' },
        ],
        equipmentNeeded: ['bike_erg', 'dumbbells', 'pull_up_bar'],
        notes: ['Upper work is done during the 2:00 easy or immediately after each block'],
    },
    {
        id: 'row-vo2',
        name: 'Row VO2 Repeats',
        type: 'WOD_THRESHOLD_MACHINE',
        timeDomain: 24,
        format: '6 rounds',
        movements: [
            { name: 'Row', reps: '2:00 hard (RPE 9)' },
            { name: 'Rest', reps: '2:00 easy row' },
        ],
        equipmentNeeded: ['rower'],
        notes: ['Optional: add 6 strict pull-ups after each hard rep if you stay composed'],
    },
    {
        id: 'sled-controlled',
        name: 'Sled Push Controlled Hard',
        type: 'WOD_THRESHOLD_MACHINE',
        timeDomain: 18,
        format: '6 rounds',
        movements: [
            { name: 'Sled Push', reps: '45 sec hard' },
            { name: 'Rest', reps: '75 sec walk' },
        ],
        equipmentNeeded: ['sled'],
        notes: ['Hard but not sloppy. No grinding to failure.', 'Excellent in build phase when you want intensity without impact'],
    },

    // -------------------------------------------------------------------------
    // ALACTIC POWER (10-20 sec bursts, lots of rest)
    // -------------------------------------------------------------------------
    {
        id: 'alactic-bike',
        name: 'Alactic Bike Sprints',
        type: 'WOD_ALACTIC_POWER',
        timeDomain: 20,
        format: '10 rounds',
        movements: [
            { name: 'Bike Sprint', reps: '12 sec all-out' },
            { name: 'Rest', reps: '1:48 very easy spin' },
        ],
        equipmentNeeded: ['bike_erg'],
        notes: ['Stop if power drops noticeably', 'This should not create soreness'],
    },

    // -------------------------------------------------------------------------
    // STRENGTH LOW-VOL (heavy-ish, low reps, long rests)
    // -------------------------------------------------------------------------
    {
        id: 'strength-flush',
        name: 'Strength Maintenance + Flush',
        type: 'WOD_STRENGTH_LOW_VOL',
        timeDomain: 45,
        format: 'Strength blocks + flush',
        movements: [
            { name: 'Trap Bar Deadlift', reps: '4 x 3 @ RPE 7-8', notes: 'Rest 2-3 min' },
            { name: 'DB Bench Press', reps: '3 x 6 @ RPE 7-8' },
            { name: 'Bike Erg', reps: '10:00 @ RPE 3-4', notes: 'Flush' },
        ],
        equipmentNeeded: ['trap_bar', 'dumbbells', 'bike_erg'],
        notes: ['Peak phase: reduce to 2x3 deadlift and skip accessories if needed'],
    },
    {
        id: 'primer-neural',
        name: 'Primer: Neural + Breathing',
        type: 'WOD_STRENGTH_LOW_VOL',
        timeDomain: 25,
        format: 'Neural primer',
        movements: [
            { name: 'Front Squat', reps: '5 x 2 @ RPE 6-7 (fast reps)', notes: 'Rest 2:00' },
            { name: 'Weighted Pull Up', reps: '4 x 4', notes: 'Rest 90s' },
            { name: 'Row', reps: '6:00 @ RPE 4', notes: 'Flush' },
        ],
        equipmentNeeded: ['barbell', 'pull_up_bar', 'rower'],
        notes: ['No soreness allowed. Stop well short of fatigue.'],
        scalingOptions: {
            rx: 'As written',
            scaled: '4 x 3 front squat, strict pull-up (unweighted)',
            beginner: 'Goblet squat 4 x 5, ring row 4 x 8',
        },
    },

    // -------------------------------------------------------------------------
    // MINIMAL EQUIPMENT OPTIONS (from research: 17-wod-engine-master.md)
    // -------------------------------------------------------------------------
    {
        id: 'air-runner-chipper',
        name: 'Air Runner Chipper',
        type: 'WOD_AEROBIC_MIXED_MODAL',
        timeDomain: 20,
        format: 'For time',
        movements: [
            { name: 'Air Squat', reps: '50' },
            { name: 'Push Up', reps: '40' },
            { name: 'Sit Up', reps: '30' },
            { name: 'Burpee', reps: '20' },
            { name: 'Jumping Lunge', reps: '10 each leg' },
        ],
        equipmentNeeded: [],
        notes: ['Bodyweight only', 'Scale burpees to step-back if protecting running'],
        scalingOptions: {
            rx: 'As written',
            scaled: '30/25/20/15/8',
            beginner: '20/15/10/8/5 + half burpees',
        },
    },
    {
        id: 'jump-rope-circuit',
        name: 'Jump Rope + Core Circuit',
        type: 'WOD_AEROBIC_MIXED_MODAL',
        timeDomain: 20,
        format: 'AMRAP 20',
        movements: [
            { name: 'Single Under', reps: '50' },
            { name: 'V-Up', reps: '15' },
            { name: 'Hollow Rock', reps: '20' },
            { name: 'Single Under', reps: '50' },
            { name: 'Plank', reps: '45 sec' },
        ],
        equipmentNeeded: ['jump_rope'],
        notes: ['If no jump rope, substitute 30 Jumping Jacks per set'],
    },
];

// =============================================================================
// MOVEMENT CLASSIFICATION (from research green/yellow/red lists)
// =============================================================================

export type MovementColor = 'green' | 'yellow' | 'red';

export interface MovementClassification {
    name: string;
    color: MovementColor;
    eccentricLoad: 'low' | 'moderate' | 'high';
    impactLevel: 'low' | 'moderate' | 'high';
    notes: string;
}

export const MOVEMENT_CLASSIFICATIONS: Record<string, MovementClassification> = {
    // GREEN LIST (best ROI for runners)
    bike_erg: { name: 'Bike Erg', color: 'green', eccentricLoad: 'low', impactLevel: 'low', notes: 'Excellent engine work' },
    ski_erg: { name: 'Ski Erg', color: 'green', eccentricLoad: 'low', impactLevel: 'low', notes: 'Upper body bias' },
    row: { name: 'Row Erg', color: 'green', eccentricLoad: 'low', impactLevel: 'low', notes: 'Full body, minimal pounding' },
    sled_push: { name: 'Sled Push', color: 'green', eccentricLoad: 'low', impactLevel: 'low', notes: 'Concentric only' },
    farmer_carry: { name: 'Farmer Carry', color: 'green', eccentricLoad: 'low', impactLevel: 'low', notes: 'Core + grip' },
    strict_pull_up: { name: 'Strict Pull Up', color: 'green', eccentricLoad: 'moderate', impactLevel: 'low', notes: 'Upper body' },
    ring_row: { name: 'Ring Row', color: 'green', eccentricLoad: 'low', impactLevel: 'low', notes: 'Scalable pulling' },

    // YELLOW LIST (use, but dose matters)
    squat: { name: 'Squat', color: 'yellow', eccentricLoad: 'moderate', impactLevel: 'low', notes: 'Keep low volume in peak' },
    lunge: { name: 'Lunge', color: 'yellow', eccentricLoad: 'moderate', impactLevel: 'low', notes: 'Easy to over-sore' },
    kb_swing: { name: 'KB Swing', color: 'yellow', eccentricLoad: 'low', impactLevel: 'low', notes: 'Great hinge power, limit reps' },
    double_under: { name: 'Double Under', color: 'yellow', eccentricLoad: 'moderate', impactLevel: 'moderate', notes: 'Can flare calves' },

    // RED LIST (avoid in high-volume running phases)
    box_jump_rebound: { name: 'Box Jump (Rebound)', color: 'red', eccentricLoad: 'high', impactLevel: 'high', notes: 'Step down instead' },
    burpee_high_rep: { name: 'Burpee (High Rep)', color: 'red', eccentricLoad: 'high', impactLevel: 'high', notes: 'Limit to 20 max' },
    wall_ball: { name: 'Wall Ball', color: 'red', eccentricLoad: 'high', impactLevel: 'moderate', notes: 'High-rep squat pattern' },
    thruster: { name: 'Thruster', color: 'red', eccentricLoad: 'high', impactLevel: 'moderate', notes: 'High lactate, high leg fatigue' },
};

// =============================================================================
// WOD SELECTOR (phase-appropriate selection)
// =============================================================================

/**
 * Select appropriate WODs for a training phase.
 * Rules from research (11-crossfit-running-hybrid-programming.md):
 * - BASE: 2 strength + 1 aerobic mixed-modal
 * - BUILD: 2 strength (reduced volume) + 0-1 threshold machine
 * - PEAK: 1 strength (maintenance) + 0 conditioning
 * - TAPER: 0 WODs or very light flush only
 */
export function getAvailableWodsForPhase(phase: TrainingPhase): WodWorkout[] {
    const allowedTypes: WodType[] = [];

    switch (phase) {
        case 'base':
            allowedTypes.push(
                'WOD_STRENGTH_LOW_VOL',
                'WOD_AEROBIC_MIXED_MODAL',
                'WOD_ALACTIC_POWER'
            );
            break;
        case 'build':
            allowedTypes.push(
                'WOD_STRENGTH_LOW_VOL',
                'WOD_AEROBIC_MIXED_MODAL',
                'WOD_THRESHOLD_MACHINE'
            );
            break;
        case 'peak':
            allowedTypes.push(
                'WOD_STRENGTH_LOW_VOL',
                'WOD_ALACTIC_POWER'
            );
            break;
        case 'taper':
            // Only very light options
            allowedTypes.push('WOD_AEROBIC_MIXED_MODAL');
            break;
    }

    // Never allow glycolytic metcons during marathon training
    return WOD_LIBRARY.filter(wod => allowedTypes.includes(wod.type));
}

/**
 * Get WODs that match available equipment.
 */
export function filterByEquipment(wods: WodWorkout[], available: string[]): WodWorkout[] {
    if (available.length === 0) {
        // No equipment = bodyweight only
        return wods.filter(wod => wod.equipmentNeeded.length === 0);
    }

    return wods.filter(wod =>
        wod.equipmentNeeded.every(eq => available.includes(eq))
    );
}

/**
 * Check if a WOD is safe before a long run.
 * Rule: No high-eccentric lower-body WOD within 36-48h before long run.
 */
export function isWodSafeBeforeLongRun(wod: WodWorkout, hoursUntilLongRun: number): boolean {
    if (hoursUntilLongRun > 48) return true;

    // Check if any movements are red-listed
    const hasRedMovement = wod.movements.some(m => {
        const lower = m.name.toLowerCase();
        return lower.includes('squat') ||
            lower.includes('lunge') ||
            lower.includes('wall ball') ||
            lower.includes('thruster') ||
            lower.includes('box jump');
    });

    if (hasRedMovement && hoursUntilLongRun < 48) {
        return false;
    }

    return true;
}
