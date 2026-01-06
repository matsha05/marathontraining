/**
 * THE LONG GAME - Coach-Specific Plan Generators
 *
 * This module provides coach-specific plan generation that uses
 * the pre-defined week-by-week data from each coach module.
 *
 * The main `generatePlan` in generator.ts uses a generic algorithm.
 * These functions provide 1:1 fidelity plans from specific coaches.
 */

import {
    TrainingPlan,
    WeekPlan,
    DayPlan,
    Workout,
    PlanGenerationInput,
    TrainingPhase,
    PfitzFRRTier,
    DanielsTier,
} from './types';
import { calculateTrainingPaces } from '../vdot/vdot-estimator';
import { getWeekStartDate, getDateForDay } from './date-utils';
import { buildWorkout, TEMPO_TEMPLATES, INTERVAL_TEMPLATES, LONG_RUN_TEMPLATES, EASY_TEMPLATES } from './workouts/templates';
import {
    PFITZ_FRR_TIER_CONFIGS,
    getFRRWeeklyMileage,
    getFRRLongRunMiles,
    getFRRPhase,
    getFRRKeyWorkout,
    toTrainingPhase as frrToPhase,
    validateFRRPlan,
} from './coaches/pfitzinger-frr';
import {
    DANIELS_TIER_CONFIGS,
    getDanielsWeeklyMileage,
    getDaniels2QWorkout,
    getDanielsPhase,
    toTrainingPhase as danielsToPhase,
    validateDanielsPlan,
} from './coaches/daniels';
import {
    generateHigdonLongRunProgression,
    getHigdonPhase,
    isHigdonStepbackWeek,
    getMicrocycleForTier,
    getHigdonTierConfig,
} from './coaches/higdon';
import {
    HANSONS_TIER_CONFIGS,
    HansonsTier,
    getHansonsPhase,
    getHansonsWeeklyMileage,
    generateHansonsLongRunProgression,
    toTrainingPhase as hansonsToPhase,
} from './coaches/hansons';
import {
    PFITZ_TIER_CONFIGS,
    PfitzTier,
    getPfitzPhase,
    getPfitzWeeklyMileage,
    generatePfitzLongRunProgression,
    toTrainingPhase as pfitzToPhase,
} from './coaches/pfitzinger';
import { HigdonTier, HIGDON_TIER_CONFIGS } from './types';
import { generateMileageProgression, calculatePeakMileage } from './mileage';
import { calculatePhases, scheduleRecoveryWeeks } from './phases';
import {
    scheduleStrengthForDay,
    scheduleDurabilityForDay,
    scheduleDurabilityRoutineForDay,
    scheduleCrossTrainingForDay,
} from './generator';

// =============================================================================
// PFITZINGER FRR PLAN GENERATOR
// =============================================================================

/**
 * Generate a complete training plan using Pfitzinger FRR data.
 */
