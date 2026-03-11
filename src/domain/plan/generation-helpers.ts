import type {
    DayPlan,
    PlanGenerationInput,
    TrainingPhase,
    TrainingPlan,
    Workout,
} from './types';
import {
    scheduleCrossTrainingForDay,
    scheduleDurabilityForDay,
    scheduleDurabilityRoutineForDay,
    scheduleStrengthForDay,
    type ScheduledDayType,
} from './support';

export function buildDayPlan(options: {
    date: string;
    dayOfWeek: number;
    runWorkout: Workout | null;
    isKeyDay: boolean;
    phase: TrainingPhase;
    dayType: ScheduledDayType;
    input: PlanGenerationInput;
}): DayPlan {
    const { date, dayOfWeek, dayType, input, isKeyDay, phase, runWorkout } = options;

    return {
        date,
        dayOfWeek,
        runWorkout,
        strengthWorkout: scheduleStrengthForDay(phase, dayType, dayOfWeek, input),
        crossTraining: scheduleCrossTrainingForDay(dayType, input),
        durabilityModule: scheduleDurabilityForDay(dayType),
        durabilityRoutine: scheduleDurabilityRoutineForDay(dayType),
        isKeyDay,
        totalMiles: runWorkout?.totalDistance ?? 0,
        qualityMiles: runWorkout?.qualityMiles ?? 0,
    };
}

export function summarizeWeekFromDays(days: DayPlan[], totalMilesOverride?: number) {
    const totalMiles = totalMilesOverride ?? days.reduce((sum, day) => sum + day.totalMiles, 0);
    const easyMiles = days.reduce(
        (sum, day) => sum + (day.runWorkout && day.runWorkout.primaryZone === 'E' ? day.totalMiles : 0),
        0
    );
    const qualityMiles = days.reduce((sum, day) => sum + day.qualityMiles, 0);
    const keyWorkouts = days.filter(day => day.isKeyDay).length;

    return {
        totalMiles,
        easyMiles,
        qualityMiles,
        keyWorkouts,
        easyPercentage: totalMiles > 0 ? (easyMiles / totalMiles) * 100 : 0,
    };
}

function derivePlanMetrics(weeks: TrainingPlan['weeks']) {
    let peakMileage = 0;
    let peakWeek = 1;
    let totalMiles = 0;

    weeks.forEach(week => {
        totalMiles += week.totalMiles;
        if (week.totalMiles >= peakMileage) {
            peakMileage = week.totalMiles;
            peakWeek = week.weekNumber;
        }
    });

    return { peakMileage, peakWeek, totalMiles };
}

export function finalizeTrainingPlan(
    options: Omit<TrainingPlan, 'peakMileage' | 'peakWeek' | 'totalMiles'>
): TrainingPlan {
    const metrics = derivePlanMetrics(options.weeks);
    return {
        ...options,
        peakMileage: metrics.peakMileage,
        peakWeek: metrics.peakWeek,
        totalMiles: metrics.totalMiles,
    };
}
