/**
 * Intensity Distribution Tests
 * 
 * Tests Seiler/Fitzgerald 80/20 polarization analysis
 */

import { describe, it, expect } from 'vitest';
import {
    classifySessionType,
    calculateIntensityDistribution,
    evaluatePolarization,
    WorkoutForIntensity,
} from '../intensity-distribution';

describe('classifySessionType', () => {
    it('classifies easy session types to zone 1', () => {
        expect(classifySessionType('easy')).toBe('easy');
        expect(classifySessionType('recovery')).toBe('easy');
        expect(classifySessionType('base')).toBe('easy');
        expect(classifySessionType('long_run')).toBe('easy');
    });

    it('classifies moderate session types to zone 2', () => {
        expect(classifySessionType('marathon_pace')).toBe('moderate');
        expect(classifySessionType('steady_state')).toBe('moderate');
        expect(classifySessionType('aerobic')).toBe('moderate');
    });

    it('classifies hard session types to zone 3', () => {
        expect(classifySessionType('tempo')).toBe('hard');
        expect(classifySessionType('intervals')).toBe('hard');
        expect(classifySessionType('threshold')).toBe('hard');
        expect(classifySessionType('repetition')).toBe('hard');
    });

    it('defaults unknown types to easy (conservative)', () => {
        expect(classifySessionType('unknown_type')).toBe('easy');
        expect(classifySessionType('random')).toBe('easy');
    });

    it('handles case insensitivity', () => {
        expect(classifySessionType('EASY')).toBe('easy');
        expect(classifySessionType('Tempo')).toBe('hard');
        expect(classifySessionType('INTERVALS')).toBe('hard');
    });
});

describe('evaluatePolarization', () => {
    it('returns excellent for strict 80/20 distribution', () => {
        const result = evaluatePolarization(80, 5, 15);
        expect(result.verdict).toBe('excellent');
        expect(result.isPolarized).toBe(true);
    });

    it('returns good for relaxed polarization', () => {
        const result = evaluatePolarization(72, 10, 18);
        expect(result.verdict).toBe('good');
        expect(result.isPolarized).toBe(true);
    });

    it('returns needs_attention when too much moderate', () => {
        const result = evaluatePolarization(60, 25, 15);
        expect(result.verdict).toBe('needs_attention');
        expect(result.isPolarized).toBe(false);
    });

    it('returns needs_attention when too little easy', () => {
        const result = evaluatePolarization(50, 10, 40);
        expect(result.verdict).toBe('needs_attention');
        expect(result.isPolarized).toBe(false);
    });

    it('returns needs_attention when too much hard', () => {
        const result = evaluatePolarization(65, 5, 30);
        expect(result.verdict).toBe('needs_attention');
        expect(result.isPolarized).toBe(false);
    });
});

describe('calculateIntensityDistribution', () => {
    const baseDate = new Date('2024-01-15');

    const createWorkout = (
        sessionType: string,
        durationMinutes: number,
        completed: 'full' | 'partial' | 'skipped' = 'full'
    ): WorkoutForIntensity => ({
        sessionType,
        durationMinutes,
        completed,
        date: baseDate,
    });

    it('returns null for empty workouts array', () => {
        const result = calculateIntensityDistribution([]);
        expect(result).toBeNull();
    });

    it('returns null for only skipped workouts', () => {
        const workouts = [
            createWorkout('easy', 30, 'skipped'),
            createWorkout('tempo', 40, 'skipped'),
        ];
        const result = calculateIntensityDistribution(workouts);
        expect(result).toBeNull();
    });

    it('calculates correct percentages for all-easy week', () => {
        const workouts = [
            createWorkout('easy', 30),
            createWorkout('easy', 45),
            createWorkout('recovery', 25),
        ];

        const result = calculateIntensityDistribution(workouts);

        expect(result).not.toBeNull();
        expect(result!.easyPercentage).toBe(100);
        expect(result!.moderatePercentage).toBe(0);
        expect(result!.hardPercentage).toBe(0);
        expect(result!.totalMinutes).toBe(100);
    });

    it('calculates correct percentages for mixed week', () => {
        const workouts = [
            createWorkout('easy', 40),    // 40 easy
            createWorkout('easy', 30),    // 30 easy = 70 total easy
            createWorkout('marathon_pace', 10), // 10 moderate
            createWorkout('intervals', 20),     // 20 hard
        ];
        // Total: 100 min (70 easy, 10 moderate, 20 hard)

        const result = calculateIntensityDistribution(workouts);

        expect(result).not.toBeNull();
        expect(result!.easyPercentage).toBe(70);
        expect(result!.moderatePercentage).toBe(10);
        expect(result!.hardPercentage).toBe(20);
        expect(result!.totalMinutes).toBe(100);
    });

    it('excludes skipped workouts from calculation', () => {
        const workouts = [
            createWorkout('easy', 60),
            createWorkout('intervals', 20, 'skipped'), // should be excluded
            createWorkout('tempo', 20),
        ];

        const result = calculateIntensityDistribution(workouts);

        expect(result).not.toBeNull();
        expect(result!.totalMinutes).toBe(80); // 60 + 20, excluding skipped
        expect(result!.easyPercentage).toBe(75); // 60/80
        expect(result!.hardPercentage).toBe(25); // 20/80
    });

    it('includes partial workouts in calculation', () => {
        const workouts = [
            createWorkout('easy', 40, 'partial'),
            createWorkout('tempo', 10),
        ];

        const result = calculateIntensityDistribution(workouts);

        expect(result).not.toBeNull();
        expect(result!.totalMinutes).toBe(50);
    });

    it('returns excellent verdict for polarized week', () => {
        const workouts = [
            createWorkout('easy', 80),
            createWorkout('intervals', 15),
            createWorkout('marathon_pace', 5),
        ];

        const result = calculateIntensityDistribution(workouts);

        expect(result).not.toBeNull();
        expect(result!.verdict).toBe('excellent');
        expect(result!.isPolarized).toBe(true);
    });

    it('returns needs_attention verdict for gray zone heavy week', () => {
        const workouts = [
            createWorkout('easy', 40),
            createWorkout('marathon_pace', 40),
            createWorkout('tempo', 20),
        ];

        const result = calculateIntensityDistribution(workouts);

        expect(result).not.toBeNull();
        expect(result!.verdict).toBe('needs_attention');
        expect(result!.isPolarized).toBe(false);
    });

    it('includes coach-rooted message for each verdict', () => {
        const polarizedWorkouts = [
            createWorkout('easy', 80),
            createWorkout('intervals', 20),
        ];

        const result = calculateIntensityDistribution(polarizedWorkouts);

        expect(result).not.toBeNull();
        expect(result!.message).toContain('polarization');
        expect(result!.subtext).toContain('Seiler');
    });

    it('returns zone objects with correct colors', () => {
        const workouts = [createWorkout('easy', 60), createWorkout('tempo', 40)];
        const result = calculateIntensityDistribution(workouts);

        expect(result).not.toBeNull();
        expect(result!.zones).toHaveLength(3);
        expect(result!.zones[0].color).toBe('var(--color-accent)');
        expect(result!.zones[1].color).toBe('var(--color-warning)');
        expect(result!.zones[2].color).toBe('var(--color-durability)');
    });
});
