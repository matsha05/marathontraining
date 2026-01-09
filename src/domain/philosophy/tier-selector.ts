/**
 * THE LONG GAME - Tier Selector
 *
 * Maps quiz output (philosophy + user profile) to specific plan tier.
 * This bridges the gap between:
 * - Quiz output: "higdon"
 * - Generator needs: "marathon_novice_1"
 *
 * CRITICAL: This is the source of truth for tier selection.
 */

import { TrainingPhilosophy, TargetDistance, Experience, CurrentMileage } from './types';

// =============================================================================
// TYPES
// =============================================================================

export interface TierSelectionInput {
    philosophy: TrainingPhilosophy;
    distance: TargetDistance;
    experience: Experience;
    currentMileage: CurrentMileage;
    daysPerWeek: number;
    weeksAvailable?: number;
}

export interface TierSelectionResult {
    tier: string;
    philosophy: TrainingPhilosophy;
    displayName: string;
    warnings: string[];
}

// =============================================================================
// MILEAGE HELPERS
// =============================================================================

function getMileageValue(mileage: CurrentMileage): number {
    switch (mileage) {
        case 'under_20': return 15;
        case '20_40': return 30;
        case 'over_40': return 50;
        default: return 20;
    }
}

function getMileageLabel(mileage: CurrentMileage): string {
    switch (mileage) {
        case 'under_20': return 'under 20 mpw';
        case '20_40': return '20-40 mpw';
        case 'over_40': return 'over 40 mpw';
        default: return 'your current mileage';
    }
}

// =============================================================================
// HIGDON TIER SELECTION
// =============================================================================

function selectHigdonTier(input: TierSelectionInput): TierSelectionResult {
    const { distance, experience } = input;
    const mileageValue = getMileageValue(input.currentMileage);
    const mileageLabel = getMileageLabel(input.currentMileage);
    const warnings: string[] = [];
    let tier: string;
    let effectiveLevel: 'novice' | 'intermediate' | 'advanced';

    // Capacity-First Tier Selection (per coach_module_architecture.md Section 7)
    // Mileage gates which tiers are available; experience only selects within eligible tiers
    switch (distance) {
        case '5k':
            // 5K thresholds: advanced needs 30+ mpw, intermediate needs 20+ mpw
            if (mileageValue >= 30 && experience === 'advanced') {
                tier = '5k_advanced';
                effectiveLevel = 'advanced';
            } else if (mileageValue >= 20 && (experience === 'advanced' || experience === 'intermediate')) {
                tier = '5k_intermediate';
                effectiveLevel = 'intermediate';
                if (experience === 'advanced') {
                    warnings.push(`Your current mileage (${mileageLabel}) is best suited for Intermediate tier.`);
                }
            } else {
                tier = '5k_novice';
                effectiveLevel = 'novice';
                if (experience !== 'beginner' && mileageValue < 20) {
                    warnings.push(`Your current mileage (${mileageLabel}) is best suited for Novice tier.`);
                }
            }
            break;

        case '10k':
            // 10K thresholds: advanced needs 35+ mpw, intermediate needs 25+ mpw
            if (mileageValue >= 35 && experience === 'advanced') {
                tier = '10k_advanced';
                effectiveLevel = 'advanced';
            } else if (mileageValue >= 25 && (experience === 'advanced' || experience === 'intermediate')) {
                tier = '10k_intermediate';
                effectiveLevel = 'intermediate';
                if (experience === 'advanced') {
                    warnings.push(`Your current mileage (${mileageLabel}) is best suited for Intermediate tier.`);
                }
            } else {
                tier = '10k_novice';
                effectiveLevel = 'novice';
                if (experience !== 'beginner' && mileageValue < 25) {
                    warnings.push(`Your current mileage (${mileageLabel}) is best suited for Novice tier.`);
                }
            }
            break;

        case 'half':
            // Half thresholds: advanced needs 40+ mpw, intermediate needs 25+ mpw
            if (mileageValue >= 40 && experience === 'advanced') {
                tier = 'half_advanced';
                effectiveLevel = 'advanced';
            } else if (mileageValue >= 25 && (experience === 'advanced' || experience === 'intermediate')) {
                tier = 'half_intermediate_1';
                effectiveLevel = 'intermediate';
                if (experience === 'advanced') {
                    warnings.push(`Your current mileage (${mileageLabel}) is best suited for Intermediate tier.`);
                }
            } else {
                tier = 'half_novice_1';
                effectiveLevel = 'novice';
                if (experience !== 'beginner' && mileageValue < 25) {
                    warnings.push(`Your current mileage (${mileageLabel}) is best suited for Novice tier.`);
                }
            }
            break;

        case 'marathon':
            // Marathon thresholds: advanced needs 45+ mpw, intermediate needs 30+ mpw
            if (mileageValue >= 45 && experience === 'advanced') {
                tier = 'marathon_advanced_1';
                effectiveLevel = 'advanced';
            } else if (mileageValue >= 30 && (experience === 'advanced' || experience === 'intermediate')) {
                tier = 'marathon_intermediate_1';
                effectiveLevel = 'intermediate';
                if (experience === 'advanced') {
                    warnings.push(`Your current mileage (${mileageLabel}) is best suited for Intermediate tier.`);
                }
            } else {
                tier = 'marathon_novice_1';
                effectiveLevel = 'novice';
                if (experience !== 'beginner' && mileageValue < 30) {
                    warnings.push(`Your current mileage (${mileageLabel}) is best suited for Novice tier.`);
                }
            }
            break;

        case 'base':
            // Base training thresholds: advanced needs 30+ mpw, intermediate needs 20+ mpw
            if (mileageValue >= 30 && experience === 'advanced') {
                tier = 'base_advanced';
                effectiveLevel = 'advanced';
            } else if (mileageValue >= 20 && (experience === 'advanced' || experience === 'intermediate')) {
                tier = 'base_intermediate';
                effectiveLevel = 'intermediate';
                if (experience === 'advanced') {
                    warnings.push(`Your current mileage (${mileageLabel}) is best suited for Intermediate tier.`);
                }
            } else {
                tier = 'base_novice';
                effectiveLevel = 'novice';
                if (experience !== 'beginner' && mileageValue < 20) {
                    warnings.push(`Your current mileage (${mileageLabel}) is best suited for Novice tier.`);
                }
            }
            break;

        default:
            tier = 'marathon_novice_1';
            effectiveLevel = 'novice';
            warnings.push(`Unknown distance ${distance}, defaulting to marathon novice 1`);
    }

    return {
        tier,
        philosophy: 'higdon',
        displayName: `Hal Higdon ${distance.toUpperCase()} ${effectiveLevel.charAt(0).toUpperCase() + effectiveLevel.slice(1)}`,
        warnings,
    };
}

