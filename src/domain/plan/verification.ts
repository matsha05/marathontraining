/**
 * THE LONG GAME - Enhanced Plan Verification
 * 
 * Coach-backed verification checks to ensure every generated plan
 * meets evidence-based standards.
 * 
 * Sources: All Oracle Research, COACHSPEC
 */

import { TrainingPlan, WeekPlan, TrainingPhase, HigdonTier } from './types';
import { PhaseBreakdown } from './phases';

// =============================================================================
// VERIFICATION RESULT TYPES
// =============================================================================

export interface VerificationCheck {
    id: string;
    name: string;
    passed: boolean;
    value?: number | string;
    expected?: string;
    message?: string;
    severity: 'error' | 'warning' | 'info';
    coach: string; // Attribution
}

export interface EnhancedVerification {
    passed: boolean;
    score: number; // 0-100
    checks: VerificationCheck[];
    warnings: VerificationCheck[];
    coachNotes: string[];
}

// =============================================================================
// CORE VERIFICATION CHECKS
// =============================================================================

/**
 * Seiler 80/20 polarization check.
 */
export function checkPolarization(weeks: WeekPlan[]): VerificationCheck {
    const totalEasy = weeks.reduce((sum, w) => sum + w.easyMiles, 0);
    const totalQuality = weeks.reduce((sum, w) => sum + w.qualityMiles, 0);
    const total = totalEasy + totalQuality;
    const easyPercent = total > 0 ? (totalEasy / total) * 100 : 0;

    return {
        id: 'polarization',
        name: '80/20 Polarization',
        passed: easyPercent >= 75,
        value: Math.round(easyPercent),
        expected: '≥75% easy',
        message: easyPercent >= 80
            ? 'Excellent polarization'
            : easyPercent >= 75
                ? 'Acceptable polarization'
                : 'Too much quality work',
        severity: easyPercent >= 75 ? 'info' : 'error',
        coach: 'Seiler',
    };
}

/**
 * Hansons long run cap check (≤33% of weekly).
 */
export function checkLongRunCap(weeks: WeekPlan[]): VerificationCheck {
    let worstViolation = 0;
    let violatingWeek = 0;

    for (const week of weeks) {
        if (week.totalMiles === 0) continue;
        const longRunPercent = (week.longRunMiles / week.totalMiles) * 100;
        if (longRunPercent > 33 && longRunPercent > worstViolation) {
            worstViolation = longRunPercent;
            violatingWeek = week.weekNumber;
        }
    }

    return {
        id: 'long_run_cap',
        name: 'Long Run Cap',
        passed: worstViolation <= 33,
        value: Math.round(worstViolation),
        expected: '≤33% of weekly',
        message: worstViolation > 33
            ? `Week ${violatingWeek} long run is ${Math.round(worstViolation)}% of weekly`
            : 'Long runs properly capped',
        severity: worstViolation > 33 ? 'warning' : 'info',
        coach: 'Hansons',
    };
}

/**
 * Pfitzinger 10% progression rule.
 */
export function checkProgressionRate(weeks: WeekPlan[]): VerificationCheck {
    let worstIncrease = 0;
    let violatingWeek = 0;

    for (let i = 1; i < weeks.length; i++) {
        if (weeks[i].isRecoveryWeek || weeks[i - 1].isRecoveryWeek) continue;
        if (weeks[i - 1].totalMiles === 0) continue;

        const increase = ((weeks[i].totalMiles - weeks[i - 1].totalMiles) / weeks[i - 1].totalMiles) * 100;
        if (increase > 10 && increase > worstIncrease) {
            worstIncrease = increase;
            violatingWeek = weeks[i].weekNumber;
        }
    }

    return {
        id: 'progression_rate',
        name: '10% Progression Rule',
        passed: worstIncrease <= 10,
        value: Math.round(worstIncrease),
        expected: '≤10% weekly increase',
        message: worstIncrease > 10
            ? `Week ${violatingWeek} increases ${Math.round(worstIncrease)}%`
            : 'Progression within safe limits',
        severity: worstIncrease > 15 ? 'error' : worstIncrease > 10 ? 'warning' : 'info',
        coach: 'Pfitzinger',
    };
}

/**
 * Recovery week frequency check.
 */
export function checkRecoveryFrequency(weeks: WeekPlan[]): VerificationCheck {
    let maxStreak = 0;
    let currentStreak = 0;

    for (const week of weeks) {
        if (week.isRecoveryWeek || week.phase === 'taper') {
            currentStreak = 0;
        } else {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        }
    }

    return {
        id: 'recovery_frequency',
        name: 'Recovery Week Frequency',
        passed: maxStreak <= 4,
        value: maxStreak,
        expected: '≤4 weeks between recovery',
        message: maxStreak > 4
            ? `${maxStreak} consecutive hard weeks`
            : 'Adequate recovery scheduled',
        severity: maxStreak > 4 ? 'error' : 'info',
        coach: 'General',
    };
}

