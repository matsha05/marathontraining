'use client';

/**
 * THE LONG GAME - Philosophy Screen for Onboarding
 * 
 * Embeds the full PhilosophyQuiz experience within the onboarding flow.
 * Preserves all premium UX: beginner gate, animated progress, coach recommendation reveal.
 */

import { PhilosophyQuiz } from '@/components/philosophy/PhilosophyQuiz';

interface PhilosophyScreenProps {
    onSelect: (philosophy: 'hansons' | 'higdon' | 'pfitzinger' | 'daniels') => void;
    onBack: () => void;
}

export function PhilosophyScreen({ onSelect, onBack }: PhilosophyScreenProps) {
    const handleComplete = (philosophy: string) => {
        // Map the recommendation to a valid philosophy type
        const validPhilosophies = ['hansons', 'higdon', 'pfitzinger', 'daniels'];
        if (validPhilosophies.includes(philosophy)) {
            onSelect(philosophy as 'hansons' | 'higdon' | 'pfitzinger' | 'daniels');
        } else {
            // Default fallback
            onSelect('higdon');
        }
    };

    const handleSkip = () => {
        // If they skip, default to Higdon
        onSelect('higdon');
    };

    return (
        <PhilosophyQuiz
            onComplete={handleComplete}
            onSkip={handleSkip}
        />
    );
}
