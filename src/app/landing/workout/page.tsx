"use client";

import Link from "next/link";
import Image from "next/image";
import { useLandingNav } from "../useLandingNav";

/**
 * Workout Landing Page (Week template)
 * 
 * Same aesthetic as Week, shows a single workout.
 */

export default function WorkoutLanding() {
    useLandingNav("/landing/workout");

    return (
        <div className="min-h-screen bg-[#08080a] text-white flex flex-col">
            {/* Title Badge */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Workout</span>
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

            {/* Main - Workout */}
            <main className="flex-1 flex items-center justify-center px-6 py-24">
                <div className="w-full max-w-md">
                    {/* Label */}
                    <p className="text-xs text-white/20 mb-2 text-center font-mono">
                        Tuesday · Week 8
                    </p>

                    <h1 className="text-2xl font-light text-white/80 text-center mb-8">
                        6×800m VO2
                    </h1>

                    {/* Workout breakdown */}
                    <div className="space-y-2 mb-12">
                        {[
                            { segment: "Warmup", detail: "1.5mi @ 9:15/mi" },
                            { segment: "Work", detail: "6 × 800m @ 6:45/mi", highlight: true },
                            { segment: "Recovery", detail: "400m jog between" },
                            { segment: "Cooldown", detail: "1mi @ 9:30/mi" },
                        ].map((item) => (
                            <div
                                key={item.segment}
                                className={`flex items-center justify-between p-4 rounded-lg ${item.highlight ? "bg-[#19e38c]/10" : "bg-white/[0.04]"
                                    }`}
                            >
                                <span className="text-sm text-white/50">{item.segment}</span>
                                <span className={`text-sm font-mono ${item.highlight ? "text-[#19e38c]" : "text-white/60"}`}>
                                    {item.detail}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <p className="text-center text-xs text-white/20 mb-8">
                        ~6 miles · 55 min
                    </p>

                    {/* CTA */}
                    <div className="text-center">
                        <Link
                            href="/auth"
                            className="inline-block text-sm text-white/30 hover:text-white/60 transition-colors"
                        >
                            See your workouts →
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
