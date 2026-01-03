import { describe, it, expect } from 'vitest';
import { matchGarminActivityToPlannedWorkouts } from './workout-matcher';
import { calculatePaceZones } from '@/domain/vdot';
import type { PlannedWorkout } from '@/domain/types/session';

const plannedWorkout: PlannedWorkout = {
    id: 'workout-1',
    planId: 'plan-1',
    athleteId: 'athlete-1',
    scheduledDate: new Date('2024-04-10T06:00:00Z'),
    dayOfWeek: 3,
    sessionType: 'tempo',
    prescription: {
        run: {
            type: 'tempo',
            totalDistanceMiles: 6,
            estimatedDurationMin: 48,
            mainSet: [
                { distanceMiles: 4, paceZone: 'T' }
            ],
        },
    },
    status: 'scheduled',
    createdAt: new Date('2024-04-01T00:00:00Z'),
};

describe('matchGarminActivityToPlannedWorkouts', () => {
    it('matches a tempo run within tolerance', () => {
        const activity = {
            startTime: '2024-04-10T06:30:00Z',
            distanceMeters: 5.8 * 1609.344,
            avgPaceSecPerMile: 439, // 7:19
            activityType: 'running',
        };

        const result = matchGarminActivityToPlannedWorkouts(
            activity,
            [plannedWorkout],
            calculatePaceZones(48)
        );

        expect(result.matched).toBe(true);
        expect(result.plannedWorkoutId).toBe('workout-1');
        expect(result.matchScore).toBeGreaterThan(0.6);
    });
});
