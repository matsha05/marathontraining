/**
 * THE LONG GAME - Plan Generator
 * 
 * The main orchestrator that brings together all coaching principles
 * to generate a complete, personalized training plan.
 * 
 * This is the brain of the app.
 */

import {
    TrainingPlan,
    WeekPlan,
    DayPlan,
    Workout,
    PlanGenerationInput,
    PlanVerification,
    VerificationCheck,
    VERIFICATION_CHECKS,
    TrainingPhase,
} from './types';
import { calculatePhases, scheduleRecoveryWeeks, isRecoveryWeek, PhaseBreakdown } from './phases';
import {
    calculatePeakMileage,
    generateMileageProgression,
    calculateLongRun,
    calculateIntensityDistribution,
} from './mileage';
import { calculateTrainingPaces } from '../vdot/vdot-estimator';
import {
    getTemplatesForPhase,
    TEMPO_TEMPLATES,
    INTERVAL_TEMPLATES,
    LONG_RUN_TEMPLATES,
    EASY_TEMPLATES,
    buildWorkout,
    WorkoutTemplate,
} from './workouts/templates';

// =============================================================================
// MAIN GENERATOR FUNCTION
// =============================================================================

/**
 * Generate a complete training plan from onboarding input.
 */
export function generatePlan(input: PlanGenerationInput): TrainingPlan {
    // Step 1: Calculate weeks to race
    const weeksToRace = input.raceDate
        ? calculateWeeksToRace(input.raceDate)
        : input.fitnessDuration === '8weeks' ? 8 : input.fitnessDuration === '12weeks' ? 12 : 16;

    // Step 2: Calculate training paces from VDOT
    const paces = calculateTrainingPaces(input.vdot);

    // Step 3: Calculate phases
    const phases = calculatePhases(weeksToRace, input.goalDistance);

    // Step 4: Schedule recovery weeks
    const recoveryWeeks = scheduleRecoveryWeeks(weeksToRace, phases);

    // Step 5: Calculate peak mileage
    const peakMileage = calculatePeakMileage(
        input.goalDistance,
        input.weeklyMiles,
        input.availableDays,
        input.trainingIntensity,
        weeksToRace
    );

    // Step 6: Generate mileage progression
    const weeklyMileages = generateMileageProgression(
        input.weeklyMiles,
        peakMileage,
        phases,
        recoveryWeeks
    );

    // Step 7: Generate each week's plan
    const weeks: WeekPlan[] = [];
    let peakWeek = 1;
    let maxMileage = 0;

    for (let weekNum = 1; weekNum <= weeksToRace; weekNum++) {
        const week = generateWeek(
            weekNum,
            weeklyMileages[weekNum - 1],
            phases,
            recoveryWeeks,
            input,
            paces
        );
        weeks.push(week);

        if (week.totalMiles > maxMileage) {
            maxMileage = week.totalMiles;
            peakWeek = weekNum;
        }
    }

    // Step 8: Verify the plan
    const verification = verifyPlan(weeks, phases);

    // Step 9: Build the complete plan
    const plan: TrainingPlan = {
        id: `plan-${Date.now()}`,
        createdAt: new Date().toISOString(),
        athleteName: input.name,
        vdot: input.vdot,
        goalDistance: input.goalDistance,
        raceName: input.raceName,
        raceDate: input.raceDate,
        weeks,
        totalWeeks: weeksToRace,
        phases: phases.map(p => ({
            phase: p.phase,
            startWeek: p.startWeek,
            endWeek: p.endWeek,
            weeks: p.weeks,
        })),
        peakMileage: maxMileage,
        peakWeek,
        totalMiles: weeks.reduce((sum, w) => sum + w.totalMiles, 0),
        paces,
        injuryModifications: getInjuryModifications(input),
        intensityLevel: input.trainingIntensity,
        verification,
    };

    return plan;
}

// =============================================================================
// WEEK GENERATOR
// =============================================================================

