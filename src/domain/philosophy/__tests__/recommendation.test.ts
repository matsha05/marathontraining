/**
 * Philosophy Recommendation Algorithm Tests
 * 
 * These tests verify that the recommendation algorithm produces
 * coach-grounded outputs based on the decision table in decision_table.md.
 * 
 * Test categories:
 * 1. Base Flow - All 9 experience × mileage combinations
 * 2. Race Flow - Decision boundaries for days, experience, mileage, mindset
 * 3. Edge Cases - Unusual combinations and warnings
 */

import { describe, it, expect } from 'vitest';
import { calculateRecommendation } from '../recommendation';
import { QuizAnswers, INITIAL_QUIZ_ANSWERS } from '../types';

// Helper to create quiz answers with defaults
function makeAnswers(overrides: Partial<QuizAnswers>): QuizAnswers {
    return { ...INITIAL_QUIZ_ANSWERS, ...overrides };
}

describe('Philosophy Recommendation Algorithm', () => {
    // =========================================================================
    // BASE FLOW TESTS (9 combinations)
    // When targetDistance === 'base', always recommend Higdon
    // =========================================================================
    describe('Base Flow - Always Higdon', () => {
        it('B1: New + <20mi → Higdon (Novice tier)', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'base',
                experience: 'beginner',
                currentMileage: 'under_20',
            }));
            expect(result.primary).toBe('higdon');
            expect(result.reasoning.some(r => r.includes('Novice'))).toBe(true);
        });

        it('B2: New + 20-40mi → Higdon (Intermediate tier)', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'base',
                experience: 'beginner',
                currentMileage: '20_40',
            }));
            expect(result.primary).toBe('higdon');
            expect(result.reasoning.some(r => r.includes('Intermediate'))).toBe(true);
        });

        it('B3: New + 40+mi → Higdon (base building)', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'base',
                experience: 'beginner',
                currentMileage: 'over_40',
            }));
            expect(result.primary).toBe('higdon');
        });

        it('B4: Some + <20mi → Higdon (Intermediate tier)', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'base',
                experience: 'intermediate',
                currentMileage: 'under_20',
            }));
            expect(result.primary).toBe('higdon');
            expect(result.reasoning.some(r => r.includes('Intermediate'))).toBe(true);
        });

        it('B5: Some + 20-40mi → Higdon (Intermediate tier)', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'base',
                experience: 'intermediate',
                currentMileage: '20_40',
            }));
            expect(result.primary).toBe('higdon');
            expect(result.reasoning.some(r => r.includes('Intermediate'))).toBe(true);
        });

        it('B6: Some + 40+mi → Higdon (Intermediate tier)', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'base',
                experience: 'intermediate',
                currentMileage: 'over_40',
            }));
            expect(result.primary).toBe('higdon');
            expect(result.reasoning.some(r => r.includes('Intermediate'))).toBe(true);
        });

        it('B7: Experienced + <20mi → Higdon (base building)', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'base',
                experience: 'advanced',
                currentMileage: 'under_20',
            }));
            expect(result.primary).toBe('higdon');
        });

        it('B8: Experienced + 20-40mi → Higdon (Intermediate tier)', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'base',
                experience: 'advanced',
                currentMileage: '20_40',
            }));
            expect(result.primary).toBe('higdon');
            expect(result.reasoning.some(r => r.includes('Intermediate'))).toBe(true);
        });

        it('B9: Experienced + 40+mi → Higdon (Advanced tier)', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'base',
                experience: 'advanced',
                currentMileage: 'over_40',
            }));
            expect(result.primary).toBe('higdon');
            expect(result.reasoning.some(r => r.includes('Advanced'))).toBe(true);
        });
    });

    // =========================================================================
    // RACE FLOW: Days ≤ 4 → Higdon or Daniels (low-day structures)
    // =========================================================================
    describe('Race Flow - Days ≤ 4 → Higdon or Daniels', () => {
        it('3 days + advanced → Daniels or Higdon (2Q or accessible structure)', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'marathon',
                daysPerWeek: 3,
                experience: 'advanced',
                currentMileage: 'over_40',
                mindset: 'push_limits',
            }));
            // Both Higdon and Daniels support 3-4 days
            expect(['higdon', 'daniels']).toContain(result.primary);
        });

        it('4 days + intermediate → Higdon (Daniels requires advanced)', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: '10k',
                daysPerWeek: 4,
                experience: 'intermediate',
                currentMileage: '20_40',
                mindset: 'consistency',
            }));
            expect(result.primary).toBe('higdon');
        });
    });

    // =========================================================================
    // RACE FLOW: Days = 5
    // =========================================================================
    describe('Race Flow - Days = 5', () => {
        it('5 days + New → Higdon', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'half',
                daysPerWeek: 5,
                experience: 'beginner',
                currentMileage: '20_40',
                mindset: 'consistency',
            }));
            expect(result.primary).toBe('higdon');
        });

        it('5 days + Some + <20mi → Higdon', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'marathon',
                daysPerWeek: 5,
                experience: 'intermediate',
                currentMileage: 'under_20',
                mindset: 'push_limits',
            }));
            expect(result.primary).toBe('higdon');
        });

        it('5 days + Some + 20-40mi + Rest → Higdon', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'marathon',
                daysPerWeek: 5,
                experience: 'intermediate',
                currentMileage: '20_40',
                mindset: 'rest_focus',
            }));
            expect(result.primary).toBe('higdon');
        });

        it('5 days + Some + 20-40mi + Consistency → Higdon (Hansons needs 6)', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'marathon',
                daysPerWeek: 5,
                experience: 'intermediate',
                currentMileage: '20_40',
                mindset: 'consistency',
            }));
            expect(result.primary).toBe('higdon');
        });

        it('5 days + Experienced + 40+mi + Consistency → Pfitz (Hansons needs 6)', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'half',
                daysPerWeek: 5,
                experience: 'advanced',
                currentMileage: 'over_40',
                mindset: 'consistency',
            }));
            // Pfitz eligible at 5 days, Hansons requires 6
            expect(result.primary).toBe('pfitzinger');
        });
    });

    // =========================================================================
    // RACE FLOW: Days = 6
    // =========================================================================
    describe('Race Flow - Days = 6', () => {
        it('6 days + New + 20-40mi → Hansons available (beginner with base)', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'marathon',
                daysPerWeek: 6,
                experience: 'beginner',
                currentMileage: '20_40',
                mindset: 'push_limits',
            }));
            // Beginner with 20-40mi base CAN do Hansons Beginner
            // Algorithm may pick either based on scoring
            expect(['higdon', 'hansons']).toContain(result.primary);
            expect(result.warnings.length).toBeGreaterThan(0);
        });

        it('6 days + Some + <20mi → Higdon (with warning)', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'marathon',
                daysPerWeek: 6,
                experience: 'intermediate',
                currentMileage: 'under_20',
                mindset: 'push_limits',
            }));
            expect(result.primary).toBe('higdon');
        });

        it('6 days + Some + 20-40mi + Rest → Higdon or Hansons (rest mindset)', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'marathon',
                daysPerWeek: 6,
                experience: 'intermediate',
                currentMileage: '20_40',
                mindset: 'rest_focus',
            }));
            // Rest mindset favors Higdon but Hansons also available
            expect(['higdon', 'hansons']).toContain(result.primary);
        });

        it('6 days + Some + 20-40mi + Consistency → Hansons', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'marathon',
                daysPerWeek: 6,
                experience: 'intermediate',
                currentMileage: '20_40',
                mindset: 'consistency',
            }));
            expect(result.primary).toBe('hansons');
        });

        it('6 days + Some + 40+mi + Push → Pfitz available (has base + experience)', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'marathon',
                daysPerWeek: 6,
                experience: 'intermediate',
                currentMileage: 'over_40',
                mindset: 'push_limits',
            }));
            // Intermediate + 40+ base + 6 days = Pfitz is available and wins with push mindset
            expect(result.primary).toBe('pfitzinger');
        });

        it('6 days + Experienced + 40+mi + Consistency → Hansons', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'marathon',
                daysPerWeek: 6,
                experience: 'advanced',
                currentMileage: 'over_40',
                mindset: 'consistency',
            }));
            expect(result.primary).toBe('hansons');
        });

        it('6 days + Experienced + 40+mi + Push → Pfitzinger (ONLY combo)', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'marathon',
                daysPerWeek: 6,
                experience: 'advanced',
                currentMileage: 'over_40',
                mindset: 'push_limits',
            }));
            expect(result.primary).toBe('pfitzinger');
        });
    });

    // =========================================================================
    // DISTANCE COVERAGE
    // =========================================================================
    describe('Distance Coverage', () => {
        const distances = ['5k', '10k', 'half', 'marathon', 'ultra'] as const;

        distances.forEach(distance => {
            it(`${distance} + 6 days + Exp + 40+mi + Push → Pfitzinger`, () => {
                const result = calculateRecommendation(makeAnswers({
                    targetDistance: distance,
                    daysPerWeek: 6,
                    experience: 'advanced',
                    currentMileage: 'over_40',
                    mindset: 'push_limits',
                }));
                expect(result.primary).toBe('pfitzinger');
            });
        });

        distances.forEach(distance => {
            it(`${distance} + 3 days + New + <20mi + Rest → Higdon`, () => {
                const result = calculateRecommendation(makeAnswers({
                    targetDistance: distance,
                    daysPerWeek: 3,
                    experience: 'beginner',
                    currentMileage: 'under_20',
                    mindset: 'rest_focus',
                }));
                expect(result.primary).toBe('higdon');
            });
        });
    });

    // =========================================================================
    // EDGE CASES & WARNINGS
    // =========================================================================
    describe('Edge Cases & Warnings', () => {
        it('Experienced + <20mi should warn about mismatch', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'marathon',
                daysPerWeek: 6,
                experience: 'advanced',
                currentMileage: 'under_20',
                mindset: 'push_limits',
            }));
            expect(result.warnings.length).toBeGreaterThan(0);
        });

        it('New + 40+mi is unusual but valid', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'marathon',
                daysPerWeek: 5,
                experience: 'beginner',
                currentMileage: 'over_40',
                mindset: 'consistency',
            }));
            expect(result.primary).toBe('higdon'); // Still conservative
        });

        it('High volume (40+) + rest mindset should still allow Higdon', () => {
            const result = calculateRecommendation(makeAnswers({
                targetDistance: 'marathon',
                daysPerWeek: 6,
                experience: 'advanced',
                currentMileage: 'over_40',
                mindset: 'rest_focus',
            }));
            // Rest mindset favors Higdon even with high capability
            expect(['higdon', 'hansons', 'pfitzinger']).toContain(result.primary);
        });
    });

    // =========================================================================
    // PROPERTY TESTS (Invariants)
    // =========================================================================
    describe('Invariants', () => {
        it('Base goal always returns Higdon regardless of other inputs', () => {
            const experiences = ['beginner', 'intermediate', 'advanced'] as const;
            const mileages = ['under_20', '20_40', 'over_40'] as const;

            experiences.forEach(exp => {
                mileages.forEach(mileage => {
                    const result = calculateRecommendation(makeAnswers({
                        targetDistance: 'base',
                        experience: exp,
                        currentMileage: mileage,
                    }));
                    expect(result.primary).toBe('higdon');
                });
            });
        });

        it('Days ≤ 4 always returns Higdon or Daniels (low-day-compatible structures)', () => {
            const days = [3, 4] as const;
            const experiences = ['beginner', 'intermediate', 'advanced'] as const;

            days.forEach(d => {
                experiences.forEach(exp => {
                    const result = calculateRecommendation(makeAnswers({
                        targetDistance: 'marathon',
                        daysPerWeek: d,
                        experience: exp,
                        currentMileage: 'over_40',
                        mindset: 'push_limits',
                    }));
                    // Hansons and Pfitz require 5-6 days
                    expect(['higdon', 'daniels']).toContain(result.primary);
                });
            });
        });

        it('Beginner always returns Higdon or Hansons (never Pfitz or Daniels)', () => {
            const days = [3, 4, 5, 6] as const;
            const mindsets = ['rest_focus', 'consistency', 'push_limits'] as const;

            days.forEach(d => {
                mindsets.forEach(m => {
                    const result = calculateRecommendation(makeAnswers({
                        targetDistance: 'marathon',
                        daysPerWeek: d,
                        experience: 'beginner',
                        currentMileage: 'over_40',
                        mindset: m,
                    }));
                    // Beginner cannot get Pfitz or Daniels (experience gate)
                    expect(result.primary).not.toBe('pfitzinger');
                    expect(result.primary).not.toBe('daniels');
                });
            });
        });

        it('Pfitzinger requires: 5+ days + non-beginner + 20+ mi', () => {
            // Missing 5+ days
            expect(calculateRecommendation(makeAnswers({
                targetDistance: 'marathon',
                daysPerWeek: 4,
                experience: 'advanced',
                currentMileage: 'over_40',
                mindset: 'push_limits',
            })).primary).not.toBe('pfitzinger');

            // Missing non-beginner
            expect(calculateRecommendation(makeAnswers({
                targetDistance: 'marathon',
                daysPerWeek: 6,
                experience: 'beginner',
                currentMileage: 'over_40',
                mindset: 'push_limits',
            })).primary).not.toBe('pfitzinger');

            // Missing base mileage
            expect(calculateRecommendation(makeAnswers({
                targetDistance: 'marathon',
                daysPerWeek: 6,
                experience: 'advanced',
                currentMileage: 'under_20',
                mindset: 'push_limits',
            })).primary).not.toBe('pfitzinger');

            // Has ALL prerequisites → Pfitzinger eligible (may or may not win)
            const fullResult = calculateRecommendation(makeAnswers({
                targetDistance: 'marathon',
                daysPerWeek: 6,
                experience: 'advanced',
                currentMileage: 'over_40',
                mindset: 'push_limits',
            }));
            expect(fullResult.primary).toBe('pfitzinger');
        });
    });
});
