import type {
    CrossTrainingSuggestion,
    DailyDurabilityRoutine,
    DurabilityModule,
    PlanGenerationInput,
    StrengthWorkout,
    TrainingPhase,
} from './types';
import { generateStrengthWorkout, getDicharryHipCircuit } from './strength-engine';
import { getDailyDurabilityModule, getDailyDurabilityRoutine } from './durability-modules';

export type ScheduledDayType = 'rest' | 'easy' | 'quality' | 'long' | 'easy_strides';

export function scheduleStrengthForDay(
    phase: TrainingPhase,
    dayType: ScheduledDayType,
    dayOfWeek: number,
    input: PlanGenerationInput
): StrengthWorkout | null {
    if (!input.includeStrength) {
        return null;
    }

    if (dayType === 'rest' || dayType === 'long') {
        return null;
    }

    const equipment: 'none' | 'minimal' | 'gym' =
        input.strengthBackground === 'advanced'
            ? 'gym'
            : input.strengthBackground === 'intermediate'
                ? 'minimal'
                : 'minimal';

    if (dayType === 'quality') {
        const sessionNumber: 1 | 2 = dayOfWeek <= 2 ? 1 : 2;
        if ((phase === 'taper' || phase === 'peak') && sessionNumber === 2) {
            return null;
        }
        return generateStrengthWorkout(phase, equipment, sessionNumber);
    }

    if (dayType === 'easy_strides' && (phase === 'base' || phase === 'build') && (dayOfWeek === 0 || dayOfWeek === 5)) {
        return getDicharryHipCircuit();
    }

    return null;
}

export function scheduleDurabilityForDay(dayType: ScheduledDayType): DurabilityModule | undefined {
    const mappedType = dayType === 'easy_strides' ? 'easy' : dayType;
    return getDailyDurabilityModule(mappedType as 'quality' | 'easy' | 'rest' | 'long') || undefined;
}

export function scheduleDurabilityRoutineForDay(dayType: ScheduledDayType): DailyDurabilityRoutine | undefined {
    const mappedType = dayType === 'easy_strides' ? 'easy' : dayType;
    return getDailyDurabilityRoutine(mappedType as 'quality' | 'easy' | 'rest' | 'long');
}

export function scheduleCrossTrainingForDay(
    dayType: ScheduledDayType,
    input: PlanGenerationInput
): CrossTrainingSuggestion | undefined {
    if (input.includeStrength) {
        return undefined;
    }

    if (dayType === 'rest') {
        return {
            type: 'rest_optional',
            duration: 30,
            intensity: 'easy',
            notes: 'Optional: light walk, yoga, or complete rest',
        };
    }

    if (dayType === 'easy' || dayType === 'easy_strides') {
        return {
            type: 'cycling',
            duration: 30,
            intensity: 'easy',
            notes: 'Cross-training: cycling, swimming, or elliptical at easy effort',
        };
    }

    return undefined;
}

