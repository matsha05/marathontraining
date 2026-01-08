export interface HeroWeekDay {
  day: string;
  type: "run" | "rest" | "long";
  label: string;
  sub: string;
  strength: boolean;
}

export interface DicharryStandard {
  id: number;
  name: string;
  tooltip: string;
}

export interface StarrettMobilityItem {
  id: "before" | "after";
  label: string;
  value: string;
  tooltip: string;
}

export const HERO_WEEK_PREVIEW: HeroWeekDay[] = [
  { day: "M", type: "run", label: "5mi Easy", sub: "8:32/mi", strength: true },
  { day: "T", type: "run", label: "6×800m", sub: "VO2", strength: false },
  { day: "W", type: "rest", label: "Rest", sub: "", strength: false },
  { day: "T", type: "run", label: "6mi Tempo", sub: "7:15/mi", strength: true },
  { day: "F", type: "run", label: "4mi Easy", sub: "8:45/mi", strength: false },
  { day: "S", type: "run", label: "5mi Easy", sub: "8:32/mi", strength: false },
  { day: "S", type: "long", label: "14mi Long", sub: "8:45/mi", strength: false },
];

export const DICHARRY_STANDARDS: DicharryStandard[] = [
  { id: 1, name: "Toe Yoga", tooltip: "Can you raise your big toe while keeping others down? Tests foot control and arch stability." },
  { id: 2, name: "Balance", tooltip: "45 seconds single-leg stance, barefoot, eyes open. Tests proprioception and stability." },
  { id: 3, name: "Squat", tooltip: "Full-depth squat, heels down, knees tracking over toes. Tests hip, ankle, and thoracic mobility." },
  { id: 4, name: "Ankle DF", tooltip: "Knee-to-wall test: 4+ inches from wall. Tests ankle dorsiflexion for proper running mechanics." },
  { id: 5, name: "Hallux DF", tooltip: "Big toe mobility: 50-70° of extension. Essential for push-off power and preventing plantar issues." },
  { id: 6, name: "Calf Raise", tooltip: "20+ single-leg calf raises per side. Tests Achilles capacity and calf endurance." },
  { id: 7, name: "SL Bridge", tooltip: "10-second single-leg bridge hold, hips level. Tests glute strength and hip stability." },
  { id: 8, name: "Hip Flexor", tooltip: "Doorway test: can you extend your hip without arching your back? Tests hip extension mobility." },
  { id: 9, name: "Hip Flexion", tooltip: "Knee to chest while opposite leg stays flat. Tests hip flexion range for proper leg swing." },
  { id: 10, name: "Rotation", tooltip: "Thoracic spine rotation: 45°+ each way. Essential for arm swing and preventing low back compensation." },
  { id: 11, name: "Core Ctrl", tooltip: "Can you maintain neutral spine under load? Tests deep core stabilizers, not six-pack muscles." },
  { id: 12, name: "SL Hop", tooltip: "Single-leg hop and stick the landing. Integration test: foot, hip, and core working together." },
];

export const STARRETT_MOBILITY: StarrettMobilityItem[] = [
  {
    id: "before",
    label: "Before",
    value: "Prep & Activation",
    tooltip: "10-15 min routine: Deep squat hold (2 min), couch stretch (90s each side), ankle knee-to-wall (10 reps each side), leg swings, A-skips. Checks your squat depth, hip extension, and ankle mobility before you run."
  },
  {
    id: "after",
    label: "After",
    value: "Recovery & Reset",
    tooltip: "5-10 min routine: Foam roll calves and quads (2 min each), lacrosse ball glutes if hotspots present, pigeon stretch (90s each side). Compression socks post-hard sessions. Address tissue restrictions same-day."
  },
];
