"use client";

/**
 * Badge - Status labels and tags
 * 
 * V3 Design System
 * Uses centralized tokens from design-tokens.ts
 */

import { cn } from "@/lib/utils";
import React from "react";
import { badgeTokens, type BadgeSize, type BadgeVariant } from "@/lib/design-tokens";

export interface BadgeProps {
    /** Badge text content */
    children: React.ReactNode;
    /** Color variant */
    variant?: BadgeVariant;
    /** Size variant */
    size?: BadgeSize;
    /** Optional icon before text */
    icon?: React.ReactNode;
    /** Additional className */
    className?: string;
}

export function Badge({
    children,
    variant = "default",
    size = "md",
    icon,
    className,
}: BadgeProps) {
    const sizeConfig = badgeTokens.sizes[size];
    const variantConfig = badgeTokens.variants[variant];

    return (
        <span
            className={cn(
                "inline-flex items-center font-semibold rounded-full",
                sizeConfig.padding,
                sizeConfig.text,
                sizeConfig.gap,
                className
            )}
            style={{
                backgroundColor: variantConfig.bg,
                color: variantConfig.text,
            }}
        >
            {icon && (
                <span className={cn("flex-shrink-0", sizeConfig.iconSize)}>
                    {icon}
                </span>
            )}
            {children}
        </span>
    );
}

export default Badge;
