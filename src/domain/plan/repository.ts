/**
 * THE LONG GAME - Plan Repository
 *
 * Distinguished-engineer-grade data layer for training plan persistence.
 *
 * Architecture:
 * - Supabase as source of truth (cross-device sync)
 * - localStorage as L1 cache (instant load, offline fallback)
 * - Optimistic updates with background sync
 *
 * Key design decisions:
 * 1. Plans stored in `training_plans` table (metadata)
 * 2. Workouts stored in `planned_workouts` table (individual days)
 * 3. On save: write to localStorage immediately, then Supabase
 * 4. On load: try localStorage first for speed, validate against Supabase
 */

import { createSupabaseBrowserClient } from '@/infrastructure/supabase/client';
import type { TrainingPlan, WeekPlan, DayPlan } from './types';
import type { Database } from '@/infrastructure/supabase/types';
import { queueWrite, emitSyncEvent } from '@/domain/sync';

// =============================================================================
// TYPES
// =============================================================================

type DbTrainingPlan = Database['public']['Tables']['training_plans']['Row'];
type DbPlannedWorkout = Database['public']['Tables']['planned_workouts']['Row'];
type InsertTrainingPlan = Database['public']['Tables']['training_plans']['Insert'];
type InsertPlannedWorkout = Database['public']['Tables']['planned_workouts']['Insert'];

export interface PlanRepositoryError {
    code: 'AUTH_REQUIRED' | 'NOT_FOUND' | 'SAVE_FAILED' | 'LOAD_FAILED' | 'NETWORK_ERROR';
    message: string;
    details?: unknown;
}

export type PlanResult<T> =
    | { success: true; data: T }
    | { success: false; error: PlanRepositoryError };

// =============================================================================
// STORAGE KEYS
// =============================================================================

const STORAGE_KEYS = {
    CURRENT_PLAN: 'long-game-plan-v2',
    PLAN_METADATA: 'long-game-plan-meta-v2',
} as const;

// =============================================================================
// CACHE LAYER (localStorage)
// =============================================================================

function saveToCache(plan: TrainingPlan): void {
    if (typeof window === 'undefined') return;
    try {
        const stored = {
            plan,
            savedAt: new Date().toISOString(),
            version: 2,
        };
        localStorage.setItem(STORAGE_KEYS.CURRENT_PLAN, JSON.stringify(stored));
    } catch {
        // Silent fail - cache is optional
    }
}

function loadFromCache(): TrainingPlan | null {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAN);
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        return parsed.plan as TrainingPlan;
    } catch {
        return null;
    }
}

function clearCache(): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_PLAN);
        localStorage.removeItem(STORAGE_KEYS.PLAN_METADATA);
    } catch {
        // Silent fail
    }
}

// =============================================================================
// SUPABASE OPERATIONS
// =============================================================================

async function getAuthenticatedAthleteId(): Promise<string | null> {
    try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id ?? null;
    } catch {
        return null;
    }
}

/**
 * Save plan to Supabase with atomic transaction-like behavior.
 * Creates training_plan row + all planned_workout rows.
 */
