"use client";

import { useState, useEffect } from 'react';

/**
 * Offline Indicator
 *
 * Shows a banner when the user is offline.
 * Automatically hides when connection is restored.
 */

export function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        // Check initial state
        setIsOffline(!navigator.onLine);

        const handleOnline = () => {
            setIsOffline(false);
            // Show "back online" message briefly
            if (wasOffline) {
                setTimeout(() => setWasOffline(false), 3000);
            }
        };

        const handleOffline = () => {
            setIsOffline(true);
            setWasOffline(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [wasOffline]);

    if (!isOffline && !wasOffline) return null;

    return (
        <div
            className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-body-sm font-medium shadow-lg transition-all duration-300 ${isOffline
                    ? 'bg-[var(--color-warning)] text-black'
                    : 'bg-[var(--color-accent)] text-black'
                }`}
        >
            {isOffline ? (
                <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 1112.728 0M12 12h.01" />
                    </svg>
                    You're offline
                </span>
            ) : (
                <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Back online
                </span>
            )}
        </div>
    );
}

export default OfflineIndicator;
