🧿 oracle 0.7.6 — Slop filter set past 11.
Created: 2026-01-03T13:30:18.820Z
Status: completed
Models:
- gpt-5.2-pro — completed tok=5.24k/5.24k
Response: status=completed
Prompt:
Review the Garmin Connect integration implementation for The Long Game (Next.js
16 + Supabase). Focus on: (1) Garmin endpoint assumptions and webhook parsing,
(2) OAuth PKCE/token lifecycle correctness, (3) data model/RLS risks, (4) FIT
parsing + workout matching logic, (5) missing edge cases or security gaps.
Provide a prioritized list of issues and concrete fixes.

---
Answer:
Below is a coach-synthesized “system spec” you can implement directly in **The Long Game**. I’m going to treat your user as a **hybrid athlete**: coming from CrossFit / powerlifting / general fitness, wants a marathon plan without giving up strength or feeling like they’re turning into a fragile, skinny runner.

I’ll anchor decisions to the philosophies you listed (Hansons, Daniels, Seiler, Dicharry, Pfitzinger, Starrett) and translate them into **rules, templates, and decision trees**.

---

## The Long Game training philosophy in 6 rules

1. **Consistency beats hero workouts**
   Hansons explicitly frames marathon readiness as a “cumulative fatigue” outcome and even says “nothing is make or break.” The app should behave like that: protect continuity, avoid “make-up workout debt,” and keep the athlete moving forward.

2. **Intensity is a scarce resource: 2 quality sessions per week, most running easy**
   Seiler’s observed pattern in elite endurance training converges on ~**80% low intensity** and ~**20% threshold/high intensity**, which typically equals **2–3 harder sessions/week** depending on frequency. More HIT often does not help and can drive overreaching. 
   Daniels’ “2Q” structure operationalizes this as **two quality days** plus mostly easy running, with spacing guidance.

3. **Keep running volume “spread” (avoid mega-weekends)**
   Hansons criticizes plans that cram **60–75%** of weekly mileage into two days and/or make the long run **40–50%** of weekly mileage. Your generator should cap the long-run share and distribute volume across the week.

4. **Strength stays, but becomes “maintenance-biased” as race specificity rises**
   The interference effect is real but usually manageable with smart design. Meta-analytic work shows endurance modality, frequency, and duration matter, with **running tending to interfere more than cycling**. ([PubMed Central][1])
   So: keep strength heavy-ish, lower volume, low failure, and schedule it to reduce conflicts.

5. **Durability is a product feature, not an add-on**
   Dicharry’s durability lens starts “ground up” (foot/ankle stability) and highlights posture, hips, and foot control as fundamental.
   Starrett’s Ready to Run framing is “meet movement standards” and address mobility limits so running stays pain-free.

6. **Periodize in blocks with planned downshifts**
   Daniels uses a 4-week rhythm (3 “quality” weeks, then a down week with no Q workouts).
   Hansons also describes systematic progressions (including a pattern of gradual mileage increases).
   Pfitzinger provides multiple 12/18-week schedules with structured preparation and strong emphasis on balancing training and recovery.

---

## 1. Strength training scheduling to minimize interference

### The goal

Keep **2 strength sessions/week** (compound lifts) while:

* preserving run quality (workouts feel good),
* protecting the long run,
* minimizing hypertrophy/strength interference from run load,
* and keeping the week polarized (hard days hard, easy days easy).

### Key evidence constraints you can encode

* Interference magnitude depends on endurance **frequency and duration**, and **running** tends to be more problematic than cycling. ([PubMed][2])
* Concurrent training can blunt lower-body strength in some populations (notably males in one large meta-analysis), but the effect is generally **small** and programming-dependent.
* Separating aerobic training from resistance training by **~24h** and limiting aerobic dose helped avoid interference in at least one controlled context (cycling-based). This supports your scheduling bias toward separation when possible, especially near key sessions. ([PubMed Central][3])
* If strength must be close to a high-intensity endurance session, doing endurance first can be preferable when endurance is the priority, and using different muscle groups can help.

### Practical weekly placement rules (code-ready)

**Terminology**

* `Q1`, `Q2` = run quality sessions (intervals, threshold, marathon-pace workout)
* `LR` = long run
* `S1`, `S2` = strength sessions

**Default rule set (Hybrid Marathon default)**

