/**
 * Workout logging helper for Garmin/Strava activity summaries
 */

import { matchGarminActivityToPlannedWorkouts, type WorkoutMatchResult } from '@/domain/garmin/workout-matcher';
import { calculatePaceZones } from '@/domain/vdot';
import type { GarminActivitySummary } from '@/domain/garmin/types';
import type { PlannedWorkout, WorkoutPrescription, FuelingPlan, SessionStatus, SessionType } from '@/domain/types/session';
import { getSupabaseServerClient } from '@/infrastructure/supabase/server';

const METERS_PER_MILE = 1609.344;

export interface LogCompletedWorkoutResult {
    match: WorkoutMatchResult;
    logged: boolean;
}

export async function logCompletedWorkoutFromActivity(
    athleteId: string,
    summary: GarminActivitySummary,
    options: { allowUnmatched?: boolean; timeWindowHours?: number } = {}
): Promise<LogCompletedWorkoutResult> {
    const allowUnmatched = options.allowUnmatched ?? false;
    const timeWindowHours = options.timeWindowHours ?? 36;

    if (!summary.startTime) {
        return {
            match: { matchScore: 0, matched: false, reasons: ['Missing activity start time'] },
            logged: false,
        };
    }

    const scheduledDate = new Date(summary.startTime);
    const startWindow = new Date(scheduledDate.getTime() - timeWindowHours * 60 * 60 * 1000).toISOString();
    const endWindow = new Date(scheduledDate.getTime() + timeWindowHours * 60 * 60 * 1000).toISOString();

    const supabase = getSupabaseServerClient();
    const { data: plannedRows, error: plannedError } = await supabase
        .from('planned_workouts')
        .select('*')
        .eq('athlete_id', athleteId)
        .gte('scheduled_date', startWindow)
        .lte('scheduled_date', endWindow);

    if (plannedError) {
        throw new Error(plannedError.message);
    }

    const plannedWorkouts = (plannedRows ?? []).map(row => mapPlannedWorkout(row));

    const { data: vdotRow, error: vdotError } = await supabase
        .from('vdot_history')
        .select('vdot')
        .eq('athlete_id', athleteId)
        .eq('is_current', true)
        .maybeSingle();

    if (vdotError) {
        throw new Error(vdotError.message);
    }

    const paceZones = vdotRow?.vdot ? calculatePaceZones(vdotRow.vdot) : undefined;
    const match = matchGarminActivityToPlannedWorkouts(summary, plannedWorkouts, paceZones, { timeWindowHours });
    const plannedWorkoutId = match.matched ? match.plannedWorkoutId : undefined;

    if (!plannedWorkoutId && !allowUnmatched) {
        return { match, logged: false };
    }

    const plannedWorkout = plannedWorkoutId
        ? plannedWorkouts.find(workout => workout.id === plannedWorkoutId)
        : undefined;

    const actualSession = {
        type: (plannedWorkout?.sessionType ?? 'easy') as SessionType,
        distanceMiles: summary.distanceMeters ? summary.distanceMeters / METERS_PER_MILE : undefined,
        durationMinutes: summary.durationSeconds ? summary.durationSeconds / 60 : undefined,
        averagePaceSecPerMile: summary.avgPaceSecPerMile,
        hrAverage: summary.avgHeartRate,
        hrMax: summary.maxHeartRate,
        perceivedEffort: 5,
        paceVariance: match.paceVariance,
        distanceVariance: match.distanceVariance,
        matchScore: match.matchScore,
    };

    if (plannedWorkoutId) {
        const { data: existing } = await supabase
            .from('completed_workouts')
            .select('id')
            .eq('planned_workout_id', plannedWorkoutId)
            .maybeSingle();

        if (existing?.id) {
            const { error } = await supabase
                .from('completed_workouts')
                .update({
                    completed_date: scheduledDate.toISOString(),
                    actual_session: actualSession,
                })
                .eq('id', existing.id);

            if (error) {
                throw new Error(error.message);
            }
        } else {
            const { error } = await supabase.from('completed_workouts').insert({
                planned_workout_id: plannedWorkoutId,
                athlete_id: athleteId,
                completed_date: scheduledDate.toISOString(),
                actual_session: actualSession,
                zone_minutes: null,
                symptoms: null,
            });

            if (error) {
                throw new Error(error.message);
            }
        }
    } else if (allowUnmatched) {
        const { error } = await supabase.from('completed_workouts').insert({
            planned_workout_id: null,
            athlete_id: athleteId,
            completed_date: scheduledDate.toISOString(),
            actual_session: actualSession,
            zone_minutes: null,
            symptoms: null,
        });

        if (error) {
            throw new Error(error.message);
        }
    }

    return { match, logged: true };
}

function mapPlannedWorkout(row: Record<string, unknown>): PlannedWorkout {
    return {
        id: row.id as string,
        planId: row.plan_id as string,
        athleteId: row.athlete_id as string,
        scheduledDate: new Date(row.scheduled_date as string),
        dayOfWeek: row.day_of_week as number,
        sessionType: row.session_type as SessionType,
        prescription: row.prescription as WorkoutPrescription,
        fuelingPlan: row.fueling_plan as FuelingPlan | undefined,
        status: row.status as SessionStatus,
        createdAt: new Date(row.created_at as string),
    };
}
