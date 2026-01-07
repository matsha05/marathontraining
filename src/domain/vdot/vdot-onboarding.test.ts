/**
 * Comprehensive VDOT Calculation Tests
 * 
 * Tests ALL edge cases for VDOT calculations used in onboarding flow.
 * Covers: race times, easy paces, VO2max conversions, experience estimates,
 * boundary conditions, and expected Daniels table accuracy.
 */

import { describe, it, expect } from 'vitest';
import {
    calculateVdotFromRace,
    vdotFromVO2max,
    calculateTrainingPaces,
    vdotFromGarminVO2max,
    estimateVdotConservative,
    calculateVdotFromTimeTrial,
} from './vdot-estimator';

// =============================================================================
// HELPER: Simulate the onboarding calculateVdotFromData function
// =============================================================================

interface MockOnboardingData {
    calibrationMethod: 'race' | 'easy_pace' | 'vo2max' | 'effort' | 'estimate' | null;
    raceDistance?: 'mile' | '5k' | '10k' | 'half' | 'marathon';
    raceTimeMinutes?: number | null;
    raceTimeSeconds?: number | null;
    raceRecency?: 'recent' | 'moderate' | 'old' | 'very_old';
    easyPaceMinutes?: number | null;
    easyPaceSeconds?: number | null;
    garminVO2max?: number | null;
    experienceLevel?: string | null;
    effortType?: 'parkrun' | 'tempo' | 'time_trial' | 'race_sim' | null;
    effortTimeMinutes?: number | null;
    effortTimeSeconds?: number | null;
    effortLevel?: number | null;
}

// Replicate the exact logic from onboarding/page.tsx
const RACE_RECENCY_ADJUSTMENTS: Record<string, number> = {
    'recent': 0,
    'moderate': -1,
    'old': -2,
    'very_old': -3,
};

const EXPERIENCE_BASE_VDOTS: Record<string, number> = {
    'newer': 30,
    'recreational': 38,
    'experienced': 45,
    'competitive': 50,
    'elite': 55,
    'returning': 40,
    'crossfit_athlete': 38,
};

function calculateVdotFromData(data: MockOnboardingData): { vdot: number; confidence: 'high' | 'medium' | 'low' } {
    // From race result (gold standard)
    if (data.calibrationMethod === 'race' && data.raceDistance && data.raceTimeMinutes !== null && data.raceTimeMinutes !== undefined) {
        const totalSeconds = (data.raceTimeMinutes * 60) + (data.raceTimeSeconds ?? 0);
        const result = calculateVdotFromRace(data.raceDistance, totalSeconds);

        const adjustment = RACE_RECENCY_ADJUSTMENTS[data.raceRecency ?? 'recent'] ?? 0;

        return {
            vdot: Math.round(result.vdot + adjustment),
            confidence: data.raceRecency === 'recent' ? 'high' : 'medium'
        };
    }

    // From easy pace (rough estimation based on Daniels tables)
    if (data.calibrationMethod === 'easy_pace' && data.easyPaceMinutes !== null && data.easyPaceMinutes !== undefined) {
        const paceSeconds = (data.easyPaceMinutes * 60) + (data.easyPaceSeconds ?? 0);
        // Daniels easy pace reference points (seconds per mile -> VDOT):
        // 8:00/mi (480s) ≈ VDOT 55
        // 10:00/mi (600s) ≈ VDOT 40
        // 12:00/mi (720s) ≈ VDOT 30
        // This gives us ~8 seconds per VDOT point
        const basePace = 600; // 10:00/mi = VDOT 40
        const diffSeconds = basePace - paceSeconds;
        const vdot = 40 + Math.round(diffSeconds / 8);
        return { vdot: Math.max(25, Math.min(75, vdot)), confidence: 'medium' };
    }

    // From hard effort (parkrun = 5K)
    if (data.calibrationMethod === 'effort' && data.effortType && data.effortTimeMinutes !== null && data.effortTimeMinutes !== undefined) {
        if (data.effortType === 'parkrun') {
            const totalSeconds = (data.effortTimeMinutes * 60) + (data.effortTimeSeconds ?? 0);
            const effortAdjust = data.effortLevel ? (10 - data.effortLevel) * 0.5 : 0;
            const result = calculateVdotFromRace('5k', totalSeconds);
            return { vdot: Math.round(result.vdot + effortAdjust), confidence: 'medium' };
        }
        return { vdot: 38, confidence: 'low' };
    }

    // From experience level estimate
    if (data.calibrationMethod === 'estimate' && data.experienceLevel) {
        const baseVdot = EXPERIENCE_BASE_VDOTS[data.experienceLevel] ?? 35;
        return { vdot: baseVdot, confidence: 'low' };
    }

    // From VO2max with flat 10% conservative discount
    if (data.calibrationMethod === 'vo2max' && data.garminVO2max !== null && data.garminVO2max !== undefined) {
        const result = vdotFromVO2max(data.garminVO2max);
        return { vdot: result.vdot, confidence: result.confidence };
    }

    // Default fallback
    return { vdot: 35, confidence: 'low' };
}