1. **Strength frequency**: exactly 2 sessions/week (`S1`, `S2`), minimum **48h apart**.
2. **Lower-body fatigue protection**:

   * Do not schedule heavy lower-body strength within **36h** before `LR`.
3. **Consolidate stress** (Seiler-compatible):

   * Prefer placing `S1` and `S2` on the **same day** as `Q1` and `Q2` (run first, lift later), **or** the following day if separation is required.
   * Rationale: fewer “moderate-hard” days, more true easy days.
4. **Order within day**:

   * If `Q` and `S` are same day: **Run first, lift second** (endurance priority in a marathon block).
5. **Strength session intensity progression**:

   * Early block: normal heavy compound work (but controlled).
   * Peak marathon-specific block: reduce total sets by **30–50%**, keep movement patterns and moderate intensity.
   * Taper: reduce to **1 session/week** or keep 2 very short sessions, keep some intensity but near-zero soreness risk.

### Default weekly templates (4, 5, 6 day running)

#### Template A: 5-day running (recommended default for your audience)

* **Mon**: Rest + Mobility (10–15 min)
* **Tue**: `Q1` (Intervals/Hills) + `S1` (lower emphasis)
* **Wed**: Easy run
* **Thu**: Medium aerobic run (or rest if athlete is fragile) + Durability circuit
* **Fri**: `Q2` (Tempo/Threshold or Marathon Pace) + `S2` (hinge + upper, reduced lower volume)
* **Sat**: Rest or short easy run (optional)
* **Sun**: `LR` (mostly easy, later add MP segments)

This gives you: quality spacing, long run protection, and 2 strength days without stacking fatigue.

#### Template B: 4-day running (minimum viable marathon for busy hybrids)

* **Mon**: `S1` + Mobility
* **Tue**: `Q1`
* **Wed**: Rest + Mobility
* **Thu**: `Q2` + `S2` (shorter lift)
* **Sat**: Easy run
* **Sun**: `LR`

Use this when time is tight or injury risk is high.

#### Template C: 6-day running (only if athlete tolerates running well)

* **Mon**: Recovery run + Mobility
* **Tue**: `Q1` + `S1`
* **Wed**: Easy run
* **Thu**: Medium-long aerobic run (Pfitz-style benefit)
* **Fri**: `Q2` + `S2`
* **Sat**: Recovery run + Strides
* **Sun**: `LR`

### Strength session design (so it does not destroy running)

For powerlifting/CrossFit backgrounds, the risk is not “can’t lift” but “lifting creates DOMS and CNS fatigue that ruins run quality.”

Encode these constraints:

**S1 (lower emphasis, run-friendly)**

* 1 main lower lift: squat or front squat

  * 3–5 sets of 3–5 reps at RPE 6–8 (leave 2 reps in reserve)
* 1 main upper lift: bench or overhead press
* 1 pull: row or pull-up
* 1 durability accessory: calf raises or tibialis work + trunk anti-rotation

**S2 (hinge + single-leg, lower volume)**

* 1 hinge: trap-bar deadlift or RDL (trap bar is often less eccentric misery)
* 1 single-leg: split squat or step-up (low volume)
* 1 upper push + 1 upper pull
* Optional: hamstring tendon work (Nordic regression) if tolerated

**Never program** high-rep leg burners during marathon-specific peak. Keep the “CrossFit metcon” itch satisfied with upper-body circuits or bike/rower if you must.

---

## 2. Missed workouts: skip vs reschedule, sickness vs life

This is where your app can feel “coach-like.”

### Core principle: protect the training week’s intent

Hansons: “nothing is make or break.”
Daniels: two quality sessions are the structure, and spacing matters.
Pfitzinger: missing time changes what is realistic, and the closer to race day, the more you must adjust expectations.

### Workout priority model (implementable)

Assign each planned session:

* `priority = A | B | C`
* `type = QualityRun | LongRun | EasyRun | Strength | Mobility`

Suggested defaults:

* **A**: `LR`, `Q1`, `Q2`
* **B**: Strength sessions, medium-long aerobic run (if included)
* **C**: extra easy mileage, strides, optional mobility extras

### Decision tree

#### A) Missed due to illness/injury (physiology constraint)

Use Pfitzinger’s interruption guidance:

* If **< 10 days** lost, you can typically return to where you “should be” on the schedule, but may need to ease back into faster sessions.
* If **10+ days missed in the last ~8 weeks**, be open to revising goal pace/goal.

**App behavior**

