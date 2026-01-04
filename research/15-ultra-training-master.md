# Ultra Training Master (Oracle Research)

> Complete ultra training methodology for 50K to 100M. Periodization, B2B rules, vertical targets, fueling protocols, walking skills, night running, and deterministic decision rules.

---

## Key Deltas: Marathon → Ultra

| Aspect | Marathon | Ultra |
|--------|----------|-------|
| **Primary metric** | Pace specificity | Time-on-feet + terrain |
| **Long run** | Distance-cap (16mi) | Time-caps + weekend concentration |
| **Weekend** | 1 long run Sunday | B2B weekends progressively |
| **Quality sessions** | Tue speed + Thu tempo | Hills + steady-state, less intensity |
| **Specificity** | Marathon pace execution | Terrain, vert, hiking, descents, fueling, night |
| **Taper** | 10-14 days | 2-4 weeks, fast-decay |
| **Volume unit** | Miles | Minutes (trail/mountain) |

---

## 1. Schema Additions for Ultra

```yaml
athlete:
  goal_race:
    vertical_gain_m: int|null            # total climb for the race
    terrain: enum [road, trail, mountain]
    technicality: enum [low, moderate, high]
    expected_finish_time_hours: float|null
    cutoff_time_hours: float|null
    uses_poles: bool
  environment:
    hill_access: enum [none, treadmill_only, rolling, real_climbs]
  physiology:
    sweat_rate_l_per_hour: float|null
    sweat_sodium_mg_per_l: int|null
```

---

## 2. Ultra Engine Configuration (Drop-in YAML)

```yaml
ultra_engine:

  # 1) Unit selection
  volume_units:
    if_goal_distance_in: ["ultra_50k","ultra_50m","ultra_100k","ultra_100m"]
    primary_unit_if_terrain_in: ["trail","mountain"]   # minutes
    primary_unit_if_terrain_eq: "road"                 # miles
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

  # 3) Weekend total caps (for B2B weeks)
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

  # 5) B2B rules
  b2b:
    enabled_for: ["ultra_50m","ultra_100k","ultra_100m"]
    optional_for: ["ultra_50k"]   # only if mountain/slow/needs TOF
    ratio_defaults:
      ultra_50k:  [0.65, 0.35]
      ultra_50m:  [0.60, 0.40]
      ultra_100k: [0.60, 0.40]
      ultra_100m: [0.55, 0.45]

    second_day_reduction_rule: "second_day = 0.50 to 0.75 * first_day"
    frequency:
      base:  "every_3_weeks"
      build: "every_2_weeks"
      peak:
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

  # 6) Vertical training
  vertical:
    mode:
      if_goal_race_vertical_gain_m_present: "vert_gain"
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
      BASE: 0.5
      BUILD: 0.75
      PEAK: 1.0
      TAPER: "reduce with volume, keep 1 hill exposure"

    downhill_exposure_rule:
      if_terrain_in: ["trail","mountain"]
      target_downhill_minutes_as_fraction_of_uphill: [0.6, 1.0]
      if_downhill_access_low: "use_eccentric_strength_module"

  # 7) Fueling skill progression
  fueling_training:
    start_practice_minutes: 90
    carb_targets_g_per_hour_by_phase:
      BASE:  [30, 60]
      BUILD: [60, 75]
      PEAK:  [75, 90]
    distance_targets:
      ultra_50k: [60, 75]
      ultra_50m: [75, 90]
      ultra_100k: [75, 90]
      ultra_100m: [75, 90]
    gut_training_ramp:
      start_g_per_hour: 45
      increase_g_per_hour: 10
      increase_every_days: [7, 14]
      regress_if_gi_issues_twice_in_14d: true
      regress_amount: -10
    long_run_requires_fueling_always_if_minutes_gte: 120
    hydration:
      fluid_ml_per_hour: [400, 800]
      sodium_mg_per_hour: [300, 600]
      salty_sweater_sodium_max: 900

  # 8) Night running (100K/100M)
  night_training:
    enabled_for: ["ultra_100k","ultra_100m"]
    sessions_total_by_distance:
      ultra_100k: [1, 2]
      ultra_100m: [2, 4]
    schedule_window_weeks_out:
      ultra_100k: [10, 4]
      ultra_100m: [14, 4]
    session_duration_minutes: [45, 120]
    rules:
      - "no_night_session_within_days_of_b2b: 7"
      - "night_sessions_are_zone_1_only"
      - "next_day_is_easy_or_rest"
    preferred_type:
      - "easy_run_finish_in_dark"
      - "easy_night_run_with_headlamp"
    max_overnight_simulations: 1
    overnight_allowed_only_if: "durability_green_4_weeks"

  # 9) Walking skill
  walking_skill:
    enable_structured_run_walk_if_any:
      - goal_race.distance_in: ["ultra_100k","ultra_100m"]
      - goal_race.terrain == "mountain"
    enable_micro_walks_for_fueling_if:
      run_minutes_gte: 120
    micro_walks:
      protocol: "30-45 sec walk every 20-30 min, use for fueling"
    structured_run_walk_defaults:
      ultra_100k:
        flat: "run 25 min / walk 5 min"
        climbs: "power hike steep grades"
      ultra_100m:
        flat: "run 20 min / walk 5 min (early), run 15 / walk 5 (late)"
        climbs: "power hike early and often"
    power_hike_training:
      trigger_grade_degrees: 15
      weekly_session_in_build: "6-10 x 3 min power hike uphill, easy down"
      long_run_hike_blocks: "10 min every 45-60 min (100K/100M)"
```