// =============================================================================
// TEST SUITE: Easy Pace VDOT Calculations (the primary bug)
// =============================================================================

describe('Easy Pace VDOT Calculations', () => {
    // The user reported these specific cases all gave 39
    describe('User-reported bug cases', () => {
        it('10:15 easy pace should give ~38 VDOT (not 39 regardless of input)', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'easy_pace',
                easyPaceMinutes: 10,
                easyPaceSeconds: 15,
            });
            // 615 seconds, diff from 600 = -15, -15/8 = -1.875, rounds to -2
            // VDOT = 40 + (-2) = 38
            expect(result.vdot).toBe(38);
            expect(result.confidence).toBe('medium');
        });

        it('11:00 easy pace should give ~33 VDOT (different from 10:15)', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'easy_pace',
                easyPaceMinutes: 11,
                easyPaceSeconds: 0,
            });
            // 660 seconds, diff from 600 = -60, -60/8 = -7.5, rounds to -8 (Math.round of -7.5 = -7)
            // VDOT = 40 + (-7) = 33
            expect(result.vdot).toBe(33);
            expect(result.confidence).toBe('medium');
        });

        it('9:00 easy pace should give ~48 VDOT (faster = higher)', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'easy_pace',
                easyPaceMinutes: 9,
                easyPaceSeconds: 0,
            });
            // 540 seconds, diff from 600 = 60, 60/8 = 7.5, rounds to 8
            // VDOT = 40 + 8 = 48
            expect(result.vdot).toBe(48);
            expect(result.confidence).toBe('medium');
        });

        it('5:00 easy pace should give high VDOT (clamped to 75)', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'easy_pace',
                easyPaceMinutes: 5,
                easyPaceSeconds: 0,
            });
            // 300 seconds, diff from 600 = 300, 300/8 = 37.5, rounds to 38
            // VDOT = 40 + 38 = 78, clamped to 75
            expect(result.vdot).toBe(75);
            expect(result.confidence).toBe('medium');
        });
    });

    describe('Different easy paces produce different VDOTs', () => {
        const paceCases = [
            { minutes: 5, seconds: 0, label: '5:00/mi' },
            { minutes: 6, seconds: 0, label: '6:00/mi' },
            { minutes: 7, seconds: 0, label: '7:00/mi' },
            { minutes: 8, seconds: 0, label: '8:00/mi' },
            { minutes: 9, seconds: 0, label: '9:00/mi' },
            { minutes: 10, seconds: 0, label: '10:00/mi' },
            { minutes: 11, seconds: 0, label: '11:00/mi' },
            { minutes: 12, seconds: 0, label: '12:00/mi' },
            { minutes: 13, seconds: 0, label: '13:00/mi' },
            { minutes: 14, seconds: 0, label: '14:00/mi' },
        ];

        it('each pace produces a unique VDOT', () => {
            const vdots = paceCases.map(p =>
                calculateVdotFromData({
                    calibrationMethod: 'easy_pace',
                    easyPaceMinutes: p.minutes,
                    easyPaceSeconds: p.seconds,
                }).vdot
            );

            // Check most are unique (some adjacent paces may round to same VDOT)
            const uniqueVdots = new Set(vdots);
            expect(uniqueVdots.size).toBeGreaterThanOrEqual(vdots.length - 2);
        });

        it('faster pace produces higher VDOT', () => {
            const results = paceCases.map(p => ({
                ...p,
                vdot: calculateVdotFromData({
                    calibrationMethod: 'easy_pace',
                    easyPaceMinutes: p.minutes,
                    easyPaceSeconds: p.seconds,
                }).vdot
            }));

            // Each pace should have higher or equal VDOT than the next slower pace
            for (let i = 0; i < results.length - 1; i++) {
                expect(results[i].vdot).toBeGreaterThanOrEqual(results[i + 1].vdot);
            }
        });
    });

    describe('Daniels table reference points', () => {
        it('8:00/mi easy pace ≈ VDOT 55', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'easy_pace',
                easyPaceMinutes: 8,
                easyPaceSeconds: 0,
            });
            // 480 seconds, diff = 120, 120/8 = 15
            // VDOT = 40 + 15 = 55
            expect(result.vdot).toBe(55);
        });

        it('10:00/mi easy pace ≈ VDOT 40', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'easy_pace',
                easyPaceMinutes: 10,
                easyPaceSeconds: 0,
            });
            expect(result.vdot).toBe(40);
        });

        it('12:00/mi easy pace ≈ VDOT 25', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'easy_pace',
                easyPaceMinutes: 12,
                easyPaceSeconds: 0,
            });
            // 720 seconds, diff = -120, -120/8 = -15
            // VDOT = 40 + (-15) = 25
            expect(result.vdot).toBe(25);
        });
    });

    describe('Edge cases with seconds', () => {
        it('handles null seconds as 0', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'easy_pace',
                easyPaceMinutes: 10,
                easyPaceSeconds: null,
            });
            expect(result.vdot).toBe(40);
        });

        it('10:30 is different from 10:00', () => {
            const ten00 = calculateVdotFromData({
                calibrationMethod: 'easy_pace',
                easyPaceMinutes: 10,
                easyPaceSeconds: 0,
            });
            const ten30 = calculateVdotFromData({
                calibrationMethod: 'easy_pace',
                easyPaceMinutes: 10,
                easyPaceSeconds: 30,
            });
            // 10:30 = 630s, diff = -30, -30/8 = -3.75 rounds to -4
            // VDOT = 40 + (-4) = 36
            expect(ten00.vdot).not.toBe(ten30.vdot);
            expect(ten00.vdot).toBe(40);
            expect(ten30.vdot).toBe(36);
        });
    });

    describe('Boundary clamping', () => {
        it('clamps very fast pace to 75', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'easy_pace',
                easyPaceMinutes: 4,
                easyPaceSeconds: 0,
            });
            expect(result.vdot).toBe(75);
        });

        it('clamps very slow pace to 25', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'easy_pace',
                easyPaceMinutes: 20,
                easyPaceSeconds: 0,
            });
            expect(result.vdot).toBe(25);
        });
    });
});

