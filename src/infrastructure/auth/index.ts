/**
 * Server-side authentication helpers
 * 
 * Centralized auth resolution for API routes.
 * Replaces the deleted @/infrastructure/garmin/auth module.
 */

import { createSupabaseRequestClient } from '@/infrastructure/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export interface AuthResult {
    athleteId: string | null;
    userId: string | null;
}

export type AuthGuardResult =
    | { athleteId: string; userId: string; response: null }
    | { athleteId: null; userId: null; response: NextResponse };

export interface AuthContext {
    athleteId: string;
    userId: string;
}

/**
 * Resolves the authenticated user's athlete ID from a request.
 * Works with both NextRequest and standard Request objects.
 */
export async function resolveAthleteId(
    request: Request | NextRequest
): Promise<AuthResult> {
    try {
        const supabase = createSupabaseRequestClient(request);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { athleteId: null, userId: null };
        }

        return { athleteId: user.id, userId: user.id };
    } catch {
        return { athleteId: null, userId: null };
    }
}

export async function requireAthleteId<TRequest extends Request | NextRequest = NextRequest>(
    request: TRequest,
    options: { onUnauthorized?: (request: TRequest) => NextResponse } = {}
): Promise<AuthGuardResult> {
    const result = await resolveAthleteId(request);

    if (!result.athleteId) {
        const response = options.onUnauthorized
            ? options.onUnauthorized(request)
            : NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        return { athleteId: null, userId: null, response };
    }

    const athleteId = result.athleteId;
    const userId = result.userId ?? athleteId;
    return { athleteId, userId, response: null };
}

export function withAuth<TRequest extends Request | NextRequest = NextRequest>(
    handler: (request: TRequest, auth: AuthContext) => Promise<Response> | Response,
    options: { onUnauthorized?: (request: TRequest) => NextResponse } = {}
) {
    return async (request: TRequest) => {
        const auth = await requireAthleteId(request, options);
        if (auth.response) return auth.response;
        return handler(request, { athleteId: auth.athleteId, userId: auth.userId });
    };
}
