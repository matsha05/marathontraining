# Garmin API Integration Guide

> Complete guide for integrating Garmin Connect data into The Long Game

## Overview

Garmin provides the **Garmin Connect Developer Program (GCDP)** for third-party integrations. This is a **cloud-to-cloud** integration—you need a backend server.

---

## Integration Architecture

```
[Garmin Watch] → [Garmin Connect App] → [Garmin Cloud] → [Our Backend] → [App]
```

Key principle: We don't talk to watches directly. We sync with Garmin's cloud.

---

## Available APIs

| API | Data | Use Case |
|-----|------|----------|
| **Activity API** | FIT files, pace, distance, HR, power, laps | Workout completion verification, actual pace vs prescribed |
| **Health API** | All-day HR, sleep, stress, Body Battery, HRV, steps | Readiness scoring, recovery tracking |
| **Training API** | Push workouts to Garmin calendar | Send today's workout to watch |
| **Courses API** | Publish GPS routes | Long run courses |

### What We Want

1. **Health API** → Calculate readiness scores from sleep, HRV, stress
2. **Activity API** → Verify workout completion, compare actual vs target paces
3. **Training API** → Push workouts to athlete's Garmin (future)

---

## Authentication: OAuth 2.0 PKCE

Garmin uses **OAuth 2.0 with PKCE** (Proof Key for Code Exchange).

### Flow
1. User clicks "Connect Garmin" in our app
2. Redirect to Garmin login page
3. User grants permissions
4. Garmin redirects back with auth code
5. **Backend** exchanges code for tokens (CORS not supported)
6. Store refresh token securely
7. Use access token for API calls

### Key Points
- Token exchange **MUST** happen server-side
- Refresh tokens proactively (before expiry)
- New refresh token issued on each access token refresh
- Get stable `userId` from: `https://apis.garmin.com/wellness-api/rest/user/id`

---

## Data Ingestion

### Push vs Pull

**Recommended: Push webhooks**
- Garmin sends data to our endpoint when athlete syncs
- No polling needed
- Real-time updates

**Fallback: Ping/Pull**
- Garmin pings us that data is available
- We pull the data within time window

### FIT File Processing

Activity data comes as `.FIT` files (binary format).

```typescript
// Use official SDK
import { Decoder, Stream } from '@garmin/fitsdk';

async function parseFitFile(buffer: ArrayBuffer) {
  const stream = Stream.fromArrayBuffer(buffer);
  const decoder = new Decoder(stream);
  
  if (!decoder.isFIT()) throw new Error('Not a FIT file');
  if (!decoder.checkIntegrity()) throw new Error('FIT file corrupted');
  
  const { messages } = decoder.read();
  
  // Extract laps
  const laps = messages.lapMesgs || [];
  
  // Extract records (second-by-second data)
  const records = messages.recordMesgs || [];
  
  return { laps, records };
}
```

### Extracting Metrics

| Metric | Source |
|--------|--------|
| Pace | Calculate from `distance`/`time` deltas in `record` messages |
| Splits | `lap` messages |
| Heart Rate | `record.heartRate` |
| Cadence | `record.cadence` |
| Elevation | `record.altitude` |

---

## Data Mapping

### Health Data → Readiness Score

```typescript
interface GarminHealthData {
  sleepDuration: number;      // seconds
  sleepScore: number;         // 0-100
  hrvStatus: number;          // 0-3 (poor to excellent)
  bodyBattery: number;        // 0-100
  stressAvg: number;          // 0-100
}

function calculateReadiness(data: GarminHealthData): number {
  const sleepWeight = 0.35;
  const hrvWeight = 0.25;
  const batteryWeight = 0.25;
  const stressWeight = 0.15;
  
  const sleepScore = data.sleepScore;
  const hrvScore = (data.hrvStatus / 3) * 100;
  const batteryScore = data.bodyBattery;
  const stressScore = 100 - data.stressAvg; // Invert stress
  
  return Math.round(
    sleepScore * sleepWeight +
    hrvScore * hrvWeight +
    batteryScore * batteryWeight +
    stressScore * stressWeight
  );
}
```

### Activity Data → Workout Verification

```typescript
interface WorkoutMatch {
  completed: boolean;
  distanceActual: number;
  distanceTarget: number;
  paceActual: number;       // s/mile
  paceTarget: number;       // s/mile
  paceVariance: number;     // percentage
}

function verifyWorkout(fit: FitData, prescription: WorkoutPrescription): WorkoutMatch {
  // Compare actual laps against prescribed intervals
  // Calculate pace accuracy
  // Determine completion (>80% distance = completed)
}
```

---

## Implementation Plan

### Phase 1: OAuth Setup
- [ ] Create GCDP developer account
- [ ] Register app, get client credentials
- [ ] Build OAuth callback endpoint
- [ ] Token storage in Supabase

### Phase 2: Health API
- [ ] Webhook receiver for health data
- [ ] Readiness score calculator
- [ ] Display on dashboard

### Phase 3: Activity API  
- [ ] Webhook receiver for activities
- [ ] FIT file parser
- [ ] Workout matching logic
- [ ] Auto-log completed workouts

### Phase 4: Training API (Future)
- [ ] Push daily workouts to Garmin
- [ ] Structured workout format

---

## Fallback Options

If GCDP access is slow/restricted:

1. **Strava API** - Easier approval, less health data
2. **Manual FIT Upload** - Drag & drop `.FIT` files
3. **Manual Logging** - Just "did you complete it?" buttons

---

## GCDP Application

Apply at: https://developer.garmin.com/gc-developer-program/

Required:
- Company/app description
- Privacy policy
- Data usage explanation
- Which APIs you need

Approval typically takes 2-4 weeks.

---

## Dependencies

```bash
npm install @garmin/fitsdk
```

---

## References

- [Garmin Connect Developer Program](https://developer.garmin.com/gc-developer-program/)
- [Activity API Docs](https://developer.garmin.com/gc-developer-program/activity-api/)
- [Health API Docs](https://developer.garmin.com/gc-developer-program/health-api/)
- [FIT SDK](https://developer.garmin.com/fit/overview/)
