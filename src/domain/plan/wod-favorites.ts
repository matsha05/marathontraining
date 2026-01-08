import { z } from 'zod';
import { safeStorageGetJSON, safeStorageSetJSON } from '@/lib/safe-storage';

export const WOD_FAVORITES_STORAGE_KEY = 'long-game-wod-favorites';

const favoritesSchema = z.array(z.string());

export function parseWodFavorites(value: unknown): string[] | null {
    const parsed = favoritesSchema.safeParse(value);
    return parsed.success ? parsed.data : null;
}

export function loadWodFavoritesFromStorage(): string[] {
    const stored = safeStorageGetJSON<unknown>(WOD_FAVORITES_STORAGE_KEY);
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

export function saveWodFavoritesToStorage(favorites: string[]): void {
    const stored = safeStorageSetJSON(WOD_FAVORITES_STORAGE_KEY, favorites);
    if (!stored.success) {
        console.warn('[WodFavorites] Failed to persist favorites:', stored.message);
    }
}
