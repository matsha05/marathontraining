/**
 * Garmin API client helpers
 */

import { garminConfig } from './config';

export interface GarminTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_token_expires_in?: number;
    token_type: string;
}

export async function exchangeGarminToken(code: string, codeVerifier: string): Promise<GarminTokenResponse> {
    if (!garminConfig.clientId || !garminConfig.clientSecret || !garminConfig.redirectUri) {
        throw new Error('Missing GARMIN_CLIENT_ID, GARMIN_CLIENT_SECRET, or GARMIN_REDIRECT_URI');
    }

    const response = await fetch(garminConfig.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: garminConfig.clientId,
            client_secret: garminConfig.clientSecret,
            code,
            code_verifier: codeVerifier,
            redirect_uri: garminConfig.redirectUri,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Garmin token exchange failed: ${errorText}`);
    }

    return response.json() as Promise<GarminTokenResponse>;
}

export async function refreshGarminToken(refreshToken: string): Promise<GarminTokenResponse> {
    if (!garminConfig.clientId || !garminConfig.clientSecret) {
        throw new Error('Missing GARMIN_CLIENT_ID or GARMIN_CLIENT_SECRET');
    }

    const response = await fetch(garminConfig.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: garminConfig.clientId,
            client_secret: garminConfig.clientSecret,
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Garmin refresh token failed: ${errorText}`);
    }

    return response.json() as Promise<GarminTokenResponse>;
}

export async function fetchGarminUserId(accessToken: string): Promise<string> {
    const response = await fetch(garminConfig.userIdUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Garmin user id fetch failed: ${errorText}`);
    }

    const payload = await response.json() as { userId?: string };
    if (!payload.userId) {
        throw new Error('Garmin user id missing in response');
    }

    return payload.userId;
}

export async function deleteGarminRegistration(accessToken: string): Promise<void> {
    const response = await fetch(garminConfig.registrationUrl, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Garmin deregistration failed: ${errorText}`);
    }
}

export async function fetchGarminResource(url: string, accessToken: string): Promise<ArrayBuffer> {
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Garmin resource fetch failed: ${errorText}`);
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && Number(contentLength) > garminConfig.maxFitSizeBytes) {
        throw new Error('Garmin FIT file exceeds size limit');
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > garminConfig.maxFitSizeBytes) {
        throw new Error('Garmin FIT file exceeds size limit');
    }
    return buffer;
}
