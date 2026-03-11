'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/domain/auth/context';
import { calculateReadiness } from '@/domain/onboarding/readiness';
import {
    EXPERIENCE_LEVELS,
    RACE_RECENCY_OPTIONS,
} from '@/domain/onboarding/constants';
import type {
    OnboardingData,
    OnboardingStep,
    RaceDistance,
    VdotConfidence,
} from '@/domain/onboarding/types';
import {
    INITIAL_ONBOARDING_DATA,
    clearOnboardingProgress,
    getNextStep,
    getPreviousStep,
    getStepProgress,
    loadOnboardingProgress,
    saveOnboardingProgress,
} from '@/domain/onboarding/types';
import { calculateVdotFromRace, vdotFromVO2max } from '@/domain/vdot/vdot-estimator';
import { generateAndPersistPlanFromOnboarding } from '@/domain/plan/service';

export type OnboardingPhase =
    | 'initializing'
    | 'has-plan'
    | 'resume-prompt'
    | 'active';

type SavedProgress = { step: OnboardingStep; data: OnboardingData } | null;

function calculateVdotFromData(data: OnboardingData): { vdot: number; confidence: VdotConfidence } {
    if (data.calibrationMethod === 'race' && data.raceDistance && data.raceTimeMinutes !== null) {
        const totalSeconds = (data.raceTimeMinutes * 60) + (data.raceTimeSeconds ?? 0);
        const result = calculateVdotFromRace(data.raceDistance as RaceDistance, totalSeconds);
        const recencyOption = RACE_RECENCY_OPTIONS.find(r => r.value === data.raceRecency);
        const adjustment = recencyOption?.vdotAdjustment ?? 0;
        return {
            vdot: Math.round(result.vdot + adjustment),
            confidence: data.raceRecency === 'recent' ? 'high' : 'medium',
        };
    }

    if (data.calibrationMethod === 'easy_pace' && data.easyPaceMinutes !== null) {
        const paceSeconds = (data.easyPaceMinutes * 60) + (data.easyPaceSeconds ?? 0);
        const diffSeconds = 600 - paceSeconds;
        const vdot = 40 + Math.round(diffSeconds / 8);
        return { vdot: Math.max(25, Math.min(75, vdot)), confidence: 'medium' };
    }

    if (data.calibrationMethod === 'effort' && data.effortType && data.effortTimeMinutes !== null) {
        if (data.effortType === 'parkrun') {
            const totalSeconds = (data.effortTimeMinutes * 60) + (data.effortTimeSeconds ?? 0);
            const effortAdjust = data.effortLevel ? (10 - data.effortLevel) * 0.5 : 0;
            const result = calculateVdotFromRace('5k', totalSeconds);
            return { vdot: Math.round(result.vdot + effortAdjust), confidence: 'medium' };
        }
        return { vdot: 38, confidence: 'low' };
    }

    if (data.calibrationMethod === 'estimate' && data.experienceLevel) {
        const level = EXPERIENCE_LEVELS.find(option => option.value === data.experienceLevel);
        return { vdot: level?.baseVdot ?? 35, confidence: 'low' };
    }

    if (data.calibrationMethod === 'vo2max' && data.garminVO2max !== null) {
        const result = vdotFromVO2max(data.garminVO2max);
        return { vdot: result.vdot, confidence: result.confidence };
    }

    return { vdot: 35, confidence: 'low' };
}

