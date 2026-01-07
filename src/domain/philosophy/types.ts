/**
 * Training Philosophy Types
 * 
 * Defines the three plan structure philosophies and rich metadata
 * for the recommendation quiz and detailed displays.
 */

// =============================================================================
// CORE TYPES
// =============================================================================

export type TrainingPhilosophy = 'hansons' | 'higdon' | 'pfitzinger' | 'daniels';

export interface PhilosophyMetadata {
    id: TrainingPhilosophy;
    name: string;
    tagline: string;
    color: string;

    // Key differentiators
    runDays: string;
    longRunCap: string;
    coreBeliefs: string[];

    // Detailed methodology for override display
    methodology: {
        summary: string;
        keyPrinciples: string[];
        typicalWeek: string[];
        bestFor: string[];
        challenges: string[];
    };

    // What's included regardless
    alwaysIncluded: string;
}

// =============================================================================
// PHILOSOPHY DEFINITIONS (Rich Detail for Override Display)
// =============================================================================

export const PHILOSOPHIES: Record<TrainingPhilosophy, PhilosophyMetadata> = {
    hansons: {
        id: 'hansons',
        name: 'Hansons',
        tagline: 'Cumulative Fatigue',
        color: '#3a6bff',
        runDays: '6 days/week',
        longRunCap: '16 miles max',
        coreBeliefs: [
            'Train on tired legs, race on fresh ones',
            'The week matters more than any single run',
            'Consistent frequency > occasional big efforts',
        ],
        methodology: {
            summary: `The Hansons Method was developed by brothers Keith and Kevin Hanson, coaches who have guided over 100 Olympic Trials qualifiers. Their philosophy centers on cumulative fatigue — running 6 days per week so your body learns to perform while tired.`,
            keyPrinciples: [
                'No run exceeds 16 miles — because you never run fresh. By Sunday, you have 5 days of fatigue in your legs.',
                'No rest before the long run. Saturday is an easy run, not rest. This simulates race-day fatigue.',
                'Something of Substance (SOS) workouts 3x/week: Speed, Tempo, and Long Run.',
                'Easy days are truly easy. The 80/20 rule is enforced.',
            ],
            typicalWeek: [
                'Monday: Easy recovery run',
                'Tuesday: Speed work (intervals)',
                'Wednesday: Rest or cross-train',
                'Thursday: Tempo at goal pace',
                'Friday: Easy run',
                'Saturday: Easy run (pre-long)',
                'Sunday: Long run (capped at 16mi)',
            ],
            bestFor: [
                'Experienced runners (any distance)',
                'Those who can commit to 6 run days',
                'Runners who thrive on daily routine',
                'Athletes who trust the process over big single efforts',
            ],
            challenges: [
                'Hard to fit in if you can only run 4-5 days',
                'Requires discipline on easy days',
                '16-mile cap feels short psychologically',
            ],
        },
        alwaysIncluded: 'All paces powered by Jack Daniels VDOT. 80/20 intensity via Seiler. Durability work via Dicharry. Mobility via Starrett. Strength for running economy.',
    },

    higdon: {
        id: 'higdon',
        name: 'Hal Higdon',
        tagline: 'Beginner-Friendly',
        color: '#ec4899',
        runDays: '4-5 days/week',
        longRunCap: '20 miles',
        coreBeliefs: [
            'Gradual progression prevents injury',
            'Rest days are as important as run days',
            'Simplicity you can stick with beats complexity you can\'t',
        ],
        methodology: {
            summary: `Hal Higdon has coached more first-time marathoners than anyone in history. His programs have helped millions finish their first 26.2. The philosophy: accessible, gradual, sustainable.`,
            keyPrinciples: [
                'Long runs build progressively to 20 miles. The full distance simulation builds confidence.',
                'Built-in rest days (typically 2 per week). Recovery is scheduled, not optional.',
                'Cross-training encouraged on off days. Maintains fitness without additional impact.',
                'Stepback weeks every 3rd week. Reduce volume to absorb training.',
            ],
            typicalWeek: [
                'Monday: Rest',
                'Tuesday: 3-5 mile run',
                'Wednesday: 5-6 mile run',
                'Thursday: 3-5 mile run',
                'Friday: Rest',
                'Saturday: Cross-train (optional)',
                'Sunday: Long run (progressive)',
            ],
            bestFor: [
                'First-time racers at any distance',
                'Runners with limited time (4-5 days max)',
                'Those returning from injury or long break',
                'People who need built-in rest days',
            ],
            challenges: [
                'Lower frequency may limit aerobic development for advanced runners',
                'Less specific speed work in Novice tiers',
                'May undertrain high-volume veterans',
            ],
        },
        alwaysIncluded: 'All paces powered by Jack Daniels VDOT. 80/20 intensity via Seiler. Durability work via Dicharry. Mobility via Starrett. Strength for running economy.',
    },

    pfitzinger: {
        id: 'pfitzinger',
        name: 'Pete Pfitzinger',
        tagline: 'Advanced Marathoning',
        color: '#06b6d4',
        runDays: '6 days/week',
        longRunCap: '22 miles',
        coreBeliefs: [
            'High mileage builds the aerobic engine',
            'Lactate threshold is the key to marathon success',
            'Specificity: train the systems you will race with',
        ],
        methodology: {
            summary: 'Pete Pfitzinger was a 2x Olympic marathoner (2:11:43 PR) and exercise physiologist. His Advanced Marathoning book is the gold standard for competitive runners. High volume, high precision.',
            keyPrinciples: [
                'Mileage matters. Programs range from 55 to 85+ miles per week.',
                'Lactate threshold work is king. Long tempo runs and cruise intervals.',
                'Long runs go to 22 miles with marathon pace sections.',
                'Medium-long runs midweek (12-15 miles) complement the Sunday long run.',
            ],
            typicalWeek: [
                'Monday: Recovery run (5-7 mi)',
                'Tuesday: Lactate threshold run (8-10 mi)',
                'Wednesday: Medium-long run (12-15 mi)',
                'Thursday: Recovery run (5-7 mi)',
                'Friday: Rest or easy (4-6 mi)',
                'Saturday: VO2max or tune-up race',
                'Sunday: Long run (18-22 mi with MP blocks)',
            ],
            bestFor: [
                'Experienced runners chasing PRs',
                'Runners with 40+ mile weekly base',
                'Those who can commit to 6 high-volume days',
                'Competitive athletes across any distance',
            ],
            challenges: [
                'Requires significant base mileage to start',
                'High injury risk if not prepared',
                'Time-intensive: 8-12+ hours/week',
            ],
        },
        alwaysIncluded: 'All paces powered by Jack Daniels VDOT. 80/20 intensity via Seiler. Durability work via Dicharry. Mobility via Starrett. Strength for running economy.',
    },

    daniels: {
        id: 'daniels',
        name: 'Jack Daniels',
        tagline: 'VDOT Precision',
        color: '#8b5cf6',
        runDays: '5-7 days/week (2 quality)',
        longRunCap: '25% of weekly volume',
        coreBeliefs: [
            'Every workout has a specific physiological purpose',
            'Intensity is precisely calculated from current fitness (VDOT)',
            'Two quality days per week maximize adaptation with recovery',
        ],
        methodology: {
            summary: 'Dr. Jack Daniels is one of the most decorated running coaches in history. His VDOT system calculates individualized paces from race performance. The 2Q (2 Quality) approach delivers exactly 2 hard sessions per week with flexible easy days.',
            keyPrinciples: [
                'VDOT-based pacing: Every pace zone calculated from your current race fitness.',
                '2 Quality days: One long run with work, one interval/tempo session.',
                'Easy days are truly easy: Fill remaining volume with E pace running.',
                '4-phase periodization: Base → Rep → Interval → Final Quality.',
            ],
            typicalWeek: [
                'Monday: Easy (E pace)',
                'Tuesday: Quality #1 (I or T session)',
                'Wednesday: Easy (E pace)',
                'Thursday: Easy or off',
                'Friday: Easy (E pace)',
                'Saturday: Strides or recovery',
                'Sunday: Quality #2 (Long run with M/T work)',
            ],
            bestFor: [
                'Runners who want precision pacing',
                'Those with busy schedules (2 key workouts)',
                'Advanced runners targeting PRs at any distance',
                'Athletes who understand training science',
            ],
            challenges: [
                'Requires accurate VDOT (race or time trial needed)',
                '24-week plans needed for 5K/10K distance',
                'Less structure on easy days (self-discipline required)',
            ],
        },
        alwaysIncluded: 'All paces powered by Jack Daniels VDOT. 80/20 intensity via Seiler. Durability work via Dicharry. Mobility via Starrett. Strength for running economy.',
    },
};

