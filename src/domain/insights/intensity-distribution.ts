/**
 * Intensity Distribution Module
 * 
 * Implements Seiler/Fitzgerald 80/20 polarized training analysis.
 * 
 * This is EDUCATIONAL ONLY — it shows users how their training distributed
 * across intensity zones, without modifying the plan itself. (Guided Mode)
 * 
 * Based on:
 * - Stephen Seiler's 3-zone model (VT1/VT2 thresholds)
 * - Matt Fitzgerald's 80/20 Running practical application
 * 
 * Zone Classification (from research/03-seiler-intensity.md):
 * - Zone 1 (Easy): Below VT1, conversational pace, RPE 1-4
 * - Zone 2 (Moderate): Between VT1-VT2, "gray zone", RPE 5-6
 * - Zone 3 (Hard): Above VT2, threshold and above, RPE 7-10
 * 
 * Target Distribution:
 * - Strict Polarized: 75-85% Easy, 0-5% Moderate, 10-20% Hard
 * - Marathon-Adapted: 70-85% Easy, 5-15% Moderate, 5-15% Hard
 */

// ============================================================================
// TYPES
// ============================================================================

export type SeilerZone = 'easy' | 'moderate' | 'hard';

export type IntensityVerdict = 'excellent' | 'good' | 'needs_attention';

export interface IntensityZone {
    zone: SeilerZone;
    label: string;
    minutes: number;
    percentage: number;
    color: string;
}

export interface WeeklyIntensityDistribution {
    zones: IntensityZone[];
    totalMinutes: number;
    easyPercentage: number;
    moderatePercentage: number;
    hardPercentage: number;
    isPolarized: boolean;
    verdict: IntensityVerdict;
    message: string;
    subtext: string;
    workoutCount: number;
    insufficientData: boolean; // < 3 workouts = not enough for reliable distribution
}