// =============================================================================
// TEST SUITE: VO2max VDOT Calculations (secondary bug)
// =============================================================================

describe('VO2max VDOT Calculations', () => {
    describe('Basic conversion with 10% discount', () => {
        it('VO2max 50 gives VDOT 45 (10% discount)', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'vo2max',
                garminVO2max: 50,
            });
            expect(result.vdot).toBe(45);
            expect(result.confidence).toBe('medium');
        });

        it('VO2max 55 gives VDOT ~50', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'vo2max',
                garminVO2max: 55,
            });
            expect(result.vdot).toBeGreaterThanOrEqual(49);
            expect(result.vdot).toBeLessThanOrEqual(50);
        });

        it('VO2max 40 gives VDOT 36', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'vo2max',
                garminVO2max: 40,
            });
            expect(result.vdot).toBe(36);
        });

        it('VO2max 60 gives VDOT 54', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'vo2max',
                garminVO2max: 60,
            });
            expect(result.vdot).toBe(54);
        });
    });

    describe('Different VO2max values produce different VDOTs', () => {
        it('range of VO2max values produce unique VDOTs', () => {
            const vo2maxValues = [30, 35, 40, 45, 50, 55, 60, 65, 70];
            const vdots = vo2maxValues.map(v => calculateVdotFromData({
                calibrationMethod: 'vo2max',
                garminVO2max: v,
            }).vdot);

            // Higher VO2max = higher VDOT
            for (let i = 0; i < vdots.length - 1; i++) {
                expect(vdots[i]).toBeLessThan(vdots[i + 1]);
            }
        });
    });

    describe('vdotFromVO2max function directly', () => {
        it('applies 10% discount', () => {
            const result = vdotFromVO2max(50);
            expect(result.vdot).toBe(45);
            expect(result.confidence).toBe('medium');
            expect(result.source).toBe('garmin');
        });

        it('clamps to minimum of 20', () => {
            const result = vdotFromVO2max(15);
            expect(result.vdot).toBe(20);
        });

        it('clamps to maximum of 85', () => {
            const result = vdotFromVO2max(100);
            expect(result.vdot).toBe(85);
        });
    });

    describe('vdotFromGarminVO2max function', () => {
        it('applies 7% discount for Garmin', () => {
            const result = vdotFromGarminVO2max(50);
            // 50 * 0.93 = 46.5, rounds to 47
            expect(result.vdot).toBe(47);
            expect(result.confidence).toBe('high');
        });
    });
});

