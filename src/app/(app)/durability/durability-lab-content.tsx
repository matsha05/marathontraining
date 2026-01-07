"use client";

/**
 * THE LONG GAME - Durability Lab
 * 
 * Premium durability education and assessment page
 * 
 * ANTI-MARKETING: Every element provides real educational value.
 * Each standard is clickable with how-to-test, why-it-matters, and what-to-fix.
 * 
 * Based on:
 * - Jay Dicharry's "Running Rewired"
 * - Kelly Starrett's "Ready to Run"
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    Zap,
    ClipboardList,
    BookOpen,
    ExternalLink,
    Activity,
    Target,
    Shield,
    Footprints,
    Check,
    RotateCcw,
    Ruler,
    Flame,
    Droplet,
    Rocket,
    Move,
    ArrowUpRight,
    ArrowDown,
    Circle,
    Ban,
    X,
    Play,
    AlertCircle,
    CheckCircle,
    HelpCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/ui/SiteHeader";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

// =============================================================================
// COACH DATA
// =============================================================================

interface DurabilityCoach {
    id: string;
    name: string;
    tagline: string;
    color: string;
    book: string;
    bookSubtitle: string;
    keyConcept: string;
    focusAreas: string[];
    keyInsight: string;
    bio: string;
    whatThisMeans: string;
    website?: string;
}

const DURABILITY_COACHES: DurabilityCoach[] = [
    {
        id: 'dicharry',
        name: 'Jay Dicharry',
        tagline: 'Injuries are a skill problem, not just a mobility problem',
        color: 'var(--color-coach-dicharry, #3b82f6)',
        book: 'Running Rewired',
        bookSubtitle: 'Reinvent Your Run for Stability, Strength & Speed',
        keyConcept: 'Precision movement under single-leg load',
        focusAreas: [
            'Foot tripod and big-toe control',
            'Deep core stabilizers (not six-pack work)',
            'Hip extension without lumbar compensation',
            'Single-leg stability as the foundation',
        ],
        keyInsight: '"If you can\'t hit baseline positions cleanly, your body compensates under load."',
        bio: 'Jay Dicharry is a physical therapist and biomechanist who has worked with elite runners including Olympians and world champions. He directs the REP Biomechanics Lab in Bend, Oregon.',
        whatThisMeans: 'Every assessment tests your ability to control movement under single-leg load—the exact demand of running. When you fail a test, you\'ll get correctives that build precision movement patterns, not just flexibility.',
        website: 'https://www.runningrewired.com/',
    },
    {
        id: 'starrett',
        name: 'Kelly Starrett',
        tagline: '12 standards that gate running durability',
        color: 'var(--color-coach-starrett, #10b981)',
        book: 'Ready to Run',
        bookSubtitle: 'Unlocking Your Potential to Run Naturally',
        keyConcept: 'Movement standards as a readiness checklist',
        focusAreas: [
            'Neutral feet and natural foot position',
            'Ankle range of motion (4+ inches)',
            'Hip flexion and extension range',
            'Thoracic spine mobility for arm swing',
            'Tissue quality and "no hotspots"',
        ],
        keyInsight: '"These aren\'t advanced—they\'re the minimum."',
        bio: 'Kelly Starrett is a Doctor of Physical Therapy, coach, and author who has revolutionized how athletes think about mobility and movement. He co-founded The Ready State (formerly MobilityWOD).',
        whatThisMeans: 'The 12 Standards give you a simple daily checklist. Can you assume the key shapes? Do you have hotspots changing your mechanics? 10-15 minutes of daily maintenance keeps you running for life.',
        website: 'https://thereadystate.com/',
    },
];

// =============================================================================
// STARRETT'S 12 STANDARDS - WITH REAL EDUCATIONAL CONTENT
// =============================================================================

interface Standard {
    id: number;
    name: string;
    shortDescription: string;
    icon: React.ReactNode;
    // Educational content - what makes this useful
    whatItMeans: string;
    howToTest: string;
    passCriteria: string;
    whyItMatters: string;
    ifYouFail: string;
    relatedModule?: string;
}

const TWELVE_STANDARDS: Standard[] = [
    {
        id: 1,
        name: 'Neutral Feet',
        shortDescription: 'Natural foot position without collapse',
        icon: <Footprints size={24} />,
        whatItMeans: 'Your feet should naturally point forward (not duck-footed) when walking and running. The arch should be active and supported, not collapsed.',
        howToTest: 'Stand barefoot, look down at your feet. Are they pointing straight ahead or rotated outward? Walk naturally - do your feet stay parallel?',
        passCriteria: 'Feet point within 5-10° of straight ahead during walking and standing.',
        whyItMatters: 'Outward-rotated feet indicate tight external hip rotators and/or collapsed arches. This changes knee tracking and can lead to IT band, knee, and hip pain.',
        ifYouFail: 'Focus on hip mobility (couch stretch) and foot strengthening (toe yoga). Consciously point feet forward during walks.',
        relatedModule: 'foot_intrinsics',
    },
    {
        id: 2,
        name: 'Flat Shoes',
        shortDescription: 'Zero-drop footwear philosophy',
        icon: <Move size={24} />,
        whatItMeans: 'Spending time in flat (zero-drop) shoes allows your foot muscles to work properly. High heels and elevated running shoes shorten your calf and Achilles.',
        howToTest: 'Can you comfortably stand and walk in flat shoes for 30+ minutes without calf discomfort?',
        passCriteria: 'Comfortable in zero-drop shoes for extended periods without calf strain.',
        whyItMatters: 'Chronically shortened calves limit ankle mobility and increase Achilles strain during running. The foot needs full range to work correctly.',
        ifYouFail: 'Gradually increase flat shoe time. Do calf stretches and eccentric calf raises. Don\'t force it - transition slowly over weeks.',
        relatedModule: 'calf_strength',
    },
    {
        id: 3,
        name: 'Supple T-Spine',
        shortDescription: 'Upper back rotation for arm swing',
        icon: <RotateCcw size={24} />,
        whatItMeans: 'Your thoracic spine (upper back) must rotate freely to allow efficient arm swing. Stiff upper back = compensations in lower back and hips.',
        howToTest: 'Sit upright, cross arms over chest. Rotate torso left and right without moving hips. You should achieve 45-50° rotation each way.',
        passCriteria: '45°+ rotation each direction with no lumbar movement.',
        whyItMatters: 'Running requires counter-rotation between upper and lower body. Stiff thoracic spine forces rotation into the lower back, causing low back pain.',
        ifYouFail: 'Thread-the-needle stretches, foam roller thoracic extensions, cat-cow. Do 2-3 minutes daily.',
        relatedModule: 'thoracic_mobility',
    },
    {
        id: 4,
        name: 'Efficient Squat',
        shortDescription: 'Full-depth squat as mobility gate',
        icon: <ArrowDown size={24} />,
        whatItMeans: 'You should be able to squat to full depth (hips below knees) with heels down, knees tracking over toes, and spine neutral.',
        howToTest: 'Squat as deep as you can go. Heels stay down. Knees push out over 2nd toe. No excessive forward lean or back rounding.',
        passCriteria: 'Full-depth squat, heels down, knees tracking well, balanced weight.',
        whyItMatters: 'The squat tests hip, ankle, and thoracic mobility simultaneously. If you can\'t squat well, those limitations show up in your running gait.',
        ifYouFail: 'Work on ankle dorsiflexion, hip flexor stretching, and squat practice. Goblet squats with a counterweight help.',
        relatedModule: 'hip_stability',
    },
    {
        id: 5,
        name: 'Hip Flexion',
        shortDescription: 'Knee-to-chest range of motion',
        icon: <Activity size={24} />,
        whatItMeans: 'You need adequate hip flexion to lift your knee during running. Limited hip flexion forces compensation through the lower back.',
        howToTest: 'Lie on back, pull one knee to chest while keeping opposite leg flat. Can you get thigh to chest without the other leg lifting?',
        passCriteria: 'Thigh reaches chest with opposite leg staying flat on ground.',
        whyItMatters: 'Running requires ~65° of hip flexion at peak knee lift. Limited range means shorter stride or lower back compensation.',
        ifYouFail: 'Deep squat holds, pigeon pose, 90-90 hip stretches. Often linked to tight hip rotators.',
        relatedModule: 'hip_flexor_mobility',
    },
    {
        id: 6,
        name: 'Hip Extension',
        shortDescription: 'Extend hip without arching back',
        icon: <ArrowUpRight size={24} />,
        whatItMeans: 'You need ~20° hip extension for full push-off. Most people fake this by arching their lower back instead of actually extending the hip.',
        howToTest: 'Dicharry\'s doorway test: Stand in doorframe, tuck pelvis (flatten lower back), step one foot forward. Feel the stretch in front of back thigh.',
        passCriteria: 'Only gentle stretch in hip flexor, no "huge pull" sensation.',
        whyItMatters: 'Limited hip extension = shorter stride + lower back arching + hip flexor strain. This is a top cause of running low back pain.',
        ifYouFail: 'Couch stretch (2 min each side), kneeling hip flexor stretch with posterior pelvic tilt. Daily until test is clean.',
        relatedModule: 'hip_flexor_mobility',
    },
    {
        id: 7,
        name: 'Ankle ROM',
        shortDescription: '4+ inches in knee-to-wall test',
        icon: <Ruler size={24} />,
        whatItMeans: 'Your ankle needs adequate dorsiflexion (knee over toe) for proper running mechanics. This is one of the most commonly limited areas.',
        howToTest: 'Face a wall, foot 4-5 inches away. Touch knee to wall without lifting heel. Knee tracks over 2nd toe.',
        passCriteria: '4+ inches from wall with knee touching, heel down, no knee cave.',
        whyItMatters: 'Limited ankle mobility forces early heel lift, overpronation, or knee cave. This links to shin splints, Achilles issues, and knee pain.',
        ifYouFail: 'Knee-to-wall mobilizations (2-3 sets × 10 slow reps each side), calf stretching, and banded ankle distractions.',
        relatedModule: 'ankle_mobility',
    },
    {
        id: 8,
        name: 'Warm Up',
        shortDescription: '10 minutes before quality sessions',
        icon: <Flame size={24} />,
        whatItMeans: 'Dynamic warm-up before running prepares tissues for load. This isn\'t about stretching - it\'s about activating muscles and increasing tissue temperature.',
        howToTest: 'Do you consistently warm up before runs? Does your warm-up include dynamic movement (leg swings, lunges, skips)?',
        passCriteria: 'Consistent 10-minute dynamic warm-up before quality sessions.',
        whyItMatters: 'Cold tissue is more vulnerable. A proper warm-up reduces injury risk by ~50%. It also improves performance for the session.',
        ifYouFail: 'Build a simple warm-up routine: 5 min easy jog + leg swings + lunges + A-skips. Make it non-negotiable before workouts.',
    },
    {
        id: 9,
        name: 'Compression',
        shortDescription: 'Recovery tool utilization',
        icon: <Circle size={24} />,
        whatItMeans: 'Using compression (socks, sleeves, boots) post-run can accelerate recovery by reducing swelling and improving lymphatic flow.',
        howToTest: 'Do you use any compression tools after hard sessions or long runs?',
        passCriteria: 'Consistent use of compression post-hard sessions.',
        whyItMatters: 'Recovery is when adaptation happens. Compression is a simple tool that speeds up the process with minimal effort.',
        ifYouFail: 'Start with compression socks after long runs. Consider compression boots for high-volume training blocks.',
    },
    {
        id: 10,
        name: 'No Hotspots',
        shortDescription: 'Zero tissue adhesions or trigger points',
        icon: <Ban size={24} />,
        whatItMeans: 'Hotspots are areas of tissue restriction, trigger points, or adhesions that change your movement patterns. They must be addressed regularly.',
        howToTest: 'Use a foam roller or lacrosse ball on calves, quads, glutes, and upper back. Any spots that are significantly more tender than surrounding tissue?',
        passCriteria: 'No significant hotspots that cause guarding or movement changes.',
        whyItMatters: 'Hotspots alter movement. Your body routes around them, creating compensations that lead to injury elsewhere.',
        ifYouFail: '2-3 minutes of pressure work on each hotspot. Technique: pressure + slow movement through range. Daily until resolved.',
    },
    {
        id: 11,
        name: 'Hydration',
        shortDescription: 'Tissue quality through hydration',
        icon: <Droplet size={24} />,
        whatItMeans: 'Connective tissue needs water to maintain elasticity and glide. Chronic dehydration makes tissue stiff and injury-prone.',
        howToTest: 'Is your urine light yellow to clear most of the day? Are you drinking water consistently between coffee/meals?',
        passCriteria: 'Light yellow urine consistently, drinking water throughout day.',
        whyItMatters: 'Dehydrated tissue is stiffer and doesn\'t absorb shock as well. It\'s also slower to heal. This is basic but often ignored.',
        ifYouFail: 'Drink water first thing in morning. Keep a bottle visible. Aim for half your body weight in ounces daily.',
    },
    {
        id: 12,
        name: 'Jump & Land',
        shortDescription: 'Explosive capacity and control',
        icon: <Rocket size={24} />,
        whatItMeans: 'Running is repeated single-leg jumping. You need the capacity to absorb and produce force explosively with good mechanics.',
        howToTest: 'Single-leg hop and stick the landing. Can you land quietly and balanced without knee collapse or excessive wobble?',
        passCriteria: 'Clean single-leg hop and landing on each leg, quiet and controlled.',
        whyItMatters: 'This tests the integration of everything: foot control, hip stability, and coordination. If you can\'t hop cleanly, your running mechanics have issues.',
        ifYouFail: 'Build up: two-leg hops → single-leg hops → depth drops. Focus on quiet, controlled landings before adding height.',
        relatedModule: 'balance_progression',
    },
];

// =============================================================================
// COMPONENTS
// =============================================================================

function CoachCard({ coach, isExpanded, onToggle }: {
    coach: DurabilityCoach;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    return (
        <motion.div
            className="rounded-2xl overflow-hidden"
            style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-base)',
            }}
            whileHover={!isExpanded ? {
                y: -4,
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                transition: { type: "spring", stiffness: 400, damping: 25 }
            } : {}}
        >
            <button
                onClick={onToggle}
                className="w-full text-left p-6"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ background: coach.color }}
                            />
                            <h3 className="text-xl font-light" style={{ color: 'var(--text-base)' }}>
                                {coach.name}
                            </h3>
                        </div>
                        <p
                            className="text-sm italic mb-4"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            "{coach.tagline}"
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>
                            {coach.keyConcept}
                        </p>
                    </div>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{ background: 'var(--bg-muted)' }}
                    >
                        <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    </motion.div>
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div
                            className="px-6 pb-6 pt-4"
                            style={{ borderTop: '1px solid var(--border-base)' }}
                        >
                            <div className="mb-6">
                                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-subtle)' }}>
                                    Focus Areas
                                </p>
                                <ul className="space-y-2">
                                    {coach.focusAreas.map((area, i) => (
                                        <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                                            <span style={{ color: 'var(--text-subtle)' }}>•</span>{area}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div
                                className="p-4 rounded-xl mb-6"
                                style={{
                                    background: 'var(--bg-muted)',
                                }}
                            >
                                <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                                    {coach.keyInsight}
                                </p>
                            </div>

                            <div className="pt-4" style={{ borderTop: '1px solid var(--border-base)' }}>
                                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                                    <BookOpen className="w-4 h-4" />
                                    <span>{coach.book}: {coach.bookSubtitle}</span>
                                </div>
                                {coach.website && (
                                    <a
                                        href={coach.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 mt-2 text-sm hover:underline"
                                        style={{ color: 'var(--color-accent)' }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <ExternalLink className="w-4 h-4" />Learn more
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function StandardModal({ standard, onClose }: { standard: Standard; onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-lg w-full max-h-[85vh] overflow-y-auto rounded-2xl"
                style={{ background: 'var(--bg-base)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 p-4 flex items-center justify-between" style={{
                    background: 'var(--bg-base)',
                    borderBottom: '1px solid var(--border-base)'
                }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>
                            {standard.icon}
                        </div>
                        <div>
                            <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>Standard #{standard.id}</p>
                            <h3 className="text-lg font-medium" style={{ color: 'var(--text-base)' }}>
                                {standard.name}
                            </h3>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[var(--bg-elevated)]"
                    >
                        <X size={20} style={{ color: 'var(--text-muted)' }} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5">
                    {/* What it means */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <HelpCircle size={16} style={{ color: 'var(--color-accent)' }} />
                            <p className="text-sm font-medium" style={{ color: 'var(--text-base)' }}>
                                What this actually means
                            </p>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {standard.whatItMeans}
                        </p>
                    </div>

                    {/* How to test */}
                    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                        <div className="flex items-center gap-2 mb-2">
                            <Play size={16} style={{ color: 'var(--color-accent)' }} />
                            <p className="text-sm font-medium" style={{ color: 'var(--text-base)' }}>
                                How to test yourself
                            </p>
                        </div>
                        <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                            {standard.howToTest}
                        </p>
                        <div className="flex items-start gap-2 pt-3" style={{ borderTop: '1px solid var(--border-base)' }}>
                            <CheckCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#4ade80' }} />
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                <strong style={{ color: '#4ade80' }}>Pass:</strong> {standard.passCriteria}
                            </p>
                        </div>
                    </div>

                    {/* Why it matters */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle size={16} style={{ color: '#fbbf24' }} />
                            <p className="text-sm font-medium" style={{ color: 'var(--text-base)' }}>
                                Why runners care
                            </p>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {standard.whyItMatters}
                        </p>
                    </div>

                    {/* If you fail */}
                    <div className="p-4 rounded-xl" style={{
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.15)'
                    }}>
                        <div className="flex items-center gap-2 mb-2">
                            <Target size={16} style={{ color: '#ef4444' }} />
                            <p className="text-sm font-medium" style={{ color: 'var(--text-base)' }}>
                                If you don't pass
                            </p>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {standard.ifYouFail}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4" style={{ borderTop: '1px solid var(--border-base)' }}>
                    <p className="text-xs text-center" style={{ color: 'var(--text-subtle)' }}>
                        From Kelly Starrett's "Ready to Run"
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}

