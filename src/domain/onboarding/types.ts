/**
 * THE LONG GAME - Onboarding Types
 * 
 * Complete type definitions for the coach-backed onboarding flow.
 * Supports 5K through Marathon + General Fitness training.
 */

// =============================================================================
// STEP DEFINITIONS
// =============================================================================

export type OnboardingStep =
    // Phase 1: Welcome
    | 'welcome'

    // Phase 2: Identity
    | 'name'
    | 'demographics'

    // Phase 3: Goal
    | 'training-goal'
    | 'race-details'
    | 'fitness-duration'

    // Phase 4: Fitness Calibration
    | 'calibration-method'
    | 'race-input'
    | 'easy-pace-input'
    | 'device-import'
    | 'manual-vo2max'
    | 'hard-effort-input'
    | 'estimation-flow'
    | 'vdot-reveal'

    // Phase 5: Training Load
    | 'weekly-mileage'
    | 'runs-per-week'
    | 'longest-run'

    // Phase 6: Schedule
    | 'available-days'
    | 'long-run-day'

    // Phase 7: Safety
    | 'current-pain'
    | 'pain-details'
    | 'injury-history'
    | 'injury-details'

    // Phase 8: Preferences
    | 'training-intensity'
    | 'strength-training'

    // Phase 9: Readiness & Generation
    | 'readiness-check'
    | 'generating'
    | 'complete';

// =============================================================================
// CORE ENUMS & TYPES
// =============================================================================

export type Sex = 'male' | 'female';

export type TrainingGoal = '5k' | '10k' | 'half' | 'marathon' | 'general';

export type FitnessDuration = '8weeks' | '12weeks' | 'ongoing';

export type CalibrationMethod =
    | 'race'
    | 'easy_pace'
    | 'device'
    | 'effort'
    | 'estimate';

export type RaceDistance = 'mile' | '5k' | '10k' | 'half' | 'marathon';

export type RaceRecency = 'recent' | 'moderate' | 'old' | 'very_old';

export type ExperienceLevel = 'new' | 'recreational' | 'experienced';

export type EffortType = 'parkrun' | 'tempo' | 'time_trial' | 'race_sim';

export type PainSeverity = 'mild' | 'moderate' | 'severe';

export type InjuryLocation =
    | 'knee'
    | 'shin_calf'
    | 'achilles'
    | 'foot_plantar'
    | 'hip_glute'
    | 'back'
    | 'other';

export type TrainingIntensity = 'conservative' | 'moderate' | 'aggressive';

export type ReadinessStatus = 'ready' | 'needs_base' | 'timeline_short';

export type VdotConfidence = 'high' | 'medium' | 'low';

// =============================================================================
// ONBOARDING DATA MODEL
// =============================================================================

export interface OnboardingData {
    // Phase 2: Identity
    name: string;
    age: number | null;
    sex: Sex | null;

    // Phase 3: Goal
    trainingGoal: TrainingGoal | null;
    raceName: string;
    raceDate: string;  // ISO date
    fitnessDuration: FitnessDuration | null;

    // Phase 4: Fitness Calibration
    calibrationMethod: CalibrationMethod | null;

    // Race input
    raceDistance: RaceDistance | null;
    raceTimeMinutes: number | null;
    raceTimeSeconds: number | null;
    raceRecency: RaceRecency | null;

    // Easy pace input
    easyPaceMinutes: number | null;
    easyPaceSeconds: number | null;

    // Hard effort input
    effortType: EffortType | null;
    effortDistance: string;
    effortTimeMinutes: number | null;
    effortTimeSeconds: number | null;
    effortLevel: number | null;  // 1-10
    effortRecency: 'last_2_weeks' | 'last_month' | '1_3_months' | null;

    // Estimation flow
    experienceLevel: ExperienceLevel | null;

    // Computed VDOT
    vdot: number | null;
    vdotConfidence: VdotConfidence | null;

    // Phase 5: Training Load
    weeklyMiles: number | null;
    runsPerWeek: number | null;
    longestRecentRun: number | null;

    // Phase 6: Schedule
    availableDays: number | null;
    longRunDay: string;

