/**
 * THE LONG GAME - Pfitzinger Coach Module Tests
 *
 * Tests for Pfitzinger Advanced Marathoning implementation.
 */

import { describe, it, expect } from 'vitest';
import {
    PFITZ_TIER_CONFIGS,
    getPfitzPhase,
    getPfitzLTWorkout,
    getPfitzVO2maxWorkout,
    getPfitzMLRDistance,
    isPfitzTuneUpRaceWeek,
    getPfitzLongRun,
    generatePfitzLongRunProgression,
    hasMPSegment,
    getMPSegmentDistance,
    getPfitzWeeklyMileage,
    generatePfitzWeeklyMileageProgression,
    getPfitzMicrocycle,
    getPfitzTiers,
    recommendPfitzTier,
    validatePfitzPlan,
    formatLTWorkout,
    formatVO2maxWorkout,
    getPfitzTierDisplayName,
    PfitzTier,
} from '../pfitzinger';

// =============================================================================
// TIER CONFIG TESTS
// =============================================================================

describe('PFITZ_TIER_CONFIGS', () => {
    it('should have 4 tiers', () => {
        expect(Object.keys(PFITZ_TIER_CONFIGS)).toHaveLength(4);
    });

    it('should have all expected tiers', () => {
        expect(PFITZ_TIER_CONFIGS.pfitz_12_55).toBeDefined();
        expect(PFITZ_TIER_CONFIGS.pfitz_18_55).toBeDefined();
        expect(PFITZ_TIER_CONFIGS.pfitz_18_70).toBeDefined();
        expect(PFITZ_TIER_CONFIGS.pfitz_18_85).toBeDefined();
    });

    it('18/55 should peak at 55 mpw', () => {
        expect(PFITZ_TIER_CONFIGS.pfitz_18_55.peakMileage).toBe(55);
    });

    it('18/70 should peak at 71 mpw', () => {
        expect(PFITZ_TIER_CONFIGS.pfitz_18_70.peakMileage).toBe(71);
    });

    it('18/85 should peak at 85 mpw', () => {
        expect(PFITZ_TIER_CONFIGS.pfitz_18_85.peakMileage).toBe(85);
    });

    it('18/70 should have 22-mile max long run', () => {
        expect(PFITZ_TIER_CONFIGS.pfitz_18_70.maxLongRun).toBe(22);
    });
});

// =============================================================================
// PHASE DETECTION TESTS
// =============================================================================

describe('getPfitzPhase', () => {
    it('18/70 week 1 should be endurance phase', () => {
        expect(getPfitzPhase('pfitz_18_70', 1)).toBe('endurance');
    });

    it('18/70 week 7 should be lactate threshold phase', () => {
        expect(getPfitzPhase('pfitz_18_70', 7)).toBe('lactate_threshold');
    });

    it('18/70 week 13 should be race prep phase', () => {
        expect(getPfitzPhase('pfitz_18_70', 13)).toBe('race_prep');
    });

    it('18/70 week 18 should be taper phase', () => {
        expect(getPfitzPhase('pfitz_18_70', 18)).toBe('taper');
    });

    it('18/55 week 18 should be endurance phase (counts down)', () => {
        expect(getPfitzPhase('pfitz_18_55', 18)).toBe('endurance');
    });
});

// =============================================================================
// LT WORKOUT TESTS
// =============================================================================

describe('LT Workouts', () => {
    it('18/70 week 1 should have 22min LT', () => {
        const workout = getPfitzLTWorkout('pfitz_18_70', 1);
        expect(workout).not.toBeNull();
        expect(workout?.ltDurationMinutes).toBe(22);
    });

    it('18/70 week 11 should have 42min LT (peak)', () => {
        const workout = getPfitzLTWorkout('pfitz_18_70', 11);
        expect(workout).not.toBeNull();
        expect(workout?.ltDurationMinutes).toBe(42);
    });

    it('18/55 week 8 should have 40min LT', () => {
        const workout = getPfitzLTWorkout('pfitz_18_55', 8);
        expect(workout).not.toBeNull();
        expect(workout?.ltDurationMinutes).toBe(40);
    });

    it('LT workouts should format correctly', () => {
        const workout = getPfitzLTWorkout('pfitz_18_70', 1)!;
        const formatted = formatLTWorkout(workout);
        expect(formatted).toContain('22min');
        expect(formatted).toContain('15K-HM');
    });
});

// =============================================================================
// VO2MAX WORKOUT TESTS
// =============================================================================

