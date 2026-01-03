# Garmin Connect Integration: Problem Set for Senior Engineer

## Context

**App:** The Long Game - A marathon training app that generates daily plans (running + strength + mobility) based on VDOT paces and adapts to athlete recovery.

**Device:** Garmin Forerunner 965

**Goal:** Pull health and activity data from Garmin to:
1. Calculate a daily "readiness score" (sleep, HRV, stress, Body Battery)
2. Auto-log completed workouts with actual paces vs. prescribed
3. Eventually: push structured workouts to the Garmin calendar

**Stack:** Next.js 16, TypeScript, Supabase (backend), deployed on Vercel

---

## Proposed Solution (Short)

- Official GCDP integration with OAuth 2.0 PKCE (server-side token exchange only)
- Ingestion via Garmin push/ping webhooks into Next.js API routes, stored in Supabase
- Fallback path if GCDP access is blocked: manual FIT upload, Garmin Connect export importer, and Strava sync
- Parse FIT with `@garmin/fitsdk`, compute readiness + workout matching in-app

---

## What We Need From Garmin

### Health Data (Daily)
| Metric | Use Case |
|--------|----------|
| Sleep duration & score | Recovery assessment |
| HRV status | Training readiness |
| Resting heart rate | Fatigue monitoring |
| Body Battery | Energy availability |
| Stress average | Mental load factor |

### Activity Data (Per Workout)
| Metric | Use Case |
|--------|----------|
| Distance, duration | Completion verification |
| Pace (avg, splits) | Compare actual vs. prescribed |
| Heart rate zones | Intensity validation |
| GPS track | Route visualization (optional) |
| Cadence | Form analysis (optional) |

---

## Technical Questions

### 1. API Access Path

**Primary:** Garmin Connect Developer Program (GCDP)
- Requires application approval
- OAuth 2.0 with PKCE
- Cloud-to-cloud (needs backend)

**Questions:**
- What's the realistic approval timeline for a new app?
- Are there alternative paths (Strava sync, manual FIT upload) we should build as fallback?
- Does Garmin rate-limit or throttle new developer accounts?

**Answer:**
- Approval is typically 2–4 weeks (can be longer for non-enterprise apps).
- Build fallback paths: manual FIT upload, Garmin Connect export importer, Strava sync; HealthKit/Health Connect bridge if we ship a mobile companion.
- Yes, Garmin throttles evaluation accounts; avoid polling and prefer push/ping.

### 2. Authentication Flow

```
User clicks "Connect Garmin"
  → Redirect to Garmin OAuth consent
  → User grants permissions
  → Garmin redirects with auth code
  → OUR BACKEND exchanges code for tokens
  → Store refresh token in Supabase
  → Use access token for API calls
```

**Questions:**
- Garmin doesn't support CORS—confirm this means all token exchange MUST be server-side?
- What's the refresh token lifecycle? Does it rotate on every access token refresh?
- Where should we store tokens securely in Supabase? (RLS-protected table?)

**Answer:**
- Yes. Garmin does not support CORS preflight; token exchange must be server-side.
- Refresh tokens rotate on each refresh; store the new refresh token every time and refresh before expiry (Garmin recommends >=600s buffer).
- Store in a `garmin_tokens` table with RLS locked to service role; optionally encrypt tokens at rest.

### 3. Data Ingestion

**Options:**
1. **Push (webhooks):** Garmin sends data to our endpoint when athlete syncs
2. **Ping/Pull:** Garmin notifies, we fetch within a window
3. **Polling:** We query periodically (not recommended)

**Questions:**
- Which is preferred for real-time readiness scores?
- What's the typical delay between watch sync and data availability?
- For activity data, do we get the raw FIT file or pre-parsed JSON?

**Answer:**
- Prefer Push or Ping/Pull. Push if Garmin can deliver the payload/file; Ping/Pull if it only notifies.
- Typical delay is minutes after sync; design UI around “last Garmin sync” and allow manual refresh.
- Activity data is delivered as FIT/TCX/GPX (often via download URL). FIT is the richest source.

### 4. FIT File Parsing

Garmin activities come as `.FIT` files (binary format).