    // Phase 7: Safety
    hasCurrentPain: boolean | null;
    painLocation: InjuryLocation | null;
    painSeverity: PainSeverity | null;
    hasRecentInjury: boolean | null;
    injuryLocation: InjuryLocation | null;

    // Phase 8: Preferences
    trainingIntensity: TrainingIntensity | null;
    includeStrength: boolean | null;

    // Phase 9: Readiness
    readinessStatus: ReadinessStatus | null;
    baseWeeksNeeded: number | null;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
    // Identity
    name: '',
    age: null,
    sex: null,

    // Goal
    trainingGoal: null,
    raceName: '',
    raceDate: '',
    fitnessDuration: null,

    // Calibration
    calibrationMethod: null,
    raceDistance: null,
    raceTimeMinutes: null,
    raceTimeSeconds: null,
    raceRecency: null,
    easyPaceMinutes: null,
    easyPaceSeconds: null,
    effortType: null,
    effortDistance: '',
    effortTimeMinutes: null,
    effortTimeSeconds: null,
    effortLevel: null,
    effortRecency: null,
    experienceLevel: null,
    vdot: null,
    vdotConfidence: null,

    // Training Load
    weeklyMiles: null,
    runsPerWeek: null,
    longestRecentRun: null,

    // Schedule
    availableDays: null,
    longRunDay: '',

    // Safety
    hasCurrentPain: null,
    painLocation: null,
    painSeverity: null,
    hasRecentInjury: null,
    injuryLocation: null,

    // Preferences
    trainingIntensity: null,
    includeStrength: null,

    // Readiness
    readinessStatus: null,
    baseWeeksNeeded: null,
};

// =============================================================================
// STEP NAVIGATION
// =============================================================================

/**
 * Determines the next step based on current step and data.
 * Implements all branching logic.
 */
export function getNextStep(
    currentStep: OnboardingStep,
    data: OnboardingData
): OnboardingStep {
    switch (currentStep) {
        case 'welcome':
            return 'name';

        case 'name':
            return 'demographics';

        case 'demographics':
            return 'training-goal';

        case 'training-goal':
            return data.trainingGoal === 'general'
                ? 'fitness-duration'
                : 'race-details';

        case 'race-details':
            return 'calibration-method';

        case 'fitness-duration':
            return 'calibration-method';

        case 'calibration-method':
            switch (data.calibrationMethod) {
                case 'race': return 'race-input';
                case 'easy_pace': return 'easy-pace-input';
                case 'device': return 'device-import';
                case 'effort': return 'hard-effort-input';
                case 'estimate': return 'estimation-flow';
                default: return 'race-input';
            }

        case 'race-input':
        case 'easy-pace-input':
        case 'device-import':
        case 'hard-effort-input':
        case 'estimation-flow':
        case 'manual-vo2max':
            return 'vdot-reveal';

        case 'vdot-reveal':
            return 'weekly-mileage';

        case 'weekly-mileage':
            return 'runs-per-week';

        case 'runs-per-week':
            return 'longest-run';

        case 'longest-run':
            return 'available-days';

        case 'available-days':
            return 'long-run-day';

        case 'long-run-day':
            return 'current-pain';

        case 'current-pain':
            return data.hasCurrentPain ? 'pain-details' : 'injury-history';

        case 'pain-details':
            return 'injury-history';

        case 'injury-history':
            return data.hasRecentInjury ? 'injury-details' : 'training-intensity';

        case 'injury-details':
            return 'training-intensity';

        case 'training-intensity':
            return 'strength-training';

        case 'strength-training':
            return 'readiness-check';

        case 'readiness-check':
            return 'generating';

        case 'generating':
            return 'complete';

        default:
            return 'complete';
    }
}

/**
 * Determines the previous step for back navigation.
 * Handles branching in reverse.
 */