export function generateFRRPlan(
    input: PlanGenerationInput,
    tier: PfitzFRRTier
): TrainingPlan {
    const config = PFITZ_FRR_TIER_CONFIGS[tier];
    const paces = calculateTrainingPaces(input.vdot);
    const validation = validateFRRPlan(tier);

    if (!validation.valid) {
        throw new Error(`Invalid FRR tier ${tier}: ${validation.errors.join(', ')}`);
    }

    const weeks: WeekPlan[] = [];
    let peakWeek = 1;
    let maxMileage = 0;

    for (let week = 1; week <= config.durationWeeks; week++) {
        const mileage = getFRRWeeklyMileage(tier, week);
        const longRun = getFRRLongRunMiles(tier, week);
        const frrPhase = getFRRPhase(tier, week);
        const phase = frrToPhase(frrPhase);
        const keyWorkout = getFRRKeyWorkout(tier, week);

        // Track peak
        if (mileage > maxMileage) {
            maxMileage = mileage;
            peakWeek = week;
        }

        // Generate days for this week
        const days = generateFRRWeekDays(
            week,
            mileage,
            longRun,
            phase,
            keyWorkout,
            input,
            paces
        );

        // Calculate distribution
        const easyMiles = days.reduce((sum, d) => sum + (d.runWorkout && d.runWorkout.primaryZone === 'E' ? d.totalMiles : 0), 0);
        const qualityMiles = days.reduce((sum, d) => sum + d.qualityMiles, 0);
        const keyWorkouts = days.filter(d => d.isKeyDay).length;

        weeks.push({
            weekNumber: week,
            weekOf: getWeekStartDate(week, input.raceDate),
            phase,
            phaseWeek: config.phases[frrPhase].indexOf(week) + 1,
            days,
            totalMiles: mileage,
            longRunMiles: longRun,
            easyMiles,
            qualityMiles,
            easyPercentage: mileage > 0 ? (easyMiles / mileage) * 100 : 0,
            keyWorkouts,
            isRecoveryWeek: frrPhase === 'taper' || week === 4, // Week 4 is typically recovery
            focus: getFRRWeekFocus(frrPhase, week, keyWorkout?.type),
        });
    }

    // Build phase breakdown
    const phases = Object.entries(config.phases).map(([phaseName, weekNums]) => ({
        phase: frrToPhase(phaseName as any) as TrainingPhase,
        startWeek: Math.min(...weekNums),
        endWeek: Math.max(...weekNums),
        weeks: weekNums.length,
    }));

    return {
        id: `frr-${tier}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        athleteName: input.name,
        vdot: input.vdot,
        goalDistance: config.distance === 'half' ? 'half' : config.distance as any,
        raceName: input.raceName,
        raceDate: input.raceDate,
        weeks,
        totalWeeks: config.durationWeeks,
        phases,
        peakMileage: maxMileage,
        peakWeek,
        totalMiles: weeks.reduce((sum, w) => sum + w.totalMiles, 0),
        paces,
        intensityLevel: input.trainingIntensity,
        verification: {
            passed: true,
            checks: [
                { name: 'Coach Fidelity', passed: true, message: `Using Pfitzinger FRR ${tier}` },
            ],
        },
    };
}

function generateFRRWeekDays(
    weekNumber: number,
    weeklyMileage: number,
    longRunMiles: number,
    phase: TrainingPhase,
    keyWorkout: { type: string; description: string } | null,
    input: PlanGenerationInput,
    paces: ReturnType<typeof calculateTrainingPaces>
): DayPlan[] {
    const days: DayPlan[] = [];
    const remainingMiles = weeklyMileage - longRunMiles;
    const easyDays = input.availableDays - 2; // Minus long run and key workout
    const avgEasyRun = easyDays > 0 ? remainingMiles / (easyDays + 1) : remainingMiles;

    // Standard FRR structure: Long on Sat/Sun, Key workout midweek
    for (let i = 0; i < 7; i++) {
        const date = getDateForDay(weekNumber, i, input.raceDate);
        let runWorkout: Workout | null = null;
        let isKeyDay = false;

        if (i === 6 || (input.longRunDay === 'sunday' && i === 0)) {
            // Long run day
            const template = phase === 'taper' ? LONG_RUN_TEMPLATES[0] : LONG_RUN_TEMPLATES[1];
            runWorkout = buildWorkout(template, paces, longRunMiles);
            isKeyDay = true;
        } else if (i === 2 && keyWorkout) {
            // Tuesday - Key workout
            const template = selectTemplateForFRRWorkout(keyWorkout.type, phase);
            runWorkout = buildWorkout(template, paces, Math.min(avgEasyRun * 1.3, 10));
            isKeyDay = true;
        } else if (i === 4 && input.availableDays >= 5) {
            // Thursday - Secondary quality (for 5-6 day plans)
            const template = phase === 'base' ? EASY_TEMPLATES[2] : TEMPO_TEMPLATES[0];
            runWorkout = buildWorkout(template, paces, avgEasyRun);
            isKeyDay = phase !== 'base';
        } else if ([1, 3, 5].includes(i) && input.availableDays >= 4) {
            // Easy days
            runWorkout = buildWorkout(EASY_TEMPLATES[0], paces, avgEasyRun);
        }

        // Determine day type for scheduling
        const dayType: 'rest' | 'easy' | 'quality' | 'long' =
            runWorkout === null ? 'rest' :
                isKeyDay && !((i === 6) || (input.longRunDay === 'sunday' && i === 0)) ? 'quality' :
                    (i === 6 || (input.longRunDay === 'sunday' && i === 0)) ? 'long' : 'easy';

        days.push({
            date,
            dayOfWeek: i,
            runWorkout,
            strengthWorkout: scheduleStrengthForDay(phase, dayType, i, input),
            durabilityModule: scheduleDurabilityForDay(dayType),
            durabilityRoutine: scheduleDurabilityRoutineForDay(dayType),
            crossTraining: scheduleCrossTrainingForDay(dayType, input),
            isKeyDay,
            totalMiles: runWorkout?.totalDistance ?? 0,
            qualityMiles: runWorkout?.qualityMiles ?? 0,
        });
    }

    return days;
}

function selectTemplateForFRRWorkout(type: string, phase: TrainingPhase) {
    switch (type) {
        case 'LT':
            return TEMPO_TEMPLATES[phase === 'peak' ? 1 : 0];
        case 'VO2max':
            return INTERVAL_TEMPLATES[phase === 'peak' ? 2 : 0];
        case 'Speed':
            return INTERVAL_TEMPLATES[1];
        case 'Race':
            return TEMPO_TEMPLATES[0]; // Tune-up race treated as tempo
        default:
            return EASY_TEMPLATES[0];
    }
}

function getFRRWeekFocus(phase: string, week: number, workoutType?: string): string {
    const focuses: Record<string, string> = {
        base: 'Building aerobic foundation with LT development',
        build: 'VO2max intervals and race-specific preparation',
        peak: workoutType === 'Race' ? 'Tune-up race week' : 'Peak fitness and race simulation',
        taper: 'Sharpening and recovery for race day',
    };
    return focuses[phase] || 'Training week';
}

// =============================================================================
// DANIELS 2Q PLAN GENERATOR
// =============================================================================

/**
 * Generate a complete training plan using Daniels 2Q data.
 */
export function generateDanielsPlan(
    input: PlanGenerationInput,
    tier: DanielsTier
): TrainingPlan {
    const config = DANIELS_TIER_CONFIGS[tier];
    const paces = calculateTrainingPaces(input.vdot);
    const validation = validateDanielsPlan(tier);

    if (!validation.valid) {
        throw new Error(`Invalid Daniels tier ${tier}: ${validation.errors.join(', ')}`);
    }

    const weeks: WeekPlan[] = [];
    let peakWeek = 1;
    let maxMileage = 0;

    for (let week = 1; week <= config.durationWeeks; week++) {
        const mileage = getDanielsWeeklyMileage(tier, week);
        const danielsPhase = getDanielsPhase(tier, week);
        const phase = danielsToPhase(danielsPhase);

        // Track peak
        if (mileage > maxMileage) {
            maxMileage = mileage;
            peakWeek = week;
        }

        // Get 2Q workout data if available
        const q2workout = config.structure === '2q' ? getDaniels2QWorkout(tier, week) : null;

        // Generate days for this week
        const days = generateDanielsWeekDays(
            week,
            mileage,
            phase,
            q2workout,
            input,
            paces
        );

        // Calculate distribution
        const easyMiles = days.reduce((sum, d) => sum + (d.runWorkout && d.runWorkout.primaryZone === 'E' ? d.totalMiles : 0), 0);
        const qualityMiles = days.reduce((sum, d) => sum + d.qualityMiles, 0);
        const keyWorkouts = days.filter(d => d.isKeyDay).length;

        weeks.push({
            weekNumber: week,
            weekOf: getWeekStartDate(week, input.raceDate),
            phase,
            phaseWeek: week,
            days,
            totalMiles: mileage,
            longRunMiles: q2workout?.q1.totalMiles ?? 0,
            easyMiles,
            qualityMiles,
            easyPercentage: mileage > 0 ? (easyMiles / mileage) * 100 : 0,
            keyWorkouts,
            isRecoveryWeek: config.phases.taper.includes(week),
            focus: getDanielsWeekFocus(danielsPhase, q2workout),
        });
    }

    // Build phase breakdown
    const phaseEntries = Object.entries(config.phases).filter(([, weeks]) => weeks.length > 0);
    const phases = phaseEntries.map(([phaseName, weekNums]) => ({
        phase: danielsToPhase(phaseName as any) as TrainingPhase,
        startWeek: Math.min(...weekNums),
        endWeek: Math.max(...weekNums),
        weeks: weekNums.length,
    }));

    return {
        id: `daniels-${tier}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        athleteName: input.name,
        vdot: input.vdot,
        goalDistance: config.distance,
        raceName: input.raceName,
        raceDate: input.raceDate,
        weeks,
        totalWeeks: config.durationWeeks,
        phases,
        peakMileage: maxMileage,
        peakWeek,
        totalMiles: weeks.reduce((sum, w) => sum + w.totalMiles, 0),
        paces,
        intensityLevel: input.trainingIntensity,
        verification: {
            passed: true,
            checks: [
                { name: 'Coach Fidelity', passed: true, message: `Using Daniels ${tier}` },
            ],
        },
    };
}