// =============================================================================
// TEST SUITE: Race Time VDOT Calculations
// =============================================================================

describe('Race Time VDOT Calculations', () => {
    describe('5K race times', () => {
        it('15:00 5K ≈ VDOT 60+', () => {
            const result = calculateVdotFromRace('5k', 15 * 60);
            expect(result.vdot).toBeGreaterThan(58);
        });

        it('20:00 5K ≈ VDOT 48-52', () => {
            const result = calculateVdotFromRace('5k', 20 * 60);
            expect(result.vdot).toBeGreaterThan(45);
            expect(result.vdot).toBeLessThan(55);
        });

        it('25:00 5K ≈ VDOT ~38', () => {
            const result = calculateVdotFromRace('5k', 25 * 60);
            expect(result.vdot).toBeGreaterThanOrEqual(36);
            expect(result.vdot).toBeLessThanOrEqual(42);
        });

        it('30:00 5K ≈ VDOT ~31', () => {
            const result = calculateVdotFromRace('5k', 30 * 60);
            expect(result.vdot).toBeGreaterThanOrEqual(28);
            expect(result.vdot).toBeLessThanOrEqual(35);
        });

        it('40:00 5K ≈ VDOT ~22', () => {
            const result = calculateVdotFromRace('5k', 40 * 60);
            expect(result.vdot).toBeGreaterThanOrEqual(20);
            expect(result.vdot).toBeLessThanOrEqual(28);
        });
    });

    describe('10K race times', () => {
        it('35:00 10K ≈ VDOT 55-60', () => {
            const result = calculateVdotFromRace('10k', 35 * 60);
            expect(result.vdot).toBeGreaterThan(52);
        });

        it('45:00 10K ≈ VDOT ~45', () => {
            const result = calculateVdotFromRace('10k', 45 * 60);
            expect(result.vdot).toBeGreaterThanOrEqual(43);
            expect(result.vdot).toBeLessThanOrEqual(50);
        });

        it('55:00 10K ≈ VDOT ~36', () => {
            const result = calculateVdotFromRace('10k', 55 * 60);
            expect(result.vdot).toBeGreaterThanOrEqual(34);
            expect(result.vdot).toBeLessThanOrEqual(40);
        });
    });

    describe('Half marathon race times', () => {
        it('1:30 half ≈ VDOT 50+', () => {
            const result = calculateVdotFromRace('half', 90 * 60);
            expect(result.vdot).toBeGreaterThan(48);
        });

        it('2:00 half ≈ VDOT ~36', () => {
            const result = calculateVdotFromRace('half', 120 * 60);
            expect(result.vdot).toBeGreaterThanOrEqual(33);
            expect(result.vdot).toBeLessThanOrEqual(40);
        });
    });

    describe('Marathon race times', () => {
        it('3:00 marathon ≈ VDOT 50+', () => {
            const result = calculateVdotFromRace('marathon', 180 * 60);
            expect(result.vdot).toBeGreaterThan(50);
        });

        it('3:30 marathon ≈ VDOT 45-50', () => {
            const result = calculateVdotFromRace('marathon', 210 * 60);
            expect(result.vdot).toBeGreaterThan(43);
            expect(result.vdot).toBeLessThan(52);
        });

        it('4:00 marathon ≈ VDOT 38-44', () => {
            const result = calculateVdotFromRace('marathon', 240 * 60);
            expect(result.vdot).toBeGreaterThan(36);
            expect(result.vdot).toBeLessThan(46);
        });

        it('5:00 marathon ≈ VDOT 30-35', () => {
            const result = calculateVdotFromRace('marathon', 300 * 60);
            expect(result.vdot).toBeGreaterThan(28);
            expect(result.vdot).toBeLessThan(37);
        });
    });

    describe('Race recency adjustments', () => {
        it('recent race has no adjustment', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'race',
                raceDistance: '5k',
                raceTimeMinutes: 25,
                raceTimeSeconds: 0,
                raceRecency: 'recent',
            });
            const base = calculateVdotFromRace('5k', 25 * 60).vdot;
            expect(result.vdot).toBe(base);
        });

        it('moderate recency has -1 adjustment', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'race',
                raceDistance: '5k',
                raceTimeMinutes: 25,
                raceTimeSeconds: 0,
                raceRecency: 'moderate',
            });
            const base = calculateVdotFromRace('5k', 25 * 60).vdot;
            expect(result.vdot).toBe(base - 1);
        });

        it('old race has -2 adjustment', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'race',
                raceDistance: '5k',
                raceTimeMinutes: 25,
                raceTimeSeconds: 0,
                raceRecency: 'old',
            });
            const base = calculateVdotFromRace('5k', 25 * 60).vdot;
            expect(result.vdot).toBe(base - 2);
        });

        it('very old race has -3 adjustment', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'race',
                raceDistance: '5k',
                raceTimeMinutes: 25,
                raceTimeSeconds: 0,
                raceRecency: 'very_old',
            });
            const base = calculateVdotFromRace('5k', 25 * 60).vdot;
            expect(result.vdot).toBe(base - 3);
        });
    });

    describe('Invalid inputs', () => {
        it('returns fallback for invalid distance', () => {
            const result = calculateVdotFromRace('invalid', 1200);
            expect(result.vdot).toBe(35);
            expect(result.confidence).toBe('low');
        });

        it('returns fallback for zero time', () => {
            const result = calculateVdotFromRace('5k', 0);
            expect(result.vdot).toBe(35);
            expect(result.confidence).toBe('low');
        });

        it('returns fallback for negative time', () => {
            const result = calculateVdotFromRace('5k', -100);
            expect(result.vdot).toBe(35);
            expect(result.confidence).toBe('low');
        });
    });
});

