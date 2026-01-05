/**
 * THE LONG GAME - Plan Service Layer
 *
 * Clean architecture for plan management:
 * - Type-safe transformation from onboarding → plan generation
 * - CRUD operations for plan persistence (now via Supabase)
 * - Error handling and validation
 *
 * This is the bridge between the onboarding UI and the plan generation engine.
 *
 * V2 MIGRATION:
 * - savePlan/loadPlan now use Supabase with localStorage cache
 * - Old localStorage-only functions deprecated but kept for migration
 */

import { OnboardingData } from '@/domain/onboarding/types';
import { PlanGenerationInput, TrainingPlan } from '@/domain/plan/types';
import { generatePlan } from '@/domain/plan/generator';

// V2 Repository - Supabase + localStorage hybrid
import {
    savePlanV2,
    loadPlanV2,
    hasPlanV2,
    clearPlanV2,
    getTodaysWorkoutV2,
    getWorkoutById,
    getWeekWorkouts,
} from './repository';

// Re-export V2 functions as primary API
export {
    savePlanV2 as savePlan,
    loadPlanV2 as loadPlan,
    hasPlanV2 as hasPlan,
    clearPlanV2 as clearPlan,
    getTodaysWorkoutV2 as getTodaysWorkout,
    getWorkoutById,
    getWeekWorkouts,
};

// Legacy exports (deprecated but kept for compatibility)
export { savePlanV2, loadPlanV2, hasPlanV2, clearPlanV2 };

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

import { selectPlanTier, TierSelectionInput } from '@/domain/philosophy/tier-selector';
import { generateCoachPlan } from '@/domain/plan/coach-generators';
import { PfitzFRRTier, DanielsTier } from '@/domain/plan/types';

/**
 * Map OnboardingData experience/mileage to tier-selector format
 */
function mapExperience(data: OnboardingData): 'beginner' | 'intermediate' | 'advanced' {
    // Use trainingIntensity as proxy for experience if experienceLevel not set
    if (data.trainingIntensity === 'aggressive') return 'advanced';
    if (data.trainingIntensity === 'conservative') return 'beginner';
    return 'intermediate';
}

function mapCurrentMileage(data: OnboardingData): 'under_20' | '20_40' | 'over_40' {
    const mileage = data.weeklyMiles ?? 20;
    if (mileage >= 40) return 'over_40';
    if (mileage >= 20) return '20_40';
    return 'under_20';
}

/**
 * Generate a training plan from onboarding data.
 * 
 * ROUTING LOGIC (Jan 2026):
 * 1. Use tier-selector to get specific plan tier
 * 2. Route to coach-specific generator:
 *    - Pfitz FRR tiers → generateFRRPlan
 *    - Daniels tiers → generateDanielsPlan
 *    - Other tiers → generic generator (fallback for now)
 */
export function createPlanFromOnboarding(
    onboardingData: OnboardingData
): ServiceResult<TrainingPlan> {
    // Step 1: Transform
    const inputResult = transformOnboardingToPlanInput(onboardingData);
    if (!inputResult.success) {
        return inputResult;
    }

    // Step 2: Select tier based on philosophy + profile
    const philosophy = onboardingData.trainingPhilosophy ?? 'higdon';
    const tierInput: TierSelectionInput = {
        philosophy: philosophy as 'higdon' | 'hansons' | 'pfitzinger' | 'daniels',
        distance: inputResult.data.goalDistance as 'base' | '5k' | '10k' | 'half' | 'marathon' | 'ultra',
        experience: mapExperience(onboardingData),
        currentMileage: mapCurrentMileage(onboardingData),
        daysPerWeek: inputResult.data.availableDays,
        weeksAvailable: onboardingData.trainingGoal === 'general' ? 12 : undefined,
    };

    const tierResult = selectPlanTier(tierInput);
    console.log('[PlanService] Selected tier:', tierResult.tier, 'for philosophy:', philosophy);

    if (tierResult.warnings.length > 0) {
        console.warn('[PlanService] Tier selection warnings:', tierResult.warnings);
    }

    // Step 3: Generate using coach-specific generator
    try {
        let plan: TrainingPlan;

        // Route based on tier prefix
        if (tierResult.tier.startsWith('pfitz_frr_')) {
            plan = generateCoachPlan(inputResult.data, tierResult.tier as PfitzFRRTier);
        } else if (tierResult.tier.startsWith('daniels_')) {
            plan = generateCoachPlan(inputResult.data, tierResult.tier as DanielsTier);
        } else {
            // Use generic generator for Higdon/Hansons (for now)
            // TODO: Add Higdon/Hansons-specific generators
            plan = generatePlan(inputResult.data);
        }

        // Step 4: Validate plan
        if (!plan.verification.passed) {
            console.warn('Plan verification warnings:', plan.verification.checks);
        }

        return { success: true, data: plan };
    } catch (error) {
        return {
            success: false,
            error: {
                code: 'GENERATION_FAILED',
                message: error instanceof Error ? error.message : 'Unknown generation error',
                details: { error, tier: tierResult.tier },
            },
        };
    }
}

// NOTE: Legacy localStorage-only functions removed in cleanup.
// All persistence now handled by repository.ts (Supabase + localStorage hybrid).

// =============================================================================
// PLAN QUERY HELPERS (still used - not deprecated)
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
 * Get today's workout from a local plan object.
 * For fetching from Supabase, use getTodaysWorkout (re-exported from repository).
 */
export function getTodaysWorkoutFromPlan(plan: TrainingPlan): {
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
