"use client";

/**
 * WOD Library
 * 
 * Browsable library of runner-friendly WODs with:
 * - Equipment tier filtering
 * - Type filtering
 * - Favorites (synced to Supabase for logged-in users, localStorage for guests)
 * - Rx/Scaled/Beginner options visible on each card
 * 
 * V2 Design System - 100% token usage
 */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { SiteHeader as AppHeader } from "@/components/ui/SiteHeader";
import { WOD_LIBRARY, filterByEquipment } from "@/domain/plan/wod-library";
import { WodWorkout, WodType } from "@/domain/plan/types";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

// Schema for favorites validation
const FavoritesSchema = z.array(z.string());

// Helper: Load favorites from localStorage with validation
function loadFavoritesFromStorage(): string[] {
    try {
        const saved = localStorage.getItem(FAVORITES_KEY);
        if (!saved) return [];
        const parsed = FavoritesSchema.safeParse(JSON.parse(saved));
        if (parsed.success) {
            return parsed.data;
        }
        console.warn('[WodLibrary] Invalid favorites format in localStorage, resetting');
        return [];
    } catch (error) {
        console.error('[WodLibrary] Failed to load favorites from localStorage:', error);
        return [];
    }
}

// Equipment tier definitions
const EQUIPMENT_TIERS = {
    all: { label: "All Equipment", equipment: [] },
    full_gym: {
        label: "Full Gym",
        equipment: ["sled", "ski_erg", "rower", "bike_erg", "barbell", "trap_bar", "dumbbells", "kettlebell", "rings", "pull_up_bar"]
    },
    home_gym: {
        label: "Home Gym",
        equipment: ["rower", "bike_erg", "barbell", "dumbbells", "kettlebell", "pull_up_bar"]
    },
    minimal: {
        label: "Minimal (KB + DB)",
        equipment: ["dumbbells", "kettlebell", "pull_up_bar", "jump_rope"]
    },
    bodyweight: {
        label: "Bodyweight Only",
        equipment: []
    },
} as const;

type EquipmentTier = keyof typeof EQUIPMENT_TIERS;

const WOD_TYPE_LABELS: Record<WodType, { label: string; color: string }> = {
    "WOD_AEROBIC_MIXED_MODAL": { label: "Aerobic", color: "var(--v3-green)" },
    "WOD_THRESHOLD_MACHINE": { label: "Threshold", color: "var(--v3-yellow)" },
    "WOD_ALACTIC_POWER": { label: "Power", color: "var(--color-accent)" },
    "WOD_STRENGTH_LOW_VOL": { label: "Strength", color: "var(--color-strength)" },
    "WOD_GLYCOLYTIC_METCON": { label: "MetCon", color: "var(--v3-red)" },
};

const FAVORITES_KEY = "long-game-wod-favorites";

