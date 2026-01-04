/**
 * VDOT Calculation Tests
 *
 * Tests for VDOT calculator and pace zone functions
 */

import { describe, it, expect } from 'vitest';
import { calculatePaceZones } from './paces';
import { calculateVdotFromRace, calculateTrainingPaces, vdotFromVO2max } from './vdot-estimator';

describe('calculatePaceZones', () => {
    it('returns valid pace zones for typical VDOT', () => {
        const zones = calculatePaceZones(50);

        // Easy pace should be slower than marathon
        expect(zones.E.maxSecPerMile).toBeGreaterThan(zones.M.secPerMile);

        // Interval should be faster than threshold
        expect(zones.I.secPerMile).toBeLessThan(zones.T.secPerMile);

        // Repetition should be fastest
        expect(zones.R.secPerMile).toBeLessThan(zones.I.secPerMile);
    });

    it('scales correctly with VDOT', () => {
        const low = calculatePaceZones(40);
        const high = calculatePaceZones(60);

        // Higher VDOT = faster paces
        expect(high.E.minSecPerMile).toBeLessThan(low.E.minSecPerMile);
        expect(high.M.secPerMile).toBeLessThan(low.M.secPerMile);
        expect(high.T.secPerMile).toBeLessThan(low.T.secPerMile);
    });

    it('bounds VDOT correctly', () => {
        // Very low VDOT (clamped to 30)
        const low = calculatePaceZones(20);
        expect(low.E.minSecPerMile).toBeDefined();

        // Very high VDOT (clamped to 85)
        const high = calculatePaceZones(100);
        expect(high.E.minSecPerMile).toBeDefined();
    });
});

describe('calculateVdotFromRace', () => {
    it('calculates VDOT from race performance', () => {
        // 20:00 5K should give ~50 VDOT
        const result = calculateVdotFromRace('5k', 20 * 60);
        expect(result.vdot).toBeGreaterThan(45);
        expect(result.vdot).toBeLessThan(55);
        expect(result.confidence).toBe('high'); // Race data = high confidence
    });

    it('handles marathon distance', () => {
        // 3:30 marathon
        const result = calculateVdotFromRace('marathon', 210 * 60);
        expect(result.vdot).toBeGreaterThan(43);
        expect(result.vdot).toBeLessThan(50);
    });
});

describe('vdotFromVO2max', () => {
    it('applies 10% discount for running economy', () => {
        // VO2max 55 should give ~50 VDOT (10% discount)
        const result = vdotFromVO2max(55);
        expect(result.vdot).toBeLessThan(55);
        expect(result.vdot).toBeGreaterThan(45);
        expect(result.confidence).toBe('medium'); // VO2max = medium confidence
    });
});

describe('calculateTrainingPaces', () => {
    it('returns all pace zones', () => {
        const paces = calculateTrainingPaces(50);

        expect(paces.easy.min).toBeDefined();
        expect(paces.easy.max).toBeDefined();
        expect(paces.marathon).toBeDefined();
        expect(paces.threshold).toBeDefined();
        expect(paces.interval).toBeDefined();
        expect(paces.repetition).toBeDefined();
    });

    it('pace ordering is correct', () => {
        const paces = calculateTrainingPaces(50);

        // Easy is slowest
        expect(paces.easy.max).toBeGreaterThan(paces.marathon);
        // Threshold faster than marathon
        expect(paces.threshold).toBeLessThan(paces.marathon);
        // Interval faster than threshold
        expect(paces.interval).toBeLessThan(paces.threshold);
        // Repetition is fastest
        expect(paces.repetition).toBeLessThan(paces.interval);
    });
});
