"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { COACHES } from '@/config/coach-spec/methodology';
import { AppHeader } from '@/components/ui/AppHeader';
import { FlameIcon } from '@/components/ui/flame';
import { ActivityIcon } from '@/components/ui/activity';
import { ChartBarIncreasingIcon } from '@/components/ui/chart-bar-increasing';
import { CalendarDaysIcon } from '@/components/ui/calendar-days';
import { CheckIcon } from '@/components/ui/check';
import { PlayIcon } from '@/components/ui/play';

/**
 * THE LONG GAME - Dashboard
 * 
 * "What do I do today?" answered immediately
 */

const MOCK_ATHLETE = {
    name: 'Matt',
    vdot: 48,
};

const MOCK_TODAY = {
    dayOfWeek: 'Tuesday',
    phase: 'BUILD',
    readinessScore: 87,
    workouts: [
        {
            id: '1',
            type: 'run',
            title: 'Tempo Run',
            subtitle: '6 mi @ 7:12/mi',
            domain: 'running',
            duration: 55,
            completed: false,
        },
        {
            id: '2',
            type: 'strength',
            title: 'Template A: Max Strength',
            subtitle: 'Back Squat 4×4 • RDL 3×6',
            domain: 'strength',
            duration: 45,
            completed: false,
        },
        {
            id: '3',
            type: 'durability',
            title: 'Hip Stability Circuit',
            subtitle: 'Dicharry Protocol • 15 min',
            domain: 'durability',
            duration: 15,
            completed: false,
        },
    ],
};

const MOCK_WEEK = [
    { day: 'Mon', type: 'easy', label: 'Easy 5mi', done: true },
    { day: 'Tue', type: 'tempo', label: 'Tempo 6mi', done: false, today: true },
    { day: 'Wed', type: 'easy', label: 'Easy 5mi', done: false },
    { day: 'Thu', type: 'intervals', label: 'Intervals', done: false },
    { day: 'Fri', type: 'easy', label: 'Easy 4mi', done: false },
    { day: 'Sat', type: 'rest', label: 'Rest', done: false },
    { day: 'Sun', type: 'long', label: 'Long 14mi', done: false },
];