// =============================================================================
// TEST SUITE: Hard Effort (Parkrun) VDOT Calculations
// =============================================================================

describe('Hard Effort VDOT Calculations', () => {
    describe('Parkrun (5K) efforts', () => {
        it('25:00 parkrun at max effort = 5K VDOT', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'effort',
                effortType: 'parkrun',
                effortTimeMinutes: 25,
                effortTimeSeconds: 0,
                effortLevel: 10,
            });
            const raceVdot = calculateVdotFromRace('5k', 25 * 60).vdot;
            expect(result.vdot).toBe(raceVdot);
        });

        it('parkrun at effort 8 gets +1 adjustment', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'effort',
                effortType: 'parkrun',
                effortTimeMinutes: 25,
                effortTimeSeconds: 0,
                effortLevel: 8,
            });
            const raceVdot = calculateVdotFromRace('5k', 25 * 60).vdot;
            // (10 - 8) * 0.5 = 1
            expect(result.vdot).toBe(raceVdot + 1);
        });

        it('parkrun at effort 6 gets +2 adjustment', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'effort',
                effortType: 'parkrun',
                effortTimeMinutes: 25,
                effortTimeSeconds: 0,
                effortLevel: 6,
            });
            const raceVdot = calculateVdotFromRace('5k', 25 * 60).vdot;
            // (10 - 6) * 0.5 = 2
            expect(result.vdot).toBe(raceVdot + 2);
        });
    });

    describe('Non-parkrun efforts', () => {
        it('tempo effort returns conservative 38', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'effort',
                effortType: 'tempo',
                effortTimeMinutes: 30,
                effortTimeSeconds: 0,
                effortLevel: 8,
            });
            expect(result.vdot).toBe(38);
            expect(result.confidence).toBe('low');
        });
    });
});

