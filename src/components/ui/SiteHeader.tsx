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
 * V2 Design System - Dark atmospheric aesthetic
 * Includes: logo, nav links, theme toggle, auth CTAs
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
        <header
            className="sticky top-0 left-0 right-0 z-50 border-b"
            style={{
                background: 'rgba(8, 8, 10, 0.8)',
                backdropFilter: 'blur(12px)',
                borderColor: 'var(--v2-border)'
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
                            className="object-cover opacity-70"
                        />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--v2-text-secondary)' }}>
                        The Long Game
                    </span>
                </Link>

                {/* Right - Nav + Actions */}
                <div className="flex items-center gap-6">
                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/methodology"
                            className="text-xs transition-colors"
                            style={{ color: 'var(--v2-text-muted)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--v2-text-secondary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--v2-text-muted)'}
                        >
                            Methodology
                        </Link>
                        <Link
                            href="/philosophy"
                            className="text-xs transition-colors"
                            style={{ color: 'var(--v2-text-muted)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--v2-text-secondary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--v2-text-muted)'}
                        >
                            Find Your Coach
                        </Link>
                    </nav>

                    {/* Theme Toggle */}
                    {onToggleTheme && (
                        <button
                            onClick={onToggleTheme}
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: 'var(--v2-text-muted)' }}
                            aria-label="Toggle theme"
                        >
                            {isDark ? (
                                <SunIcon size={18} />
                            ) : (
                                <MoonIcon size={18} />
                            )}
                        </button>
                    )}

                    {/* Auth CTAs */}
                    {!hideAuth && !loading && (
                        <div className="flex items-center gap-3">
                            {user ? (
                                <Link href="/dashboard" className="v2-btn v2-btn-primary v2-btn-sm">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/auth"
                                    className="text-xs transition-colors"
                                    style={{ color: 'white' }}
                                >
                                    Get Started →
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
