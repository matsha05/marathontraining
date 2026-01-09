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
    rest?: string; // "60-90s", "full recovery"
    notes?: string;
}

// =============================================================================
// CROSS TRAINING (Higdon-style "Cross" days)
// =============================================================================

export type CrossTrainingType = 'cycling' | 'swimming' | 'elliptical' | 'walking' | 'yoga' | 'rest_optional';

export interface CrossTrainingSuggestion {
    type: CrossTrainingType;
    duration: number; // minutes
    intensity: 'easy' | 'moderate';
    notes?: string;
}

// =============================================================================
// DURABILITY MODULE (from research: 04-starrett-dicharry-durability.md)
// =============================================================================

export interface DurabilityModule {
    id: string;
    name: string;
    category: 'mobility' | 'control' | 'capacity' | 'tissue' | 'integration';
    durationMinutes: number;
    exercises: DurabilityExercise[];
    basedOnAssessment?: string; // Assessment ID that triggered this
    frequency: string; // "daily", "2-3x/week"
}

export interface DurabilityExercise {
    name: string;
    dosage: string; // "2:00 hold", "20 reps"
    cues: string[]; // Quick reminders during exercise
    instructions?: string[]; // Step-by-step how to perform
    source?: string; // "Dicharry - Running Rewired" or "Starrett - Ready to Run"
    videoUrl?: string; // YouTube demonstration link
}

/**
 * Complete daily durability routine (8-12 minutes per research)
 * From 04-starrett-dicharry-durability.md:
 * 1. Readiness scan (1-2 min)
 * 2. Mobility module (3-5 min) - only if test indicates
 * 3. Control module (3-5 min) - always beneficial
 * 4. Optional capacity (2-4 min) - on easy/rest days
 */
export interface DailyDurabilityRoutine {
    id: string;
    name: string;
    totalMinutes: number;
    dayType: 'quality' | 'easy' | 'rest' | 'long';
    modules: DurabilityModule[];
}

// =============================================================================
// WOD WORKOUT (from research: 11-crossfit-running-hybrid-programming.md)
// =============================================================================

export type WodType =
    | 'WOD_STRENGTH_LOW_VOL'      // Heavy-ish, low reps, long rests
    | 'WOD_AEROBIC_MIXED_MODAL'   // 20-45 min, RPE 5-6
    | 'WOD_THRESHOLD_MACHINE'     // 12-30 min controlled hard
    | 'WOD_ALACTIC_POWER'         // 10-20 sec bursts, lots of rest
    | 'WOD_GLYCOLYTIC_METCON';    // Avoid in marathon-specific phases

export interface WodWorkout {
    id: string;
    name: string;
    type: WodType;
    timeDomain: number; // minutes
    format: string; // "AMRAP 20", "6 rounds for quality", etc.
    movements: WodMovement[];
    equipmentNeeded: string[];
    notes?: string[];
    scalingOptions?: {
        rx: string;
        scaled: string;
        beginner: string;
    };
    // Rich metadata from research (17-wod-engine-master.md)
    fatigueLevel?: 'green' | 'yellow' | 'red'; // Run interference level
    phaseRestriction?: 'base_only' | 'taper_safe' | 'all'; // When this WOD is appropriate
    runProtectionHours?: number; // Min hours before quality/long run
    focus?: string; // What this workout develops
}

export interface WodMovement {
    name: string;
    reps: string; // "12/10 calories", "10 reps", "40m"
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
    crossTraining?: CrossTrainingSuggestion; // Higdon-style "Cross" day suggestion
    durabilityModule?: DurabilityModule; // For backward compat (first module)
    durabilityRoutine?: DailyDurabilityRoutine; // Full 8-12 min routine per research
    wodWorkout?: WodWorkout; // Optional conditioning (opt-in)
    isKeyDay: boolean; // SOS day (Hansons "Something of Substance")
    totalMiles: number;
    qualityMiles: number;
    notes?: string;
}

