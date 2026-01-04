/**
 * Philosophy Recommendation Algorithm
 * 
 * Pure logic for calculating training philosophy recommendation
 * based on quiz answers. No UI dependencies.
 * 
 * Supports all distances: 5K, 10K, Half Marathon, Marathon, Ultra
 */

import {
    TrainingPhilosophy,
    QuizAnswers,
    PhilosophyRecommendation,
    TargetDistance,
} from './types';

/**
 * Calculate philosophy recommendation from quiz answers.
 * Returns primary recommendation with scores, reasoning, and warnings.
 */
export function calculateRecommendation(answers: QuizAnswers): PhilosophyRecommendation {
    const scores: Record<TrainingPhilosophy, number> = {
        hansons: 0,
        higdon: 0,
        pfitzinger: 0,
    };
    const reasoning: string[] = [];
    const warnings: string[] = [];

    // ==========================================================================
    // TARGET DISTANCE (Context for subsequent scoring)
    // ==========================================================================
    const distanceLabel = getDistanceLabel(answers.targetDistance);

    if (answers.targetDistance !== null) {
        // Distance-specific baseline adjustments
        if (answers.targetDistance === '5k' || answers.targetDistance === '10k') {
            // Shorter distances: all three work, but lean toward accessible or speed-focused
            scores.higdon += 1; // Accessible for any beginner
            if (answers.experience === 'advanced') {
                scores.pfitzinger += 1; // Speed focus for advanced short-distance runners
            }
        } else if (answers.targetDistance === 'ultra') {
            // Ultra: time-on-feet focus
            scores.higdon += 1; // Gradual volume build
            reasoning.push(`For ultra training, gradual volume build is key.`);
        }
    }

    // ==========================================================================
    // DAYS PER WEEK (Strongest signal — structure compatibility)
    // ==========================================================================
    if (answers.daysPerWeek !== null) {
        if (answers.daysPerWeek <= 4) {
            scores.higdon += 4;
            reasoning.push(`Your schedule of ${answers.daysPerWeek} days/week fits Higdon's 4-5 day structure perfectly.`);
        } else if (answers.daysPerWeek === 5) {
            scores.higdon += 2;
            scores.hansons += 1;
            reasoning.push('5 days/week works well with Higdon Intermediate or a modified Hansons.');
        } else { // 6 days
            scores.hansons += 4;
            scores.pfitzinger += 3;
            reasoning.push(`6 days/week unlocks Hansons' cumulative fatigue approach.`);
        }
    }

    // ==========================================================================
    // EXPERIENCE (Automatic Higdon for beginners — safety gate)
    // ==========================================================================
    if (answers.experience !== null) {
        if (answers.experience === 'beginner') {
            scores.higdon += 5;
            reasoning.push(`First ${distanceLabel} — Higdon's gradual, accessible approach is the safest path to the finish line.`);

            // Warning if they said 6 days
            if (answers.daysPerWeek === 6) {
                warnings.push('While you have time for 6 days, beginners often benefit from Higdon\'s built-in rest days. Consider starting there.');
            }
        } else if (answers.experience === 'intermediate') {
            scores.hansons += 2;
            scores.higdon += 1;
            scores.pfitzinger += 1;
        } else { // advanced
            scores.hansons += 3;
            scores.pfitzinger += 3;
            reasoning.push('Chasing a PR — both Hansons and Pfitzinger are designed for competitive gains.');
        }
    }

    // ==========================================================================
    // CURRENT MILEAGE (Volume readiness — what can you absorb?)
    // ==========================================================================
    if (answers.currentMileage !== null) {
        if (answers.currentMileage === 'under_20') {
            scores.higdon += 3;
            reasoning.push('Your current mileage (~<20/week) means gradual build-up is essential.');

            // Warning if they're trying to do Hansons or Pfitz
            if (answers.daysPerWeek === 6) {
                warnings.push('6 days/week at under 20 miles is a big jump. Higdon\'s gradual progression may reduce injury risk.');
            }
        } else if (answers.currentMileage === '20_40') {
            scores.hansons += 3;
            scores.higdon += 1;
            reasoning.push(`Your 20-40 mile base is solid ground for Hansons' approach.`);
        } else { // over_40
            scores.pfitzinger += 4;
            scores.hansons += 2;
            reasoning.push(`Your 40+ mile base opens up Pfitzinger's high-volume approach.`);
        }
    }

    // ==========================================================================
    // MINDSET (Psychological fit — what keeps you consistent?)
    // ==========================================================================
    if (answers.mindset !== null) {
        if (answers.mindset === 'rest_focus') {
            scores.higdon += 2;
            reasoning.push('You value built-in rest — Higdon schedules recovery days, not optional ones.');
        } else if (answers.mindset === 'consistency') {
            scores.hansons += 3;
            reasoning.push(`You thrive on consistency — Hansons' 6-day rhythm is your groove.`);
        } else { // push_limits
            scores.pfitzinger += 3;
            scores.hansons += 1;
            reasoning.push(`You want to push limits — Pfitzinger's high mileage demands exactly that.`);
        }
    }

    // ==========================================================================
    // DETERMINE WINNER
    // ==========================================================================
    const entries = Object.entries(scores) as [TrainingPhilosophy, number][];
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    const primary = sorted[0][0];

    // Add final reasoning if there's a clear winner
    const topScore = sorted[0][1];
    const secondScore = sorted[1][1];

    if (topScore - secondScore >= 3) {
        // Clear winner — no additional reasoning needed
    } else if (topScore - secondScore >= 1) {
        // Close call
        reasoning.push(`${getPhilosophyName(primary)} edges out ${getPhilosophyName(sorted[1][0])} based on your profile.`);
    } else {
        // Tie or very close
        reasoning.push('Your profile fits multiple approaches. We recommend ' + getPhilosophyName(primary) + ', but the alternatives would also work.');
    }

    return {
        primary,
        scores,
        reasoning,
        warnings,
    };
}

