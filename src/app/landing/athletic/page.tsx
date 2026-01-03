"use client";

import Link from "next/link";

export default function AthleticLanding() {
    return (
        <div className="min-h-screen overflow-hidden" style={{ background: "var(--color-bg-primary)" }}>
            {/* Back Button */}
            <Link
                href="/"
                className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all glass hover:bg-white/10"
                style={{ color: "var(--color-text-secondary)" }}
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Showcase
            </Link>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-40 glass">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center font-bold text-white">
                            HC
                        </div>
                        <span className="font-bold text-xl" style={{ color: "var(--color-text-primary)" }}>
                            HYBRIDCOACH
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        {["Program", "Science", "Athletes", "Pricing"].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-sm font-semibold uppercase tracking-wide transition-colors hover:text-cyan-400"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    <button className="bg-gradient-to-r from-cyan-400 to-teal-500 text-white font-bold text-sm py-2.5 px-6 rounded-full hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
                        GET STARTED
                    </button>
                </div>
            </nav>

            {/* Hero Section - Bold & Dynamic */}
            <section className="relative min-h-screen flex items-center pt-20">
                {/* Animated gradient background */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/20 via-transparent to-teal-500/10" />
                    <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-t from-emerald-500/20 to-transparent blur-3xl" />
                    <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-b from-cyan-400/10 to-transparent blur-3xl" />
                </div>

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(var(--color-text-muted) 1px, transparent 1px),
                              linear-gradient(90deg, var(--color-text-muted) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 mb-8">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                <span className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                                    For Hybrid Athletes
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[0.95]">
                                <span style={{ color: "var(--color-text-primary)" }}>TRAIN FOR</span>
                                <br />
                                <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                                    ENDURANCE.
                                </span>
                                <br />
                                <span style={{ color: "var(--color-text-primary)" }}>KEEP YOUR</span>
                                <br />
                                <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                                    STRENGTH.
                                </span>
                            </h1>

                            {/* Description */}
                            <p
                                className="text-xl mb-10 max-w-lg"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                The first training system built for athletes who refuse to sacrifice
                                their strength for a marathon finish line.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-4">
                                <button className="group bg-gradient-to-r from-cyan-400 to-teal-500 text-white font-bold text-lg py-4 px-8 rounded-full hover:shadow-xl hover:shadow-cyan-500/30 transition-all flex items-center gap-3">
                                    START YOUR PLAN
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                                <button
                                    className="font-bold text-lg py-4 px-8 rounded-full border-2 border-cyan-500/50 hover:bg-cyan-500/10 transition-all"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    WATCH DEMO
                                </button>
                            </div>
                        </div>

                        {/* Stats Panel */}
                        <div className="relative">
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { value: "5K", label: "TO ULTRA", sublabel: "All distances covered" },
                                    { value: "2x", label: "STRENGTH", sublabel: "Sessions per week" },
                                    { value: "80/20", label: "POLARIZED", sublabel: "Intensity split" },
                                    { value: "12", label: "STANDARDS", sublabel: "Durability checks" },
                                ].map((stat, i) => (
                                    <div
                                        key={i}
                                        className="p-6 rounded-2xl border backdrop-blur-sm"
                                        style={{
                                            background: "rgba(0, 0, 0, 0.4)",
                                            borderColor: "var(--color-border)"
                                        }}
                                    >
                                        <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent mb-1">
                                            {stat.value}
                                        </div>
                                        <div className="font-bold text-sm uppercase tracking-wider" style={{ color: "var(--color-text-primary)" }}>
                                            {stat.label}
                                        </div>
                                        <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                                            {stat.sublabel}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Horizontal Scroll Feature Strip */}
            <section className="py-6 border-y" style={{ borderColor: "var(--color-border)", background: "var(--color-bg-secondary)" }}>
                <div className="flex items-center gap-12 animate-scroll whitespace-nowrap px-6">
                    {[
                        "VDOT Calculated Paces",
                        "Built-in Strength Work",
                        "Daily Durability Routines",
                        "Injury Prevention System",
                        "Race-Specific Training",
                        "Nutrition Reminders",
                        "Progressive Overload",
                        "Taper Optimization",
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <span className="text-cyan-400">◆</span>
                            <span
                                className="font-bold text-sm uppercase tracking-wider"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {item}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* The System Section */}
            <section id="program" className="section">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 mb-6">
                            <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                                The System
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ color: "var(--color-text-primary)" }}>
                            BUILT DIFFERENT.
                            <br />
                            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                                FOR ATHLETES WHO ARE.
                            </span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: "🎯",
                                title: "PRECISION PACING",
                                description: "Every workout calculated from your VDOT. No generic percentages. Your paces, your physiology.",
                                gradient: "from-cyan-500 to-cyan-600",
                            },
                            {
                                icon: "💪",
                                title: "STRENGTH PRESERVED",
                                description: "Strategic 2x/week lifting with interference controls. Maintain your gains while building base.",
                                gradient: "from-teal-500 to-teal-600",
                            },
                            {
                                icon: "🛡️",
                                title: "INJURY-PROOFED",
                                description: "Daily durability work based on 12 movement standards. Catch issues before they sideline you.",
                                gradient: "from-emerald-500 to-emerald-600",
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group relative p-8 rounded-2xl border transition-all hover:-translate-y-2 cursor-pointer"
                                style={{
                                    background: "var(--color-bg-card)",
                                    borderColor: "var(--color-border)"
                                }}
                            >
                                {/* Hover gradient */}
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

                                <div className="relative z-10">
                                    <div className="text-4xl mb-4">{feature.icon}</div>
                                    <h3 className="text-xl font-black mb-3" style={{ color: "var(--color-text-primary)" }}>
                                        {feature.title}
                                    </h3>
                                    <p style={{ color: "var(--color-text-secondary)" }}>
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Training Week Preview */}
            <section
                id="science"
                className="section"
                style={{ background: "var(--color-bg-secondary)" }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 mb-6">
                                <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                                    Sample Week
                                </span>
                            </div>
                            <h2 className="text-4xl font-black mb-6" style={{ color: "var(--color-text-primary)" }}>
                                A WEEK IN YOUR
                                <br />
                                <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                                    HYBRID LIFE
                                </span>
                            </h2>
                            <p className="text-lg mb-8" style={{ color: "var(--color-text-secondary)" }}>
                                See how we balance run volume, intensity, strength, and recovery
                                into a sustainable system.
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-cyan-400" />
                                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Run</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Strength</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-violet-400" />
                                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Durability</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {[
                                { day: "MON", run: "Easy 5mi", strength: "Full Body A", durability: "✓" },
                                { day: "TUE", run: "Intervals", strength: "—", durability: "✓" },
                                { day: "WED", run: "—", strength: "—", durability: "✓", rest: true },
                                { day: "THU", run: "Tempo 6mi", strength: "Full Body B", durability: "✓" },
                                { day: "FRI", run: "Easy 4mi", strength: "—", durability: "✓" },
                                { day: "SAT", run: "Easy 6mi", strength: "—", durability: "✓" },
                                { day: "SUN", run: "Long 14mi", strength: "—", durability: "✓" },
                            ].map((row, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-5 gap-4 p-4 rounded-xl items-center"
                                    style={{
                                        background: row.rest ? "var(--color-bg-tertiary)" : "var(--color-bg-card)",
                                        border: "1px solid var(--color-border)"
                                    }}
                                >
                                    <div className="font-black text-lg" style={{ color: "var(--color-text-primary)" }}>
                                        {row.day}
                                    </div>
                                    <div className={`text-sm font-medium ${row.run !== "—" ? "text-cyan-400" : ""}`} style={{ color: row.run === "—" ? "var(--color-text-muted)" : undefined }}>
                                        {row.run}
                                    </div>
                                    <div className={`text-sm font-medium ${row.strength !== "—" ? "text-emerald-400" : ""}`} style={{ color: row.strength === "—" ? "var(--color-text-muted)" : undefined }}>
                                        {row.strength}
                                    </div>
                                    <div className="text-sm font-medium text-violet-400">
                                        {row.durability}
                                    </div>
                                    <div>
                                        {row.rest && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-white/5" style={{ color: "var(--color-text-muted)" }}>
                                                REST
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section id="athletes" className="section">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4" style={{ color: "var(--color-text-primary)" }}>
                            ATHLETES WHO&apos;VE
                            <br />
                            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                                CROSSED THE LINE
                            </span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                quote: "Finally a program that gets it. Ran my first marathon and actually got stronger during training.",
                                name: "MARCUS T.",
                                title: "CrossFit Athlete → 3:12 Marathon",
                            },
                            {
                                quote: "The durability work alone was worth it. First marathon training cycle ever without a single injury.",
                                name: "SARAH K.",
                                title: "Powerlifter → Boston Qualifier",
                            },
                            {
                                quote: "I was terrified of losing my deadlift numbers. Kept them all and ran a 3:28 first marathon.",
                                name: "JAMES R.",
                                title: "Gym Rat → Ultra Finisher",
                            },
                        ].map((testimonial, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-2xl border"
                                style={{
                                    background: "var(--color-bg-card)",
                                    borderColor: "var(--color-border)"
                                }}
                            >
                                <div className="text-cyan-400 text-4xl mb-4">&quot;</div>
                                <p className="text-lg mb-6" style={{ color: "var(--color-text-secondary)" }}>
                                    {testimonial.quote}
                                </p>
                                <div>
                                    <div className="font-black" style={{ color: "var(--color-text-primary)" }}>
                                        {testimonial.name}
                                    </div>
                                    <div className="text-sm text-cyan-400">
                                        {testimonial.title}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section
                className="section relative overflow-hidden"
                style={{ background: "var(--color-bg-secondary)" }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-teal-500/10" />

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ color: "var(--color-text-primary)" }}>
                        YOUR MARATHON.
                        <br />
                        <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                            YOUR STRENGTH.
                        </span>
                        <br />
                        YOUR WAY.
                    </h2>
                    <p className="text-xl mb-10" style={{ color: "var(--color-text-secondary)" }}>
                        Get your personalized hybrid training plan in minutes.
                    </p>
                    <button className="bg-gradient-to-r from-cyan-400 to-teal-500 text-white font-black text-xl py-5 px-12 rounded-full hover:shadow-xl hover:shadow-cyan-500/30 transition-all">
                        CREATE YOUR PLAN →
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer
                className="py-12"
                style={{
                    borderTop: "1px solid var(--color-border)",
                    background: "var(--color-bg-primary)"
                }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center font-bold text-white text-sm">
                                HC
                            </div>
                            <span className="font-bold" style={{ color: "var(--color-text-primary)" }}>
                                HYBRIDCOACH
                            </span>
                        </div>

                        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                            © 2026 HybridCoach. Train hard. Stay strong. Go far.
                        </p>
                    </div>
                </div>
            </footer>

            <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
        </div>
    );
}
