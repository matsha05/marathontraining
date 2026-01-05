# The Long Game - Design System V2

> Refined minimalism for elite athletes. Every pixel is intentional.

## Core Philosophy: "Atmospheric Minimalism"

We are a **precision training instrument** for serious athletes. Our design is:

- **Dark-First**: Near-black backgrounds with opacity-based text hierarchy
- **Light Typography**: Instrument Sans in light weight. No heavy display fonts.
- **Subtle Motion**: Staggered reveals, not bouncy animations
- **Atmospheric Depth**: Radial glows, not drop shadows

---

## Visual Language

### Color System

All colors are dark-mode only. We do not support light mode.

#### Backgrounds
| Token | Value | Purpose |
|-------|-------|---------|
| `--v2-bg-deep` | `#08080a` | Page background |
| `--v2-bg-elevated` | `rgba(255,255,255,0.02)` | Cards, surfaces |
| `--v2-bg-hover` | `rgba(255,255,255,0.04)` | Hover states |
| `--v2-bg-active` | `rgba(255,255,255,0.06)` | Active/pressed |
| `--v2-bg-section` | `rgba(255,255,255,0.01)` | Alternating sections |

#### Text (Opacity-Based)
| Token | Opacity | Purpose |
|-------|---------|---------|
| `--v2-text-primary` | 90% | Headlines, primary content |
| `--v2-text-secondary` | 70% | Subheadings, key info |
| `--v2-text-tertiary` | 50% | Body text |
| `--v2-text-muted` | 40% | Secondary body |
| `--v2-text-subtle` | 30% | Labels, metadata |
| `--v2-text-ghost` | 20% | Hints, disabled |
| `--v2-text-faint` | 15% | Barely visible |

#### Accents
| Token | Value | Purpose |
|-------|-------|---------|
| `--v2-accent` | `#19e38c` | Primary accent (Volt Green) |
| `--v2-accent-subtle` | `rgba(25,227,140,0.1)` | Accent backgrounds |
| `--v2-accent-glow` | `rgba(25,227,140,0.04)` | Radial glow effect |
| `--v2-secondary` | `#3a6bff` | Secondary accent (Strength Blue) |

#### Domain Colors
| Domain | Color | Token |
|--------|-------|-------|
| Running | `#19e38c` | `--v2-running` |
| Strength | `#3a6bff` | `--v2-strength` |
| Durability | `#8b5cf6` | `--v2-durability` |

#### Semantic Colors
| State | Color |
|-------|-------|
| Success | `#19e38c` |
| Warning | `#f59e0b` |
| Error | `#ef4444` |

#### Borders
| Token | Opacity | Use |
|-------|---------|-----|
| `--v2-border` | 5% | Default borders |
| `--v2-border-hover` | 10% | Hover states |
| `--v2-border-active` | 20% | Active/focus |

---

### Typography

**Single font family**: Instrument Sans. Light weight for everything.

Why? The Week landing page aesthetic prioritizes refined minimalism. Heavy display fonts (Space Grotesk, etc.) break the ethereal quality. Light typography with opacity hierarchy creates sophistication.

#### Type Scale
| Class | Size | Weight | Use |
|-------|------|--------|-----|
| `v2-hero` | 72px (clamp) | 300 | Hero headlines |
| `v2-heading-lg` | 48px | 300 | Page titles |
| `v2-heading-md` | 24px | 300 | Section titles |
| `v2-heading-sm` | 18px | 300 | Card titles |
| `v2-body` | 16px | 400 | Default body |
| `v2-body-sm` | 14px | 400 | Supporting text |
| `v2-label` | 10px | 400 | Uppercase labels |
| `v2-mono` | 10px | 400 | Technical data |

#### Letter Spacing
| Token | Value | Use |
|-------|-------|-----|
| `--v2-tracking-tight` | -0.02em | Headlines |
| `--v2-tracking-wide` | 0.05em | Body text |
| `--v2-tracking-widest` | 0.1em | Uppercase labels |

#### Line Height
| Token | Value |
|-------|-------|
| `--v2-leading-none` | 1 |
| `--v2-leading-tight` | 1.15 |
| `--v2-leading-snug` | 1.35 |
| `--v2-leading-normal` | 1.5 |
| `--v2-leading-relaxed` | 1.65 |
| `--v2-leading-loose` | 2 |

---

### Spacing

**8px base grid**. All spacing uses multiples of 8.

