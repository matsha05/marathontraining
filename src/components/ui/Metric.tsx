"use client";

/**
 * Metric - Inline numeric data display primitive
 * 
 * V3 Design System
 * Uses centralized tokens from design-tokens.ts
 */

import { cn } from "@/lib/utils";
import { metricTokens, type MetricSize, type MetricColor } from "@/lib/design-tokens";

export interface MetricProps {
    /** The numeric value to display */
    value: string | number;
    /** Unit label (e.g., "/mi", "mi", "bpm") */
    unit?: string;
    /** Size variant */
    size?: MetricSize;
    /** Color variant */
    color?: MetricColor;
    /** Additional className */
    className?: string;
}

export function Metric({
    value,
    unit,
    size = "md",
    color = "default",
    className,
}: MetricProps) {
    const sizeConfig = metricTokens.sizes[size];
    const colorConfig = metricTokens.colors[color];

    return (
        <span
            className={cn(
                "inline-flex items-baseline font-mono tabular-nums",
                sizeConfig.gap,
                className
            )}
        >
            <span
                className={cn(sizeConfig.value, "font-semibold")}
                style={{ color: colorConfig.value }}
            >
                {value}
            </span>
            {unit && (
                <span
                    className={cn(sizeConfig.unit, "font-normal")}
                    style={{ color: colorConfig.unit }}
                >
                    {unit}
                </span>
            )}
        </span>
    );
}

export default Metric;
