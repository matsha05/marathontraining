'use client';

/**
 * DEV-ONLY: Quick login bypass for testing
 * 
 * Creates a test session without email verification.
 * Only works in development mode.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase';

export default function DevLoginPage() {
    const router = useRouter();
    const [status, setStatus] = useState('Checking environment...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleDevLogin = async () => {
            // Only allow in development
            if (process.env.NODE_ENV !== 'development') {
                setError('Dev login only available in development mode');
                return;
            }

            setStatus('Creating dev session...');

            const supabase = createSupabaseBrowserClient();

            // Test credentials - these should be set up in Supabase dashboard
            // with email confirmation disabled for this user
            const testEmail = 'test@thelonggame.dev';
            const testPassword = 'devtest123!';

            try {
                // Try to sign in first
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email: testEmail,
                    password: testPassword,
                });

                if (signInError) {
                    // If user doesn't exist, create one
                    if (signInError.message.includes('Invalid login')) {
                        setStatus('Creating test user...');
                        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                            email: testEmail,
                            password: testPassword,
                            options: {
                                data: {
                                    name: 'Dev Tester',
                                }
                            }
                        });

                        if (signUpError) {
                            setError(`Sign up failed: ${signUpError.message}`);
                            return;
                        }

                        // Note: If email confirmation is required, this won't work
                        // You need to disable email confirmation in Supabase for this test user
                        if (signUpData.session) {
                            setStatus('Success! Redirecting...');
                            router.push('/dashboard');
                        } else {
                            setError('Email confirmation may be required. Disable it in Supabase settings for testing, or manually confirm the test user.');
                        }
                    } else {
                        setError(`Sign in failed: ${signInError.message}`);
                    }
                    return;
                }

                setStatus('Success! Redirecting...');
                router.push('/dashboard');
            } catch (e) {
                setError(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
            }
        };

        handleDevLogin();
    }, [router]);

    if (process.env.NODE_ENV !== 'development') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4 text-red-500">Not Available</h1>
                    <p>Dev login is only available in development mode.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
            <div className="text-center max-w-md p-8">
                <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Dev Login
                </h1>

                {error ? (
                    <div className="p-4 rounded-lg mb-4" style={{ background: 'var(--v3-error-subtle)' }}>
                        <p style={{ color: 'var(--v3-error)' }}>{error}</p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin w-5 h-5 border-2 border-t-transparent rounded-full"
                            style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
                        <p style={{ color: 'var(--text-muted)' }}>{status}</p>
                    </div>
                )}

                <div className="mt-8 p-4 rounded-lg text-left" style={{ background: 'var(--bg-elevated)' }}>
                    <p className="text-xs font-mono mb-2" style={{ color: 'var(--text-subtle)' }}>
                        Test credentials:
                    </p>
                    <code className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        test@thelonggame.dev / devtest123!
                    </code>
                </div>

                <div className="mt-6 space-y-2">
                    <button
                        onClick={() => router.push('/onboarding')}
                        className="block w-full p-3 rounded-lg text-center"
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                    >
                        Go to Onboarding →
                    </button>
                    <button
                        onClick={() => router.push('/regenerate')}
                        className="block w-full p-3 rounded-lg text-center"
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                    >
                        Go to Regenerate →
                    </button>
                </div>
            </div>
        </div>
    );
}
