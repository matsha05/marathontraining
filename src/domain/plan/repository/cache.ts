import type { TrainingPlan } from '../types';
import { safeStorageGet, safeStorageRemove, safeStorageSet } from '@/lib/safe-storage';

const STORAGE_KEYS = {
    CURRENT_PLAN: 'long-game-plan-v2',
    PLAN_METADATA: 'long-game-plan-meta-v2',
} as const;

export function savePlanCache(plan: TrainingPlan): void {
    if (typeof window === 'undefined') return;
    const stored = {
        plan,
        savedAt: new Date().toISOString(),
        version: 2,
    };
    safeStorageSet(STORAGE_KEYS.CURRENT_PLAN, JSON.stringify(stored));
}

export function loadPlanCache(): TrainingPlan | null {
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

export function clearPlanCache(): void {
    if (typeof window === 'undefined') return;
    safeStorageRemove(STORAGE_KEYS.CURRENT_PLAN);
    safeStorageRemove(STORAGE_KEYS.PLAN_METADATA);
}
