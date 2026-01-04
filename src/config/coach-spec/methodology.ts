/**
 * Methodology Configuration
 * 
 * Defines all coaches, protocols, and research sources we follow
 * This is the foundation of "Built on science. Not opinions."
 */

export interface Coach {
    id: string;
    name: string;
    title: string;
    expertise: string[];
    protocol: string;
    keyConceptShort: string;
    keyConceptFull: string;
    /** Plain-language explanation of why this methodology matters for your training */
    whatThisMeans: string;
    source: string;
    website?: string;
}

export interface ResearchSource {
    id: string;
    title: string;
    authors: string;
    year: number;
    journal?: string;
    keyFinding: string;
    doi?: string;
}

/**
 * All coaches whose methodologies inform the training engine
 */
export const COACHES: Record<string, Coach> = {
    hansons: {
        id: 'hansons',
        name: 'Hansons',
        title: 'Keith & Kevin Hanson',
        expertise: ['marathon', 'cumulative fatigue', 'weekly structure'],
        protocol: 'Cumulative Fatigue Training',
        keyConceptShort: 'Cumulative fatigue',
        keyConceptFull: '6 runs/week, 16-mile long run cap, train on tired legs to simulate race conditions',
        whatThisMeans: 'Your plan has you running 6 days per week. Long runs are capped at 16 miles (not 20+) because by that point you\'re already running on tired legs from the week\'s training. This simulates how your legs will feel at mile 20 of the actual marathon. The goal is "cumulative fatigue" — teaching your body to perform when not fully fresh.',
        source: 'Hansons Marathon Method',
        website: 'https://hansons-running.com',
    },

    higdon: {
        id: 'higdon',
        name: 'Hal Higdon',
        title: 'Hal Higdon',
        expertise: ['novice plans', 'long run progression', 'consistency', 'marathon training'],
        protocol: 'Simplicity-First Marathon Plans',
        keyConceptShort: 'Simplicity + consistency',
        keyConceptFull: 'Long-run-centered plans, stepback weeks, conservative pacing, and clear weekly rhythm for beginners',
        whatThisMeans: 'Higdon’s approach is built for adherence: a simple weekly rhythm, gradual long-run progression, and conservative pacing that keeps you healthy. We use it as a benchmark for novice-friendly structure and messaging, alongside our more technical systems.',
        source: 'Hal Higdon Training Plans',
        website: 'https://www.halhigdon.com',
    },

    daniels: {
        id: 'daniels',
        name: 'Jack Daniels',
        title: 'Dr. Jack Daniels, PhD',
        expertise: ['vdot', 'pacing', 'interval training', 'physiology'],
        protocol: 'VDOT Training System',
        keyConceptShort: 'Pacing precision',
        keyConceptFull: 'Every pace calculated from your VDOT—E, M, T, I, R zones scientifically derived from race performance',
        whatThisMeans: 'VDOT is your "running fitness score" based on a recent race. Once we know your VDOT, we calculate exact paces for every type of run: Easy (recovery), Marathon (race pace), Tempo/Threshold (comfortably hard), Interval (short, fast), and Repetition (speed work). No guessing — every pace has a scientific basis tied to YOUR current fitness.',
        source: "Daniels' Running Formula",
        website: 'https://runsmartproject.com',
    },

    seiler: {
        id: 'seiler',
        name: 'Stephen Seiler',
        title: 'Dr. Stephen Seiler, PhD',
        expertise: ['polarized training', 'intensity distribution', 'endurance physiology'],
        protocol: '80/20 Polarized Training',
        keyConceptShort: 'Polarized training',
        keyConceptFull: '80% easy, 20% hard—avoid the "moderate zone" that leads to fatigue without adaptation',
        whatThisMeans: 'About 80% of your training should feel genuinely easy — you could hold a conversation. The other 20% should be genuinely hard — tempo runs, intervals, races. The mistake most runners make is running too hard on easy days, which means they\'re too tired to go hard enough on quality days. The "gray zone" (moderate effort) just makes you tired without making you faster.',
        source: 'Research on elite endurance athletes',
        website: 'https://www.researchgate.net/profile/Stephen-Seiler',
    },

    dicharry: {
        id: 'dicharry',
        name: 'Jay Dicharry',
        title: 'Jay Dicharry, MPT, SCS',
        expertise: ['movement quality', 'durability', 'gait analysis', 'injury prevention'],
        protocol: 'Running Rewired Protocol',
        keyConceptShort: 'Movement quality',
        keyConceptFull: '12 durability assessments that identify weaknesses before they become injuries',
        whatThisMeans: 'We check your movement quality — can you balance on one leg? Do your hips drop when you run? Is your calf strength asymmetrical? These "durability" screens catch problems before they become injuries. If your hips are weak, we add hip strengthening. If your ankle mobility is limited, we add mobility work. The goal is to fix the cause, not just treat symptoms.',
        source: 'Running Rewired',
        website: 'https://www.rerunlab.com',
    },

    starrett: {
        id: 'starrett',
        name: 'Kelly Starrett',
        title: 'Dr. Kelly Starrett, DPT',
        expertise: ['mobility', 'movement', 'ready state', 'position'],
        protocol: 'Ready State Mobility System',
        keyConceptShort: 'Position & mobility',
        keyConceptFull: 'Daily maintenance work to restore range of motion and bulletproof your body',
        whatThisMeans: 'Running tightens certain muscles (hip flexors, calves, hamstrings). Daily mobility work — just 10-15 minutes — restores your range of motion and prevents the stiffness that leads to injury. Think of it like flossing for your body: small daily habit, huge long-term payoff.',
        source: 'Ready to Run, Becoming a Supple Leopard',
        website: 'https://thereadystate.com',
    },

    storen: {
        id: 'storen',
        name: 'Øyvind Støren',
        title: 'Dr. Øyvind Støren, PhD',
        expertise: ['running economy', 'max strength', 'endurance performance'],
        protocol: 'Max Strength for Running Economy',
        keyConceptShort: 'Heavy lifting for economy',
        keyConceptFull: '4x4 heavy squats improve running economy 5% without adding body mass',
        whatThisMeans: 'Heavy strength training (think: 4 sets of 4 back squats at near-max weight) makes you a more efficient runner without adding bulk. The research shows a 5% improvement in "running economy" — meaning you use less energy at the same pace. That\'s free speed.',
        source: 'Støren et al. 2008 Research',
    },

    fitzgerald: {
        id: 'fitzgerald',
        name: 'Matt Fitzgerald',
        title: 'Matt Fitzgerald',
        expertise: ['80/20 running', 'race weight', 'mental fitness'],
        protocol: '80/20 Running',
        keyConceptShort: '80/20 implementation',
        keyConceptFull: 'Practical application of polarized training for recreational runners',
        whatThisMeans: 'Takes Seiler\'s research on elite athletes and makes it practical for everyday runners. The core principle: run really easy most of the time, then go hard when it counts. Your watch will tell you if you\'re doing it right.',
        source: '80/20 Running',
        website: 'https://www.8020endurance.com',
    },

    pfitzinger: {
        id: 'pfitzinger',
        name: 'Pete Pfitzinger',
        title: 'Pete Pfitzinger, MS',
        expertise: ['marathon training', 'lactate threshold', 'periodization'],
        protocol: 'Advanced Marathoning',
        keyConceptShort: 'Elite marathon prep',
        keyConceptFull: '12-18 week progressive plans with medium-long runs and lactate threshold focus',
        whatThisMeans: 'The marathon isn\'t just about the long run. Pfitzinger emphasizes "medium-long" runs (12-15 miles) during the week to build endurance volume, plus lactate threshold work to raise the pace you can hold without blowing up. This is advanced programming for serious marathoners.',
        source: 'Advanced Marathoning',
    },

    magness: {
        id: 'magness',
        name: 'Steve Magness',
        title: 'Steve Magness, MS',
        expertise: ['science of running', 'coaching', 'performance'],
        protocol: 'Science of Running',
        keyConceptShort: 'Modern running science',
        keyConceptFull: 'Evidence-based approach combining traditional methods with current research',
        whatThisMeans: 'Bridges the gap between what coaches have known works and what scientists have proven in labs. Uses the latest research to validate (or update) traditional training wisdom.',
        source: 'The Science of Running',
        website: 'https://www.scienceofrunning.com',
    },

    ingebrigtsen: {
        id: 'ingebrigtsen',
        name: 'Gjert Ingebrigtsen',
        title: 'Gjert Ingebrigtsen',
        expertise: ['threshold training', 'volume', 'elite development'],
        protocol: 'Norwegian Threshold Method',
        keyConceptShort: 'Threshold volume',
        keyConceptFull: 'Double threshold days, high aerobic volume, lactate-guided intensity',
        whatThisMeans: 'The method behind the Ingebrigtsen brothers (world champion runners). Key innovation: two threshold workouts in one day with several hours rest between. They also use lactate testing to dial in exact intensities. Elite-level methods for those ready for high volume.',
        source: 'Norwegian Athletics Model',
    },
};

