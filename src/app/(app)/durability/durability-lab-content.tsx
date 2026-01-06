"use client";

/**
 * THE LONG GAME - Durability Lab
 * 
 * Premium durability education and assessment page
 * Modeled after the methodology page - a one-stop shop for runner durability
 * 
 * Based on:
 * - Jay Dicharry's "Running Rewired"
 * - Kelly Starrett's "Ready to Run"
 */

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    Zap,
    ClipboardList,
    BookOpen,
    ExternalLink,
    Activity,
    Target,
    Shield,
    Footprints,
    ArrowRight,
} from "lucide-react";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

// =============================================================================
// COACH DATA
// =============================================================================

interface DurabilityCoach {
    id: string;
    name: string;
    tagline: string;
    color: string;
    book: string;
    bookSubtitle: string;
    keyConcept: string;
    focusAreas: string[];
    keyInsight: string;
    bio: string;
    whatThisMeans: string;
    website?: string;
}

const DURABILITY_COACHES: DurabilityCoach[] = [
    {
        id: 'dicharry',
        name: 'Jay Dicharry',
        tagline: 'Injuries are a skill problem, not just a mobility problem',
        color: 'var(--color-coach-dicharry, #3b82f6)',
        book: 'Running Rewired',
        bookSubtitle: 'Reinvent Your Run for Stability, Strength & Speed',
        keyConcept: 'Precision movement under single-leg load',
        focusAreas: [
            'Foot tripod and big-toe control',
            'Deep core stabilizers (not six-pack work)',
            'Hip extension without lumbar compensation',
            'Single-leg stability as the foundation',
        ],
        keyInsight: '"If you can\'t hit baseline positions cleanly, your body compensates under load."',
        bio: 'Jay Dicharry is a physical therapist and biomechanist who has worked with elite runners including Olympians and world champions. He directs the REP Biomechanics Lab in Bend, Oregon and has spent over two decades studying the mechanics of running injury and performance.',
        whatThisMeans: 'Every assessment tests your ability to control movement under single-leg load—the exact demand of running. When you fail a test, you\'ll get correctives that build precision movement patterns, not just flexibility.',
        website: 'https://www.runningrewired.com/',
    },
    {
        id: 'starrett',
        name: 'Kelly Starrett',
        tagline: '12 standards that gate running durability',
        color: 'var(--color-coach-starrett, #10b981)',
        book: 'Ready to Run',
        bookSubtitle: 'Unlocking Your Potential to Run Naturally',
        keyConcept: 'Movement standards as a readiness checklist',
        focusAreas: [
            'Neutral feet and natural foot position',
            'Ankle range of motion (4+ inches)',
            'Hip flexion and extension range',
            'Thoracic spine mobility for arm swing',
            'Tissue quality and "no hotspots"',
        ],
        keyInsight: '"These aren\'t advanced—they\'re the minimum."',
        bio: 'Kelly Starrett is a Doctor of Physical Therapy, coach, and author who has revolutionized how athletes think about mobility and movement. He co-founded The Ready State (formerly MobilityWOD) and has worked with professional sports teams, military operators, and Olympic athletes.',
        whatThisMeans: 'The 12 Standards give you a simple daily checklist. Can you assume the key shapes? Do you have hotspots changing your mechanics? 10-15 minutes of daily maintenance keeps you running for life.',
        website: 'https://thereadystate.com/',
    },
];

// =============================================================================
// STARRETT'S 12 STANDARDS
// =============================================================================

interface Standard {
    id: number;
    name: string;
    description: string;
    icon: string;
}

const TWELVE_STANDARDS: Standard[] = [
    { id: 1, name: 'Neutral Feet', description: 'Natural foot position without collapse', icon: '🦶' },
    { id: 2, name: 'Flat Shoes', description: 'Zero-drop footwear philosophy', icon: '👟' },
    { id: 3, name: 'Supple T-Spine', description: 'Upper back rotation for arm swing', icon: '🔄' },
    { id: 4, name: 'Efficient Squat', description: 'Full-depth squat as mobility gate', icon: '⬇️' },
    { id: 5, name: 'Hip Flexion', description: 'Knee-to-chest range of motion', icon: '🦵' },
    { id: 6, name: 'Hip Extension', description: 'Extend hip without arching back', icon: '↗️' },
    { id: 7, name: 'Ankle ROM', description: '4+ inches in knee-to-wall test', icon: '📏' },
    { id: 8, name: 'Warm Up', description: 'Daily movement preparation', icon: '🔥' },
    { id: 9, name: 'Compression', description: 'Recovery tool utilization', icon: '🧦' },
    { id: 10, name: 'No Hotspots', description: 'Zero tissue adhesions or trigger points', icon: '🎯' },
    { id: 11, name: 'Hydration', description: 'Tissue quality through hydration', icon: '💧' },
    { id: 12, name: 'Jump & Land', description: 'Explosive capacity and control', icon: '🚀' },
];

// =============================================================================
// COMPONENTS
// =============================================================================

