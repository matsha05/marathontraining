/**
 * THE LONG GAME - Design Philosophy V2
 * 
 * Based on the "Week" landing page aesthetic.
 * Refined minimalism. Atmospheric depth. Light typography.
 * 
 * =============================================================================
 * CORE PHILOSOPHY: "Atmospheric Minimalism"
 * =============================================================================
 * 
 * We are a precision training instrument for serious athletes. Our design:
 * 
 * - DARK-FIRST: Near-black backgrounds with opacity-based text hierarchy
 * - LIGHT TYPOGRAPHY: Instrument Sans, light weight. No heavy display fonts.
 * - SUBTLE MOTION: Staggered reveals, not bouncy animations
 * - ATMOSPHERIC DEPTH: Radial glows, not drop shadows
 * 
 * This is NOT a generic fitness app aesthetic. It's refined, ethereal, premium.
 * 
 * =============================================================================
 * VISUAL IDENTITY
 * =============================================================================
 * 
 * TYPOGRAPHY
 * -----------
 * Font: Instrument Sans (light weight)
 * 
 * Why no display font? Heavy geometric fonts (Space Grotesk, etc.) break the
 * ethereal quality of the Week aesthetic. Light typography with opacity-based
 * hierarchy creates sophistication without shouting.
 * 
 * Headlines: font-weight 300, tracking tight
 * Body: font-weight 400
 * Labels: font-weight 400, uppercase, tracking widest
 * 
 * TYPE SCALE
 * - Hero: 72px (clamp for responsive)
 * - Heading LG: 48px
 * - Heading MD: 24px
 * - Heading SM: 18px
 * - Body: 16px
 * - Body SM: 14px
 * - Label: 10px (uppercase)
 * - Mono: 10px
 * 
 * COLOR SYSTEM
 * -------------
 * 
 * Backgrounds (Dark Mode Only):
 * - Deep: #08080a (page background)
 * - Elevated: rgba(255,255,255,0.02) (cards)
 * - Hover: rgba(255,255,255,0.04)
 * - Active: rgba(255,255,255,0.06)
 * 
 * Text (Opacity-Based on White):
 * - Primary: 90% opacity
 * - Secondary: 70% opacity
 * - Tertiary: 50% opacity
 * - Muted: 40% opacity
 * - Subtle: 30% opacity
 * - Ghost: 20% opacity
 * - Faint: 15% opacity
 * 
 * Accents:
 * - Primary: #19e38c (Volt Green)
 * - Secondary: #3a6bff (Strength Blue)
 * - Tertiary: #8b5cf6 (Durability Violet)
 * 
 * Borders:
 * - Default: rgba(255,255,255,0.05)
 * - Hover: rgba(255,255,255,0.1)
 * - Active: rgba(255,255,255,0.2)
 * 
 * =============================================================================
 * MOTION PRINCIPLES
 * =============================================================================
 * 
 * TIMING
 * -------
 * - Fast: 150ms (hover, micro-feedback)
 * - Base: 200ms (standard transitions)
 * - Slow: 300ms (page elements)
 * - Slower: 500ms (emphasis, staggered reveals)
 * 
 * EASING
 * -------
 * - Ease Out: cubic-bezier(0.25, 0.46, 0.45, 0.94)
 * - Ease In Out: cubic-bezier(0.4, 0, 0.2, 1)
 * 
 * STAGGERED REVEALS
 * ------------------
 * Hero elements fade in sequentially:
 * 1. Title (0ms)
 * 2. Subtitle (150-200ms)
 * 3. Grid/content (350-400ms)
 * 4. Individual items (staggered 50ms)
 * 5. CTA (last)
 * 
 * Use Framer Motion for orchestration.
 * 
 * ATMOSPHERIC EFFECTS
 * --------------------
 * - Radial glow behind hero content: rgba(25,227,140,0.04)
 * - Never use drop shadows. Use border opacity instead.
 * 
 * =============================================================================
 * ACCESSIBILITY
 * =============================================================================
 * 
 * - Focus rings: 2px offset with accent color
 * - Disabled: 0.4 opacity, not-allowed cursor
 * - Touch targets: 44px minimum
 * - WCAG AA contrast (all text ratios verified)
 */

// =============================================================================
// DESIGN TOKENS
// =============================================================================

