"use client";

/**
 * Durability Assessment Page
 *
 * V2 Design System - Based on Jay Dicharry's Running Rewired methodology.
 */

import { useState } from 'react';
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
        <div className="min-h-screen" style={{ background: 'var(--v2-bg-deep)', color: 'var(--v2-text-primary)' }}>
            <AppHeader streak={0} />

            <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-light mb-2" style={{ color: 'var(--v2-text-primary)' }}>Durability Assessment</h1>
                    <p className="text-lg" style={{ color: 'var(--v2-text-muted)' }}>
                        Based on Jay Dicharry's Running Rewired methodology.
                        Identify movement limitations before they become injuries.
                    </p>
                </div>

                {/* Progress */}
                <div className="v2-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="v2-label">Progress</p>
                            <p className="text-2xl font-mono" style={{ color: 'var(--v2-accent)' }}>{completedCount} / {totalCount}</p>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <span style={{ color: '#4ade80' }}>✓ {passCount} pass</span>
                            <span style={{ color: '#f87171' }}>✗ {failCount} fail</span>
                        </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--v2-bg-elevated)' }}>
                        <div
                            className="h-full transition-all duration-300"
                            style={{
                                width: `${(completedCount / totalCount) * 100}%`,
                                background: 'var(--v2-accent)'
                            }}
                        />
                    </div>
                    {completedCount === totalCount && (
                        <button
                            className="v2-btn v2-btn-primary mt-4 w-full"
                            onClick={() => setShowResults(true)}
                        >
                            View Your Prescription
                        </button>
                    )}
                </div>

                {/* Results Modal */}
                {showResults && (
                    <div className="v2-card p-6" style={{ border: '2px solid var(--v2-accent)' }}>
                        <h2 className="text-xl font-light mb-4" style={{ color: 'var(--v2-text-primary)' }}>Your Durability Prescription</h2>
                        {prescribedModules.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-4xl mb-4">🎉</p>
                                <p className="text-lg" style={{ color: 'var(--v2-text-secondary)' }}>All assessments passed!</p>
                                <p className="text-sm" style={{ color: 'var(--v2-text-muted)' }}>
                                    Maintain your durability with general strength work.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm" style={{ color: 'var(--v2-text-muted)' }}>
                                    Based on your failed assessments, prioritize these modules:
                                </p>
                                {prescribedModules.map(mod => (
                                    <div key={mod.id} className="p-4 rounded-lg" style={{ background: 'var(--v2-bg-elevated)' }}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium" style={{ color: 'var(--v2-text-secondary)' }}>{mod.name}</h3>
                                            <span className="v2-badge">{mod.durationMin} min</span>
                                        </div>
                                        <p className="text-sm mb-3" style={{ color: 'var(--v2-text-muted)' }}>
                                            {mod.frequency.replace('_', ' ')} • {mod.source}
                                        </p>
                                        <div className="space-y-1">
                                            {mod.exercises.slice(0, 3).map((ex, i) => (
                                                <p key={i} className="text-[10px]" style={{ color: 'var(--v2-text-subtle)' }}>
                                                    • {ex.name}: {ex.sets}×{ex.reps}
                                                </p>
                                            ))}
                                            {mod.exercises.length > 3 && (
                                                <p className="text-[10px]" style={{ color: 'var(--v2-text-ghost)' }}>
                                                    + {mod.exercises.length - 3} more exercises
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button
                            className="v2-btn v2-btn-secondary mt-6 w-full"
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
                                className="v2-card p-4 transition-all"
                                style={{
                                    borderColor: result?.result === 'pass' ? 'rgba(74, 222, 128, 0.3)' :
                                        result?.result === 'fail' ? 'rgba(248, 113, 113, 0.3)' : undefined
                                }}
                            >
                                <button
                                    className="w-full flex items-center gap-4 text-left"
                                    onClick={() => setExpandedId(isExpanded ? null : assessment.id)}
                                >
                                    <span className="text-2xl">{getCategoryIcon(assessment.category)}</span>
                                    <div className="flex-1">
                                        <h3 className="font-medium" style={{ color: 'var(--v2-text-secondary)' }}>{assessment.name}</h3>
                                        <p className="text-sm" style={{ color: 'var(--v2-text-muted)' }}>
                                            {assessment.description}
                                        </p>
                                    </div>
                                    {result && (
                                        <span
                                            className="v2-badge"
                                            style={{
                                                background: result.result === 'pass' ? 'var(--v2-accent-subtle)' :
                                                    result.result === 'fail' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                                color: result.result === 'pass' ? 'var(--v2-accent)' :
                                                    result.result === 'fail' ? '#ef4444' : '#f59e0b'
                                            }}
                                        >
                                            {result.result}
                                        </span>
                                    )}
                                    <span style={{ color: 'var(--v2-text-subtle)' }}>
                                        {isExpanded ? '▲' : '▼'}
                                    </span>
                                </button>

                                {isExpanded && (
                                    <div className="mt-4 pt-4 space-y-4" style={{ borderTop: '1px solid var(--v2-border)' }}>
                                        <div>
                                            <p className="v2-label mb-1">Test Procedure</p>
                                            <p className="text-sm" style={{ color: 'var(--v2-text-secondary)' }}>{assessment.testProcedure}</p>
                                        </div>
                                        <div>
                                            <p className="v2-label mb-1">Pass Standard</p>
                                            <p className="text-sm" style={{ color: '#4ade80' }}>{assessment.passStandard}</p>
                                        </div>
                                        <div>
                                            <p className="v2-label mb-1">If Failed</p>
                                            <ul className="text-sm list-disc list-inside" style={{ color: 'var(--v2-text-muted)' }}>
                                                {assessment.failImplications.map((imp, i) => (
                                                    <li key={i}>{imp}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                className={`v2-btn flex-1 ${result?.result === 'pass' ? 'v2-btn-primary' : 'v2-btn-secondary'}`}
                                                onClick={() => handleResult(assessment.id, 'pass')}
                                            >
                                                ✓ Pass
                                            </button>
                                            <button
                                                className={`v2-btn flex-1 ${result?.result === 'partial' ? 'v2-btn-primary' : 'v2-btn-secondary'}`}
                                                onClick={() => handleResult(assessment.id, 'partial')}
                                            >
                                                ~ Partial
                                            </button>
                                            <button
                                                className={`v2-btn flex-1 ${result?.result === 'fail' ? 'v2-btn-primary' : 'v2-btn-secondary'}`}
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
