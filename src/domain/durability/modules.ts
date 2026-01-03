/**
 * Durability Modules
 * 
 * Corrective exercise modules assigned based on assessment results
 * Based on Dicharry Running Rewired and Starrett mobility work
 */

export interface DurabilityExercise {
    id: string;
    name: string;
    sets: number;
    reps: string;
    holdSeconds?: number;
    notes?: string;
}

export interface DurabilityModule {
    id: string;
    name: string;
    category: 'foot' | 'ankle' | 'hip' | 'core' | 'mobility' | 'balance';
    durationMin: number;
    frequency: 'daily' | 'every_other_day' | '3x_week';
    exercises: DurabilityExercise[];
    source: string;
}

export const DURABILITY_MODULES: Record<string, DurabilityModule> = {
    foot_intrinsics: {
        id: 'foot_intrinsics',
        name: 'Foot Intrinsic Activation',
        category: 'foot',
        durationMin: 8,
        frequency: 'daily',
        exercises: [
            { id: 'toe_yoga', name: 'Toe Yoga', sets: 2, reps: '10 each direction' },
            { id: 'short_foot', name: 'Short Foot', sets: 3, reps: '10', holdSeconds: 5 },
            { id: 'towel_scrunches', name: 'Towel Scrunches', sets: 2, reps: '20' },
            { id: 'marble_pickups', name: 'Marble Pickups', sets: 1, reps: '10 each foot' },
        ],
        source: 'Dicharry Running Rewired',
    },

    ankle_mobility: {
        id: 'ankle_mobility',
        name: 'Ankle Dorsiflexion Mobility',
        category: 'ankle',
        durationMin: 10,
        frequency: 'daily',
        exercises: [
            { id: 'wall_ankle', name: 'Wall Ankle Stretch', sets: 3, reps: '45s each', holdSeconds: 45 },
            { id: 'banded_df', name: 'Banded Dorsiflexion', sets: 2, reps: '15 each' },
            { id: 'calf_foam_roll', name: 'Calf Foam Roll', sets: 1, reps: '90s each', holdSeconds: 90 },
        ],
        source: 'Starrett Ready to Run',
    },

    calf_strength: {
        id: 'calf_strength',
        name: 'Calf Strength Progression',
        category: 'ankle',
        durationMin: 12,
        frequency: 'every_other_day',
        exercises: [
            { id: 'standing_calf', name: 'Standing Calf Raise', sets: 3, reps: '15' },
            { id: 'single_leg_calf', name: 'Single Leg Calf Raise', sets: 3, reps: '12 each' },
            { id: 'eccentric_calf', name: 'Eccentric Calf Lower', sets: 3, reps: '10 each', notes: '3s lower' },
        ],
        source: 'Dicharry Running Rewired',
    },

    hip_stability: {
        id: 'hip_stability',
        name: 'Hip Stability Circuit',
        category: 'hip',
        durationMin: 15,
        frequency: 'every_other_day',
        exercises: [
            { id: 'side_lying_clam', name: 'Side Lying Clam', sets: 3, reps: '15 each' },
            { id: 'side_plank_lift', name: 'Side Plank + Hip Lift', sets: 2, reps: '10 each' },
            { id: 'single_leg_bridge', name: 'Single Leg Bridge', sets: 3, reps: '10 each', holdSeconds: 3 },
            { id: 'banded_monster_walk', name: 'Banded Monster Walk', sets: 2, reps: '20 steps' },
        ],
        source: 'Dicharry Running Rewired',
    },

    glute_activation: {
        id: 'glute_activation',
        name: 'Glute Activation Series',
        category: 'hip',
        durationMin: 10,
        frequency: 'daily',
        exercises: [
            { id: 'bridge', name: 'Glute Bridge', sets: 2, reps: '15', holdSeconds: 2 },
            { id: 'fire_hydrant', name: 'Fire Hydrant', sets: 2, reps: '12 each' },
            { id: 'donkey_kick', name: 'Donkey Kick', sets: 2, reps: '12 each' },
            { id: 'standing_hip_circle', name: 'Standing Hip Circle', sets: 1, reps: '10 each direction' },
        ],
        source: 'Dicharry Running Rewired',
    },

    hip_flexor_mobility: {
        id: 'hip_flexor_mobility',
        name: 'Hip Flexor Mobility',
        category: 'mobility',
        durationMin: 8,
        frequency: 'daily',
        exercises: [
            { id: 'couch_stretch', name: 'Couch Stretch', sets: 2, reps: '90s each', holdSeconds: 90 },
            { id: 'half_kneeling_hip', name: 'Half-Kneeling Hip Stretch', sets: 2, reps: '60s each', holdSeconds: 60 },
            { id: 'psoas_march', name: 'Supine Psoas March', sets: 2, reps: '10 each' },
        ],
        source: 'Starrett Becoming a Supple Leopard',
    },

    core_stability: {
        id: 'core_stability',
        name: 'Runner Core Stability',
        category: 'core',
        durationMin: 12,
        frequency: 'every_other_day',
        exercises: [
            { id: 'dead_bug', name: 'Dead Bug', sets: 3, reps: '10 each side' },
            { id: 'bird_dog', name: 'Bird Dog', sets: 3, reps: '10 each side', holdSeconds: 3 },
            { id: 'pallof_press', name: 'Pallof Press', sets: 2, reps: '10 each side' },
            { id: 'plank', name: 'Plank', sets: 2, reps: '45s', holdSeconds: 45 },
        ],
        source: 'Dicharry Running Rewired',
    },

    balance_progression: {
        id: 'balance_progression',
        name: 'Balance Progression',
        category: 'balance',
        durationMin: 8,
        frequency: '3x_week',
        exercises: [
            { id: 'single_leg_stand', name: 'Single Leg Stand Eyes Closed', sets: 3, reps: '30s each' },
            { id: 'single_leg_reaches', name: 'Single Leg Reaches', sets: 2, reps: '8 each direction' },
            { id: 'bosu_balance', name: 'BOSU Balance (if available)', sets: 2, reps: '30s each' },
        ],
        source: 'Dicharry Running Rewired',
    },

    thoracic_mobility: {
        id: 'thoracic_mobility',
        name: 'Thoracic Spine Mobility',
        category: 'mobility',
        durationMin: 8,
        frequency: 'daily',
        exercises: [
            { id: 't_spine_rotation', name: 'Thread the Needle', sets: 2, reps: '10 each side' },
            { id: 'cat_cow', name: 'Cat-Cow', sets: 2, reps: '10' },
            { id: 'foam_roll_thoracic', name: 'Foam Roll Thoracic', sets: 1, reps: '60s', holdSeconds: 60 },
            { id: 'open_book', name: 'Open Book Stretch', sets: 2, reps: '8 each side', holdSeconds: 5 },
        ],
        source: 'Starrett Becoming a Supple Leopard',
    },
};

export function getModule(id: string): DurabilityModule | undefined {
    return DURABILITY_MODULES[id];
}

export function getModulesByCategory(category: DurabilityModule['category']): DurabilityModule[] {
    return Object.values(DURABILITY_MODULES).filter(m => m.category === category);
}

export function calculateTotalDurabilityTime(moduleIds: string[]): number {
    return moduleIds.reduce((sum, id) => {
        const module = DURABILITY_MODULES[id];
        return sum + (module?.durationMin || 0);
    }, 0);
}