describe('VO2max Workouts', () => {
    it('18/70 week 10 should have 7×600m', () => {
        const workout = getPfitzVO2maxWorkout('pfitz_18_70', 10);
        expect(workout).not.toBeNull();
        expect(workout?.reps).toBe(7);
        expect(workout?.distance).toBe('600m');
    });

    it('18/70 week 13 should have 6×1km', () => {
        const workout = getPfitzVO2maxWorkout('pfitz_18_70', 13);
        expect(workout).not.toBeNull();
        expect(workout?.reps).toBe(6);
        expect(workout?.distance).toBe('1km');
    });

    it('18/55 week 2 should have 3×1600m', () => {
        const workout = getPfitzVO2maxWorkout('pfitz_18_55', 2);
        expect(workout).not.toBeNull();
        expect(workout?.reps).toBe(3);
        expect(workout?.distance).toBe('1600m');
    });

    it('VO2max workouts should format correctly', () => {
        const workout = getPfitzVO2maxWorkout('pfitz_18_70', 10)!;
        const formatted = formatVO2maxWorkout(workout);
        expect(formatted).toContain('7×600m');
        expect(formatted).toContain('5K');
    });
});

// =============================================================================
// MLR TESTS
// =============================================================================

describe('Medium-Long Runs', () => {
    it('18/70 week 7 should have 15mi MLR', () => {
        expect(getPfitzMLRDistance('pfitz_18_70', 7)).toBe(15);
    });

    it('18/55 week 12 should have 11mi MLR', () => {
        expect(getPfitzMLRDistance('pfitz_18_55', 12)).toBe(11);
    });

    it('should return null for weeks without MLR', () => {
        expect(getPfitzMLRDistance('pfitz_18_70', 10)).toBeNull();
    });
});

// =============================================================================
// TUNE-UP RACE TESTS
// =============================================================================

describe('Tune-Up Races', () => {
    it('18/70 should have tune-ups at weeks 12, 14, 16', () => {
        expect(isPfitzTuneUpRaceWeek('pfitz_18_70', 12)).toBe(true);
        expect(isPfitzTuneUpRaceWeek('pfitz_18_70', 14)).toBe(true);
        expect(isPfitzTuneUpRaceWeek('pfitz_18_70', 16)).toBe(true);
    });

    it('18/55 should have tune-ups at weeks 5, 3', () => {
        expect(isPfitzTuneUpRaceWeek('pfitz_18_55', 5)).toBe(true);
        expect(isPfitzTuneUpRaceWeek('pfitz_18_55', 3)).toBe(true);
    });

    it('18/70 week 11 should not be a tune-up', () => {
        expect(isPfitzTuneUpRaceWeek('pfitz_18_70', 11)).toBe(false);
    });
});

// =============================================================================
// LONG RUN TESTS
// =============================================================================

describe('Long Run Progression', () => {
    it('18/70 week 11 should be 22 miles (peak)', () => {
        const longRun = getPfitzLongRun('pfitz_18_70', 11);
        expect(longRun?.distance).toBe(22);
    });

    it('18/70 week 2 should have 8mi MP segment', () => {
        const longRun = getPfitzLongRun('pfitz_18_70', 2);
        expect(longRun?.distance).toBe(16);
        expect(longRun?.mpSegment).toBe(8);
    });

    it('18/70 week 13 should have 14mi MP segment (dress rehearsal)', () => {
        const longRun = getPfitzLongRun('pfitz_18_70', 13);
        expect(longRun?.mpSegment).toBe(14);
    });

    it('progression should have correct length', () => {
        const progression = generatePfitzLongRunProgression('pfitz_18_70');
        expect(progression).toHaveLength(18);
    });
});

// =============================================================================
// MP SEGMENT TESTS
// =============================================================================

describe('Marathon Pace Segments', () => {
    it('18/70 should have MP segments at weeks 2, 5, 9, 13', () => {
        expect(hasMPSegment('pfitz_18_70', 2)).toBe(true);
        expect(hasMPSegment('pfitz_18_70', 5)).toBe(true);
        expect(hasMPSegment('pfitz_18_70', 9)).toBe(true);
        expect(hasMPSegment('pfitz_18_70', 13)).toBe(true);
    });

    it('18/70 MP segments should progress 8→10→12→14', () => {
        expect(getMPSegmentDistance('pfitz_18_70', 2)).toBe(8);
        expect(getMPSegmentDistance('pfitz_18_70', 5)).toBe(10);
        expect(getMPSegmentDistance('pfitz_18_70', 9)).toBe(12);
        expect(getMPSegmentDistance('pfitz_18_70', 13)).toBe(14);
    });

    it('18/55 should have MP segments at weeks 17, 14, 10, 6', () => {
        expect(hasMPSegment('pfitz_18_55', 17)).toBe(true);
        expect(hasMPSegment('pfitz_18_55', 14)).toBe(true);
        expect(hasMPSegment('pfitz_18_55', 10)).toBe(true);
        expect(hasMPSegment('pfitz_18_55', 6)).toBe(true);
    });
});

