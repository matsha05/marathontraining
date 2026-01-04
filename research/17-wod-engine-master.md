# WOD Engine Master (Oracle Research)

> Complete WOD/MetCon system for hybrid runner-athletes. Scaling progressions, 24-WOD library, interference matrix, and deterministic scheduling.

---

## 1. Programming Principles (Major Gyms)

### CompTrain (Ben Bergeron)
- Programming for "the majority" - high skill gymnastics de-emphasized
- Strength + conditioning concurrent, not seasonal
- Running exposure 2-3x/week, Sunday run-centric
- **Weekly split:** 3 days strength + 8-18 min metcon, 3 days longer conditioning (20-35 min)

### HWPO (Mat Fraser)
- Structured cycles, progressive strength work
- Conditioning layered in, not random variance
- **Deload every 4th week**
- Multiple track variants (Flagship, 60, Masters)

### Mayhem (Rich Froning)
- Named cycles with emphases: Freedom, Hulk Out, **Into the Storm** (best for runners), Nerves of Steel
- Stimulus-driven scaling: preserve time domain and movement pattern
- **For runners:** "Into the Storm" = aerobic capacity + strength endurance

### Linchpin (Pat Sherwood)
- Efficient: 10-20 min workouts
- Multiple options: Rx, Wild Card, Scaled, Limited Equipment, No Equipment
- **For Long Game:** Produce 3-5 variants from single core stimulus

### Marcus Filly (Functional Bodybuilding)
- "Get built, not burnt" - avoid chronic high intensity
- Tempo work, unilateral, controlled eccentric
- **For Long Game:** Ideal for BASE and early BUILD strength

---

## 2. Scaling System

### Prime Directive
**Preserve intended stimulus first:** time domain, breathing demand, movement pattern, safety.

### 3-Layer Output Schema
| Tier | Description |
|------|-------------|
| **Rx** | Higher-level athlete standard (not Games level) |
| **Scaled** | Same pattern, same time domain, reduced load/complexity/volume |
| **Beginner** | Simplified movement, reduced volume, safe ROM |

### Scaling Levers (Priority Order)
1. **Load scaling** (keep movement)
2. **Volume scaling** (reps, rounds, distance)
3. **Range-of-motion scaling** (safe ROM targets, box height)
4. **Movement substitution** (same function, less skill)
5. **Time scaling** (only if needed)

### Loading Bands
| Band | Rep Range (unbroken) |
|------|---------------------|
| Heavy | 1-5 reps |
| Moderate | 6-20 reps |
| Light | 20+ reps |

### Load Scaling Standards

**%1RM by Total Reps (Best Method):**
| Total reps | Target load |
|------------|------------|
| 0-25 | ~80% |
| 25-45 | ~70% |
| 45-60 | ~65% |
| 60-80 | ~50% |
| 80+ | ~33% |

**%Rx Fallback (when no 1RM):**
| Tier | Load |
|------|------|
| Scaled | ~70% of Rx |
| Beginner | ~50% of Rx |

**Common conversions:** 135# → 95# → 65#, 225# → 155# → 115#

---

## 3. Movement Scaling Progressions

### Pulling (Vertical)
| Movement | Rx | Scaled | Beginner |
|----------|----|----|----------|
| Pull-up | Full kipping | Banded/jumping | Ring row |
| Chest-to-bar | Chest contacts | Pull-up | Ring row (sternum) |
| Bar muscle-up | Full turnover | Jumping MU or C2B | Pull-up |
| Ring muscle-up | Full support | Transition drill + dip | Pull-up + dip |

### Pushing
| Movement | Rx | Scaled | Beginner |
|----------|----|----|----------|
| Push-up | Chest to floor | Knee push-up | Incline |
| Ring dip | Deep dip | Box dip or banded | Push-up |
| HSPU (strict) | Head touches | Pike on box | DB press |
| HSPU (kipping) | Head touches | Pike on box | DB push press |

