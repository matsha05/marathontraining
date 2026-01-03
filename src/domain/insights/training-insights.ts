/**
 * Training Insights - Coach-Rooted Metrics
 * 
 * Based on what coaches actually care about:
 * - Hansons: Consistency (cumulative fatigue only works if you show up)
 * - Seiler: Effort calibration (are you going too hard on easy days?)
 * - Daniels: Week-over-week progression
 * - Dicharry: Movement quality trends
 */

export interface WorkoutLog {
    id: string;
    date: Date;
    sessionType: string;
    domain: 'running' | 'strength' | 'durability';
    completed: 'full' | 'partial' | 'skipped';
    feelRating?: number; // 1-5
    plannedDuration: number;
    actualDuration?: number;
}

export interface TrainingInsights {
    // Consistency (Hansons)
    currentStreak: number;
    longestStreak: number;
    completionRate30Days: number;
    missedWorkouts30Days: number;

    // Effort Calibration (Seiler)
    averageFeel30Days: number;
    easyDayAverageFeel: number;  // Should be 3 (Right) - going too hard?
    hardDayAverageFeel: number;  // Should be 2-3 - appropriate challenge

    // Feel Trends
    feelTrend: 'improving' | 'stable' | 'declining';
    lastWeekFeelAvg: number;
    previousWeekFeelAvg: number;

    // Red Flags
    redFlags: RedFlag[];
}

export interface RedFlag {
    type: 'overreaching' | 'easy_too_hard' | 'skipping_pattern' | 'declining_feel';
    message: string;
    severity: 'warning' | 'alert';
}

/**
 * Calculate training insights from workout logs
 */
export function calculateInsights(logs: WorkoutLog[]): TrainingInsights {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Filter to relevant periods
    const last30 = logs.filter(l => l.date >= thirtyDaysAgo);
    const lastWeek = logs.filter(l => l.date >= sevenDaysAgo);
    const prevWeek = logs.filter(l => l.date >= fourteenDaysAgo && l.date < sevenDaysAgo);

    // Completion rate
    const completed = last30.filter(l => l.completed === 'full' || l.completed === 'partial');
    const completionRate = last30.length > 0 ? (completed.length / last30.length) * 100 : 0;
    const missedWorkouts = last30.filter(l => l.completed === 'skipped').length;

    // Feel averages
    const withFeel = last30.filter(l => l.feelRating);
    const avgFeel = withFeel.length > 0
        ? withFeel.reduce((s, l) => s + (l.feelRating || 0), 0) / withFeel.length
        : 0;

    // Easy vs hard day feels (Seiler calibration)
    const easyDays = withFeel.filter(l => l.sessionType === 'easy' || l.sessionType === 'recovery');
    const hardDays = withFeel.filter(l => ['tempo', 'intervals', 'long_run'].includes(l.sessionType));

    const easyDayAvg = easyDays.length > 0
        ? easyDays.reduce((s, l) => s + (l.feelRating || 0), 0) / easyDays.length
        : 3;

    const hardDayAvg = hardDays.length > 0
        ? hardDays.reduce((s, l) => s + (l.feelRating || 0), 0) / hardDays.length
        : 3;

    // Week-over-week feel trend
    const lastWeekFeel = lastWeek.filter(l => l.feelRating);
    const prevWeekFeel = prevWeek.filter(l => l.feelRating);

    const lastWeekAvg = lastWeekFeel.length > 0
        ? lastWeekFeel.reduce((s, l) => s + (l.feelRating || 0), 0) / lastWeekFeel.length
        : 3;

    const prevWeekAvg = prevWeekFeel.length > 0
        ? prevWeekFeel.reduce((s, l) => s + (l.feelRating || 0), 0) / prevWeekFeel.length
        : 3;

    const feelTrend: TrainingInsights['feelTrend'] =
        lastWeekAvg > prevWeekAvg + 0.3 ? 'improving' :
            lastWeekAvg < prevWeekAvg - 0.3 ? 'declining' : 'stable';

    // Calculate streaks
    const { currentStreak, longestStreak } = calculateStreaks(logs);

    // Detect red flags
    const redFlags = detectRedFlags({
        completionRate,
        avgFeel,
        easyDayAvg,
        hardDayAvg,
        feelTrend,
        lastWeekAvg,
        missedWorkouts,
    });

    return {
        currentStreak,
        longestStreak,
        completionRate30Days: Math.round(completionRate),
        missedWorkouts30Days: missedWorkouts,
        averageFeel30Days: Math.round(avgFeel * 10) / 10,
        easyDayAverageFeel: Math.round(easyDayAvg * 10) / 10,
        hardDayAverageFeel: Math.round(hardDayAvg * 10) / 10,
        feelTrend,
        lastWeekFeelAvg: Math.round(lastWeekAvg * 10) / 10,
        previousWeekFeelAvg: Math.round(prevWeekAvg * 10) / 10,
        redFlags,
    };
}

