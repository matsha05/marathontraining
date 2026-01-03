'use client';

/**
 * THE LONG GAME - Onboarding UI Components
 * 
 * Typeform-style reusable components for the onboarding flow.
 */

import { ReactNode, useEffect, useCallback } from 'react';
import { ChevronLeft, Info, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoachTooltip } from '@/domain/onboarding/types';

// =============================================================================
// PROGRESS BAR
// =============================================================================

interface ProgressBarProps {
    progress: number; // 0-100
}

export function ProgressBar({ progress }: ProgressBarProps) {
    return (
        <div className="fixed top-0 left-0 right-0 h-1 bg-[var(--bg-elevated)] z-50">
            <motion.div
                className="h-full bg-[var(--color-accent)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            />
        </div>
    );
}

// =============================================================================
// QUESTION SCREEN WRAPPER
// =============================================================================

interface QuestionScreenProps {
    children: ReactNode;
    onBack?: () => void;
    showBack?: boolean;
    className?: string;
}

export function QuestionScreen({
    children,
    onBack,
    showBack = true,
    className = ''
}: QuestionScreenProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className={`min-h-screen landing-shell onboarding-shell flex flex-col items-center justify-center px-6 py-12 ${className}`}
        >
            <div className="w-full max-w-lg">
                {showBack && onBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-base)] mb-8 transition-colors group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-body-sm">Back</span>
                    </button>
                )}
                {children}
            </div>
        </motion.div>
    );
}

// =============================================================================
// QUESTION HEADER
// =============================================================================

interface QuestionHeaderProps {
    title: string;
    subtitle?: string;
    tooltip?: CoachTooltip;
}

export function QuestionHeader({ title, subtitle, tooltip }: QuestionHeaderProps) {
    return (
        <div className="mb-8">
            <h1 className="text-display-md mb-3">{title}</h1>
            {subtitle && (
                <p className="text-body-lg text-[var(--text-muted)]">{subtitle}</p>
            )}
            {tooltip && <TooltipExpander tooltip={tooltip} />}
        </div>
    );
}

// =============================================================================
// TOOLTIP EXPANDER
// =============================================================================

interface TooltipExpanderProps {
    tooltip: CoachTooltip;
}

