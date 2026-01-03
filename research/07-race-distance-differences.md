# Race Distance Training Differences (5K to Ultramarathon)

Below is a set of distance-driven plan-generator rules you can encode to shift training from 5K through ultra. They're expressed as defaults that you can scale by athlete level, available weekly volume, injury history, and terrain.

The underlying "why" in one line: shorter races lean more on vVO2max / VO2max and running economy (so you bias toward faster intervals and economy work), while longer races increasingly reward fractional utilization (threshold) and fatigue resistance (so you bias toward longer steady work, race-pace specificity, and then volume plus fueling/time-on-feet for ultras).

---

## Shared definitions to make the rules unambiguous

### Workout types your generator should "budget"

- **VO2 session (VO2)**: Intervals typically 2–5 min "on" (or similar) around vVO2max effort.
- **Threshold session (THR)**: Continuous tempo or cruise intervals near lactate threshold (roughly "best 45–60 min effort").
- **Race-pace session (RP)**: Work at 5K pace, 10K pace, HM pace, MP (marathon pace), or ultra effort.
- **Long run (LR)**: The longest weekly endurance stimulus.
- **Strides / hill sprints (STR)**: Short neuromuscular touches (not counted as a "quality session" unless you want them to be).

### "Quality session" counting

To avoid ambiguity, I recommend you track two counters:

- **Hard-quality sessions/week**: structured intensity above easy (VO2, THR, RP when RP is meaningfully hard).
- **Key sessions/week**: hard-quality sessions plus the long run (because the long run is always a cornerstone even when easy).

---

## 1) Workout emphasis shifts by race distance (encode as weights)

Think of this as how you allocate the athlete's weekly quality budget (minutes or TSS) across workout types during the specific phase.

### A. 5K

**Primary**: VO2 + economy  
**Secondary**: threshold maintenance

**Rule (quality allocation)**:
- VO2: 45–60% of quality minutes
- THR: 25–40%
- STR (economy): 5–10% (sprinkled 2–4x/week, short)

**Rationale**: 5K performance strongly tracks aerobic power and velocities associated with VO2max plus other determinants (economy, thresholds), so training biases to VO2 while keeping threshold "topped up."

### B. 10K

**Primary**: VO2 + threshold (more balanced than 5K)

**Rule (quality allocation)**:
- VO2: 35–50%
- THR: 35–50%
- STR: 5–10%

### C. Half marathon

**Primary**: Threshold (ability to sustain a high fraction of aerobic capacity)

**Rule (quality allocation)**:
- THR: 55–70%
- RP (HM pace): 15–25%
- VO2: 10–20% (mostly "ceiling maintenance," not the focus)

### D. Marathon

**Primary**: Aerobic endurance + marathon-pace specificity

**Rule (quality allocation)**:
- RP (MP): 40–60%
- THR: 25–45%
- VO2: 0–15% (small dose to maintain aerobic power)

Marathon is typically run at a high fraction of VO2max, so the ability to sustain pace and resist fatigue dominates the specificity needs.

### E. Ultras (50K to 100M+)

**Primary**: Volume (fatigue resistance) + terrain-specific strength + fueling execution

**Rule (quality allocation)**:
- LR / back-to-back volume stimulus: 60–80% of "key work"
- THR / steady (often hills): 10–25%
- VO2: 0–10% (optional, usually early season or as short hill reps)

Ultra success is strongly tied to experience, training volume, and sustainable execution (hydration/nutrition and pacing), with injury and musculoskeletal load becoming major constraints.

---

## 2) Long run structure rules by goal race

These are generator-friendly rules: duration caps, structure templates, and progression constraints.

### Global long run safety rails (recommended)

- **LR duration cap (road-focused)**: `min(0.35 * weekly_run_time, 3:00)` for marathon and shorter.
- **LR duration cap (trail/ultra)**: `min(0.35 * weekly_run_time, 5:00–6:00)` depending on experience and terrain.
- **LR intensity**: default easy unless the distance rules below specify controlled segments.
- **LR spacing**: keep at least 48 hours before/after the hardest VO2 workout for most athletes (encode as a scheduling constraint).

### A. 5K long run

**Goal**: aerobic support + resilience, not race simulation

**Rules**:
- LR duration target: 70–105 min
- LR structure: easy + 6–10 strides near the end (optional)
- LR progression: increase LR time by 5–10 min every 1–2 weeks until cap

### B. 10K long run

**Rules**:
- LR duration target: 80–120 min
- Optional "steady finish" every other week: last 10–20 min at steady (below threshold)

### C. Half marathon long run

**Rules**:
- LR duration target: 90–150 min (time-based is safer than miles for many)
- Every 1–2 weeks include one of:
  - Progression LR: last 20–40 min trending toward HM pace (controlled)
  - Cruise blocks: 2–3 x 10–15 min @ THR inside LR with short easy floats

