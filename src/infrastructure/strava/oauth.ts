import crypto from 'node:crypto';
import { stravaConfig } from './config';

export function generateState(): string {
    return base64Url(crypto.randomBytes(32));
}

export function buildAuthorizationUrl(state: string): string {
    if (!stravaConfig.clientId || !stravaConfig.redirectUri) {
        throw new Error('Missing STRAVA_CLIENT_ID or STRAVA_REDIRECT_URI');
    }

    const url = new URL(stravaConfig.authUrl);
    url.searchParams.set('client_id', stravaConfig.clientId);
    url.searchParams.set('redirect_uri', stravaConfig.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('approval_prompt', 'auto');
    url.searchParams.set('state', state);

    if (stravaConfig.scope) {
        url.searchParams.set('scope', stravaConfig.scope);
    }

    return url.toString();
}

function base64Url(buffer: Buffer): string {
    return buffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}
