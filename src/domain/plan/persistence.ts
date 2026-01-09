/**
 * Plan persistence helpers (server-side).
 */

import type { TrainingPlanPayload } from './schemas';
import type { Database } from '@/infrastructure/supabase/types';
import { toDateKey } from '@/lib/dates';

type InsertTrainingPlan = Database['public']['Tables']['training_plans']['Insert'];
type InsertPlannedWorkout = Database['public']['Tables']['planned_workouts']['Insert'];

type PersistedPlan = TrainingPlanPayload;
type PersistedWeek = PersistedPlan['weeks'][number];
type PersistedDay = PersistedWeek['days'][number];

export function buildTrainingPlanInsert(plan: PersistedPlan, athleteId: string): InsertTrainingPlan {
    return {
        id: plan.id,
        athlete_id: athleteId,
        plan_type: plan.goalDistance,
        vdot_at_creation: plan.vdot,
        start_date: plan.weeks[0]?.weekOf || toDateKey(new Date()),
        end_date: plan.raceDate || plan.weeks[plan.weeks.length - 1]?.weekOf || toDateKey(new Date()),
        goal_race_id: null,
        is_active: true,
    };
}

export function buildPlannedWorkoutInserts(
    plan: PersistedPlan,
    athleteId: string
): InsertPlannedWorkout[] {
    const workoutRows: InsertPlannedWorkout[] = [];

    for (const week of plan.weeks) {
        for (const day of week.days) {
            if (!day.runWorkout && !day.strengthWorkout) continue;

            const workoutId = `${plan.id}-w${week.weekNumber}-d${day.dayOfWeek}`;
            const prescription = buildPrescription(day, week, plan);

            workoutRows.push({
                id: workoutId,
                plan_id: plan.id,
                athlete_id: athleteId,
                scheduled_date: day.date,
                day_of_week: day.dayOfWeek,
                session_type: day.runWorkout?.type || 'rest',
                prescription: prescription as unknown as Database['public']['Tables']['planned_workouts']['Insert']['prescription'],
                status: 'planned',
                durability_modules: null,
                fueling_plan: null,
            });
        }
    }

    return workoutRows;
}

function buildPrescription(
    day: PersistedDay,
    week: PersistedWeek,
    plan: PersistedPlan
): Record<string, unknown> {
    return {
        run: day.runWorkout ? {
            name: day.runWorkout.name,
            type: day.runWorkout.type,
            totalDistanceMiles: day.runWorkout.totalDistance,
            estimatedDurationMin: day.runWorkout.estimatedDuration,
            primaryZone: day.runWorkout.primaryZone,
            purpose: day.runWorkout.purpose,
            coachSource: day.runWorkout.coachSource,
            segments: day.runWorkout.segments,
            notes: day.runWorkout.notes,
        } : null,
        strength: day.strengthWorkout ? {
            name: day.strengthWorkout.name,
            focus: day.strengthWorkout.focus,
            durationMin: day.strengthWorkout.duration,
            exercises: day.strengthWorkout.exercises,
            equipmentNeeded: day.strengthWorkout.equipmentNeeded,
        } : null,
        weekNumber: week.weekNumber,
        phase: week.phase,
        blockType: week.blockType ?? null,
        isKeyDay: day.isKeyDay,
        isRecoveryWeek: week.isRecoveryWeek,
        weekFocus: week.focus,
        paces: plan.paces,
    };
}