/**
 * Key research papers that inform the engine
 */
export const RESEARCH_SOURCES: ResearchSource[] = [
    {
        id: 'storen_2008',
        title: 'Maximal Strength Training Improves Running Economy',
        authors: 'Støren Ø, Helgerud J, Støa EM, Hoff J',
        year: 2008,
        journal: 'Medicine & Science in Sports & Exercise',
        keyFinding: '5% improvement in running economy from 4×4 squats, 3×/week for 8 weeks',
        doi: '10.1249/MSS.0b013e3181760e0e',
    },
    {
        id: 'seiler_2010',
        title: 'What is Best Practice for Training Intensity Distribution',
        authors: 'Seiler S',
        year: 2010,
        journal: 'International Journal of Sports Physiology and Performance',
        keyFinding: 'Elite endurance athletes train 80%+ at low intensity, 15-20% at high intensity',
        doi: '10.1123/ijspp.5.3.276',
    },
    {
        id: 'paavolainen_1999',
        title: 'Explosive-strength training improves 5-km running time',
        authors: 'Paavolainen L, Häkkinen K, Hämäläinen I, Nummela A, Rusko H',
        year: 1999,
        journal: 'Journal of Applied Physiology',
        keyFinding: 'Plyometrics and speed work improve distance running performance',
        doi: '10.1152/jappl.1999.86.5.1527',
    },
    {
        id: 'beattie_2017',
        title: 'The Effect of Strength Training on Performance Indicators in Distance Runners',
        authors: 'Beattie K, Carson BP, Lyons M, Rossiter A, Kenny IC',
        year: 2017,
        journal: 'Journal of Strength and Conditioning Research',
        keyFinding: 'Heavy strength training improves running economy and time trial performance',
        doi: '10.1519/JSC.0000000000001584',
    },
    {
        id: 'acsm_2021',
        title: 'ACSM Guidelines for Exercise Testing and Prescription',
        authors: 'American College of Sports Medicine',
        year: 2021,
        journal: 'ACSM',
        keyFinding: 'Evidence-based guidelines for prescription of exercise intensity and volume',
    },
];

