"use client";

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckIcon } from '@/components/ui/check';
import { useIsMobile } from '@/hooks/useIsMobile';

/**
 * WeeklyCalendar - Week-at-a-glance component (V3)
 * 
 * Board-ready version with:
 * - Mileage display per day
 * - Workout-type color coding
 * - Individual card animations (staggered)
 * - Clickable cards to workout details
 * - Past days visually muted
 */

type DayStatus = 'completed' | 'today' | 'upcoming' | 'rest';
type WorkoutType = 'easy' | 'long' | 'quality' | 'recovery' | 'rest' | 'tempo' | 'interval' | 'marathon';

interface DayData {
    /** Day abbreviation (SUN, MON, etc.) */
    day: string;
    /** Workout type label */
    label: string;
    /** Status of this day */
    status: DayStatus;
    /** Workout type for color coding */
    workoutType?: WorkoutType;
    /** Distance in miles (optional) */
    distance?: number;
    /** Target pace (optional) */
    pace?: string;
    /** Has strength session */
    hasStrength?: boolean;
    /** Workout ID for linking */
    workoutId?: string;
    /** Date string for linking (e.g., "2026-01-06") */
    date?: string;
}

interface WeeklyCalendarProps {
    /** Array of 7 days */
    days: DayData[];
    /** Optional week label (e.g., "Week 1 • BASE • 11 mi") */
    weekLabel?: string;
    /** Handler when a day is clicked (fallback if no workoutId) */
    onDayClick?: (index: number) => void;
    /** Current week number (for navigation) */
    currentWeek?: number;
    /** Total weeks (for navigation) */
    totalWeeks?: number;
    /** Handler for prev week */
    onPrevWeek?: () => void;
    /** Handler for next week */
    onNextWeek?: () => void;
}

/**
 * Get background color based on workout type and status
 */
function getWorkoutBackground(workoutType: WorkoutType | undefined, status: DayStatus): string {
    // Completed days are muted
    if (status === 'completed') {
        return 'var(--bg-muted)';
    }
    if (status === 'today') {
        return 'var(--color-accent)';
    }
    if (status === 'rest' || workoutType === 'rest') {
        return 'transparent';
    }

    // Upcoming days get subtle workout-type tints
    switch (workoutType) {
        case 'long':
            return 'color-mix(in srgb, var(--color-workout-long) 12%, var(--bg-elevated))';
        case 'quality':
        case 'tempo':
        case 'interval':
            return 'color-mix(in srgb, var(--color-workout-quality) 10%, var(--bg-elevated))';
        case 'recovery':
            return 'var(--bg-muted)';
        default:
            return 'var(--bg-elevated)';
    }
}

/**
 * Get label color based on workout type and status
 */
function getLabelColor(workoutType: WorkoutType | undefined, status: DayStatus): string {
    // Completed days are muted
    if (status === 'completed') {
        return 'var(--text-subtle)';
    }
    if (status === 'today') {
        return 'rgba(0,0,0,0.8)';
    }
    if (status === 'rest' || workoutType === 'rest') {
        return 'var(--text-subtle)';
    }

    switch (workoutType) {
        case 'long':
            return 'var(--color-workout-long)';
        case 'quality':
        case 'tempo':
        case 'interval':
            return 'var(--color-workout-quality)';
        case 'easy':
            return 'var(--color-workout-easy)';
        case 'recovery':
            return 'var(--color-workout-recovery)';
        default:
            return 'var(--text-muted)';
    }
}

/**
 * Get border style based on status and workout type
 */
function getBorderStyle(workoutType: WorkoutType | undefined, status: DayStatus): string {
    if (status === 'today') {
        return '2px solid var(--color-accent)';
    }
    if (status === 'completed') {
        return '2px solid var(--border-muted)';
    }
    if (workoutType === 'long') {
        return '2px solid color-mix(in srgb, var(--color-workout-long) 50%, transparent)';
    }
    return '2px solid var(--border-base)';
}

