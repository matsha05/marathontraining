# CoachSpec: Hybrid Marathon Training Engine
## Deterministic Plan Generation for 5K to Ultramarathon

> **Critical**: This spec is designed for a plan generator with NO LLM access, NO browsing capability. Every rule, threshold, and decision tree must be fully encoded. The coach makes decisions using ONLY the data structures and algorithms defined below.

---

## Table of Contents

1. [Philosophy & Priority Hierarchy](#1-philosophy--priority-hierarchy)
2. [Athlete Input Schema](#2-athlete-input-schema)
3. [VDOT & Pace Calculator](#3-vdot--pace-calculator)
4. [Weekly Structure Engine](#4-weekly-structure-engine)
5. [Race Distance Adaptation](#5-race-distance-adaptation)
6. [Intensity Distribution (Polarized)](#6-intensity-distribution-polarized)
7. [Long Run Rules](#7-long-run-rules)
8. [Strength Integration](#8-strength-integration)
9. [Durability System](#9-durability-system)
10. [Nutrition & Fueling](#10-nutrition--fueling)
11. [Injury Prevention & Monitoring](#11-injury-prevention--monitoring)
12. [Progression & Periodization](#12-progression--periodization)
13. [Taper Rules](#13-taper-rules)
14. [Daily Plan Generator Algorithm](#14-daily-plan-generator-algorithm)

---

## 1. Philosophy & Priority Hierarchy

### 1.1 Target User Profile

- Former strength athletes (CrossFit, lifting) transitioning to running
- Want to maintain strength and durability while building endurance
- Injury-prone due to new loading patterns
- Time-constrained (8-12 hours/week max for most)

### 1.2 Priority Stack (Non-Negotiable Order)

```
1. DURABILITY     → Can you absorb training load without breaking?
2. CONSISTENCY    → Are you training regularly without forced breaks?
3. SPECIFICITY    → Is your training matched to your goal race?
4. PERFORMANCE    → Are you getting faster/stronger?
```

**Implementation**: When conflicts arise, always sacrifice lower-priority items first.

### 1.3 Philosophy Integration

| Source | Core Principle | How We Encode It |
|--------|----------------|------------------|
| Hansons | Cumulative fatigue through frequency | 6 run days/week, no rest before long run |
| Daniels | VDOT-based pacing zones | All paces derived from single race input |
| Seiler | 80/20 intensity distribution | Zone guardrails on weekly totals |
| Starrett/Dicharry | Movement standards gate training | Daily durability assessment drives modules |
| ACSM | Minimal effective dose strength | 1-2 sessions/week, compound focus |

---

## 2. Athlete Input Schema

```yaml
athlete:
  # Identity
  id: string
  name: string
  
  # Physical
  weight_kg: float                    # Required for nutrition calculations
  age: int                            # For recovery scaling
  sex: enum [male, female]            # For some physiological defaults
  
  # Experience
  running_experience_months: int      # 0 = brand new runner
  strength_background: enum [none, recreational, intermediate, advanced]
  injury_history: [
    {
      type: enum [pfp, achilles, shin, plantar, itbs, other],
      recency_months: int,
      severity: enum [mild, moderate, severe]
    }
  ]
  
  # Current Fitness
  vdot_source: {
    race_distance_m: float,           # Minimum 800m
    race_time_seconds: float,
    race_date: date
  }
  current_weekly_volume_minutes: int  # What they're doing now
  
  # Goal
  goal_race: {
    distance: enum [5k, 10k, half, marathon, ultra_50k, ultra_50m, ultra_100k, ultra_100m],
    date: date,
    terrain: enum [road, trail, mountain]
  }
  
  # Constraints
  available_days_per_week: int        # 3-7
  max_session_minutes: int            # Longest single session allowed
  equipment: [enum]                   # [barbell, dumbbells, kettlebell, bodyweight, none]
  
  # Thresholds (from testing or defaults)
  hr_zones: {
    vt1_bpm: int,                     # First ventilatory threshold
    vt2_bpm: int,                     # Second ventilatory threshold
    max_hr: int
  }
```

---

## 3. VDOT & Pace Calculator

### 3.1 VDOT Calculation from Race Result

```python
import math

def vdot_from_race(distance_m: float, time_seconds: float) -> float:
    """
    Calculate VDOT from a race performance.
    Minimum distance: 800m (enforced)
    """
    if distance_m < 800:
        raise ValueError("Distance must be >= 800m")
    
    T = time_seconds / 60.0  # Convert to minutes
    v = distance_m / T       # Velocity in m/min
    
    # VO2 demand at race velocity
    VO2 = -4.6 + 0.182258 * v + 0.000104 * (v ** 2)
    
    # Fraction of VO2max sustainable for duration T
    pct = 0.8 + 0.1894393 * math.exp(-0.012778 * T) + 0.2989558 * math.exp(-0.1932605 * T)
    
    return VO2 / pct
```

### 3.2 Training Zones from VDOT

| Zone | Name | VO2max % | HRmax % | Use Cases |
|------|------|----------|---------|-----------|
| E | Easy | 59-74% | 65-79% | Warm-up, cooldown, recovery, easy runs, long runs |
| M | Marathon | 75-84% | 80-90% | Steady runs, MP blocks |
| T | Threshold | 83-88% | 88-92% | Tempo, cruise intervals |
| I | Interval | 97-100% | 98-100% | VO2max intervals |
| R | Repetition | ~mile pace | N/A | Speed, economy work |

### 3.3 Pace Calculator Implementation

```python
def speed_from_vo2_target(vo2_target: float) -> float:
    """
    Invert VO2 equation to get speed in m/min.
    Solve: 0.000104*v^2 + 0.182258*v - 4.6 - vo2_target = 0
    """
    a = 0.000104
    b = 0.182258
    c = -4.6 - vo2_target
    disc = b * b - 4 * a * c
    return (-b + math.sqrt(disc)) / (2 * a)

def zone_pace_range(vdot: float, frac_low: float, frac_high: float, unit_meters: float) -> tuple:
    """
    Returns (fast_pace_seconds, slow_pace_seconds) for the distance unit.
    unit_meters: 1000 for km, 1609.344 for mile
    """
    v_slow = speed_from_vo2_target(frac_low * vdot)
    v_fast = speed_from_vo2_target(frac_high * vdot)
    
    return (
        unit_meters / v_fast * 60,  # Fast pace (seconds per unit)
        unit_meters / v_slow * 60   # Slow pace (seconds per unit)
    )

# Zone definitions
ZONE_FRACTIONS = {
    'E': (0.59, 0.74),
    'M': (0.75, 0.84),
    'T': (0.83, 0.88),
    'I': (0.97, 1.00),
}
```

### 3.4 Easy Pace Guardrails

```yaml
easy_pace_rules:
  output_as_range: true              # Never a single number
  label_fast_end_as_ceiling: true    # "Up to X:XX" not "X:XX"
  day_variation_allowed_sec_per_mile: 20
  override_conditions:
    - heat: "run slower end of range"
    - hills: "run slower end of range"  
    - tired: "run slower end of range"
    - poor_sleep: "run slower end of range"
  effort_validation: "Should be conversational. If you can't talk, slow down."
```

### 3.5 VDOT Update Rules

```yaml
vdot_update:
  # Primary: new race result
  on_new_race:
    action: "recalculate_vdot"
    require: "race_was_maximal_effort"
  
  # Secondary: manual progression (no race available)
  no_race_progression:
    conditions:
      - training_going_well: true
      - no_undue_stress: true
      - weeks_since_last_update: ">= 4"
    action: "vdot += 1"
    max_frequency: "every 4-6 weeks"
    block_further_bumps_until: "4 weeks OR new race"
```

### 3.6 VDOT Calibration for Beginners (Oracle Research)

Athletic beginners (CrossFit converts, etc.) often have high VO2max but poor running economy. Their lab/Garmin VO2max overestimates running performance.

```yaml
vdot_calibration:
  # Three distinct VDOT types
  vdot_types:
    seedVDOT: "Initial estimate from VO2max, Garmin, or Strava"
    rVDOT: "Race VDOT - validated by actual race performance"
    tVDOT: "Training VDOT - what we use for daily paces"
  
  # Relationship: tVDOT <= rVDOT <= seedVDOT always
  
  # Experience-based multipliers (running_experience_months)
  experience_multipliers:
    months_0_6: 0.80    # New runners
    months_6_12: 0.85
    months_12_24: 0.90
    months_24_plus: 1.00
  
  # Volume-based penalty (current_weekly_volume_minutes)
  volume_multipliers:
    under_90: 0.85      # Very low volume
    90_to_180: 0.92
    180_to_300: 0.97
    over_300: 1.00
  
  # CrossFit convert gap rule
  crossfit_convert_rule:
    if_strength_background: "advanced"
    and_running_experience_months: "< 12"
    then:
      apply_additional_penalty: 0.05  # Extra 5% reduction
      reason: "High power but poor running economy"
  
  # tVDOT calculation
  training_vdot_formula:
    tVDOT = seedVDOT * experience_multiplier * volume_multiplier
    tVDOT = tVDOT - crossfit_penalty_if_applicable
    tVDOT = max(tVDOT, seedVDOT * 0.70)  # Floor at 70% of seed
```

### 3.7 VDOT Estimation Methods (Accuracy Ranking)

```yaml
vdot_estimation_accuracy:
  tier_1_gold:
    - "Race result (5K-half marathon, maximal effort)"
    - "Time trial (controlled conditions, maximal effort)"
  
  tier_2_silver:
    - "Workout data (consistent threshold/interval times)"
    - "Strava Relative Effort trends (trained users)"
  
  tier_3_bronze:
    - "Garmin VO2max (running-derived)"
    - "WHOOP Cardiovascular Score"
  
  tier_4_noisy:
    - "Lab VO2max test"  # No running economy factor
    - "Garmin VO2max from non-running"
    - "Self-reported"
```

### 3.8 Auto-Calibration Algorithm

```yaml
auto_calibration:
  principle: "Fast downward corrections, slow upward updates"
  
  # Failure signals (adjust down immediately)
  failure_signals:
    rep_3_failure:
      trigger: "Cannot complete rep 3+ of interval set at prescribed pace"
      action: "tVDOT -= 1 to 2"
    
    talk_test_failure:
      trigger: "Cannot hold conversation during easy runs"
      action: "Widen easy pace range by 10-15 sec/mile on slow end"
    
    hr_mismatch:
      trigger: "Easy run HR consistently > VT1 threshold"
      action: "tVDOT -= 1"
  
  # Success signals (adjust up slowly)
  success_signals:
    consistent_threshold:
      trigger: "4+ weeks of threshold work at prescribed pace without struggle"
      action: "tVDOT += 0.5"
      frequency: "max every 4 weeks"
    
    race_validation:
      trigger: "Race result implies higher VDOT"
      action: "Update rVDOT, then tVDOT = min(rVDOT, tVDOT + 1)"
  
  # Convergence
  convergence_rule:
    over_months: 6
    target: "tVDOT approaches rVDOT as running economy develops"
```

---

## 4. Weekly Structure Engine

### 4.1 Hansons-Based Weekly Template (6 Run Days)

```yaml
weekly_template_6_day:
  monday:
    type: "easy"
    purpose: "recovery from weekend long run"
  tuesday:
    type: "SOS"  # Something of Substance
    workout: "speed_or_strength"
  wednesday:
    type: "rest_or_cross"
    purpose: "midweek recovery"
  thursday:
    type: "SOS"
    workout: "tempo_at_goal_pace"
  friday:
    type: "easy"
    purpose: "pre-long run easy"
  saturday:
    type: "easy"
    purpose: "pre-long run easy, slightly longer"
  sunday:
    type: "SOS"
    workout: "long_run"
```

### 4.2 SOS Session Rules

```yaml
sos_rules:
  max_per_week: 3
  definition: ["speed_or_strength", "tempo", "long_run"]
  
  # Hansons cumulative fatigue principle
  cumulative_fatigue:
    no_rest_before_long_run: true
    no_rest_after_long_run: true
    rest_day_position: "midweek"
  
  # If a session is missed
  missed_session:
    action: "skip_do_not_reschedule"
    rationale: "No stacking - resume plan sequence"
```

### 4.3 Warmup/Cooldown Standards

```yaml
warmup_cooldown:
  speed_strength_session:
    warmup_miles: [1.0, 1.5]
    cooldown_miles: [0.75, 1.0]
  tempo_session:
    warmup_miles: [1.0, 1.5]
    cooldown_miles: [0.75, 1.0]
  long_run:
    warmup: "first 10-15 min at very easy pace"
    cooldown: "last 5-10 min slow down naturally"
```

---

## 5. Race Distance Adaptation

### 5.1 Quality Allocation Weights

The plan generator adjusts workout emphasis based on goal race:

```yaml
quality_weights_by_distance:
  5k:
    vo2: 0.55
    threshold: 0.35
    race_pace: 0.05
    strides: 0.05
    
  10k:
    vo2: 0.45
    threshold: 0.45
    race_pace: 0.05
    strides: 0.05
    
  half:
    vo2: 0.15
    threshold: 0.65
    race_pace: 0.15
    strides: 0.05
    
  marathon:
    vo2: 0.05
    threshold: 0.35
    race_pace: 0.55
    strides: 0.05
    
  # Ultra distances - emphasis shifts to hills + volume + fueling
  ultra_50k:
    vo2: 0.00
    threshold: 0.20       # T-lite, controlled
    hills: 0.35           # Uphill tempo, grade work
    volume: 0.40          # Time-on-feet
    strides: 0.05
    quality_minutes_cap_pct: 0.18
    
  ultra_50m:
    vo2: 0.00
    threshold: 0.15
    hills: 0.40
    volume: 0.40
    strides: 0.05
    quality_minutes_cap_pct: 0.15
    
  ultra_100k:
    vo2: 0.00
    threshold: 0.10
    hills: 0.35
    volume: 0.50
    strides: 0.05
    quality_minutes_cap_pct: 0.12
    
  ultra_100m:
    vo2: 0.00
    threshold: 0.05
    hills: 0.30
    volume: 0.60
    strides: 0.05
    quality_minutes_cap_pct: 0.10
```

### 5.2 Hard Quality Sessions Per Week

```yaml
quality_sessions_by_distance:
  5k:
    hard_quality_per_week: [2, 3]
    key_sessions_per_week: [3, 4]  # includes long run
  10k:
    hard_quality_per_week: [2, 3]
    key_sessions_per_week: [3, 4]
  half:
    hard_quality_per_week: [2, 2]
    key_sessions_per_week: [3, 3]
  marathon:
    hard_quality_per_week: [2, 2]
    key_sessions_per_week: [3, 3]
  ultra:
    hard_quality_per_week: [1, 2]  # often 1
    key_sessions_per_week: [2, 3]  # B2B counts as 2
```

### 5.3 Tuesday Workout Progression (Hansons Speed→Strength)

```yaml
tuesday_phase_rules:
  # For marathon training
  marathon:
    if_weeks_to_race > 7:
      type: "speed"
      intervals: ["400m", "600m", "800m", "1km", "1200m"]
      pace: "5k_to_10k_pace"
    else:
      type: "strength"
      intervals: ["6x1mi", "4x1.5mi", "3x2mi", "2x3mi"]
      pace: "MP_minus_10_sec_per_mile"
  
  # For 5K/10K: mostly speed
  short_races:
    type: "speed"
    intervals: ["200m", "400m", "600m", "800m", "1000m"]
    pace: "5k_pace_or_faster"
```

### 5.4 Thursday Tempo Progression (Hansons)

```yaml
tempo_progression:
  marathon:
    start_miles: [5, 6]
    increase_every_weeks: [2, 3]
    increase_amount_miles: 1
    max_miles: 10
    pace: "goal_marathon_pace"
  half:
    start_miles: [4, 5]
    max_miles: 8
    pace: "goal_half_marathon_pace"
  10k:
    start_miles: [3, 4]
    max_miles: 6
    pace: "threshold_pace"
```

---

## 6. Intensity Distribution (Polarized)

### 6.1 Seiler 3-Zone Classification

```yaml
zone_classification:
  zone_1_low:
    definition: "Below VT1 (first ventilatory threshold)"
    lactate_anchor: "< 2 mM"
    feel: "Conversational, easy breathing"
    hr_guidance: "Below 80% HRmax typically"
    
  zone_2_moderate:
    definition: "Between VT1 and VT2"
    lactate_anchor: "~2-4 mM"
    feel: "Comfortably hard, short phrases only"
    warning: "THIS IS THE ZONE TO MINIMIZE"
    
  zone_3_high:
    definition: "Above VT2 (second ventilatory threshold)"
    lactate_anchor: ">= 4 mM"
    feel: "Hard breathing, few words only"
```

### 6.2 Weekly Distribution Guardrails

```yaml
polarized_distribution:
  # Strict polarized (default)
  strict_polarized:
    zone_1_percent: [75, 85]
    zone_2_percent_max: 10          # HARD CAP
    zone_3_percent: [10, 20]
    fail_if:
      - zone_1 < 0.75
      - zone_2 > 0.10
      - zone_3 < 0.08 OR zone_3 > 0.25
  
  # Marathon-adapted (permits controlled MP work)
  marathon_adapted:
    zone_1_percent: [70, 85]
    zone_2_percent_max: 20
    zone_3_percent_max: 20
    fail_if:
      - zone_1 < 0.70
      - zone_2 > 0.20
      - zone_3 > 0.20
```

### 6.3 Session-Level Guardrails

```yaml
session_guardrails:
  easy_run:
    zone_2_plus_zone_3_max_percent: 10  # Prefer <= 5%
    zone_3_max_percent: 0
    
  quality_run:
    zone_3_work_minutes: [12, 30]  # Recreational friendly
    warmup_cooldown: "mostly zone_1"
    
  hard_spacing:
    max_quality_sessions_per_7_days: 2
    no_back_to_back_quality: true
    
  marathon_pace_workout:
    zone_2_minutes_max: 60
    remaining_minutes: "zone_1"
```

### 6.4 Interval Session Zone Correction

```yaml
interval_zone_correction:
  # HR time-in-zone underestimates high intensity (HR lag)
  # Use session-goal approach for intervals
  if_session_tagged_interval:
    classify_work_intervals_as: "zone_3"
    classify_recovery_warmup_cooldown: "normal_hr_classification"
```

---

## 7. Long Run Rules

### 7.1 Global Safety Rails

```yaml
long_run_constraints:
  # Hansons-based caps
  max_distance_miles: 16
  max_duration_minutes: 180
  max_percent_of_weekly_mileage: 0.30
  
  # Calculate actual cap (use strictest)
  actual_cap: "min(16, 0.30 * weekly_mileage, easy_pace_mph * 3)"
  
  # Spacing
  hours_from_hardest_vo2_workout: ">= 48"
```

### 7.2 Long Run Structure by Distance

```yaml
long_run_by_race:
  5k:
    target_minutes: [70, 105]
    structure: ["easy", "easy+6-10_strides_at_end"]
    progression: "increase 5-10 min every 1-2 weeks"
    
  10k:
    target_minutes: [80, 120]
    structure: ["easy", "steady_finish_last_10-20min"]
    
  half:
    target_minutes: [90, 150]
    structures:
      - "progression_LR: last 20-40 min toward HM pace"
      - "cruise_blocks: 2-3 x 10-15 min @ THR with easy floats"
    
  marathon:
    target_minutes: [120, 180]
    structures:
      - "mp_blocks: 2-3 x 20-40 min @ MP inside LR"
      - "fast_finish: last 30-60 min at MP"
    fueling_practice_if_minutes_gt: 90
    
  ultra:
    mode: "time_on_feet"
    single_run_cap_hours: [3, 5]
    prefer_back_to_back: true
    b2b_ratio: [0.60, 0.40]  # Day1 longer, Day2 shorter
```

### 7.3 Hansons Alternating Long Run Pattern

```yaml
alternating_pattern:
  enabled_for: ["half", "marathon"]
  pattern: "LONG, SHORT, LONG, SHORT..."
  
  long_week:
    long_run: "progress toward max (16 mi or 3 hr)"
  short_week:
    long_run: "60-70% of LONG week distance"
    typical: "~10 miles when LONG is 16"
  
  peak_long_runs_count: 3  # Only 3 runs hit 16 miles
```

---

### 7.4 Ultra Engine Configuration (Oracle Research)

```yaml
ultra_engine:

  # 1) Volume unit selection
  volume_units:
    if_terrain_in: ["trail","mountain"]
      primary_unit: "minutes"   # Time-based for trail
    if_terrain_eq: "road"
      primary_unit: "miles"
    long_run_always_time_based: true

  # 2) Long run caps (hours) by race and terrain
  long_run_caps_hours_by_race:
    ultra_50k:
      road:    [2.5, 3.5]
      trail:   [3.0, 4.0]
      mountain:[3.0, 4.0]
    ultra_50m:
      road:    [3.0, 4.0]
      trail:   [4.0, 5.0]
      mountain:[4.0, 5.5]
    ultra_100k:
      road:    [3.5, 4.5]
      trail:   [4.0, 5.5]
      mountain:[4.5, 6.0]
    ultra_100m:
      road:    [4.0, 5.5]
      trail:   [5.0, 6.0]
      mountain:[5.0, 7.0]

  # 3) Weekend total caps (B2B weeks)
  long_weekend_total_caps_hours:
    ultra_50k:  [4.0, 6.0]
    ultra_50m:  [6.0, 8.0]
    ultra_100k: [7.0, 10.0]
    ultra_100m: [8.0, 12.0]

  # 4) Percent-of-week safety rails
  weekend_percent_of_weekly_time_max:
    ultra_50k: 0.50
    ultra_50m: 0.55
    ultra_100k: 0.55
    ultra_100m: 0.60
  single_long_run_percent_of_weekly_time_max:
    ultra_50k: 0.40
    ultra_50m: 0.38
    ultra_100k: 0.35
    ultra_100m: 0.33
```

### 7.5 Back-to-Back (B2B) Rules

```yaml
b2b_rules:
  enabled_for: ["ultra_50m","ultra_100k","ultra_100m"]
  optional_for: ["ultra_50k"]   # Only if mountain or slow finish
  
  ratio_defaults:
    ultra_50k:  [0.65, 0.35]    # Day1 / Day2
    ultra_50m:  [0.60, 0.40]
    ultra_100k: [0.60, 0.40]
    ultra_100m: [0.55, 0.45]
  
  second_day_reduction_rule: "day2 = 0.50 to 0.75 * day1"
  
  frequency:
    BASE:  "every_3_weeks"
    BUILD: "every_2_weeks"
    PEAK:
      ultra_50m:  "every_2_weeks"
      ultra_100k: "every_2_weeks"
      ultra_100m: "every_1_to_2_weeks"
  
  gates_to_introduce:
    require_injury_status: "green"
    require_no_amber_last_days: 14
    require_long_run_minutes_gte:
      ultra_50k:  135
      ultra_50m:  150
      ultra_100k: 165
      ultra_100m: 180
    require_weekly_minutes_gte:
      ultra_50k:  300
      ultra_50m:  360
      ultra_100k: 420
      ultra_100m: 450
  
  progression_guardrail:
    duration_spike_max_percent: 10
    duration_spike_max_minutes: 30
    use_strictest: true
```

### 7.6 Vertical Training Targets

```yaml
vertical_training:
  mode:
    if_goal_race_vertical_gain_present: "vert_gain"
    else: "uphill_minutes"
  
  uphill_minutes_targets_by_phase:
    ultra_50k:
      BASE:  [20, 45]
      BUILD: [40, 75]
      PEAK:  [60, 120]
    ultra_50m:
      BASE:  [30, 60]
      BUILD: [60, 120]
      PEAK:  [90, 180]
    ultra_100k:
      BASE:  [40, 75]
      BUILD: [75, 150]
      PEAK:  [120, 240]
    ultra_100m:
      BASE:  [45, 90]
      BUILD: [90, 180]
      PEAK:  [150, 300]
  
  weekly_peak_vert_ranges_ft:
    ultra_50k:  [4000, 8000]
    ultra_50m:  [6000, 12000]
    ultra_100k: [8000, 16000]
    ultra_100m: [10000, 20000]
  
  phase_multipliers:
    BASE: 0.50
    BUILD: 0.75
    PEAK: 1.00
    TAPER: "reduce with volume, keep 1 hill exposure"
  
  downhill_exposure:
    target_as_fraction_of_uphill: [0.6, 1.0]
    if_downhill_access_low: "use_eccentric_strength_module"
```

### 7.7 Fueling Skill Progression

```yaml
fueling_training:
  start_practice_if_session_minutes_gte: 90
  
  carb_targets_g_per_hour_by_phase:
    BASE:  [30, 60]
    BUILD: [60, 75]
    PEAK:  [75, 90]
  
  distance_targets_g_per_hour:
    ultra_50k:  [60, 75]
    ultra_50m:  [75, 90]
    ultra_100k: [75, 90]
    ultra_100m: [75, 90]
  
  gut_training_ramp:
    start: 45
    increase_per_period: 10
    period_days: [7, 14]
    regress_if_gi_issues_2x_in_14d: true
    regress_amount: -10
    regress_hold_days: 14
  
  hydration:
    fluid_ml_per_hour: [400, 800]
    sodium_mg_per_hour: [300, 600]
    salty_sweater_sodium_max: 900
  
  long_run_requires_fueling_if_minutes_gte: 120
```

### 7.8 Night Running & Walking Skills (100K/100M)

```yaml
night_training:
  enabled_for: ["ultra_100k","ultra_100m"]
  sessions_total:
    ultra_100k: [1, 2]
    ultra_100m: [2, 4]
  schedule_weeks_out: [14, 4]
  session_duration_minutes: [45, 120]
  rules:
    - "no_night_session_within_7d_of_b2b"
    - "night_sessions_are_zone_1_only"
    - "next_day_is_easy_or_rest"
  preferred_type:
    - "finish_long_run_in_dark"
    - "easy_night_run_with_headlamp"
  max_overnight_simulations: 1

walking_skill:
  enable_if:
    - goal_race.distance_in: ["ultra_100k","ultra_100m"]
    - goal_race.terrain == "mountain"
  power_hike_trigger_grade_degrees: 15
  micro_walks:
    protocol: "30-45 sec walk every 20-30 min for fueling"
    enable_if_run_minutes_gte: 120
  structured_run_walk:
    ultra_100k_flat: "run 25 / walk 5"
    ultra_100m_flat: "run 20 / walk 5 (early), run 15 / walk 5 (late)"
    climbs: "power hike early and often"
  power_hike_training:
    weekly_session_in_build: "6-10 x 3 min power hike uphill, easy down"
    long_run_hike_blocks: "10 min every 45-60 min"
```

---

## 8. Strength Integration

### 8.1 Minimal Effective Dose Principle

```yaml
marathon_phase_strength:
  # Tier 1: Absolute minimum (time-crunched)
  tier_1_minimum:
    sessions_per_week: 1
    sets_per_exercise: 1
    exercises: "4-6 compounds"
    intensity: "heavy (maintain relative load, no light circuits)"
  
  # Tier 2: Recommended minimum (most hybrids)
  tier_2_recommended:
    sessions_per_week: 2
    sets_per_exercise_main: [1, 2]
    sets_accessories: 1
    intensity: ">= 85% 1RM OR 80-85% for 6-8 reps"
    total_weekly_hard_sets: "keep low"
```

### 8.2 Concurrent Training Interference Controls

```yaml
interference_controls:
  # Separation rules
  within_day_scheduling:
    preferred_separation_hours: 24
    minimum_separation_hours: 6
    emergency_minimum_hours: 3
    if_same_day_order: "strength THEN endurance"
  
  # Weekly placement
  placement_rules:
    avoid_heavy_lower: "24-48 hours before long run"
    avoid_heavy_lower: "24-48 hours before hardest interval day"
    pair_heavy_strength_with: "easy run days"
    
  # Volume controls
  interference_risk_flags:
    - "endurance_frequency_high"
    - "endurance_session_duration_high"
    - "running_volume_high"
```

### 8.3 Sample Microcycle (2 Lifts/Week, Marathon)

```yaml
sample_week:
  monday:
    am: "Strength (full-body, lower emphasis)"
    pm: "Easy run (6-24h later)"
  tuesday:
    main: "Quality run (intervals/tempo)"
  wednesday:
    main: "Rest or cross-train"
  thursday:
    am: "Strength (full-body, upper/posterior emphasis)"
    pm: "Easy run (6-24h later)"
  friday:
    main: "Easy run"
  saturday:
    main: "Long run"
  sunday:
    main: "Off or very easy"
```

### 8.4 Load Progression Rules

```yaml
strength_progression:
  # Double progression (simple, durable)
  double_progression:
    prescription: "3 sets, 3-5 reps, RPE 7-9"
    trigger: "if all working sets achieve reps >= 5 at target RPE"
    action: "increase load next week by small step"
    load_increase_percent: [2, 10]  # ACSM guidance
  
  # 2-for-2 rule (NSCA)
  two_for_two:
    trigger: "athlete does 2+ reps over assigned goal on last set for 2 consecutive workouts"
    action: "add load next session"
    load_increase_percent: [2.5, 10]
```

### 8.5 Published Strength Protocols (Research-Backed)

```yaml
published_protocols:
  # Støren et al. Maximal Strength Training (MST)
  storen_mst:
    source: "Støren et al. half-squat protocol"
    goal: "Improve running economy via high-force, low-velocity strength"
    duration_weeks: 8
    exercise: "half_squat"
    frequency_per_week: 3
    sets: 4
    reps: 4  # @ 4RM
    rest_seconds: 180
    intensity: "4RM (near-max effort)"
    encodable_session: "Half squat: 4x4 @ 4RM, rest 180s"
    
  # Eleiko institutional programming
  eleiko_day_1:
    exercises:
      - depth_jumps: "3x4 (12-18 inch box)"
      - hang_clean: "3x4 @ 80% 1RM"
      - db_bench: "3x6 @ 80% 1RM"
      - bent_over_row: "3x6"
      - romanian_deadlift: "3x6"
      - band_walks: "2x10 each way"
      - core: "planks 45s + side planks 45s + V-ups 10"
      
  eleiko_day_2:
    exercises:
      - jump_rope: "3x20-30s"
      - jump_squats: "3x5 (KB loaded)"
      - back_squat: "3x5 @ 80-85% 1RM"
      - fitball_hamstring: "3x10"
      - band_walks: "2x10 each way"
      - med_ball_toss: "2x20"
      - core: "med ball sit-up 10 + Russian twist 20"
    
  # Scheduling rule (key interference guardrail)
  eleiko_scheduling:
    rule: "Do high-intensity strength AFTER or same day as hard running"
    rationale: "Recovery days stay truly easy, avoid back-to-back hard days"
```

### 8.6 Strength Templates (Encodable Sessions)

```yaml
strength_templates:
  # Template A: Max Strength + Posterior Chain (45-60 min)
  template_A:
    id: "A_MaxStrengthPosteriorChain"
    when: ["BASE_2", "BUILD"]
    placement: "on hard run days, after run"
    duration_min: [45, 60]
    exercises:
      main_lift:
        options: ["back_squat", "trap_bar_deadlift"]
        sets: 4
        reps: 4
        intensity: "85-90% 1RM"
        rest_seconds: [180, 240]
      secondary_lift:
        exercise: "rdl"
        sets: 3
        reps: 6
        intensity: "RPE 7-8"
        rest_seconds: [120, 180]
      hamstring:
        exercise: "fitball_flexion"
        sets: 3
        reps: 10
        rest_seconds: [60, 90]
      calves:
        - standing_calf_raise: "4x6-8 heavy"
        - seated_calf_raise: "3x10-12"
      core:
        - side_plank: "2x30-45s each side"
        - pallof_press: "2x10 each side"
        
  # Template B: Single-Leg Strength + Hip Control (35-55 min)
  template_B:
    id: "B_SingleLegHipControl"
    when: ["BASE_1", "BASE_2", "BUILD"]
    placement: "especially for pelvic drop patterns"
    duration_min: [35, 55]
    exercises:
      - bulgarian_split_squat: "3-4x6/leg @ RPE 7-8, rest 120s"
      - step_up: "3x6-8/leg @ RPE 7, rest 90-120s"
      - single_leg_rdl: "3x6-10/leg @ RPE 7, rest 60-120s"
      - band_walks: "2x10 each way (linear or lateral)"
      - optional_finisher: "template_H (1 round)"
      
  # Template P: Power Primer (10-18 min add-on)
  template_P:
    id: "P_PowerPrimer"
    when: ["BASE_2", "BUILD"]
    placement: "start of Template A/B or standalone on easy day"
    duration_min: [10, 18]
    option_1_olympic:
      - depth_jumps: "3x4, rest 90-120s"
      - hang_clean: "3x4 @ 80% 1RM, rest 150-240s"
    option_2_bodyweight:
      - jump_rope_fast: "3x20-30s, rest 60s"
      - jump_squats: "3x5, rest 120s"
    quality_rule: "Stop set if jump height drops or contact gets loud/heavy"
    
  # Template H: Dicharry Hip Circuit (15-20 min)
  template_H:
    id: "H_DicharryHipCircuit"
    source: "Jay Dicharry Running Rewired"
    when: ["all phases"]
    duration_min: [15, 20]
    structure:
      rounds: 2
      rest_between_exercises_sec: [30, 45]
    exercises:
      - twisted_warrior: "10 each leg"
      - butt_scoots: "20 each side"
      - pigeon_hip_extension: "10 each side"
      - glute_rainbow: "10 each side"
      - standing_hip_circles: "5 each side"
      - tippy_twist: "8 each side"
      - burpees: 10
      - frog_bridge: 25
      - lateral_hurdle_hop: 20
      
  # Template N: Neural Day (12-20 min)
  template_N:
    id: "N_NeuralDay"
    when: ["PEAK"]
    purpose: "Zero soreness, high neural output"
    duration_min: [12, 20]
    exercises:
      - in_place_jump_circuit: "12 exercises, 15s each, 30s rest (9 min total)"
      - bounds: "5 reps"
      - db_jumps: "4x5, load = 15% bodyweight, full recovery"
    rule: "Near-complete recovery between explosive reps (not conditioning)"
```

### 8.7 Phase-Based Strength Periodization

```yaml
strength_periodization:
  phases:
    BASE_1:  # Weeks 1-4
      strength_sessions_per_week: 2
      power_sessions_per_week: 0
      microdose_per_week: [2, 4]  # 8-12 min stability
      emphasis: "basic patterns + tissue prep"
      templates: ["A", "B"]
      
    BASE_2:  # Weeks 5-8
      strength_sessions_per_week: 2
      power_sessions_per_week: 1
      microdose_per_week: 2
      emphasis: "maximal strength development (low reps)"
      templates: ["A", "B", "P"]
      
    BUILD:  # Weeks 9-12
      strength_sessions_per_week: 2
      power_sessions_per_week: [1, 2]
      microdose_per_week: 1
      emphasis: "maintain strength, convert to power"
      volume_reduction: "reduce total sets vs BASE_2"
      templates: ["A", "B", "P"]
      
    PEAK:  # Weeks 13-14
      strength_sessions_per_week: 1
      power_sessions_per_week: 1
      microdose_per_week: 1
      emphasis: "preserve neuromuscular, minimal soreness"
      templates: ["A (low volume)", "N"]
      intensity_cap_rpe: 8
      
    TAPER:  # Weeks 15-16
      strength_sessions_per_week: [0, 1]
      power_sessions_per_week: 0
      microdose_per_week: 1
      last_heavy_lower_days_before_race: [10, 14]
      last_plyos_gt_60_contacts_days_before_race: 10
      templates: ["H only"]
      intensity_cap_rpe: 7

  volume_rules:
    lower_body_hard_sets_per_week:
      BASE: [6, 10]
      BUILD: [4, 8]
      PEAK: [3, 5]
      TAPER: [0, 3]
      
    auto_adjustment_v1:
      if_weekly_run_intensity_increase_pct_gt: 20
      then_reduce_strength_sets_by: 1
      
    auto_adjustment_v2:
      if_doms_lower_gte: 7  # out of 10
      then_next_session: "maintenance_only"
      
    deload:
      every_n_weeks: 4
      set_reduction_pct: 40
```

### 8.8 Essential Runner Lifts (Movement Taxonomy)

```yaml
runner_exercise_taxonomy:
  tier_1_year_round:
    squat_pattern:
      purpose: "force production, stiffness"
      exercises: ["back_squat", "front_squat", "goblet_squat"]
      encoding: "3-5 sets x 3-6 reps, 2-4 min rest"
      
    hinge_pattern:
      purpose: "posterior chain, propulsion"
      exercises: ["trap_bar_deadlift", "conventional_deadlift", "rdl"]
      encoding: "3-5 x 3-6 (heavy) or 3-4 x 6-8 (moderate)"
      
    single_leg_knee:
      purpose: "running-specific strength, pelvic control"
      exercises: ["bulgarian_split_squat", "step_up", "reverse_lunge"]
      encoding: "2-4 x 5-8 each leg, 90-180s rest"
      
    single_leg_hinge:
      purpose: "hamstrings + glute max + balance"
      exercises: ["single_leg_rdl"]
      encoding: "2-4 x 6-10 each leg, 60-120s rest"
      
    calf_ankle:
      purpose: "stiffness + injury resistance"
      exercises: ["standing_calf_raise", "seated_calf_raise", "tibialis_raise"]
      encoding: "3-5 x 6-12 heavy + 2-3 x 15-25 endurance"
      
  tier_2_rotate:
    hamstring_flexion:
      exercises: ["fitball_flexion", "slider_curl", "nordic_curl"]
      encoding: "3 x 8-12 (or 3-5 x 4-6 eccentrics for Nordics)"
      
    hip_abductor_control:
      exercises: ["band_walks", "side_plank_variations"]
      encoding: "2-3 sets, 8-15 reps or 20-45s holds"
      
  tier_3_power:
    plyometrics:
      exercises: ["depth_jumps", "hurdle_hops", "bounds", "pogo_hops"]
      encoding: "30-120 contacts/session depending on phase"
      peak_cap_contacts: [40, 60]
      
    low_load_high_velocity:
      exercises: ["jump_squats", "hang_clean"]
      encoding: "3-6 x 3-5 reps, full recovery, crisp technique"
```

---

## 8.5 WOD/MetCon Programming (Hybrid Training)

### 8.5.1 Session Type Classification

```yaml
wod_session_types:
  WOD_STRENGTH_LOW_VOL:
    description: "Heavy-ish, low reps, long rests"
    time_domain_min: [35, 60]
    leg_interference: "low"
    
  WOD_AEROBIC_MIXED_MODAL:
    description: "20-45 min, RPE 5-6, conversational"
    time_domain_min: [20, 45]
    intensity: "zone_2"
    
  WOD_THRESHOLD_MACHINE:
    description: "12-30 min, controlled hard, machines/sled"
    time_domain_min: [12, 30]
    intensity: "controlled_threshold"
    
  WOD_ALACTIC_POWER:
    description: "10-20 sec bursts, lots of rest"
    time_domain_min: [15, 25]
    intensity: "all-out + full recovery"
    
  WOD_GLYCOLYTIC_METCON:
    description: "High lactate, for-time smashers"
    marathon_phase_rule: "AVOID in BUILD/PEAK/TAPER"
```

### 8.5.2 Movement Classification (Green/Yellow/Red)

```yaml
movement_classification:
  green_list:
    description: "Best ROI during high mileage"
    monostructural_low_impact:
      - bike_erg
      - assault_bike
      - ski_erg
      - row_erg
    concentric_dominant:
      - sled_push
      - sled_pull
      - farmer_carry
      - suitcase_carry
      - sandbag_carry
    upper_body:
      - strict_press
      - bench_press
      - weighted_pull_ups
      - rows
      - ring_rows
      - push_ups
    trunk_stiffness:
      - side_plank
      - copenhagen_plank
      - dead_bug
      - pallof_press
      
  yellow_list:
    description: "Use, but dose matters"
    exercises:
      - front_squat: "low volume in BUILD/PEAK"
      - back_squat: "low volume in BUILD/PEAK"
      - split_squat: "easy to over-sore"
      - box_step_ups: "control eccentric, modest reps"
      - double_unders: "can flare calves/Achilles"
      - kettlebell_swings: "don't do 200-rep destruction"
      
  red_list:
    description: "Avoid or heavily limit in high-volume phases"
    exercises:
      - box_jumps_high_rep: true
      - burpees_high_rep: true
      - jump_lunges: true
      - wall_balls_high_rep: true
      - thrusters: true
      - high_rep_olympic_cycling: true
      - ghd_sit_ups: true
      - for_time_workouts_reckless_pacing: true
    practical_rule:
      peak_weeks_squat_pattern_max_reps: [30, 60]
      unless: "very light and controlled"
```

### 8.5.3 Movement Interference Matrix (Oracle Research)

```yaml
# Green movements (fatigue 1-3): Best ROI during high mileage
green_movements:
  bike_erg: { doms_peak_h: [8,24], quality_run_normal_h: [6,12], leg_fatigue: 1 }
  ski_erg: { doms_peak_h: [8,24], quality_run_normal_h: [6,12], leg_fatigue: 1 }
  assault_bike: { doms_peak_h: [8,24], quality_run_normal_h: [8,16], leg_fatigue: 2 }
  row_erg: { doms_peak_h: [12,24], quality_run_normal_h: [12,24], leg_fatigue: 2 }
  sled_push: { doms_peak_h: [12,24], quality_run_normal_h: [12,24], leg_fatigue: 2 }
  sled_pull: { doms_peak_h: [12,24], quality_run_normal_h: [12,24], leg_fatigue: 2 }
  farmer_carry: { doms_peak_h: [12,24], quality_run_normal_h: [12,24], leg_fatigue: 2 }
  suitcase_carry: { doms_peak_h: [12,24], quality_run_normal_h: [12,24], leg_fatigue: 2 }
  sandbag_carry: { doms_peak_h: [12,24], quality_run_normal_h: [12,24], leg_fatigue: 3 }

# Yellow movements (fatigue 4-7): Dose matters
yellow_movements:
  hip_thrust: { leg_fatigue: 4 }
  hang_power_clean: { leg_fatigue: 4 }
  goblet_squat: { leg_fatigue: 5 }
  kettlebell_swing: { leg_fatigue: 5 }
  power_clean: { leg_fatigue: 5 }
  front_squat: { leg_fatigue: 5 }
  deadlift: { leg_fatigue: 5 }
  back_squat: { doms_peak_h: [24,48], quality_run_normal_h: [24,48], leg_fatigue: 6 }
  calf_raise_heavy: { quality_run_normal_h: [48,72], leg_fatigue: 6 }
  box_jump_low_rep: { quality_run_normal_h: [48,72], leg_fatigue: 7 }
  double_unders: { quality_run_normal_h: [48,72], leg_fatigue: 7 }

# Red movements (fatigue 8-10): Avoid BUILD/PEAK
red_movements:
  box_step_up: { quality_run_normal_h: [60,96], leg_fatigue: 7 }
  burpee_high_rep: { quality_run_normal_h: [48,96], leg_fatigue: 8 }
  single_leg_rdl: { quality_run_normal_h: [72,120], leg_fatigue: 8 }
  romanian_deadlift: { quality_run_normal_h: [60,96], leg_fatigue: 8 }
  bulgarian_split_squat: { quality_run_normal_h: [96,144], leg_fatigue: 8 }
  reverse_lunge: { quality_run_normal_h: [72,120], leg_fatigue: 8 }
  pistol_squat: { quality_run_normal_h: [72,120], leg_fatigue: 8 }
  bounds: { quality_run_normal_h: [72,120], leg_fatigue: 9 }
  box_jump_high_rep: { quality_run_normal_h: [72,120], leg_fatigue: 9 }
  nordic_curl: { quality_run_normal_h: [96,144], leg_fatigue: 9 }
  walking_lunge: { quality_run_normal_h: [96,144], leg_fatigue: 9 }
  wall_ball: { quality_run_normal_h: [72,120], leg_fatigue: 9 }
  thruster: { quality_run_normal_h: [72,120], leg_fatigue: 9 }
  jump_lunge: { quality_run_normal_h: [96,144], leg_fatigue: 10 }
  depth_jump: { quality_run_normal_h: [96,144], leg_fatigue: 10 }
```

### 8.5.3b Hard Scheduling Rules

```yaml
protect_long_run:
  do_not_schedule_within_72h:
    - depth_jump
    - jump_lunge
    - box_jump_high_rep
    - walking_lunge
    - bulgarian_split_squat
    - nordic_curl
    - wall_ball
    - thruster  # unless microdosed
  
  do_not_schedule_within_48h:
    - romanian_deadlift
    - single_leg_rdl
    - box_step_up
    - burpee_high_rep
    - double_unders  # calf/Achilles risk
  
  do_not_schedule_within_24h:
    - heavy_back_squat
    - heavy_front_squat
    - heavy_deadlift

protect_intervals_tempo:
  within_48h: "no movement with leg_fatigue >= 8"
  within_24h: "no movement with leg_fatigue 6-7"

same_day_doubles:
  if_run_is_quality: "run first, strength second"
  preferred_separation_hours: 6
  if_under_6h: "green movements only OR microdose strength"

dose_multipliers:
  microdose: 0.50   # Ex: depth jumps 3x4 with full rest
  normal: 1.00
  high: 1.30        # Ex: high-rep box jumps for-time

exposure_multipliers:
  last_exposure_lte_7d: 0.85   # Repeated bout protection
  last_exposure_8_21d: 1.00
  last_exposure_gt_21d: 1.20   # DOMS risk increased
```

### 8.5.3c WOD Selection Algorithm

```yaml
wod_selection:
  # Phase hard filters
  BASE:
    allow: all
    cap_glycolytic_frequency: true
  BUILD:
    disallow: WOD_GLYCOLYTIC_METCON
    limit_WOD_THRESHOLD_MACHINE: 1_per_week
  PEAK:
    allow_only: [WOD_STRENGTH_LOW_VOL, WOD_ALACTIC_POWER]
    conditioning_is_flush_only: true
  TAPER:
    allow_only: taper_safe_neural
    zero_doms_risk: true
  
  # Scoring function for candidate selection
  scoring:
    base: 100
    penalties:
      lower_eccentric_rating: -10_per_point
      impact_rating: -10_per_point
      glycolytic_rating: -8_per_point
    bonuses:
      pattern_not_hit_in_72h: +5
      phase_appropriate: +10
  
  selection: argmax(score)
```

### 8.5.4 Weekly WOD Templates by Phase

```yaml
wod_weekly_templates:
  base_phase:  # 5 runs, 2 WODs
    monday:
      run: "RUN_INTERVAL_VO2 (10-20 min hard)"
      wod: "WOD_STRENGTH_LOW_VOL (upper bias, 35-50 min)"
    wednesday:
      run: "RUN_TEMPO_THRESHOLD (20-40 min)"
      wod: "WOD_AEROBIC_MIXED_MODAL (20-35 min @ RPE 5-6)"
    friday:
      run: "RUN_EASY_Z2 + strides"
      wod: "WOD_STRENGTH_LOW_VOL (lower bias, low reps, 35-45 min)"
      
  build_phase:  # 5-6 runs, 2 WODs
    monday:
      run: "RUN_INTERVAL_VO2"
      wod: "WOD_ALACTIC_POWER (optional, 10-20 min)"
    tuesday:
      run: "RUN_EASY_Z2"
      wod: "WOD_STRENGTH_LOW_VOL (full body, very low leg volume)"
    friday:
      run: "RUN_TEMPO_THRESHOLD (shorter)"
      wod: "WOD_THRESHOLD_MACHINE (optional, short+controlled)"
      
  peak_phase:  # 6 runs, 1 WOD
    tuesday:
      run: "RUN_EASY_Z2"
      wod: "WOD_STRENGTH_LOW_VOL (mostly upper + light hinge)"
      
  taper_phase:  # race in 6-10 days
    early_taper:
      wod: "1x short WOD_STRENGTH_LOW_VOL (no new movements)"
    late_taper:
      wod: "0 metcons that create DOMS"
      allowed: "bike flush 15-25 min @ RPE 3-4"
```

### 8.5.5 Runner-Friendly WOD Library

```yaml
wod_library:
  - id: "WOD_01"
    name: "Sled-Ski Aerobic Intervals"
    type: "WOD_AEROBIC_MIXED_MODAL"
    time_domain_min: 24
    format: "6 rounds for quality"
    work:
      - sled_push: "20-30m @ heavy but smooth"
      - ski_erg: "250m @ RPE 6"
      - farmer_carry: "40m heavy"
      - rest: "60s easy walk"
    notes: ["Steady breathing, no leg burn", "Low impact, low eccentric"]
    
  - id: "WOD_02"
    name: "Zone 2 Mixed-Modal AMRAP"
    type: "WOD_AEROBIC_MIXED_MODAL"
    time_cap_min: 30
    format: "AMRAP 30"
    work:
      - bike_erg: "12/10 cal @ RPE 5-6"
      - ring_row: "12 reps strict"
      - push_up: "12 reps"
      - suitcase_carry: "50m (switch at 25m)"
    notes: ["Never sprint", "Stay conversational"]
    
  - id: "WOD_03"
    name: "Bike Threshold Blocks + Upper"
    type: "WOD_THRESHOLD_MACHINE"
    time_domain_min: 32
    format: "3 sets"
    work:
      - bike_erg: "8:00 @ RPE 7-8"
      - rest: "2:00 easy spin"
      - strict_pull_up: "6-10 reps"
      - strict_press_db: "8-12 reps"
      
  - id: "WOD_04"
    name: "EMOM 30 Low-Impact Engine"
    type: "WOD_AEROBIC_MIXED_MODAL"
    time_domain_min: 30
    format: "EMOM 30 (10 cycles)"
    minutes:
      1: "Row 12/10 cal"
      2: "KB swing 12 reps moderate"
      3: "Plank 45s"
    notes: ["Aerobic work, not metcon death spiral"]
    
  - id: "WOD_05"
    name: "Alactic Bike Sprints"
    type: "WOD_ALACTIC_POWER"
    time_domain_min: 20
    format: "10 rounds"
    work:
      - bike_sprint: "12s all-out"
      - rest: "1:48 very easy spin"
    notes: ["Stop if power drops", "Should not create soreness"]
    
  - id: "WOD_06"
    name: "Row VO2 Repeats"
    type: "WOD_THRESHOLD_MACHINE"
    time_domain_min: 24
    format: "6 rounds"
    work:
      - row: "2:00 hard (RPE 9)"
      - rest: "2:00 easy row"
      
  - id: "WOD_07"
    name: "Carry Density Builder"
    type: "WOD_AEROBIC_MIXED_MODAL"
    time_cap_min: 25
    format: "Every 5:00 for 5 sets"
    work:
      - farmer_carry: "200m (break as needed)"
      - rest: "remaining time"
    notes: ["Heavy enough for grip challenge, posture perfect"]
    
  - id: "WOD_08"
    name: "Strength Maintenance + Flush"
    type: "WOD_STRENGTH_LOW_VOL"
    time_domain_min: 45
    blocks:
      strength_A:
        lift: "trap_bar_deadlift"
        sets: 4
        reps: 3
        intensity: "RPE 7-8"
        rest: "2:00-3:00"
      strength_B:
        lift: "db_bench_press"
        sets: 3
        reps: 6
        intensity: "RPE 7-8"
      flush:
        machine: "bike_erg"
        time_min: 10
        intensity: "RPE 3-4"
        
  - id: "WOD_09"
    name: "Upper Metcon + Easy Engine"
    type: "WOD_AEROBIC_MIXED_MODAL"
    time_cap_min: 18
    format: "AMRAP 18"
    work:
      - ski_erg: "10/8 cal @ steady"
      - strict_pull_up: "6-10"
      - hand_release_push_up: "10-15"
      - hollow_hold: "20-30s"
    notes: ["Limiter is upper-body stamina, not legs"]
    
  - id: "WOD_10"
    name: "Sled Push Controlled Hard"
    type: "WOD_THRESHOLD_MACHINE"
    time_domain_min: 18
    format: "6 rounds"
    work:
      - sled_push: "45s hard"
      - rest: "75s walk"
    notes: ["Hard but not sloppy", "Great in BUILD for intensity without impact"]
    
  - id: "WOD_11"
    name: "Step-Up Aerobic Strength"
    type: "WOD_AEROBIC_MIXED_MODAL"
    time_cap_min: 20
    format: "E2MOM x 10"
    work:
      - weighted_step_up: "8 each leg (moderate DBs)"
      - bike_erg: "10/8 cal easy-moderate"
    notes: ["Has eccentric load", "BASE phase only or keep light in BUILD"]
    
  - id: "WOD_12"
    name: "Primer: Neural + Breathing"
    type: "WOD_STRENGTH_LOW_VOL"
    time_domain_min: 25
    taper_safe: true
    blocks:
      A:
        lift: "front_squat"
        sets: 5
        reps: 2
        intensity: "RPE 6-7 (fast reps)"
        rest: "2:00"
      B:
        lift: "strict_pull_up"
        sets: 4
        reps: 4
        rest: "90s"
      C:
        machine: "row"
        time_min: 6
        intensity: "RPE 4"
    notes: ["No soreness allowed", "Stop well short of fatigue"]
```

### 8.5.6 Strength Engine JSON Spec

```json
{
  "strengthEngine": {
    "phaseRules": {
      "BASE_1": { "strengthSessionsPerWeek": 2, "powerSessionsPerWeek": 0, "microdosePerWeek": 2 },
      "BASE_2": { "strengthSessionsPerWeek": 2, "powerSessionsPerWeek": 1, "microdosePerWeek": 2 },
      "BUILD":  { "strengthSessionsPerWeek": 2, "powerSessionsPerWeek": 1, "microdosePerWeek": 1 },
      "PEAK":   { "strengthSessionsPerWeek": 1, "powerSessionsPerWeek": 1, "microdosePerWeek": 1 },
      "TAPER":  { "strengthSessionsPerWeek": 0, "powerSessionsPerWeek": 0, "microdosePerWeek": 1 }
    },
    "scheduling": {
      "placeStrengthOnHardRunDays": true,
      "placeAfterRunPreferred": true,
      "avoidHeavyLowerWithinDaysOfRace": 10
    },
    "volumeAutoregulation": {
      "ifRunLoadIncreasePctGT": 20,
      "thenReduceSetsPerMainLiftBy": 1,
      "deloadEveryNWeeks": 4,
      "deloadSetReductionPct": 40
    },
    "intensityCaps": {
      "PEAK":  { "maxRPE": 8 },
      "TAPER": { "maxRPE": 7 }
    },
    "templates": ["A_MaxStrengthPosteriorChain", "B_SingleLegHipControl", "P_PowerPrimer", "H_DicharryHipCircuit", "N_NeuralDay"],
    "wodLibrary": ["WOD_01", "WOD_02", "WOD_03", "WOD_04", "WOD_05", "WOD_06", "WOD_07", "WOD_08", "WOD_09", "WOD_10", "WOD_11", "WOD_12"]
  }
}
```

---

## 9. Durability System

### 9.1 Daily Readiness Scan (1-2 minutes)

```yaml
daily_scan:
  duration_minutes: [1, 2]
  tests:
    - id: "toe_yoga"
      protocol: "Lift big toe while others stay down, then reverse"
      pass: "Clean isolation both directions, arch maintained"
      
    - id: "single_leg_balance"
      protocol: "Barefoot, hands on shoulders, eyes open"
      pass: "45 seconds (age 18-39), no excessive wobble"
      
    - id: "squat_shape"
      protocol: "5 controlled squats"
      pass: "Heels down, balanced, knees track, no pain"
```

### 9.2 Weekly Durability Dashboard (10-12 minutes)

```yaml
weekly_tests:
  - id: "ankle_df_knee_to_wall"
    protocol: "Toes 4-5 inches from wall, knee touches without heel lift"
    pass: "Touches wall cleanly both sides"
    
  - id: "single_leg_calf_raise"
    protocol: "Continuous single-leg calf raises"
    pass: ">= 20 reps pain-free each side, minimal discrepancy"
    
  - id: "single_leg_bridge_10s"
    protocol: "Single-leg bridge hold 10 seconds each side"
    pass: "Hips level, glute doing work, no hamstring cramp"
    
  - id: "hip_flexor_doorway"
    protocol: "Doorframe test with posterior pelvic tilt"
    pass: "No huge pull, only gentle lengthening"
```

### 9.3 Module Library

```yaml
modules:
  mobility:
    - id: "M_COUCH_STRETCH"
      duration_min: 4
      dosage: "2:00 each side"
      cues: ["Glute squeeze rear leg", "Ribs down", "Tall torso"]
      retest: ["hip_flexor_doorway", "squat_shape"]
      
    - id: "M_ANKLE_DF"
      duration_min: 4
      dosage: "2-3 sets x 10 reps each side"
      cues: ["Heel down", "Knee over 2nd toe"]
      retest: ["ankle_df_knee_to_wall"]
      
  control:
    - id: "M_TOE_YOGA"
      duration_min: 4
      dosage: "2:00 practice each side"
      cues: ["Big toe up others down", "Big toe down others up", "Arch lifted"]
      retest: ["toe_yoga", "single_leg_balance"]
      
    - id: "M_DEEP_CORE_MINI"
      duration_min: 6
      exercises: ["Kneeling side plank pulses 20 each", "Roller dogs 2:00"]
      retest: ["single_leg_bridge_10s"]
      
  capacity:
    - id: "M_CALF_RAISE_CAPACITY"
      duration_min: 6
      dosage: "3 sets each side, stop 2 reps before failure"
      cues: ["Full range", "Control down", "No ankle wobble"]
      frequency: "2-3x/week"
      retest: ["single_leg_calf_raise"]
```

### 9.4 Priority Routing Algorithm

```python
def select_modules(assessment_results):
    """
    Priority order:
    1. Pain overrides everything
    2. Foundation first: foot/ankle
    3. Then: hip extension
    4. Then: trunk control
    5. Finally: capacity
    """
    severity_score = {
        'pain': 2,
        'fail': 1,
        'pass': 0
    }
    
    priority_order = ['toe_yoga', 'ankle_df', 'hip_flexor', 'core', 'capacity']
    
    # Sort failures by priority
    failures = [test for test in assessment_results if test.result != 'pass']
    failures.sort(key=lambda t: (
        -severity_score[t.result],  # Pain first
        priority_order.index(t.category)  # Then by body region
    ))
    
    # Select modules
    modules = []
    
    # If pain: 1 tissue module + 1 gentle mobility, skip capacity
    if any(t.result == 'pain' for t in failures):
        modules.append(get_tissue_module(failures[0]))
        modules.append(get_gentle_mobility_module(failures[0]))
    else:
        # 1 mobility module for highest-ranked mobility fail
        mobility_fail = next((t for t in failures if t.type == 'mobility'), None)
        if mobility_fail:
            modules.append(mobility_fail.primary_module)
        
        # 1 control module for highest-ranked control fail
        control_fail = next((t for t in failures if t.type == 'control'), None)
        if control_fail:
            modules.append(control_fail.primary_module)
        
        # Capacity only if no pain and >= 80% of control tests pass
        if pass_rate(assessment_results, 'control') >= 0.8:
            modules.append(get_capacity_module(athlete))
    
    return modules[:2]  # Max 2 modules per day
```

---

## 10. Nutrition & Fueling

### 10.1 Daily Protein

```yaml
protein:
  daily_g_per_kg:
    default: [1.6, 2.0]
    deficit_or_peak_week: [1.8, 2.0]
    
  per_meal_g_per_kg: 0.3
  meal_spacing_hours: [3, 5]
  
  post_session:
    timing_hours: [0, 2]
    g_per_kg: [0.25, 0.30]
    
  # Calculation
  daily_protein_g: "weight_kg * 1.8"
  per_meal_protein_g: "weight_kg * 0.3"
```

### 10.2 Pre-Run Fueling

```yaml
pre_run:
  if_run_gt_60_min:
    carbs_g_per_kg: [1, 4]
    timing_hours_before: [1, 4]
    
    # Tighter timing rule
    1_hour_before: "~1 g/kg"
    2_hours_before: "~2 g/kg"
    3-4_hours_before: "~3-4 g/kg"
    
  avoid:
    - "high_fat"
    - "high_fiber"
    - "very_high_protein"
    - "anything_new_on_key_workouts"
    
  hydration_ml_per_kg_2-4h_pre: [5, 10]
```

### 10.3 During-Run Fueling

```yaml
during_run_fueling:
  by_duration:
    lt_45_min:
      carbs_g_per_hour: 0
      
    45-75_min_hard:
      carbs: "small amounts or mouth rinse"
      
    1-2.5_hours:
      carbs_g_per_hour: [30, 60]
      
    gt_2.5_hours:
      carbs_g_per_hour: [60, 90]
      carb_type: "glucose + fructose blend (1:0.8 ratio)"
      
  timing:
    start_minute: [10, 20]
    repeat_every_min: [15, 30]
    
  dose_templates:
    target_30g_per_hour: "15g every 30 min"
    target_60g_per_hour: "20g every 20 min OR 30g every 30 min"
    target_90g_per_hour: "30g every 20 min"
```

### 10.4 Post-Run Recovery

```yaml
post_run:
  if_next_key_session_within_8h:
    carbs_g_per_kg_per_hour_first_4h: [1.0, 1.2]
    protein_g_per_kg_within_2h: [0.25, 0.30]
    
  rehydration:
    l_per_kg_body_mass_lost: [1.25, 1.5]
```

### 10.5 Race Week

```yaml
race_week:
  if_event_gt_90_min:
    carb_loading:
      g_per_kg_per_day: [10, 12]
      duration_hours: [36, 48]
      carb_sources: "low fiber, low residue"
      
  pre_race_meal:
    carbs_g_per_kg: [1, 4]
    timing_hours_before: [1, 4]
    avoid: ["high_fat", "high_fiber", "anything_new"]
```

### 10.6 Hydration

```yaml
hydration:
  during_run:
    target_body_mass_loss_max_percent: 2
    typical_intake_l_per_hour: [0.4, 0.8]
    
  sports_drink:
    carbs_percent: [4, 8]
    sodium_g_per_l: [0.5, 0.7]
    
  sweat_rate_estimation:
    formula: "1 kg body mass loss ≈ 1 L sweat"
    recommendation: "Do sweat test and store L/hour"
```

---

## 11. Injury Prevention & Monitoring

### 11.1 Symptom Tracking Inputs

```yaml
symptom_inputs:
  per_run:
    - pain_during: int [0-10]
    - pain_trend_during: enum [better, same, worse]
    - gait_change: bool
    - swelling_locking_givingway_neuro: bool
    - next_morning_pain: int [0-10]
    - next_morning_stiffness_minutes: int
    - pain_48h: int [0-10]
    - site: enum [heel, achilles, lateral_knee, shin, anterior_knee]
    - bony_tenderness_focal: bool
    - run_distance: float
    - longest_run_30d: float
```

### 11.2 RED Flag Rules (STOP Immediately)

```yaml
red_flags_stop:
  - "swelling == true"
  - "locking == true"
  - "giving_way == true"
  - "numbness_or_pins_and_needles == true"
  - "bony_tenderness_focal == true"
  - "suspected_stress_fracture == true"
  - "gait_change_or_limp == true"
  
  action: "STOP RUNNING + seek clinical guidance"
```

### 11.3 AMBER Rules (Reduce Training)

```yaml
amber_reduce_if_any:
  - "pain_during >= 4"
  - "pain_trend_during == 'worse'"
  - "next_morning_pain > baseline_next_morning_pain"
  - "pain_48h > baseline_48h_pain"
  - "week_to_week_symptoms_worsening == true"
  - "run_distance > 1.10 * longest_run_30d"  # Single-run spike
  
  modification_package:
    volume_reduction_next_7_days_percent: [25, 40]
    no_speedwork: true
    no_hills: true
    add_rest_day_between_runs: true
    use_run_walk: true
```

### 11.4 GREEN Rules (Continue with Guardrails)

```yaml
green_continue_if_all:
  - "pain_during <= 3"
  - "pain_trend_during in ['same', 'better']"
  - "no_gait_change"
  - "pain settles quickly and not worse next morning"
```

### 11.5 Bone Stress Override (MTSS/Shin)

```yaml
bone_stress_rule:
  if_site_in: ["shin", "foot", "metatarsal"]
  require_for_impact_running:
    - "pain_during == 0"
    - "next_morning_pain == 0"
    - "hop_test_pain_free == true"
  else:
    action: "switch to non-impact conditioning and strength only"
```

### 11.6 Return-to-Run Protocol

```yaml
return_to_run:
  readiness_gate:
    - "hop_consecutive_pain_free >= 10"
    - "swelling == false"
    - "full_rom == true"
    
  baseline_definition: "max easy distance pain-free during AND 48h after"
  baseline_start_multiplier: [0.80, 0.90]  # Start 10-20% below
  
  progression_rules:
    - "stay_below_breakpoint"
    - "rest_day_between_runs"
    - "change_one_thing_at_a_time"
    - "progress_gradually_when_comfortable"
    
  check_every_days: 14
  if_stable_or_improving:
    baseline_increase_percent: [5, 10]
  if_flare:
    baseline_decrease_percent: [10, 20]
    hold_weeks: [1, 2]
```

### 11.7 Run-Walk Protocol (If Baseline is Tiny)

```yaml
run_walk_protocol:
  start:
    run_interval_seconds: [30, 60]
    walk_interval_seconds: [60, 120]
    total_time: "target as prescribed"
    
  progression:
    frequency: "every 3-7 days if stable"
    run_time_increase_percent: [10, 20]
    walk_time_decrease_percent: [10, 20]
    
  stop_if:
    - "pain_escalates"
    - "gait_changes"
```

---

## 12. Progression & Periodization

### 12.1 Hansons Wave Loading

```yaml
wave_loading:
  pattern: "build_week, consolidation_week, build_week..."
  frequency: "every 2nd week is consolidation"
  
  build_week:
    volume_increase_vs_prior_build: [0, 8]  # percent
    
  consolidation_week:
    volume_vs_prior_build: [87, 92]  # percent
    corresponds_to: "SHORT long run week"
```

### 12.2 Mileage Increase Logic

```yaml
mileage_progression:
  # Where to add miles
  priority_order:
    1: "easy days (Mon/Fri/Sat)"
    2: "warmup/cooldown"
    3: "extend tempo block"
    
  # Never make workouts excessively bigger
  constraint: "add volume via easy days first"
  
  # Target bands by level
  weekly_mileage_targets:
    beginner_marathon: [40, 50]
    competitive_marathon: [60, 70]
```

### 12.3 10% Rule Replacement (Single-Run Spike)

```yaml
load_spike_rule:
  # NOT cumulative weekly 10%
  # Instead: single session distance constraint
  
  rule: "run_distance <= 1.10 * longest_run_in_prior_30_days"
  
  if_violated:
    flag: "high injury risk"
    action: "trigger AMBER modification package"
```

---

## 13. Taper Rules

### 13.1 Taper Length by Distance

```yaml
taper_length:
  5k:
    days: [5, 8]
    volume_multiplier_race_week: [0.50, 0.70]
    
  10k:
    days: [7, 10]
    volume_multiplier_race_week: [0.45, 0.65]
    
  half:
    days: [10, 14]
    volume_multiplier_week_minus_2: [0.65, 0.80]
    volume_multiplier_week_of: [0.45, 0.60]
    
  marathon:
    days: [14, 21]
    volume_multiplier_week_minus_3: [0.75, 0.85]
    volume_multiplier_week_minus_2: [0.60, 0.75]
    volume_multiplier_week_of: [0.45, 0.60]
    
  ultra_50k:
    days: [10, 14]
  ultra_50m_100k:
    days: [14, 21]
  ultra_100m_plus:
    days: [21, 28]
```

### 13.2 Taper Structure (2-Week Template)

```yaml
taper_2_week:
  week_minus_2:
    weekly_volume: "0.70-0.80 * peak_week"
    intensity: "maintain"
    
  week_minus_1:
    weekly_volume: "0.45-0.60 * peak_week"
    intensity: "maintain"
    long_run: "reduce to 8 miles or less"
    
  work_minute_reduction_in_workouts: [30, 60]  # percent
  
  # Hansons "modified taper" - consistency not shutdown
  philosophy: "reduce volume, maintain intensity, maintain frequency"
```

### 13.3 Race Week Pre-Race Miles

```yaml
race_week:
  pre_race_miles: "40-50% of peak week (excluding race)"
  
  day_minus_2: "short easy run or rest"
  day_minus_1: "rest or very short shakeout (15-20 min)"
```

---

## 14. Daily Plan Generator Algorithm

### 14.1 Master Decision Flow

```python
def generate_daily_plan(athlete, date, plan_state):
    """
    Generate a single day's plan.
    Called each morning based on current state.
    """
    
    # Step 1: Check injury status
    injury_status = evaluate_injury_status(athlete)
    if injury_status == 'RED':
        return create_rest_day(reason="injury_red_flag")
    
    # Step 2: Determine week context
    weeks_to_race = (athlete.goal_race.date - date).days // 7
    is_taper = weeks_to_race <= get_taper_start_weeks(athlete.goal_race.distance)
    is_build_week = plan_state.week_number % 2 == 1  # Hansons alternating
    
    # Step 3: Get day template
    day_of_week = date.weekday()
    day_template = get_day_template(athlete, day_of_week, is_taper)
    
    # Step 4: Calculate paces
    paces = calculate_paces_from_vdot(athlete.vdot)
    
    # Step 5: Build session
    if day_template.type == 'rest':
        session = None
    elif day_template.type == 'easy':
        session = build_easy_run(athlete, paces, injury_status)
    elif day_template.type == 'SOS':
        session = build_quality_session(
            athlete, paces, day_template.workout, 
            weeks_to_race, is_build_week
        )
    
    # Step 6: Add durability
    durability = select_durability_modules(athlete.assessment_results)
    
    # Step 7: Add strength if scheduled
    strength = None
    if is_strength_day(athlete, day_of_week):
        strength = build_strength_session(athlete)
    
    # Step 8: Add nutrition reminders
    nutrition = generate_nutrition_reminders(session, athlete)
    
    # Step 9: Validate against guardrails
    validate_session(session, athlete, plan_state)
    
    return DailyPlan(
        date=date,
        run_session=session,
        durability_modules=durability,
        strength_session=strength,
        nutrition_reminders=nutrition,
        injury_status=injury_status
    )
```

### 14.2 Quality Session Builder

```python
def build_quality_session(athlete, paces, workout_type, weeks_to_race, is_build_week):
    """
    Build a structured quality workout.
    """
    distance = athlete.goal_race.distance
    
    if workout_type == 'speed_or_strength':
        # Hansons Tuesday logic
        if distance == 'marathon' and weeks_to_race > 7:
            return build_speed_workout(athlete, paces)
        elif distance == 'marathon':
            return build_strength_repeats(athlete, paces)
        else:
            return build_speed_workout(athlete, paces)
            
    elif workout_type == 'tempo_at_goal_pace':
        tempo_distance = get_tempo_distance(athlete, weeks_to_race)
        pace = get_race_pace(athlete, distance)
        return QualitySession(
            type='tempo',
            warmup=warmup_default(),
            main_set=TempoBlock(distance=tempo_distance, pace=pace),
            cooldown=cooldown_default()
        )
        
    elif workout_type == 'long_run':
        return build_long_run(athlete, paces, is_build_week, weeks_to_race)
```

### 14.3 Long Run Builder

```python
def build_long_run(athlete, paces, is_build_week, weeks_to_race):
    """
    Build long run respecting Hansons constraints.
    """
    distance = athlete.goal_race.distance
    
    # Get target duration
    if is_build_week:
        target = get_build_week_long_run_target(athlete)
    else:
        target = get_short_week_long_run_target(athlete)  # 60-70% of build
    
    # Apply caps
    target = min(
        target,
        16.0,  # miles
        athlete.weekly_mileage * 0.30,
        paces['E_mph'] * 3  # 3 hour cap equivalent
    )
    
    # Get structure based on race distance
    structure = get_long_run_structure(distance)
    
    # Add fueling if > 90 min
    estimated_duration = target / paces['E_mph'] * 60
    fueling = None
    if estimated_duration > 90:
        fueling = generate_fueling_plan(athlete, estimated_duration)
    
    return LongRun(
        distance=target,
        pace_zone='E',
        structure=structure,
        fueling_plan=fueling
    )
```

### 14.4 Validation Function

```python
def validate_session(session, athlete, plan_state):
    """
    Validate against all guardrails.
    Raise warnings or modify session if needed.
    """
    warnings = []
    
    # Check single-run spike rule
    if session and session.distance > 1.10 * plan_state.longest_run_30d:
        warnings.append(Warning(
            type='load_spike',
            message=f"Run exceeds 110% of longest run in prior 30 days",
            severity='amber'
        ))
        session.distance = min(session.distance, plan_state.longest_run_30d * 1.10)
    
    # Check polarized distribution
    weekly_distribution = calculate_weekly_distribution(plan_state)
    if weekly_distribution['zone_2_percent'] > 0.10:
        warnings.append(Warning(
            type='zone_2_creep',
            message="Zone 2 exceeding 10% of weekly training"
        ))
    
    # Check strength spacing
    if session and plan_state.last_strength_session:
        hours_since_strength = hours_between(
            plan_state.last_strength_session, session.date
        )
        if hours_since_strength < 6:
            warnings.append(Warning(
                type='interference_risk',
                message="Less than 6 hours since strength session"
            ))
    
    session.warnings = warnings
    return session
```

---

## Appendix A: Complete Data Structures

```python
@dataclass
class DailyPlan:
    date: date
    run_session: Optional[RunSession]
    durability_modules: List[DurabilityModule]
    strength_session: Optional[StrengthSession]
    nutrition_reminders: List[NutritionReminder]
    injury_status: str  # 'green', 'amber', 'red'
    warnings: List[Warning]

@dataclass
class RunSession:
    type: str  # 'easy', 'tempo', 'intervals', 'long_run'
    planned_distance: float
    planned_duration_minutes: int
    pace_zone: str
    structure: List[SessionSegment]
    fueling_plan: Optional[FuelingPlan]

@dataclass
class SessionSegment:
    name: str
    duration_or_distance: float
    pace_zone: str
    instructions: str

@dataclass
class StrengthSession:
    exercises: List[Exercise]
    total_sets: int
    emphasis: str  # 'lower', 'upper', 'full_body'

@dataclass
class Exercise:
    name: str
    sets: int
    reps: str  # "3-5" or "8-12"
    load_guidance: str
    cues: List[str]

@dataclass
class DurabilityModule:
    id: str
    category: str  # 'mobility', 'control', 'capacity'
    duration_minutes: int
    exercises: List[DurabilityExercise]
    retest: List[str]

@dataclass
class NutritionReminder:
    timing: str  # 'pre_run', 'during_run', 'post_run'
    message: str
    target_grams: Optional[float]

@dataclass
class FuelingPlan:
    carbs_g_per_hour: int
    start_minute: int
    repeat_every_minutes: int
    dose_per_interval_g: int
```

---

## Appendix B: Key Formulas Reference

```python
# VDOT from race
VDOT = VO2 / pct
VO2 = -4.6 + 0.182258*v + 0.000104*v^2
pct = 0.8 + 0.1894393*e^(-0.012778*T) + 0.2989558*e^(-0.1932605*T)

# Pace from VO2 target (invert)
v = (-0.182258 + sqrt(0.182258^2 + 4*0.000104*(4.6 + VO2_target))) / (2*0.000104)

# Long run cap
LR_max = min(16, 0.30 * weekly_mileage, easy_pace_mph * 3)

# Single-run spike threshold
max_single_run = 1.10 * longest_run_30d

# Daily protein
protein_g = weight_kg * 1.8

# Carbs during run (by duration)
if duration > 2.5h: carbs_g_per_h = 60-90
if duration > 1h: carbs_g_per_h = 30-60

# Rehydration
rehydrate_L = body_mass_lost_kg * 1.5
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-02 | Initial CoachSpec synthesizing 8 research files |

---

*This specification provides a complete, deterministic system for generating hybrid marathon training plans without requiring LLM inference or internet access. All decisions are made through the encoded rules, thresholds, and algorithms defined above.*
