/**
 * Daniels Running Formula - Unit Tests
 *
 * 1:1 validation against research/26-daniels-running-formula.md
 */

import { describe, it, expect } from 'vitest';
import {
    DANIELS_TIER_CONFIGS,
    getDanielsTiers,
    getDanielsTierConfig,
    getDanielsTierDisplayName,
    getDanielsPhase,
    getDanielsWeeklyMileage,
    getDaniels2QWorkout,
    getDanielsQ1,
    getDanielsQ2,
    parseDanielsNotation,
    validateDanielsPlan,
    recommendDanielsTier,
    toTrainingPhase,
} from '../daniels';
import { DanielsTier } from '../../types';

// =============================================================================
// TIER CONFIG TESTS
// =============================================================================

describe('Daniels Tier Configs', () => {
    it('has exactly 6 tiers', () => {
        const tiers = getDanielsTiers();
        expect(tiers).toHaveLength(6);
    });

    it('2Q marathon tiers are 18 weeks', () => {
        const marathonTiers = getDanielsTiers().filter(t => t.includes('marathon'));
        marathonTiers.forEach(tier => {
            const config = getDanielsTierConfig(tier);
            expect(config.durationWeeks).toBe(18);
        });
    });

    it('5K/10K tiers are 24 weeks', () => {
        const shortTiers = getDanielsTiers().filter(t => t.includes('5k') || t.includes('10k'));
        shortTiers.forEach(tier => {
            const config = getDanielsTierConfig(tier);
            expect(config.durationWeeks).toBe(24);
        });
    });

    describe.each([
        ['daniels_5k_24wk', '5k', 24, '4phase', 50],
        ['daniels_10k_24wk', '10k', 24, '4phase', 55],
        ['daniels_2q_marathon_40', 'marathon', 18, '2q', 40],
        ['daniels_2q_marathon_55', 'marathon', 18, '2q', 55],
        ['daniels_2q_marathon_70', 'marathon', 18, '2q', 70],
        ['daniels_2q_marathon_85', 'marathon', 18, '2q', 85],
    ] as [DanielsTier, string, number, string, number][])('%s config', (tier, distance, weeks, structure, peakMpw) => {
        it(`has distance ${distance}`, () => {
            expect(DANIELS_TIER_CONFIGS[tier].distance).toBe(distance);
        });

        it(`has ${weeks} week duration`, () => {
            expect(DANIELS_TIER_CONFIGS[tier].durationWeeks).toBe(weeks);
        });

        it(`uses ${structure} structure`, () => {
            expect(DANIELS_TIER_CONFIGS[tier].structure).toBe(structure);
        });

        it(`peaks at ${peakMpw} mpw`, () => {
            expect(DANIELS_TIER_CONFIGS[tier].peakMileage).toBe(peakMpw);
        });
    });
});

// =============================================================================
// 1:1 VALIDATION: 2Q Marathon 55 mpw
// =============================================================================

describe('Daniels 2Q Marathon 55 - 1:1 Validation', () => {
    const TIER: DanielsTier = 'daniels_2q_marathon_55';

    // From research/26-daniels-running-formula.md
    const OFFICIAL_WEEK_1 = {
        q1: '14mi: 4E + 8M + 1T + 1E',
        q2: '15mi: 8E + 2×2T (2\') + 1T + 2E',
        mileagePercent: 80,
    };

    it('week 1 Q1 matches exactly', () => {
        const workout = getDaniels2QWorkout(TIER, 1);
        expect(workout).not.toBeNull();
        expect(workout!.q1.description).toContain('4E + 8M + 1T');
        expect(workout!.q1.totalMiles).toBe(14);
    });

    it('week 1 Q2 matches exactly', () => {
        const workout = getDaniels2QWorkout(TIER, 1);
        expect(workout).not.toBeNull();
        expect(workout!.q2.totalMiles).toBe(15);
    });

    it('week 1 mileage percent is 80%', () => {
        const workout = getDaniels2QWorkout(TIER, 1);
        expect(workout).not.toBeNull();
        expect(workout!.mileagePercent).toBe(80);
    });

    it('week 5 is 100% mileage (peak phase)', () => {
        const workout = getDaniels2QWorkout(TIER, 5);
        expect(workout).not.toBeNull();
        expect(workout!.mileagePercent).toBe(100);
    });

    it('week 18 is taper (50% mileage)', () => {
        const workout = getDaniels2QWorkout(TIER, 18);
        expect(workout).not.toBeNull();
        expect(workout!.mileagePercent).toBe(50);
    });

    it('all 18 weeks have data', () => {
        for (let week = 1; week <= 18; week++) {
            const workout = getDaniels2QWorkout(TIER, week);
            expect(workout, `Week ${week} should have data`).not.toBeNull();
        }
    });
});