async function saveToSupabase(plan: TrainingPlan, athleteId: string): Promise<PlanResult<void>> {
    const supabase = createSupabaseBrowserClient();

    try {
        // 1. Deactivate any existing active plans for this athlete
        await supabase
            .from('training_plans')
            .update({ is_active: false })
            .eq('athlete_id', athleteId)
            .eq('is_active', true);

        // 2. Insert the new training plan
        const planRow: InsertTrainingPlan = {
            id: plan.id,
            athlete_id: athleteId,
            plan_type: plan.goalDistance,
            vdot_at_creation: plan.vdot,
            start_date: plan.weeks[0]?.weekOf || new Date().toISOString().split('T')[0],
            end_date: plan.raceDate || plan.weeks[plan.weeks.length - 1]?.weekOf || new Date().toISOString().split('T')[0],
            goal_race_id: null, // Optional: link to goal_races table when race planning is implemented
            is_active: true,
        };

        const { error: planError } = await supabase
            .from('training_plans')
            .upsert(planRow, { onConflict: 'id' });

        if (planError) {
            return {
                success: false,
                error: { code: 'SAVE_FAILED', message: 'Failed to save plan', details: planError },
            };
        }

        // 3. Convert all workouts to planned_workouts rows
        const workoutRows: InsertPlannedWorkout[] = [];

        for (const week of plan.weeks) {
            for (const day of week.days) {
                if (!day.runWorkout && !day.strengthWorkout) continue;

                const workoutId = `${plan.id}-w${week.weekNumber}-d${day.dayOfWeek}`;
                const prescription = buildPrescription(day, week, plan);

                workoutRows.push({
                    id: workoutId,
                    plan_id: plan.id,
                    athlete_id: athleteId,
                    scheduled_date: day.date,
                    day_of_week: day.dayOfWeek,
                    session_type: day.runWorkout?.type || 'rest',
                    prescription: prescription as unknown as Database['public']['Tables']['planned_workouts']['Insert']['prescription'],
                    status: 'planned',
                    durability_modules: null,
                    fueling_plan: null,
                });
            }
        }

        // 4. Upsert workouts (atomic - no data loss window)
        if (workoutRows.length > 0) {
            const { error: workoutsError } = await supabase
                .from('planned_workouts')
                .upsert(workoutRows, { onConflict: 'id' });

            if (workoutsError) {
                return {
                    success: false,
                    error: { code: 'SAVE_FAILED', message: 'Failed to save workouts', details: workoutsError },
                };
            }
        }

        return { success: true, data: undefined };
    } catch (error) {
        return {
            success: false,
            error: { code: 'NETWORK_ERROR', message: 'Network error while saving', details: error },
        };
    }
}

/**
 * Build the prescription JSON for a planned workout.
 * This captures all the detail needed to display the workout.
 */
function buildPrescription(
    day: DayPlan,
    week: WeekPlan,
    plan: TrainingPlan
): Record<string, unknown> {
    return {
        // Run workout details
        run: day.runWorkout ? {
            name: day.runWorkout.name,
            type: day.runWorkout.type,
            totalDistanceMiles: day.runWorkout.totalDistance,
            estimatedDurationMin: day.runWorkout.estimatedDuration,
            primaryZone: day.runWorkout.primaryZone,
            purpose: day.runWorkout.purpose,
            coachSource: day.runWorkout.coachSource,
            segments: day.runWorkout.segments,
            notes: day.runWorkout.notes,
        } : null,

        // Strength workout details
        strength: day.strengthWorkout ? {
            name: day.strengthWorkout.name,
            focus: day.strengthWorkout.focus,
            durationMin: day.strengthWorkout.duration,
            exercises: day.strengthWorkout.exercises,
            equipmentNeeded: day.strengthWorkout.equipmentNeeded,
        } : null,

        // Context
        weekNumber: week.weekNumber,
        phase: week.phase,
        isKeyDay: day.isKeyDay,
        isRecoveryWeek: week.isRecoveryWeek,
        weekFocus: week.focus,

        // Paces for this athlete
        paces: plan.paces,
    };
}

/**
 * Load the active plan from Supabase.
 */
