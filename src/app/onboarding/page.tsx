"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircleCheckIcon } from '@/components/ui/circle-check';
import { calculateVdotFromRace, calculateVdotFromTimeTrial, estimateVdotConservative, formatPace, calculateTrainingPaces, type VdotEstimate } from '@/domain/vdot/vdot-estimator';
import { calculateInjuryRisk, getInjuryRiskSummary, type InjuryRiskAssessment } from '@/domain/injury/injury-risk';
import type { OnboardingProfile, Sex } from '@/domain/types/athlete';

/**
 * THE LONG GAME - Coach-Backed Onboarding
 * 
 * 4-Phase progressive onboarding based on what elite coaches actually assess:
 * - Phase 1: Safety screening
 * - Phase 2: Training load & background  
 * - Phase 3: Fitness calibration
 * - Phase 4: Goal & equipment
 */

type OnboardingStep =
    | 'welcome'
    | 'demographics'      // NEW: age, sex
    | 'safety'            // NEW: injury screening
    | 'training-load'     // NEW: weekly miles, runs/week
    | 'background'        // Running/strength history
    | 'calibration'       // Race, TT, or estimate
    | 'race-entry'        // If they have a race
    | 'vdot-reveal'       // Show calculated VDOT
    | 'goal-race'
    | 'race-date'
    | 'equipment'
    | 'generating'
    | 'complete';

const RACE_DISTANCES = [
    { value: '5k', label: '5K', meters: 5000 },
    { value: '10k', label: '10K', meters: 10000 },
    { value: 'half', label: 'Half Marathon', meters: 21097.5 },
    { value: 'marathon', label: 'Marathon', meters: 42195 },
];

const EQUIPMENT_OPTIONS = [
    { id: 'barbell', label: 'Barbell', icon: '🏋️' },
    { id: 'dumbbell', label: 'Dumbbells', icon: '💪' },
    { id: 'kettlebell', label: 'Kettlebells', icon: '🔔' },
    { id: 'pull_up_bar', label: 'Pull-up Bar', icon: '🔩' },
    { id: 'resistance_bands', label: 'Bands', icon: '➿' },
    { id: 'foam_roller', label: 'Foam Roller', icon: '🛢️' },
];

