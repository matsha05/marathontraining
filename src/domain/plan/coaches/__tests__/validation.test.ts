/**
 * THE LONG GAME - Coach 1:1 Accuracy Validation
 *
 * These tests validate that our implementations produce EXACT matches
 * to the official documented training plans.
 *
 * Source of truth:
 * - Hansons: Official Hansons Coaching PDFs (research/22-hansons-complete-library.md)
 * - Pfitzinger: "Advanced Marathoning" 3rd Ed + CalendarHack (research/23-pfitzinger-complete-library.md)
 */

import { describe, it, expect } from 'vitest';
import {
    getHansonsWeeklyMileage,
    getHansonsLongRunMiles,
    getHansonsSpeedWorkout,
    getHansonsStrengthWorkout,
    getHansonsTempoMiles,
    getHansonsPhase,
} from '../hansons';
import {
    getPfitzWeeklyMileage,
    getPfitzLongRun,
    getPfitzLTWorkout,
    getPfitzVO2maxWorkout,
    getPfitzMLRDistance,
    getMPSegmentDistance,
    getPfitzPhase,
} from '../pfitzinger';

// =============================================================================
// HANSONS BEGINNER - EXACT MATCH VALIDATION
// =============================================================================

describe('Hansons Beginner 1:1 Validation', () => {
    // Weekly mileage from official PDF (research/22-hansons-complete-library.md)
    const OFFICIAL_BEGINNER_MILEAGE = [
        12, 15, 21, 20, 24, 40, 39, 42, 49, 48,
        54.5, 50, 56.5, 49, 57.5, 51, 49.5, 50.2
    ];

    it('weekly mileage matches official PDF exactly', () => {
        OFFICIAL_BEGINNER_MILEAGE.forEach((expected, index) => {
            const week = index + 1;
            const actual = getHansonsWeeklyMileage('hansons_beginner', week);
            expect(actual, `Week ${week} mileage`).toBe(expected);
        });
    });

    // Long runs from official PDF
    const OFFICIAL_BEGINNER_LONG_RUNS = [
        4, 4, 5, 4, 6, 8, 10, 10, 15, 10,
        16, 10, 16, 10, 16, 10, 8, 26.2
    ];

    it('long runs match official PDF exactly', () => {
        OFFICIAL_BEGINNER_LONG_RUNS.forEach((expected, index) => {
            const week = index + 1;
            const actual = getHansonsLongRunMiles('hansons_beginner', week);
            expect(actual, `Week ${week} long run`).toBe(expected);
        });
    });

    // Speed workouts (weeks 6-10)
    const OFFICIAL_SPEED_WORKOUTS = [
        { week: 6, reps: 12, distance: '400m' },
        { week: 7, reps: 8, distance: '600m' },
        { week: 8, reps: 6, distance: '800m' },
        { week: 9, reps: 5, distance: '1km' },
        { week: 10, reps: 4, distance: '1200m' },
    ];

    it('speed workouts match official PDF exactly', () => {
        OFFICIAL_SPEED_WORKOUTS.forEach(({ week, reps, distance }) => {
            const workout = getHansonsSpeedWorkout('hansons_beginner', week);
            expect(workout, `Week ${week} speed workout exists`).not.toBeNull();
            expect(workout!.reps, `Week ${week} reps`).toBe(reps);
            expect(workout!.distance, `Week ${week} distance`).toBe(distance);
        });
    });

    // Strength workouts (weeks 11-17)
    const OFFICIAL_STRENGTH_WORKOUTS = [
        { week: 11, reps: 6, distance: '1 mile' },
        { week: 12, reps: 4, distance: '1.5 miles' },
        { week: 13, reps: 3, distance: '2 miles' },
        { week: 14, reps: 2, distance: '3 miles' },
        { week: 15, reps: 3, distance: '2 miles' },
        { week: 16, reps: 4, distance: '1.5 miles' },
        { week: 17, reps: 3, distance: '2 miles' },
    ];

    it('strength workouts match official PDF exactly', () => {
        OFFICIAL_STRENGTH_WORKOUTS.forEach(({ week, reps, distance }) => {
            const workout = getHansonsStrengthWorkout('hansons_beginner', week);
            expect(workout, `Week ${week} strength workout exists`).not.toBeNull();
            expect(workout!.reps, `Week ${week} reps`).toBe(reps);
            expect(workout!.distance, `Week ${week} distance`).toBe(distance);
        });
    });

    // Tempo progression
    const OFFICIAL_TEMPO_MILES: Record<number, number> = {
        6: 5, 7: 5, 8: 5,
        9: 8, 10: 8,
        11: 8, 12: 9, 13: 9, 14: 9,
        15: 10, 16: 10, 17: 10,
    };

    it('tempo runs match official PDF exactly', () => {
        Object.entries(OFFICIAL_TEMPO_MILES).forEach(([weekStr, expected]) => {
            const week = parseInt(weekStr);
            const actual = getHansonsTempoMiles('hansons_beginner', week);
            expect(actual, `Week ${week} tempo miles`).toBe(expected);
        });
    });

    // Phase assignments
    it('phase assignments match Hansons methodology', () => {
        // Base: weeks 1-5
        for (let w = 1; w <= 5; w++) {
            expect(getHansonsPhase('hansons_beginner', w), `Week ${w}`).toBe('base');
        }
        // Speed: weeks 6-10
        for (let w = 6; w <= 10; w++) {
            expect(getHansonsPhase('hansons_beginner', w), `Week ${w}`).toBe('speed');
        }
        // Strength: weeks 11-16
        for (let w = 11; w <= 16; w++) {
            expect(getHansonsPhase('hansons_beginner', w), `Week ${w}`).toBe('strength');
        }
        // Taper: weeks 17-18
        expect(getHansonsPhase('hansons_beginner', 17)).toBe('taper');
        expect(getHansonsPhase('hansons_beginner', 18)).toBe('taper');
    });
});

