import crypto from 'node:crypto';
import { stravaConfig } from './config';

const STATE_SEPARATOR = '.';

export function generateState(): string {
    return base64Url(crypto.randomBytes(32));
}

export function buildAuthorizationUrl(state: string, redirectUri: string): string {
    if (!stravaConfig.clientId) {
        throw new Error('Missing STRAVA_CLIENT_ID');
    }
    if (!redirectUri) {
        throw new Error('Missing STRAVA_REDIRECT_URI');
    }

    const url = new URL(stravaConfig.authUrl);
    url.searchParams.set('client_id', stravaConfig.clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('approval_prompt', 'auto');
    url.searchParams.set('state', state);

    if (stravaConfig.scope) {
        url.searchParams.set('scope', stravaConfig.scope);
    }

    return url.toString();
}

export function withStateContext(
    state: string,
    context: { from?: string | null; next?: string | null }
): string {
    const parts = [state];
    if (context.from && /^[a-z0-9_-]+$/i.test(context.from)) {
        parts.push(`from=${context.from}`);
    }
    if (context.next) {
        parts.push(`next=${base64UrlEncode(context.next)}`);
    }
    return parts.join(STATE_SEPARATOR);
}

export function parseStateContext(state: string): { nonce: string; from?: string; next?: string } {
    const parts = state.split(STATE_SEPARATOR);
    const nonce = parts.shift() ?? '';
    let from: string | undefined;
    let next: string | undefined;

    for (const part of parts) {
        if (part.startsWith('from=')) {
            from = part.slice('from='.length);
        } else if (part.startsWith('next=')) {
            next = base64UrlDecode(part.slice('next='.length)) ?? undefined;
        }
    }

    return { nonce, from, next };
}

function base64Url(buffer: Buffer): string {
    return buffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function base64UrlEncode(value: string): string {
    return Buffer.from(value, 'utf8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function base64UrlDecode(value: string): string | null {
    try {
        const padded = value.replace(/-/g, '+').replace(/_/g, '/');
        const padLength = (4 - (padded.length % 4)) % 4;
        const normalized = `${padded}${'='.repeat(padLength)}`;
        return Buffer.from(normalized, 'base64').toString('utf8');
    } catch {
        return null;
    }
}
