"use client";

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase';

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loadingAction, setLoadingAction] = useState<'password' | 'magic' | 'google' | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const nextPath = searchParams.get('next') || '/onboarding';
    const isLoading = Boolean(loadingAction);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingAction('password');
        setErrorMessage(null);
        setMessage(null);

        try {
            const supabase = createSupabaseBrowserClient();
            const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { emailRedirectTo: redirectTo },
            });

            if (error) {
                setErrorMessage(error.message);
                return;
            }

            setMessage('Account created. Check your email to confirm and finish setup.');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Sign up failed');
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
                options: {
                    emailRedirectTo: redirectTo,
                    shouldCreateUser: true,
                },
            });

            if (error) {
                setErrorMessage(error.message);
                return;
            }

            setMessage('Magic link sent. Check your email to finish signup.');
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
            setErrorMessage(error instanceof Error ? error.message : 'Google sign up failed');
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
                <h1 className="text-display-md tracking-tight">Create your account</h1>
                <p className="text-body-sm text-[var(--text-muted)] mt-2">Start training with precision</p>
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
                        minLength={8}
                    />
                    <p className="text-caption text-[var(--text-muted)] mt-2">Minimum 8 characters</p>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`btn btn-gradient btn-lg w-full mt-6 ${loadingAction === 'password' ? 'btn-loading' : ''}`}
                >
                    {loadingAction === 'password' ? 'Creating account...' : 'Create Account'}
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

            {(message || errorMessage) && (
                <div className="mt-6 text-body-sm text-center">
                    {message && <p className="text-[var(--color-accent)]">{message}</p>}
                    {errorMessage && <p className="text-[var(--color-error)]">{errorMessage}</p>}
                </div>
            )}

            <p className="text-center text-body-sm text-[var(--text-muted)] mt-8">
                Already have an account?{' '}
                <Link href="/login" className="text-[var(--color-accent)] font-semibold hover:underline">
                    Sign in
                </Link>
            </p>

            <p className="text-center text-caption text-[var(--text-muted)] mt-6">
                By signing up, you agree to our Terms of Service
            </p>
        </>
    );
}

function SignupFormFallback() {
    return (
        <div className="text-center">
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: "var(--gradient-primary)" }}
            >
                <div className="w-8 h-8 border-2 border-white rounded-full" />
            </div>
            <h1 className="text-display-md tracking-tight">Create your account</h1>
            <p className="text-body-sm text-[var(--text-muted)] mt-2">Loading...</p>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<SignupFormFallback />}>
            <SignupForm />
        </Suspense>
    );
}
