"use client";

/**
 * Section - Container with title and consistent spacing
 * 
 * V3 Design System
 * Uses centralized tokens from design-tokens.ts
 */

import { cn } from "@/lib/utils";
import React from "react";
import { sectionTokens, type SectionSpacing } from "@/lib/design-tokens";

export interface SectionProps {
    /** Section title */
    title?: string;
    /** Uppercase label above title */
    label?: string;
    /** Optional action element (e.g., button) positioned top-right */
    action?: React.ReactNode;
    /** Section spacing variant */
    spacing?: SectionSpacing;
    /** Show divider above section */
    divider?: boolean;
    /** Additional className for section wrapper */
    className?: string;
    /** Section content */
    children: React.ReactNode;
}

export function Section({
    title,
    label,
    action,
    spacing = "default",
    divider = false,
    className,
    children,
}: SectionProps) {
    const spacingConfig = sectionTokens.spacing[spacing];
    const hasHeader = title || label || action;

    return (
        <section
            className={cn(spacingConfig.section, className)}
            style={divider ? { borderTop: `1px solid ${sectionTokens.divider}` } : undefined}
        >
            {/* Section header */}
            {hasHeader && (
                <div className={cn("flex items-start justify-between", spacingConfig.titleMargin)}>
                    <div>
                        {label && (
                            <span
                                className={cn(
                                    "block mb-2",
                                    sectionTokens.label.size,
                                    sectionTokens.label.weight,
                                    "uppercase tracking-widest"
                                )}
                                style={{ color: sectionTokens.label.color }}
                            >
                                {label}
                            </span>
                        )}
                        {title && (
                            <h2
                                className={cn(sectionTokens.title.size, sectionTokens.title.weight)}
                                style={{ color: sectionTokens.title.color }}
                            >
                                {title}
                            </h2>
                        )}
                    </div>
                    {action && <div className="flex-shrink-0">{action}</div>}
                </div>
            )}

            {/* Section content */}
            <div className={cn("flex flex-col", spacingConfig.gap)}>
                {children}
            </div>
        </section>
    );
}

export default Section;
