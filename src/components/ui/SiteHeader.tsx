'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase';
import type { User } from '@supabase/supabase-js';
import { useTheme } from '@/components/providers/ThemeProvider';
import { SettingsIcon } from '@/components/ui/settings';
import { FlameIcon } from '@/components/ui/flame';

/**
 * SiteHeader - THE single header component for the entire site
 * 
 * V3 Design System - Theme-aware with light mode default
 * 
 * Features:
 * - Explore dropdown (WODs, Training Plans, Durability, Methodology)
 * - User avatar with dropdown (Settings, Log Out)
 * - Back navigation mode
 * - Streak badge
 * - Custom right content
 * 
 * Nav structure:
 * - Logged OUT: Logo | Explore ▼ | [theme] | Log In | Get Started
 * - Logged IN: Logo | Dashboard | My Plan | Explore ▼ | [theme] | [avatar]
 * - Back mode: [←] Title
 */

// Explore menu items with SVG icons
const EXPLORE_ITEMS = [
    {
        href: '/wods',
        label: 'WOD Library',
        description: 'Runner-friendly conditioning',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 6.5h11" /><path d="M6.5 17.5h11" />
                <path d="M4 6.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                <path d="M4 22.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                <path d="M20 6.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                <path d="M20 22.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                <path d="M4 6.5v11" /><path d="M20 6.5v11" />
            </svg>
        )
    },
    {
        href: '/browse',
        label: 'Training Plans',
        description: 'Browse all coaching philosophies',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        )
    },
    {
        href: '/durability',
        label: 'Durability Tests',
        description: 'Movement screening & prehab',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
            </svg>
        )
    },
    {
        href: '/methodology',
        label: 'Methodology',
        description: 'The science behind the plans',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
        )
    },
];

interface SiteHeaderProps {
    /** Hide the auth buttons/avatar */
    hideAuth?: boolean;
    /** Optional custom title (shown next to logo or as back title) */
    title?: string;
    /** If provided, shows a back link instead of regular nav */
    backHref?: string;
    /** Custom content for right side */
    rightContent?: React.ReactNode;
    /** If provided, shows streak badge */
    streak?: number;
}

