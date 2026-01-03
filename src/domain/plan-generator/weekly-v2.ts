/**
 * Weekly Plan Generator V2
 * 
 * Updated to use Oracle-validated periodization:
 * - 5-block structure (ONRAMP → AEROBIC → MARATHON_SPECIFIC → PEAK → TAPER)
 * - 4-week rhythm (3 build + 1 deload)
 * - Configurable running frequency (4/5/6 days)
 * - Strength placement on Q days
 */

import type { TrainingPhase } from '../types/plan';
import type { RaceDistance, Athlete } from '../types/athlete';
import { DurabilityPrescription } from '../durability';

// New coach-validated configs
import {
    PeriodizationBlock,
    assignBlocksToWeeks,
    isDeloadWeek,
    getBlockConfig,
    calculateBlockMileage,
    calculateLongRunDistance,
    BLOCK_RHYTHM,
    AthleteLevel,
} from '../../config/coach-spec/periodization';

import {
    RunningFrequency,
    getWeeklyTemplateByFrequency,
    recommendFrequency,
    WeeklyTemplate,
    DaySlot,
} from '../../config/coach-spec/weekly-templates';

import { calculatePaceZones, formatPace } from '../vdot/paces';
import type { PaceZones as RawPaceZones } from '../types/session';

// Formatted paces for display (string format like "7:30")
interface FormattedPaces {
    easy: string;
    marathon: string;
    threshold: string;
    interval: string;
    repetition: string;
}

function formatPaceZones(raw: RawPaceZones): FormattedPaces {
    return {
        easy: formatPace(raw.E.maxSecPerMile), // Use slower end of easy
        marathon: formatPace(raw.M.secPerMile),
        threshold: formatPace(raw.T.secPerMile),
        interval: formatPace(raw.I.secPerMile),
        repetition: formatPace(raw.R.secPerMile),
    };
}

// ============================================================================
// TYPES
// ============================================================================

export interface WeeklyPlanInputV2 {
    athlete: Athlete;
    vdot: number;
    goalRace: RaceDistance;
    weekNumber: number;
    block: PeriodizationBlock;
    peakMileage: number;
    runningFrequency: RunningFrequency;
    athleteLevel: AthleteLevel;
    durabilityPrescription?: DurabilityPrescription;
    injuryStatus?: 'green' | 'amber' | 'red';
}

export interface GeneratedDayV2 {
    dayOfWeek: number;
    dayName: string;
    workouts: GeneratedWorkoutV2[];
    totalDurationMin: number;
    notes?: string;
}

export interface GeneratedWorkoutV2 {
    id: string;
    type: 'run' | 'strength' | 'durability';
    sessionType: string;
    title: string;
    description: string;
    durationMin: number;
    distanceMiles?: number;
    targetPace?: string;
    intensity: 'easy' | 'moderate' | 'hard';
    order: number;
}

