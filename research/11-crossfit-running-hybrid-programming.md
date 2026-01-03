🧿 oracle 0.7.6 — Ship logs, not lore.
Launching browser mode (gpt-5.1-pro) with ~172 tokens.
This run can take up to an hour (usually ~10 minutes).
Answer:
Below is a runner-first, CrossFit-style programming playbook you can encode into an app: specific methodologies/programs, movement rules, weekly templates, marathon-cycle periodization, plus a library of runner-friendly WODs with exact rep schemes and time domains.

(Usual disclaimer: I’m not your coach or clinician. If you have a history of stress fractures, tendinopathy, or red-flag pain, get individualized guidance.)

---

## 1. Specific “hybrid” programs and methodologies that actually pair well with running

These are useful either as complete programs or as “design patterns” you can steal and implement.

### A) CrossFit Endurance and Power Speed Endurance

* **CrossFit Endurance (CFE)**: Endurance work integrated with functional fitness, with an emphasis on avoiding “unnecessary volume” and using higher-intensity work, plus technique focus. ([CrossFit Assets][1])
* **Power Speed Endurance (book/system)**: A skill-based approach that blends endurance practice with strength and power development. ([PenguinRandomhouse.com][2])

**How to use as a methodology in your app**

* Treat running as the primary sport progression.
* Add 2 strength sessions/week.
* Add 1 supplemental conditioning session/week that is low-impact and mostly aerobic or controlled threshold (not “redline Fran”).

### B) Chris Hinshaw style aerobic capacity (running-first engine work)

* **Aerobic Capacity (Hinshaw)**: Structured, progressive weekly training with an expectation you complete sessions within a week before progressing. ([Aerobic Capacity][3])
* **Mayhem 5k PR program (Hinshaw)**: Example of a run-focused plan with 2 run workouts/week, pacing/RPE guidance, and “run first” priority. ([Mayhem Nation][4])

**How to use**

* Steal the principle: *conditioning is prescribed like running workouts (pace/RPE), not like random metcons*.
* In a marathon cycle, keep “engine work” mostly as:

  * Zone 2 mixed-modal
  * Lactate-threshold-ish intervals on low-impact machines
  * Minimal glycolytic smash sessions

### C) The Gains Lab style “engine builder” add-on

* **Year of the Engine (YoE)**: Progressive conditioning frameworks to build aerobic base and repeatable anaerobic power. ([The Gains Lab][5])

**How to use**

* As a plug-in “conditioning track” 2 to 4 days/week in the off-season.
* In marathon build/peak, reduce to 1 to 2 days/week, choose modalities that do not add impact (bike, row, ski, sled).

### D) Hybrid Athlete style concurrent training (strength plus endurance without chaos)

* **Complete Human Performance (Alex Viada)**: Hybrid/concurrent approach with multiple tracks and coaching infrastructure. ([Complete Human Performance][6])
* **Nick Bare Hybrid Athlete programs**: App-based hybrid templates combining running + lifting. ([Nick Bare][7])

**How to use**

* Encode as concurrent training rules:

  * Maintain strength with low volume, moderate-heavy intensity
  * Put quality running first
  * Limit total weekly “hard sessions” across both domains

### E) CrossFit gym programming that includes running (not marathon-specific, but useful patterns)

* **CompTrain gym principles** explicitly include running multiple times/week. ([comptrain.com][8])

**How to use**

* Borrow movement balance and sustainability principles.
* Do not copy typical CrossFit intensity distribution during a marathon peak.

---

## 2. How to program WODs to BUILD running capacity (not interfere)

### The core rule (encode this)

Your running plan already contains the most specific stimulus for running performance. Your WODs should do one of three jobs only:

1. **Strength maintenance / durability** (low soreness, low volume)
2. **Aerobic volume** (extra engine without extra pounding)
3. **Neuromuscular pop** (short power, long rest; minimal fatigue)

If a WOD does not clearly fit 1 to 3, it’s probably just fatigue.

### Define “session types” (app enums)

Use these categories so your scheduling logic is deterministic:

**Run session types**

* `RUN_EASY_Z2`
* `RUN_LONG_Z2`
* `RUN_TEMPO_THRESHOLD` (20 to 60 min total work)
* `RUN_INTERVAL_VO2` (short repeats, high intensity)
* `RUN_MARATHON_PACE` (MP blocks)

**WOD session types**

