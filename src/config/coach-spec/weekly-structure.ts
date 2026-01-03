/**
 * Weekly Structure Templates
 * 
 * Defines the Hansons-based weekly structure
 * Based on CoachSpec section 4
 */

import type { TrainingPhase, DayTemplate, WeekTemplate } from '@/domain/types/plan';
import type { SessionType } from '@/domain/types/session';

/**
 * Day of week constants (Sunday = 0)
 */
export const DAYS = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
} as const;

/**
 * Standard Hansons weekly template
 * 
 * SOS Days (Something Of Substance):
 * - Tuesday: Speed/Strength (early), Strength (later phases)
 * - Thursday: Tempo
 * - Sunday: Long Run
 */
export const STANDARD_WEEK_TEMPLATE: DayTemplate[] = [
    { dayOfWeek: DAYS.SUNDAY, primarySession: 'long_run', isSOSDay: true, defaultDescription: 'Long Run' },
    { dayOfWeek: DAYS.MONDAY, primarySession: 'easy', isSOSDay: false, defaultDescription: 'Easy' },
    { dayOfWeek: DAYS.TUESDAY, primarySession: 'intervals', isSOSDay: true, defaultDescription: 'Speed/Strength' },
    { dayOfWeek: DAYS.WEDNESDAY, primarySession: 'easy', isSOSDay: false, defaultDescription: 'Easy' },
    { dayOfWeek: DAYS.THURSDAY, primarySession: 'tempo', isSOSDay: true, defaultDescription: 'Tempo' },
    { dayOfWeek: DAYS.FRIDAY, primarySession: 'easy', isSOSDay: false, defaultDescription: 'Easy' },
    { dayOfWeek: DAYS.SATURDAY, primarySession: 'easy', isSOSDay: false, defaultDescription: 'Easy / Pre-Long' },
];

/**
 * Week templates by training phase
 */
export const WEEK_TEMPLATES: Record<TrainingPhase, WeekTemplate> = {
    BASE_1: {
        phase: 'BASE_1',
        days: STANDARD_WEEK_TEMPLATE.map(d => ({
            ...d,
            // BASE_1: All easy, just building volume
            primarySession: d.isSOSDay && d.primarySession === 'intervals' ? 'easy' : d.primarySession,
            isSOSDay: d.primarySession === 'long_run', // Only long run is SOS in BASE_1
        })),
        totalMileagePercent: 60,
        qualitySessionCount: 1,  // Just long run
        strengthSessionCount: 2,
    },

    BASE_2: {
        phase: 'BASE_2',
        days: STANDARD_WEEK_TEMPLATE.map(d => ({
            ...d,
            // BASE_2: Add speed work, keep tempo moderate
            primarySession: d.primarySession as SessionType,
        })),
        totalMileagePercent: 75,
        qualitySessionCount: 2,  // Speed + Long
        strengthSessionCount: 2,
    },

    BUILD: {
        phase: 'BUILD',
        days: STANDARD_WEEK_TEMPLATE,
        totalMileagePercent: 90,
        qualitySessionCount: 3,  // Speed + Tempo + Long
        strengthSessionCount: 2,
    },

    PEAK: {
        phase: 'PEAK',
        days: STANDARD_WEEK_TEMPLATE.map(d => ({
            ...d,
            // PEAK: Shift Tuesday from intervals to strength/tempo
            primarySession: d.dayOfWeek === DAYS.TUESDAY ? 'tempo' : d.primarySession,
        })),
        totalMileagePercent: 100,
        qualitySessionCount: 3,
        strengthSessionCount: 1,  // Reduced
    },

    TAPER: {
        phase: 'TAPER',
        days: STANDARD_WEEK_TEMPLATE.map(d => ({
            ...d,
            // TAPER: Reduce long run, keep turnover
            primarySession: d.primarySession as SessionType,
            isSOSDay: d.dayOfWeek === DAYS.THURSDAY, // Only tempo is SOS
        })),
        totalMileagePercent: 60,
        qualitySessionCount: 1,  // Just one tune-up
        strengthSessionCount: 0,
    },

    RECOVERY: {
        phase: 'RECOVERY',
        days: STANDARD_WEEK_TEMPLATE.map(d => ({
            ...d,
            primarySession: 'easy' as SessionType,
            isSOSDay: false,
        })),
        totalMileagePercent: 40,
        qualitySessionCount: 0,
        strengthSessionCount: 1,
    },
};

/**
 * Get the week template for a training phase
 */
export function getWeekTemplate(phase: TrainingPhase): WeekTemplate {
    return WEEK_TEMPLATES[phase];
}

/**
 * Calculate target weekly mileage
 */
export function calculateWeeklyMileage(peakMileage: number, phase: TrainingPhase): number {
    const template = WEEK_TEMPLATES[phase];
    return Math.round(peakMileage * (template.totalMileagePercent / 100));
}

/**
 * Cutback week rules (Hansons: every other week)
 */
export interface CutbackConfig {
    frequencyWeeks: number;  // Apply cutback every N weeks
    reductionPercent: number;
}

export const CUTBACK_CONFIG: CutbackConfig = {
    frequencyWeeks: 2,
    reductionPercent: 15,
};

/**
 * Check if a week should be a cutback week
 */
export function isCutbackWeek(weekNumber: number): boolean {
    return weekNumber > 1 && weekNumber % CUTBACK_CONFIG.frequencyWeeks === 0;
}