// =============================================================================
// WEEKLY MILEAGE TESTS
// =============================================================================

describe('Weekly Mileage', () => {
    it('18/70 week 1 should be ~52 miles', () => {
        expect(getPfitzWeeklyMileage('pfitz_18_70', 1)).toBe(52);
    });

    it('18/70 peak weeks should be ~67 miles', () => {
        expect(getPfitzWeeklyMileage('pfitz_18_70', 7)).toBe(67);
        expect(getPfitzWeeklyMileage('pfitz_18_70', 11)).toBe(67);
    });

    it('18/55 week 11 should be 55 miles (peak)', () => {
        expect(getPfitzWeeklyMileage('pfitz_18_55', 11)).toBe(55);
    });

    it('mileage progression should have correct length', () => {
        const prog18_70 = generatePfitzWeeklyMileageProgression('pfitz_18_70');
        const prog18_55 = generatePfitzWeeklyMileageProgression('pfitz_18_55');
        const prog12_55 = generatePfitzWeeklyMileageProgression('pfitz_12_55');
        expect(prog18_70).toHaveLength(18);
        expect(prog18_55).toHaveLength(18);
        expect(prog12_55).toHaveLength(12);
    });
});

// =============================================================================
// MICROCYCLE TESTS
// =============================================================================

describe('Microcycles', () => {
    it('endurance phase should have LT on Friday', () => {
        const microcycle = getPfitzMicrocycle('pfitz_18_70', 1);
        expect(microcycle.fri.type).toBe('lactate_threshold');
    });

    it('race prep phase should have VO2max on Tuesday', () => {
        const microcycle = getPfitzMicrocycle('pfitz_18_70', 13);
        expect(microcycle.tue.type).toBe('vo2max');
    });

    it('should have medium-long on Wednesday', () => {
        const microcycle = getPfitzMicrocycle('pfitz_18_70', 7);
        expect(microcycle.wed.type).toBe('medium_long');
    });
});

// =============================================================================
// RECOMMENDATION TESTS
// =============================================================================

describe('Tier Recommendation', () => {
    it('should recommend 12/55 for short timeframe', () => {
        expect(recommendPfitzTier(40, 5, 'intermediate', 12)).toBe('pfitz_12_55');
    });

    it('should recommend 18/85 for high-mileage advanced runner', () => {
        expect(recommendPfitzTier(65, 6, 'advanced', 18)).toBe('pfitz_18_85');
    });

    it('should recommend 18/70 for 45+ mpw intermediate', () => {
        expect(recommendPfitzTier(50, 5, 'intermediate', 18)).toBe('pfitz_18_70');
    });

    it('should recommend 18/55 for lower-mileage runner', () => {
        expect(recommendPfitzTier(30, 4, 'beginner', 18)).toBe('pfitz_18_55');
    });
});

// =============================================================================
// VALIDATION TESTS
// =============================================================================

describe('Plan Validation', () => {
    it('18/55 plan should be valid', () => {
        const result = validatePfitzPlan('pfitz_18_55');
        expect(result.valid).toBe(true);
    });

    it('18/70 plan should be valid', () => {
        const result = validatePfitzPlan('pfitz_18_70');
        expect(result.valid).toBe(true);
    });

    it('18/85 plan should be valid', () => {
        const result = validatePfitzPlan('pfitz_18_85');
        expect(result.valid).toBe(true);
    });
});

// =============================================================================
// DISPLAY HELPERS TESTS
// =============================================================================

describe('Display Helpers', () => {
    it('should return correct display names', () => {
        expect(getPfitzTierDisplayName('pfitz_12_55')).toBe('Pfitzinger 12/55');
        expect(getPfitzTierDisplayName('pfitz_18_55')).toBe('Pfitzinger 18/55');
        expect(getPfitzTierDisplayName('pfitz_18_70')).toBe('Pfitzinger 18/70');
        expect(getPfitzTierDisplayName('pfitz_18_85')).toBe('Pfitzinger 18/85');
    });

    it('getPfitzTiers should return all tiers', () => {
        const tiers = getPfitzTiers();
        expect(tiers).toHaveLength(4);
        expect(tiers).toContain('pfitz_12_55');
        expect(tiers).toContain('pfitz_18_55');
        expect(tiers).toContain('pfitz_18_70');
        expect(tiers).toContain('pfitz_18_85');
    });
});
