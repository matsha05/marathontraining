export function parseDateOnly(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]) - 1;
        const day = Number(match[3]);
        return new Date(Date.UTC(year, month, day));
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
}

export function addDaysUtc(date: Date, days: number): Date {
    return new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate() + days
    ));
}

export function formatDateUtc(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function calculateWeeksToRace(raceDateStr: string): number {
    const raceDate = parseDateOnly(raceDateStr);
    if (!raceDate) return 0;
    const today = new Date();
    const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const diffTime = raceDate.getTime() - todayUtc.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.ceil(diffDays / 7));
}

export function formatDateLong(dateStr: string, locale = 'en-US'): string {
    const date = parseDateOnly(dateStr);
    if (!date) return dateStr;
    return date.toLocaleDateString(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

export function getWeekStartDate(
    weekNumber: number,
    raceDateStr?: string,
    totalWeeksOverride?: number
): string {
    if (!raceDateStr) return '';
    const raceDate = parseDateOnly(raceDateStr);
    if (!raceDate) return '';
    // Count backward from race date
    const totalWeeks = totalWeeksOverride ?? calculateWeeksToRace(raceDateStr);
    if (totalWeeks <= 0) return '';
    const weeksFromStart = weekNumber - 1;
    const weekStart = addDaysUtc(raceDate, -((totalWeeks - weeksFromStart) * 7));
    return formatDateUtc(weekStart);
}

export function getDateForDay(
    weekNumber: number,
    dayIndex: number,
    raceDateStr?: string,
    totalWeeksOverride?: number
): string {
    if (!raceDateStr) return '';
    const weekStart = getWeekStartDate(weekNumber, raceDateStr, totalWeeksOverride);
    if (!weekStart) return '';
    const weekStartDate = parseDateOnly(weekStart);
    if (!weekStartDate) return '';
    const date = addDaysUtc(weekStartDate, dayIndex);
    return formatDateUtc(date);
}