function CoachCard({ coach, isExpanded, onToggle }: {
    coach: DurabilityCoach;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    return (
        <div
            className="rounded-2xl overflow-hidden transition-all duration-300"
            style={{
                background: 'var(--v3-bg-card)',
                border: `1px solid ${isExpanded ? coach.color : 'var(--border-base)'}`,
            }}
        >
            <button
                onClick={onToggle}
                className="w-full text-left p-6 transition-colors hover:bg-[var(--bg-elevated)]"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ background: coach.color }}
                            />
                            <h3 className="text-xl font-light" style={{ color: 'var(--text-base)' }}>
                                {coach.name}
                            </h3>
                        </div>
                        <p
                            className="text-sm italic mb-4"
                            style={{ color: coach.color }}
                        >
                            "{coach.tagline}"
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {coach.keyConcept}
                        </p>
                    </div>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{ background: 'var(--bg-elevated)' }}
                    >
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
                        <div
                            className="px-6 pb-6 pt-4"
                            style={{ borderTop: '1px solid var(--border-base)' }}
                        >
                            {/* Focus Areas */}
                            <div className="mb-6">
                                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                                    Focus Areas
                                </p>
                                <ul className="space-y-2">
                                    {coach.focusAreas.map((area, i) => (
                                        <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                                            <span style={{ color: coach.color }}>•</span>{area}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Key Insight */}
                            <div
                                className="p-4 rounded-xl mb-6"
                                style={{
                                    background: `${coach.color}10`,
                                    borderLeft: `3px solid ${coach.color}`,
                                }}
                            >
                                <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                                    {coach.keyInsight}
                                </p>
                            </div>

                            {/* Bio */}
                            <div className="mb-6">
                                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                                    Background
                                </p>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                    {coach.bio}
                                </p>
                            </div>

                            {/* What This Means */}
                            <div className="mb-6">
                                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: coach.color }}>
                                    What this means for your training
                                </p>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                    {coach.whatThisMeans}
                                </p>
                            </div>

                            {/* Source / Link */}
                            <div className="pt-4" style={{ borderTop: '1px solid var(--border-base)' }}>
                                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                                    <BookOpen className="w-4 h-4" />
                                    <span>{coach.book}: {coach.bookSubtitle}</span>
                                </div>
                                {coach.website && (
                                    <a
                                        href={coach.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 mt-2 text-sm hover:underline"
                                        style={{ color: coach.color }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <ExternalLink className="w-4 h-4" />Learn more
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StandardsGrid() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {TWELVE_STANDARDS.map((standard, index) => (
                <motion.div
                    key={standard.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl text-center"
                    style={{
                        background: 'var(--v3-bg-card)',
                        border: '1px solid var(--border-base)',
                    }}
                >
                    <div className="text-2xl mb-2">{standard.icon}</div>
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-base)' }}>
                        {standard.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                        {standard.description}
                    </p>
                </motion.div>
            ))}
        </div>
    );
}

function AssessmentCard({
    type,
    title,
    duration,
    description,
    features,
    isPrimary,
    onStart,
}: {
    type: 'quick' | 'full';
    title: string;
    duration: string;
    description: string;
    features: string[];
    isPrimary: boolean;
    onStart: () => void;
}) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="rounded-2xl overflow-hidden h-full flex flex-col"
            style={{
                background: 'var(--v3-bg-card)',
                border: `1px solid ${isPrimary ? 'var(--color-accent)' : 'var(--border-base)'}`,
            }}
        >
            {isPrimary && (
                <div
                    className="h-1"
                    style={{ background: 'linear-gradient(90deg, var(--color-accent), #10b981)' }}
                />
            )}
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                            background: isPrimary ? 'var(--color-accent)' : 'var(--bg-elevated)',
                            color: isPrimary ? 'white' : 'var(--text-muted)',
                        }}
                    >
                        {type === 'quick' ? <Zap size={24} /> : <ClipboardList size={24} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-light" style={{ color: 'var(--text-base)' }}>
                            {title}
                        </h3>
                        <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                            {duration}
                        </p>
                    </div>
                </div>

                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                    {description}
                </p>

                <ul className="space-y-2 mb-6 flex-1">
                    {features.map((feature, i) => (
                        <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-subtle)' }}>
                            <span style={{ color: 'var(--color-accent)' }}>✓</span>{feature}
                        </li>
                    ))}
                </ul>

                <button
                    onClick={onStart}
                    className={`w-full py-3 rounded-xl font-medium transition-all ${isPrimary
                            ? 'v3-btn v3-btn-primary'
                            : 'v3-btn v3-btn-secondary'
                        }`}
                >
                    Start {title}
                </button>
            </div>
        </motion.div>
    );
}

