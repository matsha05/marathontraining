/**
 * Token lifecycle helpers
 */

import { refreshGarminToken } from './api';
import { upsertGarminTokens } from './store';

export async function getValidAccessToken(
    tokenRow: {
    athlete_id: string;
    garmin_user_id: string;
    access_token: string;
    refresh_token: string;
    access_token_expires_at: string;
    refresh_token_expires_at: string | null;
    token_type: string;
    scopes: string[];
},
    reRead?: () => Promise<typeof tokenRow | null>
) {
    const expiresAt = new Date(tokenRow.access_token_expires_at).getTime();
    const bufferMs = 10 * 60 * 1000;

    if (Date.now() < expiresAt - bufferMs) {
        return tokenRow.access_token;
    }

    try {
        const refreshed = await refreshGarminToken(tokenRow.refresh_token);
        const accessTokenExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
        const refreshTokenExpiresAt = refreshed.refresh_token_expires_in
            ? new Date(Date.now() + refreshed.refresh_token_expires_in * 1000).toISOString()
            : tokenRow.refresh_token_expires_at;

        await upsertGarminTokens({
            athleteId: tokenRow.athlete_id,
            garminUserId: tokenRow.garmin_user_id,
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token,
            accessTokenExpiresAt,
            refreshTokenExpiresAt,
            tokenType: refreshed.token_type,
            scopes: tokenRow.scopes,
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
