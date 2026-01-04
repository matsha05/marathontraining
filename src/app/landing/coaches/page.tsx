"use client";

import Link from "next/link";
import Image from "next/image";
import { useLandingNav } from "../useLandingNav";

/**
 * Coaches Landing Page (Week template)
 * 
 * Same aesthetic as Week, shows the methodology stack.
 */

export default function CoachesLanding() {
    useLandingNav("/landing/coaches");

    return (
        <div className="min-h-screen bg-[#08080a] text-white flex flex-col">
            {/* Title Badge */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Coaches</span>
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

            {/* Main - Coaches */}
            <main className="flex-1 flex items-center justify-center px-6 py-24">
                <div className="w-full max-w-lg">
                    {/* Label */}
                    <p className="text-xs text-white/20 mb-8 text-center font-mono">
                        Built on
                    </p>

                    {/* Coach grid */}
                    <div className="grid grid-cols-2 gap-2 mb-12">
                        {[
                            { name: "Daniels", role: "Paces", desc: "VDOT tables" },
                            { name: "Hansons", role: "Structure", desc: "6-day cycles" },
                            { name: "Seiler", role: "Intensity", desc: "80/20 split" },
                            { name: "Dicharry", role: "Durability", desc: "12 standards" },
                        ].map((coach) => (
                            <div
                                key={coach.name}
                                className="p-4 rounded-lg bg-white/[0.04]"
                            >
                                <p className="text-sm text-white/70 mb-1">{coach.name}</p>
                                <p className="text-[10px] text-white/30">{coach.role}</p>
                                <p className="text-[10px] text-white/20">{coach.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <Link
                            href="/auth"
                            className="inline-block text-sm text-white/30 hover:text-white/60 transition-colors"
                        >
                            Apply it to your race →
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