### Squatting
| Movement | Rx | Scaled | Beginner |
|----------|----|----|----------|
| Air squat | Below parallel | Box target | Sit-to-stand |
| Front squat | Full depth | Lighter/box | Goblet squat |
| Thruster | Full + lockout | Lighter | DB thruster or wall ball |
| Pistol | Full ROM | To target | Assisted or step-down |

### Hinging
| Movement | Rx | Scaled | Beginner |
|----------|----|----|----------|
| Deadlift | From floor | Lighter or elevated | KB deadlift |
| KB swing | American | Russian (eye level) | KB deadlift |
| RDL | Mid-shin | Shorter ROM | KB RDL |

### Olympic Lifts
| Movement | Rx | Scaled | Beginner |
|----------|----|----|----------|
| Power clean | From floor | Hang power clean | DB clean |
| Squat clean | Full clean | Power clean | DB clean + FS |
| Power snatch | One motion | Hang snatch | DB snatch |
| DB snatch | Ground to overhead | Hang DB snatch | KB swing |

### Monostructural
| Movement | Rx | Scaled | Beginner |
|----------|----|----|----------|
| Double unders | 2 passes/jump | Singles or drills | Singles only |
| Box jump | 24/20 in | Lower box | Step-ups |
| Run | Prescribed | Reduce to match time | Bike/row |

---

## 4. Movement Interference Matrix

### DOMS Timeline Reference

#### Green Movements (Low Interference)
| Movement | DOMS Peak | Quality Run Normal | Fatigue Score |
|----------|-----------|-------------------|---------------|
| bike_erg | 8-24h | 6-12h | 1 |
| ski_erg | 8-24h | 6-12h | 1 |
| assault_bike | 8-24h | 8-16h | 2 |
| row_erg | 12-24h | 12-24h | 2 |
| sled_push | 12-24h | 12-24h | 2 |
| sled_pull | 12-24h | 12-24h | 2 |
| farmer_carry | 12-24h | 12-24h | 2 |
| sandbag_carry | 12-24h | 12-24h | 3 |

#### Yellow Movements (Moderate Interference)
| Movement | DOMS Peak | Quality Run Normal | Fatigue Score |
|----------|-----------|-------------------|---------------|
| hip_thrust | 24-36h | 24-48h | 4 |
| hang_power_clean | 24-36h | 24-48h | 4 |
| tibialis_raise | 24-48h | 24-48h | 4 |
| goblet_squat | 24-36h | 24-36h | 5 |
| kettlebell_swing | 24-48h | 24-48h | 5 |
| power_clean | 24-36h | 24-48h | 5 |
| power_snatch | 24-36h | 24-48h | 5 |
| deadlift | 24-48h | 24-48h | 5 |
| front_squat | 24-48h | 24-48h | 5 |
| back_squat | 24-48h | 24-48h | 6 |
| calf_raise_heavy | 24-48h | 48-72h | 6 |
| box_jump_low_rep | 24-48h | 48-72h | 7 |
| double_unders | 24-48h | 48-72h | 7 |

#### Red Movements (High Interference - Avoid BUILD/PEAK)
| Movement | DOMS Peak | Quality Run Normal | Fatigue Score |
|----------|-----------|-------------------|---------------|
| box_step_up | 36-72h | 60-96h | 7 |
| good_morning | 36-60h | 48-72h | 7 |
| air_squat_high_rep | 24-48h | 48-72h | 7 |
| burpee_high_rep | 24-48h | 48-96h | 8 |
| single_leg_rdl | 36-72h | 72-120h | 8 |
| romanian_deadlift | 36-60h | 60-96h | 8 |
| bulgarian_split_squat | 36-72h | 96-144h | 8 |
| reverse_lunge | 36-72h | 72-120h | 8 |
| pistol_squat | 36-72h | 72-120h | 8 |
| bounds | 36-72h | 72-120h | 9 |
| box_jump_high_rep | 36-72h | 72-120h | 9 |
| nordic_curl | 48-72h | 96-144h | 9 |
| walking_lunge | 36-72h | 96-144h | 9 |
| wall_ball | 36-72h | 72-120h | 9 |
| thruster | 36-72h | 72-120h | 9 |
| jump_lunge | 48-72h | 96-144h | 10 |
| depth_jump | 36-72h | 96-144h | 10 |