export function getPreviousStep(
    currentStep: OnboardingStep,
    data: OnboardingData
): OnboardingStep | null {
    switch (currentStep) {
        case 'welcome':
            return null; // Can't go back from welcome

        case 'name':
            return 'welcome';

        case 'demographics':
            return 'name';

        case 'training-goal':
            return 'demographics';

        case 'race-details':
            return 'training-goal';

        case 'fitness-duration':
            return 'training-goal';

        case 'calibration-method':
            return data.trainingGoal === 'general'
                ? 'fitness-duration'
                : 'race-details';

        case 'race-input':
        case 'easy-pace-input':
        case 'device-import':
        case 'hard-effort-input':
        case 'estimation-flow':
            return 'calibration-method';

        case 'manual-vo2max':
            return 'device-import';

        case 'vdot-reveal':
            switch (data.calibrationMethod) {
                case 'race': return 'race-input';
                case 'easy_pace': return 'easy-pace-input';
                case 'device': return 'device-import';
                case 'effort': return 'hard-effort-input';
                case 'estimate': return 'estimation-flow';
                default: return 'calibration-method';
            }

        case 'weekly-mileage':
            return 'vdot-reveal';

        case 'runs-per-week':
            return 'weekly-mileage';

        case 'longest-run':
            return 'runs-per-week';

        case 'available-days':
            return 'longest-run';

        case 'long-run-day':
            return 'available-days';

        case 'current-pain':
            return 'long-run-day';

        case 'pain-details':
            return 'current-pain';

        case 'injury-history':
            return data.hasCurrentPain ? 'pain-details' : 'current-pain';

        case 'injury-details':
            return 'injury-history';

        case 'training-intensity':
            return data.hasRecentInjury ? 'injury-details' : 'injury-history';

        case 'strength-training':
            return 'training-intensity';

        case 'readiness-check':
            return 'strength-training';

        case 'generating':
            return 'readiness-check';

        case 'complete':
            return null; // Can't go back from complete

        default:
            return null;
    }
}

// =============================================================================
// PROGRESS CALCULATION
// =============================================================================

const STEP_PROGRESS: Record<OnboardingStep, number> = {
    'welcome': 0,
    'name': 5,
    'demographics': 10,
    'training-goal': 15,
    'race-details': 20,
    'fitness-duration': 20,
    'calibration-method': 25,
    'race-input': 30,
    'easy-pace-input': 30,
    'device-import': 30,
    'manual-vo2max': 30,
    'hard-effort-input': 30,
    'estimation-flow': 30,
    'vdot-reveal': 40,
    'weekly-mileage': 50,
    'runs-per-week': 55,
    'longest-run': 60,
    'available-days': 65,
    'long-run-day': 70,
    'current-pain': 75,
    'pain-details': 77,
    'injury-history': 80,
    'injury-details': 82,
    'training-intensity': 85,
    'strength-training': 90,
    'readiness-check': 95,
    'generating': 98,
    'complete': 100,
};

export function getStepProgress(step: OnboardingStep): number {
    return STEP_PROGRESS[step] ?? 0;
}

// =============================================================================
// COACH TOOLTIPS
// =============================================================================

export interface CoachTooltip {
    title: string;
    content: string;
    coach?: string;
    coachLink?: string;
}

export const STEP_TOOLTIPS: Partial<Record<OnboardingStep, CoachTooltip>> = {
    'demographics': {
        title: 'Why we ask',
        content: 'Jack Daniels\' research shows that training paces differ by sex due to physiological differences in VO2max ceilings. Age affects recovery capacity and appropriate training load.',
        coach: 'Jack Daniels',
        coachLink: '/methodology#daniels',
    },
    'training-goal': {
        title: 'Why it matters',
        content: 'Different distances require different training emphasis. A 5K is 95% aerobic but feels anaerobic. A marathon is 99% aerobic and requires massive endurance. We structure your plan accordingly.',
    },
    'calibration-method': {
        title: 'Why this matters so much',
        content: 'Jack Daniels spent his career proving that training at the RIGHT pace is everything. Too fast on easy days = injury. Too slow on hard days = no adaptation. We need accurate data to set your zones correctly.',
        coach: 'Jack Daniels',
        coachLink: '/methodology#daniels',
    },
    'weekly-mileage': {
        title: 'Why we ask',
        content: 'Pete Pfitzinger emphasizes "base readiness" — you can\'t start a plan you can\'t absorb. If Week 1 assumes 30 miles but you\'re running 10, we need to build you up first.',
        coach: 'Pete Pfitzinger',
        coachLink: '/methodology#pfitzinger',
    },
    'runs-per-week': {
        title: 'Why frequency matters',
        content: 'Running more frequently (with appropriate recovery) creates more adaptation opportunities than running the same mileage in fewer runs. The Hansons method is built on high frequency.',
        coach: 'Hansons',
        coachLink: '/methodology#hansons',
    },
    'current-pain': {
        title: 'Why we ask',
        content: 'Jay Dicharry\'s biomechanical research shows that running through pain changes your gait, which creates new injuries. Pain that affects movement needs attention before training.',
        coach: 'Jay Dicharry',
        coachLink: '/methodology#dicharry',
    },
    'injury-history': {
        title: 'Why we ask',
        content: 'Past injury is the #1 predictor of future injury. If you had Achilles issues last year, we\'ll build in calf strengthening. If you had IT band syndrome, we\'ll add hip work.',
    },
    'training-intensity': {
        title: 'What this changes',
        content: 'Conservative plans have gentler progressions and more recovery. Aggressive plans push closer to your limits — more potential upside, but also more injury risk.',
    },
    'strength-training': {
        title: 'Why strength matters',
        content: 'Jay Dicharry\'s research is clear: runners who strength train get injured less and run faster. We recommend it.',
        coach: 'Jay Dicharry',
        coachLink: '/methodology#dicharry',
    },
};

