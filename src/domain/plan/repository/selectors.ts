import type { DbPlannedWorkout, DbTrainingPlan, PlanResult } from './types';
import { planApiRequest } from './network';

export async function getWorkoutById(workoutId: string): Promise<PlanResult<DbPlannedWorkout | null>> {
    return planApiRequest<DbPlannedWorkout | null>(
        `/api/plan/workout?id=${encodeURIComponent(workoutId)}`,
        'LOAD_FAILED'
    );
}

export async function getTodaysWorkoutV2(): Promise<PlanResult<DbPlannedWorkout | null>> {
    return planApiRequest<DbPlannedWorkout | null>('/api/plan/today', 'LOAD_FAILED');
}

export async function getWeekWorkouts(weekNumber: number): Promise<PlanResult<DbPlannedWorkout[]>> {
    return planApiRequest<DbPlannedWorkout[]>(
        `/api/plan/week?week=${weekNumber}`,
        'LOAD_FAILED'
    );
}

export async function loadPlanHistory(): Promise<PlanResult<DbTrainingPlan[]>> {
    return planApiRequest<DbTrainingPlan[]>('/api/plan/history', 'LOAD_FAILED');
}

export async function loadPlanWorkouts(planId: string): Promise<PlanResult<DbPlannedWorkout[]>> {
    return planApiRequest<DbPlannedWorkout[]>(
        `/api/plan/workouts?planId=${encodeURIComponent(planId)}`,
        'LOAD_FAILED'
    );
}