/**
 * Categories for displaying coaches by expertise
 */
export const METHODOLOGY_CATEGORIES = {
    running: {
        title: 'Running Science',
        coaches: ['daniels', 'hansons', 'higdon', 'seiler', 'pfitzinger', 'fitzgerald', 'magness'],
        description: 'Evidence-based pacing, periodization, and training structure',
    },
    strength: {
        title: 'Strength & Power',
        coaches: ['storen'],
        description: 'Heavy lifting protocols proven to improve running economy',
    },
    durability: {
        title: 'Durability & Movement',
        coaches: ['dicharry', 'starrett'],
        description: 'Movement quality, mobility, and injury prevention',
    },
    elite: {
        title: 'Elite Methods',
        coaches: ['ingebrigtsen'],
        description: 'Training methods from world-class programs',
    },
};

/**
 * Get coach by ID
 */
export function getCoach(id: string): Coach | undefined {
    return COACHES[id];
}

/**
 * Get all coaches
 */
export function getAllCoaches(): Coach[] {
    return Object.values(COACHES);
}

/**
 * Get coaches by category
 */
export function getCoachesByCategory(category: keyof typeof METHODOLOGY_CATEGORIES): Coach[] {
    return METHODOLOGY_CATEGORIES[category].coaches.map(id => COACHES[id]);
}
