'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Philosophy Quiz Page - Now Redirects to Onboarding
 * 
 * The philosophy quiz has been integrated directly into the onboarding flow,
 * so this page now redirects to /onboarding to maintain any existing links.
 */
export default function PhilosophyPage() {
    const router = useRouter();

    useEffect(() => {
        // Philosophy is now part of onboarding
        router.replace('/onboarding');
    }, [router]);

    return (
        <div className="v2-root min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-2 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--v2-accent)', borderTopColor: 'transparent' }} />
                <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>Redirecting...</p>
            </div>
        </div>
    );
}
