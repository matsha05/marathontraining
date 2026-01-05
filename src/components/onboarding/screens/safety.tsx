'use client';

/**
 * THE LONG GAME - Onboarding Screens: Safety V2
 * 
 * Current pain, pain details, injury history, injury details
 * Week aesthetic: Dark, atmospheric, light typography
 */

import {
    QuestionScreen,
    QuestionHeader,
    OptionButton,
    OptionGrid,
    ContinueButton,
    WarningBanner,
    useKeyboardNavigation,
} from '../ui';
import { OnboardingData, InjuryLocation, PainSeverity } from '@/domain/onboarding/types';
import { STEP_TOOLTIPS } from '@/domain/onboarding/types';
import {
    INJURY_LOCATIONS,
    PAIN_SEVERITY_OPTIONS,
} from '@/domain/onboarding/constants';

// =============================================================================
// CURRENT PAIN SCREEN
// =============================================================================

interface CurrentPainScreenProps {
    value: boolean | null;
    onChange: (value: boolean) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function CurrentPainScreen({
    value,
    onChange,
    onContinue,
    onBack
}: CurrentPainScreenProps) {
    useKeyboardNavigation({
        onEnter: value !== null ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            if (num === 1) onChange(false);
            if (num === 2) onChange(true);
        },
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="Any current pain that affects how you move?"
                tooltip={STEP_TOOLTIPS['current-pain']}
            />

            <OptionGrid>
                <OptionButton
                    label="No — feeling good"
                    shortcut="1"
                    selected={value === false}
                    onClick={() => onChange(false)}
                />
                <OptionButton
                    label="Yes — something's bothering me"
                    shortcut="2"
                    selected={value === true}
                    onClick={() => onChange(true)}
                />
            </OptionGrid>

            <ContinueButton
                onClick={onContinue}
                disabled={value === null}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// PAIN DETAILS SCREEN
// =============================================================================

interface PainDetailsScreenProps {
    data: OnboardingData;
    onLocationChange: (location: InjuryLocation) => void;
    onSeverityChange: (severity: PainSeverity) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function PainDetailsScreen({
    data,
    onLocationChange,
    onSeverityChange,
    onContinue,
    onBack
}: PainDetailsScreenProps) {
    const canContinue = data.painLocation !== null;
    const showSevereWarning = data.painSeverity === 'moderate' || data.painSeverity === 'severe';

    useKeyboardNavigation({
        onEnter: canContinue ? onContinue : undefined,
        onBack,
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="Tell us about the pain."
            />

            <div className="space-y-6">
                {/* Location */}
                <div>
                    <label className="v2-label block mb-2">What area is affected?</label>
                    <OptionGrid columns={2}>
                        {INJURY_LOCATIONS.map((location) => (
                            <OptionButton
                                key={location.value}
                                label={location.label}
                                selected={data.painLocation === location.value}
                                onClick={() => onLocationChange(location.value as InjuryLocation)}
                            />
                        ))}
                    </OptionGrid>
                </div>

                {/* Severity */}
                <div>
                    <label className="v2-label block mb-2">How bad is it?</label>
                    <OptionGrid>
                        {PAIN_SEVERITY_OPTIONS.map((option) => (
                            <OptionButton
                                key={option.value}
                                label={option.label}
                                description={option.description}
                                selected={data.painSeverity === option.value}
                                onClick={() => onSeverityChange(option.value as PainSeverity)}
                                warning={option.warning}
                            />
                        ))}
                    </OptionGrid>
                </div>
            </div>

            {showSevereWarning && (
                <WarningBanner title="Important">
                    If pain is moderate or severe, we strongly recommend seeing a physical therapist
                    before starting a training plan. We can build in prehab work, but we can&apos;t
                    diagnose or treat injuries.
                </WarningBanner>
            )}

            <ContinueButton
                onClick={onContinue}
                disabled={!canContinue}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// INJURY HISTORY SCREEN
// =============================================================================

interface InjuryHistoryScreenProps {
    value: boolean | null;
    onChange: (value: boolean) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function InjuryHistoryScreen({
    value,
    onChange,
    onContinue,
    onBack
}: InjuryHistoryScreenProps) {
    useKeyboardNavigation({
        onEnter: value !== null ? onContinue : undefined,
        onBack,
        onNumber: (num) => {
            if (num === 1) onChange(false);
            if (num === 2) onChange(true);
        },
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="Any injuries in the last 12 months that stopped you running for 2+ weeks?"
                tooltip={STEP_TOOLTIPS['injury-history']}
            />

            <OptionGrid>
                <OptionButton
                    label="No"
                    shortcut="1"
                    selected={value === false}
                    onClick={() => onChange(false)}
                />
                <OptionButton
                    label="Yes"
                    shortcut="2"
                    selected={value === true}
                    onClick={() => onChange(true)}
                />
            </OptionGrid>

            <ContinueButton
                onClick={onContinue}
                disabled={value === null}
            />
        </QuestionScreen>
    );
}

// =============================================================================
// INJURY DETAILS SCREEN
// =============================================================================

interface InjuryDetailsScreenProps {
    value: InjuryLocation | null;
    onChange: (location: InjuryLocation) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function InjuryDetailsScreen({
    value,
    onChange,
    onContinue,
    onBack
}: InjuryDetailsScreenProps) {
    useKeyboardNavigation({
        onEnter: value !== null ? onContinue : undefined,
        onBack,
    });

    const selectedPrehab = value ? INJURY_LOCATIONS.find(l => l.value === value)?.prehab : null;

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="What was injured?"
            />

            <OptionGrid columns={2}>
                {INJURY_LOCATIONS.map((location) => (
                    <OptionButton
                        key={location.value}
                        label={location.label}
                        selected={value === location.value}
                        onClick={() => onChange(location.value as InjuryLocation)}
                    />
                ))}
            </OptionGrid>

            {selectedPrehab && (
                <p className="v2-body-sm mt-6" style={{ color: 'var(--v2-text-muted)' }}>
                    We&apos;ll include targeted prehab work: <strong>{selectedPrehab}</strong>
                </p>
            )}

            <ContinueButton
                onClick={onContinue}
                disabled={value === null}
            />
        </QuestionScreen>
    );
}
