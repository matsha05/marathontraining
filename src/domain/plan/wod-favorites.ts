import { z } from 'zod';
import { safeStorageGetJSON, safeStorageRemove, safeStorageSetJSON } from '@/lib/safe-storage';

export const WOD_FAVORITES_STORAGE_KEY = 'long-game-wod-favorites';
const LEGACY_STORAGE_KEY = WOD_FAVORITES_STORAGE_KEY;

const favoritesSchema = z.array(z.string());

function getFavoritesKey(athleteId?: string | null): string {
    return athleteId ? `${WOD_FAVORITES_STORAGE_KEY}-${athleteId}` : WOD_FAVORITES_STORAGE_KEY;
}

function migrateLegacyFavorites(athleteId: string): void {
    const legacy = safeStorageGetJSON<unknown>(LEGACY_STORAGE_KEY);
    if (!legacy.success || legacy.data === null) return;
    safeStorageSetJSON(getFavoritesKey(athleteId), legacy.data);
    safeStorageRemove(LEGACY_STORAGE_KEY);
}

export function parseWodFavorites(value: unknown): string[] | null {
    const parsed = favoritesSchema.safeParse(value);
    return parsed.success ? parsed.data : null;
}

export function loadWodFavoritesFromStorage(athleteId?: string | null): string[] {
    if (athleteId) {
        migrateLegacyFavorites(athleteId);
    }

    const stored = safeStorageGetJSON<unknown>(getFavoritesKey(athleteId));
    if (!stored.success) {
        console.warn('[WodFavorites] Failed to read favorites:', stored.message);
        return [];
    }

    if (stored.data === null) return [];

    const parsed = parseWodFavorites(stored.data);
    if (!parsed) {
        console.warn('[WodFavorites] Invalid favorites in storage, resetting');
        return [];
    }

    return parsed;
}

export function saveWodFavoritesToStorage(favorites: string[], athleteId?: string | null): void {
    const stored = safeStorageSetJSON(getFavoritesKey(athleteId), favorites);
    if (!stored.success) {
        console.warn('[WodFavorites] Failed to persist favorites:', stored.message);
    }
}
