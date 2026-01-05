'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { COACHES } from '@/config/coach-spec';
import { isPhilosophyAvailableForDistance } from '@/domain/philosophy/recommendation';
import type { TargetDistance, TrainingPhilosophy } from '@/domain/philosophy/types';

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
        { coach: 'hansons', distance: 'marathon', weeks: '18', peakMileage: '57', daysPerWeek: '6', difficulty: 'advanced', description: 'Cumulative fatigue, 16mi long run cap' },
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
        case 'beginner': return 'var(--v2-accent)';
        case 'intermediate': return 'var(--v2-warning)';
        case 'advanced': return 'var(--v2-error)';
    }
}

export default function PlansPage() {
    const [selectedDistance, setSelectedDistance] = useState<TargetDistance | 'all'>('marathon');
    const [expandedCoach, setExpandedCoach] = useState<string | null>(null);

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

    return (
        <div className="v2-root min-h-screen" style={{ background: 'var(--v2-bg-deep)' }}>
            {/* Header */}
            <header className="py-12 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link
                        href="/"
                        className="inline-block mb-6 v2-mono text-sm transition-colors"
                        style={{ color: 'var(--v2-text-subtle)' }}
                    >
                        ← Back to home
                    </Link>
                    <h1
                        className="text-4xl md:text-5xl font-light mb-4"
                        style={{ color: 'var(--v2-text-primary)' }}
                    >
                        Training Plan Library
                    </h1>
                    <p
                        className="text-lg max-w-2xl mx-auto"
                        style={{ color: 'var(--v2-text-muted)' }}
                    >
                        Browse all available programs. Each plan is built from proven methodologies,
                        adapted to your fitness level.
                    </p>
                </motion.div>
            </header>

            {/* Distance Tabs */}
            <nav className="px-6 mb-8">
                <div className="max-w-4xl mx-auto">
                    <div
                        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {DISTANCES.map((distance, i) => (
                            <motion.button
                                key={distance.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                onClick={() => setSelectedDistance(distance.id)}
                                className="px-5 py-3 rounded-xl whitespace-nowrap transition-all"
                                style={{
                                    background: selectedDistance === distance.id
                                        ? 'var(--v2-accent)'
                                        : 'var(--v2-bg-elevated)',
                                    color: selectedDistance === distance.id
                                        ? '#04110b'
                                        : 'var(--v2-text-secondary)',
                                    fontWeight: selectedDistance === distance.id ? 600 : 400,
                                }}
                            >
                                <span className="block text-sm font-medium">{distance.label}</span>
                                <span
                                    className="block text-[10px] mt-0.5"
                                    style={{
                                        color: selectedDistance === distance.id
                                            ? 'rgba(4, 17, 11, 0.7)'
                                            : 'var(--v2-text-muted)'
                                    }}
                                >
                                    {distance.description}
                                </span>
                            </motion.button>
                        ))}
                    </div>
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
                                <div className="v2-card p-8 text-center">
                                    <p className="v2-heading-md mb-2">No plans available</p>
                                    <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>
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
                                            className="v2-card overflow-hidden"
                                        >
                                            {/* Coach Header */}
                                            <button
                                                onClick={() => setExpandedCoach(isExpanded ? null : coachId)}
                                                className="w-full p-6 text-left flex items-start justify-between gap-4 transition-colors hover:bg-[var(--v2-bg-hover)]"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h2 className="v2-heading-md">{coach?.name || coachId}</h2>
                                                        <span
                                                            className="v2-badge"
                                                            style={{
                                                                background: 'var(--v2-bg-inset)',
                                                                color: 'var(--v2-text-muted)',
                                                            }}
                                                        >
                                                            {plans.length} plan{plans.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    <p
                                                        className="v2-body-sm"
                                                        style={{ color: 'var(--v2-text-muted)' }}
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
                                                        style={{ color: 'var(--v2-text-subtle)' }}
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
                                                            style={{ borderTop: '1px solid var(--v2-border)' }}
                                                        >
                                                            {/* Coach Bio */}
                                                            {coach?.bio && (
                                                                <p
                                                                    className="v2-body-sm py-4"
                                                                    style={{ color: 'var(--v2-text-tertiary)' }}
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
                                                                        style={{ background: 'var(--v2-bg-elevated)' }}
                                                                    >
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span
                                                                                    className="v2-mono text-xs px-2 py-0.5 rounded"
                                                                                    style={{
                                                                                        background: getDifficultyColor(plan.difficulty) + '20',
                                                                                        color: getDifficultyColor(plan.difficulty),
                                                                                    }}
                                                                                >
                                                                                    {plan.difficulty}
                                                                                </span>
                                                                                <span
                                                                                    className="v2-mono text-[10px]"
                                                                                    style={{ color: 'var(--v2-text-subtle)' }}
                                                                                >
                                                                                    {plan.weeks} weeks
                                                                                </span>
                                                                            </div>
                                                                            <p className="v2-body-sm" style={{ color: 'var(--v2-text-secondary)' }}>
                                                                                {plan.description}
                                                                            </p>
                                                                            <div className="flex gap-4 mt-2">
                                                                                <span className="v2-mono text-[10px]" style={{ color: 'var(--v2-text-muted)' }}>
                                                                                    Peak: {plan.peakMileage} mi/wk
                                                                                </span>
                                                                                <span className="v2-mono text-[10px]" style={{ color: 'var(--v2-text-muted)' }}>
                                                                                    {plan.daysPerWeek} days/wk
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <Link
                                                                            href={`/onboarding?coach=${plan.coach}&distance=${plan.distance}`}
                                                                            className="v2-btn v2-btn-primary v2-btn-sm whitespace-nowrap"
                                                                        >
                                                                            Start Plan
                                                                        </Link>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Coach Link */}
                                                            <Link
                                                                href="/methodology"
                                                                className="v2-body-sm inline-block mt-4 transition-colors hover:underline"
                                                                style={{ color: 'var(--v2-accent)' }}
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
                            className="v2-body-sm mb-4"
                            style={{ color: 'var(--v2-text-muted)' }}
                        >
                            Not sure which plan fits you?
                        </p>
                        <Link
                            href="/philosophy"
                            className="v2-btn v2-btn-secondary"
                        >
                            Take the Quiz →
                        </Link>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