```typescript
// Assumed approach
import { Decoder, Stream } from '@garmin/fitsdk';

const { messages } = decoder.read();
const laps = messages.lapMesgs; // Split times
const records = messages.recordMesgs; // Second-by-second data
```

**Questions:**
- Is `@garmin/fitsdk` the canonical SDK, or is there a better library?
- What's the typical file size for a marathon (~4 hours of GPS data)?
- Are there edge cases (indoor runs, treadmill, paused workouts)?

**Answer:**
- `@garmin/fitsdk` is the official SDK and the safest long-term choice.
- Typical marathon FIT size is ~1–6 MB (higher if 1-second recording + extra sensors).
- Edge cases: treadmill/indoor (no GPS), paused time vs timer time, missing HR, auto-laps, and power/cadence-only sessions.

### 5. Readiness Score Algorithm

**Proposed formula:**
```typescript
function calculateReadiness(data: GarminHealthData): number {
  const weights = {
    sleep: 0.35,
    hrv: 0.25,
    bodyBattery: 0.25,
    stress: 0.15, // inverted
  };
  
  return (
    data.sleepScore * weights.sleep +
    (data.hrvStatus / 3) * 100 * weights.hrv +
    data.bodyBattery * weights.bodyBattery +
    (100 - data.stressAvg) * weights.stress
  );
}
```

**Questions:**
- Are these the right inputs? What does the Forerunner 965 specifically expose?
- Should we factor in training load (acute vs. chronic)?
- Is there research on optimal weighting for recovery prediction?

**Answer:**
- Yes. Forerunner 965 exposes Sleep Score, HRV Status, Body Battery, Stress, and Resting HR via Health API.
- Training load is useful but can be phase 2; v1 readiness uses the four signals above with reweighted scoring if any are missing.
- There is no single optimal weighting; start with the proposed weights and recalibrate with outcome data.

### 6. Workout Matching

We prescribe: "6 mi @ 7:12/mi tempo"
Garmin records: "5.8 mi in 42:30 (7:19/mi avg)"

**Questions:**
- How do we match a Garmin activity to a prescribed workout?
- Time window? Distance tolerance? Activity type matching?
- What if they run the same route but as an "easy run" vs "tempo"?

**Answer:**
- Match by time window (±36 hours), activity type (run vs non-run), and distance tolerance (±15–20%).
- If pace zones are available (from VDOT), compare average pace vs target zone to disambiguate.
- If multiple plausible matches exist, leave it unlinked or require a user confirmation.

---

## Architecture Proposal

```
┌─────────────────┐     ┌───────────────────┐     ┌──────────────┐
│  Garmin Watch   │────▶│  Garmin Connect   │────▶│  Garmin API  │
│  (Forerunner 965)│     │  (Cloud)          │     │  (GCDP)      │
└─────────────────┘     └───────────────────┘     └──────┬───────┘
                                                         │
                                                         ▼ Webhook
                                               ┌──────────────────┐
                                               │  Our Backend     │
                                               │  (Next.js API    │
                                               │   routes)        │
                                               └────────┬─────────┘
                                                        │
                                               ┌────────▼─────────┐
                                               │  Supabase DB     │
                                               │  - garmin_health │
                                               │    _metrics      │
                                               │  - garmin_acts   │
                                               │    _ivities      │
                                               │  - garmin_tokens │
                                               └────────┬─────────┘
                                                        │
                                               ┌────────▼─────────┐
                                               │  Next.js App     │
                                               │  - Dashboard     │
                                               │  - Readiness     │
                                               │  - Workout Log   │
                                               └──────────────────┘
```

---

## Implementation Notes (This Repo)

**API routes**
- `GET /api/garmin/connect` (start OAuth PKCE)
- `GET /api/garmin/callback` (token exchange + store)
- `GET /api/garmin/status` (connection status)
- `POST /api/garmin/disconnect`
- `POST /api/garmin/webhook` (push/ping receiver)
- `POST /api/garmin/upload` (manual FIT upload fallback)
- `POST /api/garmin/process` (process queued webhook events)
- `POST /api/garmin/import` (Garmin Connect export ZIP import)
- `GET /api/strava/connect` (start Strava OAuth)
- `GET /api/strava/callback` (Strava token exchange)
- `GET /api/strava/status` (Strava connection status)
- `POST /api/strava/disconnect`
- `GET|POST /api/strava/webhook` (Strava webhook receiver)
- `POST /api/strava/process` (process queued Strava events)
- `POST /api/strava/sync` (manual Strava backfill; pulls recent activities)

