'use client';

import { useState } from 'react';
import { Drawer } from 'vaul';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu,
    X,
    Home,
    CalendarDays,
    Dumbbell,
    BookOpen,
    Settings,
    LogOut,
    ChevronRight,
    Compass,
    Library,
    FlaskConical,
    Flame,
} from 'lucide-react';
import { AvatarDisplay } from './AvatarDisplay';
import { useHaptics } from '@/hooks/useHaptics';

interface MobileNavProps {
    user?: {
        email: string;
        name?: string;
        avatarId?: string;
    } | null;
    onSignOut?: () => void;
}

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/plan', label: 'My Plan', icon: CalendarDays },
    { href: '/durability', label: 'Durability Lab', icon: FlaskConical },
    { href: '/wods', label: 'WOD Library', icon: Dumbbell },
];

const EXPLORE_ITEMS = [
    { href: '/browse', label: 'Browse Plans', icon: Library },
    { href: '/methodology', label: 'Methodology', icon: BookOpen },
];

export function MobileNav({ user, onSignOut }: MobileNavProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const { hapticTap } = useHaptics();

    const isActive = (href: string) => pathname?.startsWith(href);

    return (
        <Drawer.Root open={open} onOpenChange={setOpen}>
            <Drawer.Trigger asChild>
                <button
                    onClick={() => hapticTap()}
                    className="md:hidden flex items-center justify-center touch-target p-2 -ml-2 rounded-lg transition-colors hover:bg-[var(--bg-muted)]"
                    aria-label="Open navigation menu"
                >
                    <Menu className="w-6 h-6" style={{ color: 'var(--text-base)' }} />
                </button>
            </Drawer.Trigger>

            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-40" />
                <Drawer.Content
                    className="fixed inset-x-0 bottom-0 z-50 mt-24 flex h-[85vh] flex-col rounded-t-2xl safe-area-bottom will-change-transform"
                    style={{ background: 'var(--bg-base)' }}
                >
                    {/* Drag Handle */}
                    <div className="mx-auto mt-3 h-1 w-12 flex-shrink-0 rounded-full" style={{ background: 'var(--border-base)' }} />

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4">
                        <Drawer.Title className="text-lg font-semibold" style={{ color: 'var(--text-base)' }}>
                            Navigation
                        </Drawer.Title>
                        <button
                            onClick={() => {
                                hapticTap();
                                setOpen(false);
                            }}
                            className="p-2 rounded-lg touch-target-sm transition-colors hover:bg-[var(--bg-muted)]"
                            aria-label="Close navigation"
                        >
                            <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8">
                        {/* User Profile Section */}
                        {user && (
                            <div className="mb-6 p-4 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                                <div className="flex items-center gap-3">
                                    <AvatarDisplay
                                        avatarId={user.avatarId}
                                        name={user.name || 'Runner'}
                                        size={48}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate" style={{ color: 'var(--text-base)' }}>
                                            {user.name || 'Runner'}
                                        </p>
                                        <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Main Navigation */}
                        <nav className="space-y-1 mb-6">
                            <p className="px-3 mb-2 text-xs uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>
                                Training
                            </p>
                            {NAV_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-3 px-3 py-3 rounded-xl touch-target transition-colors"
                                        style={{
                                            background: active ? 'var(--color-accent-subtle)' : 'transparent',
                                            color: active ? 'var(--color-accent)' : 'var(--text-base)',
                                        }}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                        {active && (
                                            <motion.div
                                                layoutId="activeNav"
                                                className="ml-auto w-1.5 h-1.5 rounded-full"
                                                style={{ background: 'var(--color-accent)' }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Explore Section */}
                        <nav className="space-y-1 mb-6">
                            <p className="px-3 mb-2 text-xs uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>
                                Explore
                            </p>
                            {EXPLORE_ITEMS.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-3 px-3 py-3 rounded-xl touch-target transition-colors hover:bg-[var(--bg-muted)]"
                                        style={{ color: 'var(--text-base)' }}
                                    >
                                        <Icon className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                        <span className="font-medium">{item.label}</span>
                                        <ChevronRight className="w-4 h-4 ml-auto" style={{ color: 'var(--text-subtle)' }} />
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Settings & Account */}
                        <nav className="space-y-1 pt-4" style={{ borderTop: '1px solid var(--border-base)' }}>
                            <Link
                                href="/settings"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl touch-target transition-colors hover:bg-[var(--bg-muted)]"
                                style={{ color: 'var(--text-base)' }}
                            >
                                <Settings className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                <span className="font-medium">Settings</span>
                            </Link>

                            {user && onSignOut && (
                                <button
                                    onClick={() => {
                                        setOpen(false);
                                        onSignOut();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl touch-target transition-colors hover:bg-[var(--bg-muted)]"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-medium">Sign Out</span>
                                </button>
                            )}
                        </nav>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
