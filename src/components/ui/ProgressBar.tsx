"use client";

/**
 * ProgressBar - Linear progress indicator
 * 
 * V3 Design System
 * Uses centralized tokens from design-tokens.ts
 */

import { cn } from "@/lib/utils";
import {
    progressBarTokens,
    type ProgressBarSize,
    type ProgressBarColor
} from "@/lib/design-tokens";

export interface ProgressBarProps {
    /** Progress percentage (0-100) */
    percent: number;
    /** Size variant */
    size?: ProgressBarSize;
    /** Color variant */
    color?: ProgressBarColor;
    /** Show percentage label on the right */
    showLabel?: boolean;
    /** Optional label text on the left */
    label?: string;
    /** Animate the progress change */
    animated?: boolean;
    /** Additional className */
    className?: string;
}

export function ProgressBar({
    percent,
    size = "md",
    color = "accent",
    showLabel = false,
    label,
    animated = true,
    className,
}: ProgressBarProps) {
    const sizeConfig = progressBarTokens.sizes[size];
    const fillColor = progressBarTokens.colors[color];
    const trackColor = progressBarTokens.track;

    const clampedPercent = Math.min(100, Math.max(0, percent));
    const hasLabelRow = showLabel || label;

    return (
        <div className={cn("w-full", className)}>
            {/* Label row */}
            {hasLabelRow && (
                <div className="flex items-center justify-between mb-2">
                    <span
                        className={cn(sizeConfig.labelSize, "font-medium")}
                        style={{ color: "var(--text-muted)" }}
                    >
                        {label || ""}
                    </span>
                    {showLabel && (
                        <span
                            className={cn(sizeConfig.labelSize, "font-mono font-semibold tabular-nums")}
                            style={{ color: fillColor }}
                        >
                            {Math.round(clampedPercent)}%
                        </span>
                    )}
                </div>
            )}

            {/* Progress track */}
            <div
                className={cn("w-full rounded-full overflow-hidden", sizeConfig.height)}
                style={{ backgroundColor: trackColor }}
            >
                {/* Progress fill */}
                <div
                    className={cn(
                        "h-full rounded-full",
                        animated && "transition-all duration-500 ease-out"
                    )}
                    style={{
                        width: `${clampedPercent}%`,
                        backgroundColor: fillColor,
                    }}
                />
            </div>
        </div>
    );
}

export default ProgressBar;
