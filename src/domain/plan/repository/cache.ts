import type { TrainingPlan } from '../types';
import { trainingPlanSchema } from '../schemas';
import { safeStorageGet, safeStorageRemove, safeStorageSet } from '@/lib/safe-storage';

const STORAGE_KEYS = {
    CURRENT_PLAN: 'long-game-plan-v2',
    PLAN_METADATA: 'long-game-plan-meta-v2',
} as const;

function getPlanStorageKey(key: string, athleteId?: string | null): string | null {
    if (!athleteId) return null;
    return `${key}-${athleteId}`;
}

function loadPlanCacheFromKey(key: string): TrainingPlan | null {
    const storedResult = safeStorageGet(key);
    if (!storedResult.success || !storedResult.data) return null;
    try {
        const parsed = JSON.parse(storedResult.data);
        if (!parsed || typeof parsed !== 'object' || !('plan' in parsed)) return null;
        const planCandidate = (parsed as { plan?: unknown }).plan;
        const validation = trainingPlanSchema.safeParse(planCandidate);
        if (!validation.success) {
            console.warn('[PlanCache] Invalid cached plan, clearing.');
            safeStorageRemove(key);
            return null;
        }
        return planCandidate as TrainingPlan;
    } catch {
        safeStorageRemove(key);
        return null;
    }
}

function migrateLegacyPlanCache(athleteId: string): TrainingPlan | null {
    const legacyPlan = loadPlanCacheFromKey(STORAGE_KEYS.CURRENT_PLAN);
    if (!legacyPlan) return null;

    savePlanCache(legacyPlan, athleteId);
    safeStorageRemove(STORAGE_KEYS.CURRENT_PLAN);
    safeStorageRemove(STORAGE_KEYS.PLAN_METADATA);
    return legacyPlan;
}

export function savePlanCache(plan: TrainingPlan, athleteId?: string | null): void {
    if (typeof window === 'undefined') return;
    const storageKey = getPlanStorageKey(STORAGE_KEYS.CURRENT_PLAN, athleteId);
    if (!storageKey) return;
    const stored = {
        plan,
        savedAt: new Date().toISOString(),
        version: 2,
    };
    safeStorageSet(storageKey, JSON.stringify(stored));
}

export function loadPlanCache(athleteId?: string | null): TrainingPlan | null {
    if (typeof window === 'undefined') return null;
    const storageKey = getPlanStorageKey(STORAGE_KEYS.CURRENT_PLAN, athleteId);
    if (!storageKey) return null;

    const cached = loadPlanCacheFromKey(storageKey);
    if (cached) return cached;

    if (athleteId) {
        return migrateLegacyPlanCache(athleteId);
    }

    return null;
}

export function clearPlanCache(athleteId?: string | null): void {
    if (typeof window === 'undefined') return;
    const storageKey = getPlanStorageKey(STORAGE_KEYS.CURRENT_PLAN, athleteId);
    const metadataKey = getPlanStorageKey(STORAGE_KEYS.PLAN_METADATA, athleteId);
    if (storageKey) {
        safeStorageRemove(storageKey);
    }
    if (metadataKey) {
        safeStorageRemove(metadataKey);
    }
    if (athleteId) {
        safeStorageRemove(STORAGE_KEYS.CURRENT_PLAN);
        safeStorageRemove(STORAGE_KEYS.PLAN_METADATA);
    }
}
