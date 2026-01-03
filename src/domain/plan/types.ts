/**
 * THE LONG GAME - Plan Generation Types
 * 
 * Core types for the coach-backed training plan generation engine.
 * Every type here is intentional and rooted in coaching science.
 */

// =============================================================================
// TRAINING PHASES (Pfitzinger Periodization)
// =============================================================================

/**
 * Training phases from Pete Pfitzinger's periodization model.
 * Each phase has a specific PURPOSE toward race day.
 */
export type TrainingPhase = 'base' | 'build' | 'peak' | 'taper';

/**
 * Phase configuration based on target distance
 */
export interface PhaseConfig {
    phase: TrainingPhase;
    weeks: number;
    description: string;
    primaryFocus: string[];
    mileageMultiplier: number; // Relative to peak
    qualityDaysPerWeek: number;
    longRunPercentage: number; // % of weekly mileage
}

// =============================================================================
// WORKOUT TYPES (Daniels Zones)
// =============================================================================

/**
 * Daniels training zones - each has a specific physiological purpose
 */
export type TrainingZone = 'E' | 'M' | 'T' | 'I' | 'R';

export type WorkoutType =
    // Easy/Recovery
    | 'easy'
    | 'recovery'
    // Threshold (T pace)
    | 'tempo'
    | 'cruise_intervals'
    | 'threshold'
    // Intervals (I pace)
    | 'vo2max_800s'
    | 'vo2max_1000s'
    | 'vo2max_1200s'
    | 'vo2max_mile'
    // Repetition (R pace)
    | 'strides'
    | 'speed_200s'
    | 'speed_400s'
    // Long runs
    | 'long_easy'
    | 'long_progression'
    | 'long_mp_finish'
    | 'long_fast_finish'
    // Special
    | 'race_simulation'
    | 'fartlek'
    | 'hills'
    // Rest
    | 'rest'
    | 'cross_train';

/**
 * Workout component for structured workouts
 */
export interface WorkoutSegment {
    type: 'warmup' | 'main' | 'cooldown' | 'recovery';
    description: string;
    distance?: number; // miles
    duration?: number; // minutes
    pace?: TrainingZone;
    targetPaceSeconds?: number; // Calculated from VDOT
    repeats?: number;
    recoveryDuration?: number; // seconds
}

/**
 * Complete workout definition
 */
export interface Workout {
    id: string;
    name: string;
    type: WorkoutType;
    segments: WorkoutSegment[];
    totalDistance: number; // miles
    estimatedDuration: number; // minutes
    primaryZone: TrainingZone;
    purpose: string;
    coachSource: string; // Which coach this is from
    qualityMiles: number; // Miles NOT at easy pace
    notes?: string;
}

// =============================================================================
// STRENGTH TRAINING (Dicharry)
// =============================================================================

export type StrengthFocus =
    | 'glutes'
    | 'calves'
    | 'core'
    | 'hip_stability'
    | 'single_leg'
    | 'full_body';

export interface StrengthWorkout {
    id: string;
    name: string;
    focus: StrengthFocus[];
    duration: number; // minutes
    exercises: StrengthExercise[];
    equipmentNeeded: 'none' | 'minimal' | 'gym';
    injuryPrevention?: string[]; // Target areas for prehab
}

export interface StrengthExercise {
    name: string;
    sets: number;
    reps: number | string; // "8-10" or "30sec"
    notes?: string;
}

// =============================================================================
// DAY PLAN
// =============================================================================

/**
 * A single day in the training plan
 */
export interface DayPlan {
    date: string; // ISO date
    dayOfWeek: number; // 0-6, 0 = Sunday
    runWorkout: Workout | null;
    strengthWorkout: StrengthWorkout | null;
    isKeyDay: boolean; // SOS day (Hansons "Something of Substance")
    totalMiles: number;
    qualityMiles: number;
    notes?: string;
}

// =============================================================================
// WEEK PLAN
// =============================================================================

/**
 * A complete training week
 */
export interface WeekPlan {
    weekNumber: number;
    weekOf: string; // Start date ISO
    phase: TrainingPhase;
    phaseWeek: number; // Week # within the phase

    // Structure
    days: DayPlan[];

    // Volume metrics
    totalMiles: number;
    longRunMiles: number;

    // Intensity distribution (Seiler 80/20)
    easyMiles: number;
    qualityMiles: number;
    easyPercentage: number; // Should be ~80%

    // SOS count (Hansons)
    keyWorkouts: number;

    // Recovery week flag
    isRecoveryWeek: boolean;

