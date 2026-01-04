# Hal Higdon Marathon Training Master (Oracle Research)

> Complete encodable configurations for all Hal Higdon marathon training tiers: Novice 1/2, Novice Supreme, Intermediate 1/2, Advanced 1/2.

---

```yaml
schema_version: longgame.higdon.v1
method: hal_higdon
generated_at: "2026-01-04"
units:
  distance: mi
  duration: min
  heart_rate: "%HRmax"

# --------------------------------------------------------------------
# Normalized intensity vocabulary (use as canonical keys in your app).
# --------------------------------------------------------------------
intensity_guidance:
  easy:
    effort_cues: [conversational, relaxed]
    hr_zone_pct_hrmax: [65, 75]
  long_run:
    pace_offset_sec_per_mile_vs_race_pace: [30, 90]
    fallback_effort_if_no_race_pace_known: easy
  race_pace:
    definition: "The pace you plan to run in the goal race (GMP for marathon plans)."
  tempo:
    effort_cues: [controlled_discomfort, sustainable]
    typical_duration_min: [30, 45]
    structure_hint:
      - easy_start
      - build_to_near_10k_effort
      - ease_back
  hills:
    typical_hill_length: "about 0.25 mile"
    effort: hard_uphill
    recovery: jog_down
  intervals:
    common_rep_families:
      m800: {rep_distance_m: 800, example_sets: ["4x800", "5x800", "6x800", "7x800", "8x800"]}
      m400: {rep_distance_m: 400, example_sets: ["4x400"]}

cross_training_guidance:
  recommended_modalities: [swim, bike, walk, ski, snowshoe]
  avoid_modalities: ["sports requiring sudden or sideways movements"]
  intensity: easy
  typical_duration_min: [30, 60]

global_philosophy:
  long_run_cap_mi: 20
  long_run_cap_rationale:
    - "Cap long runs at 20 miles to reduce excessive fatigue and preserve energy for consistency and quality midweek running."
  stepback_week:
    cadence: "every_3rd_week (with tune-up and taper exceptions)"
    observed_long_run_reduction_pct_range: [20, 40]
    observed_weekly_running_reduction_pct_range: [5, 30]
    affects_sessions: [long_run, some_weekday_runs, sometimes_race_pace_run]
  marathon_taper:
    length_weeks: 3
    default_long_run_pattern_mi:
      peak: 20
      w_minus2: 12
      w_minus1: 8
      race_week: 26.2

# --------------------------------------------------------------------
# Marathon plans
# --------------------------------------------------------------------
programs:
  marathon:
    novice_1:
      duration_weeks: 18
      typical_week_counts: {run_days: 4, cross_train_days: 1, rest_days: 2}
      long_run_day: sat
      microcycle_template:
        mon: {type: rest}
        tue: {type: easy_run, distance_mi_range: [3, 5]}
        wed: {type: easy_run, distance_mi_range: [3, 10]}
        thu: {type: easy_run, distance_mi_range: [3, 5]}
        fri: {type: rest}
        sat: {type: long_run, distance_mi_start: 6, distance_mi_peak: 20}
        sun: {type: cross_train, duration_min_range: [30, 60]}
      pace_guidance_by_run_type:
        weekday_easy: easy
        long_run: long_run
      landmarks:
        tune_up_race: {week: 8, type: half_marathon, distance_mi: 13.1, replaces_long_run: true}
        peak_long_run: {week: 15, distance_mi: 20}
        twenty_milers: {count: 1, weeks: [15]}
        peak_week_running_mileage_mi_running_only: 40
      stepback_observed_from_printable_schedule:
        methodology: "Computed from week-to-week long-run decreases during the build phase."
        long_run_reduction_pct: {min: 22.2, median: 25.9, max: 30.0}
        weekly_running_mileage_reduction_pct: {min: 4.4, median: 8.1, max: 14.3}
      taper:
        length_weeks: 3
        long_run_pattern_mi: {peak: 20, w_minus2: 12, w_minus1: 8, race_week: 26.2}
        keeps: [run_frequency, easy_running]
        reduces: [total_mileage]
        drops: [no_new_stress]
      source_refs:
        program_page: "https://www.halhigdon.com/training-programs/marathon-training/novice-1-marathon/"
        printable_pdf: "https://www.halhigdon.com/wp-content/uploads/2018/04/Novice-1-Marathon-Printable.pdf"

    novice_2:
      duration_weeks: 18
      typical_week_counts: {run_days: 4, cross_train_days: 1, rest_days: 2}
      long_run_day: sat
      microcycle_template:
        mon: {type: rest}
        tue: {type: easy_run, distance_mi_range: [3, 5]}
        wed: {type: race_pace_run, distance_mi_range: [5, 8]}
        thu: {type: easy_run, distance_mi_range: [3, 5]}
        fri: {type: rest}
        sat: {type: long_run, distance_mi_start: 8, distance_mi_peak: 20}
        sun: {type: cross_train, duration_min_range: [30, 60]}
      pace_guidance_by_run_type:
        weekday_easy: easy
        midweek_race_pace: race_pace
        long_run: long_run
      landmarks:
        tune_up_race: {week: 9, type: half_marathon, distance_mi: 13.1, replaces_long_run: true}
        peak_long_run: {week: 15, distance_mi: 20}
        twenty_milers: {count: 1, weeks: [15]}
        peak_week_running_mileage_mi_running_only: 36
      stepback_observed_from_printable_schedule:
        long_run_reduction_pct: {min: 12.7, median: 27.8, max: 36.8}
        weekly_running_mileage_reduction_pct: {min: 6.3, median: 12.5, max: 15.0}
      taper:
        length_weeks: 3
        long_run_pattern_mi: {peak: 20, w_minus2: 12, w_minus1: 8, race_week: 26.2}
        keeps: [run_frequency, one_race_pace_touch_per_week_shorter]
        reduces: [total_mileage]
      source_refs:
        program_page: "https://www.halhigdon.com/training-programs/marathon-training/novice-2-marathon/"
        printable_pdf: "https://www.halhigdon.com/wp-content/uploads/2018/04/Novice-2-Marathon-Printable.pdf"

    novice_supreme:
      duration_weeks: 30
      typical_week_counts: {run_days: 4, cross_train_days: 1, rest_days: 2}
      composition:
        - {phase: base_training, weeks: 12, plan_ref: base_training_novice}
        - {phase: marathon_training, weeks: 18, plan_ref: novice_1}
      key_landmarks:
        base_phase_first_long_run_mi: 3
        marathon_phase_long_run_start_mi: 6
        marathon_phase_peak_long_run_mi: 20
      source_refs:
        program_page: "https://www.halhigdon.com/training-programs/marathon-training/novice-supreme/"

    intermediate_1:
      duration_weeks: 18
      typical_week_counts: {run_days: 5, cross_train_days: 1, rest_days: 1}
      long_run_day: sun
      microcycle_template:
        mon: {type: cross_train, duration_min_range: [30, 60]}
        tue: {type: easy_run, distance_mi_range: [3, 5]}
        wed: {type: easy_run, distance_mi_range: [5, 8]}
        thu: {type: easy_run, distance_mi_range: [3, 5]}
        fri: {type: rest}
        sat: {type: race_pace_run, distance_mi_range: [5, 8]}
        sun: {type: long_run, distance_mi_start: 8, distance_mi_peak: 20}
      special_patterns:
        weekend_back_to_back:
          days: {sat: race_pace_run, sun: long_run}
          intent: "Pre-fatigue with race-pace running so the Sunday long run stays controlled."
          presence: "default weekend pattern except tune-up/race weekends"
      landmarks:
        tune_up_race: {week: 9, type: half_marathon, distance_mi: 13.1, replaces_long_run: true}
        twenty_milers: {count: 2, weeks: [13, 15]}
        peak_week_running_mileage_mi_running_only: 44
      stepback_observed_from_printable_schedule:
        long_run_reduction_pct: {min: 12.7, median: 27.8, max: 40.0}
        weekly_running_mileage_reduction_pct: {min: 12.0, median: 15.4, max: 29.5}
      taper:
        length_weeks: 3
        keeps: [run_frequency, short_race_pace_run]
        reduces: [total_mileage, long_run_distance]
      source_refs:
        program_page: "https://www.halhigdon.com/training-programs/marathon-training/intermediate-1-marathon/"
        printable_pdf: "https://www.halhigdon.com/wp-content/uploads/2018/04/Intermediate-1-Marathon-Printable.pdf"

    intermediate_2:
      duration_weeks: 18
      typical_week_counts: {run_days: 5, cross_train_days: 1, rest_days: 1}
      long_run_day: sun
      microcycle_template:
        mon: {type: cross_train, duration_min_range: [30, 60]}
        tue: {type: easy_run, distance_mi_range: [3, 5]}
        wed: {type: easy_run, distance_mi_range: [5, 10]}
        thu: {type: easy_run, distance_mi_range: [3, 5]}
        fri: {type: rest}
        sat: {type: race_pace_run, distance_mi_range: [5, 10]}
        sun: {type: long_run, distance_mi_start: 10, distance_mi_peak: 20}
      special_patterns:
        weekend_back_to_back:
          days: {sat: race_pace_run, sun: long_run}
          intent: "Same back-to-back concept as Intermediate 1, with higher volume."
      landmarks:
        tune_up_race: {week: 9, type: half_marathon, distance_mi: 13.1, replaces_long_run: true}
        twenty_milers: {count: 3, weeks: [11, 13, 15]}
        peak_week_running_mileage_mi_running_only: 50
      stepback_observed_from_printable_schedule:
        long_run_reduction_pct: {min: 22.9, median: 31.4, max: 40.0}
        weekly_running_mileage_reduction_pct: {min: 3.7, median: 26.6, max: 32.0}
      taper:
        length_weeks: 3
        keeps: [run_frequency, short_race_pace_run]
        reduces: [total_mileage, long_run_distance]
      source_refs:
        program_page: "https://www.halhigdon.com/training-programs/marathon-training/intermediate-2-marathon/"

    advanced_1:
      duration_weeks: 18
      typical_week_counts: {run_days: 6, rest_days: 1}
      long_run_day: sun
      microcycle_template:
        mon: {type: easy_run, distance_mi_range: [3, 5]}
        tue: {type: easy_run, distance_mi_range: [5, 10]}
        wed: {type: easy_run, distance_mi_range: [3, 5]}
        thu:
          type: speedwork
          variants:
            hill_repeats: {example_sets: ["3xhill", "4xhill", "5xhill", "6xhill", "7xhill"]}
            tempo_run: {duration_min_range: [30, 45]}
            intervals_800: {example_sets: ["4x800", "5x800", "6x800", "7x800", "8x800"]}
        fri: {type: rest}
        sat: {type: race_pace_run, distance_mi_range: [5, 10]}
        sun: {type: long_run, distance_mi_start: 10, distance_mi_peak: 20}
      special_patterns:
        three_one_long_run:
          structure:
            easy_fraction: 0.75
            fast_fraction: 0.25
            fast_segment_intensity: "steady; faster than easy but not race pace"
          max_frequency: "no more than once every 3 weekends"
          recommended_cycle: ["easy_long_run", "3_1_long_run", "stepback_long_run"]
      landmarks:
        tune_up_race: {week: 9, type: half_marathon, distance_mi: 13.1}
        twenty_milers: {count: 3, weeks: [11, 13, 15]}
        peak_week_known_mileage_excluding_speedwork_mi: 50
      taper:
        length_weeks: 3
        keeps: [some_intensity_shortened]
        reduces: [total_mileage, long_run_distance]
      source_refs:
        program_page: "https://www.halhigdon.com/training-programs/marathon-training/advanced-1-marathon/"
        printable_pdf: "https://www.halhigdon.com/wp-content/uploads/2018/04/Advanced-1-Marathon-Printable.pdf"

    advanced_2:
      duration_weeks: 18
      typical_week_counts: {run_days: 6, rest_days: 1}
      long_run_day: sun
      microcycle_template:
        mon: {type: easy_run, distance_mi_range: [3, 5]}
        tue:
          type: speedwork
          variants:
            hill_repeats: {example_sets: ["3xhill", "5xhill", "6xhill", "7xhill"]}
            tempo_run: {duration_min_range: [30, 45]}
            race_pace_run: {distance_mi_range: [4, 6]}
            intervals_800: {example_sets: ["4x800", "5x800", "6x800", "7x800", "8x800"]}
            intervals_400: {example_sets: ["4x400"]}
        wed: {type: easy_run, distance_mi_range: [3, 5]}
        thu:
          type: speedwork_or_race_pace
          variants:
            hill_repeats: {example_sets: ["3xhill", "4xhill", "6xhill", "7xhill", "8xhill"]}
            tempo_run: {duration_min_range: [30, 45]}
            race_pace_run: {distance_mi_range: [4, 6]}
            intervals_800: {example_sets: ["4x800", "5x800", "6x800", "7x800", "8x800"]}
        fri: {type: rest}
        sat: {type: race_pace_run, distance_mi_range: [4, 10]}
        sun: {type: long_run, distance_mi_start: 10, distance_mi_peak: 20}
      special_patterns:
        three_one_long_run:
          structure:
            easy_fraction: 0.75
            fast_fraction: 0.25
            fast_segment_intensity: "steady; faster than easy but not race pace"
          max_frequency: "no more than once every 3 weekends"
          recommended_cycle: ["easy_long_run", "3_1_long_run", "stepback_long_run"]
      landmarks:
        tune_up_race: {week: 9, type: half_marathon, distance_mi: 13.1}
        twenty_milers: {count: 3, weeks: [11, 13, 15]}
        peak_week_known_mileage_excluding_speedwork_mi: 45
      cross_training_optional_substitution:
        allowed_days: [mon, wed]
        guidance: "Substitute cross-training of equal time and similar stress."
      taper:
        length_weeks: 3
        keeps: [some_intensity_shortened]
        reduces: [total_mileage, long_run_distance]
      source_refs:
        program_page: "https://www.halhigdon.com/training-programs/marathon-training/advanced-2-marathon/"
        printable_pdf: "https://www.halhigdon.com/wp-content/uploads/2018/04/Advanced-2-Marathon-Printable.pdf"

  # ------------------------------------------------------------------
  # Other distances
  # ------------------------------------------------------------------
  other_distances:
    five_k:
      duration_weeks: 8
      tiers:
        novice: {typical_week_counts: {run_days: 3, walk_days: 3, rest_days: 1}, longest_workout_mi: 3}
        intermediate: {typical_week_counts: {run_days: 5, rest_days: 2}, longest_workout_mi: 7}
        advanced: {typical_week_counts: {run_days: 6, rest_days: 1}, longest_workout_mi: 12}
      structural_differences_vs_marathon:
        - "Much shorter cycle (8 weeks) and much shorter long run."
        - "Higher tiers emphasize speed and frequency rather than progressive long runs."

    ten_k:
      duration_weeks: 8
      tiers:
        novice: {typical_week_counts: {run_days: 3, cross_train_days: 2, rest_days: 2}, longest_workout_mi: 5.5}
        intermediate: {typical_week_counts: {run_days: 5, cross_train_days: 1, rest_days: 1}, longest_workout_mi: 8}
      structural_differences_vs_marathon:
        - "8-week build; long run does not approach 20 and overall volume is lower."

    half_marathon:
      novice_1:
        duration_weeks: 12
        typical_week_counts: {run_days: 4, cross_train_days: 2, rest_days: 2, strength_days: 1}
        longest_workout_mi: 10
        tune_up_races_in_schedule: [{week: 6, type: "5K"}, {week: 9, type: "10K"}]
      structural_differences_vs_marathon:
        - "Shorter cycle (12 weeks) with peak long run of 10 miles before the race."

    base_training_novice:
      duration_weeks: 12
      typical_week_counts: {run_days: 4, walk_days: 1, rest_days: 2}
      longest_workout_mi: 6

    fifty_k:
      duration_weeks: 26
      structural_differences_vs_marathon:
        - "Longer cycle and stronger focus on time-on-feet."
        - "Long runs may be prescribed in hours near the peak rather than only miles."

# ------------------------------------------------------------------
# Tier Comparisons
# ------------------------------------------------------------------
comparisons:
  novice_vs_advanced_marathon:
    days_per_week:
      novice_1: {run_days: 4, cross_train_days: 1, rest_days: 2}
      intermediate_1: {run_days: 5, cross_train_days: 1, rest_days: 1}
      advanced_2: {run_days: 6, cross_train_days: 0, rest_days: 1}
    quality_sessions:
      novice_1: []
      novice_2: ["1x weekly race-pace run (Wed)"]
      intermediate: ["1x weekly race-pace run (Sat)"]
      advanced_1: ["1x weekly speedwork (Thu) + 1x weekly race-pace run (Sat)"]
      advanced_2: ["2x weekly speedwork (Tue/Thu) + 1x weekly race-pace run (Sat)"]
    twenty_milers_by_tier:
      novice_1: {count: 1, weeks: [15]}
      novice_2: {count: 1, weeks: [15]}
      intermediate_1: {count: 2, weeks: [13, 15]}
      intermediate_2: {count: 3, weeks: [11, 13, 15]}
      advanced_1: {count: 3, weeks: [11, 13, 15]}
      advanced_2: {count: 3, weeks: [11, 13, 15]}
    peak_week_running_volume_mi:
      novice_1: 40
      novice_2: 36
      intermediate_1: 44
      intermediate_2: 50
      advanced_1: 50
      advanced_2: 45
```

