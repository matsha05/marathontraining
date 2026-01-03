'use client';

import Link from 'next/link';
import Image from 'next/image';

/**
 * Footer - Reusable footer component for all pages
 * 
 * Clean single-line layout with logo, legal links, and copyright.
 */

interface FooterProps {
    /** Variant for different page contexts */
    variant?: 'landing' | 'app';
}

export function Footer({ variant = 'landing' }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-8 border-t border-[var(--border-base)]">
            <div className="container-page">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Brand + Copyright */}
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg overflow-hidden">
                            <Image
                                src="/icon-192.png"
                                alt="The Long Game"
                                width={28}
                                height={28}
                                className="object-cover"
                            />
                        </div>
                        <span className="text-caption text-[var(--text-muted)]">
                            © {currentYear} The Long Game
                        </span>
                    </div>

                    {/* Legal Links */}
                    <nav className="flex items-center gap-6">
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
            </div>
        </footer>
    );
}