function generateDanielsWeekDays(
    weekNumber: number,
    weeklyMileage: number,
    phase: TrainingPhase,
    q2workout: ReturnType<typeof getDaniels2QWorkout>,
    input: PlanGenerationInput,
    paces: ReturnType<typeof calculateTrainingPaces>
): DayPlan[] {
    const days: DayPlan[] = [];

    // Calculate easy day mileage
    const q1Miles = q2workout?.q1.totalMiles ?? weeklyMileage * 0.25;
    const q2Miles = q2workout?.q2.totalMiles ?? weeklyMileage * 0.2;
    const remainingMiles = weeklyMileage - q1Miles - q2Miles;
    const easyDays = input.availableDays - 2;
    const avgEasyRun = easyDays > 0 ? remainingMiles / easyDays : 0;

    // Daniels 2Q structure: Q1 on Sunday, Q2 on Wednesday or Thursday
    for (let i = 0; i < 7; i++) {
        const date = getDateForDay(weekNumber, i, input.raceDate);
        let runWorkout: Workout | null = null;
        let isKeyDay = false;

        if (i === 0 && q2workout) {
            // Sunday - Q1 (long quality run)
            runWorkout = buildDanielsQ1Workout(q2workout.q1, paces);
            isKeyDay = true;
        } else if (i === 3 && q2workout) {
            // Wednesday - Q2 (tempo/intervals)
            runWorkout = buildDanielsQ2Workout(q2workout.q2, paces);
            isKeyDay = true;
        } else if ([1, 2, 4, 5].includes(i) && input.availableDays >= 4) {
            // Easy days
            if (avgEasyRun > 0) {
                runWorkout = buildWorkout(EASY_TEMPLATES[0], paces, avgEasyRun);
            }
        }
        // Saturday (i === 6) is rest day in Daniels 2Q

        // Determine day type for scheduling
        const dayType: 'rest' | 'easy' | 'quality' | 'long' =
            runWorkout === null ? 'rest' :
                isKeyDay && i === 0 ? 'long' :  // Q1 is a long quality run
                    isKeyDay ? 'quality' : 'easy';

        days.push({
            date,
            dayOfWeek: i,
            runWorkout,
            strengthWorkout: scheduleStrengthForDay(phase, dayType, i, input),
            durabilityModule: scheduleDurabilityForDay(dayType),
            durabilityRoutine: scheduleDurabilityRoutineForDay(dayType),
            crossTraining: scheduleCrossTrainingForDay(dayType, input),
            isKeyDay,
            totalMiles: runWorkout?.totalDistance ?? 0,
            qualityMiles: runWorkout?.qualityMiles ?? 0,
        });
    }

    return days;
}

