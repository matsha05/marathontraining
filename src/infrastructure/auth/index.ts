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

export interface AuthGuardResult extends AuthResult {
    response: NextResponse | null;
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

export async function requireAthleteId(
    request: Request | NextRequest,
    options: { onUnauthorized?: (request: Request | NextRequest) => NextResponse } = {}
): Promise<AuthGuardResult> {
    const result = await resolveAthleteId(request);

    if (!result.athleteId) {
        const response = options.onUnauthorized
            ? options.onUnauthorized(request)
            : NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        return { athleteId: null, userId: null, response };
    }

    return { ...result, response: null };
}
