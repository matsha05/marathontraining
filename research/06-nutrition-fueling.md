Created: 2026-01-03T00:24:43.173Z
Status: completed
Models:
- gpt-5.1-pro — completed tok=2.8k/2.92k
Prompt:
Research evidence-based nutrition for endurance runners. I need: 1) Daily
protein recommendations for runners who also lift (grams per kg body weight) 2)
Pre-run nutrition timing and what to eat/avoid 3) Post-run recovery nutrition
(protein + carbs window) 4) Long run fueling (when to start taking gels/carbs,
how much per hour) 5) Hydration guidelines 6) Race week nutrition changes.
Return specific rules and numbers I can encode as nutrition reminders
in a training app.
---
Answer:[22m
Below are evidence-based, numbers-first rules you can plug into a training app. I’m using the most commonly cited sports nutrition position statements and reviews, so the targets are conservative, practical, and broadly applicable.
(As always: GI tolerance varies a lot. The best plan is the one you can repeat without stomach issues.)
---
## 1) Daily protein for endurance runners who also lift (g/kg/day)
### Daily target (encode as a range)
* **Default target for “runner + lifter”**: **1.6 to 2.0 g/kg/day**. ([Dietitians of Canada][1])
* **If you’re in a calorie deficit or in a heavy training block**: bias toward the **upper end (1.8 to 2.0 g/kg/day)** to help preserve lean mass. ([PubMed][2])
* **Useful ceiling concept for strength gains**: evidence suggests benefits plateau around **~1.6 g/kg/day** for maximizing fat-free mass gains in resistance training (assuming total calories are adequate), so going far above that is often diminishing returns. ([PubMed][3])
### Per-meal distribution (this is what makes protein “work” better)
* **Per-meal dose**: **0.3 g/kg** protein. ([Dietitians of Canada][1])
* **Meal spacing**: repeat that dose **every 3 to 5 hours** (typically 3 to 5 feedings/day). ([Dietitians of Canada][1])
* **Post-training dose**: **0.25 to 0.3 g/kg within 0 to 2 hours after key sessions** (hard run, long run, or lifting). ([Dietitians of Canada][1])
**App-ready rule of thumb**
* `daily_protein_g = bodyweight_kg * 1.6 to 2.0`
* `protein_per_meal_g = bodyweight_kg * 0.3`
* `remind_every_hours = 3 to 5`
---
## 2) Pre-run nutrition timing and what to eat/avoid
### Carbs before runs longer than 60 minutes
* **Carb target**: **1 to 4 g/kg**, consumed **1 to 4 hours pre-run**. ([Dietitians of Canada][1])
* If you want a tighter timing rule (easy to encode):
  * **~1 g/kg at 1 hour pre**
  * **~2 g/kg at 2 hours pre**
  * **~3 to 4 g/kg at 3 to 4 hours pre** ([NCAA.org][4])
### What to eat (practical filters)
Choose foods that are:
* **Carb-forward**
* **Low fiber / low residue**
* **Lower fat**
* **Familiar (nothing new on key workouts)**
This is explicitly recommended because **high fat/protein/fiber choices can increase GI issues during the event**. ([Dietitians of Canada][1])
### What to avoid (especially within 0 to 3 hours pre-run)
* **High fiber**: big salads, beans, bran cereal
* **High fat**: fried foods, heavy cream sauces, lots of nut butter
* **Very protein-heavy meals** right before running (save protein emphasis for after) ([Dietitians of Canada][1])
### “Carbs in the last hour” nuance (GI and blood sugar)
* Some athletes worry about “reactive hypoglycemia” if they take carbs **30 to 60 minutes pre-run**. This can happen in some people, but it’s not universal, and taking carbs during the workout can reduce the downside. ([PubMed][5])
  **App logic**: if a user flags “reactive hypoglycemia,” suggest carbs earlier (90–120 min) or pair with a smaller, simpler carb closer in.
---
## 3) Post-run recovery nutrition (protein + carbs window)
### The “window” depends on how soon you train again
**If you have another hard session within 8 hours** (two-a-day, or back-to-back demanding sessions):
* **Carbs**: **1.0 to 1.2 g/kg/hour for the first 4 hours**, starting early in recovery. ([Dietitians of Canada][1])
* **Protein**: **0.25 to 0.3 g/kg within 0 to 2 hours** post-exercise. ([Dietitians of Canada][1])
**If your next key session is tomorrow**
* You can be less aggressive hourly and instead just hit your normal daily fueling targets. (The “hourly carb” rule matters most when turnaround is short.) ([Dietitians of Canada][1])
### Simple combined recovery rule (very app-friendly)
* **Within 0 to 60 minutes after finishing**:
  * `protein_g = bodyweight_kg * 0.25 to 0.30`
  * `carbs_g = bodyweight_kg * 1.0` (especially if training again soon) ([Dietitians of Canada][1])
### Protein distribution after the initial hit
* Keep protein coming as **~0.3 g/kg every 3 to 5 hours** across the day. ([Dietitians of Canada][1])
---
## 4) Long run fueling (when to start gels/carbs, how much per hour)
### How much carbohydrate per hour (core rule set)
Use run duration to choose the target:
* **< 45 min**: **no carbs needed** ([Dietitians of Canada][1])
* **45 to 75 min (hard effort)**: **small amounts, including mouth rinse** (still performance-relevant) ([Dietitians of Canada][1])
* **1 to 2.5 hours**: **30 to 60 g/hour** ([Dietitians of Canada][1])
* **> 2.5 to 3 hours**: **up to 90 g/hour** ([Dietitians of Canada][1])
### When to start (so you actually hit the hourly target)
A very usable evidence-based phrasing is:
* For exercise **> 1 hour**, carb intake should **begin shortly after the start of exercise**. ([NCAA.org][4])
**App-ready implementation**
* If `run_duration_minutes > 60`:
  * `start_fueling_minute = 10 to 20`
  * `repeat_every_minutes = 15 to 30`
  * distribute doses to match the hourly target
    This matches the “start early + smaller repeated doses” approach recommended for practicality and tolerance. ([NCAA.org][4])
### Dose scheduling templates (so reminders are dead simple)
Pick one based on tolerance:
* **Target 30 g/hour**
  * 15 g every 30 min, or 20–25 g every 45 min
* **Target 60 g/hour**
  * 20 g every 20 min, or 30 g every 30 min
* **Target 90 g/hour**
  * 30 g every 20 min
(Your app can compute dose size from the product’s “carbs per gel/chew.”)
### What type of carbs (important at higher intakes)
* For longer events and higher intakes, products with **multiple transportable carbohydrates (glucose + fructose)** are recommended to support higher oxidation rates and gut comfort. ([Dietitians of Canada][1])
* A modern review suggests that at **> 60 g/hour**, glucose-fructose blends with a ratio **near 1:0.8** may be preferable to the older “2:1” rule. ([PubMed Central][6])
---
## 5) Hydration guidelines (practical numbers you can encode)
### Pre-run hydration
* **2 to 4 hours pre-exercise**: drink **5 to 10 mL/kg**. ([Dietitians of Canada][1])
### During-run hydration (anchor rules)
* Aim to limit body mass loss so the fluid deficit stays **< 2% body weight**. ([Dietitians of Canada][1])
* Typical achievable intake in many events: **0.4 to 0.8 L/hour**, customized to sweat rate and tolerance. ([Dietitians of Canada][1])
* Sweat rates vary widely (roughly **0.3 to 2.4 L/hour**), so personalization matters. ([Dietitians of Canada][1])
### Sweat rate calculation (for personalization)
* **1 kg body mass loss ≈ 1 L sweat loss** (when you account for intake and bathroom breaks). ([Dietitians of Canada][1])
  **App feature idea**: prompt users to do a “sweat test” occasionally and store L/hour.
### Sodium and electrolytes (when it matters)
* Sodium during exercise is especially relevant for:
  * **high sweat rates (> 1.2 L/hour)**, or
  * **salty sweaters**, or
  * **prolonged exercise > 2 hours** ([Dietitians of Canada][1])
* Sports drink formulation guidance:
  * **4% to 8% carbohydrate**
  * **~0.5 to 0.7 g sodium per liter**
  * and total fluid often lands around **600 to 1200 mL/hour** in long/hot sessions ([KHSAA][7])
### Post-run rehydration
* Replace **125% to 150%** of the remaining deficit:
  * **1.25 to 1.5 L per 1 kg body mass lost**. ([Dietitians of Canada][1])
---
## 6) Race week nutrition changes (what to change vs normal)
### Carbohydrate loading (the main “race week” lever)
* For events **> 90 minutes**:
  * **10 to 12 g/kg/day for 36 to 48 hours pre-race**. ([Dietitians of Canada][1])
* A helpful practical note from the same position paper:
  * With taper + high carbs (**7 to 12 g/kg/day**), glycogen can normalize within **~24 hours**
  * Extending to **48 hours** can achieve **supercompensation** ([Dietitians of Canada][1])
### Fiber and gut comfort (quietly important)
* During carb-loading, many athletes choose **low fiber / low residue** carb sources to hit high carb totals while keeping the gut calm. ([Dietitians of Canada][1])
### Pre-race meal (race morning or pre-start)
* **1 to 4 hours pre-start**: **1 to 4 g/kg carbohydrate**, and keep it individualized and well-practiced. ([Dietitians of Canada][1])
* Avoid high fat/protein/fiber close to start if GI issues are a risk. ([Dietitians of Canada][1])
### Race fueling and hydration are not the day to experiment
* Keep race-week and race-day foods **familiar**. (This is more practice-based than a single numeric rule, but it’s one of the biggest real-world success factors.)
---
## Copy-pasteable rule set for an app (pseudo-logic)
```yaml
protein:
  daily_g_per_kg:
    default: [1.6, 2.0]
    deficit_or_peak_week: [1.8, 2.0]
  per_meal_g_per_kg: 0.3
  meal_spacing_hours: [3, 5]
  post_session_g_per_kg: [0.25, 0.30]
  post_session_window_hours: [0, 2]
pre_run:
  if_run_gt_60min:
    carbs_g_per_kg: [1, 4]
    timing_hours_before: [1, 4]
    avoid: ["high_fat", "high_fiber", "very_high_protein"]
  hydration_ml_per_kg_2to4h_pre: [5, 10]
during_run_fueling:
  duration_rules:
    lt_45min: {carbs_g_per_h: 0}
    45to75min_hard: {carbs: "small_amounts_or_mouth_rinse"}
    1to2_5h: {carbs_g_per_h: [30, 60]}
    gt_2_5h: {carbs_g_per_h: [60, 90]}
  start_minute_if_gt_60min: [10, 20]
  repeat_every_min: [15, 30]
post_run:
  if_next_key_session_within_8h:
    carbs_g_per_kg_per_h_first_4h: [1.0, 1.2]
    protein_g_per_kg_within_2h: [0.25, 0.30]
  rehydration_L_per_kg_lost: [1.25, 1.5]
hydration_during:
  target_body_mass_loss_percent_max: 2
  typical_intake_L_per_h: [0.4, 0.8]
  sports_drink:
    carbs_percent: [4, 8]
    sodium_g_per_L: [0.5, 0.7]
race_week:
  if_event_gt_90min:
    carb_load_g_per_kg_per_day: [10, 12]
    duration_hours: [36, 48]
  pre_race_meal:
    carbs_g_per_kg: [1, 4]
    timing_hours_before: [1, 4]
    avoid: ["high_fat", "high_fiber"]
```
---
If you tell me two things, I can convert this into an even tighter, app-spec “decision table” with exact reminders:
1. What your app knows at runtime (bodyweight, run duration, intensity tags, weather, sweat rate estimate, next workout timing).
2. Whether you want reminders to be conservative (GI-safe) or aggressive (performance-max).
[1]: https://www.dietitians.ca/DietitiansOfCanada/media/Documents/Resources/noap-position-paper.pdf?ext=.pdf "Dietitians of Canada"
[2]: https://pubmed.ncbi.nlm.nih.gov/22150425/?utm_source=chatgpt.com "Dietary protein for athletes: from requirements to optimum ..."
[3]: https://pubmed.ncbi.nlm.nih.gov/28698222/?utm_source=chatgpt.com "A systematic review, meta-analysis and meta-regression of ..."
[4]: https://www.ncaa.org/sports/2013/12/18/fueling-for-performance-how-proper-timing-of-meals-affects-both-sport-and-academic-performance.aspx "
	Fueling for Performance: How proper timing of meals affects both sport and academic performance - NCAA.org
"
[5]: https://pubmed.ncbi.nlm.nih.gov/21346333/?utm_source=chatgpt.com "The myths surrounding pre-exercise carbohydrate feeding"
[6]: https://pmc.ncbi.nlm.nih.gov/articles/PMC9734239/ "
            New Horizons in Carbohydrate Research and Application for Endurance Athletes - PMC
        "
[7]: https://www.khsaa.org/sportsmedicine/heat/exerciseandfluidreplacement.pdf "wil88043_appendixk.qxd"
[34m10m38s · gpt-5.1-pro[browser] · ↑112 ↓2.8k ↻0 Δ2.92k[39m
10m38s · gpt-5.1-pro[browser] · ↑112 ↓2.8k ↻0 Δ2.92k | slug=runner-nutrition-fueling-guidelines
