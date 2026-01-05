/**
 * Sync Queue Types
 * 
 * Enterprise-grade sync status tracking for offline-first architecture.
 */

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

export interface QueuedWrite {
    id: string;
    type: 'plan';
    payload: unknown;
    queuedAt: string;
    retryCount: number;
}
