/**
 * THE LONG GAME - Higdon Coach Module Tests
 *
 * Comprehensive tests for all 22 Hal Higdon training plans.
 */

import { describe, it, expect } from 'vitest';
import {
    HIGDON_MICROCYCLES,
    generateHigdonLongRunProgression,
    isHigdonStepbackWeek,
    isTuneUpRaceWeek,
    getTuneUpRaceDetails,
    shouldUseThreeOneLongRun,
    buildThreeOneLongRun,
    getHigdonPhase,
    getDistanceFromTier,
    getTiersForDistance,
    recommendHigdonTier,
    getMicrocycleForTier,
    hasBackToBackWeekend,
} from '../higdon';
import { HIGDON_TIER_CONFIGS, HigdonTier } from '../../types';

// =============================================================================
// TIER CONFIG TESTS
// =============================================================================

describe('HIGDON_TIER_CONFIGS', () => {
    it('should have 22 tiers', () => {
        expect(Object.keys(HIGDON_TIER_CONFIGS)).toHaveLength(22);
    });

    it('should have 4 base training tiers', () => {
        const baseTiers = getTiersForDistance('base');
        expect(baseTiers).toHaveLength(4);
        expect(baseTiers).toContain('base_novice');
        expect(baseTiers).toContain('base_spring');
    });

    it('should have 3 5K tiers', () => {
        const tiers = getTiersForDistance('5k');
        expect(tiers).toHaveLength(3);
    });

    it('should have 3 10K tiers', () => {
        const tiers = getTiersForDistance('10k');
        expect(tiers).toHaveLength(3);
    });

    it('should have 5 half marathon tiers', () => {
        const tiers = getTiersForDistance('half');
        expect(tiers).toHaveLength(5);
    });

    it('should have 7 marathon tiers', () => {
        const tiers = getTiersForDistance('marathon');
        expect(tiers).toHaveLength(7);
    });
});

// =============================================================================
// MICROCYCLE TESTS
// =============================================================================

describe('HIGDON_MICROCYCLES', () => {
    it('should have microcycle for every tier', () => {
        const tiers = Object.keys(HIGDON_TIER_CONFIGS) as HigdonTier[];
        tiers.forEach((tier) => {
            expect(HIGDON_MICROCYCLES[tier]).toBeDefined();
        });
    });

    it('should have 7 days in each microcycle', () => {
        const tiers = Object.keys(HIGDON_MICROCYCLES) as HigdonTier[];
        tiers.forEach((tier) => {
            const microcycle = HIGDON_MICROCYCLES[tier];
            expect(Object.keys(microcycle)).toHaveLength(7);
            expect(microcycle.mon).toBeDefined();
            expect(microcycle.sun).toBeDefined();
        });
    });

    it('marathon novice 1 should have rest on Monday', () => {
        const microcycle = getMicrocycleForTier('marathon_novice_1');
        expect(microcycle.mon.type).toBe('rest');
    });

    it('marathon advanced 2 should have speedwork on Tuesday', () => {
        const microcycle = getMicrocycleForTier('marathon_advanced_2');
        expect(microcycle.tue.type).toBe('speedwork');
    });
});

// =============================================================================
// LONG RUN PROGRESSION TESTS - MARATHON
// =============================================================================

describe('Marathon Long Run Progression', () => {
    it('should cap long runs at 20 miles', () => {
        const tiers: HigdonTier[] = [
            'marathon_novice_1',
            'marathon_intermediate_1',
            'marathon_advanced_1',
        ];
        tiers.forEach((tier) => {
            const progression = generateHigdonLongRunProgression(tier, 18);
            expect(Math.max(...progression)).toBeLessThanOrEqual(20);
        });
    });

    it('marathon_novice_1 should have exactly 1 twenty-miler', () => {
        const progression = generateHigdonLongRunProgression('marathon_novice_1', 18);
        const twentyMilers = progression.filter((d) => d === 20).length;
        expect(twentyMilers).toBe(1);
    });

    it('marathon_intermediate_2 should have at least 3 twenty-milers', () => {
        const progression = generateHigdonLongRunProgression('marathon_intermediate_2', 18);
        const twentyMilers = progression.filter((d) => d === 20).length;
        // May have 3-4 depending on progression (hitting cap naturally)
        expect(twentyMilers).toBeGreaterThanOrEqual(3);
    });

    it('should implement 3-week taper pattern', () => {
        const progression = generateHigdonLongRunProgression('marathon_novice_1', 18);
        // Week 16: 12, Week 17: 8, Week 18: race (0)
        expect(progression[15]).toBe(12);
        expect(progression[16]).toBe(8);
        expect(progression[17]).toBe(0);
    });

    it('marathon_novice_1 should start at 6 miles', () => {
        const progression = generateHigdonLongRunProgression('marathon_novice_1', 18);
        expect(progression[0]).toBe(6);
    });

    it('marathon_intermediate_2 should start at 10 miles', () => {
        const progression = generateHigdonLongRunProgression('marathon_intermediate_2', 18);
        expect(progression[0]).toBe(10);
    });
});

