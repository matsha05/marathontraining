import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSafeRedirectPath } from '@/lib/redirects';

const protectedPaths = ['/dashboard', '/plan', '/settings', '/workout'];

export async function middleware(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    if (!supabaseUrl || !supabaseAnonKey) {
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

    if (!user && isProtected) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/auth';
        redirectUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
        return NextResponse.redirect(redirectUrl);
    }

    if (user && isAuthRoute) {
        const nextParam = request.nextUrl.searchParams.get('next');
        const safeNext = getSafeRedirectPath(nextParam, '/dashboard', { allowApi: true });
        return NextResponse.redirect(new URL(safeNext, request.url));
    }

    return response;
}

export const config = {
    matcher: ['/dashboard/:path*', '/plan/:path*', '/settings/:path*', '/workout/:path*', '/auth', '/login', '/signup'],
};