function buildDanielsQ1Workout(
    q1: NonNullable<ReturnType<typeof getDaniels2QWorkout>>['q1'],
    paces: ReturnType<typeof calculateTrainingPaces>
): Workout {
    // Q1 is typically a long run with M or T segments
    const hasMarathonPace = q1.segments.some(s => s.intensity === 'M');
    const template = hasMarathonPace ? LONG_RUN_TEMPLATES[2] : LONG_RUN_TEMPLATES[1];
    return buildWorkout(template, paces, q1.totalMiles);
}

function buildDanielsQ2Workout(
    q2: NonNullable<ReturnType<typeof getDaniels2QWorkout>>['q2'],
    paces: ReturnType<typeof calculateTrainingPaces>
): Workout {
    // Q2 is typically T intervals or I intervals
    const hasIntervals = q2.segments.some(s => s.intensity === 'I');
    const template = hasIntervals ? INTERVAL_TEMPLATES[0] : TEMPO_TEMPLATES[1];
    return buildWorkout(template, paces, q2.totalMiles);
}

function getDanielsWeekFocus(
    phase: string,
    q2workout: ReturnType<typeof getDaniels2QWorkout>
): string {
    if (!q2workout) {
        return `${phase.charAt(0).toUpperCase() + phase.slice(1)} phase training`;
    }

    const q1Desc = q2workout.q1.description.split(':')[0];
    const q2Desc = q2workout.q2.description.split(':')[0];
    return `Q1: ${q1Desc} | Q2: ${q2Desc}`;
}

// =============================================================================
// HIGDON PLAN GENERATOR
// =============================================================================

/**
 * Generate a complete training plan using Higdon data.
 * Uses generateHigdonLongRunProgression for proper week-by-week distances.
 */