export function useOnboardingController() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { status: authStatus, athleteId } = useAuth();

    const [phase, setPhase] = useState<OnboardingPhase>('initializing');
    const [step, setStep] = useState<OnboardingStep>('welcome');
    const [data, setData] = useState<OnboardingData>(INITIAL_ONBOARDING_DATA);
    const [savedProgress, setSavedProgress] = useState<SavedProgress>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);

    const connectErrorMessage = useMemo(() => {
        const provider = searchParams.get('connect');
        const error = searchParams.get('error');
        if (!provider || !error) {
            return null;
        }
        const label = provider === 'strava' ? 'Strava' : 'Device';
        if (error === 'missing_config') {
            return `${label} isn’t configured yet. Add the ${label.toUpperCase()} client ID, secret, and redirect URL, then try again.`;
        }
        if (error === 'unauthorized') {
            return `Sign in to connect ${label}, then try again.`;
        }
        if (error === 'invalid_state' || error === 'expired_state') {
            return `${label} connection expired. Try connecting again.`;
        }
        if (error === 'connect_failed') {
            return `We couldn’t start the ${label} connection. Try again, or continue without syncing.`;
        }
        return `We couldn’t start the ${label} connection.`;
    }, [searchParams]);

    useEffect(() => {
        if (authStatus === 'loading') {
            return;
        }

        async function initialize() {
            try {
                const { hasPlanV2 } = await import('@/domain/plan/repository');
                const planExists = await hasPlanV2(athleteId);
                if (planExists) {
                    clearOnboardingProgress(athleteId);
                    setPhase('has-plan');
                    return;
                }

                const saved = loadOnboardingProgress(athleteId);
                if (saved && saved.step !== 'welcome' && saved.step !== 'complete') {
                    setSavedProgress(saved);
                    setPhase('resume-prompt');
                    return;
                }

                setPhase('active');
            } catch (error) {
                console.error('Onboarding initialization error:', error);
                setPhase('active');
            }
        }

        initialize();
    }, [athleteId, authStatus]);

    useEffect(() => {
        if (phase === 'active' && step !== 'welcome' && step !== 'generating' && step !== 'complete') {
            saveOnboardingProgress(step, data, athleteId);
        }
    }, [athleteId, data, phase, step]);

    const goToNext = useCallback(() => {
        const nextStep = getNextStep(step, data);

        if (nextStep === 'vdot-reveal') {
            const { vdot, confidence } = calculateVdotFromData(data);
            setData(prev => ({ ...prev, vdot, vdotConfidence: confidence }));
        }

        if (nextStep === 'readiness-check') {
            const { status, baseWeeksNeeded, maintenanceWeeksNeeded } = calculateReadiness(data);
            setData(prev => ({ ...prev, readinessStatus: status, baseWeeksNeeded, maintenanceWeeksNeeded }));
        }

        setStep(nextStep);
    }, [data, step]);

    const goBack = useCallback(() => {
        const prevStep = getPreviousStep(step, data);
        if (prevStep) {
            setStep(prevStep);
        }
    }, [data, step]);

    const handleResume = useCallback(() => {
        if (savedProgress) {
            setStep(savedProgress.step);
            setData(savedProgress.data);
        }
        setPhase('active');
    }, [savedProgress]);

    const handleStartFresh = useCallback(() => {
        clearOnboardingProgress(athleteId);
        setSavedProgress(null);
        setPhase('active');
    }, [athleteId]);

    const handleCreateNewPlan = useCallback(() => {
        clearOnboardingProgress(athleteId);
        setPhase('active');
    }, [athleteId]);

    const confirmCoach = useCallback((philosophy: NonNullable<OnboardingData['trainingPhilosophy']>) => {
        const updated = { ...data, trainingPhilosophy: philosophy };
        const { status, baseWeeksNeeded, maintenanceWeeksNeeded } = calculateReadiness(updated);
        setData(prev => ({
            ...prev,
            trainingPhilosophy: philosophy,
            readinessStatus: status,
            baseWeeksNeeded,
            maintenanceWeeksNeeded,
        }));
        setStep('readiness-check');
    }, [data]);

    const continueFromReadinessCheck = useCallback(() => {
        setGenerationError(null);
        goToNext();
    }, [goToNext]);

    const resetCalibration = useCallback(() => {
        setData(prev => ({ ...prev, vdot: null, vdotConfidence: null }));
        setStep('calibration-method');
    }, []);

    const generatePlanAndAdvance = useCallback(async () => {
        const result = await generateAndPersistPlanFromOnboarding(data, athleteId);
        if (!result.success) {
            setGenerationError(result.error.message);
            setStep('readiness-check');
            return false;
        }
        setStep('complete');
        return true;
    }, [athleteId, data]);

    const viewDashboard = useCallback(() => {
        clearOnboardingProgress(athleteId);
        router.push('/dashboard');
    }, [athleteId, router]);

    const viewPlan = useCallback(() => {
        clearOnboardingProgress(athleteId);
        router.push('/plan');
    }, [athleteId, router]);

    return {
        athleteId,
        authStatus,
        connectErrorMessage,
        continueFromReadinessCheck,
        confirmCoach,
        data,
        generationError,
        generatePlanAndAdvance,
        goBack,
        goToNext,
        handleCreateNewPlan,
        handleResume,
        handleStartFresh,
        phase,
        progress: getStepProgress(step),
        resetCalibration,
        savedProgress,
        setData,
        setGenerationError,
        setPhase,
        setStep,
        step,
        viewDashboard,
        viewPlan,
    };
}
