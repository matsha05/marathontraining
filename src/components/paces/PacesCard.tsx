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

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculatePaceZones, formatPace } from '@/domain/vdot/paces';
import { HeartIcon } from '@/components/ui/heart';

// =============================================================================
// TYPES
// =============================================================================

interface PacesCardProps {
    vdot: number;
    age?: number | null;
    maxHR?: number | null;
    onRecalibrate?: () => void;
    onMaxHRUpdate?: (newMaxHR: number) => void;
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

export function PacesCard({ vdot, age, maxHR, onRecalibrate, onMaxHRUpdate }: PacesCardProps) {
    const [showHREditor, setShowHREditor] = useState(false);
    const [hrInput, setHRInput] = useState('');

    // Calculate max HR from age if not provided
    const calculatedMaxHR = useMemo(() => {
        if (maxHR) return maxHR;
        if (age && age > 0) return Math.round(220 - age);
        return null;
    }, [maxHR, age]);

    const isEstimated = !maxHR && age; // true if using age estimation

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
            className="v3-card p-6 container-inline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="v3-heading-md mb-1">Your Training Zones</h2>
                    <div className="flex items-center gap-2">
                        <span className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>
                            VDOT {vdot}
                        </span>
                        {calculatedMaxHR && (
                            <>
                                <span style={{ color: 'var(--text-subtle)' }}>•</span>
                                <button
                                    onClick={() => {
                                        setHRInput(String(calculatedMaxHR));
                                        setShowHREditor(true);
                                    }}
                                    className="v3-body-sm flex items-center gap-1 transition-colors hover:underline"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <HeartIcon size={12} filled pulsing style={{ color: '#ef4444' }} />
                                    Max HR {calculatedMaxHR}
                                    {isEstimated && <span className="text-[10px]">(est.)</span>}
                                </button>
                            </>
                        )}
                    </div>
                </div>
                {onRecalibrate && (
                    <div className="text-right">
                        <button
                            onClick={onRecalibrate}
                            className="v3-btn v3-btn-secondary v3-btn-sm"
                        >
                            Recalibrate
                        </button>
                        <p className="v3-body-xs mt-1" style={{ color: 'var(--text-subtle)' }}>
                            New race result?
                        </p>
                    </div>
                )}
            </div>

            {/* Max HR Editor Popover */}
            <AnimatePresence>
                {showHREditor && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 rounded-lg border"
                        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-base)' }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <HeartIcon size={16} filled pulsing style={{ color: '#ef4444' }} />
                            <span className="v3-heading-sm">Update Max Heart Rate</span>
                        </div>
                        <p className="v3-body-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                            The default (220 - age) is a rough estimate. For accuracy, use your highest HR from an all-out effort like a 5K race or uphill sprint.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                inputMode="numeric"
                                value={hrInput}
                                onChange={(e) => setHRInput(e.target.value)}
                                className="v3-input v3-mono w-24 text-center"
                                placeholder="180"
                                min="120"
                                max="220"
                            />
                            <span className="v3-body-sm self-center" style={{ color: 'var(--text-muted)' }}>bpm</span>
                            <button
                                onClick={() => {
                                    const val = parseInt(hrInput);
                                    if (val >= 120 && val <= 220 && onMaxHRUpdate) {
                                        onMaxHRUpdate(val);
                                    }
                                    setShowHREditor(false);
                                }}
                                className="v3-btn v3-btn-primary v3-btn-sm"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setShowHREditor(false)}
                                className="v3-btn v3-btn-ghost v3-btn-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pace Zones */}
            <div className="space-y-3 mb-8">
                {zones.map((zone) => (
                    <div
                        key={zone.name}
                        className="flex items-center justify-between py-3 border-b"
                        style={{ borderColor: 'var(--border-base)' }}
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="v3-body-md font-medium">{zone.name}</span>
                                <span className="v3-body-xs" style={{ color: 'var(--text-muted)' }}>
                                    {zone.description}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="v3-mono v3-body-md">{zone.pace}/mi</span>
                            {zone.hrRange && (
                                <div className="v3-body-xs flex items-center justify-end gap-1" style={{ color: 'var(--text-subtle)' }}>
                                    <HeartIcon size={10} filled pulsing style={{ color: '#ef4444' }} />
                                    {zone.hrRange}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Race Predictions - Separate Section */}
            <div
                className="mt-8 p-5 rounded-xl"
                style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-base)' }}
            >
                <h3 className="v3-heading-sm mb-4">
                    Predicted Race Times
                </h3>
                <div className="grid grid-cols-4 gap-4 cq-grid-4">
                    {Object.entries(raceTimes).map(([distance, time]) => (
                        <div key={distance} className="text-center">
                            <div className="v3-body-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                                {distance}
                            </div>
                            <div className="v3-mono font-semibold" style={{ fontSize: '1.125rem' }}>
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
                    style={{ background: 'var(--v3-bg-inset)' }}
                >
                    <p className="v3-body-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                        <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span><strong>Tip:</strong> When pace and HR conflict, trust HR for easy runs (heat/fatigue matter), trust pace for intervals (HR lags effort).</span>
                    </p>
                </div>
            )}
        </motion.div>
    );
}
