'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect mobile viewport using matchMedia
 * @param breakpoint - Max-width breakpoint in pixels (default: 768)
 * @returns boolean indicating if viewport is mobile
 */
export function useIsMobile(breakpoint = 768): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check initial value
        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        // Use matchMedia for efficient event-driven updates
        const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

        // Set initial value
        setIsMobile(mediaQuery.matches);

        // Listen for changes
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mediaQuery.addEventListener('change', handler);

        return () => mediaQuery.removeEventListener('change', handler);
    }, [breakpoint]);

    return isMobile;
}

/**
 * Hook to detect if device supports touch
 * @returns boolean indicating if device has touch capability
 */
export function useIsTouchDevice(): boolean {
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        setIsTouch(
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0
        );
    }, []);

    return isTouch;
}

/**
 * Hook to detect reduced motion preference
 * @returns boolean indicating if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handler);

        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    return prefersReducedMotion;
}