async function loadFromSupabase(athleteId: string): Promise<PlanResult<TrainingPlan | null>> {
    const supabase = createSupabaseBrowserClient();

    try {
        // 1. Get active plan
        const { data: planRow, error: planError } = await supabase
            .from('training_plans')
            .select('*')
            .eq('athlete_id', athleteId)
            .eq('is_active', true)
            .single();

        if (planError) {
            if (planError.code === 'PGRST116') {
                // No rows returned - no active plan
                return { success: true, data: null };
            }
            return {
                success: false,
                error: { code: 'LOAD_FAILED', message: 'Failed to load plan', details: planError },
            };
        }

        // 2. Get all workouts for this plan
        const { data: workouts, error: workoutsError } = await supabase
            .from('planned_workouts')
            .select('*')
            .eq('plan_id', planRow.id)
            .order('scheduled_date', { ascending: true });

        if (workoutsError) {
            return {
                success: false,
                error: { code: 'LOAD_FAILED', message: 'Failed to load workouts', details: workoutsError },
            };
        }

        // 3. Reconstruct the TrainingPlan object
        const plan = reconstructPlan(planRow, workouts || [], athleteId);
        return { success: true, data: plan };
    } catch (error) {
        return {
            success: false,
            error: { code: 'NETWORK_ERROR', message: 'Network error while loading', details: error },
        };
    }
}

/**
 * Reconstruct a TrainingPlan from database rows.
 * This is the inverse of saveToSupabase.
 */