export interface WorkoutForIntensity {
    sessionType: string;
    durationMinutes: number;
    completed: 'full' | 'partial' | 'skipped';
    date: Date;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Zone colors from design system
 * Using brand-aligned colors for visual consistency
 */
export const ZONE_COLORS: Record<SeilerZone, string> = {
    easy: 'var(--color-accent)',        // Emerald green - majority of training
    moderate: 'var(--color-warning)',   // Orange - the "gray zone" to minimize
    hard: 'var(--color-durability)',    // Violet - quality work
} as const;

export const ZONE_LABELS: Record<SeilerZone, string> = {
    easy: 'Easy (Zone 1)',
    moderate: 'Moderate (Zone 2)',
    hard: 'Hard (Zone 3)',
} as const;

/**
 * Session type → Seiler zone mapping
 * 
 * Based on research/03-seiler-intensity.md:
 * - Zone 1: Below VT1 (easy, recovery, base runs)
 * - Zone 2: Between VT1-VT2 (marathon pace, steady state)
 * - Zone 3: Above VT2 (threshold, intervals, reps)
 */
/**
 * Session type → Seiler zone mapping
 * 
 * COMPLETE MAPPING aligned with actual WorkoutType enum from plan/types.ts:
 * - Zone 1: Below VT1 (easy, recovery, base runs, strides embedded in easy)
 * - Zone 2: Between VT1-VT2 (marathon pace, steady state - the "gray zone")
 * - Zone 3: Above VT2 (threshold, intervals, VO2max, repetitions)
 */
const SESSION_TYPE_TO_ZONE: Record<string, SeilerZone> = {
    // =========================================================================
    // Zone 1 - EASY (conversational, RPE 1-4)
    // =========================================================================
    'easy': 'easy',
    'recovery': 'easy',
    'rest': 'easy',
    'cross_train': 'easy',      // From WorkoutType
    'cross_training': 'easy',   // Alias
    'strides': 'easy',          // Strides are short accelerations within easy runs
    'walk': 'easy',
    'warmup': 'easy',
    'cooldown': 'easy',
    'base': 'easy',

    // Long runs - classified as EASY per Seiler (aerobic development)
    // Even with MP finish, the bulk of time is easy
    'long_easy': 'easy',        // From WorkoutType
    'long_progression': 'easy', // From WorkoutType
    'long_run': 'easy',         // Alias
    'long': 'easy',             // Alias

    // =========================================================================
    // Zone 2 - MODERATE (gray zone, minimize this, RPE 5-6)
    // =========================================================================
    'marathon_pace': 'moderate',
    'long_mp_finish': 'moderate',   // From WorkoutType - MP portion
    'long_fast_finish': 'moderate', // From WorkoutType - fast finish portion
    'steady_state': 'moderate',
    'aerobic': 'moderate',

    // =========================================================================
    // Zone 3 - HARD (quality work, above VT2, RPE 7-10)
    // =========================================================================
    // Threshold (T pace)
    'tempo': 'hard',
    'threshold': 'hard',        // From WorkoutType
    'cruise_intervals': 'hard', // From WorkoutType - T pace intervals

    // Intervals (I pace / VO2max)
    'vo2max_800s': 'hard',      // From WorkoutType
    'vo2max_1000s': 'hard',     // From WorkoutType
    'vo2max_1200s': 'hard',     // From WorkoutType
    'vo2max_mile': 'hard',      // From WorkoutType
    'intervals': 'hard',        // Alias
    'vo2max': 'hard',           // Alias

    // Repetition (R pace)
    'speed_200s': 'hard',       // From WorkoutType
    'speed_400s': 'hard',       // From WorkoutType
    'repetition': 'hard',       // Alias
    'speed': 'hard',            // Alias

    // Special quality sessions
    'race_simulation': 'hard',  // From WorkoutType
    'fartlek': 'hard',          // From WorkoutType
    'hills': 'hard',            // From WorkoutType
    'race': 'hard',             // Race effort
    'time_trial': 'hard',
} as const;

/**
 * Verdict messages with coach-rooted language
 */
const VERDICT_CONFIG: Record<IntensityVerdict, { message: string; subtext: string }> = {
    excellent: {
        message: "Great polarization! Your easy days are actually easy.",
        subtext: "This is exactly what Seiler's research recommends.",
    },
    good: {
        message: "Solid intensity balance this week.",
        subtext: "Keep those easy days conversational.",
    },
    needs_attention: {
        message: "Your easy days might be too hard.",
        subtext: "The 80/20 rule means 80% should feel truly easy.",
    },
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Classify a session type into Seiler zone
 * 
 * Falls back to 'easy' for unknown types (conservative assumption)
 */
export function classifySessionType(sessionType: string): SeilerZone {
    const normalized = sessionType.toLowerCase().replace(/[^a-z_]/g, '_');
    return SESSION_TYPE_TO_ZONE[normalized] ?? 'easy';
}

/**
 * Calculate weekly intensity distribution from workout logs
 * 
 * @param workouts - Array of completed workouts from the week
 * @returns WeeklyIntensityDistribution or null if insufficient data
 */
export function calculateIntensityDistribution(
    workouts: WorkoutForIntensity[]
): WeeklyIntensityDistribution | null {
    // Filter to completed workouts only
    const completed = workouts.filter(w =>
        w.completed === 'full' || w.completed === 'partial'
    );

    if (completed.length === 0) {
        return null;
    }

    // Accumulate minutes by zone
    const zoneMinutes: Record<SeilerZone, number> = {
        easy: 0,
        moderate: 0,
        hard: 0,
    };

    for (const workout of completed) {
        const zone = classifySessionType(workout.sessionType);
        zoneMinutes[zone] += workout.durationMinutes;
    }

    const totalMinutes = zoneMinutes.easy + zoneMinutes.moderate + zoneMinutes.hard;

    if (totalMinutes === 0) {
        return null;
    }

    // Calculate percentages
    const easyPercentage = Math.round((zoneMinutes.easy / totalMinutes) * 100);
    const moderatePercentage = Math.round((zoneMinutes.moderate / totalMinutes) * 100);
    const hardPercentage = Math.round((zoneMinutes.hard / totalMinutes) * 100);

    // Build zone objects for visualization
    const zones: IntensityZone[] = [
        {
            zone: 'easy',
            label: ZONE_LABELS.easy,
            minutes: Math.round(zoneMinutes.easy),
            percentage: easyPercentage,
            color: ZONE_COLORS.easy,
        },
        {
            zone: 'moderate',
            label: ZONE_LABELS.moderate,
            minutes: Math.round(zoneMinutes.moderate),
            percentage: moderatePercentage,
            color: ZONE_COLORS.moderate,
        },
        {
            zone: 'hard',
            label: ZONE_LABELS.hard,
            minutes: Math.round(zoneMinutes.hard),
            percentage: hardPercentage,
            color: ZONE_COLORS.hard,
        },
    ];

    // Determine if polarized and verdict
    const { isPolarized, verdict } = evaluatePolarization(
        easyPercentage,
        moderatePercentage,
        hardPercentage
    );

    const verdictConfig = VERDICT_CONFIG[verdict];

    return {
        zones,
        totalMinutes: Math.round(totalMinutes),
        easyPercentage,
        moderatePercentage,
        hardPercentage,
        isPolarized,
        verdict,
        message: verdictConfig.message,
        subtext: verdictConfig.subtext,
        workoutCount: completed.length,
        insufficientData: completed.length < 3,
    };
}

/**
 * Evaluate polarization quality
 * 
 * Based on Seiler's research:
 * - Excellent: Easy 75-85%, Moderate ≤5%, Hard 10-20%
 * - Good: Easy ≥70%, reasonable distribution
 * - Needs attention: Easy <70% OR Hard >25%
 */
export function evaluatePolarization(
    easyPct: number,
    moderatePct: number,
    hardPct: number
): { isPolarized: boolean; verdict: IntensityVerdict } {
    // Strict polarized criteria
    const isStrictlyPolarized =
        easyPct >= 75 &&
        easyPct <= 85 &&
        moderatePct <= 5 &&
        hardPct >= 10 &&
        hardPct <= 20;

    // Relaxed polarized (still good)
    const isRelaxedPolarized =
        easyPct >= 70 &&
        moderatePct <= 15 &&
        hardPct <= 25;

    if (isStrictlyPolarized) {
        return { isPolarized: true, verdict: 'excellent' };
    }

    if (isRelaxedPolarized) {
        return { isPolarized: true, verdict: 'good' };
    }

    // Not polarized
    return { isPolarized: false, verdict: 'needs_attention' };
}

/**
 * Get emoji for verdict (consistent with existing patterns)
 */
export function getVerdictEmoji(verdict: IntensityVerdict): string {
    const emojis: Record<IntensityVerdict, string> = {
        excellent: '✓',
        good: '👍',
        needs_attention: '⚠️',
    };
    return emojis[verdict];
}

/**
 * Format minutes as human-readable duration
 */
export function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
}
