# Støren Strength Protocol for Runners

## Overview
- **Source:** Støren et al. (2008) - Journal of Applied Physiology
- **Title:** "Maximal strength training improves running economy in distance runners"
- **Key Finding:** 5% improvement in running economy after 8 weeks

## The Protocol

### Primary Exercise: Half-Squat at 4RM
| Parameter | Value |
|-----------|-------|
| Exercise | Half-squat (90° knee angle) |
| Load | 4RM (4-repetition maximum) |
| Sets | 4 |
| Reps | 4 |
| Rest | 3 minutes between sets |
| Frequency | 3× per week |
| Duration | 8 weeks minimum |

### Why Half-Squat?
- Mimics the knee angle during running stance phase
- Recruits similar muscle groups without excessive eccentric stress
- Safer for runners than full squats

## Results from Research

| Metric | Improvement |
|--------|-------------|
| Running Economy | +5.0% |
| 1RM Strength | +33.2% |
| Time to Exhaustion | +21.3% |
| VO2max | No change |

## Integration with Running Training

### When to Schedule
- **NOT** within 24 hours before a quality run
- **BEST:** Wednesday or Friday (assuming Tue/Thu SOS)
- **OK:** Same day as easy run (strength AM, run PM)

### Periodization Across Training Phases

| Phase | Sessions/Week | Focus |
|-------|---------------|-------|
| Base | 2-3 | Build strength, full protocol |
| Build | 2 | Maintain, slightly reduced volume |
| Peak | 1 | Maintenance only |
| Taper | 0-1 | Stop 10-14 days before race |

### When to Stop Before Race
- **Last heavy session:** 10-14 days pre-race
- **Light maintenance:** Can continue to 7 days out
- **Benefits persist:** 2-4 weeks after stopping

## Minimal Equipment Alternatives

If gym not available:
| Original | Alternative |
|----------|-------------|
| Barbell half-squat | Heavy goblet squat |
| 4RM load | Slow tempo (5-5-0) with lighter weights |
| Leg press | Bulgarian split squat |

## Contraindications

**Do NOT perform heavy strength when:**
- Within 48h of a race
- Active injury (especially lower body)
- During illness/high fatigue
- In final 10 days of taper

## Additional Eccentric Protocols

### Nordic Curl (Hamstring Protection)
- 3 sets × 6 reps
- 2× per week
- Reduces hamstring injury risk by 51%

### Eccentric Calf Raise (Achilles Tendon)
- 3 sets × 15 reps (slow eccentric)
- 2× per week
- Do NOT within 48h of quality runs

---

## Encoding Notes

```yaml
storen_protocol:
  exercise: "half_squat"
  load: "4RM"
  sets: 4
  reps: 4
  rest_minutes: 3
  frequency_per_week: 3
  duration_weeks: 8
  benefits:
    running_economy: 5.0
    strength_gain: 33.2
  stop_before_race_days: 10
  safe_scheduling:
    not_before_quality_run: 24
    best_days: ["wednesday", "friday"]
```

---

## Sources
- Støren, Ø., et al. (2008). Maximal strength training improves running economy in distance runners. Medicine and Science in Sports and Exercise, 40(6), 1087-1092.
- Rønnestad, B.R., et al. (2014). Effects of heavy strength training on running economy.
- Dicharry, J. Running Rewired (eccentric protocols).
