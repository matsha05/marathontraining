"use client";

import Link from 'next/link';

/**
 * SiteFooter - Minimal, elegant footer for site-wide use
 * 
 * V3 Design System - Consistent with header styling
 * Single line, clean, Apple-tier minimalism
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

                    {/* Links */}
                    <nav className="flex items-center gap-6">
                        <Link
                            href="/methodology"
                            className="v3-body-xs transition-colors hover:opacity-70"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Methodology
                        </Link>
                        <Link
                            href="/browse"
                            className="v3-body-xs transition-colors hover:opacity-70"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Browse Plans
                        </Link>
                        <a
                            href="mailto:support@thelonggame.run"
                            className="v3-body-xs transition-colors hover:opacity-70"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Contact
                        </a>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