function generateWeek(
    weekNumber: number,
    targetMileage: number,
    phases: PhaseBreakdown[],
    recoveryWeeks: number[],
    input: PlanGenerationInput,
    paces: ReturnType<typeof calculateTrainingPaces>
): WeekPlan {
    const phase = phases.find(p => weekNumber >= p.startWeek && weekNumber <= p.endWeek)!;
    const isRecovery = isRecoveryWeek(weekNumber, recoveryWeeks);

    // Calculate intensity distribution
    const distribution = calculateIntensityDistribution(targetMileage, phase.phase, isRecovery);

    // Calculate long run distance
    const longRunMiles = calculateLongRun(
        targetMileage,
        input.goalDistance,
        phase.phase,
        input.trainingIntensity
    );

    // Generate days
    const days = generateWeekDays(
        weekNumber,
        targetMileage,
        longRunMiles,
        phase.phase,
        isRecovery,
        input,
        paces
    );

    // Count key workouts
    const keyWorkouts = days.filter(d => d.isKeyDay).length;

    return {
        weekNumber,
        weekOf: getWeekStartDate(weekNumber, input.raceDate),
        phase: phase.phase,
        phaseWeek: weekNumber - phase.startWeek + 1,
        days,
        totalMiles: targetMileage,
        longRunMiles,
        easyMiles: distribution.easyMiles,
        qualityMiles: distribution.qualityMiles,
        easyPercentage: distribution.easyPercentage,
        keyWorkouts,
        isRecoveryWeek: isRecovery,
        focus: getWeekFocus(phase.phase, weekNumber - phase.startWeek + 1, isRecovery),
    };
}

// =============================================================================
// DAY GENERATOR
// =============================================================================

function generateWeekDays(
    weekNumber: number,
    weeklyMileage: number,
    longRunMiles: number,
    phase: TrainingPhase,
    isRecovery: boolean,
    input: PlanGenerationInput,
    paces: ReturnType<typeof calculateTrainingPaces>
): DayPlan[] {
    const days: DayPlan[] = [];

    // Determine day structure based on available days
    const structure = getWeekStructure(input.availableDays, input.longRunDay, isRecovery);

    // Calculate remaining mileage after long run
    const remainingMiles = weeklyMileage - longRunMiles;
    const runDays = structure.filter(d => d.type !== 'rest').length - 1; // Minus long run day
    const avgEasyRun = runDays > 0 ? remainingMiles / runDays : 0;

    // Select quality workouts for the week
    const qualityWorkouts = selectQualityWorkouts(phase, isRecovery, input.goalDistance);
    let qualityIndex = 0;

    for (let i = 0; i < 7; i++) {
        const dayInfo = structure[i];
        const date = getDateForDay(weekNumber, i, input.raceDate);

        let runWorkout: Workout | null = null;
        let isKeyDay = false;

        if (dayInfo.type === 'long') {
            // Long run day
            const template = selectLongRunTemplate(phase, input.goalDistance);
            runWorkout = buildWorkout(template, paces, longRunMiles);
            isKeyDay = true;
        } else if (dayInfo.type === 'quality' && qualityIndex < qualityWorkouts.length) {
            // Quality day (SOS)
            const template = qualityWorkouts[qualityIndex];
            const miles = Math.min(template.maxMiles, avgEasyRun * 1.3);
            runWorkout = buildWorkout(template, paces, miles);
            isKeyDay = true;
            qualityIndex++;
        } else if (dayInfo.type === 'easy') {
            // Easy day
            const template = isRecovery ? EASY_TEMPLATES[1] : EASY_TEMPLATES[0]; // recovery vs easy
            runWorkout = buildWorkout(template, paces, avgEasyRun);
        } else if (dayInfo.type === 'easy_strides') {
            // Easy + strides
            const template = EASY_TEMPLATES[2];
            runWorkout = buildWorkout(template, paces, avgEasyRun);
        }
        // type === 'rest' => runWorkout stays null

        days.push({
            date,
            dayOfWeek: i,
            runWorkout,
            strengthWorkout: null, // TODO: Add strength integration
            isKeyDay,
            totalMiles: runWorkout?.totalDistance ?? 0,
            qualityMiles: runWorkout?.qualityMiles ?? 0,
        });
    }

    return days;
}

// =============================================================================
// WEEK STRUCTURE TEMPLATES (Hansons-inspired)
// =============================================================================

interface DaySlot {
    type: 'rest' | 'easy' | 'quality' | 'long' | 'easy_strides';
}

