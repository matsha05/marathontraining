import type { OnboardingData, OnboardingStep } from './model';
import { INITIAL_ONBOARDING_DATA } from './model';
import { safeStorageGetJSON, safeStorageRemove, safeStorageSetJSON } from '@/lib/safe-storage';

const STORAGE_KEY_PREFIX = 'long-game-onboarding';
const LEGACY_STORAGE_KEY = STORAGE_KEY_PREFIX;
const VALID_STEPS: Record<OnboardingStep, true> = {
    'welcome': true,
    'mile-gate': true,
    'name': true,
    'demographics': true,
    'avatar': true,
    'training-goal': true,
    'race-details': true,
    'fitness-duration': true,
    'calibration-method': true,
    'race-input': true,
    'easy-pace-input': true,
    'manual-vo2max': true,
    'hard-effort-input': true,
    'estimation-flow': true,
    'vdot-reveal': true,
    'weekly-mileage': true,
    'runs-per-week': true,
    'longest-run': true,
    'available-days': true,
    'long-run-day': true,
    'plan-start-date': true,
    'current-pain': true,
    'pain-details': true,
    'injury-history': true,
    'injury-details': true,
    'training-intensity': true,
    'training-mindset': true,
    'coach-reveal': true,
    'readiness-check': true,
    'generating': true,
    'complete': true,
};

function getOnboardingStorageKey(athleteId?: string | null): string {
    return athleteId ? `${STORAGE_KEY_PREFIX}-${athleteId}` : LEGACY_STORAGE_KEY;
}

function migrateLegacyOnboardingProgress(athleteId: string): void {
    const legacy = safeStorageGetJSON<unknown>(LEGACY_STORAGE_KEY);
    if (!legacy.success || legacy.data === null) {
        return;
    }
    safeStorageSetJSON(getOnboardingStorageKey(athleteId), legacy.data);
    safeStorageRemove(LEGACY_STORAGE_KEY);
}

export function saveOnboardingProgress(
    step: OnboardingStep,
    data: OnboardingData,
    athleteId?: string | null
): void {
    if (typeof window === 'undefined') {
        return;
    }

    safeStorageSetJSON(getOnboardingStorageKey(athleteId), {
        step,
        data,
        timestamp: Date.now(),
    });
}

export function loadOnboardingProgress(
    athleteId?: string | null
): { step: OnboardingStep; data: OnboardingData } | null {
    if (typeof window === 'undefined') {
        return null;
    }

    if (athleteId) {
        migrateLegacyOnboardingProgress(athleteId);
    }

    const stored = safeStorageGetJSON<unknown>(getOnboardingStorageKey(athleteId));
    if (!stored.success || stored.data === null || typeof stored.data !== 'object' || Array.isArray(stored.data)) {
        return null;
    }

    const { step, data, timestamp } = stored.data as {
        step?: unknown;
        data?: unknown;
        timestamp?: unknown;
    };
    const normalizedStep = step === 'strength-training' ? 'coach-reveal' : step;

    if (typeof normalizedStep !== 'string' || !(normalizedStep in VALID_STEPS)) {
        return null;
    }
    if (typeof timestamp !== 'number') {
        return null;
    }
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        return null;
    }

    const weekOld = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > weekOld) {
        clearOnboardingProgress(athleteId, true);
        return null;
    }

    const merged = { ...INITIAL_ONBOARDING_DATA, ...(data as Partial<OnboardingData>) };
    const storedReadiness = merged.readinessStatus as string | null;
    const normalized: OnboardingData = {
        ...merged,
        raceDate: merged.raceDate === '' ? null : merged.raceDate,
        longRunDays: merged.longRunDays.length === 0 && merged.longRunDay
            ? [merged.longRunDay]
            : merged.longRunDays,
        readinessStatus: storedReadiness === 'base_unavailable' ? 'needs_base' : merged.readinessStatus,
    };

    return {
        step: normalizedStep as OnboardingStep,
        data: normalized,
    };
}

export function clearOnboardingProgress(
    athleteId?: string | null,
    clearLegacy: boolean = false
): void {
    if (typeof window === 'undefined') {
        return;
    }
    safeStorageRemove(getOnboardingStorageKey(athleteId));
    if (clearLegacy || athleteId) {
        safeStorageRemove(LEGACY_STORAGE_KEY);
    }
}