function StandardsGrid({ onSelectStandard }: { onSelectStandard: (standard: Standard) => void }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {TWELVE_STANDARDS.map((standard, index) => (
                <motion.button
                    key={standard.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -2 }}
                    onClick={() => onSelectStandard(standard)}
                    className="p-4 rounded-xl text-center text-left cursor-pointer transition-all group"
                    style={{
                        background: 'var(--v3-bg-card)',
                        border: '1px solid var(--border-base)',
                    }}
                >
                    <div className="mb-3 group-hover:scale-110 transition-transform" style={{ color: 'var(--color-accent)' }}>
                        {standard.icon}
                    </div>
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-base)' }}>
                        {standard.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                        {standard.shortDescription}
                    </p>
                    <p className="text-xs mt-2 group-hover:text-[var(--color-accent)] transition-colors" style={{ color: 'var(--text-subtle)' }}>
                        Tap to learn how →
                    </p>
                </motion.button>
            ))}
        </div>
    );
}

function AssessmentCard({
    type,
    title,
    duration,
    description,
    features,
    isPrimary,
    onStart,
}: {
    type: 'quick' | 'full';
    title: string;
    duration: string;
    description: string;
    features: string[];
    isPrimary: boolean;
    onStart: () => void;
}) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="rounded-2xl overflow-hidden h-full flex flex-col"
            style={{
                background: 'var(--v3-bg-card)',
                border: `1px solid ${isPrimary ? 'var(--color-accent)' : 'var(--border-base)'}`,
            }}
        >
            {isPrimary && (
                <div
                    className="h-1"
                    style={{ background: 'linear-gradient(90deg, var(--color-accent), #10b981)' }}
                />
            )}
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                            background: isPrimary ? 'var(--color-accent)' : 'var(--bg-elevated)',
                            color: isPrimary ? 'white' : 'var(--text-muted)',
                        }}
                    >
                        {type === 'quick' ? <Zap size={24} /> : <ClipboardList size={24} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-light" style={{ color: 'var(--text-base)' }}>
                            {title}
                        </h3>
                        <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                            {duration}
                        </p>
                    </div>
                </div>

                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                    {description}
                </p>

                <ul className="space-y-2 mb-6 flex-1">
                    {features.map((feature, i) => (
                        <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-subtle)' }}>
                            <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />{feature}
                        </li>
                    ))}
                </ul>

                <button
                    onClick={onStart}
                    className={`w-full py-3 rounded-xl font-medium transition-all ${isPrimary
                        ? 'v3-btn v3-btn-primary'
                        : 'v3-btn v3-btn-secondary'
                        }`}
                >
                    Start {title}
                </button>
            </div>
        </motion.div>
    );
}