function getWeekStructure(
    availableDays: 3 | 4 | 5 | 6,
    longRunDay: string,
    isRecovery: boolean
): DaySlot[] {
    // Default: Saturday = index 6, Sunday = index 0
    const longDayIndex = longRunDay === 'sunday' ? 0 : longRunDay === 'saturday' ? 6 : 6;

    // Hansons-style structure: SOS on Tue/Thu
    // Mon = easy/rest, Tue = SOS, Wed = easy, Thu = SOS, Fri = rest, Sat = long, Sun = easy/rest

    if (isRecovery) {
        // Recovery week: only 1 quality day
        return distributeRecoveryWeek(availableDays, longDayIndex);
    }

    switch (availableDays) {
        case 3:
            return distribute3DayWeek(longDayIndex);
        case 4:
            return distribute4DayWeek(longDayIndex);
        case 5:
            return distribute5DayWeek(longDayIndex);
        case 6:
        default:
            return distribute6DayWeek(longDayIndex);
    }
}

function distribute6DayWeek(longDayIndex: number): DaySlot[] {
    // Hansons classic: Mon easy, Tue SOS, Wed easy, Thu SOS, Fri rest, Sat long, Sun easy
    const week: DaySlot[] = [
        { type: 'easy_strides' }, // Sun
        { type: 'easy' },         // Mon
        { type: 'quality' },      // Tue (SOS)
        { type: 'easy' },         // Wed
        { type: 'quality' },      // Thu (SOS)
        { type: 'rest' },         // Fri
        { type: 'long' },         // Sat
    ];

    if (longDayIndex === 0) {
        // Swap if long run is Sunday
        week[0] = { type: 'long' };
        week[6] = { type: 'easy_strides' };
    }

    return week;
}

function distribute5DayWeek(longDayIndex: number): DaySlot[] {
    // 5 days: 2 quality + long + 2 easy
    const week: DaySlot[] = [
        { type: 'rest' },
        { type: 'easy' },
        { type: 'quality' },
        { type: 'easy' },
        { type: 'quality' },
        { type: 'rest' },
        { type: 'long' },
    ];

    if (longDayIndex === 0) {
        week[0] = { type: 'long' };
        week[6] = { type: 'rest' };
    }

    return week;
}

function distribute4DayWeek(longDayIndex: number): DaySlot[] {
    // 4 days: 1 quality + long + 2 easy
    const week: DaySlot[] = [
        { type: 'rest' },
        { type: 'rest' },
        { type: 'quality' },
        { type: 'easy' },
        { type: 'rest' },
        { type: 'easy' },
        { type: 'long' },
    ];

    if (longDayIndex === 0) {
        week[0] = { type: 'long' };
        week[6] = { type: 'rest' };
    }

    return week;
}

function distribute3DayWeek(longDayIndex: number): DaySlot[] {
    // 3 days: long + quality + easy
    const week: DaySlot[] = [
        { type: 'rest' },
        { type: 'rest' },
        { type: 'quality' },
        { type: 'rest' },
        { type: 'rest' },
        { type: 'easy' },
        { type: 'long' },
    ];

    if (longDayIndex === 0) {
        week[0] = { type: 'long' };
        week[6] = { type: 'rest' };
    }

    return week;
}

function distributeRecoveryWeek(availableDays: number, longDayIndex: number): DaySlot[] {
    // Recovery: all easy except long run (which is shorter)
    const week: DaySlot[] = [
        { type: 'rest' },
        { type: 'easy' },
        { type: 'easy_strides' },
        { type: 'rest' },
        { type: 'easy' },
        { type: 'rest' },
        { type: 'long' },
    ];

    if (longDayIndex === 0) {
        week[0] = { type: 'long' };
        week[6] = { type: 'rest' };
    }

    return week;
}

// =============================================================================
// WORKOUT SELECTION
// =============================================================================