/**
 * Check if a user-selected philosophy differs from recommendation
 * and return appropriate warning context.
 */
export function getOverrideWarnings(
    answers: QuizAnswers,
    selected: TrainingPhilosophy,
    recommended: TrainingPhilosophy
): string[] {
    if (selected === recommended) return [];

    const warnings: string[] = [];

    // Hansons with limited days
    if (selected === 'hansons') {
        if (answers.daysPerWeek !== null && answers.daysPerWeek < 6) {
            warnings.push(`Hansons is designed for 6 days/week. You said ${answers.daysPerWeek}. We'll adapt, but you may need to add days or accept modified structure.`);
        }
        if (answers.experience === 'beginner') {
            warnings.push('Beginners often benefit from more rest days. Hansons is doable but demanding.');
        }
    }

    // Pfitzinger with low base
    if (selected === 'pfitzinger') {
        if (answers.currentMileage === 'under_20') {
            warnings.push('Pfitzinger programs start at 55 miles/week. Your current base (<20) would need significant build-up first.');
        }
        if (answers.currentMileage === '20_40' && answers.experience === 'beginner') {
            warnings.push('Pfitzinger is designed for experienced runners with high mileage backgrounds. Consider building your base first.');
        }
    }

    // Higdon for competitive runners
    if (selected === 'higdon') {
        if (answers.experience === 'advanced' && answers.currentMileage === 'over_40') {
            warnings.push('Higdon\'s lower frequency may undertrain runners with your experience and base. Consider Hansons or Pfitzinger for PR potential.');
        }
    }

    return warnings;
}

function getPhilosophyName(p: TrainingPhilosophy): string {
    const names: Record<TrainingPhilosophy, string> = {
        hansons: 'Hansons',
        higdon: 'Hal Higdon',
        pfitzinger: 'Pfitzinger',
    };
    return names[p];
}

function getDistanceLabel(distance: TargetDistance | null): string {
    if (!distance) return 'race';
    const labels: Record<TargetDistance, string> = {
        '5k': '5K',
        '10k': '10K',
        'half': 'half marathon',
        'marathon': 'marathon',
        'ultra': 'ultra',
    };
    return labels[distance];
}
