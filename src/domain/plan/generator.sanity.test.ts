import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generatePlan } from './generator';
import type { PlanGenerationInput } from './types';

describe('generatePlan sanity', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(Date.UTC(2025, 0, 1, 12, 0, 0)));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('generates a plan with stable week/day dates', () => {
        const input: PlanGenerationInput = {
            name: 'Test Runner',
            age: 30,
            sex: 'male',
            vdot: 45,
            vdotConfidence: 'medium',
            goalDistance: 'marathon',
            raceName: 'Test Marathon',
            raceDate: '2025-02-02',
            fitnessDuration: undefined,
            weeklyMiles: 25,
            runsPerWeek: 4,
            longestRecentRun: 8,
            availableDays: 4,
            longRunDay: 'saturday',
            currentPain: false,
            painLocation: undefined,
            recentInjury: false,
            injuryLocation: undefined,
            trainingIntensity: 'moderate',
            includeStrength: true,
        };

        const plan = generatePlan(input);

        expect(plan.totalWeeks).toBe(4);
        expect(plan.weeks).toHaveLength(4);
        expect(plan.weeks[0].weekOf).toBe('2025-01-05');
        expect(plan.weeks[0].days).toHaveLength(7);
        expect(plan.weeks[0].days[0].date).toBe('2025-01-05');
    });
});
