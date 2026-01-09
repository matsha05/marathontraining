import type { TrainingPlanPayload } from './schemas';
import type { TrainingPlan } from './types';

type TrainingPlanSource = TrainingPlan | TrainingPlanPayload;

export function toTrainingPlanPayload(plan: TrainingPlanSource): TrainingPlanPayload {
    return {
        id: plan.id,
        vdot: plan.vdot,
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
                runWorkout: day.runWorkout
                    ? {
                        name: day.runWorkout.name,
                        type: day.runWorkout.type,
                        totalDistance: day.runWorkout.totalDistance,
                        estimatedDuration: day.runWorkout.estimatedDuration,
                        primaryZone: day.runWorkout.primaryZone,
                        purpose: day.runWorkout.purpose,
                        coachSource: day.runWorkout.coachSource,
                        segments: day.runWorkout.segments ?? [],
                        notes: day.runWorkout.notes ?? null,
                    }
                    : null,
                strengthWorkout: day.strengthWorkout
                    ? {
                        name: day.strengthWorkout.name,
                        focus: day.strengthWorkout.focus ?? [],
                        duration: day.strengthWorkout.duration,
                        exercises: day.strengthWorkout.exercises ?? [],
                        equipmentNeeded: day.strengthWorkout.equipmentNeeded,
                    }
                    : null,
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
