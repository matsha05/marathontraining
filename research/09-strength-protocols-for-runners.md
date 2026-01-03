🧿 oracle 0.7.6 — Light spell, heavy insight.
Launching browser mode (gpt-5.1-pro) with ~204 tokens.
This run can take up to an hour (usually ~10 minutes).
Answer:
Below is a “protocol library” you can directly encode: named programs and published study protocols (with exact sets, reps, rest, intensity), then a marathon-block periodization engine that selects and scales sessions without trashing your run workouts.

I’m going to give you **(1) named protocols you can implement as written**, then **(2) an app-ready ruleset** that periodizes strength across a marathon block, plus **(3) plug-in modules** for power, hip stability, single-leg strength, and posterior chain.

---

## 1) Specific, named strength protocols for distance runners

### A. Støren et al. Maximal Strength Training (MST) protocol (published research, runner-specific outcome)

**Goal:** Improve running economy and endurance performance via high-force, low-velocity strength.

**Protocol (8 weeks):**

* **Exercise:** Half-squat
* **Frequency:** **3 sessions/week**
* **Sets x reps:** **4 × 4RM**
* **Rest:** **3 minutes between sets**
* **Intensity:** “4RM” load (load you can complete for 4 reps, near-max effort)
* **Notes:** This is intentionally low-rep, heavy, minimal fluff. ([Paulo Gentil][1])

**Encodable session:**

* Half squat: 4 sets × 4 reps @ 4RM, rest 180s.

---

### B. Paavolainen et al. sport-specific “explosive-strength + endurance” protocol (published research, elite endurance runners)

**Goal:** Improve 5K performance and running economy by replacing a portion of endurance volume with explosive work.

**Protocol (9 weeks, post-season context):**

* **Training time:** Similar total hours in both groups
* **Replacement:** Experimental group replaced **32%** of training hours with “sport-specific explosive-strength training”
* **Explosive session duration:** **15–90 min**
* **Sprint dosage:** **5–10 × 20–100 m** (sprints)
* **Jumping menu:** alternative jumps, bilateral countermovement jumps, drop jumps, hurdle jumps, and single-leg 5-jump tests
* **Strength (low-load, high-velocity):**

  * Leg press + knee extensor-flexor exercises
  * **Load:** **0–40% 1RM**
  * **Per session volume:** **30–200 contractions/session**
  * **Set structure:** **5–20 reps/set**
  * **Intent:** high or maximal movement velocity 

**Encodable session template (one explosive day):**

* Sprints: 6–10 reps of 20–100 m, full recovery (see “Power module” rules below)
* Jumps: pick 2–4 jump types, total 30–120 contacts depending on phase
* Low-load power strength:

  * Leg press OR jump squat: 4–8 sets × 8–15 reps @ 0.3–0.4 1RM, rest 60–120s, maximal concentric intent
  * Knee flexion (hamstring curl): 3–6 sets × 10–20 reps @ 0.3–0.4 1RM, rest 60–120s, maximal concentric intent

---

### C. Spurrs, Murphy, Watsford plyometric protocol (published research, trained runners)

**Goal:** Improve running economy and performance with structured plyometric progression.

**Protocol (6 weeks):**

* **Frequency progression:** **2 sessions/week for first 3 weeks**, then **3 sessions/week for last 3 weeks** 
  (Their paper includes a detailed progression table; if you want your app to mirror it exactly, the safest encoding approach is to implement it as a “contacts-per-session progression” with a fixed menu of jump types, which is what I do below in the Power module.)

---

### D. Jay Dicharry (Running Rewired) Hip Circuit (published workout excerpt, runner-specific)

**Goal:** Hip control, posture, stability, and tissue tolerance (especially valuable for high-mileage runners).

**Hip Circuit (15–20 min):**

