"use client";

import Link from "next/link";
import Image from "next/image";
import { useLandingNav } from "../useLandingNav";

/**
 * Prime Landing Page
 * 
 * Week aesthetic + curiosity + scroll-reveal.
 * Hero: Big intriguing statement + Week preview
 * Scroll: Methodologies + What this is
 */

export default function PrimeLanding() {
    useLandingNav("/landing/prime");

    return (
        <div className="min-h-screen bg-[#08080a] text-white">
            {/* Title Badge */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Prime</span>
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

            {/* Hero - Full height, curiosity-inducing */}
            <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
                <div className="text-center max-w-3xl">
                    {/* Big intriguing headline */}
                    <h1 className="text-5xl md:text-7xl font-light text-white/90 mb-6 leading-tight tracking-tight">
                        What does your<br />
                        <span className="text-[#19e38c]/80">Week 8</span> look like?
                    </h1>

                    {/* Subtle context */}
                    <p className="text-lg text-white/30 mb-12">
                        The answer depends on who you ask.
                    </p>

                    {/* Week preview - the hook */}
                    <div className="max-w-2xl mx-auto mb-12">
                        <div className="grid grid-cols-7 gap-1">
                            {[
                                { day: "M", label: "Easy", sub: "+S" },
                                { day: "T", label: "VO2", sub: "" },
                                { day: "W", label: "Rest", sub: "" },
                                { day: "T", label: "Tempo", sub: "+S" },
                                { day: "F", label: "Easy", sub: "" },
                                { day: "S", label: "Easy", sub: "" },
                                { day: "S", label: "Long", sub: "", highlight: true },
                            ].map((d, i) => (
                                <div
                                    key={i}
                                    className={`p-3 rounded-lg text-center ${d.label === "Rest" ? "bg-white/[0.02]" :
                                            d.highlight ? "bg-[#19e38c]/10" : "bg-white/[0.04]"
                                        }`}
                                >
                                    <p className="text-[10px] text-white/30 mb-1">{d.day}</p>
                                    <p className={`text-xs ${d.label === "Rest" ? "text-white/20" : d.highlight ? "text-[#19e38c]/80" : "text-white/60"}`}>
                                        {d.label}
                                    </p>
                                    {d.sub && <p className="text-[10px] text-[#3a6bff]/60 mt-1">{d.sub}</p>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <Link
                        href="/auth"
                        className="inline-block px-6 py-3 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
                    >
                        Build yours
                    </Link>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                    <p className="text-[10px] text-white/20 uppercase tracking-widest">Scroll</p>
                </div>
            </section>

            {/* What this is built on */}
            <section className="px-6 py-24 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <p className="text-[10px] text-white/20 uppercase tracking-widest mb-8 text-center">
                        Built on four methodologies
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { name: "Daniels", focus: "Paces", desc: "VDOT tables from race performance. Easy through Interval calibrated to you." },
                            { name: "Hansons", focus: "Structure", desc: "6-day cycles with cumulative fatigue. Run on tired legs, race on fresh ones." },
                            { name: "Seiler", focus: "Intensity", desc: "80/20 polarized. Easy stays easy, hard stays hard. No gray zone." },
                            { name: "Dicharry", focus: "Durability", desc: "12 movement standards. Pre-hab over rehab. Stay running." },
                        ].map((coach) => (
                            <div
                                key={coach.name}
                                className="p-5 rounded-lg bg-white/[0.02] border border-white/5"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-white/70">{coach.name}</span>
                                    <span className="text-[10px] text-white/30">·</span>
                                    <span className="text-[10px] text-white/30 uppercase tracking-wider">{coach.focus}</span>
                                </div>
                                <p className="text-sm text-white/40">{coach.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What you actually get */}
            <section className="px-6 py-24 border-t border-white/5">
                <div className="max-w-2xl mx-auto">
                    <p className="text-[10px] text-white/20 uppercase tracking-widest mb-8 text-center">
                        What you get
                    </p>

                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                        {[
                            "Paces calculated from your race time",
                            "16-week structured program",
                            "2x strength sessions per week",
                            "Daily durability routines",
                            "Progressive overload + deload weeks",
                            "Race-specific taper",
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#19e38c]/60" />
                                <span className="text-sm text-white/50">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Any distance */}
            <section className="px-6 py-24 border-t border-white/5">
                <div className="max-w-xl mx-auto text-center">
                    <p className="text-2xl font-light text-white/60 mb-4">
                        5K to Ultra.
                    </p>
                    <p className="text-sm text-white/30 mb-8">
                        Enter any recent race. Get your paces. Build your program.
                    </p>
                    <Link
                        href="/auth"
                        className="inline-block text-sm text-white/40 hover:text-white/70 transition-colors"
                    >
                        Start →
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-6 border-t border-white/5 text-center">
                <p className="text-[10px] text-white/15">© 2026 The Long Game</p>
            </footer>
        </div>
    );
}
