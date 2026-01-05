"use client";

import { useState, useEffect, useCallback } from 'react';
import { CloudOff, Cloud, Check, AlertCircle, Loader2 } from 'lucide-react';
import { getQueue, getPendingCount, emitSyncEvent } from '@/domain/sync';

type SyncState = 'idle' | 'saving' | 'synced' | 'pending' | 'error';

/**
 * Enterprise-Grade Sync Status Indicator
 *
 * Shows explicit sync state to user:
 * - Saving: spinner, "Saving..."
 * - Synced: briefly shows checkmark, then hides
 * - Pending: yellow, "X changes pending - tap to sync"
 * - Error: red, "Sync failed - tap to retry"
 * - Offline: yellow, "Offline - changes will sync when reconnected"
 *
 * User NEVER thinks data is saved when it isn't.
 */
export function SyncStatusIndicator() {
    const [state, setState] = useState<SyncState>('idle');
    const [isOnline, setIsOnline] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [showSynced, setShowSynced] = useState(false);

    // Process queue - attempt to sync pending items
    const processQueue = useCallback(async () => {
        const queue = getQueue();
        if (queue.length === 0) return;

        setState('saving');

        // Import dynamically to avoid circular deps
        const { retrySyncQueue } = await import('@/domain/sync/processor');
        const result = await retrySyncQueue();

        if (result.allSucceeded) {
            setState('synced');
            setShowSynced(true);
            setPendingCount(0);
            setTimeout(() => {
                setShowSynced(false);
                setState('idle');
            }, 2000);
        } else {
            setState('error');
            setPendingCount(getPendingCount());
        }
    }, []);

    useEffect(() => {
        // Listen for online/offline
        const handleOnline = () => {
            setIsOnline(true);
            // Auto-retry when back online
            processQueue();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

        // Check queue on mount
        const count = getPendingCount();
        setPendingCount(count);
        if (count > 0) setState('pending');

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [processQueue]);

    // Listen for sync events from repository
    useEffect(() => {
        const handleSyncStart = () => setState('saving');

        const handleSyncSuccess = () => {
            setState('synced');
            setShowSynced(true);
            setPendingCount(getPendingCount());
            setTimeout(() => {
                setShowSynced(false);
                setState('idle');
            }, 2000);
        };

        const handleSyncError = () => {
            const count = getPendingCount();
            setPendingCount(count);
            setState(count > 0 ? 'pending' : 'error');
        };

        const handleSyncPending = () => {
            setPendingCount(getPendingCount());
            setState('pending');
        };

        window.addEventListener('sync:start', handleSyncStart);
        window.addEventListener('sync:success', handleSyncSuccess);
        window.addEventListener('sync:error', handleSyncError);
        window.addEventListener('sync:pending', handleSyncPending);

        return () => {
            window.removeEventListener('sync:start', handleSyncStart);
            window.removeEventListener('sync:success', handleSyncSuccess);
            window.removeEventListener('sync:error', handleSyncError);
            window.removeEventListener('sync:pending', handleSyncPending);
        };
    }, []);

    // Offline state takes priority
    if (!isOnline) {
        return (
            <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium backdrop-blur-sm"
                style={{
                    background: 'var(--v2-warning-subtle)',
                    border: '1px solid var(--v2-warning-muted)',
                    color: 'var(--v2-warning)'
                }}>
                <CloudOff size={16} />
                <span>Offline — changes will sync when reconnected</span>
            </div>
        );
    }

    // Saving state
    if (state === 'saving') {
        return (
            <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium backdrop-blur-sm"
                style={{
                    background: 'var(--v2-secondary-subtle)',
                    border: '1px solid rgba(58, 107, 255, 0.3)',
                    color: 'var(--v2-secondary)'
                }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
            </div>
        );
    }

    // Synced state (shows briefly)
    if (state === 'synced' && showSynced) {
        return (
            <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium backdrop-blur-sm"
                style={{
                    background: 'var(--v2-accent-subtle)',
                    border: '1px solid rgba(25, 227, 140, 0.3)',
                    color: 'var(--v2-success)'
                }}>
                <Check size={16} />
                <span>Saved</span>
            </div>
        );
    }

    // Pending state
    if (state === 'pending' && pendingCount > 0) {
        return (
            <button
                onClick={processQueue}
                className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium backdrop-blur-sm cursor-pointer transition-colors"
                style={{
                    background: 'var(--v2-warning-subtle)',
                    border: '1px solid var(--v2-warning-muted)',
                    color: 'var(--v2-warning)'
                }}
            >
                <Cloud size={16} />
                <span>{pendingCount} change{pendingCount > 1 ? 's' : ''} pending — tap to sync</span>
            </button>
        );
    }

    // Error state
    if (state === 'error') {
        return (
            <button
                onClick={processQueue}
                className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium backdrop-blur-sm cursor-pointer transition-colors"
                style={{
                    background: 'var(--v2-error-subtle)',
                    border: '1px solid var(--v2-error-muted)',
                    color: 'var(--v2-error)'
                }}
            >
                <AlertCircle size={16} />
                <span>Sync failed — tap to retry</span>
            </button>
        );
    }

    // Idle - nothing to show
    return null;
}

// Keep old export for backwards compatibility
export function OfflineIndicator() {
    return <SyncStatusIndicator />;
}

export default SyncStatusIndicator;
