/**
 * OAuth helpers for Garmin PKCE flow
 */

import crypto from 'node:crypto';
import { garminConfig } from './config';

export function generateCodeVerifier(): string {
    return base64Url(crypto.randomBytes(32));
}

export function generateCodeChallenge(verifier: string): string {
    const hash = crypto.createHash('sha256').update(verifier).digest();
    return base64Url(hash);
}

export function generateState(): string {
    return base64Url(crypto.randomBytes(32));
}

export function buildAuthorizationUrl(codeChallenge: string, state: string): string {
    if (!garminConfig.clientId || !garminConfig.redirectUri) {
        throw new Error('Missing GARMIN_CLIENT_ID or GARMIN_REDIRECT_URI');
    }

    const url = new URL(garminConfig.authUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', garminConfig.clientId);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('redirect_uri', garminConfig.redirectUri);
    url.searchParams.set('state', state);

    if (garminConfig.scope) {
        url.searchParams.set('scope', garminConfig.scope);
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