// =============================================================================
// FOUNDATION LAYERS (Always Applied)
// =============================================================================

export const FOUNDATION_LAYERS = [
    {
        coach: 'Jack Daniels',
        focus: 'Paces',
        description: 'Your training paces are calculated from VDOT — a metric derived from your race performance. No guessing.',
    },
    {
        coach: 'Stephen Seiler',
        focus: 'Intensity',
        description: '80% easy, 20% hard. The polarized approach that elite endurance athletes use worldwide.',
    },
    {
        coach: 'Jay Dicharry',
        focus: 'Durability',
        description: 'Running Rewired. 12 movement standards that build a body capable of absorbing training load.',
    },
    {
        coach: 'Kelly Starrett',
        focus: 'Mobility',
        description: 'Becoming a Supple Leopard. Daily mobility work that prevents breakdown and restores range of motion.',
    },
    {
        coach: 'Øyvind Støren',
        focus: 'Strength',
        description: 'Heavy strength training improves running economy by 5%. Strategic, never before key sessions.',
    },
];

// =============================================================================
// QUIZ TYPES
// =============================================================================

export type TargetDistance = '5k' | '10k' | 'half' | 'marathon' | 'base';
export type DaysPerWeek = 3 | 4 | 5 | 6;
export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type CurrentMileage = 'under_20' | '20_40' | 'over_40';
export type Mindset = 'rest_focus' | 'consistency' | 'push_limits';
export type RaceTiming = 'specific' | 'soon' | 'no_race';

export interface QuizAnswers {
    targetDistance: TargetDistance | null;
    raceTiming: RaceTiming | null;
    raceDate: string | null; // ISO date if timing === 'specific'
    daysPerWeek: DaysPerWeek | null;
    experience: Experience | null;
    currentMileage: CurrentMileage | null;
    mindset: Mindset | null;
}

export const INITIAL_QUIZ_ANSWERS: QuizAnswers = {
    targetDistance: null,
    raceTiming: null,
    raceDate: null,
    daysPerWeek: null,
    experience: null,
    currentMileage: null,
    mindset: null,
};

export interface PhilosophyRecommendation {
    primary: TrainingPhilosophy;
    scores: Record<TrainingPhilosophy, number>;
    reasoning: string[];
    warnings: string[];
}