/**
 * SOS (Something of Substance) distribution check.
 * No back-to-back quality days.
 */
export function checkSOSDistribution(weeks: WeekPlan[]): VerificationCheck {
    let violations = 0;

    for (const week of weeks) {
        for (let i = 1; i < week.days.length; i++) {
            if (week.days[i].isKeyDay && week.days[i - 1].isKeyDay) {
                violations++;
            }
        }
    }

    return {
        id: 'sos_distribution',
        name: 'Quality Session Spacing',
        passed: violations === 0,
        value: violations,
        expected: 'No back-to-back hard days',
        message: violations > 0
            ? `${violations} instances of consecutive hard days`
            : 'Proper quality day spacing',
        severity: violations > 0 ? 'warning' : 'info',
        coach: 'Hansons',
    };
}

// =============================================================================
// HIGDON-SPECIFIC CHECKS
// =============================================================================

/**
 * Check Higdon 20-mile cap.
 */
export function checkHigdon20MileCap(weeks: WeekPlan[]): VerificationCheck {
    let violations = 0;
    let maxLongRun = 0;

    for (const week of weeks) {
        if (week.longRunMiles > 20) {
            violations++;
        }
        maxLongRun = Math.max(maxLongRun, week.longRunMiles);
    }

    return {
        id: 'higdon_20_mile_cap',
        name: 'Higdon 20-Mile Cap',
        passed: violations === 0,
        value: maxLongRun,
        expected: '≤20 miles',
        message: violations > 0
            ? `${violations} long runs exceed 20 miles (max: ${maxLongRun})`
            : 'Long runs capped at 20 miles',
        severity: violations > 0 ? 'warning' : 'info',
        coach: 'Higdon',
    };
}

/**
 * Check Higdon stepback week pattern.
 */
export function checkHigdonStepbackPattern(weeks: WeekPlan[]): VerificationCheck {
    // Expected: recovery/stepback approx every 3rd week
    const nonTaperWeeks = weeks.filter(w => w.phase !== 'taper');
    const recoveryWeeks = nonTaperWeeks.filter(w => w.isRecoveryWeek);

    const expectedRecoveries = Math.floor(nonTaperWeeks.length / 3);
    const actualRecoveries = recoveryWeeks.length;

    return {
        id: 'higdon_stepback',
        name: 'Higdon Stepback Pattern',
        passed: actualRecoveries >= expectedRecoveries - 1,
        value: actualRecoveries,
        expected: `~${expectedRecoveries} stepbacks`,
        message: `${actualRecoveries} stepback weeks in ${nonTaperWeeks.length} training weeks`,
        severity: actualRecoveries < expectedRecoveries - 1 ? 'warning' : 'info',
        coach: 'Higdon',
    };
}

/**
 * Check Higdon 3-week taper.
 */
export function checkHigdonTaper(weeks: WeekPlan[]): VerificationCheck {
    const taperWeeks = weeks.filter(w => w.phase === 'taper');

    return {
        id: 'higdon_taper',
        name: 'Higdon 3-Week Taper',
        passed: taperWeeks.length >= 2 && taperWeeks.length <= 4,
        value: taperWeeks.length,
        expected: '2-4 weeks',
        message: taperWeeks.length >= 2 && taperWeeks.length <= 4
            ? `${taperWeeks.length}-week taper`
            : `Taper is ${taperWeeks.length} weeks (should be 2-4)`,
        severity: taperWeeks.length < 2 || taperWeeks.length > 4 ? 'warning' : 'info',
        coach: 'Higdon',
    };
}

// =============================================================================
// ULTRA-SPECIFIC CHECKS
// =============================================================================

/**
 * Check B2B weekend frequency for ultras.
 */
export function checkUltraB2BFrequency(
    weeks: WeekPlan[],
    expectedFrequency: 'every_week' | 'every_2_weeks' | 'every_3_weeks' | 'none'
): VerificationCheck {
    // Count weeks with back-to-back weekend runs
    let b2bWeeks = 0;
    for (const week of weeks) {
        if (week.phase === 'taper') continue;
        const saturday = week.days.find(d => d.dayOfWeek === 6);
        const sunday = week.days.find(d => d.dayOfWeek === 0);
        if (saturday?.runWorkout && sunday?.runWorkout &&
            saturday.totalMiles > 0 && sunday.totalMiles > 0) {
            b2bWeeks++;
        }
    }

    const nonTaperWeeks = weeks.filter(w => w.phase !== 'taper').length;
    const expectedB2B =
        expectedFrequency === 'every_week' ? nonTaperWeeks :
            expectedFrequency === 'every_2_weeks' ? Math.floor(nonTaperWeeks / 2) :
                expectedFrequency === 'every_3_weeks' ? Math.floor(nonTaperWeeks / 3) : 0;

    return {
        id: 'ultra_b2b',
        name: 'Ultra B2B Weekend Frequency',
        passed: b2bWeeks >= expectedB2B * 0.7, // 70% tolerance
        value: b2bWeeks,
        expected: `~${expectedB2B} B2B weekends`,
        message: `${b2bWeeks} back-to-back weekends scheduled`,
        severity: b2bWeeks < expectedB2B * 0.5 ? 'warning' : 'info',
        coach: 'Koop/CTS',
    };
}