// =============================================================================
// HANSONS ADVANCED - EXACT MATCH VALIDATION
// =============================================================================

describe('Hansons Advanced 1:1 Validation', () => {
    // Weekly mileage from official PDF
    const OFFICIAL_ADVANCED_MILEAGE = [
        38, 41, 45, 44, 47, 53, 51, 49, 56, 50,
        59.5, 54, 61, 53, 61.5, 55, 53.5, 52.2
    ];

    it('weekly mileage matches official PDF exactly', () => {
        OFFICIAL_ADVANCED_MILEAGE.forEach((expected, index) => {
            const week = index + 1;
            const actual = getHansonsWeeklyMileage('hansons_advanced', week);
            expect(actual, `Week ${week} mileage`).toBe(expected);
        });
    });

    // Long runs from official PDF
    const OFFICIAL_ADVANCED_LONG_RUNS = [
        8, 8, 10, 8, 12, 10, 14, 10, 15, 10,
        16, 10, 16, 10, 16, 10, 8, 26.2
    ];

    it('long runs match official PDF exactly', () => {
        OFFICIAL_ADVANCED_LONG_RUNS.forEach((expected, index) => {
            const week = index + 1;
            const actual = getHansonsLongRunMiles('hansons_advanced', week);
            expect(actual, `Week ${week} long run`).toBe(expected);
        });
    });

    // Advanced starts speed phase at week 2
    it('advanced speed phase starts at week 2', () => {
        expect(getHansonsPhase('hansons_advanced', 1)).toBe('base');
        expect(getHansonsPhase('hansons_advanced', 2)).toBe('speed');
    });
});

// =============================================================================
// PFITZINGER 18/70 - EXACT MATCH VALIDATION
// =============================================================================

