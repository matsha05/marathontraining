/**
 * Sync Queue Types & Schemas
 * 
 * Enterprise-grade sync status tracking for offline-first architecture.
 * Zod schemas ensure data integrity before syncing.
 */

import { z } from 'zod';

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

export const QueuedWriteSchema = z.object({
    id: z.string().min(1),
    type: z.literal('plan'),
    payload: z.unknown(),
    queuedAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T/)),
    retryCount: z.number().int().min(0),
});

export const QueueSchema = z.array(QueuedWriteSchema);

// =============================================================================
// TYPES (derived from schemas)
// =============================================================================

export type SyncStatus =
    | { state: 'idle' }
    | { state: 'saving' }
    | { state: 'synced'; syncedAt: Date }
    | { state: 'pending'; queuedAt: Date; retryCount: number }
    | { state: 'error'; message: string; canRetry: boolean };

export interface SyncState {
    plan: SyncStatus;
    lastServerConfirm: Date | null;
}

export type QueuedWrite = z.infer<typeof QueuedWriteSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate a single queued write before adding to queue.
 * Returns validated data or null if invalid.
 */
export function validateQueuedWrite(data: unknown): QueuedWrite | null {
    const result = QueuedWriteSchema.safeParse(data);
    if (result.success) {
        return result.data;
    }
    console.error('[SyncQueue] Invalid write data:', result.error.format());
    return null;
}

/**
 * Validate entire queue from storage.
 * Returns only valid items, filtering out corrupted ones.
 */
export function validateQueue(data: unknown): QueuedWrite[] {
    if (!Array.isArray(data)) {
        console.warn('[SyncQueue] Queue data is not an array, returning empty');
        return [];
    }

    const validItems: QueuedWrite[] = [];
    let invalidCount = 0;

    for (const item of data) {
        const result = QueuedWriteSchema.safeParse(item);
        if (result.success) {
            validItems.push(result.data);
        } else {
            invalidCount++;
        }
    }

    if (invalidCount > 0) {
        console.warn(`[SyncQueue] Filtered out ${invalidCount} invalid queue items`);
    }

    return validItems;
}