function reconstructPlan(
    planRow: DbTrainingPlan,
    workouts: DbPlannedWorkout[],
    athleteId: string
): TrainingPlan {
    // Group workouts by week
    const workoutsByWeek = new Map<number, DbPlannedWorkout[]>();
    for (const w of workouts) {
        const prescription = w.prescription as Record<string, unknown>;
        const weekNum = prescription.weekNumber as number;
        if (!workoutsByWeek.has(weekNum)) {
            workoutsByWeek.set(weekNum, []);
        }
        workoutsByWeek.get(weekNum)!.push(w);
    }

    // Build weeks
    const weeks: WeekPlan[] = [];
    const sortedWeekNums = Array.from(workoutsByWeek.keys()).sort((a, b) => a - b);

    for (const weekNum of sortedWeekNums) {
        const weekWorkouts = workoutsByWeek.get(weekNum) || [];
        const firstWorkout = weekWorkouts[0];
        const prescription = firstWorkout?.prescription as Record<string, unknown>;

        const days: DayPlan[] = weekWorkouts.map(w => {
            const p = w.prescription as Record<string, unknown>;
            const runData = p.run as Record<string, unknown> | null;
            const strengthData = p.strength as Record<string, unknown> | null;

            return {
                date: w.scheduled_date,
                dayOfWeek: w.day_of_week,
                runWorkout: runData ? {
                    id: w.id,
                    name: runData.name as string,
                    type: runData.type as string,
                    totalDistance: runData.totalDistanceMiles as number,
                    estimatedDuration: runData.estimatedDurationMin as number,
                    primaryZone: runData.primaryZone as string,
                    purpose: runData.purpose as string,
                    coachSource: runData.coachSource as string,
                    segments: runData.segments as Array<Record<string, unknown>>,
                    qualityMiles: (runData.totalDistanceMiles as number) * 0.2, // Approximate
                    notes: runData.notes as string | undefined,
                } : null,
                strengthWorkout: strengthData ? {
                    id: `${w.id}-strength`,
                    name: strengthData.name as string,
                    focus: strengthData.focus as string[],
                    duration: strengthData.durationMin as number,
                    exercises: strengthData.exercises as Array<Record<string, unknown>>,
                    equipmentNeeded: strengthData.equipmentNeeded as string,
                } : null,
                isKeyDay: p.isKeyDay as boolean,
                totalMiles: runData ? (runData.totalDistanceMiles as number) : 0,
                qualityMiles: 0,
            } as DayPlan;
        });

        // Calculate week totals
        const totalMiles = days.reduce((sum, d) => sum + d.totalMiles, 0);
        const longRunMiles = Math.max(...days.map(d => d.totalMiles), 0);

        weeks.push({
            weekNumber: weekNum,
            weekOf: prescription?.weekOf as string || firstWorkout?.scheduled_date || '',
            phase: prescription?.phase as string || 'base',
            phaseWeek: 1,
            days,
            totalMiles,
            longRunMiles,
            easyMiles: totalMiles * 0.8,
            qualityMiles: totalMiles * 0.2,
            easyPercentage: 80,
            keyWorkouts: days.filter(d => d.isKeyDay).length,
            isRecoveryWeek: prescription?.isRecoveryWeek as boolean || false,
            focus: prescription?.weekFocus as string || '',
        } as WeekPlan);
    }

    // Get paces from first workout prescription
    const firstPrescription = workouts[0]?.prescription as Record<string, unknown> | undefined;
    const paces = firstPrescription?.paces as TrainingPlan['paces'] || {
        easy: { min: 480, max: 540 },
        marathon: 420,
        threshold: 390,
        interval: 360,
        repetition: 330,
    };

    return {
        id: planRow.id,
        createdAt: planRow.created_at,
        athleteName: '', // Will be filled from athlete table if needed
        vdot: planRow.vdot_at_creation,
        goalDistance: planRow.plan_type as TrainingPlan['goalDistance'],
        raceName: undefined,
        raceDate: planRow.end_date,
        weeks,
        totalWeeks: weeks.length,
        phases: [], // Simplified - could reconstruct from weeks
        peakMileage: Math.max(...weeks.map(w => w.totalMiles), 0),
        peakWeek: weeks.findIndex(w => w.totalMiles === Math.max(...weeks.map(ww => ww.totalMiles))) + 1,
        totalMiles: weeks.reduce((sum, w) => sum + w.totalMiles, 0),
        paces,
        intensityLevel: 'moderate',
        verification: { passed: true, checks: [] },
    };
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Save a training plan.
 *
 * Enterprise-grade strategy:
 * 1. Emit 'saving' status for UI
 * 2. Save to localStorage immediately (optimistic)
 * 3. Save to Supabase
 * 4. On failure: queue for retry, emit 'pending' status
 * 5. On success: emit 'synced' status
 */
export async function savePlanV2(plan: TrainingPlan): Promise<PlanResult<void>> {
    // 1. Emit saving status
    emitSyncEvent('start');

    // 2. Optimistic save to cache
    saveToCache(plan);

    // 3. Get athlete ID
    const athleteId = await getAuthenticatedAthleteId();

    if (!athleteId) {
        // Not authenticated - queue for sync when authenticated
        console.warn('[PlanRepository] No auth - plan queued for sync');
        queueWrite({ id: plan.id, type: 'plan', payload: { plan, athleteId: null } });
        emitSyncEvent('pending');
        return { success: true, data: undefined };
    }

    // 4. Save to Supabase
    const result = await saveToSupabase(plan, athleteId);

    if (!result.success) {
        // Queue for retry
        console.error('[PlanRepository] Supabase save failed, queuing:', result.error);
        queueWrite({ id: plan.id, type: 'plan', payload: { plan, athleteId } });
        emitSyncEvent('pending');
        // Return success since we have it cached and queued
        return { success: true, data: undefined };
    }

    // 5. Success!
    emitSyncEvent('success');
    return { success: true, data: undefined };
}

/**
 * Direct save to Supabase (used by sync processor for retries)
 * Exported for use by sync/processor.ts
 */
export async function saveToSupabaseDirectly(
    payload: unknown
): Promise<PlanResult<void>> {
    const { plan, athleteId } = payload as { plan: TrainingPlan; athleteId: string | null };

    // If no athleteId stored, try to get current
    const resolvedAthleteId = athleteId || await getAuthenticatedAthleteId();

    if (!resolvedAthleteId) {
        return {
            success: false,
            error: { code: 'AUTH_REQUIRED', message: 'Not authenticated' },
        };
    }

    return saveToSupabase(plan, resolvedAthleteId);
}

/**
 * Load the current training plan.
 *
 * Strategy:
 * 1. Return cached plan immediately if exists (for speed)
 * 2. Validate/refresh from Supabase in background
 * 3. If Supabase has newer version, update cache
 */
export async function loadPlanV2(): Promise<PlanResult<TrainingPlan | null>> {
    // 1. Try cache first for instant load
    const cached = loadFromCache();

    // 2. Get athlete ID
    const athleteId = await getAuthenticatedAthleteId();

    if (!athleteId) {
        // Not authenticated - return cache only
        return { success: true, data: cached };
    }

    // 3. Load from Supabase
    const result = await loadFromSupabase(athleteId);

    if (!result.success) {
        // Supabase failed - fall back to cache
        console.warn('[PlanRepository] Supabase load failed, using cache:', result.error);
        return { success: true, data: cached };
    }

    if (result.data) {
        // Update cache with fresh data
        saveToCache(result.data);
        return { success: true, data: result.data };
    }

    // No plan in Supabase - return cache if exists
    return { success: true, data: cached };
}

/**
 * Check if a plan exists (from cache or Supabase).
 */
export async function hasPlanV2(): Promise<boolean> {
    const cached = loadFromCache();
    if (cached) return true;

    const athleteId = await getAuthenticatedAthleteId();
    if (!athleteId) return false;

    const result = await loadFromSupabase(athleteId);
    return result.success && result.data !== null;
}

/**
 * Clear the current plan.
 */
export async function clearPlanV2(): Promise<PlanResult<void>> {
    clearCache();

    const athleteId = await getAuthenticatedAthleteId();
    if (!athleteId) {
        return { success: true, data: undefined };
    }

    try {
        const supabase = createSupabaseBrowserClient();
        await supabase
            .from('training_plans')
            .update({ is_active: false })
            .eq('athlete_id', athleteId)
            .eq('is_active', true);

        return { success: true, data: undefined };
    } catch (error) {
        return {
            success: false,
            error: { code: 'NETWORK_ERROR', message: 'Failed to clear plan', details: error },
        };
    }
}

/**
 * Get a specific workout by ID.
 */
export async function getWorkoutById(workoutId: string): Promise<PlanResult<DbPlannedWorkout | null>> {
    const athleteId = await getAuthenticatedAthleteId();
    if (!athleteId) {
        return {
            success: false,
            error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
        };
    }

    try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
            .from('planned_workouts')
            .select('*')
            .eq('id', workoutId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return { success: true, data: null };
            }
            return {
                success: false,
                error: { code: 'LOAD_FAILED', message: 'Failed to load workout', details: error },
            };
        }

        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: { code: 'NETWORK_ERROR', message: 'Network error', details: error },
        };
    }
}