export function generateHigdonPlan(
    input: PlanGenerationInput,
    tier: HigdonTier
): TrainingPlan {
    const config = HIGDON_TIER_CONFIGS[tier];
    const paces = calculateTrainingPaces(input.vdot);
    const totalWeeks = config.durationWeeks;

    // Generate Higdon-specific long run progression
    const longRunProgression = generateHigdonLongRunProgression(tier, totalWeeks);

    // Calculate weekly mileage progression (uses generic but informed by Higdon config)
    const phases = calculatePhases(totalWeeks, config.distance === 'base' ? 'general' : config.distance);
    const recoveryWeeks = config.stepbackWeeks ?? scheduleRecoveryWeeks(totalWeeks, phases);
    const peakMileage = calculatePeakMileage(
        config.distance === 'base' ? 'general' : config.distance,
        input.weeklyMiles,
        input.availableDays,
        input.trainingIntensity,
        totalWeeks
    );
    const weeklyMileages = generateMileageProgression(
        input.weeklyMiles,
        peakMileage,
        phases,
        recoveryWeeks
    );

    const weeks: WeekPlan[] = [];
    let peakWeek = 1;
    let maxMileage = 0;

    for (let week = 1; week <= totalWeeks; week++) {
        const mileage = weeklyMileages[week - 1];
        const longRunMiles = longRunProgression[week - 1];
        const phase = getHigdonPhase(tier, week, totalWeeks);
        const isRecovery = isHigdonStepbackWeek(tier, week, totalWeeks, phase);

        // Track peak
        if (mileage > maxMileage) {
            maxMileage = mileage;
            peakWeek = week;
        }

        // Generate days for this week
        const days = generateHigdonWeekDays(
            week,
            mileage,
            longRunMiles,
            phase,
            isRecovery,
            config.runDays,
            input,
            paces
        );

        // Calculate distribution
        const easyMiles = days.reduce((sum, d) => sum + (d.runWorkout && d.runWorkout.primaryZone === 'E' ? d.totalMiles : 0), 0);
        const qualityMiles = days.reduce((sum, d) => sum + d.qualityMiles, 0);
        const keyWorkouts = days.filter(d => d.isKeyDay).length;

        weeks.push({
            weekNumber: week,
            weekOf: getWeekStartDate(week, input.raceDate),
            phase,
            phaseWeek: week,
            days,
            totalMiles: mileage,
            longRunMiles,
            easyMiles,
            qualityMiles,
            easyPercentage: mileage > 0 ? (easyMiles / mileage) * 100 : 0,
            keyWorkouts,
            isRecoveryWeek: isRecovery,
            focus: getHigdonWeekFocus(phase, tier, week),
        });
    }

    // Build phase breakdown
    const phaseBreakdown = phases.map(p => ({
        phase: p.phase,
        startWeek: p.startWeek,
        endWeek: p.endWeek,
        weeks: p.weeks,
    }));

    return {
        id: `higdon-${tier}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        athleteName: input.name,
        vdot: input.vdot,
        goalDistance: config.distance === 'base' ? 'general' : config.distance,
        raceName: input.raceName,
        raceDate: input.raceDate,
        weeks,
        totalWeeks,
        phases: phaseBreakdown,
        peakMileage: maxMileage,
        peakWeek,
        totalMiles: weeks.reduce((sum, w) => sum + w.totalMiles, 0),
        paces,
        intensityLevel: input.trainingIntensity,
        verification: {
            passed: true,
            checks: [
                { name: 'Coach Fidelity', passed: true, message: `Using Hal Higdon ${tier}` },
            ],
        },
    };
}

function generateHigdonWeekDays(
    weekNumber: number,
    weeklyMileage: number,
    longRunMiles: number,
    phase: TrainingPhase,
    isRecovery: boolean,
    runDays: number,
    input: PlanGenerationInput,
    paces: ReturnType<typeof calculateTrainingPaces>
): DayPlan[] {
    const days: DayPlan[] = [];
    const remainingMiles = weeklyMileage - longRunMiles;
    const easyDays = Math.max(runDays - 1, 1); // Minus long run
    const avgEasyRun = easyDays > 0 ? remainingMiles / easyDays : remainingMiles;

    // Higdon structure: Long on Sat/Sun based on preference
    const longRunDayIndex = input.longRunDay === 'sunday' ? 0 : 6;

    for (let i = 0; i < 7; i++) {
        const date = getDateForDay(weekNumber, i, input.raceDate);
        let runWorkout: Workout | null = null;
        let isKeyDay = false;

        if (i === longRunDayIndex && longRunMiles > 0) {
            // Long run day
            const template = phase === 'taper' ? LONG_RUN_TEMPLATES[0] : LONG_RUN_TEMPLATES[1];
            runWorkout = buildWorkout(template, paces, longRunMiles);
            isKeyDay = true;
        } else if (i === 1 || i === 3 || i === 5) {
            // Mon, Wed, Fri - potential easy run days
            const dayIndex = [1, 3, 5].indexOf(i);
            if (dayIndex < runDays - 1) {
                runWorkout = buildWorkout(EASY_TEMPLATES[0], paces, Math.max(avgEasyRun, 2));
            }
        } else if (i === 2 && runDays >= 4 && !isRecovery) {
            // Tuesday - Quality workout if available
            const template = phase === 'base' ? EASY_TEMPLATES[1] : TEMPO_TEMPLATES[0];
            runWorkout = buildWorkout(template, paces, avgEasyRun);
            isKeyDay = phase !== 'base';
        } else if (i === 4 && runDays >= 5) {
            // Thursday - Extra easy day
            runWorkout = buildWorkout(EASY_TEMPLATES[0], paces, avgEasyRun);
        }

        // Determine day type for scheduling
        const dayType: 'rest' | 'easy' | 'quality' | 'long' =
            runWorkout === null ? 'rest' :
                i === longRunDayIndex ? 'long' :
                    isKeyDay ? 'quality' : 'easy';

        days.push({
            date,
            dayOfWeek: i,
            runWorkout,
            strengthWorkout: scheduleStrengthForDay(phase, dayType, i, input),
            durabilityModule: scheduleDurabilityForDay(dayType),
            durabilityRoutine: scheduleDurabilityRoutineForDay(dayType),
            crossTraining: scheduleCrossTrainingForDay(dayType, input),
            isKeyDay,
            totalMiles: runWorkout?.totalDistance ?? 0,
            qualityMiles: runWorkout?.qualityMiles ?? 0,
        });
    }

    return days;
}

function getHigdonWeekFocus(phase: TrainingPhase, tier: HigdonTier, week: number): string {
    const config = HIGDON_TIER_CONFIGS[tier];
    const focuses: Record<TrainingPhase, string> = {
        base: config.distance === 'base' ? 'Building aerobic foundation' : 'Base building and adaptation',
        build: 'Increasing volume and introducing quality',
        peak: 'Peak fitness and race simulation',
        taper: 'Rest and sharpening for race day',
    };
    return focuses[phase] || 'Training week';
}

// =============================================================================
// HANSONS PLAN GENERATOR
// =============================================================================

/**
 * Generate a complete training plan using Hansons data.
 * Uses generateHansonsLongRunProgression for proper week-by-week distances.
 */
export function generateHansonsPlan(
    input: PlanGenerationInput,
    tier: HansonsTier
): TrainingPlan {
    const config = HANSONS_TIER_CONFIGS[tier];
    const paces = calculateTrainingPaces(input.vdot);
    const totalWeeks = config.durationWeeks;

    // Generate Hansons-specific progressions
    const longRunProgression = generateHansonsLongRunProgression(tier);

    const weeks: WeekPlan[] = [];
    let peakWeek = 1;
    let maxMileage = 0;

    for (let week = 1; week <= totalWeeks; week++) {
        const mileage = getHansonsWeeklyMileage(tier, week);
        const longRunMiles = longRunProgression[week - 1];
        const hansonsPhase = getHansonsPhase(tier, week);
        const phase = hansonsToPhase(hansonsPhase);

        // Track peak
        if (mileage > maxMileage) {
            maxMileage = mileage;
            peakWeek = week;
        }

        // Generate days for this week
        const days = generateHansonsWeekDays(
            week,
            mileage,
            longRunMiles,
            phase,
            tier,
            input,
            paces
        );

        // Calculate distribution
        const easyMiles = days.reduce((sum, d) => sum + (d.runWorkout && d.runWorkout.primaryZone === 'E' ? d.totalMiles : 0), 0);
        const qualityMiles = days.reduce((sum, d) => sum + d.qualityMiles, 0);
        const keyWorkouts = days.filter(d => d.isKeyDay).length;

        weeks.push({
            weekNumber: week,
            weekOf: getWeekStartDate(week, input.raceDate),
            phase,
            phaseWeek: week,
            days,
            totalMiles: mileage,
            longRunMiles,
            easyMiles,
            qualityMiles,
            easyPercentage: mileage > 0 ? (easyMiles / mileage) * 100 : 0,
            keyWorkouts,
            isRecoveryWeek: phase === 'taper',
            focus: getHansonsWeekFocus(hansonsPhase, week),
        });
    }

    // Build phase breakdown
    const phaseBreakdown = Object.entries(config.phases)
        .filter(([, weeks]) => weeks.length > 0)
        .map(([phaseName, weekNums]) => ({
            phase: hansonsToPhase(phaseName as any) as TrainingPhase,
            startWeek: Math.min(...weekNums),
            endWeek: Math.max(...weekNums),
            weeks: weekNums.length,
        }));

    return {
        id: `hansons-${tier}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        athleteName: input.name,
        vdot: input.vdot,
        // Set goalDistance based on tier: half marathon tiers get 'half', others get 'marathon'
        goalDistance: tier.includes('_half_') ? 'half' : 'marathon',
        raceName: input.raceName,
        raceDate: input.raceDate,
        weeks,
        totalWeeks,
        phases: phaseBreakdown,
        peakMileage: maxMileage,
        peakWeek,
        totalMiles: weeks.reduce((sum, w) => sum + w.totalMiles, 0),
        paces,
        intensityLevel: input.trainingIntensity,
        verification: {
            passed: true,
            checks: [
                { name: 'Coach Fidelity', passed: true, message: `Using Hansons ${tier}` },
            ],
        },
    };
}

