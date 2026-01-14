import { getDayIndex } from '@/domain/shared/day-utils';
import type { PlanGenerationInput, TrainingPlan, WeekPlan } from './types';
import type { HigdonTier } from './types';
import { getMicrocycleForTier, HigdonDaySlot } from './coaches/higdon';
import { generateMaintenanceBlockWeeks, MaintenanceDayProfile } from './maintenance-block';

const MICRO_DAY_ORDER = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

const QUALITY_DAY_TYPES: Set<HigdonDaySlot['type']> = new Set([
    'race_pace_run',
    'tempo',
    'intervals',
    'hills',
    'fartlek',
    'speedwork',
]);

const DEFAULT_WALK_MINUTES = 30;
const DEFAULT_CROSS_TRAIN_MINUTES = 40;

export function getHigdonBridgeCounts(
    gapWeeks: number,
    basePlanWeeks: number
): { baseWeeks: number; maintenanceWeeks: number } {
    if (gapWeeks <= 0) return { baseWeeks: 0, maintenanceWeeks: 0 };
    const baseWeeks = Math.max(0, Math.min(gapWeeks, basePlanWeeks));
    return { baseWeeks, maintenanceWeeks: Math.max(0, gapWeeks - baseWeeks) };
}

function resolveDuration(range?: [number, number], fallback = DEFAULT_CROSS_TRAIN_MINUTES): number {
    if (!range || range.length !== 2) return fallback;
    return Math.round((range[0] + range[1]) / 2);
}

function mapSlotToDayProfile(slot?: HigdonDaySlot): MaintenanceDayProfile {
    if (!slot) return { type: 'rest' };

    if (slot.type === 'long_run') {
        return { type: 'long', notes: slot.notes };
    }

    if (slot.type === 'easy_run' || QUALITY_DAY_TYPES.has(slot.type)) {
        return { type: 'easy', notes: slot.notes };
    }

    if (slot.type === 'walk') {
        return {
            type: 'walk',
            duration: resolveDuration(slot.durationRange, DEFAULT_WALK_MINUTES),
            notes: slot.notes,
        };
    }

    if (slot.type === 'cross_train') {
        return {
            type: 'cross_train',
            duration: resolveDuration(slot.durationRange, DEFAULT_CROSS_TRAIN_MINUTES),
            notes: slot.notes,
        };
    }

    return { type: 'rest', notes: slot.notes };
}

function buildMaintenanceDayProfiles(baseTier: HigdonTier, longRunDay: string): MaintenanceDayProfile[] {
    const microcycle = getMicrocycleForTier(baseTier);
    const profiles = MICRO_DAY_ORDER.map(dayKey => mapSlotToDayProfile(microcycle[dayKey]));

    const longRunIndex = profiles.findIndex(profile => profile.type === 'long');
    const targetIndex = getDayIndex(longRunDay);

    if (longRunIndex === -1) {
        profiles[targetIndex] = { type: 'long' };
        return profiles;
    }

    if (longRunIndex !== targetIndex) {
        profiles[longRunIndex] = { type: 'rest' };
        profiles[targetIndex] = { type: 'long' };
    }

    return profiles;
}

function scoreBaseSliceStart(
    firstWeek: WeekPlan,
    athleteWeeklyMiles: number,
    athleteLongRun: number
): number {
    const weeklyWeight = athleteWeeklyMiles > 0 ? 1 : 0;
    const longRunWeight = athleteLongRun > 0 ? 1.25 : 0;
    const weeklyDiff = Math.abs(firstWeek.totalMiles - athleteWeeklyMiles);
    const longRunDiff = Math.abs(firstWeek.longRunMiles - athleteLongRun);
    let score = weeklyDiff * weeklyWeight + longRunDiff * longRunWeight;

    if (athleteLongRun > 0 && firstWeek.longRunMiles <= 0) {
        score += athleteLongRun * 2;
    }

    return score;
}