* **Structure:** **2 rounds**
* **Rest:** **30–45 sec between exercises**
* **Exercises + reps:**

  1. Twisted Warrior: 10 reps each leg
  2. Butt Scoots: 20 reps each side
  3. Pigeon Hip Extension: 10 reps each side
  4. Glute Rainbow: 10 reps each side
  5. Standing Hip Circles: 5 reps each side
  6. Tippy Twist: 8 reps each side
  7. Burpees: 10 reps
  8. Frog Bridge: 25 reps
  9. Lateral Hurdle Hop: 20 hops ([Triathlete][2])

**Encodable session:** Exactly as above. This is already “app perfect.”

---

### E. Eleiko “Strength Training for Distance Runners” (institutional programming example + scheduling logic)

This is unusually useful because it gives **two full days** with **sets, reps, and %1RM**, plus a scheduling rule.

**Day 1 (sample):**

* Depth jumps (12–18 in): **3 × 4**
* Hang clean: **3 × 4 @ 80% 1RM**
* DB bench: **3 × 6 @ 80% 1RM**
* Bent-over row: **3 × 6**
* Romanian deadlift: **3 × 6**
* Band walks: **2 × 10 each way**
* Core (2 total sets): planks + side planks (45s each) + V-ups (10) 

**Day 2 (sample):**

* Jump rope: **3 × 20–30 sec**
* Jump squats (kettlebells): **3 × 5**
* Back squat: **3 × 5 @ 80–85% 1RM**
* Fitball flexion (hamstring): **3 × 10**
* Band walks: **2 × 10 each way**
* Med ball underhand hip toss & catch: **2 × 20**
* Core (2 total sets): med ball overhead toss sit-up (10) + Russian twist (20) 

**Scheduling rule (key interference guardrail):**

* They recommend doing high-intensity strength **after, or at least the same day as, the hard running workout** so recovery days stay truly easy, and you avoid stacking hard days back-to-back. 

---

### F. Carrie Lane (Authentic Performance Center) “Neural” and “General” day protocols (coach education deck)

This gives you **timed circuits and recovery rules** that are very encodable.

**Neural day principles:**

* Not circuit-style (except in-place jump circuit)
* Near-complete recovery between reps ([Nebraska Coaches Association][3])

**Sample Neural Workout (beginner/intermediate):**

1. In-place jump circuit: **12 exercises, 15s each, 30s rest** (total 9 minutes)
2. Backward overhead throws: **6**
3. Forward underhand throws: **6**
4. Hammer throw right: **6**
5. Hammer throw left: **6** ([Nebraska Coaches Association][3])

**Sample Neural Workout (intermediate/advanced):**

* R-L-R-L-land bounds: **5 reps**
* DB jumps: **4 sets × 5 jumps**, target height, load = **15% bodyweight**
* Split squat: **2 sets × 5 per leg**
* Skips for height: **2 sets × 6 takeoffs** ([Nebraska Coaches Association][3])

**General circuit template:**

* Work:rest = **1:1 or 2:1**
* **15–40s work bouts**
* **8–12 min** total circuit duration ([Nebraska Coaches Association][3])

**Sample Bodyweight Circuit:**

* Each exercise **30s**, rest **15s**, total **8 min** (then stop) ([Nebraska Coaches Association][3])

---

### G. Brian MacKenzie CrossFit Endurance (hybrid programming examples with exact WODs)

This is not “runner S&C minimal dose.” It is true hybrid training. Outside published multiple WODs with exact prescriptions.

Examples (from the plan article):

* AMRAP 8:00

  * 7 Back squats (225/150)
  * 7 Chest-to-bar pull-ups
* AMRAP 8:00

  * 6 Deadlifts (185/135)
  * 12 Toes-to-bar
* “For quality” 7:00

  * 5 Power cleans, heavy (unbroken)
  * 7 Burpees
* “Murph” (20 min WOD with running):

  * 1-mile run
  * 100 pull-ups, 200 push-ups, 300 squats
  * 1-mile run ([Outside Online][4])

