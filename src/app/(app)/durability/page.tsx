"use client";

/**
 * Durability Assessment Page
 *
 * Based on Jay Dicharry's Running Rewired methodology.
 * Allows athletes to self-assess movement quality and
 * receive prescribed mobility/strength modules.
 */

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/ui/AppHeader';
import {
    getAllAssessments,
    getModulesForFailedAssessments,
    DurabilityAssessment,
    AssessmentResult,
} from '@/domain/durability';
import { DURABILITY_MODULES, DurabilityModule } from '@/domain/durability/modules';

type AssessmentResultMap = Record<string, { result: AssessmentResult; side?: 'left' | 'right' | 'both' }>;

export default function DurabilityPage() {
    const [results, setResults] = useState<AssessmentResultMap>({});
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);

    const assessments = getAllAssessments();

    // Calculate prescribed modules based on failed assessments
    const failedIds = Object.entries(results)
        .filter(([_, r]) => r.result === 'fail')
        .map(([id]) => id);

    const prescribedModuleIds = getModulesForFailedAssessments(failedIds);
    const prescribedModules = prescribedModuleIds
        .map(id => DURABILITY_MODULES[id])
        .filter(Boolean) as DurabilityModule[];

    const handleResult = (id: string, result: AssessmentResult) => {
        setResults(prev => ({
            ...prev,
            [id]: { result, side: 'both' }
        }));
    };

    const completedCount = Object.keys(results).length;
    const totalCount = assessments.length;
    const passCount = Object.values(results).filter(r => r.result === 'pass').length;
    const failCount = Object.values(results).filter(r => r.result === 'fail').length;

    const getCategoryIcon = (cat: DurabilityAssessment['category']) => {
        switch (cat) {
            case 'foot': return '🦶';
            case 'ankle': return '🦵';
            case 'knee': return '🦵';
            case 'hip': return '🏃';
            case 'spine': return '🧘';
            case 'balance': return '⚖️';
            default: return '📋';
        }
    };

    return (
        <div className="min-h-screen landing-shell">
            <AppHeader streak={0} />

            <main className="container-page py-10 space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-display-sm mb-2">Durability Assessment</h1>
                    <p className="text-body-lg text-[var(--text-muted)]">
                        Based on Jay Dicharry's Running Rewired methodology.
                        Identify movement limitations before they become injuries.
                    </p>
                </div>

                {/* Progress */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-label">Progress</p>
                            <p className="text-data text-2xl">{completedCount} / {totalCount}</p>
                        </div>
                        <div className="flex gap-4 text-body-sm">
                            <span className="text-green-400">✓ {passCount} pass</span>
                            <span className="text-red-400">✗ {failCount} fail</span>
                        </div>
                    </div>
                    <div className="h-2 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--color-accent)] transition-all duration-300"
                            style={{ width: `${(completedCount / totalCount) * 100}%` }}
                        />
                    </div>
                    {completedCount === totalCount && (
                        <button
                            className="btn btn-primary mt-4 w-full"
                            onClick={() => setShowResults(true)}
                        >
                            View Your Prescription
                        </button>
                    )}
                </div>

                {/* Results Modal */}
                {showResults && (
                    <div className="card p-6 border-2 border-[var(--color-accent)]">
                        <h2 className="text-heading mb-4">Your Durability Prescription</h2>
                        {prescribedModules.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-4xl mb-4">🎉</p>
                                <p className="text-body-lg">All assessments passed!</p>
                                <p className="text-body-sm text-[var(--text-muted)]">
                                    Maintain your durability with general strength work.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-body-sm text-[var(--text-muted)]">
                                    Based on your failed assessments, prioritize these modules:
                                </p>
                                {prescribedModules.map(mod => (
                                    <div key={mod.id} className="p-4 rounded-lg bg-[var(--bg-muted)]">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold">{mod.name}</h3>
                                            <span className="badge">{mod.durationMin} min</span>
                                        </div>
                                        <p className="text-body-sm text-[var(--text-muted)] mb-3">
                                            {mod.frequency.replace('_', ' ')} • {mod.source}
                                        </p>
                                        <div className="space-y-1">
                                            {mod.exercises.slice(0, 3).map((ex, i) => (
                                                <p key={i} className="text-caption">
                                                    • {ex.name}: {ex.sets}×{ex.reps}
                                                </p>
                                            ))}
                                            {mod.exercises.length > 3 && (
                                                <p className="text-caption text-[var(--text-subtle)]">
                                                    + {mod.exercises.length - 3} more exercises
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button
                            className="btn btn-secondary mt-6 w-full"
                            onClick={() => setShowResults(false)}
                        >
                            Close
                        </button>
                    </div>
                )}

                {/* Assessments */}
                <div className="space-y-4">
                    {assessments.map(assessment => {
                        const result = results[assessment.id];
                        const isExpanded = expandedId === assessment.id;

                        return (
                            <div
                                key={assessment.id}
                                className={`card p-4 transition-all ${result?.result === 'pass' ? 'border-green-500/30' :
                                    result?.result === 'fail' ? 'border-red-500/30' : ''
                                    }`}
                            >
                                <button
                                    className="w-full flex items-center gap-4 text-left"
                                    onClick={() => setExpandedId(isExpanded ? null : assessment.id)}
                                >
                                    <span className="text-2xl">{getCategoryIcon(assessment.category)}</span>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{assessment.name}</h3>
                                        <p className="text-body-sm text-[var(--text-muted)]">
                                            {assessment.description}
                                        </p>
                                    </div>
                                    {result && (
                                        <span className={`badge ${result.result === 'pass' ? 'badge-accent' :
                                            result.result === 'fail' ? 'badge-error' : 'badge-warning'
                                            }`}>
                                            {result.result}
                                        </span>
                                    )}
                                    <span className="text-[var(--text-subtle)]">
                                        {isExpanded ? '▲' : '▼'}
                                    </span>
                                </button>

                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] space-y-4">
                                        <div>
                                            <p className="text-label mb-1">Test Procedure</p>
                                            <p className="text-body-sm">{assessment.testProcedure}</p>
                                        </div>
                                        <div>
                                            <p className="text-label mb-1">Pass Standard</p>
                                            <p className="text-body-sm text-green-400">{assessment.passStandard}</p>
                                        </div>
                                        <div>
                                            <p className="text-label mb-1">If Failed</p>
                                            <ul className="text-body-sm text-[var(--text-muted)] list-disc list-inside">
                                                {assessment.failImplications.map((imp, i) => (
                                                    <li key={i}>{imp}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                className={`btn flex-1 ${result?.result === 'pass' ? 'btn-primary' : 'btn-secondary'}`}
                                                onClick={() => handleResult(assessment.id, 'pass')}
                                            >
                                                ✓ Pass
                                            </button>
                                            <button
                                                className={`btn flex-1 ${result?.result === 'partial' ? 'btn-primary' : 'btn-secondary'}`}
                                                onClick={() => handleResult(assessment.id, 'partial')}
                                            >
                                                ~ Partial
                                            </button>
                                            <button
                                                className={`btn flex-1 ${result?.result === 'fail' ? 'btn-primary' : 'btn-secondary'}`}
                                                onClick={() => handleResult(assessment.id, 'fail')}
                                            >
                                                ✗ Fail
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
