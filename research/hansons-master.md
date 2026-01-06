# Hansons Method Master Training Library

> **Purpose:** Canonical reference for all Hansons training plans (Marathon + Half Marathon).
> **Source:** Official Hansons Coaching Services PDFs (2024), "Hansons Marathon Method" book
> **Status:** VERIFIED against official PDFs

---

## Table of Contents
1. [Philosophy - The Hansons Voice](#philosophy---the-hansons-voice)
2. [Core Principles](#core-principles)
3. [Marathon Plans](#marathon-plans)
4. [Half Marathon Plans](#half-marathon-plans)
5. [Workout Definitions](#workout-definitions)
6. [Encoding Specifications](#encoding-specifications)

---

## Philosophy - The Hansons Voice

### The Cumulative Fatigue Principle

> "The goal of Hansons training is to teach your body to run strong when tired. Not fresh. Tired. Because that's when it matters - at mile 20 of a marathon."
> — Keith Hanson

Every workout in the Hansons system is designed to be performed on **not-fresh legs**. This is intentional. We don't give you rest days before long runs because:

1. **Race simulation**: You'll never start a marathon with fresh legs after mile 10
2. **Metabolic adaptation**: Your body learns to access fat stores more efficiently when glycogen-depleted
3. **Mental toughness**: You learn what "tired but fine" feels like

### Why We Cap Long Runs at 16 Miles

Most marathon plans obsess over the 20-miler. We don't. Here's why:

> "A 16-mile run as part of an overall training program that accumulates fatigue is physiologically equivalent to - or better than - a 20-mile run done by a runner who rests before and after it."
> — Luke Humphrey

The math:
- **Research shows** aerobic adaptations diminish significantly after ~2.5-3 hours
- **Running 16 miles** in the Hansons system happens on fatigued legs
- **The last 10 miles** of your 16-miler feel like the last 10 miles of a marathon
- **Injury risk** increases dramatically beyond 16 miles

### The 6-Day-Per-Week Non-Negotiable

> "You can't remove a day from this program. It's like removing a leg from a table - the whole thing falls over."

This is not about being hardcore. It's about:
1. **Distributing stress** across more days (less per day = less injury)
2. **Maintaining fatigue** (longer rest = fresh legs = wrong adaptation)
3. **Accumulating volume** (40-60 miles split 6 ways is very manageable daily)

---

## Core Principles

### CF-1: Weekly Structure is Fixed
```
Mon = Easy
Tue = SOS (Speed or Strength)  
Wed = Rest or Cross-Train
Thu = SOS (Tempo at Goal Pace)
Fri = Easy
Sat = Easy (longer)
Sun = SOS (Long Run)
```

### CF-2: No Rest Days Adjacent to Long Runs
- **Not before**: You should feel yesterday's miles
- **Not after**: Active recovery is better than passive rest

### CF-3: Three SOS Days Per Week, No More
- **SOS** = Something Of Substance
- Tuesday (Speed/Strength) + Thursday (Tempo) + Sunday (Long Run)
- Easy days MUST stay easy to preserve quality on SOS days

### CF-4: If You Miss a Workout, Skip It
> "No single workout makes or breaks your marathon. Stacking missed workouts to 'make up' volume breaks the system."

### LR-1: Long Run Distance Constraints
```
MAX_DISTANCE = 16 miles (marathon) / 12-14 miles (half)
MAX_DURATION = 180 minutes
MAX_WEEKLY_PERCENT = 30%
```

### LR-2: Alternating Long Run Pattern
- Week A: Build long run (increases toward cap)
- Week B: Recovery long run (~10 miles)
- Repeat: 16, 10, 16, 10, 16, 10...

---

## Marathon Plans

### Beginner Marathon - 18 Weeks

**Eligibility:**
- Currently running 15-25 miles/week
- Have completed a half marathon OR regularly run 8+ miles

**Peak Mileage:** 57.5 miles (Week 15)

| Week | Mon | Tue | Wed | Thu | Fri | Sat | Sun | Total |
|------|-----|-----|-----|-----|-----|-----|-----|-------|
| 1 | Rest/CT | 2mi Easy | Rest/CT | 3mi Easy | Rest/CT | 3mi Easy | 4mi Easy | 12 |
| 2 | Rest/CT | 2mi Easy | Rest/CT | 3mi Easy | 3mi Easy | 3mi Easy | 4mi Easy | 15 |
| 3 | Rest/CT | 4mi Easy | Rest/CT | 4mi Easy | 4mi Easy | 4mi Easy | 5mi Easy | 21 |
| 4 | Rest/CT | 5mi Easy | Rest/CT | 3mi Easy | 3mi Easy | 5mi Easy | 4mi Easy | 20 |
| 5 | Rest/CT | 5mi Easy | Rest/CT | 4mi Easy | 5mi Easy | 4mi Easy | 6mi Easy | 24 |
| 6 | 4 Easy | **12×400** | Rest/CT | **5mi @MP** | 4 Easy | 8 Easy | 8 Long | 40 |
| 7 | 4 Easy | **8×600** | Rest/CT | **5mi @MP** | 4 Easy | 6 Easy | 10 Long | 39 |
| 8 | 6 Easy | **6×800** | Rest/CT | **5mi @MP** | 5 Easy | 6 Easy | 10 Long | 42 |
| 9 | 5 Easy | **5×1km** | Rest/CT | **8mi @MP** | 6 Easy | 5 Easy | 15 Long | 49 |
| 10 | 7 Easy | **4×1200** | Rest/CT | **8mi @MP** | 5 Easy | 8 Easy | 10 Long | 48 |
| 11 | 5 Easy | **6×1mi** @MP-10 | Rest/CT | **8mi @MP** | 5 Easy | 8 Easy | 16 Long | 54.5 |
| 12 | 5 Easy | **4×1.5mi** @MP-10 | Rest/CT | **9mi @MP** | 5 Easy | 8 Easy | 10 Long | 50 |
| 13 | 7 Easy | **3×2mi** @MP-10 | Rest/CT | **9mi @MP** | 6 Easy | 6 Easy | 16 Long | 56.5 |
| 14 | 5 Easy | **2×3mi** @MP-10 | Rest/CT | **9mi @MP** | 5 Easy | 8 Easy | 10 Long | 49 |
| 15 | 7 Easy | **3×2mi** @MP-10 | Rest/CT | **10mi @MP** | 6 Easy | 6 Easy | 16 Long | 57.5 |
| 16 | 5 Easy | **4×1.5mi** @MP-10 | Rest/CT | **10mi @MP** | 5 Easy | 8 Easy | 10 Long | 51 |
| 17 | 7 Easy | **3×2mi** @MP-10 | Rest/CT | **10mi @MP** | 6 Easy | 6 Easy | 8 Easy | 49.5 |
| 18 | 5 Easy | 5mi Easy | Rest | 6mi Easy | 5mi Easy | 3mi Easy | **RACE** | 50.2 |

**Data Arrays:**
```typescript
const BEGINNER_MARATHON_LONG_RUNS = [4, 4, 5, 4, 6, 8, 10, 10, 15, 10, 16, 10, 16, 10, 16, 10, 8, 26.2];
const BEGINNER_MARATHON_TEMPO = [0, 0, 0, 0, 0, 5, 5, 5, 8, 8, 8, 9, 9, 9, 10, 10, 10, 0];
const BEGINNER_MARATHON_WEEKLY = [12, 15, 21, 20, 24, 40, 39, 42, 49, 48, 54.5, 50, 56.5, 49, 57.5, 51, 49.5, 50.2];
```

---

### Advanced Marathon - 18 Weeks

**Eligibility:**
- Currently running 35-50+ miles/week
- Have run a marathon at sub-4:00 OR consistently run 50+ miles/week

**Peak Mileage:** 61.5 miles (Week 15)

| Week | Mon | Tue | Wed | Thu | Fri | Sat | Sun | Total |
|------|-----|-----|-----|-----|-----|-----|-----|-------|
| 1 | 6 Easy | 6mi Easy | Rest/XT | 6mi Easy | 6 Easy | 6 Easy | 8 Easy | 38 |
| 2 | 6 Easy | **12×400** | Rest/XT | 6mi Easy | 6 Easy | 6 Easy | 8 Easy | 41 |
| 3 | 6 Easy | **8×600** | Rest/XT | **6mi @MP** | 7 Easy | 6 Easy | 10 Long | 45 |
| 4 | 6 Easy | **6×800** | Rest/XT | **6mi @MP** | 6 Easy | 8 Easy | 8 Easy | 44 |
| 5 | 6 Easy | **5×1km** | Rest/XT | **6mi @MP** | 7 Easy | 6 Easy | 12 Long | 47 |
| 6 | 8 Easy | **4×1200** | Rest/XT | **7mi @MP** | 7 Easy | 10 Easy | 10 Long | 53 |
| 7 | 6 Easy | **3×1mi** | Rest/XT | **7mi @MP** | 6 Easy | 8 Easy | 14 Long | 51 |
| 8 | 6 Easy | **4×1200** | Rest/XT | **7mi @MP** | 6 Easy | 10 Easy | 10 Long | 49 |
| 9 | 8 Easy | **5×1km** | Rest/XT | **8mi @MP** | 7 Easy | 8 Easy | 15 Long | 56 |
| 10 | 6 Easy | **6×800** | Rest/XT | **8mi @MP** | 6 Easy | 10 Easy | 10 Long | 50 |
| 11 | 8 Easy | **6×1mi** @MP-10 | Rest/XT | **8mi @MP** | 7 Easy | 8 Easy | 16 Long | 59.5 |
| 12 | 6 Easy | **4×1.5mi** @MP-10 | Rest/XT | **9mi @MP** | 6 Easy | 10 Easy | 10 Long | 54 |
| 13 | 8 Easy | **3×2mi** @MP-10 | Rest/XT | **9mi @MP** | 7 Easy | 8 Easy | 16 Long | 61 |
| 14 | 6 Easy | **2×3mi** @MP-10 | Rest/XT | **9mi @MP** | 6 Easy | 10 Easy | 10 Long | 53 |
| 15 | 8 Easy | **3×2mi** @MP-10 | Rest/XT | **10mi @MP** | 7 Easy | 8 Easy | 16 Long | 61.5 |
| 16 | 6 Easy | **4×1.5mi** @MP-10 | Rest/XT | **10mi @MP** | 6 Easy | 10 Easy | 10 Long | 55 |
| 17 | 8 Easy | **6×1mi** @MP-10 | Rest/XT | **10mi @MP** | 7 Easy | 8 Easy | 8 Easy | 53.5 |
| 18 | 6 Easy | 5mi Easy | Rest | 6mi Easy | 6 Easy | 3 Easy | **RACE** | 52.2 |

**Data Arrays:**
```typescript
const ADVANCED_MARATHON_LONG_RUNS = [8, 8, 10, 8, 12, 10, 14, 10, 15, 10, 16, 10, 16, 10, 16, 10, 8, 26.2];
const ADVANCED_MARATHON_TEMPO = [0, 0, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10, 0];
const ADVANCED_MARATHON_WEEKLY = [38, 41, 45, 44, 47, 53, 51, 49, 56, 50, 59.5, 54, 61, 53, 61.5, 55, 53.5, 52.2];
```

---

## Half Marathon Plans

### Beginner Half - 18 Weeks

**Long Run Cap:** 12 miles
**Peak Mileage:** 42 miles

**Data Arrays:**
```typescript
const BEGINNER_HALF_LONG_RUNS = [4, 4, 5, 5, 6, 6, 8, 8, 10, 10, 10, 12, 10, 12, 10, 12, 6, 13.1];
const BEGINNER_HALF_TEMPO = [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 4, 0];
const BEGINNER_HALF_WEEKLY = [10, 12, 17, 18, 21, 27, 31, 32, 36, 37, 40, 42, 40, 42, 40, 42, 36, 31.1];
```

### Advanced Half - 18 Weeks

**Long Run Cap:** 14 miles
**Peak Mileage:** 50 miles

**Data Arrays:**
```typescript
const ADVANCED_HALF_LONG_RUNS = [6, 6, 7, 8, 10, 12, 10, 12, 10, 12, 10, 14, 10, 14, 10, 14, 8, 13.1];
const ADVANCED_HALF_TEMPO = [0, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 5, 0];
const ADVANCED_HALF_WEEKLY = [17, 33, 34, 36, 40, 44, 41, 46, 41, 47, 45, 49, 47, 50, 48, 50, 44, 37.1];
```

---

## Workout Definitions (Hansons Voice)

### Easy Runs
> "Easy means easy. If you can't hold a conversation, you're going too fast. Easy runs are where you build your aerobic engine without accumulating stress."

**Purpose:** Aerobic development, recovery, volume accumulation
**Feel:** Conversational, relaxed
**Heart Rate:** 65-75% max

### Long Runs
> "Your 16-miler in this program is harder than a 20-miler in programs with days off before it. You're running on yesterday's miles, and tomorrow you run again. That's the point."

**Purpose:** Teach body to burn fat, time on feet, race simulation under fatigue
**Pace:** 30-90 seconds/mile slower than marathon pace
**Cap:** 16 miles marathon / 12-14 miles half

### Tempo Runs (SOS)
> "Thursday tempo runs are the heart of this program. You're practicing race pace. Not 'near' race pace. Exactly race pace."

**Marathon Pace (MP):** Your goal marathon pace
**Half Marathon Pace (HMP):** Your goal half marathon pace
**Progression:** Starts at 5 miles, builds to 10 miles

### Speed Workouts (SOS)
> "Speed work makes you faster. But more importantly, it teaches your body to clear lactate while maintaining form under stress."

**Pace:** Between your 5K and 10K race pace
**Intervals:** 400m, 600m, 800m, 1km, 1200m
**Recovery:** 400m jog between intervals (NOT rest)

### Strength Workouts (SOS)
> "Strength workouts are marathon-specific. We're building the 'muscle memory' to hold pace when everything in your body wants to slow down."

**Marathon Pace:** MP minus 10 seconds per mile
**Half Pace:** 10K pace
**Intervals:** 1 mile, 1.5 mile, 2 mile, 3 mile repeats
**Recovery:** 400m-1mi jog

### Rest/Cross-Train
> "One day per week, you don't run. But you still move. Swimming, cycling, elliptical - anything that gives your legs a break while keeping blood flowing."

---

## Sources
- Official Hansons Coaching Services PDFs (2024)
- "Hansons Marathon Method" by Luke Humphrey (2012, revised 2016)
- "Hansons Half-Marathon Method" by Luke Humphrey (2014)
- https://hansons-running.com
- https://lukehumphreyrunning.com

---

*Verified 2026-01-05*
