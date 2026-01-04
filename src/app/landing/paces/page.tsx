"use client";

import Link from "next/link";
import Image from "next/image";
import { useLandingNav } from "../useLandingNav";

/**
 * Paces Landing Page (Week template)
 * 
 * Same aesthetic as Week, but shows paces instead.
 */

export default function PacesLanding() {
    useLandingNav("/landing/paces");

    return (
        <div className="min-h-screen bg-[#08080a] text-white flex flex-col">
            {/* Title Badge */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Paces</span>
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

            {/* Main - Paces */}
            <main className="flex-1 flex items-center justify-center px-6 py-24">
                <div className="w-full max-w-md">
                    {/* Label */}
                    <p className="text-xs text-white/20 mb-6 text-center font-mono">
                        From 3:30 Marathon → VDOT 46.7
                    </p>

                    {/* Pace Grid */}
                    <div className="space-y-2 mb-12">
                        {[
                            { zone: "Easy", pace: "8:25 – 8:55", pct: "70%", color: "white/50" },
                            { zone: "Marathon", pace: "8:01", pct: "10%", color: "white/60" },
                            { zone: "Threshold", pace: "7:21", pct: "10%", color: "[#f59e0b]" },
                            { zone: "Interval", pace: "6:45", pct: "8%", color: "[#ef4444]" },
                            { zone: "Repetition", pace: "6:15", pct: "2%", color: "[#8b5cf6]" },
                        ].map((p) => (
                            <div
                                key={p.zone}
                                className="flex items-center justify-between p-4 rounded-lg bg-white/[0.04]"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-white/70">{p.zone}</span>
                                    <span className="text-[10px] text-white/20">{p.pct}</span>
                                </div>
                                <span className={`text-sm font-mono text-${p.color}`}>{p.pace}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <Link
                            href="/auth"
                            className="inline-block text-sm text-white/30 hover:text-white/60 transition-colors"
                        >
                            Calculate yours →
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