1. If user flags illness/injury:

   * First 1–3 sessions back are **easy only** (no quality).
2. Resume plan at the *current calendar week* (do not try to “re-run” missed weeks).
3. First quality session back:

   * reduce interval count or tempo duration by **30–50%**
   * keep paces honest (no hero pacing)
4. If days missed >= 10 and weeks-to-race <= 8:

   * show “Goal check” flow (adjust marathon pace targets by a small decrement and/or shift to finish-strong plan)

#### B) Missed due to life/schedule (logistics constraint)

Rule: **Do not cram A workouts together.**

**Reschedule window rules**

* You may move a missed **A workout** within **48 hours** if and only if all constraints remain true:

  * At least **2 easy days between Q days** (Daniels best practice).
  * No heavy lower-body strength within 36h pre-long-run
  * Total weekly mileage increase vs planned is <= **10%**
* If constraints break: **skip**, do not “make up.”

**What to do by workout type**

* Missed `EasyRun`:

  * default: drop it
  * optional: redistribute a small amount of volume across other easy days (cap +10%).
* Missed `Strength`:

  * move it within the week if it does not impair `Q` or `LR`. Otherwise skip.
* Missed `Q1` or `Q2`:

  * if rescheduling breaks spacing: skip it, keep the other quality day.
* Missed `LR`:

  * if it can be moved 1 day later and you can still recover: do it at **60–80% of planned duration**, easy only.
  * if not: skip and continue.

### Pseudocode you can drop into an “adaptive coach” service

```ts
type Reason = "ILLNESS" | "INJURY" | "LIFE";
type WorkoutType = "Q" | "LR" | "EASY" | "STRENGTH" | "MOBILITY";
type Priority = "A" | "B" | "C";

interface MissContext {
  daysMissed: number;
  weeksToRace: number;
  reason: Reason;
}

function handleMissedWorkout(w: {type: WorkoutType; priority: Priority}, ctx: MissContext) {
  if (ctx.reason === "ILLNESS" || ctx.reason === "INJURY") {
    if (ctx.daysMissed >= 10 && ctx.weeksToRace <= 8) {
      return {action: "REVISE_GOAL", plan: "RETURN_EASY_3_SESSIONS_THEN_REDUCED_Q"};
    }
    return {action: "RESUME_SCHEDULE_NO_MAKEUP", firstQAdjustment: "REDUCE_30_50"};
  }

  // LIFE
  if (w.priority === "C") return {action: "DROP"};
  if (w.type === "EASY") return {action: "DROP_OR_REDISTRIBUTE", mileageCap: 0.10};
  if (w.type === "STRENGTH") return {action: "MOVE_IF_NO_CONFLICT_ELSE_DROP"};
  if (w.type === "Q" || w.type === "LR") {
    return {action: "MOVE_WITHIN_48H_IF_CONSTRAINTS_ELSE_DROP"};
  }

  return {action: "DROP"};
}
```

---

## 3. Ideal running frequency for a non-elite hybrid athlete: 4 vs 5 vs 6 days

### What the sources imply

* Hansons links adequate weekly mileage and cumulative fatigue to increasing frequency toward **6 days/week**, mainly by adding easy mileage rather than more intensity.
* Daniels’ 2Q approach commonly assumes you can run most days and emphasizes spacing between Q sessions.
* Pfitzinger offers schedules with different weekly mileage bands and even discusses people running the same volume on fewer days if it fits life, but highlights the value of the medium-long run.

### Recommendation for The Long Game (product decision)

* **Default: 5 days/week**
  Best balance of adaptation, schedule realism, and injury risk for strength-background users.

* **Start many users at 4 days/week for the first 2–4 weeks**, then offer a “level up to 5” prompt when:

  * no pain flags,
  * they hit 90%+ compliance,
  * easy days stay truly easy.

* **6 days/week is an unlock**, not a default:

  * Only recommend when weekly volume needs exceed what’s reasonable in 5 days OR the athlete is already a comfortable runner.

### Code-ready frequency selector

Inputs:

* `runHistoryWeeks` (how many weeks consistently running)
* `currentWeeklyMileage`
* `injuryRiskScore` (self-report + history)
* `timeBudgetDays` (how many days they can run)

Heuristic:

* If `runHistoryWeeks < 8` OR `injuryRiskScore high`: choose 4, then progress to 5.
* Else if `currentWeeklyMileage < 25 mi`: choose 4–5 based on time.
* Else choose 5.
* Allow 6 only if `peakMileageTarget > 45 mi` AND `injuryRiskScore low`.

