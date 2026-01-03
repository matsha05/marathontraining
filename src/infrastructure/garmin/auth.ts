import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/infrastructure/supabase/types';
import type { NextRequest } from 'next/server';

interface AuthResult {
    athleteId: string | null;
    source: 'session' | 'token' | 'owner' | null;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function resolveAthleteId(request?: Request | NextRequest): Promise<AuthResult> {
    if (supabaseUrl && supabaseAnonKey && request) {
        const authHeader = request.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.slice('Bearer '.length);
            const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
                auth: { persistSession: false, autoRefreshToken: false },
            });
            const { data, error } = await supabase.auth.getUser(token);
            if (!error && data.user) {
                return { athleteId: data.user.id, source: 'token' };
            }
        }
    }

    if (supabaseUrl && supabaseAnonKey) {
        const cookieStore = await cookies();
        const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                    } catch {
                        // Ignore write attempts in read-only contexts.
                    }
                },
            },
        });
        const { data } = await supabase.auth.getUser();
        if (data.user) {
            return { athleteId: data.user.id, source: 'session' };
        }
    }

    if (process.env.GARMIN_SINGLE_USER_MODE === 'true') {
        const ownerId = process.env.GARMIN_OWNER_ATHLETE_ID;
        if (ownerId) {
            return { athleteId: ownerId, source: 'owner' };
        }
    }

    return { athleteId: null, source: null };
}