**Encoding note:** These WODs can be placed into a marathon block, but you must apply interference controls (below) or they will collide with run quality.

---

## 2) Essential runner lifts (no vanity) as an exercise “taxonomy” you can encode

Think in **movement patterns and tissues**, not muscle groups.

### Tier 1 (highest transfer, keep year-round)

**1) Squat pattern (force production, stiffness)**

* Back squat, front squat, goblet squat
* Encoding: 3–5 sets × 3–6 reps, 2–4 min rest

**2) Hinge pattern (posterior chain, propulsion)**

* Trap bar deadlift or conventional deadlift
* Romanian deadlift (barbell or DB)
* Encoding: 3–5 × 3–6 (heavy) or 3–4 × 6–8 (moderate)

**3) Single-leg knee-dominant (running-specific strength, pelvic control)**

* Bulgarian split squat
* Step-up (knee height that matches your mechanics)
* Reverse lunge
* Encoding: 2–4 × 5–8 each leg, 90–180s rest

**4) Single-leg hinge (hamstrings + glute max + balance)**

* Single-leg RDL
* Encoding: 2–4 × 6–10 each leg, 60–120s rest

**5) Calf-ankle complex (stiffness + injury resistance)**

* Standing calf raise (gastroc)
* Seated calf raise (soleus)
* Tibialis raises
* Encoding: 3–5 × 6–12 heavy + 2–3 × 15–25 endurance

### Tier 2 (keep most of the year, rotate variants)

**6) Hamstring knee-flexion strength**

* Swiss ball / fitball flexion (Eleiko includes this)
* Slider leg curls
* Nordic curl progression
* Encoding: 3 × 8–12 (or 3–5 × 4–6 eccentrics for Nordics)

**7) Hip abductors and external rotation control**

* Band walks (Eleiko includes: linear, 45-degree, lateral)
* Side plank variations
* Encoding: 2–3 sets, 8–15 reps or 20–45s holds 

### Tier 3 (power conversion, dosage matters)

**8) Plyometrics and reactive strength**

* Depth jumps, hurdle hops, bounds, pogo hops
* Encoding: 30–120 contacts/session depending on phase (rules below)

**9) Low-load high-velocity lifts**

* Jump squats, hang clean (Eleiko includes both)
* Encoding: 3–6 × 3–5 reps, full recovery, crisp technique 

---

## 3) Periodization across a marathon block (base vs peak vs taper)

This is the **encodable macro logic**. I’ll assume a standard **16-week marathon block**, but the rules work for 12–20 weeks.

### Strength phases (mapped to Bazyler’s sequenced approach)

Bazyler et al. recommend sequencing strength work through phases like **strength-endurance → basic strength → strength → power**, with maximal high-force work building the base before power emphasis. ([Squarespace][5])

---

## 4) The “engine”: frequency, volume, intensity, and interference rules (app-ready)

### A. Global scheduling rule (hard-day stacking)

**Rule S1 (primary):** Place strength on the **same day as** your harder run workout (intervals/tempo), ideally **after** the run, so the next day can be truly easy. 

**Implementation:**

* If `day.type in {INTERVAL, TEMPO}` then allow Strength Session Type A or B.
* If `day.type == LONG_RUN` then no heavy lifting that day; allow only microdose stability or very light power if athlete tolerates.

---

### B. Frequency rules by marathon phase

Define `phase ∈ {BASE_1, BASE_2, BUILD, PEAK, TAPER}`.

**BASE_1 (weeks 1–4):**

* Strength: **2x/week**
* Optional microdose stability: **2–4x/week** (8–12 min)
* Emphasis: basic strength patterns + tissue prep

**BASE_2 (weeks 5–8):**

* Strength: **2x/week**
* Power: **1x/week** (can be embedded at start of one strength session)
* Emphasis: maximal strength development (low reps)

**BUILD (weeks 9–12):**