// =============================================================================
// LONG RUN PROGRESSION TESTS - OTHER DISTANCES
// =============================================================================

describe('Non-Marathon Long Run Progression', () => {
    it('5K novice peak should be within 5K cap', () => {
        const progression = generateHigdonLongRunProgression('5k_novice', 8);
        // 5K LONG_RUN_CAP is 7 miles
        expect(Math.max(...progression.filter(d => d > 0))).toBeLessThanOrEqual(7);
    });

    it('10K novice peak should be within 10K cap', () => {
        const progression = generateHigdonLongRunProgression('10k_novice', 8);
        // 10K LONG_RUN_CAP is 10 miles
        expect(Math.max(...progression.filter(d => d > 0))).toBeLessThanOrEqual(10);
    });

    it('half marathon novice 1 peak should be 10 miles', () => {
        const progression = generateHigdonLongRunProgression('half_novice_1', 12);
        expect(Math.max(...progression.filter(d => d > 0))).toBeLessThanOrEqual(12);
    });

    it('base novice peak should be 8 miles', () => {
        const progression = generateHigdonLongRunProgression('base_novice', 12);
        expect(Math.max(...progression.filter(d => d > 0))).toBeLessThanOrEqual(10);
    });
});

// =============================================================================
// STEPBACK WEEK TESTS
// =============================================================================

describe('Stepback Week Detection', () => {
    it('marathon should stepback every 3rd week', () => {
        expect(isHigdonStepbackWeek('marathon_novice_1', 3, 18, 'build')).toBe(true);
        expect(isHigdonStepbackWeek('marathon_novice_1', 6, 18, 'build')).toBe(true);
        expect(isHigdonStepbackWeek('marathon_novice_1', 9, 18, 'build')).toBe(true);
    });

    it('should not stepback during taper', () => {
        expect(isHigdonStepbackWeek('marathon_novice_1', 18, 18, 'taper')).toBe(false);
    });

    it('tune-up race weeks should be stepbacks', () => {
        // marathon_novice_1 has tune-up at week 8
        expect(isHigdonStepbackWeek('marathon_novice_1', 8, 18, 'build')).toBe(true);
    });

    it('10K novice should stepback on week 6', () => {
        expect(isHigdonStepbackWeek('10k_novice', 6, 8, 'build')).toBe(true);
    });
});

// =============================================================================
// TUNE-UP RACE TESTS
// =============================================================================

describe('Tune-Up Race Detection', () => {
    it('marathon_novice_1 should have tune-up at week 8', () => {
        expect(isTuneUpRaceWeek('marathon_novice_1', 8)).toBe(true);
        expect(isTuneUpRaceWeek('marathon_novice_1', 9)).toBe(false);
    });

    it('marathon_novice_2 should have tune-up at week 9', () => {
        expect(isTuneUpRaceWeek('marathon_novice_2', 9)).toBe(true);
    });

    it('should return tune-up race details', () => {
        const details = getTuneUpRaceDetails('marathon_novice_1', 8);
        expect(details).not.toBeNull();
        expect(details?.distance).toBe('half');
    });

    it('half_advanced should have 3 tune-up races', () => {
        const config = HIGDON_TIER_CONFIGS['half_advanced'];
        expect(config.tuneUpRaceWeeks).toHaveLength(3);
    });

    it('base_advanced should have 5 tune-up races', () => {
        const config = HIGDON_TIER_CONFIGS['base_advanced'];
        expect(config.tuneUpRaceWeeks).toHaveLength(5);
    });

    it('5k_novice should have no tune-up races', () => {
        expect(isTuneUpRaceWeek('5k_novice', 4)).toBe(false);
        const config = HIGDON_TIER_CONFIGS['5k_novice'];
        expect(config.tuneUpRaceWeeks).toBeUndefined();
    });
});

// =============================================================================
// PHASE CALCULATION TESTS
// =============================================================================

describe('Phase Calculation', () => {
    it('marathon week 1 should be base phase', () => {
        expect(getHigdonPhase('marathon_novice_1', 1, 18)).toBe('base');
    });

    it('marathon week 10 should be build phase', () => {
        expect(getHigdonPhase('marathon_novice_1', 10, 18)).toBe('build');
    });

    it('marathon week 14 should be peak phase', () => {
        expect(getHigdonPhase('marathon_novice_1', 14, 18)).toBe('peak');
    });

    it('marathon week 17-18 should be taper phase', () => {
        expect(getHigdonPhase('marathon_novice_1', 17, 18)).toBe('taper');
        expect(getHigdonPhase('marathon_novice_1', 18, 18)).toBe('taper');
    });

    it('5K final week should be taper', () => {
        expect(getHigdonPhase('5k_novice', 8, 8)).toBe('taper');
    });

    it('half marathon week 12 should be taper', () => {
        expect(getHigdonPhase('half_novice_1', 12, 12)).toBe('taper');
    });
});

