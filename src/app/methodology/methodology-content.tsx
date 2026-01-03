'use client';

/**
 * THE LONG GAME - Methodology Page Content
 * 
 * Premium, trust-building page showcasing the coaching science
 * behind our training plans. Links from onboarding tooltips.
 */

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ExternalLink, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    COACHES,
    METHODOLOGY_CATEGORIES,
    RESEARCH_SOURCES,
    Coach,
} from '@/config/coach-spec/methodology';

// =============================================================================
// COACH CARD COMPONENT
// =============================================================================

function CoachCard({ coach }: { coach: Coach }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div
            layout
            className="card card-interactive p-6 hover:border-[var(--color-accent)] transition-colors"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-heading-sm mb-1">{coach.name}</h3>
                    <p className="text-body-sm text-[var(--text-muted)]">{coach.title}</p>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-2 rounded-lg hover:bg-[var(--bg-muted)] transition-colors"
                    aria-label={expanded ? 'Collapse' : 'Expand'}
                >
                    {expanded ? (
                        <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                    )}
                </button>
            </div>

            <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                    {coach.expertise.map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-1 text-caption rounded-full bg-[var(--bg-inset)] text-[var(--text-muted)]"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[var(--bg-inset)]">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
                    <span className="text-label text-[var(--color-accent)]">{coach.keyConceptShort}</span>
                </div>
                <p className="text-body-sm text-[var(--text-base)]">
                    {expanded ? coach.keyConceptFull : coach.keyConceptFull.slice(0, 80) + (coach.keyConceptFull.length > 80 ? '...' : '')}
                </p>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 pt-4 border-t border-[var(--border-muted)]">
                            <div className="flex items-center gap-2 text-body-sm text-[var(--text-muted)]">
                                <BookOpen className="w-4 h-4" />
                                <span>{coach.source}</span>
                            </div>
                            {coach.website && (
                                <a
                                    href={coach.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 mt-2 text-body-sm text-[var(--color-accent)] hover:underline"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Learn more
                                </a>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// =============================================================================
// CATEGORY SECTION
// =============================================================================

function CategorySection({ category }: { category: typeof METHODOLOGY_CATEGORIES.running }) {
    const coaches = category.coaches.map(id => COACHES[id]).filter(Boolean);

    return (
        <section className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-display-sm mb-2">{category.title}</h2>
                <p className="text-body-md text-[var(--text-muted)]">{category.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {coaches.map((coach) => (
                    <CoachCard key={coach.id} coach={coach} />
                ))}
            </div>
        </section>
    );
}

// =============================================================================
// RESEARCH SOURCES SECTION
// =============================================================================

function ResearchSection() {
    return (
        <section className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-display-sm mb-2">Research Foundation</h2>
                <p className="text-body-md text-[var(--text-muted)]">
                    Peer-reviewed studies that inform our training engine
                </p>
            </div>

            <div className="space-y-4">
                {RESEARCH_SOURCES.slice(0, 4).map((source) => (
                    <div
                        key={source.id}
                        className="card p-5"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-label mb-1">{source.title}</h3>
                                <p className="text-caption text-[var(--text-muted)]">
                                    {source.authors} ({source.year})
                                </p>
                            </div>
                            {source.doi && (
                                <a
                                    href={`https://doi.org/${source.doi}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[var(--color-accent)] hover:underline text-caption"
                                >
                                    DOI
                                </a>
                            )}
                        </div>
                        <p className="mt-3 text-body-sm text-[var(--text-base)]">
                            {source.keyFinding}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

// =============================================================================
// MAIN CONTENT
// =============================================================================

export function MethodologyContent() {
    return (
        <div className="min-h-screen landing-shell">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-[var(--border-muted)]">
                <div className="container-page h-[var(--header-height)] flex items-center justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-body-sm text-[var(--text-muted)] hover:text-[var(--text-base)] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                    <Link href="/auth" className="btn btn-gradient btn-sm">
                        Build Your Plan
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <section className="hero-section hero-surface">
                <div className="container-page">
                    <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
                        <div className="max-w-2xl">
                            <p className="text-label text-[var(--color-accent)] mb-4">Our Methodology</p>
                            <h1 className="text-display-lg mb-6">
                                Built on science.<br />
                                <span className="gradient-text">Not opinions.</span>
                            </h1>
                            <p className="text-body-lg text-[var(--text-muted)]">
                                Every pace, every workout, every progression in The Long Game is
                                grounded in decades of coaching wisdom and peer-reviewed research.
                                Here&apos;s who we learn from.
                            </p>
                            <div className="flex flex-wrap gap-3 mt-8">
                                <span className="metric-chip">12 coaching standards</span>
                                <span className="metric-chip">8 research sources</span>
                                <span className="metric-chip">200+ training rules</span>
                            </div>
                        </div>

                        <div className="hero-visual">
                            <div className="hero-visual-inner">
                                <div className="flex items-center justify-between">
                                    <p className="text-label">The Engine</p>
                                    <span className="metric-chip">4 pillars</span>
                                </div>
                                <div className="signal-line" />
                                <div className="stat-grid">
                                    <div className="hero-visual-card">
                                        <p className="text-label mb-1">Running</p>
                                        <p className="text-heading-md text-data">VDOT Pacing</p>
                                        <p className="text-caption">Hansons · Daniels</p>
                                    </div>
                                    <div className="hero-visual-card">
                                        <p className="text-label mb-1">Strength</p>
                                        <p className="text-heading-md text-data">Interference-safe</p>
                                        <p className="text-caption">Hybrid standards</p>
                                    </div>
                                    <div className="hero-visual-card">
                                        <p className="text-label mb-1">Durability</p>
                                        <p className="text-heading-md text-data">12 checks</p>
                                        <p className="text-caption">Prehab protocols</p>
                                    </div>
                                    <div className="hero-visual-card">
                                        <p className="text-label mb-1">Recovery</p>
                                        <p className="text-heading-md text-data">Adaptive</p>
                                        <p className="text-caption">Garmin-ready</p>
                                    </div>
                                </div>
                                <div className="hero-visual-card">
                                    <p className="text-label text-[var(--color-accent)] mb-2">Evidence stack</p>
                                    <p className="text-body-sm">Seiler · Dicharry · Starrett + peer‑reviewed labs</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="container-page pb-24">
                <div className="space-y-16">
                    {/* Running Science */}
                    <CategorySection category={METHODOLOGY_CATEGORIES.running} />

                    {/* Strength */}
                    <CategorySection category={METHODOLOGY_CATEGORIES.strength} />

                    {/* Durability */}
                    <CategorySection category={METHODOLOGY_CATEGORIES.durability} />

                    {/* Elite */}
                    <CategorySection category={METHODOLOGY_CATEGORIES.elite} />

                    {/* Research */}
                    <ResearchSection />
                </div>

                {/* CTA */}
                <section className="section">
                    <div className="cta-panel text-center">
                        <h2 className="text-display-sm mb-4">Ready to train smarter?</h2>
                        <p className="text-body-md text-[var(--text-muted)] mb-8 max-w-lg mx-auto">
                            Get a personalized plan built on these proven methodologies.
                        </p>
                        <Link
                            href="/auth"
                            className="btn btn-gradient btn-lg inline-flex"
                        >
                            Build Your Plan
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
