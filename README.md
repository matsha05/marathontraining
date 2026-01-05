# The Long Game

> A daily training plan you can actually trust.

## What This Is

**The simplest answer to:** "I want to run a marathon. What do I do today?"

You log in. You see your workout. Running, strength, mobility—all in one place. All calculated for you. All based on science from coaches who've trained world-class athletes.

No more stitching together random running plans, strength programs, and prehab routines. No more hoping they fit. Just one plan, every day, that accounts for everything.

---

## Why This Exists

**The Problem:** Training plans are everywhere—apps, books, coaches—but they don't talk to each other. Running plans ignore strength. Strength plans ignore running. You end up:
- Guessing how to combine them
- Getting injured because the load doesn't add up
- Becoming a "skinny runner" because you dropped lifting
- Never trusting if you're doing it right

**The Solution:** One integrated plan. Running is the priority. Strength makes sure you get there healthy and don't lose what you've built. Every workout is prescribed. Every pace is calculated. You just show up and execute.

---

## What Makes It Different

| Other Apps | The Long Game |
|------------|---------------|
| Running plan only | Running + Strength + Mobility |
| Generic paces | Paces calculated from YOUR race time (VDOT) |
| Static plan | Adapts to your training data |
| "Based on science" | Built on Hansons, Daniels, Seiler, Dicharry |
| Manual logging | Syncs with Strava automatically |

---

## Who It's For

Someone who:
- Wants to run a marathon (or 5K, 10K, half, ultra)
- Doesn't want to give up strength training
- Wants a plan they can trust without second-guessing
- Is tired of Googling "how to combine running and lifting"

---

## How It Works

### 1. Tell us your goal
Pick your race. Enter your best recent race time. We calculate your VDOT—the single number that determines all your training paces.

### 2. Get your plan
We build a periodized plan: Base → Build → Peak → Taper. Every day has exactly what you need.

### 3. Connect Strava (optional)
We sync your activities to track your training. Your plan stays on track with your actual runs.

### 4. Execute
Open the app each morning. See today's workout. Do it. Log it. Repeat.

---

## The Science

We don't make this up. Every workout is rooted in proven methodologies:

| Source | What We Use |
|--------|-------------|
| **Jack Daniels** | VDOT paces, workout structure |
| **Hansons** | 6-day structure, cumulative fatigue |
| **Stephen Seiler** | 80/20 polarized training |
| **Jay Dicharry** | Durability assessments, injury prevention |
| **Kelly Starrett** | Movement prep, mobility |

---

## Tech

- **Frontend:** Next.js, TypeScript, Tailwind
- **Icons:** Lucide-animated
- **Backend:** Supabase
- **Integrations:** Strava (activity sync)

---

## Run It Locally

```bash
npm install
npm run dev
```

---

## Visual QA

Playwright sweep that spins up the dev server, captures key pages, and writes screenshots to `tmp/visual-pass/`.

```bash
npm run visual:check
```

Optional:
- `npm run visual:check -- --port 3010`
- `npm run visual:check -- --base-url http://127.0.0.1:3000 --no-server`

---

## The Vision

This is the app that finally answers: *"I want to run a marathon, but I don't know what to do today, and I don't want to stop lifting."*

Log in. See the plan. Trust the plan.

**Train smart. Stay strong. Go the distance.**
