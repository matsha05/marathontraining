import type { TrainingPlanPayload } from './schemas';
import type { TrainingPlan } from './types';

type TrainingPlanSource = TrainingPlan | TrainingPlanPayload;
type DaySource = TrainingPlanSource['weeks'][number]['days'][number];
type RunWorkoutSource = NonNullable<DaySource['runWorkout']>;
type StrengthWorkoutSource = NonNullable<DaySource['strengthWorkout']>;

function serializeRunWorkout(workout: RunWorkoutSource) {
    return {
        name: workout.name,
        type: workout.type,
        totalDistance: workout.totalDistance,
        estimatedDuration: workout.estimatedDuration,
        primaryZone: workout.primaryZone,
        purpose: workout.purpose,
        coachSource: workout.coachSource,
        segments: workout.segments ?? [],
        notes: workout.notes ?? null,
    };
}

function serializeStrengthWorkout(workout: StrengthWorkoutSource) {
    return {
        name: workout.name,
        focus: workout.focus ?? [],
        duration: workout.duration,
        exercises: workout.exercises ?? [],
        equipmentNeeded: workout.equipmentNeeded,
    };
}

export function toTrainingPlanPayload(plan: TrainingPlanSource): TrainingPlanPayload {
    return {
        id: plan.id,
        vdot: plan.vdot,
        athleteName: plan.athleteName,
        goalDistance: plan.goalDistance,
        raceDate: plan.raceDate ?? null,
        weeks: plan.weeks.map((week) => ({
            weekNumber: week.weekNumber,
            weekOf: week.weekOf,
            phase: week.phase,
            blockType: week.blockType,
            isRecoveryWeek: week.isRecoveryWeek,
            focus: week.focus,
            days: week.days.map((day) => ({
                date: day.date,
                dayOfWeek: day.dayOfWeek,
                runWorkout: day.runWorkout ? serializeRunWorkout(day.runWorkout) : null,
                strengthWorkout: day.strengthWorkout ? serializeStrengthWorkout(day.strengthWorkout) : null,
                isKeyDay: day.isKeyDay,
            })),
        })),
        paces: {
            easy: { min: plan.paces.easy.min, max: plan.paces.easy.max },
            marathon: plan.paces.marathon,
            threshold: plan.paces.threshold,
            interval: plan.paces.interval,
            repetition: plan.paces.repetition,
        },
    };
}
