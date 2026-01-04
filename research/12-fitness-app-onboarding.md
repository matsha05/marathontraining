# Fitness &amp; Training App Onboarding Patterns

> Research for The Long Game marathon training app onboarding

## Apps Analyzed

1. **Strava** - Runner onboarding
2. **Nike Run Club** - Personalized plan onboarding
3. **Peloton** - Building commitment
4. **WHOOP** - Complex health data collection
5. **Noom** - Psychology-based behavior change
6. **MyFitnessPal** - Habit formation onboarding

---

## 1) Strava: "Do something, get a payoff"

Strava's onboarding is built around a simple activation loop: connect to people and clubs, record an activity, then get immediate stats, segments, and social reinforcement.

### Making Data Collection Feel Rewarding

- They don't lead with a long questionnaire
- The reward is downstream: record a run and you immediately get a map, splits, pace analysis, elevation, and "results" for segments
- Live Segments use real-time progress UI and "you're ahead/behind" feedback

### Explaining WHY They Need Information

- **Birthday**: used for comparisons and heart rate zones
- **Weight**: used for power analysis, some leaderboards, and calorie estimation
- **Date of birth**: framed as enabling age-appropriate experiences

### "Aha Moments" During Onboarding

- Aha = "my run becomes a story + a score"
- After first activity: analysis view and segments create instant context
- "Was it as hilly as it felt," "did I negative split," "did I earn any segment placements"

### Handling Users Without Data

- **No watch?** Still works with phone tracking
- **No GPS file?** Manual entry exists (time + distance)

### Premium Visual Patterns

- Real-time progress UI (Live Segments progress circle/banner)
- Activity recording UI that behaves like a "smartwatch screen"

**Takeaway**: The best "reward" for data collection is not a thank-you screen — it's instant interpretation of effort (stats, comparisons, mini-achievements) right after the user does the thing.

---

## 2) Nike Run Club: "Minimum setup, then coaching does the heavy lifting"

### Making Data Collection Feel Rewarding

- Friction minimized by design
- Quick routing to: basic run, time/distance targets, or guided runs
- The "reward" is coaching access (guided runs with experts/athletes)

### Explaining WHY They Need Information

- **Location services**: ensures run data is recorded and visible
- **Height and weight**: improves accuracy of run metrics (default value offered if user prefers not to share)

### "Aha Moments"

- Aha = "every run has a purpose" — goals for each week and the purpose of every run
- Aha = "I'm not alone" — brand-level trust plus coach voice

### Handling Users Without Data

- Default values reduce disclosure anxiety
- Can begin without race times or VO2max, then let logged runs become the dataset

**Takeaway**: Do not demand the full dataset to begin. Earn the dataset through guided execution, then personalize more deeply as confidence increases.

---

## 3) Peloton: "Commitment is a product feature"

### Making Data Collection Feel Rewarding

- Quiz inputs immediately become a plan — "no guesswork" weekly suggestions
- Streaks/personal bests as explicit motivation mechanic

### Explaining WHY They Need Information

- Plans tailored to goals, factoring in time, preferred class types, and class history

### "Aha Moments"

- Aha = "my plan shows up automatically" — lands on homepage weekly
- Aha = "my whole fitness life counts" — integrations let you get credit for outside workouts

### Handling Users Without Data

- **Progress gating pattern**: some features only appear after enough workouts
- Makes "missing data" feel like a progression milestone rather than a failure

### Premium Visual Patterns

- Streak UI + progress recognition front-and-center
- Club Peloton celebrates consistency with points, profile badges, "leveling up"

**Takeaway**: Treat consistency mechanics (streaks, milestones, recognition) as first-class onboarding steps, not "later retention features."

---

## 4) WHOOP: "Complex health data becomes approachable through calibration + unlocking"

### Making Data Collection Feel Rewarding

- Immediate insights even on day one (heart rate, respiratory rate, steps, stress)
- **Four-day calibration phase** that unlocks coaching features later:
  - Strain Coach on day 5
  - Sleep Coach on day 7
- **Unlocking makes waiting feel like progress**
- Auto-detecting repeated activities feels like "the product knows me"

### Explaining WHY They Need Information

- Strongly anchored in physiology and measurement methodology
- Explains HRV and how it's used in Recovery Score

### "Aha Moments"

- Aha = "my body sets today's training" — overnight recovery drives daily strain goals
- Aha = "my behaviors affect recovery" — daily journal leads to monthly report

### Handling Users Without Data

- Collect passively, then progressively personalize as the baseline forms
- Manual data framed as optional personalization with later payoff

**Takeaway**: If you need a complex dataset, use "calibrate, then unlock" structure so users feel momentum while the system learns.

---

## 5) Noom: "High-friction onboarding that tries to earn buy-in through psychology"

