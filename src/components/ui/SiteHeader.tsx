'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SunIcon } from '@/components/ui/sun';
import { MoonIcon } from '@/components/ui/moon';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase';
import type { User } from '@supabase/supabase-js';

/**
 * SiteHeader - Premium header for marketing/landing pages
 * 
 * Includes: logo, nav links, theme toggle, auth CTAs
 * Shows different UI when user is logged in
 */

interface SiteHeaderProps {
    /** Current theme state */
    isDark?: boolean;
    /** Toggle theme callback */
    onToggleTheme?: () => void;
    /** Hide the auth buttons */
    hideAuth?: boolean;
}

export function SiteHeader({ isDark, onToggleTheme, hideAuth = false }: SiteHeaderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createSupabaseBrowserClient();

        // Get initial session
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <header className="sticky top-0 left-0 right-0 z-50 glass border-b border-[var(--border-muted)]">
            <div className="container-page h-[var(--header-height)] flex items-center justify-between">
                {/* Left - Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Image
                            src="/icon-192.png"
                            alt="The Long Game"
                            width={40}
                            height={40}
                            className="object-cover"
                        />
                    </div>
                    <span className="text-heading-sm font-semibold tracking-tight">The Long Game</span>
                </Link>

                {/* Right - Nav + Actions */}
                <div className="flex items-center gap-6">
                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/methodology"
                            className="text-body-sm text-[var(--text-muted)] hover:text-[var(--text-base)] transition-colors"
                        >
                            Methodology
                        </Link>
                    </nav>

                    {/* Theme Toggle */}
                    {onToggleTheme && (
                        <button
                            onClick={onToggleTheme}
                            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--bg-muted)] transition-colors"
                            aria-label="Toggle theme"
                        >
                            {isDark ? (
                                <SunIcon size={18} className="text-[var(--text-muted)]" />
                            ) : (
                                <MoonIcon size={18} className="text-[var(--text-muted)]" />
                            )}
                        </button>
                    )}

                    {/* Auth CTAs - show different UI based on login state */}
                    {!hideAuth && !loading && (
                        <div className="flex items-center gap-3">
                            {user ? (
                                // Logged in - show Dashboard button
                                <Link href="/dashboard" className="btn btn-gradient">
                                    Dashboard
                                </Link>
                            ) : (
                                // Not logged in - show login/signup
                                <>
                                    <Link href="/login" className="btn btn-ghost">
                                        Log in
                                    </Link>
                                    <Link href="/onboarding" className="btn btn-gradient">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
