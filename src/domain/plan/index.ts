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
