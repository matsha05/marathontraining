'use client';

/**
 * THE LONG GAME - Plan History Page
 * 
 * View archived training plans with drill-down and restore capability.
 * V2 Design System
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, RotateCcw, Calendar, Dumbbell } from 'lucide-react';
import { loadPlanHistory, loadPlanWorkouts, restorePlan } from '@/domain/plan/repository';
import { useAuth } from '@/domain/auth/context';
import { parseDateOnly } from '@/domain/plan/date-utils';
import type { Database } from '@/infrastructure/supabase/types';

type DbTrainingPlan = Database['public']['Tables']['training_plans']['Row'];
type DbPlannedWorkout = Database['public']['Tables']['planned_workouts']['Row'];

function formatPlanType(planType: string): string {
    const types: Record<string, string> = {
        marathon: 'Marathon',
        half_marathon: 'Half Marathon',
        half: 'Half Marathon',
        '10k': '10K',
        '5k': '5K',
        base: 'Base',
        general: 'Base',
        ultra: 'Ultra',
    };
    return types[planType] || planType;
}

function formatDateRange(startDate: string, endDate: string): string {
    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);
    if (!start || !end) return `${startDate} – ${endDate}`;
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' };
    const yearOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' };

    if (start.getFullYear() === end.getFullYear()) {
        return `${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', yearOptions)}`;
    }
    return `${start.toLocaleDateString('en-US', yearOptions)} – ${end.toLocaleDateString('en-US', yearOptions)}`;
}

function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

interface PlanCardProps {
    plan: DbTrainingPlan;
    isActive: boolean;
    onRestore: () => void;
    isRestoring: boolean;
}

function PlanCard({ plan, isActive, onRestore, isRestoring }: PlanCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [workouts, setWorkouts] = useState<DbPlannedWorkout[]>([]);
    const [loadingWorkouts, setLoadingWorkouts] = useState(false);

    const handleExpand = async () => {
        if (!isExpanded && workouts.length === 0) {
            setLoadingWorkouts(true);
            const result = await loadPlanWorkouts(plan.id);
            if (result.success) {
                setWorkouts(result.data);
            }
            setLoadingWorkouts(false);
        }
        setIsExpanded(!isExpanded);
    };

    // Group workouts by week
    const workoutsByWeek = workouts.reduce((acc, workout) => {
        const prescription = workout.prescription as Record<string, unknown>;
        const weekNumber = prescription?.weekNumber as number || 0;
        if (!acc[weekNumber]) acc[weekNumber] = [];
        acc[weekNumber].push(workout);
        return acc;
    }, {} as Record<number, DbPlannedWorkout[]>);

    const weekNumbers = Object.keys(workoutsByWeek).map(Number).sort((a, b) => a - b);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`v3-card overflow-hidden ${isActive ? 'ring-2 ring-[var(--color-accent)]' : ''}`}
        >
            {/* Card Header */}
            <button
                onClick={handleExpand}
                className="w-full p-5 flex items-center justify-between text-left"
            >
                <div className="flex items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: isActive ? 'var(--color-accent-subtle)' : 'var(--bg-muted)' }}
                    >
                        <Calendar size={20} style={{ color: isActive ? 'var(--color-accent)' : 'var(--text-muted)' }} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="v3-heading-sm">{formatPlanType(plan.plan_type)} Plan</h3>
                            {isActive && <span className="v3-badge v3-badge-accent">Active</span>}
                        </div>
                        <p className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>
                            {formatDateRange(plan.start_date, plan.end_date)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="v3-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                            VDOT {plan.vdot_at_creation}
                        </p>
                        <p className="v3-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {timeAgo(plan.created_at)}
                        </p>
                    </div>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown size={20} style={{ color: 'var(--text-muted)' }} />
                    </motion.div>
                </div>
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="px-5 pb-5 border-t" style={{ borderColor: 'var(--border-base)' }}>
                            {/* Actions */}
                            {!isActive && (
                                <div className="py-4">
                                    <button
                                        onClick={onRestore}
                                        disabled={isRestoring}
                                        className="v3-btn v3-btn-secondary flex items-center gap-2"
                                    >
                                        <RotateCcw size={16} className={isRestoring ? 'animate-spin' : ''} />
                                        {isRestoring ? 'Restoring...' : 'Restore This Plan'}
                                    </button>
                                </div>
                            )}

                            {/* Workouts by Week */}
                            {loadingWorkouts ? (
                                <div className="py-4 space-y-2">
                                    <div className="v3-skeleton" style={{ height: '40px', borderRadius: '8px' }} />
                                    <div className="v3-skeleton" style={{ height: '40px', borderRadius: '8px' }} />
                                </div>
                            ) : workouts.length === 0 ? (
                                <p className="v3-body-sm py-4" style={{ color: 'var(--text-muted)' }}>
                                    No workout data available for this plan.
                                </p>
                            ) : (
                                <div className="py-4 space-y-2 max-h-[300px] overflow-y-auto">
                                    <p className="v3-label mb-2">{weekNumbers.length} Weeks • {workouts.length} Workouts</p>
                                    {weekNumbers.slice(0, 5).map(weekNum => (
                                        <div key={weekNum} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-base)' }}>
                                            <span className="v3-mono text-xs">Week {weekNum}</span>
                                            <span className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>
                                                {workoutsByWeek[weekNum].length} workouts
                                            </span>
                                        </div>
                                    ))}
                                    {weekNumbers.length > 5 && (
                                        <p className="v3-mono text-center py-2 text-[11px]" style={{ color: 'var(--text-subtle)' }}>
                                            + {weekNumbers.length - 5} more weeks
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function PlanHistoryPage() {
    const router = useRouter();
    const { athleteId } = useAuth();
    const [plans, setPlans] = useState<DbTrainingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [restoringId, setRestoringId] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            const result = await loadPlanHistory();
            if (result.success) {
                setPlans(result.data);
            } else {
                setError(result.error.message);
            }
            setLoading(false);
        }
        load();
    }, []);

    const handleRestore = async (planId: string) => {
        setRestoringId(planId);
        const result = await restorePlan(planId, athleteId);
        if (result.success) {
            // Refresh the list
            const refreshed = await loadPlanHistory();
            if (refreshed.success) {
                setPlans(refreshed.data);
            }
            // Navigate to plan page
            router.push('/plan');
        } else {
            setError(result.error.message);
        }
        setRestoringId(null);
    };

    const activePlan = plans.find(p => p.is_active);
    const archivedPlans = plans.filter(p => !p.is_active);

    if (loading) {
        return (
            <div className="v3-root min-h-screen">
                <header className="v3-nav sticky top-0 z-50">
                    <div className="v3-container flex items-center justify-between py-4">
                        <Link href="/plan" className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>← Back</Link>
                        <span className="v3-heading-sm">Plan History</span>
                    </div>
                </header>
                <main className="v3-container py-10">
                    <div className="space-y-4">
                        <div className="v3-skeleton" style={{ height: '100px', borderRadius: '12px' }} />
                        <div className="v3-skeleton" style={{ height: '100px', borderRadius: '12px' }} />
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="v3-root min-h-screen">
                <header className="v3-nav sticky top-0 z-50">
                    <div className="v3-container flex items-center justify-between py-4">
                        <Link href="/plan" className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>← Back</Link>
                        <span className="v3-heading-sm">Plan History</span>
                    </div>
                </header>
                <main className="v3-container py-10">
                    <div className="v3-card p-6 text-center">
                        <p className="v3-body" style={{ color: 'var(--v3-error)' }}>{error}</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="v3-root min-h-screen">
            <header className="v3-nav sticky top-0 z-50">
                <div className="v3-container flex items-center justify-between py-4">
                    <Link href="/plan" className="v3-body-sm" style={{ color: 'var(--text-muted)' }}>← Back</Link>
                    <span className="v3-heading-sm">Plan History</span>
                </div>
            </header>

            <main className="v3-container py-10">
                {plans.length === 0 ? (
                    <div className="v3-card p-10 text-center">
                        <div className="v3-empty-icon">📋</div>
                        <h2 className="v3-heading-md mb-2">No Plans Yet</h2>
                        <p className="v3-body-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                            Complete onboarding to create your first training plan.
                        </p>
                        <Link href="/onboarding" className="v3-btn v3-btn-primary">
                            Get Started
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Current Plan */}
                        {activePlan && (
                            <section>
                                <h2 className="v3-label mb-4">Current Plan</h2>
                                <PlanCard
                                    plan={activePlan}
                                    isActive={true}
                                    onRestore={() => { }}
                                    isRestoring={false}
                                />
                            </section>
                        )}

                        {/* Archived Plans */}
                        {archivedPlans.length > 0 && (
                            <section>
                                <h2 className="v3-label mb-4">Past Plans ({archivedPlans.length})</h2>
                                <div className="space-y-3">
                                    {archivedPlans.map(plan => (
                                        <PlanCard
                                            key={plan.id}
                                            plan={plan}
                                            isActive={false}
                                            onRestore={() => handleRestore(plan.id)}
                                            isRestoring={restoringId === plan.id}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
