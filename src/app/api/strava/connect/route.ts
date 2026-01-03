import { NextRequest, NextResponse } from 'next/server';
import { buildAuthorizationUrl, generateState } from '@/infrastructure/strava/oauth';
import { saveStravaOauthState } from '@/infrastructure/strava/store';
import { resolveAthleteId } from '@/infrastructure/garmin/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const { athleteId } = await resolveAthleteId(request);

    if (!athleteId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const state = generateState();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await saveStravaOauthState(state, athleteId, expiresAt);

    const authUrl = buildAuthorizationUrl(state);
    return NextResponse.redirect(authUrl);
}