### D. Marathon long run

**Rules**:
- LR duration target: 2:00–3:00 (or equivalent)
- Marathon-specific structure 1x/week or 1x/2weeks (depending on athlete):
  - MP blocks: 2–3 x 20–40 min @ MP inside LR
  - or fast-finish LR: last 30–60 min at MP to steady (controlled)
- Add fueling practice on any LR > 90 min (see ultra module below).

### E. Ultra long run (single LR is not "the" magic workout)

For ultras, encode the long run as a system (time-on-feet, terrain, and back-to-back stimulus), not a single mythical longest run.

**Rules**:
- Prefer **back-to-back long runs (B2B)** over pushing a single mega-run every week.
- Single-run cap (default): 3–5 hours depending on experience, terrain, and injury risk.
- B2B weekend template (most common):
  - Day 1: longer (for example 55–65% of weekend long-run time)
  - Day 2: shorter (35–45%) with more hiking/climbing focus if mountainous
- Terrain specificity:
  - If race has major climbing: encode time hiking uphill as required, not optional.
  - If race has long downhills: encode downhill exposure gradually (eccentric load management).

---

## 3) Weekly quality session count by distance (hard-quality and key sessions)

These are strong defaults for a typical trained runner (not elite). You can scale up for very advanced athletes.

| Distance | Hard-quality sessions/week | Typical sessions | Key sessions/week (incl LR) |
|----------|---------------------------|------------------|----------------------------|
| 5K | 2–3 | VO2 + THR (plus optional 3rd: race-pace or hills) | 3–4 |
| 10K | 2–3 | VO2/10K-pace + THR | 3–4 |
| Half marathon | 2 | THR + HM-leaning long run (or steady progression) | 3 |
| Marathon | 2 | THR or steady midweek + MP-focused LR (or alternating weeks) | 3 |
| Ultra (50K to 100M+) | 1 (sometimes 2 early season) | Hill strength (steady) or short controlled tempo | 2–3 |

Ultra plans skew toward volume and durability, since performance predictors increasingly emphasize training volume, sustainable training characteristics, and execution variables (hydration/nutrition).

---

## 4) Taper length rules by race distance (and what to reduce)

### Evidence-based taper defaults you can encode

A high-performing general taper pattern is:
- Reduce volume ~41–60%, keep intensity and frequency mostly unchanged, taper duration up to ~21 days depending on event and fatigue.

Longer events and heavier training loads generally call for longer tapers (practical coaching heuristic).

### Encode these taper lengths

| Distance | Taper length | Volume reduction | Notes |
|----------|-------------|------------------|-------|
| 5K | 5–8 days | 30–50% | Keep 1 short VO2-style sharpening touch (reduced volume) |
| 10K | 7–10 days | 35–55% | Keep 1 threshold-ish touch and/or short race-pace reps |
| Half marathon | 10–14 days | 40–60% | Keep 1 threshold touch; long run reduces materially |
| Marathon | 14–21 days (2–3 weeks) | 41–60% | Keep intensity, reduce workout volume |
| Ultra 50K | 10–14 days | 40–60% | |
| Ultra 50M/100K | 14–21 days | 40–60% | |
| Ultra 100M+ | 21–28 days | 40–60% | Often longer if athlete is damage-prone |

### Taper structure template (simple to implement)

For a 2-week taper:
- Week -2: `weekly_volume = 0.70–0.80 * peak_week`
- Week -1: `weekly_volume = 0.45–0.60 * peak_week`
- Keep intensity, reduce total "work minutes" inside workouts by 30–60%.

---

## 5) Ultra-specific considerations (encode as mandatory modules)

### A. Time-on-feet priority (especially trail)

**Rule**: If `race_duration_estimate > 4 hours` or `terrain = trail/mountain`, switch long runs from distance goals to time-on-feet goals:
- Weekly long-run objectives expressed in hours.
- Include power hiking as a planned modality (not a failure mode).

### B. Back-to-back long runs (B2B)

- **When to enable B2B**: default ON for ultras, OFF for marathon and shorter (unless explicitly requested).
- **Progression rule**:
  - Start B2B with conservative ratios (example: Saturday longer, Sunday shorter).
  - Increase weekend long-run time by 10–20% every 1–2 weeks, then deload every 3–5 weeks.

### C. Nutrition training (gut training)

Fueling is not just race-day, it's trainable.

**Minimum fueling practice rule**:
- If `run_duration > 90 min`: practice carbs + fluids.
- If `run_duration > 3 hours`: practice higher carb rates if tolerated.

**Carb intake targets** (encode as ranges, not a single number):
- For endurance exercise > 1 hour: 30–60 g carbohydrate/hour
- For longer endurance events (often 3 hours+): up to ~90 g/hour (typically using multiple transportable carbs)

