import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/infrastructure/supabase/types';

export const runtime = 'nodejs';

type VerifyOtpPayload = {
    email?: string;
    token?: string;
};

const OTP_TYPES: Array<'email' | 'signup'> = ['email', 'signup'];

export async function POST(request: NextRequest) {
    let payload: VerifyOtpPayload;

    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const email = payload.email?.toLowerCase().trim();
    const token = payload.token?.trim();

    if (!email || !token) {
        return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    cookieStore.set(name, value, options);
                });
            },
        },
    });

    let lastError: string | null = null;

    for (const type of OTP_TYPES) {
        const { error } = await supabase.auth.verifyOtp({
            email,
            token,
            type,
        });

        if (!error) {
            return NextResponse.json({ ok: true });
        }

        lastError = error.message;
    }

    return NextResponse.json({ error: lastError ?? 'Verification failed' }, { status: 400 });
}