// =============================================================================
// WORKOUT SEGMENT VALIDATION
// =============================================================================

describe('Daniels 2Q Workout Segments', () => {
    const TIER: DanielsTier = 'daniels_2q_marathon_55';

    it('week 1 Q1 has correct intensity breakdown', () => {
        const q1 = getDanielsQ1(TIER, 1);
        expect(q1).not.toBeNull();

        // Should have E, M, T, E segments
        const intensities = q1!.segments.map(s => s.intensity);
        expect(intensities).toContain('E');
        expect(intensities).toContain('M');
        expect(intensities).toContain('T');
    });

    it('quality miles calculated correctly', () => {
        const q1 = getDanielsQ1(TIER, 1);
        expect(q1).not.toBeNull();
        // 8M + 1T = 9 quality miles
        expect(q1!.qualityMiles).toBe(9);
    });

    it('week 9 has 13M segment for marathon specificity', () => {
        const q1 = getDanielsQ1(TIER, 9);
        expect(q1).not.toBeNull();
        expect(q1!.qualityMiles).toBe(13);
    });
});

// =============================================================================
// MILEAGE SCALING
// =============================================================================

describe('Daniels 2Q Mileage Scaling', () => {
    it('40 mpw tier scales down from 55 baseline', () => {
        const workout55 = getDaniels2QWorkout('daniels_2q_marathon_55', 5);
        const workout40 = getDaniels2QWorkout('daniels_2q_marathon_40', 5);

        expect(workout55).not.toBeNull();
        expect(workout40).not.toBeNull();

        // 40/55 = 0.727 scaling
        expect(workout40!.q1.totalMiles).toBeLessThan(workout55!.q1.totalMiles);
    });

    it('85 mpw tier scales up from 55 baseline', () => {
        const workout55 = getDaniels2QWorkout('daniels_2q_marathon_55', 5);
        const workout85 = getDaniels2QWorkout('daniels_2q_marathon_85', 5);

        expect(workout55).not.toBeNull();
        expect(workout85).not.toBeNull();

        // 85/55 = 1.545 scaling
        expect(workout85!.q1.totalMiles).toBeGreaterThan(workout55!.q1.totalMiles);
    });
});

// =============================================================================
// PHASE DETECTION
// =============================================================================

describe('Daniels Phase Detection', () => {
    describe('2Q Marathon phases', () => {
        const TIER: DanielsTier = 'daniels_2q_marathon_55';

        it('weeks 1-6 are base phase', () => {
            expect(getDanielsPhase(TIER, 1)).toBe('base');
            expect(getDanielsPhase(TIER, 6)).toBe('base');
        });

        it('weeks 7-12 are build (repetition) phase', () => {
            expect(getDanielsPhase(TIER, 7)).toBe('repetition');
            expect(getDanielsPhase(TIER, 12)).toBe('repetition');
        });

        it('weeks 13-16 are peak (interval) phase', () => {
            expect(getDanielsPhase(TIER, 13)).toBe('interval');
            expect(getDanielsPhase(TIER, 16)).toBe('interval');
        });

        it('weeks 17-18 are taper (competition) phase', () => {
            expect(getDanielsPhase(TIER, 17)).toBe('competition');
            expect(getDanielsPhase(TIER, 18)).toBe('competition');
        });
    });

    describe('4-phase 5K phases', () => {
        const TIER: DanielsTier = 'daniels_5k_24wk';

        it('weeks 1-6 are base', () => {
            expect(getDanielsPhase(TIER, 1)).toBe('base');
            expect(getDanielsPhase(TIER, 6)).toBe('base');
        });

        it('weeks 7-12 are repetition', () => {
            expect(getDanielsPhase(TIER, 7)).toBe('repetition');
            expect(getDanielsPhase(TIER, 12)).toBe('repetition');
        });

        it('weeks 13-18 are interval', () => {
            expect(getDanielsPhase(TIER, 13)).toBe('interval');
            expect(getDanielsPhase(TIER, 18)).toBe('interval');
        });

        it('weeks 19-24 are competition', () => {
            expect(getDanielsPhase(TIER, 19)).toBe('competition');
            expect(getDanielsPhase(TIER, 24)).toBe('competition');
        });
    });
});

