/**
 * THE LONG GAME - Plan Service Layer
 * 
 * Clean architecture for plan management:
 * - Type-safe transformation from onboarding → plan generation
 * - CRUD operations for plan persistence
 * - Error handling and validation
 * 
 * This is the bridge between the onboarding UI and the plan generation engine.
 */

import { OnboardingData } from '@/domain/onboarding/types';
import { PlanGenerationInput, TrainingPlan } from '@/domain/plan/types';
import { generatePlan } from '@/domain/plan/generator';

// =============================================================================
// STORAGE KEYS
// =============================================================================

const STORAGE_KEYS = {
    CURRENT_PLAN: 'long-game-plan',
    PLAN_HISTORY: 'long-game-plan-history',
} as const;

// =============================================================================
// SERVICE RESULT TYPES
// =============================================================================

/**
 * Discriminated union for service operation results.
 * Forces explicit error handling at call sites.
 */
export type ServiceResult<T> =
    | { success: true; data: T }
    | { success: false; error: PlanServiceError };

export interface PlanServiceError {
    code: PlanErrorCode;
    message: string;
    details?: Record<string, unknown>;
}

export type PlanErrorCode =
    | 'INVALID_ONBOARDING_DATA'
    | 'GENERATION_FAILED'
    | 'STORAGE_ERROR'
    | 'PLAN_NOT_FOUND'
    | 'VALIDATION_FAILED';

// =============================================================================
// ONBOARDING → PLAN INPUT TRANSFORMER
// =============================================================================

/**
 * Transform OnboardingData to PlanGenerationInput with validation.
 * Returns errors if required fields are missing.
 */
export function transformOnboardingToPlanInput(
    data: OnboardingData
): ServiceResult<PlanGenerationInput> {
    // Validate required fields
    const validation = validateOnboardingData(data);
    if (!validation.valid) {
        return {
            success: false,
            error: {
                code: 'INVALID_ONBOARDING_DATA',
                message: 'Missing required onboarding fields',
                details: { missingFields: validation.missingFields },
            },
        };
    }

    // Transform with type coercion (validation already passed)
    const input: PlanGenerationInput = {
        // Identity
        name: data.name,
        age: data.age!,
        sex: data.sex!,

        // VDOT
        vdot: data.vdot!,
        vdotConfidence: data.vdotConfidence!,

        // Goal
        goalDistance: data.trainingGoal!,
        raceName: data.raceName || undefined,
        raceDate: data.raceDate || undefined,
        fitnessDuration: data.fitnessDuration || undefined,

        // Training load
        weeklyMiles: data.weeklyMiles!,
        runsPerWeek: data.runsPerWeek!,
        longestRecentRun: data.longestRecentRun!,

        // Schedule
        availableDays: clampAvailableDays(data.availableDays!),
        longRunDay: data.longRunDay || 'saturday',

        // Safety
        currentPain: data.hasCurrentPain ?? false,
        painLocation: data.painLocation || undefined,
        recentInjury: data.hasRecentInjury ?? false,
        injuryLocation: data.injuryLocation || undefined,

        // Preferences
        trainingIntensity: data.trainingIntensity!,
        includeStrength: data.includeStrength ?? true,
    };

    return { success: true, data: input };
}

/**
 * Clamp availableDays to valid range (3-6)
 */
function clampAvailableDays(days: number): 3 | 4 | 5 | 6 {
    if (days <= 3) return 3;
    if (days >= 6) return 6;
    return days as 4 | 5;
}

/**
 * Validate that all required fields are present in onboarding data.
 */
function validateOnboardingData(data: OnboardingData): {
    valid: boolean;
    missingFields: string[];
} {
    const requiredFields: (keyof OnboardingData)[] = [
        'name',
        'age',
        'sex',
        'vdot',
        'trainingGoal',
        'weeklyMiles',
        'runsPerWeek',
        'longestRecentRun',
        'availableDays',
        'trainingIntensity',
    ];

    const missingFields: string[] = [];

    for (const field of requiredFields) {
        const value = data[field];
        if (value === null || value === undefined || value === '') {
            missingFields.push(field);
        }
    }

    return {
        valid: missingFields.length === 0,
        missingFields,
    };
}

// =============================================================================
// PLAN GENERATION SERVICE
// =============================================================================

/**
 * Generate a training plan from onboarding data.
 * Handles transformation, generation, and error wrapping.
 */
export function createPlanFromOnboarding(
    onboardingData: OnboardingData
): ServiceResult<TrainingPlan> {
    // Step 1: Transform
    const inputResult = transformOnboardingToPlanInput(onboardingData);
    if (!inputResult.success) {
        return inputResult;
    }

    // Step 2: Generate
    try {
        const plan = generatePlan(inputResult.data);

        // Step 3: Validate plan
        if (!plan.verification.passed) {
            console.warn('Plan verification warnings:', plan.verification.checks);
            // Still return the plan, but log warnings
        }

        return { success: true, data: plan };
    } catch (error) {
        return {
            success: false,
            error: {
                code: 'GENERATION_FAILED',
                message: error instanceof Error ? error.message : 'Unknown generation error',
                details: { error },
            },
        };
    }
}

