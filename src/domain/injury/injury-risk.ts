/**
 * Injury Risk Assessment Module
 * 
 * Calculates injury risk score based on onboarding profile data.
 * Based on research: prior injury, training load spikes, 
 * consistency, and durability work are key predictors.
 */

import { OnboardingProfile } from '../types/athlete';

export interface InjuryRiskAssessment {
    score: 1 | 2 | 3 | 4 | 5;  // 1 = low, 5 = high
    level: 'low' | 'moderate' | 'high' | 'very_high';
    factors: string[];
    recommendations: string[];
    requiresCalibration: boolean;
}

/**
 * Calculate injury risk from onboarding profile
 */
export function calculateInjuryRisk(profile: Partial<OnboardingProfile>): InjuryRiskAssessment {
    let score = 1;
    const factors: string[] = [];
    const recommendations: string[] = [];

    // =========================================================================
    // FACTOR 1: Prior injury (highest weight - 2 points)
    // Research shows prior injury is #1 predictor of future injury
    // =========================================================================
    if (profile.injuryLast12Months) {
        score += 2;
        factors.push('Recent injury in last 12 months');
        recommendations.push('Start with conservative volume - 80% of typical');
        recommendations.push('Include injury-specific prehab exercises');
    }

    if (profile.currentPainAffectsGait) {
        score += 2;
        factors.push('Current pain affecting movement');
        recommendations.push('Resolve pain before starting structured training');
        recommendations.push('Consider PT evaluation');
    }

    // =========================================================================
    // FACTOR 2: Volume gap (1 point)
    // Big jumps in weekly mileage = high injury risk
    // =========================================================================
    const weeklyMiles = profile.weeklyMiles ?? 0;
    const goalDistance = profile.goalDistance ?? '';

    if (goalDistance === 'marathon' && weeklyMiles < 20) {
        score += 1;
        factors.push('Low base for marathon goal');
        recommendations.push('Build base to 25+ mpw before marathon-specific work');
    } else if (goalDistance === 'half' && weeklyMiles < 12) {
        score += 1;
        factors.push('Low base for half marathon goal');
        recommendations.push('Build base to 15+ mpw first');
    }

    // =========================================================================
    // FACTOR 3: Training consistency (1 point)
    // Sporadic training = higher injury risk when ramping
    // =========================================================================
    const runsPerWeek = profile.runsPerWeek ?? 0;

    if (runsPerWeek < 3) {
        score += 1;
        factors.push('Low training frequency');
        recommendations.push('Build to 4+ runs/week before adding intensity');
    }

    // =========================================================================
    // FACTOR 4: No durability work (1 point)
    // Strength training is protective
    // =========================================================================
    if (profile.strengthTraining === 'none') {
        score += 1;
        factors.push('No current strength training');
        recommendations.push('Add 2x weekly durability/strength sessions');
    }

    // =========================================================================
    // FACTOR 5: Age without strength (0.5 point, combined with above)
    // Older athletes without strength work = higher risk
    // =========================================================================
    // This would need age from the full profile

    // Cap score at 5
    const clampedScore = Math.min(5, Math.max(1, score));
    const finalScore: InjuryRiskAssessment['score'] =
        clampedScore <= 1 ? 1 :
            clampedScore === 2 ? 2 :
                clampedScore === 3 ? 3 :
                    clampedScore === 4 ? 4 : 5;

    // Determine level
    let level: InjuryRiskAssessment['level'] = 'low';
    if (finalScore >= 4) level = 'very_high';
    else if (finalScore >= 3) level = 'high';
    else if (finalScore >= 2) level = 'moderate';

    // Determine if calibration week is required
    const requiresCalibration = finalScore >= 3 || weeklyMiles < 10;

    // Add calibration week recommendation if needed
    if (requiresCalibration && !recommendations.includes('Use calibration week')) {
        recommendations.push('Week 1 will be calibration - focus on feel, not pace');
    }

    return {
        score: finalScore,
        level,
        factors,
        recommendations,
        requiresCalibration
    };
}

/**
 * Get a summary message for the injury risk level
 */
export function getInjuryRiskSummary(assessment: InjuryRiskAssessment): string {
    switch (assessment.level) {
        case 'low':
            return 'Your injury risk profile looks good. We\'ll still start conservatively.';
        case 'moderate':
            return 'We\'ve identified some risk factors. Your plan will include extra recovery.';
        case 'high':
            return 'Your profile shows elevated injury risk. We\'ll prioritize durability and gradual progression.';
        case 'very_high':
            return 'Important: Your injury history requires careful attention. We recommend a medical clearance and will build very gradually.';
    }
}
