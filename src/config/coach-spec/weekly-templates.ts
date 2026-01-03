/**
 * Weekly Templates by Running Frequency
 * 
 * Based on Oracle research:
 * - Default: 5 days/week (best for strength-background users)
 * - Start at 4 days for first 2-4 weeks, level up when ready
 * - 6 days is an unlock for 45+ mi/week
 * 
 * Key scheduling rules:
 * 1. Strength on Q days (run first, lift later) OR next day
 * 2. No heavy lower-body within 36h before long run
 * 3. 2+ easy days between Q sessions (Daniels)
 */

import type { SessionType } from '@/domain/types/session';

export type RunningFrequency = 4 | 5 | 6;

export interface DaySlot {
    dayOfWeek: number; // 0 = Sunday
    dayName: string;
    runSession: SessionType | 'rest';
    isQualityDay: boolean;
    strengthSession: 'S1' | 'S2' | null;
    durabilitySession: 'pre_run' | 'circuit' | null;
    notes?: string;
}

export interface WeeklyTemplate {
    frequency: RunningFrequency;
    description: string;
    slots: DaySlot[];
    totalRunDays: number;
    qualityDays: number;
    strengthDays: number;
}

/**
 * Template A: 5-day running (RECOMMENDED DEFAULT)
 * Oracle: "Best balance of adaptation, schedule realism, and injury risk"
 */
export const TEMPLATE_5_DAY: WeeklyTemplate = {
    frequency: 5,
    description: '5-day running: Default for hybrid athletes',
    totalRunDays: 5,
    qualityDays: 2,
    strengthDays: 2,
    slots: [
        {
            dayOfWeek: 0, // Sunday
            dayName: 'Sunday',
            runSession: 'long_run',
            isQualityDay: true,
            strengthSession: null,
            durabilitySession: 'pre_run',
            notes: 'Long run - time on feet, not pace',
        },
        {
            dayOfWeek: 1, // Monday
            dayName: 'Monday',
            runSession: 'rest',
            isQualityDay: false,
            strengthSession: null,
            durabilitySession: 'circuit',
            notes: 'Recovery day - durability circuit only',
        },
        {
            dayOfWeek: 2, // Tuesday
            dayName: 'Tuesday',
            runSession: 'intervals', // Q1
            isQualityDay: true,
            strengthSession: 'S1', // Lower emphasis
            durabilitySession: 'pre_run',
            notes: 'Q1 + Strength: Run first, lift after',
        },
        {
            dayOfWeek: 3, // Wednesday
            dayName: 'Wednesday',
            runSession: 'easy',
            isQualityDay: false,
            strengthSession: null,
            durabilitySession: null,
            notes: 'Easy run only - recovery',
        },
        {
            dayOfWeek: 4, // Thursday
            dayName: 'Thursday',
            runSession: 'easy',
            isQualityDay: false,
            strengthSession: null,
            durabilitySession: 'circuit',
            notes: 'Easy + durability',
        },
        {
            dayOfWeek: 5, // Friday
            dayName: 'Friday',
            runSession: 'tempo', // Q2
            isQualityDay: true,
            strengthSession: 'S2', // Hinge + upper
            durabilitySession: 'pre_run',
            notes: 'Q2 + Strength: Run first, lift after',
        },
        {
            dayOfWeek: 6, // Saturday
            dayName: 'Saturday',
            runSession: 'rest',
            isQualityDay: false,
            strengthSession: null,
            durabilitySession: null,
            notes: 'Rest before long run',
        },
    ],
};

/**
 * Template B: 4-day running (STARTER/CONSERVATIVE)
 * Oracle: "Use when time is tight or injury risk is high"
 */