export interface GeneratedWeeklyPlanV2 {
    weekNumber: number;
    block: PeriodizationBlock;
    blockDescription: string;
    isDeload: boolean;
    plannedMileage: number;
    longRunMiles: number;
    runDays: number;
    qualitySessions: number;
    strengthSessions: number;
    days: GeneratedDayV2[];
    notes?: string;
}

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export function generateWeeklyPlanV2(input: WeeklyPlanInputV2): GeneratedWeeklyPlanV2 {
    const {
        athlete,
        vdot,
        goalRace,
        weekNumber,
        block,
        peakMileage,
        runningFrequency,
        athleteLevel,
        durabilityPrescription,
        injuryStatus,
    } = input;

    const blockConfig = getBlockConfig(block);
    const isDeload = isDeloadWeek(weekNumber);
    const template = getWeeklyTemplateByFrequency(runningFrequency);
    const rawPaces = calculatePaceZones(vdot);
    const paceZones = formatPaceZones(rawPaces);

    // Calculate weekly mileage with block and deload adjustments
    const weeklyMileage = calculateBlockMileage(peakMileage, block, isDeload);
    const longRunMiles = calculateLongRunDistance(weeklyMileage, block, athleteLevel);

    // Generate each day
    const days: GeneratedDayV2[] = template.slots.map(slot =>
        generateDay(slot, {
            blockConfig,
            paceZones,
            weeklyMileage,
            longRunMiles,
            isDeload,
            durabilityPrescription,
            injuryStatus,
        })
    );

    // Count sessions
    let qualityCount = 0;
    let strengthCount = 0;
    let runDays = 0;

    days.forEach(day => {
        day.workouts.forEach(w => {
            if (w.type === 'strength') strengthCount++;
            if (w.type === 'run' && w.intensity === 'hard') qualityCount++;
            if (w.type === 'run') runDays++;
        });
    });

    // Deload notes
    let notes = blockConfig.description;
    if (isDeload) {
        notes = `DELOAD WEEK: ${BLOCK_RHYTHM.deloadVolumeReduction * 100}% volume reduction. Focus on recovery.`;
    }

    return {
        weekNumber,
        block,
        blockDescription: blockConfig.description,
        isDeload,
        plannedMileage: weeklyMileage,
        longRunMiles,
        runDays,
        qualitySessions: qualityCount,
        strengthSessions: strengthCount,
        days,
        notes,
    };
}

// ============================================================================
// DAY GENERATOR
// ============================================================================

interface DayGeneratorContext {
    blockConfig: ReturnType<typeof getBlockConfig>;
    paceZones: FormattedPaces;
    weeklyMileage: number;
    longRunMiles: number;
    isDeload: boolean;
    durabilityPrescription?: DurabilityPrescription;
    injuryStatus?: 'green' | 'amber' | 'red';
}

function generateDay(slot: DaySlot, ctx: DayGeneratorContext): GeneratedDayV2 {
    const workouts: GeneratedWorkoutV2[] = [];
    let order = 0;

    // Pre-run durability (if scheduled)
    if (slot.durabilitySession === 'pre_run') {
        workouts.push({
            id: `dur-${slot.dayOfWeek}-pre`,
            type: 'durability',
            sessionType: 'movement_prep',
            title: 'Pre-Run Movement Prep',
            description: 'Ankle rocks, leg swings, glute activation, fast feet',
            durationMin: 8,
            intensity: 'easy',
            order: order++,
        });
    }

    // Main run session
    if (slot.runSession !== 'rest') {
        const runWorkout = generateRunWorkout(slot, ctx, order++);
        if (runWorkout) workouts.push(runWorkout);
    }

    // Strength session (if scheduled)
    if (slot.strengthSession) {
        const strengthWorkout = generateStrengthWorkout(slot, ctx, order++);
        workouts.push(strengthWorkout);
    }

    // Durability circuit (if scheduled)
    if (slot.durabilitySession === 'circuit') {
        workouts.push({
            id: `dur-${slot.dayOfWeek}-circuit`,
            type: 'durability',
            sessionType: 'durability_circuit',
            title: 'Durability Circuit',
            description: 'Hip control, foot strength, trunk stability (15-25 min)',
            durationMin: 20,
            intensity: 'moderate',
            order: order++,
        });
    }

    const totalDuration = workouts.reduce((sum, w) => sum + w.durationMin, 0);

    return {
        dayOfWeek: slot.dayOfWeek,
        dayName: slot.dayName,
        workouts,
        totalDurationMin: totalDuration,
        notes: slot.notes,
    };
}

// ============================================================================
// RUN WORKOUT GENERATOR
// ============================================================================

