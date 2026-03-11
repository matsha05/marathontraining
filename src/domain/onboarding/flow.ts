import type { CoachTooltip, OnboardingData, OnboardingStep } from './model';

const STEP_PROGRESS: Record<OnboardingStep, number> = {
    'welcome': 0,
    'mile-gate': 3,
    'name': 6,
    'demographics': 10,
    'avatar': 12,
    'training-goal': 15,
    'race-details': 20,
    'fitness-duration': 20,
    'calibration-method': 25,
    'race-input': 30,
    'easy-pace-input': 30,
    'manual-vo2max': 30,
    'hard-effort-input': 30,
    'estimation-flow': 30,
    'vdot-reveal': 40,
    'weekly-mileage': 45,
    'runs-per-week': 50,
    'longest-run': 55,
    'available-days': 60,
    'long-run-day': 65,
    'plan-start-date': 68,
    'current-pain': 70,
    'pain-details': 72,
    'injury-history': 75,
    'injury-details': 77,
    'training-intensity': 80,
    'training-mindset': 86,
    'coach-reveal': 90,
    'readiness-check': 95,
    'generating': 98,
    'complete': 100,
};

const STEP_ORDER = Object.keys(STEP_PROGRESS) as OnboardingStep[];

export function getNextStep(
    currentStep: OnboardingStep,
    data: OnboardingData
): OnboardingStep {
    switch (currentStep) {
        case 'welcome':
            return 'mile-gate';
        case 'mile-gate':
            return 'name';
        case 'name':
            return 'demographics';
        case 'demographics':
            return 'avatar';
        case 'avatar':
            return 'training-goal';
        case 'training-goal':
            return data.trainingGoal === 'general' ? 'fitness-duration' : 'race-details';
        case 'race-details':
        case 'fitness-duration':
            return 'calibration-method';
        case 'calibration-method':
            switch (data.calibrationMethod) {
                case 'race':
                    return 'race-input';
                case 'easy_pace':
                    return 'easy-pace-input';
                case 'vo2max':
                    return 'manual-vo2max';
                case 'effort':
                    return 'hard-effort-input';
                case 'estimate':
                    return 'estimation-flow';
                default:
                    return 'race-input';
            }
        case 'race-input':
        case 'easy-pace-input':
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
            return 'plan-start-date';
        case 'plan-start-date':
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
            return 'training-mindset';
        case 'training-mindset':
            return 'coach-reveal';
        case 'coach-reveal':
            return 'readiness-check';
        case 'readiness-check':
            return 'generating';
        case 'generating':
            return 'complete';
        default:
            return 'complete';
    }
}

export function getPreviousStep(
    currentStep: OnboardingStep,
    data: OnboardingData
): OnboardingStep | null {
    switch (currentStep) {
        case 'welcome':
            return null;
        case 'mile-gate':
            return 'welcome';
        case 'name':
            return 'mile-gate';
        case 'demographics':
            return 'name';
        case 'avatar':
            return 'demographics';
        case 'training-goal':
            return 'avatar';
        case 'race-details':
        case 'fitness-duration':
            return 'training-goal';
        case 'calibration-method':
            return data.trainingGoal === 'general' ? 'fitness-duration' : 'race-details';
        case 'race-input':
        case 'easy-pace-input':
        case 'hard-effort-input':
        case 'estimation-flow':
        case 'manual-vo2max':
            return 'calibration-method';
        case 'vdot-reveal':
            switch (data.calibrationMethod) {
                case 'race':
                    return 'race-input';
                case 'easy_pace':
                    return 'easy-pace-input';
                case 'vo2max':
                    return 'manual-vo2max';
                case 'effort':
                    return 'hard-effort-input';
                case 'estimate':
                    return 'estimation-flow';
                default:
                    return 'calibration-method';
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
        case 'plan-start-date':
            return 'long-run-day';
        case 'current-pain':
            return 'plan-start-date';
        case 'pain-details':
            return 'current-pain';
        case 'injury-history':
            return data.hasCurrentPain ? 'pain-details' : 'current-pain';
        case 'injury-details':
            return 'injury-history';
        case 'training-intensity':
            return data.hasRecentInjury ? 'injury-details' : 'injury-history';
        case 'training-mindset':
            return 'training-intensity';
        case 'coach-reveal':
            return 'training-mindset';
        case 'readiness-check':
            return 'coach-reveal';
        case 'generating':
            return 'readiness-check';
        case 'complete':
            return null;
        default:
            return null;
    }
}

export function getLinearStepProgress<T extends string>(
    steps: readonly T[],
    step: T
): { index: number; total: number; progress: number } {
    const total = steps.length;
    const index = steps.indexOf(step);
    if (index === -1 || total === 0) {
        return { index, total, progress: 0 };
    }
    return {
        index,
        total,
        progress: ((index + 1) / total) * 100,
    };
}

export function getStepProgress(step: OnboardingStep): number {
    const fallback = getLinearStepProgress(STEP_ORDER, step).progress;
    return STEP_PROGRESS[step] ?? fallback;
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
        content: 'Your VO2max/VDOT sets every training pace. Too fast on easy days = injury. Too slow on hard days = no adaptation. Choose the most accurate option you have.',
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
};

export function isStepComplete(step: OnboardingStep, data: OnboardingData): boolean {
    switch (step) {
        case 'welcome':
        case 'readiness-check':
        case 'generating':
        case 'complete':
            return true;
        case 'mile-gate':
            return data.canRunMile === true;
        case 'name':
            return data.name.trim().length >= 2;
        case 'demographics':
            return data.dateOfBirth !== null && data.sex !== null;
        case 'avatar':
            return true;
        case 'training-goal':
            return data.trainingGoal !== null;
        case 'race-details':
            return true;
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
        case 'hard-effort-input':
            return data.effortType !== null && data.effortTimeMinutes !== null;
        case 'estimation-flow':
            return data.experienceLevel !== null;
        case 'manual-vo2max':
            return data.garminVO2max !== null;
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
            return data.longRunDays.length > 0;
        case 'plan-start-date':
            return data.planStartDate !== null;
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
        case 'training-mindset':
            return data.trainingMindset !== null;
        case 'coach-reveal':
            return data.trainingPhilosophy !== null;
        default:
            return false;
    }
}

