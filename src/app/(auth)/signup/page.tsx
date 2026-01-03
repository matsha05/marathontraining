"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // TODO: Implement actual auth with Supabase
        // Redirect to onboarding after signup
        setTimeout(() => {
            router.push('/onboarding');
        }, 1000);
    };

    return (
        <>
            {/* Logo */}
            <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-running)] flex items-center justify-center mx-auto mb-6">
                    <div className="w-8 h-8 border-3 border-white rounded-full" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
                <p className="text-[var(--text-muted)] mt-2">Start training with precision</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    <p className="text-xs text-[var(--text-muted)] mt-2">Minimum 8 characters</p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`btn btn-primary btn-lg w-full mt-6 ${loading ? 'btn-loading' : ''}`}
                >
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>
            </form>

            <p className="text-center text-body-sm text-[var(--text-muted)] mt-8">
                Already have an account?{' '}
                <Link href="/login" className="text-[var(--color-running)] font-semibold hover:underline">
                    Sign in
                </Link>
            </p>

            <p className="text-center text-xs text-[var(--text-muted)] mt-6">
                By signing up, you agree to our Terms of Service
            </p>
        </>
    );
}
