import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    addDaysUtc,
    calculateWeeksToRace,
    formatDateUtc,
    getDateForDay,
    getWeekStartDate,
    parseDateOnly,
} from './date-utils';

describe('plan date helpers', () => {
    it('parses date-only strings as UTC dates', () => {
        const parsed = parseDateOnly('2025-02-02');
        expect(parsed).not.toBeNull();
        expect(formatDateUtc(parsed!)).toBe('2025-02-02');
    });

    it('returns null for invalid dates', () => {
        expect(parseDateOnly('not-a-date')).toBeNull();
    });

    it('adds days in UTC without shifting dates', () => {
        const base = parseDateOnly('2025-02-02')!;
        expect(formatDateUtc(addDaysUtc(base, -7))).toBe('2025-01-26');
        expect(formatDateUtc(addDaysUtc(base, 1))).toBe('2025-02-03');
    });
});

describe('week/day calculations', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(Date.UTC(2025, 0, 1, 12, 0, 0)));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('calculates weeks to race deterministically', () => {
        expect(calculateWeeksToRace('2025-02-02')).toBe(5);
    });

    it('derives week start and day dates', () => {
        expect(getWeekStartDate(1, '2025-02-02')).toBe('2024-12-29');
        expect(getDateForDay(1, 6, '2025-02-02')).toBe('2025-01-04');
        expect(getDateForDay(4, 0, '2025-02-02')).toBe('2025-01-19');
    });
});
