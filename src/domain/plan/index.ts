/**
 * THE LONG GAME - Plan Generation Engine
 * 
 * Main export file for the plan generation module.
 * This is coach-backed, research-driven programming.
 */

// Core types
export * from './types';

// Phase calculation (Pfitzinger)
export * from './phases';

// Mileage progression (10% rule, 80/20)
export * from './mileage';

// Main generator
export { generatePlan, calculateWeeksToRace, getWeekFocus } from './generator';

// Service layer (transformation, CRUD, queries)
export * from './service';

// React Context (state management)
export { PlanProvider, usePlan, useUpcomingWorkouts, useIsRestDay } from './context';
export type { PlanState, PlanActions, PlanContextValue, PlanStatus } from './context';

// Workout templates
export {
    EASY_TEMPLATES,
    TEMPO_TEMPLATES,
    INTERVAL_TEMPLATES,
    LONG_RUN_TEMPLATES,
    HILL_TEMPLATES,
    ALL_WORKOUT_TEMPLATES,
    getTemplatesForPhase,
    getTemplate,
    buildWorkout,
} from './workouts/templates';

// =============================================================================
// NEW: Coach-Specific Modules (Oracle Research Integration)
// =============================================================================

// Hal Higdon tier system
export {
    HIGDON_MICROCYCLES,
    isHigdonStepbackWeek,
    getStepbackReduction,
    generateHigdonLongRunProgression,
    getHigdonPhase,
    shouldUseThreeOneLongRun,
    buildThreeOneLongRun,
    getHigdonTierConfig,
    getMicrocycleForTier,
} from './coaches/higdon';

// Movement interference matrix
export {
    GREEN_MOVEMENTS,
    YELLOW_MOVEMENTS,
    RED_MOVEMENTS,
    ALL_MOVEMENTS,
    canScheduleBeforeLongRun,
    canScheduleBeforeQualityRun,
    getMovementsForPhase,
} from './interference-matrix';

// NOTE: Ultra training engine removed (Jan 2026) - ultra distance no longer supported

// Strength training engine
export {
    getStrengthPhaseConfig,
    RUNNER_EXERCISES,
    generateStrengthWorkout,
    getDownhillEccentricModule,
    getPoleHikingModule,
    getFootAnkleDurabilityModule,
    isStrengthTimingSafe,
} from './strength-engine';

// Enhanced verification
export {
    verifyPlanEnhanced,
    checkPolarization,
    checkLongRunCap,
    checkProgressionRate,
    checkRecoveryFrequency,
    checkSOSDistribution,
    checkHigdon20MileCap,
    checkHigdonStepbackPattern,
    checkHigdonTaper,
    checkUltraB2BFrequency,
    checkUltraDurationProgression,
} from './verification';
export type { VerificationCheck, EnhancedVerification } from './verification';
