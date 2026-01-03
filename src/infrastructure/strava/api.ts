/**
 * Strava API client helpers
 */

import { stravaConfig } from './config';

export interface StravaTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    token_type: string;
    scope?: string;
    athlete?: {
        id: number;
        firstname?: string;
        lastname?: string;
    };
}

export async function exchangeStravaToken(code: string): Promise<StravaTokenResponse> {
    if (!stravaConfig.clientId || !stravaConfig.clientSecret) {
        throw new Error('Missing STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET');
    }

    const response = await fetch(stravaConfig.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: stravaConfig.clientId,
            client_secret: stravaConfig.clientSecret,
            code,
            grant_type: 'authorization_code',
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Strava token exchange failed: ${errorText}`);
    }

    return response.json() as Promise<StravaTokenResponse>;
}

export async function refreshStravaToken(refreshToken: string): Promise<StravaTokenResponse> {
    if (!stravaConfig.clientId || !stravaConfig.clientSecret) {
        throw new Error('Missing STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET');
    }

    const response = await fetch(stravaConfig.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: stravaConfig.clientId,
            client_secret: stravaConfig.clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Strava refresh token failed: ${errorText}`);
    }

    return response.json() as Promise<StravaTokenResponse>;
}

export async function deauthorizeStrava(accessToken: string): Promise<void> {
    const response = await fetch('https://www.strava.com/oauth/deauthorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ access_token: accessToken }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Strava deauthorization failed: ${errorText}`);
    }
}

export async function fetchStravaActivity(activityId: number, accessToken: string) {
    const response = await fetch(`${stravaConfig.apiUrl}/activities/${activityId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Strava activity fetch failed: ${errorText}`);
    }

    return response.json() as Promise<Record<string, unknown>>;
}

export async function fetchStravaActivities(
    accessToken: string,
    options: { after?: number; perPage?: number } = {}
) {
    const url = new URL(`${stravaConfig.apiUrl}/athlete/activities`);
    if (options.after) {
        url.searchParams.set('after', String(options.after));
    }
    url.searchParams.set('per_page', String(options.perPage ?? 50));

    const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Strava activities fetch failed: ${errorText}`);
    }

    return response.json() as Promise<Record<string, unknown>[]>;
}