const STORAGE_KEY = 'longgame_onboarding';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<OnboardingStep>('welcome');
    const [mounted, setMounted] = useState(false);
    const [animating, setAnimating] = useState(false);

    // Core profile data
    const [profile, setProfile] = useState<Partial<OnboardingProfile>>({
        currentPainAffectsGait: false,
        injuryLast12Months: false,
        medicalConditions: [],
        runsPerWeek: 0,
        weeklyMiles: 0,
        longestRunMiles: 0,
        hardSessionsPerWeek: 0,
        runningBackground: 'new',
        priorMarathons: 0,
        strengthTraining: 'none',
        calibrationSource: 'estimated',
        goalDistance: 'marathon',
        goalTerrain: 'road',
    });

    // UI-specific state
    const [name, setName] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [sex, setSex] = useState<Sex | null>(null);
    const [vdotEstimate, setVdotEstimate] = useState<VdotEstimate | null>(null);
    const [injuryRisk, setInjuryRisk] = useState<InjuryRiskAssessment | null>(null);
    const [equipment, setEquipment] = useState<string[]>([]);

    // Race entry state (must be at top level for hooks rules)
    const [raceDistance, setRaceDistance] = useState('10k');
    const [raceTime, setRaceTime] = useState('');
    const [effortRPE, setEffortRPE] = useState(9);

    useEffect(() => {
        setMounted(true);
    }, []);

    const goToStep = (nextStep: OnboardingStep) => {
        setAnimating(true);
        setTimeout(() => {
            setStep(nextStep);
            setAnimating(false);
        }, 150);
    };

    // Timer for generating step
    useEffect(() => {
        if (step === 'generating') {
            const timer = setTimeout(() => {
                // Calculate final values
                const risk = calculateInjuryRisk(profile);
                setInjuryRisk(risk);

                // Save to localStorage
                const fullProfile = {
                    ...profile,
                    name,
                    age: typeof age === 'number' ? age : 30,
                    sex: sex || 'other',
                    equipment,
                    estimatedVdot: vdotEstimate?.vdot || 35,
                    vdotConfidence: vdotEstimate?.confidence || 'low',
                    injuryRiskScore: risk.score,
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(fullProfile));

                setAnimating(true);
                setTimeout(() => {
                    setStep('complete');
                    setAnimating(false);
                }, 150);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [step, profile, name, age, sex, equipment, vdotEstimate]);

    if (!mounted) return null;

    const containerClass = `min-h-screen flex items-center justify-center p-6 transition-opacity duration-150 ${animating ? 'opacity-0' : 'opacity-100'}`;

    // Helper for form submit handler
    const handleFormSubmit = (nextStep: OnboardingStep, canProceed: boolean) => (e: React.FormEvent) => {
        e.preventDefault();
        if (canProceed) goToStep(nextStep);
    };

    // =========================================================================
    // STEP: Welcome
    // =========================================================================
    if (step === 'welcome') {
        return (
            <div className={containerClass}>
                <div className="container-narrow text-center">
                    <div className="w-20 h-20 rounded-2xl bg-[var(--color-accent)] flex items-center justify-center mx-auto mb-8 animate-scale-in">
                        <span className="text-4xl">🏃</span>
                    </div>

                    <h1 className="text-display-xl mb-4 animate-fade-in">
                        The Long Game
                    </h1>

                    <p className="text-body-lg text-[var(--text-muted)] mb-10 max-w-md mx-auto animate-fade-in">
                        Precision marathon training built on elite methodologies. Let's build your personalized plan.
                    </p>

                    <button
                        onClick={() => goToStep('demographics')}
                        className="btn btn-primary btn-lg w-full max-w-xs animate-fade-in"
                    >
                        Get Started
                    </button>

                    <p className="text-body-sm text-[var(--text-subtle)] mt-6 animate-fade-in">
                        Takes about 3 minutes
                    </p>
                </div>
            </div>
        );
    }

    // =========================================================================
    // STEP: Demographics (age, sex)
    // =========================================================================
    if (step === 'demographics') {
        const canContinue = name.trim() && typeof age === 'number' && age > 0 && sex !== null;

        return (
            <div className={containerClass}>
                <div className="container-narrow">
                    <p className="text-label text-[var(--color-accent)] mb-2">Step 1 of 6</p>
                    <h1 className="text-display-md mb-2">Let's start with the basics</h1>
                    <p className="text-body-md text-[var(--text-muted)] mb-8">
                        We use this to personalize your training zones.
                    </p>

                    <form onSubmit={handleFormSubmit('safety', canContinue)}>
                        <div className="space-y-6 mb-8">
                            {/* Name */}
                            <div>
                                <label className="text-label block mb-2">Your name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="First name"
                                    className="input text-xl"
                                    autoFocus
                                />
                            </div>

                            {/* Age */}
                            <div>
                                <label className="text-label block mb-2">Age</label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
                                    placeholder="30"
                                    min={13}
                                    max={99}
                                    className="input text-xl w-32"
                                />
                                <span className="text-body-sm text-[var(--text-subtle)] ml-3">
                                    Affects recovery and training capacity
                                </span>
                            </div>

                            {/* Sex */}
                            <div>
                                <label className="text-label block mb-2">Biological sex</label>
                                <div className="flex gap-3">
                                    {[
                                        { value: 'male' as const, label: 'Male' },
                                        { value: 'female' as const, label: 'Female' },
                                        { value: 'other' as const, label: 'Prefer not to say' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setSex(opt.value)}
                                            className={`px-4 py-2 rounded-lg border transition-all ${sex === opt.value
                                                ? 'bg-[var(--color-accent)] text-black border-transparent'
                                                : 'bg-[var(--bg-elevated)] border-[var(--border-base)] hover:border-[var(--border-emphasis)]'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-caption text-[var(--text-subtle)] mt-2">
                                    Used for pace zone calculations
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!canContinue}
                            className="btn btn-primary btn-lg w-full disabled:opacity-40"
                        >
                            Continue
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // =========================================================================
    // STEP: Safety Screening
    // =========================================================================
    if (step === 'safety') {
        return (
            <div className={containerClass}>
                <div className="container-narrow">
                    <p className="text-label text-[var(--color-accent)] mb-2">Step 2 of 6</p>
                    <h1 className="text-display-md mb-2">Safety first</h1>
                    <p className="text-body-md text-[var(--text-muted)] mb-8">
                        We screen for injury risk factors to keep you healthy.
                    </p>

                    <div className="space-y-6 mb-8">
                        {/* Current pain */}
                        <div className="card p-5">
                            <p className="text-heading-sm mb-3">Any current pain that affects how you move?</p>
                            <div className="flex gap-3">
                                {[
                                    { value: false, label: 'No issues' },
                                    { value: true, label: 'Yes, some pain' },
                                ].map((opt) => (
                                    <button
                                        key={String(opt.value)}
                                        onClick={() => setProfile({ ...profile, currentPainAffectsGait: opt.value })}
                                        className={`flex-1 py-3 rounded-lg border transition-all ${profile.currentPainAffectsGait === opt.value
                                            ? 'bg-[var(--color-accent)] text-black border-transparent'
                                            : 'bg-[var(--bg-elevated)] border-[var(--border-base)]'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Injury in last 12 months */}
                        <div className="card p-5">
                            <p className="text-heading-sm mb-3">Injury in the last 12 months that stopped running for 2+ weeks?</p>
                            <div className="flex gap-3">
                                {[
                                    { value: false, label: 'No' },
                                    { value: true, label: 'Yes' },
                                ].map((opt) => (
                                    <button
                                        key={String(opt.value)}
                                        onClick={() => setProfile({ ...profile, injuryLast12Months: opt.value })}
                                        className={`flex-1 py-3 rounded-lg border transition-all ${profile.injuryLast12Months === opt.value
                                            ? 'bg-[var(--color-accent)] text-black border-transparent'
                                            : 'bg-[var(--bg-elevated)] border-[var(--border-base)]'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => goToStep('training-load')}
                        className="btn btn-primary btn-lg w-full"
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    // =========================================================================
    // STEP: Training Load (last 4 weeks)
    // =========================================================================
    if (step === 'training-load') {
        const canContinue = (profile.weeklyMiles ?? 0) >= 0;

        return (
            <div className={containerClass}>
                <div className="container-narrow">
                    <p className="text-label text-[var(--color-accent)] mb-2">Step 3 of 6</p>
                    <h1 className="text-display-md mb-2">Your current training</h1>
                    <p className="text-body-md text-[var(--text-muted)] mb-8">
                        In the <strong>last 4 weeks</strong>, what has your running looked like?
                    </p>

                    <form onSubmit={handleFormSubmit('background', canContinue)}>
                        <div className="space-y-6 mb-8">
                            {/* Weekly miles */}
                            <div>
                                <label className="text-label block mb-2">Average weekly miles</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={profile.weeklyMiles || ''}
                                        onChange={(e) => setProfile({ ...profile, weeklyMiles: parseFloat(e.target.value) || 0 })}
                                        placeholder="0"
                                        min={0}
                                        max={150}
                                        className="input text-xl w-24"
                                    />
                                    <span className="text-body-md text-[var(--text-muted)]">miles/week</span>
                                </div>
                            </div>

                            {/* Runs per week */}
                            <div>
                                <label className="text-label block mb-2">Runs per week</label>
                                <div className="flex gap-2">
                                    {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                                        <button
                                            key={n}
                                            type="button"
                                            onClick={() => setProfile({ ...profile, runsPerWeek: n })}
                                            className={`w-10 h-10 rounded-lg border transition-all ${profile.runsPerWeek === n
                                                ? 'bg-[var(--color-accent)] text-black border-transparent'
                                                : 'bg-[var(--bg-elevated)] border-[var(--border-base)]'
                                                }`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Longest run */}
                            <div>
                                <label className="text-label block mb-2">Longest run in last 4 weeks</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={profile.longestRunMiles || ''}
                                        onChange={(e) => setProfile({ ...profile, longestRunMiles: parseFloat(e.target.value) || 0 })}
                                        placeholder="0"
                                        min={0}
                                        max={50}
                                        className="input text-xl w-24"
                                    />
                                    <span className="text-body-md text-[var(--text-muted)]">miles</span>
                                </div>
                            </div>

                            {/* Hard sessions */}
                            <div>
                                <label className="text-label block mb-2">Hard sessions per week (tempo, intervals, etc.)</label>
                                <div className="flex gap-2">
                                    {[0, 1, 2, 3, 4].map((n) => (
                                        <button
                                            key={n}
                                            type="button"
                                            onClick={() => setProfile({ ...profile, hardSessionsPerWeek: n })}
                                            className={`w-12 h-10 rounded-lg border transition-all ${profile.hardSessionsPerWeek === n
                                                ? 'bg-[var(--color-accent)] text-black border-transparent'
                                                : 'bg-[var(--bg-elevated)] border-[var(--border-base)]'
                                                }`}
                                        >
                                            {n === 4 ? '4+' : n}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-full"
                        >
                            Continue
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // =========================================================================
    // STEP: Background (running history, strength)
    // =========================================================================
    if (step === 'background') {
        return (
            <div className={containerClass}>
                <div className="container-narrow">
                    <p className="text-label text-[var(--color-accent)] mb-2">Step 4 of 6</p>
                    <h1 className="text-display-md mb-2">Your background</h1>
                    <p className="text-body-md text-[var(--text-muted)] mb-8">
                        This helps us set appropriate progression rates.
                    </p>

                    <div className="space-y-6 mb-8">
                        {/* Running background */}
                        <div>
                            <label className="text-label block mb-3">Running experience</label>
                            <div className="space-y-2">
                                {[
                                    { value: 'new' as const, label: 'New to running', sub: 'Started in the past year' },
                                    { value: 'some' as const, label: 'Some experience', sub: '1-3 years, on and off' },
                                    { value: 'veteran' as const, label: 'Veteran', sub: '3+ years, even if not recent' },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setProfile({ ...profile, runningBackground: opt.value })}
                                        className={`w-full p-4 rounded-xl text-left transition-all border ${profile.runningBackground === opt.value
                                            ? 'bg-[var(--color-accent)] text-black border-transparent'
                                            : 'bg-[var(--bg-elevated)] border-[var(--border-base)] hover:border-[var(--border-emphasis)]'
                                            }`}
                                    >
                                        <p className="text-heading-sm">{opt.label}</p>
                                        <p className={`text-body-sm ${profile.runningBackground === opt.value ? 'text-black/70' : 'text-[var(--text-muted)]'}`}>
                                            {opt.sub}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Prior marathons */}
                        <div>
                            <label className="text-label block mb-3">Marathons completed</label>
                            <div className="flex gap-2">
                                {[0, 1, 2, 3].map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => setProfile({ ...profile, priorMarathons: n as 0 | 1 | 2 | 3 })}
                                        className={`flex-1 py-3 rounded-lg border transition-all ${profile.priorMarathons === n
                                            ? 'bg-[var(--color-accent)] text-black border-transparent'
                                            : 'bg-[var(--bg-elevated)] border-[var(--border-base)]'
                                            }`}
                                    >
                                        {n === 3 ? '3+' : n}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Strength training */}
                        <div>
                            <label className="text-label block mb-3">Current strength training</label>
                            <div className="space-y-2">
                                {[
                                    { value: 'none' as const, label: 'None', sub: 'No regular strength work' },
                                    { value: 'some' as const, label: 'Some', sub: '1-2x per week, basic' },
                                    { value: 'regular' as const, label: 'Regular', sub: '2-3x per week, structured' },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setProfile({ ...profile, strengthTraining: opt.value })}
                                        className={`w-full p-4 rounded-xl text-left transition-all border ${profile.strengthTraining === opt.value
                                            ? 'bg-[var(--color-accent)] text-black border-transparent'
                                            : 'bg-[var(--bg-elevated)] border-[var(--border-base)] hover:border-[var(--border-emphasis)]'
                                            }`}
                                    >
                                        <p className="text-heading-sm">{opt.label}</p>
                                        <p className={`text-body-sm ${profile.strengthTraining === opt.value ? 'text-black/70' : 'text-[var(--text-muted)]'}`}>
                                            {opt.sub}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => goToStep('calibration')}
                        className="btn btn-primary btn-lg w-full"
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    // =========================================================================
    // STEP: Calibration (how do we determine VDOT?)
    // =========================================================================
    if (step === 'calibration') {
        return (
            <div className={containerClass}>
                <div className="container-narrow">
                    <p className="text-label text-[var(--color-accent)] mb-2">Step 5 of 6</p>
                    <h1 className="text-display-md mb-2">Setting your training paces</h1>
                    <p className="text-body-md text-[var(--text-muted)] mb-8">
                        How should we determine your current fitness level?
                    </p>

                    <div className="space-y-3 mb-8">
                        {/* Option 1: Recent race */}
                        <button
                            onClick={() => {
                                setProfile({ ...profile, calibrationSource: 'race' });
                                goToStep('race-entry');
                            }}
                            className="w-full p-5 rounded-xl text-left transition-all border bg-[var(--bg-elevated)] border-[var(--border-base)] hover:border-[var(--color-accent)]"
                        >
                            <p className="text-heading-sm">I have a recent race time</p>
                            <p className="text-body-sm text-[var(--text-muted)]">
                                Best option — uses actual performance data
                            </p>
                        </button>

                        {/* Option 2: TT placeholder */}
                        <button
                            onClick={() => {
                                setProfile({ ...profile, calibrationSource: 'time_trial' });
                                // For now, go to race entry with TT mode
                                goToStep('race-entry');
                            }}
                            className="w-full p-5 rounded-xl text-left transition-all border bg-[var(--bg-elevated)] border-[var(--border-base)] hover:border-[var(--color-accent)]"
                        >
                            <p className="text-heading-sm">I'll do a time trial</p>
                            <p className="text-body-sm text-[var(--text-muted)]">
                                1-mile all-out or 12-min test — we'll guide you
                            </p>
                        </button>

                        {/* Option 3: Conservative estimate */}
                        <button
                            onClick={() => {
                                setProfile({ ...profile, calibrationSource: 'estimated' });
                                // Calculate conservative estimate
                                const estimate = estimateVdotConservative(
                                    typeof age === 'number' ? age : 30,
                                    sex || 'other',
                                    profile.weeklyMiles || 0,
                                    profile.runsPerWeek || 0,
                                    profile.strengthTraining || 'none'
                                );
                                setVdotEstimate(estimate);
                                goToStep('vdot-reveal');
                            }}
                            className="w-full p-5 rounded-xl text-left transition-all border bg-[var(--bg-elevated)] border-[var(--border-base)] hover:border-[var(--color-accent)]"
                        >
                            <p className="text-heading-sm">Start with a conservative estimate</p>
                            <p className="text-body-sm text-[var(--text-muted)]">
                                We'll calibrate from your training in week 1
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================================
    // STEP: Race Entry (or TT entry)
    // =========================================================================
    if (step === 'race-entry') {
        const isTT = profile.calibrationSource === 'time_trial';
        // raceDistance, raceTime, effortRPE state is now at top level

        const canContinue = raceTime.trim().length >= 4;

        const handleCalculate = () => {
            // Parse time string (MM:SS or HH:MM:SS)
            const parts = raceTime.split(':').map(Number);
            let seconds = 0;
            if (parts.length === 3) {
                seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
            } else if (parts.length === 2) {
                seconds = parts[0] * 60 + parts[1];
            }

            if (seconds <= 0) return;

            let estimate: VdotEstimate;
            if (isTT) {
                estimate = calculateVdotFromTimeTrial(raceDistance, seconds, effortRPE);
            } else {
                estimate = calculateVdotFromRace(raceDistance, seconds);
            }
            setVdotEstimate(estimate);
            goToStep('vdot-reveal');
        };

        return (
            <div className={containerClass}>
                <div className="container-narrow">
                    <p className="text-label text-[var(--color-accent)] mb-2">Step 5 of 6</p>
                    <h1 className="text-display-md mb-2">
                        {isTT ? 'Your time trial result' : 'Your recent race'}
                    </h1>
                    <p className="text-body-md text-[var(--text-muted)] mb-8">
                        {isTT
                            ? 'Enter the distance and time from your all-out effort.'
                            : 'Enter a race from the last 3 months for best accuracy.'
                        }
                    </p>

                    <div className="space-y-6 mb-8">
                        {/* Distance */}
                        <div>
                            <label className="text-label block mb-3">Distance</label>
                            <div className="flex gap-2">
                                {RACE_DISTANCES.map((d) => (
                                    <button
                                        key={d.value}
                                        onClick={() => setRaceDistance(d.value)}
                                        className={`flex-1 py-3 rounded-lg border transition-all ${raceDistance === d.value
                                            ? 'bg-[var(--color-accent)] text-black border-transparent'
                                            : 'bg-[var(--bg-elevated)] border-[var(--border-base)]'
                                            }`}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Time */}
                        <div>
                            <label className="text-label block mb-2">Finish time</label>
                            <input
                                type="text"
                                value={raceTime}
                                onChange={(e) => setRaceTime(e.target.value)}
                                placeholder={raceDistance === 'marathon' ? 'HH:MM:SS' : 'MM:SS'}
                                className="input text-xl"
                            />
                            <p className="text-caption text-[var(--text-subtle)] mt-2">
                                Example: {raceDistance === 'marathon' ? '3:45:00' : raceDistance === 'half' ? '1:45:00' : '45:30'}
                            </p>
                        </div>

                        {/* Effort RPE (for TT only) */}
                        {isTT && (
                            <div>
                                <label className="text-label block mb-2">How hard was it? (1-10)</label>
                                <div className="flex gap-1">
                                    {[6, 7, 8, 9, 10].map((n) => (
                                        <button
                                            key={n}
                                            onClick={() => setEffortRPE(n)}
                                            className={`flex-1 py-3 rounded-lg border transition-all ${effortRPE === n
                                                ? 'bg-[var(--color-accent)] text-black border-transparent'
                                                : 'bg-[var(--bg-elevated)] border-[var(--border-base)]'
                                                }`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-caption text-[var(--text-subtle)] mt-2">
                                    10 = absolute max effort, 8 = had more in the tank
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleCalculate}
                        disabled={!canContinue}
                        className="btn btn-primary btn-lg w-full disabled:opacity-40"
                    >
                        Calculate My VDOT
                    </button>
                </div>
            </div>
        );
    }

    // =========================================================================
    // STEP: VDOT Reveal
    // =========================================================================
    if (step === 'vdot-reveal') {
        const paces = vdotEstimate ? calculateTrainingPaces(vdotEstimate.vdot) : null;

        return (
            <div className={containerClass}>
                <div className="container-narrow text-center">
                    <p className="text-label text-[var(--color-accent)] mb-2">Your fitness profile</p>

                    <div className="card p-8 mb-8">
                        <p className="text-label mb-2">YOUR VDOT</p>
                        <p className="text-display-xl mb-2">{vdotEstimate?.vdot || '--'}</p>
                        <p className="text-body-sm text-[var(--text-muted)]">
                            {vdotEstimate?.confidence === 'high'
                                ? 'Based on your race performance'
                                : vdotEstimate?.confidence === 'medium'
                                    ? 'Estimated from time trial'
                                    : 'Conservative estimate — we\'ll refine in week 1'
                            }
                        </p>
                        {vdotEstimate?.notes && (
                            <p className="text-caption text-[var(--text-subtle)] mt-2">{vdotEstimate.notes}</p>
                        )}
                    </div>

                    {paces && (
                        <div className="card p-6 mb-8 text-left">
                            <p className="text-label mb-4">Your training paces</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-caption text-[var(--text-subtle)]">Easy</p>
                                    <p className="text-heading-sm">{formatPace(paces.easy.min)} - {formatPace(paces.easy.max)}/mi</p>
                                </div>
                                <div>
                                    <p className="text-caption text-[var(--text-subtle)]">Marathon</p>
                                    <p className="text-heading-sm">{formatPace(paces.marathon)}/mi</p>
                                </div>
                                <div>
                                    <p className="text-caption text-[var(--text-subtle)]">Threshold</p>
                                    <p className="text-heading-sm">{formatPace(paces.threshold)}/mi</p>
                                </div>
                                <div>
                                    <p className="text-caption text-[var(--text-subtle)]">Interval</p>
                                    <p className="text-heading-sm">{formatPace(paces.interval)}/mi</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => goToStep('goal-race')}
                        className="btn btn-primary btn-lg w-full"
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    // =========================================================================
    // STEP: Goal Race
    // =========================================================================
    if (step === 'goal-race') {
        return (
            <div className={containerClass}>
                <div className="container-narrow">
                    <p className="text-label text-[var(--color-accent)] mb-2">Step 6 of 6</p>
                    <h1 className="text-display-md mb-2">What are you training for?</h1>
                    <p className="text-body-md text-[var(--text-muted)] mb-8">
                        Your goal race determines the training structure.
                    </p>

                    <div className="space-y-3 mb-8">
                        {RACE_DISTANCES.map((d) => (
                            <button
                                key={d.value}
                                onClick={() => setProfile({ ...profile, goalDistance: d.value })}
                                className={`w-full p-4 rounded-xl text-left transition-all border ${profile.goalDistance === d.value
                                    ? 'bg-[var(--color-accent)] text-black border-transparent'
                                    : 'bg-[var(--bg-elevated)] border-[var(--border-base)] hover:border-[var(--border-emphasis)]'
                                    }`}
                            >
                                <p className="text-heading-sm">{d.label}</p>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => goToStep('race-date')}
                        className="btn btn-primary btn-lg w-full"
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    // =========================================================================
    // STEP: Race Date
    // =========================================================================
    if (step === 'race-date') {
        const canContinue = !!profile.goalDate;

        return (
            <div className={containerClass}>
                <div className="container-narrow">
                    <p className="text-label text-[var(--color-accent)] mb-2">Step 6 of 6</p>
                    <h1 className="text-display-md mb-2">When is race day?</h1>
                    <p className="text-body-md text-[var(--text-muted)] mb-8">
                        We'll work backwards to build your periodized plan.
                    </p>

                    <form onSubmit={handleFormSubmit('equipment', canContinue)}>
                        <input
                            type="date"
                            value={profile.goalDate || ''}
                            onChange={(e) => setProfile({ ...profile, goalDate: e.target.value })}
                            className="input text-xl mb-8"
                            min={new Date().toISOString().split('T')[0]}
                        />

                        <button
                            type="submit"
                            disabled={!canContinue}
                            className="btn btn-primary btn-lg w-full disabled:opacity-40"
                        >
                            Continue
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // =========================================================================
    // STEP: Equipment
    // =========================================================================
    if (step === 'equipment') {
        const toggleEquipment = (id: string) => {
            setEquipment(prev =>
                prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
            );
        };

        return (
            <div className={containerClass}>
                <div className="container-narrow">
                    <p className="text-label text-[var(--color-accent)] mb-2">Almost there</p>
                    <h1 className="text-display-md mb-2">What equipment do you have?</h1>
                    <p className="text-body-md text-[var(--text-muted)] mb-8">
                        Select all that you have access to for strength work.
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {EQUIPMENT_OPTIONS.map((eq) => (
                            <button
                                key={eq.id}
                                onClick={() => toggleEquipment(eq.id)}
                                className={`p-4 rounded-xl text-center transition-all border ${equipment.includes(eq.id)
                                    ? 'bg-[var(--color-accent)] text-black border-transparent'
                                    : 'bg-[var(--bg-elevated)] border-[var(--border-base)]'
                                    }`}
                            >
                                <span className="text-2xl block mb-2">{eq.icon}</span>
                                <span className="text-body-sm">{eq.label}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => goToStep('generating')}
                        className="btn btn-primary btn-lg w-full"
                    >
                        Generate My Plan
                    </button>
                </div>
            </div>
        );
    }

    // =========================================================================
    // STEP: Generating
    // =========================================================================
    if (step === 'generating') {
        return (
            <div className={containerClass}>
                <div className="container-narrow text-center">
                    <div className="relative w-24 h-24 mx-auto mb-8">
                        <svg className="w-full h-full animate-spin" style={{ animationDuration: '2s' }} viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" stroke="var(--bg-muted)" strokeWidth="4" fill="none" />
                            <circle
                                cx="50" cy="50" r="42"
                                stroke="var(--color-accent)"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray="66 198"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    <h1 className="text-heading-lg mb-6">Building your plan...</h1>

                    <div className="space-y-3 text-[var(--text-muted)]">
                        <p className="animate-fade-in text-body-md">Calculating pace zones from VDOT {vdotEstimate?.vdot}</p>
                        <p className="animate-fade-in text-body-md" style={{ animationDelay: '400ms' }}>Structuring training phases</p>
                        <p className="animate-fade-in text-body-md" style={{ animationDelay: '800ms' }}>Integrating durability work</p>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================================
    // STEP: Complete
    // =========================================================================
    if (step === 'complete') {
        const getWeeksUntil = () => {
            if (!profile.goalDate) return 12;
            const target = new Date(profile.goalDate);
            const now = new Date();
            const diffMs = target.getTime() - now.getTime();
            return Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)));
        };

        const goalLabel = RACE_DISTANCES.find(d => d.value === profile.goalDistance)?.label || 'race';

        return (
            <div className={containerClass}>
                <div className="container-narrow text-center">
                    <div className="w-20 h-20 rounded-full bg-[var(--color-accent)] flex items-center justify-center mx-auto mb-8 animate-scale-in">
                        <CircleCheckIcon size={40} className="text-black" />
                    </div>

                    <h1 className="text-display-md mb-4 animate-fade-in">
                        You're all set, {name}!
                    </h1>

                    <p className="text-body-lg text-[var(--text-muted)] mb-6 animate-fade-in">
                        Your {goalLabel} plan is ready.<br />
                        {getWeeksUntil()} weeks of precision training.
                    </p>

                    {injuryRisk && injuryRisk.level !== 'low' && (
                        <div className="card p-4 mb-6 text-left animate-fade-in border-l-4 border-l-amber-500">
                            <p className="text-body-sm">{getInjuryRiskSummary(injuryRisk)}</p>
                        </div>
                    )}

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="btn btn-primary btn-lg w-full max-w-xs animate-fade-in"
                    >
                        View My Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
