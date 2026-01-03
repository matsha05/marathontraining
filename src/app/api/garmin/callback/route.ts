import { NextRequest, NextResponse } from 'next/server';
import { exchangeGarminToken, fetchGarminUserId } from '@/infrastructure/garmin/api';
import { consumeOauthState, upsertGarminTokens } from '@/infrastructure/garmin/store';
import { garminConfig } from '@/infrastructure/garmin/config';
import { resolveAthleteId } from '@/infrastructure/garmin/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
            return NextResponse.redirect(garminConfig.failureRedirect);
        }

        const { athleteId } = await resolveAthleteId(request);
        if (!athleteId) {
            return NextResponse.redirect(garminConfig.failureRedirect);
        }

        const oauthState = await consumeOauthState(state);
        if (!oauthState) {
            return NextResponse.redirect(garminConfig.failureRedirect);
        }

        if (new Date(oauthState.expires_at).getTime() < Date.now()) {
            return NextResponse.redirect(garminConfig.failureRedirect);
        }

        if (oauthState.athlete_id !== athleteId) {
            return NextResponse.redirect(garminConfig.failureRedirect);
        }

        const tokens = await exchangeGarminToken(code, oauthState.code_verifier);
        const accessTokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
        const refreshTokenExpiresAt = tokens.refresh_token_expires_in
            ? new Date(Date.now() + tokens.refresh_token_expires_in * 1000).toISOString()
            : null;

        const garminUserId = await fetchGarminUserId(tokens.access_token);

        await upsertGarminTokens({
            athleteId,
            garminUserId,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            accessTokenExpiresAt,
            refreshTokenExpiresAt,
            tokenType: tokens.token_type,
        });

        return NextResponse.redirect(garminConfig.successRedirect);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Garmin OAuth failed';
        const redirect = `${garminConfig.failureRedirect}&error=${encodeURIComponent(message)}`;
        return NextResponse.redirect(redirect);
    }
}
