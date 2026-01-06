'use client';

import Link from 'next/link';
import Image from 'next/image';

/**
 * Footer - Reusable footer component
 * 
 * V2 Design System - Clean single-line layout matching Week aesthetic
 */

interface FooterProps {
    /** Variant for different page contexts */
    variant?: 'landing' | 'app';
}

export function Footer({ variant = 'landing' }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            className="px-6 py-6 border-t"
            style={{ borderColor: 'var(--border-base)' }}
        >
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Brand + Copyright */}
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg overflow-hidden opacity-60">
                        <Image
                            src="/icon-192.png"
                            alt="The Long Game"
                            width={24}
                            height={24}
                            className="object-cover"
                        />
                    </div>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        © {currentYear} The Long Game
                    </span>
                </div>

                {/* Legal Links */}
                <nav className="flex items-center gap-6">
                    <Link
                        href="/privacy"
                        className="text-[10px] transition-colors hover:opacity-80"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Privacy
                    </Link>
                    <Link
                        href="/terms"
                        className="text-[10px] transition-colors hover:opacity-80"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Terms
                    </Link>
                    {variant === 'landing' && (
                        <Link
                            href="/methodology"
                            className="text-[10px] transition-colors hover:opacity-80"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Methodology
                        </Link>
                    )}
                </nav>
            </div>
        </footer>
    );
}