---

## 3. Periodization by Distance

### Phase Lengths (Weeks)

```yaml
ultra_periodization_weeks:
  ultra_50k:
    BASE_1: 3
    BASE_2: 3
    BUILD:  6
    PEAK:   2
    TAPER:  2
    total: 16
  ultra_50m:
    BASE_1: 4
    BASE_2: 4
    BUILD:  7
    PEAK:   2
    TAPER:  3
    total: 20
  ultra_100k:
    BASE_1: 5
    BASE_2: 5
    BUILD:  8
    PEAK:   3
    TAPER:  3
    total: 24
  ultra_100m:
    BASE_1: 6
    BASE_2: 6
    BUILD:  10
    PEAK:   4
    TAPER:  4
    total: 30

compression_extension_rules:
  if_fewer_weeks: "remove from BASE_1 first, then BASE_2, preserve BUILD+TAPER"
  if_more_weeks: "add to BASE_1, then BASE_2"
```

### Phase Intent (All Distances)

| Phase | Goal |
|-------|------|
| **BASE_1** | Tissue tolerance + aerobic habit, introduce hills gently |
| **BASE_2** | Build aerobic volume, keep strength heavy-ish but low soreness |
| **BUILD** | Long weekend progression, hiking skill, fueling progression |
| **PEAK** | Terrain + vert + fueling + gear rehearsals |
| **TAPER** | Reduce volume, keep frequency, keep short intensity touches |

### Intensity Distribution (Quality Minutes Cap %)

```yaml
quality_minutes_cap_pct:
  marathon: 0.20
  ultra_50k: 0.18
  ultra_50m: 0.15
  ultra_100k: 0.12
  ultra_100m: 0.10
```

*Most ultra "quality" should be uphill tempo/steady, not track speed.*

---

## 4. Weekly Templates

### Legend
- Z1 = easy / below VT1
- Z2 = moderate (minimize but allow controlled climbs)
- "ME" = muscular endurance (uphill + eccentric)
- Strength paired with harder run days

### Ultra 50K Templates

**BASE (6 weeks combined):**
- Mon: Z1 easy 35-55 min + Strength A (low volume)
- Tue: Hill strides or short hill reps (8-12 min work) + Z1 to 60-75 min
- Wed: Rest or cross-train 30-45 min + durability
- Thu: Steady Z1 run 50-75 min (trail if possible)
- Fri: Z1 easy 35-55 min + Strength B
- Sat: Z1 trail run or hike 45-75 min
- Sun: Long run 120-180 min (build toward 3h)

**BUILD:**
- Mon: Z1 easy 40-60 + durability
- Tue (quality): Cruise intervals at T-lite (3-5 x 6 min) OR hill tempo (2 x 12 min)
- Wed: Rest or Z1 cross-train 40-60
- Thu: Medium-long Z1 70-100 (include hills)
- Fri: Z1 easy 35-55 + Strength maintenance
- Sat: Z1 easy 45-75
- Sun: Long run 150-210 (progress to 3.5-4.0h max)

**Optional B2B week (if enabled):**
- Sat: 120-150 min
- Sun: 60-90 min (easy hike-run, fueling practice)

**PEAK (2 weeks):**
- 1 quality on Tue (shortened)
- Weekend: 1 "dress rehearsal" long run with full fueling + gear
- Sun long run: 180-240 (cap by config)

**TAPER (2 weeks):**
- Week -2: 70-80% volume, last long run 2.0-2.5h
- Week of: 45-60% volume, longest run 60-90 min with strides

### Ultra 50M Templates

**BASE:**
- Mon: Z1 easy 40-60 + Strength A
- Tue: Hill reps (short) OR T-lite intervals (12-20 min work)
- Wed: Rest or Z1 cross 40-60 + durability
- Thu: Medium-long Z1 75-105 (include uphill)
- Fri: Z1 easy 35-55 + Strength B
- Sat: Z1 trail 60-90
- Sun: Long run 150-210 (build to 4h)

**BUILD:**
- Mon: Z1 easy 40-60 + durability
- Tue (quality): Uphill tempo or cruise intervals (12-24 min work)
- Wed: Z1 easy 45-60
- Thu: Medium-long Z1 90-120 (add hill time)
- Fri: Z1 easy 35-55 + Strength maintenance
- Sat: Long run 150-240 (trail)
- Sun: Second long run 90-150 (easy hike-run)

**B2B ratio example:** Weekend total 6h → Sat 3.5h, Sun 2.5h

### Ultra 100K Templates

