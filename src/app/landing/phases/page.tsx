"use client";

import Link from "next/link";
import Image from "next/image";
import { useLandingNav } from "../useLandingNav";

/**
 * Phases Landing Page (Week template)
 * 
 * Same aesthetic as Week, shows the 16-week program phases.
 */

export default function PhasesLanding() {
    useLandingNav("/landing/phases");

    const phases = [
        { name: "Base", weeks: 4, color: "#3a6bff" },
        { name: "Build", weeks: 6, color: "#19e38c" },
        { name: "Peak", weeks: 4, color: "#f59e0b" },
        { name: "Taper", weeks: 2, color: "#8b5cf6" },
    ];

    return (
        <div className="min-h-screen bg-[#08080a] text-white flex flex-col">
            {/* Title Badge */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Phases</span>
            </div>

            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-5">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link href="/showcase" className="text-xs text-white/20 hover:text-white/40 transition-colors">
                        ←
                    </Link>
                    <Image
                        src="/icon-192.png"
                        alt="The Long Game"
                        width={22}
                        height={22}
                        className="rounded opacity-50"
                    />
                    <Link href="/auth" className="text-xs text-white/20 hover:text-white/40 transition-colors">
                        →
                    </Link>
                </div>
            </nav>

            {/* Main - Phases */}
            <main className="flex-1 flex items-center justify-center px-6 py-24">
                <div className="w-full max-w-3xl">
                    {/* Label */}
                    <p className="text-xs text-white/20 mb-8 text-center font-mono">
                        16 Weeks · 5K to Ultra
                    </p>

                    {/* Phase bars */}
                    <div className="flex gap-1 mb-6">
                        {phases.map((phase) => (
                            Array.from({ length: phase.weeks }).map((_, i) => (
                                <div
                                    key={`${phase.name}-${i}`}
                                    className="flex-1 h-12 rounded"
                                    style={{ backgroundColor: `${phase.color}15` }}
                                />
                            ))
                        ))}
                    </div>

                    {/* Phase labels */}
                    <div className="flex gap-1 mb-12">
                        {phases.map((phase) => (
                            <div
                                key={phase.name}
                                className="text-center"
                                style={{ flex: phase.weeks }}
                            >
                                <p className="text-sm text-white/50">{phase.name}</p>
                                <p className="text-[10px] text-white/20">{phase.weeks}w</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <Link
                            href="/auth"
                            className="inline-block text-sm text-white/30 hover:text-white/60 transition-colors"
                        >
                            Build your 16 weeks →
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
