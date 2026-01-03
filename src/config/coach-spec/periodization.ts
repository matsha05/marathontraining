/**
 * Periodization Configuration
 * 
 * Based on comprehensive Oracle research synthesizing:
 * - Hansons Marathon Method (cumulative fatigue, SOS structure)
 * - Jack Daniels (VDOT, 4-week blocks)
 * - Stephen Seiler (80/20 polarized, interference effect)
 * - Pete Pfitzinger (marathon-specific periodization)
 * - Jay Dicharry (durability, injury prevention)
 * 
 * Key principle: 5-block structure with 4-week cycles (3 build + 1 deload)
 */

import type { TrainingPhase } from '@/domain/types/plan';
import type { RaceDistance } from '@/domain/types/athlete';

export type PeriodizationBlock =
    | 'ONRAMP'           // Block 1: Tissue tolerance, establish frequency
    | 'AEROBIC_BASE'     // Block 2: Aerobic development + threshold intro
    | 'MARATHON_SPECIFIC' // Block 3: MP work, marathon-specific foundation
    | 'PEAK'             // Block 4: Peak volume, heavy MP work
    | 'TAPER';           // Block 5: Volume drops, intensity maintained

/**
 * Block configuration based on Oracle research
 */
export interface BlockConfig {
    block: PeriodizationBlock;
    description: string;

    // Volume
    mileagePercentOfPeak: number;
    longRunPercentOfWeek: number; // Cap at 33% per Oracle

    // Quality sessions
    qualitySessionsPerWeek: 1 | 2;
    q1Focus: 'strides' | 'hills' | 'intervals' | 'tempo' | 'marathon_pace';
    q2Focus: 'tempo' | 'marathon_pace' | 'mixed' | null;

    // Strength
    strengthSessionsPerWeek: 2 | 1;
    strengthVolumePercent: number; // 100 = normal, 50 = reduced

    // Long run intensity
    longRunIntensity: 'easy_only' | 'steady_finish' | 'mp_segments';
}

/**
 * 5-Block periodization configuration
 * Based on Pfitzinger's mesocycle approach with Oracle adjustments
 */
export const BLOCK_CONFIG: Record<PeriodizationBlock, BlockConfig> = {
    ONRAMP: {
        block: 'ONRAMP',
        description: 'Tissue tolerance, establish frequency, normal lifting',
        mileagePercentOfPeak: 60,
        longRunPercentOfWeek: 30,
        qualitySessionsPerWeek: 1,
        q1Focus: 'strides',
        q2Focus: null, // Only 1 Q session in onramp
        strengthSessionsPerWeek: 2,
        strengthVolumePercent: 100,
        longRunIntensity: 'easy_only',
    },

    AEROBIC_BASE: {
        block: 'AEROBIC_BASE',
        description: 'Aerobic development + threshold introduction',
        mileagePercentOfPeak: 75,
        longRunPercentOfWeek: 30,
        qualitySessionsPerWeek: 2,
        q1Focus: 'hills', // or intervals
        q2Focus: 'tempo',
        strengthSessionsPerWeek: 2,
        strengthVolumePercent: 100,
        longRunIntensity: 'easy_only',
    },

    MARATHON_SPECIFIC: {
        block: 'MARATHON_SPECIFIC',
        description: 'Marathon pace development, foundation building',
        mileagePercentOfPeak: 90,
        longRunPercentOfWeek: 33,
        qualitySessionsPerWeek: 2,
        q1Focus: 'intervals',
        q2Focus: 'marathon_pace',
        strengthSessionsPerWeek: 2,
        strengthVolumePercent: 85,
        longRunIntensity: 'steady_finish',
    },

    PEAK: {
        block: 'PEAK',
        description: 'Peak volume, heavy MP work, reduced strength',
        mileagePercentOfPeak: 100,
        longRunPercentOfWeek: 33,
        qualitySessionsPerWeek: 2,
        q1Focus: 'tempo', // Mixed I/T
        q2Focus: 'marathon_pace',
        strengthSessionsPerWeek: 2,
        strengthVolumePercent: 50, // Oracle: reduce 30-50%
        longRunIntensity: 'mp_segments',
    },

    TAPER: {
        block: 'TAPER',
        description: 'Volume drops, maintain intensity touches, no soreness',
        mileagePercentOfPeak: 60,
        longRunPercentOfWeek: 25,
        qualitySessionsPerWeek: 1,
        q1Focus: 'tempo',
        q2Focus: null,
        strengthSessionsPerWeek: 1, // Oracle: 1 session or 2 very short
        strengthVolumePercent: 30, // Minimal
        longRunIntensity: 'easy_only',
    },
};