**Gut-training progression rule**:
- Start at the low end (30–40 g/h), increase by 10–15 g/h every 1–2 weeks if GI tolerance is good.
- Require the athlete to test at least 3–5 "bullseye foods" (a small trusted list for race day).

### D. Hydration planning (avoid both dehydration and overdrinking)

Ultra reviews highlight hyponatremia risk in long events, so your generator should prompt individualized hydration planning rather than one-size-fits-all.

### E. Musculoskeletal durability and downhill eccentric load

Because a large fraction of ultra runners report musculoskeletal problems and eccentric damage can dominate trail ultras, encode:
- Downhill exposure ramp (especially last 8–12 weeks if the course is downhill-heavy)
- Strength maintenance (hips, calves, quads) 1–2x/week

---

## Encoder-friendly configuration (YAML-style)

```yaml
race_distance_category_defaults:
  5k:
    quality_weights: { vo2: 0.55, thr: 0.35, rp: 0.05, strides: 0.05 }
    hard_quality_sessions_per_week: { min: 2, max: 3 }
    key_sessions_per_week: { min: 3, max: 4 }   # includes LR
    long_run:
      target_minutes_peak: [70, 105]
      structure: ["easy", "easy+strides"]
    taper:
      length_days: [5, 8]
      volume_multiplier_week_of: [0.50, 0.70]    # final week vs peak week
      intensity: "maintain"

  10k:
    quality_weights: { vo2: 0.45, thr: 0.45, rp: 0.05, strides: 0.05 }
    hard_quality_sessions_per_week: { min: 2, max: 3 }
    key_sessions_per_week: { min: 3, max: 4 }
    long_run:
      target_minutes_peak: [80, 120]
      structure: ["easy", "easy+steady_finish_10_20min"]
    taper:
      length_days: [7, 10]
      volume_multiplier_week_of: [0.45, 0.65]
      intensity: "maintain"

  half:
    quality_weights: { vo2: 0.15, thr: 0.65, rp: 0.15, strides: 0.05 }
    hard_quality_sessions_per_week: { min: 2, max: 2 }
    key_sessions_per_week: { min: 3, max: 3 }
    long_run:
      target_minutes_peak: [90, 150]
      structure: ["progression_to_hm_effort", "cruise_thr_blocks"]
    taper:
      length_days: [10, 14]
      volume_multiplier_week_minus_2: [0.65, 0.80]
      volume_multiplier_week_of: [0.45, 0.60]
      intensity: "maintain"

  marathon:
    quality_weights: { vo2: 0.05, thr: 0.35, rp: 0.55, strides: 0.05 }
    hard_quality_sessions_per_week: { min: 2, max: 2 }
    key_sessions_per_week: { min: 3, max: 3 }
    long_run:
      target_minutes_peak: [120, 180]
      structure: ["mp_blocks", "fast_finish_mp_30_60min"]
      fueling_practice_if_minutes_gt: 90
    taper:
      length_days: [14, 21]
      volume_multiplier_week_minus_3: [0.75, 0.85]  # if 3-week taper
      volume_multiplier_week_minus_2: [0.60, 0.75]
      volume_multiplier_week_of: [0.45, 0.60]
      intensity: "maintain"

  ultra:
    quality_weights: { vo2: 0.00, thr: 0.15, rp: 0.05, volume: 0.80 }
    hard_quality_sessions_per_week: { min: 1, max: 2 }
    key_sessions_per_week: { min: 2, max: 3 }  # often B2B counts as 2
    long_run:
      mode: "time_on_feet"
      single_run_cap_hours: [3, 6]
      prefer_back_to_back: true
      b2b_ratio_day1_day2: [0.60, 0.40]
      fueling_practice_if_minutes_gt: 90
    taper:
      length_days:
        ultra_50k: [10, 14]
        ultra_50m_100k: [14, 21]
        ultra_100m_plus: [21, 28]
      intensity: "mostly_maintain_but_reduce_work"
```

---

## Sources

- PMC: Defining the determinants of endurance running performance
- PMC: Factors Influencing Running Performance During a Marathon
- Frontiers: Physiology and Pathophysiology in Ultra-Marathon Running
- Carmichael Training Systems: How Long Should Your Longest Run Be Before An Ultramarathon?
- RUN | Powered by Outside: Back-to-Back Long Runs and Workouts
- PMC: Effects of tapering on performance in endurance athletes
- Educational Athletics: Tapering for Endurance Athletes
- Carmichael Training Systems: Tapering for Ultrarunning
- PMC: Carbohydrate Intake During Exercise
- ACSM: Energy Demands and Nutrition Considerations
- Carmichael Training Systems: Bullseye Nutrition Plan for Ultramarathon Runners
