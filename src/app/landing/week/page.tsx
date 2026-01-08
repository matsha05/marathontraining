"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLandingNav } from "../useLandingNav";
import { WeekRow } from "@/components/ui/WeekRow";

/**
 * Week Polished Landing Page
 * 
 * Same as Week but with:
 * - Staggered fade-in animations on hero
 * - Subtle radial glow behind week grid
 * - Hover states on day cards
 */

export default function WeekLanding() {
    useLandingNav("/landing/week");

    return (
        <div className="min-h-screen-safe bg-[#08080a] text-white">
            {/* Title Badge */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="fixed left-1/2 -translate-x-1/2 z-[60] px-3 py-1 bg-white/5 border border-white/10 rounded-full"
                style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
            >
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Week</span>
            </motion.div>

            {/* Nav */}
            <nav
                className="fixed top-0 left-0 right-0 z-50 px-6 pb-5"
                style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)' }}
            >
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
                    <Link href="/onboarding" className="text-xs text-white/20 hover:text-white/40 transition-colors">
                        →
                    </Link>
                </div>
            </nav>

            {/* Hero - Big text + Week preview with animations */}
            <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
                {/* Subtle radial glow behind content */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(800px circle at 50% 55%, rgba(25, 227, 140, 0.04) 0%, transparent 60%)',
                    }}
                />

                <div className="text-center w-full max-w-4xl relative z-10">
                    {/* Big title - staggered */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="text-5xl md:text-7xl font-light text-white/90 mb-4 tracking-tight"
                    >
                        The Long Game
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="text-lg text-white/30 mb-12"
                    >
                        Training, structured.
                    </motion.p>

                    {/* Week Grid - staggered with subtle delay */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="max-w-3xl mx-auto mb-12"
                    >
                        <p className="text-xs text-white/20 mb-4 font-mono">
                            Week 8 · Build Phase · 42 miles
                        </p>
                        <WeekRow
                            className="md:gap-1"
                            style={{ '--scroll-hint-color': '#08080a' } as CSSProperties }
                        >
                            {[
                                { day: "M", type: "run", label: "5mi Easy", sub: "8:32/mi", strength: true },
                                { day: "T", type: "run", label: "6×800m", sub: "VO2", strength: false },
                                { day: "W", type: "rest", label: "Rest", sub: "", strength: false },
                                { day: "T", type: "run", label: "6mi Tempo", sub: "7:15/mi", strength: true },
                                { day: "F", type: "run", label: "4mi Easy", sub: "8:45/mi", strength: false },
                                { day: "S", type: "run", label: "5mi Easy", sub: "8:32/mi", strength: false },
                                { day: "S", type: "long", label: "14mi Long", sub: "8:45/mi", strength: false },
                            ].map((d, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + (i * 0.05), duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                                    className={`
                                        p-4 rounded-lg text-center transition-all duration-200
                                        hover:bg-white/[0.06] hover:scale-[1.02]
                                        ${d.type === "rest" ? "bg-white/[0.02]" : "bg-white/[0.04]"}
                                        ${d.type === "long" ? "bg-[#19e38c]/10 hover:bg-[#19e38c]/15" : ""}
                                        snap-center flex-shrink-0 w-[90px] md:w-auto md:flex-shrink
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
                                </motion.div>
                            ))}
                        </WeekRow>
                    </motion.div>

                    {/* CTA - last to animate */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <Link
                            href="/onboarding"
                            className="inline-block px-6 py-3 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 hover:scale-[1.02] transition-all duration-200"
                        >
                            Get Started
                        </Link>
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3, duration: 0.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <p className="text-[10px] text-white/20 uppercase tracking-widest">Scroll</p>
                </motion.div>
            </section>

            {/* === RUNNING SCIENCE — PLAN STRUCTURE === */}
            <section className="px-6 py-24 bg-white/[0.01]">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Running Science</p>
                    <h2 className="text-4xl md:text-5xl font-light text-white/80 mb-4">Evidence-based training</h2>
                    <p className="text-lg text-white/40 mb-8">7 methodologies. We'll help you find the right one.</p>
                    <Link
                        href="/onboarding"
                        className="inline-block px-6 py-3 bg-white/[0.05] border border-white/20 text-white/70 text-sm font-medium rounded-lg hover:bg-white/[0.08] hover:border-white/30 transition-all"
                    >
                        Take the quiz →
                    </Link>
                </div>
            </section>

            {/* Hansons */}
            <section className="px-6 py-20 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#3a6bff]" />
                        <h2 className="text-2xl font-light text-white/80">Hansons</h2>
                        <span className="text-xs text-white/30 uppercase tracking-wider">Cumulative Fatigue</span>
                    </div>
                    <p className="text-white/50 mb-6 leading-relaxed">
                        Six days a week. Train on tired legs, race on fresh ones. 16-mile long run cap —
                        because the cumulative week matters more than any single run.
                    </p>
                    <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                        <WeekRow
                            className="text-center"
                            style={{ '--scroll-hint-color': '#08080a' } as CSSProperties }
                        >
                            {["Easy", "Speed", "Rest", "Tempo", "Easy", "Easy", "Long"].map((day, i) => (
                                <div key={i} className="snap-center flex-shrink-0 w-[72px] md:w-auto md:flex-shrink">
                                    <p className="text-[10px] text-white/30 mb-1">{["M", "T", "W", "T", "F", "S", "S"][i]}</p>
                                    <p className={`text-xs ${day === "Rest" ? "text-white/20" : day === "Long" ? "text-[#3a6bff]" : "text-white/50"}`}>
                                        {day}
                                    </p>
                                </div>
                            ))}
                        </WeekRow>
                    </div>
                    <p className="text-xs text-white/20 mt-3">Best for: Experienced runners, 6 days available, high mileage tolerance</p>
                </div>
            </section>

            {/* Higdon */}
            <section className="px-6 py-20 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#ec4899]" />
                        <h2 className="text-2xl font-light text-white/80">Hal Higdon</h2>
                        <span className="text-xs text-white/30 uppercase tracking-wider">Accessibility</span>
                    </div>
                    <p className="text-white/50 mb-6 leading-relaxed">
                        The most trusted name in marathon training. Gradual progression, more rest days,
                        longer long runs (20+ miles). Programs for every level, from first-timer to PR-chaser.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                            <p className="text-lg font-light text-white/60">Novice</p>
                            <p className="text-[10px] text-white/30 mt-1">First marathon</p>
                        </div>
                        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                            <p className="text-lg font-light text-white/60">Intermediate</p>
                            <p className="text-[10px] text-white/30 mt-1">Building fitness</p>
                        </div>
                        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                            <p className="text-lg font-light text-white/60">Advanced</p>
                            <p className="text-[10px] text-white/30 mt-1">Chasing PRs</p>
                        </div>
                    </div>
                    <p className="text-xs text-white/20 mt-3">Best for: First-timers, 4-5 days available, gradual build</p>
                </div>
            </section>

            {/* Pfitzinger */}
            <section className="px-6 py-20 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#06b6d4]" />
                        <h2 className="text-2xl font-light text-white/80">Pete Pfitzinger</h2>
                        <span className="text-xs text-white/30 uppercase tracking-wider">Advanced Marathoning</span>
                    </div>
                    <p className="text-white/50 mb-6 leading-relaxed">
                        High mileage with precision. Lactate threshold is king. Programs from 55 to 85+ miles/week
                        for runners ready to commit. The gold standard for competitive marathoners.
                    </p>
                    <div className="flex gap-3">
                        <div className="flex-1 p-4 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                            <p className="text-lg font-mono text-white/60">55-70</p>
                            <p className="text-[10px] text-white/30 mt-1">mi/week</p>
                        </div>
                        <div className="flex-1 p-4 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                            <p className="text-lg font-mono text-white/60">70-85</p>
                            <p className="text-[10px] text-white/30 mt-1">mi/week</p>
                        </div>
                        <div className="flex-1 p-4 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                            <p className="text-lg font-mono text-white/60">85+</p>
                            <p className="text-[10px] text-white/30 mt-1">mi/week</p>
                        </div>
                    </div>
                    <p className="text-xs text-white/20 mt-3">Best for: Competitive runners, high mileage history, PR-focused</p>
                </div>
            </section>

            {/* Matt Fitzgerald */}
            <section className="px-6 py-20 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#a855f7]" />
                        <h2 className="text-2xl font-light text-white/80">Matt Fitzgerald</h2>
                        <span className="text-xs text-white/30 uppercase tracking-wider">80/20 Running</span>
                    </div>
                    <p className="text-white/50 mb-6 leading-relaxed">
                        Practical application of polarized training for everyday runners.
                        Takes Seiler's research and makes it actionable with clear intensity guidelines.
                    </p>
                    <div className="flex gap-2">
                        <div className="flex-[80] h-10 rounded-lg bg-[#19e38c]/10 flex items-center justify-center">
                            <span className="text-sm text-[#19e38c]/80">80% Easy</span>
                        </div>
                        <div className="flex-[20] h-10 rounded-lg bg-[#ef4444]/10 flex items-center justify-center">
                            <span className="text-xs text-[#ef4444]/80">20% Hard</span>
                        </div>
                    </div>
                    <p className="text-xs text-white/20 mt-3">Best for: Runners wanting science-backed intensity distribution</p>
                </div>
            </section>

            {/* Steve Magness */}
            <section className="px-6 py-20 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#f472b6]" />
                        <h2 className="text-2xl font-light text-white/80">Steve Magness</h2>
                        <span className="text-xs text-white/30 uppercase tracking-wider">Science of Running</span>
                    </div>
                    <p className="text-white/50 mb-6 leading-relaxed">
                        Bridges the gap between what coaches have known works and what scientists have proven.
                        4:01 high school miler, Nike Oregon Project assistant, evidence-based coaching.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                            <p className="text-sm text-white/40 mb-1">Philosophy</p>
                            <p className="text-white/60">Coach the person</p>
                        </div>
                        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                            <p className="text-sm text-white/40 mb-1">Method</p>
                            <p className="text-white/60">Not the system</p>
                        </div>
                    </div>
                    <p className="text-xs text-white/20 mt-3">Best for: Runners who want modern, individualized training</p>
                </div>
            </section>

            {/* === THE FOUNDATION === */}
            <section className="px-6 py-24 bg-white/[0.01]">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-4">The Foundation</p>
                    <h2 className="text-4xl md:text-5xl font-light text-white/80 mb-4">Built on every plan</h2>
                    <p className="text-lg text-white/40">These apply to every training philosophy.</p>
                </div>
            </section>

            {/* Daniels - Paces */}
            <section className="px-6 py-20 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#19e38c]" />
                        <h2 className="text-2xl font-light text-white/80">Jack Daniels</h2>
                        <span className="text-xs text-white/30 uppercase tracking-wider">Paces</span>
                    </div>
                    <p className="text-white/50 mb-6 leading-relaxed">
                        Your paces aren't guesses. They're calculated from VDOT — a metric derived from your race performance
                        that predicts equivalent performances across distances and prescribes training intensities.
                    </p>
                    <div className="grid md:grid-cols-4 gap-3">
                        {[
                            { zone: "Easy", pace: "8:25–8:55" },
                            { zone: "Threshold", pace: "7:21" },
                            { zone: "Interval", pace: "6:45" },
                            { zone: "Marathon", pace: "8:01" },
                        ].map((p) => (
                            <div key={p.zone} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                                <p className="text-sm text-white/40 mb-1">{p.zone}</p>
                                <p className="font-mono text-white/70">{p.pace}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Seiler - Intensity */}
            <section className="px-6 py-20 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                        <h2 className="text-2xl font-light text-white/80">Stephen Seiler</h2>
                        <span className="text-xs text-white/30 uppercase tracking-wider">Intensity</span>
                    </div>
                    <p className="text-white/50 mb-6 leading-relaxed">
                        80/20 polarized. Elite endurance athletes spend 80% of training at low intensity, 20% high.
                        The "moderate" gray zone is avoided — too hard to recover from, too easy to drive adaptation.
                    </p>
                    <div className="flex gap-2">
                        <div className="flex-[80] h-10 rounded-lg bg-[#19e38c]/10 flex items-center justify-center">
                            <span className="text-sm text-[#19e38c]/80">80% Easy</span>
                        </div>
                        <div className="flex-[20] h-10 rounded-lg bg-[#ef4444]/10 flex items-center justify-center">
                            <span className="text-xs text-[#ef4444]/80">20% Hard</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dicharry - Durability */}
            <section className="px-6 py-20 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                        <h2 className="text-2xl font-light text-white/80">Jay Dicharry</h2>
                        <span className="text-xs text-white/30 uppercase tracking-wider">Durability</span>
                    </div>
                    <p className="text-white/50 mb-6 leading-relaxed">
                        Running Rewired. 12 movement standards that address the most common limiters in runners.
                        Pre-hab over rehab. Build a body that can handle the training load, not just survive it.
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="h-8 rounded-lg bg-white/[0.03] flex items-center justify-center">
                                <span className="text-[10px] text-white/30">{i + 1}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-white/20 mt-3">12 movement standards · Daily routines</p>
                </div>
            </section>

            {/* Starrett - Mobility */}
            <section className="px-6 py-20 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#14b8a6]" />
                        <h2 className="text-2xl font-light text-white/80">Kelly Starrett</h2>
                        <span className="text-xs text-white/30 uppercase tracking-wider">Mobility</span>
                    </div>
                    <p className="text-white/50 mb-6 leading-relaxed">
                        Becoming a Supple Leopard. Systematic mobility work that restores range of motion,
                        tissue quality, and motor control. The foundation that lets you train hard without breaking down.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 p-4 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                            <p className="text-sm text-white/40 mb-1">Before</p>
                            <p className="text-white/60">Prep & Activation</p>
                        </div>
                        <div className="flex-1 p-4 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                            <p className="text-sm text-white/40 mb-1">After</p>
                            <p className="text-white/60">Recovery & Reset</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* === STRENGTH & POWER === */}
            <section className="px-6 py-24 bg-white/[0.01]">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Strength Training</p>
                    <h2 className="text-4xl md:text-5xl font-light text-white/80 mb-4">Lift to run faster</h2>
                    <p className="text-lg text-white/40">Runner-specific strength programming proven to improve economy.</p>
                </div>
            </section>

            {/* Støren - Strength */}
            <section className="px-6 py-20 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                        <h2 className="text-2xl font-light text-white/80">Øyvind Støren</h2>
                        <span className="text-xs text-white/30 uppercase tracking-wider">Max Strength Research</span>
                    </div>
                    <p className="text-white/50 mb-6 leading-relaxed">
                        Heavy strength improves running economy. Research shows 4×4 half-squats at 4RM, 3x/week
                        improves economy by 5%. Scheduled strategically — never before key sessions.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 p-4 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                            <p className="text-2xl font-light text-white/60">4×4</p>
                            <p className="text-xs text-white/30 mt-1">protocol</p>
                        </div>
                        <div className="flex-1 p-4 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                            <p className="text-2xl font-light text-white/60">5%</p>
                            <p className="text-xs text-white/30 mt-1">economy gain</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Long Game Strength Engine */}
            <section className="px-6 py-20 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#fbbf24]" />
                        <h2 className="text-2xl font-light text-white/80">The Long Game Strength Engine</h2>
                        <span className="text-xs text-white/30 uppercase tracking-wider">Integrated System</span>
                    </div>
                    <p className="text-white/50 mb-6 leading-relaxed">
                        24 runner-friendly WODs with Rx/Scaled/Beginner tiers. Phase-appropriate scheduling:
                        heavy in base, maintain in peak, protect in taper. We never schedule leg-heavy work before your long run.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                            <p className="text-sm text-white/60">Base</p>
                            <p className="text-[10px] text-white/30 mt-1">Build strength</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                            <p className="text-sm text-white/60">Build</p>
                            <p className="text-[10px] text-white/30 mt-1">Convert power</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                            <p className="text-sm text-white/60">Peak</p>
                            <p className="text-[10px] text-white/30 mt-1">Maintain</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                            <p className="text-sm text-white/60">Taper</p>
                            <p className="text-[10px] text-white/30 mt-1">Protect</p>
                        </div>
                    </div>
                    <p className="text-xs text-white/20 mt-3">24 WODs · 6 research sources · Phase-aware scheduling</p>
                </div>
            </section>

            {/* === ELITE METHODS === */}
            <section className="px-6 py-24 bg-white/[0.01]">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Elite Methods</p>
                    <h2 className="text-4xl md:text-5xl font-light text-white/80 mb-4">World-class training</h2>
                    <p className="text-lg text-white/40">Methods from Olympic and World Championship programs.</p>
                </div>
            </section>

            {/* Gjert Ingebrigtsen */}
            <section className="px-6 py-20 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
                        <h2 className="text-2xl font-light text-white/80">Gjert Ingebrigtsen</h2>
                        <span className="text-xs text-white/30 uppercase tracking-wider">Norwegian Method</span>
                    </div>
                    <p className="text-white/50 mb-6 leading-relaxed">
                        The method behind the Ingebrigtsen brothers (Olympic and World Champions). Double threshold:
                        two lactate-guided sessions in one day. Precise intensity via lactate monitoring at 2.5-3.5 mmol/L.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 p-4 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                            <p className="text-2xl font-light text-white/60">2×</p>
                            <p className="text-xs text-white/30 mt-1">threshold/day</p>
                        </div>
                        <div className="flex-1 p-4 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                            <p className="text-2xl font-light text-white/60">3</p>
                            <p className="text-xs text-white/30 mt-1">Olympic sons</p>
                        </div>
                    </div>
                    <p className="text-xs text-white/20 mt-3">For: Elite-level athletes ready for high volume threshold work</p>
                </div>
            </section>

            {/* Final CTA */}
            <section className="px-6 py-24 bg-white/[0.01]">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Any Distance</p>
                    <h2 className="text-4xl md:text-5xl font-light text-white/80 mb-4">Base building to 50K.</h2>
                    <p className="text-lg text-white/40 mb-8">
                        Race on the calendar or just building fitness. We'll meet you where you are.
                    </p>
                    <Link
                        href="/auth"
                        className="inline-block px-8 py-4 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors"
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
