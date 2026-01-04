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
    // BASE BUILDING SHORT-CIRCUIT
    // If no race target, always recommend Higdon Base Training
    // ==========================================================================
    if (answers.targetDistance === 'base') {
        // Determine tier based on experience and mileage
        let tierLabel = 'Novice';
        if (answers.experience === 'advanced' && answers.currentMileage === 'over_40') {
            tierLabel = 'Advanced';
        } else if (answers.experience === 'intermediate' || answers.currentMileage === '20_40') {
            tierLabel = 'Intermediate';
        }

        reasoning.push('Building general fitness without a race target — Higdon Base Training is the perfect foundation.');
        reasoning.push(`Based on your experience and current mileage, we recommend the ${tierLabel} Base Training program.`);
        reasoning.push('This 12-week program builds your aerobic engine so you are ready for any race-specific plan afterward.');

        return {
            primary: 'higdon',
            scores: { hansons: 0, higdon: 10, pfitzinger: 0 },
            reasoning,
            warnings: [],
        };
    }

    // ==========================================================================
    // HARD GATES: Coach Prerequisites (Research-Grounded)
    // These determine which coaches are AVAILABLE, not which is best
    // ==========================================================================

    // Gate 1: Days per week — Hansons & Pfitz require 6 RUN days
    const hansonsDaysOk = answers.daysPerWeek === null || answers.daysPerWeek >= 6;
    const pfitzDaysOk = answers.daysPerWeek === null || answers.daysPerWeek >= 5;

    // Gate 2: Base mileage — Pfitz requires 30-40mi, Hansons 25-30mi
    const pfitzMileageOk = answers.currentMileage !== 'under_20';
    const hansonsMileageOk = answers.currentMileage !== 'under_20' || answers.currentMileage === null;

    // Gate 3: Experience — Pfitz is not for beginners
    const pfitzExperienceOk = answers.experience !== 'beginner';

    // Combine gates
    const hansonsAvailable = hansonsDaysOk && hansonsMileageOk;
    const pfitzAvailable = pfitzDaysOk && pfitzMileageOk && pfitzExperienceOk;
    // Higdon is always available

    // Add gate-based reasoning
    const distanceLabel = getDistanceLabel(answers.targetDistance);

    if (!hansonsAvailable && answers.daysPerWeek !== null && answers.daysPerWeek < 6) {
        reasoning.push(`Hansons requires 6 run days (cumulative fatigue approach). Your ${answers.daysPerWeek} days don't fit this structure.`);
    }
    if (!pfitzAvailable && answers.experience === 'beginner') {
        reasoning.push(`Pfitzinger is designed for experienced runners with structured training background.`);
    }
    if (!pfitzAvailable && answers.currentMileage === 'under_20') {
        reasoning.push(`Pfitzinger requires a 30-40 mile weekly base to start.`);
    }

    // ==========================================================================
    // SOFT SCORING: Among available coaches, which fits best?
    // ==========================================================================

    // Start with base scores (0 if not available)
    if (!hansonsAvailable) scores.hansons = -100;
    if (!pfitzAvailable) scores.pfitzinger = -100;

    // Distance modifiers
    if (answers.targetDistance !== null) {
        if (answers.targetDistance === '5k' || answers.targetDistance === '10k') {
            scores.higdon += 1;
            if (pfitzAvailable && answers.experience === 'advanced') {
                scores.pfitzinger += 1; // Speed focus for advanced short-distance
            }
        } else if (answers.targetDistance === 'ultra') {
            scores.higdon += 2; // Gradual volume build critical for ultra
            reasoning.push(`For ultra training, gradual volume build is key.`);
        }
    }

    // Days modifiers (only positive scoring now, gates handled above)
    if (answers.daysPerWeek !== null) {
        if (answers.daysPerWeek <= 4) {
            scores.higdon += 3;
            reasoning.push(`Your ${answers.daysPerWeek} run days/week fit Higdon's accessible structure perfectly.`);
        } else if (answers.daysPerWeek === 5) {
            scores.higdon += 2;
            if (pfitzAvailable) scores.pfitzinger += 1;
            reasoning.push('5 run days/week works well with Higdon Intermediate or adapted Pfitzinger.');
        } else { // 6 days
            if (hansonsAvailable) scores.hansons += 3;
            if (pfitzAvailable) scores.pfitzinger += 2;
            scores.higdon += 1;
            reasoning.push(`6 run days/week unlocks Hansons' cumulative fatigue approach.`);
        }
    }

    // Experience modifiers
    if (answers.experience !== null) {
        if (answers.experience === 'beginner') {
            scores.higdon += 4;
            reasoning.push(`First ${distanceLabel} — Higdon's gradual, accessible approach is the safest path.`);
            if (answers.daysPerWeek === 6) {
                warnings.push('6 run days is ambitious for beginners. We\'ll keep intensity low and build gradually.');
            }
        } else if (answers.experience === 'intermediate') {
            if (hansonsAvailable) scores.hansons += 2;
            scores.higdon += 1;
            if (pfitzAvailable) scores.pfitzinger += 1;
        } else { // advanced
            if (hansonsAvailable) scores.hansons += 2;
            if (pfitzAvailable) scores.pfitzinger += 3;
            reasoning.push('Chasing a PR — Hansons and Pfitzinger are designed for competitive gains.');
        }
    }

    // Mileage modifiers
    if (answers.currentMileage !== null) {
        if (answers.currentMileage === 'under_20') {
            scores.higdon += 3;
            reasoning.push('Your current mileage (~<20/week) means gradual build-up is essential.');
            if (answers.daysPerWeek === 6) {
                warnings.push('With under 20 miles/week, consider Higdon Base Training to build your foundation first.');
            }
        } else if (answers.currentMileage === '20_40') {
            if (hansonsAvailable) scores.hansons += 3;
            scores.higdon += 1;
            reasoning.push(`Your 20-40 mile base is solid ground for Hansons' approach.`);
        } else { // over_40
            if (pfitzAvailable) scores.pfitzinger += 4;
            if (hansonsAvailable) scores.hansons += 2;
            reasoning.push(`Your 40+ mile base opens up Pfitzinger's high-volume approach.`);
        }
    }

    // Mindset modifiers (tiebreakers)
    if (answers.mindset !== null) {
        if (answers.mindset === 'rest_focus') {
            scores.higdon += 2;
            reasoning.push('You value built-in rest — Higdon schedules recovery days, not optional ones.');
        } else if (answers.mindset === 'consistency') {
            if (hansonsAvailable) scores.hansons += 3;
            reasoning.push(`You thrive on consistency — Hansons' 6-day rhythm fits your style.`);
        } else { // push_limits
            if (pfitzAvailable) scores.pfitzinger += 3;
            if (hansonsAvailable) scores.hansons += 1;
            reasoning.push(`You want to push limits — high mileage programs demand exactly that.`);
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
    } else if (topScore - secondScore >= 1 && secondScore > 0) {
        // Close call between available options
        reasoning.push(`${getPhilosophyName(primary)} edges out ${getPhilosophyName(sorted[1][0])} based on your profile.`);
    } else if (secondScore <= 0) {
        // Only one option available
        reasoning.push(`Based on your profile, ${getPhilosophyName(primary)} is the right fit.`);
    } else {
        // Tie or very close
        reasoning.push('Your profile fits multiple approaches. We recommend ' + getPhilosophyName(primary) + ', but alternatives work too.');
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
        'base': 'general fitness',
    };
    return labels[distance];
}
