export const DAY_NAME_TO_INDEX: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
};

export function normalizeDayName(dayName: string): string {
    return dayName.trim().toLowerCase();
}

export function getDayIndex(dayName: string): number {
    return DAY_NAME_TO_INDEX[normalizeDayName(dayName)] ?? 6;
}
