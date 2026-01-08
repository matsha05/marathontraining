# Mobile Experience Overhaul — Implementation Plan

> **Goal**: Transform the mobile experience into best-in-class, premium, touch-first design using cutting-edge 2024/2025 mobile web techniques while preserving exact desktop behavior.

## Target Devices

| Device | CSS Viewport | Priority |
|--------|--------------|----------|
| iPhone 16/17 Pro Max | 440 × 956 | Primary |
| iPhone 15/16 standard | 393 × 852 | Secondary |
| iPhone SE / Small phones | 375 × 667 | Fallback |

**Breakpoint strategy**: Primary breakpoint at `md:` (768px). All mobile styles apply below 768px.

---

## Executive Summary: 42 Issues

| Category | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 4 | ✅ All Done |
| 🟠 High Priority | 10 | ✅ All Done |
| 🟡 Medium Priority | 12 | ✅ All Done |
| 🟢 Premium Polish | 10+ | ✅ All Done |
| ✨ Expanded Audit | 7 | ✅ All Done |

---

## 🔴 Critical Issues (4)

| # | Issue | Status |
|---|-------|--------|
| 1 | No mobile navigation | ✅ `MobileNav.tsx` + Vaul drawer |
| 2 | 22+ hardcoded grids | ✅ Responsive prefixes + horizontal scroll |
| 3 | iOS `100vh` bug | ✅ `min-h-screen-safe` with `dvh` |
| 4 | Missing `viewportFit: 'cover'` | ✅ Added to `layout.tsx` |

---

## 🟠 High Priority Issues (10)

| # | Issue | Status |
|---|-------|--------|
| 5 | Hover-only tooltips | ✅ `StandardsGrid` with React state |
| 6 | Native `title=` tooltips | ✅ Replaced with custom tooltip/aria labels |
| 7 | Toast at bottom | ✅ Moved to top-center |
| 8 | OfflineIndicator at bottom | ✅ Added `mb-safe` |
| 9 | No safe-area utilities | ✅ Added in `globals.css` |
| 10 | Day selector touch targets | ✅ Horizontal scroll + `touch-target` |
| 11 | Number inputs missing `inputMode` | ✅ Added to TimeInput |
| 12 | 10px font sizes | ✅ Typography floor CSS |
| 13 | 11px font sizes | ✅ Typography floor CSS |
| 14 | `.v3-btn-sm` is 10px | ✅ Typography floor CSS |

---

## 🟡 Medium Priority Issues (12)

| # | Issue | Status |
|---|-------|--------|
| 15 | No `-webkit-tap-highlight-color` | ✅ Added in `globals.css` |
| 16 | No `touch-action` styling | ✅ `touch-pan-x` on scrollers |
| 17 | No `overscroll-behavior` | ✅ Added in `globals.css` |
| 18 | Missing `autocomplete` | ✅ Auth email has it |
| 19 | Small interactive `p-1`/`p-2` | ✅ Toast dismiss button fixed |
| 20 | No `scroll-snap` | ✅ All horizontal scrollers |
| 21 | No `will-change` | ✅ Utilities + applied to motion/scroll containers |
| 22 | No scroll hints | ✅ CSS classes added |
| 23 | No CSS Container Queries | ✅ Added utilities + PacesCard |
| 24 | No View Transitions API | ✅ 60 lines of CSS |
| 25 | No `text-wrap: balance` | ✅ Added to headings |
| 26 | `text-xs` overuse | ✅ Audited + floor applied |

---

## 🟢 Premium Polish (10+)

| # | Issue | Status |
|---|-------|--------|
| 27 | No `useIsMobile()` hook | ✅ Created |
| 28 | No haptic feedback | ✅ `useHaptics` hook (supported devices) |
| 29 | No swipe gestures | ✅ WeeklyCalendar drag |
| 30 | Missing `whileTap` | ✅ Added to motion elements |
| 31 | No pull-to-refresh | ✅ Standalone PWA pull-to-refresh |
| 32 | No auto-center calendar | ✅ `scrollIntoView` on today |
| 33 | Portrait CSS fallback | ✅ Landscape overlay in CSS |
| 34 | No scroll-driven animations | ✅ Mobile scroll-reveal hook |
| 35 | No momentum scroll | ✅ `-webkit-overflow-scrolling` |

---

## ✨ Expanded Audit Additions (Post-Plan)

| # | Issue | Status |
|---|-------|--------|
| 36 | iOS input zoom on form fields | ✅ 16px mobile override |
| 37 | Safe-area padding for fixed headers outside SiteHeader | ✅ Onboarding, philosophy, landing, regenerate |
| 38 | Avatar grid density on mobile | ✅ CSS-driven column reduction |
| 39 | Custom tooltip system for icon/label hints | ✅ `data-tooltip` + mobile tap |
| 40 | Scroll hint theming for dark sections | ✅ `--scroll-hint-color` overrides |
| 41 | Bottom-sheet polish (handle + safe-area) | ✅ Modal refinements |
| 42 | Pull-to-refresh indicator styling | ✅ Branded, subtle indicator |
| 43 | Touch target tuning for compact controls | ✅ 44px minimums applied |

---

## Files Modified

### Phase 1: Foundation ✅
- [x] `globals.css` — 300+ lines mobile utilities
- [x] `layout.tsx` — viewportFit cover
- [x] `SiteHeader.tsx` — Hamburger integration
- [x] `Toast.tsx` — Top-center position
- [x] `OfflineIndicator.tsx` — Safe area insets

### Phase 2: Core Components ✅
- [x] `WeeklyCalendar.tsx` — Horizontal scroll + snap + swipe
- [x] `MobileNav.tsx` — NEW, Vaul drawer
- [x] `useIsMobile.ts` — NEW, matchMedia hook
- [x] `DatePicker.tsx` — 44px touch targets + nav buttons
- [x] `Modal.tsx` — Mobile bottom sheet + safe-area padding

### Phase 3: Landing & Marketing ✅
- [x] `page.tsx` — Hero grids, `StandardsGrid` component
- [x] `methodology-content.tsx` — Mobile-safe viewport
- [x] `browse/page.tsx` — Mobile horizontal tabs

### Phase 4: App Pages ✅
- [x] Audited dashboard, plan, WODs, durability
- [x] Most already responsive
- [x] `PacesCard.tsx` — Container queries + inputMode

### Phase 5: Onboarding ✅
- [x] `identity.tsx` — Day selectors horizontal scroll
- [x] `training-load.tsx` — Day selectors + touch targets
- [x] `ui.tsx` — `inputMode="numeric"` on TimeInput

### Phase 6: Polish ✅
- [x] `useIsMobile.ts` hook
- [x] View Transitions CSS
- [x] `useHaptics.ts` — Haptic taps on supported devices
- [x] `PullToRefresh.tsx` — Standalone PWA pull-to-refresh
- [x] `useScrollReveal.ts` — Mobile scroll-driven animations

---

## Remaining Work

None — audit and implementation complete.
