/**
 * V3 Design System Tokens
 * 
 * The single source of truth for all design tokens.
 * Components import from here - never define magic numbers inline.
 * 
 * This file defines:
 * - CSS variable references (for theme-aware colors)
 * - Size scales (spacing, typography, icons)
 * - Component-specific token mappings
 */

// =============================================================================
// CSS VARIABLE REFERENCES
// These reference the CSS custom properties defined in globals.css
// They change automatically when the `dark` class is toggled
// =============================================================================

export const colors = {
    // Semantic text colors
    text: {
        base: "var(--text-base)",
        muted: "var(--text-muted)",
        subtle: "var(--text-subtle)",
    },

    // Background colors
    bg: {
        base: "var(--bg-base)",
        elevated: "var(--bg-elevated)",
        muted: "var(--bg-muted)",
        subtle: "var(--bg-subtle)",
        inset: "var(--bg-inset)",
    },

    // Border colors
    border: {
        base: "var(--border-base)",
        muted: "var(--border-muted)",
        emphasis: "var(--border-emphasis)",
    },

    // Status/accent colors
    accent: "var(--color-accent)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    error: "var(--color-error)",
    info: "var(--color-info)",

    // Domain colors
    domain: {
        running: "var(--color-running)",
        strength: "var(--color-strength)",
        durability: "var(--color-durability)",
    },

    // Domain tints (translucent backgrounds)
    domainTint: {
        running: "var(--domain-running-tint)",
        strength: "var(--domain-strength-tint)",
        durability: "var(--domain-durability-tint)",
    },
} as const;

// =============================================================================
// SPACING SCALE
// Based on 4px base unit - matches Tailwind's default scale
// =============================================================================

export const spacing = {
    px: "1px",
    0: "0",
    0.5: "2px",
    1: "4px",
    1.5: "6px",
    2: "8px",
    2.5: "10px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
} as const;

// =============================================================================
// TYPOGRAPHY SCALE
// Semantic size names with corresponding Tailwind classes
// =============================================================================

export const typography = {
    size: {
        xs: "text-xs",       // 12px
        sm: "text-sm",       // 14px
        base: "text-base",   // 16px
        lg: "text-lg",       // 18px
        xl: "text-xl",       // 20px
        "2xl": "text-2xl",   // 24px
        "3xl": "text-3xl",   // 30px
        "4xl": "text-4xl",   // 36px
    },
    weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
    },
    family: {
        sans: "font-sans",
        mono: "font-mono",
        display: "font-display",
    },
} as const;

// =============================================================================
// RADIUS SCALE
// =============================================================================

export const radius = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
} as const;

// =============================================================================
// COMPONENT TOKEN MAPPINGS
// Specific configurations for each V3 component
// =============================================================================

/**
 * Metric component tokens
 */
export const metricTokens = {
    sizes: {
        sm: {
            value: typography.size.sm,
            unit: "text-[10px]",
            gap: "gap-0.5",
        },
        md: {
            value: typography.size.lg,
            unit: typography.size.xs,
            gap: "gap-1",
        },
        lg: {
            value: typography.size["2xl"],
            unit: typography.size.sm,
            gap: "gap-1",
        },
        xl: {
            value: typography.size["4xl"],
            unit: typography.size.base,
            gap: "gap-1.5",
        },
    },
    colors: {
        default: { value: colors.text.base, unit: colors.text.muted },
        accent: { value: colors.accent, unit: colors.text.muted },
        muted: { value: colors.text.muted, unit: colors.text.subtle },
        success: { value: colors.success, unit: colors.text.muted },
        warning: { value: colors.warning, unit: colors.text.muted },
        error: { value: colors.error, unit: colors.text.muted },
    },
} as const;

/**
 * Badge component tokens
 */
export const badgeTokens = {
    sizes: {
        sm: {
            padding: "px-2 py-0.5",
            text: "text-[10px]",
            iconSize: "w-3 h-3",
            gap: "gap-1",
        },
        md: {
            padding: "px-2.5 py-1",
            text: typography.size.xs,
            iconSize: "w-3.5 h-3.5",
            gap: "gap-1.5",
        },
        lg: {
            padding: "px-3 py-1.5",
            text: typography.size.sm,
            iconSize: "w-4 h-4",
            gap: "gap-2",
        },
    },
    variants: {
        default: { bg: colors.bg.muted, text: colors.text.muted },
        accent: { bg: `color-mix(in srgb, ${colors.accent} 15%, transparent)`, text: colors.accent },
        success: { bg: `color-mix(in srgb, ${colors.success} 15%, transparent)`, text: colors.success },
        warning: { bg: `color-mix(in srgb, ${colors.warning} 15%, transparent)`, text: colors.warning },
        error: { bg: `color-mix(in srgb, ${colors.error} 15%, transparent)`, text: colors.error },
        running: { bg: colors.domainTint.running, text: colors.domain.running },
        strength: { bg: colors.domainTint.strength, text: colors.domain.strength },
        durability: { bg: colors.domainTint.durability, text: colors.domain.durability },
    },
} as const;

