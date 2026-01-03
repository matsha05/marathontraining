🧿 oracle 0.7.6 — Your prompt's adult supervision.
Launching browser mode (gpt-5.1-pro) with ~169 tokens.
This run can take up to an hour (usually ~10 minutes).
Answer:
Below is the practical way to think about this integration in 2026:

* **There is no fully open, public “Garmin Connect API” for consumer apps.**
* The **official** route for automatically importing Garmin Connect data is the **Garmin Connect Developer Program** (enterprise, approved business developers), using:

  * **Activity API** (pull detailed activities, including FIT files)
  * **Health API** (pull all-day health metrics like sleep, stress, HR, etc.)
  * Optional: **Training API** (push your planned workouts to the user’s Garmin calendar/devices) ([Garmin Developers][1])

If you can get into that program, your product can be fully automated and reliable. If you cannot, you’ll want one of the “alternative approaches” near the end.

---

## 0) What you actually need for “planned vs actual” with Garmin

For your web app use case, the cleanest “official” architecture is:

1. **Training API**: push planned workouts to Garmin Connect (so the plan is on-device) ([Garmin Developers][2])
2. **Activity API**: import what the user actually did (workout files like `.FIT`) ([Garmin Developers][3])
3. **Health API**: optionally augment with sleep, stress, body battery, etc. to explain outcomes and readiness (not strictly required for planned vs actual, but very useful) ([Garmin Developers][4])

This avoids trying to reverse-engineer Garmin’s “training status” logic. You compare your plan to the executed activity data you receive.

---

## 1) Official Garmin Connect Developer Program: access + OAuth setup

### Getting access (official)

Garmin states the Garmin Connect Developer Program is **for enterprise use** and you must apply; there are **no licensing/maintenance fees for access**, but **some metrics may require a license fee or minimum device order quantity**. ([Garmin Developers][5])

### OAuth 2.0 PKCE flow (official)

Garmin’s Connect Developer Program uses **OAuth 2.0 with PKCE**. 

**Endpoints and parameters (from Garmin’s PKCE spec):**

* **Authorization (GET)**: `https://connect.garmin.com/oauth2Confirm`
  Required query params include:

  * `response_type=code`
  * `client_id=<consumer key>`
  * `code_challenge=<base64url(sha256(code_verifier))>`
  * `code_challenge_method=S256`
    Optional:
  * `redirect_uri=...`
  * `state=...` 

* **Token exchange (POST, x-www-form-urlencoded)**:
  `https://diauth.garmin.com/di-oauth2-service/oauth/token` with:

  * `grant_type=authorization_code`
  * `client_id`
  * `client_secret`
  * `code`
  * `code_verifier`
  * `redirect_uri` (must match if used earlier) 

* **Refresh token (POST)**: same token endpoint, with:

  * `grant_type=refresh_token`
  * `client_id`
  * `client_secret`
  * `refresh_token` 

**Important operational notes from Garmin’s spec:**

* They explicitly note **CORS pre-flight (OPTIONS) is not supported**. In practice: do your token exchange server-side, not from a browser SPA directly. 
* Token response includes `expires_in`, and they recommend subtracting **600 seconds or more** when planning refresh to avoid edge-of-expiry failures. 
* The token response includes a `refresh_token_expires_in` field; refresh tokens expire and you receive a new refresh token when refreshing. 

### Getting the stable Garmin user identifier

After you have an access token:

* **User ID endpoint**: `GET https://apis.garmin.com/wellness-api/rest/user/id` (Bearer token) returns a stable `userId`. 
* **Permissions endpoint**: `GET https://apis.garmin.com/wellness-api/rest/user/permissions` is shown in the spec as an example call using the Bearer token. 

That `userId` is what you should store and use as your join key between Garmin data and your app’s user.

---

## 2) What data you can pull (and what’s tricky)

### Health API (official list of “all-day” metrics)

Garmin’s Health API marketing page lists these “all-day” metrics:

* Steps
* Intensity Minutes
* Sleep
* Calories
* Heart Rate
* Stress
* Pulse Ox
* Body Battery
* Body Composition
* Respiration
* Blood Pressure
* Enhanced Beat‑To‑Beat Interval (this is the closest official wording you’ll see for HRV-adjacent data) ([Garmin Developers][4])

If you want **sleep** and **HRV/HRV-like** signals, this is your likely official path.

### Activity API (officially how you get workout details)

Garmin’s Activity API provides “full activity details access” via downloadable activity files:

* `.FIT`, `.GPX`, `.TCX` ([Garmin Developers][3])

For your needs (pace, distance, HR during workout, splits, zones), **FIT is the best source** because it contains the richest sensor + lap + session data.

