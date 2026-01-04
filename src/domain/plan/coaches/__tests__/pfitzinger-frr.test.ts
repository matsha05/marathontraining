/**
 * Pfitzinger Faster Road Racing - Unit Tests
 *
 * 1:1 validation against research/25-pfitzinger-faster-road-racing.md
 */

import { describe, it, expect } from 'vitest';
import {
    PFITZ_FRR_TIER_CONFIGS,
    getFRRTiers,
    getFRRTierConfig,
    getFRRTierDisplayName,
    getFRRPhase,
    getFRRWeeklyMileage,
    getFRRLongRunMiles,
    getFRRMLRMiles,
    getFRRKeyWorkout,
    isFRRTuneUpRaceWeek,
    generateFRRWeeklyMileageProgression,
    generateFRRLongRunProgression,
    validateFRRPlan,
    recommendFRRTier,
} from '../pfitzinger-frr';
import { PfitzFRRTier } from '../../types';

// =============================================================================
// TIER CONFIG TESTS
// =============================================================================

describe('Pfitzinger FRR Tier Configs', () => {
    it('has exactly 10 tiers', () => {
        const tiers = getFRRTiers();
        expect(tiers).toHaveLength(10);
    });

    it('all tiers have 12-week duration', () => {
        getFRRTiers().forEach(tier => {
            const config = getFRRTierConfig(tier);
            expect(config.durationWeeks).toBe(12);
        });
    });

    describe.each([
        ['pfitz_frr_5k_sch1', '5k', 30, 40, 10],
        ['pfitz_frr_5k_sch2', '5k', 45, 55, 11],
        ['pfitz_frr_5k_sch3', '5k', 60, 70, 13],
        ['pfitz_frr_10k_sch1', '10k', 30, 42, 11],
        ['pfitz_frr_hm_sch1', 'half', 31, 47, 14],
        ['pfitz_frr_hm_sch2', 'half', 46, 63, 16],
        ['pfitz_frr_hm_sch3', 'half', 61, 84, 18],
        ['pfitz_frr_hm_sch4', 'half', 81, 100, 19],
    ] as [PfitzFRRTier, string, number, number, number][])('%s config', (tier, distance, startMpw, peakMpw, maxLongRun) => {
        it(`has distance ${distance}`, () => {
            expect(PFITZ_FRR_TIER_CONFIGS[tier].distance).toBe(distance);
        });

        it(`starts at ${startMpw} mpw`, () => {
            expect(PFITZ_FRR_TIER_CONFIGS[tier].startMileage).toBe(startMpw);
        });

        it(`peaks at ${peakMpw} mpw`, () => {
            expect(PFITZ_FRR_TIER_CONFIGS[tier].peakMileage).toBe(peakMpw);
        });

        it(`max long run is ${maxLongRun} miles`, () => {
            expect(PFITZ_FRR_TIER_CONFIGS[tier].maxLongRun).toBe(maxLongRun);
        });
    });
});

// =============================================================================
// 1:1 VALIDATION: 5K Schedule 1 (30-40 mpw)
// =============================================================================

describe('FRR 5K Schedule 1 - 1:1 Validation', () => {
    const TIER: PfitzFRRTier = 'pfitz_frr_5k_sch1';

    // From research/25-pfitzinger-faster-road-racing.md
    const OFFICIAL_MILEAGE = [30, 32, 34, 30, 36, 37, 38, 33, 40, 33, 29, 29];
    const OFFICIAL_LONG_RUNS = [9, 9, 10, 8, 10, 10, 10, 8, 10, 8, 7, 4];

    it('weekly mileage matches FRR book exactly', () => {
        OFFICIAL_MILEAGE.forEach((expected, i) => {
            const actual = getFRRWeeklyMileage(TIER, i + 1);
            expect(actual).toBe(expected);
        });
    });

    it('long runs match FRR book exactly', () => {
        OFFICIAL_LONG_RUNS.forEach((expected, i) => {
            const actual = getFRRLongRunMiles(TIER, i + 1);
            expect(actual).toBe(expected);
        });
    });

    it('has tune-up races at weeks 8 and 10', () => {
        expect(isFRRTuneUpRaceWeek(TIER, 8)).toBe(true);
        expect(isFRRTuneUpRaceWeek(TIER, 10)).toBe(true);
        expect(isFRRTuneUpRaceWeek(TIER, 9)).toBe(false);
    });

    it('peak week is 9 with 40 miles', () => {
        const progression = generateFRRWeeklyMileageProgression(TIER);
        const peakMileage = Math.max(...progression);
        const peakWeek = progression.indexOf(peakMileage) + 1;
        expect(peakMileage).toBe(40);
        expect(peakWeek).toBe(9);
    });
});

// =============================================================================
// 1:1 VALIDATION: Half Marathon Schedule 1 (31-47 mpw)
// =============================================================================

