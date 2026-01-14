'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { safeStorageGetJSON, safeStorageSetJSON } from '@/lib/safe-storage';

const STORAGE_KEY_PREFIX = 'long-game-strength-visibility';

interface StrengthPreference {
    showStrength: boolean;
}

export function useStrengthVisibility(defaultValue: boolean, athleteId?: string | null) {
    const storageKey = useMemo(() => (
        athleteId ? `${STORAGE_KEY_PREFIX}-${athleteId}` : STORAGE_KEY_PREFIX
    ), [athleteId]);

    const [showStrength, setShowStrength] = useState(defaultValue);
    const [hydrated, setHydrated] = useState(false);
    const [hasStoredPreference, setHasStoredPreference] = useState<boolean | null>(null);

    useEffect(() => {
        const stored = safeStorageGetJSON<StrengthPreference>(storageKey);
        if (stored.success && stored.data && typeof stored.data.showStrength === 'boolean') {
            setShowStrength(stored.data.showStrength);
            setHasStoredPreference(true);
        } else {
            setHasStoredPreference(false);
        }
        setHydrated(true);
    }, [storageKey]);

    useEffect(() => {
        if (!hydrated || hasStoredPreference !== false) return;
        setShowStrength(defaultValue);
    }, [defaultValue, hydrated, hasStoredPreference]);

    useEffect(() => {
        if (!hydrated) return;
        safeStorageSetJSON(storageKey, { showStrength });
    }, [showStrength, hydrated, storageKey]);

    const updateStrengthVisibility = useCallback((value: boolean) => {
        setShowStrength(value);
    }, []);

    return { showStrength, setShowStrength: updateStrengthVisibility, hydrated };
}