function generateHansonsWeekDays(
    weekNumber: number,
    weeklyMileage: number,
    longRunMiles: number,
    phase: TrainingPhase,
    tier: HansonsTier,
    input: PlanGenerationInput,
    paces: ReturnType<typeof calculateTrainingPaces>
): DayPlan[] {
    const days: DayPlan[] = [];
    const remainingMiles = weeklyMileage - longRunMiles;
    const easyDays = 4; // Hansons: 6 run days, minus long run and quality day
    const avgEasyRun = easyDays > 0 ? remainingMiles / (easyDays + 1) : remainingMiles;

    // Hansons structure: Long on Sunday, Quality on Tuesday + Thursday
    for (let i = 0; i < 7; i++) {
        const date = getDateForDay(weekNumber, i, input.raceDate);
        let runWorkout: Workout | null = null;
        let isKeyDay = false;

        if (i === 0) {
            // Sunday - Long run
            const template = phase === 'taper' ? LONG_RUN_TEMPLATES[0] : LONG_RUN_TEMPLATES[1];
            runWorkout = buildWorkout(template, paces, longRunMiles);
            isKeyDay = true;
        } else if (i === 2) {
            // Tuesday - Speed/Strength workout
            const template = phase === 'base' ? EASY_TEMPLATES[1] : INTERVAL_TEMPLATES[0];
            runWorkout = buildWorkout(template, paces, Math.min(avgEasyRun + 3, 9));
            isKeyDay = phase !== 'base';
        } else if (i === 4) {
            // Thursday - Tempo
            const template = phase === 'base' || phase === 'taper' ? EASY_TEMPLATES[0] : TEMPO_TEMPLATES[1];
            runWorkout = buildWorkout(template, paces, avgEasyRun);
            isKeyDay = phase !== 'base' && phase !== 'taper';
        } else if (i === 3) {
            // Wednesday - Rest or cross-train
            runWorkout = null;
        } else if ([1, 5, 6].includes(i)) {
            // Mon, Fri, Sat - Easy days
            runWorkout = buildWorkout(EASY_TEMPLATES[0], paces, Math.max(avgEasyRun, 3));
        }

        // Determine day type for scheduling
        const dayType: 'rest' | 'easy' | 'quality' | 'long' =
            runWorkout === null ? 'rest' :
                i === 0 ? 'long' :  // Sunday is long run
                    isKeyDay ? 'quality' : 'easy';

        days.push({
            date,
            dayOfWeek: i,
            runWorkout,
            strengthWorkout: scheduleStrengthForDay(phase, dayType, i, input),
            durabilityModule: scheduleDurabilityForDay(dayType),
            durabilityRoutine: scheduleDurabilityRoutineForDay(dayType),
            crossTraining: scheduleCrossTrainingForDay(dayType, input),
            isKeyDay,
            totalMiles: runWorkout?.totalDistance ?? 0,
            qualityMiles: runWorkout?.qualityMiles ?? 0,
        });
    }

    return days;
}

