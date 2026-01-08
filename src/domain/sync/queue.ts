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

import { QueuedWrite, QueuedWriteSchema, validateQueue } from './types';
import { safeStorageGet, safeStorageRemove, safeStorageSet } from '@/lib/safe-storage';

const QUEUE_KEY = 'long-game-sync-queue';

function persistQueue(queue: QueuedWrite[]) {
    const result = safeStorageSet(QUEUE_KEY, JSON.stringify(queue));
    if (!result.success && result.error === 'QUOTA_EXCEEDED') {
        emitSyncEvent('quota_exceeded');
    }
    return result;
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

    const result = persistQueue(filtered);

    if (!result.success && result.error === 'QUOTA_EXCEEDED') {
        // Try to recover by clearing old items
        console.warn('[SyncQueue] Attempting recovery by pruning old items...');
        const pruned = filtered.slice(-10); // Keep only last 10
        const retryResult = persistQueue(pruned);
        return retryResult.success;
    }

    return result.success;
}

/**
 * Get all queued writes with validation.
 * Corrupted items are filtered out and logged.
 */
export function getQueue(): QueuedWrite[] {
    const stored = safeStorageGet(QUEUE_KEY);
    if (!stored.success || !stored.data) return [];

    try {
        const parsed = JSON.parse(stored.data);
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
    persistQueue(queue);
}

/**
 * Increment retry count for failed sync.
 */
export function incrementRetryCount(id: string): void {
    const queue = getQueue().map(w =>
        w.id === id ? { ...w, retryCount: w.retryCount + 1 } : w
    );
    persistQueue(queue);
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
    const result = safeStorageRemove(QUEUE_KEY);
    if (!result.success) {
        console.error('[SyncQueue] Failed to clear queue:', result.message);
    }
}

/**
 * Get estimated storage used by queue (bytes).
 */
export function getQueueStorageSize(): number {
    const stored = safeStorageGet(QUEUE_KEY);
    return stored.success && stored.data ? new Blob([stored.data]).size : 0;
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
