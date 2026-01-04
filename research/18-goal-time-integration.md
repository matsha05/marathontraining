# Goal Time Integration Research (Oracle)

> Research query: Whether setting a goal race time is beneficial for training plan design.
> Date: January 4, 2026 | Model: GPT-5.1 Pro

---

## Executive Summary

A durability-first training system can accept a goal race time as input, but should treat it as a **specification target** rather than the primary pace-setting dial. Training paces are earned from current fitness, not aspirations.

---

## 1. What Major Coaches Say

### Jack Daniels
- **Core stance**: Training paces anchored to current demonstrated fitness, not hopes
- Goal time can guide periodization and specificity, but paces are earned from current fitness
- Explicitly warns: running faster than prescribed does not produce better adaptations

### Hansons (Luke Humphrey)
- **Classic plans**: Goal marathon pace (MP) is the organizing principle
- **Newer writing**: Start from current pace, transition toward goal pace as adaptation occurs
- Calculator supports both: recent race result OR goal race time

### Hal Higdon
- **Core stance**: Effort for most mileage; easy/long runs 30-90 sec/mi slower than race pace
- Goal time is motivational; plan is not built around chasing goal-derived paces daily

### Pete Pfitzinger
- Many intensities from current race-derived paces (tempo ≈ 15K pace, VO2 ≈ 3K-5K pace)
- Marathon-specific long runs include goal MP work with caution
- Warns against pushing long runs too hard

### Synthesis

| Coach | Pace Source | Goal Time Role |
|-------|-------------|----------------|
| Daniels | Current fitness (VDOT) | Specificity, earned progression |
| Hansons | Goal pace (classic) → Current + progress (new) | Primary in classic, tempered in new |
| Higdon | Effort-based | Motivational only |
| Pfitzinger | Current fitness | Marathon-specific work |

---

## 2. Evidence Summary

### What's Supported
- **Goal setting is beneficial** but process goals > outcome goals (meta-analysis)
- **Injury risk increases** with training load spikes — 5,200-runner cohort shows higher injury when single session > 110% of longest run in prior 30 days
- **Overtraining syndrome** is real outcome of chronic excessive stress

### What's Not Clear
- No clean head-to-head evidence comparing goal-derived vs current-fitness paces

### Practical Conclusion
- Goal time beneficial for motivation and specificity when **realistic**
- Goal time harmful as main pace driver when it **exceeds current fitness**

---

## 3. Risks of Unrealistic Goal Time

### Training Risks
- **Wrong stimulus**: T/I sessions too fast → not training target system
- **Cumulative fatigue spiral**: Failing workouts → "making up" → reduced recovery
- **Gray-zone trap**: Too much "moderately hard" running degrades quality

### Durability Risks
- **Single-session spikes**: Aggressive goals push distance/intensity too quickly
- **Higher impact forces**: Faster pace = more musculoskeletal loading

### Behavioral Risks
- **Adherence failure**: Every session feels like a test → people quit
- **Identity threat**: "I can't hit paces" → "I'm not a runner"
- **Race-day blow-up**: Fantasy pace → early positive split → late collapse

---

## 4. Implementation Best Practices

### 4.1 Data Model Separation

```yaml
goal_time:    User intent (aspiration)
rVDOT:        Race-validated fitness
tVDOT:        Training fitness (pace driver)
gVDOT:        Goal-derived VDOT (target, not authority)
```

Relationship: `tVDOT <= rVDOT <= seedVDOT`

### 4.2 Goal Realism Classifier

```yaml
goal_status: conservative | aligned | stretch | aggressive

inputs:
  - predicted_time_from_rVDOT
  - running_experience_months
  - recent_volume
  - injury_history
  - durability_state

heuristics:
  - typical_improvement: 2-3% over 12-16 weeks
  - stricter_guardrails_for: novices, injury-prone
```

**UX behavior**: If `aggressive`, show "stretch goal" label and anchor all paces to `tVDOT`, not `gVDOT`.

### 4.3 Effective Race Pace Formula

```
MP_goal     = pace(goal_time)
MP_current  = M-zone pace from tVDOT (0.75-0.84 × VDOT)

MP_effective = max(MP_goal, MP_current)  # slower of the two
```

**Why it works**:
- If goal faster than current → don't force it
- If goal conservative → still practice intended race pace
- As tVDOT rises, MP_effective naturally converges toward MP_goal

### 4.4 Keep T/I Paces Current-Fitness-Based

Even in marathon plans, avoid setting T and I from goal marathon time:

```
E: 0.59–0.74 × tVDOT
M: 0.75–0.84 × tVDOT
T: 0.83–0.88 × tVDOT
I: 0.97–1.00 × tVDOT
```

### 4.5 Fast Down, Slow Up Calibration

**Negative evidence (immediate)**:
- I pace fails by rep 3 → `tVDOT -= 1`
- Easy runs fail talk test → apply ceiling, consider `tVDOT -= 1`

**Positive evidence (gated)**:
- `tVDOT += 1` max every 4-6 weeks when training going well
- Use benchmark workouts and races to justify

### 4.6 A/B/C Goal Pattern

| Goal | Definition | Use |
|------|------------|-----|
| A | Stretch (aggressive) | Motivation only |
| B | Likely (aligned) | Sets MP_goal |
| C | Conservative finish | Safety fallback |

If A is classified as aggressive, use B goal to set MP_goal.

### 4.7 Process Goals from Outcome Goals

Auto-translate time goal:
- "Hit 5 runs/week for 10 of 12 weeks"
- "Keep easy runs conversational"
- "Complete 6 of 8 planned long runs"

---

## 5. Product UX Patterns

1. **Primary**: "Current Training Paces" — **Secondary**: "Goal Pace"
2. **Explain convergence**: "As you validate workouts, training paces will progress toward your goal"
3. **Never let goal override tVDOT** in prescriptions unless validated
4. **Show gap transparently**: "Current: 8:45–9:10/mi → Goal: 8:00/mi"

---

## Bottom Line

> A goal race time is beneficial when it drives motivation, plan selection, and specificity — not when it becomes a blunt instrument that forces paces beyond current capacity.

The safest synthesis: **Anchor paces to current fitness (tVDOT), incorporate goal pace through a clamped "effective race pace," and let workouts and durability earn pace progressions.**
