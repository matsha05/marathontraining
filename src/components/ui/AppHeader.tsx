"use client";

import Link from 'next/link';
import { SettingsIcon } from '@/components/ui/settings';
import { ActivityIcon } from '@/components/ui/activity';
import { FlameIcon } from '@/components/ui/flame';

/**
 * AppHeader - Shared header component for all app pages
 * 
 * Provides consistent navigation, branding, and optional streak display
 */

interface AppHeaderProps {
    /** Optional custom title - if not provided, shows "The Long Game" with logo */
    title?: string;
    /** If provided, shows a back link to this href */
    backHref?: string;
    /** Custom content for right side of header */
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
    return (
        <header className="sticky top-0 z-50 glass border-b border-[var(--border-muted)]">
            <div className="container-page h-16 flex items-center justify-between">
                {/* Left side - Logo/Title or Back link */}
                <div className="flex items-center gap-3">
                    {backHref ? (
                        <Link
                            href={backHref}
                            className="text-[var(--text-muted)] hover:text-[var(--text-base)] flex items-center gap-2 tap-target"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            {title ? <span className="text-heading-sm">{title}</span> : 'Back'}
                        </Link>
                    ) : (
                        <>
                            <div className="w-9 h-9 rounded-xl bg-[var(--color-accent)] flex items-center justify-center">
                                <ActivityIcon size={20} className="text-black" />
                            </div>
                            <span className="text-heading-sm">{title || 'The Long Game'}</span>
                        </>
                    )}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    {/* Streak badge */}
                    {streak !== undefined && streak > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-accent)]/15">
                            <FlameIcon size={18} className="text-[var(--color-accent)]" />
                            <span className="text-body-sm font-bold text-[var(--color-accent)]">{streak}</span>
                        </div>
                    )}

                    {/* Custom right content */}
                    {rightContent}

                    {/* Settings link */}
                    {!hideSettings && !backHref && (
                        <Link href="/settings" className="tap-target flex items-center justify-center">
                            <SettingsIcon
                                size={22}
                                className="text-[var(--text-muted)] hover:text-[var(--text-base)]"
                            />
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