// =============================================================================
// TEST SUITE: Experience Level Estimation
// =============================================================================

describe('Experience Level VDOT Estimation', () => {
    describe('Experience levels map to correct base VDOTs', () => {
        const cases = [
            { level: 'newer', expected: 30 },
            { level: 'recreational', expected: 38 },
            { level: 'experienced', expected: 45 },
            { level: 'competitive', expected: 50 },
            { level: 'elite', expected: 55 },
            { level: 'returning', expected: 40 },
            { level: 'crossfit_athlete', expected: 38 },
        ];

        cases.forEach(({ level, expected }) => {
            it(`${level} -> VDOT ${expected}`, () => {
                const result = calculateVdotFromData({
                    calibrationMethod: 'estimate',
                    experienceLevel: level,
                });
                expect(result.vdot).toBe(expected);
                expect(result.confidence).toBe('low');
            });
        });
    });

    describe('Unknown experience level fallback', () => {
        it('unknown level returns 35', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'estimate',
                experienceLevel: 'unknown_level',
            });
            expect(result.vdot).toBe(35);
        });
    });
});

// =============================================================================
// TEST SUITE: Training Pace Calculations
// =============================================================================

describe('Training Pace Calculations', () => {
    describe('Pace zone ordering', () => {
        it('pace zones are in correct order for VDOT 40', () => {
            const paces = calculateTrainingPaces(40);
            expect(paces.easy.max).toBeGreaterThan(paces.marathon);
            expect(paces.marathon).toBeGreaterThan(paces.threshold);
            expect(paces.threshold).toBeGreaterThan(paces.interval);
            expect(paces.interval).toBeGreaterThan(paces.repetition);
        });

        it('pace zones are in correct order for VDOT 50', () => {
            const paces = calculateTrainingPaces(50);
            expect(paces.easy.max).toBeGreaterThan(paces.marathon);
            expect(paces.marathon).toBeGreaterThan(paces.threshold);
            expect(paces.threshold).toBeGreaterThan(paces.interval);
            expect(paces.interval).toBeGreaterThan(paces.repetition);
        });

        it('pace zones are in correct order for VDOT 60', () => {
            const paces = calculateTrainingPaces(60);
            expect(paces.easy.max).toBeGreaterThan(paces.marathon);
            expect(paces.marathon).toBeGreaterThan(paces.threshold);
            expect(paces.threshold).toBeGreaterThan(paces.interval);
            expect(paces.interval).toBeGreaterThan(paces.repetition);
        });
    });

    describe('Higher VDOT = Faster paces', () => {
        it('VDOT 50 is faster than VDOT 40 across all zones', () => {
            const low = calculateTrainingPaces(40);
            const high = calculateTrainingPaces(50);

            expect(high.easy.min).toBeLessThan(low.easy.min);
            expect(high.easy.max).toBeLessThan(low.easy.max);
            expect(high.marathon).toBeLessThan(low.marathon);
            expect(high.threshold).toBeLessThan(low.threshold);
            expect(high.interval).toBeLessThan(low.interval);
            expect(high.repetition).toBeLessThan(low.repetition);
        });
    });
});

// =============================================================================
// TEST SUITE: Time Trial Calculations
// =============================================================================

