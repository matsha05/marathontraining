/**
 * VDOT Estimation Module
 * 
 * Provides methods to estimate VDOT from various data sources:
 * - Race results (gold standard)
 * - Time trials
 * - Conservative fallback based on demographics + training load
 * 
 * Based on Jack Daniels' Running Formula
 */

export type VdotConfidence = 'high' | 'medium' | 'low';

export interface VdotEstimate {
    vdot: number;
    confidence: VdotConfidence;
    source: 'race' | 'time_trial' | 'garmin' | 'estimated';
    notes?: string;
}

// =============================================================================
// VO2MAX → VDOT CONVERSION
// =============================================================================

/**
 * Conservative discount factor for VO2max → VDOT conversion.
 * 
 * Watches/devices often overestimate VO2max relative to actual racing ability.
 * VDOT accounts for running economy, which VO2max doesn't fully capture.
 * 
 * A flat 10% discount is conservative and honest — we'll refine based on
 * actual performance in Week 1 rather than pretending we can guess economy.
 */
const VO2MAX_TO_VDOT_DISCOUNT = 0.90; // 10% conservative adjustment

/**
 * Convert VO2max to VDOT with conservative adjustment
 * 
 * Uses a flat 10% discount because:
 * - Watches overestimate VO2max vs actual racing ability
 * - VDOT accounts for running economy, VO2max doesn't
 * - Better to start conservative and adjust up based on real data
 */
export function vdotFromVO2max(vo2max: number): VdotEstimate {
    const vdot = Math.round(vo2max * VO2MAX_TO_VDOT_DISCOUNT);

    return {
        vdot: Math.max(20, Math.min(85, vdot)),
        confidence: 'medium',
        source: 'garmin',
        notes: `Conservative estimate from VO2max ${vo2max} — will refine based on your runs`
    };
}

// =============================================================================
// MULTI-SIGNAL VDOT ESTIMATION
// =============================================================================

/**
 * A single VDOT data point from any source
 */
export interface VdotSignal {
    vdot: number;
    confidence: VdotConfidence;
    source: VdotEstimate['source'];
    weight?: number; // Optional override, otherwise use confidence-based weight
}

const CONFIDENCE_WEIGHTS: Record<VdotConfidence, number> = {
    high: 1.0,
    medium: 0.7,
    low: 0.4
};

/**
 * Calculate VDOT from multiple signals using weighted averaging
 * 
 * Uses a conservative approach: takes the lower of:
 * - Weighted average across all signals
 * - Minimum high-confidence signal (if any)
 * 
 * This prevents overestimation and aligns with coaching best practice:
 * "Start conservative, adjust up based on actual performance"
 */
export function calculateWeightedVdot(signals: VdotSignal[]): VdotEstimate {
    if (signals.length === 0) {
        return { vdot: 35, confidence: 'low', source: 'estimated', notes: 'No calibration signals provided' };
    }

    if (signals.length === 1) {
        const s = signals[0];
        return { vdot: s.vdot, confidence: s.confidence, source: s.source };
    }

    // Calculate weighted average
    let totalWeight = 0;
    let weightedSum = 0;

    for (const signal of signals) {
        const weight = signal.weight ?? CONFIDENCE_WEIGHTS[signal.confidence];
        totalWeight += weight;
        weightedSum += signal.vdot * weight;
    }

    const avgVdot = Math.round(weightedSum / totalWeight);

    // Conservative approach: prefer lower estimate from high-confidence sources
    const highConfSignals = signals.filter(s => s.confidence === 'high');
    const minHighConf = highConfSignals.length > 0
        ? Math.min(...highConfSignals.map(s => s.vdot))
        : avgVdot;

    const finalVdot = Math.min(avgVdot, minHighConf);

    // Determine primary source (highest confidence)
    const sortedByConf = [...signals].sort((a, b) =>
        CONFIDENCE_WEIGHTS[b.confidence] - CONFIDENCE_WEIGHTS[a.confidence]
    );

    return {
        vdot: finalVdot,
        confidence: highConfSignals.length > 0 ? 'high' : 'medium',
        source: sortedByConf[0].source,
        notes: `Triangulated from ${signals.length} sources (${signals.map(s => s.source).join(', ')})`
    };
}

// Race distance in meters
const RACE_DISTANCES: Record<string, number> = {
    '5k': 5000,
    '10k': 10000,
    'half': 21097.5,
    'marathon': 42195,
    'mile': 1609.34,
};

/**
 * Calculate VDOT from race/time trial performance
 * Uses Daniels formula approximation
 */
export function calculateVdotFromRace(
    distanceKey: string,
    timeSeconds: number
): VdotEstimate {
    const distanceMeters = RACE_DISTANCES[distanceKey];
    if (!distanceMeters || timeSeconds <= 0) {
        return {
            vdot: 35,
            confidence: 'low',
            source: 'estimated',
            notes: 'Invalid input - using conservative default'
        };
    }

    // Daniels VDOT approximation
    // Based on VO2 and running economy relationships
    const velocity = distanceMeters / (timeSeconds / 60); // meters per minute
    const timeMinutes = timeSeconds / 60;

    // Daniels formula components
    const percentVO2 = 0.8 + 0.1894393 * Math.exp(-0.012778 * timeMinutes) +
        0.2989558 * Math.exp(-0.1932605 * timeMinutes);

    const vo2 = -4.60 + 0.182258 * velocity + 0.000104 * Math.pow(velocity, 2);

    const vdot = Math.round(vo2 / percentVO2);

    // Clamp to reasonable range
    const clampedVdot = Math.max(20, Math.min(85, vdot));

    return {
        vdot: clampedVdot,
        confidence: 'high',
        source: 'race',
    };
}

