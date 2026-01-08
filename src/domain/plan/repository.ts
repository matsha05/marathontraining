/**
 * THE LONG GAME - Plan Repository
 *
 * Distinguished-engineer-grade data layer for training plan persistence.
 *
 * Architecture:
 * - Supabase as source of truth (via server API)
 * - localStorage as L1 cache (instant load, offline fallback)
 * - Optimistic updates with background sync
 *
 * Key design decisions:
 * 1. Plans stored in `training_plans` table (metadata)
 * 2. Workouts stored in `planned_workouts` table (individual days)
 * 3. On save: write to localStorage immediately, then server API
 * 4. On load: try localStorage first for speed, validate against server API
 */

import type { TrainingPlan } from './types';
import type { Database } from '@/infrastructure/supabase/types';
import { queueWrite, emitSyncEvent } from '@/domain/sync';
import { safeStorageGet, safeStorageRemove, safeStorageSet } from '@/lib/safe-storage';
import { apiFetch } from '@/lib/api';

// =============================================================================
// TYPES
// =============================================================================

type DbTrainingPlan = Database['public']['Tables']['training_plans']['Row'];
type DbPlannedWorkout = Database['public']['Tables']['planned_workouts']['Row'];

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
    const stored = {
        plan,
        savedAt: new Date().toISOString(),
        version: 2,
    };
    safeStorageSet(STORAGE_KEYS.CURRENT_PLAN, JSON.stringify(stored));
}

function loadFromCache(): TrainingPlan | null {
    if (typeof window === 'undefined') return null;
    const storedResult = safeStorageGet(STORAGE_KEYS.CURRENT_PLAN);
    if (!storedResult.success || !storedResult.data) return null;
    try {
        const parsed = JSON.parse(storedResult.data);
        return parsed.plan as TrainingPlan;
    } catch {
        return null;
    }
}

function clearCache(): void {
    if (typeof window === 'undefined') return;
    safeStorageRemove(STORAGE_KEYS.CURRENT_PLAN);
    safeStorageRemove(STORAGE_KEYS.PLAN_METADATA);
}

/**
 * Save plan through the server API (audited + transactional).
 */
async function saveToApi(plan: TrainingPlan): Promise<PlanResult<void>> {
    try {
        const response = await apiFetch('/api/plan/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan }),
        });

        if (!response.ok) {
            const code = response.status === 401 ? 'AUTH_REQUIRED' : 'SAVE_FAILED';
            return {
                success: false,
                error: { code, message: response.error.message, details: response.error.data },
            };
        }

        return { success: true, data: undefined };
    } catch (error) {
        return {
            success: false,
            error: { code: 'NETWORK_ERROR', message: 'Network error while saving', details: error },
        };
    }
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
 * 3. Save via server API
 * 4. On failure: queue for retry, emit 'pending' status
 * 5. On success: emit 'synced' status
 */
export async function savePlanV2(plan: TrainingPlan): Promise<PlanResult<void>> {
    // 1. Emit saving status
    emitSyncEvent('start');

    // 2. Optimistic save to cache
    saveToCache(plan);

    // 3. Save via API
    const result = await saveToApi(plan);

    if (!result.success) {
        // Queue for retry
        console.error('[PlanRepository] Plan save failed, queuing:', result.error);
        queueWrite({ id: plan.id, type: 'plan', payload: { plan } });
        emitSyncEvent('pending');
        // Return success since we have it cached and queued
        return { success: true, data: undefined };
    }

    // 5. Success!
    emitSyncEvent('success');
    return { success: true, data: undefined };
}

/**
 * Direct save via API (used by sync processor for retries).
 */
export async function savePlanViaApiDirectly(
    payload: unknown
): Promise<PlanResult<void>> {
    const { plan } = payload as { plan?: TrainingPlan };

    if (!plan) {
        return {
            success: false,
            error: { code: 'SAVE_FAILED', message: 'Missing plan payload' },
        };
    }

    return saveToApi(plan);
}

