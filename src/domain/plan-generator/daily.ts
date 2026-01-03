/**
 * Daily Plan Generator
 * 
 * Orchestrates all domain modules to produce a complete daily plan
 */

import type { DailyPlan, TrainingPhase, WeekTemplate } from '../types/plan';
import type { PlannedWorkout, WorkoutPrescription, PaceZones, RunPrescription, StrengthPrescription, DurabilityPrescription } from '../types/session';
import type { Athlete, RaceDistance } from '../types/athlete';

import { calculatePaceZones } from '../vdot';
import { buildIntervalSession, buildTempoSession, buildLongRunSession, buildEasyRun } from '../quality-sessions';
import { getWeekTemplate, DAYS } from '../../config/coach-spec/weekly-structure';
import { getRaceDistanceConfig } from '../../config/coach-spec/race-distances';
import { getAvailableTemplates, getPhaseStrengthRules, StrengthTemplate } from '../../config/coach-spec/strength-templates';
import { getDailyDurabilityModules, DurabilityPrescription as DurPrescription } from '../durability';

export interface DailyPlanInput {
    athlete: Athlete;
    vdot: number;
    goalRace: RaceDistance;
    weekNumber: number;
    dayOfWeek: number;
    phase: TrainingPhase;
    weeklyMileage: number;
    durabilityPrescription?: DurPrescription;
    injuryStatus?: 'green' | 'amber' | 'red';
}

export interface GeneratedDailyPlan {
    date?: Date;
    dayOfWeek: number;
    weekNumber: number;
    phase: TrainingPhase;
    workouts: GeneratedWorkout[];
    readinessScore?: number;
    notes?: string;
}

export interface GeneratedWorkout {
    sessionType: string;
    prescription: WorkoutPrescription;
    estimatedDurationMin: number;
    order: number;
}

/**
 * Generate a complete daily plan
 */
export function generateDailyPlan(input: DailyPlanInput): GeneratedDailyPlan {
    const { athlete, vdot, goalRace, weekNumber, dayOfWeek, phase, weeklyMileage, durabilityPrescription, injuryStatus } = input;

    // If RED injury status, modify everything
    if (injuryStatus === 'red') {
        return generateRedDayPlan(input);
    }

    const paceZones = calculatePaceZones(vdot);
    const weekTemplate = getWeekTemplate(phase);
    const raceConfig = getRaceDistanceConfig(goalRace);
    const dayTemplate = weekTemplate.days.find(d => d.dayOfWeek === dayOfWeek);

    if (!dayTemplate) {
        throw new Error(`No template for day ${dayOfWeek}`);
    }

    const workouts: GeneratedWorkout[] = [];
    let order = 1;

    // AMBER: reduce intensity
    const isAmber = injuryStatus === 'amber';

    // Generate running workout
    const runWorkout = generateRunWorkout(
        dayTemplate.primarySession,
        paceZones,
        weeklyMileage,
        raceConfig,
        isAmber
    );

    if (runWorkout) {
        workouts.push({
            sessionType: dayTemplate.primarySession,
            prescription: { run: runWorkout },
            estimatedDurationMin: runWorkout.estimatedDurationMin,
            order: order++,
        });
    }

    // Generate strength workout if scheduled
    const strengthRules = getPhaseStrengthRules(phase);
    const isStrengthDay = shouldDoStrength(dayOfWeek, phase, weekNumber);

    if (isStrengthDay && !isAmber) {
        const templates = getAvailableTemplates(phase);
        const template = selectStrengthTemplate(templates, dayTemplate.isSOSDay);

        if (template) {
            const strengthWorkout = generateStrengthWorkout(template);
            workouts.push({
                sessionType: 'strength',
                prescription: { strength: strengthWorkout },
                estimatedDurationMin: (template.durationMinRange[0] + template.durationMinRange[1]) / 2,
                order: order++,
            });
        }
    }

    // Add durability work
    if (durabilityPrescription) {
        const dayName = getDayName(dayOfWeek);
        const modules = getDailyDurabilityModules(durabilityPrescription, dayName);

        if (modules.length > 0) {
            const durabilityWorkout: DurabilityPrescription = {
                moduleIds: modules.map(m => m.id),
                estimatedDurationMin: modules.reduce((sum, m) => sum + m.durationMin, 0),
            };

            workouts.push({
                sessionType: 'durability',
                prescription: { durability: durabilityWorkout },
                estimatedDurationMin: durabilityWorkout.estimatedDurationMin,
                order: order++,
            });
        }
    }

    return {
        dayOfWeek,
        weekNumber,
        phase,
        workouts,
        notes: isAmber ? 'Modified due to AMBER injury status' : undefined,
    };
}

