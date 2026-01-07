# Meta-Coach Research Synthesis: Implementation Gaps

> Research audit of coaching philosophies that should inform **how** training plans are executed, beyond the core plan generators (Pfitz, Higdon, Hansons, Daniels).

---

## Executive Summary

| Coach/Expert | Domain | Research Status | Implementation Status | Priority |
|--------------|--------|-----------------|----------------------|----------|
| **Stephen Seiler** | Polarized 80/20 intensity | ✅ Comprehensive | ❌ Not enforced | **HIGH** |
| **Matt Fitzgerald** | 80/20 practical translation | ✅ Researched | ❌ Marketing copy only | **HIGH** |
| **Steve Magness** | Individualization, "coach the person" | ✅ Researched | ❌ Bio only | **MEDIUM** |
| **Brad Stulberg** | Stress + Rest = Growth | ✅ Researched | ❌ Not implemented | **MEDIUM** |
| **Alex Hutchinson** | Mental limits, central governor | ✅ Researched | ❌ Not implemented | **LOW** |
| **Deena Kastor** | Mental training, gratitude | ✅ Researched | ❌ Not implemented | **LOW** |
| **Shalane Flanagan** | Habits, trust training | ✅ Researched | ❌ Not implemented | **LOW** |
| **Renato Canova** | Progressive specificity (advanced) | ✅ Researched | ❌ Not implemented | **LOW** |
| **Loren Landow** | Warm-up activation protocols | ✅ Researched | ⚠️ Partial (durability) | **LOW** |
| **Tom Goom** | Injury prevention, return-to-run | ✅ Comprehensive | ✅ Implemented | — |
| **Dicharry/Starrett** | Durability, mobility | ✅ Comprehensive | ✅ Fully implemented | — |
| **Asker Jeukendrup** | Nutrition, race fueling | ✅ Comprehensive | ✅ Research complete | — |

---

## ⚡ Integration Decision: Guided Mode

**The base running plan is sacred.** Meta-coaches add guidance layers, not modifications.

### Why This Matters
If we promise "This is Hal Higdon's Novice 1 plan" and then Magness-style feedback changes it, we've violated our promise. The plan is no longer Higdon's — it's our plan with Higdon's branding.

### How It Works

| Coach | Integration Point | Modifies Plan? |
|-------|-------------------|----------------|
| **Seiler/Fitzgerald** | Weekly summary: "Your intensity was 65/35, aim for 80/20" | ❌ Education only |
| **Magness** | Post-workout: "That felt hard — here's context" | ❌ Guidance only |
| **Stulberg** | Dashboard: "Big week, prioritize sleep" | ❌ Wellness nudge |
| **Dicharry/Starrett** | Pre-workout: "Do this 8 min before your run" | ⚠️ Additive |
| **Støren/ACSM** | Strength days (separate track) | ➕ Separate |

### UI Pattern
```
┌─────────────────────────────────────────┐
│ Higdon says: 6 miles easy               │  ← THE PLAN (sacred)
├─────────────────────────────────────────┤
│ 💡 You reported fatigue yesterday.      │  ← GUIDANCE (optional)
│    Consider: run-walk or 5 miles.       │
└─────────────────────────────────────────┘
```

---

## Priority 1: Polarized Training Enforcement (Seiler + Fitzgerald)

### Current State
Seiler and Fitzgerald are mentioned in marketing and coach bios, but **no actual intensity distribution enforcement** exists in plans.

### What Should Be Implemented

#### A. Zone Classification (from `03-seiler-intensity.md`)
```
Zone 1 (Low): Below VT1 (~<75% HRmax, conversational)
Zone 2 (Moderate): Between VT1-VT2 (~75-88% HRmax, "gray zone")
Zone 3 (High): Above VT2 (~>88% HRmax, hard)
```

#### B. Weekly Distribution Guardrails

**Strict Polarized (default):**
- Zone 1: 75-85% (fail if <75%)
- Zone 2: 0-5% (hard cap 10%)
- Zone 3: 10-20% (fail if <8% or >25%)

**Marathon-Adapted (during MP blocks):**
- Zone 1: 70-85%
- Zone 2: 5-15% (hard cap 20%)
- Zone 3: 5-15%

#### C. Session-Level Constraints (prevent "moderate creep")

**Easy runs must satisfy:**
- Z2 + Z3 ≤ 10% of duration
- Z3 = 0

**Quality runs must satisfy:**
- 12-30 minutes of Z3 work
- Warm-up/cool-down mostly Z1