| Token | Value |
|-------|-------|
| `--v2-space-1` | 4px |
| `--v2-space-2` | 8px |
| `--v2-space-3` | 12px |
| `--v2-space-4` | 16px |
| `--v2-space-5` | 20px |
| `--v2-space-6` | 24px |
| `--v2-space-8` | 32px |
| `--v2-space-10` | 40px |
| `--v2-space-12` | 48px |
| `--v2-space-16` | 64px |
| `--v2-space-20` | 80px |
| `--v2-space-24` | 96px |

---

### Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `--v2-radius-sm` | 6px | Small elements |
| `--v2-radius-md` | 8px | Buttons |
| `--v2-radius-lg` | 12px | Cards, inputs |
| `--v2-radius-xl` | 16px | Large cards |
| `--v2-radius-full` | 9999px | Pills, badges |

---

### Z-Index Scale

| Token | Value | Use |
|-------|-------|-----|
| `--v2-z-base` | 0 | Default |
| `--v2-z-dropdown` | 10 | Dropdowns |
| `--v2-z-sticky` | 20 | Sticky headers |
| `--v2-z-fixed` | 30 | Fixed elements |
| `--v2-z-modal-backdrop` | 40 | Modal overlays |
| `--v2-z-modal` | 50 | Modal content |
| `--v2-z-popover` | 60 | Popovers |
| `--v2-z-tooltip` | 70 | Tooltips |
| `--v2-z-toast` | 80 | Toast notifications |

---

## Component Patterns

### Cards
```css
.v2-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
}
```
- Always subtle border for definition
- Hover: background to 0.04, border to 0.1
- Interactive cards scale 1.02 on hover

### Buttons

| Class | Style |
|-------|-------|
| `v2-btn-primary` | White bg, black text |
| `v2-btn-secondary` | Transparent, border |
| `v2-btn-ghost` | Transparent, no border |

Sizes: `v2-btn-sm`, default, `v2-btn-lg`

### Inputs
- Background: `rgba(255,255,255,0.02)`
- Border: `rgba(255,255,255,0.05)`
- Focus: accent border + subtle glow
- Error: red border + red glow

### Badges
```css
.v2-badge {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 9999px;
  font-size: 10px;
  text-transform: uppercase;
}
```

---

## Motion Principles

### Timing
| Duration | Use |
|----------|-----|
| 150ms | Micro-interactions (hover) |
| 200ms | Standard transitions |
| 300ms | Page elements appearing |
| 500ms | Emphasis, staggered reveals |

### Easing
```css
--v2-ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--v2-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Staggered Reveals
Hero elements fade in sequentially:
1. Title (0ms delay)
2. Subtitle (150-200ms delay)
3. Week grid (350-400ms delay)
4. Individual cards (staggered 50ms each)
5. CTA (last)

Use Framer Motion for orchestration.

### Atmospheric Effects
- **Radial glow**: Subtle accent color behind hero content
  ```css
  background: radial-gradient(800px circle at 50% 55%, rgba(25,227,140,0.04), transparent 60%);
  ```
- Never use drop shadows. Use border opacity instead.

---

## Accessibility

### Focus States
```css
:focus-visible {
  box-shadow: 0 0 0 2px #08080a, 0 0 0 4px #19e38c;
}
```

### Disabled States
- Opacity: 0.4
- Cursor: not-allowed
- Pointer-events: none

### Error States
- Border: `#ef4444`
- Focus glow: `rgba(239,68,68,0.15)`

### Contrast Ratios
All text exceeds WCAG 2.1 AA:
- Primary text (90% white): 15.8:1
- Secondary text (70% white): 11.2:1
- Tertiary text (50% white): 7.5:1
- Muted text (40% white): 5.9:1

---

## Icons

### Static Icons (Lucide React)
Use `lucide-react` for all static icons:

```tsx
import { Footprints, Target, Activity, ChevronDown } from 'lucide-react';

<Footprints size={20} className="text-[var(--v2-accent)]" />
```

| Size Value | Use |
|------------|-----|
| 16 | Inline with text |
| 20 | Buttons, inputs |
| 24 | Cards, navigation |
| 32+ | Hero, empty states |

**Never use emoji for icons in the app UI.**

### Animated Icons (lucide-animated)
From https://lucide-animated.com/ — install individual icons:

```bash
npx jsrepo add @nicepkg/lucide-animated/activity
```

These are stored in `/components/ui/` as individual files (e.g., `activity.tsx`, `flame.tsx`).

Use sparingly — 1-2 key moments per page:
- **Check**: Success confirmations
- **Flame**: Streak displays
- **Activity**: Loading/progress
- **Sparkles**: AI/generation features

Import from `@/components/ui/[icon-name]`.

