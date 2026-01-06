"use client";

/**
 * ProgressRing - Circular progress indicator
 * 
 * V3 Design System
 * Uses centralized tokens from design-tokens.ts
 */

import { cn } from "@/lib/utils";
import {
    progressRingTokens,
    type ProgressRingSize,
    type ProgressRingColor
} from "@/lib/design-tokens";

export interface ProgressRingProps {
    /** Progress percentage (0-100) */
    percent: number;
    /** Size of the ring in pixels */
    size?: ProgressRingSize;
    /** Ring stroke width - defaults to proportional based on size */
    strokeWidth?: number;
    /** Color variant */
    color?: ProgressRingColor;
    /** Show percentage label inside */
    showLabel?: boolean;
    /** Show checkmark when complete (100%) */
    showCheckOnComplete?: boolean;
    /** Optional custom label (overrides percentage and checkmark) */
    label?: string;
    /** Track color opacity (0-1) */
    trackOpacity?: number;
    /** Additional className for wrapper */
    className?: string;
}

export function ProgressRing({
    percent,
    size = 48,
    strokeWidth,
    color = "accent",
    showLabel = false,
    showCheckOnComplete = false,
    label,
    trackOpacity = progressRingTokens.defaultTrackOpacity,
    className,
}: ProgressRingProps) {
    const stroke = strokeWidth ?? progressRingTokens.strokeWidth[size];
    const checkSize = progressRingTokens.checkSize[size];
    const fontSize = progressRingTokens.fontSize[size];
    const strokeColor = progressRingTokens.colors[color];

    const center = size / 2;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedPercent = Math.min(100, Math.max(0, percent));
    const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

    const isComplete = clampedPercent >= 100;

    // Determine what to display in center
    const showCheck = isComplete && showCheckOnComplete && !label;
    const displayLabel = label ?? (showLabel && !showCheck ? `${Math.round(clampedPercent)}%` : null);

    return (
        <div
            className={cn("relative inline-flex items-center justify-center", className)}
            style={{ width: size, height: size }}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90"
            >
                {/* Background track */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={stroke}
                    opacity={trackOpacity}
                />

                {/* Progress arc */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-[stroke-dashoffset] duration-500 ease-out"
                />
            </svg>

            {/* Check icon for complete state */}
            {showCheck && (
                <svg
                    width={checkSize}
                    height={checkSize}
                    viewBox="0 0 24 24"
                    fill="none"
                    className="absolute"
                    strokeWidth={progressRingTokens.checkStrokeWidth}
                    style={{ color: strokeColor }}
                >
                    <path
                        d="M4 12l6 6L20 6"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}

            {/* Text label */}
            {displayLabel && (
                <span
                    className="absolute font-mono font-semibold tabular-nums"
                    style={{ fontSize, color: strokeColor }}
                >
                    {displayLabel}
                </span>
            )}
        </div>
    );
}

export default ProgressRing;
