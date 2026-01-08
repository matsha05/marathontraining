'use client';

import { useCallback } from 'react';
import { useIsMobile } from './useIsMobile';

export function useHaptics() {
    const isMobile = useIsMobile();

    const hapticTap = useCallback((duration = 10) => {
        if (!isMobile) return;
        if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
        navigator.vibrate(duration);
    }, [isMobile]);

    return { hapticTap };
}
