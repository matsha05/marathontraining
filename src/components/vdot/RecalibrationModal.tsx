/**
 * VDOT Recalibration Modal
 * 
 * Allows users to update their VDOT from:
 * - Recent race result
 * - Time trial
 * 
 * Updates future workout paces without rebuilding entire plan structure.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateVdotFromRace } from '@/domain/vdot/vdot-estimator';
import { getFormattedPaceZones } from '@/domain/vdot/paces';

// =============================================================================
// TYPES
// =============================================================================

interface RecalibrationModalProps {
    isOpen: boolean;
    currentVdot: number;
    onClose: () => void;
    onConfirm: (newVdot: number) => void;
}

type InputType = 'race' | 'time_trial';
type RaceDistance = '5k' | '10k' | 'half' | 'marathon';
type TrialDistance = 'mile' | '5k';

// =============================================================================
// COMPONENT
// =============================================================================

export function RecalibrationModal({ isOpen, currentVdot, onClose, onConfirm }: RecalibrationModalProps) {
    const [step, setStep] = useState<'input' | 'confirm'>('input');
    const [inputType, setInputType] = useState<InputType>('race');
    const [distance, setDistance] = useState<RaceDistance | TrialDistance>('5k');
    const [timeMinutes, setTimeMinutes] = useState('');
    const [timeSeconds, setTimeSeconds] = useState('');
    const [calculatedVdot, setCalculatedVdot] = useState<number | null>(null);

    // Reset state when modal opens
    const handleClose = () => {
        setStep('input');
        setInputType('race');
        setDistance('5k');
        setTimeMinutes('');
        setTimeSeconds('');
        setCalculatedVdot(null);
        onClose();
    };

    // Calculate new VDOT
    const handleCalculate = () => {
        const mins = parseInt(timeMinutes) || 0;
        const secs = parseInt(timeSeconds) || 0;
        const totalSeconds = mins * 60 + secs;

        if (totalSeconds <= 0) return;

        const result = calculateVdotFromRace(distance, totalSeconds);
        setCalculatedVdot(result.vdot);
        setStep('confirm');
    };

    // Confirm and update
    const handleConfirm = () => {
        if (calculatedVdot) {
            onConfirm(calculatedVdot);
            handleClose();
        }
    };

    // Get pace zones for comparison
    const currentPaces = getFormattedPaceZones(currentVdot);
    const newPaces = calculatedVdot ? getFormattedPaceZones(calculatedVdot) : null;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0"
                    style={{ background: 'rgba(0,0,0,0.8)' }}
                    onClick={handleClose}
                />

                {/* Modal */}
                <motion.div
                    className="v2-card relative z-10 w-full max-w-lg p-6"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                >
                    {step === 'input' ? (
                        <>
                            <h2 className="v2-heading-md mb-2">Update Your VDOT</h2>
                            <p className="v2-body-sm mb-6" style={{ color: 'var(--v2-text-muted)' }}>
                                Enter a recent race or time trial to recalculate your training paces.
                            </p>

                            {/* Input Type Toggle */}
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => setInputType('race')}
                                    className={`flex-1 py-3 rounded-lg border transition-colors ${inputType === 'race' ? 'border-[var(--v2-accent)]' : 'border-[var(--v2-border)]'
                                        }`}
                                    style={{
                                        background: inputType === 'race' ? 'var(--v2-accent-subtle)' : 'transparent',
                                        color: inputType === 'race' ? 'var(--v2-accent)' : 'var(--v2-text-muted)',
                                    }}
                                >
                                    🏁 Race Result
                                </button>
                                <button
                                    onClick={() => setInputType('time_trial')}
                                    className={`flex-1 py-3 rounded-lg border transition-colors ${inputType === 'time_trial' ? 'border-[var(--v2-accent)]' : 'border-[var(--v2-border)]'
                                        }`}
                                    style={{
                                        background: inputType === 'time_trial' ? 'var(--v2-accent-subtle)' : 'transparent',
                                        color: inputType === 'time_trial' ? 'var(--v2-accent)' : 'var(--v2-text-muted)',
                                    }}
                                >
                                    ⏱️ Time Trial
                                </button>
                            </div>

                            {/* Distance Selection */}
                            <div className="mb-6">
                                <label className="v2-form-label mb-2 block">Distance</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(inputType === 'race'
                                        ? ['5k', '10k', 'half', 'marathon']
                                        : ['mile', '5k']
                                    ).map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setDistance(d as any)}
                                            className={`py-2 rounded-lg border text-sm transition-colors ${distance === d ? 'border-[var(--v2-accent)]' : 'border-[var(--v2-border)]'
                                                }`}
                                            style={{
                                                background: distance === d ? 'var(--v2-accent-subtle)' : 'var(--v2-bg-elevated)',
                                                color: distance === d ? 'var(--v2-accent)' : 'var(--v2-text-secondary)',
                                            }}
                                        >
                                            {d === 'half' ? 'Half' : d === 'marathon' ? 'Full' : d.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time Input */}
                            <div className="mb-6">
                                <label className="v2-form-label mb-2 block">Finish Time</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="MM"
                                        value={timeMinutes}
                                        onChange={(e) => setTimeMinutes(e.target.value)}
                                        className="v2-input w-20 text-center v2-mono"
                                        min="1"
                                        max="999"
                                    />
                                    <span className="v2-heading-md">:</span>
                                    <input
                                        type="number"
                                        placeholder="SS"
                                        value={timeSeconds}
                                        onChange={(e) => setTimeSeconds(e.target.value)}
                                        className="v2-input w-20 text-center v2-mono"
                                        min="0"
                                        max="59"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button onClick={handleClose} className="v2-btn v2-btn-ghost flex-1">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCalculate}
                                    disabled={!timeMinutes}
                                    className="v2-btn v2-btn-primary flex-1"
                                >
                                    Calculate
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="v2-heading-md mb-2">Confirm Update</h2>

                            {/* VDOT Change */}
                            <div className="flex items-center justify-center gap-6 py-6 mb-6" style={{ background: 'var(--v2-bg-inset)', borderRadius: '12px' }}>
                                <div className="text-center">
                                    <p className="v2-body-xs" style={{ color: 'var(--v2-text-muted)' }}>Current</p>
                                    <p className="v2-heading-lg v2-mono">{currentVdot}</p>
                                </div>
                                <span className="v2-heading-lg" style={{ color: 'var(--v2-text-muted)' }}>→</span>
                                <div className="text-center">
                                    <p className="v2-body-xs" style={{ color: 'var(--v2-text-muted)' }}>New</p>
                                    <p className="v2-heading-lg v2-mono v2-accent">{calculatedVdot}</p>
                                </div>
                                <div className="text-center">
                                    <p className="v2-body-xs" style={{ color: 'var(--v2-text-muted)' }}>Change</p>
                                    <p className={`v2-heading-lg v2-mono ${(calculatedVdot || 0) > currentVdot ? 'v2-accent' : ''}`}
                                        style={(calculatedVdot || 0) < currentVdot ? { color: 'var(--v2-warning)' } : {}}
                                    >
                                        {(calculatedVdot || 0) > currentVdot ? '+' : ''}{(calculatedVdot || 0) - currentVdot}
                                    </p>
                                </div>
                            </div>

                            {/* Pace Comparison */}
                            <div className="mb-6">
                                <p className="v2-form-label mb-3">Your Training Paces</p>
                                <div className="space-y-2">
                                    {Object.entries(newPaces || {}).map(([zone, newPace]) => {
                                        const oldPace = currentPaces[zone];
                                        return (
                                            <div key={zone} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--v2-border)' }}>
                                                <span className="v2-body-sm">{zone}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="v2-mono text-sm" style={{ color: 'var(--v2-text-muted)', textDecoration: 'line-through' }}>
                                                        {oldPace}
                                                    </span>
                                                    <span className="v2-mono text-sm v2-accent">{newPace}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4 rounded-lg mb-6" style={{ background: 'var(--v2-bg-inset)' }}>
                                <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>
                                    💡 This will update all future workout paces. Your plan structure stays the same.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button onClick={() => setStep('input')} className="v2-btn v2-btn-ghost flex-1">
                                    Back
                                </button>
                                <button onClick={handleConfirm} className="v2-btn v2-btn-primary flex-1">
                                    Update Paces
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
