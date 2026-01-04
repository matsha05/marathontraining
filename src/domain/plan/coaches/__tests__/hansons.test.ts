/**
 * THE LONG GAME - Hansons Coach Module Tests
 *
 * Tests for Hansons Marathon Method implementation.
 */

import { describe, it, expect } from 'vitest';
import {
    HANSONS_TIER_CONFIGS,
    getHansonsPhase,
    getHansonsSpeedWorkout,
    getHansonsStrengthWorkout,
    getHansonsTuesdayWorkout,
    getHansonsTempoMiles,
    generateHansonsLongRunProgression,
    getHansonsLongRunMiles,
    getHansonsWeeklyMileage,
    generateHansonsWeeklyMileageProgression,
    getHansonsMicrocycle,
    getHansonsTiers,
    recommendHansonsTier,
    validateHansonsPlan,
    formatSpeedWorkout,
    formatStrengthWorkout,
    HansonsTier,
} from '../hansons';

// =============================================================================
// TIER CONFIG TESTS
// =============================================================================

describe('HANSONS_TIER_CONFIGS', () => {
    it('should have 2 tiers', () => {
        expect(Object.keys(HANSONS_TIER_CONFIGS)).toHaveLength(2);
    });

    it('should have beginner and advanced tiers', () => {
        expect(HANSONS_TIER_CONFIGS.hansons_beginner).toBeDefined();
        expect(HANSONS_TIER_CONFIGS.hansons_advanced).toBeDefined();
    });

    it('all tiers should have 18-week duration', () => {
        const tiers = getHansonsTiers();
        tiers.forEach((tier) => {
            expect(HANSONS_TIER_CONFIGS[tier].durationWeeks).toBe(18);
        });
    });

    it('all tiers should have 16-mile long run cap', () => {
        const tiers = getHansonsTiers();
        tiers.forEach((tier) => {
            expect(HANSONS_TIER_CONFIGS[tier].longRunCap).toBe(16);
        });
    });

    it('beginner should peak at 57.5 mpw', () => {
        expect(HANSONS_TIER_CONFIGS.hansons_beginner.peakWeeklyMileage).toBe(57.5);
    });

    it('advanced should peak at 61.5 mpw', () => {
        expect(HANSONS_TIER_CONFIGS.hansons_advanced.peakWeeklyMileage).toBe(61.5);
    });
});

// =============================================================================
// PHASE DETECTION TESTS
// =============================================================================

describe('getHansonsPhase', () => {
    it('beginner week 1 should be base phase', () => {
        expect(getHansonsPhase('hansons_beginner', 1)).toBe('base');
    });

    it('beginner week 6 should be speed phase', () => {
        expect(getHansonsPhase('hansons_beginner', 6)).toBe('speed');
    });

    it('beginner week 11 should be strength phase', () => {
        expect(getHansonsPhase('hansons_beginner', 11)).toBe('strength');
    });

    it('beginner week 18 should be taper phase', () => {
        expect(getHansonsPhase('hansons_beginner', 18)).toBe('taper');
    });

    it('advanced week 2 should be speed phase (earlier start)', () => {
        expect(getHansonsPhase('hansons_advanced', 2)).toBe('speed');
    });

    it('advanced week 1 should be base phase', () => {
        expect(getHansonsPhase('hansons_advanced', 1)).toBe('base');
    });
});

// =============================================================================
// SPEED WORKOUT TESTS
// =============================================================================

describe('Speed Workouts', () => {
    it('beginner week 6 should have 12×400m', () => {
        const workout = getHansonsSpeedWorkout('hansons_beginner', 6);
        expect(workout).not.toBeNull();
        expect(workout?.reps).toBe(12);
        expect(workout?.distance).toBe('400m');
    });

    it('beginner week 10 should have 4×1200m', () => {
        const workout = getHansonsSpeedWorkout('hansons_beginner', 10);
        expect(workout).not.toBeNull();
        expect(workout?.reps).toBe(4);
        expect(workout?.distance).toBe('1200m');
    });

    it('advanced week 7 should have 3×1mi', () => {
        const workout = getHansonsSpeedWorkout('hansons_advanced', 7);
        expect(workout).not.toBeNull();
        expect(workout?.reps).toBe(3);
        expect(workout?.distance).toBe('1 mile');
    });

    it('speed workouts should format correctly', () => {
        const workout = getHansonsSpeedWorkout('hansons_beginner', 6)!;
        const formatted = formatSpeedWorkout(workout);
        expect(formatted).toContain('12×400m');
        expect(formatted).toContain('5K-10K');
    });
});

// =============================================================================
// STRENGTH WORKOUT TESTS
// =============================================================================

describe('Strength Workouts', () => {
    it('beginner week 11 should have 6×1mi', () => {
        const workout = getHansonsStrengthWorkout('hansons_beginner', 11);
        expect(workout).not.toBeNull();
        expect(workout?.reps).toBe(6);
        expect(workout?.distance).toBe('1 mile');
        expect(workout?.pace).toBe('MP-10s');
    });

    it('beginner week 14 should have 2×3mi', () => {
        const workout = getHansonsStrengthWorkout('hansons_beginner', 14);
        expect(workout).not.toBeNull();
        expect(workout?.reps).toBe(2);
        expect(workout?.distanceMiles).toBe(3);
    });

    it('strength workouts should format correctly', () => {
        const workout = getHansonsStrengthWorkout('hansons_beginner', 11)!;
        const formatted = formatStrengthWorkout(workout);
        expect(formatted).toContain('6×1 mile');
        expect(formatted).toContain('MP-10s');
    });
});

