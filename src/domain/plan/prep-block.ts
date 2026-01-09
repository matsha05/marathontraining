/**
 * Prep Block Generator
 *
 * Generates a gentle, non-Higdon prep block to fill calendar gaps.
 * This is explicitly NOT a coach-authored plan.
 */

import { DayPlan, PlanGenerationInput, TrainingPhase, WeekPlan, Workout } from './types';
import { calculateTrainingPaces } from '../vdot/vdot-estimator';
import { getDateForDay, getWeekStartDate } from './date-utils';
import { buildWorkout, EASY_TEMPLATES, LONG_RUN_TEMPLATES } from './workouts/templates';
import { PHASE_DEFINITIONS, scheduleRecoveryWeeks } from './phases';
import type { PhaseBreakdown } from './phases';
import {
    scheduleStrengthForDay,
    scheduleDurabilityForDay,
    scheduleDurabilityRoutineForDay,
    scheduleCrossTrainingForDay,
} from './generator';

const MAX_WEEKLY_GROWTH_RATE = 1.1;
const RECOVERY_WEEK_RATIO = 0.82;
const MIN_LONG_RUN_RATIO = 0.33;
const MAX_LONG_RUN_RATIO = 0.5;
const MIN_EASY_RUN_MILES = 1;

const MAINTENANCE_BUILD_RATE_MAX = 1.05;
const MAINTENANCE_BUILD_RATE_MIN = 0.95;
const MAINTENANCE_RECOVERY_RATIO = 0.82;
const MAINTENANCE_MIN_LONG_RUN_RATIO = 0.25;
const MAINTENANCE_MAX_LONG_RUN_RATIO = 0.33;
const MAINTENANCE_FINAL_WEEK_CAP = 1.15;
const MAINTENANCE_LONG_RUN_OVERAGE_RATIO = 1.1;
const MAINTENANCE_LONG_RUN_OVERAGE_MILES = 1;

type PrepDayType = 'rest' | 'easy' | 'long';

interface PrepBlockOptions {
    weeks: number;
    totalWeeks: number;
    targetWeeklyMiles: number;
    targetLongRunMiles: number;
}

interface MaintenanceBlockOptions {
    weeks: number;
    totalWeeks: number;
    dayTypes: PrepDayType[];
    startWeeklyMiles: number;
    startLongRunMiles: number;
    targetWeeklyMiles: number;
    targetLongRunMiles: number;
    basePeakLongRunMiles: number;
}

function roundToTenth(value: number): number {
    return Math.round(value * 10) / 10;
}

