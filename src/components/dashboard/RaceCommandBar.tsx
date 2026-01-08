'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrainingPlan, WeekPlan, TrainingPhase } from '@/domain/plan/types';
import { calculateWeeksToRace, formatDateLong } from '@/domain/plan/date-utils';

/**
 * RaceCommandBar - Premium dense hero for the dashboard
 * 
 * Shows at-a-glance: Coach, Race, Weeks to Race, Phase, Weekly Mileage, VDOT
 * Uses coach colors and tabular-nums for metrics
 */

interface RaceCommandBarProps {
    plan: TrainingPlan;
    currentWeek: number | null;
    currentWeekPlan: WeekPlan | null;
    vdot: number;
    athleteName: string;
}

export function RaceCommandBar({
    plan,
    currentWeek,
    currentWeekPlan,
    vdot,
    athleteName,
}: RaceCommandBarProps) {
    // Calculate weeks to race
    const weeksToRace = plan.raceDate
        ? calculateWeeksToRace(plan.raceDate)
        : null;

    // Get coach color
    const coachColor = plan.philosophy
        ? `var(--color-coach-${plan.philosophy})`
        : 'var(--color-accent)';

    // Format plan tier display
    const planTierDisplay = plan.planTier || (plan.philosophy
        ? plan.philosophy.charAt(0).toUpperCase() + plan.philosophy.slice(1)
        : 'Training Plan');

    // Current phase display
    const currentPhase = currentWeekPlan?.phase
        ? currentWeekPlan.phase.charAt(0).toUpperCase() + currentWeekPlan.phase.slice(1)
        : 'Base';

    // Weekly mileage
    const weeklyMileage = currentWeekPlan?.totalMiles
        ? Math.round(currentWeekPlan.totalMiles)
        : plan.peakMileage;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
        >
            {/* Greeting */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-label" style={{ color: 'var(--text-subtle)' }}>
                        {getGreeting()}
                    </p>
                    <h1 className="text-heading-lg" style={{ color: 'var(--text-base)' }}>
                        {athleteName}
                    </h1>
                </div>
                <Link
                    href="/plan"
                    className="text-body-sm font-medium flex items-center gap-1 transition-colors hover:opacity-80"
                    style={{ color: 'var(--color-accent)' }}
                >
                    View Plan
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            {/* Command Bar */}
            <div
                className="rounded-2xl p-5"
                style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-base)',
                    borderBottom: `2px solid ${coachColor}`,
                }}
            >
                {/* Coach + Race Row */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: coachColor }}
                        />
                        <span
                            className="text-label"
                            style={{ color: 'var(--text-subtle)', letterSpacing: '0.1em' }}
                        >
                            {planTierDisplay.toUpperCase()}
                        </span>
                    </div>
                    <span className="text-body-sm font-medium" style={{ color: 'var(--text-base)' }}>
                        {plan.raceName || `${plan.goalDistance.toUpperCase()} Training`}
                    </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Weeks to Race */}
                    <div className="text-center">
                        <p
                            className="text-data text-2xl font-semibold"
                            style={{ color: weeksToRace !== null && weeksToRace <= 4 ? 'var(--color-accent)' : 'var(--text-base)' }}
                        >
                            {weeksToRace !== null ? weeksToRace : currentWeek || 1}
                        </p>
                        <p className="text-caption">
                            {weeksToRace !== null ? 'wks to race' : 'current wk'}
                        </p>
                    </div>

                    {/* Current Phase */}
                    <div className="text-center">
                        <p className="text-data text-2xl font-semibold" style={{ color: 'var(--text-base)' }}>
                            {currentPhase}
                        </p>
                        <p className="text-caption">phase</p>
                    </div>

                    {/* Week Progress */}
                    <div className="text-center">
                        <p className="text-data text-2xl font-semibold" style={{ color: 'var(--text-base)' }}>
                            {currentWeek || 1}<span className="text-caption">/{plan.totalWeeks}</span>
                        </p>
                        <p className="text-caption">week</p>
                    </div>

                    {/* Weekly Mileage */}
                    <div className="text-center">
                        <p className="text-data text-2xl font-semibold" style={{ color: 'var(--text-base)' }}>
                            {weeklyMileage}
                        </p>
                        <p className="text-caption">mi/week</p>
                    </div>

                    {/* VDOT */}
                    <div className="text-center">
                        <p className="text-data text-2xl font-semibold" style={{ color: 'var(--color-accent)' }}>
                            {vdot}
                        </p>
                        <p className="text-caption">VDOT</p>
                    </div>
                </div>

                {/* Race Date Footer */}
                {plan.raceDate && (
                    <div
                        className="mt-5 pt-4 text-center"
                        style={{ borderTop: '1px solid var(--border-muted)' }}
                    >
                        <p className="text-caption">
                            {plan.raceName || 'Race Day'} · {formatDateLong(plan.raceDate)}
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}
