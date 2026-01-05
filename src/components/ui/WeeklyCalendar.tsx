"use client";

import { CheckIcon } from '@/components/ui/check';

/**
 * WeeklyCalendar - Week-at-a-glance component
 * 
 * V2 Design System - Shows 7 days with workout type, completion status, and today highlight
 */

type DayStatus = 'completed' | 'today' | 'upcoming' | 'rest';

interface DayData {
    /** Day abbreviation (Mon, Tue, etc.) */
    day: string;
    /** Workout type label */
    label: string;
    /** Status of this day */
    status: DayStatus;
    /** Optional domain for color coding */
    domain?: 'running' | 'strength' | 'durability';
}

interface WeeklyCalendarProps {
    /** Array of 7 days */
    days: DayData[];
    /** Optional week label */
    weekLabel?: string;
    /** Handler when a day is clicked */
    onDayClick?: (index: number) => void;
}

export function WeeklyCalendar({ days, weekLabel, onDayClick }: WeeklyCalendarProps) {
    return (
        <div className="v2-card p-6">
            {weekLabel && (
                <p className="v2-label mb-4">{weekLabel}</p>
            )}

            <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => (
                    <button
                        key={day.day}
                        type="button"
                        onClick={() => onDayClick?.(index)}
                        disabled={day.status === 'rest'}
                        className="text-center py-3 rounded-xl transition-all"
                        style={{
                            background: day.status === 'today'
                                ? 'var(--v2-accent)'
                                : day.status === 'completed'
                                    ? 'var(--v2-bg-elevated)'
                                    : 'transparent',
                            color: day.status === 'today' ? '#000' : 'var(--v2-text-secondary)',
                            opacity: day.status === 'rest' ? 0.5 : 1,
                            cursor: day.status === 'rest' ? 'default' : 'pointer',
                        }}
                    >
                        <p className="v2-label mb-1">{day.day}</p>
                        <p
                            className="text-[10px]"
                            style={{ color: day.status === 'today' ? 'rgba(0,0,0,0.7)' : 'var(--v2-text-muted)' }}
                        >
                            {day.status === 'rest' ? '—' : day.label}
                        </p>

                        {day.status === 'completed' && (
                            <div
                                className="w-5 h-5 rounded-full mx-auto mt-2 flex items-center justify-center"
                                style={{ background: 'var(--v2-accent)' }}
                            >
                                <CheckIcon size={12} className="text-black" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

/**
 * Simple week data helper
 */
export function createWeekData(
    days: Array<{ type: string; done?: boolean; today?: boolean }>
): DayData[] {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return days.map((d, i) => ({
        day: dayNames[i],
        label: d.type === 'rest' ? 'Rest' : d.type,
        status: d.today
            ? 'today'
            : d.done
                ? 'completed'
                : d.type === 'rest'
                    ? 'rest'
                    : 'upcoming',
    }));
}
