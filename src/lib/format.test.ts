/**
 * Format Utilities Tests
 *
 * Tests for @/lib/format functions
 */

import { describe, it, expect } from 'vitest';
import {
    formatPace,
    formatPaceRange,
    formatTime,
    formatDuration,
    formatDistance,
    getDayName,
    getFullDayName,
    formatDate,
    formatRelativeDate,
} from './format';

describe('formatPace', () => {
    it('formats pace correctly for common values', () => {
        expect(formatPace(480)).toBe('8:00'); // 8:00/mi
        expect(formatPace(510)).toBe('8:30'); // 8:30/mi
        expect(formatPace(420)).toBe('7:00'); // 7:00/mi
    });

    it('handles edge cases', () => {
        expect(formatPace(0)).toBe('--:--');
        expect(formatPace(-60)).toBe('--:--');
        expect(formatPace(599)).toBe('9:59');
        expect(formatPace(600)).toBe('10:00');
    });

    it('pads seconds correctly', () => {
        expect(formatPace(365)).toBe('6:05');
        expect(formatPace(301)).toBe('5:01');
    });
});

describe('formatPaceRange', () => {
    it('formats pace range correctly', () => {
        expect(formatPaceRange(480, 540)).toBe('8:00 - 9:00');
        expect(formatPaceRange(420, 450)).toBe('7:00 - 7:30');
    });
});

describe('formatTime', () => {
    it('formats short durations (under an hour)', () => {
        expect(formatTime(90)).toBe('1:30');
        expect(formatTime(3599)).toBe('59:59');
    });

    it('formats long durations (over an hour)', () => {
        expect(formatTime(3600)).toBe('1:00:00');
        expect(formatTime(7200)).toBe('2:00:00');
        expect(formatTime(5430)).toBe('1:30:30');
    });

    it('handles edge cases', () => {
        expect(formatTime(0)).toBe('0:00');
        expect(formatTime(-1)).toBe('0:00');
    });
});

describe('formatDuration', () => {
    it('formats minutes correctly', () => {
        expect(formatDuration(45)).toBe('45 min');
        expect(formatDuration(30)).toBe('30 min');
    });

    it('formats hours correctly', () => {
        expect(formatDuration(60)).toBe('1h');
        expect(formatDuration(90)).toBe('1h 30m');
        expect(formatDuration(120)).toBe('2h');
    });

    it('handles edge cases', () => {
        expect(formatDuration(0)).toBe('0 min');
        expect(formatDuration(-10)).toBe('0 min');
    });
});

describe('formatDistance', () => {
    it('formats miles correctly', () => {
        expect(formatDistance(5)).toBe('5 mi');
        expect(formatDistance(5.5)).toBe('5.5 mi');
        expect(formatDistance(10.25)).toBe('10.3 mi'); // Rounds to 1 decimal
    });

    it('formats sub-mile distances', () => {
        expect(formatDistance(0.25)).toBe('1320 ft');
    });

    it('handles edge cases', () => {
        expect(formatDistance(0)).toBe('0 mi');
        expect(formatDistance(-1)).toBe('0 mi');
    });
});

describe('getDayName', () => {
    it('returns correct short day names', () => {
        expect(getDayName(0)).toBe('Sun');
        expect(getDayName(1)).toBe('Mon');
        expect(getDayName(6)).toBe('Sat');
    });

    it('handles invalid input', () => {
        expect(getDayName(7)).toBe('???');
        expect(getDayName(-1)).toBe('???');
    });
});

describe('getFullDayName', () => {
    it('returns correct full day names', () => {
        expect(getFullDayName(0)).toBe('Sunday');
        expect(getFullDayName(3)).toBe('Wednesday');
        expect(getFullDayName(6)).toBe('Saturday');
    });

    it('handles invalid input', () => {
        expect(getFullDayName(7)).toBe('Unknown');
    });
});

describe('formatDate', () => {
    it('formats dates correctly', () => {
        // Just check it returns something formatted (timezone-agnostic)
        const result = formatDate('2026-01-15');
        expect(result).toMatch(/Jan/);
        expect(typeof result).toBe('string');
    });

    it('handles invalid dates gracefully', () => {
        // When given invalid date, Date constructor returns 'Invalid Date'
        const result = formatDate('invalid');
        expect(result).toBeDefined();
    });
});