* `WOD_STRENGTH_LOW_VOL` (heavy-ish, low reps, long rests)
* `WOD_AEROBIC_MIXED_MODAL` (20 to 45 min, RPE 5 to 6)
* `WOD_THRESHOLD_MACHINE` (12 to 30 min, controlled hard)
* `WOD_ALACTIC_POWER` (10 to 20 sec bursts, lots of rest)
* `WOD_GLYCOLYTIC_METCON` (avoid in marathon-specific phases)

### Interference guardrails you can enforce automatically

**Guardrail A: cap hard sessions**

* If weekly running includes `RUN_TEMPO_THRESHOLD` + `RUN_INTERVAL_VO2` + `RUN_LONG_Z2` (typical marathon week), then allow:

  * `WOD_THRESHOLD_MACHINE`: max 1 per week
  * `WOD_GLYCOLYTIC_METCON`: 0 per week
  * `WOD_STRENGTH_LOW_VOL`: 2 per week (but lower-body volume constrained)

**Guardrail B: protect the long run**

* No high-eccentric lower-body WOD within **36 to 48 hours** before long run:

  * high-rep squats
  * lunges
  * wall balls
  * thrusters
  * box jumps
  * burpees

**Guardrail C: separate intensity**

* Do not schedule `WOD_THRESHOLD_MACHINE` within 24 hours of `RUN_INTERVAL_VO2` unless athlete is advanced and you deliberately stack hard days.

**Guardrail D: DOMS minimization**

* Prioritize **concentric-dominant** tools when mileage is high:

  * sled push/pull
  * bike erg
  * ski erg
  * rowing (still some eccentric, but far less than plyos)

### Simple scheduling logic (copy into your app as rules)

**Option 1: “hard days hard” (best for many runners)**

* Put intensity on the same day so you preserve true easy days.

Example rules:

* If day has `RUN_INTERVAL_VO2` then allow only:

  * `WOD_STRENGTH_LOW_VOL` (upper-body bias) OR
  * `WOD_ALACTIC_POWER`
* If day has `RUN_TEMPO_THRESHOLD` then allow only:

  * short `WOD_STRENGTH_LOW_VOL` (full-body but low leg volume)
* Day before `RUN_LONG_Z2`: only `WOD_AEROBIC_MIXED_MODAL` (very easy) or rest

**Option 2: “distributed” (best if stacking crushes you)**

* Keep WODs on non-quality run days, but keep them low impact.

---

## 3. CrossFit movements BEST for runners, and which to AVOID in high-volume phases

Think in two dimensions you can encode:

* **Impact** (joint pounding)
* **Eccentric load** (DOMS risk that wrecks running)

### Green list (best ROI for runners, especially during high mileage)

**Monostructural, low impact**

* Bike erg / assault bike
* Ski erg
* Row erg

**Concentric strength and “engine”**

* Sled push (heavy and moderate)
* Sled pull or backward drag
* Farmer carry / suitcase carry
* Sandbag carry (bear hug)

**Strength patterns with low rep schemes**

* Deadlift or trap-bar deadlift (low volume)
* Romanian deadlift (careful with soreness, keep volume low)
* Heavy step-ups (low reps, controlled)
* Strict press, bench press, weighted pull-ups, rows (upper body does not beat up your legs)

**Trunk and stiffness (running economy support)**

* Side plank, Copenhagen plank (dose carefully), dead bug, Pallof press
* Slow controlled hanging knee raise (avoid high-rep kipping)

### Yellow list (use, but dose matters)

* Front squat / back squat: great, but keep **low volume** in marathon build/peak
* Split squat / lunge: excellent for runners, but very easy to over-sore yourself
* Box step-ups: good if you control eccentric and keep reps modest
* Double unders: useful but can flare calves/Achilles at high run volume
* Kettlebell swings: great hinge-power, but don’t turn it into 200-rep hamstring destruction

### Red list (avoid or heavily limit during high-volume running)

High impact or high eccentric + high reps:

* Box jumps (especially high-rep)
* Burpees (high-rep)
* Jump lunges
* Wall balls (high-rep squat pattern)
* Thrusters (squat + press, high lactate, high leg fatigue)
* High-rep Olympic barbell cycling (cleans/snatches) when you’re already carrying run fatigue
* GHD sit-ups (often too much hip flexor + trunk fatigue for runners)
* “For time” workouts that encourage reckless pacing and muscular failure

**Practical rule you can encode**