/**
 * 4-week block rhythm (Daniels/Seiler compatible)
 * Build-Build-Build-Deload
 */
export const BLOCK_RHYTHM = {
    buildWeeks: 3,
    deloadWeek: 1,
    totalBlockWeeks: 4,
    deloadVolumeReduction: 0.15, // 15% reduction on deload week
} as const;

/**
 * Assign blocks to weeks based on total plan duration
 */
export function assignBlocksToWeeks(
    totalWeeks: number,
    goalRace: RaceDistance
): PeriodizationBlock[] {
    const blocks: PeriodizationBlock[] = [];

    // Taper is always last 2-3 weeks
    const taperWeeks = goalRace === 'marathon' ? 3 : goalRace.includes('ultra') ? 3 : 2;

    // Peak is 1 block (4 weeks) before taper
    const peakWeeks = 4;

    // Marathon-specific is 1-2 blocks before peak
    const marathonSpecificWeeks = Math.min(8, Math.floor((totalWeeks - taperWeeks - peakWeeks) * 0.4));

    // Aerobic base takes bulk of remaining time
    const aerobicWeeks = Math.min(8, Math.floor((totalWeeks - taperWeeks - peakWeeks - marathonSpecificWeeks) * 0.6));

    // Onramp is the rest (min 2 weeks, max 4 weeks)
    const onrampWeeks = Math.max(2, Math.min(4, totalWeeks - taperWeeks - peakWeeks - marathonSpecificWeeks - aerobicWeeks));

    // Adjust to fit exactly
    const allocatedWeeks = onrampWeeks + aerobicWeeks + marathonSpecificWeeks + peakWeeks + taperWeeks;
    const extraWeeks = totalWeeks - allocatedWeeks;

    // Add extra weeks to aerobic base
    const finalAerobicWeeks = aerobicWeeks + extraWeeks;

    for (let i = 0; i < onrampWeeks; i++) blocks.push('ONRAMP');
    for (let i = 0; i < finalAerobicWeeks; i++) blocks.push('AEROBIC_BASE');
    for (let i = 0; i < marathonSpecificWeeks; i++) blocks.push('MARATHON_SPECIFIC');
    for (let i = 0; i < peakWeeks; i++) blocks.push('PEAK');
    for (let i = 0; i < taperWeeks; i++) blocks.push('TAPER');

    return blocks;
}

/**
 * Check if it's a deload week (every 4th week)
 */
export function isDeloadWeek(weekNumber: number): boolean {
    return weekNumber > 0 && weekNumber % BLOCK_RHYTHM.totalBlockWeeks === 0;
}

/**
 * Get block config for a specific week
 */
export function getBlockConfig(block: PeriodizationBlock): BlockConfig {
    return BLOCK_CONFIG[block];
}

/**
 * Calculate weekly mileage with deload adjustment
 */
export function calculateBlockMileage(
    peakMileage: number,
    block: PeriodizationBlock,
    isDeload: boolean
): number {
    const config = BLOCK_CONFIG[block];
    let mileage = peakMileage * (config.mileagePercentOfPeak / 100);

    if (isDeload) {
        mileage *= (1 - BLOCK_RHYTHM.deloadVolumeReduction);
    }

    return Math.round(mileage);
}

/**
 * Long run ceiling (Oracle: time-based is best)
 */
export const LONG_RUN_CEILINGS = {
    beginner: { maxMinutes: 150, maxMiles: 16 },   // 2:30
    intermediate: { maxMinutes: 165, maxMiles: 18 }, // 2:45
    advanced: { maxMinutes: 180, maxMiles: 22 },    // 3:00
} as const;

export type AthleteLevel = keyof typeof LONG_RUN_CEILINGS;

/**
 * Calculate long run distance with caps
 */
export function calculateLongRunDistance(
    weeklyMileage: number,
    block: PeriodizationBlock,
    level: AthleteLevel = 'intermediate'
): number {
    const config = BLOCK_CONFIG[block];
    const ceiling = LONG_RUN_CEILINGS[level];

    // Oracle: Long run ≤ 33% of weekly mileage
    const percentageBased = weeklyMileage * (config.longRunPercentOfWeek / 100);

    // Cap at level-based ceiling
    return Math.min(Math.round(percentageBased), ceiling.maxMiles);
}
