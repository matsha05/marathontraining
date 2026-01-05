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
import { AppHeader } from "@/components/ui/AppHeader";
import { Footer } from "@/components/ui/Footer";
import { WOD_LIBRARY, filterByEquipment } from "@/domain/plan/wod-library";
import { WodWorkout, WodType } from "@/domain/plan/types";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase";
import type { User } from "@supabase/supabase-js";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

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
    "WOD_AEROBIC_MIXED_MODAL": { label: "Aerobic", color: "var(--v2-green)" },
    "WOD_THRESHOLD_MACHINE": { label: "Threshold", color: "var(--v2-yellow)" },
    "WOD_ALACTIC_POWER": { label: "Power", color: "var(--v2-accent)" },
    "WOD_STRENGTH_LOW_VOL": { label: "Strength", color: "var(--v2-secondary)" },
    "WOD_GLYCOLYTIC_METCON": { label: "MetCon", color: "var(--v2-red)" },
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
                        setFavorites(athleteData.wod_favorites);
                    }
                } catch {
                    // Column doesn't exist yet or other error - use localStorage fallback
                    const saved = localStorage.getItem(FAVORITES_KEY);
                    if (saved) {
                        try {
                            setFavorites(JSON.parse(saved));
                        } catch {
                            // ignore parse errors
                        }
                    }
                }
            } else {
                // Guest: load from localStorage
                const saved = localStorage.getItem(FAVORITES_KEY);
                if (saved) {
                    try {
                        setFavorites(JSON.parse(saved));
                    } catch {
                        // ignore parse errors
                    }
                }
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

    // Equipment filter
    if (equipmentTier === "bodyweight") {
        filteredWods = filteredWods.filter(wod => wod.equipmentNeeded.length === 0);
    } else if (equipmentTier !== "all") {
        const availableEquipment = [...EQUIPMENT_TIERS[equipmentTier].equipment];
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
        <div className="v2-root min-h-screen flex flex-col" style={{ background: 'var(--v2-bg-deep)', color: 'var(--v2-text-primary)' }}>
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
                    <p className="text-sm" style={{ color: 'var(--v2-text-secondary)' }}>
                        Runner-friendly conditioning. Each WOD scales to your equipment and experience.
                    </p>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5, ease }}
                    className="flex flex-wrap gap-4 mb-8"
                >
                    {/* Equipment Tier */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium" style={{ color: 'var(--v2-text-muted)' }}>Equipment</label>
                        <select
                            value={equipmentTier}
                            onChange={(e) => setEquipmentTier(e.target.value as EquipmentTier)}
                            className="v2-input text-sm py-2 px-3 rounded-lg"
                            style={{
                                background: 'var(--v2-bg-elevated)',
                                border: '1px solid var(--v2-border)',
                                color: 'var(--v2-text-primary)'
                            }}
                        >
                            {Object.entries(EQUIPMENT_TIERS).map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Type Filter */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium" style={{ color: 'var(--v2-text-muted)' }}>Type</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as WodType | "all")}
                            className="v2-input text-sm py-2 px-3 rounded-lg"
                            style={{
                                background: 'var(--v2-bg-elevated)',
                                border: '1px solid var(--v2-border)',
                                color: 'var(--v2-text-primary)'
                            }}
                        >
                            <option value="all">All Types</option>
                            {Object.entries(WOD_TYPE_LABELS).map(([type, { label }]) => (
                                <option key={type} value={type}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Favorites Toggle */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium" style={{ color: 'var(--v2-text-muted)' }}>Show</label>
                        <button
                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            className="text-sm py-2 px-4 rounded-lg transition-colors"
                            style={{
                                background: showFavoritesOnly ? 'var(--v2-accent-subtle)' : 'var(--v2-bg-elevated)',
                                border: '1px solid var(--v2-border)',
                                color: showFavoritesOnly ? 'var(--v2-accent)' : 'var(--v2-text-secondary)'
                            }}
                        >
                            ★ Favorites {favorites.length > 0 && `(${favorites.length})`}
                        </button>
                    </div>
                </motion.div>

                {/* Results count */}
                <p className="text-xs mb-4" style={{ color: 'var(--v2-text-muted)' }}>
                    {filteredWods.length} WOD{filteredWods.length !== 1 ? 's' : ''} available
                </p>

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
                        <p className="text-sm" style={{ color: 'var(--v2-text-muted)' }}>
                            No WODs match your filters. Try adjusting equipment or type.
                        </p>
                    </div>
                )}
            </main>

            <Footer />
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

function WodCard({ wod, index, isFavorite, isExpanded, onToggleFavorite, onToggleExpand }: WodCardProps) {
    const typeInfo = WOD_TYPE_LABELS[wod.type];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index, duration: 0.4, ease }}
            className="rounded-xl overflow-hidden"
            style={{
                background: 'var(--v2-bg-elevated)',
                border: '1px solid var(--v2-border)'
            }}
        >
            {/* Header */}
            <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="text-sm font-medium mb-1">{wod.name}</h3>
                        <div className="flex items-center gap-2">
                            <span
                                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                style={{
                                    background: `${typeInfo.color}20`,
                                    color: typeInfo.color
                                }}
                            >
                                {typeInfo.label}
                            </span>
                            <span className="text-[10px]" style={{ color: 'var(--v2-text-muted)' }}>
                                {wod.timeDomain} min
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onToggleFavorite}
                        className="text-xl hover:scale-110 transition-transform"
                        style={{ color: isFavorite ? 'var(--v2-yellow)' : 'var(--v2-text-muted)' }}
                    >
                        {isFavorite ? '★' : '☆'}
                    </button>
                </div>

                {/* Format */}
                <p className="text-xs font-mono mb-3" style={{ color: 'var(--v2-text-secondary)' }}>
                    {wod.format}
                </p>

                {/* Movements preview */}
                <div className="space-y-1 mb-3">
                    {wod.movements.slice(0, 3).map((movement, i) => (
                        <p key={i} className="text-xs" style={{ color: 'var(--v2-text-secondary)' }}>
                            • {movement.name}: {movement.reps}
                        </p>
                    ))}
                    {wod.movements.length > 3 && (
                        <p className="text-xs" style={{ color: 'var(--v2-text-muted)' }}>
                            +{wod.movements.length - 3} more...
                        </p>
                    )}
                </div>

                {/* Equipment */}
                {wod.equipmentNeeded.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {wod.equipmentNeeded.map(eq => (
                            <span
                                key={eq}
                                className="text-[10px] px-2 py-0.5 rounded"
                                style={{ background: 'var(--v2-bg-hover)', color: 'var(--v2-text-muted)' }}
                            >
                                {eq.replace(/_/g, ' ')}
                            </span>
                        ))}
                    </div>
                )}
                {wod.equipmentNeeded.length === 0 && (
                    <span
                        className="text-[10px] px-2 py-0.5 rounded inline-block mb-3"
                        style={{ background: 'var(--v2-green)20', color: 'var(--v2-green)' }}
                    >
                        Bodyweight
                    </span>
                )}

                {/* Expand button */}
                <button
                    onClick={onToggleExpand}
                    className="text-xs w-full py-2 rounded-lg transition-colors"
                    style={{
                        background: 'var(--v2-bg-hover)',
                        color: 'var(--v2-text-secondary)'
                    }}
                >
                    {isExpanded ? 'Show Less ▲' : 'Show Scaling Options ▼'}
                </button>
            </div>

            {/* Expanded content */}
            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4"
                    style={{ borderTop: '1px solid var(--v2-border)' }}
                >
                    <div className="pt-4 space-y-3">
                        {/* Full movements */}
                        <div>
                            <h4 className="text-xs font-medium mb-2" style={{ color: 'var(--v2-text-muted)' }}>
                                All Movements
                            </h4>
                            {wod.movements.map((movement, i) => (
                                <p key={i} className="text-xs mb-1" style={{ color: 'var(--v2-text-secondary)' }}>
                                    • {movement.name}: {movement.reps}
                                    {movement.notes && <span style={{ color: 'var(--v2-text-muted)' }}> ({movement.notes})</span>}
                                </p>
                            ))}
                        </div>

                        {/* Scaling options */}
                        {wod.scalingOptions && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-medium" style={{ color: 'var(--v2-text-muted)' }}>
                                    Scaling Options
                                </h4>
                                <div className="rounded-lg p-3" style={{ background: 'var(--v2-bg-deep)' }}>
                                    <p className="text-xs mb-1">
                                        <span className="font-medium" style={{ color: 'var(--v2-accent)' }}>Rx: </span>
                                        <span style={{ color: 'var(--v2-text-secondary)' }}>{wod.scalingOptions.rx}</span>
                                    </p>
                                    <p className="text-xs mb-1">
                                        <span className="font-medium" style={{ color: 'var(--v2-yellow)' }}>Scaled: </span>
                                        <span style={{ color: 'var(--v2-text-secondary)' }}>{wod.scalingOptions.scaled}</span>
                                    </p>
                                    <p className="text-xs">
                                        <span className="font-medium" style={{ color: 'var(--v2-green)' }}>Beginner: </span>
                                        <span style={{ color: 'var(--v2-text-secondary)' }}>{wod.scalingOptions.beginner}</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {wod.notes && wod.notes.length > 0 && (
                            <div>
                                <h4 className="text-xs font-medium mb-1" style={{ color: 'var(--v2-text-muted)' }}>
                                    Coach Notes
                                </h4>
                                {wod.notes.map((note, i) => (
                                    <p key={i} className="text-xs italic" style={{ color: 'var(--v2-text-secondary)' }}>
                                        "{note}"
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
