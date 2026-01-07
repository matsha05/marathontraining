'use client';

/**
 * THE LONG GAME - Quick Plan Regeneration
 * 
 * Streamlined flow for existing users to create a new training plan.
 * Pre-loads identity data from the database, shows current VDOT with
 * optional recalibration, and only asks plan-specific questions.
 * 
 * Steps:
 * 1. VDOT confirmation/recalibrate
 * 2. Training goal
 * 3. Race details (if applicable)
 * 4. Schedule (days, long run days, start date)
 * 5. Preferences (intensity, strength)
 * 6. Generate
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Check, RefreshCw } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase';
import { usePlan } from '@/domain/plan/context';

// Reuse onboarding components
import {
    QuestionScreen,
    QuestionHeader,
    OptionButton,
    OptionGrid,
    ContinueButton,
} from '@/components/onboarding/ui';
import {
    TrainingGoalScreen,
    RaceDetailsScreen,
} from '@/components/onboarding/screens/goal';
import {
    WeeklyMileageScreen,
    RunsPerWeekScreen,
    LongestRunScreen,
    AvailableDaysScreen,
    LongRunDayScreen,
    PlanStartDateScreen,
} from '@/components/onboarding/screens/training-load';
import {
    TrainingIntensityScreen,
    StrengthTrainingScreen,
} from '@/components/onboarding/screens/preferences';

import { OnboardingData, INITIAL_ONBOARDING_DATA, TrainingGoal, TrainingIntensity } from '@/domain/onboarding/types';
import { createPlanFromOnboarding, savePlan } from '@/domain/plan/service';
import { parseAvatarId } from '@/domain/user/avatars';

// Regeneration steps (much shorter than full onboarding)
type RegenerateStep =
    | 'loading'
    | 'vdot-confirm'
    | 'training-goal'
    | 'race-details'
    | 'weekly-mileage'
    | 'runs-per-week'
    | 'longest-run'
    | 'available-days'
    | 'long-run-day'
    | 'plan-start-date'
    | 'training-intensity'
    | 'strength-training'
    | 'generating'
    | 'complete';

export default function RegeneratePlanPage() {
    const router = useRouter();
    const { plan, refreshPlan } = usePlan();

    const [step, setStep] = useState<RegenerateStep>('loading');
    const [data, setData] = useState<OnboardingData>(INITIAL_ONBOARDING_DATA);
    const [currentVdot, setCurrentVdot] = useState<number | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load existing user data on mount
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const supabase = createSupabaseBrowserClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push('/auth');
                    return;
                }

                // Fetch athlete profile
                const { data: athlete } = await supabase
                    .from('athletes')
                    .select('name, date_of_birth, age, sex, avatar')
                    .eq('id', user.id)
                    .single() as { data: { name?: string; date_of_birth?: string; age?: number; sex?: string; avatar?: string } | null };

                // Get current VDOT from existing plan
                const vdot = plan?.vdot || null;
                setCurrentVdot(vdot);

                // Pre-populate data with existing profile
                setData(prev => ({
                    ...prev,
                    name: athlete?.name || prev.name,
                    dateOfBirth: athlete?.date_of_birth || null,
                    age: athlete?.age || prev.age,
                    sex: (athlete?.sex as 'male' | 'female') || prev.sex,
                    avatar: athlete?.avatar ? parseAvatarId(athlete.avatar) : prev.avatar,
                    vdot: vdot || prev.vdot,
                    vdotConfidence: vdot ? 'high' : prev.vdotConfidence,
                }));

                setStep('vdot-confirm');
            } catch (err) {
                console.error('Failed to load user data:', err);
                setError('Failed to load your profile. Please try again.');
            }
        };

        loadUserData();
    }, [plan, router]);

    // Navigation
    const getNextStep = (current: RegenerateStep): RegenerateStep => {
        switch (current) {
            case 'vdot-confirm': return 'training-goal';
            case 'training-goal':
                return data.trainingGoal === 'general' ? 'weekly-mileage' : 'race-details';
            case 'race-details': return 'weekly-mileage';
            case 'weekly-mileage': return 'runs-per-week';
            case 'runs-per-week': return 'longest-run';
            case 'longest-run': return 'available-days';
            case 'available-days': return 'long-run-day';
            case 'long-run-day': return 'plan-start-date';
            case 'plan-start-date': return 'training-intensity';
            case 'training-intensity': return 'strength-training';
            case 'strength-training': return 'generating';
            default: return current;
        }
    };

    const getPreviousStep = (current: RegenerateStep): RegenerateStep => {
        switch (current) {
            case 'training-goal': return 'vdot-confirm';
            case 'race-details': return 'training-goal';
            case 'weekly-mileage':
                return data.trainingGoal === 'general' ? 'training-goal' : 'race-details';
            case 'runs-per-week': return 'weekly-mileage';
            case 'longest-run': return 'runs-per-week';
            case 'available-days': return 'longest-run';
            case 'long-run-day': return 'available-days';
            case 'plan-start-date': return 'long-run-day';
            case 'training-intensity': return 'plan-start-date';
            case 'strength-training': return 'training-intensity';
            default: return current;
        }
    };

    const goToNext = () => {
        const next = getNextStep(step);
        if (next === 'generating') {
            handleGenerate();
        } else {
            setStep(next);
        }
    };

    const goBack = () => {
        if (step === 'vdot-confirm') {
            router.push('/settings');
        } else {
            setStep(getPreviousStep(step));
        }
    };

    // Generate the new plan
    const handleGenerate = async () => {
        setStep('generating');
        setIsGenerating(true);
        setError(null); // Clear previous errors

        try {
            const supabase = createSupabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Generate plan from onboarding data
            const planResult = createPlanFromOnboarding(data);
            if (!planResult.success) {
                // Show the actual error message
                setError(planResult.error?.message || 'Failed to generate plan');
                setStep('vdot-confirm'); // Go back to start so user can fix issues
                return;
            }

            // Save to database (user ID fetched internally)
            await savePlan(planResult.data);
            await refreshPlan();

            setStep('complete');
        } catch (err) {
            console.error('Plan generation failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate plan. Please try again.');
            setStep('vdot-confirm'); // Go back to start so user can review all data
        } finally {
            setIsGenerating(false);
        }
    };

    // Progress calculation
    const stepOrder: RegenerateStep[] = [
        'vdot-confirm', 'training-goal', 'race-details',
        'weekly-mileage', 'runs-per-week', 'longest-run',
        'available-days', 'long-run-day', 'plan-start-date',
        'training-intensity', 'strength-training'
    ];
    const currentIndex = stepOrder.indexOf(step);
    const progress = currentIndex >= 0 ? ((currentIndex + 1) / stepOrder.length) * 100 : 0;

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
            {/* Header with progress */}
            <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3" style={{ background: 'var(--bg-base)' }}>
                <div className="max-w-lg mx-auto flex items-center gap-4">
                    <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-white/5">
                        <ArrowLeft size={20} style={{ color: 'var(--text-muted)' }} />
                    </button>
                    <div className="flex-1">
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                            <motion.div
                                className="h-full"
                                style={{ background: 'var(--color-accent)' }}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>
                    <span className="text-xs tabular-nums" style={{ color: 'var(--text-subtle)' }}>
                        {currentIndex + 1}/{stepOrder.length}
                    </span>
                </div>
            </header>

            {/* Content */}
            <main className="pt-20 pb-8 px-4">
                <div className="max-w-lg mx-auto">
                    <AnimatePresence mode="wait">
                        {/* Loading */}
                        {step === 'loading' && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center min-h-[60vh]"
                            >
                                <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: 'var(--color-accent)' }} />
                                <p style={{ color: 'var(--text-muted)' }}>Loading your profile...</p>
                            </motion.div>
                        )}

                        {/* VDOT Confirmation */}
                        {step === 'vdot-confirm' && (
                            <motion.div
                                key="vdot"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <QuestionScreen onBack={goBack}>
                                    <QuestionHeader
                                        title="Your current fitness level"
                                        subtitle="We'll use this to calculate your training paces."
                                    />

                                    {/* Error display */}
                                    {error && (
                                        <div className="mb-4 p-4 rounded-lg" style={{ background: 'var(--v3-error-subtle)' }}>
                                            <p className="text-sm font-medium" style={{ color: 'var(--v3-error)' }}>Plan generation failed</p>
                                            <p className="text-sm mt-1" style={{ color: 'var(--v3-error)' }}>{error}</p>
                                        </div>
                                    )}

                                    {/* VDOT Display */}
                                    <div
                                        className="p-6 rounded-2xl text-center mb-6"
                                        style={{
                                            background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 15%, transparent), color-mix(in srgb, var(--color-accent) 5%, transparent))',
                                            border: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)'
                                        }}
                                    >
                                        <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-subtle)' }}>
                                            Current VDOT
                                        </p>
                                        <p className="text-5xl font-light mb-2" style={{ color: 'var(--color-accent)' }}>
                                            {currentVdot || data.vdot || '—'}
                                        </p>
                                        {currentVdot && (
                                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                                Based on your previous plan
                                            </p>
                                        )}
                                    </div>

                                    <OptionGrid columns={1}>
                                        <OptionButton
                                            label="Use this VDOT"
                                            description="Continue with your current fitness level"
                                            selected={true}
                                            onClick={goToNext}
                                            recommended
                                        />
                                        <OptionButton
                                            label="Recalibrate my VDOT"
                                            description="I've improved or have new race data"
                                            selected={false}
                                            onClick={() => {
                                                // TODO: Add inline VDOT recalibration flow
                                                // For now, show a message that they can do this after
                                                alert('After creating your plan, you can recalibrate from Settings > Profile.');
                                            }}
                                        />
                                    </OptionGrid>

                                    <ContinueButton onClick={goToNext} disabled={!currentVdot && !data.vdot} />
                                </QuestionScreen>
                            </motion.div>
                        )}

                        {/* Training Goal */}
                        {step === 'training-goal' && (
                            <motion.div
                                key="goal"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <TrainingGoalScreen
                                    selected={data.trainingGoal}
                                    onSelect={(trainingGoal) => setData(prev => ({ ...prev, trainingGoal: trainingGoal as TrainingGoal }))}
                                    onContinue={goToNext}
                                    onBack={goBack}
                                />
                            </motion.div>
                        )}

                        {/* Race Details (combined name + date) */}
                        {step === 'race-details' && (
                            <motion.div
                                key="race-details"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <RaceDetailsScreen
                                    data={data}
                                    onRaceNameChange={(raceName) => setData(prev => ({ ...prev, raceName }))}
                                    onRaceDateChange={(raceDate) => setData(prev => ({ ...prev, raceDate }))}
                                    onContinue={goToNext}
                                    onBack={goBack}
                                />
                            </motion.div>
                        )}

                        {/* Weekly Mileage */}
                        {step === 'weekly-mileage' && (
                            <motion.div
                                key="weekly-mileage"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <WeeklyMileageScreen
                                    value={data.weeklyMiles}
                                    onChange={(weeklyMiles) => setData(prev => ({ ...prev, weeklyMiles }))}
                                    onContinue={goToNext}
                                    onBack={goBack}
                                />
                            </motion.div>
                        )}

                        {/* Runs Per Week */}
                        {step === 'runs-per-week' && (
                            <motion.div
                                key="runs-per-week"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <RunsPerWeekScreen
                                    value={data.runsPerWeek}
                                    onChange={(runsPerWeek) => setData(prev => ({ ...prev, runsPerWeek }))}
                                    onContinue={goToNext}
                                    onBack={goBack}
                                />
                            </motion.div>
                        )}

                        {/* Longest Run */}
                        {step === 'longest-run' && (
                            <motion.div
                                key="longest-run"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <LongestRunScreen
                                    value={data.longestRecentRun}
                                    onChange={(longestRecentRun) => setData(prev => ({ ...prev, longestRecentRun }))}
                                    onContinue={goToNext}
                                    onBack={goBack}
                                />
                            </motion.div>
                        )}

                        {/* Available Days */}
                        {step === 'available-days' && (
                            <motion.div
                                key="available-days"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <AvailableDaysScreen
                                    value={data.availableDays}
                                    onChange={(availableDays) => setData(prev => ({ ...prev, availableDays }))}
                                    onContinue={goToNext}
                                    onBack={goBack}
                                />
                            </motion.div>
                        )}

                        {/* Long Run Day */}
                        {step === 'long-run-day' && (
                            <motion.div
                                key="long-run-day"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <LongRunDayScreen
                                    value={data.longRunDays}
                                    onChange={(longRunDays) => setData(prev => ({ ...prev, longRunDays }))}
                                    onContinue={goToNext}
                                    onBack={goBack}
                                />
                            </motion.div>
                        )}

                        {/* Plan Start Date */}
                        {step === 'plan-start-date' && (
                            <motion.div
                                key="plan-start-date"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <PlanStartDateScreen
                                    value={data.planStartDate}
                                    raceDate={data.raceDate}
                                    onChange={(planStartDate) => setData(prev => ({ ...prev, planStartDate }))}
                                    onContinue={goToNext}
                                    onBack={goBack}
                                />
                            </motion.div>
                        )}

                        {/* Training Intensity */}
                        {step === 'training-intensity' && (
                            <motion.div
                                key="intensity"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <TrainingIntensityScreen
                                    value={data.trainingIntensity}
                                    onChange={(trainingIntensity) => setData(prev => ({ ...prev, trainingIntensity: trainingIntensity as TrainingIntensity }))}
                                    onContinue={goToNext}
                                    onBack={goBack}
                                />
                            </motion.div>
                        )}

                        {/* Strength Training */}
                        {step === 'strength-training' && (
                            <motion.div
                                key="strength"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <StrengthTrainingScreen
                                    value={data.includeStrength}
                                    onChange={(includeStrength) => setData(prev => ({ ...prev, includeStrength }))}
                                    onContinue={goToNext}
                                    onBack={goBack}
                                />
                            </motion.div>
                        )}

                        {/* Generating */}
                        {step === 'generating' && (
                            <motion.div
                                key="generating"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center min-h-[60vh]"
                            >
                                <Loader2 className="w-12 h-12 animate-spin mb-6" style={{ color: 'var(--color-accent)' }} />
                                <h2 className="text-xl font-medium mb-2">Building your new plan...</h2>
                                <p style={{ color: 'var(--text-muted)' }}>This will just take a moment.</p>
                            </motion.div>
                        )}

                        {/* Complete */}
                        {step === 'complete' && (
                            <motion.div
                                key="complete"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                            >
                                <div
                                    className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                                    style={{ background: 'var(--v3-success-subtle)' }}
                                >
                                    <Check className="w-10 h-10" style={{ color: 'var(--v3-success)' }} />
                                </div>
                                <h2 className="text-2xl font-medium mb-2">Your new plan is ready!</h2>
                                <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
                                    Time to get after it.
                                </p>
                                <div className="space-y-3 w-full max-w-xs">
                                    <button
                                        onClick={() => router.push('/plan')}
                                        className="v3-btn v3-btn-primary w-full"
                                    >
                                        View Plan
                                    </button>
                                    <button
                                        onClick={() => router.push('/dashboard')}
                                        className="v3-btn v3-btn-secondary w-full"
                                    >
                                        Go to Dashboard
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error display */}
                    {error && (
                        <div className="mt-4 p-4 rounded-lg" style={{ background: 'var(--v3-error-subtle)' }}>
                            <p className="text-sm" style={{ color: 'var(--v3-error)' }}>{error}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
