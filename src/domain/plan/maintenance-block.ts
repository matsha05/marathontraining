/**
 * Maintenance Block Generator
 *
 * Generates a gentle, non-Higdon maintenance block to fill calendar gaps.
 * This is explicitly NOT a coach-authored plan.
 */

import {
    CrossTrainingSuggestion,
    DayPlan,
    PlanGenerationInput,
    TrainingPhase,
    WeekPlan,
    Workout,
} from './types';
import { calculateTrainingPaces } from '../vdot/vdot-estimator';
import { getDateForDay, getWeekStartDate } from './date-utils';
import { buildWorkout, EASY_TEMPLATES, LONG_RUN_TEMPLATES } from './workouts/templates';
import {
    scheduleStrengthForDay,
    scheduleDurabilityForDay,
    scheduleDurabilityRoutineForDay,
    scheduleCrossTrainingForDay,
} from './generator';

const MIN_EASY_RUN_MILES = 1;

const MAINTENANCE_BUILD_RATE_MAX = 1.05;
const MAINTENANCE_BUILD_RATE_MIN = 0.95;
const MAINTENANCE_RECOVERY_RATIO = 0.82;
const MAINTENANCE_MIN_LONG_RUN_RATIO = 0.25;
const MAINTENANCE_MAX_LONG_RUN_RATIO = 0.33;
const MAINTENANCE_FINAL_WEEK_CAP = 1.15;
const MAINTENANCE_LONG_RUN_OVERAGE_RATIO = 1.1;
const MAINTENANCE_LONG_RUN_OVERAGE_MILES = 1;

const DEFAULT_WALK_MINUTES = 30;
const DEFAULT_CROSS_TRAIN_MINUTES = 40;

export type MaintenanceDayProfile =
    | { type: 'rest'; notes?: string }
    | { type: 'easy'; notes?: string }
    | { type: 'long'; notes?: string }
    | { type: 'walk'; duration: number; notes?: string }
    | { type: 'cross_train'; duration: number; notes?: string };

interface MaintenanceBlockOptions {
    weeks: number;
    totalWeeks: number;
    dayProfiles: MaintenanceDayProfile[];
    startWeeklyMiles: number;
    startLongRunMiles: number;
    targetWeeklyMiles: number;
    targetLongRunMiles: number;
    basePeakLongRunMiles: number;
}

function roundToTenth(value: number): number {
    return Math.round(value * 10) / 10;
}

function calculateMaintenanceRate(start: number, target: number, steps: number): number {
    if (steps <= 0 || start <= 0 || target <= 0) return 1;
    const raw = Math.pow(target / start, 1 / steps);
    return Math.max(MAINTENANCE_BUILD_RATE_MIN, Math.min(MAINTENANCE_BUILD_RATE_MAX, raw));
}

function stepTowardTarget(current: number, target: number, rate: number): number {
    if (current === target) return current;
    if (target > current) {
        return Math.min(target, roundToTenth(current * rate));
    }
    return Math.max(target, roundToTenth(current * rate));
}

function getMaintenanceRecoveryWeeks(totalWeeks: number): number[] {
    const recoveryWeeks: number[] = [];
    for (let week = 1; week <= totalWeeks; week++) {
        if (week % 3 === 0 && week < totalWeeks) {
            recoveryWeeks.push(week);
        }
    }
    return recoveryWeeks;
}

function getMaintenanceLongRunCap(targetLongRunMiles: number, basePeakLongRunMiles: number): number {
    if (targetLongRunMiles <= 0 && basePeakLongRunMiles > 0) {
        return basePeakLongRunMiles;
    }
    const capByTarget = Math.min(
        targetLongRunMiles * MAINTENANCE_LONG_RUN_OVERAGE_RATIO,
        targetLongRunMiles + MAINTENANCE_LONG_RUN_OVERAGE_MILES
    );
    if (basePeakLongRunMiles > 0) {
        return Math.min(basePeakLongRunMiles, capByTarget);
    }
    return capByTarget;
}

function normalizeDayProfiles(dayProfiles: MaintenanceDayProfile[]): MaintenanceDayProfile[] {
    if (dayProfiles.length !== 7) {
        return Array.from({ length: 7 }, () => ({ type: 'rest' }));
    }

    return dayProfiles.map(profile => {
        if (profile.type === 'walk') {
            return {
                ...profile,
                duration: profile.duration > 0 ? profile.duration : DEFAULT_WALK_MINUTES,
            };
        }
        if (profile.type === 'cross_train') {
            return {
                ...profile,
                duration: profile.duration > 0 ? profile.duration : DEFAULT_CROSS_TRAIN_MINUTES,
            };
        }
        return profile;
    });
}