* Strength: **2x/week**, but reduce total sets
* Power: **1–2x/week** small dose
* Emphasis: maintain strength, convert to power

**PEAK (weeks 13–14):**

* Strength: **1x/week** (maintenance)
* Power: **1x/week** microdose (very low contacts)
* Emphasis: preserve neuromuscular qualities, minimal soreness

**TAPER (weeks 15–16):**

* Strength: **0–1x/week**
* Last heavy lower-body lift: **10–14 days before race**
* Last plyometric contacts >60: **10 days before race**
* Keep short stability circuits if they reduce niggles (no DOMS)

---

### C. Volume rules (hard sets per week)

Track **lower-body “hard sets”** (sets at RPE ≥7).

* BASE: `6–10 hard sets/week` lower body (not counting calves/core)
* BUILD: `4–8 hard sets/week`
* PEAK: `3–5 hard sets/week`
* TAPER: `0–3 hard sets/week`

**Auto-adjustment rule V1:**

* If `weekly_run_intensity_minutes` increases week-over-week by >20%, then `reduce_strength_sets_by = 1 per main lift` that week.

**Auto-adjustment rule V2:**

* If athlete reports `DOMS_lower >= 7/10` or missed run quality, then next strength session becomes “maintenance” (see Template M).

---

### D. Intensity rules (avoid hypertrophy interference)

Use either %1RM or RPE.

**Max strength work:**

* 80–90% 1RM, 3–5 reps, 3–5 sets, rest 2–4 min
  (Example: Eleiko uses ~80–85% for squats and ~80% for hang cleans, 3–5 rep sets.) 

**Power work:**

* 0–60% 1RM (or bodyweight), maximal intent, 3–6 sets × 3–5 reps, rest 60–180s
  (Bazyler frames low-force high-velocity work as 0–60% 1RM with maximal movement intent.) ([Squarespace][5])

**Do not train to failure** during PEAK or TAPER. If you encode RPE, cap at `RPE 8` in PEAK and `RPE 7` in TAPER.

---

## 5) Workout templates (ready to encode)

Each template below is “copy-paste into JSON.”

### Template A: Max Strength + Posterior Chain (45–60 min)

**When:** BASE_2 and early BUILD, on hard run days (after run).
**Goal:** keep strength gains without junk volume.

1. **Main lift (choose 1):**

* Back squat OR trap bar deadlift
* **4 × 4 @ ~85–90% 1RM**, rest 180–240s

  * Alternative exact research protocol: half squat **4 × 4RM**, rest 180s ([Paulo Gentil][1])

2. **Secondary lift (choose 1):**

* RDL: **3 × 6 @ RPE 7–8**, rest 120–180s 

3. **Hamstring knee-flexion:**

* Fitball flexion: **3 × 10**, rest 60–90s 

4. **Calves (superset):**

* Standing calf raise: **4 × 6–8 heavy**, rest 60–90s
* Seated calf raise: **3 × 10–12**, rest 60–90s

5. **Core (anti-rotation):**

* Side plank: **2 × 30–45s/side**
* Pallof press: **2 × 10/side**

---

### Template B: Single-Leg Strength + Hip Control (35–55 min)

**When:** BASE_1 through BUILD, especially for runners with pelvis/hip drop patterns.

1. Bulgarian split squat: **3–4 × 6/leg @ RPE 7–8**, rest 120s
2. Step-up: **3 × 6–8/leg @ RPE 7**, rest 90–120s
3. Single-leg RDL: **3 × 6–10/leg @ RPE 7**, rest 60–120s
4. Band walks: **2 × 10 each way** (linear or lateral) 
5. Optional short finisher: Dicharry Hip Circuit, 1 round (see Template H)

---

### Template P: Power Primer (10–18 min add-on)

**When:** Start of Template A or B, or as a standalone micro session on an easy day in BASE_2/BUILD.

Option 1 (Eleiko-style):

