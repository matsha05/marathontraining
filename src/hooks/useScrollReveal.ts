'use client';

import { useEffect, useRef, useState } from 'react';
import { useIsMobile, usePrefersReducedMotion } from './useIsMobile';

export function useScrollReveal({ disabled = false } = {}) {
    const ref = useRef<HTMLElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const isMobile = useIsMobile();
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        if (disabled || !isMobile || prefersReducedMotion) {
            setIsVisible(true);
            return;
        }

        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [disabled, isMobile, prefersReducedMotion]);

    const className = `scroll-reveal${isVisible ? ' is-visible' : ''}`;

    return { ref, className };
}