function generateRunWorkout(
    sessionType: string,
    paceZones: PaceZones,
    weeklyMileage: number,
    raceConfig: ReturnType<typeof getRaceDistanceConfig>,
    reducedIntensity: boolean
): RunPrescription | null {
    if (sessionType === 'rest') return null;

    const easyDayMileage = weeklyMileage * 0.12; // ~12% per easy day

    switch (sessionType) {
        case 'easy':
            return buildEasyRun(paceZones, Math.round(easyDayMileage));

        case 'intervals':
            if (reducedIntensity) {
                return buildEasyRun(paceZones, Math.round(easyDayMileage));
            }
            return buildIntervalSession(paceZones, 20, 1000); // 20 min quality

        case 'tempo':
            if (reducedIntensity) {
                return buildEasyRun(paceZones, Math.round(easyDayMileage));
            }
            const tempoMiles = Math.min(6, weeklyMileage * 0.1);
            return buildTempoSession(paceZones, Math.round(tempoMiles));

        case 'long_run':
            const longMiles = Math.min(raceConfig.longRun.maxMiles, weeklyMileage * 0.28);
            const includeM = raceConfig.longRun.marathonPaceBlocksAllowed && !reducedIntensity;
            const mPaceMiles = includeM ? Math.round(longMiles * 0.25) : 0;
            return buildLongRunSession(paceZones, Math.round(longMiles), includeM, mPaceMiles);

        case 'recovery':
            return buildEasyRun(paceZones, Math.round(easyDayMileage * 0.7));

        default:
            return buildEasyRun(paceZones, Math.round(easyDayMileage));
    }
}

function generateStrengthWorkout(template: StrengthTemplate): StrengthPrescription {
    return {
        type: template.type,
        templateId: template.id,
        exercises: template.exercises,
        estimatedDurationMin: (template.durationMinRange[0] + template.durationMinRange[1]) / 2,
        notes: template.notes,
    };
}

function shouldDoStrength(dayOfWeek: number, phase: TrainingPhase, weekNumber: number): boolean {
    const rules = getPhaseStrengthRules(phase);
    if (rules.sessionsPerWeek === 0) return false;

    // Place strength on SOS days (Tue/Thu) when run quality is lower recovery demand
    // Or on easy days for better adaptation
    if (rules.sessionsPerWeek >= 2) {
        return dayOfWeek === DAYS.TUESDAY || dayOfWeek === DAYS.THURSDAY;
    }
    return dayOfWeek === DAYS.TUESDAY;
}

function selectStrengthTemplate(templates: StrengthTemplate[], isQualityDay: boolean): StrengthTemplate | null {
    if (templates.length === 0) return null;

    // On quality days, prefer Template A (pairs with hard runs)
    // On easy days, prefer Template B (single leg work)
    const preferred = isQualityDay ? 'A' : 'B';
    return templates.find(t => t.id === preferred) || templates[0];
}

function generateRedDayPlan(input: DailyPlanInput): GeneratedDailyPlan {
    // RED status: no running, only durability
    const workouts: GeneratedWorkout[] = [];

    if (input.durabilityPrescription) {
        const dayName = getDayName(input.dayOfWeek);
        const modules = getDailyDurabilityModules(input.durabilityPrescription, dayName);

        if (modules.length > 0) {
            workouts.push({
                sessionType: 'durability',
                prescription: {
                    durability: {
                        moduleIds: modules.map(m => m.id),
                        estimatedDurationMin: modules.reduce((sum, m) => sum + m.durationMin, 0),
                    },
                },
                estimatedDurationMin: modules.reduce((sum, m) => sum + m.durationMin, 0),
                order: 1,
            });
        }
    }

    return {
        dayOfWeek: input.dayOfWeek,
        weekNumber: input.weekNumber,
        phase: input.phase,
        workouts,
        notes: 'REST DAY: RED injury status. Focus on recovery and durability only.',
    };
}

function getDayName(dayOfWeek: number): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayOfWeek];
}
