"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SettingsIcon } from '@/components/ui/settings';
import { FlameIcon } from '@/components/ui/flame';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase';
import type { User } from '@supabase/supabase-js';
import { useTheme } from '@/components/providers/ThemeProvider';

/**
 * AppHeader - Shared header component for all app pages
 * 
 * V3 Design System - Theme-aware with light mode default
 * 
 * Auth-aware behavior:
 * - Logged OUT: Logo → /, shows nav links + "Log In" + "Get Started"
 * - Logged IN: Logo → /dashboard, shows nav links + Settings
 */

interface AppHeaderProps {
    /** Optional custom title */
    title?: string;
    /** If provided, shows a back link */
    backHref?: string;
    /** Custom content for right side */
    rightContent?: React.ReactNode;
    /** If provided, shows streak badge */
    streak?: number;
    /** If true, hides the settings link */
    hideSettings?: boolean;
}

export function AppHeader({
    title,
    backHref,
    rightContent,
    streak,
    hideSettings = false,
}: AppHeaderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();

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

    const isLoggedIn = !!user;
    const logoHref = isLoggedIn ? '/dashboard' : '/';

    // Helper for active nav link styling
    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        if (href === '/plan') return pathname?.startsWith('/plan');
        if (href === '/methodology') return pathname === '/methodology';
        if (href === '/browse') return pathname === '/browse';
        if (href === '/settings') return pathname === '/settings';
        return false;
    };

    return (
        <header
            className="sticky top-0 z-50 border-b"
            style={{
                background: theme === 'dark'
                    ? 'rgba(8, 8, 10, 0.9)'
                    : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(12px)',
                borderColor: 'var(--border-base)'
            }}
        >
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Left side */}
                <div className="flex items-center gap-3">
                    {backHref ? (
                        <Link
                            href={backHref}
                            className="flex items-center gap-2 transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            {title ? <span className="text-sm font-medium">{title}</span> : 'Back'}
                        </Link>
                    ) : (
                        <Link href={logoHref} className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                                <Image
                                    src="/icon-192.png"
                                    alt="The Long Game"
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            </div>
                            <span className="font-semibold" style={{ color: 'var(--text-base)' }}>
                                {title || 'The Long Game'}
                            </span>
                        </Link>
                    )}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    {/* Streak badge - only show when logged in */}
                    {isLoggedIn && streak !== undefined && streak > 0 && (
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                            style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)' }}
                        >
                            <FlameIcon size={18} style={{ color: 'var(--color-accent)' }} />
                            <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>{streak}</span>
                        </div>
                    )}

                    {/* Custom right content */}
                    {rightContent}

                    {/* Nav links - show for both logged in and out */}
                    {!backHref && !loading && (
                        <nav className="hidden md:flex items-center gap-6">
                            {isLoggedIn && (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="text-sm font-medium transition-colors"
                                        style={{
                                            color: isActive('/dashboard') ? 'var(--color-accent)' : 'var(--text-base)',
                                            borderBottom: isActive('/dashboard') ? '2px solid var(--color-accent)' : 'none',
                                            paddingBottom: '2px',
                                        }}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/plan"
                                        className="text-sm font-medium transition-colors"
                                        style={{
                                            color: isActive('/plan') ? 'var(--color-accent)' : 'var(--text-base)',
                                            borderBottom: isActive('/plan') ? '2px solid var(--color-accent)' : 'none',
                                            paddingBottom: '2px',
                                        }}
                                    >
                                        Plan
                                    </Link>
                                </>
                            )}
                            <Link
                                href="/methodology"
                                className="text-sm transition-colors"
                                style={{
                                    color: isActive('/methodology') ? 'var(--color-accent)' : 'var(--text-muted)',
                                    borderBottom: isActive('/methodology') ? '2px solid var(--color-accent)' : 'none',
                                    paddingBottom: '2px',
                                }}
                            >
                                Methodology
                            </Link>
                            <Link
                                href="/browse"
                                className="text-sm transition-colors"
                                style={{
                                    color: isActive('/browse') ? 'var(--color-accent)' : 'var(--text-muted)',
                                    borderBottom: isActive('/browse') ? '2px solid var(--color-accent)' : 'none',
                                    paddingBottom: '2px',
                                }}
                            >
                                Browse
                            </Link>
                        </nav>
                    )}

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

                    {/* Auth-dependent content */}
                    {!loading && !backHref && (
                        isLoggedIn ? (
                            // LOGGED IN: Settings icon
                            !hideSettings && (
                                <Link
                                    href="/settings"
                                    className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:opacity-70"
                                    style={{ color: 'var(--text-muted)' }}
                                    aria-label="Settings"
                                >
                                    <SettingsIcon size={22} />
                                </Link>
                            )
                        ) : (
                            // LOGGED OUT: Log In + Get Started
                            <div className="flex items-center gap-3">
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
                                    Get Started
                                </Link>
                            </div>
                        )
                    )}
                </div>
            </div>
        </header>
    );
}
