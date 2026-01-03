'use client';

import Link from 'next/link';
import { ActivityIcon } from '@/components/ui/activity';

/**
 * Footer - Reusable footer component for all pages
 * 
 * Consistent across landing and app pages.
 * Includes: branding, coach attribution, legal links.
 */

interface FooterProps {
    /** Show coach attribution line */
    showCoaches?: boolean;
    /** Variant for different page contexts */
    variant?: 'landing' | 'app';
}

export function Footer({ showCoaches = true, variant = 'landing' }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-12 border-t border-[var(--border-base)]">
            <div className="container-page">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
                            <ActivityIcon size={16} className="text-black" />
                        </div>
                        <span className="text-body-sm font-medium">The Long Game</span>
                    </div>

                    {/* Coach Attribution */}
                    {showCoaches && (
                        <p className="text-caption text-[var(--text-muted)] order-3 md:order-2">
                            Built on Hansons · Daniels · Seiler · Dicharry
                        </p>
                    )}

                    {/* Legal Links */}
                    <nav className="flex items-center gap-6 order-2 md:order-3">
                        <Link
                            href="/privacy"
                            className="text-caption text-[var(--text-muted)] hover:text-[var(--text-base)] transition-colors"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-caption text-[var(--text-muted)] hover:text-[var(--text-base)] transition-colors"
                        >
                            Terms
                        </Link>
                        {variant === 'landing' && (
                            <Link
                                href="/methodology"
                                className="text-caption text-[var(--text-muted)] hover:text-[var(--text-base)] transition-colors"
                            >
                                Methodology
                            </Link>
                        )}
                    </nav>
                </div>

                {/* Copyright */}
                <div className="mt-8 pt-6 border-t border-[var(--border-muted)]">
                    <p className="text-caption text-[var(--text-subtle)] text-center">
                        © {currentYear} The Long Game. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