function buildMaintenanceWorkout(
    template: typeof EASY_TEMPLATES[number],
    paces: ReturnType<typeof calculateTrainingPaces>,
    targetMiles: number
): Workout {
    let adjustedTemplate = template;

    if (targetMiles < template.minMiles) {
        adjustedTemplate = { ...adjustedTemplate, minMiles: 0 };
    }

    if (targetMiles > template.maxMiles) {
        adjustedTemplate = { ...adjustedTemplate, maxMiles: targetMiles };
    }

    return buildWorkout(adjustedTemplate, paces, targetMiles);
}

function buildCrossTrainingSuggestion(
    profile: MaintenanceDayProfile
): CrossTrainingSuggestion | undefined {
    if (profile.type === 'walk') {
        return {
            type: 'walking',
            duration: profile.duration,
            intensity: 'easy',
            notes: profile.notes ?? 'Easy walk at conversational effort.',
        };
    }

    if (profile.type === 'cross_train') {
        return {
            type: 'cycling',
            duration: profile.duration,
            intensity: 'easy',
            notes: profile.notes ?? 'Cross-train at an easy effort.',
        };
    }

    return undefined;
}

export function generateMaintenanceBlockWeeks(
    input: PlanGenerationInput,
    options: MaintenanceBlockOptions
): WeekPlan[] {
    if (options.weeks <= 0) return [];

    const weeks: WeekPlan[] = [];
    const paces = calculateTrainingPaces(input.vdot);
    const dayProfiles = normalizeDayProfiles(options.dayProfiles);
    const easyRunDays = dayProfiles.filter(day => day.type === 'easy').length;
    const minWeeklyMiles = Math.max(1, MIN_EASY_RUN_MILES * easyRunDays + 1);

    let weeklyMiles = Math.max(minWeeklyMiles, options.startWeeklyMiles);
    let longRunMiles = Math.max(1, options.startLongRunMiles);

    const targetWeeklyMiles = Math.max(minWeeklyMiles, options.targetWeeklyMiles);
    const targetLongRunMiles = Math.max(1, options.targetLongRunMiles);
    const basePeakLongRunMiles = Math.max(0, options.basePeakLongRunMiles);
    const longRunCap = getMaintenanceLongRunCap(targetLongRunMiles, basePeakLongRunMiles);

    const recoveryWeeks = getMaintenanceRecoveryWeeks(options.weeks);
    const buildWeeks = Math.max(options.weeks - recoveryWeeks.length, 1);
    const growthSteps = Math.max(buildWeeks - 1, 1);
    const weeklyGrowthRate = calculateMaintenanceRate(weeklyMiles, targetWeeklyMiles, growthSteps);
    const longRunGrowthRate = calculateMaintenanceRate(longRunMiles, targetLongRunMiles, growthSteps);
    let lastBuildWeeklyMiles = weeklyMiles;
    let lastBuildLongRunMiles = longRunMiles;

    for (let weekIndex = 0; weekIndex < options.weeks; weekIndex++) {
        const weekNumber = weekIndex + 1;
        const isRecoveryWeek = recoveryWeeks.includes(weekNumber);

        if (weekNumber > 1) {
            if (isRecoveryWeek) {
                weeklyMiles = roundToTenth(lastBuildWeeklyMiles * MAINTENANCE_RECOVERY_RATIO);
                longRunMiles = roundToTenth(lastBuildLongRunMiles * MAINTENANCE_RECOVERY_RATIO);
            } else {
                weeklyMiles = stepTowardTarget(lastBuildWeeklyMiles, targetWeeklyMiles, weeklyGrowthRate);
                longRunMiles = stepTowardTarget(lastBuildLongRunMiles, targetLongRunMiles, longRunGrowthRate);
            }
        }

        if (weekNumber === options.weeks) {
            weeklyMiles = Math.min(weeklyMiles, targetWeeklyMiles * MAINTENANCE_FINAL_WEEK_CAP);
            longRunMiles = Math.min(longRunMiles, targetLongRunMiles + MAINTENANCE_LONG_RUN_OVERAGE_MILES);
        }

        weeklyMiles = Math.max(minWeeklyMiles, weeklyMiles);

        let maxLongRunByRatio = weeklyMiles * MAINTENANCE_MAX_LONG_RUN_RATIO;
        let minLongRunByRatio = weeklyMiles * MAINTENANCE_MIN_LONG_RUN_RATIO;

        if (longRunCap < minLongRunByRatio) {
            weeklyMiles = Math.max(minWeeklyMiles, roundToTenth(longRunCap / MAINTENANCE_MIN_LONG_RUN_RATIO));
            maxLongRunByRatio = weeklyMiles * MAINTENANCE_MAX_LONG_RUN_RATIO;
            minLongRunByRatio = weeklyMiles * MAINTENANCE_MIN_LONG_RUN_RATIO;
        }

        const maxLongRun = Math.min(maxLongRunByRatio, longRunCap);
        longRunMiles = Math.min(longRunMiles, maxLongRun);
        if (longRunMiles < minLongRunByRatio) {
            longRunMiles = Math.min(maxLongRun, minLongRunByRatio);
        }

        if (easyRunDays > 0) {
            const minEasyMiles = MIN_EASY_RUN_MILES * easyRunDays;
            if (weeklyMiles - longRunMiles < minEasyMiles) {
                longRunMiles = Math.max(1, roundToTenth(weeklyMiles - minEasyMiles));
            }
        }

        const remainingMiles = Math.max(0, weeklyMiles - longRunMiles);
        const avgEasy = easyRunDays > 0 ? roundToTenth(remainingMiles / easyRunDays) : 0;

        if (!isRecoveryWeek) {
            lastBuildWeeklyMiles = weeklyMiles;
            lastBuildLongRunMiles = longRunMiles;
        }

        const days: DayPlan[] = [];

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const profile = dayProfiles[dayIndex] ?? { type: 'rest' };
            const date = getDateForDay(weekNumber, dayIndex, input.raceDate, options.totalWeeks);

            let runWorkout: Workout | null = null;
            let isKeyDay = false;
            let crossTraining: CrossTrainingSuggestion | undefined;
            let scheduleType: 'rest' | 'easy' | 'quality' | 'long' = 'rest';

            if (profile.type === 'long') {
                runWorkout = buildMaintenanceWorkout(LONG_RUN_TEMPLATES[0], paces, longRunMiles);
                isKeyDay = true;
                scheduleType = 'long';
            } else if (profile.type === 'easy') {
                runWorkout = buildMaintenanceWorkout(EASY_TEMPLATES[0], paces, avgEasy);
                scheduleType = 'easy';
            } else if (profile.type === 'walk' || profile.type === 'cross_train') {
                crossTraining = buildCrossTrainingSuggestion(profile);
                scheduleType = 'easy';
            }

            if (!crossTraining) {
                crossTraining = scheduleCrossTrainingForDay(scheduleType, input);
            }

            days.push({
                date,
                dayOfWeek: dayIndex,
                runWorkout,
                strengthWorkout: scheduleStrengthForDay('base', scheduleType, dayIndex, input),
                durabilityModule: scheduleDurabilityForDay(scheduleType),
                durabilityRoutine: scheduleDurabilityRoutineForDay(scheduleType),
                crossTraining,
                isKeyDay,
                totalMiles: runWorkout?.totalDistance ?? 0,
                qualityMiles: runWorkout?.qualityMiles ?? 0,
            });
        }

        const actualTotalMiles = days.reduce((sum, day) => sum + day.totalMiles, 0);
        const easyMiles = days.reduce((sum, day) => sum + (day.runWorkout ? day.totalMiles : 0), 0);
        const keyWorkouts = days.filter(day => day.isKeyDay).length;

        weeks.push({
            weekNumber,
            weekOf: getWeekStartDate(weekNumber, input.raceDate, options.totalWeeks),
            phase: 'base' as TrainingPhase,
            phaseWeek: weekNumber,
            blockType: 'maintenance',
            days,
            totalMiles: actualTotalMiles,
            longRunMiles,
            easyMiles,
            qualityMiles: 0,
            easyPercentage: actualTotalMiles > 0 ? (easyMiles / actualTotalMiles) * 100 : 0,
            keyWorkouts,
            isRecoveryWeek,
            focus: isRecoveryWeek
                ? 'Maintenance block recovery week - reduced volume (not Higdon)'
                : 'Maintenance block - hold steady before race plan (not Higdon)',
            coachNotes: isRecoveryWeek
                ? 'Maintenance block recovery week to absorb training before the race plan.'
                : 'Maintenance block keeps fitness steady before the race plan. Not official Higdon.',
        });
    }

    return weeks;
}
