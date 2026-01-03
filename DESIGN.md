# The Long Game - Design Principles

> A world-class design system for elite athletes. Every pixel is intentional.

## Core Philosophy: "Athletic Precision"

We are not a generic fitness app. We are a **precision training instrument** for serious athletes who demand evidence-based coaching. Our design reflects:

- **Performance-First**: Bold, confident, data-forward
- **Scientific Authority**: Show the methodology, not just the result
- **Premium Craft**: Apple-level attention to detail
- **Clarity Over Decoration**: Every element earns its place

---

## Visual Language

### Color System

| Token | Value | Purpose |
|-------|-------|---------|
| `--color-accent` | `#10b981` (Emerald) | Primary CTA, success, running |
| `--color-strength` | `#3b82f6` (Blue) | Strength training domain |
| `--color-durability` | `#8b5cf6` (Violet) | Durability/mobility domain |
| `--color-warning` | `#f59e0b` (Amber) | Caution states |
| `--color-error` | `#ef4444` (Red) | Error states |

#### Dark Mode (Default)
| Token | Value | Purpose |
|-------|-------|---------|
| `--bg-base` | `#09090b` | Page background |
| `--bg-elevated` | `#18181b` | Cards, elevated surfaces |
| `--bg-muted` | `#27272a` | Inputs, secondary surfaces |
| `--text-base` | `#fafafa` | Primary text |
| `--text-muted` | `#a1a1aa` | Secondary text |
| `--text-subtle` | `#71717a` | Labels, captions |

**Contrast Ratios**: All text exceeds WCAG 2.1 AA (4.5:1 for body, 3:1 for large text)

### Typography

We use a **three-font system**:

| Font | Use Case |
|------|----------|
| **Inter** | All UI text, headings, body |
| **Georgia** | Editorial accents (sparingly) |
| **JetBrains Mono** | Data, times, paces, metrics |

#### Type Scale

| Class | Size | Weight | Use |
|-------|------|--------|-----|
| `.text-display-xl` | 4rem | 700 | Hero headlines |
| `.text-display-lg` | 3rem | 700 | Page titles |
| `.text-display-md` | 2.25rem | 700 | Section heroes |
| `.text-heading-lg` | 1.5rem | 600 | Section titles |
| `.text-heading-md` | 1.25rem | 600 | Card titles |
| `.text-heading-sm` | 1.125rem | 600 | Subsections |
| `.text-body-lg` | 1.125rem | 400 | Feature descriptions |
| `.text-body-md` | 1rem | 400 | Default body |
| `.text-body-sm` | 0.875rem | 400 | Supporting text |
| `.text-label` | 0.75rem | 600 | Uppercase labels |
| `.text-caption` | 0.8125rem | 400 | Captions, hints |
| `.text-data` | inherit | 600 | Monospace numbers |

### Spacing

**8px base grid**. All spacing should be multiples of 8px.

Common values: `8, 16, 24, 32, 48, 64, 96`

### Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 6px | Small elements, badges |
| `--radius-md` | 8px | Buttons |
| `--radius-lg` | 12px | Inputs |
| `--radius-xl` | 16px | Cards |
| `--radius-2xl` | 24px | Hero cards, modals |

---

## Component Patterns

### Cards

```css
.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-xl);
}
```

- Always have subtle border for definition
- Hover state brightens border
- Use `.card-interactive` for clickable cards

### Buttons

| Class | Use |
|-------|-----|
| `.btn-primary` | Primary actions, CTAs |
| `.btn-secondary` | Secondary actions |
| `.btn-ghost` | Tertiary, inline actions |
| `.btn-lg` | Hero CTAs |
| `.btn-sm` | Inline, compact |

### Inputs

- Height: 52px minimum
- Background: `--bg-muted`
- Focus: Green ring with accent color
- Placeholder: `--text-subtle`

### Domain Colors

Training types have distinct colors:
- Running: Emerald (green)
- Strength: Blue
- Durability: Violet

Use classes: `.domain-running`, `.domain-strength`, `.domain-durability`
Badge variant: `.domain-badge` (applies 15% opacity background)

---

## Motion Principles

| Duration | Use |
|----------|-----|
| 150ms | Micro-interactions (hover, focus) |
| 200ms | Standard transitions |
| 300ms | Page elements appearing |
| 500ms | Emphasis animations |

**Easing**: `ease` or `ease-out` for most. Never linear for UI.

**Character**: Athletic = snappy, confident. Not floaty or bouncy.

---

## Layout

### Containers

| Class | Max Width | Use |
|-------|-----------|-----|
| `.container-page` | 1200px | Standard pages |
| `.container-narrow` | 640px | Focus flows (onboarding, auth) |

### Spacing Rhythm

- Page padding: 24px (mobile: 16px)
- Section gap: 48-64px
- Card padding: 20-24px
- Element gap within cards: 16px

---

## Accessibility

- Focus states: 2px green outline
- Color contrast: WCAG AA minimum
- Touch targets: 44px minimum
- Keyboard navigable

---

## Writing UI Copy

- **Concise**: Remove every unnecessary word
- **Confident**: "Start training" not "Get started with training"
- **Action-oriented**: Lead with verbs
- **Human**: Not robotic, but not overly casual

---

## Implementation Checklist

When building a new feature:

- [ ] Uses typography classes (not arbitrary font sizes)
- [ ] Uses spacing scale (multiples of 8)
- [ ] Uses semantic color tokens (not hex values)
- [ ] Proper dark mode support
- [ ] Meets contrast requirements
- [ ] Has appropriate motion
- [ ] Touch-friendly on mobile
- [ ] Keyboard accessible