function calculateGrowthRate(start: number, target: number, buildWeeks: number): number {
    if (buildWeeks <= 0) return 1;
    if (start <= 0 || target <= 0 || target <= start) return 1;
    return Math.min(MAX_WEEKLY_GROWTH_RATE, Math.pow(target / start, 1 / buildWeeks));
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

function buildPrepWorkout(
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

function getPrepWeekStructure(availableDays: 3 | 4 | 5 | 6, longRunDay: string): PrepDayType[] {
    const dayIndex = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
    };
    const longRunDayIndex = dayIndex[longRunDay.toLowerCase() as keyof typeof dayIndex] ?? 6;

    let week: PrepDayType[];

    switch (availableDays) {
        case 3:
            week = ['rest', 'rest', 'easy', 'rest', 'rest', 'easy', 'long'];
            break;
        case 4:
            week = ['rest', 'rest', 'easy', 'easy', 'rest', 'easy', 'long'];
            break;
        case 5:
            week = ['rest', 'easy', 'easy', 'easy', 'easy', 'rest', 'long'];
            break;
        case 6:
        default:
            week = ['easy', 'easy', 'easy', 'easy', 'easy', 'rest', 'long'];
            break;
    }

    if (longRunDayIndex === 0) {
        week[0] = 'long';
        week[6] = availableDays === 6 ? 'easy' : 'rest';
    }

    return week;
}

export function generatePrepBlockWeeks(
    input: PlanGenerationInput,
    options: PrepBlockOptions
): WeekPlan[] {
    const weeks: WeekPlan[] = [];
    const paces = calculateTrainingPaces(input.vdot);
    const structure = getPrepWeekStructure(input.availableDays, input.longRunDay);
    const easyRunDays = structure.filter(day => day === 'easy').length;

    const minWeeklyMiles = Math.max(1, MIN_EASY_RUN_MILES * easyRunDays + 1);
    let weeklyMiles = Math.max(minWeeklyMiles, input.weeklyMiles);
    let longRunMiles = Math.max(1, input.longestRecentRun);
    const targetWeeklyMiles = Math.max(weeklyMiles, options.targetWeeklyMiles);
    const targetLongRunMiles = Math.max(longRunMiles, options.targetLongRunMiles);
    const targetLongRunRatio = targetWeeklyMiles > 0 ? targetLongRunMiles / targetWeeklyMiles : MIN_LONG_RUN_RATIO;
    const longRunRatioCap = Math.min(MAX_LONG_RUN_RATIO, Math.max(MIN_LONG_RUN_RATIO, targetLongRunRatio));

    const phases: PhaseBreakdown[] = [
        {
            phase: 'base',
            startWeek: 1,
            endWeek: options.weeks,
            weeks: options.weeks,
            config: { phase: 'base', weeks: options.weeks, ...PHASE_DEFINITIONS.base },
        },
    ];
    const recoveryWeeks = scheduleRecoveryWeeks(options.weeks, phases).filter(week => week < options.weeks);
    const buildWeeks = Math.max(options.weeks - recoveryWeeks.length, 1);
    const growthSteps = Math.max(buildWeeks - 1, 1);
    const weeklyGrowthRate = calculateGrowthRate(weeklyMiles, targetWeeklyMiles, growthSteps);
    const longRunGrowthRate = calculateGrowthRate(longRunMiles, targetLongRunMiles, growthSteps);
    let lastBuildWeeklyMiles = weeklyMiles;
    let lastBuildLongRunMiles = longRunMiles;

    for (let weekIndex = 0; weekIndex < options.weeks; weekIndex++) {
        const weekNumber = weekIndex + 1;
        const isRecoveryWeek = recoveryWeeks.includes(weekNumber);

        if (weekIndex > 0) {
            if (isRecoveryWeek) {
                weeklyMiles = roundToTenth(lastBuildWeeklyMiles * RECOVERY_WEEK_RATIO);
                longRunMiles = roundToTenth(lastBuildLongRunMiles * RECOVERY_WEEK_RATIO);
            } else {
                weeklyMiles = Math.min(targetWeeklyMiles, roundToTenth(lastBuildWeeklyMiles * weeklyGrowthRate));
                longRunMiles = Math.min(targetLongRunMiles, roundToTenth(lastBuildLongRunMiles * longRunGrowthRate));
                lastBuildWeeklyMiles = weeklyMiles;
                lastBuildLongRunMiles = longRunMiles;
            }
        }

        const maxLongRun = weeklyMiles * longRunRatioCap;
        if (maxLongRun > 0) {
            longRunMiles = Math.min(longRunMiles, roundToTenth(maxLongRun));
        }

        if (easyRunDays > 0) {
            const minEasyMiles = MIN_EASY_RUN_MILES * easyRunDays;
            if (weeklyMiles - longRunMiles < minEasyMiles) {
                longRunMiles = Math.max(1, roundToTenth(weeklyMiles - minEasyMiles));
            }
        }

        const remainingMiles = Math.max(0, weeklyMiles - longRunMiles);
        const avgEasy = easyRunDays > 0 ? roundToTenth(remainingMiles / easyRunDays) : 0;

        const days: DayPlan[] = [];

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const dayType = structure[dayIndex];
            const date = getDateForDay(weekIndex + 1, dayIndex, input.raceDate, options.totalWeeks);

            let runWorkout: Workout | null = null;
            let isKeyDay = false;

            if (dayType === 'long') {
                runWorkout = buildPrepWorkout(LONG_RUN_TEMPLATES[0], paces, longRunMiles);
                isKeyDay = true;
            } else if (dayType === 'easy') {
                runWorkout = buildPrepWorkout(EASY_TEMPLATES[0], paces, avgEasy);
            }

            const scheduleType: 'rest' | 'easy' | 'quality' | 'long' =
                runWorkout === null ? 'rest' : dayType === 'long' ? 'long' : 'easy';

            days.push({
                date,
                dayOfWeek: dayIndex,
                runWorkout,
                strengthWorkout: scheduleStrengthForDay('base', scheduleType, dayIndex, input),
                durabilityModule: scheduleDurabilityForDay(scheduleType),
                durabilityRoutine: scheduleDurabilityRoutineForDay(scheduleType),
                crossTraining: scheduleCrossTrainingForDay(scheduleType, input),
                isKeyDay,
                totalMiles: runWorkout?.totalDistance ?? 0,
                qualityMiles: runWorkout?.qualityMiles ?? 0,
            });
        }

        const actualTotalMiles = days.reduce((sum, day) => sum + day.totalMiles, 0);
        const easyMiles = days.reduce((sum, day) => sum + (day.runWorkout ? day.totalMiles : 0), 0);
        const keyWorkouts = days.filter(day => day.isKeyDay).length;

        weeks.push({
            weekNumber: weekIndex + 1,
            weekOf: getWeekStartDate(weekIndex + 1, input.raceDate, options.totalWeeks),
            phase: 'base' as TrainingPhase,
            phaseWeek: weekIndex + 1,
            days,
            totalMiles: actualTotalMiles,
            longRunMiles,
            easyMiles,
            qualityMiles: 0,
            easyPercentage: actualTotalMiles > 0 ? (easyMiles / actualTotalMiles) * 100 : 0,
            keyWorkouts,
            isRecoveryWeek,
            focus: isRecoveryWeek
                ? 'Prep block recovery week - reduced volume (not Higdon)'
                : 'Prep block - gentle mileage build (not Higdon)',
            coachNotes: isRecoveryWeek
                ? 'Prep block recovery week to absorb training before the race plan.'
                : 'Prep block is a non-Higdon bridge to your race plan.',
        });
    }

    return weeks;
}