**Hard spacing:**
- ≤2 quality sessions per 7 days
- No back-to-back quality days

#### D. Fitzgerald 80/20 Practical Translation
- Use "talk test" as primary zone indicator for users without HR monitors
- Warn users about the "moderate-intensity rut" (running easy days too fast)
- Provide education: "80/20 means your easy days should feel EASY"

### Implementation Approach
1. Add intensity zone tagging to workouts
2. Create weekly intensity audit after each week
3. Alert users when easy days trend toward moderate
4. Show weekly intensity distribution pie chart

---

## Priority 2: Steve Magness - Individualization

### Core Philosophy
> "Coach the person, not the system"

### Key Principles

1. **No "Non-Responders"** - If someone isn't progressing, the training is wrong, not them
2. **Build and Maintain** - While building one attribute, maintain others
3. **Feel Over Strict Paces** - Develop effort awareness, not pace dependence
4. **Holistic View** - Consider physiology, mechanics, AND psychology

### Implementation Opportunities

- **Adaptive paces**: Use perceived effort + HR to adjust paces, not just VDOT tables
- **Recovery indicators**: Ask "how did that workout feel?" and adjust next session
- **Non-responder detection**: If 3+ weeks stagnant, suggest training adjustment
- **"How's your body?" check-ins**: Morning readiness that feeds into workout intensity

---

## Priority 3: Brad Stulberg - Stress + Rest = Growth

### Core Equation
```
Stress + Rest = Growth
```

### Key Principles

1. **Hard workouts require proportional recovery**
2. **Process over outcomes** - focus on daily execution
3. **Mental tapering matters** - avoid cognitive load before races
4. **Immersion → Incubation cycles** - intense focus followed by true rest

### Implementation Opportunities

- **Rest day quality**: Prompt for actual rest behaviors (sleep, low stress)
- **Load balance alerts**: Flag when stress accumulates without adequate recovery
- **Process goal framing**: Celebrate workout completion, not just PR pace

---

## Priority 4: Mental Training (Hutchinson, Kastor, Flanagan)

### Alex Hutchinson - Endure
- **Central Governor Theory**: Brain limits output before body truly fails
- **Perceived Effort** is trainable - mindfulness, exposure, self-talk
- **Pain tolerance increases** with consistent high-intensity training

### Deena Kastor - Let Your Mind Run
- **Gratitude practice** releases positive hormones
- **Control negative thoughts** - recognize and redirect
- **Visualization** creates neural pathways for success
- Define yourself in moments of fatigue

### Shalane Flanagan
- **"Mood follows action"** - just start, emotion follows
- **Trust your training** - calm comes from preparation
- **"Head first half, heart second half"** - strategic engagement
- Consistent habits build resilience

### Implementation Opportunities

- **Pre-race visualization prompts**
- **Mantra suggestions** for hard workouts
- **Gratitude journaling** integration
- **Chunking visualization** for long runs (mile by mile)

---

## Already Well-Implemented ✅

### Dicharry + Starrett (Durability)
Comprehensive implementation in `src/domain/durability/`:
- Full assessment system
- Prescription modules with coaching cues
- Daily quick checks on dashboard
- Pre-workout readiness prompts

### Tom Goom (Injury Prevention)
Complete framework in `research/08-injury-prevention.md`:
- RED/AMBER/GREEN decision trees
- Return-to-run protocols
- Pain monitoring guidelines
- Encodable JSON rules

### Nutrition (Jeukendrup-aligned)
Complete in `research/06-nutrition-fueling.md`:
- Pre/during/post-run fueling rules
- Race week carb loading protocols
- Hydration guidelines
- App-ready YAML specification

---

## Advanced/Future: Renato Canova

### Principles (for future "Advanced Plan Tier")
- **Extension of Quality** over pure volume
- **Progressive Long Runs** (87% → 96% MP over 90 min)
- **Special Blocks** - AM/PM quality sessions every 3-4 weeks
- **Low-carb between sessions** for fat adaptation

### Not Recommended for Recreational Runners
Canova's methods require:
- 100+ mile weeks
- Multi-year base
- Elite recovery capacity

---

## Research Sources

| Topic | File |
|-------|------|
| Seiler Polarized | `research/03-seiler-intensity.md` |
| Durability | `research/04-starrett-dicharry-durability.md` |
| Nutrition | `research/06-nutrition-fueling.md` |
| Injury Prevention | `research/08-injury-prevention.md` |
| Coach Synthesis | `research/COACH_SYNTHESIS_ORACLE.md` |

---

*Generated: January 2026*
