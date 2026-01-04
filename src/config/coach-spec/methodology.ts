/**
 * Methodology Configuration
 * 
 * Defines all coaches, protocols, and research sources we follow
 * This is the foundation of "Built on science. Not opinions."
 */

export interface Coach {
    // === Identity ===
    id: string;
    name: string;
    title: string;
    /** Formal credentials: PhD, MS, DPT, Olympic titles, etc. */
    credentials: string;
    /** Photo URL for future use (not currently displayed) */
    photoUrl?: string;

    // === Expertise ===
    expertise: string[];
    protocol: string;

    // === Key Concept (collapsed view) ===
    keyConceptShort: string;
    keyConceptFull: string;

    // === Bio (expanded view) ===
    /** 3-5 sentence narrative covering background → achievements → philosophy */
    bio: string;
    /** Key achievements as bullet points */
    achievements: string[];
    /** Published books */
    publications?: string[];
    /** Notable athletes coached */
    notableAthletes?: string[];

    // === Training Application ===
    /** Plain-language explanation of why this methodology matters for your training */
    whatThisMeans: string;

    // === Attribution ===
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
        credentials: '40+ years coaching',
        expertise: ['marathon', 'cumulative fatigue', 'weekly structure'],
        protocol: 'Cumulative Fatigue Training',
        keyConceptShort: 'Cumulative fatigue',
        keyConceptFull: '6 runs/week, 16-mile long run cap, train on tired legs to simulate race conditions',
        bio: 'Keith and Kevin Hanson are Michigan-based brothers who have coached distance runners for over four decades. In 1999, they founded the Hansons-Brooks Distance Project, an Olympic development program that has produced four Olympians and twelve National Champions. Their "cumulative fatigue" philosophy challenges conventional wisdom by capping long runs at 16 miles — arguing that running on already-tired legs better simulates race conditions than running 20+ miles on fresh legs.',
        achievements: [
            'Founded Hansons-Brooks Distance Project (1999)',
            'Coached 4 Olympians including Brian Sell (2008)',
            'Coached Des Linden to 2018 Boston Marathon victory',
            '12 National Champions under their guidance',
            'Over 100 Olympic Trials qualifiers',
        ],
        publications: ['Hansons Marathon Method', 'Hansons Half-Marathon Method'],
        notableAthletes: ['Des Linden', 'Brian Sell', 'Desiree Davila'],
        whatThisMeans: 'Your plan has you running 6 days per week. Long runs are capped at 16 miles (not 20+) because by that point you\'re already running on tired legs from the week\'s training. This simulates how your legs will feel at mile 20 of the actual marathon. The goal is "cumulative fatigue" — teaching your body to perform when not fully fresh.',
        source: 'Hansons Marathon Method',
        website: 'https://hansons-running.com',
    },

    higdon: {
        id: 'higdon',
        name: 'Hal Higdon',
        title: 'Hal Higdon',
        credentials: 'Contributing Editor, Runner\'s World',
        expertise: ['novice plans', 'long run progression', 'consistency', 'marathon training'],
        protocol: 'Simplicity-First Marathon Plans',
        keyConceptShort: 'Simplicity + consistency',
        keyConceptFull: 'Long-run-centered plans, stepback weeks, conservative pacing, and clear weekly rhythm for beginners',
        bio: 'Hal Higdon (born 1931) has dedicated over seven decades to distance running as an athlete, writer, and coach. He competed in eight U.S. Olympic Trials, ran a 2:21:55 marathon at Boston in 1964, and completed 111 marathons in his career. As a co-founder of the Road Runners Club of America and Contributing Editor at Runner\'s World since 1966, he has helped over half a million runners complete their first marathon through his accessible, progressive training programs.',
        achievements: [
            '2:21:55 marathon PR at 1964 Boston Marathon',
            'Competed in 8 U.S. Olympic Trials',
            '4 World Masters Championships (steeplechase)',
            'RRCA Hall of Fame inductee',
            'Trained 500,000+ runners to marathon finish',
        ],
        publications: ['Marathon: The Ultimate Training Guide', 'Hal Higdon\'s Half Marathon Training', 'Run Fast'],
        whatThisMeans: 'Higdon\'s approach is built for adherence: a simple weekly rhythm, gradual long- run progression, and conservative pacing that keeps you healthy.We use it as a benchmark for novice - friendly structure and messaging, alongside our more technical systems.',
        source: 'Hal Higdon Training Plans',
        website: 'https://www.halhigdon.com',
    },

    daniels: {
        id: 'daniels',
        name: 'Jack Daniels',
        title: 'Dr. Jack Daniels, PhD',
        credentials: 'PhD, 2x Olympic Medalist',
        expertise: ['vdot', 'pacing', 'interval training', 'physiology'],
        protocol: 'VDOT Training System',
        keyConceptShort: 'Pacing precision',
        keyConceptFull: 'Every pace calculated from your VDOT—E, M, T, I, R zones scientifically derived from race performance',
        bio: 'Dr. Jack Daniels (1933–2025) earned his PhD in exercise physiology from the University of Wisconsin-Madison and won two Olympic medals in the modern pentathlon (1956, 1960). Runner\'s World called him "the world\'s best running coach." He invented the VDOT system — a way to calculate precise training paces from race performances without lab testing. At SUNY Cortland, his teams won 8 NCAA Division III titles and produced 31 individual champions.',
        achievements: [
            '2x Olympic medalist (modern pentathlon)',
            'Created the VDOT training system',
            '8 NCAA Division III national titles at SUNY Cortland',
            '31 individual national champions coached',
            'Named "world\'s best running coach" by Runner\'s World',
        ],
        publications: ['Daniels\' Running Formula'],
        notableAthletes: ['Joan Benoit Samuelson', 'Jim Ryun', 'Magdalena Lewy Boulet'],
        whatThisMeans: 'VDOT is your "running fitness score" based on a recent race. Once we know your VDOT, we calculate exact paces for every type of run: Easy (recovery), Marathon (race pace), Tempo/Threshold (comfortably hard), Interval (short, fast), and Repetition (speed work). No guessing — every pace has a scientific basis tied to YOUR current fitness.',
        source: "Daniels' Running Formula",
        website: 'https://runsmartproject.com',
    },

    seiler: {
        id: 'seiler',
        name: 'Stephen Seiler',
        title: 'Dr. Stephen Seiler, PhD',
        credentials: 'PhD, ~100 peer-reviewed papers',
        expertise: ['polarized training', 'intensity distribution', 'endurance physiology'],
        protocol: '80/20 Polarized Training',
        keyConceptShort: 'Polarized training',
        keyConceptFull: '80% easy, 20% hard—avoid the "moderate zone" that leads to fatigue without adaptation',
        bio: 'Dr. Stephen Seiler is an American exercise physiologist who earned his PhD from the University of Texas at Austin and has been a professor at the University of Agder in Norway for over two decades. His research on elite endurance athletes across cycling, rowing, cross-country skiing, and running demonstrated that world-class performers train approximately 80% at low intensity and 20% at high intensity — the "polarized" model. He has published roughly 100 peer-reviewed papers and served on the Executive Board of the European College of Sport Science.',
        achievements: [
            'Pioneered the polarized 80/20 training model',
            '~100 peer-reviewed publications',
            'Executive Board, European College of Sport Science (2014-2019)',
            'Founding editorial board, International Journal of Sports Physiology and Performance',
            'Vice-Rector for Research, University of Agder',
        ],
        whatThisMeans: 'About 80% of your training should feel genuinely easy — you could hold a conversation. The other 20% should be genuinely hard — tempo runs, intervals, races. The mistake most runners make is running too hard on easy days, which means they\'re too tired to go hard enough on quality days. The "gray zone" (moderate effort) just makes you tired without making you faster.',
        source: 'Research on elite endurance athletes',
        website: 'https://www.researchgate.net/profile/Stephen-Seiler',
    },

    dicharry: {
        id: 'dicharry',
        name: 'Jay Dicharry',
        title: 'Jay Dicharry, MPT, SCS',
        credentials: 'MPT, Board-Certified SCS',
        expertise: ['movement quality', 'durability', 'gait analysis', 'injury prevention'],
        protocol: 'Running Rewired Protocol',
        keyConceptShort: 'Movement quality',
        keyConceptFull: '12 durability assessments that identify weaknesses before they become injuries',
        bio: 'Jay Dicharry is a physical therapist and biomechanics researcher who established his reputation as Director of the SPEED Clinic at the University of Virginia. He holds a Master of Physical Therapy from LSU and is a Board-Certified Sports Clinical Specialist. His approach merges clinical practice, coaching, and engineering to identify the root causes of running injuries. He has published over 35 journal articles and invented the MOBO mobility board.',
        achievements: [
            'Director of UVA SPEED Clinic',
            '35+ peer-reviewed journal articles',
            'Board-Certified Sports Clinical Specialist',
            'Consultant to USA Track and Field, USA Triathlon, US Air Force',
            'Invented MOBO mobility board',
        ],
        publications: ['Running Rewired', 'Anatomy for Runners'],
        whatThisMeans: 'We check your movement quality — can you balance on one leg? Do your hips drop when you run? Is your calf strength asymmetrical? These "durability" screens catch problems before they become injuries. If your hips are weak, we add hip strengthening. If your ankle mobility is limited, we add mobility work. The goal is to fix the cause, not just treat symptoms.',
        source: 'Running Rewired',
        website: 'https://www.rerunlab.com',
    },

    starrett: {
        id: 'starrett',
        name: 'Kelly Starrett',
        title: 'Dr. Kelly Starrett, DPT',
        credentials: 'DPT',
        expertise: ['mobility', 'movement', 'ready state', 'position'],
        protocol: 'Ready State Mobility System',
        keyConceptShort: 'Position & mobility',
        keyConceptFull: 'Daily maintenance work to restore range of motion and bulletproof your body',
        bio: 'Dr. Kelly Starrett earned his Doctor of Physical Therapy from Samuel Merritt University in 2007 after competing as a 2x national champion in kayaking. In 2005, he and his wife Juliet co-founded San Francisco CrossFit (the 21st affiliate worldwide). His mobility philosophy — that everyone should know how to perform basic maintenance on their own body — has reached millions through his platform The Ready State and his New York Times bestselling books.',
        achievements: [
            '2x national kayaking champion',
            'Co-founded San Francisco CrossFit (#21 affiliate)',
            'New York Times bestselling author',
            'Wall Street Journal bestselling author',
            'Founded The Ready State (formerly MobilityWOD)',
        ],
        publications: ['Becoming a Supple Leopard', 'Ready to Run', 'Built to Move'],
        whatThisMeans: 'Running tightens certain muscles (hip flexors, calves, hamstrings). Daily mobility work — just 10-15 minutes — restores your range of motion and prevents the stiffness that leads to injury. Think of it like flossing for your body: small daily habit, huge long-term payoff.',
        source: 'Ready to Run, Becoming a Supple Leopard',
        website: 'https://thereadystate.com',
    },

    storen: {
        id: 'storen',
        name: 'Øyvind Støren',
        title: 'Dr. Øyvind Støren, PhD',
        credentials: 'Professor of Physiology',
        expertise: ['running economy', 'max strength', 'endurance performance'],
        protocol: 'Max Strength for Running Economy',
        keyConceptShort: 'Heavy lifting for economy',
        keyConceptFull: '4x4 heavy squats improve running economy 5% without adding body mass',
        bio: 'Dr. Øyvind Støren is a Professor of Physiology at the University of South-Eastern Norway, specializing in the intersection of strength training and endurance performance. His landmark 2008 study demonstrated that an 8-week maximal strength training program (4x4 half-squats, 3x/week) improved running economy by 5% and time to exhaustion by 21% in well-trained distance runners — without increasing body mass or reducing VO2max.',
        achievements: [
            'Published landmark 2008 running economy study',
            'Proved 5% running economy improvement from heavy strength training',
            'Demonstrated 21% improvement in time to exhaustion',
            'Professor at University of South-Eastern Norway',
            'Pioneered neuromuscular adaptation research for runners',
        ],
        whatThisMeans: 'Heavy strength training (think: 4 sets of 4 back squats at near-max weight) makes you a more efficient runner without adding bulk. The research shows a 5% improvement in "running economy" — meaning you use less energy at the same pace. That\'s free speed.',
        source: 'Støren et al. 2008 Research',
    },

    fitzgerald: {
        id: 'fitzgerald',
        name: 'Matt Fitzgerald',
        title: 'Matt Fitzgerald',
        credentials: 'Certified Sports Nutritionist',
        expertise: ['80/20 running', 'race weight', 'mental fitness'],
        protocol: '80/20 Running',
        keyConceptShort: '80/20 implementation',
        keyConceptFull: 'Practical application of polarized training for recreational runners',
        bio: 'Matt Fitzgerald is an endurance sports author, coach, and certified sports nutritionist who has written over 30 books on running, triathlon, and training psychology. He co-founded 80/20 Endurance, one of the leading providers of online training plans worldwide, and created Dream Run Camp in Flagstaff, Arizona. His work translates the polarized training research of scientists like Stephen Seiler into practical plans for everyday runners.',
        achievements: [
            'Author of 30+ endurance sports books',
            'Co-founded 80/20 Endurance',
            'Created Dream Run Camp (Flagstaff, AZ)',
            'Certified Sports Nutritionist',
            'Coaching runners and triathletes since 2001',
        ],
        publications: ['80/20 Running', 'Racing Weight', 'How Bad Do You Want It?', 'Brain Training for Runners', 'The Comeback Quotient'],
        whatThisMeans: 'Takes Seiler\'s research on elite athletes and makes it practical for everyday runners. The core principle: run really easy most of the time, then go hard when it counts. Your watch will tell you if you\'re doing it right.',
        source: '80/20 Running',
        website: 'https://www.8020endurance.com',
    },

    pfitzinger: {
        id: 'pfitzinger',
        name: 'Pete Pfitzinger',
        title: 'Pete Pfitzinger, MS',
        credentials: 'MS Exercise Science, 2x Olympian',
        expertise: ['marathon training', 'lactate threshold', 'periodization'],
        protocol: 'Advanced Marathoning',
        keyConceptShort: 'Elite marathon prep',
        keyConceptFull: '12-18 week progressive plans with medium-long runs and lactate threshold focus',
        bio: 'Pete Pfitzinger is a former elite marathoner who won the 1984 U.S. Olympic Marathon Trials with a time of 2:11:43 — famously passing Alberto Salazar in the final yards. He represented the United States in both the 1984 and 1988 Olympic Games (11th and 14th place, respectively). With a Master\'s degree in Exercise Science from UMass Amherst, he became an exercise physiologist and authored the definitive guide for competitive amateur marathoners.',
        achievements: [
            'Won 1984 U.S. Olympic Marathon Trials (2:11:43)',
            '2x Olympian (1984 Los Angeles, 1988 Seoul)',
            'Top American finisher at 1984 and 1988 Olympics',
            'RRCA Hall of Fame inductee',
            'Cornell Athletics Hall of Fame inductee',
        ],
        publications: ['Advanced Marathoning', 'Faster Road Racing'],
        whatThisMeans: 'The marathon isn\'t just about the long run. Pfitzinger emphasizes "medium-long" runs (12-15 miles) during the week to build endurance volume, plus lactate threshold work to raise the pace you can hold without blowing up. This is advanced programming for serious marathoners.',
        source: 'Advanced Marathoning',
    },

    magness: {
        id: 'magness',
        name: 'Steve Magness',
        title: 'Steve Magness, MS',
        credentials: 'MS Exercise Science',
        expertise: ['science of running', 'coaching', 'performance'],
        protocol: 'Science of Running',
        keyConceptShort: 'Modern running science',
        keyConceptFull: 'Evidence-based approach combining traditional methods with current research',
        bio: 'Steve Magness ran a 4:01 mile in high school — among the fastest in U.S. history at the time. He earned his Master\'s in Exercise Science from George Mason University and served as head cross country coach at the University of Houston. As an assistant coach at the Nike Oregon Project, he helped athletes win medals at the 2011 World Championships and 2012 Olympics. His coaching philosophy emphasizes individualization: "Coach the person, not the system."',
        achievements: [
            '4:01 high school mile (among fastest in U.S. history)',
            'Head cross country coach, University of Houston',
            'Nike Oregon Project assistant (coached Olympic medalists)',
            'Coached athletes to World Championship and Olympic medals',
            'Host of "The Growth Equation" podcast',
        ],
        publications: ['The Science of Running', 'Do Hard Things', 'Peak Performance', 'The Passion Paradox'],
        notableAthletes: ['Neely Spence-Gracey', 'Mark English', 'Roberta Groner'],
        whatThisMeans: 'Bridges the gap between what coaches have known works and what scientists have proven in labs. Uses the latest research to validate (or update) traditional training wisdom.',
        source: 'The Science of Running',
        website: 'https://www.scienceofrunning.com',
    },

    ingebrigtsen: {
        id: 'ingebrigtsen',
        name: 'Gjert Ingebrigtsen',
        title: 'Gjert Ingebrigtsen',
        credentials: 'Norwegian Coach of Year 2018',
        expertise: ['threshold training', 'volume', 'elite development'],
        protocol: 'Norwegian Threshold Method',
        keyConceptShort: 'Threshold volume',
        keyConceptFull: 'Double threshold days, high aerobic volume, lactate-guided intensity',
        bio: 'Gjert Ingebrigtsen coached his three sons — Henrik, Filip, and Jakob — to become world-class middle-distance runners, including Olympic and World Championship titles. His innovative "Norwegian method" features double threshold training: two lactate-guided threshold sessions in one day with several hours between. By using blood lactate monitoring to precisely control intensity (targeting ~2.5-3.5 mmol/L), he maximizes aerobic development while minimizing injury risk.',
        achievements: [
            'Norwegian Sports Coach of the Year 2018',
            'Coached 3 sons to Olympic and World Championship medals',
            'Pioneered the "double threshold" training method',
            'Developed lactate-guided intensity protocols',
            'Coached Jakob Ingebrigtsen to Olympic 1500m gold (2020)',
        ],
        notableAthletes: ['Jakob Ingebrigtsen', 'Filip Ingebrigtsen', 'Henrik Ingebrigtsen'],
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