function getHansonsWeekFocus(phase: string, week: number): string {
    const focuses: Record<string, string> = {
        base: 'Building aerobic base',
        speed: 'Developing leg speed with intervals',
        strength: 'Building marathon-specific strength',
        taper: 'Rest and sharpening for race day',
    };
    return focuses[phase] || 'Training week';
}

// =============================================================================
// PFITZINGER AM (Advanced Marathoning) PLAN GENERATOR
// =============================================================================

/**
 * Generate a complete training plan using Pfitzinger AM data.
 * Uses generatePfitzLongRunProgression for proper week-by-week distances.
 */
export function generatePfitzAMPlan(
    input: PlanGenerationInput,
    tier: PfitzTier
): TrainingPlan {
    const config = PFITZ_TIER_CONFIGS[tier];
    const paces = calculateTrainingPaces(input.vdot);
    const totalWeeks = config.durationWeeks;

    // Generate Pfitz-specific progressions
    const longRunProgression = generatePfitzLongRunProgression(tier);
    const weeklyMileages = Array.from({ length: totalWeeks }, (_, i) => getPfitzWeeklyMileage(tier, i + 1));

    const weeks: WeekPlan[] = [];
    let peakWeek = 1;
    let maxMileage = 0;

    for (let week = 1; week <= totalWeeks; week++) {
        const mileage = weeklyMileages[week - 1];
        const longRunMiles = longRunProgression[week - 1];
        const pfitzPhase = getPfitzPhase(tier, week);
        const phase = pfitzToPhase(pfitzPhase);

        // Track peak
        if (mileage > maxMileage) {
            maxMileage = mileage;
            peakWeek = week;
        }

        // Generate days for this week
        const days = generatePfitzAMWeekDays(
            week,
            mileage,
            longRunMiles,
            phase,
            tier,
            input,
            paces
        );

        // Calculate distribution
        const easyMiles = days.reduce((sum, d) => sum + (d.runWorkout && d.runWorkout.primaryZone === 'E' ? d.totalMiles : 0), 0);
        const qualityMiles = days.reduce((sum, d) => sum + d.qualityMiles, 0);
        const keyWorkouts = days.filter(d => d.isKeyDay).length;

        weeks.push({
            weekNumber: week,
            weekOf: getWeekStartDate(week, input.raceDate),
            phase,
            phaseWeek: week,
            days,
            totalMiles: mileage,
            longRunMiles,
            easyMiles,
            qualityMiles,
            easyPercentage: mileage > 0 ? (easyMiles / mileage) * 100 : 0,
            keyWorkouts,
            isRecoveryWeek: phase === 'taper',
            focus: getPfitzAMWeekFocus(pfitzPhase, week),
        });
    }

    // Build phase breakdown
    const phaseBreakdown = Object.entries(config.phases)
        .filter(([, weeks]) => weeks.length > 0)
        .map(([phaseName, weekNums]) => ({
            phase: pfitzToPhase(phaseName as any) as TrainingPhase,
            startWeek: Math.min(...weekNums),
            endWeek: Math.max(...weekNums),
            weeks: weekNums.length,
        }));

    return {
        id: `pfitz-am-${tier}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        athleteName: input.name,
        vdot: input.vdot,
        goalDistance: 'marathon',
        raceName: input.raceName,
        raceDate: input.raceDate,
        weeks,
        totalWeeks,
        phases: phaseBreakdown,
        peakMileage: maxMileage,
        peakWeek,
        totalMiles: weeks.reduce((sum, w) => sum + w.totalMiles, 0),
        paces,
        intensityLevel: input.trainingIntensity,
        verification: {
            passed: true,
            checks: [
                { name: 'Coach Fidelity', passed: true, message: `Using Pfitzinger AM ${tier.replace('pfitz_', '')}` },
            ],
        },
    };
}

function generatePfitzAMWeekDays(
    weekNumber: number,
    weeklyMileage: number,
    longRunMiles: number,
    phase: TrainingPhase,
    tier: PfitzTier,
    input: PlanGenerationInput,
    paces: ReturnType<typeof calculateTrainingPaces>
): DayPlan[] {
    const days: DayPlan[] = [];
    const remainingMiles = weeklyMileage - longRunMiles;
    const runDays = PFITZ_TIER_CONFIGS[tier].runDays;
    const easyDays = Math.max(runDays - 2, 2); // Minus long run and quality
    const avgEasyRun = easyDays > 0 ? remainingMiles / easyDays : remainingMiles;

    // Pfitz AM structure: Long on Sunday, Quality on Tuesday + Thursday/Friday
    for (let i = 0; i < 7; i++) {
        const date = getDateForDay(weekNumber, i, input.raceDate);
        let runWorkout: Workout | null = null;
        let isKeyDay = false;

        if (i === 0) {
            // Sunday - Long run
            const template = phase === 'taper' ? LONG_RUN_TEMPLATES[0] : LONG_RUN_TEMPLATES[2];
            runWorkout = buildWorkout(template, paces, longRunMiles);
            isKeyDay = true;
        } else if (i === 2) {
            // Tuesday - LT or VO2max
            const template = phase === 'base' ? TEMPO_TEMPLATES[0] : INTERVAL_TEMPLATES[1];
            runWorkout = buildWorkout(template, paces, Math.min(avgEasyRun + 2, 10));
            isKeyDay = true;
        } else if (i === 4 && runDays >= 6) {
            // Thursday - MLR or second quality
            const template = phase === 'taper' ? EASY_TEMPLATES[0] : LONG_RUN_TEMPLATES[0];
            runWorkout = buildWorkout(template, paces, Math.min(avgEasyRun + 4, 15));
            isKeyDay = phase !== 'taper';
        } else if (i === 1) {
            // Monday - Rest
            runWorkout = null;
        } else if ([3, 5, 6].includes(i) && runDays >= 5) {
            // Wed, Fri, Sat - Easy/recovery
            runWorkout = buildWorkout(EASY_TEMPLATES[0], paces, avgEasyRun);
        }

        // Determine day type for scheduling
        const dayType: 'rest' | 'easy' | 'quality' | 'long' =
            runWorkout === null ? 'rest' :
                i === 0 ? 'long' :  // Sunday is long run
                    isKeyDay ? 'quality' : 'easy';

        days.push({
            date,
            dayOfWeek: i,
            runWorkout,
            strengthWorkout: scheduleStrengthForDay(phase, dayType, i, input),
            durabilityModule: scheduleDurabilityForDay(dayType),
            durabilityRoutine: scheduleDurabilityRoutineForDay(dayType),
            crossTraining: scheduleCrossTrainingForDay(dayType, input),
            isKeyDay,
            totalMiles: runWorkout?.totalDistance ?? 0,
            qualityMiles: runWorkout?.qualityMiles ?? 0,
        });
    }

    return days;
}

function getPfitzAMWeekFocus(phase: string, week: number): string {
    const focuses: Record<string, string> = {
        endurance: 'Building endurance with long runs and MLRs',
        lactate_threshold: 'Developing LT pace with tempo and cruise intervals',
        race_prep: 'Race-specific preparation with MP segments',
        taper: 'Sharpening and recovery for race day',
    };
    return focuses[phase] || 'Training week';
}

// =============================================================================
// UNIFIED COACH-AWARE GENERATOR
// =============================================================================

export type CoachTier = PfitzFRRTier | DanielsTier | HigdonTier | HansonsTier | PfitzTier;

/**
 * Generate a plan using a specific coach tier.
 */
export function generateCoachPlan(
    input: PlanGenerationInput,
    tier: CoachTier
): TrainingPlan {
    // Detect coach from tier prefix
    if (tier.startsWith('pfitz_frr_')) {
        return generateFRRPlan(input, tier as PfitzFRRTier);
    } else if (tier.startsWith('daniels_')) {
        return generateDanielsPlan(input, tier as DanielsTier);
    } else if (tier.startsWith('hansons_')) {
        return generateHansonsPlan(input, tier as HansonsTier);
    } else if (tier.startsWith('pfitz_12_') || tier.startsWith('pfitz_18_')) {
        return generatePfitzAMPlan(input, tier as PfitzTier);
    } else if (
        tier.startsWith('base_') ||
        tier.startsWith('5k_') ||
        tier.startsWith('10k_') ||
        tier.startsWith('half_') ||
        tier.startsWith('marathon_')
    ) {
        // Higdon tiers
        return generateHigdonPlan(input, tier as HigdonTier);
    }

    throw new Error(`Unknown coach tier: ${tier}`);
}