* In peak marathon weeks, allow **at most one** squat-pattern movement per WOD day, and cap total squat-pattern reps at **30 to 60 reps** unless very light and very controlled.

---

## 4. Weekly templates (encodable) for combining WODs with run training

These are “marathon-first” templates. You can parameterize run volume and swap WODs from the library below.

### Template A: Base phase week (5 runs, 2 WODs)

Goal: build aerobic base + maintain strength, minimal soreness.

**Mon**

* `RUN_INTERVAL_VO2`: 10 to 20 min total hard work (ex: 6x3:00 hard, 2:00 easy)
* `WOD_STRENGTH_LOW_VOL` (upper bias): 35 to 50 min

**Tue**

* `RUN_EASY_Z2`: 40 to 60 min
* Optional: 10 to 15 min mobility

**Wed**

* `RUN_TEMPO_THRESHOLD`: 20 to 40 min continuous or cruise intervals
* `WOD_AEROBIC_MIXED_MODAL`: 20 to 35 min at RPE 5 to 6 (low impact)

**Thu**

* `RUN_EASY_Z2`: 40 to 70 min

**Fri**

* `RUN_EASY_Z2` + strides (6 to 10 x 10 to 20 sec)
* `WOD_STRENGTH_LOW_VOL` (lower bias but low reps): 35 to 45 min

**Sat**

* `RUN_LONG_Z2`: 75 to 150+ min depending on plan

**Sun**

* Rest or 20 to 40 min very easy bike

### Template B: Build phase week (5 to 6 runs, 2 WODs)

Goal: marathon-specific work increases, WODs become “maintenance.”

**Mon**

* `RUN_INTERVAL_VO2`
* Optional `WOD_ALACTIC_POWER` (10 to 20 min total including rest) or skip

**Tue**

* `RUN_EASY_Z2`
* `WOD_STRENGTH_LOW_VOL` (full body, very low leg volume)

**Wed**

* `RUN_MARATHON_PACE`: 30 to 60 min total MP work (blocks)

**Thu**

* `RUN_EASY_Z2`

**Fri**

* `RUN_TEMPO_THRESHOLD` (shorter than base)
* Optional `WOD_THRESHOLD_MACHINE` (short and controlled) OR skip

**Sat**

* `RUN_LONG_Z2` with MP segments (as plan dictates)

**Sun**

* Rest

### Template C: Peak phase week (6 runs, 1 WOD)

Goal: protect running quality, eliminate leg soreness risk.

**Mon**

* `RUN_INTERVAL_VO2` (reduced volume vs earlier)

**Tue**

* `RUN_EASY_Z2`
* `WOD_STRENGTH_LOW_VOL` (mostly upper body + light hinge)

**Wed**

* `RUN_MARATHON_PACE` key session

**Thu**

* `RUN_EASY_Z2`

**Fri**

* `RUN_EASY_Z2` + strides

**Sat**

* `RUN_LONG_Z2` key session

**Sun**

* Rest

### Template D: Taper week (race in 6 to 10 days)

Goal: freshness, keep nervous system online, no soreness.

* 1 short `WOD_STRENGTH_LOW_VOL` early in the week (no new movements)
* 0 metcons in final 4 to 6 days unless it’s an easy flush on a bike

---

## 5. How to periodize MetCons across a marathon training cycle

Here is an encodable macro structure (16-week example). Adjust weeks to match your plan length.

### Phase 1: Base (Weeks 1 to 6)

**WOD frequency**

* Strength: 2x/week
* Conditioning: 1x/week (`WOD_AEROBIC_MIXED_MODAL`)

**MetCon time domains**

* 20 to 45 min aerobic mixed-modal
* Optional short machine intervals 1x every 2 weeks

**Avoid**

* glycolytic “for time” smashers

### Phase 2: Build (Weeks 7 to 12)

**WOD frequency**

* Strength: 2x/week (reduce lower-body volume)
* Conditioning: 0 to 1x/week (`WOD_THRESHOLD_MACHINE`), only if it does not harm key runs

**MetCon time domains**

* 12 to 25 min controlled threshold, mostly machines or sled
* If mixed-modal, keep it boring and sustainable

### Phase 3: Peak (Weeks 13 to 14 or 15)

**WOD frequency**

* Strength: 1x/week (maintenance)
* Conditioning: 0x/week

**MetCon time domains**

* None, or 10 to 20 min very easy flush only

### Phase 4: Taper (Final 2 to 3 weeks)