/**
 * ProgressRing component tokens
 * Proportional sizing based on ring diameter
 */
export const progressRingTokens = {
    // Size → stroke width (maintains ~12-15% of diameter ratio)
    strokeWidth: {
        32: 4,
        40: 5,
        48: 6,
        56: 7,
        64: 8,
        80: 10,
    } as Record<number, number>,

    // Size → checkmark icon size (substantial and visible)
    checkSize: {
        32: 16,
        40: 20,
        48: 24,
        56: 28,
        64: 32,
        80: 40,
    } as Record<number, number>,

    // Size → font size for percentage labels
    fontSize: {
        32: 10,
        40: 11,
        48: 12,
        56: 14,
        64: 16,
        80: 18,
    } as Record<number, number>,

    // Checkmark stroke width (bold for visibility)
    checkStrokeWidth: 3,

    // Track opacity (translucent background ring)
    defaultTrackOpacity: 0.15,

    colors: {
        accent: colors.accent,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        muted: colors.text.subtle,
    },
} as const;

/**
 * ProgressBar component tokens
 */
export const progressBarTokens = {
    sizes: {
        sm: { height: "h-1.5", labelSize: "text-[11px]" },
        md: { height: "h-2", labelSize: typography.size.xs },
        lg: { height: "h-3", labelSize: typography.size.sm },
    },
    colors: {
        accent: colors.accent,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        muted: colors.text.subtle,
    },
    track: colors.bg.muted,
} as const;

/**
 * StatCard component tokens
 */
export const statCardTokens = {
    sizes: {
        sm: {
            padding: "p-3",
            metricSize: "sm" as const,
            labelSize: "text-[10px]",
            iconSize: "w-4 h-4",
        },
        md: {
            padding: "p-4",
            metricSize: "md" as const,
            labelSize: "text-[11px]",
            iconSize: "w-5 h-5",
        },
        lg: {
            padding: "p-5",
            metricSize: "lg" as const,
            labelSize: typography.size.xs,
            iconSize: "w-6 h-6",
        },
    },
    card: {
        bg: colors.bg.elevated,
        border: colors.border.base,
        radius: radius.xl,
    },
    trend: {
        up: { icon: "↑", color: colors.success },
        down: { icon: "↓", color: colors.error },
        neutral: { icon: "→", color: colors.text.muted },
    },
} as const;

/**
 * StepIndicator component tokens
 */
export const stepIndicatorTokens = {
    sizes: {
        sm: { height: "h-1", gap: "gap-1", numberSize: "text-[11px]" },
        md: { height: "h-1.5", gap: "gap-1.5", numberSize: typography.size.xs },
        lg: { height: "h-2", gap: "gap-2", numberSize: typography.size.sm },
    },
    active: colors.accent,
    inactive: colors.bg.muted,
    completedOpacity: 0.6,
} as const;

/**
 * Section component tokens
 */
export const sectionTokens = {
    spacing: {
        compact: { section: "py-6", gap: "gap-4", titleMargin: "mb-4" },
        default: { section: "py-8", gap: "gap-6", titleMargin: "mb-6" },
        spacious: { section: "py-12", gap: "gap-8", titleMargin: "mb-8" },
    },
    label: {
        size: "text-[11px]",
        weight: typography.weight.semibold,
        color: colors.text.subtle,
    },
    title: {
        size: typography.size.xl,
        weight: typography.weight.semibold,
        color: colors.text.base,
    },
    divider: colors.border.base,
} as const;

// =============================================================================
// TYPE EXPORTS
// For TypeScript consumers
// =============================================================================

export type MetricSize = keyof typeof metricTokens.sizes;
export type MetricColor = keyof typeof metricTokens.colors;
export type BadgeSize = keyof typeof badgeTokens.sizes;
export type BadgeVariant = keyof typeof badgeTokens.variants;
export type ProgressRingSize = keyof typeof progressRingTokens.strokeWidth;
export type ProgressRingColor = keyof typeof progressRingTokens.colors;
export type ProgressBarSize = keyof typeof progressBarTokens.sizes;
export type ProgressBarColor = keyof typeof progressBarTokens.colors;
export type StatCardSize = keyof typeof statCardTokens.sizes;
export type StepIndicatorSize = keyof typeof stepIndicatorTokens.sizes;
export type SectionSpacing = keyof typeof sectionTokens.spacing;
