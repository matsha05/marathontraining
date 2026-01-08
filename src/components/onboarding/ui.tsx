'use client';

/**
 * THE LONG GAME - Onboarding UI Components V2
 * 
 * Typeform-style reusable components for the onboarding flow.
 * Week aesthetic: Dark, atmospheric, light typography
 */

import { ReactNode, useEffect, useCallback, useState, useId, useRef } from 'react';
import { ChevronLeft, ChevronDown, Info, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoachTooltip } from '@/domain/onboarding/types';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useHaptics } from '@/hooks/useHaptics';

// =============================================================================
// PROGRESS BAR
// =============================================================================

interface ProgressBarProps {
    progress: number; // 0-100
}

export function ProgressBar({ progress }: ProgressBarProps) {
    return (
        <div className="fixed top-0 left-0 right-0 h-1 z-50 safe-area-top" style={{ background: 'var(--bg-elevated)' }}>
            <motion.div
                className="h-full"
                style={{ background: 'var(--color-accent)' }}
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                mass: 0.8,
            }}
            className={`v3-root min-h-screen-safe flex flex-col items-center justify-center px-6 py-12 ${className}`}
        >
            <div className="w-full max-w-lg">
                {showBack && onBack && (
                    <motion.button
                        onClick={onBack}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-1 mb-8 transition-colors group touch-target-sm"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="v3-body-sm">Back</span>
                    </motion.button>
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
            <h1 className="v3-heading-lg mb-3">{title}</h1>
            {subtitle && (
                <p className="v3-body-md" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
            )}
            {tooltip && <TooltipExpander tooltip={tooltip} />}
        </div>
    );
}

// =============================================================================
// TOOLTIP - HOVER STYLE (not dropdown)
// =============================================================================

interface TooltipExpanderProps {
    tooltip: CoachTooltip;
}

