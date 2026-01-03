"use client";

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loadingAction, setLoadingAction] = useState<'password' | 'magic' | 'google' | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const nextPath = searchParams.get('next') || '/dashboard';
    const errorFromUrl = searchParams.get('error');
    const isLoading = Boolean(loadingAction);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingAction('password');
        setErrorMessage(null);
        setMessage(null);

        try {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setErrorMessage(error.message);
                return;
            }

            router.push(nextPath);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Sign in failed');
        } finally {
            setLoadingAction(null);
        }
    };

    const handleMagicLink = async () => {
        if (!email) {
            setErrorMessage('Enter your email first.');
            return;
        }

        setLoadingAction('magic');
        setErrorMessage(null);
        setMessage(null);

        try {
            const supabase = createSupabaseBrowserClient();
            const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: redirectTo },
            });

            if (error) {
                setErrorMessage(error.message);
                return;
            }

            setMessage('Magic link sent. Check your email to finish signing in.');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Magic link failed');
        } finally {
            setLoadingAction(null);
        }
    };

    const handleGoogle = async () => {
        setLoadingAction('google');
        setErrorMessage(null);
        setMessage(null);

        try {
            const supabase = createSupabaseBrowserClient();
            const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo },
            });

            if (error) {
                setErrorMessage(error.message);
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Google sign in failed');
        } finally {
            setLoadingAction(null);
        }
    };

    return (
        <>
            {/* Logo */}
            <div className="text-center mb-10">
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    style={{ background: "var(--gradient-primary)" }}
                >
                    <div className="w-8 h-8 border-2 border-white rounded-full" />
                </div>
                <h1 className="text-display-md tracking-tight">Welcome back</h1>
                <p className="text-body-sm text-[var(--text-muted)] mt-2">Sign in to continue your training</p>
            </div>

            <div className="space-y-4">
                <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={isLoading}
                    className={`btn btn-secondary btn-lg w-full ${loadingAction === 'google' ? 'btn-loading' : ''}`}
                >
                    Continue with Google
                </button>

                <div className="flex items-center gap-3 text-label text-[var(--text-muted)]">
                    <span className="flex-1 h-px bg-[var(--border-muted)]" />
                    or
                    <span className="flex-1 h-px bg-[var(--border-muted)]" />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div>
                    <label className="text-label block mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="input"
                        required
                    />
                </div>

                <div>
                    <label className="text-label block mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`btn btn-gradient btn-lg w-full mt-6 ${loadingAction === 'password' ? 'btn-loading' : ''}`}
                >
                    {loadingAction === 'password' ? 'Signing in...' : 'Sign In'}
                </button>

                <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleMagicLink}
                    className={`btn btn-ghost w-full ${loadingAction === 'magic' ? 'btn-loading' : ''}`}
                >
                    Email me a magic link
                </button>
            </form>

            {(message || errorMessage || errorFromUrl) && (
                <div className="mt-6 text-body-sm text-center">
                    {message && <p className="text-[var(--color-accent)]">{message}</p>}
                    {(errorMessage || errorFromUrl) && (
                        <p className="text-[var(--color-error)]">
                            {errorMessage || formatError(errorFromUrl)}
                        </p>
                    )}
                </div>
            )}

            <p className="text-center text-body-sm text-[var(--text-muted)] mt-8">
                Don't have an account?{' '}
                <Link href="/signup" className="text-[var(--color-accent)] font-semibold hover:underline">
                    Sign up
                </Link>
            </p>
        </>
    );
}

function LoginFormFallback() {
    return (
        <div className="text-center">
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: "var(--gradient-primary)" }}
            >
                <div className="w-8 h-8 border-2 border-white rounded-full" />
            </div>
            <h1 className="text-display-md tracking-tight">Welcome back</h1>
            <p className="text-body-sm text-[var(--text-muted)] mt-2">Loading...</p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
        </Suspense>
    );
}

function formatError(error: string | null) {
    if (!error) return 'Sign in failed';
    if (error === 'missing_supabase_env') return 'Missing Supabase configuration.';
    return error.replace(/_/g, ' ');
}
