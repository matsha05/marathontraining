"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Landing Page Showcase - Internal Design Directory
 * V2 Design System - 100% token usage
 * 
 * Keyboard shortcuts:
 * - ← → : Navigate between cards
 * - Enter : Open selected landing page
 */

interface LandingOption {
    id: string;
    name: string;
    description: string;
    route: string;
    aesthetic: string;
    tags: string[];
}

const LANDING_OPTIONS: LandingOption[] = [
    {
        id: "week",
        name: "Week",
        description: "Animated hero with staggered reveals and subtle glow. Full 12-coach methodology on scroll.",
        route: "/landing/week",
        aesthetic: "Motion • Complete",
        tags: ["animation", "methodology", "polished"],
    },
];


export default function LandingShowcase() {
    const router = useRouter();
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    // Simple keyboard navigation: ← → and Enter
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const total = LANDING_OPTIONS.length;

            if (e.key === "ArrowRight") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % total);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + total) % total);
            } else if (e.key === "Enter") {
                e.preventDefault();
                router.push(LANDING_OPTIONS[selectedIndex].route);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedIndex, router]);

    // Scroll selected card into view
    useEffect(() => {
        cardRefs.current[selectedIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
        });
    }, [selectedIndex]);

    return (
        <div className="v3-root min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}>
            {/* Subtle grid background */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(var(--border-base) 1px, transparent 1px),
                                      linear-gradient(90deg, var(--border-base) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            />

            {/* Header */}
            <header
                className="sticky top-0 z-50 backdrop-blur-xl"
                style={{
                    borderBottom: '1px solid var(--border-base)',
                    background: 'rgba(8, 8, 10, 0.8)'
                }}
            >
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-lg overflow-hidden">
                            <Image
                                src="/icon-192.png"
                                alt="The Long Game"
                                width={36}
                                height={36}
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h1
                                className="text-sm font-semibold tracking-tight"
                                style={{ color: 'var(--text-base)' }}
                            >
                                The Long Game
                            </h1>
                            <p
                                className="text-[10px] uppercase tracking-widest"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Design Showcase
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <span
                            className="text-xs font-mono"
                            style={{ color: 'var(--text-subtle)' }}
                        >
                            {LANDING_OPTIONS.length} variations
                        </span>
                        <Link
                            href="/"
                            className="text-xs transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            ← Back to App
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-16">
                {/* Title Section */}
                <div className="mb-16">
                    <p
                        className="text-[10px] uppercase tracking-[0.2em] mb-4 font-mono"
                        style={{ color: 'var(--text-subtle)' }}
                    >
                        Internal Design Directory
                    </p>
                    <h2
                        className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
                        style={{ color: 'var(--text-base)' }}
                    >
                        Landing Page Options
                    </h2>
                    <p
                        className="text-lg max-w-2xl mb-4"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Browse different design directions for the landing experience.
                        Click any card to preview the full page.
                    </p>
                    <div
                        className="flex items-center gap-4 text-xs font-mono"
                        style={{ color: 'var(--text-subtle)' }}
                    >
                        <span className="flex items-center gap-1.5">
                            <kbd
                                className="px-1.5 py-0.5 rounded"
                                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-base-hover)' }}
                            >
                                ←
                            </kbd>
                            <kbd
                                className="px-1.5 py-0.5 rounded"
                                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-base-hover)' }}
                            >
                                →
                            </kbd>
                            <span className="ml-1">navigate</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <kbd
                                className="px-1.5 py-0.5 rounded"
                                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-base-hover)' }}
                            >
                                ↵
                            </kbd>
                            <span className="ml-1">open</span>
                        </span>
                    </div>
                </div>

                {/* Grid of Options */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {LANDING_OPTIONS.map((option, index) => {
                        const isSelected = selectedIndex === index;
                        return (
                            <Link
                                key={option.id}
                                href={option.route}
                                ref={(el) => { cardRefs.current[index] = el; }}
                                className="group relative block outline-none transition-all duration-200"
                                style={{
                                    borderRadius: 'var(--v3-radius-xl)',
                                    boxShadow: isSelected ? `0 0 0 2px var(--color-accent), 0 0 0 4px var(--bg-base)` : 'none'
                                }}
                                onMouseEnter={() => {
                                    setHoveredId(option.id);
                                    setSelectedIndex(index);
                                }}
                                onMouseLeave={() => setHoveredId(null)}
                                onFocus={() => setSelectedIndex(index)}
                            >
                                <div
                                    className="relative overflow-hidden rounded-2xl border transition-all duration-300"
                                    style={{
                                        background: 'var(--bg-base)',
                                        borderColor: isSelected ? 'var(--color-accent)' : 'var(--border-base)',
                                    }}
                                >
                                    {/* Card Content */}
                                    <div className="p-6 pb-8">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <h3
                                                    className="text-xl font-semibold mb-1 tracking-tight"
                                                    style={{ color: 'var(--text-base)' }}
                                                >
                                                    {option.name}
                                                </h3>
                                                <p
                                                    className="text-[10px] uppercase tracking-widest font-mono"
                                                    style={{ color: 'var(--text-subtle)' }}
                                                >
                                                    {option.aesthetic}
                                                </p>
                                            </div>
                                            <div
                                                className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300"
                                                style={{ borderColor: 'var(--border-base-hover)' }}
                                            >
                                                <svg
                                                    className="w-4 h-4 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                                    style={{ color: 'var(--text-muted)' }}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7V17" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p
                                            className="text-sm leading-relaxed mb-6"
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            {option.description}
                                        </p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            {option.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-full font-mono"
                                                    style={{
                                                        color: 'var(--text-subtle)',
                                                        border: '1px solid var(--border-base-hover)'
                                                    }}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bottom Glow Effect */}
                                    <div
                                        className="absolute bottom-0 left-0 right-0 h-px transition-opacity duration-300"
                                        style={{
                                            background: `linear-gradient(90deg, transparent, var(--color-accent), transparent)`,
                                            opacity: hoveredId === option.id || isSelected ? 1 : 0
                                        }}
                                    />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Footer Note */}
                <div
                    className="mt-16 pt-12"
                    style={{ borderTop: '1px solid var(--border-base)' }}
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <p
                                className="text-xs font-mono mb-2"
                                style={{ color: 'var(--text-subtle)' }}
                            >
                                Design feedback? Iterate on any variation.
                            </p>
                            <p
                                className="text-xs"
                                style={{ color: 'var(--text-subtle)' }}
                            >
                                These designs evolve based on your preferences and feedback.
                            </p>
                        </div>
                        <div
                            className="text-[10px] font-mono"
                            style={{ color: 'var(--text-subtle)' }}
                        >
                            Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
