/**
 * Sync Queue
 * 
 * Persistent queue for offline writes with exponential backoff retry.
 * Writes are stored in localStorage and processed when online.
 * 
 * RELIABILITY FEATURES:
 * - Zod schema validation before syncing
 * - localStorage quota error handling
 * - Corrupted data filtering with logging
 */

import { z } from 'zod';
import { QueuedWrite, QueuedWriteSchema, validateQueue } from './types';

const QUEUE_KEY = 'long-game-sync-queue';

// =============================================================================
// LOCALSTORAGE HELPERS (with quota handling)
// =============================================================================

interface StorageResult {
    success: boolean;
    error?: 'QUOTA_EXCEEDED' | 'UNAVAILABLE' | 'UNKNOWN';
}

/**
 * Safely write to localStorage with quota handling.
 * Returns success/failure with error type.
 */
function safeLocalStorageSet(key: string, value: string): StorageResult {
    if (typeof window === 'undefined') {
        return { success: false, error: 'UNAVAILABLE' };
    }

    try {
        localStorage.setItem(key, value);
        return { success: true };
    } catch (error) {
        if (error instanceof DOMException) {
            if (error.name === 'QuotaExceededError' || error.code === 22) {
                console.error('[SyncQueue] localStorage quota exceeded!');
                emitSyncEvent('quota_exceeded');
                return { success: false, error: 'QUOTA_EXCEEDED' };
            }
        }
        console.error('[SyncQueue] localStorage write failed:', error);
        return { success: false, error: 'UNKNOWN' };
    }
}

/**
 * Safely read from localStorage with validation.
 */
function safeLocalStorageGet(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error('[SyncQueue] localStorage read failed:', error);
        return null;
    }
}

// =============================================================================
// QUEUE OPERATIONS
// =============================================================================

/**
 * Add a write to the sync queue with validation.
 * Returns false if quota exceeded or validation failed.
 */
export function queueWrite(write: Omit<QueuedWrite, 'queuedAt' | 'retryCount'>): boolean {
    const fullWrite: QueuedWrite = {
        ...write,
        queuedAt: new Date().toISOString(),
        retryCount: 0,
    };

    // Validate before adding
    const validation = QueuedWriteSchema.safeParse(fullWrite);
    if (!validation.success) {
        console.error('[SyncQueue] Refusing to queue invalid write:', validation.error.format());
        return false;
    }

    const queue = getQueue();
    // Replace existing item with same ID (avoid duplicates)
    const filtered = queue.filter(w => w.id !== write.id);
    filtered.push(validation.data);

    const result = safeLocalStorageSet(QUEUE_KEY, JSON.stringify(filtered));

    if (!result.success && result.error === 'QUOTA_EXCEEDED') {
        // Try to recover by clearing old items
        console.warn('[SyncQueue] Attempting recovery by pruning old items...');
        const pruned = filtered.slice(-10); // Keep only last 10
        const retryResult = safeLocalStorageSet(QUEUE_KEY, JSON.stringify(pruned));
        return retryResult.success;
    }

    return result.success;
}

/**
 * Get all queued writes with validation.
 * Corrupted items are filtered out and logged.
 */
export function getQueue(): QueuedWrite[] {
    const stored = safeLocalStorageGet(QUEUE_KEY);
    if (!stored) return [];

    try {
        const parsed = JSON.parse(stored);
        return validateQueue(parsed);
    } catch (error) {
        console.error('[SyncQueue] Failed to parse queue, clearing:', error);
        clearQueue();
        return [];
    }
}

/**
 * Remove a successfully synced item from queue.
 */
export function removeFromQueue(id: string): void {
    const queue = getQueue().filter(w => w.id !== id);
    safeLocalStorageSet(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Increment retry count for failed sync.
 */
export function incrementRetryCount(id: string): void {
    const queue = getQueue().map(w =>
        w.id === id ? { ...w, retryCount: w.retryCount + 1 } : w
    );
    safeLocalStorageSet(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Get count of pending items.
 */
export function getPendingCount(): number {
    return getQueue().length;
}

/**
 * Clear entire queue (use with caution).
 */
export function clearQueue(): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(QUEUE_KEY);
    } catch (error) {
        console.error('[SyncQueue] Failed to clear queue:', error);
    }
}

/**
 * Get estimated storage used by queue (bytes).
 */
export function getQueueStorageSize(): number {
    const stored = safeLocalStorageGet(QUEUE_KEY);
    return stored ? new Blob([stored]).size : 0;
}

// =============================================================================
// EVENTS
// =============================================================================

type SyncEventType = 'start' | 'success' | 'error' | 'pending' | 'quota_exceeded';

/**
 * Emit sync status event.
 */
export function emitSyncEvent(type: SyncEventType): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(`sync:${type}`, {
        detail: {
            pendingCount: getPendingCount(),
            storageBytes: getQueueStorageSize(),
        }
    }));
}