* Depth jumps: **3 × 4**, rest 90–120s 
* Hang clean: **3 × 4 @ 80% 1RM**, rest 150–240s 

Option 2 (low equipment):

* Jump rope fast: **3 × 20–30s**, rest 60s 
* Jump squats: **3 × 5**, rest 120s 

**Power quality rule P1:** Stop the set if jump height drops visibly or contact gets loud/heavy.

---

### Template H: Jay Dicharry Hip Circuit (15–20 min)

Encode exactly as published:

* 2 rounds
* Rest 30–45s between exercises
* Twisted Warrior 10/leg
* Butt Scoots 20/side
* Pigeon Hip Extension 10/side
* Glute Rainbow 10/side
* Standing Hip Circles 5/side
* Tippy Twist 8/side
* Burpees 10
* Frog Bridge 25
* Lateral Hurdle Hop 20 hops ([Triathlete][2])

---

### Template N: “Neural Day” (Lane) short session (12–20 min)

**When:** Replace a heavy strength day during PEAK or when you want zero soreness but high neural output.

* In-place jump circuit: 12 exercises, **15s each, 30s rest** (9 min total) ([Nebraska Coaches Association][3])
* Bounds: **5 reps** ([Nebraska Coaches Association][3])
* DB jumps: **4 × 5**, load = **15% bodyweight**, full recovery ([Nebraska Coaches Association][3])

**Rule N1:** Near-complete recovery between explosive reps (do not turn this into conditioning). ([Nebraska Coaches Association][3])

---

## 6) Specific protocols by attribute (power, hip stability, single-leg, posterior chain)

### Lower-body power (choose one protocol family)

#### Power Protocol 1: “Reactive + Olympic” (best when you have coaching)

* Depth jumps: 3 × 4, rest 90–120s 
* Hang clean: 3 × 4 @ 80% 1RM, rest 150–240s 
* Optional: Jump rope 3 × 20–30s 

#### Power Protocol 2: Paavolainen-style explosive session (track + gym hybrid)

* Sprints: 5–10 × 20–100 m, full recovery 
* Jumps: choose 2–5 variations (drop/hurdle/countermovement/alternate jumps), target 30–120 contacts
* Low-load power strength: 0–40% 1RM, 5–20 reps/set, 30–200 contractions total 

**Encoding guardrail:** In PEAK, cap sprint volume at 300–600 m total fast running, and cap jumps at 40–60 contacts.

---

### Hip stability (two encodable options)

#### Hip Stability Protocol 1: Dicharry Hip Circuit

Use Template H. ([Triathlete][2])

#### Hip Stability Protocol 2: Eleiko band-walk microdose (8–10 min)

* Band walks: 2 × 10 each way (linear or 45-degree or lateral) 
* Side plank: 2 × 45s each side 

---

### Single-leg strength (runner-specific strength with minimal soreness)

**Single-leg strength session (35–45 min):**

* Bulgarian split squat: 4 × 5/leg @ RPE 8, rest 120–180s
* Step-up: 3 × 6/leg @ RPE 7–8, rest 120s
* Single-leg RDL: 3 × 6–8/leg @ RPE 7, rest 90s
* Calf raise single-leg: 3 × 8–12/leg, rest 60–90s

**Progression rule SL1 (double progression):**

* Week to week, if all sets hit top of rep range with RPE ≤8, increase load 2–5% next time.
* Every 4th week: deload by cutting sets by 40% (keep load moderate).

---

### Posterior chain (propulsion + injury resistance)

**Posterior chain session (45–55 min):**

* Trap bar deadlift OR RDL: 4 × 4–5 @ RPE 8, rest 180s
* Hip hinge accessory (choose 1): hip thrust 3 × 6–8, rest 120s
* Hamstring curl (fitball flexion): 3 × 10, rest 60–90s 
* Calf complex:

  * Standing calf raise 4 × 6–8 heavy
  * Seated calf raise 3 × 10–12