function selectQualityWorkouts(
    phase: TrainingPhase,
    isRecovery: boolean,
    goalDistance: string
): WorkoutTemplate[] {
    if (isRecovery) return [];

    const workouts: WorkoutTemplate[] = [];

    // Select appropriate workouts based on phase
    switch (phase) {
        case 'base':
            // Base: fartlek + tempo
            workouts.push(INTERVAL_TEMPLATES.find(t => t.type === 'fartlek') || INTERVAL_TEMPLATES[0]);
            workouts.push(TEMPO_TEMPLATES[0]); // Classic tempo
            break;

        case 'build':
            // Build: intervals + tempo
            workouts.push(INTERVAL_TEMPLATES[0]); // 800s
            workouts.push(TEMPO_TEMPLATES[1]); // Extended tempo
            break;

        case 'peak':
            // Peak: harder intervals + race-specific
            if (goalDistance === 'marathon' || goalDistance === 'half') {
                workouts.push(INTERVAL_TEMPLATES[3]); // Mile repeats
                workouts.push(TEMPO_TEMPLATES[1]); // Extended tempo
            } else {
                workouts.push(INTERVAL_TEMPLATES[2]); // 1200s
                workouts.push(TEMPO_TEMPLATES[0]); // Classic tempo
            }
            break;

        case 'taper':
            // Taper: short tempo
            workouts.push(TEMPO_TEMPLATES[0]); // Classic tempo (will be shorter)
            break;
    }

    return workouts;
}

function selectLongRunTemplate(phase: TrainingPhase, goalDistance: string): WorkoutTemplate {
    if (phase === 'base' || phase === 'taper') {
        return LONG_RUN_TEMPLATES[0]; // Easy long run
    }

    if (goalDistance === 'marathon') {
        return LONG_RUN_TEMPLATES[2]; // MP finish (Hansons)
    }

    if (goalDistance === 'half') {
        return LONG_RUN_TEMPLATES[1]; // Progression
    }

    return LONG_RUN_TEMPLATES[0]; // Easy for shorter distances
}

// =============================================================================
// VERIFICATION
// =============================================================================

function verifyPlan(weeks: WeekPlan[], phases: PhaseBreakdown[]): PlanVerification {
    const checks: VerificationCheck[] = [];

    // Check 1: 80/20 Polarization
    const totalEasy = weeks.reduce((sum, w) => sum + w.easyMiles, 0);
    const totalQuality = weeks.reduce((sum, w) => sum + w.qualityMiles, 0);
    const totalMiles = totalEasy + totalQuality;
    const easyPercent = (totalEasy / totalMiles) * 100;

    checks.push({
        name: VERIFICATION_CHECKS.POLARIZATION.name,
        passed: easyPercent >= VERIFICATION_CHECKS.POLARIZATION.minEasyPercent,
        value: Math.round(easyPercent),
        expected: `≥${VERIFICATION_CHECKS.POLARIZATION.minEasyPercent}%`,
        message: easyPercent >= 80 ? 'Perfect polarization' : 'Polarization within acceptable range',
    });

    // Check 2: Long run cap
    let longRunCapPassed = true;
    for (const week of weeks) {
        const longRunPercent = (week.longRunMiles / week.totalMiles) * 100;
        if (longRunPercent > VERIFICATION_CHECKS.LONG_RUN_CAP.maxLongRunPercent) {
            longRunCapPassed = false;
            break;
        }
    }

    checks.push({
        name: VERIFICATION_CHECKS.LONG_RUN_CAP.name,
        passed: longRunCapPassed,
        expected: `≤${VERIFICATION_CHECKS.LONG_RUN_CAP.maxLongRunPercent}%`,
    });

    // Check 3: 10% progression rule
    let progressionPassed = true;
    for (let i = 1; i < weeks.length; i++) {
        if (weeks[i].isRecoveryWeek || weeks[i - 1].isRecoveryWeek) continue;
        const increase = ((weeks[i].totalMiles - weeks[i - 1].totalMiles) / weeks[i - 1].totalMiles) * 100;
        if (increase > VERIFICATION_CHECKS.PROGRESSION_RATE.maxWeeklyIncrease) {
            progressionPassed = false;
            break;
        }
    }

    checks.push({
        name: VERIFICATION_CHECKS.PROGRESSION_RATE.name,
        passed: progressionPassed,
        expected: `≤${VERIFICATION_CHECKS.PROGRESSION_RATE.maxWeeklyIncrease}%`,
    });

    // Check 4: Recovery week frequency
    let maxWeeksWithoutRecovery = 0;
    let currentStreak = 0;
    for (const week of weeks) {
        if (week.isRecoveryWeek || week.phase === 'taper') {
            currentStreak = 0;
        } else {
            currentStreak++;
            maxWeeksWithoutRecovery = Math.max(maxWeeksWithoutRecovery, currentStreak);
        }
    }

    checks.push({
        name: VERIFICATION_CHECKS.RECOVERY_WEEKS.name,
        passed: maxWeeksWithoutRecovery <= VERIFICATION_CHECKS.RECOVERY_WEEKS.maxWeeksWithoutRecovery,
        value: maxWeeksWithoutRecovery,
        expected: `≤${VERIFICATION_CHECKS.RECOVERY_WEEKS.maxWeeksWithoutRecovery} weeks`,
    });

    // Check 5: SOS distribution (no back-to-back hard days)
    let sosDistributionPassed = true;
    for (const week of weeks) {
        for (let i = 1; i < week.days.length; i++) {
            if (week.days[i].isKeyDay && week.days[i - 1].isKeyDay) {
                sosDistributionPassed = false;
                break;
            }
        }
    }

    checks.push({
        name: VERIFICATION_CHECKS.SOS_DISTRIBUTION.name,
        passed: sosDistributionPassed,
    });

    return {
        passed: checks.every(c => c.passed),
        checks,
    };
}