const MOCK_INSIGHTS = {
    currentStreak: 12,
    completionRate: 89,
    avgFeel: 3.2,
    missedCount: 2,
};

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const domainColors: Record<string, string> = {
        running: 'var(--color-running)',
        strength: 'var(--color-strength)',
        durability: 'var(--color-durability)',
    };

    const domainTints: Record<string, string> = {
        running: 'var(--domain-running-tint)',
        strength: 'var(--domain-strength-tint)',
        durability: 'var(--domain-durability-tint)',
    };

    return (
        <div className="min-h-screen">
            <AppHeader streak={MOCK_INSIGHTS.currentStreak} />

            <main className="container-page py-8">
                {/* Greeting + Readiness */}
                <div className="flex items-start justify-between mb-10">
                    <div>
                        <p className="text-body-md text-[var(--text-muted)] mb-1">Good morning</p>
                        <h1 className="text-display-md">{MOCK_ATHLETE.name}</h1>
                    </div>

                    {/* Readiness Ring */}
                    <div className="text-center">
                        <div className="relative w-20 h-20">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle className="progress-ring-bg" cx="50" cy="50" r="42" strokeWidth="8" />
                                <circle
                                    className="progress-ring-value"
                                    cx="50" cy="50" r="42"
                                    strokeWidth="8"
                                    strokeDasharray="264"
                                    strokeDashoffset={264 * (1 - MOCK_TODAY.readinessScore / 100)}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-heading-lg text-data">{MOCK_TODAY.readinessScore}</span>
                            </div>
                        </div>
                        <p className="text-label mt-2">Readiness</p>
                    </div>
                </div>

                {/* Today's Workouts */}
                <section className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-heading-md">Today's Plan</h2>
                        <div className="flex items-center gap-2">
                            <CalendarDaysIcon size={16} className="text-[var(--text-subtle)]" />
                            <span className="text-label">{MOCK_TODAY.dayOfWeek} • Week 8</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {MOCK_TODAY.workouts.map((workout, i) => (
                            <Link
                                key={workout.id}
                                href={`/workout/${workout.id}`}
                                className="card card-interactive p-5 flex items-center gap-4 animate-fade-in"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{
                                        backgroundColor: domainTints[workout.domain],
                                        color: domainColors[workout.domain]
                                    }}
                                >
                                    {workout.type === 'run' ? (
                                        <PlayIcon size={20} />
                                    ) : workout.type === 'strength' ? (
                                        <ChartBarIncreasingIcon size={20} />
                                    ) : (
                                        <ActivityIcon size={20} />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <p className="text-heading-sm">{workout.title}</p>
                                    <p className="text-body-sm text-[var(--text-muted)]">{workout.subtitle}</p>
                                </div>

                                <div className="text-right">
                                    <p className="text-body-sm text-[var(--text-subtle)]">{workout.duration} min</p>
                                </div>

                                <svg className="w-5 h-5 text-[var(--text-subtle)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Week Overview */}
                <section className="mb-10">
                    <h2 className="text-heading-md mb-4">This Week</h2>

                    <div className="card p-6">
                        <div className="grid grid-cols-7 gap-2">
                            {MOCK_WEEK.map((day) => (
                                <div
                                    key={day.day}
                                    className={`text-center py-3 rounded-xl transition-all ${day.today
                                        ? 'bg-[var(--color-accent)] text-black'
                                        : day.done
                                            ? 'bg-[var(--bg-muted)]'
                                            : ''
                                        }`}
                                >
                                    <p className="text-label mb-1">{day.day}</p>
                                    <p className={`text-caption ${day.today ? 'text-black/70' : ''}`}>
                                        {day.type === 'rest' ? '—' : day.label.split(' ')[0]}
                                    </p>
                                    {day.done && (
                                        <div className="w-5 h-5 rounded-full bg-[var(--color-accent)] mx-auto mt-2 flex items-center justify-center">
                                            <CheckIcon size={12} className="text-black" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Quick Stats */}
                <section className="mb-10">
                    <h2 className="text-heading-md mb-4">Training Insights</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="card p-5 animate-fade-in">
                            <div className="flex items-center gap-2 mb-2">
                                <FlameIcon size={18} className="text-[var(--color-accent)]" />
                                <span className="text-label">Streak</span>
                            </div>
                            <p className="text-display-md text-data">{MOCK_INSIGHTS.currentStreak}</p>
                            <p className="text-caption">days</p>
                        </div>

                        <div className="card p-5 animate-fade-in" style={{ animationDelay: '50ms' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <ChartBarIncreasingIcon size={18} className="text-[var(--color-accent)]" />
                                <span className="text-label">Completed</span>
                            </div>
                            <p className="text-display-md text-data">{MOCK_INSIGHTS.completionRate}%</p>
                            <p className="text-caption">last 30d</p>
                        </div>

                        <div className="card p-5 animate-fade-in" style={{ animationDelay: '100ms' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <ActivityIcon size={18} className="text-[var(--color-accent)]" />
                                <span className="text-label">Avg Feel</span>
                            </div>
                            <p className="text-display-md text-data">{MOCK_INSIGHTS.avgFeel}</p>
                            <p className="text-caption">/5</p>
                        </div>

                        <div className="card p-5 animate-fade-in" style={{ animationDelay: '150ms' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <CalendarDaysIcon size={18} className="text-[var(--text-subtle)]" />
                                <span className="text-label">Missed</span>
                            </div>
                            <p className="text-display-md text-data">{MOCK_INSIGHTS.missedCount}</p>
                            <p className="text-caption">this month</p>
                        </div>
                    </div>
                </section>

                {/* Methodology Footer */}
                <section className="border-t border-[var(--border-base)] pt-10">
                    <p className="text-label mb-4">Built On</p>
                    <div className="flex flex-wrap gap-6">
                        {['hansons', 'daniels', 'seiler', 'dicharry', 'starrett'].map((id) => {
                            const coach = COACHES[id];
                            return (
                                <div key={id} className="text-body-sm">
                                    <span className="text-[var(--color-accent)] font-semibold">{coach?.name}</span>
                                    <span className="text-[var(--text-subtle)]"> · {coach?.keyConceptShort}</span>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </main>
        </div>
    );
}
