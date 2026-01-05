"use client";

import Link from 'next/link';
import Image from 'next/image';
import { SettingsIcon } from '@/components/ui/settings';
import { FlameIcon } from '@/components/ui/flame';

/**
 * AppHeader - Shared header component for all app pages
 * 
 * V2 Design System - Dark atmospheric aesthetic
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
                        <Link href="/dashboard" className="flex items-center gap-3 group">
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
                    {/* Streak badge */}
                    {streak !== undefined && streak > 0 && (
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

                    {/* Settings link */}
                    {!hideSettings && !backHref && (
                        <Link
                            href="/settings"
                            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
                            style={{ color: 'var(--v2-text-muted)' }}
                        >
                            <SettingsIcon size={22} />
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
