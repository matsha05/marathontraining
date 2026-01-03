/**
 * Weekly Plan Generator
 */

import type { TrainingPhase, WeekSummary } from '../types/plan';
import type { RaceDistance, Athlete } from '../types/athlete';
import { generateDailyPlan, DailyPlanInput, GeneratedDailyPlan } from './daily';
import { getWeekTemplate, isCutbackWeek, calculateWeeklyMileage, CUTBACK_CONFIG } from '../../config/coach-spec/weekly-structure';
import { DurabilityPrescription } from '../durability';

export interface WeeklyPlanInput {
    athlete: Athlete;
    vdot: number;
    goalRace: RaceDistance;
    weekNumber: number;
    phase: TrainingPhase;
    peakMileage: number;
    durabilityPrescription?: DurabilityPrescription;
    injuryStatus?: 'green' | 'amber' | 'red';
}

export interface GeneratedWeeklyPlan {
    weekNumber: number;
    phase: TrainingPhase;
    plannedMileage: number;
    isCutback: boolean;
    days: GeneratedDailyPlan[];
    strengthSessions: number;
    qualitySessions: number;
    notes?: string;
}

export function generateWeeklyPlan(input: WeeklyPlanInput): GeneratedWeeklyPlan {
    const { athlete, vdot, goalRace, weekNumber, phase, peakMileage, durabilityPrescription, injuryStatus } = input;

    // Calculate weekly mileage with cutback adjustment
    let weeklyMileage = calculateWeeklyMileage(peakMileage, phase);
    const cutback = isCutbackWeek(weekNumber);

    if (cutback) {
        weeklyMileage = Math.round(weeklyMileage * (1 - CUTBACK_CONFIG.reductionPercent / 100));
    }

    // Generate each day
    const days: GeneratedDailyPlan[] = [];
    let strengthCount = 0;
    let qualityCount = 0;

    for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
        const dayInput: DailyPlanInput = {
            athlete,
            vdot,
            goalRace,
            weekNumber,
            dayOfWeek,
            phase,
            weeklyMileage,
            durabilityPrescription,
            injuryStatus,
        };

        const dayPlan = generateDailyPlan(dayInput);
        days.push(dayPlan);

        // Count sessions
        dayPlan.workouts.forEach(w => {
            if (w.sessionType === 'strength') strengthCount++;
            if (['intervals', 'tempo', 'long_run'].includes(w.sessionType)) qualityCount++;
        });
    }

    return {
        weekNumber,
        phase,
        plannedMileage: weeklyMileage,
        isCutback: cutback,
        days,
        strengthSessions: strengthCount,
        qualitySessions: qualityCount,
        notes: cutback ? 'Cutback week - reduced volume for recovery' : undefined,
    };
}

/**
 * Generate full training plan
 */
export function generateFullPlan(input: {
    athlete: Athlete;
    vdot: number;
    goalRace: RaceDistance;
    raceDate: Date;
    startDate: Date;
    peakMileage: number;
    durabilityPrescription?: DurabilityPrescription;
}): GeneratedWeeklyPlan[] {
    const { athlete, vdot, goalRace, raceDate, startDate, peakMileage, durabilityPrescription } = input;

    const totalWeeks = Math.ceil((raceDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const plans: GeneratedWeeklyPlan[] = [];

    // Determine phases
    const phases = assignPhasesToWeeks(totalWeeks, goalRace);

    for (let week = 1; week <= totalWeeks; week++) {
        const phase = phases[week - 1];

        const weekPlan = generateWeeklyPlan({
            athlete,
            vdot,
            goalRace,
            weekNumber: week,
            phase,
            peakMileage,
            durabilityPrescription,
        });

        plans.push(weekPlan);
    }

    return plans;
}

function assignPhasesToWeeks(totalWeeks: number, goalRace: RaceDistance): TrainingPhase[] {
    const phases: TrainingPhase[] = [];

    // Simple phase distribution - can be made more sophisticated
    const taperWeeks = goalRace === 'marathon' ? 2 : goalRace.includes('ultra') ? 3 : 1;
    const peakWeeks = 2;
    const buildWeeks = Math.floor((totalWeeks - taperWeeks - peakWeeks) * 0.4);
    const base2Weeks = Math.floor((totalWeeks - taperWeeks - peakWeeks - buildWeeks) * 0.5);
    const base1Weeks = totalWeeks - taperWeeks - peakWeeks - buildWeeks - base2Weeks;

    for (let i = 0; i < base1Weeks; i++) phases.push('BASE_1');
    for (let i = 0; i < base2Weeks; i++) phases.push('BASE_2');
    for (let i = 0; i < buildWeeks; i++) phases.push('BUILD');
    for (let i = 0; i < peakWeeks; i++) phases.push('PEAK');
    for (let i = 0; i < taperWeeks; i++) phases.push('TAPER');

    return phases;
}
