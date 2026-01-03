Created: 2026-01-03T00:21:07.682Z
Status: completed
Models:
- gpt-5.1-pro — completed tok=3.77k/3.87k
Prompt:
Research Jack Daniels Running Formula and VDOT system. I need: 1) How VDOT maps
race times to training paces 2) Training pace zones - Easy, Marathon, Threshold,
Interval, Repetition - definitions and purposes 3) How to calculate training
paces from a race result 4) Rules about Easy pace (why faster is not better) 5)
How often VDOT should be updated. Return specific rules I can encode into a pace
calculator.
---
Answer:[22m
Below is a practical, “calculator-ready” breakdown of Jack Daniels’ VDOT concept and how it turns a race result into training paces and workout guidance, using published Daniels/Gilbert equations plus the official VDOT intensity definitions (E, M, T, I, R) from VDOTO2. ([V.O2][1])
---
## 1) How VDOT maps race times to training paces
VDOT is intended to represent your **current** running ability. The VDOT calculator workflow is:
1. **You enter a recent race (or time trial) distance + time** to get a VDOT score and training paces. ([V.O2][1])
2. That race result is converted into an estimate of:
   * the **oxygen cost** (VO2 demand) of running that speed, and
   * the **fraction of VO2max you can sustain** for that race duration
     which yields an estimated “effective VO2max” (VDOT). 
3. Training paces are then assigned by **intensity bands** (percent of VO2max or HRmax) matched to the workout’s purpose:
   * Easy (E): aerobic base and recovery
   * Marathon (M): practice sustained marathon effort
   * Threshold (T): improve endurance and lactate clearance
   * Interval (I): stress VO2max (aerobic power)
   * Repetition (R): improve speed and running economy
     ([V.O2][1])
In other words, the mapping is:
**Race result → VDOT → (zone intensity definition) → target training pace(s)** ([V.O2][1])
---
## 2) Training pace zones: definitions, purposes, and “rules you can encode”
Below are the VDOTO2 definitions distilled into implementable rules: intensity targets, what the run is for, plus practical constraints (rep length, recovery style, and session caps).
### Easy pace (E)
**Use for:** warm-ups, cool-downs, recovery runs, easy-day runs, and generally long runs. ([V.O2][1])
**Intensity (encode as range):**
* ~59% to 74% of VO2max, or ~65% to 79% HRmax ([V.O2][1])
  **Purpose:** maximize aerobic development and durability with low stress; build the base that supports harder work. ([V.O2][1])
  **Day-to-day flexibility rule (encode):**
* E pace is conversational and can vary with recovery/terrain/weather. VDOTO2 explicitly allows being about **20 seconds per mile slower or faster** than the specified pace on a given day. ([V.O2][1])
  **Long run cap (optional but very “Daniels-like” to encode):**
* Keep long runs <= 25% to 30% of weekly mileage OR 150 minutes, whichever is less. ([V.O2][2])
### Marathon pace (M)
**Use for:** steady runs or long repeats (especially for marathon-focused training). ([V.O2][1])
**Intensity (encode as range):**
* ~75% to 84% of VO2max, or ~80% to 90% HRmax ([V.O2][1])
  **Purpose:** practice sustained marathon race effort, or a moderate alternative to easy running on some long-run days. ([V.O2][1])
  **Marathon-session cap (optional):**
* Maximum duration: the lesser of 20% of weekly mileage and 18 miles. ([V.O2][2])
### Threshold pace (T)
**Use for:** steady “tempo” runs or cruise intervals (broken tempos). ([V.O2][1])
**Intensity (encode as range):**
* ~83% to 88% of VO2max, or ~88% to 92% HRmax ([V.O2][1])
  **Purpose:** improve endurance, especially your ability to clear blood lactate. ([V.O2][2])
  **Typical structure rules (encode):**
* Continuous: about 3 to 4 miles (5 to 6 km) at T pace, or
* Intervals: repeats of 5 to 15 minutes with 1 to 3 minutes recovery. ([V.O2][1])
  **Volume guidance (optional):**
* A steady 20-minute T run is “long enough” for one session, or total T running around ~10% of weekly mileage. ([V.O2][2])
  **Important “do not overcook it” rule:**
* VDOTO2 notes that going harder than true T pace is not necessarily better. ([V.O2][2])
### Interval pace (I)
**Use for:** VO2max intervals. ([V.O2][1])
**Intensity (encode as range):**
* ~97% to 100% of VO2max (and ~98% to 100% HRmax is cited as a rough correlate) ([V.O2][1])
  **Purpose:** stress aerobic power (VO2max). ([V.O2][1])
  **Workbout rules (encode):**
* Duration: 1 to 5 minutes per repetition (commonly 3 to 5 minutes) ([V.O2][1])
* Recovery: active (jog), typically equal to or slightly less than the workbout duration ([V.O2][2])
  **Why reps are usually 3 to 5 minutes (encode as explanation text):**
* It takes about ~2 minutes to “gear up” to VO2max; going much longer than 5 minutes increases anaerobic contribution and lactate, which can defeat the session’s purpose. ([V.O2][1])
  **Session cap (optional):**
* Total I running in a session should not exceed the lesser of 8% of weekly mileage and 10k. ([V.O2][2])
### Repetition pace (R)
**Use for:** short, fast reps for speed and economy. ([V.O2][1])
**Intensity (encode as “equivalent race pace”):**
* About current **1500m or mile race pace** ([V.O2][2])
  **Workbout rules (encode):**
* Workbouts: “relatively short,” up to about 2 minutes ([V.O2][2])
* Recovery: long enough for **full recovery** so each rep does not feel harder than the last; relaxed form is the point. ([V.O2][1])
  **Anti-pattern rule (important to encode):**
* Shortening recoveries does not make it better and can worsen economy and mechanics. ([V.O2][1])
  **Session cap (optional):**
* Limit R running per session to the lesser of 5% weekly mileage and 5 miles. ([V.O2][2])
---
## 3) How to calculate training paces from a race result (calculator spec)
### Step A: Compute VDOT from (distance, time)
The Daniels/Gilbert method estimates oxygen demand at your race velocity and divides by the fraction of VO2max you can sustain for that race duration. 
**Inputs:**
* `D` = race distance in meters
* `T` = race time in minutes (or seconds, but convert)
**Equations (units matter):**
1. Velocity `v` in meters per minute:
* `v = D / T`
2. VO2 demand (ml/kg/min):
* `VO2 = -4.6 + 0.182258*v + 0.000104*v^2` 
3. Percent of VO2max sustainable for duration `T` (dimensionless fraction):
* `pct = 0.8 + 0.1894393*exp(-0.012778*T) + 0.2989558*exp(-0.1932605*T)` 
4. VDOT:
* `VDOT = VO2 / pct` 
**Distance guardrail to encode:** VDOTO2’s calculator enforces distance >= 800m. ([V.O2][1])
---
### Step B: Convert VDOT into zone paces
You have two solid implementation options.
#### Option 1 (straightforward and transparent): Convert zone intensity (%VO2max) to a pace range
This aligns nicely with VDOTO2’s published intensity ranges per zone. ([V.O2][1])
1. Pick a target VO2 for the zone:
* `VO2_target = fraction * VDOT`
Example fractions you can encode directly from VDOTO2:
* E: 0.59 to 0.74 ([V.O2][1])
* M: 0.75 to 0.84 ([V.O2][1])
* T: 0.83 to 0.88 ([V.O2][1])
* I: 0.97 to 1.00 ([V.O2][1])
2. Invert the VO2 demand equation to get speed `v` (m/min).
   You solve:
* `0.000104*v^2 + 0.182258*v - 4.6 - VO2_target = 0`
Use the positive root:
* `v = (-0.182258 + sqrt(0.182258^2 - 4*0.000104*(-4.6 - VO2_target))) / (2*0.000104)`
3. Convert speed to pace:
* pace (min/km) = `1000 / v`
* pace (min/mile) = `1609.344 / v`
This gives you:
* **E pace as a range**
* **M pace as a range**
* **T pace as a narrow range (often you may present a single “center” value)**
* **I pace as a narrow range (often presented as a single value)**
#### Option 2 (more “Daniels-like” for R pace): Compute equivalent mile or 1500m race pace from your VDOT
VDOTO2 defines R as about 1500m or mile race pace, and also emphasizes full recovery and relaxed form. ([V.O2][2])
To implement:
* Compute `VDOT` from the race result (Step A)
* Find the **time for 1500m or 1 mile** such that `VDOT_from_race(distance, time) == VDOT`
  * Use binary search since VDOT decreases as time increases (monotonic relationship for a fixed distance in practical ranges)
Then:
* `R_pace = equivalent_mile_pace` (or equivalent 1500m pace)
* Also output track splits: 200m, 300m, 400m from that pace (and show “full recovery required” messaging)
---
### Calculator-ready pseudocode
```python
import math
def vdot_from_race(distance_m: float, time_s: float) -> float:
    if distance_m < 800:
        raise ValueError("Distance must be at least 800m (VDOTO2 calculator constraint).")
    T = time_s / 60.0                    # minutes
    v = distance_m / T                   # m/min
    VO2 = -4.6 + 0.182258*v + 0.000104*(v**2)
    pct = 0.8 + 0.1894393*math.exp(-0.012778*T) + 0.2989558*math.exp(-0.1932605*T)
    return VO2 / pct
def speed_from_vo2_target(vo2_target: float) -> float:
    # Solve 0.000104*v^2 + 0.182258*v - 4.6 - vo2_target = 0 for v > 0
    a = 0.000104
    b = 0.182258
    c = -4.6 - vo2_target
    disc = b*b - 4*a*c
    return (-b + math.sqrt(disc)) / (2*a)  # positive root
def pace_sec_per_unit(v_m_per_min: float, meters: float) -> float:
    # pace time to cover `meters`
    minutes = meters / v_m_per_min
    return minutes * 60.0
def zone_pace_range_from_vdot(vdot: float, frac_low: float, frac_high: float, unit: str):
    # unit: "km" or "mile"
    meters = 1000.0 if unit == "km" else 1609.344
    v_slow = speed_from_vo2_target(frac_low * vdot)   # lower intensity -> slower speed
    v_fast = speed_from_vo2_target(frac_high * vdot)  # higher intensity -> faster speed
    sec_fast = pace_sec_per_unit(v_fast, meters)
    sec_slow = pace_sec_per_unit(v_slow, meters)
    return (sec_fast, sec_slow)
def time_for_distance_at_vdot(distance_m: float, target_vdot: float, lo_s: float, hi_s: float) -> float:
    # Binary search for time so that vdot_from_race(distance, time) ~= target_vdot
    for _ in range(80):
        mid = (lo_s + hi_s) / 2.0
        mid_vdot = vdot_from_race(distance_m, mid)
        if mid_vdot > target_vdot:
            lo_s = mid
        else:
            hi_s = mid
    return (lo_s + hi_s) / 2.0
def repetition_pace_from_vdot(vdot: float, use_distance_m: float = 1609.344) -> float:
    # Equivalent mile pace (or use 1500m) as R pace proxy
    t = time_for_distance_at_vdot(use_distance_m, vdot, lo_s=180, hi_s=1200)
    return t / (use_distance_m / 1609.344)  # sec per mile
```
---
## 4) Easy pace rules (and why faster is not better)
These are the most important “guardrails” to encode, because a pace calculator can accidentally encourage the classic mistake: turning E into “moderately hard” running.
### Easy pace is foundational volume, not a “prove fitness” pace
* VDOTO2 emphasizes that Easy pace is a large majority of running in a proper plan, and that many people run too fast on Easy days. ([V.O2 News][3])
* Easy runs can make up roughly ~70% (+/-) of a runner’s weekly schedule during a training cycle. ([V.O2 News][4])
### The benefit is driven heavily by time at low stress, not by forcing speed
* VDOTO2 explicitly frames Easy-run benefits as tied to time spent running rather than speed, and warns that faster Easy running can hurt more than it helps. ([V.O2 News][3])
* They also state Easy pace is designed to pinpoint maximum benefit for the least effort. ([V.O2 News][5])
### Encode Easy as a range plus an “effort override”
Concrete rules you can build into UX and logic:
1. **Output an E range, not a single number** (59% to 74% of VO2max). ([V.O2][1])
2. **Label the fast end as a ceiling**, not a goal.
   * Provide copy like: “If you are tired, hot, on hills, or not recovered, run the slower end.”
3. **Allow day-to-day variance**:
   * VDOTO2 allows about **20 seconds per mile slower or faster** than the specified E pace on a given day. ([V.O2][1])
4. **Add talk-test guidance** (effort-based validation):
   * Easy is “conversational.” If you cannot comfortably talk, you are likely too fast for E. ([V.O2][1])
5. **“Do not follow paces blindly” warning when conditions are harsh**:
   * VDOTO2 notes that heat, terrain, wind, and recovery state can make pace targets misleading; in those cases, effort should govern. ([V.O2 News][5])
---
## 5) How often VDOT should be updated (specific, encodable)
### Primary rule: update when you have a new representative race or time trial
* VDOTO2 repeatedly frames VDOT input as a recent race or time trial that reflects current fitness. ([V.O2][1])
### “No races available” rule: increase cautiously and infrequently
Dr. Jack Daniels’ stated guidance (crowdsourced Q&A on VDOTO2):
* If you **do not have a race** to update VDOT, and training is going well **without undue stress**, increase by **1 VDOT** about every **4 to 6 weeks**, **but not more often**. ([V.O2 News][6])
### Implementation logic you can encode
* `VDOT_source = "race"` when user inputs a race and chooses “Use this to set training paces.”
* `VDOT_source = "manual progression"` only when:
  * user confirms “No recent race/time trial”
  * user confirms training is going well and they are not accumulating undue stress
  * and it has been at least 4 weeks since last VDOT bump
    Then:
  * `VDOT_new = VDOT_old + 1`
  * block additional bumps until 4 weeks have passed (or require a new race result). ([V.O2 News][6])
---
## A compact “rules config” you can lift into your pace calculator
```json
{
  "vdot_input": {
    "min_distance_m": 800,
    "should_represent_current_fitness": true
  },
  "zones": {
    "E": {
      "vo2_frac_range": [0.59, 0.74],
      "hrmax_frac_range": [0.65, 0.79],
      "day_variation_sec_per_mile": 20,
      "effort_check": "conversational",
      "use_cases": ["warmup", "cooldown", "recovery", "easy_run", "long_run"]
    },
    "M": {
      "vo2_frac_range": [0.75, 0.84],
      "hrmax_frac_range": [0.80, 0.90],
      "use_cases": ["steady", "long_repeats"]
    },
    "T": {
      "vo2_frac_range": [0.83, 0.88],
      "hrmax_frac_range": [0.88, 0.92],
      "use_cases": ["tempo", "cruise_intervals"]
    },
    "I": {
      "vo2_frac_range": [0.97, 1.00],
      "hrmax_frac_range": [0.98, 1.00],
      "workbout_min_min": 1,
      "workbout_max_min": 5,
      "preferred_workbout_min_min": 3,
      "preferred_workbout_max_min": 5,
      "recovery_rule": "active_jog_equal_or_slightly_less_than_workbout"
    },
    "R": {
      "pace_definition": "equivalent_mile_or_1500m_race_pace",
      "workbout_max_min": 2,
      "recovery_rule": "full_recovery_relaxed_form_required"
    }
  },
  "vdot_update": {
    "update_on_new_race": true,
    "no_race_progression": {
      "increment": 1,
      "min_weeks_between_increments": 4,
      "max_weeks_between_increments": 6,
      "require_no_undue_stress": true
    }
  }
}
```
---
If you tell me which unit system you want your calculator to default to (min/mile vs min/km) and whether you want to present M, T, and I as a single number or as a range, I can tailor the exact output format and rounding rules without changing the underlying Daniels-consistent logic.
[1]: https://vdoto2.com/calculator "V.O2 Running Calculator"
[2]: https://vdoto2.com/learn-more/training-definitions "Training Definitions | V.O2"
[3]: https://news.vdoto2.com/2017/11/whats-easy-pace/ "What's Your Easy Pace? - Learn More At VDOTO2.COM"
[4]: https://news.vdoto2.com/2025/06/how-to-approach-easy-runs/ "How To Approach Easy Runs - V.O2 News"
[5]: https://news.vdoto2.com/2017/07/understanding-effort-not-just-pace/ "Understanding Effort, Not Just Running Pace - Learning VDOT"
[6]: https://news.vdoto2.com/2018/06/ask-dr-jack-daniels-crowdsourced-edition/ "Ask Dr. Jack Daniels - Crowdsourced Edition - V.O2 News"
[34m17m53s · gpt-5.1-pro[browser] · ↑103 ↓3.77k ↻0 Δ3.87k[39m
17m53s · gpt-5.1-pro[browser] · ↑103 ↓3.77k ↻0 Δ3.87k | slug=daniels-vdot-pace-research
