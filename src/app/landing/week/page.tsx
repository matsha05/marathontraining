"use client";

import Link from "next/link";
import Image from "next/image";
import { useLandingNav } from "../useLandingNav";

/**
 * Week Landing Page
 * 
 * Just shows what a training week looks like.
 * No explanation needed. The product speaks.
 */

export default function WeekLanding() {
    useLandingNav("/landing/week");

    return (
        <div className="min-h-screen bg-[#08080a] text-white flex flex-col">
            {/* Title Badge */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Week</span>
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

            {/* Main - Just the week */}
            <main className="flex-1 flex items-center justify-center px-6 py-24">
                <div className="w-full max-w-4xl">
                    {/* Label */}
                    <p className="text-xs text-white/20 mb-6 text-center font-mono">
                        Week 8 · Build Phase · 42 miles
                    </p>

                    {/* Week Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-12">
                        {[
                            { day: "M", type: "run", label: "5mi Easy", sub: "8:32/mi", strength: true },
                            { day: "T", type: "run", label: "6×800m", sub: "VO2", strength: false },
                            { day: "W", type: "rest", label: "Rest", sub: "", strength: false },
                            { day: "T", type: "run", label: "6mi Tempo", sub: "7:15/mi", strength: true },
                            { day: "F", type: "run", label: "4mi Easy", sub: "8:45/mi", strength: false },
                            { day: "S", type: "run", label: "5mi Easy", sub: "8:32/mi", strength: false },
                            { day: "S", type: "long", label: "14mi Long", sub: "8:45/mi", strength: false },
                        ].map((d, i) => (
                            <div
                                key={i}
                                className={`
                                    p-4 rounded-lg text-center
                                    ${d.type === "rest" ? "bg-white/[0.02]" : "bg-white/[0.04]"}
                                    ${d.type === "long" ? "bg-[#19e38c]/10" : ""}
                                `}
                            >
                                <p className="text-[10px] text-white/30 mb-3">{d.day}</p>
                                <p className={`text-sm mb-1 ${d.type === "rest" ? "text-white/20" : "text-white/70"}`}>
                                    {d.label}
                                </p>
                                {d.sub && (
                                    <p className="text-[10px] text-white/30 font-mono">{d.sub}</p>
                                )}
                                {d.strength && (
                                    <div className="mt-2 pt-2 border-t border-white/5">
                                        <p className="text-[10px] text-[#3a6bff]">+ Strength</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Minimal CTA */}
                    <div className="text-center">
                        <Link
                            href="/auth"
                            className="inline-block text-sm text-white/30 hover:text-white/60 transition-colors"
                        >
                            See your week →
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