### Making Data Collection Feel Rewarding

- Immediate personalization outputs (predicting when you'll hit goal weight, behavioral profile)
- Progress bars and "processing" visuals make users feel answers are being used
- Varied question styles to fight fatigue

### Warning: Trust Problem

- Criticized for asking intensely personal info before trust
- Provides almost no concrete information about how it will help during the flow

### "Aha Moments"

- Self-insight + predicted outcome (timeline to goal, behavioral profile)
- Quick tips that make the product feel helpful before the paywall

### Handling Users Without Data

- Guided, tap-friendly question formats make "approximate answers" feel acceptable

**Takeaway**: Use Noom's momentum mechanics (progress feedback, early personalization), but avoid its biggest trust error: do not ask for sensitive details before you've shown what you will do with them.

---

## 6) MyFitnessPal: "Instant goal math + habit loop that gets easier over time"

### Making Data Collection Feel Rewarding

- Few basics (age, height, weight, sex, activity level) → immediately output daily calorie and nutrient targets
- Promise that logging becomes dramatically easier ("in a few days, ~30 seconds")
- "Finish logging for today" provides five-week projection

### Explaining WHY They Need Information

- Inputs used to estimate maintenance calories, then adjust based on desired weekly change rate
- Goal weight used for progress reporting, not initial calculation

### "Aha Moments"

- Aha = "calories as a daily budget" — Net Calories and budget model
- Aha = "I can do this fast" — the "it gets easier" promise

### Premium Visual Patterns

- Fast capture tools (barcode scan, meal scan)
- Projection/feedback moments that feel computed and personal

**Takeaway**: If you need runners to enter data, compute something meaningful immediately (paces + plan preview) and promise that personalization improves as they log more runs.

---

## 10 Actionable Recommendations for The Long Game

### 1) Lead with a concrete output preview, not a questionnaire

- First screen: "Get your marathon plan in 3 minutes" + blurred preview of Week 1 calendar and pace zones
- Every 1–2 questions, show a "result chip" updating (e.g., "Estimated easy pace: 9:45–10:30/mi")

### 2) Ask for race goal and race date first

- Step 1: "What are you training for?" (Marathon, Half, Custom)
- Step 2: "Race day" date picker
- Immediately show: "Plan length: 18 weeks" and "Start date: Monday, Feb X"

### 3) Make schedule constraints feel like personalization

- "How many days can you run?" (2–7) plus quick "Which days?" picker
- Show live calendar preview that rearranges in real time
- Add "You can swap days anytime" copy

### 4) Use a multi-path "fitness level" step with friendly offramps

Create a "Choose how we set your paces" screen with 4 equal options:
- "I know a recent race time" (5K/10K/HM/Marathon, time input)
- "I have VO2max from my watch" (enter value or import)
- "Import from another app" (Strava, Apple Health, Garmin, COROS)
- "I'm not sure" (run a short assessment or conversational estimate)

**Option 4 should be zero-shame**: "Totally normal. We'll start with an estimate and fine-tune after your first week."

### 5) Turn missing data into a progression milestone

If user selects "I'm not sure," generate paces with an "Estimated" badge:
- "After 2–3 runs, we'll auto-calibrate your paces"
- Progress bar: "Calibration: 0/3 runs completed"

### 6) Explain "why" inline

For each sensitive question, include 1-line "why" that ties to runner value:
- **Race time**: "Sets training paces so easy runs stay easy and workouts hit the right effort"
- **Injury history**: "Helps us avoid common flare-ups by adjusting intensity and adding recovery"
- **Schedule**: "Keeps long runs on days you can actually do them"

### 7) Use WHOOP-style "calibration + unlock"

Unlock features over the first week:
- **Immediately**: Week 1 plan + estimated paces
- **After first long run**: Long run pacing coach
- **After first speed workout**: Workout pacing coach
- **After 7 days**: Fatigue and progression insights

### 8) Treat injury history like a trust moment

- Put injury questions **after** you've already shown a plan preview and pace zones
- Use empathetic framing: "Any injuries you want us to plan around?"
- Include preset options with "Prefer not to say"
- Add safety disclaimer: "We're not medical care. If you're currently injured, consider consulting a clinician."

### 9) Strength training preference should show immediate plan impact

- Toggle: "Include strength training" (Recommended / Optional / Not now)
- If "yes," ask: "How many days?" (1–3) and "Where should we place it?"
- **Immediately update calendar preview** with strength sessions

### 10) End with a commitment moment + first action

After plan generation:
- Show "Week 1 starts on ___" and big CTA: "Schedule your first run"
- Offer calendar integration and reminders
- Optional: "Invite a training buddy" (do not gate the plan behind it)
- **Premium micro-interaction**: "Plan assembling" animation (cards stacking into calendar)