/**
 * Load the current training plan.
 *
 * Strategy:
 * 1. Return cached plan immediately if exists (for speed)
 * 2. Validate/refresh from server API in background
 * 3. If Supabase has newer version, update cache
 */
export async function loadPlanV2(): Promise<PlanResult<TrainingPlan | null>> {
    // 1. Try cache first for instant load
    const cached = loadFromCache();

    // 2. Load from API
    const result = await apiFetch<{ plan: TrainingPlan | null }>('/api/plan/current');

    if (!result.ok) {
        if (result.status === 401) {
            return { success: true, data: cached };
        }
        console.warn('[PlanRepository] API load failed, using cache:', result.error);
        return { success: true, data: cached };
    }

    const plan = result.data.plan ?? null;
    if (plan) {
        saveToCache(plan);
        return { success: true, data: plan };
    }

    // No plan on server - return cache if exists
    return { success: true, data: cached };
}

/**
 * Check if a plan exists (from cache or Supabase).
 */
export async function hasPlanV2(): Promise<boolean> {
    const cached = loadFromCache();
    if (cached) return true;

    const result = await apiFetch<{ plan: TrainingPlan | null }>('/api/plan/current');
    if (!result.ok) return false;
    return result.data.plan !== null;
}

/**
 * Clear the current plan.
 */
export async function clearPlanV2(): Promise<PlanResult<void>> {
    clearCache();

    try {
        const response = await apiFetch('/api/plan/clear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const code = response.status === 401 ? 'AUTH_REQUIRED' : 'SAVE_FAILED';
            return {
                success: false,
                error: { code, message: response.error.message, details: response.error.data },
            };
        }

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
    try {
        const response = await apiFetch<{ workout: DbPlannedWorkout | null }>(`/api/plan/workout?id=${encodeURIComponent(workoutId)}`);
        if (!response.ok) {
            const code = response.status === 401 ? 'AUTH_REQUIRED' : 'LOAD_FAILED';
            return {
                success: false,
                error: { code, message: response.error.message, details: response.error.data },
            };
        }
        return { success: true, data: response.data.workout };
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
    try {
        const response = await apiFetch<{ workout: DbPlannedWorkout | null }>('/api/plan/today');
        if (!response.ok) {
            const code = response.status === 401 ? 'AUTH_REQUIRED' : 'LOAD_FAILED';
            return {
                success: false,
                error: { code, message: response.error.message, details: response.error.data },
            };
        }
        return { success: true, data: response.data.workout };
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
    try {
        const response = await apiFetch<{ workouts: DbPlannedWorkout[] }>(`/api/plan/week?week=${weekNumber}`);
        if (!response.ok) {
            const code = response.status === 401 ? 'AUTH_REQUIRED' : 'LOAD_FAILED';
            return {
                success: false,
                error: { code, message: response.error.message, details: response.error.data },
            };
        }
        return { success: true, data: response.data.workouts };
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
    try {
        const response = await apiFetch<{ plans: DbTrainingPlan[] }>('/api/plan/history');
        if (!response.ok) {
            const code = response.status === 401 ? 'AUTH_REQUIRED' : 'LOAD_FAILED';
            return {
                success: false,
                error: { code, message: response.error.message, details: response.error.data },
            };
        }
        return { success: true, data: response.data.plans };
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
    try {
        const response = await apiFetch<{ workouts: DbPlannedWorkout[] }>(`/api/plan/workouts?planId=${encodeURIComponent(planId)}`);
        if (!response.ok) {
            const code = response.status === 401 ? 'AUTH_REQUIRED' : 'LOAD_FAILED';
            return {
                success: false,
                error: { code, message: response.error.message, details: response.error.data },
            };
        }
        return { success: true, data: response.data.workouts };
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
    try {
        const response = await apiFetch('/api/plan/restore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId }),
        });

        if (!response.ok) {
            const code = response.status === 401 ? 'AUTH_REQUIRED' : 'SAVE_FAILED';
            return {
                success: false,
                error: { code, message: response.error.message, details: response.error.data },
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