**Supabase tables**
- `garmin_oauth_states`, `garmin_tokens`, `garmin_webhook_events`
- `garmin_health_metrics`, `garmin_activities`

**Security notes**
- Do not accept `athleteId` from clients; derive it from the authenticated session.
- Webhook verification must fail closed in production.
- FIT download URLs must be allowlisted to avoid SSRF.

**Processing notes**
- Webhook ingestion writes events fast; `/api/garmin/process` should be triggered on a cron (e.g. every 1–5 minutes).
- Set `GARMIN_WEBHOOK_PROCESSING_MODE=inline` only for local/dev or one-off testing.
- Manual FIT uploads are deduped via a SHA-256 hash stored as the activity ID.
- Strava webhook ingestion writes events fast; `/api/strava/process` should be triggered on a cron (e.g. every 1–5 minutes).
- Strava webhook subscriptions must be created in the Strava developer console with `STRAVA_WEBHOOK_VERIFY_TOKEN`.

**Required env**
- `GARMIN_CLIENT_ID`, `GARMIN_CLIENT_SECRET`, `GARMIN_REDIRECT_URI`
- `GARMIN_WEBHOOK_SECRET` (optional but recommended)
- `GARMIN_ACTIVITY_DETAIL_URL_TEMPLATE` (optional; used for ping/pull downloads)
- `GARMIN_ALLOWED_DOWNLOAD_HOSTS` (optional; allowlist for FIT download hosts)
- `GARMIN_MAX_FIT_SIZE_BYTES` (optional; defaults to 20 MB)
- `GARMIN_EXPORT_MAX_BYTES` (optional; defaults to 200 MB)
- `GARMIN_WEBHOOK_PROCESSING_MODE` (`queue` or `inline`, default `queue`)
- `GARMIN_PROCESSING_SECRET` (recommended for `/api/garmin/process`)
- `GARMIN_SINGLE_USER_MODE` + `GARMIN_OWNER_ATHLETE_ID` (optional dev-only bypass)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REDIRECT_URI`
- `STRAVA_SCOPE` (optional; defaults to `activity:read_all`)
- `STRAVA_WEBHOOK_VERIFY_TOKEN` (required in prod for Strava webhook verification)
- `STRAVA_WEBHOOK_PROCESSING_MODE` (`queue` or `inline`, default `queue`)
- `STRAVA_PROCESSING_SECRET` (recommended for `/api/strava/process`)

---

## Deliverables Needed

1. **OAuth integration** - User can connect/disconnect Garmin
2. **Webhook receiver** - Next.js API route to receive health/activity pushes
3. **FIT parser** - Extract pace, splits, HR from activity files
4. **Readiness calculator** - Daily score from health metrics
5. **Workout matcher** - Link Garmin activities to prescribed workouts
6. **Fallback** - Manual FIT upload (and optional Strava)
   - Strava covers activities only; Garmin export import backfills health metrics.

---

## Resources

- [Garmin Connect Developer Program](https://developer.garmin.com/gc-developer-program/)
- [Activity API Docs](https://developer.garmin.com/gc-developer-program/activity-api/)
- [Health API Docs](https://developer.garmin.com/gc-developer-program/health-api/)
- [FIT SDK](https://developer.garmin.com/fit/overview/)
- [Our existing research doc](/research/garmin-api-integration.md)
- [Oracle research notes](/research/10-garmin-api-integration.md)

---

## Success Criteria

1. User connects Garmin in < 30 seconds
2. Sleep/HRV/stress data appears on dashboard within 1 hour of sync
3. Completed runs auto-logged with actual pace comparison
4. Readiness score updates each morning before their workout

---

## Open Questions for Discussion

1. Should we build Strava as a parallel integration for users without Garmin?
2. Is there value in pushing workouts TO Garmin (Training API)?
3. How do we handle users who forget to sync for days?
4. Privacy: How long do we retain raw Garmin data?