function calculateStreaks(logs: WorkoutLog[]): { currentStreak: number; longestStreak: number } {
    // Sort by date, most recent first
    const sorted = [...logs].sort((a, b) => b.date.getTime() - a.date.getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let previousDate: Date | null = null;

    for (const log of sorted) {
        const completed = log.completed === 'full' || log.completed === 'partial';

        if (completed) {
            if (previousDate === null) {
                // First workout
                tempStreak = 1;
                currentStreak = 1;
            } else {
                // Check if consecutive day
                const dayDiff = (previousDate.getTime() - log.date.getTime()) / (24 * 60 * 60 * 1000);
                if (dayDiff <= 1.5) { // Allow some flexibility
                    tempStreak++;
                } else {
                    tempStreak = 1;
                }
            }
            longestStreak = Math.max(longestStreak, tempStreak);
            previousDate = log.date;
        } else {
            // Break in current streak
            if (currentStreak === 0) currentStreak = tempStreak;
            tempStreak = 0;
            previousDate = log.date;
        }
    }

    return { currentStreak, longestStreak };
}

function detectRedFlags(data: {
    completionRate: number;
    avgFeel: number;
    easyDayAvg: number;
    hardDayAvg: number;
    feelTrend: TrainingInsights['feelTrend'];
    lastWeekAvg: number;
    missedWorkouts: number;
}): RedFlag[] {
    const flags: RedFlag[] = [];

    // Easy days too hard (Seiler violation)
    if (data.easyDayAvg < 2.5) {
        flags.push({
            type: 'easy_too_hard',
            message: 'Easy days feeling hard. You might be running them too fast.',
            severity: 'warning',
        });
    }

    // Overreaching: everything feels hard
    if (data.avgFeel < 2.2) {
        flags.push({
            type: 'overreaching',
            message: 'Most workouts feeling tough. Consider a recovery week.',
            severity: 'alert',
        });
    }

    // Declining feel trend
    if (data.feelTrend === 'declining' && data.lastWeekAvg < 2.5) {
        flags.push({
            type: 'declining_feel',
            message: 'Workouts trending harder. Watch for overtraining signs.',
            severity: 'warning',
        });
    }

    // Skipping pattern
    if (data.missedWorkouts >= 4) {
        flags.push({
            type: 'skipping_pattern',
            message: `Missed ${data.missedWorkouts} workouts this month. Consistency is key.`,
            severity: data.missedWorkouts >= 6 ? 'alert' : 'warning',
        });
    }

    return flags;
}

/**
 * Get feel rating label
 */
export function getFeelLabel(rating: number): string {
    const labels: Record<number, string> = {
        1: 'Struggled',
        2: 'Tough',
        3: 'Right',
        4: 'Strong',
        5: 'Crushing',
    };
    return labels[rating] || 'Unknown';
}

/**
 * Get feel rating emoji
 */
export function getFeelEmoji(rating: number): string {
    const emojis: Record<number, string> = {
        1: '😫',
        2: '😓',
        3: '😌',
        4: '💪',
        5: '🔥',
    };
    return emojis[rating] || '❓';
}
