'use client';

/**
 * THE LONG GAME - Onboarding Screens: Calibration
 * 
 * Fitness calibration method selection, race input, easy pace, 
 * device import, hard effort, estimation, and VDOT reveal screens
 */

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import {
    QuestionScreen,
    QuestionHeader,
    OptionButton,
    OptionGrid,
    ContinueButton,
    TimeInput,
    TextInput,
    CollapsibleInstructions,
    SuccessBanner,
    useKeyboardNavigation,
} from '../ui';
import {
    OnboardingData,
    CalibrationMethod,
    RaceDistance,
    RaceRecency,
    ExperienceLevel,
    EffortType,
} from '@/domain/onboarding/types';
import { STEP_TOOLTIPS } from '@/domain/onboarding/types';
import {
    CALIBRATION_METHODS,
    RACE_DISTANCES,
    RACE_RECENCY_OPTIONS,
    RACE_TIME_BOUNDS,
    EXPERIENCE_LEVELS,
    EFFORT_TYPES,
    TIME_TRIAL_INSTRUCTIONS,
    getVdotPercentile,
} from '@/domain/onboarding/constants';
import { calculateVdotFromRace, calculateTrainingPaces, formatPace } from '@/domain/vdot/vdot-estimator';

// =============================================================================
// CALIBRATION METHOD SCREEN
// =============================================================================

