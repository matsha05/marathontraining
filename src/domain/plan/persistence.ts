/**
 * Plan persistence helpers (server-side).
 */

import { createHash } from 'crypto';
import type { TrainingPlanPayload } from './schemas';
import type { Database, Json } from '@/infrastructure/supabase/types';
import { toDateKey } from '@/lib/dates';

type InsertTrainingPlan = Database['public']['Tables']['training_plans']['Insert'];
type InsertPlannedWorkout = Database['public']['Tables']['planned_workouts']['Insert'];
type PlannedWorkoutPrescription = Database['public']['Tables']['planned_workouts']['Insert']['prescription'];

type PersistedPlan = TrainingPlanPayload;
type PersistedWeek = PersistedPlan['weeks'][number];
type PersistedDay = PersistedWeek['days'][number];

function toJson(value: unknown): Json {
    if (value === undefined) return null;
    return JSON.parse(JSON.stringify(value));
}

const WORKOUT_ID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

function createUuidV5(name: string, namespace: string): string {
    const namespaceBytes = Buffer.from(namespace.replace(/-/g, ''), 'hex');
    const nameBytes = Buffer.from(name, 'utf8');
    const hash = createHash('sha1').update(namespaceBytes).update(nameBytes).digest();

    hash[6] = (hash[6] & 0x0f) | 0x50;
    hash[8] = (hash[8] & 0x3f) | 0x80;

    const hex = hash.subarray(0, 16).toString('hex');
    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32),
    ].join('-');
}

export function buildTrainingPlanInsert(plan: PersistedPlan, athleteId: string): InsertTrainingPlan {
    const planType = plan.goalDistance === 'half'
        ? 'half_marathon'
        : plan.goalDistance === 'general'
            ? 'base'
            : plan.goalDistance;

    return {
        id: plan.id,
        athlete_id: athleteId,
        plan_type: planType,
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
            const row = buildPlannedWorkoutInsert(plan, week, day, athleteId);
            if (row) workoutRows.push(row);
        }
    }

    return workoutRows;
}

function buildPlannedWorkoutInsert(
    plan: PersistedPlan,
    week: PersistedWeek,
    day: PersistedDay,
    athleteId: string
): InsertPlannedWorkout | null {
    if (!day.runWorkout && !day.strengthWorkout) return null;

    const workoutId = createUuidV5(
        `${plan.id}-w${week.weekNumber}-d${day.dayOfWeek}`,
        WORKOUT_ID_NAMESPACE
    );
    const prescription = buildPrescription(day, week, plan);

    return {
        id: workoutId,
        plan_id: plan.id,
        athlete_id: athleteId,
        scheduled_date: day.date,
        day_of_week: day.dayOfWeek,
        session_type: day.runWorkout?.type || 'rest',
        prescription,
        status: 'planned',
        durability_modules: null,
        fueling_plan: null,
    };
}

function buildPrescription(
    day: PersistedDay,
    week: PersistedWeek,
    plan: PersistedPlan
): PlannedWorkoutPrescription {
    return {
        run: day.runWorkout ? {
            name: day.runWorkout.name,
            type: day.runWorkout.type,
            totalDistanceMiles: day.runWorkout.totalDistance,
            estimatedDurationMin: day.runWorkout.estimatedDuration,
            primaryZone: day.runWorkout.primaryZone,
            purpose: day.runWorkout.purpose,
            coachSource: day.runWorkout.coachSource,
            segments: toJson(day.runWorkout.segments ?? []),
            notes: day.runWorkout.notes ?? null,
        } : null,
        strength: day.strengthWorkout ? {
            name: day.strengthWorkout.name,
            focus: day.strengthWorkout.focus,
            durationMin: day.strengthWorkout.duration,
            exercises: toJson(day.strengthWorkout.exercises ?? []),
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
