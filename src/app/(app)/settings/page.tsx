"use client";

import { useState } from 'react';
import Link from 'next/link';

/**
 * Settings Page
 */

export default function SettingsPage() {
    const [darkMode, setDarkMode] = useState(true);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-[var(--border-default)]">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
                    <Link href="/dashboard" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        ← Back
                    </Link>
                    <h1 className="font-bold ml-4">Settings</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-8">
                {/* Profile */}
                <section className="mb-10">
                    <h2 className="text-lg font-semibold mb-4">Profile</h2>
                    <div className="card p-6 space-y-4">
                        <div>
                            <label className="label block mb-2">Name</label>
                            <input type="text" defaultValue="Matt" className="input" />
                        </div>
                        <div>
                            <label className="label block mb-2">Email</label>
                            <input type="email" defaultValue="matt@example.com" className="input" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label block mb-2">Weight (kg)</label>
                                <input type="number" defaultValue="75" className="input" />
                            </div>
                            <div>
                                <label className="label block mb-2">Age</label>
                                <input type="number" defaultValue="35" className="input" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Fitness */}
                <section className="mb-10">
                    <h2 className="text-lg font-semibold mb-4">Fitness</h2>
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="font-semibold">Current VDOT</p>
                                <p className="text-sm text-[var(--text-secondary)]">Based on your 10K time trial</p>
                            </div>
                            <p className="text-3xl font-bold data-display text-[var(--color-running)]">48</p>
                        </div>

                        <button className="btn btn-secondary w-full">
                            Update VDOT from Race
                        </button>
                    </div>
                </section>

                {/* Appearance */}
                <section className="mb-10">
                    <h2 className="text-lg font-semibold mb-4">Appearance</h2>
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Dark Mode</p>
                                <p className="text-sm text-[var(--text-secondary)]">Use dark theme</p>
                            </div>
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`w-14 h-8 rounded-full transition-colors ${darkMode ? 'bg-[var(--color-running)]' : 'bg-[var(--bg-tertiary)]'
                                    }`}
                            >
                                <div
                                    className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Equipment */}
                <section className="mb-10">
                    <h2 className="text-lg font-semibold mb-4">Equipment</h2>
                    <div className="card p-6">
                        <p className="text-sm text-[var(--text-secondary)] mb-4">
                            We'll customize strength workouts based on your equipment.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['Barbell', 'Dumbbells', 'Kettlebells', 'Pull-up Bar'].map((eq) => (
                                <span
                                    key={eq}
                                    className="px-3 py-1.5 rounded-lg bg-[var(--color-strength)] text-white text-sm font-medium"
                                >
                                    {eq}
                                </span>
                            ))}
                            <button className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-sm">
                                + Add
                            </button>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section>
                    <h2 className="text-lg font-semibold mb-4 text-[var(--color-error)]">Danger Zone</h2>
                    <div className="card p-6 border-[var(--color-error)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Delete Account</p>
                                <p className="text-sm text-[var(--text-secondary)]">Permanently delete your account and data</p>
                            </div>
                            <button className="btn btn-sm bg-[var(--color-error)] text-white">
                                Delete
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