---

## 4. Periodization over 16–20 weeks: phases + mileage progression

### Macro-structure: 4-week blocks (Seiler + Daniels compatible)

Use **blocks of 4 weeks**:

* Weeks 1–3: build
* Week 4: deload (recovery + durability focus)

Daniels explicitly describes a 4-week rhythm where every 4th week is a “non-Q week” (no quality workouts).
Hansons also discusses systematic progression patterns and cumulative fatigue as a planned outcome.

### 20-week example structure (easy to compress to 16)

**Block 1 (Weeks 1–4): On-ramp + tissue tolerance**

* Goals:

  * establish frequency
  * mostly easy running
  * strides 1–2x/week
  * keep lifting normal but controlled
* Q sessions: only 1 light quality day at first (hill strides or short intervals), then 2Q by week 3.

**Block 2 (Weeks 5–8): Aerobic base + threshold introduction**

* Q1: hills or intervals (Daniels I or short reps)
* Q2: threshold tempo (Daniels T)
* Long run grows steadily, but keep long-run share capped.

**Block 3 (Weeks 9–12): Marathon-specific foundation**

* Q1: longer intervals or “strength” style reps
* Q2: marathon pace development (Hansons-style tempo at MP, or MP segments)
* Introduce 1 midweek medium-long aerobic run if using 6-day structure (Pfitz-style value).

**Block 4 (Weeks 13–16): Peak marathon-specific**

* Long runs peak (time-based cap for non-elites)
* More MP work, but keep the week polarized: do not let “moderate-hard” creep into daily runs.
* Strength volume reduced 30–50%.

**Block 5 (Weeks 17–20): Taper + race**

* Keep intensity touches but reduce volume
* Strength becomes maintenance-minimum (short sessions, no soreness)

### Mileage progression engine (safe for strength-background runners)

Set:

* `baseMileage` = average of last 3–4 weeks (or user input)
* `peakMileage` = plan level target
* `rampRate` = 0.05 to 0.08 per build week
* `deloadFactor` = 0.80 to 0.90 on week 4

Rule:

* Build weeks: `weekMileage = min(weekMileage * (1 + rampRate), peakMileage)`
* Deload week: `weekMileage = priorWeekMileage * deloadFactor`

**Long run cap rule (anti-mega-run)**

* `longRunMiles <= min(0.33 * weekMileage, longRunCeilingByLevel)`
  This directly addresses Hansons’ critique of long runs becoming 40–50% of weekly mileage.

**Long run ceiling suggestions (time-based is best)**

* Beginner hybrid: 2:15–2:30
* Intermediate hybrid: 2:30–2:45
* Advanced hybrid: 2:45–3:00 (rarely more)

### Quality workout progression (VDOT-friendly)

Because you already have VDOT paces, define workouts as segment recipes:

* **Q1 (neuromuscular + VO2/hills)**
  Early: hill sprints or short reps
  Middle: 3–6 minute reps at I pace
  Peak: longer I reps or mixed I/T

* **Q2 (threshold or MP)**
  Early: T tempo (20–40 min total at T)
  Middle: T plus short MP finish
  Peak: marathon-pace blocks (example: 2 x 20 min at MP)

* **Long run**
  Early: easy only
  Middle: last 20–30 min steady
  Peak: MP segments (example: 2 x 20 min MP inside LR)

---

## 5. Durability and mobility: essential vs optional

Your user is not asking for yoga vibes. They want to stay strong and not get hurt.

### What to treat as “essential” (minimum viable durability)

Derived from Dicharry’s emphasis on posture, hip control, and foot control, plus the idea that stability is foundational.

**Essential A: Pre-run movement prep (5–8 min)**
Trigger this before every run in-app.

* Ankle rocks (dorsiflexion pulses)
* Leg swings (front/back + side)
* Glute activation (bridge or band walk)
* 2 x 20s fast feet or skips (neuromuscular)

**Essential B: Twice-weekly durability circuit (15–25 min)**
Make this a separate module that can be attached to easy days or strength days.

Core movement buckets:

1. **Foot and ankle stability**

   * short-foot drills
   * calf raises (straight knee + bent knee)
2. **Hip control (push, steer, posture)**

   * single-leg RDL patterning
   * side plank + hip abduction
3. **Trunk posture under fatigue**

   * dead bug / pallof press
