Created: 2026-01-03T00:20:00.666Z
Status: completed
Models:
- gpt-5.1-pro — completed tok=2.98k/3.08k
Prompt:
Research the Hansons Marathon Method by Luke Humphrey. I need KEY PRINCIPLES
that can be encoded into a training app: 1) Cumulative fatigue philosophy - how
does it work? 2) Long run constraints (percentage of weekly mileage, time caps)?
3) Weekly structure - quality sessions, easy sessions, rest days? 4) Progression
rules - weekly mileage increase? 5) Cutback week frequency. Return specific,
actionable rules I can encode.
---
Answer:[22m
Below is a set of **specific, encodable rules** distilled from Luke Humphrey’s writing and the official Hansons Coaching Services “Beginner Marathon” and “Advanced Marathon” plan PDFs.
I’m treating “Hansons Marathon Method” as the system defined by:
* The book’s stated philosophy (cumulative fatigue and its components). 
* Luke Humphrey’s detailed explanation of why the classic plans use a 16 mile max long run, including **time caps** and **weekly percentage** logic. ([Luke Humphrey Running][1])
* The official free plan PDFs (Beginner and Advanced) for concrete structure, long run patterns, and down-week behavior. 
* Runner’s World’s summary of the “SOS” weekly layout and the speed-to-strength transition (matches the PDFs closely). ([Runner's World][2])
---
## 1) Cumulative fatigue philosophy, how it works
**What it is (in operational terms):** cumulative fatigue is built by **consistent training across many days** with **incomplete recovery between sessions**, so key sessions are done on “not-fresh” legs. The Hansons system is designed so removing one piece (mileage, intensity control, balance, consistency, recovery) breaks the whole effect. 
### Encodable rules for “cumulative fatigue”
**CF-1: Weekly frequency is high, and rest is limited**
* Target **6 run days/week** during the main block (the plans use a single weekly non-running day). ([Luke Humphrey Running][3])
* Enforce: `non_running_days_per_week = 1` (optional cross training allowed on that day). 
**CF-2: The long run is not “protected” by full rest before or after**
* Do **not** schedule a rest day immediately before the long run.
* Do **not** schedule a rest day immediately after the long run.
* In classic layout, the rest/cross day sits midweek, not adjacent to the long run. ([Luke Humphrey Running][1])
**CF-3: Hard efforts are capped at 3 “SOS” sessions per week**
* Define **SOS = {Speed/Strength, Tempo, Long Run}**.
* Enforce: `count(SOS_sessions_in_week) = 3` (no extra hard days). ([Runner's World][2])
**CF-4: Easy days must stay easy to preserve weekly volume**
* The method explicitly ties successful mileage to appropriate intensity (most running is threshold pace or slower, and overcooking paces reduces ability to hit volume). 
* App rule: if user runs easy days faster than allowed, flag as “breaks cumulative fatigue system” because it typically forces missed volume or missed SOS sessions.
**CF-5: If a workout is missed, do not “make it up” by stacking**
* Hansons emphasizes no single workout is “make or break”, and stacking to compensate undermines the system balance. ([Runner's World][2])
* App rule: `missed_session -> skip (do not reschedule as extra SOS); resume plan sequence`.
---
## 2) Long run constraints, percent-of-weekly and time caps
Luke Humphrey gives two explicit “why 16” constraints you can directly encode: **time on feet** and **percentage of weekly volume**. ([Luke Humphrey Running][1])
The official plans operationalize this with **three 16 milers max** and alternating shorter long runs. ([Runner's World][2])
### Encodable long run rules
**LR-1: Hard cap on duration**
* Luke cites research-based thresholds: aerobic adaptation thresholds around ~90 minutes, and **diminishing returns after ~3 hours**. ([Luke Humphrey Running][1])
* App rule: `long_run_duration_minutes <= 180`
**LR-2: Hard cap on distance**
* Classic Hansons long run max is **16 miles** (the plans top out at 16). ([Luke Humphrey Running][1])
* App rule: `long_run_distance_miles <= 16.0`
**LR-3: Long run must stay within ~25% to 30% of weekly mileage**
* Luke explicitly calls out the long run principle of **~25% to 30% of weekly mileage** and argues marathon plans should not abandon it. ([Luke Humphrey Running][1])
* App rule: `long_run_distance_miles <= 0.30 * weekly_mileage_miles`
* Recommended guardrail: `0.25 <= long_run_distance_miles / weekly_mileage_miles <= 0.30` when you are in peak long-run territory (in the Hansons PDFs, 16 miles lands inside that band). ([Luke Humphrey Running][1])
**LR-4: If duration cap is tighter than distance cap, reduce distance**
* App formula (distance chosen by the strictest constraint):
```text
LR_allowed = min(
  16.0,
  0.30 * weekly_mileage,
  easy_pace_miles_per_min * 180
)
```
This matches Luke’s “sweet spot” logic for slower runners where 16 miles could exceed 3 hours. ([Luke Humphrey Running][1])
**LR-5: Alternating long run pattern (built-in recovery)**
* Hansons alternates the long run with a **somewhat shorter long run every other week**, topping out with **three 16 milers**. ([Runner's World][2])
* The official PDFs implement this as “peak long run weeks” separated by weeks with a shorter Sunday run (often ~10 miles in the Advanced plan, and frequently 10 in the Beginner plan during the main block). 
* App rule:
  * `week_type alternates: {LONG, SHORT, LONG, SHORT, ...}`
  * `if week_type == LONG: long_run progresses upward until 16`
  * `if week_type == SHORT: long_run set to ~60% to 70% of LONG-week long run (commonly ~10 when LONG is 16)`
---
## 3) Weekly structure, quality sessions, easy sessions, rest day
Across sources, the “classic Hansons week” is consistent: **Tuesday speed/strength, Thursday tempo at goal marathon pace, Sunday long run**, with easy running on the other run days, and one rest/cross day. ([Luke Humphrey Running][3])
### Encodable weekly template rules
**WS-1: Fixed SOS days (default classic layout)**
* `Tue = Speed_or_Strength (SOS)`
* `Thu = Tempo_at_goal_MP (SOS)`
* `Sun = Long_Run (SOS)` ([Runner's World][2])
**WS-2: One rest/cross day midweek**
* The classic plan sample weeks use a “Day Off” midweek, and the plan PDFs label it “Rest or Cross-Train.” ([Luke Humphrey Running][3])
* App rule: `Wed = Rest_or_CrossTrain`
**WS-3: Easy mileage fills the other 3 run days**
* `Mon = Easy`
* `Fri = Easy`
* `Sat = Easy (often slightly longer than Fri/Mon in the PDFs)` 
**WS-4: Warmup and cooldown are part of SOS runs**
* The PDFs explicitly include warmups and cooldowns (example patterns: ~1 to 1.5 mile warmup, and ~1 mile cooldown). 
* App rule:
  * `Speed/Strength_session = warmup + reps + recovery_jogs + cooldown`
  * `Tempo_session = warmup + tempo_block + cooldown`
---
## 4) Progression rules, weekly mileage increase logic
Hansons frames mileage as foundational, increasing from fewer run days to ~6 run days, and increasing “one rung at a time”. 
The official plans show two important progression mechanics you can encode:
1. **Wave loading**: up week followed by a lighter week (tied to the alternating long run). ([Runner's World][2])
2. **Workout progression**: Tuesday changes from speed to strength later in the block, and Thursday tempo distance grows toward ~10 miles at goal marathon pace. ([Runner's World][2])
### Encodable progression rules
**PR-1: Choose a target mileage band by runner level**
* In the book preview’s mileage table, marathon weekly mileage guidance is approximately:
  * Beginner: ~40 to 50 miles/week
  * Competitive: ~60 to 70 miles/week 
* The free PDFs reflect this in practice: Beginner peaks in the high 50s, Advanced peaks low 60s. 
**PR-2: Use a 2-week wave (build then consolidate) once long runs begin**
* From the official Beginner and Advanced PDFs during the peak-specific segment, the “down weeks” are typically about **8% to 13% lower** than the prior “up week”. 
* App rules:
  * `BuildWeek.weekly_mileage = previous_BuildWeek.weekly_mileage * (1.00 to 1.08)` (early build can be higher, late build often flattens)
  * `ConsolidationWeek.weekly_mileage = prior_BuildWeek.weekly_mileage * (0.87 to 0.92)`
**PR-3: Increase mileage primarily via easy days, not by “making workouts bigger”**
* The system’s logic is that intensity that is too hard prevents hitting the weekly mileage goal. 
* App rule: when you need to add weekly miles, distribute added miles across **Mon/Fri/Sat** first, and only secondarily adjust warmup/cooldown.
**PR-4: Tuesday progression, speed then strength**
* Tuesday is “speed” early, then transitions to “strength” as the marathon gets closer. ([Runner's World][2])
* The PDFs implement this as:
  * Early: shorter intervals (examples: 400m, 600m, 800m, 1km, 1200m) at ~5k to 10k pace. 
  * Later: longer repeats at about **MP minus 10 sec/mile** (examples: 6 × 1 mile, 4 × 1.5 miles, 3 × 2 miles, 2 × 3 miles). 
* Encodable phase switch:
  * `if weeks_to_race > ~7: Tuesday = Speed`
  * `else: Tuesday = Strength`
**PR-5: Thursday tempo progression**
* Thursday is marathon pace running that increases in distance over the plan, with the goal of learning goal marathon pace under fatigue. ([Runner's World][2])
* The PDFs show a practical ramp from about **5 to 6 miles at goal MP** up to about **10 miles at goal MP** later in the plan. 
* App rule:
  * `tempo_block_miles starts ~5 to 6`
  * `tempo_block_miles increases by ~1 mile every ~2 to 3 weeks`
  * `tempo_block_miles max ~10`
---
## 5) Cutback week frequency
Hansons does not rely on “every 4th week cutback” as the primary recovery mechanism in the classic structure. Instead, it bakes recovery into the plan via:
1. **Every-other-week shorter long run**, which also tends to reduce weekly mileage. ([Runner's World][2])
2. A single midweek rest/cross day every week. 
3. A taper that reduces volume without eliminating intensity, especially close to race day. ([Runner's World][2])
### Encodable cutback rules
**CB-1: Primary cutback frequency is every other week**
* App rule: `cutback_week_every = 2` (wave loading)
* Implementation: cutback week corresponds to the “SHORT long run” week. ([Runner's World][2])
**CB-2: Cutback magnitude**
* App rule: `cutback_week_volume = prior_build_week_volume * (0.87 to 0.92)` during the main peak segment. 
**CB-3: Taper is a special cutback mode**
* Runner’s World notes Hansons uses a “modified taper” focused on consistency rather than a dramatic shutdown. ([Runner's World][2])
* The free PDFs show the final weeks reduce long run distance (for example, dropping to an 8-mile Sunday two weeks out) and sharply reduce pre-race mileage in race week. 
* App rule:
  * `taper_start = 3 weeks before race`
  * `reduce weekly volume ~10% week-over-week for 2 weeks`
  * `race_week_pre_race_miles ~40% to 50% of peak (exclude the marathon itself from this comparison)`
---
## A compact “rules config” you can directly translate into app logic
```text
RUN_DAYS_PER_WEEK = 6
NON_RUNNING_DAY = Wednesday (Rest_or_CrossTrain)
SOS_SESSIONS_PER_WEEK = 3
SOS_DAYS = { Tue: SpeedOrStrength, Thu: TempoMP, Sun: LongRun }
LONG_RUN:
  MAX_DISTANCE = 16.0 miles
  MAX_DURATION = 180 minutes
  MAX_WEEKLY_RATIO = 0.30
  PATTERN = alternate LONG, SHORT, LONG, SHORT...
CUTBACK_WEEKS:
  FREQUENCY = every 2nd week (the SHORT long-run week)
  VOLUME_REDUCTION = 8% to 13% vs prior build week
PROGRESSION:
  Increase weekly volume mainly by expanding easy days (Mon/Fri/Sat) first
  Tuesday phase:
    if weeks_to_race > ~7: Speed intervals (5k-10k pace)
    else: Strength repeats (MP - 10 sec/mi)
  Thursday tempo block:
    start 5-6 miles @ goal MP
    progress to ~10 miles @ goal MP
```
If you want, tell me how your app represents a plan (fixed plan templates vs adaptive generator), and I’ll convert the above into a clean set of validation checks plus a week-generator algorithm that outputs structured sessions (type, target miles, warmup/cooldown, and constraints).
[1]: https://lukehumphreyrunning.com/hansons-marathon-method-the-16-miler/ "Hanson’s Marathon Method: The 16 Miler - Luke Humphrey Running"
[2]: https://www.runnersworld.com/advanced/a20820524/marathoning-the-hansons-way/ "Marathoning The Hansons' Way | Runner's World"
[3]: https://lukehumphreyrunning.com/coaching-bakup/the-classic-hanson-marathon-training-programs/ "The Classic Hanson Marathon Training Programs - Luke Humphrey Running"
[34m13m16s · gpt-5.1-pro[browser] · ↑104 ↓2.98k ↻0 Δ3.08k[39m
13m16s · gpt-5.1-pro[browser] · ↑104 ↓2.98k ↻0 Δ3.08k | slug=hansons-method-research-now