// =============================================================================
// WEEK PLAN
// =============================================================================

export type WeekBlockType = 'base_official' | 'maintenance' | 'race_plan';

/**
 * A complete training week
 */
export interface WeekPlan {
    weekNumber: number;
    weekOf: string; // Start date ISO
    phase: TrainingPhase;
    phaseWeek: number; // Week # within the phase
    blockType?: WeekBlockType;

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

    // Coach/Philosophy identity (for display)
    philosophy?: 'hansons' | 'higdon' | 'pfitzinger' | 'daniels' | 'fitzgerald' | 'magness';
    planTier?: string; // e.g., "Intermediate 1", "55 mi/week"

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
    planStartDate?: string;  // ISO date for when training starts (optional)
    fitnessDuration?: '8weeks' | '12weeks' | 'ongoing';

    weeklyMiles: number;
    runsPerWeek: number;
    longestRecentRun: number;

    availableDays: 3 | 4 | 5 | 6;
    longRunDay: string;  // Day name: 'saturday', 'sunday', 'monday', etc.

    currentPain: boolean;
    painLocation?: string;
    recentInjury: boolean;
    injuryLocation?: string;

    trainingIntensity: 'conservative' | 'moderate' | 'aggressive';
    includeStrength: boolean;
    strengthBackground?: 'none' | 'recreational' | 'intermediate' | 'advanced';
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
// HIGDON TIER SYSTEM (Oracle Research - All 22 Plans)
// =============================================================================

/**
 * Higdon distance categories
 */
export type HigdonDistance = 'base' | '5k' | '10k' | 'half' | 'marathon';

/**
 * All 22 Higdon training plan tiers across 5 distances
 */
export type HigdonTier =
    // Base Training (4 tiers)
    | 'base_novice'
    | 'base_intermediate'
    | 'base_advanced'
    | 'base_spring'
    // 5K (3 tiers)
    | '5k_novice'
    | '5k_intermediate'
    | '5k_advanced'
    // 10K (3 tiers)
    | '10k_novice'
    | '10k_intermediate'
    | '10k_advanced'
    // Half Marathon (5 tiers)
    | 'half_novice_1'
    | 'half_novice_2'
    | 'half_intermediate_1'
    | 'half_advanced'
    | 'half_hm3'
    // Marathon (7 tiers)
    | 'marathon_novice_1'
    | 'marathon_novice_2'
    | 'marathon_novice_supreme'
    | 'marathon_intermediate_1'
    | 'marathon_intermediate_2'
    | 'marathon_advanced_1'
    | 'marathon_advanced_2';

/**
 * Legacy tier aliases for backward compatibility
 */
export type LegacyHigdonTier =
    | 'novice_1'
    | 'novice_2'
    | 'novice_supreme'
    | 'intermediate_1'
    | 'intermediate_2'
    | 'advanced_1'
    | 'advanced_2';

/**
 * Map legacy tier names to new namespaced names
 */
export const LEGACY_TIER_MAP: Record<LegacyHigdonTier, HigdonTier> = {
    novice_1: 'marathon_novice_1',
    novice_2: 'marathon_novice_2',
    novice_supreme: 'marathon_novice_supreme',
    intermediate_1: 'marathon_intermediate_1',
    intermediate_2: 'marathon_intermediate_2',
    advanced_1: 'marathon_advanced_1',
    advanced_2: 'marathon_advanced_2',
};

export interface HigdonTierConfig {
    tier: HigdonTier;
    distance: HigdonDistance;
    durationWeeks: number;
    runDays: number;
    crossTrainDays: number;
    restDays: number;
    walkDays?: number;
    strengthDays?: number;
    // Marathon-specific
    twentyMilers?: number;
    twentyMilerWeeks?: number[];
    // General
    peakLongRunMiles?: number;
    peakLongRunMinutes?: number;
    longRunDay: 'saturday' | 'sunday';
    hasWeekendBackToBack: boolean;
    hasThreeOneLongRun: boolean;
    qualitySessions: string[];
    // Tune-up races
    tuneUpRaceWeeks?: { week: number; distance: string }[];
    // Stepback pattern
    stepbackWeeks?: number[];
}

export const HIGDON_TIER_CONFIGS: Record<HigdonTier, HigdonTierConfig> = {
    // =========================================================================
    // BASE TRAINING (4 tiers)
    // =========================================================================
    base_novice: {
        tier: 'base_novice',
        distance: 'base',
        durationWeeks: 12,
        runDays: 4,
        crossTrainDays: 0,
        restDays: 2,
        walkDays: 1,
        peakLongRunMiles: 8,
        longRunDay: 'sunday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: false,
        qualitySessions: [],
    },
    base_intermediate: {
        tier: 'base_intermediate',
        distance: 'base',
        durationWeeks: 12,
        runDays: 6,
        crossTrainDays: 0,
        restDays: 1,
        strengthDays: 2,
        peakLongRunMiles: 10,
        longRunDay: 'sunday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: false,
        qualitySessions: [],
        stepbackWeeks: [4, 7, 11],
    },
    base_advanced: {
        tier: 'base_advanced',
        distance: 'base',
        durationWeeks: 12,
        runDays: 6,
        crossTrainDays: 0,
        restDays: 0,
        strengthDays: 2,
        peakLongRunMiles: 10,
        longRunDay: 'sunday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: false,
        qualitySessions: ['tue_hills_or_intervals', 'thu_tempo_or_fartlek'],
        tuneUpRaceWeeks: [
            { week: 5, distance: '5k' },
            { week: 7, distance: '8k' },
            { week: 9, distance: '10k' },
            { week: 11, distance: '5k' },
            { week: 12, distance: '10k' },
        ],
    },
    base_spring: {
        tier: 'base_spring',
        distance: 'base',
        durationWeeks: 10,
        runDays: 4,
        crossTrainDays: 2,
        restDays: 1,
        strengthDays: 2,
        peakLongRunMinutes: 90,
        longRunDay: 'saturday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: false,
        qualitySessions: ['thu_intervals', 'fri_tempo'],
    },

    // =========================================================================
    // 5K (3 tiers)
    // =========================================================================
    '5k_novice': {
        tier: '5k_novice',
        distance: '5k',
        durationWeeks: 8,
        runDays: 3,
        crossTrainDays: 0,
        restDays: 1,
        walkDays: 1,
        peakLongRunMiles: 3,
        longRunDay: 'saturday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: false,
        qualitySessions: [],
    },
    '5k_intermediate': {
        tier: '5k_intermediate',
        distance: '5k',
        durationWeeks: 8,
        runDays: 5,
        crossTrainDays: 0,
        restDays: 2,
        peakLongRunMiles: 7,
        longRunDay: 'sunday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: false,
        qualitySessions: ['wed_intervals_or_tempo', 'sat_fast'],
    },
    '5k_advanced': {
        tier: '5k_advanced',
        distance: '5k',
        durationWeeks: 8,
        runDays: 5,
        crossTrainDays: 0,
        restDays: 1,
        peakLongRunMinutes: 90,
        longRunDay: 'sunday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: false,
        qualitySessions: ['tue_intervals', 'thu_tempo', 'sat_fast'],
        tuneUpRaceWeeks: [{ week: 4, distance: '5k' }],
    },

    // =========================================================================
    // 10K (3 tiers)
    // =========================================================================
    '10k_novice': {
        tier: '10k_novice',
        distance: '10k',
        durationWeeks: 8,
        runDays: 3,
        crossTrainDays: 2,
        restDays: 2,
        peakLongRunMiles: 5.5,
        longRunDay: 'sunday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: false,
        qualitySessions: [],
        stepbackWeeks: [6],
    },
    '10k_intermediate': {
        tier: '10k_intermediate',
        distance: '10k',
        durationWeeks: 8,
        runDays: 5,
        crossTrainDays: 1,
        restDays: 1,
        peakLongRunMiles: 8,
        longRunDay: 'sunday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: false,
        qualitySessions: ['wed_tempo_or_intervals'],
        tuneUpRaceWeeks: [{ week: 4, distance: '5k' }],
    },
    '10k_advanced': {
        tier: '10k_advanced',
        distance: '10k',
        durationWeeks: 8,
        runDays: 6,
        crossTrainDays: 0,
        restDays: 1,
        peakLongRunMiles: 10,
        longRunDay: 'sunday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: true,
        qualitySessions: ['tue_tempo', 'wed_intervals', 'sat_pace'],
        tuneUpRaceWeeks: [
            { week: 4, distance: '5k' },
            { week: 6, distance: '8k' },
        ],
    },

    // =========================================================================
    // HALF MARATHON (5 tiers)
    // =========================================================================
    half_novice_1: {
        tier: 'half_novice_1',
        distance: 'half',
        durationWeeks: 12,
        runDays: 3,
        crossTrainDays: 2,
        restDays: 2,
        peakLongRunMiles: 10,
        longRunDay: 'sunday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: false,
        qualitySessions: [],
        tuneUpRaceWeeks: [
            { week: 6, distance: '5k' },
            { week: 9, distance: '10k' },
        ],
    },
    half_novice_2: {
        tier: 'half_novice_2',
        distance: 'half',
        durationWeeks: 12,
        runDays: 4,
        crossTrainDays: 1,
        restDays: 2,
        peakLongRunMiles: 10,
        longRunDay: 'saturday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: false,
        qualitySessions: ['wed_pace_even_weeks'],
        tuneUpRaceWeeks: [
            { week: 6, distance: '5k' },
            { week: 9, distance: '10k' },
        ],
    },
    half_intermediate_1: {
        tier: 'half_intermediate_1',
        distance: 'half',
        durationWeeks: 12,
        runDays: 5,
        crossTrainDays: 1,
        restDays: 1,
        peakLongRunMiles: 12,
        longRunDay: 'sunday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: false,
        qualitySessions: ['wed_pace', 'sat_pace'],
        tuneUpRaceWeeks: [
            { week: 6, distance: '5k' },
            { week: 9, distance: '10k' },
        ],
    },
    half_advanced: {
        tier: 'half_advanced',
        distance: 'half',
        durationWeeks: 12,
        runDays: 6,
        crossTrainDays: 0,
        restDays: 1,
        peakLongRunMinutes: 100,
        longRunDay: 'sunday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: true,
        qualitySessions: ['tue_hills_or_intervals', 'thu_tempo', 'sat_pace'],
        tuneUpRaceWeeks: [
            { week: 3, distance: '5k' },
            { week: 6, distance: '10k' },
            { week: 9, distance: '15k' },
        ],
    },
    half_hm3: {
        tier: 'half_hm3',
        distance: 'half',
        durationWeeks: 12,
        runDays: 3,
        crossTrainDays: 2,
        restDays: 2,
        peakLongRunMiles: 10,
        longRunDay: 'saturday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: false,
        qualitySessions: ['thu_rotation'],
        tuneUpRaceWeeks: [
            { week: 6, distance: '5k' },
            { week: 9, distance: '10k' },
        ],
    },

    // =========================================================================
    // MARATHON (7 tiers)
    // =========================================================================
    marathon_novice_1: {
        tier: 'marathon_novice_1',
        distance: 'marathon',
        durationWeeks: 18,
        runDays: 4,
        crossTrainDays: 1,
        restDays: 2,
        twentyMilers: 1,
        twentyMilerWeeks: [15],
        peakLongRunMiles: 20,
        longRunDay: 'saturday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: false,
        qualitySessions: [],
        tuneUpRaceWeeks: [{ week: 8, distance: 'half' }],
    },
    marathon_novice_2: {
        tier: 'marathon_novice_2',
        distance: 'marathon',
        durationWeeks: 18,
        runDays: 4,
        crossTrainDays: 1,
        restDays: 2,
        twentyMilers: 1,
        twentyMilerWeeks: [15],
        peakLongRunMiles: 20,
        longRunDay: 'saturday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: false,
        qualitySessions: ['wed_race_pace'],
        tuneUpRaceWeeks: [{ week: 9, distance: 'half' }],
    },
    marathon_novice_supreme: {
        tier: 'marathon_novice_supreme',
        distance: 'marathon',
        durationWeeks: 30,
        runDays: 4,
        crossTrainDays: 1,
        restDays: 2,
        twentyMilers: 1,
        twentyMilerWeeks: [27],
        peakLongRunMiles: 20,
        longRunDay: 'saturday',
        hasWeekendBackToBack: false,
        hasThreeOneLongRun: false,
        qualitySessions: [],
    },
    marathon_intermediate_1: {
        tier: 'marathon_intermediate_1',
        distance: 'marathon',
        durationWeeks: 18,
        runDays: 5,
        crossTrainDays: 1,
        restDays: 1,
        twentyMilers: 2,
        twentyMilerWeeks: [13, 15],
        peakLongRunMiles: 20,
        longRunDay: 'sunday',
        hasWeekendBackToBack: true,
        hasThreeOneLongRun: false,
        qualitySessions: ['sat_race_pace'],
        tuneUpRaceWeeks: [{ week: 9, distance: 'half' }],
    },
    marathon_intermediate_2: {
        tier: 'marathon_intermediate_2',
        distance: 'marathon',
        durationWeeks: 18,
        runDays: 5,
        crossTrainDays: 1,
        restDays: 1,
        twentyMilers: 3,
        twentyMilerWeeks: [11, 13, 15],
        peakLongRunMiles: 20,
        longRunDay: 'sunday',
        hasWeekendBackToBack: true,
        hasThreeOneLongRun: false,
        qualitySessions: ['sat_race_pace'],
        tuneUpRaceWeeks: [{ week: 9, distance: 'half' }],
    },
    marathon_advanced_1: {
        tier: 'marathon_advanced_1',
        distance: 'marathon',
        durationWeeks: 18,
        runDays: 6,
        crossTrainDays: 0,
        restDays: 1,
        twentyMilers: 3,
        twentyMilerWeeks: [11, 13, 15],
        peakLongRunMiles: 20,
        longRunDay: 'sunday',
        hasWeekendBackToBack: true,
        hasThreeOneLongRun: true,
        qualitySessions: ['thu_speedwork', 'sat_race_pace'],
        tuneUpRaceWeeks: [{ week: 9, distance: 'half' }],
    },
    marathon_advanced_2: {
        tier: 'marathon_advanced_2',
        distance: 'marathon',
        durationWeeks: 18,
        runDays: 6,
        crossTrainDays: 0,
        restDays: 1,
        twentyMilers: 3,
        twentyMilerWeeks: [11, 13, 15],
        peakLongRunMiles: 20,
        longRunDay: 'sunday',
        hasWeekendBackToBack: true,
        hasThreeOneLongRun: true,
        qualitySessions: ['tue_speedwork', 'thu_speedwork', 'sat_race_pace'],
        tuneUpRaceWeeks: [{ week: 9, distance: 'half' }],
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

// =============================================================================
// PFITZINGER FASTER ROAD RACING (Oracle Research)
// =============================================================================

/**
 * Pfitzinger "Faster Road Racing" tiers for 5K, 10K, and Half Marathon.
 * Source: "Faster Road Racing: 5K to Half Marathon" (2014)
 */
export type PfitzFRRTier =
    // 5K (3 tiers by mileage)
    | 'pfitz_frr_5k_sch1'  // 30-40 mpw
    | 'pfitz_frr_5k_sch2'  // 45-55 mpw
    | 'pfitz_frr_5k_sch3'  // 60-70 mpw
    // 10K (3 tiers by mileage)
    | 'pfitz_frr_10k_sch1' // 30-42 mpw
    | 'pfitz_frr_10k_sch2' // 45-57 mpw
    | 'pfitz_frr_10k_sch3' // 60-70 mpw
    // Half Marathon (4 tiers by mileage)
    | 'pfitz_frr_hm_sch1'  // 31-47 mpw
    | 'pfitz_frr_hm_sch2'  // 46-63 mpw
    | 'pfitz_frr_hm_sch3'  // 61-84 mpw
    | 'pfitz_frr_hm_sch4'; // 81-100 mpw

export type PfitzFRRDistance = '5k' | '10k' | 'half';

export interface PfitzFRRTierConfig {
    tier: PfitzFRRTier;
    distance: PfitzFRRDistance;
    durationWeeks: 12; // All FRR plans are 12 weeks
    runDays: 5 | 6;
    startMileage: number;
    peakMileage: number;
    maxLongRun: number;
    hasDoubles: boolean;
    tuneUpRaceWeeks: number[];
    // Workout weeks
    ltWeeks: number[];
    vo2maxWeeks: number[];
    speedWeeks?: number[];
    // Half-marathon specific
    mlrDistanceRange?: [number, number];
    progressionRunWeeks?: number[];
    // Phase breakdown
    phases: {
        base: number[]; // Week numbers
        build: number[];
        peak: number[];
        taper: number[];
    };
}

// =============================================================================
// DANIELS RUNNING FORMULA (Oracle Research)
// =============================================================================

/**
 * Daniels Running Formula tiers.
 * Source: "Daniels' Running Formula" (3rd/4th Ed)
 */
export type DanielsTier =
    // 5K/10K (24-week 4-phase plans)
    | 'daniels_5k_24wk'
    | 'daniels_10k_24wk'
    // Marathon 2Q (18-week plans by mileage)
    | 'daniels_2q_marathon_40'  // 40 mpw peak
    | 'daniels_2q_marathon_55'  // 55 mpw peak
    | 'daniels_2q_marathon_70'  // 70 mpw peak
    | 'daniels_2q_marathon_85'; // 85 mpw peak

/**
 * Daniels 4-phase periodization (for 5K/10K plans)
 */
export type DanielsPhase = 'base' | 'repetition' | 'interval' | 'competition';

/**
 * Daniels VDOT-based intensity zones
 */
export type DanielsIntensity = 'E' | 'M' | 'T' | 'I' | 'R';

export interface DanielsTierConfig {
    tier: DanielsTier;
    distance: '5k' | '10k' | 'marathon';
    durationWeeks: 18 | 24;
    qualityDaysPerWeek: 2 | 3;
    peakMileage: number;
    structure: '4phase' | '2q';
    phases: {
        base: number[];
        repetition?: number[];   // Phase II for 4-phase
        interval?: number[];     // Phase III for 4-phase
        build?: number[];        // For 2Q marathon
        competition?: number[];  // Phase IV for 4-phase
        peak?: number[];         // For 2Q marathon
        taper: number[];
    };
}

/**
 * Daniels workout segment (parsed from notation like "2E + 3×2T + 2E")
 */
export interface DanielsWorkoutSegment {
    distance: number;      // miles
    intensity: DanielsIntensity;
    reps?: number;         // For intervals: 3×2T means 3 reps
    recoveryMinutes?: number;
}

/**
 * Complete Daniels workout definition
 */
export interface DanielsWorkout {
    description: string;   // Original notation: "2E + 3×2T + 2E"
    totalMiles: number;
    qualityMiles: number;  // Non-E miles
    segments: DanielsWorkoutSegment[];
}