### Session-Level CNS Fatigue
| Session Type | CNS (1-10) | Damage (1-10) | Run Penalty |
|--------------|------------|---------------|-------------|
| heavy_singles_doubles | 8 | 3 | 18-36h |
| heavy_triples_fives | 7 | 5 | 24-48h |
| high_volume_10rm | 5 | 6 | 24-48h |
| unilateral_strength | 6 | 8 | 48-96h |
| plyo_low_contacts | 7 | 5 | 24-48h |
| plyo_high_contacts | 8 | 8 | 48-96h |
| alactic_sprints | 6 | 1 | 12-24h |
| threshold_machine | 5 | 2 | 12-24h |
| glycolytic_leg_metcon | 6 | 7 | 48-96h |
| aerobic_mixed_z2 | 3 | 1 | 0-12h |

---

## 5. Hard Scheduling Rules

### Protect Long Run (Hours Before)
```yaml
do_not_schedule_within_72h:
  - depth_jump
  - jump_lunge
  - box_jump_high_rep
  - walking_lunge
  - bulgarian_split_squat
  - nordic_curl
  - wall_ball
  - thruster (unless microdosed)

do_not_schedule_within_48h:
  - romanian_deadlift
  - single_leg_rdl
  - box_step_up
  - burpee_high_rep
  - double_unders (calf/Achilles)

do_not_schedule_within_24h:
  - heavy back_squat
  - heavy front_squat
  - heavy deadlift
```

### Protect Intervals/Tempo
- **48h rule:** No movement with leg_fatigue >= 8
- **24h rule:** No movement with leg_fatigue 6-7

### Same-Day Doubles
- If run is quality: **run first, strength second**
- Minimum 6h separation preferred
- If <6h separation: only green movements or microdose strength

### Dose Multipliers
```yaml
dose_multipliers:
  microdose: 0.50  # Ex: depth jumps 3x4 with full rest
  normal: 1.00
  high: 1.30       # Ex: high-rep box jumps for-time

exposure_multipliers:
  last_exposure <= 7 days: 0.85   # Repeated bout protection
  last_exposure 8-21 days: 1.00
  last_exposure > 21 days: 1.20   # DOMS risk increased
```

---

## 6. Time Domain Distribution

### CrossFit Default
| Time Domain | Percentage |
|-------------|------------|
| 5-10 min | 20-35% |
| 10-20 min | 50-65% |
| 20-40 min | 10-20% |

### Hybrid Runner Distribution (Long Game)
| Time Domain | Percentage |
|-------------|------------|
| 5-10 min | 10-20% |
| 10-20 min | 45-60% |
| 20-40 min | 25-40% |

*Runs provide oxidative volume; WODs bias toward controlled machine work.*

---

## 7. WOD Selection Algorithm

### Required Inputs
```yaml
phase: [BASE, BUILD, PEAK, TAPER]
days_from_long_run: int
days_from_quality_run: int
equipment_set: list
weekly_run_intensity_load: int
wod_count_this_week_by_type: dict
last_7d_movement_exposure: dict
```

### Phase Filters (Hard Rules)
```yaml
BASE:
  - allow all categories
  - cap glycolytic frequency
  
BUILD:
  - disallow WOD_GLYCOLYTIC_METCON
  - limit WOD_THRESHOLD_MACHINE to 1/week
  
PEAK:
  - only WOD_STRENGTH_LOW_VOL and WOD_ALACTIC_POWER
  - conditioning is flush only
  
TAPER:
  - only taper-safe neural sessions
  - zero DOMS risk
```

