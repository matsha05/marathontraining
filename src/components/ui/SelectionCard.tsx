"use client";

/**
 * SelectionCard - Reusable selection card for option lists
 * 
 * V2 Design System - Used for distance/equipment selection
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
        running: 'var(--v3-running)',
        strength: 'var(--v3-strength)',
        durability: 'var(--v3-durability)',
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
            className={`w-full ${sizeClasses[size]} rounded-xl text-left transition-all border`}
            style={{
                background: selected ? selectedColor : 'var(--bg-elevated)',
                borderColor: selected ? 'transparent' : 'var(--border-base)',
                color: selected ? '#000' : 'var(--text-muted)',
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
            }}
        >
            <div className="flex items-center gap-3">
                {icon && <span className="text-2xl flex-shrink-0">{icon}</span>}
                <div className="flex-1">
                    <p className="text-base font-medium">{label}</p>
                    {description && (
                        <p
                            className="text-sm"
                            style={{
                                color: selected ? 'rgba(0,0,0,0.7)' : 'var(--text-muted)'
                            }}
                        >
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
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    };

    return (
        <div className={`grid ${gridClasses[columns]} gap-3`}>
            {children}
        </div>
    );
}
