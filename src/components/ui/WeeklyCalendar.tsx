"use client";

import { CheckIcon } from '@/components/ui/check';

/**
 * WeeklyCalendar - Week-at-a-glance component
 * 
 * Shows 7 days with workout type, completion status, and today highlight
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
        <div className="card p-6">
            {weekLabel && (
                <p className="text-label mb-4">{weekLabel}</p>
            )}

            <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => (
                    <button
                        key={day.day}
                        type="button"
                        onClick={() => onDayClick?.(index)}
                        disabled={day.status === 'rest'}
                        className={`
              text-center py-3 rounded-xl transition-all tap-target
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]
              ${day.status === 'today'
                                ? 'bg-[var(--color-accent)] text-black'
                                : day.status === 'completed'
                                    ? 'bg-[var(--bg-muted)]'
                                    : day.status === 'rest'
                                        ? 'opacity-50 cursor-default'
                                        : 'hover:bg-[var(--bg-muted)]'
                            }
            `}
                    >
                        <p className="text-label mb-1">{day.day}</p>
                        <p className={`text-caption ${day.status === 'today' ? 'text-black/70' : ''}`}>
                            {day.status === 'rest' ? '—' : day.label}
                        </p>

                        {day.status === 'completed' && (
                            <div className="w-5 h-5 rounded-full bg-[var(--color-accent)] mx-auto mt-2 flex items-center justify-center">
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