function generateRunWorkout(
    slot: DaySlot,
    ctx: DayGeneratorContext,
    order: number
): GeneratedWorkoutV2 | null {
    const { blockConfig, paceZones, weeklyMileage, longRunMiles, isDeload } = ctx;

    // Rest day
    if (slot.runSession === 'rest') return null;

    // Calculate run distance based on session type and weekly mileage
    let distanceMiles: number;
    let durationMin: number;
    let targetPace: string;
    let title: string;
    let description: string;
    let intensity: 'easy' | 'moderate' | 'hard';

    switch (slot.runSession) {
        case 'long_run':
            distanceMiles = longRunMiles;
            targetPace = paceZones.easy;
            durationMin = Math.round(distanceMiles * paceToMinutes(paceZones.easy));
            title = 'Long Run';
            description = buildLongRunDescription(blockConfig, distanceMiles, paceZones);
            intensity = 'hard'; // Long run is quality
            break;

        case 'intervals':
            distanceMiles = Math.round(weeklyMileage * 0.12); // ~12% of weekly
            durationMin = 45 + distanceMiles * 3;
            targetPace = paceZones.interval;
            title = 'Interval Session (Q1)';
            description = buildIntervalsDescription(blockConfig, paceZones, isDeload);
            intensity = 'hard';
            break;

        case 'tempo':
            distanceMiles = Math.round(weeklyMileage * 0.15); // ~15% of weekly
            durationMin = 50 + distanceMiles * 4;
            targetPace = paceZones.threshold;
            title = 'Tempo Run (Q2)';
            description = buildTempoDescription(blockConfig, paceZones, isDeload);
            intensity = 'hard';
            break;

        case 'easy':
        case 'recovery':
            distanceMiles = Math.round(weeklyMileage * 0.08); // ~8% per easy day
            targetPace = paceZones.easy;
            durationMin = Math.round(distanceMiles * paceToMinutes(paceZones.easy));
            title = slot.runSession === 'recovery' ? 'Recovery Run' : 'Easy Run';
            description = `${distanceMiles} mi at easy pace (${paceZones.easy}/mi). Keep it conversational.`;
            intensity = 'easy';
            break;

        case 'medium_long':
            distanceMiles = Math.round(longRunMiles * 0.65); // ~65% of long run
            targetPace = paceZones.easy;
            durationMin = Math.round(distanceMiles * paceToMinutes(paceZones.easy));
            title = 'Medium-Long Run';
            description = `${distanceMiles} mi at easy pace. Building aerobic endurance.`;
            intensity = 'moderate';
            break;

        default:
            // Strides, hills, or other
            distanceMiles = Math.round(weeklyMileage * 0.08);
            targetPace = paceZones.easy;
            durationMin = 35;
            title = 'Easy + Strides';
            description = `${distanceMiles} mi easy with 4-6 x 20s strides at end.`;
            intensity = 'easy';
    }

    return {
        id: `run-${slot.dayOfWeek}`,
        type: 'run',
        sessionType: slot.runSession,
        title,
        description,
        durationMin,
        distanceMiles,
        targetPace,
        intensity,
        order,
    };
}

// ============================================================================
// STRENGTH WORKOUT GENERATOR
// ============================================================================

function generateStrengthWorkout(
    slot: DaySlot,
    ctx: DayGeneratorContext,
    order: number
): GeneratedWorkoutV2 {
    const { blockConfig } = ctx;
    const volumePercent = blockConfig.strengthVolumePercent;

    // S1 = Lower emphasis, S2 = Hinge + upper
    const isLowerDay = slot.strengthSession === 'S1';
    const sets = volumePercent >= 100 ? '3-5' : volumePercent >= 50 ? '2-3' : '2';
    const reps = '3-5';

    let exercises: string[];
    if (isLowerDay) {
        exercises = [
            `Squat or Front Squat: ${sets} x ${reps} @ RPE 6-8`,
            `Bench Press or OHP: 3 x 5`,
            `Row or Pull-ups: 3 x 8-10`,
            `Calf raises + tibialis work`,
        ];
    } else {
        exercises = [
            `Trap Bar DL or RDL: ${sets} x ${reps} @ RPE 6-8`,
            `Split Squat: 2 x 8 each leg`,
            `Push + Pull superset: 3 x 8`,
            `Optional: Nordic regression`,
        ];
    }

    const description = exercises.join('\n');
    const durationMin = volumePercent >= 100 ? 45 : volumePercent >= 50 ? 35 : 25;

    return {
        id: `str-${slot.dayOfWeek}`,
        type: 'strength',
        sessionType: isLowerDay ? 'strength_lower' : 'strength_hinge',
        title: isLowerDay ? 'Strength A (Lower)' : 'Strength B (Hinge + Upper)',
        description,
        durationMin,
        intensity: 'moderate',
        order,
    };
}