    // Week focus
    focus: string;
    coachNotes?: string;
}

// =============================================================================
// COMPLETE TRAINING PLAN
// =============================================================================

/**
 * The complete generated training plan
 */
export interface TrainingPlan {
    id: string;
    createdAt: string;

    // Athlete info
    athleteName: string;
    vdot: number;

    // Goal
    goalDistance: '5k' | '10k' | 'half' | 'marathon' | 'general';
    raceName?: string;
    raceDate?: string;

    // Structure
    weeks: WeekPlan[];
    totalWeeks: number;

    // Phase breakdown
    phases: {
        phase: TrainingPhase;
        startWeek: number;
        endWeek: number;
        weeks: number;
    }[];

    // Metrics
    peakMileage: number;
    peakWeek: number;
    totalMiles: number;

    // Training paces (from VDOT)
    paces: {
        easy: { min: number; max: number }; // seconds per mile
        marathon: number;
        threshold: number;
        interval: number;
        repetition: number;
    };

    // Modifications applied
    injuryModifications?: string[];
    intensityLevel: 'conservative' | 'moderate' | 'aggressive';

    // Verification status
    verification: PlanVerification;
}

// =============================================================================
// PLAN VERIFICATION (Quality Checks)
// =============================================================================

/**
 * Verification results to ensure plan meets coaching standards
 */
export interface PlanVerification {
    passed: boolean;
    checks: VerificationCheck[];
}

export interface VerificationCheck {
    name: string;
    passed: boolean;
    value?: number;
    expected?: string;
    message?: string;
}

/**
 * Standard checks based on coaching principles
 */
export const VERIFICATION_CHECKS = {
    // Seiler: 80/20 polarization
    POLARIZATION: {
        name: '80/20 Polarization',
        description: 'Easy time ≥ 75% of total',
        minEasyPercent: 75,
        maxQualityPercent: 25,
    },

    // Hansons: Long run cap
    LONG_RUN_CAP: {
        name: 'Long Run Cap',
        description: 'No long run > 33% of weekly mileage',
        maxLongRunPercent: 33,
    },

    // Pfitzinger: 10% rule
    PROGRESSION_RATE: {
        name: '10% Progression Rule',
        description: 'No week increases > 10% from previous',
        maxWeeklyIncrease: 10,
    },

    // General: Recovery weeks
    RECOVERY_WEEKS: {
        name: 'Recovery Week Frequency',
        description: 'Recovery week every 3-4 weeks',
        maxWeeksWithoutRecovery: 4,
    },

    // Taper check
    TAPER_REDUCTION: {
        name: 'Proper Taper',
        description: 'Final 2-3 weeks show graduated reduction',
        minTaperReduction: 40, // %
        maxTaperReduction: 60, // %
    },

    // SOS distribution
    SOS_DISTRIBUTION: {
        name: 'Quality Session Spacing',
        description: 'No back-to-back hard days',
    },
} as const;

// =============================================================================
// PLAN GENERATION INPUT
// =============================================================================

/**
 * Input required to generate a plan
 */
export interface PlanGenerationInput {
    // From onboarding
    name: string;
    age: number;
    sex: 'male' | 'female';

    vdot: number;
    vdotConfidence: 'high' | 'medium' | 'low';

    goalDistance: '5k' | '10k' | 'half' | 'marathon' | 'general';
    raceName?: string;
    raceDate?: string;
    fitnessDuration?: '8weeks' | '12weeks' | 'ongoing';

    weeklyMiles: number;
    runsPerWeek: number;
    longestRecentRun: number;

    availableDays: 3 | 4 | 5 | 6;
    longRunDay: 'saturday' | 'sunday' | string;

    currentPain: boolean;
    painLocation?: string;
    recentInjury: boolean;
    injuryLocation?: string;

    trainingIntensity: 'conservative' | 'moderate' | 'aggressive';
    includeStrength: boolean;
}

// =============================================================================
// DISTANCE CONSTANTS
// =============================================================================

export const DISTANCE_MILES: Record<string, number> = {
    '5k': 3.1,
    '10k': 6.2,
    'half': 13.1,
    'marathon': 26.2,
};

export const MINIMUM_WEEKS: Record<string, number> = {
    '5k': 6,
    '10k': 8,
    'half': 10,
    'marathon': 14,
    'general': 8,
};

export const IDEAL_WEEKS: Record<string, number> = {
    '5k': 8,
    '10k': 12,
    'half': 14,
    'marathon': 18,
    'general': 12,
};