// =============================================================================
// HELPERS
// =============================================================================

function calculateWeeksToRace(raceDateStr: string): number {
    const raceDate = parseDateOnly(raceDateStr);
    if (!raceDate) return 0;
    const today = new Date();
    const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const diffTime = raceDate.getTime() - todayUtc.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
}

function getWeekStartDate(weekNumber: number, raceDateStr?: string): string {
    if (!raceDateStr) return '';
    const raceDate = parseDateOnly(raceDateStr);
    if (!raceDate) return '';
    // Count backward from race date
    const totalWeeks = calculateWeeksToRace(raceDateStr);
    const weeksFromStart = weekNumber - 1;
    const weekStart = addDaysUtc(raceDate, -((totalWeeks - weeksFromStart) * 7));
    return formatDateUtc(weekStart);
}

function getDateForDay(weekNumber: number, dayIndex: number, raceDateStr?: string): string {
    if (!raceDateStr) return '';
    const weekStart = getWeekStartDate(weekNumber, raceDateStr);
    if (!weekStart) return '';
    const weekStartDate = parseDateOnly(weekStart);
    if (!weekStartDate) return '';
    const date = addDaysUtc(weekStartDate, dayIndex);
    return formatDateUtc(date);
}

function parseDateOnly(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]) - 1;
        const day = Number(match[3]);
        return new Date(Date.UTC(year, month, day));
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
}

function addDaysUtc(date: Date, days: number): Date {
    return new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate() + days
    ));
}

function formatDateUtc(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getWeekFocus(phase: TrainingPhase, weekInPhase: number, isRecovery: boolean): string {
    if (isRecovery) return 'Recovery week — absorb training, prepare for next block';

    const focuses: Record<TrainingPhase, string[]> = {
        base: ['Building aerobic foundation', 'Establishing consistency', 'Strengthening fundamentals'],
        build: ['Increasing volume', 'Threshold development', 'Race-specific preparation'],
        peak: ['Maximum fitness', 'Race simulation', 'Final hard efforts'],
        taper: ['Sharpening', 'Fresh legs', 'Race week preparation'],
    };

    const phaseFocuses = focuses[phase];
    return phaseFocuses[Math.min(weekInPhase - 1, phaseFocuses.length - 1)];
}

function getInjuryModifications(input: PlanGenerationInput): string[] | undefined {
    const mods: string[] = [];

    if (input.currentPain && input.painLocation) {
        mods.push(`Current pain: ${input.painLocation} — modified warm-up and prehab included`);
    }

    if (input.recentInjury && input.injuryLocation) {
        mods.push(`Past injury: ${input.injuryLocation} — targeted strengthening included`);
    }

    return mods.length > 0 ? mods : undefined;
}

// =============================================================================
// EXPORT
// =============================================================================

export {
    calculateWeeksToRace,
    getWeekStartDate,
    getDateForDay,
    parseDateOnly,
    addDaysUtc,
    formatDateUtc,
    getWeekFocus,
};
