import { NextRequest, NextResponse } from 'next/server';
import { buildAuthorizationUrl, generateState, withStateContext } from '@/infrastructure/strava/oauth';
import { saveStravaOauthState } from '@/infrastructure/strava/store';
import { requireAthleteId } from '@/infrastructure/auth';
import { requireStravaConfig, stravaConfig } from '@/infrastructure/strava/config';
import { stravaConnectQuerySchema } from '@/infrastructure/strava/schemas';
import { getSafeRedirectPath } from '@/lib/redirects';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const auth = await requireAthleteId(request, { onUnauthorized: redirectToLogin });
    if (auth.response) return auth.response;

    const configCheck = requireStravaConfig(['clientId', 'clientSecret']);
    if (!configCheck.ok) {
        return redirectToError(request, 'missing_config');
    }

    try {
        const url = new URL(request.url);
        const parsed = stravaConnectQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid query', details: parsed.error.flatten() },
                { status: 400 }
            );
        }
        const { from, next } = parsed.data;
        const fallbackReturn = from === 'settings' ? '/settings' : '/onboarding';
        const returnPath = getSafeRedirectPath(next, fallbackReturn);
        const state = withStateContext(generateState(), { from, next: returnPath });
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        await saveStravaOauthState(state, auth.athleteId, expiresAt);

        const redirectUri = resolveRedirectUri(request);
        const authUrl = buildAuthorizationUrl(state, redirectUri);
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
    redirectUrl.searchParams.set('connect', 'strava');
    redirectUrl.searchParams.set('error', code);
    return NextResponse.redirect(redirectUrl);
}

function resolveRedirectUri(request: NextRequest) {
    const { hostname, origin } = request.nextUrl;
    if (isLocalhost(hostname)) {
        return `${origin}/api/strava/callback`;
    }
    if (stravaConfig.redirectUri) {
        return stravaConfig.redirectUri;
    }
    return `${origin}/api/strava/callback`;
}

function isLocalhost(hostname: string) {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname.endsWith('.local');
}
