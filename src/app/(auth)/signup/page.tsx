"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase';

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [loadingAction, setLoadingAction] = useState<'otp' | 'google' | 'verify' | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [resendCooldown, setResendCooldown] = useState(0);
    const nextPath = searchParams.get('next') || '/onboarding';
    const isLoading = Boolean(loadingAction);

    // Auto-submit when all 6 digits are entered
    useEffect(() => {
        const code = otp.join('');
        if (code.length === 6 && !otp.includes('')) {
            handleVerifyOtp(code);
        }
    }, [otp]);

    // Countdown timer for resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const sendOtpEmail = useCallback(async () => {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
            },
        });
        return { error };
    }, [email]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setErrorMessage('Enter your email first.');
            return;
        }

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
            setMessage('Check your email for a 6-digit code.');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to send code');
        } finally {
            setLoadingAction(null);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;

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
        setLoadingAction('verify');
        setErrorMessage(null);

        try {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: code,
                type: 'email',
            });

            if (error) {
                setErrorMessage(error.message);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                return;
            }

            router.push(nextPath);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Verification failed');
            setOtp(['', '', '', '', '', '']);
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

        // Auto-focus next input
        if (value && index < 5) {
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
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length === 6) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
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
                <h1 className="text-display-md tracking-tight">
                    {step === 'email' ? 'Create your account' : 'Enter code'}
                </h1>
                <p className="text-body-sm text-[var(--text-muted)] mt-2">
                    {step === 'email' ? 'Start training with precision' : `We sent a code to ${email}`}
                </p>
            </div>

            {step === 'email' ? (
                <>
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

                    <form onSubmit={handleSendOtp} className="space-y-4 mt-6">
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`btn btn-gradient btn-lg w-full mt-6 ${loadingAction === 'otp' ? 'btn-loading' : ''}`}
                        >
                            {loadingAction === 'otp' ? 'Sending code...' : 'Send Code'}
                        </button>
                    </form>
                </>
            ) : (
                <div className="space-y-6">
                    {/* OTP Input */}
                    <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
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
                                className="w-12 h-14 text-center text-xl font-semibold rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    {loadingAction === 'verify' && (
                        <p className="text-center text-body-sm text-[var(--text-muted)]">
                            Verifying...
                        </p>
                    )}

                    {/* Resend code */}
                    <div className="text-center">
                        {resendCooldown > 0 ? (
                            <p className="text-body-sm text-[var(--text-muted)]">
                                Resend code in {resendCooldown}s
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={loadingAction === 'otp'}
                                className="text-body-sm text-[var(--color-accent)] hover:underline disabled:opacity-50"
                            >
                                {loadingAction === 'otp' ? 'Sending...' : "Didn't get the code? Resend"}
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setStep('email');
                            setOtp(['', '', '', '', '', '']);
                            setMessage(null);
                            setErrorMessage(null);
                            setResendCooldown(0);
                        }}
                        className="btn btn-ghost w-full"
                    >
                        Use a different email
                    </button>
                </div>
            )}

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