---

## Audit: Higdon vs The Long Game

> From original competitive analysis (2026-01-04)

### TL;DR Comparison

| Aspect | Hal Higdon | The Long Game | Verdict |
|--------|------------|---------------|---------|
| Accessibility | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | He wins (simpler) |
| Scientific rigor | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | We win (VDOT-based) |
| Strength integration | ❌ | ⭐⭐⭐⭐⭐ | We win (unique) |
| Tiered levels | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | He wins (6 levels) |
| Missed workout guidance | ❌ | ⭐⭐⭐⭐ | We win |
| Cross-training | ⭐⭐⭐⭐ | ⭐⭐⭐ | Tie |
| Trust/brand | ⭐⭐⭐⭐⭐ | ⭐⭐ | He wins (decades of trust) |

### What Higdon Does Well (Learn From)

1. **Simple Tier Names** — "Novice 1" gives users identity
2. **Crystal-Clear Weekly Structure** — Dead simple at a glance
3. **Conservative Pacing** — Effort-first protects new runners
4. **20-Mile Cap** — Injury risk management baked in
5. **Predictable Stepbacks** — Every 3rd week, no surprises

### What We Do Better

1. **VDOT-Based Pacing** — Precision vs "conversational"
2. **Strength Integration** — Higdon has zero
3. **Missed Workout Logic** — Decision trees vs "listen to your body"
4. **Injury Routing** — Auto-modification vs "see a doctor"
5. **Durability Circuits** — Movement prep built in