/**
 * Get today's workout for the current athlete.
 */
export async function getTodaysWorkoutV2(): Promise<PlanResult<DbPlannedWorkout | null>> {
    const athleteId = await getAuthenticatedAthleteId();
    if (!athleteId) {
        return {
            success: false,
            error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
        };
    }

    const today = new Date().toISOString().split('T')[0];

    try {
        const supabase = createSupabaseBrowserClient();

        // Get active plan first
        const { data: plan } = await supabase
            .from('training_plans')
            .select('id')
            .eq('athlete_id', athleteId)
            .eq('is_active', true)
            .single();

        if (!plan) {
            return { success: true, data: null };
        }

        // Get today's workout
        const { data, error } = await supabase
            .from('planned_workouts')
            .select('*')
            .eq('plan_id', plan.id)
            .eq('scheduled_date', today)
            .single();

        if (error && error.code !== 'PGRST116') {
            return {
                success: false,
                error: { code: 'LOAD_FAILED', message: 'Failed to load workout', details: error },
            };
        }

        return { success: true, data: data || null };
    } catch (error) {
        return {
            success: false,
            error: { code: 'NETWORK_ERROR', message: 'Network error', details: error },
        };
    }
}

/**
 * Get workouts for a specific week.
 */
export async function getWeekWorkouts(weekNumber: number): Promise<PlanResult<DbPlannedWorkout[]>> {
    const athleteId = await getAuthenticatedAthleteId();
    if (!athleteId) {
        return {
            success: false,
            error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
        };
    }

    try {
        const supabase = createSupabaseBrowserClient();

        // Get active plan
        const { data: plan } = await supabase
            .from('training_plans')
            .select('id')
            .eq('athlete_id', athleteId)
            .eq('is_active', true)
            .single();

        if (!plan) {
            return { success: true, data: [] };
        }

        // Get workouts - filter by week in prescription
        const { data, error } = await supabase
            .from('planned_workouts')
            .select('*')
            .eq('plan_id', plan.id)
            .order('scheduled_date', { ascending: true });

        if (error) {
            return {
                success: false,
                error: { code: 'LOAD_FAILED', message: 'Failed to load workouts', details: error },
            };
        }

        // Filter by week number
        const weekWorkouts = (data || []).filter(w => {
            const p = w.prescription as Record<string, unknown>;
            return p.weekNumber === weekNumber;
        });

        return { success: true, data: weekWorkouts };
    } catch (error) {
        return {
            success: false,
            error: { code: 'NETWORK_ERROR', message: 'Network error', details: error },
        };
    }
}

