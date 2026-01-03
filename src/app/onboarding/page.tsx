"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ActivityIcon } from '@/components/ui/activity';
import { CircleCheckIcon } from '@/components/ui/circle-check';

/**
 * THE LONG GAME - World-Class Onboarding
 * 
 * Apple-inspired, one task per screen, progressive disclosure
 */

type OnboardingStep =
    | 'welcome'
    | 'name'
    | 'experience'
    | 'recent-race'
    | 'vdot-reveal'
    | 'goal-race'
    | 'race-date'
    | 'equipment'
    | 'generating'
    | 'complete';

interface OnboardingData {
    name: string;
    experienceMonths: number;
    recentRaceDistance: string;
    recentRaceTime: string;
    vdot: number | null;
    goalRaceDistance: string;
    goalRaceDate: string;
    equipment: string[];
}

const RACE_DISTANCES = [
    { value: '5k', label: '5K', meters: 5000 },
    { value: '10k', label: '10K', meters: 10000 },
    { value: 'half', label: 'Half', meters: 21097.5 },
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

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<OnboardingStep>('welcome');
    const [mounted, setMounted] = useState(false);
    const [animating, setAnimating] = useState(false);

    const [data, setData] = useState<OnboardingData>({
        name: '',
        experienceMonths: 12,
        recentRaceDistance: '10k',
        recentRaceTime: '',
        vdot: null,
        goalRaceDistance: 'marathon',
        goalRaceDate: '',
        equipment: [],
    });

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

    const calculateVDOT = (distance: string, timeString: string): number => {
        const distanceM = RACE_DISTANCES.find(d => d.value === distance)?.meters || 10000;
        const parts = timeString.split(':').map(Number);
        let seconds = 0;
        if (parts.length === 3) {
            seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            seconds = parts[0] * 60 + parts[1];
        }
        if (seconds === 0) return 40;

        const velocity = distanceM / (seconds / 60);
        const timeMinutes = seconds / 60;
        const percentVO2max = 0.8 + 0.1894393 * Math.exp(-0.012778 * timeMinutes) +
            0.2989558 * Math.exp(-0.1932605 * timeMinutes);
        const vo2Cost = -4.60 + 0.182258 * velocity + 0.000104 * velocity * velocity;
        return Math.round((vo2Cost / percentVO2max) * 10) / 10;
    };

    const handleRaceTimeSubmit = () => {
        const vdot = calculateVDOT(data.recentRaceDistance, data.recentRaceTime);
        setData({ ...data, vdot });
        goToStep('vdot-reveal');
    };

    const containerClass = `min-h-screen flex flex-col items-center justify-center px-6 transition-opacity duration-150 ${animating ? 'opacity-0' : 'opacity-100'}`;

    if (!mounted) return null;

    // =========================================================================
    // STEP: Welcome
    // =========================================================================
    if (step === 'welcome') {
        return (
            <div className={containerClass}>
                <div className="container-narrow text-center">
                    {/* Logo */}
                    <div className="w-20 h-20 rounded-3xl bg-[var(--color-accent)] flex items-center justify-center mx-auto mb-8 animate-scale-in">
                        <ActivityIcon size={40} className="text-black" />
                    </div>

                    <h1 className="text-display-md mb-4 animate-fade-in">
                        The Long Game
                    </h1>

                    <p className="text-body-lg text-[var(--text-muted)] mb-12 animate-fade-in">
                        Training that adapts to you.<br />
                        Built on science. Not opinions.
                    </p>

                    <button
                        onClick={() => goToStep('name')}
                        className="btn btn-primary btn-lg w-full max-w-xs animate-fade-in"
                    >
                        Get Started
                    </button>

                    <p className="text-caption mt-6 animate-fade-in">
                        2 minutes to your personalized plan
                    </p>
                </div>
            </div>
        );
    }

    // =========================================================================
    // STEP: Name
    // =========================================================================
    if (step === 'name') {
        return (
            <div className={containerClass}>
                <div className="container-narrow">
                    <p className="text-label text-[var(--color-accent)] mb-2">Step 1 of 6</p>
                    <h1 className="text-display-md mb-2">
                        What should we call you?
                    </h1>
                    <p className="text-body-md text-[var(--text-muted)] mb-8">
                        Your first name is perfect.
                    </p>

                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        placeholder="Your name"
                        className="input text-xl mb-6"
                        autoFocus
                    />

                    <button
                        onClick={() => goToStep('experience')}
                        disabled={!data.name.trim()}
                        className="btn btn-primary btn-lg w-full disabled:opacity-40"
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    // =========================================================================
    // STEP: Experience
    // =========================================================================
    if (step === 'experience') {
        const experienceOptions = [
            { months: 3, label: 'Just starting', sub: 'Less than 3 months' },
            { months: 12, label: 'Building base', sub: '3-12 months' },
            { months: 36, label: 'Experienced', sub: '1-3 years' },
            { months: 60, label: 'Veteran', sub: '3+ years' },
        ];

        return (
            <div className={containerClass}>
                <div className="container-narrow">
                    <p className="text-label text-[var(--color-accent)] mb-2">Step 2 of 6</p>
                    <h1 className="text-display-md mb-2">
                        How long have you been running?
                    </h1>
                    <p className="text-body-md text-[var(--text-muted)] mb-8">
                        This helps us set appropriate training loads.
                    </p>

                    <div className="space-y-3 mb-8">
                        {experienceOptions.map((opt) => (
                            <button
                                key={opt.months}
                                onClick={() => setData({ ...data, experienceMonths: opt.months })}
                                className={`w-full p-4 rounded-xl text-left transition-all border ${data.experienceMonths === opt.months
                                    ? 'bg-[var(--color-accent)] text-black border-transparent'
                                    : 'bg-[var(--bg-elevated)] border-[var(--border-base)] hover:border-[var(--border-emphasis)]'
                                    }`}
                            >
                                <p className="text-heading-sm">{opt.label}</p>
                                <p className={`text-body-sm ${data.experienceMonths === opt.months ? 'text-black/70' : 'text-[var(--text-muted)]'}`}>
                                    {opt.sub}
                                </p>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => goToStep('recent-race')}
                        className="btn btn-primary btn-lg w-full"
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    // =========================================================================
    // STEP: Recent Race
    // =========================================================================
    if (step === 'recent-race') {
        return (
            <div className={containerClass}>
                <div className="container-narrow">
                    <p className="text-label text-[var(--color-accent)] mb-2">Step 3 of 6</p>
                    <h1 className="text-display-md mb-2">
                        Your best recent race
                    </h1>
                    <p className="text-body-md text-[var(--text-muted)] mb-8">
                        This calculates your VDOT—the key to precise pacing.
                    </p>

                    {/* Distance selector */}
                    <p className="text-label mb-2">Distance</p>
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        {RACE_DISTANCES.map((d) => (
                            <button
                                key={d.value}
                                onClick={() => setData({ ...data, recentRaceDistance: d.value })}
                                className={`p-3 rounded-xl text-body-sm font-semibold transition-all border ${data.recentRaceDistance === d.value
                                    ? 'bg-[var(--color-accent)] text-black border-transparent'
                                    : 'bg-[var(--bg-elevated)] border-[var(--border-base)]'
                                    }`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>

                    {/* Time input */}
                    <p className="text-label mb-2">Finish Time</p>
                    <input
                        type="text"
                        value={data.recentRaceTime}
                        onChange={(e) => setData({ ...data, recentRaceTime: e.target.value })}
                        placeholder={data.recentRaceDistance === 'marathon' || data.recentRaceDistance === 'half' ? '1:45:00' : '45:00'}
                        className="input text-xl text-data mb-2"
                    />
                    <p className="text-caption mb-8">
                        Enter as H:MM:SS or MM:SS
                    </p>

                    <button
                        onClick={handleRaceTimeSubmit}
                        disabled={!data.recentRaceTime}
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
        return (
            <div className={containerClass}>
                <div className="container-narrow text-center">
                    <p className="text-label text-[var(--color-accent)] mb-4">Your VDOT</p>

                    <div className="relative inline-block mb-8">
                        <div className="text-display-xl text-data animate-scale-in" style={{ fontSize: '6rem' }}>
                            {data.vdot}
                        </div>
                    </div>

                    <p className="text-body-lg text-[var(--text-muted)] mb-4 animate-fade-in">
                        This is your fitness fingerprint.
                    </p>

                    <p className="text-caption mb-12 animate-fade-in">
                        Every pace zone, every workout target—<br />
                        calculated from this single number.
                    </p>

                    <button
                        onClick={() => goToStep('goal-race')}
                        className="btn btn-primary btn-lg w-full max-w-xs"
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
        const goalOptions = [
            { value: '5k', label: '5K', icon: '🏃' },
            { value: '10k', label: '10K', icon: '🏃‍♂️' },
            { value: 'half', label: 'Half Marathon', icon: '🏅' },
            { value: 'marathon', label: 'Marathon', icon: '🎖️' },
        ];

        return (
            <div className={containerClass}>
                <div className="container-narrow">
                    <p className="text-label text-[var(--color-accent)] mb-2">Step 4 of 6</p>
                    <h1 className="text-display-md mb-2">
                        What are you training for?
                    </h1>
                    <p className="text-body-md text-[var(--text-muted)] mb-8">
                        We'll build your plan around this goal.
                    </p>

                    <div className="space-y-3 mb-8">
                        {goalOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setData({ ...data, goalRaceDistance: opt.value })}
                                className={`w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all border ${data.goalRaceDistance === opt.value
                                    ? 'bg-[var(--color-accent)] text-black border-transparent'
                                    : 'bg-[var(--bg-elevated)] border-[var(--border-base)] hover:border-[var(--border-emphasis)]'
                                    }`}
                            >
                                <span className="text-2xl">{opt.icon}</span>
                                <span className="text-heading-sm">{opt.label}</span>
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
        return (
            <div className={containerClass}>
                <div className="container-narrow">
                    <p className="text-label text-[var(--color-accent)] mb-2">Step 5 of 6</p>
                    <h1 className="text-display-md mb-2">
                        When is race day?
                    </h1>
                    <p className="text-body-md text-[var(--text-muted)] mb-8">
                        We'll work backwards to build your training blocks.
                    </p>

                    <input
                        type="date"
                        value={data.goalRaceDate}
                        onChange={(e) => setData({ ...data, goalRaceDate: e.target.value })}
                        className="input text-lg mb-8"
                        min={new Date().toISOString().split('T')[0]}
                    />

                    <button
                        onClick={() => goToStep('equipment')}
                        disabled={!data.goalRaceDate}
                        className="btn btn-primary btn-lg w-full disabled:opacity-40"
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    // =========================================================================
    // STEP: Equipment
    // =========================================================================
    if (step === 'equipment') {
        const toggleEquipment = (id: string) => {
            const current = data.equipment;
            const updated = current.includes(id)
                ? current.filter(e => e !== id)
                : [...current, id];
            setData({ ...data, equipment: updated });
        };

        return (
            <div className={containerClass}>
                <div className="container-narrow">
                    <p className="text-label text-[var(--color-accent)] mb-2">Step 6 of 6</p>
                    <h1 className="text-display-md mb-2">
                        What equipment do you have?
                    </h1>
                    <p className="text-body-md text-[var(--text-muted)] mb-8">
                        We'll tailor strength work to what's available.
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {EQUIPMENT_OPTIONS.map((eq) => (
                            <button
                                key={eq.id}
                                onClick={() => toggleEquipment(eq.id)}
                                className={`p-4 rounded-xl text-left transition-all border ${data.equipment.includes(eq.id)
                                    ? 'bg-[var(--color-strength)] text-white border-transparent'
                                    : 'bg-[var(--bg-elevated)] border-[var(--border-base)]'
                                    }`}
                            >
                                <span className="text-2xl block mb-1">{eq.icon}</span>
                                <span className="text-body-sm font-medium">{eq.label}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => goToStep('generating')}
                        className="btn btn-primary btn-lg w-full"
                    >
                        Generate My Plan
                    </button>

                    <button
                        onClick={() => goToStep('generating')}
                        className="w-full text-center text-[var(--text-muted)] mt-4 text-body-sm"
                    >
                        I'll add equipment later
                    </button>
                </div>
            </div>
        );
    }

    // =========================================================================
    // STEP: Generating
    // =========================================================================
    if (step === 'generating') {
        useEffect(() => {
            const timer = setTimeout(() => {
                goToStep('complete');
            }, 2500);
            return () => clearTimeout(timer);
        }, []);

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

                    <h1 className="text-heading-lg mb-6">
                        Building your plan...
                    </h1>

                    <div className="space-y-3 text-[var(--text-muted)]">
                        <p className="animate-fade-in text-body-md">Calculating pace zones from VDOT {data.vdot}</p>
                        <p className="animate-fade-in text-body-md" style={{ animationDelay: '400ms' }}>Structuring training phases</p>
                        <p className="animate-fade-in text-body-md" style={{ animationDelay: '800ms' }}>Integrating strength work</p>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================================
    // STEP: Complete
    // =========================================================================
    if (step === 'complete') {
        const getWeeksUntil = (dateStr: string): number => {
            if (!dateStr) return 12;
            const target = new Date(dateStr);
            const now = new Date();
            const diffMs = target.getTime() - now.getTime();
            return Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)));
        };

        return (
            <div className={containerClass}>
                <div className="container-narrow text-center">
                    <div className="w-20 h-20 rounded-full bg-[var(--color-accent)] flex items-center justify-center mx-auto mb-8 animate-scale-in">
                        <CircleCheckIcon size={40} className="text-black" />
                    </div>

                    <h1 className="text-display-md mb-4 animate-fade-in">
                        You're all set, {data.name}!
                    </h1>

                    <p className="text-body-lg text-[var(--text-muted)] mb-10 animate-fade-in">
                        Your {RACE_DISTANCES.find(d => d.value === data.goalRaceDistance)?.label} plan is ready.<br />
                        {getWeeksUntil(data.goalRaceDate)} weeks of precision training.
                    </p>

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
