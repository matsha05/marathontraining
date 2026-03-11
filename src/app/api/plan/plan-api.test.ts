import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const {
    requireAthleteIdMock,
    createSupabaseRequestClientMock,
    getSupabaseServerClientMock,
    withAuthMock,
} = vi.hoisted(() => ({
    requireAthleteIdMock: vi.fn(),
    createSupabaseRequestClientMock: vi.fn(),
    getSupabaseServerClientMock: vi.fn(),
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

vi.mock('@/infrastructure/supabase/server', () => ({
    createSupabaseRequestClient: createSupabaseRequestClientMock,
    getSupabaseServerClient: getSupabaseServerClientMock,
}));

import { POST as savePlan } from '@/app/api/plan/save/route';
import { GET as getCurrentPlan } from '@/app/api/plan/current/route';

function mockAuthSuccess() {
    requireAthleteIdMock.mockResolvedValue({
        athleteId: 'user-1',
        userId: 'user-1',
        response: null,
    });
}

function mockAuthFailure() {
    requireAthleteIdMock.mockResolvedValue({
        athleteId: null,
        userId: null,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });
}

function buildSaveRequest(body: unknown) {
    return new Request('http://localhost/api/plan/save', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

const validPlan = {
    id: '3b49d356-2b8f-4ef1-9b48-41e9b16b2cfe',
    vdot: 45,
    goalDistance: 'marathon',
    raceDate: '2025-05-01',
    paces: {
        easy: { min: 500, max: 600 },
        marathon: 450,
        threshold: 400,
        interval: 360,
        repetition: 330,
    },
    weeks: [
        {
            weekNumber: 1,
            weekOf: '2025-01-01',
            phase: 'base',
            isRecoveryWeek: false,
            focus: 'Base',
            days: [
                {
                    date: '2025-01-01',
                    dayOfWeek: 1,
                    runWorkout: null,
                    strengthWorkout: null,
                    isKeyDay: false,
                },
            ],
        },
    ],
};

describe('plan API routes', () => {
    beforeEach(() => {
        requireAthleteIdMock.mockReset();
        createSupabaseRequestClientMock.mockReset();
        getSupabaseServerClientMock.mockReset();
        getSupabaseServerClientMock.mockReturnValue({
            from: vi.fn(() => ({
                upsert: vi.fn().mockResolvedValue({ error: null }),
            })),
        });
    });

    it('rejects save when unauthenticated', async () => {
        mockAuthFailure();
        const request = buildSaveRequest({ plan: validPlan });

        const response = await savePlan(request as NextRequest);
        expect(response.status).toBe(401);
    });

    it('validates save request body', async () => {
        mockAuthSuccess();
        const request = buildSaveRequest({});

        const response = await savePlan(request as NextRequest);
        expect(response.status).toBe(400);
    });

    it('saves plan via rpc', async () => {
        mockAuthSuccess();

        createSupabaseRequestClientMock.mockReturnValue({
            rpc: vi.fn().mockResolvedValue({ error: null }),
        });

        const request = buildSaveRequest({ plan: validPlan });

        const response = await savePlan(request as NextRequest);
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.ok).toBe(true);
    });

    it('returns null when no active plan', async () => {
        mockAuthSuccess();

        const planQuery = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'No rows' },
            }),
        };

        createSupabaseRequestClientMock.mockReturnValue({
            from: vi.fn(() => planQuery),
        });

        const request = new Request('http://localhost/api/plan/current', { method: 'GET' });
        const response = await getCurrentPlan(request as NextRequest);
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.plan).toBeNull();
    });
});