function PrescriptionExplainer() {
    const steps = [
        { icon: <Target size={24} />, title: 'Assess', description: 'Take the Quick Check or Full Assessment' },
        { icon: <Activity size={24} />, title: 'Identify', description: 'See exactly which movements need work' },
        { icon: <Shield size={24} />, title: 'Fix', description: 'Get research-backed corrective modules' },
        { icon: <Footprints size={24} />, title: 'Retest', description: 'Track progress and level up' },
    ];

    return (
        <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                >
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{
                            background: 'var(--color-accent-subtle)',
                            color: 'var(--color-accent)',
                        }}
                    >
                        {step.icon}
                    </div>
                    <h4 className="text-lg font-medium mb-2" style={{ color: 'var(--text-base)' }}>
                        {step.title}
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {step.description}
                    </p>
                </motion.div>
            ))}
        </div>
    );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export function DurabilityLabContent({ onStartAssessment }: {
    onStartAssessment: (mode: 'quick' | 'full') => void
}) {
    const [expandedCoach, setExpandedCoach] = useState<string | null>(null);
    const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null);

    return (
        <div className="v3-root min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}>
            <SiteHeader />

            {/* Hero */}
            <section className="min-h-[70vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(800px circle at 50% 55%, var(--color-accent-glow) 0%, transparent 60%)'
                    }}
                />
                <div className="text-center w-full max-w-3xl relative z-10">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs uppercase tracking-widest mb-4"
                        style={{ color: 'var(--color-accent)' }}
                    >
                        Durability
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, ease }}
                        className="text-5xl md:text-6xl font-light mb-6 tracking-tight"
                        style={{ color: 'var(--text-base)' }}
                    >
                        Run for life.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, ease }}
                        className="text-lg mb-8"
                        style={{ color: 'var(--text-subtle)' }}
                    >
                        Movement quality is the foundation of injury-free running.
                        <br />
                        Identify limitations before they become injuries.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap justify-center gap-3"
                    >
                        <span className="px-3 py-1 text-xs rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                            2 coaches
                        </span>
                        <span className="px-3 py-1 text-xs rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                            12 standards
                        </span>
                        <span className="px-3 py-1 text-xs rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                            10 assessments
                        </span>
                    </motion.div>
                </div>
            </section>

            {/* The Two Philosophies */}
            <section className="px-6 py-20" style={{ background: 'var(--bg-muted)' }}>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-light mb-3" style={{ color: 'var(--text-base)' }}>
                            Two Philosophies, One Goal
                        </h2>
                        <p className="text-base" style={{ color: 'var(--text-muted)' }}>
                            The world's leading running biomechanist and mobility coach, united in preventing injuries.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {DURABILITY_COACHES.map((coach) => (
                            <CoachCard
                                key={coach.id}
                                coach={coach}
                                isExpanded={expandedCoach === coach.id}
                                onToggle={() => setExpandedCoach(expandedCoach === coach.id ? null : coach.id)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* The 12 Standards - NOW EDUCATIONAL */}
            <section className="px-6 py-20">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--color-coach-starrett, #10b981)' }}>
                            KELLY STARRETT'S FRAMEWORK
                        </p>
                        <h2 className="text-3xl font-light mb-3" style={{ color: 'var(--text-base)' }}>
                            The 12 Standards
                        </h2>
                        <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                            Tap any standard to learn how to test yourself and what to do if you don't pass.
                        </p>
                    </div>

                    <StandardsGrid onSelectStandard={setSelectedStandard} />
                </div>
            </section>

            {/* Assessments */}
            <section className="px-6 py-20" style={{ background: 'var(--bg-muted)' }}>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--color-coach-dicharry, #3b82f6)' }}>
                            JAY DICHARRY'S APPROACH
                        </p>
                        <h2 className="text-3xl font-light mb-3" style={{ color: 'var(--text-base)' }}>
                            Test Your Durability
                        </h2>
                        <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                            Movement assessments that reveal your weak links before they become injuries.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <AssessmentCard
                            type="quick"
                            title="Quick Check"
                            duration="~2 minutes"
                            description="Three tests that tell you if you're ready to run today. Do this before quality sessions."
                            features={[
                                'Toe Yoga - can you control your foot?',
                                'Single Leg Balance - stable for 45 seconds?',
                                'Squat Shape - heels down, no pain?',
                            ]}
                            isPrimary={true}
                            onStart={() => onStartAssessment('quick')}
                        />
                        <AssessmentCard
                            type="full"
                            title="Full Assessment"
                            duration="~10 minutes"
                            description="Complete screen covering foot to spine. Do weekly or after any injury concern."
                            features={[
                                'All 12 body regions tested',
                                'Specific pass/fail criteria',
                                'Personalized exercise prescription',
                            ]}
                            isPrimary={false}
                            onStart={() => onStartAssessment('full')}
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="px-6 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-light mb-3" style={{ color: 'var(--text-base)' }}>
                            How the Prescription System Works
                        </h2>
                        <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                            Every failed test generates specific corrective exercises with coaching cues
                            directly from the research.
                        </p>
                    </div>

                    <PrescriptionExplainer />
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-24" style={{ background: 'var(--bg-muted)' }}>
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-light mb-6" style={{ color: 'var(--text-base)' }}>
                        Know your weak links
                    </h2>
                    <p className="text-lg mb-8" style={{ color: 'var(--text-muted)' }}>
                        Two minutes now could save you months of injury later.
                    </p>
                    <button
                        onClick={() => onStartAssessment('quick')}
                        className="v3-btn v3-btn-primary v3-btn-lg"
                    >
                        Start Your Assessment
                    </button>
                </div>
            </section>

            {/* Footer is provided by app layout */}

            {/* Standard Detail Modal */}
            <AnimatePresence>
                {selectedStandard && (
                    <StandardModal
                        standard={selectedStandard}
                        onClose={() => setSelectedStandard(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
