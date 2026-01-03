# Injury Prevention & Return-to-Run Protocols

A "RunningPhysio-style" framework for injury alerts and conservative training modifications. Based on Tom Goom's consistent themes: load management, progressive strength, and using symptoms (during and especially 24 to 48 hours after) to guide decisions.

---

## 1) The Most Common Running Injuries

The five most prevalent running-related musculoskeletal injuries:

1. **Patellofemoral pain (runner's knee)** - highest prevalence (~16.7%)
2. **Medial tibial stress syndrome (shin splints)** - ~35% in some incidence studies
3. **Plantar heel pain (plantar fasciitis)** - ~6.1%
4. **Iliotibial band syndrome (ITBS)** - common lateral knee pain
5. **Achilles tendinopathy** - ~10.3%

*Source: Kakouris et al., 2021 systematic review*

---

## 2) Warning Signs to Watch For

### Universal "STOP / Get Assessed" Warning Signs (RED Flags)

Tom Goom's "don't run through this" list:

- **Swelling with significant pain**
- **Severe pain**
- **Joint locking or giving way**
- **Clear bony tenderness** (especially tibia, foot, metatarsals)
- **Pins and needles or numbness**
- **Referred or radiating pain patterns** (e.g., back pain with leg pain)
- **Any suggestion of stress fracture**: avoid running until a clinician says it's safe
- **Pain causes an obvious limp or altered gait** during the run
- **Pain is escalating run-to-run or week-to-week** rather than stabilizing or improving

### Injury-Specific Early Warnings

#### A. Plantar Heel Pain (Plantar Fasciitis)

**Common pattern to monitor:**
- "First-step" pain when getting out of bed, or pain worse after sitting then standing
- Pain that may warm up, then returns later with more time on feet

**Encodeable "getting worse" signals:**
- Morning first-step pain score trending up 2+ points week-over-week
- Pain spreading from a focal medial heel spot to broader foot pain
- A run that felt "OK" but produces worse next-morning first-step pain (latent response)

#### B. Achilles Tendinopathy

**Common pattern:**
- Morning stiffness and pain, "warms up" during activity, then can flare after harder loading

**Encodeable worsening:**
- Morning stiffness duration increasing (e.g., 10 minutes → 30 minutes)
- Post-run Achilles pain that does not settle by the next morning
- A "reactive" flare (swelling, sharp sensitivity) after a sudden load jump

#### C. IT Band Syndrome

**Common pattern:**
- Lateral knee pain that predictably starts at a certain time or distance into the run, often worse with downhill or fatigue

**Encodeable worsening:**
- Pain begins earlier than usual (e.g., used to start at 6 km, now starts at 2 km)
- You cannot find any modification that keeps the run pain-free or truly manageable

**RunningPhysio rule**: If you cannot modify to run pain-free or manageable, you need "proactive rest" from running (cross-train only if pain-free).

#### D. Shin Splints (Medial Tibial Stress Syndrome)

**Common pattern:**
- Diffuse pain along the posteromedial tibia that is load related

**High-concern pattern (possible stress fracture progression):**
- Pain becomes very focal (one small spot)
- Pain at rest or night pain
- Hopping is painful

**RunningPhysio treats MTSS as a bone stress injury**: should be pain-free during and after exercise, especially impact.

#### E. Runner's Knee (Patellofemoral Pain)

**Common pattern:**
- Pain around or behind the kneecap with running, hills, stairs, squatting, prolonged sitting

**Encodeable worsening:**
- Pain with stairs (especially descent) increasing
- Unable to tolerate loaded knee flexion in rehab without flare
- Running form changes (over-striding, visible hip drop, excessive hip adduction) correlate with pain

---

## 3) Evidence-Based Prevention Strategies

**Core principle**: Increase tissue capacity faster than you increase load.

### A. Strength Work (Capacity Builders)

**Evidence base:**
- Large systematic review found strength training reduced sports injuries substantially and overuse injuries by nearly half (Lauersen et al., 2014)
- Running-specific evidence suggests exercise-based prevention programs need supervision and adherence support

**Minimum Effective Strength Targets by Injury:**

| Target Area | Key For |
|-------------|---------|
| Calf complex (soleus + gastroc) | Achilles, load absorption |
| Quads + hip (glute max/med) | PFP, ITBS |
| Foot intrinsics + big toe + ankle invert/evert | Plantar heel pain |
| Weight-bearing strength + graded plyometrics | MTSS bone capacity |

**Achilles-specific loading:**
- Heavy, slow resistance approach over ~12 weeks
- Progress from higher reps toward heavier lower reps
- Stay at manageable symptom level

**Plantar heel pain loading:**
- High-load strength training using slow heel raises
- 3 seconds up, 2 seconds hold, 3 seconds down
- Progressive loading from 12RM toward heavier

### B. Load Management (The Biggest Lever)

**The "Single-Run Spike" Rule (Very Encodeable):**
- Injury rate increases when single session distance exceeds 110% of longest run in prior 30 days
- Encode as a primary risk alert

**RunningPhysio Graded-Return Principles:**
1. Work below your "break point"
2. Rest day between runs (and after a rehab day)
3. Change 1 thing at a time
4. Progress gradually when comfortable

### C. Shoes (Symptom Modifiers + Risk Management)

**Comfort matters:**
- Greater perceived cushioning and overall shoe appreciation associated with lower injury risk

**Rotation may reduce risk:**
- Using more than one pair of running shoes = ~39% lower risk

**Injury-specific shoe logic:**
- **For Achilles**: consider heel lifts or higher heel-to-toe drop
- **For plantar heel pain**: footwear comfort and a drop that helps symptoms

---

## 4) When to Reduce Training vs When to Stop

### Define Your Inputs (Per Run)

```yaml
inputs:
  - pain_during: 0-10
  - pain_trend_during: [better, same, worse]
  - gait_change: boolean
  - swelling_locking_givingway_neuro: boolean
  - next_morning_pain: 0-10
  - next_morning_stiffness_minutes: number
  - pain_48h: 0-10
  - site: [heel, achilles, lateral_knee, shin, anterior_knee]
  - bony_tenderness_focal: boolean
  - run_distance: number
  - longest_run_30d: number
```

### Universal STOP Rules (RED)

Trigger **STOP RUNNING + seek clinical guidance** if any:
- `swelling_locking_givingway_neuro == true`
- `bony_tenderness_focal == true` (especially shin/foot)
- Suspected stress fracture pattern
- `gait_change == true` (limp or compensations)

### "Reduce Training" Rules (AMBER)

Trigger conservative downshift if:
- `pain_during >= 4` OR `pain_trend_during == worse`
- `next_morning_pain` is higher than baseline AND not settling
- Symptoms not improving week-to-week (trend flat or worsening)
- `run_distance > 1.10 * longest_run_30d` (single-run spike risk)

**Default AMBER Modification Package:**
- Reduce next 7 days running volume by 25-40%
- Remove intensity (no intervals, no hills)
- Keep pace easy and constant
- Add 1 extra rest day between runs
- Consider run-walk structure for all runs until stable

### "Continue But Modify" Rules (GREEN with Guardrails)

Allow running to continue if ALL true:
- `pain_during <= 3`
- `pain_trend_during` is stable or improves
- No gait change
- Pain settles quickly afterward and is not worse the next morning

### Special Rule for MTSS and Bone Stress

**BONE-STRESS RULE:**
```
if site == shin:
  require: pain_during == 0 AND next_morning_pain == 0
  for: impact running and plyometrics
  else: switch to non-impact conditioning and strength only
```

---

## 5) Return-to-Run Protocols After Injury

### A. Readiness Checks (Before Starting)

**Impact testing progression**: jump → bound → hop
- Land quietly and pain-free
- Build to 10 consecutive pain-free hops before returning to running

**Encodeable "ready to run" gate:**
```yaml
ready_to_run:
  - hop_test_consecutive >= 10 pain-free AND controlled
  - swelling == false
  - full_range_of_motion == true
  - ideally_pain_free: true
```

### B. The Break-Point Baseline Method

**Baseline definition**: The distance you can run at easy pace without pain during the run and for 48 hours after.

**Then:**
- Set `baseline = 0.80 to 0.90 * tested_painfree_distance` (take 10-20% off)

### C. The 4 Rules of Progression

1. Work below break point
2. Rest day between each run (and after a rehab day)
3. Change one thing at a time
4. Progress gradually when comfortable

### D. Conservative 2-Week Block Progression

**Weeks 1-2:**
- Run 2-3 times per week, always separated by a rest day
- 2 shorter runs at 50-60% of baseline distance
- 1 "long" run at baseline distance
- No speedwork, no hills

**Progression rule:**
- Every 2 weeks: if symptoms stable or improving, increase baseline by 5-10%
- If symptoms flare: revert baseline by 10-20% and hold 1-2 weeks

### E. If Baseline is Tiny, Use Run-Walk

**Encodeable run-walk reducer:**
```yaml
run_walk_protocol:
  start:
    run_interval: 30-60s
    walk_interval: 60-120s
    repeat_to: target_total_time
  progression:
    every_days: 3-7 (if stable)
    run_time_increase: 10-20%
    walk_time_decrease: 10-20%
  stop_if:
    - pain_escalates
    - gait_changes
```

### F. Injury-Specific Return Constraints

**Tendon or plantar fascia (Achilles, plantar heel pain):**
- Keep running pain mild (default <=3/10)
- Ensure it settles by next morning
- Does not worsen week-to-week

**MTSS / bone stress:**
- Do not progress impact unless pain-free during and after

**ITBS:**
- Return only if you can run pain-free or at truly manageable level
- Otherwise proactive rest then graded return

**PFP:**
- Progress loading based on irritability
- If loaded knee flexion not tolerated, bias rehab toward hip work first

---

## Encodeable Rules (JSON Format)

```json
{
  "global_red_flags_stop": [
    "swelling == true",
    "locking == true",
    "giving_way == true",
    "numbness_or_pins_and_needles == true",
    "bony_tenderness_focal == true",
    "suspected_stress_fracture == true",
    "gait_change_or_limp == true"
  ],
  "global_green_run_allowed_if": {
    "pain_during_max": 3,
    "pain_trend_during_allowed": ["same", "better"],
    "next_morning_pain_not_worse": true,
    "no_gait_change": true
  },
  "global_amber_reduce_if_any": [
    "pain_during >= 4",
    "pain_trend_during == 'worse'",
    "next_morning_pain > baseline_next_morning_pain",
    "pain_48h > baseline_48h_pain",
    "week_to_week_symptoms_worsening == true",
    "run_distance > 1.10 * longest_run_30d"
  ],
  "bone_stress_override": {
    "if_site_in": ["shin", "foot", "metatarsal"],
    "require_for_running": [
      "pain_during == 0",
      "next_morning_pain == 0",
      "hop_test_pain_free == true"
    ]
  },
  "default_amber_modifications": {
    "next_7_days_run_volume_reduction_percent": [25, 40],
    "no_speedwork": true,
    "no_hills": true,
    "add_rest_day_between_runs": true,
    "use_run_walk": true
  },
  "return_to_run": {
    "readiness_gate": [
      "hop_consecutive_pain_free >= 10",
      "swelling == false",
      "full_rom == true"
    ],
    "baseline_definition": "max_easy_distance_painfree_during_and_48h_after",
    "baseline_start_multiplier": [0.80, 0.90],
    "principles": [
      "stay_below_breakpoint",
      "rest_day_between_runs",
      "change_one_thing_at_a_time",
      "progress_gradually_when_comfortable"
    ],
    "progression_check_every_days": 14,
    "baseline_increase_percent_if_stable": [5, 10],
    "baseline_decrease_percent_if_flare": [10, 20]
  }
}
```

---

## Sources

- RunningPhysio: Should you run through pain?
- RunningPhysio: Returning to running after injury
- RunningPhysio: What are the key treatments for Achilles Tendinopathy?
- RunningPhysio: What's current 'best practice' for PFP?
- RunningPhysio: Plantar Fasciitis & Plantar Heel Pain
- RunningPhysio: Iliotibial Band Syndrome
- RunningPhysio: Exercises for Medial Tibial Stress Syndrome
- PubMed: Kakouris et al., 2021 - Systematic review of running-related musculoskeletal injuries
- PubMed: Lauersen et al., 2014 - Effectiveness of exercise interventions to prevent sports injuries
- PubMed: Frandsen et al., 2025 - How much running is too much?
- PubMed: Malisoux et al., 2015 - Parallel use of different running shoes
- PubMed Central: Malisoux et al., 2025 - Association of Shoe Cushioning Perception and Comfort