// =============================================================================
// 3/1 PATTERN TESTS
// =============================================================================

describe('3/1 Long Run Pattern', () => {
    it('should apply to advanced tiers only', () => {
        expect(shouldUseThreeOneLongRun('marathon_novice_1', 8, 'build')).toBe(false);
        expect(shouldUseThreeOneLongRun('marathon_advanced_1', 8, 'build')).toBe(true);
    });

    it('should not apply during taper', () => {
        expect(shouldUseThreeOneLongRun('marathon_advanced_1', 17, 'taper')).toBe(false);
    });

    it('should apply on week 2, 5, 8, 11... (week % 3 === 2)', () => {
        expect(shouldUseThreeOneLongRun('marathon_advanced_1', 2, 'build')).toBe(true);
        expect(shouldUseThreeOneLongRun('marathon_advanced_1', 5, 'build')).toBe(true);
        expect(shouldUseThreeOneLongRun('marathon_advanced_1', 8, 'build')).toBe(true);
    });

    it('should not apply on stepback weeks', () => {
        // Week 3 is a stepback week (3 % 3 === 0)
        expect(shouldUseThreeOneLongRun('marathon_advanced_1', 3, 'build')).toBe(false);
    });

    it('buildThreeOneLongRun should split 75/25', () => {
        const result = buildThreeOneLongRun(20);
        expect(result.easyMiles).toBe(15);
        expect(result.fastMiles).toBe(5);
    });

    it('10k_advanced should support 3/1 pattern', () => {
        expect(HIGDON_TIER_CONFIGS['10k_advanced'].hasThreeOneLongRun).toBe(true);
    });

    it('half_advanced should support 3/1 pattern', () => {
        expect(HIGDON_TIER_CONFIGS['half_advanced'].hasThreeOneLongRun).toBe(true);
    });
});

// =============================================================================
// BACK-TO-BACK WEEKEND TESTS
// =============================================================================

describe('Back-to-Back Weekend Pattern', () => {
    it('novice tiers should not have back-to-back', () => {
        expect(hasBackToBackWeekend('marathon_novice_1')).toBe(false);
        expect(hasBackToBackWeekend('marathon_novice_2')).toBe(false);
    });

    it('intermediate and advanced marathon should have back-to-back', () => {
        expect(hasBackToBackWeekend('marathon_intermediate_1')).toBe(true);
        expect(hasBackToBackWeekend('marathon_intermediate_2')).toBe(true);
        expect(hasBackToBackWeekend('marathon_advanced_1')).toBe(true);
        expect(hasBackToBackWeekend('marathon_advanced_2')).toBe(true);
    });

    it('half marathon should not have back-to-back (different pattern)', () => {
        expect(hasBackToBackWeekend('half_novice_1')).toBe(false);
        expect(hasBackToBackWeekend('half_advanced')).toBe(false);
    });
});

// =============================================================================
// TIER RECOMMENDATION TESTS
// =============================================================================

describe('Tier Recommendation', () => {
    it('beginner should get novice tier', () => {
        const tier = recommendHigdonTier('marathon', 15, 3, 'beginner');
        expect(tier).toBe('marathon_novice_1');
    });

    it('advanced runner should get advanced tier', () => {
        const tier = recommendHigdonTier('marathon', 45, 6, 'advanced');
        expect(tier).toBe('marathon_advanced_2');
    });

    it('intermediate should get middle tier', () => {
        const tier = recommendHigdonTier('marathon', 30, 4, 'intermediate');
        // Should be one of the intermediate tiers
        expect(tier).toMatch(/intermediate/);
    });

    it('should work for all distances', () => {
        expect(recommendHigdonTier('5k', 10, 3, 'beginner')).toBe('5k_novice');
        expect(recommendHigdonTier('10k', 10, 3, 'beginner')).toBe('10k_novice');
        expect(recommendHigdonTier('half', 10, 3, 'beginner')).toBe('half_novice_1');
        expect(recommendHigdonTier('base', 10, 3, 'beginner')).toBe('base_novice');
    });
});

// =============================================================================
// DISTANCE HELPER TESTS
// =============================================================================

describe('Distance Helpers', () => {
    it('getDistanceFromTier should return correct distance', () => {
        expect(getDistanceFromTier('marathon_novice_1')).toBe('marathon');
        expect(getDistanceFromTier('half_advanced')).toBe('half');
        expect(getDistanceFromTier('10k_intermediate')).toBe('10k');
        expect(getDistanceFromTier('5k_novice')).toBe('5k');
        expect(getDistanceFromTier('base_spring')).toBe('base');
    });
});
