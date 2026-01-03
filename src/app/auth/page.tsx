"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase';

function AuthForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [loadingAction, setLoadingAction] = useState<'otp' | 'google' | 'verify' | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [resendCooldown, setResendCooldown] = useState(0);
    const nextPath = searchParams.get('next') || '/onboarding';
    const isLoading = Boolean(loadingAction);

    // Auto-submit when all 8 digits are entered
    useEffect(() => {
        const code = otp.join('');
        if (code.length === 8 && !otp.includes('') && loadingAction === null) {
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
        // shouldCreateUser: true handles both login AND signup
        const { error } = await supabase.auth.signInWithOtp({
            email: email.toLowerCase().trim(),
            options: {
                shouldCreateUser: true,
            },
        });
        return { error };
    }, [email]);

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
            setMessage('Check your email for an 8-digit code.');
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
        // Guard against double submission
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
                setOtp(['', '', '', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                return;
            }

            // Check if user has a plan to determine routing
            // For now, route to nextPath (which defaults to /onboarding)
            // The onboarding page will handle checking if user already has a plan
            router.push(nextPath);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Verification failed');
            setOtp(['', '', '', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoadingAction(null);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input
        if (value && index < 7) {
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
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
        if (pastedData.length === 8) {
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

    // ==============================================================
    // RENDER
    // ==============================================================

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
                <h1 className="text-display-md tracking-tight">
                    {step === 'email' ? 'Get Started' : 'Enter code'}
                </h1>
                <p className="text-body-sm text-[var(--text-muted)] mt-2">
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
                        className="btn btn-secondary w-full mb-6"
                    >
                        {loadingAction === 'google' ? 'Connecting...' : 'Continue with Google'}
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-[var(--border-muted)]" />
                        <span className="text-caption text-[var(--text-muted)]">OR</span>
                        <div className="flex-1 h-px bg-[var(--border-muted)]" />
                    </div>

                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label className="text-label block mb-2">EMAIL</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                                placeholder="you@example.com"
                                className="input w-full"
                                autoComplete="email"
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !email}
                            className="btn btn-gradient w-full"
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
                                className="w-10 h-12 text-center text-lg font-semibold rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    {/* Resend */}
                    <div className="text-center">
                        {resendCooldown > 0 ? (
                            <p className="text-body-sm text-[var(--text-muted)]">
                                Resend code in {resendCooldown}s
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={isLoading}
                                className="text-body-sm text-[var(--color-accent)] hover:underline"
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
                            setOtp(['', '', '', '', '', '', '', '']);
                            setMessage(null);
                            setErrorMessage(null);
                            setResendCooldown(0);
                        }}
                        className="btn btn-secondary w-full"
                    >
                        Use a different email
                    </button>
                </div>
            )}

            {/* Messages */}
            {message && (
                <p className="text-center text-body-sm text-[var(--color-accent)] mt-6">
                    {message}
                </p>
            )}
            {errorMessage && (
                <p className="text-center text-body-sm text-[var(--color-error)] mt-2">
                    {errorMessage}
                </p>
            )}

            {/* Terms */}
            <p className="text-center text-caption text-[var(--text-muted)] mt-8">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-[var(--text-base)]">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="underline hover:text-[var(--text-base)]">Privacy Policy</Link>
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
            <h1 className="text-display-md tracking-tight">Get Started</h1>
            <p className="text-body-sm text-[var(--text-muted)] mt-2">Loading...</p>
        </div>
    );
}

export default function AuthPage() {
    return (
        <div className="min-h-screen landing-shell flex items-center justify-center px-6 py-12">
            <div className="glass card p-8 w-full max-w-md">
                <Suspense fallback={<AuthFormFallback />}>
                    <AuthForm />
                </Suspense>
            </div>
        </div>
    );
}