function PrescriptionExplainer() {
    const steps = [
        { icon: <Target size={24} />, title: 'Assess', description: 'Take the Quick Check or Full Assessment' },
        { icon: <Activity size={24} />, title: 'Identify', description: 'See exactly which movements need work' },
        { icon: <Shield size={24} />, title: 'Fix', description: 'Get research-backed corrective modules' },
        { icon: <Footprints size={24} />, title: 'Retest', description: 'Track progress and level up' },
    ];

    return (
        <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                >
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{
                            background: 'var(--color-accent-subtle)',
                            color: 'var(--color-accent)',
                        }}
                    >
                        {step.icon}
                    </div>
                    <h4 className="text-lg font-medium mb-2" style={{ color: 'var(--text-base)' }}>
                        {step.title}
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {step.description}
                    </p>
                    {index < steps.length - 1 && (
                        <ArrowRight
                            className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2"
                            style={{ color: 'var(--text-subtle)' }}
                        />
                    )}
                </motion.div>
            ))}
        </div>
    );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export function DurabilityLabContent({ onStartAssessment }: {
    onStartAssessment: (mode: 'quick' | 'full') => void
}) {
    const [expandedCoach, setExpandedCoach] = useState<string | null>(null);

    return (
        <div className="v3-root min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}>
            <SiteHeader />

            {/* Hero */}
            <section className="min-h-[70vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(800px circle at 50% 55%, var(--color-accent-glow) 0%, transparent 60%)'
                    }}
                />
                <div className="text-center w-full max-w-3xl relative z-10">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs uppercase tracking-widest mb-4"
                        style={{ color: 'var(--color-accent)' }}
                    >
                        The Durability Lab
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, ease }}
                        className="text-5xl md:text-6xl font-light mb-6 tracking-tight"
                        style={{ color: 'var(--text-base)' }}
                    >
                        Run for life.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, ease }}
                        className="text-lg mb-8"
                        style={{ color: 'var(--text-subtle)' }}
                    >
                        Movement quality is the foundation of injury-free running.
                        <br />
                        Identify limitations before they become injuries.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap justify-center gap-3"
                    >
                        <span className="px-3 py-1 text-xs rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                            2 coaches
                        </span>
                        <span className="px-3 py-1 text-xs rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                            12 standards
                        </span>
                        <span className="px-3 py-1 text-xs rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                            10 assessments
                        </span>
                    </motion.div>
                </div>
            </section>

            {/* The Two Philosophies */}
            <section className="px-6 py-20" style={{ background: 'var(--bg-muted)' }}>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-light mb-3" style={{ color: 'var(--text-base)' }}>
                            Two Philosophies, One Goal
                        </h2>
                        <p className="text-base" style={{ color: 'var(--text-muted)' }}>
                            The world's leading running biomechanist and mobility coach, united in preventing injuries.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {DURABILITY_COACHES.map((coach) => (
                            <CoachCard
                                key={coach.id}
                                coach={coach}
                                isExpanded={expandedCoach === coach.id}
                                onToggle={() => setExpandedCoach(expandedCoach === coach.id ? null : coach.id)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* The 12 Standards */}
            <section className="px-6 py-20">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--color-coach-starrett, #10b981)' }}>
                            KELLY STARRETT'S FRAMEWORK
                        </p>
                        <h2 className="text-3xl font-light mb-3" style={{ color: 'var(--text-base)' }}>
                            The 12 Standards
                        </h2>
                        <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                            These aren't advanced goals—they're the minimum standards for running durability.
                            How many can you pass today?
                        </p>
                    </div>

                    <StandardsGrid />
                </div>
            </section>

            {/* Assessments */}
            <section className="px-6 py-20" style={{ background: 'var(--bg-muted)' }}>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--color-coach-dicharry, #3b82f6)' }}>
                            JAY DICHARRY'S APPROACH
                        </p>
                        <h2 className="text-3xl font-light mb-3" style={{ color: 'var(--text-base)' }}>
                            Test Your Durability
                        </h2>
                        <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                            Movement assessments that reveal your weak links before they become injuries.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <AssessmentCard
                            type="quick"
                            title="Quick Check"
                            duration="~2 minutes · 3 tests"
                            description="Daily readiness scan. Take this before any quality run to confirm you're ready to perform."
                            features={[
                                'Toe Yoga (foot control)',
                                'Single Leg Balance (stability)',
                                'Squat Shape (mobility)',
                            ]}
                            isPrimary={true}
                            onStart={() => onStartAssessment('quick')}
                        />
                        <AssessmentCard
                            type="full"
                            title="Full Assessment"
                            duration="~10 minutes · 12 tests"
                            description="Complete durability screen covering foot to spine. Take weekly or after any injury scare."
                            features={[
                                'All body regions tested',
                                'Strength & mobility gates',
                                'Personalized prescription',
                            ]}
                            isPrimary={false}
                            onStart={() => onStartAssessment('full')}
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="px-6 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-light mb-3" style={{ color: 'var(--text-base)' }}>
                            How the Prescription System Works
                        </h2>
                        <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                            Every failed or partial test generates specific corrective exercises with coaching cues
                            directly from the research.
                        </p>
                    </div>

                    <PrescriptionExplainer />
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-24" style={{ background: 'var(--bg-muted)' }}>
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-light mb-6" style={{ color: 'var(--text-base)' }}>
                        Know your weak links
                    </h2>
                    <p className="text-lg mb-8" style={{ color: 'var(--text-muted)' }}>
                        Two minutes now could save you months of injury later.
                    </p>
                    <button
                        onClick={() => onStartAssessment('quick')}
                        className="v3-btn v3-btn-primary v3-btn-lg"
                    >
                        Start Your Assessment
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    );
}
