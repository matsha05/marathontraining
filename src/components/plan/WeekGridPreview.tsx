"use client";

/**
 * WeekGridPreview
 * 
 * The beautiful week grid from the landing page, now reusable.
 * Displays a 7-day overview of workouts with visual distinction for
 * workout types, rest days, and long runs.
 * 
 * V2 Design System - 100% token usage
 */

import { motion } from 'framer-motion';
import { WeekRow } from '@/components/ui/WeekRow';

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export interface WeekDay {
    day: string;
    type: 'run' | 'rest' | 'long';
    label: string;
    sub?: string;
    strength?: boolean;
}

interface WeekGridPreviewProps {
    days: WeekDay[];
    weekLabel?: string;
    animate?: boolean;
    compact?: boolean;
}

export function WeekGridPreview({
    days,
    weekLabel,
    animate = true,
    compact = false,
}: WeekGridPreviewProps) {
    const cardWidthClass = compact ? 'w-[70px]' : 'w-[84px]';

    const dayCards = days.map((d, i) => {
        const content = (
            <div
                className={`p-${compact ? '3' : '4'} rounded-lg text-center transition-all duration-200`}
                style={{
                    background: d.type === "long"
                        ? 'var(--color-accent-subtle)'
                        : d.type === "rest"
                            ? 'var(--bg-elevated)'
                            : 'var(--bg-muted)',
                }}
            >
                <p className="text-[10px] mb-2" style={{ color: 'var(--text-subtle)' }}>{d.day}</p>
                <p
                    className={`${compact ? 'text-xs' : 'text-sm'} mb-1`}
                    style={{ color: d.type === "rest" ? 'var(--text-subtle)' : 'var(--text-muted)' }}
                >
                    {d.label}
                </p>
                {d.sub && (
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-subtle)' }}>{d.sub}</p>
                )}
                {d.strength && (
                    <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border-base)' }}>
                        <p className="text-[10px]" style={{ color: 'var(--color-strength)' }}>+ Strength</p>
                    </div>
                )}
            </div>
        );

        if (animate) {
            return (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4, ease }}
                    className={`snap-center flex-shrink-0 ${cardWidthClass} md:w-auto md:flex-shrink`}
                >
                    {content}
                </motion.div>
            );
        }
        return (
            <div key={i} className={`snap-center flex-shrink-0 ${cardWidthClass} md:w-auto md:flex-shrink`}>
                {content}
            </div>
        );
    });

    return (
        <div>
            {weekLabel && (
                <p className="text-xs mb-3 font-mono" style={{ color: 'var(--text-subtle)' }}>
                    {weekLabel}
                </p>
            )}
            <WeekRow
                variant={compact ? 'compact' : 'app'}
                style={{ scrollbarWidth: 'none' }}
            >
                {dayCards}
            </WeekRow>
        </div>
    );
}

/**
 * Generate WeekDay array from a week plan
 */
export function weekPlanToGridDays(
    weekPlan: {
        days: Array<{
            dayOfWeek: number;
            runWorkout?: { type: string; totalDistance: number; name: string };
            strengthWorkout?: object;
        }>;
    },
    formatPace?: (type: string) => string
): WeekDay[] {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const shortDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return [0, 1, 2, 3, 4, 5, 6].map(dayNum => {
        const dayPlan = weekPlan.days.find(d => d.dayOfWeek === dayNum);

        if (!dayPlan || (!dayPlan.runWorkout && !dayPlan.strengthWorkout)) {
            return {
                day: shortDays[dayNum],
                type: 'rest' as const,
                label: 'Rest',
            };
        }

        if (dayPlan.runWorkout) {
            const run = dayPlan.runWorkout;
            const isLong = run.type.includes('long') || run.type === 'long_easy' || run.type === 'long_progression' || run.type === 'long_mp_finish';
            const distance = Math.round(run.totalDistance * 10) / 10;

            return {
                day: shortDays[dayNum],
                type: isLong ? 'long' as const : 'run' as const,
                label: isLong ? `${distance}mi Long` : `${distance}mi ${formatLabel(run.type)}`,
                sub: formatPace ? formatPace(run.type) : undefined,
                strength: !!dayPlan.strengthWorkout,
            };
        }

        // Strength only day
        return {
            day: shortDays[dayNum],
            type: 'run' as const,
            label: 'Strength',
            strength: true,
        };
    });
}

function formatLabel(type: string): string {
    switch (type) {
        case 'easy': return 'Easy';
        case 'recovery': return 'Easy';
        case 'tempo': return 'Tempo';
        case 'threshold': return 'Tempo';
        case 'vo2max_800s': return '800s';
        case 'vo2max_1000s': return '1Ks';
        case 'vo2max_1200s': return '1200s';
        case 'cruise_intervals': return 'Cruise';
        case 'fartlek': return 'Fartlek';
        default: return type.replace(/_/g, ' ');
    }
}
