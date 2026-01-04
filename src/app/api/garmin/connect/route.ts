import { NextRequest, NextResponse } from 'next/server';
import { buildAuthorizationUrl, generateCodeChallenge, generateCodeVerifier, generateState } from '@/infrastructure/garmin/oauth';
import { saveOauthState } from '@/infrastructure/garmin/store';
import { resolveAthleteId } from '@/infrastructure/garmin/auth';
import { garminConfig } from '@/infrastructure/garmin/config';
import { getSafeRedirectPath } from '@/lib/redirects';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const { athleteId } = await resolveAthleteId(request);

    if (!athleteId) {
        return redirectToLogin(request);
    }

    if (!garminConfig.clientId || !garminConfig.clientSecret || !garminConfig.redirectUri) {
        return redirectToError(request, 'missing_config');
    }

    try {
        const state = generateState();
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = generateCodeChallenge(codeVerifier);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        await saveOauthState(state, athleteId, codeVerifier, expiresAt);

        const authUrl = buildAuthorizationUrl(codeChallenge, state);
        return NextResponse.redirect(authUrl);
    } catch (error) {
        return redirectToError(request, error instanceof Error && /missing/i.test(error.message) ? 'missing_config' : 'connect_failed');
    }
}

function redirectToLogin(request: NextRequest) {
    const url = new URL(request.url);
    const selfPath = `${url.pathname}${url.search}`;
    const nextPath = getSafeRedirectPath(selfPath, '/onboarding', { allowApi: true, blockedPrefixes: [] });
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('next', nextPath);
    return NextResponse.redirect(loginUrl);
}

function redirectToError(request: NextRequest, code: 'missing_config' | 'connect_failed') {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const targetPath = from === 'settings' ? '/settings' : '/onboarding';
    const redirectUrl = new URL(targetPath, request.url);
    redirectUrl.searchParams.set('connect', 'garmin');
    redirectUrl.searchParams.set('error', code);
    return NextResponse.redirect(redirectUrl);
}
