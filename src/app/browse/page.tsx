'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { COACHES } from '@/config/coach-spec';
import { isPhilosophyAvailableForDistance } from '@/domain/philosophy/recommendation';
import type { TargetDistance, TrainingPhilosophy } from '@/domain/philosophy/types';
import { SiteHeader } from '@/components/ui/SiteHeader';
import { Footer } from '@/components/ui/Footer';
import { MobileScroller } from '@/components/ui/MobileScroller';

/**
 * Plan Library Page
 * 
 * Browse all training plans by distance and coach.
 * First-principles design: matrix of coaches × distances with premium UX.
 */

const DISTANCES: { id: TargetDistance; label: string; description: string }[] = [
    { id: '5k', label: '5K', description: '3.1 miles' },
    { id: '10k', label: '10K', description: '6.2 miles' },
    { id: 'half', label: 'Half', description: '13.1 miles' },
    { id: 'marathon', label: 'Marathon', description: '26.2 miles' },
    { id: 'base', label: 'Base', description: 'No race target' },
];

const COACH_PHILOSOPHIES: TrainingPhilosophy[] = ['daniels', 'pfitzinger', 'hansons', 'higdon'];

interface PlanInfo {
    coach: TrainingPhilosophy;
    distance: TargetDistance;
    weeks: string;
    peakMileage: string;
    daysPerWeek: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    description: string;
}

// Plan configurations by coach and distance
const PLAN_DETAILS: Record<string, PlanInfo[]> = {
    daniels: [
        { coach: 'daniels', distance: '5k', weeks: '24', peakMileage: '50-70', daysPerWeek: '5-6', difficulty: 'advanced', description: 'Precision pacing with VDOT zones' },
        { coach: 'daniels', distance: '10k', weeks: '24', peakMileage: '50-70', daysPerWeek: '5-6', difficulty: 'advanced', description: 'Scientific interval progression' },
        { coach: 'daniels', distance: 'marathon', weeks: '18-24', peakMileage: '55-85', daysPerWeek: '5-6', difficulty: 'advanced', description: 'Four-phase periodization' },
    ],
    pfitzinger: [
        { coach: 'pfitzinger', distance: '5k', weeks: '8-12', peakMileage: '30-60', daysPerWeek: '5-6', difficulty: 'intermediate', description: 'Faster Road Racing approach' },
        { coach: 'pfitzinger', distance: '10k', weeks: '8-12', peakMileage: '30-60', daysPerWeek: '5-6', difficulty: 'intermediate', description: 'VO2max and lactate focus' },
        { coach: 'pfitzinger', distance: 'half', weeks: '12', peakMileage: '47-63', daysPerWeek: '5-6', difficulty: 'intermediate', description: 'Balanced speed-endurance' },
        { coach: 'pfitzinger', distance: 'marathon', weeks: '12-18', peakMileage: '55-85+', daysPerWeek: '5-6', difficulty: 'advanced', description: 'Advanced Marathoning protocols' },
    ],
    hansons: [
        { coach: 'hansons', distance: 'half', weeks: '18', peakMileage: '42-50', daysPerWeek: '6', difficulty: 'intermediate', description: 'Cumulative fatigue, 12-14mi long run cap' },
        { coach: 'hansons', distance: 'marathon', weeks: '18', peakMileage: '57-62', daysPerWeek: '6', difficulty: 'advanced', description: 'Cumulative fatigue, 16mi long run cap' },
    ],
    higdon: [
        { coach: 'higdon', distance: '5k', weeks: '8', peakMileage: '15-25', daysPerWeek: '3-4', difficulty: 'beginner', description: 'Gentle introduction to racing' },
        { coach: 'higdon', distance: '10k', weeks: '8', peakMileage: '20-30', daysPerWeek: '4', difficulty: 'beginner', description: 'Progressive distance building' },
        { coach: 'higdon', distance: 'half', weeks: '12', peakMileage: '25-40', daysPerWeek: '4-5', difficulty: 'beginner', description: 'First half marathon friendly' },
        { coach: 'higdon', distance: 'marathon', weeks: '18', peakMileage: '40-55', daysPerWeek: '4-5', difficulty: 'intermediate', description: 'Proven finish-line approach' },
        { coach: 'higdon', distance: 'base', weeks: '8-12', peakMileage: '20-30', daysPerWeek: '3-4', difficulty: 'beginner', description: 'Build your aerobic foundation' },
    ],
};