**WOD frequency**

* Early taper: 1x/week short strength primer
* Late taper: 0 sessions that could create DOMS

**MetCon time domains**

* Bike flush 15 to 25 min at RPE 3 to 4 is fine if it helps you feel better

---

## 6. Runner-friendly WOD library (low impact, low eccentric, app-ready)

Each workout below is written so you can copy directly into an app as a structured object.

### WOD 1: Sled-Ski Aerobic Intervals

```yaml
name: "Sled-Ski Aerobic Intervals"
type: WOD_AEROBIC_MIXED_MODAL
time_domain: 24:00
format: "6 rounds for quality"
work:
  - sled_push: "20-30 m @ heavy but smooth"
  - ski_erg: "250 m @ RPE 6"
  - farmer_carry: "40 m heavy"
  - rest: "60 sec easy walk"
notes:
  - "Goal: steady breathing, no leg burn."
  - "Low impact, low eccentric."
```

### WOD 2: Zone 2 Mixed-Modal AMRAP

```yaml
name: "Zone 2 Mixed-Modal AMRAP"
type: WOD_AEROBIC_MIXED_MODAL
time_cap: 30:00
format: "AMRAP 30"
work:
  - bike_erg: "12/10 calories @ RPE 5-6"
  - ring_row: "12 reps (strict)"
  - push_up: "12 reps"
  - suitcase_carry: "50 m (switch at 25 m)"
notes:
  - "Never sprint. Stay conversational."
```

### WOD 3: Threshold Bike Intervals (runner-safe “tempo”)

```yaml
name: "Bike Threshold Blocks + Upper Accessory"
type: WOD_THRESHOLD_MACHINE
time_domain: 32:00
format: "3 sets"
work:
  - bike_erg: "8:00 @ RPE 7-8"
  - rest: "2:00 easy spin"
  - strict_pull_up: "6-10 reps (or ring rows 10-15)"
  - strict_press_db: "8-12 reps"
notes:
  - "Upper work is done during the 2:00 easy or immediately after each block."
```

### WOD 4: EMOM 30 Low-Impact Engine

```yaml
name: "EMOM 30 Low-Impact Engine"
type: WOD_AEROBIC_MIXED_MODAL
time_domain: 30:00
format: "EMOM 30 (10 cycles)"
minutes:
  1: "Row 12/10 calories"
  2: "KB swing 12 reps (moderate)"
  3: "Plank 45 sec (or side plank 30/30)"
notes:
  - "This should feel like aerobic work, not a metcon death spiral."
```

### WOD 5: Alactic Bike Sprints (speed without fatigue)

```yaml
name: "Alactic Bike Sprints"
type: WOD_ALACTIC_POWER
time_domain: 20:00
format: "10 rounds"
work:
  - bike_sprint: "12 sec all-out"
  - rest: "1:48 very easy spin"
notes:
  - "Stop if power drops noticeably."
  - "This should not create soreness."
```

### WOD 6: Row VO2 Repeats (low impact, hard but clean)

```yaml
name: "Row VO2 Repeats"
type: WOD_THRESHOLD_MACHINE
time_domain: 24:00
format: "6 rounds"
work:
  - row: "2:00 hard (RPE 9)"
  - rest: "2:00 easy row"
notes:
  - "Optional: add 6 strict pull-ups after each hard rep if you stay composed."
```

### WOD 7: Carry Density Builder (durability without pounding)

```yaml
name: "Carry Density Builder"
type: WOD_AEROBIC_MIXED_MODAL
time_cap: 25:00
format: "Every 5:00 for 5 sets"
work:
  - farmer_carry: "200 m (break as needed)"
  - rest: "remaining time in the 5:00 window"
notes:
  - "Go heavy enough that grip is challenged, but posture stays perfect."
```

### WOD 8: Strength Maintenance + Short Flush (base/build friendly)

```yaml
name: "Strength Maintenance + Flush"
type: WOD_STRENGTH_LOW_VOL
time_domain: 45:00
blocks:
  - strength_A:
      lift: "Trap bar deadlift"
      sets: 4
      reps: 3
      intensity: "RPE 7-8"
      rest: "2:00-3:00"
  - strength_B:
      lift: "DB bench press"
      sets: 3
      reps: 6
      intensity: "RPE 7-8"
  - flush:
      machine: "Bike erg"
      time: "10:00"
      intensity: "RPE 3-4"
notes:
  - "Peak phase: reduce to 2x3 deadlift and skip accessories if needed."
```

