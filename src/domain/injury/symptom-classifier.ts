/**
 * Injury Symptom Classifier
 * 
 * RED/AMBER/GREEN traffic light system for injury management
 * Based on CoachSpec section 10
 */

export type InjuryStatus = 'green' | 'amber' | 'red';

export interface SymptomInput {
    morningPain: number;          // 0-10
    morningStiffnessMinutes: number;
    postActivityPain: number;     // 0-10
    painTrend: 'better' | 'same' | 'worse';
    swelling: boolean;
    numbness: boolean;
    gaitChange: boolean;
    bonyTenderness: boolean;
    painSite?: string;
}

export interface ClassificationResult {
    status: InjuryStatus;
    recommendation: string;
    modifications: string[];
    shouldSeeDoctor: boolean;
    returnToRunProtocol?: string;
}

/**
 * Classify injury status based on symptoms
 */
export function classifySymptoms(symptoms: SymptomInput): ClassificationResult {
    // RED FLAGS - Stop running, see doctor
    if (
        symptoms.bonyTenderness ||
        symptoms.numbness ||
        symptoms.swelling ||
        symptoms.postActivityPain >= 7 ||
        (symptoms.gaitChange && symptoms.postActivityPain >= 5) ||
        (symptoms.painTrend === 'worse' && symptoms.postActivityPain >= 6)
    ) {
        return {
            status: 'red',
            recommendation: 'Stop running. See a medical professional.',
            modifications: [
                'No running until cleared',
                'Consider cross-training if pain-free',
                'Strength work only if pain-free',
                'Focus on durability modules',
            ],
            shouldSeeDoctor: true,
            returnToRunProtocol: 'rtr_protocol_a',
        };
    }

    // AMBER - Modify training
    if (
        symptoms.postActivityPain >= 4 ||
        symptoms.morningPain >= 5 ||
        symptoms.morningStiffnessMinutes >= 30 ||
        symptoms.painTrend === 'worse' ||
        symptoms.gaitChange
    ) {
        return {
            status: 'amber',
            recommendation: 'Reduce training load. Monitor symptoms.',
            modifications: [
                'Reduce weekly mileage by 30-50%',
                'No speed work or tempo runs',
                'Easy runs only, cut short if pain increases',
                'Prioritize durability and mobility work',
                'Ice after activity if helpful',
            ],
            shouldSeeDoctor: symptoms.postActivityPain >= 5 || symptoms.morningStiffnessMinutes >= 45,
        };
    }

    // GREEN - Continue training with awareness
    return {
        status: 'green',
        recommendation: 'Continue training as planned. Stay aware.',
        modifications: [
            'Normal training resumes',
            'Monitor for changes',
            'Maintain durability work',
        ],
        shouldSeeDoctor: false,
    };
}

/**
 * Return to Run Protocol
 * Progressive loading after RED status
 */
export interface RTRPhase {
    phase: number;
    description: string;
    criteria: string;
    activity: string;
    duration: string;
}

export const RETURN_TO_RUN_PROTOCOL: RTRPhase[] = [
    {
        phase: 1,
        description: 'Pain-Free Daily Activities',
        criteria: 'No pain with walking, stairs, or daily activities for 3+ days',
        activity: 'Walking only, increasing duration gradually',
        duration: '3-7 days minimum',
    },
    {
        phase: 2,
        description: 'Cross-Training',
        criteria: 'Phase 1 complete, no pain during or after activity',
        activity: 'Bike, pool running, elliptical - 20-30 min easy',
        duration: '5-7 days',
    },
    {
        phase: 3,
        description: 'Run-Walk Introduction',
        criteria: 'Phase 2 complete, no symptoms',
        activity: '1 min run / 2 min walk × 10, every other day',
        duration: '7-10 days',
    },
    {
        phase: 4,
        description: 'Easy Running',
        criteria: 'Run-walk pain-free, no symptoms 24hr post',
        activity: '10-15 min easy continuous, progress 10% weekly',
        duration: '2-3 weeks',
    },
    {
        phase: 5,
        description: 'Normal Training',
        criteria: '30 min easy run pain-free, no symptoms',
        activity: 'Gradual return to baseline mileage, add quality after 2 weeks',
        duration: '2-4 weeks to full return',
    },
];

/**
 * Track symptom trends over time
 */
export interface SymptomTrend {
    date: Date;
    status: InjuryStatus;
    painLevel: number;
}

export function analyzeSymptomTrend(history: SymptomTrend[]): {
    trend: 'improving' | 'stable' | 'worsening';
    recommendation: string;
} {
    if (history.length < 3) {
        return { trend: 'stable', recommendation: 'Not enough data. Continue monitoring.' };
    }

    const recent = history.slice(-7);
    const avgRecent = recent.reduce((s, h) => s + h.painLevel, 0) / recent.length;
    const avgPrevious = history.slice(-14, -7).reduce((s, h) => s + h.painLevel, 0) /
        Math.max(1, history.slice(-14, -7).length);

    if (avgRecent < avgPrevious - 1) {
        return { trend: 'improving', recommendation: 'Symptoms improving. Current approach working.' };
    } else if (avgRecent > avgPrevious + 1) {
        return { trend: 'worsening', recommendation: 'Symptoms worsening. Consider reducing load further.' };
    }
    return { trend: 'stable', recommendation: 'Symptoms stable. Maintain current approach.' };
}
