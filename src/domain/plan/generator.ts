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
import { calculateWeeksToRace, getDateForDay, getWeekStartDate } from './date-utils';
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
import { generateStrengthWorkout, getStrengthPhaseConfig, getDicharryHipCircuit } from './strength-engine';
import { StrengthWorkout, DurabilityModule, WodWorkout, DailyDurabilityRoutine, CrossTrainingSuggestion } from './types';
import { getDailyDurabilityModule, getDailyDurabilityRoutine } from './durability-modules';

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
        id: `plan-${crypto.randomUUID()}`,
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
        totalMiles: days.reduce((sum, d) => sum + d.totalMiles, 0),
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
// STRENGTH SCHEDULING
// =============================================================================

/**
 * Schedule strength workout for a specific day.
 * Rules from research (09-strength-protocols-for-runners.md):
 * - Place strength on quality run days (after run) so easy days stay easy
 * - Avoid strength day before long run
 * - BASE/BUILD: 2 sessions/week, PEAK: 1 session/week, TAPER: 0-1
 */
export function scheduleStrengthForDay(
    phase: TrainingPhase,
    dayType: 'rest' | 'easy' | 'quality' | 'long' | 'easy_strides',
    dayOfWeek: number,
    input: PlanGenerationInput
): StrengthWorkout | null {
    // Skip if user opted out of strength
    if (!input.includeStrength) {
        return null;
    }

    const config = getStrengthPhaseConfig(phase);

    // Rest days: no strength (user should rest)
    if (dayType === 'rest') {
        return null;
    }

    // Long run days: no strength (protect the key run)
    if (dayType === 'long') {
        return null;
    }

    // Determine equipment level
    const equipment: 'none' | 'minimal' | 'gym' =
        input.strengthBackground === 'advanced' ? 'gym' :
            input.strengthBackground === 'intermediate' ? 'minimal' : 'minimal';

    // Research rule: Quality days get strength (hard day stacking)
    if (dayType === 'quality') {
        // Tuesday (2) = Session 1, Thursday (4) = Session 2
        const sessionNumber: 1 | 2 = dayOfWeek <= 2 ? 1 : 2;

        // Check if we should have this session based on phase
        if (phase === 'taper' && sessionNumber === 2) {
            // Taper: only 1 session per week max
            return null;
        }
        if (phase === 'peak' && sessionNumber === 2) {
            // Peak: 1 session per week
            return null;
        }

        return generateStrengthWorkout(phase, equipment, sessionNumber);
    }

    // Easy + strides days: optional hip circuit for durability
    if (dayType === 'easy_strides' && (phase === 'base' || phase === 'build')) {
        // Only on one day per week (typically Sunday = 0 or Friday = 5)
        if (dayOfWeek === 0 || dayOfWeek === 5) {
            return getDicharryHipCircuit();
        }
    }

    return null;
}

/**
 * Schedule durability module for a specific day.
 * Rules from research (04-starrett-dicharry-durability.md):
 * - Quality days: minimal (readiness scan only)
 * - Easy days: control module (core, foot)
 * - Rest days: mobility work if available
 * - Long run days: pre-run readiness scan
 */
export function scheduleDurabilityForDay(
    dayType: 'rest' | 'easy' | 'quality' | 'long' | 'easy_strides'
): DurabilityModule | undefined {
    // Map day types to the getDailyDurabilityModule function
    const mappedType = dayType === 'easy_strides' ? 'easy' : dayType;
    const module = getDailyDurabilityModule(mappedType as 'quality' | 'easy' | 'rest' | 'long');
    return module || undefined;
}

/**
 * Schedule FULL durability routine for a specific day.
 * Returns the complete 8-12 min routine per research (04-starrett-dicharry-durability.md).
 */
export function scheduleDurabilityRoutineForDay(
    dayType: 'rest' | 'easy' | 'quality' | 'long' | 'easy_strides'
): DailyDurabilityRoutine | undefined {
    const mappedType = dayType === 'easy_strides' ? 'easy' : dayType;
    return getDailyDurabilityRoutine(mappedType as 'quality' | 'easy' | 'rest' | 'long');
}

/**
 * Schedule cross-training for a day when user opts out of strength.
 * This provides Higdon-style "Cross" day suggestions.
 * Only shown when:
 * - User hasn't opted into strength training
 * - It's not a running day or rest day
 */
export function scheduleCrossTrainingForDay(
    dayType: 'rest' | 'easy' | 'quality' | 'long' | 'easy_strides',
    input: PlanGenerationInput
): CrossTrainingSuggestion | undefined {
    // If user opted into structured strength, no cross-training needed
    if (input.includeStrength) {
        return undefined;
    }

    // Cross-training typically suggested on easy days or rest days (optional)
    if (dayType === 'rest') {
        return {
            type: 'rest_optional',
            duration: 30,
            intensity: 'easy',
            notes: 'Optional: light walk, yoga, or complete rest',
        };
    }

    // On easy days, suggest cross-training as alternative/supplement
    if (dayType === 'easy' || dayType === 'easy_strides') {
        return {
            type: 'cycling',
            duration: 30,
            intensity: 'easy',
            notes: 'Cross-training: cycling, swimming, or elliptical at easy effort',
        };
    }

    // No cross-training on quality or long run days
    return undefined;
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
            strengthWorkout: scheduleStrengthForDay(
                phase,
                dayInfo.type,
                i,
                input
            ),
            crossTraining: scheduleCrossTrainingForDay(dayInfo.type, input),
            durabilityModule: scheduleDurabilityForDay(dayInfo.type),
            durabilityRoutine: scheduleDurabilityRoutineForDay(dayInfo.type),
            // wodWorkout: opt-in via includeConditioning (not auto-scheduled)
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
    // Map day name to index (0 = Sunday, 6 = Saturday)
    const DAY_NAME_TO_INDEX: Record<string, number> = {
        'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
        'thursday': 4, 'friday': 5, 'saturday': 6
    };
    const longDayIndex = DAY_NAME_TO_INDEX[longRunDay.toLowerCase()] ?? 6; // Default to Saturday

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
    // BASE PHASE: Always easy long runs regardless of distance
    // TAPER PHASE: Always easy long runs to preserve freshness
    if (phase === 'base' || phase === 'taper') {
        return LONG_RUN_TEMPLATES[0]; // Easy long run
    }

    // 5K/10K: Always easy long runs - these distances don't need progression runs
    // The long run cap (10-12mi) is sufficient without adding intensity
    if (goalDistance === '5k' || goalDistance === '10k' || goalDistance === 'general') {
        return LONG_RUN_TEMPLATES[0]; // Easy long run
    }

    // BUILD/PEAK for HALF: Progression long run (finish faster)
    if (goalDistance === 'half') {
        return LONG_RUN_TEMPLATES[1]; // Progression
    }

    // BUILD/PEAK for MARATHON: MP finish long run (Hansons style)
    if (goalDistance === 'marathon') {
        return LONG_RUN_TEMPLATES[2]; // MP finish
    }

    // Fallback: easy long run
    return LONG_RUN_TEMPLATES[0];
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

export { getWeekFocus };
export {
    calculateWeeksToRace,
    getWeekStartDate,
    getDateForDay,
    parseDateOnly,
    addDaysUtc,
    formatDateUtc,
} from './date-utils';
