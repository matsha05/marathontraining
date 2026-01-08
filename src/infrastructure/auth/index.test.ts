import { describe, it, expect, vi, beforeEach } from 'vitest';

const getUserMock = vi.fn();

vi.mock('@/infrastructure/supabase/server', () => ({
    createSupabaseRequestClient: vi.fn(() => ({
        auth: {
            getUser: getUserMock,
        },
    })),
}));

import { requireAthleteId, resolveAthleteId } from './index';

describe('resolveAthleteId', () => {
    beforeEach(() => {
        getUserMock.mockReset();
    });

    it('returns athlete and user ids when authenticated', async () => {
        getUserMock.mockResolvedValue({ data: { user: { id: 'user-123' } } });

        const result = await resolveAthleteId({} as Request);

        expect(result).toEqual({ athleteId: 'user-123', userId: 'user-123' });
    });

    it('returns null ids when unauthenticated', async () => {
        getUserMock.mockResolvedValue({ data: { user: null } });

        const result = await resolveAthleteId({} as Request);

        expect(result).toEqual({ athleteId: null, userId: null });
    });

    it('returns null ids on errors', async () => {
        getUserMock.mockRejectedValue(new Error('boom'));

        const result = await resolveAthleteId({} as Request);

        expect(result).toEqual({ athleteId: null, userId: null });
    });
});

describe('requireAthleteId', () => {
    beforeEach(() => {
        getUserMock.mockReset();
    });

    it('returns athlete id and no response when authenticated', async () => {
        getUserMock.mockResolvedValue({ data: { user: { id: 'user-456' } } });

        const result = await requireAthleteId({} as Request);

        expect(result.athleteId).toBe('user-456');
        expect(result.response).toBeNull();
    });

    it('returns default unauthorized response when unauthenticated', async () => {
        getUserMock.mockResolvedValue({ data: { user: null } });

        const result = await requireAthleteId({} as Request);

        expect(result.athleteId).toBeNull();
        expect(result.response?.status).toBe(401);
    });
});
