"use client";

/**
 * THE LONG GAME - Methodology Page Content
 * 
 * Flow variant: Homepage-style full-width scrolling sections with inline expand
 * All content included: bio, achievements, publications, notable athletes, whatThisMeans, source, website
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ExternalLink, ChevronDown } from "lucide-react";
import { COACHES, METHODOLOGY_CATEGORIES, RESEARCH_SOURCES, Coach } from "@/config/coach-spec/methodology";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

// =============================================================================
// COACH DETAIL CONTENT
// =============================================================================

function CoachDetailContent({ coach }: { coach: Coach }) {
    return (
        <>
            {coach.bio && (
                <div className="mb-6">
                    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Background</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{coach.bio}</p>
                </div>
            )}
            {coach.achievements && coach.achievements.length > 0 && (
                <div className="mb-6">
                    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Key Achievements</p>
                    <ul className="space-y-2">
                        {coach.achievements.map((a, i) => (
                            <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                                <span style={{ color: 'var(--color-accent)' }}>•</span>{a}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {((coach.publications && coach.publications.length > 0) || (coach.notableAthletes && coach.notableAthletes.length > 0)) && (
                <div className="mb-6 grid sm:grid-cols-2 gap-6">
                    {coach.publications && coach.publications.length > 0 && (
                        <div>
                            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Publications</p>
                            <ul className="space-y-2">
                                {coach.publications.map((pub, i) => (
                                    <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                                        <BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-subtle)' }} />{pub}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {coach.notableAthletes && coach.notableAthletes.length > 0 && (
                        <div>
                            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Notable Athletes</p>
                            <ul className="space-y-1">
                                {coach.notableAthletes.map((athlete, i) => (
                                    <li key={i} className="text-sm" style={{ color: 'var(--text-muted)' }}>{athlete}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
            <div className="mb-6">
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>What this means for your training</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{coach.whatThisMeans}</p>
            </div>
            <div className="pt-4" style={{ borderTop: '1px solid var(--border-base)' }}>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <BookOpen className="w-4 h-4" /><span>Source: {coach.source}</span>
                </div>
                {coach.website && (
                    <a href={coach.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mt-2 text-sm hover:underline" style={{ color: 'var(--color-accent)' }} onClick={(e) => e.stopPropagation()}>
                        <ExternalLink className="w-4 h-4" />Learn more
                    </a>
                )}
            </div>
        </>
    );
}

// =============================================================================
// MAIN CONTENT
// =============================================================================

export function MethodologyContent() {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const allCoaches = Object.values(COACHES);
    const colors = ['var(--color-strength)', '#ec4899', '#06b6d4', 'var(--color-accent)', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444'];

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent SSG from rendering with useTheme
    if (!mounted) {
        return <div className="v3-root min-h-screen" style={{ background: 'var(--bg-base)' }} />;
    }

    return (
        <div className="v3-root min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}>
            <SiteHeader />

            {/* Hero */}
            <section className="min-h-[70vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(800px circle at 50% 55%, color-mix(in srgb, var(--color-accent) 4%, transparent) 0%, transparent 60%)' }} />
                <div className="text-center w-full max-w-3xl relative z-10">
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Our Methodology</motion.p>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease }} className="text-5xl md:text-6xl font-light mb-6 tracking-tight" style={{ color: 'var(--text-base)' }}>Built on science.</motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease }} className="text-lg mb-8" style={{ color: 'var(--text-subtle)' }}>Every pace, every workout, every progression is grounded in decades of coaching wisdom.</motion.p>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-wrap justify-center gap-3">
                        <span className="px-3 py-1 text-xs rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>12 coaching standards</span>
                        <span className="px-3 py-1 text-xs rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>5 research sources</span>
                    </motion.div>
                </div>
            </section>

            {/* Categories + Coaches */}
            {Object.entries(METHODOLOGY_CATEGORIES).map(([key, category]) => (
                <React.Fragment key={key}>
                    <section className="px-6 py-20" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="max-w-3xl mx-auto text-center">
                            <h2 className="text-3xl font-light mb-3" style={{ color: 'var(--text-base)' }}>{category.title}</h2>
                            <p className="text-base" style={{ color: 'var(--text-muted)' }}>{category.description}</p>
                        </div>
                    </section>
                    {category.coaches.map((id) => {
                        const coach = COACHES[id];
                        if (!coach) return null;
                        const isExpanded = expandedId === coach.id;
                        const color = colors[allCoaches.findIndex(c => c.id === id) % colors.length];
                        return (
                            <section
                                key={coach.id}
                                className="px-6 py-12"
                                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                            >
                                <div className="max-w-3xl mx-auto">
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : coach.id)}
                                        className="w-full text-left transition-colors hover:bg-white/[0.02] rounded-lg -mx-4 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]"
                                        aria-expanded={isExpanded}
                                        aria-label={`${coach.name} methodology - ${isExpanded ? 'collapse' : 'expand'}`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                                                    <h3 className="text-xl font-light" style={{ color: 'var(--text-base)' }}>{coach.name}</h3>
                                                    <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>{coach.keyConceptShort}</span>
                                                </div>
                                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{coach.keyConceptFull}</p>
                                            </div>
                                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="p-2 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                                                <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                            </motion.div>
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-base)' }}>
                                                    <CoachDetailContent coach={coach} />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </section>
                        );
                    })}
                </React.Fragment>
            ))}

            {/* Research */}
            <section className="px-6 py-16" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="max-w-3xl mx-auto">
                    <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Research Foundation</p>
                    <h2 className="text-3xl font-light mb-8" style={{ color: 'var(--text-base)' }}>Peer-reviewed studies</h2>
                    <div className="space-y-4">
                        {RESEARCH_SOURCES.map((source) => (
                            <div key={source.id} className="p-5 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-base)' }}>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{source.title}</h3>
                                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{source.authors} ({source.year}) {source.journal && `· ${source.journal}`}</p>
                                    </div>
                                    {source.doi && <a href={`https://doi.org/${source.doi}`} target="_blank" rel="noopener noreferrer" className="text-[10px] hover:underline flex-shrink-0" style={{ color: 'var(--color-accent)' }}>DOI ↗</a>}
                                </div>
                                <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>{source.keyFinding}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-light mb-6" style={{ color: 'var(--text-base)' }}>Ready to train smarter?</h2>
                    <p className="text-lg mb-8" style={{ color: 'var(--text-muted)' }}>Get a personalized plan built on these proven methodologies.</p>
                    <Link href="/onboarding" className="v3-btn v3-btn-primary v3-btn-lg">Get Started</Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