### Gaps to Fill in The Long Game

| Gap | Higdon Has | We Should Add |
|-----|-----------|---------------|
| Named plan tiers | Novice 1/2, Int 1/2, Adv 1/2 | "Foundation / Hybrid / Performance" labels |
| Back-to-back runs | Sat MP + Sun LR (Intermediate) | Optional "tired legs" long run pattern |
| "3/1 Run" | Easy first 75%, faster last 25% | Advanced long run option |
| Cross-training alternatives | Swim/bike on rest days | Better cross-training suggestions |
| Clear pace messaging | Conversational + 30–90s offsets | Effort cues alongside VDOT paces |

---

## Key Insights for The Long Game

### What Higdon Does Well (Encode These)

1. **Simple Tier Names** → Users identify with "Novice 1" or "Intermediate 2"
2. **Consistent Stepback Pattern** → Every 3rd week, 20-40% long run reduction
3. **20-Mile Cap** → Injury risk management
4. **Weekend Back-to-Back (Intermediate)** → Saturday pace + Sunday long
5. **3/1 Long Run (Advanced)** → 75% easy + 25% faster finish
6. **3-Week Taper** → 20 → 12 → 8 → Race

### What We Add Beyond Higdon

1. **VDOT-based pacing** (vs effort-only)
2. **Strength integration** (zero in Higdon)
3. **Injury logic** (vs "see a doctor")
4. **Durability circuits** (vs minimal mobility)

### Implementation Notes

```yaml
deterministic_generation_strategy:
  - "Place fixed session types by weekday using microcycle_template."
  - "Generate long-run progression using landmarks + global stepback and taper rules."
  - "Represent speedwork as structured sessions (reps/time) plus warmup/cooldown policy."
```

---

*Source: Oracle Research (GPT-5.1-Pro, 39m48s thinking), halhigdon.com*
