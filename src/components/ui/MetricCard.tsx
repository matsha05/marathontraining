"use client";

/**
 * MetricCard - Consistent metric display component
 * 
 * V2 Design System - Used for displaying stats with value, unit, label, and optional delta
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
    const sizeStyles = {
        sm: { card: 'p-4', valueSize: 'text-lg', labelSize: 'text-[10px]' },
        md: { card: 'p-5', valueSize: 'text-2xl', labelSize: 'text-[10px]' },
        lg: { card: 'p-6', valueSize: 'text-3xl', labelSize: 'text-sm' },
    };

    const trendColors = {
        up: 'var(--v2-success)',
        down: 'var(--v2-error)',
        neutral: 'var(--v2-text-muted)',
    };

    const trendIcons = {
        up: '↑',
        down: '↓',
        neutral: '→',
    };

    const { card, valueSize, labelSize } = sizeStyles[size];

    return (
        <div
            className={`v2-card ${card}`}
            style={animationDelay ? { animationDelay: `${animationDelay}ms` } : undefined}
        >
            {/* Header with icon and label */}
            <div className="flex items-center gap-2 mb-2">
                {icon && <span style={{ color: 'var(--v2-accent)' }}>{icon}</span>}
                <span className="v2-label">{label}</span>
            </div>

            {/* Main value */}
            <div className="flex items-baseline gap-1">
                <p className={`${valueSize} font-mono`} style={{ color: 'var(--v2-accent)' }}>{value}</p>
                {unit && <span className="text-sm" style={{ color: 'var(--v2-text-muted)' }}>{unit}</span>}
            </div>

            {/* Optional delta */}
            {delta && (
                <p className={`${labelSize} mt-1`} style={{ color: trendColors[delta.trend] }}>
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
