import { NextRequest, NextResponse } from 'next/server';
import { buildAuthorizationUrl, generateState } from '@/infrastructure/strava/oauth';
import { saveStravaOauthState } from '@/infrastructure/strava/store';
import { resolveAthleteId } from '@/infrastructure/garmin/auth';
import { stravaConfig } from '@/infrastructure/strava/config';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const { athleteId } = await resolveAthleteId(request);

    if (!athleteId) {
        return redirectToLogin(request);
    }

    if (!stravaConfig.clientId || !stravaConfig.clientSecret || !stravaConfig.redirectUri) {
        return redirectToError(request, 'missing_config');
    }

    try {
        const state = generateState();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        await saveStravaOauthState(state, athleteId, expiresAt);

        const authUrl = buildAuthorizationUrl(state);
        return NextResponse.redirect(authUrl);
    } catch (error) {
        return redirectToError(request, error instanceof Error && /missing/i.test(error.message) ? 'missing_config' : 'connect_failed');
    }
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

function redirectToError(request: NextRequest, code: 'missing_config' | 'connect_failed') {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const targetPath = from === 'settings' ? '/settings' : '/onboarding';
    const redirectUrl = new URL(targetPath, request.url);
    redirectUrl.searchParams.set('connect', 'strava');
    redirectUrl.searchParams.set('error', code);
    return NextResponse.redirect(redirectUrl);
}