// =============================================================================
// TUESDAY WORKOUT TESTS
// =============================================================================

describe('Tuesday SOS Workouts', () => {
    it('speed phase should return speed workout', () => {
        const result = getHansonsTuesdayWorkout('hansons_beginner', 6);
        expect(result?.type).toBe('speed');
    });

    it('strength phase should return strength workout', () => {
        const result = getHansonsTuesdayWorkout('hansons_beginner', 11);
        expect(result?.type).toBe('strength');
    });

    it('base phase should return null', () => {
        const result = getHansonsTuesdayWorkout('hansons_beginner', 1);
        expect(result).toBeNull();
    });
});

// =============================================================================
// TEMPO TESTS
// =============================================================================

describe('Tempo Runs', () => {
    it('beginner week 6 should have 5mi tempo', () => {
        expect(getHansonsTempoMiles('hansons_beginner', 6)).toBe(5);
    });

    it('beginner week 15 should have 10mi tempo (peak)', () => {
        expect(getHansonsTempoMiles('hansons_beginner', 15)).toBe(10);
    });

    it('advanced week 3 should have 6mi tempo', () => {
        expect(getHansonsTempoMiles('hansons_advanced', 3)).toBe(6);
    });
});

// =============================================================================
// LONG RUN TESTS
// =============================================================================

describe('Long Run Progression', () => {
    it('beginner long runs should cap at 16 miles', () => {
        const progression = generateHansonsLongRunProgression('hansons_beginner');
        const maxTrainingLongRun = Math.max(...progression.filter(d => d < 26));
        expect(maxTrainingLongRun).toBe(16);
    });

    it('advanced long runs should cap at 16 miles', () => {
        const progression = generateHansonsLongRunProgression('hansons_advanced');
        const maxTrainingLongRun = Math.max(...progression.filter(d => d < 26));
        expect(maxTrainingLongRun).toBe(16);
    });

    it('beginner week 1 should start at 4 miles', () => {
        expect(getHansonsLongRunMiles('hansons_beginner', 1)).toBe(4);
    });

    it('advanced week 1 should start at 8 miles', () => {
        expect(getHansonsLongRunMiles('hansons_advanced', 1)).toBe(8);
    });

    it('week 18 should be race day (26.2)', () => {
        expect(getHansonsLongRunMiles('hansons_beginner', 18)).toBe(26.2);
        expect(getHansonsLongRunMiles('hansons_advanced', 18)).toBe(26.2);
    });

    it('should have alternating 16/10 pattern in strength phase', () => {
        const progression = generateHansonsLongRunProgression('hansons_beginner');
        // Weeks 11-16 should alternate
        expect(progression[10]).toBe(16); // Week 11
        expect(progression[11]).toBe(10); // Week 12
        expect(progression[12]).toBe(16); // Week 13
        expect(progression[13]).toBe(10); // Week 14
    });
});

// =============================================================================
// WEEKLY MILEAGE TESTS
// =============================================================================

describe('Weekly Mileage', () => {
    it('beginner week 1 should be 12 miles', () => {
        expect(getHansonsWeeklyMileage('hansons_beginner', 1)).toBe(12);
    });

    it('beginner week 15 should be peak at 57.5 miles', () => {
        expect(getHansonsWeeklyMileage('hansons_beginner', 15)).toBe(57.5);
    });

    it('advanced week 1 should be 38 miles', () => {
        expect(getHansonsWeeklyMileage('hansons_advanced', 1)).toBe(38);
    });

    it('advanced week 15 should be peak at 61.5 miles', () => {
        expect(getHansonsWeeklyMileage('hansons_advanced', 15)).toBe(61.5);
    });

    it('mileage progression should have 18 weeks', () => {
        const beginner = generateHansonsWeeklyMileageProgression('hansons_beginner');
        const advanced = generateHansonsWeeklyMileageProgression('hansons_advanced');
        expect(beginner).toHaveLength(18);
        expect(advanced).toHaveLength(18);
    });
});

// =============================================================================
// MICROCYCLE TESTS
// =============================================================================

describe('Microcycles', () => {
    it('should return base microcycle for week 1', () => {
        const microcycle = getHansonsMicrocycle('hansons_beginner', 1);
        expect(microcycle.tue.type).toBe('easy_run');
    });

    it('should return SOS microcycle for speed phase', () => {
        const microcycle = getHansonsMicrocycle('hansons_beginner', 6);
        expect(microcycle.tue.type).toBe('speed_intervals');
        expect(microcycle.thu.type).toBe('tempo');
    });
});

// =============================================================================
// RECOMMENDATION TESTS
// =============================================================================

describe('Tier Recommendation', () => {
    it('should recommend beginner for low mileage', () => {
        expect(recommendHansonsTier(20, 4, 'beginner')).toBe('hansons_beginner');
    });

    it('should recommend advanced for high mileage experienced runner', () => {
        expect(recommendHansonsTier(40, 5, 'advanced')).toBe('hansons_advanced');
    });

    it('should recommend beginner for intermediate with low mileage', () => {
        expect(recommendHansonsTier(25, 4, 'intermediate')).toBe('hansons_beginner');
    });
});

// =============================================================================
// VALIDATION TESTS
// =============================================================================

describe('Plan Validation', () => {
    it('beginner plan should be valid', () => {
        const result = validateHansonsPlan('hansons_beginner');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('advanced plan should be valid', () => {
        const result = validateHansonsPlan('hansons_advanced');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });
});
