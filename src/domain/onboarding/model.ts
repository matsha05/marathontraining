/**
 * THE LONG GAME - Onboarding Model
 *
 * Complete type definitions for the coach-backed onboarding flow.
 * Supports 5K through Marathon + General Fitness training.
 */

import { AvatarId } from '@/domain/user/avatars';

export type OnboardingStep =
    | 'welcome'
    | 'mile-gate'
    | 'name'
    | 'demographics'
    | 'avatar'
    | 'training-goal'
    | 'race-details'
    | 'fitness-duration'
    | 'calibration-method'
    | 'race-input'
    | 'easy-pace-input'
    | 'manual-vo2max'
    | 'hard-effort-input'
    | 'estimation-flow'
    | 'vdot-reveal'
    | 'weekly-mileage'
    | 'runs-per-week'
    | 'longest-run'
    | 'available-days'
    | 'long-run-day'
    | 'plan-start-date'
    | 'current-pain'
    | 'pain-details'
    | 'injury-history'
    | 'injury-details'
    | 'training-intensity'
    | 'training-mindset'
    | 'coach-reveal'
    | 'readiness-check'
    | 'generating'
    | 'complete';

export type Sex = 'male' | 'female';

export type TrainingGoal = '5k' | '10k' | 'half' | 'marathon' | 'general';

export type FitnessDuration = '8weeks' | '12weeks' | 'ongoing';

export type CalibrationMethod =
    | 'race'
    | 'easy_pace'
    | 'vo2max'
    | 'effort'
    | 'estimate';

export type RaceDistance = 'mile' | '5k' | '10k' | 'half' | 'marathon';

export type RaceRecency = 'recent' | 'moderate' | 'old' | 'very_old';

export type ExperienceLevel =
    | 'newer'
    | 'recreational'
    | 'experienced'
    | 'competitive'
    | 'elite'
    | 'returning'
    | 'crossfit_athlete';

export type EffortType = 'parkrun' | 'tempo' | 'time_trial' | 'race_sim';

export type PainSeverity = 'mild' | 'moderate' | 'severe';

export type InjuryLocation =
    | 'knee'
    | 'shin_calf'
    | 'achilles'
    | 'foot_plantar'
    | 'hip_glute'
    | 'back'
    | 'other';

export type TrainingIntensity = 'conservative' | 'moderate' | 'aggressive';

export type TrainingMindset = 'rest_focus' | 'consistency' | 'push_limits';

export type ReadinessStatus = 'ready' | 'needs_base' | 'timeline_short';

export type VdotConfidence = 'high' | 'medium' | 'low';

export interface OnboardingData {
    name: string;
    dateOfBirth: string | null;
    age: number | null;
    sex: Sex | null;
    trainingGoal: TrainingGoal | null;
    raceName: string;
    raceDate: string | null;
    fitnessDuration: FitnessDuration | null;
    calibrationMethod: CalibrationMethod | null;
    raceDistance: RaceDistance | null;
    raceTimeMinutes: number | null;
    raceTimeSeconds: number | null;
    raceRecency: RaceRecency | null;
    easyPaceMinutes: number | null;
    easyPaceSeconds: number | null;
    effortType: EffortType | null;
    effortDistance: string;
    effortTimeMinutes: number | null;
    effortTimeSeconds: number | null;
    effortLevel: number | null;
    effortRecency: 'last_2_weeks' | 'last_month' | '1_3_months' | null;
    experienceLevel: ExperienceLevel | null;
    garminVO2max: number | null;
    vdot: number | null;
    vdotConfidence: VdotConfidence | null;
    weeklyMiles: number | null;
    runsPerWeek: number | null;
    longestRecentRun: number | null;
    availableDays: number | null;
    longRunDays: string[];
    longRunDay: string;
    planStartDate: string | null;
    hasCurrentPain: boolean | null;
    painLocation: InjuryLocation | null;
    painSeverity: PainSeverity | null;
    hasRecentInjury: boolean | null;
    injuryLocation: InjuryLocation | null;
    trainingIntensity: TrainingIntensity | null;
    trainingMindset: TrainingMindset | null;
    includeStrength: boolean | null;
    trainingPhilosophy: 'hansons' | 'higdon' | 'pfitzinger' | 'daniels' | null;
    canRunMile: boolean | null;
    readinessStatus: ReadinessStatus | null;
    baseWeeksNeeded: number | null;
    maintenanceWeeksNeeded: number | null;
    avatar: AvatarId | null;
}

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
    name: '',
    dateOfBirth: null,
    age: null,
    sex: null,
    trainingGoal: null,
    raceName: '',
    raceDate: null,
    fitnessDuration: null,
    calibrationMethod: null,
    raceDistance: null,
    raceTimeMinutes: null,
    raceTimeSeconds: null,
    raceRecency: null,
    easyPaceMinutes: null,
    easyPaceSeconds: null,
    effortType: null,
    effortDistance: '',
    effortTimeMinutes: null,
    effortTimeSeconds: null,
    effortLevel: null,
    effortRecency: null,
    experienceLevel: null,
    garminVO2max: null,
    vdot: null,
    vdotConfidence: null,
    weeklyMiles: null,
    runsPerWeek: null,
    longestRecentRun: null,
    availableDays: null,
    longRunDays: [],
    longRunDay: '',
    planStartDate: null,
    hasCurrentPain: null,
    painLocation: null,
    painSeverity: null,
    hasRecentInjury: null,
    injuryLocation: null,
    trainingIntensity: null,
    trainingMindset: null,
    includeStrength: null,
    trainingPhilosophy: null,
    canRunMile: null,
    readinessStatus: null,
    baseWeeksNeeded: null,
    maintenanceWeeksNeeded: null,
    avatar: null,
};

export interface CoachTooltip {
    title: string;
    content: string;
    coach?: string;
    coachLink?: string;
}