**BUILD:**
- Mon: Z1 easy 45-60
- Tue (quality): Uphill tempo or intervals (12-20 min work)
- Wed: Z1 easy 45-60 + durability
- Thu: Medium-long Z1 105-150 (hill focus)
- Fri: Z1 easy 35-55 + Strength maintenance
- Sat: Long run 210-300 (3.5-5h)
- Sun: Second long run 120-210 (2-3.5h)

### Ultra 100M Templates

**BUILD:**
- Mon: Z1 easy 45-60
- Tue (quality): Uphill tempo (2 x 12 min) OR intervals (3 x 8 min)
- Wed: Z1 easy 45-60 + durability
- Thu: Medium-long Z1 120-180 (cornerstone session)
- Fri: Z1 easy 35-55 + Strength maintenance
- Sat: Long run 240-360 (4-6h)
- Sun: Second long run 180-300 (3-5h, mostly hike-run)

---

## 5. Ultra-Specific Strength Modules

```yaml
ultra_strength_modules:

  downhill_eccentric:
    enabled_if:
      terrain_in: ["trail","mountain"]
    frequency_per_week:
      BASE: 1
      BUILD: 1
      PEAK: 1
      TAPER: 0
    progression:
      start_weekly_sets_total: 4
      max_weekly_sets_total: 10
      increase_rule: "add 1 set/week if DOMS_lower <= 4/10 and no knee pain"
    exercises:
      - step_downs: "3x6 each leg, 3 sec eccentric"
      - decline_split_squat: "3x6 each leg, slow down"
      - eccentric_calf_lowering: "3x8 each side"
      - reverse_nordic_partial: "2x5 controlled"

  poles_and_hiking:
    enabled_if:
      goal_race.distance_in: ["ultra_50m","ultra_100k","ultra_100m"]
      terrain_in: ["trail","mountain"]
    frequency_per_week: 1
    introduce_weeks_before_race: [8, 6]
    exercises:
      - lat_pull_or_row: "3x8"
      - triceps_pressdown_or_dips: "3x10"
      - anti_rotation_core: "3x10 each side"
      - loaded_stepups: "2-3x6 each leg (moderate, no burn)"

  foot_ankle_calf_durability:
    frequency_per_week: [3, 5]
    dose: "micro (5-10 min)"
    exercises:
      - calf_raises: "2x12-15 slow"
      - tibialis_raise: "2x15"
      - toe_yoga: "30 sec holds"
      - single_leg_balance: "30 sec each"
```

---

## 6. Taper Rules

```yaml
ultra_taper:
  duration_weeks:
    ultra_50k: 2
    ultra_50m: [2, 3]
    ultra_100k: 3
    ultra_100m: [3, 4]

  volume_decay_example_3_week:
    week_minus_3: [0.75, 0.85]
    week_minus_2: [0.55, 0.65]
    week_minus_1: [0.35, 0.50]

  rules:
    - "keep_frequency_similar"
    - "keep_short_intensity_touches"
    - "keep_terrain_and_vert_specificity"
    - "last_long_run_10_days_out_minimum"
    - "last_b2b_ends_at_week_minus_3"
```

---

## 7. Decision Rules (Pseudocode)

```python
def is_ultra(distance): 
    return distance in ["ultra_50k","ultra_50m","ultra_100k","ultra_100m"]

def primary_volume_unit(goal_race):
    if is_ultra(goal_race.distance) and goal_race.terrain in ["trail","mountain"]:
        return "minutes"
    return "miles"

def get_ultra_phase(distance, weeks_to_race):
    # Use periodization_weeks to compute phase boundaries
    return phase

def is_b2b_week(athlete, plan_state, phase):
    if athlete.goal_race.distance not in b2b.enabled_for + b2b.optional_for:
        return False
    
    # Check gates
    if plan_state.injury_status != "green":
        return False
    if plan_state.amber_days_last_14 > 0:
        return False
    if plan_state.longest_long_run_minutes_30d < gate_minutes(distance):
        return False
        
    # Check frequency pattern
    return matches_frequency_pattern(week_number, phase, distance)

def long_run_day_cap_minutes(athlete, plan_state, distance, terrain):
    lo, hi = ultra_engine.long_run_caps_hours_by_race[distance][terrain]
    cap_by_config = hi * 60
    cap_by_athlete = athlete.max_session_minutes
    cap_by_weekly_percent = ultra_engine.single_long_run_percent * weekly_target
    cap_by_spike = 1.10 * longest_long_run_minutes_30d  # duration spike rule
    return min(cap_by_config, cap_by_athlete, cap_by_weekly_percent, cap_by_spike)

def split_b2b(weekend_total_min, distance):
    r1, r2 = b2b.ratio_defaults[distance]
    day1 = weekend_total_min * r1
    day2 = weekend_total_min * r2
    # Enforce second_day = 0.50 to 0.75 of first_day
    day2 = clamp(day2, 0.50*day1, 0.75*day1)
    return day1, weekend_total_min - day1
```

---

*Sources: Jason Koop (Training Essentials for Ultrarunning), CTS, iRunFar, Uphill Athlete, GSSI*
