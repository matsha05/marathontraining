'use client';

/**
 * THE LONG GAME - Onboarding Screens: Identity
 * 
 * Welcome, Name, Demographics screens
 */

import {
    QuestionScreen,
    QuestionHeader,
    TextInput,
    OptionButton,
    OptionGrid,
    ContinueButton,
    useKeyboardNavigation,
} from '../ui';
import { OnboardingData } from '@/domain/onboarding/types';
import { STEP_TOOLTIPS } from '@/domain/onboarding/types';

// =============================================================================
// WELCOME SCREEN
// =============================================================================

interface WelcomeScreenProps {
    onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
    useKeyboardNavigation({ onEnter: onContinue });

    return (
        <QuestionScreen showBack={false}>
            <div className="text-center">
                <h1 className="text-display-md md:text-display-lg mb-4">
                    The <span className="gradient-text">Long Game</span>
                </h1>
                <p className="text-body-lg text-[var(--text-muted)] mb-2">
                    Training plans built on decades of coaching science.
                </p>
                <p className="text-body-md text-[var(--text-subtle)] mb-12">
                    Not AI slop. Not generic templates.<br />
                    Real methodology from real coaches.
                </p>

                <button
                    onClick={onContinue}
                    className="btn btn-gradient btn-lg px-12"
                >
                    Get Started
                </button>

                <p className="text-caption text-[var(--text-subtle)] mt-6">
                    Takes about 3 minutes
                </p>
            </div>
        </QuestionScreen>
    );
}

// =============================================================================
// NAME SCREEN
// =============================================================================

interface NameScreenProps {
    name: string;
    onNameChange: (name: string) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function NameScreen({ name, onNameChange, onContinue, onBack }: NameScreenProps) {
    const canContinue = name.trim().length >= 2;

    useKeyboardNavigation({
        onEnter: canContinue ? onContinue : undefined,
        onBack,
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="What should we call you?"
            />

            <TextInput
                value={name}
                onChange={onNameChange}
                placeholder="First name"
                autoFocus
            />

            <ContinueButton
                onClick={onContinue}
                disabled={!canContinue}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// DEMOGRAPHICS SCREEN
// =============================================================================

interface DemographicsScreenProps {
    data: OnboardingData;
    onAgeChange: (age: number | null) => void;
    onSexChange: (sex: 'male' | 'female') => void;
    onContinue: () => void;
    onBack: () => void;
}

export function DemographicsScreen({
    data,
    onAgeChange,
    onSexChange,
    onContinue,
    onBack
}: DemographicsScreenProps) {
    const canContinue = data.age !== null && data.age > 0 && data.sex !== null;

    useKeyboardNavigation({
        onEnter: canContinue ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            if (num === 1) onSexChange('male');
            if (num === 2) onSexChange('female');
        },
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="A few basics to personalize your paces."
                tooltip={STEP_TOOLTIPS['demographics']}
            />

            <div className="space-y-6">
                {/* Age */}
                <div>
                    <label className="text-label block mb-2">Age</label>
                    <TextInput
                        type="number"
                        value={data.age?.toString() ?? ''}
                        onChange={(v) => onAgeChange(v ? parseInt(v) : null)}
                        placeholder="30"
                        min={13}
                        max={99}
                    />
                </div>

                {/* Sex */}
                <div>
                    <label className="text-label block mb-2">Biological sex</label>
                    <OptionGrid columns={2}>
                        <OptionButton
                            label="Male"
                            shortcut="1"
                            selected={data.sex === 'male'}
                            onClick={() => onSexChange('male')}
                        />
                        <OptionButton
                            label="Female"
                            shortcut="2"
                            selected={data.sex === 'female'}
                            onClick={() => onSexChange('female')}
                        />
                    </OptionGrid>
                </div>
            </div>

            <ContinueButton
                onClick={onContinue}
                disabled={!canContinue}
            />
        </QuestionScreen>
    );
}
