import { NextRequest, NextResponse } from 'next/server';
import { buildAuthorizationUrl, generateState } from '@/infrastructure/strava/oauth';
import { saveStravaOauthState } from '@/infrastructure/strava/store';
import { resolveAthleteId } from '@/infrastructure/garmin/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const { athleteId } = await resolveAthleteId(request);

    if (!athleteId) {
        return redirectToLogin(request);
    }

    const state = generateState();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await saveStravaOauthState(state, athleteId, expiresAt);

    const authUrl = buildAuthorizationUrl(state);
    return NextResponse.redirect(authUrl);
}

function redirectToLogin(request: NextRequest) {
    const nextPath = getSafeNextPath(request, '/onboarding');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', nextPath);
    return NextResponse.redirect(loginUrl);
}

function getSafeNextPath(request: NextRequest, fallback: string) {
    const { searchParams, pathname, search } = new URL(request.url);
    const explicitNext = searchParams.get('next');
    if (explicitNext && explicitNext.startsWith('/')) {
        return explicitNext;
    }
    const selfPath = `${pathname}${search}`;
    return selfPath || fallback;
}
