/**
 * Supabase server-side clients.
 * - Service role: admin access (no auth context)
 * - Request client: user-scoped auth via cookies
 */

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import type { Database } from './types';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let cachedClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseServerClient() {
    if (cachedClient) return cachedClient;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    cachedClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    return cachedClient;
}

export function createSupabaseRequestClient(request: Request | NextRequest) {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    }

    return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                if ('cookies' in request && typeof request.cookies?.getAll === 'function') {
                    return request.cookies.getAll();
                }
                return [];
            },
            setAll() {
                // No-op: this helper is only used for reading the session.
            },
        },
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}
