"use client";

/**
 * StatCard - Compact stat display with icon
 * 
 * V3 Design System
 * Uses centralized tokens from design-tokens.ts
 */

import { cn } from "@/lib/utils";
import React from "react";
import { Metric } from "./Metric";
import { statCardTokens, colors, type StatCardSize, type MetricColor } from "@/lib/design-tokens";

export interface StatCardProps {
    /** Main value to display */
    value: string | number;
    /** Unit label (e.g., "mi", "min") */
    unit?: string;
    /** Descriptive label */
    label: string;
    /** Optional icon */
    icon?: React.ReactNode;
    /** Size variant */
    size?: StatCardSize;
    /** Color variant for value */
    color?: MetricColor;
    /** Optional trend indicator */
    trend?: {
        value: string;
        direction: "up" | "down" | "neutral";
    };
    /** Additional className */
    className?: string;
}

export function StatCard({
    value,
    unit,
    label,
    icon,
    size = "md",
    color = "default",
    trend,
    className,
}: StatCardProps) {
    const sizeConfig = statCardTokens.sizes[size];
    const cardConfig = statCardTokens.card;

    return (
        <div
            className={cn(cardConfig.radius, sizeConfig.padding, className)}
            style={{
                backgroundColor: cardConfig.bg,
                border: `1px solid ${cardConfig.border}`,
            }}
        >
            {/* Header with icon and label */}
            <div className="flex items-center gap-2 mb-2">
                {icon && (
                    <span
                        className={cn("flex-shrink-0", sizeConfig.iconSize)}
                        style={{ color: colors.accent }}
                    >
                        {icon}
                    </span>
                )}
                <span
                    className={cn("font-semibold uppercase tracking-wider", sizeConfig.labelSize)}
                    style={{ color: colors.text.subtle }}
                >
                    {label}
                </span>
            </div>

            {/* Value row */}
            <div className="flex items-baseline gap-2">
                <Metric value={value} unit={unit} size={sizeConfig.metricSize} color={color} />

                {trend && (
                    <span
                        className="text-xs font-medium"
                        style={{ color: statCardTokens.trend[trend.direction].color }}
                    >
                        {statCardTokens.trend[trend.direction].icon} {trend.value}
                    </span>
                )}
            </div>
        </div>
    );
}

export default StatCard;
