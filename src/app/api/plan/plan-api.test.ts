import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const requireAthleteIdMock = vi.fn();
const createSupabaseRequestClientMock = vi.fn();
const withAuthMock = (
    handler: (request: Request, auth: { athleteId: string; userId: string }) => Promise<Response> | Response,
    options: { onUnauthorized?: (request: Request) => Response } = {}
) => async (request: Request) => {
    const auth = await requireAthleteIdMock(request, options);
    if (auth?.response) return auth.response;
    return handler(request, {
        athleteId: auth?.athleteId as string,
        userId: (auth?.userId ?? auth?.athleteId) as string,
    });
};

vi.mock('@/infrastructure/auth', () => ({
    requireAthleteId: requireAthleteIdMock,
    withAuth: withAuthMock,
}));

vi.mock('@/infrastructure/supabase/server', () => ({
    createSupabaseRequestClient: createSupabaseRequestClientMock,
}));

import { POST as savePlan } from '@/app/api/plan/save/route';
import { GET as getCurrentPlan } from '@/app/api/plan/current/route';

const validPlan = {
    id: 'plan-1',
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
    });

    it('rejects save when unauthenticated', async () => {
        requireAthleteIdMock.mockResolvedValue({
            athleteId: null,
            userId: null,
            response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        });

        const request = new Request('http://localhost/api/plan/save', {
            method: 'POST',
            body: JSON.stringify({ plan: validPlan }),
        });

        const response = await savePlan(request as NextRequest);
        expect(response.status).toBe(401);
    });

    it('validates save request body', async () => {
        requireAthleteIdMock.mockResolvedValue({
            athleteId: 'user-1',
            userId: 'user-1',
            response: null,
        });

        const request = new Request('http://localhost/api/plan/save', {
            method: 'POST',
            body: JSON.stringify({}),
        });

        const response = await savePlan(request as NextRequest);
        expect(response.status).toBe(400);
    });

    it('saves plan via rpc', async () => {
        requireAthleteIdMock.mockResolvedValue({
            athleteId: 'user-1',
            userId: 'user-1',
            response: null,
        });

        createSupabaseRequestClientMock.mockReturnValue({
            rpc: vi.fn().mockResolvedValue({ error: null }),
        });

        const request = new Request('http://localhost/api/plan/save', {
            method: 'POST',
            body: JSON.stringify({ plan: validPlan }),
        });

        const response = await savePlan(request as NextRequest);
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.ok).toBe(true);
    });

    it('returns null when no active plan', async () => {
        requireAthleteIdMock.mockResolvedValue({
            athleteId: 'user-1',
            userId: 'user-1',
            response: null,
        });

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
