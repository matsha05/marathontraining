/**
 * Sync Queue
 * 
 * Persistent queue for offline writes with exponential backoff retry.
 * Writes are stored in localStorage and processed when online.
 */

import type { QueuedWrite } from './types';

const QUEUE_KEY = 'long-game-sync-queue';

/**
 * Add a write to the sync queue
 */
export function queueWrite(write: Omit<QueuedWrite, 'queuedAt' | 'retryCount'>): void {
    if (typeof window === 'undefined') return;

    const queue = getQueue();
    // Replace existing item with same ID (avoid duplicates)
    const filtered = queue.filter(w => w.id !== write.id);
    filtered.push({
        ...write,
        queuedAt: new Date().toISOString(),
        retryCount: 0
    });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
}

/**
 * Get all queued writes
 */
export function getQueue(): QueuedWrite[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(QUEUE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/**
 * Remove a successfully synced item from queue
 */
export function removeFromQueue(id: string): void {
    if (typeof window === 'undefined') return;
    const queue = getQueue().filter(w => w.id !== id);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Increment retry count for failed sync
 */
export function incrementRetryCount(id: string): void {
    if (typeof window === 'undefined') return;
    const queue = getQueue().map(w =>
        w.id === id ? { ...w, retryCount: w.retryCount + 1 } : w
    );
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Get count of pending items
 */
export function getPendingCount(): number {
    return getQueue().length;
}

/**
 * Clear entire queue (use with caution)
 */
export function clearQueue(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(QUEUE_KEY);
}

/**
 * Emit sync status event
 */
export function emitSyncEvent(type: 'start' | 'success' | 'error' | 'pending'): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(`sync:${type}`, {
        detail: { pendingCount: getPendingCount() }
    }));
}