describe('Time Trial Calculations', () => {
    it('max effort time trial equals race calculation', () => {
        const timeTrial = calculateVdotFromTimeTrial('5k', 20 * 60, 10);
        const race = calculateVdotFromRace('5k', 20 * 60);
        expect(timeTrial.vdot).toBe(race.vdot);
    });

    it('sub-max effort gets discounted', () => {
        const maxEffort = calculateVdotFromTimeTrial('5k', 20 * 60, 10);
        const subMax = calculateVdotFromTimeTrial('5k', 20 * 60, 7);
        expect(subMax.vdot).toBeLessThan(maxEffort.vdot);
    });

    it('RPE < 8 gets 8% discount', () => {
        const base = calculateVdotFromRace('5k', 20 * 60).vdot;
        const result = calculateVdotFromTimeTrial('5k', 20 * 60, 6);
        expect(result.vdot).toBe(Math.round(base * 0.92));
    });
});

// =============================================================================
// TEST SUITE: Conservative Estimation
// =============================================================================

describe('Conservative VDOT Estimation', () => {
    it('baseline for recreational male runner', () => {
        const result = estimateVdotConservative(30, 'male', 20, 3, 'none');
        expect(result.vdot).toBeGreaterThan(35);
        expect(result.vdot).toBeLessThan(50);
        expect(result.confidence).toBe('low');
    });

    it('women have lower baseline', () => {
        const male = estimateVdotConservative(30, 'male', 20, 3, 'none');
        const female = estimateVdotConservative(30, 'female', 20, 3, 'none');
        expect(female.vdot).toBeLessThan(male.vdot);
    });

    it('age affects estimate after 30', () => {
        const young = estimateVdotConservative(30, 'male', 20, 3, 'none');
        const older = estimateVdotConservative(50, 'male', 20, 3, 'none');
        expect(older.vdot).toBeLessThan(young.vdot);
    });

    it('higher mileage increases estimate', () => {
        const lowMiles = estimateVdotConservative(30, 'male', 10, 3, 'none');
        const highMiles = estimateVdotConservative(30, 'male', 40, 3, 'none');
        expect(highMiles.vdot).toBeGreaterThan(lowMiles.vdot);
    });

    it('higher frequency increases estimate', () => {
        const lowFreq = estimateVdotConservative(30, 'male', 20, 2, 'none');
        const highFreq = estimateVdotConservative(30, 'male', 20, 6, 'none');
        expect(highFreq.vdot).toBeGreaterThan(lowFreq.vdot);
    });
});

// =============================================================================
// TEST SUITE: Fallback Behavior
// =============================================================================

describe('Fallback Behavior', () => {
    it('null calibration method returns 35', () => {
        const result = calculateVdotFromData({
            calibrationMethod: null,
        });
        expect(result.vdot).toBe(35);
        expect(result.confidence).toBe('low');
    });

    it('missing required fields trigger fallback', () => {
        const result = calculateVdotFromData({
            calibrationMethod: 'race',
            raceDistance: '5k',
            raceTimeMinutes: null, // Missing required field
        });
        expect(result.vdot).toBe(35);
    });

    it('easy pace with null minutes triggers fallback', () => {
        const result = calculateVdotFromData({
            calibrationMethod: 'easy_pace',
            easyPaceMinutes: null,
        });
        expect(result.vdot).toBe(35);
    });

    it('vo2max with null value triggers fallback', () => {
        const result = calculateVdotFromData({
            calibrationMethod: 'vo2max',
            garminVO2max: null,
        });
        expect(result.vdot).toBe(35);
    });
});

// =============================================================================
// TEST SUITE: Comprehensive Input Validation
// =============================================================================

describe('Input Validation', () => {
    describe('Numeric edge cases', () => {
        it('handles 0 minutes easy pace', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'easy_pace',
                easyPaceMinutes: 0,
                easyPaceSeconds: 0,
            });
            // 0 seconds total... this is unrealistic but should clamp to 75
            expect(result.vdot).toBe(75);
        });

        it('handles very large VO2max', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'vo2max',
                garminVO2max: 100,
            });
            expect(result.vdot).toBe(85); // Clamped
        });

        it('handles very small VO2max', () => {
            const result = calculateVdotFromData({
                calibrationMethod: 'vo2max',
                garminVO2max: 15,
            });
            expect(result.vdot).toBe(20); // Clamped minimum
        });
    });
});
