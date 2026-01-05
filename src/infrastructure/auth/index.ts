/**
 * Server-side authentication helpers
 * 
 * Centralized auth resolution for API routes.
 * Replaces the deleted @/infrastructure/garmin/auth module.
 */

import { getSupabaseServerClient } from '@/infrastructure/supabase/server';
import type { NextRequest } from 'next/server';

export interface AuthResult {
    athleteId: string | null;
    userId: string | null;
}

/**
 * Resolves the authenticated user's athlete ID from a request.
 * Works with both NextRequest and standard Request objects.
 */
export async function resolveAthleteId(
    request: Request | NextRequest
): Promise<AuthResult> {
    try {
        const supabase = getSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { athleteId: null, userId: null };
        }

        return { athleteId: user.id, userId: user.id };
    } catch {
        return { athleteId: null, userId: null };
    }
}