export const TEMPLATE_4_DAY: WeeklyTemplate = {
    frequency: 4,
    description: '4-day running: Starter plan for hybrid athletes',
    totalRunDays: 4,
    qualityDays: 2,
    strengthDays: 2,
    slots: [
        {
            dayOfWeek: 0, // Sunday
            dayName: 'Sunday',
            runSession: 'long_run',
            isQualityDay: true,
            strengthSession: null,
            durabilitySession: 'pre_run',
            notes: 'Long run',
        },
        {
            dayOfWeek: 1, // Monday
            dayName: 'Monday',
            runSession: 'rest',
            isQualityDay: false,
            strengthSession: 'S1',
            durabilitySession: 'circuit',
            notes: 'Strength + durability (no running)',
        },
        {
            dayOfWeek: 2, // Tuesday
            dayName: 'Tuesday',
            runSession: 'intervals', // Q1
            isQualityDay: true,
            strengthSession: null,
            durabilitySession: 'pre_run',
            notes: 'Q1: Speed/intervals',
        },
        {
            dayOfWeek: 3, // Wednesday
            dayName: 'Wednesday',
            runSession: 'rest',
            isQualityDay: false,
            strengthSession: null,
            durabilitySession: 'circuit',
            notes: 'Recovery day',
        },
        {
            dayOfWeek: 4, // Thursday
            dayName: 'Thursday',
            runSession: 'tempo', // Q2
            isQualityDay: true,
            strengthSession: 'S2',
            durabilitySession: 'pre_run',
            notes: 'Q2 + Strength: Run first, lift after',
        },
        {
            dayOfWeek: 5, // Friday
            dayName: 'Friday',
            runSession: 'rest',
            isQualityDay: false,
            strengthSession: null,
            durabilitySession: null,
            notes: 'Rest',
        },
        {
            dayOfWeek: 6, // Saturday
            dayName: 'Saturday',
            runSession: 'easy',
            isQualityDay: false,
            strengthSession: null,
            durabilitySession: null,
            notes: 'Easy run - pre-long-run',
        },
    ],
};

/**
 * Template C: 6-day running (ADVANCED UNLOCK)
 * Oracle: "Only if athlete tolerates running well" and peak >45 mi/week
 */
export const TEMPLATE_6_DAY: WeeklyTemplate = {
    frequency: 6,
    description: '6-day running: Advanced, high-mileage athletes only',
    totalRunDays: 6,
    qualityDays: 2,
    strengthDays: 2,
    slots: [
        {
            dayOfWeek: 0, // Sunday
            dayName: 'Sunday',
            runSession: 'long_run',
            isQualityDay: true,
            strengthSession: null,
            durabilitySession: 'pre_run',
            notes: 'Long run',
        },
        {
            dayOfWeek: 1, // Monday
            dayName: 'Monday',
            runSession: 'recovery',
            isQualityDay: false,
            strengthSession: null,
            durabilitySession: 'circuit',
            notes: 'Recovery run + durability',
        },
        {
            dayOfWeek: 2, // Tuesday
            dayName: 'Tuesday',
            runSession: 'intervals', // Q1
            isQualityDay: true,
            strengthSession: 'S1',
            durabilitySession: 'pre_run',
            notes: 'Q1 + Strength',
        },
        {
            dayOfWeek: 3, // Wednesday
            dayName: 'Wednesday',
            runSession: 'easy',
            isQualityDay: false,
            strengthSession: null,
            durabilitySession: null,
            notes: 'Easy run',
        },
        {
            dayOfWeek: 4, // Thursday
            dayName: 'Thursday',
            runSession: 'medium_long', // Pfitz-style
            isQualityDay: false,
            strengthSession: null,
            durabilitySession: null,
            notes: 'Medium-long aerobic (Pfitzinger value)',
        },
        {
            dayOfWeek: 5, // Friday
            dayName: 'Friday',
            runSession: 'tempo', // Q2
            isQualityDay: true,
            strengthSession: 'S2',
            durabilitySession: 'pre_run',
            notes: 'Q2 + Strength',
        },
        {
            dayOfWeek: 6, // Saturday
            dayName: 'Saturday',
            runSession: 'recovery',
            isQualityDay: false,
            strengthSession: null,
            durabilitySession: null,
            notes: 'Recovery run + strides',
        },
    ],
};

