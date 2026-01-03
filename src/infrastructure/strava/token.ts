/**
 * Strava token lifecycle helpers
 */

import { refreshStravaToken } from './api';
import { upsertStravaTokens } from './store';

export async function getValidAccessToken(
    tokenRow: {
        athlete_id: string;
        strava_athlete_id: number;
        access_token: string;
        refresh_token: string;
        access_token_expires_at: string;
        scopes: string[];
    },
    reRead?: () => Promise<typeof tokenRow | null>
) {
    const expiresAt = new Date(tokenRow.access_token_expires_at).getTime();
    const bufferMs = 5 * 60 * 1000;

    if (Date.now() < expiresAt - bufferMs) {
        return tokenRow.access_token;
    }

    try {
        const refreshed = await refreshStravaToken(tokenRow.refresh_token);
        const accessTokenExpiresAt = new Date(refreshed.expires_at * 1000).toISOString();

        await upsertStravaTokens({
            athleteId: tokenRow.athlete_id,
            stravaAthleteId: tokenRow.strava_athlete_id,
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token,
            accessTokenExpiresAt,
            scopes: refreshed.scope ? refreshed.scope.split(',') : tokenRow.scopes,
        });

        return refreshed.access_token;
    } catch (error) {
        if (reRead) {
            const latest = await reRead();
            if (latest) {
                const latestExpiresAt = new Date(latest.access_token_expires_at).getTime();
                if (Date.now() < latestExpiresAt - bufferMs) {
                    return latest.access_token;
                }
            }
        }
        throw error;
    }
}