### Scoring Function
```python
def score_wod(wod, athlete, plan_state):
    score = 100
    
    # Interference penalties
    score -= 10 * wod.lower_eccentric_rating
    score -= 10 * wod.impact_rating
    score -= 8 * wod.glycolytic_rating
    
    # Variety bonus
    if wod.primary_patterns not in last_72h_patterns:
        score += 5
    
    # Phase bonus
    if is_phase_appropriate(wod, phase):
        score += 10
        
    return score

selected_wod = argmax(score_wod(c) for c in candidates)
```

---

## 8. Weekly WOD by Phase

| Phase | WODs/Week | Types Allowed | Notes |
|-------|-----------|---------------|-------|
| BASE | 2 | Mostly aerobic mixed modal, 0-1 threshold | Optional glycolytic every 10-14d |
| BUILD | 2 | Aerobic or alactic, threshold max 1/week | No glycolytic |
| PEAK | 1 max | Strength low-vol or neural alactic | Conditioning is flush only |
| TAPER | 0-1 | Only if no soreness risk | Movement quality only |

---

## 9. Runner-Friendly WOD Library (24 WODs)

### Design Constraints
- Low impact, low eccentric, minimal quad burn
- Upper-body and carry bias encouraged
- Threshold work is machine-based
- Anything "leg spicy" labeled Yellow/BASE-only

---

### WOD_01: Sled-Ski Aerobic Intervals (24 min)
**Type:** AEROBIC_MIXED_MODAL | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | 6 rounds: Sled push 20-30m heavy, Ski 250m @RPE 6, Farmer carry 40m, Rest 60s |
| **Scaled** | 6 rounds: 20m sled, 200m ski, 30m carry, 75s rest |
| **Beginner** | 6 rounds: 15m sled or 30s incline walk, 150m ski or 8 cal bike, 20m carry, 90s rest |

---

### WOD_02: Zone 2 Mixed-Modal AMRAP (30 min)
**Type:** AEROBIC_MIXED_MODAL | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | AMRAP 30: Bike 12 cal, Ring row 12, Push-up 12, Suitcase carry 50m |
| **Scaled** | AMRAP 30: 10 cal, 10 reps, 40m carry |
| **Beginner** | AMRAP 20-25: 8 cal, 8-10 reps, 30m carry |

---

### WOD_03: Bike Threshold + Upper (3 sets)
**Type:** THRESHOLD_MACHINE | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | 3 sets: Bike 8:00 @RPE 7-8, Rest 2:00, Strict pull-up 6-10, DB press 8-12 |
| **Scaled** | 3 sets: 6:00 bike, banded pull-up 6-10, lighter press |
| **Beginner** | 3 sets: 5:00 bike @RPE 6-7, Ring row 10, Seated DB press 10 |

---

### WOD_04: EMOM 30 Low-Impact Engine
**Type:** AEROBIC_MIXED_MODAL | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | EMOM 30 (10 cycles): Min 1 Row 12 cal, Min 2 KB swing 12, Min 3 Plank 45s |
| **Scaled** | 10 cal, 10 swings, 40s plank |
| **Beginner** | 200m row, KB deadlift 10, 30s plank |

---

### WOD_05: Alactic Bike Sprints (20 min)
**Type:** ALACTIC_POWER | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | 10 rounds: 12s all-out, 1:48 easy |
| **Scaled** | 10 rounds: 10s hard, 1:50 easy |
| **Beginner** | 8 rounds: 8s hard, 1:52 easy |

*Rule: Stop if power drops noticeably*

---

### WOD_06: Row VO2 Repeats (24 min)
**Type:** THRESHOLD_MACHINE | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | 6 rounds: Row 2:00 hard @RPE 9, Rest 2:00 easy |
| **Scaled** | 6 rounds: 1:30 hard, 2:00 easy |
| **Beginner** | 6 rounds: 1:00 strong, 2:00 easy |

---

