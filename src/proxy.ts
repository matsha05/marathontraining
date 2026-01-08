import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSafeRedirectPath } from '@/lib/redirects';

/**
 * Next.js Proxy - Elite Auth Guard
 * 
 * Anti-marketing ethos: logged-in users go straight to app, not landing page.
 * Handles all auth routing server-side (no client-side flash).
 */

const protectedPaths = ['/dashboard', '/plan', '/settings', '/workout', '/onboarding', '/regenerate'];

export async function proxy(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    if (!supabaseUrl || !supabaseAnonKey) {
        if (process.env.NODE_ENV === 'production') {
            return new NextResponse('Missing Supabase environment configuration.', { status: 500 });
        }
        return response;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    response.cookies.set(name, value, options);
                });
            },
        },
    });

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    const pathname = request.nextUrl.pathname;
    const isProtected = protectedPaths.some(path => pathname.startsWith(path));
    const isAuthRoute = pathname === '/auth' || pathname === '/login' || pathname === '/signup';
    // Landing page: Let logged-in users stay on landing
    // They will see the "Dashboard" nav link in header
    // No forced redirect - better UX to let them choose
    // (Previously: auto-redirect to /dashboard, which caused redirect loops)

    // Protected routes: require auth
    if (!user && isProtected) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/auth';
        redirectUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
        return NextResponse.redirect(redirectUrl);
    }

    // Auth routes: logged-in users redirect to next or dashboard
    if (user && isAuthRoute) {
        const nextParam = request.nextUrl.searchParams.get('next');
        const safeNext = getSafeRedirectPath(nextParam, '/dashboard', { allowApi: true });
        return NextResponse.redirect(new URL(safeNext, request.url));
    }

    return response;
}

export const config = {
    matcher: [
        '/',  // Landing page
        '/dashboard/:path*',
        '/plan/:path*',
        '/settings/:path*',
        '/workout/:path*',
        '/onboarding/:path*',
        '/regenerate/:path*',
        '/auth',
        '/login',
        '/signup'
    ],
};