export function generateMaintenanceBlockWeeks(
    input: PlanGenerationInput,
    options: MaintenanceBlockOptions
): WeekPlan[] {
    if (options.weeks <= 0) return [];

    const weeks: WeekPlan[] = [];
    const paces = calculateTrainingPaces(input.vdot);
    const dayTypes = options.dayTypes.length === 7
        ? options.dayTypes
        : Array(7).fill('rest');
    const easyRunDays = dayTypes.filter(day => day === 'easy').length;
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
            const dayType = dayTypes[dayIndex] ?? 'rest';
            const date = getDateForDay(weekNumber, dayIndex, input.raceDate, options.totalWeeks);

            let runWorkout: Workout | null = null;
            let isKeyDay = false;

            if (dayType === 'long') {
                runWorkout = buildPrepWorkout(LONG_RUN_TEMPLATES[0], paces, longRunMiles);
                isKeyDay = true;
            } else if (dayType === 'easy') {
                runWorkout = buildPrepWorkout(EASY_TEMPLATES[0], paces, avgEasy);
            }

            const scheduleType: 'rest' | 'easy' | 'quality' | 'long' =
                runWorkout === null ? 'rest' : dayType === 'long' ? 'long' : 'easy';

            days.push({
                date,
                dayOfWeek: dayIndex,
                runWorkout,
                strengthWorkout: scheduleStrengthForDay('base', scheduleType, dayIndex, input),
                durabilityModule: scheduleDurabilityForDay(scheduleType),
                durabilityRoutine: scheduleDurabilityRoutineForDay(scheduleType),
                crossTraining: scheduleCrossTrainingForDay(scheduleType, input),
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
                : 'Maintenance base block - hold steady before race plan (not Higdon)',
            coachNotes: isRecoveryWeek
                ? 'Maintenance block recovery week to absorb training before the race plan.'
                : 'Maintenance block keeps fitness steady before the race plan. Not official Higdon.',
        });
    }

    return weeks;
}
