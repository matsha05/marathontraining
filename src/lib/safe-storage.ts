/**
 * Safe localStorage Utilities
 * 
 * Wraps localStorage with quota handling, validation, and error recovery.
 * All localStorage access across the app should go through these functions.
 */

import { z } from 'zod';

// =============================================================================
// TYPES
// =============================================================================

export type StorageError = 'QUOTA_EXCEEDED' | 'UNAVAILABLE' | 'PARSE_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN';

export type StorageResult<T> =
    | { success: true; data: T }
    | { success: false; error: StorageError; message: string };

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Check if localStorage is available.
 */
export function isStorageAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get approximate localStorage usage in bytes.
 */
export function getStorageUsage(): { used: number; estimatedMax: number } {
    if (!isStorageAvailable()) return { used: 0, estimatedMax: 0 };

    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            const value = localStorage.getItem(key);
            if (value) {
                // Each char is roughly 2 bytes in UTF-16
                used += (key.length + value.length) * 2;
            }
        }
    }

    // Most browsers allow 5-10MB
    return { used, estimatedMax: 5 * 1024 * 1024 };
}

/**
 * Safely write to localStorage with quota handling.
 */
export function safeStorageSet(key: string, value: string): StorageResult<void> {
    if (!isStorageAvailable()) {
        return { success: false, error: 'UNAVAILABLE', message: 'localStorage not available' };
    }

    try {
        localStorage.setItem(key, value);
        return { success: true, data: undefined };
    } catch (error) {
        if (error instanceof DOMException) {
            if (error.name === 'QuotaExceededError' || error.code === 22) {
                const usage = getStorageUsage();
                return {
                    success: false,
                    error: 'QUOTA_EXCEEDED',
                    message: `Storage full (${Math.round(usage.used / 1024)}KB used)`
                };
            }
        }
        return {
            success: false,
            error: 'UNKNOWN',
            message: error instanceof Error ? error.message : 'Write failed'
        };
    }
}

/**
 * Safely read from localStorage.
 */
export function safeStorageGet(key: string): StorageResult<string | null> {
    if (!isStorageAvailable()) {
        return { success: false, error: 'UNAVAILABLE', message: 'localStorage not available' };
    }

    try {
        const value = localStorage.getItem(key);
        return { success: true, data: value };
    } catch (error) {
        return {
            success: false,
            error: 'UNKNOWN',
            message: error instanceof Error ? error.message : 'Read failed'
        };
    }
}

/**
 * Safely remove from localStorage.
 */
export function safeStorageRemove(key: string): StorageResult<void> {
    if (!isStorageAvailable()) {
        return { success: false, error: 'UNAVAILABLE', message: 'localStorage not available' };
    }

    try {
        localStorage.removeItem(key);
        return { success: true, data: undefined };
    } catch (error) {
        return {
            success: false,
            error: 'UNKNOWN',
            message: error instanceof Error ? error.message : 'Remove failed'
        };
    }
}

/**
 * Read and parse JSON from localStorage with optional Zod validation.
 */
export function safeStorageGetJSON<T>(
    key: string,
    schema?: z.ZodType<T>
): StorageResult<T | null> {
    const result = safeStorageGet(key);
    if (!result.success) return result;
    if (result.data === null) return { success: true, data: null };

    try {
        const parsed = JSON.parse(result.data);

        if (schema) {
            const validation = schema.safeParse(parsed);
            if (!validation.success) {
                console.warn(`[Storage] Validation failed for ${key}:`, validation.error.format());
                return {
                    success: false,
                    error: 'VALIDATION_ERROR',
                    message: 'Data failed schema validation'
                };
            }
            return { success: true, data: validation.data };
        }

        return { success: true, data: parsed as T };
    } catch {
        console.warn(`[Storage] JSON parse failed for ${key}`);
        return { success: false, error: 'PARSE_ERROR', message: 'Invalid JSON' };
    }
}

/**
 * Write JSON to localStorage.
 */
export function safeStorageSetJSON<T>(key: string, value: T): StorageResult<void> {
    try {
        const serialized = JSON.stringify(value);
        return safeStorageSet(key, serialized);
    } catch (error) {
        return {
            success: false,
            error: 'UNKNOWN',
            message: error instanceof Error ? error.message : 'Serialization failed'
        };
    }
}

/**
 * Clear all app-related storage (keys starting with 'long-game-').
 */
export function clearAppStorage(): void {
    if (!isStorageAvailable()) return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('long-game-')) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`[Storage] Cleared ${keysToRemove.length} app storage keys`);
}