// =============================================================================
// VALIDATION
// =============================================================================

export function isStepComplete(step: OnboardingStep, data: OnboardingData): boolean {
    switch (step) {
        case 'welcome':
            return true;

        case 'name':
            return data.name.trim().length >= 2;

        case 'demographics':
            return data.age !== null && data.age > 0 && data.sex !== null;

        case 'training-goal':
            return data.trainingGoal !== null;

        case 'race-details':
            return data.raceDate !== '';

        case 'fitness-duration':
            return data.fitnessDuration !== null;

        case 'calibration-method':
            return data.calibrationMethod !== null;

        case 'race-input':
            return data.raceDistance !== null &&
                data.raceTimeMinutes !== null &&
                data.raceRecency !== null;

        case 'easy-pace-input':
            return data.easyPaceMinutes !== null && data.easyPaceSeconds !== null;

        case 'device-import':
            return true;

        case 'hard-effort-input':
            return data.effortType !== null &&
                data.effortTimeMinutes !== null;

        case 'estimation-flow':
            return data.experienceLevel !== null;

        case 'manual-vo2max':
            return data.vdot !== null;

        case 'vdot-reveal':
            return data.vdot !== null;

        case 'weekly-mileage':
            return data.weeklyMiles !== null;

        case 'runs-per-week':
            return data.runsPerWeek !== null;

        case 'longest-run':
            return data.longestRecentRun !== null;

        case 'available-days':
            return data.availableDays !== null;

        case 'long-run-day':
            return data.longRunDay !== '';

        case 'current-pain':
            return data.hasCurrentPain !== null;

        case 'pain-details':
            return data.painLocation !== null;

        case 'injury-history':
            return data.hasRecentInjury !== null;

        case 'injury-details':
            return data.injuryLocation !== null;

        case 'training-intensity':
            return data.trainingIntensity !== null;

        case 'strength-training':
            return data.includeStrength !== null;

        case 'readiness-check':
            return true;

        case 'generating':
            return true;

        case 'complete':
            return true;

        default:
            return false;
    }
}

// =============================================================================
// LOCALSTORAGE PERSISTENCE
// =============================================================================

const STORAGE_KEY = 'long-game-onboarding';

export function saveOnboardingProgress(step: OnboardingStep, data: OnboardingData): void {
    if (typeof window === 'undefined') return;

    const saved = {
        step,
        data,
        timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

export function loadOnboardingProgress(): { step: OnboardingStep; data: OnboardingData } | null {
    if (typeof window === 'undefined') return null;

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return null;

        const parsed = JSON.parse(saved);

        // Check if saved data is less than 7 days old
        const weekOld = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - parsed.timestamp > weekOld) {
            clearOnboardingProgress();
            return null;
        }

        return {
            step: parsed.step,
            data: { ...INITIAL_ONBOARDING_DATA, ...parsed.data },
        };
    } catch {
        return null;
    }
}

export function clearOnboardingProgress(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}