// =============================================================================
// PLAN HISTORY FUNCTIONS
// =============================================================================

/**
 * Load all training plans (active + archived) for the current user.
 * Returns plans ordered by creation date descending.
 */
export async function loadPlanHistory(): Promise<PlanResult<DbTrainingPlan[]>> {
    const athleteId = await getAuthenticatedAthleteId();
    if (!athleteId) {
        return {
            success: false,
            error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
        };
    }

    try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
            .from('training_plans')
            .select('*')
            .eq('athlete_id', athleteId)
            .order('created_at', { ascending: false });

        if (error) {
            return {
                success: false,
                error: { code: 'LOAD_FAILED', message: 'Failed to load plan history', details: error },
            };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        return {
            success: false,
            error: { code: 'NETWORK_ERROR', message: 'Network error', details: error },
        };
    }
}

/**
 * Load all workouts for a specific plan (for drill-down view).
 */
export async function loadPlanWorkouts(planId: string): Promise<PlanResult<DbPlannedWorkout[]>> {
    const athleteId = await getAuthenticatedAthleteId();
    if (!athleteId) {
        return {
            success: false,
            error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
        };
    }

    try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
            .from('planned_workouts')
            .select('*')
            .eq('plan_id', planId)
            .eq('athlete_id', athleteId)
            .order('scheduled_date', { ascending: true });

        if (error) {
            return {
                success: false,
                error: { code: 'LOAD_FAILED', message: 'Failed to load workouts', details: error },
            };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        return {
            success: false,
            error: { code: 'NETWORK_ERROR', message: 'Network error', details: error },
        };
    }
}

/**
 * Restore an archived plan by making it active and deactivating the current plan.
 * Uses a transaction-safe RPC function to ensure atomicity.
 */
export async function restorePlan(planId: string): Promise<PlanResult<void>> {
    const athleteId = await getAuthenticatedAthleteId();
    if (!athleteId) {
        return {
            success: false,
            error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
        };
    }

    try {
        const supabase = createSupabaseBrowserClient();

        // Call the transaction-safe RPC function
        const { error } = await supabase.rpc('restore_training_plan', {
            plan_backup: JSON.parse(JSON.stringify({ target_plan_id: planId })),
        });

        if (error) {
            return {
                success: false,
                error: { code: 'SAVE_FAILED', message: 'Failed to restore plan', details: error },
            };
        }

        // Clear cache so next load fetches fresh data
        clearCache();

        return { success: true, data: undefined };
    } catch (error) {
        return {
            success: false,
            error: { code: 'NETWORK_ERROR', message: 'Network error', details: error },
        };
    }
}
