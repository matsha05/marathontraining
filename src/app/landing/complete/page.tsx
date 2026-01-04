"use client";

import Link from "next/link";
import Image from "next/image";
import { useLandingNav } from "../useLandingNav";

/**
 * Complete Landing Page (Week template)
 * 
 * Same aesthetic as Week, shows paces + week side by side.
 */

export default function CompleteLanding() {
    useLandingNav("/landing/complete");

    return (
        <div className="min-h-screen bg-[#08080a] text-white flex flex-col">
            {/* Title Badge */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Complete</span>
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

            {/* Main - Complete view */}
            <main className="flex-1 flex items-center justify-center px-6 py-24">
                <div className="w-full max-w-4xl">
                    {/* Label */}
                    <p className="text-xs text-white/20 mb-8 text-center font-mono">
                        From 3:30 Marathon · Week 8
                    </p>

                    {/* Two columns */}
                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        {/* Paces */}
                        <div className="p-5 rounded-lg bg-white/[0.02] border border-white/5">
                            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-4">Paces</p>
                            <div className="space-y-2">
                                {[
                                    { zone: "Easy", pace: "8:25 – 8:55" },
                                    { zone: "Marathon", pace: "8:01" },
                                    { zone: "Threshold", pace: "7:21" },
                                    { zone: "Interval", pace: "6:45" },
                                ].map((p) => (
                                    <div key={p.zone} className="flex items-center justify-between">
                                        <span className="text-sm text-white/50">{p.zone}</span>
                                        <span className="text-sm font-mono text-white/70">{p.pace}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Week */}
                        <div className="p-5 rounded-lg bg-white/[0.02] border border-white/5">
                            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-4">This Week</p>
                            <div className="space-y-2">
                                {[
                                    { day: "M", run: "5mi Easy", extra: "+S" },
                                    { day: "T", run: "6×800m VO2", extra: "" },
                                    { day: "W", run: "Rest", extra: "" },
                                    { day: "T", run: "6mi Tempo", extra: "+S" },
                                    { day: "F", run: "4mi Easy", extra: "" },
                                    { day: "S", run: "5mi Easy", extra: "" },
                                    { day: "S", run: "14mi Long", extra: "", highlight: true },
                                ].map((d) => (
                                    <div key={d.day + d.run} className="flex items-center gap-3">
                                        <span className="text-[10px] text-white/30 w-3">{d.day}</span>
                                        <span className={`text-sm flex-1 ${d.highlight ? "text-[#19e38c]/80" : d.run === "Rest" ? "text-white/20" : "text-white/50"}`}>
                                            {d.run}
                                        </span>
                                        {d.extra && <span className="text-[10px] text-[#3a6bff]/60">{d.extra}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <Link
                            href="/auth"
                            className="inline-block text-sm text-white/30 hover:text-white/60 transition-colors"
                        >
                            Enter your race →
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
