"use client";

import { useState } from 'react';
import { AppHeader } from '@/components/ui/AppHeader';

/**
 * Training Plan View
 * 
 * Uses standardized components and design tokens
 */

const MOCK_PHASES = [
    { name: 'Base 1', weeks: '1-3', status: 'completed' },
    { name: 'Base 2', weeks: '4-6', status: 'completed' },
    { name: 'Build', weeks: '7-10', status: 'current' },
    { name: 'Peak', weeks: '11-12', status: 'upcoming' },
    { name: 'Taper', weeks: '13-14', status: 'upcoming' },
];

const MOCK_WEEKS = [
    { number: 7, mileage: 42, quality: 3, phase: 'Build', isCurrent: false },
    { number: 8, mileage: 45, quality: 3, phase: 'Build', isCurrent: true },
    { number: 9, mileage: 40, quality: 2, phase: 'Build', cutback: true },
    { number: 10, mileage: 48, quality: 3, phase: 'Build' },
];

export default function PlanPage() {
    const [selectedWeek, setSelectedWeek] = useState(8);

    return (
        <div className="min-h-screen">
            <AppHeader
                backHref="/dashboard"
                title="Training Plan"
                rightContent={
                    <div className="flex items-center gap-2">
                        <span className="text-label">Chicago Marathon</span>
                        <span className="text-[var(--text-subtle)]">•</span>
                        <span className="text-body-sm text-[var(--color-running)]">8 weeks away</span>
                    </div>
                }
            />

            <main className="container-page py-8">
                {/* Phase Timeline */}
                <section className="mb-10">
                    <h2 className="text-heading-md mb-4">Training Phases</h2>

                    <div className="flex gap-2">
                        {MOCK_PHASES.map((phase) => (
                            <div
                                key={phase.name}
                                className={`flex-1 p-4 rounded-xl border transition-all ${phase.status === 'current'
                                        ? 'bg-[var(--color-running)] text-black border-transparent'
                                        : phase.status === 'completed'
                                            ? 'bg-[var(--bg-muted)] border-transparent opacity-60'
                                            : 'bg-[var(--bg-elevated)] border-[var(--border-base)]'
                                    }`}
                            >
                                <p className="font-semibold">{phase.name}</p>
                                <p className={`text-body-sm ${phase.status === 'current' ? 'text-black/70' : 'text-[var(--text-muted)]'}`}>
                                    Weeks {phase.weeks}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Weekly Overview */}
                <section className="mb-10">
                    <h2 className="text-heading-md mb-4">Weekly Plan</h2>

                    <div className="space-y-3">
                        {MOCK_WEEKS.map((week) => (
                            <div
                                key={week.number}
                                onClick={() => setSelectedWeek(week.number)}
                                className={`card p-5 cursor-pointer transition-all ${selectedWeek === week.number ? 'border-[var(--color-running)]' : ''
                                    } ${week.isCurrent ? 'ring-2 ring-[var(--color-running)] ring-offset-2 ring-offset-[var(--bg-base)]' : ''}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[var(--bg-muted)] flex items-center justify-center font-bold">
                                            W{week.number}
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                Week {week.number}
                                                {week.isCurrent && <span className="ml-2 badge badge-accent">Current</span>}
                                                {week.cutback && <span className="ml-2 badge badge-warning">Cutback</span>}
                                            </p>
                                            <p className="text-body-sm text-[var(--text-muted)]">{week.phase} Phase</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 text-center">
                                        <div>
                                            <p className="text-heading-lg text-data">{week.mileage}</p>
                                            <p className="text-caption text-[var(--text-muted)]">miles</p>
                                        </div>
                                        <div>
                                            <p className="text-heading-lg text-data">{week.quality}</p>
                                            <p className="text-caption text-[var(--text-muted)]">quality</p>
                                        </div>
                                        <svg className="w-5 h-5 text-[var(--text-subtle)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Plan Stats */}
                <section>
                    <h2 className="text-heading-md mb-4">Plan Overview</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { value: '14', label: 'Weeks', sub: 'Total plan length' },
                            { value: '48', label: 'Peak Mi', sub: 'Highest week' },
                            { value: '42', label: 'Quality', sub: 'Total sessions' },
                            { value: '28', label: 'Strength', sub: 'Total sessions' },
                        ].map((stat) => (
                            <div key={stat.label} className="card p-5">
                                <p className="text-display-md text-data mb-1">{stat.value}</p>
                                <p className="text-label mb-1">{stat.label}</p>
                                <p className="text-caption text-[var(--text-muted)]">{stat.sub}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