interface CalibrationMethodScreenProps {
    selected: CalibrationMethod | null;
    onSelect: (method: CalibrationMethod) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function CalibrationMethodScreen({
    selected,
    onSelect,
    onContinue,
    onBack
}: CalibrationMethodScreenProps) {
    useKeyboardNavigation({
        onEnter: selected ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            const method = CALIBRATION_METHODS[num - 1];
            if (method) {
                onSelect(method.value as CalibrationMethod);
            }
        },
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="Set your VO2max (required)"
                subtitle="We use this to set every training pace. Choose the most accurate way to calculate it."
                tooltip={STEP_TOOLTIPS['calibration-method']}
            />

            <OptionGrid>
                {CALIBRATION_METHODS.map((method, index) => {
                    const Icon = method.icon;
                    return (
                        <OptionButton
                            key={method.value}
                            label={method.label}
                            description={method.description}
                            shortcut={String(index + 1)}
                            icon={<Icon className="w-5 h-5" />}
                            selected={selected === method.value}
                            onClick={() => onSelect(method.value as CalibrationMethod)}
                        />
                    );
                })}
            </OptionGrid>

            <ContinueButton
                onClick={onContinue}
                disabled={!selected}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// RACE INPUT SCREEN
// =============================================================================

interface RaceInputScreenProps {
    data: OnboardingData;
    onDistanceChange: (distance: RaceDistance) => void;
    onTimeChange: (minutes: number | null, seconds: number | null) => void;
    onRecencyChange: (recency: RaceRecency) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function RaceInputScreen({
    data,
    onDistanceChange,
    onTimeChange,
    onRecencyChange,
    onContinue,
    onBack
}: RaceInputScreenProps) {
    const [timeError, setTimeError] = useState<string | null>(null);

    // Validate time bounds
    useEffect(() => {
        if (data.raceDistance && data.raceTimeMinutes !== null) {
            const totalSeconds = (data.raceTimeMinutes * 60) + (data.raceTimeSeconds ?? 0);
            const bounds = RACE_TIME_BOUNDS[data.raceDistance];

            if (bounds && totalSeconds > 0) {
                if (totalSeconds < bounds.min) {
                    setTimeError(`That seems too fast for a ${data.raceDistance}. Please double-check.`);
                } else if (totalSeconds > bounds.max) {
                    setTimeError(`That seems too slow for a ${data.raceDistance}. Please double-check.`);
                } else {
                    setTimeError(null);
                }
            }
        }
    }, [data.raceDistance, data.raceTimeMinutes, data.raceTimeSeconds]);

    const needsHours = data.raceDistance === 'half' || data.raceDistance === 'marathon';

    const canContinue = data.raceDistance !== null &&
        data.raceTimeMinutes !== null &&
        data.raceRecency !== null &&
        !timeError;

    useKeyboardNavigation({
        onEnter: canContinue ? onContinue : undefined,
        onBack,
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="What was your most recent race?"
            />

            <div className="space-y-6">
                {/* Distance */}
                <div>
                    <label className="text-label block mb-2">Distance</label>
                    <OptionGrid columns={3}>
                        {RACE_DISTANCES.map((dist) => (
                            <OptionButton
                                key={dist.value}
                                label={dist.label}
                                selected={data.raceDistance === dist.value}
                                onClick={() => onDistanceChange(dist.value as RaceDistance)}
                            />
                        ))}
                    </OptionGrid>
                </div>

                {/* Time */}
                <div>
                    <label className="text-label block mb-2">Finish time</label>
                    <TimeInput
                        minutes={data.raceTimeMinutes}
                        seconds={data.raceTimeSeconds}
                        onMinutesChange={(m) => onTimeChange(m, data.raceTimeSeconds)}
                        onSecondsChange={(s) => onTimeChange(data.raceTimeMinutes, s)}
                        showHours={needsHours}
                        error={timeError ?? undefined}
                    />
                </div>

                {/* Recency */}
                <div>
                    <label className="text-label block mb-2">When was this race?</label>
                    <OptionGrid columns={2}>
                        {RACE_RECENCY_OPTIONS.map((option) => (
                            <OptionButton
                                key={option.value}
                                label={option.label}
                                description={option.description}
                                selected={data.raceRecency === option.value}
                                onClick={() => onRecencyChange(option.value as RaceRecency)}
                            />
                        ))}
                    </OptionGrid>
                </div>
            </div>

            <ContinueButton
                onClick={onContinue}
                disabled={!canContinue}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// EASY PACE INPUT SCREEN
// =============================================================================

interface EasyPaceInputScreenProps {
    data: OnboardingData;
    onPaceChange: (minutes: number | null, seconds: number | null) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function EasyPaceInputScreen({
    data,
    onPaceChange,
    onContinue,
    onBack
}: EasyPaceInputScreenProps) {
    const canContinue = data.easyPaceMinutes !== null && data.easyPaceSeconds !== null;

    useKeyboardNavigation({
        onEnter: canContinue ? onContinue : undefined,
        onBack,
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="What's your comfortable, conversational easy pace?"
            />

            <div className="space-y-4">
                <TimeInput
                    minutes={data.easyPaceMinutes}
                    seconds={data.easyPaceSeconds}
                    onMinutesChange={(m) => onPaceChange(m, data.easyPaceSeconds)}
                    onSecondsChange={(s) => onPaceChange(data.easyPaceMinutes, s)}
                />
                <p className="text-[var(--text-muted)]">per mile</p>
            </div>

            <p className="text-body-sm text-[var(--text-subtle)] mt-4">
                This should feel like you could chat with a friend.<br />
                If you&apos;re breathing hard, that&apos;s not easy pace.
            </p>

            <ContinueButton
                onClick={onContinue}
                disabled={!canContinue}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// DEVICE IMPORT SCREEN
// =============================================================================

interface DeviceImportScreenProps {
    onStravaConnect: () => void;
    onContinue: () => void;
    onBack: () => void;
    connectError?: string | null;
}

export function DeviceImportScreen({
    onStravaConnect,
    onContinue,
    onBack,
    connectError,
}: DeviceImportScreenProps) {
    const [isLocalhost, setIsLocalhost] = useState(false);
    const [garminStatus, setGarminStatus] = useState<{
        lastHealthDate?: string | null;
    }>({});
    const [stravaStatus, setStravaStatus] = useState<{
        connected: boolean;
        lastActivityAt?: string | null;
    }>({ connected: false });
    const [statusLoading, setStatusLoading] = useState(true);
    const [authRequired, setAuthRequired] = useState(false);
    const [importBusy, setImportBusy] = useState(false);
    const [importMessage, setImportMessage] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const host = window.location.hostname;
            const local = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host.endsWith('.local');
            setIsLocalhost(local);
        }
    }, []);

    const refreshStatus = useCallback(async () => {
        setStatusLoading(true);
        try {
            const [garminRes, stravaRes] = await Promise.allSettled([
                fetch('/api/garmin/status'),
                fetch('/api/strava/status'),
            ]);
            let sawAuthed = false;
            let sawUnauthorized = false;

            if (garminRes.status === 'fulfilled') {
                if (garminRes.value.status === 401) {
                    sawUnauthorized = true;
                    setGarminStatus({});
                } else if (garminRes.value.ok) {
                    sawAuthed = true;
                    const garminJson = await garminRes.value.json();
                    setGarminStatus({
                        lastHealthDate: garminJson.lastHealthDate ?? null,
                    });
                } else {
                    sawAuthed = true;
                }
            }

            if (stravaRes.status === 'fulfilled') {
                if (stravaRes.value.status === 401) {
                    sawUnauthorized = true;
                    setStravaStatus({ connected: false });
                } else if (stravaRes.value.ok) {
                    sawAuthed = true;
                    const stravaJson = await stravaRes.value.json();
                    setStravaStatus({
                        connected: Boolean(stravaJson.connected),
                        lastActivityAt: stravaJson.lastActivityAt ?? null,
                    });
                } else {
                    sawAuthed = true;
                }
            }

            setAuthRequired(sawUnauthorized && !sawAuthed);
        } finally {
            setStatusLoading(false);
        }
    }, []);

    useEffect(() => {
        void refreshStatus();
        window.addEventListener('focus', refreshStatus);
        return () => {
            window.removeEventListener('focus', refreshStatus);
        };
    }, [refreshStatus]);

    const hasHealthData = Boolean(garminStatus.lastHealthDate);
    const anyConnected = stravaStatus.connected || hasHealthData;
    const continueLabel = anyConnected ? 'Continue' : 'Continue without syncing';

    const formatDate = (value?: string | null) => {
        if (!value) return null;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return null;
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const garminLast = formatDate(garminStatus.lastHealthDate);
    const stravaLast = formatDate(stravaStatus.lastActivityAt);
    const connectState = authRequired ? 'auth' : statusLoading ? 'loading' : 'ready';
    const connectDisabled = connectState !== 'ready';
    const stravaConnectDisabled = connectDisabled || stravaStatus.connected || isLocalhost;
    const handleSignIn = () => {
        window.location.href = '/auth?next=/onboarding';
    };

    const handleGarminExportImport = async (file: File) => {
        setImportBusy(true);
        setImportMessage(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('/api/garmin/import', {
                method: 'POST',
                body: formData,
            });
            if (response.status === 401) {
                setAuthRequired(true);
                setImportMessage('Sign in to import Garmin health data.');
                return;
            }
            if (!response.ok) throw new Error('Garmin export import failed');
            const payload = await response.json().catch(() => null) as { result?: { activitiesImported?: number; healthDaysImported?: number } } | null;
            if (payload?.result) {
                setImportMessage(`Imported ${payload.result.activitiesImported ?? 0} activities and ${payload.result.healthDaysImported ?? 0} health days.`);
            } else {
                setImportMessage('Garmin export imported.');
            }
            await refreshStatus();
        } catch (error) {
            setImportMessage(error instanceof Error ? error.message : 'Garmin export import failed');
        } finally {
            setImportBusy(false);
        }
    };

    useKeyboardNavigation({
        onBack,
        onEnter: onContinue,
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="Connect Strava + import Garmin health metrics"
                subtitle="Activities sync via Strava. Health metrics come from Garmin exports. Recommended but optional."
                tooltip={STEP_TOOLTIPS['device-import']}
            />

            {authRequired && !statusLoading && (
                <div className="mb-6 rounded-xl border border-[var(--border-base)] bg-[var(--bg-elevated)] p-4">
                    <p className="text-body-sm text-[var(--text-muted)]">
                        Sign in to connect Strava or import Garmin health data. You can continue without syncing and link everything later.
                    </p>
                    <button
                        type="button"
                        onClick={handleSignIn}
                        className="btn btn-secondary w-full mt-3"
                    >
                        Sign in to connect data
                    </button>
                </div>
            )}

            <div className="space-y-4">
                <div className="rounded-xl border border-[var(--border-base)] bg-[var(--bg-elevated)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-label">Connect Strava (recommended)</p>
                            <p className="text-body-sm text-[var(--text-muted)]">
                                Runs will appear automatically after each sync from Garmin.
                            </p>
                        </div>
                        <span className={`badge ${stravaStatus.connected ? 'badge-accent' : 'badge-warning'}`}>
                            {stravaStatus.connected ? 'Connected' : 'Not connected'}
                        </span>
                    </div>
                    <div className="mt-3 text-body-sm text-[var(--text-muted)]">
                        {stravaStatus.connected
                            ? `Connected${stravaLast ? ` · Last activity ${stravaLast}` : ''}`
                            : connectState === 'auth'
                                ? 'Sign in to connect Strava.'
                                : connectState === 'loading'
                                    ? 'Checking connection status...'
                                    : 'Connect Strava to enable automatic activity sync.'}
                    </div>
                    <p className="text-caption mt-2">
                        Garmin Connect → Settings → Connected Apps → Strava.
                    </p>
                    {isLocalhost && (
                        <p className="text-caption mt-2 text-[var(--text-muted)]">
                            Strava OAuth only works on the production domain. Open the production site to connect.
                        </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-3">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={onStravaConnect}
                            disabled={stravaConnectDisabled}
                        >
                            Connect Strava
                        </button>
                    </div>
                </div>

                <div className="rounded-xl border border-[var(--border-base)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-label">Import Garmin health metrics (recommended)</p>
                            <p className="text-body-sm text-[var(--text-muted)]">
                                Sleep, HRV, stress, and Body Battery history.
                            </p>
                        </div>
                        <span className={`badge ${hasHealthData ? 'badge-accent' : 'badge-warning'}`}>
                            {hasHealthData ? 'Imported' : 'Upload ZIP'}
                        </span>
                    </div>
                    <input
                        type="file"
                        accept=".zip,application/zip"
                        className="input mt-3"
                        disabled={connectDisabled || importBusy}
                        onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                                void handleGarminExportImport(file);
                                event.currentTarget.value = '';
                            }
                        }}
                    />
                    <p className="text-caption mt-2">
                        Garmin Connect web → Account Settings → Export Data.
                    </p>
                    <p className="text-caption">
                        Re-export weekly if you want readiness to stay current.
                    </p>
                    {garminLast && (
                        <p className="text-body-sm text-[var(--text-muted)] mt-2">
                            Last health import: {garminLast}
                        </p>
                    )}
                    {importMessage && (
                        <p className="text-body-sm text-[var(--text-muted)] mt-2">{importMessage}</p>
                    )}
                </div>
            </div>

            {connectError && (
                <div className="mt-6 rounded-xl border border-[var(--color-error)]/30 bg-[var(--bg-elevated)] px-4 py-3 text-body-sm text-[var(--color-error)]">
                    {connectError}
                </div>
            )}

            <div className="mt-6 space-y-3 text-body-sm text-[var(--text-muted)]">
                <p>Connecting opens a new tab. Return here once you finish and this screen will refresh.</p>
                <p>You can always connect Strava or upload a Garmin export later in Settings.</p>
                <button
                    type="button"
                    onClick={refreshStatus}
                    className="text-[var(--color-accent)] hover:underline"
                >
                    {statusLoading ? 'Checking connection...' : 'Refresh connection status'}
                </button>
            </div>

            <ContinueButton onClick={onContinue} label={continueLabel} />
        </QuestionScreen>
    );
}

// =============================================================================
// MANUAL VO2MAX INPUT SCREEN
// =============================================================================

interface ManualVo2maxInputScreenProps {
    value: number | null;
    onChange: (value: number | null) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function ManualVo2maxInputScreen({
    value,
    onChange,
    onContinue,
    onBack,
}: ManualVo2maxInputScreenProps) {
    const canContinue = value !== null && value >= 20 && value <= 90;

    useKeyboardNavigation({
        onEnter: canContinue ? onContinue : undefined,
        onBack,
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="Enter your VO2max"
                subtitle="Use the number from your watch or Garmin Connect profile."
            />

            <TextInput
                value={value?.toString() ?? ''}
                onChange={(nextValue) => {
                    if (!nextValue.trim()) {
                        onChange(null);
                        return;
                    }
                    const parsed = Number(nextValue);
                    onChange(Number.isFinite(parsed) ? parsed : null);
                }}
                type="number"
                min={20}
                max={90}
                step={1}
                placeholder="e.g. 52"
                autoFocus
                suffix="VO2max"
            />

            <p className="mt-4 text-body-sm text-[var(--text-muted)]">
                Most runners fall between 30 and 70. We use this to set your training paces.
            </p>
            <p className="mt-2 text-body-sm text-[var(--text-muted)]">
                Update your VO2max every 4-6 weeks or after a race in Settings.
            </p>

            <ContinueButton onClick={onContinue} disabled={!canContinue} />
        </QuestionScreen>
    );
}

// =============================================================================
// HARD EFFORT INPUT SCREEN
// =============================================================================

interface HardEffortInputScreenProps {
    data: OnboardingData;
    onEffortTypeChange: (type: EffortType) => void;
    onDistanceChange: (distance: string) => void;
    onTimeChange: (minutes: number | null, seconds: number | null) => void;
    onEffortLevelChange: (level: number) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function HardEffortInputScreen({
    data,
    onEffortTypeChange,
    onDistanceChange,
    onTimeChange,
    onEffortLevelChange,
    onContinue,
    onBack
}: HardEffortInputScreenProps) {
    const canContinue = data.effortType !== null && data.effortTimeMinutes !== null;

    useKeyboardNavigation({
        onEnter: canContinue ? onContinue : undefined,
        onBack,
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="Tell us about your recent hard effort."
            />

            <div className="space-y-6">
                {/* Effort type */}
                <div>
                    <label className="text-label block mb-2">What was it?</label>
                    <OptionGrid columns={2}>
                        {EFFORT_TYPES.map((type) => (
                            <OptionButton
                                key={type.value}
                                label={type.label}
                                selected={data.effortType === type.value}
                                onClick={() => {
                                    onEffortTypeChange(type.value as EffortType);
                                    if (type.defaultDistance) {
                                        onDistanceChange(type.defaultDistance);
                                    }
                                }}
                            />
                        ))}
                    </OptionGrid>
                </div>

                {/* Distance (if needed) */}
                {data.effortType && data.effortType !== 'parkrun' && (
                    <div>
                        <label className="text-label block mb-2">Distance</label>
                        <TextInput
                            value={data.effortDistance}
                            onChange={onDistanceChange}
                            placeholder="e.g., 3 miles, 5K"
                        />
                    </div>
                )}

                {/* Time */}
                <div>
                    <label className="text-label block mb-2">Time</label>
                    <TimeInput
                        minutes={data.effortTimeMinutes}
                        seconds={data.effortTimeSeconds}
                        onMinutesChange={(m) => onTimeChange(m, data.effortTimeSeconds)}
                        onSecondsChange={(s) => onTimeChange(data.effortTimeMinutes, s)}
                    />
                </div>

                {/* Effort level */}
                <div>
                    <label className="text-label block mb-2">Effort level (1-10)</label>
                    <div className="flex items-center gap-2">
                        {[6, 7, 8, 9, 10].map((level) => (
                            <button
                                key={level}
                                onClick={() => onEffortLevelChange(level)}
                                className={`w-10 h-10 rounded-lg border transition-all ${data.effortLevel === level
                                    ? 'bg-[var(--color-accent)] text-black border-transparent'
                                    : 'bg-[var(--bg-elevated)] border-[var(--border-base)]'
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                    <p className="text-caption text-[var(--text-subtle)] mt-2">
                        10 = absolute max effort, 6 = comfortably hard
                    </p>
                </div>
            </div>

            <ContinueButton
                onClick={onContinue}
                disabled={!canContinue}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// ESTIMATION FLOW SCREEN
// =============================================================================

interface EstimationFlowScreenProps {
    selected: ExperienceLevel | null;
    onSelect: (level: ExperienceLevel) => void;
    onContinue: () => void;
    onBack: () => void;
    context?: 'estimate' | 'vo2max';
}

export function EstimationFlowScreen({
    selected,
    onSelect,
    onContinue,
    onBack,
    context = 'estimate',
}: EstimationFlowScreenProps) {
    const header = context === 'vo2max'
        ? {
            title: 'How would you describe your running background?',
            subtitle: 'We adjust VO2max to training paces based on running economy.',
        }
        : {
            title: "No problem — we'll estimate based on your training.",
            subtitle: "We'll set conservative paces and include a calibration run in Week 1 to dial them in.",
        };
    const promptLabel = context === 'vo2max'
        ? 'Running background'
        : 'How would you describe your current running?';

    useKeyboardNavigation({
        onEnter: selected ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            const level = EXPERIENCE_LEVELS[num - 1];
            if (level) {
                onSelect(level.value as ExperienceLevel);
            }
        },
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title={header.title}
                subtitle={header.subtitle}
            />

            <div>
                <label className="text-label block mb-3">{promptLabel}</label>
                <OptionGrid>
                    {EXPERIENCE_LEVELS.map((level, index) => (
                        <OptionButton
                            key={level.value}
                            label={level.label}
                            description={level.description}
                            shortcut={String(index + 1)}
                            selected={selected === level.value}
                            onClick={() => onSelect(level.value as ExperienceLevel)}
                        />
                    ))}
                </OptionGrid>
            </div>

            <CollapsibleInstructions
                title={TIME_TRIAL_INSTRUCTIONS.title}
                steps={TIME_TRIAL_INSTRUCTIONS.steps}
                tips={TIME_TRIAL_INSTRUCTIONS.tips}
            />

            <ContinueButton
                onClick={onContinue}
                disabled={!selected}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// VDOT REVEAL SCREEN
// =============================================================================

interface VdotRevealScreenProps {
    data: OnboardingData;
    onRecalculate: () => void;
    onContinue: () => void;
    onBack: () => void;
}

export function VdotRevealScreen({
    data,
    onRecalculate,
    onContinue,
    onBack
}: VdotRevealScreenProps) {
    const [loading, setLoading] = useState(true);

    // Simulate calculation delay
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    useKeyboardNavigation({
        onEnter: !loading ? onContinue : undefined,
        onBack,
    });

    if (loading || !data.vdot) {
        return (
            <QuestionScreen onBack={onBack}>
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--color-accent)]" />
                    <p className="text-[var(--text-muted)] mt-4">Calculating your VDOT...</p>
                </div>
            </QuestionScreen>
        );
    }

    const paces = calculateTrainingPaces(data.vdot);
    const percentileInfo = getVdotPercentile(data.vdot);

    // Predicted marathon time using VDOT-based formula
    // Daniels' formula: marathon pace can be derived from VDOT
    const marathonPaceSeconds = paces.marathon; // seconds per mile
    const marathonTimeMinutes = Math.round((marathonPaceSeconds * 26.2) / 60);
    const marathonHours = Math.floor(marathonTimeMinutes / 60);
    const marathonMins = marathonTimeMinutes % 60;

    return (
        <QuestionScreen onBack={onBack}>
            <div className="text-center mb-6">
                <p className="text-label text-[var(--color-accent)] mb-2">Your VDOT</p>
                <div className="text-display-xl text-data mb-2">{data.vdot}</div>
                <p className="text-[var(--text-muted)]">
                    {percentileInfo.label} • Top {100 - percentileInfo.percentile}% of recreational runners
                </p>
                {data.vdotConfidence === 'low' && (
                    <p className="text-body-sm text-[var(--color-warning)] mt-2">
                        This is an estimate — we&apos;ll refine it with your calibration run
                    </p>
                )}
            </div>

            {/* What is VDOT? Explainer */}
            <div className="p-4 rounded-xl bg-[var(--bg-inset)] mb-4">
                <p className="text-label text-[var(--text-muted)] mb-2">What is VDOT?</p>
                <p className="text-body-sm text-[var(--text-base)] leading-relaxed">
                    VDOT is your &quot;running fitness score&quot; developed by legendary coach Jack Daniels.
                    It&apos;s calculated from your race performance and accounts for both your aerobic capacity
                    and running efficiency. Higher number = fitter. This single number determines all your
                    training paces — so every run is at the right intensity for YOUR current fitness.
                </p>
            </div>

            <SuccessBanner title={`Predicts a ~${marathonHours}:${marathonMins.toString().padStart(2, '0')} marathon`}>
                This gives us the data we need to set your training zones perfectly.
            </SuccessBanner>
            <p className="mt-4 text-body-sm text-[var(--text-muted)]">
                You can update VO2max anytime in Settings → Fitness and we&apos;ll adjust your plan.
            </p>

            {/* Training Paces with Explanations */}
            <div className="mt-6 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-base)]">
                <p className="text-label mb-4">Your training paces</p>
                <div className="space-y-4 text-body-sm">
                    {/* Easy Pace */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="font-medium">Easy</span>
                            <span className="text-data">{formatPace(paces.easy.min)} - {formatPace(paces.easy.max)}/mi</span>
                        </div>
                        <p className="text-caption text-[var(--text-subtle)]">
                            Recovery runs, warm-ups, cool-downs. You should be able to hold a conversation comfortably.
                            This builds your aerobic base without taxing your body.
                        </p>
                    </div>

                    {/* Marathon Pace */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="font-medium">Marathon Pace</span>
                            <span className="text-data">{formatPace(paces.marathon)}/mi</span>
                        </div>
                        <p className="text-caption text-[var(--text-subtle)]">
                            Your predicted race-day pace. Feels &quot;comfortably hard&quot; — sustainable for 26.2 miles but
                            requires focus. Tempo blocks at this pace teach your body to hold it.
                        </p>
                    </div>

                    {/* Tempo/Threshold Pace */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="font-medium">Tempo (Threshold)</span>
                            <span className="text-data">{formatPace(paces.threshold)}/mi</span>
                        </div>
                        <p className="text-caption text-[var(--text-subtle)]">
                            &quot;Comfortably hard&quot; — you can hold this for 20-40 minutes. Trains your body to clear
                            lactate efficiently, raising the pace you can sustain before your legs give out.
                        </p>
                    </div>

                    {/* Interval Pace */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="font-medium">Interval</span>
                            <span className="text-data">{formatPace(paces.interval)}/mi</span>
                        </div>
                        <p className="text-caption text-[var(--text-subtle)]">
                            Hard, short repeats (400m–1 mile). Builds VO2max — your maximum aerobic capacity.
                            These are the workouts that genuinely hurt, but they make you faster.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex gap-3">
                <button
                    onClick={onRecalculate}
                    className="flex-1 btn btn-secondary"
                >
                    This seems off — recalculate
                </button>
                <button
                    onClick={onContinue}
                    className="flex-1 btn btn-gradient"
                >
                    Looks right →
                </button>
            </div>
        </QuestionScreen>
    );
}
