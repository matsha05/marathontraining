# Jack Daniels Running Formula - Complete Library

> **Source:** Jack Daniels, "Daniels' Running Formula" (3rd/4th Edition)
> **Key Innovation:** VDOT system for individualized training paces

## Overview
- **Author:** Dr. Jack Daniels
- **Book:** "Daniels' Running Formula" (multiple editions)
- **Philosophy:** Scientific approach based on VDOT, 4-phase periodization, purpose-driven training

## The VDOT System

VDOT determines all training paces based on current fitness (from recent race or time trial):

| Intensity | Abbreviation | Purpose | Effort | Example Pace |
|-----------|--------------|---------|--------|--------------|
| Easy | E | Aerobic base, recovery | Conversational | 1:30-2:00/mi slower than 5K |
| Marathon | M | Race-specific endurance | Moderate | Marathon goal pace |
| Threshold | T | Lactate clearance | "Comfortably hard" | 15K-HM pace (~60 min race) |
| Interval | I | VO2max development | Hard | 3K-5K pace |
| Repetition | R | Speed, running economy | Very fast | 1500m-Mile pace |

---

## Standard 4-Phase Structure (24 weeks)

### Phase I: Base Building (6 weeks)
- **Focus:** Aerobic foundation
- **Workouts:** Easy runs, strides, light hills
- **Long runs:** Up to 30% of weekly mileage or 150 min max
- **Quality sessions:** None (all easy)

### Phase II: Repetition Phase (6 weeks)
- **Focus:** Speed, running economy
- **Workouts:** R pace intervals (200m, 400m repeats)
- **Recovery:** Equal to work duration
- **Example:** 2 sets of 8×200m @ R pace
- **Threshold:** Cruise intervals introduced (e.g., 3×1 mile)

### Phase III: Interval Phase (6 weeks)
- **Focus:** VO2max, race-specific fitness
- **Workouts:** I pace intervals (800m-1200m)
- **Recovery:** 2-3 min jog
- **Examples:** 6×1000m, 8×800m, 5×1200m @ I pace
- **Threshold:** Extended tempo (20-40 min @ T pace)

### Phase IV: Competition (6 weeks)
- **Focus:** Race readiness, taper
- **Workouts:** Mix of I, T, and R
- **Races:** Replace quality sessions
- **Volume:** Reduced

---

## 2Q Marathon Plan (18 weeks)

The "2 Quality" marathon plan features two key workouts per week:

### Structure
- **Q1 (Sunday):** Long run with marathon/threshold work
- **Q2 (Wednesday/Thursday):** Medium-long with tempo/intervals
- **Other days:** Easy runs to fill mileage

### Mileage Levels
| Level | Peak Mileage | Weekly Range |
|-------|--------------|--------------|
| A | 40 mpw | 32-40 |
| B | 55 mpw | 44-55 |
| C | 70 mpw | 56-70 |
| D | 85 mpw | 68-85 |

### Sample Week (B Level, Peak Phase)
| Day | Workout |
|-----|---------|
| Mon | Easy 6 mi |
| Tue | Easy 7 mi |
| Wed | Q2: 14 mi (2E + 3×2mi T + 3E + 6×200R) |
| Thu | Recovery 5 mi |
| Fri | Easy 6 mi |
| Sat | Recovery 5 mi |
| Sun | Q1: 18 mi (2E + 14M + 2E) |

---

## 5K/10K Plans (24 weeks)

### Phase Breakdown
| Phase | Weeks | Focus | Key Workouts |
|-------|-------|-------|--------------|
| I | 1-6 | Base | E runs, strides, hills |
| II | 7-12 | Repetition | R: 200m, 400m; T: cruise intervals |
| III | 13-18 | Intervals | I: 800m-1200m; T: 20-40 min tempo |
| IV | 19-24 | Competition | Races, mixed I/T/R, taper |

### Sample Phase III Week (5K Focus)
| Day | Workout |
|-----|---------|
| Mon | Rest |
| Tue | Q1: 8 mi w/ 6×1000m @ I (2:30 rest) |
| Wed | Easy 5 mi |
| Thu | Q2: 7 mi w/ 20 min @ T |
| Fri | Easy 4 mi |
| Sat | Rest |
| Sun | Long run 10-12 mi easy |

---

## Encoding Specification

```yaml
daniels_5k_gold:
  duration_weeks: 24
  phases:
    base: [1, 2, 3, 4, 5, 6]
    repetition: [7, 8, 9, 10, 11, 12]
    interval: [13, 14, 15, 16, 17, 18]
    competition: [19, 20, 21, 22, 23, 24]
  intensity_zones:
    - E (easy)
    - T (threshold)
    - I (interval)
    - R (repetition)
  quality_days_per_week: 2-3
  long_run_cap_percent: 30

daniels_2q_marathon:
  duration_weeks: 18
  mileage_levels:
    - { name: 'A', peak: 40 }
    - { name: 'B', peak: 55 }
    - { name: 'C', peak: 70 }
    - { name: 'D', peak: 85 }
  quality_days: 2
  structure: 'Q1 Sunday (long run), Q2 midweek (tempo/intervals)'
  phases:
    base: [1, 2, 3, 4, 5, 6]
    build: [7, 8, 9, 10, 11, 12]
    peak: [13, 14, 15, 16]
    taper: [17, 18]
```

---

## Sources
- Daniels, J. (2014). Daniels' Running Formula, 3rd Edition.
- Daniels, J. (2021). Daniels' Running Formula, 4th Edition.
- https://runsmartproject.com/calculator/ (VDOT calculator)
