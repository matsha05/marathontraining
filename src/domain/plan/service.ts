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
import { calculateAgeFromDob } from '@/domain/onboarding/utils';
import { normalizeDayName } from '@/domain/shared/day-utils';
import { PlanGenerationInput, TrainingPlan, TrainingPhase, WeekPlan } from '@/domain/plan/types';
import { generatePlan, calculateWeeksToRace, getDateForDay, getWeekStartDate, parseDateOnly, verifyPlan } from '@/domain/plan/generator';
import { PHASE_DEFINITIONS } from '@/domain/plan/phases';
import { toDateKey } from '@/lib/dates';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase';

/**
 * Calculate age from date of birth string.
 * Alias for consistency with existing naming.
 */
function calculateAgeFromDateOfBirth(dob: string): number {
    return calculateAgeFromDob(dob);
}

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
    const normalizedAge = data.age ?? (data.dateOfBirth ? calculateAgeFromDateOfBirth(data.dateOfBirth) : null);
    const normalizedData: OnboardingData = {
        ...data,
        age: normalizedAge,
    };

    // Validate required fields
    const validation = validateOnboardingData(normalizedData);
    if (!validation.valid) {
        return {
            success: false,
            error: {
                code: 'INVALID_ONBOARDING_DATA',
                message: `Missing required fields: ${validation.missingFields.join(', ')}`,
                details: { missingFields: validation.missingFields },
            },
        };
    }

    // Transform with type coercion (validation already passed)
    // Calculate age from DOB if available, otherwise use stored age
    const age = normalizedData.dateOfBirth
        ? calculateAgeFromDateOfBirth(normalizedData.dateOfBirth)
        : normalizedData.age!;

    // Get long run day - prefer new array format, fallback to old string
    const longRunDay = normalizeDayName(normalizedData.longRunDays?.[0] || normalizedData.longRunDay || 'saturday');

    const input: PlanGenerationInput = {
        // Identity
        name: normalizedData.name,
        age,
        sex: normalizedData.sex!,

        // VDOT
        vdot: normalizedData.vdot!,
        vdotConfidence: normalizedData.vdotConfidence!,

        // Goal
        goalDistance: normalizedData.trainingGoal!,
        raceName: normalizedData.raceName || undefined,
        raceDate: normalizedData.raceDate || undefined,
        planStartDate: normalizedData.planStartDate || undefined,
        fitnessDuration: normalizedData.fitnessDuration || undefined,

        // Training load
        weeklyMiles: normalizedData.weeklyMiles!,
        runsPerWeek: normalizedData.runsPerWeek!,
        longestRecentRun: normalizedData.longestRecentRun!,

        // Schedule
        availableDays: clampAvailableDays(normalizedData.availableDays!),
        longRunDay,

        // Safety
        currentPain: normalizedData.hasCurrentPain ?? false,
        painLocation: normalizedData.painLocation || undefined,
        recentInjury: normalizedData.hasRecentInjury ?? false,
        injuryLocation: normalizedData.injuryLocation || undefined,

        // Preferences
        trainingIntensity: normalizedData.trainingIntensity!,
        includeStrength: normalizedData.includeStrength ?? true,
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
import { PfitzFRRTier, DanielsTier, HigdonTier } from '@/domain/plan/types';
import { HansonsTier } from '@/domain/plan/coaches/hansons';
import { PfitzTier } from '@/domain/plan/coaches/pfitzinger';
import { buildHigdonBridge } from '@/domain/plan/higdon-bridge';

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

function resequenceWeeks(weeks: WeekPlan[], raceDate?: string): WeekPlan[] {
    const totalWeeks = weeks.length;
    return weeks.map((week, index) => {
        const weekNumber = index + 1;
        const weekOf = raceDate ? getWeekStartDate(weekNumber, raceDate, totalWeeks) : week.weekOf;
        const days = week.days.map(day => ({
            ...day,
            date: raceDate ? getDateForDay(weekNumber, day.dayOfWeek, raceDate, totalWeeks) : day.date,
        }));

        return { ...week, weekNumber, weekOf, days };
    });
}

function applyPhaseWeekNumbers(weeks: WeekPlan[]): WeekPlan[] {
    let currentPhase: TrainingPhase | null = null;
    let phaseWeek = 0;

    return weeks.map(week => {
        if (week.phase !== currentPhase) {
            currentPhase = week.phase;
            phaseWeek = 1;
        } else {
            phaseWeek += 1;
        }
        return { ...week, phaseWeek };
    });
}

function buildPhaseBreakdownFromWeeks(weeks: WeekPlan[]): TrainingPlan['phases'] {
    const phases: TrainingPlan['phases'] = [];
    let currentPhase: TrainingPhase | null = null;
    let startWeek = 1;

    weeks.forEach((week, index) => {
        if (week.phase !== currentPhase) {
            if (currentPhase !== null) {
                const endWeek = weeks[index - 1].weekNumber;
                phases.push({
                    phase: currentPhase,
                    startWeek,
                    endWeek,
                    weeks: endWeek - startWeek + 1,
                });
            }
            currentPhase = week.phase;
            startWeek = week.weekNumber;
        }

        if (index === weeks.length - 1 && currentPhase) {
            phases.push({
                phase: currentPhase,
                startWeek,
                endWeek: week.weekNumber,
                weeks: week.weekNumber - startWeek + 1,
            });
        }
    });

    return phases;
}

function derivePlanMetrics(weeks: WeekPlan[]): Pick<TrainingPlan, 'peakMileage' | 'peakWeek' | 'totalMiles'> {
    let peakMileage = 0;
    let peakWeek = 1;
    let totalMiles = 0;

    weeks.forEach(week => {
        totalMiles += week.totalMiles;
        if (week.totalMiles >= peakMileage) {
            peakMileage = week.totalMiles;
            peakWeek = week.weekNumber;
        }
    });

    return { peakMileage, peakWeek, totalMiles };
}

function extendPlanWithPreWeeks(
    racePlan: TrainingPlan,
    preWeeks: WeekPlan[],
    raceDate?: string
): TrainingPlan {
    if (preWeeks.length === 0) return racePlan;

    const combinedWeeks = resequenceWeeks([...preWeeks, ...racePlan.weeks], raceDate);
    const weeksWithPhaseWeek = applyPhaseWeekNumbers(combinedWeeks);
    const phases = buildPhaseBreakdownFromWeeks(weeksWithPhaseWeek);
    const metrics = derivePlanMetrics(weeksWithPhaseWeek);

    return {
        ...racePlan,
        weeks: weeksWithPhaseWeek,
        totalWeeks: weeksWithPhaseWeek.length,
        phases,
        peakMileage: metrics.peakMileage,
        peakWeek: metrics.peakWeek,
        totalMiles: metrics.totalMiles,
    };
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
    const tierDistance = inputResult.data.goalDistance === 'general'
        ? 'base'
        : inputResult.data.goalDistance;
    const tierInput: TierSelectionInput = {
        philosophy: philosophy as 'higdon' | 'hansons' | 'pfitzinger' | 'daniels',
        distance: tierDistance as 'base' | '5k' | '10k' | 'half' | 'marathon',
        experience: mapExperience(onboardingData),
        currentMileage: mapCurrentMileage(onboardingData),
        daysPerWeek: inputResult.data.availableDays,
        weeksAvailable: onboardingData.trainingGoal === 'general' ? 12 : undefined,
    };

    const tierResult = selectPlanTier(tierInput);

    if (tierResult.warnings.length > 0) {
        console.warn('[PlanService] Tier selection warnings:', tierResult.warnings);
    }

    // Step 3: Generate using coach-specific generator
    try {
        let plan: TrainingPlan;
        let extendedWithBase = false;
        let extendedWithMaintenance = false;
        let partialBase = false;
        let baseWeeksApplied = 0;
        let baseStartWeek = 0;
        let maintenanceWeeksApplied = 0;
        let planExtended = false;

        // Route based on tier prefix
        if (tierResult.tier.startsWith('pfitz_frr_')) {
            plan = generateCoachPlan(inputResult.data, tierResult.tier as PfitzFRRTier);
        } else if (tierResult.tier.startsWith('daniels_')) {
            plan = generateCoachPlan(inputResult.data, tierResult.tier as DanielsTier);
        } else if (tierResult.tier.startsWith('hansons_')) {
            // Hansons tiers - use coach-specific generator with proper long run progression
            plan = generateCoachPlan(inputResult.data, tierResult.tier as HansonsTier);
        } else if (tierResult.tier.startsWith('pfitz_12_') || tierResult.tier.startsWith('pfitz_18_')) {
            // Pfitzinger Advanced Marathoning tiers
            plan = generateCoachPlan(inputResult.data, tierResult.tier as PfitzTier);
        } else if (
            tierResult.tier.startsWith('base_') ||
            tierResult.tier.startsWith('5k_') ||
            tierResult.tier.startsWith('10k_') ||
            tierResult.tier.startsWith('half_') ||
            tierResult.tier.startsWith('marathon_')
        ) {
            // Higdon tiers - use coach-specific generator with proper long run progression
            plan = generateCoachPlan(inputResult.data, tierResult.tier as HigdonTier);
        } else {
            // Fallback for any unrecognized tiers
            console.warn('[PlanService] Using generic generator for tier:', tierResult.tier);
            plan = generatePlan(inputResult.data);
        }

        const weeksToRace = inputResult.data.raceDate
            ? calculateWeeksToRace(inputResult.data.raceDate)
            : null;

        if (
            philosophy === 'higdon' &&
            inputResult.data.raceDate &&
            !tierResult.tier.startsWith('base_') &&
            weeksToRace !== null
        ) {
            const baseTierResult = selectPlanTier({ ...tierInput, distance: 'base' });
            const baseTier = baseTierResult.tier as HigdonTier;
            const gapWeeks = weeksToRace - plan.totalWeeks;

            if (gapWeeks > 0) {
                const basePlan = generateCoachPlan(inputResult.data, baseTier);
                const bridge = buildHigdonBridge({
                    input: inputResult.data,
                    racePlan: plan,
                    basePlan,
                    baseTier,
                    gapWeeks,
                    totalWeeks: weeksToRace,
                });

                if (bridge.preWeeks.length > 0) {
                    plan = extendPlanWithPreWeeks(plan, bridge.preWeeks, inputResult.data.raceDate);
                    planExtended = true;
                }

                baseWeeksApplied = bridge.baseWeeksApplied;
                baseStartWeek = bridge.baseStartWeek;
                maintenanceWeeksApplied = bridge.maintenanceWeeksApplied;
                extendedWithBase = baseWeeksApplied > 0;
                extendedWithMaintenance = maintenanceWeeksApplied > 0;
                partialBase = bridge.partialBase;
            }
        }

        // Step 4: Add philosophy metadata (for display)
        plan.philosophy = philosophy as TrainingPlan['philosophy'];
        const baseRangeLabel = baseStartWeek > 0 && baseWeeksApplied > 0
            ? `Base Weeks ${baseStartWeek}-${baseStartWeek + baseWeeksApplied - 1}`
            : 'Base';

        if (extendedWithMaintenance && extendedWithBase) {
            const baseLabel = partialBase ? baseRangeLabel : 'Base';
            plan.planTier = `${tierResult.displayName} + ${baseLabel} + Maintenance (not Higdon)`;
        } else if (extendedWithMaintenance) {
            plan.planTier = `${tierResult.displayName} + Maintenance (not Higdon)`;
        } else if (extendedWithBase && partialBase) {
            plan.planTier = `${tierResult.displayName} + ${baseRangeLabel} (partial)`;
        } else if (extendedWithBase) {
            plan.planTier = `${tierResult.displayName} + Base`;
        } else {
            plan.planTier = tierResult.displayName;
        }

        if (planExtended) {
            const phases = plan.phases.map(phase => ({
                ...phase,
                config: {
                    phase: phase.phase,
                    weeks: phase.weeks,
                    ...PHASE_DEFINITIONS[phase.phase],
                },
            }));
            const baseVerification = verifyPlan(plan.weeks, phases);
            const existingChecks = plan.verification?.checks ?? [];
            plan.verification = {
                passed: baseVerification.passed && (plan.verification?.passed ?? true),
                checks: [...existingChecks, ...baseVerification.checks],
            };
        }

        // Step 5: Validate plan
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

async function resolveAthleteId(athleteId?: string | null): Promise<string | null> {
    if (athleteId) {
        return athleteId;
    }

    try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id ?? null;
    } catch (error) {
        console.warn('[PlanService] Failed to resolve athlete id:', error);
        return null;
    }
}

async function persistAthleteProfileAndGoalRace(
    onboardingData: OnboardingData,
    athleteId?: string | null
): Promise<void> {
    const resolvedAthleteId = await resolveAthleteId(athleteId);
    if (!resolvedAthleteId) {
        return;
    }

    const supabase = createSupabaseBrowserClient();
    const normalizedName = onboardingData.name.trim() || 'Athlete';
    const computedAge = onboardingData.dateOfBirth
        ? calculateAgeFromDateOfBirth(onboardingData.dateOfBirth)
        : onboardingData.age;

    await supabase.from('athletes').upsert({
        id: resolvedAthleteId,
        name: normalizedName,
        age: computedAge ?? null,
        sex: onboardingData.sex || null,
        avatar: onboardingData.avatar || 'marathon',
        ...(onboardingData.dateOfBirth ? { date_of_birth: onboardingData.dateOfBirth } : {}),
    }, { onConflict: 'id' });

    if (!onboardingData.raceDate) {
        return;
    }

    await supabase.from('goal_races').upsert({
        id: crypto.randomUUID(),
        athlete_id: resolvedAthleteId,
        race_name: onboardingData.raceName || `${onboardingData.trainingGoal?.toUpperCase() || 'Marathon'} Race`,
        race_date: onboardingData.raceDate,
        distance: onboardingData.trainingGoal || 'marathon',
        is_active: true,
        terrain: 'road',
    }, { onConflict: 'id' });
}

function toStorageError(message: string, details?: Record<string, unknown>): PlanServiceError {
    return {
        code: 'STORAGE_ERROR',
        message,
        details,
    };
}

export async function generateAndPersistPlanFromOnboarding(
    onboardingData: OnboardingData,
    athleteId?: string | null
): Promise<ServiceResult<TrainingPlan>> {
    const generationResult = createPlanFromOnboarding(onboardingData);
    if (!generationResult.success) {
        return generationResult;
    }

    try {
        await persistAthleteProfileAndGoalRace(onboardingData, athleteId);
    } catch (error) {
        console.warn('[PlanService] Failed to persist athlete profile or goal race:', error);
    }

    const saveResult = await savePlanV2(generationResult.data, athleteId);
    if (!saveResult.success) {
        return {
            success: false,
            error: toStorageError(
                saveResult.error.message || 'Failed to save your plan. Please try again.',
                { athleteId, cause: saveResult.error }
            ),
        };
    }

    return generationResult;
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
    const planStart = plan.weeks[0]?.weekOf;
    if (planStart) {
        const startDate = parseDateOnly(planStart);
        if (startDate) {
            const today = new Date();
            const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
            if (todayUtc < startDate) return 0;
        }
    }

    if (!plan.raceDate) return 1;

    const weeksToRace = calculateWeeksToRace(plan.raceDate);

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

// =============================================================================
// PLAN EXPORT (USER BACKUP)
// =============================================================================

export interface PlanExport {
    version: '1.0';
    exportedAt: string;
    plan: TrainingPlan;
    metadata: {
        goalDistance: string;
        totalWeeks: number;
        vdot: number;
        intensityLevel: 'conservative' | 'moderate' | 'aggressive';
    };
}

/**
 * Export the current plan as a JSON object suitable for download.
 * This allows users to backup their training plan.
 */
export async function exportPlanToJSON(): Promise<ServiceResult<PlanExport>> {
    const planResult = await loadPlanV2();

    if (!planResult.success) {
        return {
            success: false,
            error: {
                code: 'PLAN_NOT_FOUND',
                message: 'No training plan found to export',
            },
        };
    }

    if (!planResult.data) {
        return {
            success: false,
            error: {
                code: 'PLAN_NOT_FOUND',
                message: 'No training plan found to export',
            },
        };
    }

    const plan = planResult.data;

    const exportData: PlanExport = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        plan,
        metadata: {
            goalDistance: plan.goalDistance,
            totalWeeks: plan.weeks.length,
            vdot: plan.vdot,
            intensityLevel: plan.intensityLevel,
        },
    };

    return { success: true, data: exportData };
}

/**
 * Download plan as a JSON file (browser only).
 */
export async function downloadPlanAsJSON(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const result = await exportPlanToJSON();
    if (!result.success) {
        console.error('[PlanExport] Export failed:', result.error);
        return false;
    }

    try {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `the-long-game-plan-${toDateKey(new Date())}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('[PlanExport] Download failed:', error);
        return false;
    }
}
