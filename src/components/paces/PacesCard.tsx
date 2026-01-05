/**
 * Training Paces & Race Predictions Card
 * 
 * Premium dashboard widget showing:
 * - All training zones with paces
 * - Predicted race times at current fitness
 * - HR zone overlays (when age is available)
 * 
 * Based on Daniels' Running Formula VDOT tables
 */

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { calculatePaceZones, formatPace } from '@/domain/vdot/paces';

// =============================================================================
// TYPES
// =============================================================================

interface PacesCardProps {
    vdot: number;
    age?: number | null;
    maxHR?: number | null;
    onRecalibrate?: () => void;
}

interface Zone {
    name: string;
    pace: string;
    description: string;
    hrRange?: string;
}

// =============================================================================
// RACE TIME PREDICTIONS FROM VDOT
// =============================================================================

/**
 * Calculate predicted race times from VDOT
 * Uses Daniels' formula: time = f(distance, VDOT)
 * 
 * These are race-effort predictions, not training pace
 */
function predictRaceTimes(vdot: number): Record<string, string> {
    // VDOT to race time tables (Daniels' Running Formula)
    // Values in seconds for each VDOT
    const raceTimeTable: Record<number, { fiveK: number; tenK: number; half: number; marathon: number }> = {
        30: { fiveK: 1867, tenK: 3894, half: 8616, marathon: 17820 },
        35: { fiveK: 1590, tenK: 3300, half: 7260, marathon: 14940 },
        40: { fiveK: 1380, tenK: 2856, half: 6264, marathon: 12840 },
        45: { fiveK: 1212, tenK: 2502, half: 5472, marathon: 11190 },
        50: { fiveK: 1074, tenK: 2214, half: 4836, marathon: 9870 },
        55: { fiveK: 960, tenK: 1974, half: 4308, marathon: 8790 },
        60: { fiveK: 864, tenK: 1776, half: 3870, marathon: 7890 },
        65: { fiveK: 783, tenK: 1608, half: 3504, marathon: 7140 },
        70: { fiveK: 714, tenK: 1464, half: 3186, marathon: 6495 },
        75: { fiveK: 654, tenK: 1340, half: 2916, marathon: 5940 },
        80: { fiveK: 600, tenK: 1230, half: 2676, marathon: 5445 },
        85: { fiveK: 552, tenK: 1131, half: 2460, marathon: 5010 },
    };

    // Find nearest VDOT values for interpolation
    const vdots = Object.keys(raceTimeTable).map(Number).sort((a, b) => a - b);
    let lower = vdots[0];
    let upper = vdots[vdots.length - 1];

    for (let i = 0; i < vdots.length - 1; i++) {
        if (vdot >= vdots[i] && vdot <= vdots[i + 1]) {
            lower = vdots[i];
            upper = vdots[i + 1];
            break;
        }
    }

    // Clamp to table range
    const clampedVdot = Math.max(lower, Math.min(upper, vdot));

    // Interpolate
    const fraction = upper === lower ? 0 : (clampedVdot - lower) / (upper - lower);
    const lowerTimes = raceTimeTable[lower];
    const upperTimes = raceTimeTable[upper];

    const interpolate = (key: 'fiveK' | 'tenK' | 'half' | 'marathon') =>
        Math.round(lowerTimes[key] + (upperTimes[key] - lowerTimes[key]) * fraction);

    const formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return {
        '5K': formatTime(interpolate('fiveK')),
        '10K': formatTime(interpolate('tenK')),
        'Half': formatTime(interpolate('half')),
        'Marathon': formatTime(interpolate('marathon')),
    };
}

/**
 * Calculate HR zones from max HR
 * Based on Seiler's polarized training model
 */