### Training Status, VO2max, Recovery Time (the reality)

* Garmin’s public pages for the Connect Developer Program do **not** explicitly promise “training status” or “VO2max” as API fields.
* **Recovery time** and some advanced metrics may appear in certain FIT files, but the exact set of fields depends on device/activity type and what Garmin includes.

So from a product standpoint, design your system like this:

* Treat “Garmin-derived advanced metrics” as **nice-to-have enrichments** when present.
* Make your core “planned vs actual” comparison rely on:

  * time
  * distance
  * pace/speed
  * heart rate time series
  * laps/splits
  * elevation (optional)
  * cadence/power (optional)

Those are consistently available from activity files.

---

## 3) How to get historical workout data (official approach)

### Key concept: Garmin Connect is the source of truth, not the watch

Your web app will not pull “from the Forerunner 965 directly.” The device syncs to **Garmin Connect**, then you pull from Garmin’s cloud.

Garmin states:

* After initial consent, the user syncs their device with Garmin Connect, uploads data, and then it becomes accessible via the API. ([Garmin Developers][3])

### Backfill plus ongoing ingestion

The Activity API page mentions “Developer Web Tools” including “backfill user data.” ([Garmin Developers][3])
Practically, you want two flows:

**A) Initial import (backfill)**

* On first connect, backfill a time range (ex: last 90 days, last 365 days, or user-chosen).
* Store each activity and its FIT file-derived timeseries in your DB.

**B) Ongoing import (incremental)**
Garmin supports:

* **Ping/Pull or Push Architecture** (choose what matches your stack) ([Garmin Developers][3])

Design recommendation:

* Prefer **Push** if Garmin provides the data payload directly.
* Prefer **Ping/Pull** if Garmin sends a lightweight notification and you fetch the actual payload.

Either way, implement a queue so your webhook handler responds fast and processing happens asynchronously.

---

## 4) Node.js / TypeScript implementation details

### 4.1 OAuth 2.0 PKCE in a web app (TypeScript outline)

Here’s a server-side Express style flow that follows Garmin’s spec exactly.

**Utilities (PKCE):**

```ts
import crypto from "node:crypto";

function base64url(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function generateCodeVerifier(): string {
  // 32 bytes => 43+ chars once base64url encoded (meets Garmin’s 43-128 requirement)
  return base64url(crypto.randomBytes(32));
}

export function codeChallengeS256(verifier: string): string {
  const hash = crypto.createHash("sha256").update(verifier).digest();
  return base64url(hash);
}
```

**Route 1: Start auth (redirect to Garmin)**

```ts
import express from "express";

const app = express();

const GARMIN_CLIENT_ID = process.env.GARMIN_CLIENT_ID!;
const GARMIN_REDIRECT_URI = process.env.GARMIN_REDIRECT_URI!; // e.g. https://yourapp.com/auth/garmin/callback

app.get("/auth/garmin", async (req, res) => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = codeChallengeS256(codeVerifier);
  const state = base64url(crypto.randomBytes(32));

  // Store {state, codeVerifier} in your DB/Redis keyed by state (or session).
  await saveOauthState({ state, codeVerifier, createdAt: Date.now() });

  const authUrl = new URL("https://connect.garmin.com/oauth2Confirm");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", GARMIN_CLIENT_ID);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("redirect_uri", GARMIN_REDIRECT_URI);
  authUrl.searchParams.set("state", state);

  res.redirect(authUrl.toString());
});
```

This matches Garmin’s authorization URL and required params. 

**Route 2: Callback (exchange code for tokens)**

```ts
app.get("/auth/garmin/callback", async (req, res) => {
  const code = String(req.query.code || "");
  const state = String(req.query.state || "");

  const record = await loadOauthState(state);
  if (!record) return res.status(400).send("Invalid state");

  const tokenRes = await fetch("https://diauth.garmin.com/di-oauth2-service/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.GARMIN_CLIENT_ID!,
      client_secret: process.env.GARMIN_CLIENT_SECRET!,
      code,
      code_verifier: record.codeVerifier,
      redirect_uri: process.env.GARMIN_REDIRECT_URI!,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    return res.status(500).send(`Token exchange failed: ${errText}`);
  }

  const tokens = await tokenRes.json() as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_token_expires_in?: number;
    token_type: "bearer";
  };

  // Persist tokens encrypted, associated to your app user.
  await saveGarminTokensForUser(req.user.id, tokens);

  // Fetch Garmin API userId (stable)
  const userIdRes = await fetch("https://apis.garmin.com/wellness-api/rest/user/id", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const { userId } = await userIdRes.json();

  await linkGarminUserId(req.user.id, userId);

  res.redirect("/connected");
});
```

