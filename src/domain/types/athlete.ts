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

// VDOT History
export type VdotSource = 'race' | 'time_trial' | 'manual';

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

// Goal Race
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

// Injury
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