function calculateHRZones(maxHR: number): Record<string, { min: number; max: number; percent: string }> {
    return {
        'Easy': { min: Math.round(maxHR * 0.60), max: Math.round(maxHR * 0.70), percent: '60-70%' },
        'Aerobic': { min: Math.round(maxHR * 0.70), max: Math.round(maxHR * 0.80), percent: '70-80%' },
        'Threshold': { min: Math.round(maxHR * 0.80), max: Math.round(maxHR * 0.88), percent: '80-88%' },
        'VO2max': { min: Math.round(maxHR * 0.88), max: Math.round(maxHR * 0.95), percent: '88-95%' },
        'Anaerobic': { min: Math.round(maxHR * 0.95), max: maxHR, percent: '95-100%' },
    };
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PacesCard({ vdot, age, maxHR, onRecalibrate }: PacesCardProps) {
    // Calculate max HR from age if not provided
    const calculatedMaxHR = useMemo(() => {
        if (maxHR) return maxHR;
        if (age && age > 0) return Math.round(220 - age);
        return null;
    }, [maxHR, age]);

    // Get pace zones
    const paceZones = useMemo(() => calculatePaceZones(vdot), [vdot]);

    // Get race predictions
    const raceTimes = useMemo(() => predictRaceTimes(vdot), [vdot]);

    // Get HR zones
    const hrZones = useMemo(() =>
        calculatedMaxHR ? calculateHRZones(calculatedMaxHR) : null,
        [calculatedMaxHR]);

    // Build zone display data
    const zones: Zone[] = useMemo(() => {
        const base: Zone[] = [
            {
                name: 'Easy',
                pace: `${formatPace(paceZones.E.minSecPerMile)}-${formatPace(paceZones.E.maxSecPerMile)}`,
                description: 'Recovery & base building',
                hrRange: hrZones ? `${hrZones['Easy'].min}-${hrZones['Easy'].max} bpm` : undefined,
            },
            {
                name: 'Marathon',
                pace: formatPace(paceZones.M.secPerMile),
                description: 'Race pace endurance',
                hrRange: hrZones ? `${hrZones['Aerobic'].min}-${hrZones['Aerobic'].max} bpm` : undefined,
            },
            {
                name: 'Threshold',
                pace: formatPace(paceZones.T.secPerMile),
                description: 'Lactate threshold',
                hrRange: hrZones ? `${hrZones['Threshold'].min}-${hrZones['Threshold'].max} bpm` : undefined,
            },
            {
                name: 'Interval',
                pace: formatPace(paceZones.I.secPerMile),
                description: 'VO₂max development',
                hrRange: hrZones ? `${hrZones['VO2max'].min}-${hrZones['VO2max'].max} bpm` : undefined,
            },
            {
                name: 'Repetition',
                pace: formatPace(paceZones.R.secPerMile),
                description: 'Speed & economy',
                hrRange: hrZones ? `${hrZones['Anaerobic'].min}-${hrZones['Anaerobic'].max} bpm` : undefined,
            },
        ];
        return base;
    }, [paceZones, hrZones]);

    return (
        <motion.div
            className="v2-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="v2-heading-md mb-1">Your Training Zones</h2>
                    <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>
                        VDOT {vdot}{calculatedMaxHR ? ` • Max HR ${calculatedMaxHR}` : ''}
                    </p>
                </div>
                {onRecalibrate && (
                    <button
                        onClick={onRecalibrate}
                        className="v2-btn v2-btn-ghost v2-btn-sm"
                    >
                        Recalibrate
                    </button>
                )}
            </div>

            {/* Pace Zones */}
            <div className="space-y-3 mb-8">
                {zones.map((zone, i) => (
                    <div
                        key={zone.name}
                        className="flex items-center justify-between py-3 border-b"
                        style={{ borderColor: 'var(--v2-border)' }}
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="v2-body-md font-medium">{zone.name}</span>
                                <span className="v2-body-xs" style={{ color: 'var(--v2-text-muted)' }}>
                                    {zone.description}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="v2-mono v2-body-md">{zone.pace}/mi</span>
                            {zone.hrRange && (
                                <div className="v2-body-xs" style={{ color: 'var(--v2-text-subtle)' }}>
                                    ❤️ {zone.hrRange}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Race Predictions */}
            <div>
                <h3 className="v2-heading-sm mb-4" style={{ color: 'var(--v2-text-secondary)' }}>
                    Predicted Race Times
                </h3>
                <div className="grid grid-cols-4 gap-4">
                    {Object.entries(raceTimes).map(([distance, time]) => (
                        <div key={distance} className="text-center">
                            <div className="v2-body-xs mb-1" style={{ color: 'var(--v2-text-muted)' }}>
                                {distance}
                            </div>
                            <div className="v2-mono v2-body-md font-medium">
                                {time}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tip */}
            {calculatedMaxHR && (
                <div
                    className="mt-6 p-4 rounded-lg"
                    style={{ background: 'var(--v2-bg-inset)' }}
                >
                    <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>
                        💡 <strong>Tip:</strong> When pace and HR conflict, trust HR for easy runs (heat/fatigue matter), trust pace for intervals (HR lags effort).
                    </p>
                </div>
            )}
        </motion.div>
    );
}
