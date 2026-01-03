"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // TODO: Implement actual auth with Supabase
        // For now, just redirect to dashboard
        setTimeout(() => {
            router.push('/dashboard');
        }, 1000);
    };

    return (
        <>
            {/* Logo */}
            <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-running)] flex items-center justify-center mx-auto mb-6">
                    <div className="w-8 h-8 border-3 border-white rounded-full" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-[var(--text-secondary)] mt-2">Sign in to continue your training</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="label block mb-2">Email</label>
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
                    <label className="label block mb-2">Password</label>
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
                    disabled={loading}
                    className="btn btn-primary btn-lg w-full mt-6 disabled:opacity-50"
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <p className="text-center text-sm text-[var(--text-secondary)] mt-8">
                Don't have an account?{' '}
                <Link href="/signup" className="text-[var(--color-running)] font-semibold hover:underline">
                    Sign up
                </Link>
            </p>
        </>
    );
}
