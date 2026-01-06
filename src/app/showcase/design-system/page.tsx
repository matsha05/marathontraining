"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Metric } from "@/components/ui/Metric";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { StepIndicator } from "@/components/ui/StepIndicator";

/**
 * Design System V3 — Complete Showcase
 * Board-Presentation Quality
 * 
 * All tokens from globals-v2.css + proposed additions
 */

export default function DesignSystemShowcase() {
    const [theme, setTheme] = useState<"dark" | "light">("light");
    const [locale, setLocale] = useState<"en" | "de" | "ja">("en");
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Complete token system
    const tokens = {
        // From globals-v2.css
        colors: {
            dark: {
                // Backgrounds
                bgDeep: "#08080a",
                bgElevated: "rgba(255,255,255,0.02)",
                bgHover: "rgba(255,255,255,0.04)",
                bgActive: "rgba(255,255,255,0.06)",
                // Text
                textPrimary: "rgba(255,255,255,0.9)",
                textSecondary: "rgba(255,255,255,0.7)",
                textTertiary: "rgba(255,255,255,0.5)",
                textMuted: "rgba(255,255,255,0.4)",
                textSubtle: "rgba(255,255,255,0.35)", // Raised from 0.3 for WCAG
                textGhost: "rgba(255,255,255,0.2)",
                // Domain
                accent: "#19e38c",
                running: "#19e38c",
                strength: "#3a6bff",
                durability: "#8b5cf6",
                warning: "#f59e0b",
                error: "#ef4444",
                // Borders
                border: "rgba(255,255,255,0.05)",
                borderHover: "rgba(255,255,255,0.1)",
            },
            light: {
                bgDeep: "#ffffff",
                bgElevated: "rgba(0,0,0,0.02)",
                bgHover: "rgba(0,0,0,0.04)",
                bgActive: "rgba(0,0,0,0.06)",
                textPrimary: "rgba(0,0,0,0.9)",
                textSecondary: "rgba(0,0,0,0.7)",
                textTertiary: "rgba(0,0,0,0.5)",
                textMuted: "rgba(0,0,0,0.4)",
                textSubtle: "rgba(0,0,0,0.35)",
                textGhost: "rgba(0,0,0,0.2)",
                accent: "#0d9f5f",
                running: "#0d9f5f",
                strength: "#2952cc",
                durability: "#7c3aed",
                warning: "#d97706",
                error: "#dc2626",
                border: "rgba(0,0,0,0.08)",
                borderHover: "rgba(0,0,0,0.12)",
            }
        },
        typography: [
            { name: "Metric", token: "--v2-text-5xl", size: "56px", weight: 300, lh: 1.0 },
            { name: "Hero", token: "--v2-text-hero", size: "72px", weight: 300, lh: 1.1 },
            { name: "Display", token: "--v2-text-4xl", size: "48px", weight: 300, lh: 1.1 },
            { name: "Title 1", token: "--v2-text-2xl", size: "32px", weight: 400, lh: 1.2 },
            { name: "Title 2", token: "--v2-text-xl", size: "24px", weight: 500, lh: 1.3 },
            { name: "Headline", token: "(proposed)", size: "20px", weight: 500, lh: 1.3 },
            { name: "Callout", token: "--v2-text-lg", size: "18px", weight: 400, lh: 1.4 },
            { name: "Body", token: "--v2-text-base", size: "16px", weight: 400, lh: 1.5 },
            { name: "Footnote", token: "--v2-text-sm", size: "14px", weight: 500, lh: 1.4 },
            { name: "Caption", token: "(proposed)", size: "12px", weight: 400, lh: 1.3 },
        ],
        spacing: [
            { name: "space-1", value: 4, token: "--v2-space-1" },
            { name: "space-2", value: 8, token: "--v2-space-2" },
            { name: "space-3", value: 12, token: "--v2-space-3" },
            { name: "space-4", value: 16, token: "--v2-space-4" },
            { name: "space-6", value: 24, token: "--v2-space-6" },
            { name: "space-8", value: 32, token: "--v2-space-8" },
            { name: "space-12", value: 48, token: "--v2-space-12" },
            { name: "space-16", value: 64, token: "--v2-space-16" },
        ],
        radii: [
            { name: "sm", value: "6px", token: "--v2-radius-sm" },
            { name: "md", value: "8px", token: "--v2-radius-md" },
            { name: "lg", value: "12px", token: "--v2-radius-lg" },
            { name: "xl", value: "16px", token: "--v2-radius-xl" },
            { name: "full", value: "9999px", token: "--v2-radius-full" },
        ],
        shadows: [
            { name: "sm", value: "0 1px 2px rgba(0,0,0,0.5)", token: "--v2-shadow-sm" },
            { name: "md", value: "0 4px 12px rgba(0,0,0,0.4)", token: "--v2-shadow-md" },
            { name: "lg", value: "0 8px 24px rgba(0,0,0,0.5)", token: "--v2-shadow-lg" },
        ],
        motion: [
            { name: "Fast", duration: "150ms", token: "--v2-duration-fast", use: "Hovers" },
            { name: "Base", duration: "200ms", token: "--v2-duration-base", use: "Transitions" },
            { name: "Slow", duration: "300ms", token: "--v2-duration-slow", use: "Modals" },
            { name: "Spring", duration: "400ms", token: "(proposed)", use: "Delights" },
        ],
        zIndex: [
            { name: "base", value: 0 },
            { name: "dropdown", value: 10 },
            { name: "sticky", value: 20 },
            { name: "fixed", value: 30 },
            { name: "modal-backdrop", value: 40 },
            { name: "modal", value: 50 },
            { name: "popover", value: 60 },
            { name: "tooltip", value: 70 },
            { name: "toast", value: 80 },
        ],
    };

    const c = tokens.colors[theme];

    const samples: Record<string, Record<string, string>> = {
        metric: { en: "3.2", de: "3,2", ja: "3.2" },
        display: { en: "Easy Run", de: "Lockerer Lauf", ja: "イージーラン" },
        title: { en: "Today's Plan", de: "Heutiger Plan", ja: "本日のプラン" },
        body: { en: "Easy running builds your aerobic engine.", de: "Lockeres Laufen baut Ihre aerobe Ausdauer auf.", ja: "イージーランニングは有酸素能力を高めます。" },
    };

    const triggerLoading = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000);
    };

    // Sync theme with document.documentElement for CSS variable switching
    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        // Cleanup: restore original state when component unmounts
        return () => {
            document.documentElement.classList.remove("dark");
        };
    }, [theme]);

    return (
        <div
            className={`${theme === "dark" ? "dark" : ""} min-h-screen`}
            style={{
                backgroundColor: "var(--bg-base)",
                color: "var(--text-base)"
            }}
        >
            {/* Header */}
            <header
                style={{
                    position: "sticky", top: 0, zIndex: 50,
                    backdropFilter: "blur(16px)",
                    borderBottom: `1px solid ${c.border}`,
                    background: theme === "dark" ? "rgba(8,8,10,0.9)" : "rgba(255,255,255,0.9)",
                    padding: "16px 24px"
                }}
            >
                <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>Design System V3</h1>
                        <p style={{ fontSize: 12, color: c.textMuted }}>Board Presentation</p>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                        {/* Locale */}
                        <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1px solid ${c.border}` }}>
                            {(["en", "de", "ja"] as const).map(l => (
                                <button
                                    key={l}
                                    onClick={() => setLocale(l)}
                                    style={{
                                        padding: "6px 12px", fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
                                        background: locale === l ? c.accent : "transparent",
                                        color: locale === l ? c.bgDeep : c.textMuted,
                                    }}
                                >
                                    {l.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        {/* Theme */}
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            style={{
                                padding: "8px 16px", fontSize: 14, fontWeight: 500, borderRadius: 8, cursor: "pointer",
                                background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textSecondary
                            }}
                        >
                            {theme === "dark" ? "Light" : "Dark"}
                        </button>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
                {/* =================================================================
                   SECTION 1: TYPOGRAPHY
                   ================================================================= */}
                <Section title="Typography" subtitle="Semantic scale with localization support" c={c}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {tokens.typography.map(t => (
                            <div key={t.name} style={{ display: "flex", alignItems: "baseline", gap: 24, padding: "16px 0", borderBottom: `1px solid ${c.border}` }}>
                                <span style={{ width: 100, fontSize: 12, fontFamily: "monospace", color: c.textSubtle }}>{t.name}</span>
                                <span style={{ width: 80, fontSize: 12, fontFamily: "monospace", color: c.textMuted }}>{t.size}</span>
                                <span style={{ fontSize: t.size, fontWeight: t.weight, lineHeight: t.lh, color: t.name === "Metric" ? c.accent : c.textPrimary }}>
                                    {t.name === "Metric" ? samples.metric[locale] :
                                        t.name === "Display" || t.name === "Hero" ? samples.display[locale] :
                                            t.name.includes("Title") ? samples.title[locale] : "Sample text"}
                                </span>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* =================================================================
                   SECTION 1B: FONT COMPARISON
                   ================================================================= */}
                <Section title="Font Comparison" subtitle="Finding the perfect typeface for athletic precision" c={c}>
                    <div style={{ display: "grid", gap: 32 }}>
                        {/* Large metric comparison - 6 fonts in 2 rows */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                            {[
                                { name: "Sora", family: "var(--font-sora)", comment: "Athletic Precision" },
                                { name: "DM Sans", family: "var(--font-dm-sans)", comment: "Clean Minimal" },
                                { name: "Onest", family: "var(--font-onest)", comment: "Tech Precision" },
                                { name: "Inter", family: "var(--font-inter)", comment: "Industry Standard" },
                                { name: "Geist Sans", family: "var(--geist-font)", comment: "Vercel Modern" },
                                { name: "Instrument", family: "var(--font-instrument)", comment: "Original" },
                            ].map(font => (
                                <div key={font.name} style={{ padding: 20, borderRadius: 16, background: c.bgElevated, border: `1px solid ${c.border}` }}>
                                    <p style={{ fontSize: 12, color: c.textMuted, marginBottom: 2 }}>{font.name}</p>
                                    <p style={{ fontSize: 10, color: c.textSubtle, marginBottom: 12 }}>{font.comment}</p>
                                    <p style={{ fontFamily: font.family, fontSize: 48, fontWeight: 300, color: c.accent, lineHeight: 1 }}>4:32</p>
                                    <p style={{ fontFamily: font.family, fontSize: 20, fontWeight: 500, marginTop: 12, marginBottom: 6 }}>Easy Run</p>
                                    <p style={{ fontFamily: font.family, fontSize: 14, color: c.textSecondary }}>8 miles recovery</p>
                                </div>
                            ))}
                        </div>
                        {/* Readability at small sizes */}
                        <div style={{ padding: 24, borderRadius: 16, background: c.bgElevated, border: `1px solid ${c.border}` }}>
                            <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Small Size Readability (Outdoor Glanceability)</p>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
                                {[
                                    { name: "Sora", family: "var(--font-sora)" },
                                    { name: "DM Sans", family: "var(--font-dm-sans)" },
                                    { name: "Onest", family: "var(--font-onest)" },
                                    { name: "Inter", family: "var(--font-inter)" },
                                    { name: "Geist", family: "var(--geist-font)" },
                                    { name: "Instrument", family: "var(--font-instrument)" },
                                ].map(font => (
                                    <div key={font.name}>
                                        <p style={{ fontSize: 11, color: c.textMuted, marginBottom: 8 }}>{font.name}</p>
                                        <p style={{ fontFamily: font.family, fontSize: 14, marginBottom: 4 }}>9:27/mi</p>
                                        <p style={{ fontFamily: font.family, fontSize: 12, color: c.textSecondary, marginBottom: 4 }}>142 bpm</p>
                                        <p style={{ fontFamily: font.family, fontSize: 10, color: c.textTertiary }}>+120 ft</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Section>

                {/* =================================================================
                   SECTION 2: SPACING
                   ================================================================= */}
                <Section title="Spacing" subtitle="8px base grid" c={c}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-end" }}>
                        {tokens.spacing.map(s => (
                            <div key={s.name} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div style={{ width: s.value, height: s.value, background: c.accent, borderRadius: 4, minWidth: 16, minHeight: 16 }} />
                                <span style={{ fontSize: 12, fontFamily: "monospace", color: c.textMuted, marginTop: 8 }}>{s.name}</span>
                                <span style={{ fontSize: 10, color: c.textSubtle }}>{s.value}px</span>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* =================================================================
                   SECTION 3: COLORS
                   ================================================================= */}
                <Section title="Colors" subtitle="Text hierarchy and domain colors" c={c}>
                    {/* Text Colors */}
                    <h4 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, color: c.textSecondary }}>Text Hierarchy</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 32 }}>
                        {[
                            { name: "Primary", color: c.textPrimary, contrast: "16.5:1" },
                            { name: "Secondary", color: c.textSecondary, contrast: "10.4:1" },
                            { name: "Tertiary", color: c.textTertiary, contrast: "5.8:1" },
                            { name: "Muted", color: c.textMuted, contrast: "4.2:1" },
                            { name: "Subtle", color: c.textSubtle, contrast: "3.5:1" },
                            { name: "Ghost", color: c.textGhost, contrast: "2.0:1" },
                        ].map(t => (
                            <div key={t.name} style={{ padding: 16, borderRadius: 12, background: c.bgElevated, border: `1px solid ${c.border}` }}>
                                <span style={{ color: t.color, fontWeight: 500 }}>{t.name}</span>
                                <span style={{ fontSize: 11, fontFamily: "monospace", color: c.textMuted, marginLeft: 8 }}>{t.contrast}</span>
                            </div>
                        ))}
                    </div>

                    {/* Domain Colors */}
                    <h4 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, color: c.textSecondary }}>Domain Colors</h4>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        {[
                            { name: "Running", color: c.running },
                            { name: "Strength", color: c.strength },
                            { name: "Durability", color: c.durability },
                            { name: "Warning", color: c.warning },
                            { name: "Error", color: c.error },
                        ].map(d => (
                            <div key={d.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 16, borderRadius: 12, background: c.bgElevated, border: `1px solid ${c.border}` }}>
                                <div style={{ width: 48, height: 48, borderRadius: "50%", background: d.color, marginBottom: 12 }} />
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{d.name}</span>
                                <span style={{ fontSize: 11, fontFamily: "monospace", color: c.textMuted }}>{d.color}</span>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* =================================================================
                   SECTION 4: RADII
                   ================================================================= */}
                <Section title="Border Radii" subtitle="Consistent corner rounding" c={c}>
                    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                        {tokens.radii.map(r => (
                            <div key={r.name} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div style={{ width: 64, height: 64, background: c.bgElevated, border: `1px solid ${c.border}`, borderRadius: r.value }} />
                                <span style={{ fontSize: 12, fontFamily: "monospace", color: c.textMuted, marginTop: 8 }}>{r.name}</span>
                                <span style={{ fontSize: 10, color: c.textSubtle }}>{r.value}</span>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* =================================================================
                   SECTION 5: SHADOWS
                   ================================================================= */}
                <Section title="Shadows" subtitle="Depth and elevation" c={c}>
                    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                        {tokens.shadows.map(s => (
                            <div key={s.name} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div style={{ width: 80, height: 80, background: c.bgElevated, borderRadius: 12, boxShadow: s.value }} />
                                <span style={{ fontSize: 12, fontFamily: "monospace", color: c.textMuted, marginTop: 12 }}>{s.name}</span>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* =================================================================
                   SECTION 6: MOTION
                   ================================================================= */}
                <Section title="Motion" subtitle="Timing and easing curves" c={c}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
                        {tokens.motion.map(m => (
                            <div key={m.name} style={{ padding: 16, borderRadius: 12, background: c.bgElevated, border: `1px solid ${c.border}` }}>
                                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{m.name}</div>
                                <div style={{ fontSize: 12, fontFamily: "monospace", color: c.textMuted, marginBottom: 4 }}>{m.duration}</div>
                                <div style={{ fontSize: 12, color: c.textSubtle }}>{m.use}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                        <button
                            onClick={() => setShowModal(true)}
                            style={{ padding: "12px 24px", fontSize: 14, fontWeight: 500, borderRadius: 8, border: "none", cursor: "pointer", background: c.accent, color: c.bgDeep, transition: "transform 200ms", }}
                            onMouseDown={e => (e.currentTarget.style.transform = "scale(0.98)")}
                            onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                        >
                            Open Modal
                        </button>
                        <button
                            onClick={triggerLoading}
                            style={{ padding: "12px 24px", fontSize: 14, fontWeight: 500, borderRadius: 8, cursor: "pointer", background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textSecondary }}
                        >
                            Show Skeleton
                        </button>
                    </div>
                </Section>

                {/* =================================================================
                   SECTION 7: Z-INDEX
                   ================================================================= */}
                <Section title="Z-Index Scale" subtitle="Layering hierarchy" c={c}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {tokens.zIndex.map(z => (
                            <div key={z.name} style={{ padding: "8px 12px", fontSize: 12, fontFamily: "monospace", borderRadius: 6, background: c.bgElevated, border: `1px solid ${c.border}` }}>
                                <span style={{ color: c.textMuted }}>{z.name}:</span> <span style={{ color: c.accent }}>{z.value}</span>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* =================================================================
                   SECTION 8: FOCUS STATES
                   ================================================================= */}
                <Section title="Focus States" subtitle="Keyboard accessibility" c={c}>
                    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                        <button
                            style={{
                                padding: "12px 24px", fontSize: 14, fontWeight: 500, borderRadius: 8, cursor: "pointer",
                                background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textSecondary,
                                outline: "none",
                            }}
                            onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 2px ${c.bgDeep}, 0 0 0 4px ${c.accent}`}
                            onBlur={e => e.currentTarget.style.boxShadow = "none"}
                        >
                            Focus me (Tab)
                        </button>
                        <span style={{ fontSize: 12, color: c.textSubtle }}>Double-ring pattern for accessibility</span>
                    </div>
                </Section>

                {/* =================================================================
                   SECTION 9: TOUCH TARGETS
                   ================================================================= */}
                <Section title="Touch Targets" subtitle="44x44px minimum" c={c}>
                    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: c.accent, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.bgDeep} strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </div>
                            <span style={{ fontSize: 12, color: c.textMuted, marginTop: 8 }}>44x44 (pass)</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.5 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: c.bgElevated, border: `1px dashed ${c.textMuted}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontSize: 10 }}>X</span>
                            </div>
                            <span style={{ fontSize: 12, color: c.textMuted, marginTop: 8 }}>32x32 (fail)</span>
                        </div>
                    </div>
                </Section>

                {/* =================================================================
                   SECTION 10: LOADING STATES
                   ================================================================= */}
                <Section title="Loading States" subtitle="Skeleton patterns" c={c}>
                    <div style={{ maxWidth: 300, padding: 24, borderRadius: 16, background: c.bgElevated, border: `1px solid ${c.border}` }}>
                        {isLoading ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <div style={{ width: 80, height: 14, borderRadius: 4, background: c.border, animation: "pulse 1.5s ease-in-out infinite" }} />
                                <div style={{ width: 160, height: 20, borderRadius: 4, background: c.border, animation: "pulse 1.5s ease-in-out infinite" }} />
                                <div style={{ width: "100%", height: 14, borderRadius: 4, background: c.border, animation: "pulse 1.5s ease-in-out infinite" }} />
                            </div>
                        ) : (
                            <>
                                <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: c.textMuted, marginBottom: 4 }}>Phase I</p>
                                <h3 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>{samples.display[locale]}</h3>
                                <p style={{ fontSize: 14, color: c.textTertiary }}>{samples.body[locale]}</p>
                            </>
                        )}
                    </div>
                </Section>

                {/* =================================================================
                   SECTION 11: BUTTONS
                   ================================================================= */}
                <Section title="Buttons" subtitle="Interactive variants" c={c}>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <button style={{ padding: "12px 24px", fontSize: 14, fontWeight: 500, borderRadius: 8, border: "none", cursor: "pointer", background: c.accent, color: c.bgDeep }}>Primary</button>
                        <button style={{ padding: "12px 24px", fontSize: 14, fontWeight: 500, borderRadius: 8, cursor: "pointer", background: "transparent", border: `1px solid ${c.border}`, color: c.textSecondary }}>Secondary</button>
                        <button style={{ padding: "12px 24px", fontSize: 14, fontWeight: 500, borderRadius: 8, cursor: "pointer", background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textSecondary }}>Tertiary</button>
                        <button style={{ padding: "12px 24px", fontSize: 14, fontWeight: 500, borderRadius: 8, border: "none", cursor: "pointer", background: c.error, color: "#fff" }}>Destructive</button>
                        <button disabled style={{ padding: "12px 24px", fontSize: 14, fontWeight: 500, borderRadius: 8, border: "none", cursor: "not-allowed", background: c.bgElevated, color: c.textMuted, opacity: 0.5 }}>Disabled</button>
                    </div>
                </Section>

                {/* =================================================================
                   SECTION 12: CARDS
                   ================================================================= */}
                <Section title="Cards" subtitle="Container patterns" c={c}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
                        {/* Standard Card */}
                        <div style={{ padding: 24, borderRadius: 16, background: c.bgElevated, border: `1px solid ${c.border}` }}>
                            <h4 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Standard Card</h4>
                            <p style={{ fontSize: 14, color: c.textTertiary }}>24px padding, 16px radius</p>
                        </div>
                        {/* Interactive Card */}
                        <div
                            style={{ padding: 24, borderRadius: 16, background: c.bgElevated, border: `1px solid ${c.border}`, cursor: "pointer", transition: "all 200ms" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = c.borderHover; e.currentTarget.style.transform = "scale(1.02)"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.transform = "scale(1)"; }}
                        >
                            <h4 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Interactive Card</h4>
                            <p style={{ fontSize: 14, color: c.textTertiary }}>Hover to see effect</p>
                        </div>
                        {/* Accent Card */}
                        <div style={{ padding: 24, borderRadius: 16, background: c.bgElevated, border: `1px solid ${c.accent}` }}>
                            <h4 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8, color: c.accent }}>Accent Card</h4>
                            <p style={{ fontSize: 14, color: c.textTertiary }}>Accent border for emphasis</p>
                        </div>
                    </div>
                </Section>

                {/* =================================================================
                   SECTION 13: INPUTS
                   ================================================================= */}
                <Section title="Form Inputs" subtitle="Text fields and controls" c={c}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 500, color: c.textMuted, display: "block", marginBottom: 6 }}>Label</label>
                            <input
                                type="text"
                                placeholder="Placeholder text"
                                style={{
                                    width: "100%", padding: "12px 16px", fontSize: 14, borderRadius: 8,
                                    background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textPrimary,
                                    outline: "none"
                                }}
                                onFocus={e => e.currentTarget.style.borderColor = c.accent}
                                onBlur={e => e.currentTarget.style.borderColor = c.border}
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 20, height: 20, borderRadius: 4, background: c.accent, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.bgDeep} strokeWidth="3"><path d="M5 12l5 5L20 7" /></svg>
                            </div>
                            <span style={{ fontSize: 14 }}>Checkbox checked</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 20, height: 20, borderRadius: 4, background: "transparent", border: `1px solid ${c.border}`, cursor: "pointer" }} />
                            <span style={{ fontSize: 14, color: c.textSecondary }}>Checkbox unchecked</span>
                        </div>
                    </div>
                </Section>

                {/* =================================================================
                   SECTION 14: AVATARS
                   ================================================================= */}
                <Section title="Avatars" subtitle="User identity in header and profiles" c={c}>
                    <div style={{ display: "flex", gap: 24, alignItems: "flex-end", flexWrap: "wrap" }}>
                        {/* Small (Header) */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: "50%",
                                background: `linear-gradient(135deg, ${c.accent}, ${c.strength})`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 14, fontWeight: 600, color: c.bgDeep
                            }}>
                                MS
                            </div>
                            <span style={{ fontSize: 12, color: c.textMuted, marginTop: 8 }}>32px (Header)</span>
                        </div>
                        {/* Medium */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: "50%",
                                background: `linear-gradient(135deg, ${c.accent}, ${c.strength})`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 18, fontWeight: 600, color: c.bgDeep
                            }}>
                                MS
                            </div>
                            <span style={{ fontSize: 12, color: c.textMuted, marginTop: 8 }}>44px (Touch)</span>
                        </div>
                        {/* Large (Profile) */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: "50%",
                                background: `linear-gradient(135deg, ${c.accent}, ${c.strength})`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 24, fontWeight: 600, color: c.bgDeep
                            }}>
                                MS
                            </div>
                            <span style={{ fontSize: 12, color: c.textMuted, marginTop: 8 }}>64px (Profile)</span>
                        </div>
                        {/* With image placeholder */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: "50%",
                                background: c.bgElevated,
                                border: `1px solid ${c.border}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.textMuted} strokeWidth="2">
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                                </svg>
                            </div>
                            <span style={{ fontSize: 12, color: c.textMuted, marginTop: 8 }}>No Photo</span>
                        </div>
                    </div>

                    {/* Character Avatars */}
                    <div style={{ marginTop: 32 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Character Avatars (Selectable)</p>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                            {[
                                { name: "Runner", src: "/avatars/avatar_runner_green.png" },
                                { name: "Strength", src: "/avatars/avatar_runner_blue.png" },
                                { name: "Mobility", src: "/avatars/avatar_runner_purple.png" },
                                { name: "Trail", src: "/avatars/avatar_trail_runner.png" },
                                { name: "Sprinter", src: "/avatars/avatar_sprinter.png" },
                                { name: "Marathon", src: "/avatars/avatar_marathon.png" },
                            ].map(avatar => (
                                <div key={avatar.name} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            width: 64, height: 64, borderRadius: "50%",
                                            overflow: "hidden", cursor: "pointer",
                                            border: `2px solid ${c.border}`,
                                            transition: "border-color 0.2s"
                                        }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={avatar.src} alt={avatar.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </motion.div>
                                    <span style={{ fontSize: 11, color: c.textMuted, marginTop: 8 }}>{avatar.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* =================================================================
                   SECTION 14: SAMPLE WORKOUT CARD
                   ================================================================= */}
                <Section title="Sample Component" subtitle="All tokens applied" c={c}>
                    <div style={{ maxWidth: 400, padding: 24, borderRadius: 16, background: c.bgElevated, border: `1px solid ${c.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                            <div>
                                <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: c.textMuted, marginBottom: 4 }}>
                                    {locale === "de" ? "PHASE I: GRUNDLAGE" : locale === "ja" ? "フェーズ I" : "PHASE I: FOUNDATION"}
                                </p>
                                <h3 style={{ fontSize: 24, fontWeight: 500 }}>{samples.display[locale]}</h3>
                            </div>
                            <span style={{ fontSize: 48, fontWeight: 300, color: c.accent, lineHeight: 1 }}>
                                3<span style={{ fontSize: 14, color: c.textMuted, marginLeft: 4 }}>mi</span>
                            </span>
                        </div>
                        <p style={{ fontSize: 16, lineHeight: 1.5, color: c.textTertiary }}>{samples.body[locale]}</p>
                    </div>
                </Section>

                {/* =================================================================
                   SECTION 15: V3 COMPONENTS (NEW)
                   ================================================================= */}
                <Section title="V3 Components" subtitle="New primitives for design system coverage" c={c}>
                    {/* Metric Component */}
                    <div style={{ marginBottom: 32 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, color: c.textSecondary }}>Metric (Numeric Data Display)</h4>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "baseline" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <span style={{ fontSize: 10, color: c.textSubtle }}>xl</span>
                                <Metric value="4:32" unit="/mi" size="xl" color="accent" />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <span style={{ fontSize: 10, color: c.textSubtle }}>lg</span>
                                <Metric value="26.2" unit="mi" size="lg" color="default" />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <span style={{ fontSize: 10, color: c.textSubtle }}>md</span>
                                <Metric value="142" unit="bpm" size="md" color="muted" />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <span style={{ fontSize: 10, color: c.textSubtle }}>sm</span>
                                <Metric value="65" unit="%" size="sm" color="success" />
                            </div>
                        </div>
                    </div>

                    {/* Badge Component */}
                    <div style={{ marginBottom: 32 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, color: c.textSecondary }}>Badge (Status Labels)</h4>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                            <Badge variant="default">Default</Badge>
                            <Badge variant="accent">Current Week</Badge>
                            <Badge variant="success">Completed</Badge>
                            <Badge variant="warning">Skipped</Badge>
                            <Badge variant="error">Missed</Badge>
                            <Badge variant="running">Running</Badge>
                            <Badge variant="strength">Strength</Badge>
                            <Badge variant="durability">Durability</Badge>
                        </div>
                    </div>

                    {/* Progress Ring Component */}
                    <div style={{ marginBottom: 32 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, color: c.textSecondary }}>ProgressRing (Circular Progress)</h4>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-end" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                <ProgressRing percent={85} size={80} showLabel />
                                <span style={{ fontSize: 10, color: c.textSubtle }}>80px</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                <ProgressRing percent={65} size={64} showLabel color="accent" />
                                <span style={{ fontSize: 10, color: c.textSubtle }}>64px</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                <ProgressRing percent={50} size={48} showLabel color="success" />
                                <span style={{ fontSize: 10, color: c.textSubtle }}>48px success</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                <ProgressRing percent={30} size={40} color="warning" showLabel />
                                <span style={{ fontSize: 10, color: c.textSubtle }}>40px warning</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                <ProgressRing percent={100} size={56} showCheckOnComplete color="accent" />
                                <span style={{ fontSize: 10, color: c.textSubtle }}>Complete</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar Component */}
                    <div style={{ marginBottom: 32 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, color: c.textSecondary }}>ProgressBar (Linear Progress)</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}>
                            <ProgressBar percent={65} showLabel label="Phase Progress" />
                            <ProgressBar percent={85} size="lg" color="success" showLabel />
                            <ProgressBar percent={40} size="sm" color="muted" />
                        </div>
                    </div>

                    {/* StatCard Component */}
                    <div style={{ marginBottom: 32 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, color: c.textSecondary }}>StatCard (Compact Stats)</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                            <StatCard
                                value="42.5"
                                unit="mi"
                                label="This Week"
                                color="accent"
                            />
                            <StatCard
                                value="4:32:00"
                                label="Long Run"
                                size="sm"
                            />
                            <StatCard
                                value="65"
                                unit="%"
                                label="Completion"
                                color="accent"
                                trend={{ value: "+5%", direction: "up" }}
                            />
                        </div>
                    </div>

                    {/* StepIndicator Component */}
                    <div>
                        <h4 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, color: c.textSecondary }}>StepIndicator (Onboarding Progress)</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}>
                            <StepIndicator totalSteps={5} currentStep={3} showNumbers />
                            <StepIndicator totalSteps={4} currentStep={1} size="lg" />
                            <StepIndicator totalSteps={6} currentStep={6} size="sm" />
                        </div>
                    </div>
                </Section>
            </main>

            {/* Modal */}
            {showModal && (
                <div
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        style={{ maxWidth: 400, padding: 32, borderRadius: 20, background: c.bgDeep, border: `1px solid ${c.border}`, animation: "modalIn 400ms cubic-bezier(0.175,0.885,0.32,1.275)" }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Spring Animation</h2>
                        <p style={{ fontSize: 14, color: c.textTertiary, marginBottom: 24 }}>This modal uses a spring timing curve for a premium feel.</p>
                        <button onClick={() => setShowModal(false)} style={{ padding: "10px 20px", fontSize: 14, fontWeight: 500, borderRadius: 8, border: "none", cursor: "pointer", background: c.accent, color: c.bgDeep }}>Close</button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
                @keyframes modalIn { 0% { opacity: 0; transform: scale(0.9) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
            `}</style>
        </div>
    );
}

function Section({ title, subtitle, c, children }: { title: string; subtitle: string; c: { textPrimary: string; textMuted: string; border: string }; children: React.ReactNode }) {
    return (
        <section style={{ marginBottom: 64, paddingBottom: 48, borderBottom: `1px solid ${c.border}` }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4, color: c.textPrimary }}>{title}</h2>
            <p style={{ fontSize: 14, color: c.textMuted, marginBottom: 24 }}>{subtitle}</p>
            {children}
        </section>
    );
}
