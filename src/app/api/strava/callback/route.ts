import { NextRequest, NextResponse } from 'next/server';
import { exchangeStravaToken } from '@/infrastructure/strava/api';
import { consumeStravaOauthState, upsertStravaTokens } from '@/infrastructure/strava/store';
import { stravaConfig } from '@/infrastructure/strava/config';
import { resolveAthleteId } from '@/infrastructure/garmin/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
            return NextResponse.redirect(`${stravaConfig.failureRedirect}&error=${encodeURIComponent(error)}`);
        }

        if (!code || !state) {
            return NextResponse.redirect(stravaConfig.failureRedirect);
        }

        const { athleteId } = await resolveAthleteId(request);
        if (!athleteId) {
            return NextResponse.redirect(stravaConfig.failureRedirect);
        }

        const oauthState = await consumeStravaOauthState(state);
        if (!oauthState) {
            return NextResponse.redirect(stravaConfig.failureRedirect);
        }

        if (new Date(oauthState.expires_at).getTime() < Date.now()) {
            return NextResponse.redirect(stravaConfig.failureRedirect);
        }

        if (oauthState.athlete_id !== athleteId) {
            return NextResponse.redirect(stravaConfig.failureRedirect);
        }

        const tokens = await exchangeStravaToken(code);
        if (!tokens.athlete?.id) {
            return NextResponse.redirect(stravaConfig.failureRedirect);
        }

        const accessTokenExpiresAt = new Date(tokens.expires_at * 1000).toISOString();

        await upsertStravaTokens({
            athleteId,
            stravaAthleteId: tokens.athlete.id,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            accessTokenExpiresAt,
            scopes: tokens.scope ? tokens.scope.split(',') : [],
        });

        return NextResponse.redirect(stravaConfig.successRedirect);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Strava OAuth failed';
        const redirect = `${stravaConfig.failureRedirect}&error=${encodeURIComponent(message)}`;
        return NextResponse.redirect(redirect);
    }
}