/**
 * Calculate VDOT from time trial with effort adjustment
 */
export function calculateVdotFromTimeTrial(
    distanceKey: string,
    timeSeconds: number,
    perceivedEffort: number // 1-10 RPE scale
): VdotEstimate {
    const baseEstimate = calculateVdotFromRace(distanceKey, timeSeconds);

    // Adjust for sub-maximal effort
    // If RPE < 9, they likely have more in the tank
    let adjustedVdot = baseEstimate.vdot;
    let notes = '';

    if (perceivedEffort < 8) {
        // Significant discount - they weren't pushing
        adjustedVdot = Math.round(baseEstimate.vdot * 0.92);
        notes = 'Adjusted down 8% for low effort - recommend retest';
    } else if (perceivedEffort < 9) {
        adjustedVdot = Math.round(baseEstimate.vdot * 0.96);
        notes = 'Adjusted down 4% for moderate effort';
    }

    return {
        vdot: adjustedVdot,
        confidence: perceivedEffort >= 9 ? 'high' : 'medium',
        source: 'time_trial',
        notes
    };
}

/**
 * Convert Garmin VO2max to VDOT
 * Garmin VO2max is typically slightly higher than effective VDOT
 */
export function vdotFromGarminVO2max(garminVO2max: number): VdotEstimate {
    // VO2max and VDOT are related but not identical
    // VDOT accounts for running economy, Garmin doesn't fully
    const vdot = Math.round(garminVO2max * 0.93);

    return {
        vdot: Math.max(20, Math.min(85, vdot)),
        confidence: 'high',
        source: 'garmin',
        notes: 'Converted from Garmin VO2max'
    };
}

/**
 * Conservative fallback estimation when no performance data available
 * Based on demographics + training load indicators
 * 
 * WARNING: This is a last resort. Always prefer real performance data.
 */
export function estimateVdotConservative(
    age: number,
    sex: 'male' | 'female',
    weeklyMiles: number,
    runsPerWeek: number,
    strengthBackground: 'none' | 'some' | 'regular'
): VdotEstimate {
    // Population baseline (50th percentile recreational runner)
    let baseVdot = sex === 'male' ? 38 : 33;

    // Age adjustment: decline ~0.5% per year after 30
    const ageAdjust = age > 30 ? -0.3 * (age - 30) : 0;
    baseVdot += ageAdjust;

    // Training load bonus (max +8)
    // Weekly miles is strongest predictor of current fitness
    const mileageBonus = Math.min(8, weeklyMiles * 0.15);
    baseVdot += mileageBonus;

    // Frequency bonus (small)
    if (runsPerWeek >= 4) baseVdot += 1;
    if (runsPerWeek >= 6) baseVdot += 1;

    // Clamp to reasonable range and round
    const finalVdot = Math.round(Math.max(25, Math.min(55, baseVdot)));

    return {
        vdot: finalVdot,
        confidence: 'low',
        source: 'estimated',
        notes: 'Conservative estimate - will calibrate in week 1'
    };
}

/**
 * Calculate training paces from VDOT
 * Returns paces in seconds per mile
 */
export interface TrainingPaces {
    easy: { min: number; max: number };     // E pace range
    marathon: number;                         // M pace
    threshold: number;                        // T pace
    interval: number;                         // I pace
    repetition: number;                       // R pace
}

export function calculateTrainingPaces(vdot: number): TrainingPaces {
    // Daniels pace calculations (approximated)
    // Base paces in seconds per mile for VDOT 40, then adjust

    const vdotOffset = vdot - 40;
    const paceAdjust = -6 * vdotOffset; // ~6 sec/mi per VDOT point

    const basePaces = {
        easy: { min: 600, max: 660 },  // 10:00-11:00/mi
        marathon: 540,                   // 9:00/mi
        threshold: 495,                  // 8:15/mi
        interval: 435,                   // 7:15/mi  
        repetition: 390                  // 6:30/mi
    };

    return {
        easy: {
            min: Math.round(basePaces.easy.min + paceAdjust * 1.1),
            max: Math.round(basePaces.easy.max + paceAdjust * 1.1)
        },
        marathon: Math.round(basePaces.marathon + paceAdjust),
        threshold: Math.round(basePaces.threshold + paceAdjust * 0.9),
        interval: Math.round(basePaces.interval + paceAdjust * 0.85),
        repetition: Math.round(basePaces.repetition + paceAdjust * 0.8)
    };
}

/**
 * Format pace in seconds to MM:SS string
 */
export function formatPace(secondsPerMile: number): string {
    const minutes = Math.floor(secondsPerMile / 60);
    const seconds = Math.round(secondsPerMile % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