// =============================================================================
// HANSONS TIER SELECTION
// =============================================================================

function selectHansonsTier(input: TierSelectionInput): TierSelectionResult {
    const mileageValue = getMileageValue(input.currentMileage);
    const warnings: string[] = [];
    let tier: string;
    let displayName: string;

    // Hansons supports half marathon and marathon
    if (input.distance === 'half') {
        // Half marathon tiers: beginner (< 25 mpw) or advanced (>= 25 mpw)
        tier = mileageValue < 25 ? 'hansons_half_beginner' : 'hansons_half_advanced';
        displayName = `Hansons Half Marathon ${mileageValue < 25 ? 'Beginner' : 'Advanced'}`;

        if (mileageValue < 15) {
            warnings.push('Hansons Half Beginner assumes ~15-20 mpw base. Build up first.');
        }
    } else if (input.distance === 'marathon') {
        // Marathon tiers: beginner (< 30 mpw) or advanced (>= 30 mpw)
        tier = mileageValue < 30 ? 'hansons_beginner' : 'hansons_advanced';
        displayName = `Hansons Marathon ${mileageValue < 30 ? 'Beginner' : 'Advanced'}`;

        if (mileageValue < 20) {
            warnings.push('Hansons Marathon Beginner assumes ~20 mpw base. Build up first.');
        }
    } else {
        // Hansons only supports half and marathon
        tier = 'hansons_beginner';
        displayName = 'Hansons Marathon Beginner';
        warnings.push(`Hansons only supports Half Marathon and Marathon. You selected ${input.distance}. Defaulting to Marathon Beginner.`);
    }

    // Hansons requires 6 days per week - this is core to the method
    if (input.daysPerWeek < 6) {
        warnings.push(`Hansons requires 6 days/week (cumulative fatigue philosophy). You have ${input.daysPerWeek} days available.`);
    }

    return {
        tier,
        philosophy: 'hansons',
        displayName,
        warnings,
    };
}

// =============================================================================
// PFITZINGER FRR TIER SELECTION (5K/10K/Half)
// =============================================================================

