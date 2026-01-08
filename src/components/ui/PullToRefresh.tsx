'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';

const PULL_THRESHOLD = 70;
const MAX_PULL = 120;
const REFRESH_DELAY = 700;

export function PullToRefresh({ enabled = true }: { enabled?: boolean }) {
    const router = useRouter();
    const isMobile = useIsMobile();
    const [isStandalone, setIsStandalone] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const startYRef = useRef<number | null>(null);
    const pullRef = useRef(0);

    useEffect(() => {
        if (!enabled || !isMobile || typeof window === 'undefined') return;
        const standalone = window.matchMedia('(display-mode: standalone)').matches
            || Boolean((window.navigator as { standalone?: boolean }).standalone);
        setIsStandalone(standalone);
    }, [enabled, isMobile]);

    useEffect(() => {
        if (!enabled || !isMobile || !isStandalone || typeof window === 'undefined') return;

        const getScrollTop = () => {
            const scrollingElement = document.scrollingElement || document.documentElement;
            return scrollingElement.scrollTop;
        };

        const handleTouchStart = (event: TouchEvent) => {
            if (isRefreshing) return;
            if (getScrollTop() > 0) return;
            startYRef.current = event.touches[0].clientY;
            pullRef.current = 0;
        };

        const handleTouchMove = (event: TouchEvent) => {
            if (startYRef.current === null || isRefreshing) return;
            const distance = event.touches[0].clientY - startYRef.current;
            if (distance <= 0) return;
            const clamped = Math.min(distance, MAX_PULL);
            pullRef.current = clamped;
            setPullDistance(clamped);
        };

        const handleTouchEnd = () => {
            if (startYRef.current === null) return;
            const shouldRefresh = pullRef.current >= PULL_THRESHOLD;
            startYRef.current = null;
            pullRef.current = 0;

            if (shouldRefresh && !isRefreshing) {
                setIsRefreshing(true);
                setPullDistance(PULL_THRESHOLD);
                router.refresh();
                window.setTimeout(() => {
                    setIsRefreshing(false);
                    setPullDistance(0);
                }, REFRESH_DELAY);
            } else {
                setPullDistance(0);
            }
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('touchcancel', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [enabled, isMobile, isStandalone, isRefreshing, router]);

    if (!enabled || !isMobile || !isStandalone) return null;

    const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
    const label = isRefreshing
        ? 'Refreshing'
        : pullDistance >= PULL_THRESHOLD
            ? 'Release to refresh'
            : 'Pull to refresh';

    return (
        <div
            className="ptr-indicator"
            style={{
                opacity: pullDistance > 0 || isRefreshing ? 1 : 0,
                transform: `translate(-50%, ${Math.min(pullDistance, MAX_PULL)}px)`,
                transition: isRefreshing ? 'transform 200ms ease' : 'none',
            }}
            aria-live="polite"
        >
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span
                    className="w-2 h-2 rounded-full"
                    style={{
                        background: 'var(--color-accent)',
                        transform: `scale(${0.6 + progress * 0.4})`,
                    }}
                />
                <span>{label}</span>
                {isRefreshing && <span className="text-[10px]">...</span>}
            </div>
        </div>
    );
}
