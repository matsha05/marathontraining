import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const {
    requireAthleteIdMock,
    requireStravaConfigMock,
    withAuthMock,
} = vi.hoisted(() => ({
    requireAthleteIdMock: vi.fn(),
    requireStravaConfigMock: vi.fn(),
    withAuthMock: (
        handler: (request: Request, auth: { athleteId: string; userId: string }) => Promise<Response> | Response,
        options: { onUnauthorized?: (request: Request) => Response } = {}
    ) => async (request: Request) => {
        const auth = await requireAthleteIdMock(request, options);
        if (auth?.response) return auth.response;
        return handler(request, {
            athleteId: auth?.athleteId as string,
            userId: (auth?.userId ?? auth?.athleteId) as string,
        });
    },
}));

vi.mock('@/infrastructure/auth', () => ({
    requireAthleteId: requireAthleteIdMock,
    withAuth: withAuthMock,
}));

vi.mock('@/infrastructure/strava/config', () => ({
    stravaConfig: {
        webhookVerifyToken: 'expected-token',
        processingMode: 'queue',
        processingSecret: '',
        clientId: 'client',
        clientSecret: 'secret',
        redirectUri: '',
        authUrl: 'https://www.strava.com/oauth/authorize',
        tokenUrl: 'https://www.strava.com/oauth/token',
        apiUrl: 'https://www.strava.com/api/v3',
        successRedirect: '/settings?strava=connected',
        failureRedirect: '/settings?strava=error',
        scope: 'activity:read_all',
    },
    requireStravaConfig: requireStravaConfigMock,
}));

vi.mock('@/infrastructure/strava/store', () => ({
    insertStravaWebhookEvent: vi.fn(),
    markStravaWebhookEventProcessed: vi.fn(),
}));

vi.mock('@/infrastructure/strava/processor', () => ({
    processStravaWebhookEvent: vi.fn(),
}));

import { GET as webhookGet, POST as webhookPost } from '@/app/api/strava/webhook/route';
import { GET as connectGet } from '@/app/api/strava/connect/route';

describe('strava API routes', () => {
    beforeEach(() => {
        requireAthleteIdMock.mockReset();
        requireStravaConfigMock.mockReset();
    });

    it('rejects webhook verification with invalid token', async () => {
        const request = new Request(
            'http://localhost/api/strava/webhook?hub.mode=subscribe&hub.challenge=abc&hub.verify_token=wrong',
            { method: 'GET' }
        );

        const response = await webhookGet(request as NextRequest);
        expect(response.status).toBe(403);
    });

    it('validates webhook payload', async () => {
        const request = new Request('http://localhost/api/strava/webhook', {
            method: 'POST',
            body: JSON.stringify({ object_type: 'activity' }),
        });

        const response = await webhookPost(request as NextRequest);
        expect(response.status).toBe(400);
    });

    it('validates connect query params', async () => {
        requireAthleteIdMock.mockResolvedValue({
            athleteId: 'user-1',
            userId: 'user-1',
            response: null,
        });
        requireStravaConfigMock.mockReturnValue({ ok: true, missing: [] });

        const request = new Request('http://localhost/api/strava/connect?from=bad', {
            method: 'GET',
        });

        const response = await connectGet(request as NextRequest);
        expect(response.status).toBe(400);
    });
});