/**
 * Get template by frequency
 */
export function getWeeklyTemplateByFrequency(frequency: RunningFrequency): WeeklyTemplate {
    switch (frequency) {
        case 4: return TEMPLATE_4_DAY;
        case 5: return TEMPLATE_5_DAY;
        case 6: return TEMPLATE_6_DAY;
    }
}

/**
 * Recommend frequency based on athlete profile
 * Oracle heuristic implementation
 */
export function recommendFrequency(input: {
    runHistoryWeeks: number;
    currentWeeklyMileage: number;
    peakMileageTarget: number;
    injuryRiskScore: 'low' | 'medium' | 'high';
    timeBudgetDays: number;
}): {
    recommended: RunningFrequency;
    reason: string;
    canUnlock6Day: boolean;
} {
    const { runHistoryWeeks, currentWeeklyMileage, peakMileageTarget, injuryRiskScore, timeBudgetDays } = input;

    // Can't run more days than available
    const maxByTime = Math.min(timeBudgetDays, 6) as RunningFrequency;

    // Rule 1: New runners or high injury risk start at 4
    if (runHistoryWeeks < 8 || injuryRiskScore === 'high') {
        return {
            recommended: 4,
            reason: 'Starting at 4 days to build tolerance. Level up after 4 weeks of 90%+ compliance.',
            canUnlock6Day: false,
        };
    }

    // Rule 2: Low mileage stays at 4-5
    if (currentWeeklyMileage < 25) {
        const rec = Math.min(5, maxByTime) as RunningFrequency;
        return {
            recommended: rec,
            reason: 'Building base mileage. 5 days is optimal for your current volume.',
            canUnlock6Day: false,
        };
    }

    // Rule 3: 6 days only for high-mileage + low injury risk
    if (peakMileageTarget > 45 && injuryRiskScore === 'low') {
        return {
            recommended: Math.min(6, maxByTime) as RunningFrequency,
            reason: 'Your high mileage target benefits from 6-day structure.',
            canUnlock6Day: true,
        };
    }

    // Default: 5 days
    return {
        recommended: Math.min(5, maxByTime) as RunningFrequency,
        reason: '5 days is the sweet spot: enough volume, less injury risk than 6.',
        canUnlock6Day: peakMileageTarget > 40 && injuryRiskScore === 'low',
    };
}

/**
 * Check if athlete should level up frequency
 * Call this after 4 weeks on current frequency
 */
export function shouldLevelUpFrequency(stats: {
    currentFrequency: RunningFrequency;
    compliancePercent: number;
    painReported: boolean;
    easyDaysFeelEasy: boolean;
}): { shouldLevelUp: boolean; reason: string } {
    const { currentFrequency, compliancePercent, painReported, easyDaysFeelEasy } = stats;

    // Already at max
    if (currentFrequency >= 6) {
        return { shouldLevelUp: false, reason: 'Already at 6 days/week.' };
    }

    // Criteria from Oracle: 90%+ compliance, no pain, easy days feel easy
    if (compliancePercent >= 90 && !painReported && easyDaysFeelEasy) {
        return {
            shouldLevelUp: true,
            reason: `Great work! You've hit 90%+ compliance with no pain. Ready to add a running day.`,
        };
    }

    if (compliancePercent < 90) {
        return { shouldLevelUp: false, reason: `Compliance at ${compliancePercent}%. Hit 90%+ before adding days.` };
    }

    if (painReported) {
        return { shouldLevelUp: false, reason: 'Pain reported. Stay at current frequency until resolved.' };
    }

    if (!easyDaysFeelEasy) {
        return { shouldLevelUp: false, reason: 'Easy days feel hard. Focus on slowing down before adding volume.' };
    }

    return { shouldLevelUp: false, reason: 'Keep building at current frequency.' };
}