// =============================================================================
// PHASE TO TRAINING PHASE MAPPING
// =============================================================================

describe('Daniels Phase to TrainingPhase Mapping', () => {
    it('base maps to base', () => {
        expect(toTrainingPhase('base')).toBe('base');
    });

    it('repetition maps to build', () => {
        expect(toTrainingPhase('repetition')).toBe('build');
    });

    it('interval maps to peak', () => {
        expect(toTrainingPhase('interval')).toBe('peak');
    });

    it('competition maps to taper', () => {
        expect(toTrainingPhase('competition')).toBe('taper');
    });
});

// =============================================================================
// NOTATION PARSER
// =============================================================================

describe('Daniels Notation Parser', () => {
    it('parses simple segments like "2E"', () => {
        const segments = parseDanielsNotation('2E');
        expect(segments).toHaveLength(1);
        expect(segments[0].distance).toBe(2);
        expect(segments[0].intensity).toBe('E');
    });

    it('parses complex notation like "2E + 3T + 2E"', () => {
        const segments = parseDanielsNotation('2E + 3T + 2E');
        expect(segments).toHaveLength(3);
        expect(segments[0].intensity).toBe('E');
        expect(segments[1].intensity).toBe('T');
        expect(segments[2].intensity).toBe('E');
    });
});

// =============================================================================
// TIER RECOMMENDATION
// =============================================================================

describe('Daniels Tier Recommendation', () => {
    it('recommends 5K tier for 5K goal with 24 weeks', () => {
        const tier = recommendDanielsTier(40, '5k', 24);
        expect(tier).toBe('daniels_5k_24wk');
    });

    it('recommends 2Q 55 for marathon with 45mpw', () => {
        const tier = recommendDanielsTier(45, 'marathon', 18);
        expect(tier).toBe('daniels_2q_marathon_55');
    });

    it('recommends 2Q 85 for marathon with 75mpw', () => {
        const tier = recommendDanielsTier(75, 'marathon', 18);
        expect(tier).toBe('daniels_2q_marathon_85');
    });

    it('returns null for marathon with insufficient weeks', () => {
        const tier = recommendDanielsTier(50, 'marathon', 12);
        expect(tier).toBeNull();
    });
});

// =============================================================================
// VALIDATION
// =============================================================================

describe('Daniels Plan Validation', () => {
    it('2Q 55 mpw passes validation', () => {
        const result = validateDanielsPlan('daniels_2q_marathon_55');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('5K 24wk passes validation', () => {
        const result = validateDanielsPlan('daniels_5k_24wk');
        expect(result.valid).toBe(true);
    });

    it('all tiers pass validation', () => {
        getDanielsTiers().forEach(tier => {
            const result = validateDanielsPlan(tier);
            expect(result.valid, `${tier} should pass validation: ${result.errors.join(', ')}`).toBe(true);
        });
    });
});

// =============================================================================
// DISPLAY NAMES
// =============================================================================

describe('Daniels Display Names', () => {
    it('formats 2Q marathon names correctly', () => {
        expect(getDanielsTierDisplayName('daniels_2q_marathon_55')).toBe('Daniels 2Q Marathon (55 mpw)');
        expect(getDanielsTierDisplayName('daniels_2q_marathon_85')).toBe('Daniels 2Q Marathon (85 mpw)');
    });

    it('formats 5K/10K names correctly', () => {
        expect(getDanielsTierDisplayName('daniels_5k_24wk')).toBe('Daniels 5K (24-week)');
        expect(getDanielsTierDisplayName('daniels_10k_24wk')).toBe('Daniels 10K (24-week)');
    });
});
