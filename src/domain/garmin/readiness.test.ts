import { describe, it, expect } from 'vitest';
import { calculateReadiness } from './readiness';

describe('calculateReadiness', () => {
    it('calculates weighted readiness score', () => {
        const result = calculateReadiness({
            summaryDate: '2024-01-01',
            sleepScore: 80,
            hrvStatus: 2,
            bodyBattery: 70,
            stressAvg: 40,
        });

        expect(result.score).toBe(71);
        expect(result.completeness).toBeCloseTo(1, 5);
    });

    it('reweights when metrics are missing', () => {
        const result = calculateReadiness({
            summaryDate: '2024-01-01',
            sleepScore: 80,
            bodyBattery: 70,
        });

        expect(result.score).toBe(76);
        expect(result.completeness).toBeCloseTo(0.6, 5);
    });
});