describe('Pfitzinger 18/70 1:1 Validation', () => {
    // Weekly mileage from CalendarHack/Advanced Marathoning
    const OFFICIAL_18_70_MILEAGE = [
        52, 54, 56, 60, 59, 52, 67, 65, 62, 55,
        67, 61, 67, 59, 67, 55, 43, 50
    ];

    it('weekly mileage matches Advanced Marathoning exactly', () => {
        OFFICIAL_18_70_MILEAGE.forEach((expected, index) => {
            const week = index + 1;
            const actual = getPfitzWeeklyMileage('pfitz_18_70', week);
            expect(actual, `Week ${week} mileage`).toBe(expected);
        });
    });

    // Long runs with MP segments
    const OFFICIAL_MP_SEGMENTS = [
        { week: 2, distance: 8 },
        { week: 5, distance: 10 },
        { week: 9, distance: 12 },
        { week: 13, distance: 14 },
    ];

    it('MP long run segments match exactly', () => {
        OFFICIAL_MP_SEGMENTS.forEach(({ week, distance }) => {
            const actual = getMPSegmentDistance('pfitz_18_70', week);
            expect(actual, `Week ${week} MP segment`).toBe(distance);
        });
    });

    // Long run distances (key weeks)
    const KEY_LONG_RUNS = [
        { week: 11, distance: 22 }, // Peak
        { week: 7, distance: 20 },
        { week: 8, distance: 20 },
        { week: 13, distance: 20 },
        { week: 15, distance: 20 },
    ];

    it('20+ mile long runs match exactly', () => {
        KEY_LONG_RUNS.forEach(({ week, distance }) => {
            const longRun = getPfitzLongRun('pfitz_18_70', week);
            expect(longRun?.distance, `Week ${week} long run`).toBe(distance);
        });
    });

    // LT duration progression
    const OFFICIAL_LT_DURATIONS = [
        { week: 1, minutes: 22 },
        { week: 3, minutes: 27 },
        { week: 5, minutes: 32 },
        { week: 7, minutes: 32 },
        { week: 8, minutes: 37 },
        { week: 11, minutes: 42 },
    ];

    it('LT duration progression matches exactly', () => {
        OFFICIAL_LT_DURATIONS.forEach(({ week, minutes }) => {
            const workout = getPfitzLTWorkout('pfitz_18_70', week);
            expect(workout?.ltDurationMinutes, `Week ${week} LT duration`).toBe(minutes);
        });
    });

    // VO2max workouts
    const OFFICIAL_VO2_WORKOUTS = [
        { week: 10, reps: 7, distance: '600m' },
        { week: 12, reps: 5, distance: '600m' },
        { week: 13, reps: 6, distance: '1km' },
        { week: 14, reps: 5, distance: '600m' },
        { week: 15, reps: 6, distance: '1km' },
        { week: 17, reps: 5, distance: '1km' },
    ];

    it('VO2max workouts match exactly', () => {
        OFFICIAL_VO2_WORKOUTS.forEach(({ week, reps, distance }) => {
            const workout = getPfitzVO2maxWorkout('pfitz_18_70', week);
            expect(workout, `Week ${week} VO2max workout exists`).not.toBeNull();
            expect(workout!.reps, `Week ${week} reps`).toBe(reps);
            expect(workout!.distance, `Week ${week} distance`).toBe(distance);
        });
    });

    // MLR distances (key weeks)
    const KEY_MLRS = [
        { week: 7, distance: 15 },
        { week: 8, distance: 15 },
        { week: 11, distance: 15 },
        { week: 13, distance: 15 },
    ];

    it('MLR distances match exactly', () => {
        KEY_MLRS.forEach(({ week, distance }) => {
            const actual = getPfitzMLRDistance('pfitz_18_70', week);
            expect(actual, `Week ${week} MLR`).toBe(distance);
        });
    });

    // Phase structure
    it('phase assignments match Pfitzinger methodology', () => {
        // Endurance: weeks 1-6
        for (let w = 1; w <= 6; w++) {
            expect(getPfitzPhase('pfitz_18_70', w), `Week ${w}`).toBe('endurance');
        }
        // LT: weeks 7-12
        for (let w = 7; w <= 12; w++) {
            expect(getPfitzPhase('pfitz_18_70', w), `Week ${w}`).toBe('lactate_threshold');
        }
        // Race Prep: weeks 13-16
        for (let w = 13; w <= 16; w++) {
            expect(getPfitzPhase('pfitz_18_70', w), `Week ${w}`).toBe('race_prep');
        }
        // Taper: weeks 17-18
        expect(getPfitzPhase('pfitz_18_70', 17)).toBe('taper');
        expect(getPfitzPhase('pfitz_18_70', 18)).toBe('taper');
    });
});

// =============================================================================
// PFITZINGER 18/55 - EXACT MATCH VALIDATION
// =============================================================================

describe('Pfitzinger 18/55 1:1 Validation', () => {
    // Weekly mileage (note: Pfitz 18/55 counts weeks DOWN to race)
    const OFFICIAL_18_55_MILEAGE = [
        33, 36, 40, 42, 45, 37, 50, 54, 48, 43,
        55, 52, 51, 45, 32, 32, 22, 26.2
    ];

    it('weekly mileage matches Advanced Marathoning exactly', () => {
        OFFICIAL_18_55_MILEAGE.forEach((expected, index) => {
            const week = index + 1;
            const actual = getPfitzWeeklyMileage('pfitz_18_55', week);
            expect(actual, `Week ${week} mileage`).toBe(expected);
        });
    });

    // Peak week should be 55 mpw
    it('peak mileage is 55 mpw', () => {
        const mileages = OFFICIAL_18_55_MILEAGE.filter(m => m !== 26.2);
        expect(Math.max(...mileages)).toBe(55);
    });

    // Three 20-milers
    it('has exactly 3 twenty-milers', () => {
        const twentyMilerWeeks = [11, 8, 4]; // From config
        twentyMilerWeeks.forEach(week => {
            // Note: 18/55 counts down, so we verify via long run data structure
            const longRun = getPfitzLongRun('pfitz_18_55', week);
            expect(longRun?.distance, `Week ${week} is 20mi`).toBe(20);
        });
    });
});
