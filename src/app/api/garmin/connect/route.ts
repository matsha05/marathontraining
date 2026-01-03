import { NextRequest, NextResponse } from 'next/server';
import { buildAuthorizationUrl, generateCodeChallenge, generateCodeVerifier, generateState } from '@/infrastructure/garmin/oauth';
import { saveOauthState } from '@/infrastructure/garmin/store';
import { resolveAthleteId } from '@/infrastructure/garmin/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const { athleteId } = await resolveAthleteId(request);

    if (!athleteId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await saveOauthState(state, athleteId, codeVerifier, expiresAt);

    const authUrl = buildAuthorizationUrl(codeChallenge, state);
    return NextResponse.redirect(authUrl);
}