describe('FRR HM Schedule 1 - 1:1 Validation', () => {
    const TIER: PfitzFRRTier = 'pfitz_frr_hm_sch1';

    // From research/25-pfitzinger-faster-road-racing.md
    const OFFICIAL_MILEAGE = [31, 34, 37, 32, 40, 43, 45, 38, 47, 38, 32, 32.1];
    const OFFICIAL_LONG_RUNS = [10, 11, 12, 9, 12, 12, 13, 10, 14, 10, 10, 13.1];
    const OFFICIAL_MLR = [8, 8, 9, 8, 9, 9, 10, 8, 11, 8, 6, 5];

    it('weekly mileage matches FRR book exactly', () => {
        OFFICIAL_MILEAGE.forEach((expected, i) => {
            const actual = getFRRWeeklyMileage(TIER, i + 1);
            expect(actual).toBe(expected);
        });
    });

    it('long runs match FRR book exactly', () => {
        OFFICIAL_LONG_RUNS.forEach((expected, i) => {
            const actual = getFRRLongRunMiles(TIER, i + 1);
            expect(actual).toBe(expected);
        });
    });

    it('MLR distances match FRR book', () => {
        OFFICIAL_MLR.forEach((expected, i) => {
            const actual = getFRRMLRMiles(TIER, i + 1);
            expect(actual).toBe(expected);
        });
    });

    it('progression runs in weeks 3, 5, 7', () => {
        const config = getFRRTierConfig(TIER);
        expect(config.progressionRunWeeks).toContain(3);
        expect(config.progressionRunWeeks).toContain(5);
        expect(config.progressionRunWeeks).toContain(7);
    });
});

// =============================================================================
// PHASE DETECTION
// =============================================================================

describe('FRR Phase Detection', () => {
    const TIER: PfitzFRRTier = 'pfitz_frr_5k_sch1';

    it('weeks 1-3 are base phase', () => {
        expect(getFRRPhase(TIER, 1)).toBe('base');
        expect(getFRRPhase(TIER, 2)).toBe('base');
        expect(getFRRPhase(TIER, 3)).toBe('base');
    });

    it('weeks 4-7 are build phase', () => {
        expect(getFRRPhase(TIER, 4)).toBe('build');
        expect(getFRRPhase(TIER, 7)).toBe('build');
    });

    it('weeks 8-10 are peak phase', () => {
        expect(getFRRPhase(TIER, 8)).toBe('peak');
        expect(getFRRPhase(TIER, 10)).toBe('peak');
    });

    it('weeks 11-12 are taper phase', () => {
        expect(getFRRPhase(TIER, 11)).toBe('taper');
        expect(getFRRPhase(TIER, 12)).toBe('taper');
    });
});

// =============================================================================
// TIER RECOMMENDATION
// =============================================================================

describe('FRR Tier Recommendation', () => {
    it('recommends sch1 for 30mpw runner targeting 5K', () => {
        const tier = recommendFRRTier(30, 5, '5k');
        expect(tier).toBe('pfitz_frr_5k_sch1');
    });

    it('recommends sch3 for 60mpw runner targeting 5K', () => {
        const tier = recommendFRRTier(60, 6, '5k');
        expect(tier).toBe('pfitz_frr_5k_sch3');
    });

    it('recommends sch1 for 35mpw runner targeting HM', () => {
        const tier = recommendFRRTier(35, 5, 'half');
        expect(tier).toBe('pfitz_frr_hm_sch1');
    });

    it('recommends sch4 for 80mpw runner targeting HM', () => {
        const tier = recommendFRRTier(80, 6, 'half');
        expect(tier).toBe('pfitz_frr_hm_sch4');
    });
});

// =============================================================================
// VALIDATION
// =============================================================================

describe('FRR Plan Validation', () => {
    it('5K sch1 passes validation', () => {
        const result = validateFRRPlan('pfitz_frr_5k_sch1');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('HM sch1 passes validation', () => {
        const result = validateFRRPlan('pfitz_frr_hm_sch1');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('all tiers pass validation', () => {
        getFRRTiers().forEach(tier => {
            const result = validateFRRPlan(tier);
            expect(result.valid, `${tier} should pass validation: ${result.errors.join(', ')}`).toBe(true);
        });
    });
});

// =============================================================================
// DISPLAY NAMES
// =============================================================================

describe('FRR Display Names', () => {
    it('formats 5K tier names correctly', () => {
        expect(getFRRTierDisplayName('pfitz_frr_5k_sch1')).toBe('Pfitzinger FRR 5K (30-40 mpw)');
        expect(getFRRTierDisplayName('pfitz_frr_5k_sch3')).toBe('Pfitzinger FRR 5K (60-70 mpw)');
    });

    it('formats HM tier names correctly', () => {
        expect(getFRRTierDisplayName('pfitz_frr_hm_sch1')).toBe('Pfitzinger FRR Half Marathon (31-47 mpw)');
        expect(getFRRTierDisplayName('pfitz_frr_hm_sch4')).toBe('Pfitzinger FRR Half Marathon (81-100 mpw)');
    });
});