export function WeeklyCalendar({
    days,
    weekLabel,
    onDayClick,
    currentWeek,
    totalWeeks,
    onPrevWeek,
    onNextWeek,
}: WeeklyCalendarProps) {
    const hasNavigation = currentWeek !== undefined && totalWeeks !== undefined;
    const isMobile = useIsMobile();
    const scrollRef = useRef<HTMLDivElement>(null);
    const todayRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to today on mobile
    useEffect(() => {
        if (isMobile && todayRef.current && scrollRef.current) {
            // Small delay to ensure layout is complete
            const timer = setTimeout(() => {
                todayRef.current?.scrollIntoView({
                    inline: 'center',
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isMobile, days]);

    return (
        <div className="v3-card p-4 md:p-5">
            {/* Header with optional week navigation */}
            <div className="flex items-center justify-between mb-4">
                {weekLabel && (
                    <p className="v3-mono v3-body-sm" style={{ color: 'var(--text-muted)' }}>
                        {weekLabel}
                    </p>
                )}

                {hasNavigation && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onPrevWeek}
                            disabled={currentWeek <= 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{
                                background: currentWeek > 1 ? 'var(--bg-muted)' : 'transparent',
                                color: currentWeek > 1 ? 'var(--text-base)' : 'var(--text-subtle)',
                                cursor: currentWeek > 1 ? 'pointer' : 'not-allowed',
                                opacity: currentWeek > 1 ? 1 : 0.5,
                            }}
                            aria-label="Previous week"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="v3-body-sm v3-mono" style={{ color: 'var(--text-muted)' }}>
                            {currentWeek} / {totalWeeks}
                        </span>
                        <button
                            onClick={onNextWeek}
                            disabled={currentWeek >= totalWeeks}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{
                                background: currentWeek < totalWeeks ? 'var(--bg-muted)' : 'transparent',
                                color: currentWeek < totalWeeks ? 'var(--text-base)' : 'var(--text-subtle)',
                                cursor: currentWeek < totalWeeks ? 'pointer' : 'not-allowed',
                                opacity: currentWeek < totalWeeks ? 1 : 0.5,
                            }}
                            aria-label="Next week"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile: Horizontal scroll with snap | Desktop: 7-col grid */}
            <div
                ref={scrollRef}
                className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-7 gap-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible scroll-smooth touch-pan-x"
                style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
                {days.map((day, index) => {
                    const isClickable = day.status !== 'rest' && (day.workoutId || day.date || onDayClick);
                    const cardContent = (
                        <>
                            {/* Day abbreviation */}
                            <p
                                className="v3-label mb-1"
                                style={{
                                    color: day.status === 'today'
                                        ? 'rgba(0,0,0,0.6)'
                                        : day.status === 'completed'
                                            ? 'var(--text-subtle)'
                                            : 'var(--text-muted)',
                                    fontWeight: day.status === 'today' ? 700 : 500,
                                }}
                            >
                                {day.day}
                            </p>

                            {/* Distance (main metric) */}
                            {day.distance && day.status !== 'rest' && (
                                <p
                                    className="v3-body font-semibold"
                                    style={{
                                        color: day.status === 'today'
                                            ? 'rgba(0,0,0,0.9)'
                                            : day.status === 'completed'
                                                ? 'var(--text-muted)'
                                                : 'var(--text-base)',
                                    }}
                                >
                                    {day.distance}<span className="v3-body-xs">mi</span>
                                </p>
                            )}

                            {/* Workout type label */}
                            <p
                                className="v3-body-xs"
                                style={{
                                    color: getLabelColor(day.workoutType, day.status),
                                    fontWeight: day.workoutType === 'long' && day.status !== 'completed' ? 600 : 400,
                                }}
                            >
                                {day.status === 'rest' ? '—' : day.label}
                            </p>

                            {/* Completed checkmark */}
                            {day.status === 'completed' && (
                                <div
                                    className="w-5 h-5 rounded-full mx-auto mt-2 flex items-center justify-center"
                                    style={{ background: 'var(--color-accent)' }}
                                >
                                    <CheckIcon size={12} className="text-black" />
                                </div>
                            )}

                            {/* Today indicator */}
                            {day.status === 'today' && (
                                <div className="mt-2 flex items-center justify-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-black/60" />
                                </div>
                            )}

                            {/* Strength indicator */}
                            {day.hasStrength && day.status !== 'rest' && day.status !== 'completed' && (
                                <p className="v3-body-xs mt-1" style={{ color: 'var(--color-strength)' }}>
                                    + Strength
                                </p>
                            )}
                        </>
                    );

                    const cardStyles = {
                        background: getWorkoutBackground(day.workoutType, day.status),
                        border: getBorderStyle(day.workoutType, day.status),
                        opacity: day.status === 'completed' ? 0.7 : day.status === 'rest' ? 0.5 : 1,
                        cursor: isClickable ? 'pointer' : 'default',
                    };

                    // Wrap in Link if we have a workout to link to
                    if (day.workoutId || day.date) {
                        const href = day.workoutId
                            ? `/workout/${day.workoutId}`
                            : `/workout/${day.date}`;

                        return (
                            <motion.div
                                key={day.day}
                                ref={day.status === 'today' ? todayRef : undefined}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.35,
                                    delay: 0.05 + index * 0.04,
                                    ease: [0.25, 0.46, 0.45, 0.94]
                                }}
                                className="snap-center flex-shrink-0 w-[85px] md:w-auto md:flex-shrink"
                            >
                                <Link
                                    href={href}
                                    className="text-center p-3 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.98] hover:shadow-md block h-full touch-target"
                                    style={{ ...cardStyles, minHeight: '100px' }}
                                >
                                    {cardContent}
                                </Link>
                            </motion.div>
                        );
                    }

                    // Fallback to button with onClick
                    return (
                        <motion.button
                            key={day.day}
                            type="button"
                            onClick={() => onDayClick?.(index)}
                            disabled={day.status === 'rest'}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.35,
                                delay: 0.05 + index * 0.04,
                                ease: [0.25, 0.46, 0.45, 0.94]
                            }}
                            className="text-center p-3 rounded-xl transition-all hover:scale-[1.03] hover:shadow-md h-full"
                            style={{ ...cardStyles, minHeight: '100px' }}
                        >
                            {cardContent}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Simple week data helper - enhanced with workout types
 */
export function createWeekData(
    days: Array<{
        type: string;
        done?: boolean;
        today?: boolean;
        distance?: number;
        pace?: string;
        hasStrength?: boolean;
        workoutId?: string;
        date?: string;
    }>
): DayData[] {
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    return days.map((d, i) => {
        // Map type string to WorkoutType
        const normalizedType = d.type.toLowerCase();
        let workoutType: WorkoutType = 'easy';

        if (normalizedType === 'rest' || normalizedType === '—') {
            workoutType = 'rest';
        } else if (normalizedType === 'long') {
            workoutType = 'long';
        } else if (normalizedType === 'tempo' || normalizedType === 'threshold') {
            workoutType = 'tempo';
        } else if (normalizedType === 'interval' || normalizedType === 'vo2' || normalizedType === 'speed') {
            workoutType = 'interval';
        } else if (normalizedType === 'marathon' || normalizedType === 'mp') {
            workoutType = 'marathon';
        } else if (normalizedType === 'recovery') {
            workoutType = 'recovery';
        } else if (normalizedType.includes('quality')) {
            workoutType = 'quality';
        }

        return {
            day: dayNames[i],
            label: d.type === 'rest' ? 'Rest' : d.type,
            status: d.today
                ? 'today'
                : d.done
                    ? 'completed'
                    : d.type === 'rest'
                        ? 'rest'
                        : 'upcoming',
            workoutType,
            distance: d.distance,
            pace: d.pace,
            hasStrength: d.hasStrength,
            workoutId: d.workoutId,
            date: d.date,
        };
    });
}
