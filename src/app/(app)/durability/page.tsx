"use client";

/**
 * Durability Assessment Page
 *
 * V2 Design System - Based on Jay Dicharry's Running Rewired methodology
 * and Kelly Starrett's Ready to Run standards.
 * 
 * Designed to match how the coaches think:
 * - Quick daily readiness scan (2 min)
 * - Full weekly assessment (10-12 min)  
 * - Assessment-driven module prescription
 * - Distal-to-proximal priority (foot → ankle → hip → core)
 * 
 * WHEN TO USE:
 * - Quick Check: Before any run (especially quality sessions)
 * - Full Assessment: Weekly (typically Sunday or Monday)
 * - After injury layoff: Before resuming training
 */

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase';
import {
    Zap,
    ClipboardList,
    Footprints,
    Activity,
    Target,
    Dumbbell,
    Scale,
    Sparkles,
    ArrowLeft,
    Check,
    X,
    Minus,
    Clock,
    RotateCcw,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { AppHeader } from '@/components/ui/AppHeader';
import {
    PrescriptionModuleCard,
    PrescriptionSummaryHeader,
} from '@/components/durability/PrescriptionModuleCard';
import {
    getAllAssessments,
    getModulesForFailedAssessments,
    DurabilityAssessment,
    AssessmentResult,
} from '@/domain/durability';
import { DURABILITY_MODULES, DurabilityModule } from '@/domain/durability/modules';

type AssessmentResultMap = Record<string, { result: AssessmentResult; side?: 'left' | 'right' | 'both' }>;
type AssessmentMode = 'intro' | 'quick' | 'full' | 'results';

// Quick check assessments (daily readiness scan per Dicharry)
const QUICK_CHECK_IDS = ['toe_yoga', 'single_leg_balance', 'squat_shape'];

// Category order follows distal-to-proximal principle (Dicharry/Starrett)
const CATEGORY_ORDER: DurabilityAssessment['category'][] = ['foot', 'ankle', 'balance', 'knee', 'hip', 'spine'];

export default function DurabilityPage() {
    const router = useRouter();
    const [mode, setMode] = useState<AssessmentMode>('intro');
    const [results, setResults] = useState<AssessmentResultMap>({});
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [currentQuickIndex, setCurrentQuickIndex] = useState(0);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const assessments = getAllAssessments();

    // Organize assessments by category for full mode
    const assessmentsByCategory = useMemo(() => {
        const grouped: Record<string, DurabilityAssessment[]> = {};
        for (const cat of CATEGORY_ORDER) {
            grouped[cat] = assessments.filter(a => a.category === cat);
        }
        return grouped;
    }, [assessments]);

    // Quick check assessments
    const quickAssessments = useMemo(() =>
        QUICK_CHECK_IDS.map(id => assessments.find(a => a.id === id)).filter((a): a is DurabilityAssessment => a !== undefined),
        [assessments]
    );

    const failedIds = Object.entries(results)
        .filter(([_, r]) => r.result === 'fail')
        .map(([id]) => id);

    const prescribedModuleIds = getModulesForFailedAssessments(failedIds);
    const prescribedModules = prescribedModuleIds
        .map(id => DURABILITY_MODULES[id])
        .filter((m): m is DurabilityModule => m !== undefined);

    const handleResult = (id: string, result: AssessmentResult) => {
        setResults(prev => ({
            ...prev,
            [id]: { result, side: 'both' }
        }));
    };

    const handleQuickResult = (result: AssessmentResult) => {
        const currentAssessment = quickAssessments[currentQuickIndex];
        if (currentAssessment) {
            handleResult(currentAssessment.id, result);
            if (currentQuickIndex < quickAssessments.length - 1) {
                setCurrentQuickIndex(prev => prev + 1);
            } else {
                setMode('results');
            }
        }
    };

    const completedCount = Object.keys(results).length;
    const totalCount = mode === 'quick' ? quickAssessments.length : assessments.length;
    const passCount = Object.values(results).filter(r => r.result === 'pass').length;
    const failCount = Object.values(results).filter(r => r.result === 'fail').length;

    const getCategoryIcon = (cat: DurabilityAssessment['category'], size = 24) => {
        const iconClass = "text-[var(--color-accent)]";
        switch (cat) {
            case 'foot': return <Footprints size={size} className={iconClass} />;
            case 'ankle': return <Activity size={size} className={iconClass} />;
            case 'knee': return <Target size={size} className={iconClass} />;
            case 'hip': return <Dumbbell size={size} className={iconClass} />;
            case 'spine': return <Activity size={size} className={iconClass} />;
            case 'balance': return <Scale size={size} className={iconClass} />;
            default: return <ClipboardList size={size} className={iconClass} />;
        }
    };

    const getCategoryLabel = (cat: DurabilityAssessment['category']) => {
        switch (cat) {
            case 'foot': return 'Foot Control';
            case 'ankle': return 'Ankle Mobility & Strength';
            case 'knee': return 'Knee Stability';
            case 'hip': return 'Hip Stability & Mobility';
            case 'spine': return 'Spine & Core';
            case 'balance': return 'Balance & Proprioception';
            default: return cat;
        }
    };

    const totalPrescribedTime = prescribedModules.reduce((sum, m) => sum + m.durationMin, 0);

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}>
            <AppHeader streak={0} />

            <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
                <AnimatePresence mode="wait">
                    {/* INTRO MODE */}
                    {mode === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* Hero */}
                            <div className="text-center py-8">
                                <p className="v2-label mb-2" style={{ color: 'var(--color-accent)' }}>
                                    DURABILITY ASSESSMENT
                                </p>
                                <h1 className="text-3xl font-light mb-4" style={{ color: 'var(--text-base)' }}>
                                    Move better, run stronger
                                </h1>
                                <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                                    Based on Jay Dicharry's Running Rewired and Kelly Starrett's Ready to Run.
                                    Identify movement limitations before they become injuries.
                                </p>
                            </div>

                            {/* Mode selection */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <button
                                    onClick={() => setMode('quick')}
                                    className="v2-card p-6 text-left hover:border-[var(--color-accent)] transition-colors"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <Zap size={28} className="text-[var(--color-accent)]" />
                                        <h2 className="text-xl font-light">Quick Check</h2>
                                    </div>
                                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                                        Daily readiness scan. 3 key tests in ~2 minutes.
                                    </p>
                                    <ul className="text-xs space-y-1" style={{ color: 'var(--text-subtle)' }}>
                                        <li>• Toe Yoga (foot control)</li>
                                        <li>• Single Leg Balance</li>
                                        <li>• Squat Shape</li>
                                    </ul>
                                    <div className="mt-4 v2-btn v2-btn-primary w-full">
                                        Start Quick Check
                                    </div>
                                </button>

                                <button
                                    onClick={() => setMode('full')}
                                    className="v2-card p-6 text-left hover:border-[var(--color-accent)] transition-colors"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <ClipboardList size={28} className="text-[var(--color-accent)]" />
                                        <h2 className="text-xl font-light">Full Assessment</h2>
                                    </div>
                                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                                        Complete durability screen. 12 tests in ~10 minutes.
                                    </p>
                                    <ul className="text-xs space-y-1" style={{ color: 'var(--text-subtle)' }}>
                                        <li>• Foot, ankle, hip, spine</li>
                                        <li>• Strength & mobility gates</li>
                                        <li>• Personalized prescription</li>
                                    </ul>
                                    <div className="mt-4 v2-btn v2-btn-secondary w-full">
                                        Start Full Assessment
                                    </div>
                                </button>
                            </div>

                            {/* Philosophy note */}
                            <div className="v2-card p-5" style={{ borderColor: 'var(--color-accent-subtle)' }}>
                                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--color-accent)' }}>
                                    THE DICHARRY PRINCIPLE
                                </p>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                    "Running injuries are often a skill and control problem, not just a mobility problem.
                                    If you can't hit baseline positions cleanly, your body compensates under load."
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* QUICK MODE - Focused flow */}
                    {mode === 'quick' && (
                        <motion.div
                            key="quick"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Progress */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setMode('intro')}
                                    className="text-sm"
                                    style={{ color: 'var(--text-subtle)' }}
                                >
                                    ← Back
                                </button>
                                <p className="v2-mono text-sm" style={{ color: 'var(--color-accent)' }}>
                                    {currentQuickIndex + 1} / {quickAssessments.length}
                                </p>
                            </div>

                            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                                <div
                                    className="h-full transition-all duration-300"
                                    style={{
                                        width: `${((currentQuickIndex + 1) / quickAssessments.length) * 100}%`,
                                        background: 'var(--color-accent)'
                                    }}
                                />
                            </div>

                            {/* Current assessment */}
                            {quickAssessments[currentQuickIndex] && (
                                <motion.div
                                    key={quickAssessments[currentQuickIndex].id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="v2-card p-6 space-y-6"
                                >
                                    <div className="text-center">
                                        <span className="text-4xl mb-4 block">
                                            {getCategoryIcon(quickAssessments[currentQuickIndex].category)}
                                        </span>
                                        <h2 className="text-2xl font-light mb-2">
                                            {quickAssessments[currentQuickIndex].name}
                                        </h2>
                                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                            {quickAssessments[currentQuickIndex].description}
                                        </p>
                                    </div>

                                    <div className="space-y-4 p-4 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                                        <div>
                                            <p className="v2-label mb-1">TEST</p>
                                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                                {quickAssessments[currentQuickIndex].testProcedure}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="v2-label mb-1">PASS STANDARD</p>
                                            <p className="text-sm" style={{ color: '#4ade80' }}>
                                                {quickAssessments[currentQuickIndex].passStandard}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => handleQuickResult('pass')}
                                            className="v2-btn v2-btn-secondary py-4"
                                            style={{ background: 'rgba(74, 222, 128, 0.1)', borderColor: 'rgba(74, 222, 128, 0.3)' }}
                                        >
                                            <span className="block text-lg mb-1">✓</span>
                                            <span className="text-xs">Pass</span>
                                        </button>
                                        <button
                                            onClick={() => handleQuickResult('partial')}
                                            className="v2-btn v2-btn-secondary py-4"
                                            style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                                        >
                                            <span className="block text-lg mb-1">~</span>
                                            <span className="text-xs">Partial</span>
                                        </button>
                                        <button
                                            onClick={() => handleQuickResult('fail')}
                                            className="v2-btn v2-btn-secondary py-4"
                                            style={{ background: 'rgba(248, 113, 113, 0.1)', borderColor: 'rgba(248, 113, 113, 0.3)' }}
                                        >
                                            <span className="block text-lg mb-1">✗</span>
                                            <span className="text-xs">Fail</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* FULL MODE - Category-organized */}
                    {mode === 'full' && (
                        <motion.div
                            key="full"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <button
                                        onClick={() => setMode('intro')}
                                        className="text-sm mb-2 block"
                                        style={{ color: 'var(--text-subtle)' }}
                                    >
                                        ← Back
                                    </button>
                                    <h1 className="text-2xl font-light">Full Durability Assessment</h1>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="v2-card p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="v2-label">Progress</p>
                                        <p className="text-xl font-mono" style={{ color: 'var(--color-accent)' }}>
                                            {completedCount} / {totalCount}
                                        </p>
                                    </div>
                                    <div className="flex gap-4 text-sm">
                                        <span style={{ color: '#4ade80' }}>✓ {passCount}</span>
                                        <span style={{ color: '#f87171' }}>✗ {failCount}</span>
                                    </div>
                                </div>
                                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                                    <div
                                        className="h-full transition-all duration-300"
                                        style={{
                                            width: `${(completedCount / totalCount) * 100}%`,
                                            background: 'var(--color-accent)'
                                        }}
                                    />
                                </div>
                                {completedCount === totalCount && (
                                    <button
                                        className="v2-btn v2-btn-primary mt-4 w-full"
                                        onClick={() => setMode('results')}
                                    >
                                        View Your Prescription
                                    </button>
                                )}
                            </div>

                            {/* Assessments by category */}
                            {CATEGORY_ORDER.map(category => {
                                const categoryAssessments = assessmentsByCategory[category];
                                if (!categoryAssessments?.length) return null;

                                return (
                                    <div key={category} className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{getCategoryIcon(category)}</span>
                                            <h2 className="text-lg font-light">{getCategoryLabel(category)}</h2>
                                        </div>

                                        {categoryAssessments.map(assessment => {
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
                                                        <div className="flex-1">
                                                            <h3 className="font-medium" style={{ color: 'var(--text-muted)' }}>
                                                                {assessment.name}
                                                            </h3>
                                                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                                                {assessment.description}
                                                            </p>
                                                        </div>
                                                        {result && (
                                                            <span
                                                                className="v2-badge"
                                                                style={{
                                                                    background: result.result === 'pass' ? 'var(--color-accent-subtle)' :
                                                                        result.result === 'fail' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                                                    color: result.result === 'pass' ? 'var(--color-accent)' :
                                                                        result.result === 'fail' ? '#ef4444' : '#f59e0b'
                                                                }}
                                                            >
                                                                {result.result}
                                                            </span>
                                                        )}
                                                        <span style={{ color: 'var(--text-subtle)' }}>
                                                            {isExpanded ? '▲' : '▼'}
                                                        </span>
                                                    </button>

                                                    {isExpanded && (
                                                        <div className="mt-4 pt-4 space-y-4" style={{ borderTop: '1px solid var(--border-base)' }}>
                                                            <div>
                                                                <p className="v2-label mb-1">Test Procedure</p>
                                                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                                                    {assessment.testProcedure}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="v2-label mb-1">Pass Standard</p>
                                                                <p className="text-sm" style={{ color: '#4ade80' }}>
                                                                    {assessment.passStandard}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="v2-label mb-1">If Failed</p>
                                                                <ul className="text-sm list-disc list-inside" style={{ color: 'var(--text-muted)' }}>
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
                                );
                            })}
                        </motion.div>
                    )}

                    {/* RESULTS MODE */}
                    {mode === 'results' && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center py-4">
                                <p className="v2-label mb-2" style={{ color: 'var(--color-accent)' }}>
                                    YOUR DURABILITY PRESCRIPTION
                                </p>
                                <h1 className="text-3xl font-light">
                                    {failCount === 0 ? 'All Clear!' : `${failCount} area${failCount > 1 ? 's' : ''} to address`}
                                </h1>
                            </div>

                            {/* Summary stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="v2-card p-4 text-center">
                                    <p className="text-2xl font-mono" style={{ color: '#4ade80' }}>{passCount}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pass</p>
                                </div>
                                <div className="v2-card p-4 text-center">
                                    <p className="text-2xl font-mono" style={{ color: '#f59e0b' }}>
                                        {Object.values(results).filter(r => r.result === 'partial').length}
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Partial</p>
                                </div>
                                <div className="v2-card p-4 text-center">
                                    <p className="text-2xl font-mono" style={{ color: '#f87171' }}>{failCount}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fail</p>
                                </div>
                            </div>

                            {/* Prescription */}
                            {prescribedModules.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="relative overflow-hidden rounded-2xl p-8 text-center"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--v2-bg-card), var(--bg-elevated))',
                                        border: '1px solid var(--color-accent)',
                                    }}
                                >
                                    {/* Glow effect */}
                                    <div
                                        className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl"
                                        style={{ background: 'var(--color-accent)', opacity: 0.15 }}
                                    />
                                    <Sparkles size={48} className="text-[var(--color-accent)] mx-auto mb-4 relative" />
                                    <h2 className="text-2xl font-light mb-2 relative">Outstanding Durability</h2>
                                    <p className="text-sm relative max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                                        All assessments passed. You've earned maintenance mode.
                                        Retest weekly to catch any changes before they become problems.
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Premium header */}
                                    <PrescriptionSummaryHeader
                                        moduleCount={prescribedModules.length}
                                        totalMinutes={totalPrescribedTime}
                                        failCount={failCount}
                                    />

                                    {/* Module cards */}
                                    <div className="space-y-4">
                                        {prescribedModules.map((mod, index) => (
                                            <PrescriptionModuleCard
                                                key={mod.id}
                                                module={mod}
                                                index={index}
                                            />
                                        ))}
                                    </div>

                                    {/* Retest rule callout */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="relative overflow-hidden p-5 rounded-2xl"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.05), rgba(74, 222, 128, 0.02))',
                                            border: '1px solid rgba(74, 222, 128, 0.2)',
                                        }}
                                    >
                                        <div
                                            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                                            style={{ background: 'linear-gradient(to bottom, #4ade80, #22c55e)' }}
                                        />
                                        <p className="text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: '#4ade80' }}>
                                            THE RETEST RULE
                                        </p>
                                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                            Do these modules daily until you pass the related assessment, then retire them.
                                            Small consistent doses beat long sporadic sessions. This is Dicharry's "micro-dose" principle.
                                        </p>
                                    </motion.div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-4">
                                <button
                                    className="v2-btn v2-btn-secondary flex-1"
                                    onClick={() => {
                                        setMode('intro');
                                        setResults({});
                                        setCurrentQuickIndex(0);
                                    }}
                                >
                                    Retake Assessment
                                </button>
                                <button
                                    className="v2-btn v2-btn-primary flex-1"
                                    disabled={saving}
                                    onClick={async () => {
                                        setSaving(true);
                                        setSaveError(null);
                                        try {
                                            const supabase = createSupabaseBrowserClient();
                                            const { data: { user } } = await supabase.auth.getUser();
                                            if (!user) {
                                                setSaveError('Not signed in');
                                                return;
                                            }
                                            const { error } = await supabase
                                                .from('durability_assessments')
                                                .insert({
                                                    athlete_id: user.id,
                                                    assessed_date: new Date().toISOString().split('T')[0],
                                                    results: results,
                                                    assigned_modules: prescribedModuleIds,
                                                });
                                            if (error) {
                                                setSaveError('Failed to save assessment');
                                                console.error('Durability save error:', error);
                                                return;
                                            }
                                            router.push('/dashboard');
                                        } catch (err) {
                                            setSaveError('An error occurred');
                                            console.error(err);
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Save & Continue'}
                                </button>
                                {saveError && (
                                    <p className="text-sm text-center mt-2" style={{ color: 'var(--v2-error)' }}>{saveError}</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