### WOD 9: Upper-Body Metcon + Easy Machine (leg-sparing)

```yaml
name: "Upper Metcon + Easy Engine"
type: WOD_AEROBIC_MIXED_MODAL
time_cap: 18:00
format: "AMRAP 18"
work:
  - ski_erg: "10/8 calories @ steady"
  - strict_pull_up: "6-10"
  - hand_release_push_up: "10-15"
  - hollow_hold: "20-30 sec"
notes:
  - "Keep ski pace controlled so the limiter is upper-body stamina, not legs."
```

### WOD 10: Sled Push Lactate-Controlled Intervals (no impact)

```yaml
name: "Sled Push Controlled Hard"
type: WOD_THRESHOLD_MACHINE
time_domain: 18:00
format: "6 rounds"
work:
  - sled_push: "45 sec hard"
  - rest: "75 sec walk"
notes:
  - "Hard but not sloppy. No grinding to failure."
  - "Excellent in build phase when you want intensity without impact."
```

### WOD 11: Step-Up Aerobic Strength (use carefully)

```yaml
name: "Step-Up Aerobic Strength"
type: WOD_AEROBIC_MIXED_MODAL
time_cap: 20:00
format: "E2MOM x 10"
work_each_round:
  - weighted_step_up: "8 each leg (moderate DBs)"
  - bike_erg: "10/8 calories easy-moderate"
notes:
  - "This has eccentric load. Base phase only, or keep very light in build."
```

### WOD 12: Marathon-Phase “Do No Harm” Primer (taper-safe)

```yaml
name: "Primer: Neural + Breathing"
type: WOD_STRENGTH_LOW_VOL
time_domain: 25:00
blocks:
  - A:
      lift: "Front squat"
      sets: 5
      reps: 2
      intensity: "RPE 6-7 (fast reps)"
      rest: "2:00"
  - B:
      lift: "Strict pull-up (weighted if easy)"
      sets: 4
      reps: 4
      rest: "90 sec"
  - C:
      machine: "Row"
      time: "6:00"
      intensity: "RPE 4"
notes:
  - "No soreness allowed. Stop well short of fatigue."
```

---

## A clean way to make this “programmable” in an app

If you want this to be truly encodable and auto-generated, model it like:

* Athlete constraints:

  * weekly_run_mileage
  * injury_risk_flags (Achilles, knee, hamstring)
  * max_sessions_per_week
* Weekly run skeleton (from marathon plan):

  * 2 quality runs + long run + easy runs
* WOD insertion rules:

  * 2 strength sessions default (drop to 1 in peak)
  * 1 aerobic mixed-modal in base (drop to 0 in peak)
* Movement filters:

  * if mileage > threshold: block Red list, cap Yellow reps

If you tell me your typical weekly mileage range, available equipment (sled? ski erg? bike erg?), and how many total training days you want (5, 6, or 7), I can output:

* a full 16-week marathon hybrid plan
* every single day as an app-ready object (JSON/YAML)
* with automatic substitutions based on equipment and injury flags

[1]: https://assets.crossfit.com/pdfs/seminars/SMERefs/Run/CrossFitEnduranceSeminar_Running.pdf?utm_source=chatgpt.com "ENDURANCE TRAINING GUIDE"
[2]: https://www.penguinrandomhouse.com/books/460162/power-speed-endurance-by-brian-mackenzieglen-cordoza/?utm_source=chatgpt.com "Power Speed Endurance by Brian Mackenzie, Glen Cordoza"
[3]: https://www.aerobiccapacity.com/?utm_source=chatgpt.com "Aerobic Capacity"
[4]: https://www.mayhemathletes.com/5k-pr-program/?utm_source=chatgpt.com "5k PR Program - Mayhem Athlete"
[5]: https://www.thegainslab.com/engine?utm_source=chatgpt.com "The Year of the Engine"
[6]: https://www.completehumanperformance.com/?utm_source=chatgpt.com "Complete Human Performance"
[7]: https://www.nickbare.com/training/?utm_source=chatgpt.com "Training for Hybrid Athletes - Run & Lift for Performance"
[8]: https://www.comptrain.com/gym-programming-principles?utm_source=chatgpt.com "The Principles of CompTrain Gym Programming"


7m53s · gpt-5.1-pro[browser] · ↑172 ↓4.6k ↻0 Δ4.77k
