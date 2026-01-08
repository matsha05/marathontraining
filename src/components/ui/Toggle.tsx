"use client";

import { useId } from 'react';

/**
 * Toggle - Accessible toggle switch component
 * 
 * V2 Design System - Follows accessibility best practices
 */

interface ToggleProps {
    /** Whether the toggle is on */
    checked: boolean;
    /** Called when toggle state changes */
    onChange: (checked: boolean) => void;
    /** Optional label text */
    label?: string;
    /** Optional description below label */
    description?: string;
    /** Disable the toggle */
    disabled?: boolean;
    /** Size variant */
    size?: 'sm' | 'md';
}

export function Toggle({
    checked,
    onChange,
    label,
    description,
    disabled = false,
    size = 'md',
}: ToggleProps) {
    const id = useId();

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) {
                onChange(!checked);
            }
        }
    };

    const dimensions = {
        sm: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
        md: { track: 'w-14 h-8', thumb: 'w-6 h-6', translate: 'translate-x-7' },
    };

    const { track, thumb, translate } = dimensions[size];

    return (
        <div className="flex items-center justify-between">
            {(label || description) && (
                <div className="flex-1">
                    {label && (
                        <label
                            htmlFor={id}
                            className="font-medium cursor-pointer"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            {label}
                        </label>
                    )}
                    {description && (
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{description}</p>
                    )}
                </div>
            )}

            <button
                id={id}
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                onKeyDown={handleKeyDown}
                className={`
                    relative inline-flex items-center flex-shrink-0 ${track} 
                    rounded-full transition-colors cursor-pointer
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                `}
                style={{
                    background: checked ? 'var(--color-accent)' : 'var(--bg-elevated)',
                    opacity: disabled ? 0.5 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                }}
            >
                <span
                    className={`
                        block ${thumb} rounded-full bg-white shadow 
                        transition-transform ${checked ? translate : 'translate-x-1'}
                    `}
                />
            </button>
        </div>
    );
}