// ============================================================================
// DESCRIPTION BUILDERS
// ============================================================================

function buildLongRunDescription(
    config: ReturnType<typeof getBlockConfig>,
    miles: number,
    paces: FormattedPaces
): string {
    switch (config.longRunIntensity) {
        case 'easy_only':
            return `${miles} mi at easy pace (${paces.easy}/mi). Time on feet, not pace.`;
        case 'steady_finish':
            return `${miles} mi: First ${miles - 3} mi easy, last 3 mi at steady (${paces.marathon}/mi).`;
        case 'mp_segments':
            return `${miles} mi with 2 x 15 min at marathon pace (${paces.marathon}/mi). Recovery easy.`;
    }
}

function buildIntervalsDescription(
    config: ReturnType<typeof getBlockConfig>,
    paces: FormattedPaces,
    isDeload: boolean
): string {
    const reps = isDeload ? '3-4' : '5-6';

    switch (config.q1Focus) {
        case 'strides':
            return `Easy run + 6 x 20s strides. Smooth and relaxed.`;
        case 'hills':
            return `Warm up, then ${reps} x 90s hill sprints. Jog down recovery.`;
        case 'intervals':
            return `Warm up, then ${reps} x 800m @ ${paces.interval}/mi with 90s jog.`;
        case 'tempo':
            return `Warm up, then 20 min continuous at ${paces.threshold}/mi.`;
        default:
            return `Quality interval session at ${paces.interval}/mi.`;
    }
}

function buildTempoDescription(
    config: ReturnType<typeof getBlockConfig>,
    paces: FormattedPaces,
    isDeload: boolean
): string {
    const duration = isDeload ? '15-20' : '25-35';

    switch (config.q2Focus) {
        case 'tempo':
            return `Warm up, then ${duration} min at threshold (${paces.threshold}/mi). Comfortably hard.`;
        case 'marathon_pace':
            return `Warm up, then ${duration} min at marathon pace (${paces.marathon}/mi).`;
        case 'mixed':
            return `Warm up, 15 min @ threshold, 15 min @ marathon pace.`;
        default:
            return `Tempo run at ${paces.threshold}/mi.`;
    }
}

// ============================================================================
// FULL PLAN GENERATOR
// ============================================================================

export interface FullPlanInputV2 {
    athlete: Athlete;
    vdot: number;
    goalRace: RaceDistance;
    raceDate: Date;
    startDate: Date;
    peakMileage: number;
    runningFrequency?: RunningFrequency;
    athleteLevel?: AthleteLevel;
    durabilityPrescription?: DurabilityPrescription;
}

export function generateFullPlanV2(input: FullPlanInputV2): GeneratedWeeklyPlanV2[] {
    const {
        athlete,
        vdot,
        goalRace,
        raceDate,
        startDate,
        peakMileage,
        runningFrequency = 5,
        athleteLevel = 'intermediate',
        durabilityPrescription,
    } = input;

    const totalWeeks = Math.ceil((raceDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const blocks = assignBlocksToWeeks(totalWeeks, goalRace);
    const plans: GeneratedWeeklyPlanV2[] = [];

    for (let week = 1; week <= totalWeeks; week++) {
        const block = blocks[week - 1];

        const weekPlan = generateWeeklyPlanV2({
            athlete,
            vdot,
            goalRace,
            weekNumber: week,
            block,
            peakMileage,
            runningFrequency,
            athleteLevel,
            durabilityPrescription,
        });

        plans.push(weekPlan);
    }

    return plans;
}

// ============================================================================
// HELPERS
// ============================================================================

function paceToMinutes(pace: string): number {
    // Convert "7:30" to 7.5
    const [min, sec] = pace.split(':').map(Number);
    return min + (sec || 0) / 60;
}