---

## Layout

### Containers
| Class | Max Width |
|-------|-----------|
| `v2-container-narrow` | 576px |
| `v2-container` | 768px |
| `v2-container-wide` | 1024px |

### Sections
```css
.v2-section {
  padding: 80px 24px;
}
.v2-section-alt {
  background: rgba(255,255,255,0.01);
}
```

### Grids
- `v2-grid-2`, `v2-grid-3`, `v2-grid-4`: Responsive grids
- `v2-grid-7`: Week calendar (always 7 columns)

---

## Form Groups

```html
<div class="v2-form-group">
    <label class="v2-form-label">Email</label>
    <input class="v2-input" type="email" />
    <span class="v2-form-hint">We'll never share this.</span>
</div>
```

States: `v2-input-error`, `v2-input-success`

---

## Data Tables

```html
<div class="v2-table-wrapper">
    <table class="v2-table v2-table-interactive">
        <thead>
            <tr><th>Day</th><th>Workout</th></tr>
        </thead>
        <tbody>
            <tr><td>Monday</td><td>Easy Run</td></tr>
        </tbody>
    </table>
</div>
```

Cell utilities: `v2-table-right`, `v2-table-center`, `v2-table-mono`, `v2-table-accent`

---

## Sliders

```html
<input type="range" class="v2-slider v2-slider-accent" 
       style="--slider-fill: 50%" />
<div class="v2-slider-labels">
    <span>Easy</span><span>Hard</span>
</div>
```

---

## Tabs

```html
<div class="v2-tabs">
    <button class="v2-tab v2-tab-active">Tab 1</button>
    <button class="v2-tab">Tab 2</button>
</div>
<div class="v2-tab-panel">Content</div>
```

Pill variant: Add `v2-tabs-pills` to the container.

---

## Avatars

| Class | Size |
|-------|------|
| `v2-avatar-xs` | 24px |
| `v2-avatar-sm` | 32px |
| `v2-avatar-md` | 40px |
| `v2-avatar-lg` | 48px |
| `v2-avatar-xl` | 64px |
| `v2-avatar-2xl` | 96px |

Modifiers: `v2-avatar-accent` (border), `v2-avatar-group` (stacked)

---

## Dropdowns

```html
<div class="v2-dropdown">
    <button class="v2-btn">Open Menu</button>
    <div class="v2-dropdown-menu">
        <button class="v2-dropdown-item">Option 1</button>
        <div class="v2-dropdown-divider"></div>
        <button class="v2-dropdown-item">Option 2</button>
    </div>
</div>
```

---

## Accessibility

### Reduced Motion
Automatically respects `prefers-reduced-motion`. All animations and transitions are disabled when user preference is set.

### Touch Targets
| Class | Min Size |
|-------|----------|
| `v2-touch-target` | 44px × 44px |
| `v2-touch-target-sm` | 36px × 36px |

### Screen Reader Only
```html
<span class="v2-sr-only">Hidden but accessible</span>
```

---

## Utilities

| Class | Purpose |
|-------|---------|
| `v2-truncate` | Single-line text truncation |
| `v2-line-clamp-2` | 2-line text truncation |
| `v2-line-clamp-3` | 3-line text truncation |
| `v2-scrollable` | Styled scrollbar container |

---

## Breakpoints

| Token | Value |
|-------|-------|
| `--v2-breakpoint-sm` | 640px |
| `--v2-breakpoint-md` | 768px |
| `--v2-breakpoint-lg` | 1024px |
| `--v2-breakpoint-xl` | 1280px |
| `--v2-breakpoint-2xl` | 1536px |

---

## Implementation Checklist

When building a feature:
- [ ] Uses `v2-` classes from globals-v2.css
- [ ] Uses opacity-based text colors (not hex)
- [ ] Uses 8px spacing multiples
- [ ] Dark background only (no light mode)
- [ ] Motion uses Framer Motion with staggered delays
- [ ] Focus states visible on keyboard navigation
- [ ] Disabled states at 0.4 opacity
- [ ] Error states use red border + glow
- [ ] Icons sized and colored with v2 classes
- [ ] Atmospheric glow on hero sections (if applicable)
- [ ] Touch targets meet 44px minimum
- [ ] Respects prefers-reduced-motion
- [ ] Form groups use v2-form-group pattern

---

## Files

| File | Purpose |
|------|---------|
| `globals-v2.css` | All design tokens and component classes (~1600 lines) |
| `animated-icons.tsx` | Framer Motion icon components |
| `/design-system` | Interactive playground |