function selectPfitzFRRTier(input: TierSelectionInput): TierSelectionResult {
    const { distance } = input;
    const mileageValue = getMileageValue(input.currentMileage);
    const warnings: string[] = [];
    let tier: string;

    if (distance === '5k') {
        if (mileageValue >= 55) {
            tier = 'pfitz_frr_5k_sch3';
        } else if (mileageValue >= 40) {
            tier = 'pfitz_frr_5k_sch2';
        } else {
            tier = 'pfitz_frr_5k_sch1';
            if (mileageValue < 25) {
                warnings.push('FRR 5K Schedule 1 starts at 30 mpw. Build base first.');
            }
        }
    } else if (distance === '10k') {
        if (mileageValue >= 55) {
            tier = 'pfitz_frr_10k_sch3';
        } else if (mileageValue >= 40) {
            tier = 'pfitz_frr_10k_sch2';
        } else {
            tier = 'pfitz_frr_10k_sch1';
            if (mileageValue < 25) {
                warnings.push('FRR 10K Schedule 1 starts at 30 mpw. Build base first.');
            }
        }
    } else if (distance === 'half') {
        if (mileageValue >= 75) {
            tier = 'pfitz_frr_hm_sch4';
        } else if (mileageValue >= 55) {
            tier = 'pfitz_frr_hm_sch3';
        } else if (mileageValue >= 40) {
            tier = 'pfitz_frr_hm_sch2';
        } else {
            tier = 'pfitz_frr_hm_sch1';
            if (mileageValue < 25) {
                warnings.push('FRR Half Schedule 1 starts at 31 mpw. Build base first.');
            }
        }
    } else {
        // Fallback for unexpected distance
        tier = 'pfitz_frr_5k_sch1';
        warnings.push(`FRR only supports 5K/10K/Half. Got ${distance}.`);
    }

    return {
        tier,
        philosophy: 'pfitzinger',
        displayName: `Pfitzinger FRR ${distance.toUpperCase()}`,
        warnings,
    };
}

// =============================================================================
// PFITZINGER AM TIER SELECTION (Marathon)
// =============================================================================

function selectPfitzAMTier(input: TierSelectionInput): TierSelectionResult {
    const mileageValue = getMileageValue(input.currentMileage);
    const weeksAvailable = input.weeksAvailable ?? 18;
    const warnings: string[] = [];
    let tier: string;

    // Check if user has enough base for Pfitz AM
    if (mileageValue < 35) {
        warnings.push('Pfitzinger AM requires 40+ mpw base. Consider FRR Half or Higdon instead.');
    }

    // Tier selection based on mileage + weeks available
    if (weeksAvailable < 16) {
        // 12-week plan
        tier = 'pfitz_12_55';
        if (mileageValue < 40) {
            warnings.push('12/55 assumes 40+ mpw base. Peak is 55 mpw.');
        }
    } else if (mileageValue >= 60) {
        tier = 'pfitz_18_85';
    } else if (mileageValue >= 50) {
        tier = 'pfitz_18_70';
    } else {
        tier = 'pfitz_18_55';
    }

    return {
        tier,
        philosophy: 'pfitzinger',
        displayName: `Pfitzinger Advanced Marathoning ${tier.replace('pfitz_', '').replace('_', '/')}`,
        warnings,
    };
}

// =============================================================================
// DANIELS TIER SELECTION
// =============================================================================

function selectDanielsTier(input: TierSelectionInput): TierSelectionResult {
    const { distance } = input;
    const mileageValue = getMileageValue(input.currentMileage);
    const warnings: string[] = [];
    let tier: string;

    if (distance === '5k') {
        tier = 'daniels_5k_24wk';
    } else if (distance === '10k') {
        tier = 'daniels_10k_24wk';
    } else if (distance === 'marathon') {
        // Select 2Q tier based on mileage
        if (mileageValue >= 70) {
            tier = 'daniels_2q_marathon_85';
        } else if (mileageValue >= 55) {
            tier = 'daniels_2q_marathon_70';
        } else if (mileageValue >= 40) {
            tier = 'daniels_2q_marathon_55';
        } else {
            tier = 'daniels_2q_marathon_40';
            if (mileageValue < 30) {
                warnings.push('Daniels 2Q 40 mpw plan assumes 35+ base. Build up first.');
            }
        }
    } else {
        // Daniels doesn't support half or ultra
        tier = 'daniels_5k_24wk';
        warnings.push(`Daniels only supports 5K/10K/Marathon. Got ${distance}.`);
    }

    return {
        tier,
        philosophy: 'daniels',
        displayName: `Daniels Running Formula ${distance === 'marathon' ? '2Q Marathon' : distance.toUpperCase()}`,
        warnings,
    };
}

// =============================================================================
// MAIN SELECTOR
// =============================================================================

/**
 * Select the appropriate plan tier based on philosophy and user profile.
 * This is the single source of truth for tier selection.
 */
export function selectPlanTier(input: TierSelectionInput): TierSelectionResult {
    const { philosophy, distance } = input;

    switch (philosophy) {
        case 'higdon':
            return selectHigdonTier(input);

        case 'hansons':
            return selectHansonsTier(input);

        case 'pfitzinger':
            // Route to FRR for shorter distances, AM for marathon
            if (distance === '5k' || distance === '10k' || distance === 'half') {
                return selectPfitzFRRTier(input);
            }
            return selectPfitzAMTier(input);

        case 'daniels':
            return selectDanielsTier(input);

        default:
            // Fallback to Higdon
            return selectHigdonTier(input);
    }
}

/**
 * Get a simple tier ID (for when you just need the string)
 */
export function selectTierId(input: TierSelectionInput): string {
    return selectPlanTier(input).tier;
}