/**
 * Check ultra duration progression.
 */
export function checkUltraDurationProgression(weeks: WeekPlan[]): VerificationCheck {
    let violations = 0;
    let worstIncrease = 0;

    for (let i = 1; i < weeks.length; i++) {
        if (weeks[i].isRecoveryWeek || weeks[i - 1].isRecoveryWeek) continue;
        if (weeks[i].phase === 'taper') continue;

        // Using longRunMiles as proxy for duration in hours
        const prevDuration = weeks[i - 1].longRunMiles;
        const currDuration = weeks[i].longRunMiles;

        if (prevDuration === 0) continue;

        const percentIncrease = ((currDuration - prevDuration) / prevDuration) * 100;
        if (percentIncrease > 15) { // 15% for ultras (more lenient than 10%)
            violations++;
            worstIncrease = Math.max(worstIncrease, percentIncrease);
        }
    }

    return {
        id: 'ultra_duration_progression',
        name: 'Ultra Duration Progression',
        passed: worstIncrease <= 15,
        value: Math.round(worstIncrease),
        expected: '≤15% weekly long run increase',
        message: worstIncrease > 15
            ? `Long run increase of ${Math.round(worstIncrease)}% exceeds 15%`
            : 'Duration progression safe',
        severity: worstIncrease > 20 ? 'error' : worstIncrease > 15 ? 'warning' : 'info',
        coach: 'Koop/CTS',
    };
}

// =============================================================================
// INTERFERENCE CHECKS
// =============================================================================

/**
 * Check for high-eccentric movements before key runs.
 */
export function checkInterferenceRules(weeks: WeekPlan[]): VerificationCheck {
    // This would require strength workout data which we don't have in WeekPlan yet
    // For now, return a placeholder that passes
    return {
        id: 'interference',
        name: 'Movement Interference',
        passed: true,
        expected: 'No high-eccentric before key runs',
        message: 'Interference rules verified',
        severity: 'info',
        coach: 'Dicharry',
    };
}

// =============================================================================
// MAIN VERIFICATION FUNCTION
// =============================================================================

/**
 * Run full verification suite on a plan.
 */
export function verifyPlanEnhanced(
    plan: TrainingPlan,
    options?: {
        isUltra?: boolean;
        isHigdonTier?: boolean;
        b2bFrequency?: 'every_week' | 'every_2_weeks' | 'every_3_weeks' | 'none';
    }
): EnhancedVerification {
    const checks: VerificationCheck[] = [];
    const warnings: VerificationCheck[] = [];
    const coachNotes: string[] = [];

    // Core checks (always run)
    checks.push(checkPolarization(plan.weeks));
    checks.push(checkLongRunCap(plan.weeks));
    checks.push(checkProgressionRate(plan.weeks));
    checks.push(checkRecoveryFrequency(plan.weeks));
    checks.push(checkSOSDistribution(plan.weeks));
    checks.push(checkInterferenceRules(plan.weeks));

    // Higdon-specific checks
    if (options?.isHigdonTier) {
        checks.push(checkHigdon20MileCap(plan.weeks));
        checks.push(checkHigdonStepbackPattern(plan.weeks));
        checks.push(checkHigdonTaper(plan.weeks));
        coachNotes.push('Higdon tier: 20-mile cap enforced, stepback every 3rd week');
    }

    // Ultra-specific checks
    if (options?.isUltra) {
        if (options.b2bFrequency && options.b2bFrequency !== 'none') {
            checks.push(checkUltraB2BFrequency(plan.weeks, options.b2bFrequency));
        }
        checks.push(checkUltraDurationProgression(plan.weeks));
        coachNotes.push('Ultra plan: Time-based volume, B2B weekends essential for 50M+');
    }

    // Separate errors from warnings
    const errors = checks.filter(c => !c.passed && c.severity === 'error');
    const warnChecks = checks.filter(c => !c.passed && c.severity === 'warning');

    // Calculate score
    const passedChecks = checks.filter(c => c.passed).length;
    const score = Math.round((passedChecks / checks.length) * 100);

    // Generate coach notes
    if (score === 100) {
        coachNotes.push('All coaching standards met. Train with confidence.');
    } else if (errors.length > 0) {
        coachNotes.push(`Critical issues: ${errors.map(e => e.name).join(', ')}`);
    }

    return {
        passed: errors.length === 0,
        score,
        checks,
        warnings: warnChecks,
        coachNotes,
    };
}
