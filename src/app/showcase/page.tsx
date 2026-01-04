"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Landing Page Showcase - Internal Design Directory
 * 
 * A sleek, dark-themed gallery for browsing and previewing
 * different landing page design options for The Long Game.
 * 
 * Keyboard shortcuts:
 * - ← → ↑ ↓ : Navigate between cards
 * - Enter : Open selected landing page
 */

interface LandingOption {
    id: string;
    name: string;
    description: string;
    route: string;
    aesthetic: string;
    tags: string[];
    gradient: string;
}

const LANDING_OPTIONS: LandingOption[] = [
    {
        id: "week",
        name: "Week",
        description: "The core. Shows what a training week looks like. Ultra-minimal, product speaks.",
        route: "/landing/week",
        aesthetic: "Calendar • Week View • Clean",
        tags: ["schedule", "preview", "sleek"],
        gradient: "linear-gradient(135deg, #08080a 0%, #0c0c10 100%)",
    },
    {
        id: "paces",
        name: "Paces",
        description: "Shows your training paces calculated from race time. VDOT zones.",
        route: "/landing/paces",
        aesthetic: "Paces • VDOT • Zones",
        tags: ["paces", "vdot", "zones"],
        gradient: "linear-gradient(135deg, #08080a 0%, #0a0a10 100%)",
    },
    {
        id: "phases",
        name: "Phases",
        description: "16-week program visualization. Base → Build → Peak → Taper.",
        route: "/landing/phases",
        aesthetic: "Timeline • Phases • Program",
        tags: ["timeline", "phases", "program"],
        gradient: "linear-gradient(135deg, #08080a 0%, #0a0a12 100%)",
    },
    {
        id: "workout",
        name: "Workout",
        description: "Single workout breakdown. Warmup, work, cooldown. Every detail.",
        route: "/landing/workout",
        aesthetic: "Single Workout • Detail",
        tags: ["workout", "detail", "breakdown"],
        gradient: "linear-gradient(135deg, #08080a 0%, #0c0c12 100%)",
    },
    {
        id: "coaches",
        name: "Coaches",
        description: "The methodology. Daniels, Hansons, Seiler, Dicharry. Who built this.",
        route: "/landing/coaches",
        aesthetic: "Methodology • Coaches",
        tags: ["coaches", "methodology", "research"],
        gradient: "linear-gradient(135deg, #08080a 0%, #0b0b10 100%)",
    },
    {
        id: "complete",
        name: "Complete",
        description: "Paces + Week side by side. The full picture in one view.",
        route: "/landing/complete",
        aesthetic: "Combined • Complete • Both",
        tags: ["combined", "complete", "paces-week"],
        gradient: "linear-gradient(135deg, #08080a 0%, #0c0c14 100%)",
    },
    {
        id: "prime",
        name: "Prime",
        description: "Curiosity-inducing hero + Week preview. Scroll reveals methodology + features.",
        route: "/landing/prime",
        aesthetic: "Curiosity • Scroll • Complete",
        tags: ["curiosity", "scroll", "full"],
        gradient: "linear-gradient(135deg, #08080a 0%, #0a0a12 100%)",
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
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Subtle grid background */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            />

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
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
                            <h1 className="text-sm font-semibold text-white/90 tracking-tight">The Long Game</h1>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Design Showcase</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="text-xs text-white/30 font-mono">
                            {LANDING_OPTIONS.length} variations
                        </span>
                        <Link
                            href="/"
                            className="text-xs text-white/50 hover:text-white transition-colors"
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
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4 font-mono">
                        Internal Design Directory
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold text-white/95 tracking-tight mb-4">
                        Landing Page Options
                    </h2>
                    <p className="text-lg text-white/40 max-w-2xl mb-4">
                        Browse different design directions for the landing experience.
                        Click any card to preview the full page.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-white/25 font-mono">
                        <span className="flex items-center gap-1.5">
                            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">←</kbd>
                            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">→</kbd>
                            <span className="ml-1">navigate</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">↵</kbd>
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
                                className={`group relative block outline-none transition-all duration-200 ${isSelected ? "ring-2 ring-[#19e38c] ring-offset-2 ring-offset-[#050505] rounded-2xl" : ""
                                    }`}
                                onMouseEnter={() => {
                                    setHoveredId(option.id);
                                    setSelectedIndex(index);
                                }}
                                onMouseLeave={() => setHoveredId(null)}
                                onFocus={() => setSelectedIndex(index)}
                            >
                                <div
                                    className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${isSelected ? "border-[#19e38c]/50" : "border-white/5 hover:border-white/15"
                                        }`}
                                    style={{
                                        background: option.gradient,
                                    }}
                                >
                                    {/* Card Content */}
                                    <div className="p-6 pb-8">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <h3 className="text-xl font-semibold text-white/90 mb-1 tracking-tight">
                                                    {option.name}
                                                </h3>
                                                <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono">
                                                    {option.aesthetic}
                                                </p>
                                            </div>
                                            <div
                                                className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/5"
                                            >
                                                <svg
                                                    className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7V17" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-white/50 leading-relaxed mb-6">
                                            {option.description}
                                        </p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            {option.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/30 border border-white/10 rounded-full font-mono"
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
                                            background: 'linear-gradient(90deg, transparent, rgba(25,227,140,0.5), transparent)',
                                            opacity: hoveredId === option.id || isSelected ? 1 : 0
                                        }}
                                    />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Footer Note */}
                <div className="mt-16 pt-12 border-t border-white/5">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <p className="text-xs text-white/30 font-mono mb-2">
                                Design feedback? Iterate on any variation.
                            </p>
                            <p className="text-xs text-white/20">
                                These designs evolve based on your preferences and feedback.
                            </p>
                        </div>
                        <div className="text-[10px] text-white/20 font-mono">
                            Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