export function TooltipExpander({ tooltip }: TooltipExpanderProps) {
    return (
        <details className="mt-4 group">
            <summary className="flex items-center gap-2 text-body-sm text-[var(--text-subtle)] cursor-pointer hover:text-[var(--text-muted)] transition-colors">
                <Info className="w-4 h-4" />
                <span>{tooltip.title}</span>
            </summary>
            <div className="mt-3 pl-6 text-body-sm text-[var(--text-muted)] leading-relaxed">
                <p>{tooltip.content}</p>
                {tooltip.coach && tooltip.coachLink && (
                    <a
                        href={tooltip.coachLink}
                        className="inline-flex items-center gap-1 mt-2 text-[var(--color-accent)] hover:underline"
                    >
                        Learn about {tooltip.coach}
                        <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>
        </details>
    );
}

// =============================================================================
// OPTION BUTTON
// =============================================================================

interface OptionButtonProps {
    label: string;
    description?: string;
    selected?: boolean;
    onClick: () => void;
    shortcut?: string;
    icon?: ReactNode;
    warning?: boolean;
    recommended?: boolean;
    disabled?: boolean;
}

export function OptionButton({
    label,
    description,
    selected,
    onClick,
    shortcut,
    icon,
    warning,
    recommended,
    disabled,
}: OptionButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                w-full p-4 rounded-xl border text-left transition-all
                ${selected
                    ? 'bg-[var(--color-accent)] text-[#04110b] border-transparent'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-base)]'
                }
                ${warning && !selected ? 'border-[var(--color-warning)]' : ''}
                ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-[var(--border-emphasis)]'}
            `}
        >
            <div className="flex items-start gap-3">
                {shortcut && (
                    <span className={`
                        flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-caption font-mono
                        ${selected
                            ? 'bg-black/20 text-[#04110b]'
                            : 'bg-[var(--bg-base)] text-[var(--text-muted)]'
                        }
                    `}>
                        {shortcut}
                    </span>
                )}
                {icon && (
                    <span className={`flex-shrink-0 ${selected ? 'text-black' : 'text-[var(--text-muted)]'}`}>
                        {icon}
                    </span>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-body-md font-medium">{label}</span>
                        {recommended && !selected && (
                            <span className="text-caption px-2 py-0.5 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)]">
                                Recommended
                            </span>
                        )}
                    </div>
                    {description && (
                        <p className={`text-body-sm mt-0.5 ${selected ? 'text-black/70' : 'text-[var(--text-subtle)]'}`}>
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </button>
    );
}

// =============================================================================
// OPTION GRID
// =============================================================================

interface OptionGridProps {
    children: ReactNode;
    columns?: 1 | 2 | 3 | 4;
}

export function OptionGrid({ children, columns = 1 }: OptionGridProps) {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-3',
        4: 'grid-cols-2 sm:grid-cols-4',
    };

    return (
        <div className={`grid ${gridCols[columns]} gap-3`}>
            {children}
        </div>
    );
}

// =============================================================================
// TEXT INPUT
// =============================================================================

interface TextInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'number' | 'date';
    autoFocus?: boolean;
    suffix?: string;
    min?: number;
    max?: number;
    step?: number;
    error?: string;
}

export function TextInput({
    value,
    onChange,
    placeholder,
    type = 'text',
    autoFocus,
    suffix,
    min,
    max,
    step,
    error,
}: TextInputProps) {
    return (
        <div>
            <div className="flex items-center gap-3">
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    min={min}
                    max={max}
                    step={step}
                    aria-invalid={Boolean(error)}
                    className="input text-xl flex-1"
                />
                {suffix && (
                    <span className="text-[var(--text-muted)] text-lg">{suffix}</span>
                )}
            </div>
            {error && (
                <p className="mt-2 text-body-sm text-[var(--color-error)]">{error}</p>
            )}
        </div>
    );
}

// =============================================================================
// TIME INPUT (MM:SS or H:MM:SS)
// =============================================================================

interface TimeInputProps {
    minutes: number | null;
    seconds: number | null;
    onMinutesChange: (value: number | null) => void;
    onSecondsChange: (value: number | null) => void;
    showHours?: boolean;
    hours?: number | null;
    onHoursChange?: (value: number | null) => void;
    error?: string;
}

export function TimeInput({
    minutes,
    seconds,
    onMinutesChange,
    onSecondsChange,
    showHours = false,
    hours,
    onHoursChange,
    error,
}: TimeInputProps) {
    return (
        <div>
            <div className="flex items-center gap-2">
                {showHours && onHoursChange && (
                    <>
                        <input
                            type="number"
                            value={hours ?? ''}
                            onChange={(e) => onHoursChange(e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="H"
                            min={0}
                            max={9}
                            className="input text-xl w-16 text-center"
                        />
                        <span className="text-2xl text-[var(--text-muted)]">:</span>
                    </>
                )}
                <input
                    type="number"
                    value={minutes ?? ''}
                    onChange={(e) => onMinutesChange(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="MM"
                    min={0}
                    max={59}
                    className="input text-xl w-20 text-center"
                />
                <span className="text-2xl text-[var(--text-muted)]">:</span>
                <input
                    type="number"
                    value={seconds ?? ''}
                    onChange={(e) => onSecondsChange(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="SS"
                    min={0}
                    max={59}
                    className="input text-xl w-20 text-center"
                />
            </div>
            {error && (
                <p className="mt-2 text-body-sm text-[var(--color-error)]">{error}</p>
            )}
        </div>
    );
}

// =============================================================================
// CONTINUE BUTTON
// =============================================================================

interface ContinueButtonProps {
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    label?: string;
}

export function ContinueButton({
    onClick,
    disabled,
    loading,
    label = 'Continue'
}: ContinueButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className="btn btn-gradient btn-lg w-full mt-8 disabled:opacity-40 disabled:cursor-not-allowed"
        >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading...</span>
                </span>
            ) : (
                <span className="flex items-center justify-center gap-2">
                    <span>{label}</span>
                    <span className="text-caption opacity-70">↵</span>
                </span>
            )}
        </button>
    );
}

// =============================================================================
// KEYBOARD HANDLER HOOK
// =============================================================================

interface UseKeyboardNavigationProps {
    onEnter?: () => void;
    onBack?: () => void;
    onNumber?: (num: number) => void;
    disabled?: boolean;
}

export function useKeyboardNavigation({
    onEnter,
    onBack,
    onNumber,
    disabled = false,
}: UseKeyboardNavigationProps) {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (disabled) return;

        // Don't intercept if user is typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            // Only handle Enter for form submission
            if (e.key === 'Enter' && onEnter) {
                e.preventDefault();
                onEnter();
            }
            return;
        }

        switch (e.key) {
            case 'Enter':
                if (onEnter) {
                    e.preventDefault();
                    onEnter();
                }
                break;
            case 'Backspace':
            case 'ArrowLeft':
                if (onBack) {
                    e.preventDefault();
                    onBack();
                }
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                if (onNumber) {
                    e.preventDefault();
                    onNumber(parseInt(e.key));
                }
                break;
        }
    }, [onEnter, onBack, onNumber, disabled]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

// =============================================================================
// COLLAPSIBLE INSTRUCTIONS
// =============================================================================

interface CollapsibleInstructionsProps {
    title: string;
    steps: string[];
    tips?: string[];
}

export function CollapsibleInstructions({ title, steps, tips }: CollapsibleInstructionsProps) {
    return (
        <details className="mt-6 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-base)]">
            <summary className="cursor-pointer font-medium text-[var(--text-base)] hover:text-[var(--color-accent)] transition-colors">
                {title}
            </summary>
            <div className="mt-4 space-y-4">
                <ol className="space-y-2">
                    {steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-body-sm text-[var(--text-muted)]">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center text-caption font-medium">
                                {i + 1}
                            </span>
                            <span>{step}</span>
                        </li>
                    ))}
                </ol>
                {tips && tips.length > 0 && (
                    <div className="pt-3 border-t border-[var(--border-base)]">
                        <p className="text-label mb-2">Tips</p>
                        <ul className="space-y-1">
                            {tips.map((tip, i) => (
                                <li key={i} className="text-body-sm text-[var(--text-muted)] flex items-start gap-2">
                                    <span className="text-[var(--color-accent)]">•</span>
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </details>
    );
}

// =============================================================================
// WARNING BANNER
// =============================================================================

interface WarningBannerProps {
    title: string;
    children: ReactNode;
}

export function WarningBanner({ title, children }: WarningBannerProps) {
    return (
        <div
            className="mt-6 p-4 rounded-xl border"
            style={{
                background: "color-mix(in srgb, var(--color-warning) 12%, transparent)",
                borderColor: "color-mix(in srgb, var(--color-warning) 30%, transparent)"
            }}
        >
            <p className="font-medium text-[var(--color-warning)] mb-1">{title}</p>
            <div className="text-body-sm text-[var(--text-muted)]">
                {children}
            </div>
        </div>
    );
}

// =============================================================================
// SUCCESS BANNER
// =============================================================================

interface SuccessBannerProps {
    title: string;
    children: ReactNode;
}

export function SuccessBanner({ title, children }: SuccessBannerProps) {
    return (
        <div
            className="mt-6 p-4 rounded-xl border"
            style={{
                background: "color-mix(in srgb, var(--color-success) 12%, transparent)",
                borderColor: "color-mix(in srgb, var(--color-success) 30%, transparent)"
            }}
        >
            <p className="font-medium text-[var(--color-success)] mb-1">{title}</p>
            <div className="text-body-sm text-[var(--text-muted)]">
                {children}
            </div>
        </div>
    );
}

// =============================================================================
// ANIMATED WRAPPER FOR SCREEN TRANSITIONS
// =============================================================================

interface ScreenTransitionProps {
    children: ReactNode;
    stepKey: string;
}

export function ScreenTransition({ children, stepKey }: ScreenTransitionProps) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={stepKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
