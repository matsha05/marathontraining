"use client";

import Link from "next/link";

export default function TechnicalLanding() {
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
            <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md" style={{ background: "rgba(10, 10, 11, 0.8)" }}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <span className="font-mono font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            hybrid<span className="text-violet-400">coach</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        {["Methodology", "Calculator", "Docs", "Changelog"].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-sm font-mono transition-colors hover:text-violet-400"
                                style={{ color: "var(--color-text-muted)" }}
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            className="font-mono text-sm py-2 px-4 rounded-lg transition-colors hover:text-white"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Sign in
                        </button>
                        <button className="font-mono text-sm py-2 px-4 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:opacity-90 transition-opacity">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Technical & Clean */}
            <section className="relative pt-32 pb-20">
                {/* Subtle grid background */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(var(--color-text-muted) 1px, transparent 1px),
                              linear-gradient(90deg, var(--color-text-muted) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />

                <div className="relative z-10 max-w-7xl mx-auto px-6">
                    <div className="max-w-3xl">
                        {/* Version badge */}
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-xs mb-8"
                            style={{
                                background: "var(--color-bg-tertiary)",
                                border: "1px solid var(--color-border)"
                            }}
                        >
                            <span className="text-violet-400">v2.0</span>
                            <span style={{ color: "var(--color-text-muted)" }}>•</span>
                            <span style={{ color: "var(--color-text-secondary)" }}>Now with injury prevention engine</span>
                        </div>

                        {/* Headline */}
                        <h1
                            className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Evidence-based training plans for{" "}
                            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                                hybrid athletes
                            </span>
                        </h1>

                        {/* Description */}
                        <p
                            className="text-lg mb-8 leading-relaxed"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            A deterministic plan generator built on peer-reviewed science.
                            Synthesizes Hansons, Daniels VDOT, Seiler&apos;s polarized model, and
                            Starrett&apos;s durability standards into one coherent system.
                        </p>

                        {/* CTA */}
                        <div className="flex flex-wrap items-center gap-4 mb-12">
                            <button className="flex items-center gap-2 font-medium py-3 px-6 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:opacity-90 transition-opacity">
                                Calculate Your Plan
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </button>
                            <a
                                href="#methodology"
                                className="font-medium py-3 px-6 rounded-lg transition-colors hover:bg-white/5"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Read the docs →
                            </a>
                        </div>

                        {/* Quick stats */}
                        <div
                            className="grid grid-cols-4 gap-4 p-4 rounded-lg font-mono"
                            style={{
                                background: "var(--color-bg-secondary)",
                                border: "1px solid var(--color-border)"
                            }}
                        >
                            {[
                                { label: "Lines of spec", value: "1,409" },
                                { label: "Research sources", value: "8" },
                                { label: "Encoded rules", value: "200+" },
                                { label: "Test coverage", value: "95%" },
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-xl font-semibold text-violet-400">{stat.value}</div>
                                    <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* VDOT Calculator Preview */}
            <section id="calculator" className="py-20" style={{ background: "var(--color-bg-secondary)" }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        <div>
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-xs mb-6"
                                style={{ background: "rgba(139, 92, 246, 0.1)", color: "var(--color-text-muted)" }}
                            >
                                <svg className="w-3 h-3 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                VDOT Engine
                            </div>
                            <h2
                                className="text-3xl font-semibold mb-4"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Precision pacing from first principles
                            </h2>
                            <p
                                className="mb-8"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Enter any race result (800m+) and we&apos;ll derive your training paces
                                using the Daniels/Gilbert equations. No guessing, no generic percentages.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { zone: "E", name: "Easy", range: "59-74%", color: "bg-green-500" },
                                    { zone: "M", name: "Marathon", range: "75-84%", color: "bg-blue-500" },
                                    { zone: "T", name: "Threshold", range: "83-88%", color: "bg-yellow-500" },
                                    { zone: "I", name: "Interval", range: "97-100%", color: "bg-orange-500" },
                                    { zone: "R", name: "Repetition", range: "~mile", color: "bg-red-500" },
                                ].map((zone, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 p-3 rounded-lg"
                                        style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}
                                    >
                                        <div className={`w-2 h-8 rounded-full ${zone.color}`} />
                                        <div className="font-mono font-semibold w-8" style={{ color: "var(--color-text-primary)" }}>
                                            {zone.zone}
                                        </div>
                                        <div style={{ color: "var(--color-text-secondary)" }}>
                                            {zone.name}
                                        </div>
                                        <div className="ml-auto font-mono text-sm" style={{ color: "var(--color-text-muted)" }}>
                                            {zone.range} VO₂max
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Code Preview */}
                        <div
                            className="rounded-xl overflow-hidden"
                            style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}
                        >
                            <div
                                className="px-4 py-3 flex items-center gap-2 border-b"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                                </div>
                                <span className="font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
                                    vdot/calculator.ts
                                </span>
                            </div>
                            <pre className="p-4 text-sm font-mono overflow-x-auto">
                                <code>
                                    <span style={{ color: "var(--color-text-muted)" }}>// Calculate VDOT from race result</span>
                                    {"\n"}
                                    <span className="text-violet-400">function</span>{" "}
                                    <span className="text-cyan-400">vdotFromRace</span>
                                    <span style={{ color: "var(--color-text-secondary)" }}>(</span>
                                    {"\n"}
                                    {"  "}distanceM<span style={{ color: "var(--color-text-muted)" }}>:</span>{" "}
                                    <span className="text-emerald-400">number</span>,
                                    {"\n"}
                                    {"  "}timeSeconds<span style={{ color: "var(--color-text-muted)" }}>:</span>{" "}
                                    <span className="text-emerald-400">number</span>
                                    {"\n"}
                                    <span style={{ color: "var(--color-text-secondary)" }}>)</span>
                                    <span style={{ color: "var(--color-text-muted)" }}>:</span>{" "}
                                    <span className="text-emerald-400">number</span>{" "}
                                    <span style={{ color: "var(--color-text-secondary)" }}>{"{"}</span>
                                    {"\n"}
                                    {"  "}<span className="text-violet-400">const</span> T = timeSeconds / <span className="text-amber-400">60</span>;
                                    {"\n"}
                                    {"  "}<span className="text-violet-400">const</span> v = distanceM / T;
                                    {"\n"}
                                    {"\n"}
                                    {"  "}<span style={{ color: "var(--color-text-muted)" }}>// VO2 demand at race velocity</span>
                                    {"\n"}
                                    {"  "}<span className="text-violet-400">const</span> VO2 = <span className="text-amber-400">-4.6</span> +
                                    {"\n"}
                                    {"    "}<span className="text-amber-400">0.182258</span> * v +
                                    {"\n"}
                                    {"    "}<span className="text-amber-400">0.000104</span> * (v ** <span className="text-amber-400">2</span>);
                                    {"\n"}
                                    {"\n"}
                                    {"  "}<span className="text-violet-400">return</span> VO2 / pct;
                                    {"\n"}
                                    <span style={{ color: "var(--color-text-secondary)" }}>{"}"}</span>
                                </code>
                            </pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* Methodology Section */}
            <section id="methodology" className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2
                            className="text-3xl font-semibold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Built on research, not opinions
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)" }}>
                            Every rule is traceable to peer-reviewed sources
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                source: "Hansons Method",
                                concept: "Cumulative fatigue & 16mi cap",
                                key: "6 runs/week, wave loading",
                            },
                            {
                                source: "Daniels VDOT",
                                concept: "Physiological pace zones",
                                key: "VO₂max-based training",
                            },
                            {
                                source: "Seiler 80/20",
                                concept: "Polarized distribution",
                                key: "Zone 2 guardrails",
                            },
                            {
                                source: "Starrett/Dicharry",
                                concept: "Movement standards",
                                key: "12 durability checks",
                            },
                        ].map((source, i) => (
                            <div
                                key={i}
                                className="p-5 rounded-lg"
                                style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}
                            >
                                <div className="font-mono text-sm text-violet-400 mb-2">{source.source}</div>
                                <div
                                    className="font-medium mb-2"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    {source.concept}
                                </div>
                                <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                                    {source.key}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div
                        className="mt-8 p-6 rounded-lg text-center"
                        style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}
                    >
                        <p className="font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Full methodology documented in{" "}
                            <a href="#" className="text-violet-400 hover:underline">COACHSPEC.md</a>
                            {" "}• 1,409 lines of encodable rules
                        </p>
                    </div>
                </div>
            </section>

            {/* Feature Matrix */}
            <section className="py-20" style={{ background: "var(--color-bg-secondary)" }}>
                <div className="max-w-5xl mx-auto px-6">
                    <h2
                        className="text-2xl font-semibold mb-8 text-center"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        What&apos;s included
                    </h2>

                    <div
                        className="rounded-xl overflow-hidden"
                        style={{ border: "1px solid var(--color-border)" }}
                    >
                        <table className="w-full">
                            <thead>
                                <tr style={{ background: "var(--color-bg-tertiary)" }}>
                                    <th className="text-left p-4 font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                        Module
                                    </th>
                                    <th className="text-left p-4 font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                        Function
                                    </th>
                                    <th className="text-center p-4 font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { module: "VDOT Calculator", func: "Race → training paces", status: "✓" },
                                    { module: "Weekly Structure", func: "Hansons-based templates", status: "✓" },
                                    { module: "Race Distance", func: "5K to Ultra adaptation", status: "✓" },
                                    { module: "Polarized Engine", func: "80/20 guardrails", status: "✓" },
                                    { module: "Strength Integration", func: "Interference controls", status: "✓" },
                                    { module: "Durability System", func: "12 standards + modules", status: "✓" },
                                    { module: "Injury Monitor", func: "RED/AMBER/GREEN logic", status: "✓" },
                                    { module: "Nutrition Calculator", func: "Fuel by duration", status: "✓" },
                                ].map((row, i) => (
                                    <tr
                                        key={i}
                                        style={{
                                            background: i % 2 === 0 ? "var(--color-bg-card)" : "var(--color-bg-secondary)",
                                            borderTop: "1px solid var(--color-border)"
                                        }}
                                    >
                                        <td className="p-4 font-mono text-sm" style={{ color: "var(--color-text-primary)" }}>
                                            {row.module}
                                        </td>
                                        <td className="p-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                            {row.func}
                                        </td>
                                        <td className="p-4 text-center text-emerald-400">
                                            {row.status}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2
                        className="text-3xl font-semibold mb-4"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Ready to train with precision?
                    </h2>
                    <p
                        className="mb-8"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Enter a recent race time. Get your complete training plan in minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="w-full sm:w-auto font-medium py-3 px-8 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:opacity-90 transition-opacity">
                            Calculate Your Plan
                        </button>
                        <button
                            className="w-full sm:w-auto font-medium py-3 px-8 rounded-lg transition-colors"
                            style={{
                                background: "var(--color-bg-card)",
                                color: "var(--color-text-secondary)",
                                border: "1px solid var(--color-border)"
                            }}
                        >
                            View Changelog
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer
                className="py-8"
                style={{
                    borderTop: "1px solid var(--color-border)",
                    background: "var(--color-bg-secondary)"
                }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
                                </svg>
                            </div>
                            <span className="font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                hybridcoach
                            </span>
                        </div>

                        <div className="flex items-center gap-6 font-mono text-sm">
                            {["Docs", "GitHub", "Discord", "Changelog"].map((link) => (
                                <a
                                    key={link}
                                    href="#"
                                    className="transition-colors hover:text-violet-400"
                                    style={{ color: "var(--color-text-muted)" }}
                                >
                                    {link}
                                </a>
                            ))}
                        </div>

                        <p
                            className="text-sm font-mono"
                            style={{ color: "var(--color-text-muted)" }}
                        >
                            © 2026
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
