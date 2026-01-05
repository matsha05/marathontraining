'use client';

/**
 * THE LONG GAME - Methodology Page Content
 * 
 * V2 Design System - Premium, trust-building page showcasing coaching science
 */

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ExternalLink, ChevronDown, Sparkles } from 'lucide-react';
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
            layoutId={`coach-${coach.id}`}
            onClick={() => setExpanded(!expanded)}
            className="v2-card v2-card-interactive p-6 cursor-pointer select-none"
            style={{ borderColor: expanded ? 'var(--v2-accent)' : undefined }}
            role="button"
            tabIndex={0}
            aria-expanded={expanded}
            aria-label={`${coach.name} - ${expanded ? 'click to collapse' : 'click to expand'}`}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setExpanded(!expanded);
                }
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-lg font-light mb-1" style={{ color: 'var(--v2-text-secondary)' }}>{coach.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm" style={{ color: 'var(--v2-text-muted)' }}>{coach.title}</span>
                        {coach.credentials && (
                            <span
                                className="px-2 py-0.5 text-[10px] rounded-full"
                                style={{
                                    background: 'var(--v2-accent-subtle)',
                                    color: 'var(--v2-accent)',
                                    border: '1px solid rgba(25, 227, 140, 0.3)'
                                }}
                            >
                                {coach.credentials}
                            </span>
                        )}
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                    className="p-2 rounded-lg"
                >
                    <ChevronDown className="w-5 h-5" style={{ color: 'var(--v2-text-muted)' }} />
                </motion.div>
            </div>

            {/* Expertise Tags */}
            <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                    {coach.expertise.map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-1 text-[10px] rounded-full"
                            style={{ background: 'var(--v2-bg-elevated)', color: 'var(--v2-text-muted)' }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Key Concept Box */}
            <div className="mt-4 p-3 rounded-xl" style={{ background: 'var(--v2-bg-elevated)' }}>
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4" style={{ color: 'var(--v2-accent)' }} />
                    <span className="v2-label" style={{ color: 'var(--v2-accent)' }}>{coach.keyConceptShort}</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--v2-text-secondary)' }}>
                    {expanded ? coach.keyConceptFull : coach.keyConceptFull.slice(0, 80) + (coach.keyConceptFull.length > 80 ? '...' : '')}
                </p>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
                        className="overflow-hidden"
                    >
                        {/* Bio Section */}
                        {coach.bio && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.08 }}
                                className="mt-4 pt-4"
                                style={{ borderTop: '1px solid var(--v2-border)' }}
                            >
                                <p className="v2-label mb-2" style={{ color: 'var(--v2-text-muted)' }}>Background</p>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--v2-text-secondary)' }}>
                                    {coach.bio}
                                </p>
                            </motion.div>
                        )}

                        {/* Achievements Section */}
                        {coach.achievements && coach.achievements.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.12 }}
                                className="mt-4 pt-4"
                                style={{ borderTop: '1px solid var(--v2-border)' }}
                            >
                                <p className="v2-label mb-2" style={{ color: 'var(--v2-text-muted)' }}>Key Achievements</p>
                                <ul className="space-y-1.5">
                                    {coach.achievements.map((achievement, i) => (
                                        <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--v2-text-secondary)' }}>
                                            <span style={{ color: 'var(--v2-accent)' }}>•</span>
                                            {achievement}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}

                        {/* Publications & Notable Athletes */}
                        {((coach.publications && coach.publications.length > 0) || (coach.notableAthletes && coach.notableAthletes.length > 0)) && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.16 }}
                                className="mt-4 pt-4 grid sm:grid-cols-2 gap-4"
                                style={{ borderTop: '1px solid var(--v2-border)' }}
                            >
                                {coach.publications && coach.publications.length > 0 && (
                                    <div>
                                        <p className="v2-label mb-2" style={{ color: 'var(--v2-text-muted)' }}>Publications</p>
                                        <ul className="space-y-1">
                                            {coach.publications.map((pub, i) => (
                                                <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--v2-text-secondary)' }}>
                                                    <BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--v2-text-subtle)' }} />
                                                    {pub}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {coach.notableAthletes && coach.notableAthletes.length > 0 && (
                                    <div>
                                        <p className="v2-label mb-2" style={{ color: 'var(--v2-text-muted)' }}>Notable Athletes</p>
                                        <ul className="space-y-1">
                                            {coach.notableAthletes.map((athlete, i) => (
                                                <li key={i} className="text-sm" style={{ color: 'var(--v2-text-secondary)' }}>{athlete}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* What This Means */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.20 }}
                            className="mt-4 pt-4"
                            style={{ borderTop: '1px solid var(--v2-border)' }}
                        >
                            <p className="v2-label mb-2" style={{ color: 'var(--v2-text-muted)' }}>What this means for your training</p>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--v2-text-secondary)' }}>
                                {coach.whatThisMeans}
                            </p>
                        </motion.div>

                        {/* Source attribution */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.24 }}
                            className="mt-4 pt-3"
                            style={{ borderTop: '1px solid var(--v2-border)' }}
                        >
                            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--v2-text-muted)' }}>
                                <BookOpen className="w-4 h-4" />
                                <span>Source: {coach.source}</span>
                            </div>
                            {coach.website && (
                                <a
                                    href={coach.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 mt-2 text-sm hover:underline"
                                    style={{ color: 'var(--v2-accent)' }}
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Learn more
                                </a>
                            )}
                        </motion.div>
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
        <section className="space-y-8">
            {/* Section Header */}
            <div className="space-y-3">
                <h2 className="text-4xl font-light" style={{ color: 'var(--v2-text-primary)' }}>{category.title}</h2>
                <p className="text-lg max-w-2xl" style={{ color: 'var(--v2-text-muted)' }}>{category.description}</p>
            </div>

            {/* Coach Cards Grid */}
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
                <h2 className="text-2xl font-light mb-2" style={{ color: 'var(--v2-text-primary)' }}>Research Foundation</h2>
                <p className="text-base" style={{ color: 'var(--v2-text-muted)' }}>
                    Peer-reviewed studies that inform our training engine
                </p>
            </div>

            <div className="space-y-4">
                {RESEARCH_SOURCES.slice(0, 4).map((source) => (
                    <div key={source.id} className="v2-card p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="v2-label mb-1">{source.title}</h3>
                                <p className="text-[10px]" style={{ color: 'var(--v2-text-muted)' }}>
                                    {source.authors} ({source.year})
                                </p>
                            </div>
                            {source.doi && (
                                <a
                                    href={`https://doi.org/${source.doi}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] hover:underline"
                                    style={{ color: 'var(--v2-accent)' }}
                                >
                                    DOI
                                </a>
                            )}
                        </div>
                        <p className="mt-3 text-sm" style={{ color: 'var(--v2-text-secondary)' }}>
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
        <div className="v2-root min-h-screen" style={{ background: 'var(--v2-bg-deep)', color: 'var(--v2-text-primary)' }}>
            {/* Nav - matches landing page exactly */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-5">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link
                        href="/"
                        className="text-xs transition-colors flex items-center gap-2"
                        style={{ color: 'var(--v2-text-muted)' }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                    <Link
                        href="/auth"
                        className="text-xs transition-colors"
                        style={{ color: 'var(--v2-text-primary)' }}
                    >
                        Build Your Plan →
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="px-6 py-24 relative overflow-hidden" style={{ background: 'var(--v2-bg-section)' }}>
                {/* Glow */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(800px circle at 50% 40%, rgba(25, 227, 140, 0.04), transparent 60%)' }}
                />
                <div className="max-w-5xl mx-auto relative">
                    <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
                        <div className="max-w-2xl">
                            <p className="v2-label mb-4" style={{ color: 'var(--v2-accent)' }}>Our Methodology</p>
                            <h1 className="text-5xl md:text-6xl font-light mb-6 tracking-tight" style={{ color: 'var(--v2-text-primary)' }}>
                                Built on science.<br />
                                <span style={{ color: 'var(--v2-accent)' }}>Not opinions.</span>
                            </h1>
                            <p className="text-lg" style={{ color: 'var(--v2-text-muted)' }}>
                                Every pace, every workout, every progression in The Long Game is
                                grounded in decades of coaching wisdom and peer-reviewed research.
                                Here&apos;s who we learn from.
                            </p>
                            <div className="flex flex-wrap gap-3 mt-8">
                                <span className="v2-badge">12 coaching standards</span>
                                <span className="v2-badge">8 research sources</span>
                                <span className="v2-badge">200+ training rules</span>
                            </div>
                        </div>

                        <div className="v2-card p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="v2-label">The Engine</p>
                                <span className="v2-badge">4 pillars</span>
                            </div>
                            <div style={{ height: '1px', background: 'linear-gradient(90deg, var(--v2-accent), transparent)' }} />
                            <div className="grid grid-cols-2 gap-3">
                                <div className="v2-card p-3" style={{ background: 'var(--v2-bg-elevated)' }}>
                                    <p className="v2-label mb-1">Running</p>
                                    <p className="text-sm font-light" style={{ color: 'var(--v2-text-secondary)' }}>VDOT Pacing</p>
                                    <p className="text-[10px]" style={{ color: 'var(--v2-text-subtle)' }}>Hansons · Daniels</p>
                                </div>
                                <div className="v2-card p-3" style={{ background: 'var(--v2-bg-elevated)' }}>
                                    <p className="v2-label mb-1">Strength</p>
                                    <p className="text-sm font-light" style={{ color: 'var(--v2-text-secondary)' }}>Interference-safe</p>
                                    <p className="text-[10px]" style={{ color: 'var(--v2-text-subtle)' }}>Hybrid standards</p>
                                </div>
                                <div className="v2-card p-3" style={{ background: 'var(--v2-bg-elevated)' }}>
                                    <p className="v2-label mb-1">Durability</p>
                                    <p className="text-sm font-light" style={{ color: 'var(--v2-text-secondary)' }}>12 checks</p>
                                    <p className="text-[10px]" style={{ color: 'var(--v2-text-subtle)' }}>Prehab protocols</p>
                                </div>
                                <div className="v2-card p-3" style={{ background: 'var(--v2-bg-elevated)' }}>
                                    <p className="v2-label mb-1">Recovery</p>
                                    <p className="text-sm font-light" style={{ color: 'var(--v2-text-secondary)' }}>Adaptive</p>
                                    <p className="text-[10px]" style={{ color: 'var(--v2-text-subtle)' }}>Garmin-ready</p>
                                </div>
                            </div>
                            <div className="v2-card p-3" style={{ background: 'var(--v2-bg-elevated)' }}>
                                <p className="v2-label mb-1" style={{ color: 'var(--v2-accent)' }}>Evidence stack</p>
                                <p className="text-sm" style={{ color: 'var(--v2-text-secondary)' }}>Seiler · Dicharry · Starrett + peer‑reviewed labs</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 pt-16 pb-24">
                <div className="space-y-24">
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
                <section className="mt-24">
                    <div className="v2-card p-12 text-center relative overflow-hidden">
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: 'radial-gradient(600px circle at 50% 100%, rgba(25, 227, 140, 0.06), transparent 60%)' }}
                        />
                        <div className="relative">
                            <h2 className="text-2xl font-light mb-4" style={{ color: 'var(--v2-text-primary)' }}>Ready to train smarter?</h2>
                            <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: 'var(--v2-text-muted)' }}>
                                Get a personalized plan built on these proven methodologies.
                            </p>
                            <Link href="/auth" className="v2-btn v2-btn-primary v2-btn-lg">
                                Build Your Plan
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
