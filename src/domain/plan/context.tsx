'use client';

/**
 * THE LONG GAME - Plan Context Provider
 *
 * React Context for global plan state management.
 * Provides:
 * - Current plan access across components
 * - Loading/error states
 * - Plan creation and refresh actions
 * - Automatic persistence sync (Supabase + localStorage)
 *
 * V3: Uses shared AuthContext for auth state (no duplicate subscriptions)
 */

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    ReactNode,
} from 'react';
import { TrainingPlan, WeekPlan, DayPlan } from '@/domain/plan/types';
import {
    loadPlan,
    savePlan,
    clearPlan,
    createPlanFromOnboarding,
    getCurrentWeek,
    getTodaysWorkoutFromPlan,
    getUpcomingKeyWorkouts,
    PlanServiceError,
} from '@/domain/plan/service';
import { OnboardingData } from '@/domain/onboarding/types';
import { useAuth } from '@/domain/auth/context';

// =============================================================================
// CONTEXT STATE TYPES
// =============================================================================

export type PlanStatus = 'idle' | 'loading' | 'ready' | 'error' | 'generating';

export interface PlanState {
    status: PlanStatus;
    plan: TrainingPlan | null;
    error: PlanServiceError | null;

    // Computed values (derived from plan)
    currentWeek: number | null;
    todayWorkout: DayPlan | null;
    currentWeekPlan: WeekPlan | null;
}

export interface PlanActions {
    /**
     * Generate a new plan from onboarding data.
     * Saves automatically on success.
     */
    generatePlan: (onboardingData: OnboardingData) => Promise<boolean>;

    /**
     * Reload the plan from storage.
     */
    refreshPlan: () => Promise<void>;

    /**
     * Clear the current plan.
     */
    deletePlan: () => Promise<void>;

    /**
     * Check if user has a plan.
     */
    hasPlan: () => boolean;
}

export type PlanContextValue = PlanState & PlanActions;

// =============================================================================
// CONTEXT DEFINITION
// =============================================================================

const PlanContext = createContext<PlanContextValue | null>(null);

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export interface PlanProviderProps {
    children: ReactNode;
}

export function PlanProvider({ children }: PlanProviderProps) {
    // Core state
    const [status, setStatus] = useState<PlanStatus>('idle');
    const [plan, setPlan] = useState<TrainingPlan | null>(null);
    const [error, setError] = useState<PlanServiceError | null>(null);

    // Derived state (calculated from plan)
    const [currentWeek, setCurrentWeek] = useState<number | null>(null);
    const [todayWorkout, setTodayWorkout] = useState<DayPlan | null>(null);
    const [currentWeekPlan, setCurrentWeekPlan] = useState<WeekPlan | null>(null);

    // ==========================================================================
    // DERIVED STATE COMPUTATION
    // ==========================================================================

    const computeDerivedState = useCallback((planData: TrainingPlan | null) => {
        if (!planData) {
            setCurrentWeek(null);
            setTodayWorkout(null);
            setCurrentWeekPlan(null);
            return;
        }

        const week = getCurrentWeek(planData);
        const { workout } = getTodaysWorkoutFromPlan(planData);
        const weekPlan = planData.weeks[week - 1] || null;

        setCurrentWeek(week);
        setTodayWorkout(workout);
        setCurrentWeekPlan(weekPlan);
    }, []);

    // ==========================================================================
    // AUTH-AWARE PLAN LOADING (Elite Pattern)
    // ==========================================================================
    // 
    // The simplest, most bulletproof approach:
    // - Load ONCE when auth first becomes 'authenticated'
    // - Clear on logout (and reset so next login loads again)
    // - Never automatically reload - use refreshPlan() for that
    //
    // This avoids all race conditions and dependency array complexity.

    const { status: authStatus, athleteId } = useAuth();
    const hasTriggeredLoad = useRef(false);

    useEffect(() => {
        // When authenticated for the first time, trigger load
        if (authStatus === 'authenticated' && !hasTriggeredLoad.current) {
            hasTriggeredLoad.current = true;

            const doLoad = async () => {
                setStatus('loading');

                const result = await loadPlan(athleteId);

                if (result.success && result.data) {
                    setPlan(result.data);
                    computeDerivedState(result.data);
                    setStatus('ready');
                } else if (result.success && !result.data) {
                    setStatus('idle');
                } else if (!result.success) {
                    setError({
                        code: result.error.code as PlanServiceError['code'],
                        message: result.error.message,
                    });
                    setStatus('error');
                }
            };

            doLoad();
        }

        // On logout, clear plan and reset the trigger
        if (authStatus === 'unauthenticated') {
            hasTriggeredLoad.current = false;
            setPlan(null);
            computeDerivedState(null);
            setStatus('idle');
        }
    }, [authStatus, athleteId, computeDerivedState]);




    // ==========================================================================
    // ACTIONS
    // ==========================================================================

    const generatePlanAction = useCallback(async (onboardingData: OnboardingData): Promise<boolean> => {
        setStatus('generating');
        setError(null);

        // Small delay for UX (shows generating state)
        await new Promise(resolve => setTimeout(resolve, 100));

        const result = createPlanFromOnboarding(onboardingData);

        if (result.success) {
            setPlan(result.data);
            computeDerivedState(result.data);

            // Persist (async - don't block)
            const saveResult = await savePlan(result.data, athleteId);
            if (!saveResult.success) {
                console.warn('Failed to persist plan:', saveResult.error);
            }

            setStatus('ready');
            return true;
        } else {
            setError(result.error);
            setStatus('error');
            return false;
        }
    }, [computeDerivedState, athleteId]);

    const refreshPlanAction = useCallback(async () => {
        setStatus('loading');

        const result = await loadPlan(athleteId);

        if (result.success && result.data) {
            setPlan(result.data);
            computeDerivedState(result.data);
            setStatus('ready');
        } else {
            setStatus('idle');
        }
    }, [computeDerivedState, athleteId]);

    const deletePlanAction = useCallback(async () => {
        await clearPlan(athleteId);
        setPlan(null);
        computeDerivedState(null);
        setStatus('idle');
        setError(null);
    }, [computeDerivedState, athleteId]);

    const hasPlanAction = useCallback(() => {
        return plan !== null;
    }, [plan]);

    // ==========================================================================
    // CONTEXT VALUE
    // ==========================================================================

    const value: PlanContextValue = {
        // State
        status,
        plan,
        error,
        currentWeek,
        todayWorkout,
        currentWeekPlan,

        // Actions
        generatePlan: generatePlanAction,
        refreshPlan: refreshPlanAction,
        deletePlan: deletePlanAction,
        hasPlan: hasPlanAction,
    };

    return (
        <PlanContext.Provider value={value}>
            {children}
        </PlanContext.Provider>
    );
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Access plan context from any component.
 * Must be used within a PlanProvider.
 */
export function usePlan(): PlanContextValue {
    const context = useContext(PlanContext);

    if (!context) {
        throw new Error('usePlan must be used within a PlanProvider');
    }

    return context;
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Get upcoming key workouts for display.
 */
export function useUpcomingWorkouts(count: number = 3) {
    const { plan } = usePlan();

    if (!plan) return [];

    return getUpcomingKeyWorkouts(plan, count);
}

/**
 * Check if user is on a rest day.
 */
export function useIsRestDay(): boolean {
    const { todayWorkout } = usePlan();
    return !todayWorkout?.runWorkout;
}
