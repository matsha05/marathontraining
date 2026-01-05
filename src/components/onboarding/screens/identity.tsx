'use client';

/**
 * THE LONG GAME - Onboarding Screens: Identity V2
 * 
 * Welcome, Name, Demographics screens
 * Week aesthetic: Dark, atmospheric, light typography
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
                <h1 className="v2-heading-xl mb-4">
                    The <span className="v2-accent">Long Game</span>
                </h1>
                <p className="v2-body-lg mb-2" style={{ color: 'var(--v2-text-muted)' }}>
                    Training plans built on decades of coaching science.
                </p>
                <p className="v2-body-md mb-12" style={{ color: 'var(--v2-text-subtle)' }}>
                    Not AI slop. Not generic templates.<br />
                    Real methodology from real coaches.
                </p>

                <button
                    onClick={onContinue}
                    className="v2-btn v2-btn-primary v2-btn-lg px-12"
                >
                    Get Started
                </button>

                <div className="flex flex-wrap justify-center gap-4 mt-12">
                    <div
                        className="v2-card px-4 py-3 text-center"
                        style={{ background: 'var(--v2-bg-elevated)' }}
                    >
                        <p className="v2-label v2-accent">Trusted</p>
                        <p className="v2-body-sm">2,400+ athletes trained</p>
                    </div>
                    <div
                        className="v2-card px-4 py-3 text-center"
                        style={{ background: 'var(--v2-bg-elevated)' }}
                    >
                        <p className="v2-label" style={{ color: 'var(--v2-secondary)' }}>Built on</p>
                        <p className="v2-body-sm">12 coach-backed standards</p>
                    </div>
                    <div
                        className="v2-card px-4 py-3 text-center"
                        style={{ background: 'var(--v2-bg-elevated)' }}
                    >
                        <p className="v2-label" style={{ color: 'var(--v2-tertiary)' }}>Sync ready</p>
                        <p className="v2-body-sm">Garmin export + Strava</p>
                    </div>
                </div>

                <p className="v2-mono mt-6" style={{ fontSize: '11px', color: 'var(--v2-text-subtle)' }}>
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
                    <label className="v2-label block mb-2">Age</label>
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
                    <label className="v2-label block mb-2">Biological sex</label>
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
