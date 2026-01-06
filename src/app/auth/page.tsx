"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase';
import { getSafeRedirectPath } from '@/lib/redirects';
import { hasPlan } from '@/domain/plan/service';

const OTP_LENGTH = 8;

function formatAuthError(code: string, description?: string | null) {
    if (description) return description;
    if (code === 'missing_code') return 'Missing sign-in code. Try again.';
    if (code === 'missing_supabase_env') return 'Auth is not configured yet. Add the Supabase env vars and retry.';
    if (code === 'access_denied') return 'Sign-in was canceled.';
    return code.replace(/_/g, ' ');
}

function AuthForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(() => Array.from({ length: OTP_LENGTH }, () => ''));
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [loadingAction, setLoadingAction] = useState<'otp' | 'google' | 'verify' | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [defaultNextPath, setDefaultNextPath] = useState('/onboarding');

    // Determine redirect path based on whether user has a plan
    useEffect(() => {
        const checkPlan = async () => {
            try {
                const hasExistingPlan = await hasPlan();
                setDefaultNextPath(hasExistingPlan ? '/dashboard' : '/onboarding');
            } catch {
                setDefaultNextPath('/onboarding');
            }
        };
        checkPlan();
    }, []);

    const nextPath = getSafeRedirectPath(searchParams.get('next'), defaultNextPath, { allowApi: true });
    const isLoading = Boolean(loadingAction);
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    useEffect(() => {
        if (errorParam || errorDescription) {
            setErrorMessage(formatAuthError(errorParam ?? 'auth_error', errorDescription));
        }
    }, [errorParam, errorDescription]);

    // Auto-submit when all 8 digits are entered
    useEffect(() => {
        const code = otp.join('');
        if (code.length === OTP_LENGTH && !otp.includes('') && loadingAction === null) {
            handleVerifyOtp(code);
        }
    }, [otp, loadingAction]);

    // Countdown timer for resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const sendOtpEmail = useCallback(async () => {
        const supabase = createSupabaseBrowserClient();
        const emailRedirectTo = typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
            : null;
        const { error } = await supabase.auth.signInWithOtp({
            email: email.toLowerCase().trim(),
            options: {
                shouldCreateUser: true,
                ...(emailRedirectTo ? { emailRedirectTo } : {}),
            },
        });
        return { error };
    }, [email, nextPath]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingAction('otp');
        setErrorMessage(null);
        setMessage(null);

        try {
            const { error } = await sendOtpEmail();

            if (error) {
                setErrorMessage(error.message);
                return;
            }

            setStep('otp');
            setResendCooldown(30);
            setMessage(`Check your email for a ${OTP_LENGTH}-digit code.`);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to send code');
        } finally {
            setLoadingAction(null);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0 || isLoading) return;

        setLoadingAction('otp');
        setErrorMessage(null);
        setMessage(null);

        try {
            const { error } = await sendOtpEmail();

            if (error) {
                setErrorMessage(error.message);
                return;
            }

            setResendCooldown(30);
            setMessage('New code sent!');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to resend code');
        } finally {
            setLoadingAction(null);
        }
    };


    const handleVerifyOtp = async (code: string) => {
        if (loadingAction === 'verify') return;

        setLoadingAction('verify');
        setErrorMessage(null);

        try {
            const supabase = createSupabaseBrowserClient();
            const { data, error } = await supabase.auth.verifyOtp({
                email: email.toLowerCase().trim(),
                token: code.trim(),
                type: 'email',
            });

            if (error) {
                setErrorMessage(error.message);
                setOtp(Array.from({ length: OTP_LENGTH }, () => ''));
                inputRefs.current[0]?.focus();
                return;
            }

            if (nextPath.startsWith('/api')) {
                window.location.assign(nextPath);
            } else {
                router.push(nextPath);
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Verification failed');
            setOtp(Array.from({ length: OTP_LENGTH }, () => ''));
            inputRefs.current[0]?.focus();
        } finally {
            setLoadingAction(null);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (pastedData.length === OTP_LENGTH) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoadingAction('google');
        setErrorMessage(null);
        try {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
                },
            });
            if (error) {
                setErrorMessage(error.message);
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Google sign-in failed');
        } finally {
            setLoadingAction(null);
        }
    };

    return (
        <>
            {/* Logo */}
            <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-6">
                    <Image
                        src="/icon-192.png"
                        alt="The Long Game"
                        width={64}
                        height={64}
                        className="object-cover"
                    />
                </div>
                <h1 className="v3-heading-lg">
                    {step === 'email' ? 'Get Started' : 'Enter code'}
                </h1>
                <p className="v3-body-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                    {step === 'email'
                        ? 'Enter your email to continue'
                        : `We sent a code to ${email}`}
                </p>
            </div>

            {/* Step 1: Email */}
            {step === 'email' && (
                <>
                    {/* Google OAuth */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="v3-btn v3-btn-secondary w-full mb-6"
                    >
                        {loadingAction === 'google' ? 'Connecting...' : 'Continue with Google'}
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px" style={{ background: 'var(--border-base)' }} />
                        <span className="v3-label" style={{ color: 'var(--text-muted)' }}>OR</span>
                        <div className="flex-1 h-px" style={{ background: 'var(--border-base)' }} />
                    </div>

                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="v3-form-group">
                            <label htmlFor="auth-email" className="v3-form-label">EMAIL</label>
                            <input
                                id="auth-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                                placeholder="you@example.com"
                                className="v3-input"
                                autoComplete="email"
                                autoFocus
                                aria-describedby={errorMessage ? "auth-error" : undefined}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !email}
                            className="v3-btn v3-btn-primary w-full"
                        >
                            {loadingAction === 'otp' ? 'Sending code...' : 'Continue'}
                        </button>
                    </form>
                </>
            )}

            {/* Step 2: OTP */}
            {step === 'otp' && (
                <div className="space-y-6">
                    {/* OTP Input */}
                    <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                disabled={loadingAction === 'verify'}
                                className="w-10 h-12 text-center text-lg font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                style={{
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-base)',
                                    color: 'var(--text-base)',
                                }}
                                autoFocus={index === 0}
                                aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                            />
                        ))}
                    </div>

                    {/* Resend */}
                    <div className="text-center">
                        {resendCooldown > 0 ? (
                            <p className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>
                                Resend code in {resendCooldown}s
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={isLoading}
                                className="v3-body-sm v3-accent hover:underline"
                            >
                                Didn&apos;t get the code? Resend
                            </button>
                        )}
                    </div>

                    {/* Back to email */}
                    <button
                        type="button"
                        onClick={() => {
                            setStep('email');
                            setOtp(Array.from({ length: OTP_LENGTH }, () => ''));
                            setMessage(null);
                            setErrorMessage(null);
                            setResendCooldown(0);
                        }}
                        className="v3-btn v3-btn-secondary w-full"
                    >
                        Use a different email
                    </button>
                </div>
            )}

            {/* Messages */}
            {message && (
                <p className="text-center v3-body-sm v3-accent mt-6">
                    {message}
                </p>
            )}
            {errorMessage && (
                <p
                    id="auth-error"
                    className="text-center v3-body-sm mt-2"
                    style={{ color: 'var(--v3-error)' }}
                    role="alert"
                    aria-live="polite"
                >
                    {errorMessage}
                </p>
            )}

            {/* Terms */}
            <p className="text-center v3-body-sm mt-8" style={{ color: 'var(--text-muted)' }}>
                By continuing, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-[var(--text-muted)]">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="underline hover:text-[var(--text-muted)]">Privacy Policy</Link>
            </p>
        </>
    );
}

function AuthFormFallback() {
    return (
        <div className="text-center">
            <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-6">
                <Image
                    src="/icon-192.png"
                    alt="The Long Game"
                    width={64}
                    height={64}
                    className="object-cover"
                />
            </div>
            <h1 className="v3-heading-lg">Get Started</h1>
            <p className="v3-body-sm mt-2" style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
    );
}

export default function AuthPage() {
    return (
        <div className="v3-root min-h-screen flex items-center justify-center px-6 py-12">
            <div className="v3-card p-8 w-full max-w-md">
                <Suspense fallback={<AuthFormFallback />}>
                    <AuthForm />
                </Suspense>
            </div>
        </div>
    );
}