export const COLORS = {
    // Page background
    bg: {
        deep: '#08080a',
        elevated: 'rgba(255, 255, 255, 0.02)',
        hover: 'rgba(255, 255, 255, 0.04)',
        active: 'rgba(255, 255, 255, 0.06)',
        section: 'rgba(255, 255, 255, 0.01)',
    },

    // Text (opacity-based on white)
    text: {
        primary: 'rgba(255, 255, 255, 0.9)',
        secondary: 'rgba(255, 255, 255, 0.7)',
        tertiary: 'rgba(255, 255, 255, 0.5)',
        muted: 'rgba(255, 255, 255, 0.4)',
        subtle: 'rgba(255, 255, 255, 0.3)',
        ghost: 'rgba(255, 255, 255, 0.2)',
        faint: 'rgba(255, 255, 255, 0.15)',
    },

    // Accents
    accent: {
        primary: '#19e38c',
        primaryMuted: 'rgba(25, 227, 140, 0.8)',
        primarySubtle: 'rgba(25, 227, 140, 0.1)',
        primaryGlow: 'rgba(25, 227, 140, 0.04)',
    },

    secondary: {
        primary: '#3a6bff',
        subtle: 'rgba(58, 107, 255, 0.1)',
    },

    // Training domains
    domain: {
        running: '#19e38c',
        strength: '#3a6bff',
        durability: '#8b5cf6',
    },

    // Semantic
    semantic: {
        success: '#19e38c',
        warning: '#f59e0b',
        error: '#ef4444',
    },

    // Borders
    border: {
        default: 'rgba(255, 255, 255, 0.05)',
        hover: 'rgba(255, 255, 255, 0.1)',
        active: 'rgba(255, 255, 255, 0.2)',
    },
} as const;

export const TYPOGRAPHY = {
    // Font families
    fontFamily: {
        sans: 'var(--font-instrument, "Instrument Sans"), system-ui, sans-serif',
        mono: 'var(--font-plex-mono, "IBM Plex Mono"), monospace',
    },

    // Font sizes
    fontSize: {
        xs: '0.625rem',    // 10px
        sm: '0.875rem',    // 14px
        base: '1rem',      // 16px
        lg: '1.125rem',    // 18px
        xl: '1.5rem',      // 24px
        '2xl': '2rem',     // 32px
        '3xl': '2.5rem',   // 40px
        '4xl': '3rem',     // 48px
        '5xl': '3.5rem',   // 56px
        hero: '4.5rem',    // 72px
    },

    // Letter spacing
    tracking: {
        tight: '-0.02em',
        wide: '0.05em',
        widest: '0.1em',
    },

    // Line height
    leading: {
        none: '1',
        tight: '1.15',
        snug: '1.35',
        normal: '1.5',
        relaxed: '1.65',
        loose: '2',
    },
} as const;

export const SPACING = {
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
} as const;

export const RADII = {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    full: '9999px',
} as const;

export const MOTION = {
    // Durations
    duration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
        slower: '500ms',
    },

    // Easing
    easing: {
        out: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },

    // Stagger delays for reveals
    stagger: {
        1: '0.05s',
        2: '0.1s',
        3: '0.15s',
        4: '0.2s',
        5: '0.25s',
        6: '0.3s',
        7: '0.35s',
    },
} as const;

export const Z_INDEX = {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
    toast: 80,
} as const;

export const SHADOWS = {
    sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
    // Atmospheric glow (use via CSS variable)
    glow: 'radial-gradient(800px circle at 50% 55%, rgba(25, 227, 140, 0.04), transparent 60%)',
} as const;

// =============================================================================
// COMPONENT HELPERS
// =============================================================================

/**
 * Get the CSS classes for a v2 button
 */
export function getButtonClasses(variant: 'primary' | 'secondary' | 'ghost', size?: 'sm' | 'lg'): string {
    const base = 'v2-btn';
    const variantClass = `v2-btn-${variant}`;
    const sizeClass = size ? `v2-btn-${size}` : '';
    return [base, variantClass, sizeClass].filter(Boolean).join(' ');
}

/**
 * Get the CSS classes for a v2 input
 */
export function getInputClasses(hasError?: boolean, hasSuccess?: boolean): string {
    const base = 'v2-input';
    if (hasError) return `${base} v2-input-error`;
    if (hasSuccess) return `${base} v2-input-success`;
    return base;
}

/**
 * Get the CSS classes for a domain-colored element
 */
export function getDomainClasses(domain: 'running' | 'strength' | 'durability'): string {
    return `v2-${domain}`;
}

/**
 * Get the CSS classes for a domain background
 */
export function getDomainBgClasses(domain: 'running' | 'strength' | 'durability'): string {
    return `v2-bg-${domain}`;
}
