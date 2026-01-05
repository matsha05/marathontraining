'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { COACHES } from '@/config/coach-spec/methodology';
import { PHILOSOPHIES, FOUNDATION_LAYERS, TrainingPhilosophy } from '@/domain/philosophy/types';

/**
 * Coaches Directory
 * V2 Design System - 100% token usage
 * 
 * Browse all training philosophies without going through the quiz.
 * Focuses on PLAN STRUCTURE coaches (Hansons, Higdon, Pfitzinger, Daniels).
 * 
 * Complementary to /methodology which shows ALL coaches and research.
 */

// Plan structure coaches only (these determine your plan structure)
const PLAN_COACH_IDS: TrainingPhilosophy[] = ['hansons', 'higdon', 'pfitzinger', 'daniels'];

export default function CoachesPage() {
    const [expandedId, setExpandedId] = useState<TrainingPhilosophy | null>(null);

    return (
        <div className="v2-root min-h-screen" style={{ background: 'var(--v2-bg-deep)', color: 'var(--v2-text-primary)' }}>
            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-5 backdrop-blur-xl" style={{ background: 'rgba(8, 8, 10, 0.8)' }}>
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/icon-192.png"
                            alt="The Long Game"
                            width={28}
                            height={28}
                            className="rounded opacity-70"
                        />
                        <span className="text-sm font-medium" style={{ color: 'var(--v2-text-primary)' }}>
                            The Long Game
                        </span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link
                            href="/methodology"
                            className="text-xs transition-colors"
                            style={{ color: 'var(--v2-text-muted)' }}
                        >
                            Methodology
                        </Link>
                        <Link
                            href="/philosophy"
                            className="text-xs transition-colors"
                            style={{ color: 'var(--v2-text-muted)' }}
                        >
                            Find Your Coach
                        </Link>
                        <Link
                            href="/auth"
                            className="text-xs transition-colors"
                            style={{ color: 'var(--v2-text-primary)' }}
                        >
                            Get Started →
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-32 pb-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs uppercase tracking-widest mb-4"
                        style={{ color: 'var(--v2-text-muted)' }}
                    >
                        Plan Structure Coaches
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-light mb-6"
                        style={{ color: 'var(--v2-text-primary)' }}
                    >
                        Choose your approach
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg max-w-2xl mx-auto mb-6"
                        style={{ color: 'var(--v2-text-muted)' }}
                    >
                        These four coaches determine how your training plan is structured.
                        Each has a distinct philosophy on volume, frequency, and long runs.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-center gap-6"
                    >
                        <Link
                            href="/philosophy"
                            className="v2-btn v2-btn-primary"
                        >
                            Take the quiz →
                        </Link>
                        <Link
                            href="/methodology"
                            className="flex items-center gap-2 text-sm transition-colors"
                            style={{ color: 'var(--v2-text-muted)' }}
                        >
                            <BookOpen className="w-4 h-4" />
                            View all research
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Coaches Grid */}
            <section className="px-6 pb-16">
                <div className="max-w-4xl mx-auto space-y-6">
                    {PLAN_COACH_IDS.map((coachId, index) => {
                        const philosophy = PHILOSOPHIES[coachId];
                        const coachData = COACHES[coachId];
                        const isExpanded = expandedId === coachId;

                        if (!philosophy || !coachData) return null;

                        return (
                            <motion.div
                                key={coachId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                            >
                                <div
                                    className="rounded-2xl border transition-all cursor-pointer"
                                    style={{
                                        background: 'var(--v2-bg-elevated)',
                                        borderColor: isExpanded ? 'var(--v2-border-active)' : 'var(--v2-border)',
                                    }}
                                    onClick={() => setExpandedId(isExpanded ? null : coachId)}
                                >
                                    {/* Header - Always visible */}
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-light"
                                                    style={{ background: philosophy.color, color: 'white' }}
                                                >
                                                    {philosophy.name[0]}
                                                </div>
                                                <div>
                                                    <h2
                                                        className="text-2xl font-light"
                                                        style={{ color: 'var(--v2-text-primary)' }}
                                                    >
                                                        {philosophy.name}
                                                    </h2>
                                                    <p
                                                        className="text-sm"
                                                        style={{ color: 'var(--v2-text-muted)' }}
                                                    >
                                                        {philosophy.tagline}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden md:block">
                                                    <p className="text-sm" style={{ color: 'var(--v2-text-secondary)' }}>
                                                        {philosophy.runDays}
                                                    </p>
                                                    <p className="text-xs" style={{ color: 'var(--v2-text-subtle)' }}>
                                                        Long run: {philosophy.longRunCap}
                                                    </p>
                                                </div>
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200"
                                                    style={{
                                                        background: 'var(--v2-bg-hover)',
                                                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                                                    }}
                                                >
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        style={{ color: 'var(--v2-text-muted)' }}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Core beliefs preview */}
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {philosophy.coreBeliefs.slice(0, 2).map((belief, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 text-xs rounded-full"
                                                    style={{
                                                        background: 'var(--v2-bg-hover)',
                                                        color: 'var(--v2-text-tertiary)'
                                                    }}
                                                >
                                                    {belief}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Expanded content */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                {/* Bio from methodology config */}
                                                <div
                                                    className="px-6 py-6"
                                                    style={{ borderTop: '1px solid var(--v2-border)' }}
                                                >
                                                    <p
                                                        className="text-sm leading-relaxed mb-4"
                                                        style={{ color: 'var(--v2-text-tertiary)' }}
                                                    >
                                                        {coachData.bio}
                                                    </p>
                                                    {coachData.achievements && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {coachData.achievements.slice(0, 3).map((achievement, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="px-2 py-1 text-[10px] uppercase tracking-wider rounded"
                                                                    style={{
                                                                        background: 'var(--v2-bg-active)',
                                                                        color: 'var(--v2-text-muted)'
                                                                    }}
                                                                >
                                                                    {achievement.length > 40 ? achievement.slice(0, 40) + '...' : achievement}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* What this means for YOUR training */}
                                                <div
                                                    className="px-6 py-6"
                                                    style={{ borderTop: '1px solid var(--v2-border)' }}
                                                >
                                                    <p
                                                        className="text-xs uppercase tracking-widest mb-3"
                                                        style={{ color: 'var(--v2-accent)' }}
                                                    >
                                                        What this means for your training
                                                    </p>
                                                    <p
                                                        className="text-sm leading-relaxed"
                                                        style={{ color: 'var(--v2-text-tertiary)' }}
                                                    >
                                                        {coachData.whatThisMeans}
                                                    </p>
                                                </div>

                                                {/* Typical Week */}
                                                <div
                                                    className="px-6 py-6"
                                                    style={{ borderTop: '1px solid var(--v2-border)' }}
                                                >
                                                    <p
                                                        className="text-xs uppercase tracking-widest mb-3"
                                                        style={{ color: 'var(--v2-text-muted)' }}
                                                    >
                                                        Typical Week
                                                    </p>
                                                    <div className="grid grid-cols-7 gap-1">
                                                        {philosophy.methodology.typicalWeek.map((day, i) => {
                                                            const [, ...rest] = day.split(': ');
                                                            const activity = rest.join(': ');
                                                            const dayLetter = ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i];
                                                            const isRest = activity.toLowerCase().includes('rest');

                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className="p-2 rounded-lg text-center"
                                                                    style={{
                                                                        background: isRest ? 'var(--v2-bg-elevated)' : 'var(--v2-bg-hover)',
                                                                    }}
                                                                >
                                                                    <p
                                                                        className="text-[10px] mb-1"
                                                                        style={{ color: 'var(--v2-text-subtle)' }}
                                                                    >
                                                                        {dayLetter}
                                                                    </p>
                                                                    <p
                                                                        className="text-[10px]"
                                                                        style={{ color: isRest ? 'var(--v2-text-subtle)' : 'var(--v2-text-tertiary)' }}
                                                                    >
                                                                        {activity.split(' ').slice(0, 2).join(' ')}
                                                                    </p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Best For & Challenges */}
                                                <div
                                                    className="px-6 py-6 grid md:grid-cols-2 gap-6"
                                                    style={{ borderTop: '1px solid var(--v2-border)' }}
                                                >
                                                    <div>
                                                        <p
                                                            className="text-xs uppercase tracking-widest mb-3"
                                                            style={{ color: 'var(--v2-text-muted)' }}
                                                        >
                                                            Best For
                                                        </p>
                                                        <ul className="space-y-2">
                                                            {philosophy.methodology.bestFor.map((item, i) => (
                                                                <li
                                                                    key={i}
                                                                    className="text-sm flex items-start gap-2"
                                                                    style={{ color: 'var(--v2-text-tertiary)' }}
                                                                >
                                                                    <span style={{ color: 'var(--v2-accent)' }}>✓</span>
                                                                    {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <p
                                                            className="text-xs uppercase tracking-widest mb-3"
                                                            style={{ color: 'var(--v2-text-muted)' }}
                                                        >
                                                            Challenges
                                                        </p>
                                                        <ul className="space-y-2">
                                                            {philosophy.methodology.challenges.map((item, i) => (
                                                                <li
                                                                    key={i}
                                                                    className="text-sm flex items-start gap-2"
                                                                    style={{ color: 'var(--v2-text-tertiary)' }}
                                                                >
                                                                    <span style={{ color: 'var(--v2-warning)' }}>⚠</span>
                                                                    {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>

                                                {/* CTA */}
                                                <div
                                                    className="px-6 py-6"
                                                    style={{ borderTop: '1px solid var(--v2-border)', background: 'var(--v2-bg-section)' }}
                                                >
                                                    <Link
                                                        href={`/auth?philosophy=${coachId}`}
                                                        className="v2-btn v2-btn-primary w-full text-center block"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Start with {philosophy.name}
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Foundation Section - Links to Methodology */}
            <section className="px-6 py-16" style={{ background: 'var(--v2-bg-section)' }}>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <p
                            className="text-xs uppercase tracking-widest mb-4"
                            style={{ color: 'var(--v2-text-muted)' }}
                        >
                            The Foundation
                        </p>
                        <h2
                            className="text-3xl font-light mb-4"
                            style={{ color: 'var(--v2-text-primary)' }}
                        >
                            Applied to every plan
                        </h2>
                        <p
                            className="text-lg mb-6"
                            style={{ color: 'var(--v2-text-muted)' }}
                        >
                            Regardless of which coach you choose, these layers are always included.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-5 gap-4 mb-8">
                        {FOUNDATION_LAYERS.map((layer) => (
                            <div
                                key={layer.coach}
                                className="p-4 rounded-xl text-center"
                                style={{ background: 'var(--v2-bg-elevated)', border: '1px solid var(--v2-border)' }}
                            >
                                <p
                                    className="text-sm font-medium mb-1"
                                    style={{ color: 'var(--v2-text-secondary)' }}
                                >
                                    {layer.focus}
                                </p>
                                <p
                                    className="text-[10px]"
                                    style={{ color: 'var(--v2-text-subtle)' }}
                                >
                                    {layer.coach}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <Link
                            href="/methodology"
                            className="inline-flex items-center gap-2 text-sm transition-colors"
                            style={{ color: 'var(--v2-accent)' }}
                        >
                            <BookOpen className="w-4 h-4" />
                            Learn more about our research →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-6" style={{ borderTop: '1px solid var(--v2-border)' }}>
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <p className="text-[10px]" style={{ color: 'var(--v2-text-muted)' }}>© 2026 The Long Game</p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="text-[10px] transition-colors" style={{ color: 'var(--v2-text-muted)' }}>Privacy</Link>
                        <Link href="/terms" className="text-[10px] transition-colors" style={{ color: 'var(--v2-text-muted)' }}>Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
