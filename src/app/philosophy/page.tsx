'use client';

import { useRouter } from 'next/navigation';
import { PhilosophyQuiz } from '@/components/philosophy';

/**
 * Philosophy Quiz Page
 * 
 * Standalone flow that can be accessed:
 * - Pre-auth from landing page
 * - During onboarding  
 * - From settings to change philosophy
 */
export default function PhilosophyPage() {
    const router = useRouter();

    const handleComplete = (philosophy: string) => {
        // Store selection and proceed to auth
        if (typeof window !== 'undefined') {
            localStorage.setItem('selected-philosophy', philosophy);
        }
        router.push('/auth?from=philosophy');
    };

    const handleSkip = () => {
        router.push('/auth');
    };

    return (
        <PhilosophyQuiz
            onComplete={handleComplete}
            onSkip={handleSkip}
        />
    );
}
