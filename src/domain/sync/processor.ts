/**
 * Sync Processor
 * 
 * Processes queued writes with retry logic and exponential backoff.
 */

import { getQueue, removeFromQueue, incrementRetryCount, emitSyncEvent } from './queue';
import type { QueuedWrite } from './types';

const MAX_RETRIES = 5;

export interface SyncResult {
    allSucceeded: boolean;
    processed: number;
    failed: number;
}

/**
 * Process all queued sync items with retry logic
 */
export async function retrySyncQueue(): Promise<SyncResult> {
    const queue = getQueue();
    let processed = 0;
    let failed = 0;

    for (const item of queue) {
        if (item.retryCount >= MAX_RETRIES) {
            // Give up after max retries - leave in queue for manual intervention
            failed++;
            continue;
        }

        // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        if (item.retryCount > 0) {
            const delay = Math.min(1000 * Math.pow(2, item.retryCount - 1), 16000);
            await new Promise(r => setTimeout(r, delay));
        }

        const success = await processItem(item);

        if (success) {
            removeFromQueue(item.id);
            processed++;
        } else {
            incrementRetryCount(item.id);
            failed++;
        }
    }

    return {
        allSucceeded: failed === 0,
        processed,
        failed
    };
}

/**
 * Process a single queued item
 */
async function processItem(item: QueuedWrite): Promise<boolean> {
    if (item.type === 'plan') {
        try {
            // Dynamic import to avoid circular dependencies
            const { savePlanViaApiDirectly } = await import('@/domain/plan/repository');
            const result = await savePlanViaApiDirectly(item.payload);
            return result.success;
        } catch (error) {
            console.error('[SyncProcessor] Failed to process plan:', error);
            return false;
        }
    }

    console.warn('[SyncProcessor] Unknown item type:', item.type);
    return false;
}

/**
 * Check if there are pending items in queue
 */
export function hasPendingSync(): boolean {
    return getQueue().length > 0;
}
