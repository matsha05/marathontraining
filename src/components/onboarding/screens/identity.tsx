'use client';

/**
 * THE LONG GAME - Onboarding Screens: Identity V2
 * 
 * Welcome, MileGate, Name, Demographics screens
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
import { addYears, toDateKey } from '@/lib/dates';

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
        <div className="v3-root min-h-screen-safe flex flex-col items-center justify-center px-4 md:px-6 relative overflow-hidden pt-16"
            style={{ background: 'var(--bg-base)' }}>
            {/* Subtle radial glow behind content */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(600px circle at 50% 45%, color-mix(in srgb, var(--color-accent) 4%, transparent) 0%, transparent 60%)' }}
            />

            {/* Step indicator at top */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="fixed top-6 left-0 right-0 text-center"
            >
                <p className="text-xs font-mono" style={{ color: 'var(--text-subtle)' }}>
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
                    style={{ color: 'var(--text-base)' }}
                >
                    Let's build your plan
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.6, ease }}
                    className="text-lg mb-10"
                    style={{ color: 'var(--text-subtle)' }}
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
                    <p className="text-xs mb-4 font-mono" style={{ color: 'var(--text-subtle)' }}>
                        What you'll get · Calibrated to your fitness
                    </p>
                    <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-7 gap-2 -mx-4 md:mx-0 px-4 md:px-0 touch-pan-x" style={{ scrollbarWidth: 'none' }}>
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
                                whileTap={{ scale: 0.95 }}
                                className="p-3 rounded-lg text-center border snap-center flex-shrink-0 w-[80px] md:w-auto md:flex-shrink touch-target"
                                style={{
                                    background: d.type === "long"
                                        ? 'color-mix(in srgb, var(--color-accent) 15%, var(--bg-elevated))'
                                        : d.type === "rest"
                                            ? 'var(--bg-elevated)'
                                            : 'var(--bg-muted)',
                                    borderColor: d.type === "long"
                                        ? 'var(--color-accent)'
                                        : 'var(--border-base)',
                                }}
                            >
                                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>{d.day}</p>
                                <p
                                    className="text-sm font-medium mb-0.5"
                                    style={{ color: d.type === "long" ? 'var(--color-accent)' : d.type === "rest" ? 'var(--text-subtle)' : 'var(--text-base)' }}
                                >
                                    {d.label}
                                </p>
                                {d.sub && (
                                    <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{d.sub}</p>
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
                        className="v3-btn v3-btn-primary v3-btn-lg px-12"
                    >
                        Let's Go
                    </button>
                </motion.div>

                {/* Time estimate */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="v3-mono mt-8"
                    style={{ fontSize: '11px', color: 'var(--text-subtle)' }}
                >
                    Takes about 3 minutes
                </motion.p>
            </div>
        </div>
    );
}


// =============================================================================
// MILE GATE SCREEN - Can you run 1 mile without stopping?
// =============================================================================

interface MileGateScreenProps {
    value: boolean | null;
    onChange: (canRun: boolean | null) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function MileGateScreen({ value, onChange, onContinue, onBack }: MileGateScreenProps) {
    // Calculate selection state BEFORE any early returns to avoid TypeScript narrowing issues
    const isYesSelected = value === true;
    const isNoSelected = value === false;
    const showNotReady = isNoSelected;

    useKeyboardNavigation({
        onEnter: isYesSelected ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            if (num === 1) {
                onChange(true);
                // Auto-advance on "yes"
                setTimeout(() => onContinue(), 150);
            }
            if (num === 2) onChange(false);
        },
    });

    if (showNotReady) {
        return (
            <QuestionScreen onBack={() => onChange(null)}>
                <QuestionHeader
                    title="Build your foundation first"
                />

                <div className="space-y-6 text-center">
                    <p className="v3-body-md" style={{ color: 'var(--text-muted)' }}>
                        Our training plans assume you can run continuously.
                        The Couch to 5K program is perfect for building up to that point.
                    </p>

                    <div className="v3-card p-6 text-left" style={{ borderColor: 'var(--border-base)' }}>
                        <p className="v3-label mb-2">Recommended: Couch to 5K (C25K)</p>
                        <p className="v3-body-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                            A proven 9-week walk/run program that gradually builds you up to running 3 miles without stopping.
                        </p>
                        <a
                            href="https://c25k.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="v3-btn v3-btn-primary"
                        >
                            Start C25K Program
                        </a>
                    </div>

                    <p className="v3-body-sm" style={{ color: 'var(--text-subtle)' }}>
                        Once you can run 1 mile, come back and we'll build your training plan!
                    </p>
                </div>
            </QuestionScreen>
        );
    }

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="Quick check first"
                subtitle="Can you run 1 mile without stopping?"
            />

            <div className="space-y-3">
                <OptionButton
                    label="Yes, I can run a mile"
                    description="Great! Let's find your training approach."
                    shortcut="1"
                    selected={isYesSelected}
                    onClick={() => {
                        onChange(true);
                        setTimeout(() => onContinue(), 150);
                    }}
                />
                <OptionButton
                    label="Not yet"
                    description="That's okay — we'll point you in the right direction."
                    shortcut="2"
                    selected={isNoSelected}
                    onClick={() => onChange(false)}
                />
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
    onDobChange: (dob: string | null) => void;
    onSexChange: (sex: 'male' | 'female') => void;
    onContinue: () => void;
    onBack: () => void;
}

// Helper to calculate age from DOB
function calculateAge(dob: string): number {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

export function DemographicsScreen({
    data,
    onDobChange,
    onSexChange,
    onContinue,
    onBack
}: DemographicsScreenProps) {
    // Calculate age from DOB for display and validation
    const age = data.dateOfBirth ? calculateAge(data.dateOfBirth) : null;
    const isValidAge = age !== null && age >= 13 && age <= 99;
    const canContinue = isValidAge && data.sex !== null;

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
                {/* Date of Birth */}
                <div>
                    <label className="v3-label block mb-2">Date of Birth</label>
                    <input
                        type="date"
                        value={data.dateOfBirth || ''}
                        onChange={(e) => onDobChange(e.target.value || null)}
                        className="v3-input w-full"
                        max={toDateKey(addYears(new Date(), -13))}
                        min={toDateKey(addYears(new Date(), -99))}
                        style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-base)',
                            borderRadius: '0.75rem',
                            padding: '0.75rem 1rem',
                            color: 'var(--text-base)',
                            fontSize: '1rem',
                        }}
                    />
                    {age !== null && (
                        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                            Age: <span style={{ color: 'var(--text-base)' }}>{age} years old</span>
                        </p>
                    )}
                </div>

                {/* Sex */}
                <div>
                    <label className="v3-label block mb-2">Biological sex</label>
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