function getDifficultyColor(difficulty: 'beginner' | 'intermediate' | 'advanced') {
    switch (difficulty) {
        case 'beginner': return 'var(--color-accent)';
        case 'intermediate': return 'var(--v3-warning)';
        case 'advanced': return 'var(--v3-error)';
    }
}

export default function PlansPage() {
    const [selectedDistance, setSelectedDistance] = useState<TargetDistance | 'all'>('marathon');
    const [expandedCoach, setExpandedCoach] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const availableCoaches = useMemo(() => {
        if (selectedDistance === 'all') return COACH_PHILOSOPHIES;
        return COACH_PHILOSOPHIES.filter(coach =>
            isPhilosophyAvailableForDistance(coach, selectedDistance)
        );
    }, [selectedDistance]);

    const getPlansForCoach = (coach: TrainingPhilosophy) => {
        const plans = PLAN_DETAILS[coach] || [];
        if (selectedDistance === 'all') return plans;
        return plans.filter(p => p.distance === selectedDistance);
    };

    // Prevent SSG from rendering with useTheme
    if (!mounted) {
        return <div className="v3-root min-h-screen" style={{ background: 'var(--bg-base)' }} />;
    }

    return (
        <div className="v3-root min-h-screen" style={{ background: 'var(--bg-base)' }}>
            <SiteHeader />

            {/* Header */}
            <header className="pt-12 pb-12 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1
                        className="text-4xl md:text-5xl font-light mb-4"
                        style={{ color: 'var(--text-base)' }}
                    >
                        Training Plan Library
                    </h1>
                    <p
                        className="text-lg max-w-2xl mx-auto"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Browse all available programs. Each plan is built from proven methodologies,
                        adapted to your fitness level.
                    </p>
                </motion.div>
            </header>

            {/* Distance Tabs */}
            <nav className="px-6 mb-8">
                <div className="max-w-4xl mx-auto">
                    {/* Padding accommodates hover scale/lift without clipping */}
                    <MobileScroller className="gap-2 pb-2 md:flex md:flex-wrap">
                        {DISTANCES.map((distance, i) => (
                            <motion.button
                                key={distance.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                whileHover={selectedDistance !== distance.id ? {
                                    scale: 1.03,
                                    y: -4,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                    transition: { type: 'spring', stiffness: 400, damping: 25 }
                                } : {}}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedDistance(distance.id)}
                                className="px-5 py-3 rounded-xl whitespace-nowrap snap-center flex-shrink-0"
                                style={{
                                    background: selectedDistance === distance.id
                                        ? 'var(--color-accent)'
                                        : 'var(--bg-elevated)',
                                    color: selectedDistance === distance.id
                                        ? '#04110b'
                                        : 'var(--text-muted)',
                                    fontWeight: selectedDistance === distance.id ? 600 : 400,
                                }}
                            >
                                <span className="block text-sm font-medium">{distance.label}</span>
                                <span
                                    className="block text-[10px] mt-0.5"
                                    style={{
                                        color: selectedDistance === distance.id
                                            ? 'rgba(4, 17, 11, 0.7)'
                                            : 'var(--text-muted)'
                                    }}
                                >
                                    {distance.description}
                                </span>
                            </motion.button>
                        ))}
                    </MobileScroller>
                </div>
            </nav>

            {/* Plan Cards */}
            <main className="px-6 pb-20">
                <div className="max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedDistance}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {availableCoaches.length === 0 ? (
                                <div className="v3-card p-8 text-center">
                                    <p className="v3-heading-md mb-2">No plans available</p>
                                    <p className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>
                                        We don&apos;t have {selectedDistance} plans yet.
                                    </p>
                                </div>
                            ) : (
                                availableCoaches.map((coachId, i) => {
                                    const coach = COACHES[coachId];
                                    const plans = getPlansForCoach(coachId);
                                    const isExpanded = expandedCoach === coachId;

                                    return (
                                        <motion.div
                                            key={coachId}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: i * 0.1 }}
                                            className="v3-card overflow-hidden"
                                            whileHover={!isExpanded ? {
                                                y: -4,
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                transition: { type: 'spring', stiffness: 400, damping: 25 }
                                            } : {}}
                                        >
                                            {/* Coach Header */}
                                            <button
                                                onClick={() => setExpandedCoach(isExpanded ? null : coachId)}
                                                className="w-full p-6 text-left flex items-start justify-between gap-4 transition-colors hover:bg-[var(--bg-muted)]"
                                                aria-expanded={isExpanded}
                                                aria-label={`${coach?.name || coachId} training plans - ${isExpanded ? 'collapse' : 'expand'}`}
                                            >
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h2 className="v3-heading-md">{coach?.name || coachId}</h2>
                                                        <span
                                                            className="v3-badge"
                                                            style={{
                                                                background: 'var(--v3-bg-inset)',
                                                                color: 'var(--text-muted)',
                                                            }}
                                                        >
                                                            {plans.length} plan{plans.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    <p
                                                        className="v3-body-sm"
                                                        style={{ color: 'var(--text-muted)' }}
                                                    >
                                                        {coach?.keyConceptFull || coach?.protocol}
                                                    </p>
                                                </div>
                                                <motion.div
                                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="mt-1"
                                                >
                                                    <svg
                                                        width="20"
                                                        height="20"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        style={{ color: 'var(--text-subtle)' }}
                                                    >
                                                        <path d="M6 9l6 6 6-6" />
                                                    </svg>
                                                </motion.div>
                                            </button>

                                            {/* Expanded Content */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <div
                                                            className="px-6 pb-6"
                                                            style={{ borderTop: '1px solid var(--border-base)' }}
                                                        >
                                                            {/* Coach Bio */}
                                                            {coach?.bio && (
                                                                <p
                                                                    className="v3-body-sm py-4"
                                                                    style={{ color: 'var(--text-muted)' }}
                                                                >
                                                                    {coach.bio}
                                                                </p>
                                                            )}

                                                            {/* Plan Options */}
                                                            <div className="grid gap-3 mt-4">
                                                                {plans.map((plan, j) => (
                                                                    <div
                                                                        key={`${plan.coach}-${plan.distance}-${j}`}
                                                                        className="p-4 rounded-xl flex items-center justify-between gap-4"
                                                                        style={{ background: 'var(--bg-elevated)' }}
                                                                    >
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span
                                                                                    className="v3-mono text-xs px-2 py-0.5 rounded"
                                                                                    style={{
                                                                                        background: getDifficultyColor(plan.difficulty) + '20',
                                                                                        color: getDifficultyColor(plan.difficulty),
                                                                                    }}
                                                                                >
                                                                                    {plan.difficulty}
                                                                                </span>
                                                                                <span
                                                                                    className="v3-mono text-[10px]"
                                                                                    style={{ color: 'var(--text-subtle)' }}
                                                                                >
                                                                                    {plan.weeks} weeks
                                                                                </span>
                                                                            </div>
                                                                            <p className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>
                                                                                {plan.description}
                                                                            </p>
                                                                            <div className="flex gap-4 mt-2">
                                                                                <span className="v3-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                                                                    Peak: {plan.peakMileage} mi/wk
                                                                                </span>
                                                                                <span className="v3-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                                                                    {plan.daysPerWeek} days/wk
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <Link
                                                                            href={`/onboarding?coach=${plan.coach}&distance=${plan.distance}`}
                                                                            className="v3-btn v3-btn-primary v3-btn-sm whitespace-nowrap"
                                                                        >
                                                                            Start Plan
                                                                        </Link>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Coach Link */}
                                                            <Link
                                                                href="/methodology"
                                                                className="v3-body-sm inline-block mt-4 transition-colors hover:underline"
                                                                style={{ color: 'var(--color-accent)' }}
                                                            >
                                                                Learn more about {coach?.name} methodology →
                                                            </Link>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Quiz CTA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 text-center"
                    >
                        <p
                            className="v3-body-sm mb-4"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Not sure which plan fits you?
                        </p>
                        <Link
                            href="/philosophy"
                            className="v3-btn v3-btn-secondary"
                        >
                            Take the Quiz →
                        </Link>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
