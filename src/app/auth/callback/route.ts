import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/infrastructure/supabase/types';
import { getSafeRedirectPath } from '@/lib/redirects';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const nextParam = searchParams.get('next');
    const nextPath = getSafeRedirectPath(nextParam, '/dashboard', { allowApi: true });

    if (error) {
        return redirectToAuth(request, errorDescription ?? error, nextPath);
    }

    if (!code) {
        return redirectToAuth(request, 'missing_code', nextPath);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
        return redirectToAuth(request, 'missing_supabase_env', nextPath);
    }

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
                    // Ignore cookie write errors in read-only contexts.
                }
            },
        },
    });

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
        return redirectToAuth(request, exchangeError.message, nextPath);
    }

    return NextResponse.redirect(new URL(nextPath, request.url));
}

function redirectToAuth(request: NextRequest, errorMessage: string, nextPath: string) {
    const url = new URL('/auth', request.url);
    url.searchParams.set('error', errorMessage);
    if (nextPath) {
        url.searchParams.set('next', nextPath);
    }
    return NextResponse.redirect(url);
}
