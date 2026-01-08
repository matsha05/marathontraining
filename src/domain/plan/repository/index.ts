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

import type { TrainingPlan } from '../types';
import type { TrainingPlanPayload } from '../schemas';
import { toTrainingPlanPayload } from '../payload';
import { emitSyncEvent, queueWrite } from '@/domain/sync';
import { clearPlanCache, loadPlanCache, savePlanCache } from './cache';
import { planApiRequest } from './network';
import {
    getWorkoutById,
    getTodaysWorkoutV2,
    getWeekWorkouts,
    loadPlanHistory,
    loadPlanWorkouts,
} from './selectors';
import type { PlanResult } from './types';

export type { PlanRepositoryError, PlanResult, DbPlannedWorkout, DbTrainingPlan } from './types';
export {
    getWorkoutById,
    getTodaysWorkoutV2,
    getWeekWorkouts,
    loadPlanHistory,
    loadPlanWorkouts,
};

function toVoidResult(result: PlanResult<unknown>): PlanResult<void> {
    return result.success ? { success: true, data: undefined } : result;
}

async function savePlanToApi(plan: TrainingPlanPayload): Promise<PlanResult<void>> {
    const result = await planApiRequest<unknown>('/api/plan/save', 'SAVE_FAILED', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
    });

    return toVoidResult(result);
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
    savePlanCache(plan);

    // 3. Save via API
    const payload = toTrainingPlanPayload(plan);
    const result = await savePlanToApi(payload);

    if (!result.success) {
        // Queue for retry
        console.error('[PlanRepository] Plan save failed, queuing:', result.error);
        queueWrite({ id: plan.id, type: 'plan', payload: { plan: payload } });
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
export async function savePlanViaApiDirectly(payload: unknown): Promise<PlanResult<void>> {
    const { plan } = payload as { plan?: TrainingPlanPayload };

    if (!plan) {
        return {
            success: false,
            error: { code: 'SAVE_FAILED', message: 'Missing plan payload' },
        };
    }

    return savePlanToApi(toTrainingPlanPayload(plan));
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
    const cached = loadPlanCache();

    // 2. Load from API
    const result = await planApiRequest<{ plan: TrainingPlan | null }>('/api/plan/current', 'LOAD_FAILED');

    if (!result.success) {
        if (result.error.code === 'AUTH_REQUIRED') {
            return { success: true, data: cached };
        }
        console.warn('[PlanRepository] API load failed, using cache:', result.error);
        return { success: true, data: cached };
    }

    const plan = result.data.plan ?? null;
    if (plan) {
        savePlanCache(plan);
        return { success: true, data: plan };
    }

    // No plan on server - return cache if exists
    return { success: true, data: cached };
}

/**
 * Check if a plan exists (from cache or Supabase).
 */
export async function hasPlanV2(): Promise<boolean> {
    const cached = loadPlanCache();
    if (cached) return true;

    const result = await planApiRequest<{ plan: TrainingPlan | null }>('/api/plan/current', 'LOAD_FAILED');
    if (!result.success) return false;
    return result.data.plan !== null;
}

/**
 * Clear the current plan.
 */
export async function clearPlanV2(): Promise<PlanResult<void>> {
    clearPlanCache();

    const result = await planApiRequest<unknown>('/api/plan/clear', 'SAVE_FAILED', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });

    return toVoidResult(result);
}

/**
 * Restore an archived plan by making it active and deactivating the current plan.
 * Uses a transaction-safe RPC function to ensure atomicity.
 */
export async function restorePlan(planId: string): Promise<PlanResult<void>> {
    const result = await planApiRequest<unknown>('/api/plan/restore', 'SAVE_FAILED', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
    });

    if (result.success) {
        // Clear cache so next load fetches fresh data
        clearPlanCache();
    }

    return toVoidResult(result);
}
