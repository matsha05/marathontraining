"use client";

/**
 * MetricCard - Consistent metric display component
 * 
 * Used for displaying stats with value, unit, label, and optional delta
 */

interface MetricCardProps {
    /** Main value to display */
    value: string | number;
    /** Unit label (e.g., "mi", "min", "%") */
    unit?: string;
    /** Descriptive label */
    label: string;
    /** Optional icon element */
    icon?: React.ReactNode;
    /** Optional delta/change indicator */
    delta?: {
        value: string;
        trend: 'up' | 'down' | 'neutral';
    };
    /** Card size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Animation delay for staggered animations */
    animationDelay?: number;
}

export function MetricCard({
    value,
    unit,
    label,
    icon,
    delta,
    size = 'md',
    animationDelay,
}: MetricCardProps) {
    const sizeClasses = {
        sm: { card: 'p-4', value: 'text-heading-lg', label: 'text-caption' },
        md: { card: 'p-5', value: 'text-display-md', label: 'text-caption' },
        lg: { card: 'p-6', value: 'text-display-lg', label: 'text-body-sm' },
    };

    const trendColors = {
        up: 'text-[var(--color-success)]',
        down: 'text-[var(--color-error)]',
        neutral: 'text-[var(--text-muted)]',
    };

    const trendIcons = {
        up: '↑',
        down: '↓',
        neutral: '→',
    };

    const { card, value: valueClass, label: labelClass } = sizeClasses[size];

    return (
        <div
            className={`card ${card} animate-fade-in`}
            style={animationDelay ? { animationDelay: `${animationDelay}ms` } : undefined}
        >
            {/* Header with icon and label */}
            <div className="flex items-center gap-2 mb-2">
                {icon && <span className="text-[var(--color-accent)]">{icon}</span>}
                <span className="text-label">{label}</span>
            </div>

            {/* Main value */}
            <div className="flex items-baseline gap-1">
                <p className={`${valueClass} text-data`}>{value}</p>
                {unit && <span className="text-body-sm text-[var(--text-muted)]">{unit}</span>}
            </div>

            {/* Optional delta */}
            {delta && (
                <p className={`text-caption mt-1 ${trendColors[delta.trend]}`}>
                    {trendIcons[delta.trend]} {delta.value}
                </p>
            )}
        </div>
    );
}

/**
 * MetricGrid - Grid container for metric cards
 */
export function MetricGrid({
    children,
    columns = 2,
}: {
    children: React.ReactNode;
    columns?: 2 | 3 | 4;
}) {
    const gridClasses = {
        2: 'grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-4',
    };

    return (
        <div className={`grid ${gridClasses[columns]} gap-4`}>
            {children}
        </div>
    );
}