export function TooltipExpander({ tooltip }: TooltipExpanderProps) {
    const tooltipId = useId();
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useIsMobile();
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isMobile) {
            setIsOpen(false);
        }
    }, [isMobile]);

    useEffect(() => {
        if (!isMobile || !isOpen) return;

        const handleOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [isMobile, isOpen]);

    const tooltipVisibility = isMobile
        ? (isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none')
        : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible';

    return (
        <div ref={wrapperRef} className="mt-4 relative group">
            {/* Trigger - info icon with label */}
            <button
                type="button"
                onClick={() => isMobile && setIsOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 v3-body-sm cursor-help p-2 rounded-lg transition-colors touch-target-sm"
                style={{ color: 'var(--text-subtle)' }}
                aria-expanded={isMobile ? isOpen : undefined}
                aria-controls={tooltipId}
            >
                <Info className="w-4 h-4" />
                <span>{tooltip.title}</span>
            </button>

            {/* Tooltip content - shown on hover */}
            <div
                id={tooltipId}
                role="tooltip"
                className={`absolute left-0 top-full mt-2 z-50 w-80 p-4 rounded-xl shadow-lg transition-all duration-200 ${tooltipVisibility}`}
                style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-emphasis)',
                    color: 'var(--text-muted)',
                }}
            >
                <p className="v3-body-sm leading-relaxed">{tooltip.content}</p>
                {tooltip.coach && tooltip.coachLink && (
                    <a
                        href={tooltip.coachLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-3 v3-accent hover:underline text-sm"
                    >
                        Learn about {tooltip.coach}
                        <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>
        </div>
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
    const { hapticTap } = useHaptics();

    const handleClick = () => {
        if (disabled) return;
        hapticTap();
        onClick();
    };

    return (
        <motion.button
            onClick={handleClick}
            disabled={disabled}
            whileHover={!disabled && !selected ? {
                scale: 1.02,
                transition: { type: 'spring', stiffness: 400, damping: 25 }
            } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            className="w-full p-4 rounded-xl text-left transition-all"
            style={{
                background: selected ? 'var(--color-accent)' : 'var(--bg-elevated)',
                border: selected
                    ? '2px solid var(--color-accent)'
                    : warning
                        ? '2px solid var(--color-warning)'
                        : '2px solid var(--border-emphasis)',
                color: selected ? 'white' : 'var(--text-base)',
                opacity: disabled ? 0.6 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                boxShadow: selected ? '0 4px 12px color-mix(in srgb, var(--color-accent) 40%, transparent)' : 'none',
            }}
        >
            <div className="flex items-start gap-3">
                {shortcut && (
                    <span
                        className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center v3-mono text-[11px]"
                        style={{
                            background: selected ? 'rgba(0,0,0,0.2)' : 'var(--v3-bg-base)',
                            color: selected ? 'var(--v3-bg-base)' : 'var(--text-muted)',
                        }}
                    >
                        {shortcut}
                    </span>
                )}
                {icon && (
                    <span style={{ color: selected ? 'var(--v3-bg-base)' : 'var(--text-muted)' }}>
                        {icon}
                    </span>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="v3-body-md" style={{ fontWeight: 500 }}>{label}</span>
                        {recommended && !selected && (
                            <span
                                className="v3-mono px-2 py-0.5 rounded-full text-[10px]"
                                style={{
                                    background: 'var(--color-accent-subtle)',
                                    color: 'var(--color-accent)'
                                }}
                            >
                                Recommended
                            </span>
                        )}
                    </div>
                    {description && (
                        <p
                            className="v3-body-sm mt-0.5"
                            style={{ color: selected ? 'rgba(0,0,0,0.7)' : 'var(--text-subtle)' }}
                        >
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </motion.button>
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
    autoComplete?: string;
    inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
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
    autoComplete,
    inputMode,
    suffix,
    min,
    max,
    step,
    error,
}: TextInputProps) {
    const resolvedInputMode = inputMode ?? (type === 'number' ? 'decimal' : undefined);

    return (
        <div>
            <div className="flex items-center gap-3">
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    autoComplete={autoComplete}
                    inputMode={resolvedInputMode}
                    min={min}
                    max={max}
                    step={step}
                    aria-invalid={Boolean(error)}
                    className="v3-input flex-1"
                    style={{ fontSize: '18px' }}
                />
                {suffix && (
                    <span className="v3-body-md" style={{ color: 'var(--text-muted)' }}>{suffix}</span>
                )}
            </div>
            {error && (
                <p className="mt-2 v3-body-sm" style={{ color: 'var(--v3-error)' }}>{error}</p>
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
                            inputMode="numeric"
                            value={hours ?? ''}
                            onChange={(e) => onHoursChange(e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="H"
                            min={0}
                            max={9}
                            className="v3-input w-16 text-center"
                            style={{ fontSize: '18px' }}
                        />
                        <span className="v3-heading-md" style={{ color: 'var(--text-muted)' }}>:</span>
                    </>
                )}
                <input
                    type="number"
                    inputMode="numeric"
                    value={minutes ?? ''}
                    onChange={(e) => onMinutesChange(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="MM"
                    min={0}
                    max={59}
                    className="v3-input w-20 text-center"
                    style={{ fontSize: '18px' }}
                />
                <span className="v3-heading-md" style={{ color: 'var(--text-muted)' }}>:</span>
                <input
                    type="number"
                    inputMode="numeric"
                    value={seconds ?? ''}
                    onChange={(e) => onSecondsChange(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="SS"
                    min={0}
                    max={59}
                    className="v3-input w-20 text-center"
                    style={{ fontSize: '18px' }}
                />
            </div>
            {error && (
                <p className="mt-2 v3-body-sm" style={{ color: 'var(--v3-error)' }}>{error}</p>
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
    const { hapticTap } = useHaptics();

    return (
        <button
            onClick={() => {
                if (!disabled && !loading) {
                    hapticTap();
                }
                onClick();
            }}
            disabled={disabled || loading}
            className="v3-btn v3-btn-primary v3-btn-lg w-full mt-8"
            style={{
                opacity: disabled ? 0.4 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
            }}
        >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading...</span>
                </span>
            ) : (
                <span className="flex items-center justify-center gap-2">
                    <span>{label}</span>
                    <span className="v3-mono text-[11px]" style={{ opacity: 0.7 }}>↵</span>
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
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    totalOptions?: number;           // For auto-wrapping with arrow keys
    selectedIndex?: number;          // Current selection for arrow navigation
    onSelectIndex?: (index: number) => void;  // Callback when arrow changes selection
    disabled?: boolean;
}

export function useKeyboardNavigation({
    onEnter,
    onBack,
    onNumber,
    onArrowUp,
    onArrowDown,
    totalOptions,
    selectedIndex,
    onSelectIndex,
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
            case 'ArrowRight':
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
            case 'ArrowUp':
                e.preventDefault();
                if (onArrowUp) {
                    onArrowUp();
                } else if (totalOptions !== undefined && selectedIndex !== undefined && onSelectIndex) {
                    // Auto-wrap navigation
                    const newIndex = selectedIndex <= 0 ? totalOptions - 1 : selectedIndex - 1;
                    onSelectIndex(newIndex);
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (onArrowDown) {
                    onArrowDown();
                } else if (totalOptions !== undefined && selectedIndex !== undefined && onSelectIndex) {
                    // Auto-wrap navigation
                    const newIndex = selectedIndex >= totalOptions - 1 ? 0 : selectedIndex + 1;
                    onSelectIndex(newIndex);
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
                    onNumber(parseInt(e.key, 10));
                }
                break;
        }
    }, [onEnter, onBack, onNumber, onArrowUp, onArrowDown, totalOptions, selectedIndex, onSelectIndex, disabled]);

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
        <details
            className="mt-6 rounded-xl v3-card group"
        >
            <summary
                className="p-4 cursor-pointer flex items-center justify-between transition-colors"
                style={{ color: 'var(--text-base)' }}
            >
                <span className="v3-body font-medium">{title}</span>
                <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" style={{ color: 'var(--text-subtle)' }} />
            </summary>
            <div className="px-4 pb-4 space-y-4">
                <ol className="space-y-2">
                    {steps.map((step, i) => (
                        <li key={i} className="flex gap-3 v3-body-sm" style={{ color: 'var(--text-muted)' }}>
                            <span
                                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center v3-mono text-[10px]"
                                style={{
                                    background: 'var(--color-accent-subtle)',
                                    color: 'var(--color-accent)',
                                    fontWeight: 500,
                                }}
                            >
                                {i + 1}
                            </span>
                            <span>{step}</span>
                        </li>
                    ))}
                </ol>
                {tips && tips.length > 0 && (
                    <div className="pt-3" style={{ borderTop: '1px solid var(--border-base)' }}>
                        <p className="v3-label mb-2">Tips</p>
                        <ul className="space-y-1">
                            {tips.map((tip, i) => (
                                <li key={i} className="v3-body-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                                    <span className="v3-accent">•</span>
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
                background: "var(--v3-warning-subtle)",
                borderColor: "var(--v3-warning)",
            }}
        >
            <p className="v3-heading-sm mb-1" style={{ color: 'var(--v3-warning)' }}>{title}</p>
            <div className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>
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
                background: "var(--v3-success-subtle)",
                borderColor: "var(--v3-success)",
            }}
        >
            <p className="v3-heading-sm mb-1" style={{ color: 'var(--v3-success)' }}>{title}</p>
            <div className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8,
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