// =============================================================================
// PLAN PERSISTENCE
// =============================================================================

/**
 * Save the current training plan to localStorage.
 */
export function savePlan(plan: TrainingPlan): ServiceResult<void> {
    if (typeof window === 'undefined') {
        return {
            success: false,
            error: { code: 'STORAGE_ERROR', message: 'Cannot access storage on server' },
        };
    }

    try {
        const stored = {
            plan,
            savedAt: new Date().toISOString(),
            version: 1,
        };
        localStorage.setItem(STORAGE_KEYS.CURRENT_PLAN, JSON.stringify(stored));
        return { success: true, data: undefined };
    } catch (error) {
        return {
            success: false,
            error: {
                code: 'STORAGE_ERROR',
                message: 'Failed to save plan',
                details: { error },
            },
        };
    }
}

/**
 * Load the current training plan from localStorage.
 */
export function loadPlan(): ServiceResult<TrainingPlan> {
    if (typeof window === 'undefined') {
        return {
            success: false,
            error: { code: 'STORAGE_ERROR', message: 'Cannot access storage on server' },
        };
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAN);
        if (!stored) {
            return {
                success: false,
                error: { code: 'PLAN_NOT_FOUND', message: 'No plan found in storage' },
            };
        }

        const parsed = JSON.parse(stored);
        return { success: true, data: parsed.plan as TrainingPlan };
    } catch (error) {
        return {
            success: false,
            error: {
                code: 'STORAGE_ERROR',
                message: 'Failed to load plan',
                details: { error },
            },
        };
    }
}

/**
 * Clear the current plan from storage.
 */
export function clearPlan(): ServiceResult<void> {
    if (typeof window === 'undefined') {
        return {
            success: false,
            error: { code: 'STORAGE_ERROR', message: 'Cannot access storage on server' },
        };
    }

    try {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_PLAN);
        return { success: true, data: undefined };
    } catch (error) {
        return {
            success: false,
            error: {
                code: 'STORAGE_ERROR',
                message: 'Failed to clear plan',
                details: { error },
            },
        };
    }
}

/**
 * Check if a plan exists in storage.
 */
export function hasPlan(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.CURRENT_PLAN) !== null;
}

// =============================================================================
// PLAN QUERY HELPERS
// =============================================================================

/**
 * Get the current week from a training plan.
 */
export function getCurrentWeek(plan: TrainingPlan): number {
    if (!plan.raceDate) return 1;

    const today = new Date();
    const raceDate = new Date(plan.raceDate);
    const diffTime = raceDate.getTime() - today.getTime();
    const weeksToRace = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

    // Work backward from race date
    const currentWeek = plan.totalWeeks - weeksToRace + 1;
    return Math.max(1, Math.min(currentWeek, plan.totalWeeks));
}

/**
 * Get today's workout from a plan.
 */
export function getTodaysWorkout(plan: TrainingPlan): {
    week: number;
    day: number;
    workout: TrainingPlan['weeks'][0]['days'][0] | null;
} {
    const currentWeekNum = getCurrentWeek(plan);
    const week = plan.weeks[currentWeekNum - 1];

    if (!week) {
        return { week: currentWeekNum, day: 0, workout: null };
    }

    const today = new Date().getDay(); // 0 = Sunday
    const todayWorkout = week.days.find(d => d.dayOfWeek === today);

    return {
        week: currentWeekNum,
        day: today,
        workout: todayWorkout || null,
    };
}

/**
 * Get upcoming key workouts.
 */
export function getUpcomingKeyWorkouts(
    plan: TrainingPlan,
    count: number = 3
): Array<{
    weekNumber: number;
    date: string;
    workout: TrainingPlan['weeks'][0]['days'][0];
}> {
    const currentWeekNum = getCurrentWeek(plan);
    const today = new Date();
    const upcoming: Array<{
        weekNumber: number;
        date: string;
        workout: TrainingPlan['weeks'][0]['days'][0];
    }> = [];

    for (let w = currentWeekNum - 1; w < plan.weeks.length && upcoming.length < count; w++) {
        const week = plan.weeks[w];
        if (!week) continue;

        for (const day of week.days) {
            if (!day.isKeyDay || !day.runWorkout) continue;

            // Check if this is in the future
            const dayDate = new Date(day.date);
            if (dayDate < today) continue;

            upcoming.push({
                weekNumber: week.weekNumber,
                date: day.date,
                workout: day,
            });

            if (upcoming.length >= count) break;
        }
    }

    return upcoming;
}
