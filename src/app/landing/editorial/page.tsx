"use client";

import Link from "next/link";

export default function EditorialLanding() {
    return (
        <div className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
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
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
                            style={{ background: "var(--gradient-primary)" }}
                        >
                            HC
                        </div>
                        <span className="font-semibold text-lg" style={{ color: "var(--color-text-primary)" }}>
                            HybridCoach
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        {["Method", "Features", "Pricing", "About"].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-sm font-medium transition-colors hover:text-white"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="btn-secondary text-sm py-2 px-4">
                            Log In
                        </button>
                        <button className="btn-primary text-sm py-2 px-4">
                            Start Training
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-20">
                {/* Background gradient */}
                <div
                    className="absolute inset-0"
                    style={{ background: "var(--gradient-hero)" }}
                />
                <div
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px]"
                    style={{ background: "var(--gradient-radial)" }}
                />

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
                    <div className="max-w-4xl">
                        {/* Eyebrow */}
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-in-up"
                            style={{
                                background: "rgba(255, 107, 53, 0.1)",
                                border: "1px solid rgba(255, 107, 53, 0.2)"
                            }}
                        >
                            <span className="w-2 h-2 rounded-full bg-[#ff6b35]" />
                            <span className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
                                Built for former strength athletes
                            </span>
                        </div>

                        {/* Headline */}
                        <h1
                            className="headline-xl mb-6 animate-fade-in-up animate-delay-100"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Run your first marathon
                            <br />
                            <span className="gradient-text">without losing your gains.</span>
                        </h1>

                        {/* Subheadline */}
                        <p
                            className="body-lg max-w-2xl mb-10 animate-fade-in-up animate-delay-200"
                        >
                            Evidence-based training plans designed specifically for CrossFitters, lifters,
                            and hybrid athletes. Build endurance your way—with the strength work built in.
                        </p>

                        {/* CTA */}
                        <div className="flex flex-wrap items-center gap-4 animate-fade-in-up animate-delay-300">
                            <button className="btn-primary text-lg py-4 px-8">
                                Create Your Plan
                            </button>
                            <button className="btn-secondary text-lg py-4 px-8 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                See How It Works
                            </button>
                        </div>

                        {/* Social Proof */}
                        <div
                            className="mt-16 flex items-center gap-8 animate-fade-in-up animate-delay-400"
                        >
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                                        style={{
                                            borderColor: "var(--color-bg-primary)",
                                            background: `hsl(${i * 30 + 10}, 70%, 50%)`,
                                            color: "white"
                                        }}
                                    >
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                    2,400+ athletes trained
                                </p>
                                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                                    with an average 4.9★ rating
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Problem Section */}
            <section id="method" className="section">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <p
                                className="text-sm font-semibold uppercase tracking-wider mb-4"
                                style={{ color: "var(--color-primary)" }}
                            >
                                The Problem
                            </p>
                            <h2
                                className="headline-lg mb-6"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Marathon plans weren't designed for you.
                            </h2>
                            <p className="body-lg mb-8">
                                Traditional training programs assume you're starting from scratch. They ignore
                                your strength base, your work capacity, and what you've spent years building.
                            </p>

                            <div className="space-y-4">
                                {[
                                    "Most plans add endless junk miles that eat into recovery",
                                    "They don't account for concurrent strength training",
                                    "They ignore mobility and durability work",
                                    "Generic intensity—no adaptation for your body"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div
                                            className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0"
                                            style={{ background: "rgba(255, 107, 53, 0.2)" }}
                                        >
                                            <svg className="w-3 h-3" fill="#ff6b35" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span style={{ color: "var(--color-text-secondary)" }}>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div
                                className="aspect-square rounded-2xl p-8 flex flex-col justify-center"
                                style={{ background: "var(--color-bg-card)" }}
                            >
                                <div className="text-center">
                                    <div className="stat-value mb-2">87%</div>
                                    <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
                                        of runners get injured during marathon training
                                    </p>
                                    <div
                                        className="h-px w-24 mx-auto mb-6"
                                        style={{ background: "var(--color-border)" }}
                                    />
                                    <p
                                        className="text-2xl font-bold mb-2"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        Not with HybridCoach.
                                    </p>
                                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                        Our approach puts durability first.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Solution Section */}
            <section
                className="section"
                style={{ background: "var(--color-bg-secondary)" }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p
                            className="text-sm font-semibold uppercase tracking-wider mb-4"
                            style={{ color: "var(--color-primary)" }}
                        >
                            Our Method
                        </p>
                        <h2
                            className="headline-lg mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Built on science. Designed for hybrids.
                        </h2>
                        <p className="body-lg max-w-2xl mx-auto">
                            We synthesized the best of Hansons, Daniels, Seiler, and Starrett into a
                            system that respects your strength background.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: "VDOT Pacing",
                                description: "Every pace calculated from your actual race times. No guessing.",
                                icon: "⏱",
                            },
                            {
                                title: "Polarized Training",
                                description: "80% easy, 20% hard. No junk miles in the middle.",
                                icon: "📊",
                            },
                            {
                                title: "Built-in Strength",
                                description: "2x/week lifting with interference controls.",
                                icon: "💪",
                            },
                            {
                                title: "Daily Durability",
                                description: "10-15 min prehab routines based on your assessments.",
                                icon: "🔧",
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="card p-6 hover-lift"
                            >
                                <div className="text-3xl mb-4">{feature.icon}</div>
                                <h3
                                    className="font-semibold text-lg mb-2"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    {feature.title}
                                </h3>
                                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Priority Hierarchy */}
            <section id="features" className="section">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2
                            className="headline-lg mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Our priority hierarchy
                        </h2>
                        <p className="body-lg max-w-2xl mx-auto">
                            When decisions conflict, we always protect what matters most.
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {[
                            { num: "1", title: "Durability", desc: "Can you absorb training without breaking?", active: true },
                            { num: "2", title: "Consistency", desc: "Are you training regularly without forced breaks?" },
                            { num: "3", title: "Specificity", desc: "Is training matched to your goal race?" },
                            { num: "4", title: "Performance", desc: "Are you getting faster and stronger?" },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-6 p-6 rounded-xl transition-all"
                                style={{
                                    background: item.active ? "rgba(255, 107, 53, 0.1)" : "var(--color-bg-card)",
                                    border: item.active ? "1px solid rgba(255, 107, 53, 0.3)" : "1px solid var(--color-border)"
                                }}
                            >
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                                    style={{
                                        background: item.active ? "var(--gradient-primary)" : "var(--color-bg-tertiary)",
                                        color: item.active ? "white" : "var(--color-text-muted)"
                                    }}
                                >
                                    {item.num}
                                </div>
                                <div>
                                    <h3
                                        className="font-semibold text-lg"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        {item.title}
                                    </h3>
                                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Race Distances */}
            <section
                className="section"
                style={{ background: "var(--color-bg-secondary)" }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2
                            className="headline-lg mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            From 5K to Ultramarathon
                        </h2>
                        <p className="body-lg max-w-2xl mx-auto">
                            Every distance has different demands. Our engine adapts the entire training
                            structure to match your goal.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { name: "5K", focus: "VO2max", weeks: "8-12" },
                            { name: "10K", focus: "Threshold", weeks: "10-14" },
                            { name: "Half", focus: "Endurance", weeks: "12-16" },
                            { name: "Marathon", focus: "MP Work", weeks: "16-20" },
                            { name: "50K", focus: "Time on Feet", weeks: "16-24" },
                            { name: "100M", focus: "Durability", weeks: "24-32" },
                        ].map((race, i) => (
                            <div
                                key={i}
                                className="card p-4 text-center hover-lift cursor-pointer"
                            >
                                <div
                                    className="text-2xl font-bold mb-1"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    {race.name}
                                </div>
                                <div
                                    className="text-xs mb-2"
                                    style={{ color: "var(--color-primary)" }}
                                >
                                    {race.focus}
                                </div>
                                <div
                                    className="text-xs"
                                    style={{ color: "var(--color-text-muted)" }}
                                >
                                    {race.weeks} weeks
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2
                        className="headline-lg mb-6"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Ready to train smarter?
                    </h2>
                    <p className="body-lg mb-10">
                        Get your personalized training plan in under 5 minutes.
                        Just enter a recent race time and your goal.
                    </p>
                    <button className="btn-primary text-lg py-4 px-10">
                        Create Your Free Plan
                    </button>
                    <p
                        className="text-sm mt-4"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        No credit card required. Start training today.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer
                className="py-12"
                style={{
                    borderTop: "1px solid var(--color-border)",
                    background: "var(--color-bg-secondary)"
                }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                                style={{ background: "var(--gradient-primary)" }}
                            >
                                HC
                            </div>
                            <span
                                className="font-semibold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                HybridCoach
                            </span>
                        </div>

                        <p
                            className="text-sm"
                            style={{ color: "var(--color-text-muted)" }}
                        >
                            © 2026 HybridCoach. Built for athletes who refuse to choose.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
