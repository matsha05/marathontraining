'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase';
import type { User } from '@supabase/supabase-js';
import { useTheme } from '@/components/providers/ThemeProvider';

/**
 * SiteHeader - Premium header for marketing/landing pages
 * 
 * V3 Design System - Theme-aware with light mode default
 * Includes: logo, nav links, theme toggle, auth CTAs
 */

interface SiteHeaderProps {
    /** Hide the auth buttons */
    hideAuth?: boolean;
}

export function SiteHeader({ hideAuth = false }: SiteHeaderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { theme, toggleTheme } = useTheme();

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
        <header
            className="sticky top-0 left-0 right-0 z-50 border-b"
            style={{
                background: theme === 'dark'
                    ? 'rgba(8, 8, 10, 0.9)'
                    : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(12px)',
                borderColor: 'var(--border-base)'
            }}
        >
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Left - Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Image
                            src="/icon-192.png"
                            alt="The Long Game"
                            width={32}
                            height={32}
                            className="object-cover"
                            style={{ opacity: theme === 'dark' ? 0.7 : 0.9 }}
                        />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                        The Long Game
                    </span>
                </Link>

                {/* Right - Nav + Actions */}
                <div className="flex items-center gap-6">
                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/methodology"
                            className="text-sm transition-colors hover:opacity-70"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Methodology
                        </Link>
                        <Link
                            href="/browse"
                            className="text-sm transition-colors hover:opacity-70"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Browse
                        </Link>
                    </nav>

                    {/* Theme Toggle - Always visible */}
                    <button
                        onClick={toggleTheme}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                        style={{
                            background: 'var(--bg-muted)',
                            color: 'var(--text-muted)'
                        }}
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'dark' ? (
                            // Sun icon for dark mode (switch to light)
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                        ) : (
                            // Moon icon for light mode (switch to dark)
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        )}
                    </button>

                    {/* Auth CTAs */}
                    {!hideAuth && !loading && (
                        <div className="flex items-center gap-3">
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    style={{
                                        background: 'var(--color-accent)',
                                        color: 'white'
                                    }}
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/auth"
                                        className="text-sm transition-colors hover:opacity-70"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href="/onboarding"
                                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                        style={{
                                            background: 'var(--color-accent)',
                                            color: 'white'
                                        }}
                                    >
                                        Get Started →
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