export function SiteHeader({
    hideAuth = false,
    title,
    backHref,
    rightContent,
    streak,
}: SiteHeaderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [exploreOpen, setExploreOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const exploreRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

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

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
                setExploreOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdowns on route change
    useEffect(() => {
        setExploreOpen(false);
        setUserMenuOpen(false);
    }, [pathname]);

    const isLoggedIn = !!user;
    const logoHref = isLoggedIn ? '/dashboard' : '/';

    // Get user initial for avatar
    const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

    // Handle logout
    const handleLogout = async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        setUserMenuOpen(false);
        window.location.href = '/';
    };

    // Check if path is active
    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        if (href === '/plan') return pathname?.startsWith('/plan');
        return pathname === href || pathname?.startsWith(href + '/');
    };
    const isExploreActive = EXPLORE_ITEMS.some(item => isActive(item.href));

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
                {/* Left side */}
                <div className="flex items-center gap-3">
                    {backHref ? (
                        // Back navigation mode
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
                        // Regular logo
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

                    {/* Navigation - hidden in back mode */}
                    {!backHref && !loading && (
                        <nav className="hidden md:flex items-center gap-1">
                            {/* Explore dropdown - always visible */}
                            <div className="relative" ref={exploreRef}>
                                <button
                                    onClick={() => setExploreOpen(!exploreOpen)}
                                    className="px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                                    style={{
                                        color: isExploreActive ? 'var(--color-accent)' : 'var(--text-muted)',
                                        background: exploreOpen || isExploreActive ? 'var(--bg-muted)' : 'transparent',
                                    }}
                                    aria-expanded={exploreOpen}
                                    aria-haspopup="true"
                                >
                                    Explore
                                    <svg
                                        className={`w-4 h-4 transition-transform ${exploreOpen ? 'rotate-180' : ''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown menu */}
                                {exploreOpen && (
                                    <div
                                        className="absolute top-full right-0 mt-2 w-72 rounded-xl shadow-lg overflow-hidden"
                                        style={{
                                            background: 'var(--bg-elevated)',
                                            border: '1px solid var(--border-base)',
                                        }}
                                    >
                                        <div className="p-2">
                                            {EXPLORE_ITEMS.map((item) => (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className="flex items-start gap-3 p-3 rounded-lg transition-colors"
                                                    style={{
                                                        background: isActive(item.href) ? 'var(--color-accent-subtle)' : 'transparent',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isActive(item.href)) {
                                                            e.currentTarget.style.background = 'var(--bg-muted)';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isActive(item.href)) {
                                                            e.currentTarget.style.background = 'transparent';
                                                        }
                                                    }}
                                                >
                                                    <span className="shrink-0" style={{ color: 'var(--text-muted)' }}>{item.icon}</span>
                                                    <div className="flex-1">
                                                        <p
                                                            className="text-sm font-medium"
                                                            style={{
                                                                color: isActive(item.href) ? 'var(--color-accent)' : 'var(--text-base)'
                                                            }}
                                                        >
                                                            {item.label}
                                                        </p>
                                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
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
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        )}
                    </button>

                    {/* Auth-dependent content - hidden in back mode or when hideAuth */}
                    {!hideAuth && !loading && !backHref && (
                        isLoggedIn ? (
                            // LOGGED IN: User avatar with dropdown
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                                    style={{
                                        background: 'var(--color-accent)',
                                        color: 'white',
                                        boxShadow: userMenuOpen ? '0 0 0 2px var(--color-accent-subtle)' : 'none',
                                    }}
                                    aria-expanded={userMenuOpen}
                                    aria-haspopup="true"
                                    aria-label="User menu"
                                >
                                    {userInitial}
                                </button>

                                {/* User dropdown menu */}
                                {userMenuOpen && (
                                    <div
                                        className="absolute top-full right-0 mt-2 w-56 rounded-xl shadow-lg overflow-hidden"
                                        style={{
                                            background: 'var(--bg-elevated)',
                                            border: '1px solid var(--border-base)',
                                        }}
                                    >
                                        {/* User info */}
                                        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-base)' }}>
                                            <p className="text-sm font-medium" style={{ color: 'var(--text-base)' }}>
                                                {user?.user_metadata?.full_name || 'Runner'}
                                            </p>
                                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                                {user?.email}
                                            </p>
                                        </div>

                                        {/* Menu items */}
                                        <div className="p-2">
                                            <Link
                                                href="/dashboard"
                                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                                                style={{
                                                    color: isActive('/dashboard') ? 'var(--color-accent)' : 'var(--text-base)',
                                                    background: isActive('/dashboard') ? 'var(--color-accent-subtle)' : 'transparent',
                                                }}
                                                onMouseEnter={(e) => !isActive('/dashboard') && (e.currentTarget.style.background = 'var(--bg-muted)')}
                                                onMouseLeave={(e) => !isActive('/dashboard') && (e.currentTarget.style.background = 'transparent')}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="3" width="7" height="7" />
                                                    <rect x="14" y="3" width="7" height="7" />
                                                    <rect x="14" y="14" width="7" height="7" />
                                                    <rect x="3" y="14" width="7" height="7" />
                                                </svg>
                                                Dashboard
                                            </Link>
                                            <Link
                                                href="/plan"
                                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                                                style={{
                                                    color: isActive('/plan') ? 'var(--color-accent)' : 'var(--text-base)',
                                                    background: isActive('/plan') ? 'var(--color-accent-subtle)' : 'transparent',
                                                }}
                                                onMouseEnter={(e) => !isActive('/plan') && (e.currentTarget.style.background = 'var(--bg-muted)')}
                                                onMouseLeave={(e) => !isActive('/plan') && (e.currentTarget.style.background = 'transparent')}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                    <polyline points="14 2 14 8 20 8" />
                                                    <line x1="16" y1="13" x2="8" y2="13" />
                                                    <line x1="16" y1="17" x2="8" y2="17" />
                                                    <polyline points="10 9 9 9 8 9" />
                                                </svg>
                                                My Plan
                                            </Link>

                                            <div className="my-2 border-t" style={{ borderColor: 'var(--border-base)' }} />

                                            <Link
                                                href="/settings"
                                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                                                style={{ color: 'var(--text-base)' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-muted)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <SettingsIcon size={18} />
                                                Settings
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left"
                                                style={{ color: 'var(--v3-red)' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-muted)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                                    <polyline points="16 17 21 12 16 7" />
                                                    <line x1="21" y1="12" x2="9" y2="12" />
                                                </svg>
                                                Log Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
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

// Export as AppHeader for backward compatibility during migration
export { SiteHeader as AppHeader };
