import type { TrainingPlan, WeekPlan, DayPlan, WeekBlockType } from './types';
import type { Database } from '@/infrastructure/supabase/types';

type DbTrainingPlan = Database['public']['Tables']['training_plans']['Row'];
type DbPlannedWorkout = Database['public']['Tables']['planned_workouts']['Row'];

/**
 * Reconstruct a TrainingPlan from database rows.
 */
export function reconstructPlan(
    planRow: DbTrainingPlan,
    workouts: DbPlannedWorkout[]
): TrainingPlan {
    const goalDistance = planRow.plan_type === 'half_marathon'
        ? 'half'
        : planRow.plan_type === 'base'
            ? 'general'
            : planRow.plan_type;

    const workoutsByWeek = new Map<number, DbPlannedWorkout[]>();
    for (const w of workouts) {
        const prescription = w.prescription as Record<string, unknown>;
        const weekNum = prescription.weekNumber as number;
        if (!workoutsByWeek.has(weekNum)) {
            workoutsByWeek.set(weekNum, []);
        }
        workoutsByWeek.get(weekNum)!.push(w);
    }

    const weeks: WeekPlan[] = [];
    const sortedWeekNums = Array.from(workoutsByWeek.keys()).sort((a, b) => a - b);

    for (const weekNum of sortedWeekNums) {
        const weekWorkouts = workoutsByWeek.get(weekNum) || [];
        const firstWorkout = weekWorkouts[0];
        const prescription = firstWorkout?.prescription as Record<string, unknown>;
        const blockType = (prescription?.blockType as WeekBlockType | undefined) ?? 'race_plan';

        const days: DayPlan[] = weekWorkouts.map(w => {
            const p = w.prescription as Record<string, unknown>;
            const runData = p.run as Record<string, unknown> | null;
            const strengthData = p.strength as Record<string, unknown> | null;

            return {
                date: w.scheduled_date,
                dayOfWeek: w.day_of_week,
                runWorkout: runData ? {
                    id: w.id,
                    name: runData.name as string,
                    type: runData.type as string,
                    totalDistance: runData.totalDistanceMiles as number,
                    estimatedDuration: runData.estimatedDurationMin as number,
                    primaryZone: runData.primaryZone as string,
                    purpose: runData.purpose as string,
                    coachSource: runData.coachSource as string,
                    segments: runData.segments as Array<Record<string, unknown>>,
                    qualityMiles: (runData.totalDistanceMiles as number) * 0.2,
                    notes: runData.notes as string | undefined,
                } : null,
                strengthWorkout: strengthData ? {
                    id: `${w.id}-strength`,
                    name: strengthData.name as string,
                    focus: strengthData.focus as string[],
                    duration: strengthData.durationMin as number,
                    exercises: strengthData.exercises as Array<Record<string, unknown>>,
                    equipmentNeeded: strengthData.equipmentNeeded as string,
                } : null,
                isKeyDay: p.isKeyDay as boolean,
                totalMiles: runData ? (runData.totalDistanceMiles as number) : 0,
                qualityMiles: 0,
            } as DayPlan;
        });

        const totalMiles = days.reduce((sum, d) => sum + d.totalMiles, 0);
        const longRunMiles = Math.max(...days.map(d => d.totalMiles), 0);

        weeks.push({
            weekNumber: weekNum,
            weekOf: (prescription?.weekOf as string) || firstWorkout?.scheduled_date || '',
            phase: (prescription?.phase as string) || 'base',
            phaseWeek: 1,
            blockType,
            days,
            totalMiles,
            longRunMiles,
            easyMiles: totalMiles * 0.8,
            qualityMiles: totalMiles * 0.2,
            easyPercentage: 80,
            keyWorkouts: days.filter(d => d.isKeyDay).length,
            isRecoveryWeek: (prescription?.isRecoveryWeek as boolean) || false,
            focus: (prescription?.weekFocus as string) || '',
        } as WeekPlan);
    }

    const firstPrescription = workouts[0]?.prescription as Record<string, unknown> | undefined;
    const paces = firstPrescription?.paces as TrainingPlan['paces'] || {
        easy: { min: 480, max: 540 },
        marathon: 420,
        threshold: 390,
        interval: 360,
        repetition: 330,
    };

    let peakMileage = 0;
    let peakWeek = 1;

    for (const week of weeks) {
        if (week.totalMiles >= peakMileage) {
            peakMileage = week.totalMiles;
            peakWeek = week.weekNumber;
        }
    }

    return {
        id: planRow.id,
        createdAt: planRow.created_at,
        athleteName: '',
        vdot: planRow.vdot_at_creation,
        goalDistance: goalDistance as TrainingPlan['goalDistance'],
        raceName: undefined,
        raceDate: planRow.end_date,
        weeks,
        totalWeeks: weeks.length,
        phases: [],
        peakMileage,
        peakWeek,
        totalMiles: weeks.reduce((sum, w) => sum + w.totalMiles, 0),
        paces,
        intensityLevel: 'moderate',
        verification: { passed: true, checks: [] },
    };
}
