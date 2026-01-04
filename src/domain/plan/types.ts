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
    'ultra_50k': 16,
    'ultra_50m': 20,
    'ultra_100k': 24,
    'ultra_100m': 30,
    'general': 12,
};

// =============================================================================
// ULTRA TRAINING TYPES (Oracle Research)
// =============================================================================

export type UltraDistance = 'ultra_50k' | 'ultra_50m' | 'ultra_100k' | 'ultra_100m';

export type Terrain = 'road' | 'trail' | 'mountain';

export interface UltraRaceDetails {
    distance: UltraDistance;
    terrain: Terrain;
    verticalGainM?: number;
    technicality: 'low' | 'moderate' | 'high';
    expectedFinishHours?: number;
    usesPoles: boolean;
}

// =============================================================================
// HIGDON TIER SYSTEM (Oracle Research)
// =============================================================================

export type HigdonTier =
    | 'novice_1'
    | 'novice_2'
    | 'novice_supreme'
    | 'intermediate_1'
    | 'intermediate_2'
    | 'advanced_1'
    | 'advanced_2';

export interface HigdonTierConfig {
    tier: HigdonTier;
    durationWeeks: number;
    runDays: number;
    crossTrainDays: number;
    restDays: number;
    twentyMilers: number;
    twentyMilerWeeks: number[];
    peakMileage: number;
    longRunDay: 'saturday' | 'sunday';
    hasWeekendBackToBack: boolean;
    hasThreeOneLongRun: boolean;
    qualitySessions: string[];
}

export const HIGDON_TIER_CONFIGS: Record<HigdonTier, HigdonTierConfig> = {
    novice_1: {
        tier: 'novice_1',
        durationWeeks: 18,
        runDays: 4,
        crossTrainDays: 1,
        restDays: 2,
        twentyMilers: 1,
        twentyMilerWeeks: [15],
        peakMileage: 40,
        longRunDay: 'saturday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: false,
        qualitySessions: [],
    },
    novice_2: {
        tier: 'novice_2',
        durationWeeks: 18,
        runDays: 4,
        crossTrainDays: 1,
        restDays: 2,
        twentyMilers: 1,
        twentyMilerWeeks: [15],
        peakMileage: 36,
        longRunDay: 'saturday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: false,
        qualitySessions: ['wed_race_pace'],
    },
    novice_supreme: {
        tier: 'novice_supreme',
        durationWeeks: 30,
        runDays: 4,
        crossTrainDays: 1,
        restDays: 2,
        twentyMilers: 1,
        twentyMilerWeeks: [27], // Week 15 of marathon phase = week 27 overall
        peakMileage: 40,
        longRunDay: 'saturday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: false,
        qualitySessions: [],
    },
    intermediate_1: {
        tier: 'intermediate_1',
        durationWeeks: 18,
        runDays: 5,
        crossTrainDays: 1,
        restDays: 1,
        twentyMilers: 2,
        twentyMilerWeeks: [13, 15],
        peakMileage: 44,
        longRunDay: 'sunday',
        hasWeekendBackToBack: true,
        hasThreeOneLongRun: false,
        qualitySessions: ['sat_race_pace'],
    },
    intermediate_2: {
        tier: 'intermediate_2',
        durationWeeks: 18,
        runDays: 5,
        crossTrainDays: 1,
        restDays: 1,
        twentyMilers: 3,
        twentyMilerWeeks: [11, 13, 15],
        peakMileage: 50,
        longRunDay: 'sunday',
        hasWeekendBackToBack: true,
        hasThreeOneLongRun: false,
        qualitySessions: ['sat_race_pace'],
    },
    advanced_1: {
        tier: 'advanced_1',
        durationWeeks: 18,
        runDays: 6,
        crossTrainDays: 0,
        restDays: 1,
        twentyMilers: 3,
        twentyMilerWeeks: [11, 13, 15],
        peakMileage: 50,
        longRunDay: 'sunday',
        hasWeekendBackToBack: true,
        hasThreeOneLongRun: true,
        qualitySessions: ['thu_speedwork', 'sat_race_pace'],
    },
    advanced_2: {
        tier: 'advanced_2',
        durationWeeks: 18,
        runDays: 6,
        crossTrainDays: 0,
        restDays: 1,
        twentyMilers: 3,
        twentyMilerWeeks: [11, 13, 15],
        peakMileage: 45,
        longRunDay: 'sunday',
        hasWeekendBackToBack: true,
        hasThreeOneLongRun: true,
        qualitySessions: ['tue_speedwork', 'thu_speedwork', 'sat_race_pace'],
    },
};

// =============================================================================
// VDOT CALIBRATION TYPES (Oracle Research)
// =============================================================================

export type VDOTSource = 'race' | 'time_trial' | 'strava' | 'garmin' | 'vo2max' | 'estimated';

export interface VDOTCalibration {
    seedVDOT: number;      // Initial from race/Garmin/etc
    tVDOT: number;         // Training VDOT (may be lower for beginners)
    rVDOT: number;         // Race VDOT (validated from actual race performance)
    source: VDOTSource;
    confidence: 'high' | 'medium' | 'low';
    lastUpdated: string;   // ISO date
}

export interface CalibrationFactors {
    runningExperienceMonths: number;
    weeklyVolumeMinutes: number;
    strengthBackground: 'none' | 'recreational' | 'intermediate' | 'advanced';
}

