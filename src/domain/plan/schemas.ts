import { z } from 'zod';

const numberFromParam = z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() !== '') {
        return Number(value);
    }
    return value;
}, z.number().int());

const workoutSchema = z.object({
    name: z.string(),
    type: z.string(),
    totalDistance: z.number(),
    estimatedDuration: z.number(),
    primaryZone: z.string(),
    purpose: z.string(),
    coachSource: z.string(),
    segments: z.array(z.unknown()),
    notes: z.string().optional().nullable(),
}).passthrough();

const strengthWorkoutSchema = z.object({
    name: z.string(),
    focus: z.array(z.string()),
    duration: z.number(),
    exercises: z.array(z.unknown()),
    equipmentNeeded: z.string(),
}).passthrough();

const dayPlanSchema = z.object({
    date: z.string(),
    dayOfWeek: z.number().int(),
    runWorkout: workoutSchema.nullable(),
    strengthWorkout: strengthWorkoutSchema.nullable(),
    isKeyDay: z.boolean(),
}).passthrough();

const weekPlanSchema = z.object({
    weekNumber: z.number().int(),
    weekOf: z.string(),
    phase: z.string(),
    isRecoveryWeek: z.boolean(),
    focus: z.string(),
    days: z.array(dayPlanSchema),
}).passthrough();

const pacesSchema = z.object({
    easy: z.object({ min: z.number(), max: z.number() }),
    marathon: z.number(),
    threshold: z.number(),
    interval: z.number(),
    repetition: z.number(),
});

export const trainingPlanSchema = z.object({
    id: z.string().min(1),
    vdot: z.number(),
    goalDistance: z.string(),
    raceDate: z.string().optional().nullable(),
    weeks: z.array(weekPlanSchema),
    paces: pacesSchema,
}).passthrough();

export const planIdQuerySchema = z.object({
    planId: z.string().min(1),
});

export const workoutIdQuerySchema = z.object({
    id: z.string().min(1),
});

export const weekQuerySchema = z.object({
    week: numberFromParam.positive(),
});