function findBestBaseSlice(
    baseWeeks: WeekPlan[],
    desiredWeeks: number,
    raceWeek: WeekPlan | undefined,
    athleteWeeklyMiles: number,
    athleteLongRun: number,
    options?: { enforceCaps?: boolean }
): { weeks: WeekPlan[]; startIndex: number } {
    if (desiredWeeks <= 0 || baseWeeks.length === 0) {
        return { weeks: [], startIndex: 0 };
    }

    const enforceCaps = options?.enforceCaps ?? true;
    const totalCap = enforceCaps && raceWeek && raceWeek.totalMiles > 0
        ? raceWeek.totalMiles
        : Number.POSITIVE_INFINITY;
    const longCap = enforceCaps && raceWeek && raceWeek.longRunMiles > 0
        ? raceWeek.longRunMiles
        : Number.POSITIVE_INFINITY;
    const preferLater = athleteWeeklyMiles > 0 || athleteLongRun > 0;

    for (let length = Math.min(desiredWeeks, baseWeeks.length); length >= 1; length--) {
        let bestStart = -1;
        let bestScore = Number.POSITIVE_INFINITY;

        const maxStart = baseWeeks.length - length;
        for (let start = 0; start <= maxStart; start++) {
            const slice = baseWeeks.slice(start, start + length);
            const maxTotal = Math.max(...slice.map(week => week.totalMiles));
            const maxLong = Math.max(...slice.map(week => week.longRunMiles));

            if (maxTotal > totalCap || maxLong > longCap) {
                continue;
            }

            const score = scoreBaseSliceStart(slice[0], athleteWeeklyMiles, athleteLongRun);
            const isBetter = score < bestScore;
            const isTieBetter = score === bestScore && (
                preferLater ? start > bestStart : start < bestStart
            );

            if (isBetter || isTieBetter) {
                bestScore = score;
                bestStart = start;
            }
        }

        if (bestStart >= 0) {
            return {
                weeks: baseWeeks.slice(bestStart, bestStart + length),
                startIndex: bestStart,
            };
        }
    }

    return { weeks: [], startIndex: 0 };
}

export function buildHigdonBridge(params: {
    input: PlanGenerationInput;
    racePlan: TrainingPlan;
    basePlan: TrainingPlan;
    baseTier: HigdonTier;
    gapWeeks: number;
    totalWeeks: number;
}): {
    preWeeks: WeekPlan[];
    baseWeeksApplied: number;
    maintenanceWeeksApplied: number;
    baseStartWeek: number;
    partialBase: boolean;
} {
    const { input, racePlan, basePlan, baseTier, gapWeeks, totalWeeks } = params;
    if (gapWeeks <= 0) {
        return {
            preWeeks: [],
            baseWeeksApplied: 0,
            maintenanceWeeksApplied: 0,
            baseStartWeek: 0,
            partialBase: false,
        };
    }

    const raceWeek = racePlan.weeks[0];
    const baseWeeks = basePlan.weeks ?? [];
    const desiredBaseWeeks = Math.min(gapWeeks, baseWeeks.length);

    let baseSlice = findBestBaseSlice(
        baseWeeks,
        desiredBaseWeeks,
        raceWeek,
        input.weeklyMiles,
        input.longestRecentRun,
        { enforceCaps: true }
    );
    if (baseSlice.weeks.length === 0 && desiredBaseWeeks > 0) {
        baseSlice = findBestBaseSlice(
            baseWeeks,
            desiredBaseWeeks,
            raceWeek,
            input.weeklyMiles,
            input.longestRecentRun,
            { enforceCaps: false }
        );
    }

    const baseWeeksApplied = baseSlice.weeks.length;
    const baseStartWeek = baseWeeksApplied > 0 ? baseSlice.startIndex + 1 : 0;
    const partialBase = baseWeeksApplied > 0 && baseWeeksApplied < baseWeeks.length;

    const preWeeks: WeekPlan[] = baseSlice.weeks.map(week => ({
        ...week,
        phase: 'base' as const,
        blockType: 'base_official',
    }));

    const maintenanceWeeksNeeded = Math.max(0, gapWeeks - baseWeeksApplied);
    let maintenanceWeeksApplied = 0;

    if (maintenanceWeeksNeeded > 0) {
        const dayProfiles = buildMaintenanceDayProfiles(baseTier, input.longRunDay);
        const basePeakLongRunMiles = baseWeeks.reduce(
            (max, week) => Math.max(max, week.longRunMiles),
            0
        );
        const lastBaseWeek = preWeeks[preWeeks.length - 1] ?? baseWeeks[0];
        const targetWeek = raceWeek ?? baseWeeks[baseWeeks.length - 1];

        const maintenanceWeeks = generateMaintenanceBlockWeeks(input, {
            weeks: maintenanceWeeksNeeded,
            totalWeeks,
            dayProfiles,
            startWeeklyMiles: lastBaseWeek?.totalMiles ?? input.weeklyMiles ?? 0,
            startLongRunMiles: lastBaseWeek?.longRunMiles ?? input.longestRecentRun ?? 0,
            targetWeeklyMiles: targetWeek?.totalMiles ?? input.weeklyMiles ?? 0,
            targetLongRunMiles: targetWeek?.longRunMiles ?? input.longestRecentRun ?? 0,
            basePeakLongRunMiles,
        });

        preWeeks.push(...maintenanceWeeks);
        maintenanceWeeksApplied = maintenanceWeeks.length;
    }

    return {
        preWeeks,
        baseWeeksApplied,
        maintenanceWeeksApplied,
        baseStartWeek,
        partialBase,
    };
}