This matches Garmin’s token endpoint and user ID endpoint. 

**Refresh tokens (background job)**

* Refresh using `grant_type=refresh_token` at the same token endpoint. 
* Store the **new refresh token each time** (Garmin returns a new one when issuing a new access token). 
* Proactively refresh before expiry (Garmin recommends subtracting 600 seconds). 

### 4.2 Parsing FIT files in Node/TypeScript (official Garmin FIT JS SDK)

Garmin has an **official FIT JavaScript SDK** (`@garmin/fitsdk`) that runs on Node (and compatible browsers). ([GitHub][6])

Minimal example:

```ts
import fs from "node:fs";
import { Decoder, Stream } from "@garmin/fitsdk";

export function parseFit(path: string) {
  const buf = fs.readFileSync(path);
  const stream = Stream.fromBuffer(buf);
  const decoder = new Decoder(stream);

  if (!decoder.isFIT()) throw new Error("Not a FIT file");
  const { messages, errors } = decoder.read();

  if (errors?.length) {
    // Decide if you want to tolerate partial decode
    console.warn(errors);
  }

  const records = messages.record ?? [];
  const laps = messages.lap ?? [];
  const session = (messages.session ?? [])[0];

  return { session, laps, records };
}
```

Garmin’s repo documents `Decoder`, `Stream`, and how decoded messages are returned grouped by type. ([GitHub][6])

### 4.3 Deriving the metrics you asked for from FIT records

Once you have FIT decoded:

**Distance / pace**

* Distance often exists per record and as session totals.
* Pace = inverse speed; if you only have distance, compute pace from deltas.

**Heart rate zones during workout**

* Decide your zone model:

  * Use user-provided zone cutoffs (best UX for correctness).
  * Or compute zones from max HR / LTHR if you collect them.
* For each record, bucket `heartRate` into zones and sum time deltas.

**Splits / intervals**

* Use `lap` messages for splits.
* If you push structured workouts via Training API, you can match intervals more intelligently because you know the planned steps. ([Garmin Developers][2])

---

## 5) Rate limits and refresh frequencies

### Throttling and “don’t poll”

Garmin explicitly references a **throttled evaluation environment** for testing (Activity API and Training API pages mention testing against production with throttled access). ([Garmin Developers][3])

Also, Garmin forum staff clarified that “Too many request” errors can occur when you exceed rate limits in an evaluation-level GCDP app and you are not processing **PUSH or PING notifications**, and that if a user hasn’t synced for days Garmin would push data so “there is not need to call Garmin endpoints.” ([Garmin Forums][7])

**Product/engineering implication:**
Design your integration so your servers do almost no work unless:

* Garmin sends a push/ping event, or
* the user explicitly requests a refresh (and even then, queue it and rate limit it).

### Data freshness

Garmin describes the availability model as:

* user grants consent
* user syncs device to Garmin Connect
* data is uploaded and becomes accessible via the API ([Garmin Developers][3])

So your UI should:

* Show “last imported at” and “last Garmin sync seen”
* Explain that the user must sync their watch in Garmin Connect for new data to arrive

---

## 6) Third-party libraries / SDKs for Node.js and TypeScript

### Official and safe building blocks

* **Garmin FIT JavaScript SDK** (`@garmin/fitsdk`) to decode FIT data. ([GitHub][6])
* Standard OAuth + HTTP tooling in Node:

  * `undici`/`fetch`, `openid-client`, `simple-oauth2`, etc. (generic)

### Unofficial Garmin Connect “API” wrappers (use with caution)

These typically automate logging into Garmin Connect with a username/password and call private endpoints. They can break anytime and may violate Garmin terms.

Examples:

* `fabulator/garmin-api-handler` (TypeScript) calls it an “unofficial handler” and shows downloading FIT files after logging in. ([GitHub][8])
* `Pythe1337N/garmin-connect` requires a config file containing Garmin username/password. ([GitHub][9])
* `Uninen/garmin-connect-to-json` explicitly notes Garmin doesn’t offer a public API to normal users and warns logins are rate limited and can cause temporary IP blocks. ([GitHub][10])

If you go this route anyway, treat it as a temporary bridge, not your core product foundation.

---

## 7) Alternatives if the official API is restricted

### A) Garmin Health SDKs (real-time streaming, but requires mobile + enterprise)

Garmin offers Health SDKs for enterprise partners:

* Companion SDK: real-time sensor streams (HR, stress, accelerometer, enhanced beat-to-beat intervals, etc.)
* Standard SDK: fully custom single-app experience without Garmin server integration
  Commercial use may require license fees or minimum device quantities. ([Garmin Developers][11])

