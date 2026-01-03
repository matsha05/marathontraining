/**
 * Athlete domain types
 * Pure domain types - no infrastructure dependencies
 */

export type Sex = 'male' | 'female';

export type StrengthBackground = 'none' | 'recreational' | 'intermediate' | 'advanced';

export type Equipment =
    | 'barbell'
    | 'dumbbell'
    | 'kettlebell'
    | 'pull_up_bar'
    | 'resistance_bands'
    | 'foam_roller'
    | 'stability_ball'
    | 'box'
    | 'sled'
    | 'bike_erg'
    | 'row_erg'
    | 'ski_erg';

export interface Athlete {
    id: string;
    name: string;
    weightKg: number | null;
    age: number | null;
    sex: Sex | null;
    runningExperienceMonths: number;
    strengthBackground: StrengthBackground;
    equipment: Equipment[];
    createdAt: Date;
    updatedAt: Date;
}

export interface AthleteInput {
    name: string;
    weightKg?: number;
    age?: number;
    sex?: Sex;
    runningExperienceMonths?: number;
    strengthBackground?: StrengthBackground;
    equipment?: Equipment[];
}

// ============================================================================
// ONBOARDING PROFILE - Coach-backed assessment data
// ============================================================================

export interface OnboardingProfile {
    // Phase 1: Safety
    currentPainAffectsGait: boolean;
    painLocation?: string;
    injuryLast12Months: boolean;
    injuryDetails?: string;
    medicalConditions: string[];

    // Phase 2: Training Load (last 4 weeks)
    runsPerWeek: number;
    weeklyMiles: number;
    longestRunMiles: number;
    hardSessionsPerWeek: number;

    // Phase 2: Background
    runningBackground: 'new' | 'some' | 'veteran';
    priorMarathons: 0 | 1 | 2 | 3;  // 3 = 3+
    strengthTraining: 'none' | 'some' | 'regular';

    // Phase 3: Fitness Calibration
    calibrationSource: 'garmin' | 'race' | 'time_trial' | 'estimated';
    garminVO2max?: number;
    raceDistance?: string;
    raceTime?: string;
    raceDate?: string;
    ttDistance?: string;
    ttTime?: string;
    ttEffortRPE?: number;

    // Phase 4: Goal
    goalDistance: string;
    goalDate: string;
    goalTerrain: 'road' | 'trail';
    raceName?: string;  // e.g. "Atlanta Rock n Roll Marathon"

    // Calculated
    estimatedVdot?: number;
    vdotConfidence?: 'high' | 'medium' | 'low';
    injuryRiskScore?: number;
}

export interface OnboardingProfileInput extends Partial<OnboardingProfile> {
    name: string;
    age: number;
    sex: Sex;
}

// ============================================================================
// VDOT HISTORY
// ============================================================================

export type VdotSource = 'race' | 'time_trial' | 'garmin' | 'estimated';

export interface VdotEntry {
    id: string;
    athleteId: string;
    vdot: number;
    source: VdotSource;
    raceDistanceM?: number;
    raceTimeSeconds?: number;
    calculatedAt: Date;
    isCurrent: boolean;
}

// ============================================================================
// GOAL RACE
// ============================================================================

export type RaceDistance =
    | '5k'
    | '10k'
    | 'half'
    | 'marathon'
    | 'ultra_50k'
    | 'ultra_50m'
    | 'ultra_100k'
    | 'ultra_100m';

export type Terrain = 'road' | 'trail' | 'mountain';

export interface GoalRace {
    id: string;
    athleteId: string;
    distance: RaceDistance;
    raceDate: Date;
    terrain: Terrain;
    raceName?: string;
    isActive: boolean;
    createdAt: Date;
}

// ============================================================================
// INJURY
// ============================================================================

export type InjuryType = 'pfp' | 'achilles' | 'shin' | 'plantar' | 'itbs' | 'other';
export type InjurySeverity = 'mild' | 'moderate' | 'severe';

export interface InjuryRecord {
    id: string;
    athleteId: string;
    injuryType: InjuryType;
    occurredDate?: Date;
    severity?: InjurySeverity;
    isResolved: boolean;
    notes?: string;
    createdAt: Date;
}

