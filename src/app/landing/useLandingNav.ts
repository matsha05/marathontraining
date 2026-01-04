"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Shared hook for keyboard navigation between landing pages
 * 
 * ← : Previous landing page
 * → : Next landing page
 * Esc : Back to showcase
 */

const LANDING_ROUTES = [
    "/landing/week",
    "/landing/paces",
    "/landing/phases",
    "/landing/workout",
    "/landing/coaches",
    "/landing/complete",
];

export function useLandingNav(currentRoute: string) {
    const router = useRouter();

    useEffect(() => {
        const currentIndex = LANDING_ROUTES.indexOf(currentRoute);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % LANDING_ROUTES.length;
                router.push(LANDING_ROUTES[nextIndex]);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + LANDING_ROUTES.length) % LANDING_ROUTES.length;
                router.push(LANDING_ROUTES[prevIndex]);
            } else if (e.key === "Escape") {
                e.preventDefault();
                router.push("/showcase");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentRoute, router]);
}
