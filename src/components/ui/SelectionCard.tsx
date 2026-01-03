"use client";

/**
 * SelectionCard - Reusable selection card for option lists
 * 
 * Used for distance/equipment selection in onboarding and settings
 * Supports selected, hover, and disabled states
 */

interface SelectionCardProps {
    /** Whether this card is currently selected */
    selected: boolean;
    /** Called when card is clicked */
    onSelect: () => void;
    /** Primary label text */
    label: string;
    /** Optional secondary description */
    description?: string;
    /** Optional icon (emoji or component) */
    icon?: React.ReactNode;
    /** Disable selection */
    disabled?: boolean;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Domain color for selected state */
    domain?: 'running' | 'strength' | 'durability' | 'accent';
}

export function SelectionCard({
    selected,
    onSelect,
    label,
    description,
    icon,
    disabled = false,
    size = 'md',
    domain = 'accent',
}: SelectionCardProps) {
    const domainColors = {
        running: 'var(--color-running)',
        strength: 'var(--color-strength)',
        durability: 'var(--color-durability)',
        accent: 'var(--color-accent)',
    };

    const sizeClasses = {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-5',
    };

    const selectedColor = domainColors[domain];

    return (
        <button
            type="button"
            onClick={() => !disabled && onSelect()}
            disabled={disabled}
            className={`
        w-full ${sizeClasses[size]} rounded-xl text-left 
        transition-all border tap-target
        ${selected
                    ? 'border-transparent'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-base)] hover:border-[var(--border-emphasis)]'
                }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]
      `}
            style={selected ? { backgroundColor: selectedColor, color: '#000' } : undefined}
        >
            <div className="flex items-center gap-3">
                {icon && <span className="text-2xl flex-shrink-0">{icon}</span>}
                <div className="flex-1">
                    <p className={`text-heading-sm ${selected ? '' : ''}`}>{label}</p>
                    {description && (
                        <p className={`text-body-sm ${selected ? 'opacity-70' : 'text-[var(--text-muted)]'}`}>
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </button>
    );
}

/**
 * SelectionGrid - Grid container for selection cards
 */
export function SelectionGrid({
    children,
    columns = 1,
}: {
    children: React.ReactNode;
    columns?: 1 | 2 | 3 | 4;
}) {
    const gridClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
    };

    return (
        <div className={`grid ${gridClasses[columns]} gap-3`}>
            {children}
        </div>
    );
}