### WOD_07: Carry Density Builder (25 min)
**Type:** AEROBIC_MIXED_MODAL | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | Every 5:00 x5: Farmer carry 200m (break as needed) |
| **Scaled** | 150m carry |
| **Beginner** | 100m or 1:30 carry |

*Notes: Posture perfect, no racing*

---

### WOD_08: Strength Maintenance + Flush (45 min)
**Type:** STRENGTH_LOW_VOL | **Fatigue:** Yellow

| Tier | Prescription |
|------|--------------|
| **Rx** | Trap bar DL 4x3 @RPE 7-8, DB bench 3x6, Bike flush 10:00 |
| **Scaled** | DL 3x3 @RPE 6-7, DB bench 3x6, Bike 8:00 |
| **Beginner** | KB DL 3x5, Incline DB press 3x8, Bike 6:00 |

---

### WOD_09: Upper Metcon + Easy Engine (18 min)
**Type:** AEROBIC_MIXED_MODAL | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | AMRAP 18: Ski 10 cal, Strict pull-up 6-10, HRPU 10-15, Hollow 20-30s |
| **Scaled** | 8 cal, banded pull-up 6-10, HRPU 8-12, 15-20s hollow |
| **Beginner** | 6 cal bike, Ring row 8-10, Incline push-up 8-10, Dead bug 20 reps |

---

### WOD_10: Sled Push Controlled Hard (18 min)
**Type:** THRESHOLD_MACHINE | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | 6 rounds: Sled push 45s hard, Rest 75s |
| **Scaled** | 6 rounds: 40s hard, 80s rest |
| **Beginner** | 6 rounds: 30s moderate, 90s rest |

---

### WOD_11: Step-Up Aerobic Strength (20 min) ⚠️ Yellow
**Type:** AEROBIC_MIXED_MODAL | **Fatigue:** Yellow | **Phase:** BASE only

| Tier | Prescription |
|------|--------------|
| **Rx** | E2MOM x10: Step-up 8/leg moderate DBs, Bike 10 cal |
| **Scaled** | 6-8/leg light, 8 cal |
| **Beginner** | 6/leg BW low box, 6 cal |

---

### WOD_12: Primer Neural + Breathing (25 min) ✓ Taper-safe
**Type:** STRENGTH_LOW_VOL | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | Front squat 5x2 @RPE 6-7, Strict pull-up 4x4, Row 6:00 @RPE 4 |
| **Scaled** | Goblet squat 5x3, Banded pull-up 4x4, Row 6:00 easy |
| **Beginner** | Box squat 4x3, Ring row 4x8, Bike 6:00 easy |

---

### WOD_13: Zone 2 Carry Chipper (30-35 min)
**Type:** AEROBIC_MIXED_MODAL | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | For time @RPE 5-6: 1000m ski, 400m farmer carry, 1000m row, 400m suitcase carry, 1000m bike |
| **Scaled** | 800m each machine, 300m carries |
| **Beginner** | Cap 30: 600m each machine, 200m carries |

---

### WOD_14: Upper Engine EMOM 24
**Type:** AEROBIC_MIXED_MODAL | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | EMOM 24 (8 cycles): Min 1 Row 10 cal, Min 2 Strict press 8, Min 3 Ring row 12 |
| **Scaled** | 8 cal, DB press 8 lighter, Ring row 10 |
| **Beginner** | 6 cal bike, Seated DB press 10, Supported row 10 |

---

### WOD_15: Aerobic "Cruise Intervals" (30 min)
**Type:** AEROBIC_MIXED_MODAL | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | 5 rounds: Bike 4:00 @RPE 6, 1:00 easy, 10 push-ups + 10 ring rows |
| **Scaled** | 3:30 bike, 8+8 reps |
| **Beginner** | 3:00 bike, incline push-up 8 + ring row 8 |

---

