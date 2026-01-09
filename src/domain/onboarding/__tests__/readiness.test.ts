import { describe, it, expect } from 'vitest';
import { calculateReadiness, getHigdonBaseAvailability } from '../readiness';
import { INITIAL_ONBOARDING_DATA } from '../types';
import { addDaysUtc, formatDateUtc } from '@/domain/plan/date-utils';

function raceDateInWeeks(weeks: number): string {
    const today = new Date();
    const todayUtc = new Date(Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate()
    ));
    return formatDateUtc(addDaysUtc(todayUtc, weeks * 7));
}

const baseData = {
    ...INITIAL_ONBOARDING_DATA,
    trainingGoal: '10k' as const,
    trainingPhilosophy: 'higdon' as const,
    trainingIntensity: 'conservative' as const,
    weeklyMiles: 6,
    longestRecentRun: 2,
    availableDays: 4,
};

describe('calculateReadiness', () => {
    it('uses Higdon base weeks when the gap matches the base plan', () => {
        const data = { ...baseData, raceDate: raceDateInWeeks(20) };
        const result = calculateReadiness(data);

        expect(result.status).toBe('needs_base');
        expect(result.baseWeeksNeeded).toBe(12);
        expect(result.maintenanceWeeksNeeded).toBe(0);
    });

    it('adds maintenance weeks when the gap exceeds the base plan', () => {
        const data = { ...baseData, raceDate: raceDateInWeeks(30) };
        const result = calculateReadiness(data);

        expect(result.status).toBe('needs_base');
        expect(result.baseWeeksNeeded).toBe(12);
        expect(result.maintenanceWeeksNeeded).toBe(10);
    });

    it('flags a short timeline when the race is too close', () => {
        const data = {
            ...baseData,
            raceDate: raceDateInWeeks(3),
            weeklyMiles: 20,
            longestRecentRun: 6,
        };
        const result = calculateReadiness(data);

        expect(result.status).toBe('timeline_short');
        expect(result.baseWeeksNeeded).toBe(0);
        expect(result.maintenanceWeeksNeeded).toBe(0);
    });

    it('returns ready when base and timeline checks pass', () => {
        const data = {
            ...baseData,
            raceDate: raceDateInWeeks(12),
            weeklyMiles: 22,
            longestRecentRun: 7,
        };
        const result = calculateReadiness(data);

        expect(result.status).toBe('ready');
        expect(result.baseWeeksNeeded).toBe(0);
        expect(result.maintenanceWeeksNeeded).toBe(0);
    });
});

describe('getHigdonBaseAvailability', () => {
    it('returns not_applicable for non-Higdon plans', () => {
        const data = {
            ...baseData,
            trainingPhilosophy: 'daniels' as const,
            raceDate: raceDateInWeeks(20),
        };
        expect(getHigdonBaseAvailability(data)).toEqual({ status: 'not_applicable' });
    });
});
