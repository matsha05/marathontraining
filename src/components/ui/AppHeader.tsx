"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SettingsIcon } from '@/components/ui/settings';
import { FlameIcon } from '@/components/ui/flame';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase';
import type { User } from '@supabase/supabase-js';

/**
 * AppHeader - Shared header component for all app pages
 * 
 * V2 Design System - Dark atmospheric aesthetic
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

    return (
        <header
            className="sticky top-0 z-50 border-b"
            style={{
                background: 'rgba(8, 8, 10, 0.8)',
                backdropFilter: 'blur(12px)',
                borderColor: 'var(--v2-border)'
            }}
        >
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Left side */}
                <div className="flex items-center gap-3">
                    {backHref ? (
                        <Link
                            href={backHref}
                            className="flex items-center gap-2 transition-colors"
                            style={{ color: 'var(--v2-text-muted)' }}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            {title ? <span className="text-sm font-medium">{title}</span> : 'Back'}
                        </Link>
                    ) : (
                        <Link href={logoHref} className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Image
                                    src="/icon-192.png"
                                    alt="The Long Game"
                                    width={32}
                                    height={32}
                                    className="object-cover opacity-70"
                                />
                            </div>
                            <span className="text-sm font-medium" style={{ color: 'var(--v2-text-secondary)' }}>
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
                            style={{ background: 'var(--v2-accent-subtle)' }}
                        >
                            <FlameIcon size={18} style={{ color: 'var(--v2-accent)' }} />
                            <span className="text-sm font-bold" style={{ color: 'var(--v2-accent)' }}>{streak}</span>
                        </div>
                    )}

                    {/* Custom right content */}
                    {rightContent}

                    {/* Nav links - show for both logged in and out */}
                    {!backHref && !loading && (
                        <nav className="hidden md:flex items-center gap-4">
                            <Link
                                href="/methodology"
                                className="text-sm transition-colors"
                                style={{ color: 'var(--v2-text-muted)' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--v2-text-secondary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--v2-text-muted)'}
                            >
                                Methodology
                            </Link>
                            <Link
                                href="/browse"
                                className="text-sm transition-colors"
                                style={{ color: 'var(--v2-text-muted)' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--v2-text-secondary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--v2-text-muted)'}
                            >
                                Browse
                            </Link>
                        </nav>
                    )}

                    {/* Auth-dependent content */}
                    {!loading && !backHref && (
                        isLoggedIn ? (
                            // LOGGED IN: Settings icon
                            !hideSettings && (
                                <Link
                                    href="/settings"
                                    className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
                                    style={{ color: 'var(--v2-text-muted)' }}
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
                                    className="text-sm transition-colors"
                                    style={{ color: 'var(--v2-text-muted)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--v2-text-secondary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--v2-text-muted)'}
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/onboarding"
                                    className="v2-btn v2-btn-primary v2-btn-sm"
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
