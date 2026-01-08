import type { Database } from '@/infrastructure/supabase/types';

export type DbTrainingPlan = Database['public']['Tables']['training_plans']['Row'];
export type DbPlannedWorkout = Database['public']['Tables']['planned_workouts']['Row'];

export interface PlanRepositoryError {
    code: 'AUTH_REQUIRED' | 'NOT_FOUND' | 'SAVE_FAILED' | 'LOAD_FAILED' | 'NETWORK_ERROR';
    message: string;
    details?: unknown;
}

export type PlanResult<T> =
    | { success: true; data: T }
    | { success: false; error: PlanRepositoryError };
