import { describe, it, expect } from 'vitest';
import { buildHigdonBridge, getHigdonBridgeCounts } from '../../higdon-bridge';
import { generateHigdonPlan } from '../../coach-generators';
import { getDayIndex } from '@/domain/shared/day-utils';
import type { PlanGenerationInput } from '../../types';

const baseInput: PlanGenerationInput = {
    name: 'Bridge Runner',
    age: 32,
    sex: 'female',
    vdot: 45,
    vdotConfidence: 'medium',
    goalDistance: 'marathon',
    raceName: 'Bridge Race',
    raceDate: '2025-12-07',
    fitnessDuration: undefined,
    weeklyMiles: 20,
    runsPerWeek: 5,
    longestRecentRun: 6,
    availableDays: 5,
    longRunDay: 'sunday',
    currentPain: false,
    painLocation: undefined,
    recentInjury: false,
    injuryLocation: undefined,
    trainingIntensity: 'moderate',
    includeStrength: false,
};

describe('getHigdonBridgeCounts', () => {
    it('splits gap weeks into base and maintenance', () => {
        const result = getHigdonBridgeCounts(20, 12);
        expect(result.baseWeeks).toBe(12);
        expect(result.maintenanceWeeks).toBe(8);
    });

    it('returns zeros when gap is non-positive', () => {
        const result = getHigdonBridgeCounts(0, 12);
        expect(result.baseWeeks).toBe(0);
        expect(result.maintenanceWeeks).toBe(0);
    });
});

describe('buildHigdonBridge', () => {
    it('selects a base week that matches the athlete for a 1-week gap', () => {
        const basePlan = generateHigdonPlan(baseInput, 'base_intermediate');
        const racePlan = generateHigdonPlan(baseInput, 'marathon_advanced_1');

        const uniqueWeek = basePlan.weeks.find(week => (
            week.weekNumber > 1 &&
            basePlan.weeks.filter(w => w.totalMiles === week.totalMiles && w.longRunMiles === week.longRunMiles).length === 1
        )) ?? basePlan.weeks[0];

        const athleteInput = {
            ...baseInput,
            weeklyMiles: uniqueWeek.totalMiles,
            longestRecentRun: uniqueWeek.longRunMiles,
        };

        const gapWeeks = 1;
        const bridge = buildHigdonBridge({
            input: athleteInput,
            racePlan,
            basePlan,
            baseTier: 'base_intermediate',
            gapWeeks,
            totalWeeks: racePlan.totalWeeks + gapWeeks,
        });

        expect(bridge.baseWeeksApplied).toBe(1);
        expect(bridge.baseStartWeek).toBe(uniqueWeek.weekNumber);
        expect(bridge.preWeeks[0].totalMiles).toBe(uniqueWeek.totalMiles);
        expect(bridge.preWeeks[0].blockType).toBe('base_official');
    });

    it('adds maintenance weeks and preserves walk days while moving long runs', () => {
        const input = { ...baseInput, longRunDay: 'monday' };
        const basePlan = generateHigdonPlan(input, 'base_novice');
        const racePlan = generateHigdonPlan(input, 'marathon_novice_1');
        const gapWeeks = basePlan.weeks.length + 1;

        const bridge = buildHigdonBridge({
            input,
            racePlan,
            basePlan,
            baseTier: 'base_novice',
            gapWeeks,
            totalWeeks: racePlan.totalWeeks + gapWeeks,
        });

        const maintenanceWeeks = bridge.preWeeks.slice(bridge.baseWeeksApplied);
        expect(maintenanceWeeks.length).toBeGreaterThan(0);

        const maintenanceWeek = maintenanceWeeks[0];
        expect(maintenanceWeek.blockType).toBe('maintenance');

        const mondayIndex = getDayIndex('monday');
        const monday = maintenanceWeek.days.find(day => day.dayOfWeek === mondayIndex);
        expect(monday?.isKeyDay).toBe(true);

        const sunday = maintenanceWeek.days.find(day => day.dayOfWeek === 0);
        expect(sunday?.runWorkout).toBeNull();

        const saturday = maintenanceWeek.days.find(day => day.dayOfWeek === 6);
        expect(saturday?.crossTraining?.type).toBe('walking');
    });
});