4. **Low-volume plyometric exposure (optional early, more later)**
   Dicharry’s “garage plan” explicitly trains posture, hip control, foot control, and jump skill.

**Essential C: Strength training modifications that are “durability-positive”**
Instead of lots of random accessories, bias accessories toward:

* calves, tibialis
* single-leg stability
* posterior chain
  This keeps strength aligned with injury prevention.

### What is “optional”

* Long stretching sessions
* Foam rolling marathons
* Extra mobility beyond a targeted restriction
  These can help some people, but they are not required for plan integrity.

### Starrett-inspired “standards” as a product feature

Ready to Run is built around meeting mobility/strength standards and addressing limitations.
Implementation idea:

* In onboarding, run 3 quick screens:

  * ankle dorsiflexion screen
  * hip extension screen
  * single-leg balance control screen
* If fail:

  * automatically assign a “restriction pack” (2 drills, 4–6 min/day)
* If pass:

  * keep them on the minimum viable durability plan

### Where Running Rewired fits (Dicharry)

Running Rewired is explicitly structured around self-assessment and exercise selection (self-tests, exercise library, workouts). ([Stable Book Group][4])
Product translation:

* Build a “durability library” and a “prescription engine” that chooses 6–10 exercises/week based on:

  * reported pain area
  * failed screens
  * current run volume phase

---

## 6. Other coaches/books you should factor in

You already have an excellent core. Here are the biggest “missing” pillars that naturally connect to your list:

1. **Arthur Lydiard (foundational periodization influence)**
   Hansons explicitly notes Lydiard as a major influence and uses cumulative fatigue as a foundation.
   Why it matters: long-term aerobic development and periodization framing.

2. **Matt Fitzgerald (80/20 operationalization for non-elites)**
   You have Seiler for the science; Fitzgerald is the “consumer translation” that could help app UX and education.

3. **Steve Magness (modern coaching + intensity distribution nuance)**
   Useful for how to cue workouts, manage stress, and avoid the moderate-intensity trap.

4. **Renato Canova (advanced marathon-specific workouts)**
   Not for beginners, but great as an “advanced plan tier” later.

5. **Hybrid-specific strength-endurance programming voices**
   If your brand is “The Long Game,” this is worth including as optional references:

   * Alex Viada / hybrid athlete framework (how to keep strength while building endurance)
   * NSCA-style concurrent training recommendations (for credibility)

---

## Implementation checklist: what to build in the app

### A) Plan Generator (core)

Inputs:

* marathon date
* VDOT
* runDaysPerWeek (4/5/6)
* strengthDaysPerWeek fixed at 2
* longRunDay preference
* injuryRisk score
* baseline mileage

Outputs:

* weekly schedule of sessions with tags:

  * type, priority, duration, target pace zone, lift template, durability module

### B) Constraint engine (so plans are “coach-correct”)

Hard constraints:

* exactly 2 Q runs/week (except deload week)
* 1 LR/week
* 2 strength sessions/week
* no heavy lower within 36h pre-LR
* Q sessions spaced by >= 2 easy days (default)
* long run <= 33% weekly mileage (cap mega-run)

Soft constraints (scoring):

* consolidate stress (strength on Q days)
* keep easy days truly easy (education + pace guardrails)

### C) Missed Workout Resolver (the “coach brain”)

* classify miss as illness/injury vs life
* apply decision tree above
* never “make up” by stacking A workouts
* use Pfitz thresholds to prompt goal revision when appropriate

---

If you want, I can turn this into:

* a **JSON schema** for workouts + weeks,
* a **constraint-satisfaction algorithm spec** (how to choose the best day assignments),
* and a **set of canonical workout recipes** (VDOT-based interval/tempo/MP workouts + strength templates + durability circuits).

[1]: https://pmc.ncbi.nlm.nih.gov/articles/PMC5407958/ "
            Concurrent exercise training: do opposites distract? - PMC
        "
[2]: https://pubmed.ncbi.nlm.nih.gov/22002517/ "Concurrent training: a meta-analysis examining interference of aerobic and resistance exercises - PubMed"
[3]: https://pmc.ncbi.nlm.nih.gov/articles/PMC11057620/ "
            The Effect of Time-Equated Concurrent Training Programs in Resistance-Trained Men - PMC
        "
[4]: https://www.stablebookgroup.com/products/running-rewired-1?utm_source=chatgpt.com "Running Rewired"