This is great if you are willing to build an iOS/Android companion app, but it’s not “web-only.”

### B) Strava as the connector (most common non-Garmin-official approach)

User flow:

1. User links Garmin Connect to Strava (in Strava settings)
2. User connects your app to Strava (OAuth)
3. You ingest activities via Strava API + webhook

Pros:

* Stable, well-documented OAuth + APIs
* Activities, pace, distance, HR streams available for many activities

Cons:

* You may lose Garmin-specific metrics (training status, body battery, etc.)

### C) Apple Health / Google Health Connect via a lightweight mobile bridge

If you ship a small mobile app:

* Garmin Connect syncs to Apple Health (iOS) or Health Connect (Android)
* Your mobile app reads from HealthKit/Health Connect and uploads to your backend

Pros:

* You can stay “official” in a different ecosystem
* Good for broader device support

Cons:

* Requires mobile app
* Data fields vary by platform and permissions

### D) Connect IQ app (device-side collection)

If you build a Connect IQ app/data field:

* You can collect and transmit data you record yourself
* You cannot rely on it to extract the user’s full historical Garmin Connect library automatically

Pros:

* Works even without cloud APIs for the data you record
  Cons:
* You are effectively building your own activity capture pipeline

Garmin publishes official Connect IQ example apps on GitHub. ([GitHub][12])

### E) Manual import as a fallback

* User uploads FIT/TCX/GPX exported from Garmin Connect
* Your app parses FIT and builds the same “actual vs planned” comparisons

This is the best “Plan B” UX if automation is blocked.

---

## Recommended path for your web app (if you want reliability)

If your goal is an automated, production-grade training log that users trust, I’d build it like this:

1. **Apply for Garmin Connect Developer Program** (Activity API + Training API, Health API optional). ([Garmin Developers][1])
2. Implement **OAuth2 PKCE** server-side and store tokens + Garmin `userId`. 
3. Choose **Push or Ping/Pull**, avoid polling, and queue ingestion. ([Garmin Developers][3])
4. On ingest:

   * download activity FIT
   * decode via `@garmin/fitsdk`
   * compute your training comparison metrics (pace compliance, time-in-zone, interval execution quality)
5. Optionally push planned workouts to Garmin via **Training API** so users can execute the plan directly on the watch. ([Garmin Developers][2])

If you tell me whether you’re aiming for “web-only” or you can ship a minimal mobile companion app, I can suggest the best fallback connector (Strava vs HealthKit/Health Connect vs SDKs) and a concrete onboarding flow that minimizes drop-off.

[1]: https://developer.garmin.com/gc-developer-program/overview/ "Overview | Garmin Connect Developer Program | Garmin Developers"
[2]: https://developer.garmin.com/gc-developer-program/training-api/ "Training API | Garmin Connect Developer Program | Garmin Developers"
[3]: https://developer.garmin.com/gc-developer-program/activity-api/ "Activity API | Garmin Connect Developer Program | Garmin Developers"
[4]: https://developer.garmin.com/gc-developer-program/health-api/ "Health API | Garmin Connect Developer Program | Garmin Developers"
[5]: https://developer.garmin.com/gc-developer-program/program-faq/ "Program FAQ | Garmin Connect Developer Program | Garmin Developers"
[6]: https://github.com/garmin/fit-javascript-sdk "GitHub - garmin/fit-javascript-sdk: Official Garmin FIT JavaScript SDK"
[7]: https://forums.garmin.com/developer/connect-iq/i/bug-reports/error-message-too-many-request-limit-per-rate-limit-quota-violation/status "'Error-message : Too many request: Limit  per   : Rate limit quota violation.' Status History - Connect IQ Bug Reports - Connect IQ - Garmin Forums"
[8]: https://github.com/fabulator/garmin-api-handler "GitHub - fabulator/garmin-api-handler: Unofficial handler for Garmin connect API"
[9]: https://github.com/Pythe1337N/garmin-connect?utm_source=chatgpt.com "Pythe1337N/garmin-connect"
[10]: https://github.com/Uninen/garmin-connect-to-json?utm_source=chatgpt.com "Uninen/garmin-connect-to-json"
[11]: https://developer.garmin.com/health-sdk/overview/ "Overview | Health SDKs | Garmin Developers"
[12]: https://github.com/garmin/connectiq-apps?utm_source=chatgpt.com "garmin/connectiq-apps: A collection of Connect IQ apps."


9m57s · gpt-5.1-pro[browser] · ↑169 ↓4.81k ↻0 Δ4.98k
