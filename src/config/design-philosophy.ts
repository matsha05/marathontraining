/**
 * THE LONG GAME - Design Philosophy
 * 
 * This document defines the design principles, aesthetic direction,
 * and intentional decisions behind every pixel of the app.
 * 
 * =============================================================================
 * CORE PHILOSOPHY: "Athletic Precision"
 * =============================================================================
 * 
 * We are not a generic fitness app. We are a precision training instrument
 * for serious athletes who demand evidence-based coaching. Every visual
 * decision reflects this identity.
 * 
 * Key attributes:
 * - DATA-FORWARD: Information density matters. Athletes want to see their numbers.
 * - ATHLETIC: Bold, confident, performance-focused. Not soft or playful.
 * - TECH-PREMIUM: Clean lines, purposeful negative space, subtle depth.
 * - SCIENTIFIC: The methodology is visible. We show our work.
 * 
 * =============================================================================
 * VISUAL IDENTITY
 * =============================================================================
 * 
 * TYPOGRAPHY
 * -----------
 * Display: Space Grotesk - Athletic, geometric, highly legible
 * Body: Instrument Sans - Refined, neutral, high readability
 * - Headlines: Semibold/Bold, tight tracking (-0.025em to -0.03em)
 * - Large numbers: Bold, tighter tracking for data display
 * 
 * Serif Accent: Georgia/ui-serif - Editorial authority for key statements
 * - Used sparingly for hero headlines and methodology sections
 * - Adds gravitas without being Old World
 * 
 * Mono: IBM Plex Mono / SF Mono - Technical data, pace displays
 * - Paces, times, distances in monospace for alignment and precision feel
 * 
 * TYPE SCALE (8px base, 1.25 ratio)
 * - xs: 12px / 16px
 * - sm: 14px / 20px
 * - base: 16px / 24px
 * - lg: 18px / 28px
 * - xl: 20px / 28px
 * - 2xl: 24px / 32px
 * - 3xl: 32px / 40px
 * - 4xl: 40px / 48px
 * - 5xl: 48px / 56px
 * - 6xl: 64px / 72px
 * - 7xl: 80px / 88px
 * 
 * COLOR SYSTEM
 * -------------
 * 
 * Background Palette (Dark Mode - Primary):
 * - bg-primary: #0b0f14 (near-black, athletic)
 * - bg-secondary: #121820 (cards, elevated surfaces)
 * - bg-tertiary: #1a222d (inputs, subtle distinction)
 * 
 * Background Palette (Light Mode):
 * - bg-primary: #f7f8fa (cool white)
 * - bg-secondary: #ffffff (cards)
 * - bg-tertiary: #f1f4f7 (inputs)
 * 
 * Text Palette:
 * - text-primary: #f1f5f9/#0d1117 (high contrast)
 * - text-secondary: #b0b9c5/#5a6676 (supporting text)
 * - text-muted: #7d8794/#8b95a5 (tertiary, labels)
 * 
 * Accent Colors (Training Domains):
 * - Running: #19e38c (volt green) - Forward momentum, go
 * - Strength: #3a6bff (strength blue) - Stability, power
 * - Durability: #7a5cff (durability violet) - Flexibility, recovery
 * 
 * Semantic Colors:
 * - success: #19e38c (green)
 * - warning: #f4b740 (amber)
 * - error: #e5484d (red)
 * - info: #3a6bff (blue)
 * 
 * SPACING SYSTEM (8px grid)
 * --------------------------
 * - 1: 4px (micro adjustments)
 * - 2: 8px
 * - 3: 12px
 * - 4: 16px
 * - 5: 20px
 * - 6: 24px
 * - 8: 32px
 * - 10: 40px
 * - 12: 48px
 * - 16: 64px
 * - 20: 80px
 * - 24: 96px
 * 
 * BORDER RADIUS
 * --------------
 * - sm: 6px (small elements, badges)
 * - md: 8px (buttons, small cards)
 * - lg: 12px (cards, inputs)
 * - xl: 16px (large cards)
 * - 2xl: 24px (hero cards, modals)
 * - full: 9999px (pills, avatars)
 * 
 * SHADOWS (subtle, purposeful)
 * -----------------------------
 * - sm: 0 1px 2px rgba(0,0,0,0.05)
 * - md: 0 4px 6px rgba(0,0,0,0.05)
 * - lg: 0 10px 15px rgba(0,0,0,0.1)
 * - xl: 0 20px 25px rgba(0,0,0,0.1)
 * 
 * Dark mode uses even subtler shadows with rgba(0,0,0,0.3)
 * 
 * =============================================================================
 * COMPONENT PRINCIPLES
 * =============================================================================
 * 
 * CARDS
 * ------
 * - Rounded-2xl (24px) for hero/feature cards
 * - Rounded-xl (16px) for content cards
 * - Subtle border in dark mode: rgba(255,255,255,0.08)
 * - Light shadow or no shadow in dark mode
 * 
 * BUTTONS
 * --------
 * - Primary: Solid accent color, bold text
 * - Secondary: Ghost with border
 * - Height: 40px (sm), 48px (md), 56px (lg)
 * - Rounded-xl for primary actions
 * - Rounded-lg for secondary
 * - Hover: scale(1.02) or background shift
 * 
 * INPUTS
 * -------
 * - Height: 48px minimum
 * - Rounded-lg
 * - Subtle background in dark mode (#1a1a1a)
 * - Clear focus ring with accent color
 * 
 * DATA DISPLAYS
 * --------------
 * - Large numbers: Bold, potentially monospace
 * - Labels: Uppercase, tracking-wide, muted color
 * - Supporting text: Secondary color
 * 
 * PROGRESS RINGS
 * ---------------
 * - SVG-based for precision
 * - Stroke-linecap: round for smooth ends
 * - Animated on mount with CSS transitions
 * - Color-coded by training domain
 * 
 * =============================================================================
 * MOTION PRINCIPLES
 * =============================================================================
 * 
 * TIMING
 * -------
 * - Micro: 150ms (hover states, toggles)
 * - Standard: 300ms (page transitions, cards)
 * - Emphasis: 500ms (hero animations, onboarding)
 * 
 * EASING
 * -------
 * - Default: cubic-bezier(0.4, 0, 0.2, 1) (ease-out)
 * - Bounce: cubic-bezier(0.34, 1.56, 0.64, 1)
 * - Spring: Use framer-motion for complex animations
 * 
 * PRINCIPLES
 * -----------
 * - Motion should feel athletic: snappy, confident, purposeful
 * - Avoid floaty/dreamy animations
 * - Entry animations: fade + slight scale or translate
 * - Progress animations: smooth, linear for data
 * 
 * =============================================================================
 * USER EXPERIENCE PRINCIPLES
 * =============================================================================
 * 
 * ONBOARDING
 * -----------
 * - Apple-quality: clean, focused, one task per screen
 * - Progressive disclosure: don't overwhelm with options
 * - Show personality through copy, not just UI
 * - Celebrate milestones (VDOT calculated, plan generated)
 * 
 * DASHBOARD
 * ----------
 * - "What do I do today?" is answered immediately
 * - Readiness score prominent but not overbearing
 * - One-tap access to start workout
 * - Week overview always visible
 * 
 * WORKOUT VIEW
 * -------------
 * - Large, glanceable pace targets
 * - Clear interval structure
 * - Easy to mark complete
 * - Minimal UI during execution
 * 
 * ACCESSIBILITY
 * --------------
 * - WCAG 2.1 AA compliant contrast ratios
 * - Focus states visible
 * - Keyboard navigable
 * - Screen reader friendly labels
 * 
 * =============================================================================
 * BRAND VOICE IN UI
 * =============================================================================
 * 
 * - Confident but not arrogant
 * - Scientific but not cold
 * - Direct, no fluff
 * - Celebrates the athlete, not the app
 * 
 * EXAMPLE COPY:
 * - "Built on science. Not opinions."
 * - "One plan. Everything you need."
 * - "Train smarter. Perform better."
 * - "Know exactly what to do. Every day."
 */

// Design tokens as TypeScript constants
export const COLORS = {
    // Dark mode backgrounds
    dark: {
        bg: {
            primary: '#0a0a0a',
            secondary: '#111111',
            tertiary: '#1a1a1a',
        },
        text: {
            primary: '#ffffff',
            secondary: '#888888',
            muted: '#555555',
        },
        border: 'rgba(255, 255, 255, 0.08)',
    },

    // Light mode backgrounds
    light: {
        bg: {
            primary: '#fafafa',
            secondary: '#ffffff',
            tertiary: '#f5f5f5',
        },
        text: {
            primary: '#0a0a0a',
            secondary: '#666666',
            muted: '#999999',
        },
        border: 'rgba(0, 0, 0, 0.08)',
    },

    // Training domain accents
    accent: {
        running: '#22c55e',    // Green
        strength: '#3b82f6',   // Blue
        durability: '#a855f7', // Purple
    },

    // Semantic
    semantic: {
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
    },
} as const;

export const SPACING = {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
} as const;

export const RADII = {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
} as const;

export const TRANSITIONS = {
    micro: '150ms ease-out',
    standard: '300ms ease-out',
    emphasis: '500ms ease-out',
} as const;
