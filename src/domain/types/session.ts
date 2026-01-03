/**
 * Session/Workout domain types
 * Types for prescribing and logging training sessions
 */

// Pace zones from Daniels VDOT
export type PaceZone = 'E' | 'M' | 'T' | 'I' | 'R';

// Session types
export type RunSessionType =
    | 'easy'
    | 'tempo'
    | 'intervals'
    | 'long_run'
    | 'recovery'
    | 'progression';

export type StrengthSessionType =
    | 'max_strength'
    | 'single_leg'
    | 'power'
    | 'hip_circuit'
    | 'neural'
    | 'maintenance';

export type SessionType =
    | RunSessionType
    | StrengthSessionType
    | 'durability'
    | 'rest'
    | 'cross_train';

// Pace per mile in seconds
export interface PaceZones {
    E: { minSecPerMile: number; maxSecPerMile: number };  // Easy
    M: { secPerMile: number };                            // Marathon
    T: { secPerMile: number };                            // Threshold
    I: { secPerMile: number };                            // Interval
    R: { secPerMile: number };                            // Repetition
}

// Running prescription components
export interface RunBlock {
    distanceMiles?: number;
    distanceMeters?: number;
    durationMinutes?: number;
    paceZone: PaceZone;
    description?: string;
}

export interface IntervalSet {
    reps: number;
    workDistanceM: number;
    workPaceZone: PaceZone;
    recoveryDistanceM: number;
    recoveryType: 'jog' | 'stand';
}

export interface RunPrescription {
    type: RunSessionType;
    warmup?: RunBlock;
    mainSet: RunBlock[] | IntervalSet[];
    cooldown?: RunBlock;
    totalDistanceMiles: number;
    estimatedDurationMin: number;
    notes?: string;
}

// Strength prescription
export interface ExercisePrescription {
    exerciseId: string;
    exerciseName: string;
    sets: number;
    reps: number | string;  // "4" or "8-10" or "45s"
    intensity?: string;     // "RPE 7-8" or "85% 1RM"
    restSeconds?: number;
    notes?: string;
}

export interface StrengthPrescription {
    type: StrengthSessionType;
    templateId: string;     // A, B, P, H, N
    exercises: ExercisePrescription[];
    estimatedDurationMin: number;
    notes?: string;
}

// Durability prescription
export interface DurabilityPrescription {
    moduleIds: string[];
    estimatedDurationMin: number;
}

// Full workout prescription
export interface WorkoutPrescription {
    run?: RunPrescription;
    strength?: StrengthPrescription;
    durability?: DurabilityPrescription;
}

// Session status
export type SessionStatus = 'scheduled' | 'completed' | 'skipped' | 'modified';

// Planned workout
export interface PlannedWorkout {
    id: string;
    planId: string;
    athleteId: string;
    scheduledDate: Date;
    dayOfWeek: number;  // 0-6, Sunday = 0
    sessionType: SessionType;
    prescription: WorkoutPrescription;
    fuelingPlan?: FuelingPlan;
    status: SessionStatus;
    createdAt: Date;
}

// Fueling plan for long runs
export interface FuelingPlan {
    preRunCarbs?: string;     // "1-4 g/kg carbs, 1-4 hrs pre-run"
    duringRunCarbsPerHour?: number;  // grams
    hydrationMlPerHour?: number;
    notes?: string;
}

// Completed workout logging
export interface CompletedWorkout {
    id: string;
    plannedWorkoutId?: string;
    athleteId: string;
    completedDate: Date;
    actualSession: ActualSession;
    zoneMinutes?: ZoneMinutes;
    symptoms?: WorkoutSymptoms;
    createdAt: Date;
}

export interface ActualSession {
    type: SessionType;
    distanceMiles?: number;
    durationMinutes?: number;
    averagePaceSecPerMile?: number;
    hrAverage?: number;
    hrMax?: number;
    perceivedEffort: number;  // 1-10
    notes?: string;
}

export interface ZoneMinutes {
    zone1: number;
    zone2: number;
    zone3: number;
}

export interface WorkoutSymptoms {
    painDuring: number;    // 0-10
    painTrend: 'better' | 'same' | 'worse';
    gaitChange: boolean;
    site?: string;
}