export default function WodLibraryPage() {
    const [equipmentTier, setEquipmentTier] = useState<EquipmentTier>("all");
    const [typeFilter, setTypeFilter] = useState<WodType | "all">("all");
    const [favorites, setFavorites] = useState<string[]>([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [expandedWod, setExpandedWod] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    // Load user and favorites
    useEffect(() => {
        const supabase = createSupabaseBrowserClient();

        // Get user
        supabase.auth.getUser().then(async ({ data }) => {
            setUser(data.user);

            if (data.user) {
                // Logged in: try to load favorites from Supabase
                // Note: wod_favorites column may not exist yet - migration required
                try {
                    const { data: athlete } = await supabase
                        .from('athletes')
                        .select('*')
                        .eq('user_id', data.user.id)
                        .single();

                    // Use type assertion since column may not be in generated types yet
                    const athleteData = athlete as { wod_favorites?: string[] } | null;
                    if (athleteData?.wod_favorites) {
                        const validated = FavoritesSchema.safeParse(athleteData.wod_favorites);
                        if (validated.success) {
                            setFavorites(validated.data);
                        }
                    }
                } catch (error) {
                    // Column doesn't exist yet or other error - use localStorage fallback
                    console.warn('[WodLibrary] Supabase favorites not available, using localStorage:', error);
                    setFavorites(loadFavoritesFromStorage());
                }
            } else {
                // Guest: load from localStorage
                setFavorites(loadFavoritesFromStorage());
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Toggle favorite - saves to Supabase if logged in, otherwise localStorage
    const toggleFavorite = useCallback(async (wodId: string) => {
        const next = favorites.includes(wodId)
            ? favorites.filter(id => id !== wodId)
            : [...favorites, wodId];

        setFavorites(next);

        if (user) {
            // Save to Supabase - use type assertion for new column
            const supabase = createSupabaseBrowserClient();
            try {
                await supabase
                    .from('athletes')
                    .update({ wod_favorites: next } as Record<string, unknown>)
                    .eq('user_id', user.id);
            } catch {
                // Column doesn't exist yet - fallback to localStorage
                localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
            }
        } else {
            // Save to localStorage
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
        }
    }, [favorites, user]);

    // Filter WODs
    let filteredWods = [...WOD_LIBRARY];

    // Equipment filter - with defensive check for valid tier
    const tierConfig = EQUIPMENT_TIERS[equipmentTier];
    if (equipmentTier === "bodyweight") {
        filteredWods = filteredWods.filter(wod =>
            wod.equipmentNeeded && wod.equipmentNeeded.length === 0
        );
    } else if (equipmentTier !== "all" && tierConfig) {
        const availableEquipment = [...tierConfig.equipment];
        filteredWods = filterByEquipment(filteredWods, availableEquipment);
    }

    // Type filter
    if (typeFilter !== "all") {
        filteredWods = filteredWods.filter(wod => wod.type === typeFilter);
    }

    // Favorites filter
    if (showFavoritesOnly) {
        filteredWods = filteredWods.filter(wod => favorites.includes(wod.id));
    }

    return (
        <div className="v3-root min-h-screen flex flex-col" style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}>
            <AppHeader />

            <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease }}
                    className="mb-8"
                >
                    <h1 className="text-2xl font-semibold mb-2">WOD Library</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Runner-friendly conditioning. Each WOD scales to your equipment and experience.
                    </p>
                </motion.div>

                {/* Unified Filter Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5, ease }}
                    className="flex flex-wrap items-center gap-3 p-4 rounded-xl mb-6"
                    style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-base)',
                    }}
                >
                    {/* Equipment Tier */}
                    <select
                        value={equipmentTier}
                        onChange={(e) => setEquipmentTier(e.target.value as EquipmentTier)}
                        className="text-sm py-2 px-3 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: 'var(--bg-muted)',
                            border: 'none',
                            color: 'var(--text-base)',
                            minWidth: '140px',
                        }}
                    >
                        {Object.entries(EQUIPMENT_TIERS).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>

                    {/* Divider */}
                    <div className="w-px h-6" style={{ background: 'var(--border-base)' }} />

                    {/* Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as WodType | "all")}
                        className="text-sm py-2 px-3 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: 'var(--bg-muted)',
                            border: 'none',
                            color: 'var(--text-base)',
                            minWidth: '120px',
                        }}
                    >
                        <option value="all">All Types</option>
                        {Object.entries(WOD_TYPE_LABELS).map(([type, { label }]) => (
                            <option key={type} value={type}>{label}</option>
                        ))}
                    </select>

                    {/* Divider */}
                    <div className="w-px h-6" style={{ background: 'var(--border-base)' }} />

                    {/* Favorites Toggle */}
                    <button
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className="text-sm py-2 px-4 rounded-lg transition-all font-medium"
                        style={{
                            background: showFavoritesOnly ? 'var(--color-accent)' : 'var(--bg-muted)',
                            color: showFavoritesOnly ? '#04110b' : 'var(--text-muted)',
                        }}
                    >
                        ★ Favorites{favorites.length > 0 && ` (${favorites.length})`}
                    </button>

                    {/* Spacer + Results count */}
                    <div className="flex-1" />
                    <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                        {filteredWods.length} WOD{filteredWods.length !== 1 ? 's' : ''}
                    </span>
                </motion.div>

                {/* WOD Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredWods.map((wod, index) => (
                        <WodCard
                            key={wod.id}
                            wod={wod}
                            index={index}
                            isFavorite={favorites.includes(wod.id)}
                            isExpanded={expandedWod === wod.id}
                            onToggleFavorite={() => toggleFavorite(wod.id)}
                            onToggleExpand={() => setExpandedWod(expandedWod === wod.id ? null : wod.id)}
                        />
                    ))}
                </div>

                {filteredWods.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            No WODs match your filters. Try adjusting equipment or type.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}

interface WodCardProps {
    wod: WodWorkout;
    index: number;
    isFavorite: boolean;
    isExpanded: boolean;
    onToggleFavorite: () => void;
    onToggleExpand: () => void;
}

// Fatigue level colors and labels
const FATIGUE_STYLES = {
    green: { bg: 'var(--v3-green)', label: 'Low Impact', emoji: '🟢' },
    yellow: { bg: 'var(--v3-yellow)', label: 'Moderate', emoji: '🟡' },
    red: { bg: 'var(--v3-red)', label: 'High Impact', emoji: '🔴' },
};

// Phase restriction labels
const PHASE_LABELS = {
    base_only: { label: 'BASE Only', color: 'var(--v3-yellow)' },
    taper_safe: { label: 'Taper Safe ✓', color: 'var(--v3-green)' },
    all: { label: '', color: '' }, // No badge needed
};

function WodCard({ wod, index, isFavorite, isExpanded, onToggleFavorite, onToggleExpand }: WodCardProps) {
    const typeInfo = WOD_TYPE_LABELS[wod.type];
    const fatigueInfo = FATIGUE_STYLES[wod.fatigueLevel || 'green'];
    const phaseInfo = PHASE_LABELS[wod.phaseRestriction || 'all'];

    // Equipment list - always show bodyweight as a badge too
    const equipmentList = wod.equipmentNeeded.length === 0
        ? ['bodyweight']
        : wod.equipmentNeeded;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index, duration: 0.4, ease }}
            whileHover={{
                scale: 1.02,
                y: -4,
                boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                transition: { type: 'spring', stiffness: 400, damping: 25 }
            }}
            className="rounded-xl overflow-hidden flex flex-col"
            style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-base)',
                minHeight: '280px',
            }}
        >
            {/* Header */}
            <div className="p-4 flex-1">
                {/* Top row: Name + Favorite */}
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium leading-tight pr-2">{wod.name}</h3>
                    <button
                        onClick={onToggleFavorite}
                        className="text-xl hover:scale-110 transition-transform shrink-0"
                        style={{ color: isFavorite ? 'var(--v3-yellow)' : 'var(--text-muted)' }}
                        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        {isFavorite ? '★' : '☆'}
                    </button>
                </div>

                {/* Badges row: Type, Duration, Fatigue, Phase */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {/* Type badge - now subtle */}
                    <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                            background: 'var(--bg-muted)',
                            color: 'var(--text-muted)'
                        }}
                    >
                        {typeInfo.label}
                    </span>

                    {/* Duration */}
                    <span
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}
                    >
                        {wod.timeDomain} min
                    </span>

                    {/* Fatigue indicator */}
                    <span
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                            background: `${fatigueInfo.bg}15`,
                            color: fatigueInfo.bg
                        }}
                        title={`${fatigueInfo.label} - Run interference level`}
                    >
                        {fatigueInfo.emoji} {fatigueInfo.label}
                    </span>

                    {/* Phase restriction (if applicable) */}
                    {phaseInfo.label && (
                        <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                                background: `${phaseInfo.color}20`,
                                color: phaseInfo.color
                            }}
                        >
                            {phaseInfo.label}
                        </span>
                    )}
                </div>

                {/* Focus - what this workout develops */}
                {wod.focus && (
                    <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                        {wod.focus}
                    </p>
                )}

                {/* Format */}
                <p className="text-xs font-mono mb-3" style={{ color: 'var(--text-muted)' }}>
                    {wod.format}
                </p>

                {/* Movements preview - show up to 4 */}
                <div className="space-y-0.5 mb-3">
                    {wod.movements.slice(0, 4).map((movement, i) => (
                        <p key={i} className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            • {movement.name}: {movement.reps}
                        </p>
                    ))}
                    {wod.movements.length > 4 && (
                        <p className="text-[11px]" style={{ color: 'var(--text-subtle)' }}>
                            +{wod.movements.length - 4} more movements
                        </p>
                    )}
                </div>

                {/* Equipment badges */}
                <div className="flex flex-wrap gap-1 mb-3">
                    {equipmentList.map(eq => (
                        <span
                            key={eq}
                            className="text-[9px] px-1.5 py-0.5 rounded"
                            style={{
                                background: eq === 'bodyweight' ? 'var(--v3-green)20' : 'var(--bg-muted)',
                                color: eq === 'bodyweight' ? 'var(--v3-green)' : 'var(--text-muted)'
                            }}
                        >
                            {eq.replace(/_/g, ' ')}
                        </span>
                    ))}
                </div>

                {/* Run protection info */}
                {wod.runProtectionHours && (
                    <p className="text-[10px] mb-2" style={{ color: 'var(--text-subtle)' }}>
                        ⏱ Safe {wod.runProtectionHours}h+ before quality runs
                    </p>
                )}
            </div>

            {/* Expand button - always at bottom */}
            <button
                onClick={onToggleExpand}
                className="text-xs w-full py-2.5 transition-colors border-t"
                style={{
                    background: 'var(--bg-muted)',
                    color: 'var(--text-muted)',
                    borderColor: 'var(--border-base)'
                }}
                aria-expanded={isExpanded}
                aria-label={`${wod.name} details - ${isExpanded ? 'collapse' : 'expand'}`}
            >
                {isExpanded ? 'Hide Details ▲' : 'Show Details ▼'}
            </button>

            {/* Expanded content */}
            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4"
                    style={{ borderTop: '1px solid var(--border-base)', background: 'var(--bg-base)' }}
                >
                    <div className="pt-4 space-y-4">
                        {/* Full movements list */}
                        <div>
                            <h4 className="text-xs font-medium mb-2" style={{ color: 'var(--text-base)' }}>
                                Complete Workout
                            </h4>
                            <div className="space-y-1">
                                {wod.movements.map((movement, i) => (
                                    <div key={i} className="flex justify-between text-xs">
                                        <span style={{ color: 'var(--text-base)' }}>
                                            {movement.name}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)' }}>
                                            {movement.reps}
                                            {movement.notes && ` (${movement.notes})`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Scaling options */}
                        {wod.scalingOptions && (
                            <div>
                                <h4 className="text-xs font-medium mb-2" style={{ color: 'var(--text-base)' }}>
                                    Scaling Tiers
                                </h4>
                                <div className="space-y-2">
                                    <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--color-accent)30' }}>
                                        <span className="text-[10px] font-semibold" style={{ color: 'var(--color-accent)' }}>Rx</span>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{wod.scalingOptions.rx}</p>
                                    </div>
                                    <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--v3-yellow)30' }}>
                                        <span className="text-[10px] font-semibold" style={{ color: 'var(--v3-yellow)' }}>Scaled</span>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{wod.scalingOptions.scaled}</p>
                                    </div>
                                    <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--v3-green)30' }}>
                                        <span className="text-[10px] font-semibold" style={{ color: 'var(--v3-green)' }}>Beginner</span>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{wod.scalingOptions.beginner}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Coach notes */}
                        {wod.notes && wod.notes.length > 0 && (
                            <div className="rounded-lg p-3" style={{ background: 'var(--bg-elevated)', borderLeft: '3px solid var(--color-accent)' }}>
                                <h4 className="text-[10px] font-medium mb-1" style={{ color: 'var(--color-accent)' }}>
                                    Coach Notes
                                </h4>
                                {wod.notes.map((note, i) => (
                                    <p key={i} className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        {note}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
