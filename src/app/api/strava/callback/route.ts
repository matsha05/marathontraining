import { NextRequest, NextResponse } from 'next/server';
import { exchangeStravaToken } from '@/infrastructure/strava/api';
import { consumeStravaOauthState, upsertStravaTokens } from '@/infrastructure/strava/store';
import { stravaConfig } from '@/infrastructure/strava/config';
import { withAuth } from '@/infrastructure/auth';
import { parseStateContext } from '@/infrastructure/strava/oauth';
import { isSafeRedirectPath } from '@/lib/redirects';
import { stravaCallbackQuerySchema } from '@/infrastructure/strava/schemas';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    let successRedirect = buildRedirectUrl(request, stravaConfig.successRedirect, '/settings');
    let failureRedirect = buildRedirectUrl(request, stravaConfig.failureRedirect, '/settings');

    try {
        const { searchParams } = new URL(request.url);
        const query = Object.fromEntries(searchParams.entries());
        const parsedQuery = stravaCallbackQuerySchema.safeParse(query);
        if (!parsedQuery.success) {
            return NextResponse.json(
                { error: 'Invalid query', details: parsedQuery.error.flatten() },
                { status: 400 }
            );
        }

        const { code, state, error } = parsedQuery.data;
        const stateContext = state ? parseStateContext(state) : null;
        successRedirect = resolveRedirectBase(
            request,
            stateContext?.next,
            stateContext?.from,
            successRedirect
        );
        failureRedirect = resolveRedirectBase(
            request,
            stateContext?.next,
            stateContext?.from,
            failureRedirect
        );

        if (error) {
            return redirectWithParams(failureRedirect, { connect: 'strava', error });
        }

        if (!code || !state) {
            return redirectWithParams(failureRedirect, { connect: 'strava', error: 'missing_code' });
        }

        const handleCallback = withAuth(async (_request, auth) => {
            const oauthState = await consumeStravaOauthState(state);
            if (!oauthState) {
                return redirectWithParams(failureRedirect, { connect: 'strava', error: 'invalid_state' });
            }

            if (new Date(oauthState.expires_at).getTime() < Date.now()) {
                return redirectWithParams(failureRedirect, { connect: 'strava', error: 'expired_state' });
            }

            if (oauthState.athlete_id !== auth.athleteId) {
                return redirectWithParams(failureRedirect, { connect: 'strava', error: 'state_mismatch' });
            }

            const tokens = await exchangeStravaToken(code);
            if (!tokens.athlete?.id) {
                return NextResponse.redirect(failureRedirect);
            }

            const accessTokenExpiresAt = new Date(tokens.expires_at * 1000).toISOString();

            await upsertStravaTokens({
                athleteId: auth.athleteId,
                stravaAthleteId: tokens.athlete.id,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                accessTokenExpiresAt,
                scopes: tokens.scope ? tokens.scope.split(',') : [],
            });

            return redirectWithParams(successRedirect, { connect: 'strava', status: 'connected' });
        }, {
            onUnauthorized: () => redirectWithParams(failureRedirect, { connect: 'strava', error: 'unauthorized' }),
        });

        return await handleCallback(request);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Strava OAuth failed';
        return redirectWithParams(failureRedirect, { connect: 'strava', error: message });
    }
}

function buildRedirectUrl(request: NextRequest, target: string, fallbackPath: string) {
    try {
        return new URL(target, request.url).toString();
    } catch {
        return new URL(fallbackPath, request.url).toString();
    }
}

function redirectWithParams(baseUrl: string, params: Record<string, string>) {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });
    return NextResponse.redirect(url.toString());
}

function resolveRedirectBase(
    request: NextRequest,
    returnPath: string | undefined,
    from: string | undefined,
    fallbackUrl: string
) {
    const fromPath = from === 'onboarding' ? '/onboarding' : from === 'settings' ? '/settings' : null;
    const candidate = isSafeRedirectPath(returnPath, { allowApi: false }) ? returnPath : fromPath;
    if (candidate && isSafeRedirectPath(candidate, { allowApi: false })) {
        return new URL(candidate, request.url).toString();
    }
    return fallbackUrl;
}
