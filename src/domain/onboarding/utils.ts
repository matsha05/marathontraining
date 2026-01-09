/**
 * THE LONG GAME - Onboarding Utilities
 * 
 * Helper functions for onboarding data processing.
 */

import { addYears, toDateKey } from '@/lib/dates';

/**
 * Parse a YYYY-MM-DD string as LOCAL time (not UTC).
 * This avoids timezone shifts when calculating age.
 */
function parseDateLocal(dateString: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
    if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]) - 1;
        const day = Number(match[3]);
        const date = new Date(year, month, day);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

/**
 * Calculate age from date of birth.
 * Handles edge cases around birthdays correctly.
 */
export function calculateAgeFromDob(dob: string): number {
    const birth = parseDateLocal(dob);
    if (!birth) return 0;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    // Adjust if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return Math.max(0, age);
}

export function getDobBounds(minAge = 13, maxAge = 99): { minDate: string; maxDate: string } {
    const today = new Date();
    return {
        minDate: toDateKey(addYears(today, -maxAge)),
        maxDate: toDateKey(addYears(today, -minAge)),
    };
}

/**
 * Map day names to day-of-week indices (0 = Sunday, 6 = Saturday).
 * Used throughout plan generation for long run day placement.
 */
export const DAY_NAME_TO_INDEX: Record<string, number> = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
};

/**
 * Get day index from day name, with fallback to Saturday.
 */
export function getDayIndex(dayName: string): number {
    return DAY_NAME_TO_INDEX[dayName.toLowerCase()] ?? 6;
}

/**
 * Format date as YYYY-MM-DD for form inputs.
 */
export function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Get "next Monday" from today, useful for default plan start dates.
 */
export function getNextMonday(): string {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return formatDateForInput(nextMonday);
}
