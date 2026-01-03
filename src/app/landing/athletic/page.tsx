"use client";

import Link from "next/link";

export default function AthleticLanding() {
    return (
        <div className="min-h-screen overflow-x-hidden landing-shell" style={{ backgroundColor: "var(--color-bg-primary)" }}>
            {/* Navigation */}
            <nav className="sticky top-0 left-0 right-0 z-40 glass border-b border-[var(--border-muted)]">
                <div className="max-w-7xl mx-auto px-6 h-[var(--header-height)] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-body-sm font-semibold uppercase tracking-wider transition-colors hover:text-[var(--color-accent)]"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="hidden sm:inline">Back</span>
                        </Link>
                        <div className="hidden sm:block h-6 w-px" style={{ background: "var(--color-border)" }} />
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white" style={{ background: "var(--gradient-primary)" }}>
                                HC
                            </div>
                            <span className="font-bold text-xl" style={{ color: "var(--color-text-primary)" }}>
                                HYBRIDCOACH
                            </span>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        {[
                            { label: "Program", href: "#program" },
                            { label: "Science", href: "#science" },
                            { label: "Athletes", href: "#athletes" },
                            { label: "Get Started", href: "#get-started" },
                        ].map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="text-body-sm font-semibold uppercase tracking-wide transition-colors hover:text-[var(--color-accent)]"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>

                    <button className="btn btn-gradient btn-sm">
                        GET STARTED
                    </button>
                </div>
            </nav>

            {/* Hero Section - Bold & Dynamic */}
            <section className="relative hero-full flex items-start hero-section">
                {/* Animated gradient background */}
                <div className="absolute inset-0">
                    <div
                        className="absolute top-0 left-0 w-full h-full"
                        style={{
                            background: "linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 18%, transparent), transparent 55%, color-mix(in srgb, var(--color-strength) 12%, transparent))"
                        }}
                    />
                    <div
                        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl"
                        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--color-strength) 18%, transparent), transparent 70%)" }}
                    />
                    <div
                        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
                        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 12%, transparent), transparent 70%)" }}
                    />
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

                <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            {/* Badge */}
                            <div
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                                style={{
                                    background: "linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 18%, transparent), color-mix(in srgb, var(--color-strength) 18%, transparent))",
                                    border: "1px solid color-mix(in srgb, var(--color-accent) 32%, transparent)"
                                }}
                            >
                                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                                <span className="text-label text-[var(--color-accent)]">
                                    For Hybrid Athletes
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-display-xl mb-6 leading-[0.98]">
                                <span style={{ color: "var(--color-text-primary)" }}>TRAIN FOR</span>
                                <br />
                                <span className="gradient-text">
                                    ENDURANCE.
                                </span>
                                <br />
                                <span style={{ color: "var(--color-text-primary)" }}>KEEP YOUR</span>
                                <br />
                                <span className="gradient-text">
                                    STRENGTH.
                                </span>
                            </h1>

                            {/* Description */}
                            <p
                                className="text-body-lg mb-10 max-w-lg"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                The first training system built for athletes who refuse to sacrifice
                                their strength for a marathon finish line.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-4">
                                <button className="btn btn-gradient btn-lg group">
                                    START YOUR PLAN
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                                <button
                                    className="btn btn-secondary btn-lg"
                                    style={{ borderColor: "color-mix(in srgb, var(--color-accent) 32%, var(--border-base))", color: "var(--color-text-primary)" }}
                                >
                                    WATCH DEMO
                                </button>
                            </div>
                        </div>

                        {/* Stats Panel */}
                        <div className="relative">
                            <div className="hero-visual">
                                <div className="hero-visual-inner">
                                    <div className="flex items-center justify-between">
                                        <p className="text-label">System Snapshot</p>
                                        <span className="metric-chip">12 week block</span>
                                    </div>
                                    <div className="signal-line" />
                                    <div className="grid grid-cols-2 gap-4">
                                {[
                                    { value: "5K", label: "TO ULTRA", sublabel: "All distances covered" },
                                    { value: "2x", label: "STRENGTH", sublabel: "Sessions per week" },
                                    { value: "80/20", label: "POLARIZED", sublabel: "Intensity split" },
                                    { value: "12", label: "STANDARDS", sublabel: "Durability checks" },
                                ].map((stat, i) => (
                                    <div
                                        key={i}
                                        className="hero-visual-card"
                                    >
                                        <div className="text-display-md text-data gradient-text mb-1">
                                            {stat.value}
                                        </div>
                                        <div className="text-label" style={{ color: "var(--color-text-primary)" }}>
                                            {stat.label}
                                        </div>
                                        <div className="text-caption mt-1" style={{ color: "var(--color-text-muted)" }}>
                                            {stat.sublabel}
                                        </div>
                                    </div>
                                ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Horizontal Scroll Feature Strip */}
            <section className="section-tight section-contrast">
                <div className="container-page">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
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
                            <div key={i} className="flex items-center justify-center gap-3">
                                <span className="text-[var(--color-accent)]">◆</span>
                                <span
                                    className="text-caption font-semibold uppercase tracking-wider"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    {item}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The System Section */}
            <section id="program" className="section">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div
                            className="inline-block px-4 py-2 rounded-full mb-6"
                            style={{
                                background: "linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 18%, transparent), color-mix(in srgb, var(--color-strength) 18%, transparent))",
                                border: "1px solid color-mix(in srgb, var(--color-accent) 32%, transparent)"
                            }}
                        >
                            <span className="text-label text-[var(--color-accent)]">
                                The System
                            </span>
                        </div>
                        <h2 className="text-display-md mb-6" style={{ color: "var(--color-text-primary)" }}>
                            BUILT DIFFERENT.
                            <br />
                            <span className="gradient-text">
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
                                gradient: "linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 75%, var(--color-strength)), var(--color-strength))",
                            },
                            {
                                icon: "💪",
                                title: "STRENGTH PRESERVED",
                                description: "Strategic 2x/week lifting with interference controls. Maintain your gains while building base.",
                                gradient: "linear-gradient(135deg, var(--color-strength), var(--color-durability))",
                            },
                            {
                                icon: "🛡️",
                                title: "INJURY-PROOFED",
                                description: "Daily durability work based on 12 movement standards. Catch issues before they sideline you.",
                                gradient: "linear-gradient(135deg, var(--color-durability), color-mix(in srgb, var(--color-accent) 65%, var(--color-durability)))",
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
                                <div
                                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"
                                    style={{ background: feature.gradient }}
                                />

                                <div className="relative z-10">
                                    <div className="text-4xl mb-4">{feature.icon}</div>
                                    <h3 className="text-heading-md mb-3" style={{ color: "var(--color-text-primary)" }}>
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
            <section id="science" className="section section-contrast">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div
                                className="inline-block px-4 py-2 rounded-full mb-6"
                                style={{
                                    background: "linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 18%, transparent), color-mix(in srgb, var(--color-strength) 18%, transparent))",
                                    border: "1px solid color-mix(in srgb, var(--color-accent) 32%, transparent)"
                                }}
                            >
                                <span className="text-label text-[var(--color-accent)]">
                                    Sample Week
                                </span>
                            </div>
                            <h2 className="text-display-md mb-6" style={{ color: "var(--color-text-primary)" }}>
                                A WEEK IN YOUR
                                <br />
                                <span className="gradient-text">
                                    HYBRID LIFE
                                </span>
                            </h2>
                            <p className="text-body-lg mb-8" style={{ color: "var(--color-text-secondary)" }}>
                                See how we balance run volume, intensity, strength, and recovery
                                into a sustainable system.
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-[var(--color-running)]" />
                                    <span className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>Run</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-[var(--color-strength)]" />
                                    <span className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>Strength</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-[var(--color-durability)]" />
                                    <span className="text-body-sm" style={{ color: "var(--color-text-secondary)" }}>Durability</span>
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
                                    <div className={`text-body-sm font-medium ${row.run !== "—" ? "text-[var(--color-running)]" : ""}`} style={{ color: row.run === "—" ? "var(--color-text-muted)" : undefined }}>
                                        {row.run}
                                    </div>
                                    <div className={`text-body-sm font-medium ${row.strength !== "—" ? "text-[var(--color-strength)]" : ""}`} style={{ color: row.strength === "—" ? "var(--color-text-muted)" : undefined }}>
                                        {row.strength}
                                    </div>
                                    <div className="text-body-sm font-medium text-[var(--color-durability)]">
                                        {row.durability}
                                    </div>
                                    <div>
                                        {row.rest && (
                                            <span className="text-caption px-2 py-1 rounded-full bg-white/5" style={{ color: "var(--color-text-muted)" }}>
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
                        <h2 className="text-display-md mb-4" style={{ color: "var(--color-text-primary)" }}>
                            ATHLETES WHO&apos;VE
                            <br />
                            <span className="gradient-text">
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
                                <div className="text-[var(--color-accent)] text-4xl mb-4">&quot;</div>
                                <p className="text-lg mb-6" style={{ color: "var(--color-text-secondary)" }}>
                                    {testimonial.quote}
                                </p>
                                <div>
                                    <div className="font-black" style={{ color: "var(--color-text-primary)" }}>
                                        {testimonial.name}
                                    </div>
                                    <div className="text-body-sm text-[var(--color-accent)]">
                                        {testimonial.title}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section id="get-started" className="section section-contrast relative overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        background: "linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 12%, transparent), transparent 55%, color-mix(in srgb, var(--color-strength) 12%, transparent))"
                    }}
                />

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-display-md mb-6" style={{ color: "var(--color-text-primary)" }}>
                        YOUR MARATHON.
                        <br />
                        <span className="gradient-text">
                            YOUR STRENGTH.
                        </span>
                        <br />
                        YOUR WAY.
                    </h2>
                    <p className="text-body-lg mb-10" style={{ color: "var(--color-text-secondary)" }}>
                        Get your personalized hybrid training plan in minutes.
                    </p>
                    <button className="btn btn-gradient btn-lg">
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
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-body-sm" style={{ background: "var(--gradient-primary)" }}>
                                HC
                            </div>
                            <span className="font-bold" style={{ color: "var(--color-text-primary)" }}>
                                HYBRIDCOACH
                            </span>
                        </div>

                        <p className="text-caption" style={{ color: "var(--color-text-muted)" }}>
                            © 2026 HybridCoach. Train hard. Stay strong. Go far.
                        </p>
                    </div>
                </div>
            </footer>

        </div>
    );
}