### WOD_16: Sandbag Trek Intervals (24-36 min)
**Type:** AEROBIC_MIXED_MODAL | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | 6 rounds: 2:00 sandbag carry (bear hug/shoulder), 2:00 easy row/bike |
| **Scaled** | Lighter sandbag, same intervals |
| **Beginner** | Light carry 1:30, 2:30 easy bike |

---

### WOD_17: Bike Threshold 5x3 (25 min)
**Type:** THRESHOLD_MACHINE | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | 5 rounds: Bike 3:00 @RPE 8, 2:00 easy |
| **Scaled** | 2:30 @RPE 8, 2:00 easy |
| **Beginner** | 2:00 @RPE 7-8, 2:30 easy |

---

### WOD_18: Row Threshold + Trunk (24 min)
**Type:** THRESHOLD_MACHINE | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | 4 sets: Row 4:00 @RPE 8, Rest 2:00, Side plank 30s/side |
| **Scaled** | 3:00 hard, 25s/side |
| **Beginner** | 2:00 strong, 20s/side |

---

### WOD_19: Ski Erg "Lactate Lite" (18-24 min)
**Type:** THRESHOLD_MACHINE | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | 3 sets: Ski 6:00 @RPE 7-8, Rest 2:00 |
| **Scaled** | 5:00 @RPE 7-8, 2:00 rest |
| **Beginner** | 4:00 @RPE 7, 2:30 rest |

---

### WOD_20: Sled Push Threshold Ladder (20 min)
**Type:** THRESHOLD_MACHINE | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | 10-8-6-4-2 rounds: 20m sled push hard, Rest 1:00 |
| **Scaled** | 15m moderate-hard, Rest 1:00 |
| **Beginner** | 10-15m light, Rest 1:15 |

---

### WOD_21: Alactic Sled Sprints (18-24 min)
**Type:** ALACTIC_POWER | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | 12 rounds: 10s sled sprint, 1:20 recovery |
| **Scaled** | 10 rounds same |
| **Beginner** | 8 rounds: 8s sprint, 1:30 rest |

---

### WOD_22: Row Sprint Microbursts (20 min)
**Type:** ALACTIC_POWER | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | 10 rounds: 15s all-out row, 1:45 easy |
| **Scaled** | 12s sprint, 1:48 easy |
| **Beginner** | 10s sprint, 1:50 easy |

---

### WOD_23: Strength Low-Vol Upper + Posterior (40-55 min)
**Type:** STRENGTH_LOW_VOL | **Fatigue:** Yellow

| Tier | Prescription |
|------|--------------|
| **Rx** | Bench 5x3 @RPE 7-8, RDL 3x5 @RPE 7, Flush 8:00 bike |
| **Scaled** | Bench 4x3 lighter, RDL 3x5 @RPE 6-7, Flush 6:00 |
| **Beginner** | DB bench 3x8, KB RDL 3x8, Flush walk/bike 6:00 |

---

### WOD_24: "Linchpin-ish" Simple Triplet (12-20 min)
**Type:** AEROBIC_MIXED_MODAL | **Fatigue:** Green

| Tier | Prescription |
|------|--------------|
| **Rx** | AMRAP 15: Row 10 cal, Push press 8 @95/65, Ring rows 12 |
| **Scaled** | AMRAP 15: 8 cal, Push press 8 @65/45 or DBs, Ring rows 10 |
| **Beginner** | AMRAP 12: Bike 6 cal, DB push press 8 light, Ring rows 8-10 |

---

## 10. Rx/Scaled/Beginner Gate Rules

### Minimum Viable Skill Gates
```yaml
skill_gates:
  - strict_pullups_5: bool
  - pushups_10: bool
  - squat_below_parallel: bool
  - hinge_neutral_spine: bool
  - double_unders: bool
  - overhead_press_safe: bool

tier_selection:
  if any_required_gate_fails:
    use Scaled or Beginner ladder for that movement
```

---

*Sources: CompTrain, HWPO, Mayhem, Linchpin, Functional Bodybuilding, CrossFit Programming Guidance, DOMS/Neuromuscular Fatigue Research*
