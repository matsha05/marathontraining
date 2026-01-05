"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import "../globals-v2.css";
import {
    AnimatedCheck,
    AnimatedSpinner,
    AnimatedSettings,
    AnimatedDownload,
    AnimatedSparkles,
    AnimatedCircleCheck,
    AnimatedRefresh,
} from "@/components/icons/animated-icons";

/**
 * Design System V2 Playground
 * 
 * Visual showcase of all components in the Week-based design system.
 * Use this to verify component styling before migration.
 */

export default function DesignSystemPlayground() {
    const [showModal, setShowModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [checked, setChecked] = useState(false);
    const [selectedRadio, setSelectedRadio] = useState("option1");
    const [settingsAnimating, setSettingsAnimating] = useState(false);
    const [downloadAnimating, setDownloadAnimating] = useState(false);
    const [refreshAnimating, setRefreshAnimating] = useState(false);
    const [showCheck, setShowCheck] = useState(false);
    const [sparklesKey, setSparklesKey] = useState(0);
    const [circleCheckKey, setCircleCheckKey] = useState(0);
    const [sliderValue, setSliderValue] = useState(50);
    const [activeTab, setActiveTab] = useState("tab1");
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <div className="v2-root min-h-screen">
            {/* Hero */}
            <section className="min-h-[50vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
                {/* Glow */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'var(--v2-glow-accent)' }}
                />

                <div className="text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="v2-hero mb-4"
                    >
                        Design System V2
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="v2-body text-lg"
                    >
                        Based on the Week landing page aesthetic
                    </motion.p>
                </div>
            </section>

            {/* Typography Section */}
            <section className="v2-section border-t" style={{ borderColor: 'var(--v2-border)' }}>
                <div className="v2-container">
                    <p className="v2-label mb-6">Typography</p>

                    <div className="space-y-6">
                        <div>
                            <h1 className="v2-hero">Hero Heading</h1>
                            <p className="v2-mono mt-2">v2-hero · font-light · tracking-tight</p>
                        </div>
                        <div>
                            <h2 className="v2-heading-lg">Large Heading</h2>
                            <p className="v2-mono mt-2">v2-heading-lg</p>
                        </div>
                        <div>
                            <h3 className="v2-heading-md">Medium Heading</h3>
                            <p className="v2-mono mt-2">v2-heading-md</p>
                        </div>
                        <div>
                            <h4 className="v2-heading-sm">Small Heading</h4>
                            <p className="v2-mono mt-2">v2-heading-sm</p>
                        </div>
                        <div>
                            <p className="v2-body">Body text with tertiary color for comfortable reading on dark backgrounds.</p>
                            <p className="v2-mono mt-2">v2-body</p>
                        </div>
                        <div>
                            <p className="v2-body-sm">Small body text for secondary information and metadata.</p>
                            <p className="v2-mono mt-2">v2-body-sm</p>
                        </div>
                        <div>
                            <p className="v2-label">Label Text</p>
                            <p className="v2-mono mt-2">v2-label · uppercase · tracking-widest</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Buttons Section */}
            <section className="v2-section v2-section-alt">
                <div className="v2-container">
                    <p className="v2-label mb-6">Buttons</p>

                    <div className="space-y-6">
                        <div className="flex flex-wrap gap-4 items-center">
                            <button className="v2-btn v2-btn-primary">Primary Button</button>
                            <button className="v2-btn v2-btn-secondary">Secondary Button</button>
                            <button className="v2-btn v2-btn-ghost">Ghost Button</button>
                        </div>

                        <div className="flex flex-wrap gap-4 items-center">
                            <button className="v2-btn v2-btn-primary v2-btn-sm">Small</button>
                            <button className="v2-btn v2-btn-primary">Default</button>
                            <button className="v2-btn v2-btn-primary v2-btn-lg">Large</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Form Inputs Section */}
            <section className="v2-section border-t" style={{ borderColor: 'var(--v2-border)' }}>
                <div className="v2-container">
                    <p className="v2-label mb-6">Form Inputs</p>

                    <div className="space-y-6 max-w-md">
                        <div>
                            <label className="v2-label block mb-2">Text Input</label>
                            <input
                                type="text"
                                className="v2-input v2-select"
                                placeholder="Enter your email..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="v2-label block mb-2">Select</label>
                            <select className="v2-input v2-select">
                                <option>Marathon</option>
                                <option>Half Marathon</option>
                                <option>10K</option>
                                <option>5K</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                className="v2-checkbox"
                                checked={checked}
                                onChange={(e) => setChecked(e.target.checked)}
                            />
                            <label className="v2-body-sm cursor-pointer" onClick={() => setChecked(!checked)}>
                                Checkbox label
                            </label>
                        </div>

                        <div className="space-y-2">
                            <label className="v2-label block mb-2">Radio Group</label>
                            {["option1", "option2", "option3"].map((opt) => (
                                <div key={opt} className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        className="v2-radio"
                                        checked={selectedRadio === opt}
                                        onChange={() => setSelectedRadio(opt)}
                                    />
                                    <label
                                        className="v2-body-sm cursor-pointer"
                                        onClick={() => setSelectedRadio(opt)}
                                    >
                                        {opt === "option1" ? "First option" : opt === "option2" ? "Second option" : "Third option"}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Cards Section */}
            <section className="v2-section v2-section-alt">
                <div className="v2-container">
                    <p className="v2-label mb-6">Cards</p>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="v2-card">
                            <p className="v2-heading-sm mb-2">Default Card</p>
                            <p className="v2-body-sm">A basic card with subtle background and border.</p>
                        </div>

                        <div className="v2-card v2-card-interactive">
                            <p className="v2-heading-sm mb-2">Interactive Card</p>
                            <p className="v2-body-sm">Hover me for scale effect.</p>
                        </div>

                        <div className="v2-card v2-card-accent v2-card-interactive">
                            <p className="v2-heading-sm mb-2" style={{ color: 'var(--v2-accent)' }}>Accent Card</p>
                            <p className="v2-body-sm">With accent background tint.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Badges Section */}
            <section className="v2-section border-t" style={{ borderColor: 'var(--v2-border)' }}>
                <div className="v2-container">
                    <p className="v2-label mb-6">Badges</p>

                    <div className="flex flex-wrap gap-3">
                        <span className="v2-badge">Default</span>
                        <span className="v2-badge v2-badge-accent">Accent</span>
                        <span className="v2-badge v2-badge-secondary">Secondary</span>
                    </div>
                </div>
            </section>

            {/* Loading States Section */}
            <section className="v2-section v2-section-alt">
                <div className="v2-container">
                    <p className="v2-label mb-6">Loading States</p>

                    <div className="space-y-6">
                        <div>
                            <p className="v2-body-sm mb-3">Spinner</p>
                            <div className="v2-spinner" />
                        </div>

                        <div>
                            <p className="v2-body-sm mb-3">Skeleton Loader</p>
                            <div className="space-y-3">
                                <div className="v2-skeleton v2-skeleton-text" style={{ height: '1.5rem' }} />
                                <div className="v2-skeleton v2-skeleton-text v2-skeleton-text-sm" style={{ height: '1rem' }} />
                                <div className="v2-skeleton" style={{ height: '4rem', width: '100%' }} />
                            </div>
                        </div>

                        <div>
                            <p className="v2-body-sm mb-3">Progress Bar (60%)</p>
                            <div className="v2-progress">
                                <div className="v2-progress-bar" style={{ width: '60%' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Empty State Section */}
            <section className="v2-section border-t" style={{ borderColor: 'var(--v2-border)' }}>
                <div className="v2-container">
                    <p className="v2-label mb-6">Empty State</p>

                    <div className="v2-card">
                        <div className="v2-empty">
                            <div className="v2-empty-icon">📭</div>
                            <p className="v2-empty-title">No training plans yet</p>
                            <p className="v2-empty-description">Create your first plan to get started with structured training.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal & Toast Demo */}
            <section className="v2-section v2-section-alt">
                <div className="v2-container">
                    <p className="v2-label mb-6">Modal & Toast</p>

                    <div className="flex gap-4">
                        <button
                            className="v2-btn v2-btn-secondary"
                            onClick={() => setShowModal(true)}
                        >
                            Open Modal
                        </button>
                        <button
                            className="v2-btn v2-btn-secondary"
                            onClick={() => {
                                setShowToast(true);
                                setTimeout(() => setShowToast(false), 3000);
                            }}
                        >
                            Show Toast
                        </button>
                    </div>
                </div>
            </section>

            {/* Icons Section */}
            <section className="v2-section v2-section-alt">
                <div className="v2-container">
                    <p className="v2-label mb-6">Icons (Lucide)</p>

                    <div className="space-y-6">
                        <div>
                            <p className="v2-body-sm mb-3">Sizes</p>
                            <div className="flex items-center gap-6">
                                {[
                                    { size: "v2-icon-xs", label: "12px" },
                                    { size: "v2-icon-sm", label: "16px" },
                                    { size: "v2-icon-md", label: "20px" },
                                    { size: "v2-icon-lg", label: "24px" },
                                    { size: "v2-icon-xl", label: "32px" },
                                ].map((icon) => (
                                    <div key={icon.size} className="text-center">
                                        <svg className={`${icon.size} mx-auto mb-2`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12,6 12,12 16,14" />
                                        </svg>
                                        <p className="v2-mono">{icon.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="v2-body-sm mb-3">Colors</p>
                            <div className="flex items-center gap-6">
                                {[
                                    { color: "", label: "inherit" },
                                    { color: "v2-icon-accent", label: "accent" },
                                    { color: "v2-icon-secondary", label: "secondary" },
                                    { color: "v2-icon-muted", label: "muted" },
                                    { color: "v2-icon-ghost", label: "ghost" },
                                ].map((icon) => (
                                    <div key={icon.label} className="text-center">
                                        <svg className={`v2-icon-lg mx-auto mb-2 ${icon.color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                            <path d="M2 17l10 5 10-5" />
                                            <path d="M2 12l10 5 10-5" />
                                        </svg>
                                        <p className="v2-mono">{icon.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Animated Icons Section */}
            <section className="v2-section border-t" style={{ borderColor: 'var(--v2-border)' }}>
                <div className="v2-container">
                    <p className="v2-label mb-6">Animated Icons</p>
                    <p className="v2-body-sm mb-6">Use sparingly — 1-2 key moments per page. Click to trigger animations.</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Check */}
                        <div
                            className="v2-card v2-card-interactive text-center cursor-pointer"
                            onClick={() => {
                                setShowCheck(false);
                                setTimeout(() => setShowCheck(true), 50);
                            }}
                        >
                            <div className="h-12 flex items-center justify-center mb-2">
                                {showCheck ? (
                                    <AnimatedCheck className="v2-icon-accent" size={32} />
                                ) : (
                                    <div className="v2-icon-xl v2-icon-ghost">○</div>
                                )}
                            </div>
                            <p className="v2-body-sm">Check</p>
                            <p className="v2-mono">Success state</p>
                        </div>

                        {/* Spinner */}
                        <div className="v2-card text-center">
                            <div className="h-12 flex items-center justify-center mb-2">
                                <AnimatedSpinner className="v2-icon-accent" size={32} />
                            </div>
                            <p className="v2-body-sm">Spinner</p>
                            <p className="v2-mono">Loading</p>
                        </div>

                        {/* Settings */}
                        <div
                            className="v2-card v2-card-interactive text-center cursor-pointer"
                            onClick={() => setSettingsAnimating(!settingsAnimating)}
                        >
                            <div className="h-12 flex items-center justify-center mb-2">
                                <AnimatedSettings
                                    className="v2-icon-muted"
                                    size={32}
                                    animate={settingsAnimating}
                                />
                            </div>
                            <p className="v2-body-sm">Settings</p>
                            <p className="v2-mono">Click to toggle</p>
                        </div>

                        {/* Download */}
                        <div
                            className="v2-card v2-card-interactive text-center cursor-pointer"
                            onClick={() => setDownloadAnimating(!downloadAnimating)}
                        >
                            <div className="h-12 flex items-center justify-center mb-2">
                                <AnimatedDownload
                                    className="v2-icon-secondary"
                                    size={32}
                                    animate={downloadAnimating}
                                />
                            </div>
                            <p className="v2-body-sm">Download</p>
                            <p className="v2-mono">Click to toggle</p>
                        </div>

                        {/* Sparkles */}
                        <div
                            className="v2-card v2-card-accent v2-card-interactive text-center cursor-pointer"
                            onClick={() => setSparklesKey(k => k + 1)}
                        >
                            <div className="h-12 flex items-center justify-center mb-2">
                                <AnimatedSparkles key={sparklesKey} className="v2-icon-accent" size={32} />
                            </div>
                            <p className="v2-body-sm">Sparkles</p>
                            <p className="v2-mono">AI/Magic</p>
                        </div>

                        {/* Circle Check */}
                        <div
                            className="v2-card v2-card-interactive text-center cursor-pointer"
                            onClick={() => setCircleCheckKey(k => k + 1)}
                        >
                            <div className="h-12 flex items-center justify-center mb-2">
                                <AnimatedCircleCheck key={circleCheckKey} className="v2-success" size={32} />
                            </div>
                            <p className="v2-body-sm">Circle Check</p>
                            <p className="v2-mono">Big success</p>
                        </div>

                        {/* Refresh */}
                        <div
                            className="v2-card v2-card-interactive text-center cursor-pointer"
                            onClick={() => {
                                setRefreshAnimating(true);
                                setTimeout(() => setRefreshAnimating(false), 800);
                            }}
                        >
                            <div className="h-12 flex items-center justify-center mb-2">
                                <AnimatedRefresh
                                    className="v2-icon-muted"
                                    size={32}
                                    animate={refreshAnimating}
                                />
                            </div>
                            <p className="v2-body-sm">Refresh</p>
                            <p className="v2-mono">Sync action</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Domain Colors Section */}
            <section className="v2-section border-t" style={{ borderColor: 'var(--v2-border)' }}>
                <div className="v2-container">
                    <p className="v2-label mb-6">Domain Colors</p>

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {[
                            { name: "Running", class: "v2-running", bg: "v2-bg-running" },
                            { name: "Strength", class: "v2-strength", bg: "v2-bg-strength" },
                            { name: "Durability", class: "v2-durability", bg: "v2-bg-durability" },
                            { name: "Success", class: "v2-success", bg: "v2-bg-running" },
                            { name: "Warning", class: "v2-warning", bg: "" },
                            { name: "Error", class: "v2-error", bg: "" },
                        ].map((color) => (
                            <div
                                key={color.name}
                                className={`v2-card text-center ${color.bg}`}
                            >
                                <p className={`${color.class} font-medium mb-1`}>{color.name}</p>
                                <p className="v2-mono">{color.class}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Form Groups Section */}
            <section className="v2-section v2-section-alt">
                <div className="v2-container">
                    <p className="v2-label mb-6">Form Groups</p>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="v2-form-group">
                            <label className="v2-form-label">Email Address</label>
                            <input type="email" className="v2-input" placeholder="you@example.com" />
                            <span className="v2-form-hint">We&apos;ll never share your email.</span>
                        </div>

                        <div className="v2-form-group">
                            <label className="v2-form-label">Target Pace (with error)</label>
                            <input type="text" className="v2-input v2-input-error" placeholder="7:30" defaultValue="invalid" />
                            <span className="v2-error-message">Please enter a valid pace (e.g., 7:30)</span>
                        </div>

                        <div className="v2-form-group">
                            <label className="v2-form-label">Race Distance</label>
                            <select className="v2-select">
                                <option>Marathon</option>
                                <option>Half Marathon</option>
                                <option>10K</option>
                                <option>5K</option>
                            </select>
                        </div>

                        <div className="v2-form-group">
                            <label className="v2-form-label">Completed (success state)</label>
                            <input type="text" className="v2-input v2-input-success" defaultValue="7:30 /mi" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Slider Section */}
            <section className="v2-section border-t" style={{ borderColor: 'var(--v2-border)' }}>
                <div className="v2-container">
                    <p className="v2-label mb-6">Slider / Range</p>

                    <div className="space-y-8 max-w-md">
                        <div className="v2-form-group">
                            <label className="v2-form-label">Effort Level: {sliderValue}%</label>
                            <input
                                type="range"
                                className="v2-slider v2-slider-accent"
                                min="0"
                                max="100"
                                value={sliderValue}
                                onChange={(e) => setSliderValue(Number(e.target.value))}
                                style={{ '--slider-fill': `${sliderValue}%` } as React.CSSProperties}
                            />
                            <div className="v2-slider-labels">
                                <span>Easy</span>
                                <span>Moderate</span>
                                <span>Hard</span>
                            </div>
                        </div>

                        <div className="v2-form-group">
                            <label className="v2-form-label">Basic Slider</label>
                            <input type="range" className="v2-slider" min="0" max="100" defaultValue="30" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs Section */}
            <section className="v2-section v2-section-alt">
                <div className="v2-container">
                    <p className="v2-label mb-6">Tabs</p>

                    <div className="space-y-8">
                        {/* Underline Tabs */}
                        <div>
                            <p className="v2-body-sm mb-4">Underline Style</p>
                            <div className="v2-tabs" role="tablist">
                                {["tab1", "tab2", "tab3"].map((tab, i) => (
                                    <button
                                        key={tab}
                                        role="tab"
                                        aria-selected={activeTab === tab}
                                        className={`v2-tab ${activeTab === tab ? 'v2-tab-active' : ''}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {["Overview", "Schedule", "Stats"][i]}
                                    </button>
                                ))}
                            </div>
                            <div className="v2-tab-panel">
                                <p className="v2-body">Content for {activeTab === "tab1" ? "Overview" : activeTab === "tab2" ? "Schedule" : "Stats"}</p>
                            </div>
                        </div>

                        {/* Pills Tabs */}
                        <div>
                            <p className="v2-body-sm mb-4">Pills Style</p>
                            <div className="v2-tabs v2-tabs-pills" role="tablist">
                                {["Running", "Strength", "Durability"].map((label) => (
                                    <button
                                        key={label}
                                        role="tab"
                                        className={`v2-tab ${label === "Running" ? 'v2-tab-active' : ''}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Avatars Section */}
            <section className="v2-section border-t" style={{ borderColor: 'var(--v2-border)' }}>
                <div className="v2-container">
                    <p className="v2-label mb-6">Avatars</p>

                    <div className="space-y-8">
                        <div>
                            <p className="v2-body-sm mb-4">Sizes</p>
                            <div className="flex items-end gap-4">
                                <div className="text-center">
                                    <div className="v2-avatar v2-avatar-xs">XS</div>
                                    <p className="v2-mono mt-2">24px</p>
                                </div>
                                <div className="text-center">
                                    <div className="v2-avatar v2-avatar-sm">SM</div>
                                    <p className="v2-mono mt-2">32px</p>
                                </div>
                                <div className="text-center">
                                    <div className="v2-avatar v2-avatar-md">MD</div>
                                    <p className="v2-mono mt-2">40px</p>
                                </div>
                                <div className="text-center">
                                    <div className="v2-avatar v2-avatar-lg">LG</div>
                                    <p className="v2-mono mt-2">48px</p>
                                </div>
                                <div className="text-center">
                                    <div className="v2-avatar v2-avatar-xl">XL</div>
                                    <p className="v2-mono mt-2">64px</p>
                                </div>
                                <div className="text-center">
                                    <div className="v2-avatar v2-avatar-2xl">2X</div>
                                    <p className="v2-mono mt-2">96px</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="v2-body-sm mb-4">Avatar Group</p>
                            <div className="v2-avatar-group">
                                <div className="v2-avatar v2-avatar-md">JP</div>
                                <div className="v2-avatar v2-avatar-md">MK</div>
                                <div className="v2-avatar v2-avatar-md">AS</div>
                                <div className="v2-avatar v2-avatar-md">+3</div>
                            </div>
                        </div>

                        <div>
                            <p className="v2-body-sm mb-4">With Accent Border</p>
                            <div className="v2-avatar v2-avatar-lg v2-avatar-accent">MS</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Data Table Section */}
            <section className="v2-section v2-section-alt">
                <div className="v2-container">
                    <p className="v2-label mb-6">Data Table</p>

                    <div className="v2-table-wrapper">
                        <table className="v2-table v2-table-interactive">
                            <thead>
                                <tr>
                                    <th>Day</th>
                                    <th>Workout</th>
                                    <th className="v2-table-right">Distance</th>
                                    <th className="v2-table-right">Pace</th>
                                    <th className="v2-table-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Monday</td>
                                    <td>Easy Run</td>
                                    <td className="v2-table-right v2-table-mono">8.0 mi</td>
                                    <td className="v2-table-right v2-table-mono v2-table-accent">8:45</td>
                                    <td className="v2-table-center"><span className="v2-badge v2-badge-accent">Done</span></td>
                                </tr>
                                <tr>
                                    <td>Tuesday</td>
                                    <td>Tempo Intervals</td>
                                    <td className="v2-table-right v2-table-mono">6.0 mi</td>
                                    <td className="v2-table-right v2-table-mono v2-table-accent">7:15</td>
                                    <td className="v2-table-center"><span className="v2-badge v2-badge-accent">Done</span></td>
                                </tr>
                                <tr>
                                    <td>Wednesday</td>
                                    <td>Strength Training</td>
                                    <td className="v2-table-right v2-table-mono">—</td>
                                    <td className="v2-table-right v2-table-mono">—</td>
                                    <td className="v2-table-center"><span className="v2-badge">Scheduled</span></td>
                                </tr>
                                <tr>
                                    <td>Thursday</td>
                                    <td>Long Run</td>
                                    <td className="v2-table-right v2-table-mono">16.0 mi</td>
                                    <td className="v2-table-right v2-table-mono v2-table-accent">9:00</td>
                                    <td className="v2-table-center"><span className="v2-badge">Scheduled</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Dropdown Section */}
            <section className="v2-section border-t" style={{ borderColor: 'var(--v2-border)' }}>
                <div className="v2-container">
                    <p className="v2-label mb-6">Dropdown Menu</p>

                    <div className="v2-dropdown">
                        <button
                            className="v2-btn v2-btn-secondary"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            Open Menu ▼
                        </button>
                        {showDropdown && (
                            <div className="v2-dropdown-menu">
                                <button className="v2-dropdown-item">
                                    <span>⚙️</span> Settings
                                </button>
                                <button className="v2-dropdown-item">
                                    <span>📊</span> Analytics
                                </button>
                                <button className="v2-dropdown-item">
                                    <span>📥</span> Export Data
                                </button>
                                <div className="v2-dropdown-divider" />
                                <button className="v2-dropdown-item" style={{ color: 'var(--v2-error)' }}>
                                    <span>🗑️</span> Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Back to Week */}
            <section className="v2-section v2-section-alt text-center">
                <Link
                    href="/landing/week"
                    className="v2-btn v2-btn-primary v2-btn-lg"
                >
                    ← Back to Week Landing
                </Link>
            </section>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="v2-modal-overlay"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="v2-modal"
                        >
                            <h2 className="v2-modal-title">Modal Title</h2>
                            <p className="v2-modal-body">
                                This is the modal body content. It matches the Week landing page aesthetic with
                                subtle backgrounds and clean typography.
                            </p>
                            <div className="v2-modal-actions">
                                <button
                                    className="v2-btn v2-btn-ghost"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="v2-btn v2-btn-primary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="v2-toast v2-toast-success"
                    >
                        ✓ Changes saved successfully
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
