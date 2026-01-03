/**
 * Training Plan domain types
 */

import type { PlannedWorkout, SessionType } from './session';

// Training phases
export type TrainingPhase =
    | 'BASE_1'
    | 'BASE_2'
    | 'BUILD'
    | 'PEAK'
    | 'TAPER'
    | 'RECOVERY';

// Plan types
export type PlanType = 'build' | 'peak' | 'taper' | 'recovery';

// Training plan
export interface TrainingPlan {
    id: string;
    athleteId: string;
    goalRaceId?: string;
    startDate: Date;
    endDate: Date;
    planType: PlanType;
    vdotAtCreation: number;
    isActive: boolean;
    createdAt: Date;
}

// Daily plan (what the athlete sees for "today")
export interface DailyPlan {
    date: Date;
    weekNumber: number;
    dayOfWeek: number;
    phase: TrainingPhase;
    workouts: PlannedWorkout[];
    readinessScore?: number;  // 0-100
    notes?: string;
}

// Weekly summary
export interface WeekSummary {
    weekNumber: number;
    startDate: Date;
    endDate: Date;
    phase: TrainingPhase;
    plannedMileage: number;
    completedMileage: number;
    qualitySessions: number;
    strengthSessions: number;
    workouts: PlannedWorkout[];
}

// Hansons weekly structure
export interface DayTemplate {
    dayOfWeek: number;  // 0-6
    primarySession: SessionType;
    isSOSDay: boolean;  // Something Of Substance (quality day)
    defaultDescription: string;
}

export interface WeekTemplate {
    phase: TrainingPhase;
    days: DayTemplate[];
    totalMileagePercent: number;  // Percent of peak mileage
    qualitySessionCount: number;
    strengthSessionCount: number;
}

// Intensity distribution targets
export interface IntensityDistribution {
    zone1Percent: number;  // Easy (polarized model)
    zone2Percent: number;  // Moderate (minimize this)
    zone3Percent: number;  // Hard
}

// Progress tracking
export interface ProgressMetrics {
    currentVdot: number;
    currentWeeklyMileage: number;
    peakWeeklyMileage: number;
    weeklyMileageProgress: number;  // current/peak percentage
    qualitySessionsCompleted: number;
    qualitySessionsPlanned: number;
    strengthSessionsCompleted: number;
    strengthSessionsPlanned: number;
    currentPhase: TrainingPhase;
    weeksUntilRace: number;
    polarizedRatio: IntensityDistribution;
}
