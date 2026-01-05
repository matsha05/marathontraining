'use client';

/**
 * THE LONG GAME - Onboarding Screens: Identity V2
 * 
 * Welcome, Name, Demographics screens
 * Week aesthetic: Dark, atmospheric, light typography
 */

import { motion } from 'framer-motion';
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

// Animation ease curve
const ease = [0.25, 0.46, 0.45, 0.94] as const;

// =============================================================================
// WELCOME SCREEN - Premium Hero Style (matches landing page)
// =============================================================================

interface WelcomeScreenProps {
    onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
    useKeyboardNavigation({ onEnter: onContinue });

    return (
        <div className="v2-root min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
            style={{ background: 'var(--v2-bg-deep)' }}>
            {/* Subtle radial glow behind content */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(600px circle at 50% 45%, var(--v2-accent-glow) 0%, transparent 60%)' }}
            />

            {/* Step indicator at top */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="fixed top-6 left-0 right-0 text-center"
            >
                <p className="text-xs font-mono" style={{ color: 'var(--v2-text-ghost)' }}>
                    Step 1 · Build Your Plan
                </p>
            </motion.div>

            <div className="text-center w-full max-w-3xl relative z-10">
                {/* Welcome headline - different from landing */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6, ease }}
                    className="text-4xl md:text-5xl font-light mb-4 tracking-tight"
                    style={{ color: 'var(--v2-text-primary)' }}
                >
                    Let's build your plan
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.6, ease }}
                    className="text-lg mb-10"
                    style={{ color: 'var(--v2-text-subtle)' }}
                >
                    Answer a few questions. Get a plan tailored to you.
                </motion.p>

                {/* Week Grid Preview - now framed as "what you'll get" */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.7, ease }}
                    className="max-w-2xl mx-auto mb-10"
                >
                    <p className="text-xs mb-4 font-mono" style={{ color: 'var(--v2-text-ghost)' }}>
                        What you'll get · Calibrated to your fitness
                    </p>
                    <div className="grid grid-cols-7 gap-1">
                        {[
                            { day: "M", type: "run", label: "Easy", sub: "?" },
                            { day: "T", type: "run", label: "Speed", sub: "?" },
                            { day: "W", type: "rest", label: "Rest", sub: "" },
                            { day: "T", type: "run", label: "Tempo", sub: "?" },
                            { day: "F", type: "run", label: "Easy", sub: "?" },
                            { day: "S", type: "run", label: "Easy", sub: "?" },
                            { day: "S", type: "long", label: "Long", sub: "?" },
                        ].map((d, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + (i * 0.05), duration: 0.4, ease }}
                                className="p-3 rounded-lg text-center"
                                style={{
                                    background: d.type === "long"
                                        ? 'var(--v2-accent-subtle)'
                                        : d.type === "rest"
                                            ? 'var(--v2-bg-elevated)'
                                            : 'var(--v2-bg-hover)',
                                }}
                            >
                                <p className="text-[10px] mb-2" style={{ color: 'var(--v2-text-subtle)' }}>{d.day}</p>
                                <p
                                    className="text-xs mb-0.5"
                                    style={{ color: d.type === "rest" ? 'var(--v2-text-ghost)' : 'var(--v2-text-secondary)' }}
                                >
                                    {d.label}
                                </p>
                                {d.sub && (
                                    <p className="text-[9px] font-mono" style={{ color: 'var(--v2-text-subtle)' }}>{d.sub}</p>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.5, ease }}
                >
                    <button
                        onClick={onContinue}
                        className="v2-btn v2-btn-primary v2-btn-lg px-12"
                    >
                        Let's Go
                    </button>
                </motion.div>

                {/* Time estimate */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="v2-mono mt-8"
                    style={{ fontSize: '11px', color: 'var(--v2-text-ghost)' }}
                >
                    Takes about 3 minutes
                </motion.p>
            </div>
        </div>
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