* Core: 2 sets (plank + side plank + V-ups) matches Eleiko style 

---

## 7) Hybrid athlete programming (CrossFit + marathon) with interference controls

You can absolutely encode hybrid training, but you need a **WOD classifier** and **placement rules**.

### A. WOD classifier (encode these tags)

For each WOD, compute:

* `wod.duration_minutes`
* `wod.lower_body_reps` (squat/deadlift/lunge/box jump total)
* `wod.eccentric_heavy` boolean (high-rep squats, high-rep DL, jumping volume)
* `wod.monostructural_running` boolean
* `wod.load_heavy` boolean (near-strength loads)

### B. Placement rules (most important part)

**Rule HY1 (base/build):**

* Allow 1–2 WODs/week, but at least one should be **short (≤10 min)** and **strength-biased**, not a leg-smasher.

**Rule HY2 (peak):**

* Allow **max 1 WOD/week**, must satisfy:

  * `duration ≤ 10`
  * `lower_body_reps ≤ 40` (not counting jump rope)
  * avoid “Murph”-style high rep squats and long grinders ([Outside Online][4])

**Rule HY3 (taper):**

* No WODs that create DOMS.
* Only “for quality” lifting intervals (example: power cleans heavy + burpees for 7 minutes, smooth pacing) ([Outside Online][4])

### C. Example hybrid week (BUILD phase) using published CFE-style WODs

* Tue (interval run day): Strength Template A (after run)
* Thu (tempo run day): Short WOD option:

  * 7:00 “for quality”

    * 5 power cleans heavy
    * 7 burpees ([Outside Online][4])
* Sat: Long run
* Other days: easy runs + Dicharry Hip Circuit 1x ([Triathlete][2])

---

## 8) If you want this as a single encoding spec (pseudo-JSON)

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
    "templates": ["A_MaxStrengthPosteriorChain", "B_SingleLegHipControl", "P_PowerPrimer", "H_DicharryHipCircuit", "N_NeuralDay"]
  }
}
```

---

## Quick “best default” if you force me to pick one plan for most marathoners

* **BASE_1–BASE_2:** 2x/week (Template A + Template B), plus 1x/week Power Primer
* **BUILD:** 2x/week but cut one set off each main lift, keep Power Primer
* **PEAK:** 1x/week Template A (very low volume), plus 1 micro Neural Day (Template N)
* **TAPER:** stop heavy lower 10–14 days out, keep 1 short Hip Circuit if it makes you feel better

This aligns with the heavy/fast emphasis shown in research protocols and institutional programming, while following the hard-day stacking rule to reduce interference. ([Paulo Gentil][1])

---

If you tell me two things, I can output an even more “drop-in” weekly schedule generator:

1. Your typical marathon week structure (which days are intervals, tempo, long run), and
2. Your current lifting level (novice, intermediate, advanced, plus estimated squat/deadlift 1RM or reps @ load).

[1]: https://paulogentil.com/pdf/Maximal%20Strength%20Training%20Improves%20Running%20Economy%20in%20Distance%20Runners.pdf "mss20996 1087..1092"
[2]: https://www.triathlete.com/training/injury-prevention/hip-circuit-workout-dss/ "Do Something Streak, Day 17: Hip Circuit Workout"
[3]: https://www.ncacoach.org/uploads/CCLane.pdf "PowerPoint Presentation"
[4]: https://www.outsideonline.com/health/training-performance/crossfit-endurances-unconventional-12-week-marathon-training-plan/ "CrossFit Training Plan"
[5]: https://static1.squarespace.com/static/55b7ffebe4b0568a75e3316b/t/5f2fefbd6a5ace51e4ddaaea/1596977087668/Strength_Training_for_Endurance_Athletes___Theory.pdf "SCJ-D-15-00007 1..12"


20m12s · gpt-5.1-pro[browser] · ↑204 ↓5.27k ↻0 Δ5.47k
