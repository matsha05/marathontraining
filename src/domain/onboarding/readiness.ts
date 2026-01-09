import type { OnboardingData, ReadinessStatus, TrainingGoal, TrainingIntensity } from './types';
import { calculateWeeksToRace } from '@/domain/plan/date-utils';
import { HIGDON_TIER_CONFIGS, HigdonTier } from '@/domain/plan/types';
import { selectPlanTier } from '@/domain/philosophy/tier-selector';
import { getHigdonBridgeCounts } from '@/domain/plan/higdon-bridge';

const REQUIREMENTS: Record<string, { weeklyMiles: number; longRun: number }> = {
    '5k': { weeklyMiles: 10, longRun: 4 },
    '10k': { weeklyMiles: 15, longRun: 6 },
    'half': { weeklyMiles: 20, longRun: 8 },
    'marathon': { weeklyMiles: 25, longRun: 10 },
    'general': { weeklyMiles: 0, longRun: 0 },
};

export function calculateReadiness(data: OnboardingData): {
    status: ReadinessStatus;
    baseWeeksNeeded: number;
    maintenanceWeeksNeeded: number;
} {
    const weeklyMiles = data.weeklyMiles ?? 0;
    const longestRun = data.longestRecentRun ?? 0;

    const req = REQUIREMENTS[data.trainingGoal ?? 'marathon'];

    const needsMoreMiles = weeklyMiles < req.weeklyMiles * 0.7;
    const needsLongerRun = longestRun < req.longRun * 0.7;

    if (needsMoreMiles || needsLongerRun) {
        const basePlanAvailability = getHigdonBaseAvailability(data);
        if (basePlanAvailability.status === 'available') {
            return {
                status: 'needs_base',
                baseWeeksNeeded: basePlanAvailability.baseWeeks,
                maintenanceWeeksNeeded: basePlanAvailability.maintenanceWeeks,
            };
        }

        const mileGap = Math.max(0, req.weeklyMiles - weeklyMiles);
        const weeksForMiles = Math.ceil(mileGap / 3);

        const runGap = Math.max(0, req.longRun - longestRun);
        const weeksForRun = Math.ceil(runGap / 1.5);

        const baseWeeks = Math.max(weeksForMiles, weeksForRun, 2);

        return {
            status: 'needs_base',
            baseWeeksNeeded: Math.min(baseWeeks, 8),
            maintenanceWeeksNeeded: 0,
        };
    }

    if (data.raceDate) {
        const weeksToRace = calculateWeeksToRace(data.raceDate);

        const minWeeks: Record<string, number> = {
            '5k': 4,
            '10k': 6,
            'half': 8,
            'marathon': 12,
        };

        if (weeksToRace < (minWeeks[data.trainingGoal ?? 'marathon'] ?? 8)) {
            return { status: 'timeline_short', baseWeeksNeeded: 0, maintenanceWeeksNeeded: 0 };
        }
    }

    return { status: 'ready', baseWeeksNeeded: 0, maintenanceWeeksNeeded: 0 };
}

export function getHigdonBaseAvailability(
    data: OnboardingData
): { status: 'available'; baseWeeks: number; maintenanceWeeks: number } | { status: 'not_applicable' } {
    if (data.trainingPhilosophy !== 'higdon') return { status: 'not_applicable' };
    if (!data.raceDate) return { status: 'not_applicable' };

    const targetDistance = mapGoalToTierDistance(data.trainingGoal);
    if (!targetDistance || targetDistance === 'base') return { status: 'not_applicable' };

    const experience = mapTrainingIntensityToExperience(data.trainingIntensity);
    const currentMileage = mapWeeklyMilesToTierFormat(data.weeklyMiles);
    const daysPerWeek = data.availableDays ?? 4;

    const raceTierResult = selectPlanTier({
        philosophy: 'higdon',
        distance: targetDistance,
        experience,
        currentMileage,
        daysPerWeek,
    });
    const raceConfig = HIGDON_TIER_CONFIGS[raceTierResult.tier as HigdonTier];

    const baseTierResult = selectPlanTier({
        philosophy: 'higdon',
        distance: 'base',
        experience,
        currentMileage,
        daysPerWeek,
    });
    const baseTier = baseTierResult.tier as HigdonTier;
    const baseConfig = HIGDON_TIER_CONFIGS[baseTier];

    const weeksToRace = calculateWeeksToRace(data.raceDate);
    const gapWeeks = weeksToRace - raceConfig.durationWeeks;

    if (gapWeeks <= 0) return { status: 'not_applicable' };
    const { baseWeeks, maintenanceWeeks } = getHigdonBridgeCounts(gapWeeks, baseConfig.durationWeeks);
    return { status: 'available', baseWeeks, maintenanceWeeks };
}

function mapTrainingIntensityToExperience(
    intensity: TrainingIntensity | null
): 'beginner' | 'intermediate' | 'advanced' {
    if (intensity === 'aggressive') return 'advanced';
    if (intensity === 'conservative') return 'beginner';
    return 'intermediate';
}

function mapWeeklyMilesToTierFormat(
    weeklyMiles: number | null
): 'under_20' | '20_40' | 'over_40' {
    const mileage = weeklyMiles ?? 20;
    if (mileage >= 40) return 'over_40';
    if (mileage >= 20) return '20_40';
    return 'under_20';
}

function mapGoalToTierDistance(
    goal: TrainingGoal | null
): 'base' | '5k' | '10k' | 'half' | 'marathon' | null {
    if (!goal) return null;
    return goal === 'general' ? 'base' : goal;
}
