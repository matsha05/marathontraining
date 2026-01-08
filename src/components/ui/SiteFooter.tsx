"use client";

import Link from 'next/link';

/**
 * SiteFooter - Minimal, elegant footer for site-wide use
 * 
 * V3 Design System - Consistent with header styling
 * Links match the Explore menu for consistency across the site
 */

export function SiteFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            className="border-t mt-auto"
            style={{
                borderColor: 'var(--border-base)',
                background: 'var(--bg-base)',
            }}
        >
            <div className="max-w-5xl mx-auto px-6 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Copyright */}
                    <p className="v3-body-xs" style={{ color: 'var(--text-subtle)' }}>
                        © {currentYear} The Long Game. All rights reserved.
                    </p>

                    {/* Primary nav - matches Explore menu */}
                    <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                        <Link
                            href="/wods"
                            className="v3-body-xs transition-colors hover:opacity-70"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            WODs
                        </Link>
                        <Link
                            href="/browse"
                            className="v3-body-xs transition-colors hover:opacity-70"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Training Plans
                        </Link>
                        <Link
                            href="/durability"
                            className="v3-body-xs transition-colors hover:opacity-70"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Durability
                        </Link>
                        <Link
                            href="/methodology"
                            className="v3-body-xs transition-colors hover:opacity-70"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Methodology
                        </Link>
                    </nav>

                    {/* Legal links */}
                    <nav className="flex items-center gap-4">
                        <Link
                            href="/privacy"
                            className="v3-body-xs transition-colors hover:opacity-70"
                            style={{ color: 'var(--text-subtle)' }}
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            className="v3-body-xs transition-colors hover:opacity-70"
                            style={{ color: 'var(--text-subtle)' }}
                        >
                            Terms
                        </Link>
                        <a
                            href="mailto:support@thelonggame.win"
                            className="v3-body-xs transition-colors hover:opacity-70"
                            style={{ color: 'var(--text-subtle)' }}
                        >
                            Contact
                        </a>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
