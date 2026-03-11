import type {
    DailyDurabilityRoutine,
    DurabilityExercise,
    DurabilityModule,
} from './types';
import {
    PRESCRIPTION_MODULES,
    type PrescriptionModule,
} from '@/domain/durability/prescription-modules';

type PlanModuleId =
    | 'readiness-scan'
    | 'ankle-df'
    | 'couch-stretch'
    | 'hip-flexor-3min'
    | 'calf-tissue'
    | 'toe-yoga'
    | 'foot-screws'
    | 'deep-core-mini'
    | 'single-leg-integration'
    | 'tippy-twist'
    | 'bridge-control'
    | 'calf-capacity';

type PlanModuleConfig = {
    id: PlanModuleId;
    sourceId: keyof typeof PRESCRIPTION_MODULES;
    name?: string;
    category?: DurabilityModule['category'];
};

const PLAN_MODULE_CONFIGS: PlanModuleConfig[] = [
    { id: 'ankle-df', sourceId: 'ankle_df_mobility' },
    { id: 'couch-stretch', sourceId: 'couch_stretch' },
    { id: 'hip-flexor-3min', sourceId: 'hip_flexor_stretch', name: 'Hip Flexor Mobility' },
    { id: 'calf-tissue', sourceId: 'calf_tissue_work' },
    { id: 'toe-yoga', sourceId: 'toe_yoga' },
    { id: 'foot-screws', sourceId: 'foot_screws' },
    { id: 'deep-core-mini', sourceId: 'deep_core_mini' },
    { id: 'single-leg-integration', sourceId: 'single_leg_integration' },
    { id: 'tippy-twist', sourceId: 'balance_progression', name: 'Tippy Twist', category: 'integration' },
    { id: 'bridge-control', sourceId: 'bridge_control' },
    { id: 'calf-capacity', sourceId: 'calf_raise_capacity', name: 'Calf Raise Capacity' },
];

function toPlanExercise(step: PrescriptionModule['steps'][number]): DurabilityExercise {
    return {
        name: step.name,
        dosage: step.dosage,
        cues: step.cues,
        source: 'Research-backed prescription',
    };
}

function toPlanModule(config: PlanModuleConfig): DurabilityModule {
    const source = PRESCRIPTION_MODULES[config.sourceId];
    return {
        id: config.id,
        name: config.name ?? source.name,
        category: config.category ?? source.category,
        durationMinutes: source.durationMinutes,
        frequency: source.frequencyGuidance,
        basedOnAssessment: source.retestAssessments[0],
        exercises: source.steps.map(toPlanExercise),
    };
}

function getMappedModule(id: PlanModuleId): DurabilityModule {
    if (id === 'readiness-scan') {
        return READINESS_SCAN;
    }

    const config = PLAN_MODULE_CONFIGS.find(module => module.id === id);
    if (!config) {
        throw new Error(`Unknown durability module: ${id}`);
    }
    return toPlanModule(config);
}

export const READINESS_SCAN: DurabilityModule = {
    id: 'readiness-scan',
    name: 'Daily Readiness Scan',
    category: 'control',
    durationMinutes: 2,
    frequency: 'daily',
    exercises: [
        { name: 'Toe Yoga Check', dosage: '30-45s', cues: ['Big toe up, others down', 'Reverse the pattern', 'Arch stays lifted'] },
        { name: 'Single-Leg Balance Check', dosage: '10-20s each side', cues: ['Eyes open', 'Hands on shoulders', 'Note any wobble'] },
        { name: '5 Squats', dosage: '20-30s', cues: ['Heels down', 'Knees track over toes', 'Note any pinch or pain'] },
    ],
};

export function getModulesForAssessmentResults(failedAssessments: string[]): DurabilityModule[] {
    const selectedIds = new Set<PlanModuleId>();

    for (const assessmentId of failedAssessments) {
        if (assessmentId === 'ankle_df') {
            selectedIds.add('ankle-df');
        }
        if (assessmentId === 'hip_extension') {
            selectedIds.add('hip-flexor-3min');
            selectedIds.add('couch-stretch');
        }
        if (assessmentId === 'toe_yoga') {
            selectedIds.add('toe-yoga');
            selectedIds.add('foot-screws');
        }
        if (assessmentId === 'dead_bug') {
            selectedIds.add('deep-core-mini');
        }
        if (assessmentId === 'single_leg_balance' || assessmentId === 'single_leg_stance_hip') {
            selectedIds.add('tippy-twist');
            selectedIds.add('single-leg-integration');
        }
        if (assessmentId === 'glute_bridge') {
            selectedIds.add('bridge-control');
        }
        if (assessmentId === 'calf_endurance') {
            selectedIds.add('calf-capacity');
        }
    }

    return Array.from(selectedIds).map(getMappedModule);
}

export function getDailyDurabilityRoutine(
    dayType: 'quality' | 'easy' | 'rest' | 'long',
    failedAssessments: string[] = []
): DailyDurabilityRoutine {
    const modules: DurabilityModule[] = [READINESS_SCAN];

    if (failedAssessments.includes('ankle_df')) {
        modules.push(getMappedModule('ankle-df'));
    } else if (failedAssessments.includes('hip_extension')) {
        modules.push(getMappedModule('couch-stretch'));
    }

    if (failedAssessments.includes('toe_yoga')) {
        modules.push(getMappedModule('toe-yoga'));
    } else if (failedAssessments.includes('single_leg_balance')) {
        modules.push(getMappedModule('tippy-twist'));
    } else {
        modules.push(getMappedModule('deep-core-mini'));
    }

    if (dayType === 'easy' || dayType === 'rest') {
        if (failedAssessments.includes('calf_endurance')) {
            modules.push(getMappedModule('calf-capacity'));
        } else if (failedAssessments.includes('glute_bridge')) {
            modules.push(getMappedModule('bridge-control'));
        }
    }

    const totalMinutes = modules.reduce((sum, module) => sum + module.durationMinutes, 0);
    const name = dayType === 'quality'
        ? 'Pre-Quality Quick Check'
        : dayType === 'long'
            ? 'Pre-Long Run Readiness'
            : dayType === 'easy'
                ? 'Easy Day Durability'
                : 'Rest Day Maintenance';

    return {
        id: `routine-${dayType}`,
        name,
        totalMinutes,
        dayType,
        modules,
    };
}

export function getDailyDurabilityModule(
    dayType: 'quality' | 'easy' | 'rest' | 'long',
    failedAssessments: string[] = []
): DurabilityModule | null {
    return getDailyDurabilityRoutine(dayType, failedAssessments).modules[0] ?? null;
}

export function getAllModules(): DurabilityModule[] {
    return [
        READINESS_SCAN,
        ...PLAN_MODULE_CONFIGS.map(config => toPlanModule(config)),
    ];
}
