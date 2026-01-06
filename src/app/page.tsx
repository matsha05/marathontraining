"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";

/**
 * THE LONG GAME - Landing Page
 * 
 * V2 Design System - 100% token usage
 * Elite-level: Zero hardcoded colors
 */

// Animation ease curve - typed for Framer Motion
const ease = [0.25, 0.46, 0.45, 0.94] as const;

// Coach color tokens - semantic mapping
const coachColors = {
  hansons: 'var(--v2-secondary)',      // Blue
  higdon: '#ec4899',                   // Pink - TODO: add to tokens
  pfitzinger: '#06b6d4',               // Cyan
  fitzgerald: '#a855f7',               // Purple
  magness: '#f472b6',                  // Light pink
  daniels: 'var(--v2-accent)',         // Green
  seiler: '#f59e0b',                   // Amber
  dicharry: 'var(--v2-durability)',    // Purple
  starrett: '#14b8a6',                 // Teal
  storen: 'var(--v2-error)',           // Red
  engine: '#fbbf24',                   // Gold
  ingebrigtsen: '#0ea5e9',             // Sky blue
};

export default function LandingPage() {
  return (
    <div className="v2-root min-h-screen" style={{ background: 'var(--v2-bg-deep)', color: 'var(--v2-text-primary)' }}>
      <SiteHeader />

      {/* Hero - Big text + Week preview with animations */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Subtle radial glow behind content */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(800px circle at 50% 55%, var(--v2-accent-glow) 0%, transparent 60%)' }}
        />

        <div className="text-center w-full max-w-4xl relative z-10">
          {/* Big title - staggered */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease }}
            className="text-5xl md:text-7xl font-light mb-4 tracking-tight"
            style={{ color: 'var(--v2-text-primary)' }}
          >
            The Long Game
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease }}
            className="text-lg mb-12"
            style={{ color: 'var(--v2-text-subtle)' }}
          >
            Training, structured.
          </motion.p>

          {/* Week Grid - staggered with subtle delay - horizontally scrollable on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease }}
            className="max-w-3xl mx-auto mb-12"
          >
            <p className="text-xs mb-4 font-mono" style={{ color: 'var(--v2-text-ghost)' }}>
              Week 8 · Build Phase · 42 miles
            </p>
            {/* Scroll container for mobile */}
            <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              <div className="grid grid-cols-7 gap-2 min-w-[560px] md:min-w-0">
                {[
                  { day: "M", type: "run", label: "5mi Easy", sub: "8:32/mi", strength: true },
                  { day: "T", type: "run", label: "6×800m", sub: "VO2", strength: false },
                  { day: "W", type: "rest", label: "Rest", sub: "", strength: false },
                  { day: "T", type: "run", label: "6mi Tempo", sub: "7:15/mi", strength: true },
                  { day: "F", type: "run", label: "4mi Easy", sub: "8:45/mi", strength: false },
                  { day: "S", type: "run", label: "5mi Easy", sub: "8:32/mi", strength: false },
                  { day: "S", type: "long", label: "14mi Long", sub: "8:45/mi", strength: false },
                ].map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + (i * 0.05), duration: 0.4, ease }}
                    className="p-4 rounded-lg text-center transition-all duration-200"
                    style={{
                      background: d.type === "long"
                        ? 'var(--v2-accent-subtle)'
                        : d.type === "rest"
                          ? 'var(--v2-bg-elevated)'
                          : 'var(--v2-bg-hover)',
                    }}
                  >
                    <p className="text-[10px] mb-3" style={{ color: 'var(--v2-text-subtle)' }}>{d.day}</p>
                    <p
                      className="text-sm mb-1 whitespace-nowrap"
                      style={{ color: d.type === "rest" ? 'var(--v2-text-ghost)' : 'var(--v2-text-secondary)' }}
                    >
                      {d.label}
                    </p>
                    {d.sub && (
                      <p className="text-[10px] font-mono" style={{ color: 'var(--v2-text-subtle)' }}>{d.sub}</p>
                    )}
                    {d.strength && (
                      <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--v2-border)' }}>
                        <p className="text-[10px]" style={{ color: 'var(--v2-secondary)' }}>+ Strength</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CTA - last to animate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5, ease }}
          >
            <Link href="/onboarding" className="v2-btn v2-btn-primary">
              Get Started
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--v2-text-ghost)' }}>Scroll</p>
        </motion.div>
      </section>

      {/* === RUNNING SCIENCE — PLAN STRUCTURE === */}
      <section className="px-6 py-24" style={{ background: 'var(--v2-bg-section)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--v2-text-muted)' }}>Running Science</p>
          <h2 className="text-4xl md:text-5xl font-light mb-4" style={{ color: 'var(--v2-text-primary)' }}>Evidence-based training</h2>
          <p className="text-lg" style={{ color: 'var(--v2-text-muted)' }}>7 methodologies. We'll match you with the right one during setup.</p>
        </div>
      </section>

      {/* Hansons */}
      <CoachSection
        color={coachColors.hansons}
        name="Hansons"
        tag="Cumulative Fatigue"
        description="Six days a week. Train on tired legs, race on fresh ones. 16-mile long run cap — because the cumulative week matters more than any single run."
        bestFor="Experienced runners, 6 days available, high mileage tolerance"
      >
        <div className="v2-card p-4">
          <div className="grid grid-cols-7 gap-2 text-center">
            {["Easy", "Speed", "Rest", "Tempo", "Easy", "Easy", "Long"].map((day, i) => (
              <div key={i}>
                <p className="text-[10px] mb-1" style={{ color: 'var(--v2-text-subtle)' }}>{["M", "T", "W", "T", "F", "S", "S"][i]}</p>
                <p
                  className="text-xs"
                  style={{
                    color: day === "Rest"
                      ? 'var(--v2-text-ghost)'
                      : day === "Long"
                        ? coachColors.hansons
                        : 'var(--v2-text-tertiary)'
                  }}
                >
                  {day}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CoachSection>

      {/* Higdon */}
      <CoachSection
        color={coachColors.higdon}
        name="Hal Higdon"
        tag="Accessibility"
        description="The most trusted name in marathon training. Gradual progression, more rest days, longer long runs (20+ miles). Programs for every level, from first-timer to PR-chaser."
        bestFor="First-timers, 4-5 days available, gradual build"
      >
        <div className="grid grid-cols-3 gap-3">
          {[
            { level: "Novice", sub: "First marathon" },
            { level: "Intermediate", sub: "Building fitness" },
            { level: "Advanced", sub: "Chasing PRs" },
          ].map((p) => (
            <div key={p.level} className="v2-card p-4 text-center">
              <p className="text-lg font-light" style={{ color: 'var(--v2-text-tertiary)' }}>{p.level}</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--v2-text-subtle)' }}>{p.sub}</p>
            </div>
          ))}
        </div>
      </CoachSection>

      {/* Pfitzinger */}
      <CoachSection
        color={coachColors.pfitzinger}
        name="Pete Pfitzinger"
        tag="Advanced Marathoning"
        description="High mileage with precision. Lactate threshold is king. Programs from 55 to 85+ miles/week for runners ready to commit. The gold standard for competitive marathoners."
        bestFor="Competitive runners, high mileage history, PR-focused"
      >
        <div className="flex gap-3">
          {[
            { range: "55-70", unit: "mi/week" },
            { range: "70-85", unit: "mi/week" },
            { range: "85+", unit: "mi/week" },
          ].map((p) => (
            <div key={p.range} className="flex-1 v2-card p-4 text-center">
              <p className="text-lg font-mono" style={{ color: 'var(--v2-text-tertiary)' }}>{p.range}</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--v2-text-subtle)' }}>{p.unit}</p>
            </div>
          ))}
        </div>
      </CoachSection>

      {/* Matt Fitzgerald */}
      <CoachSection
        color={coachColors.fitzgerald}
        name="Matt Fitzgerald"
        tag="80/20 Running"
        description="Practical application of polarized training for everyday runners. Takes Seiler's research and makes it actionable with clear intensity guidelines."
        bestFor="Runners wanting science-backed intensity distribution"
      >
        <PolarizedBar />
      </CoachSection>

      {/* Steve Magness */}
      <CoachSection
        color={coachColors.magness}
        name="Steve Magness"
        tag="Science of Running"
        description="Bridges the gap between what coaches have known works and what scientists have proven. 4:01 high school miler, Nike Oregon Project assistant, evidence-based coaching."
        bestFor="Runners who want modern, individualized training"
      >
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Philosophy", value: "Coach the person" },
            { label: "Method", value: "Not the system" },
          ].map((p) => (
            <div key={p.label} className="v2-card p-4 text-center">
              <p className="text-sm mb-1" style={{ color: 'var(--v2-text-muted)' }}>{p.label}</p>
              <p style={{ color: 'var(--v2-text-tertiary)' }}>{p.value}</p>
            </div>
          ))}
        </div>
      </CoachSection>

      {/* Foundation section */}
      <section className="px-6 py-24" style={{ background: 'var(--v2-bg-section)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--v2-text-muted)' }}>The Foundation</p>
          <h2 className="text-4xl md:text-5xl font-light mb-4" style={{ color: 'var(--v2-text-primary)' }}>Built on every plan</h2>
          <p className="text-lg" style={{ color: 'var(--v2-text-muted)' }}>These apply to every training philosophy.</p>
        </div>
      </section>

      {/* Daniels - Paces */}
      <CoachSection
        color={coachColors.daniels}
        name="Jack Daniels"
        tag="Paces"
        description="Your paces aren't guesses. They're calculated from VDOT — a metric derived from your race performance that predicts equivalent performances across distances and prescribes training intensities."
      >
        <div className="grid md:grid-cols-4 gap-3">
          {[
            { zone: "Easy", pace: "8:25–8:55" },
            { zone: "Threshold", pace: "7:21" },
            { zone: "Interval", pace: "6:45" },
            { zone: "Marathon", pace: "8:01" },
          ].map((p) => (
            <div key={p.zone} className="v2-card p-3 text-center">
              <p className="text-sm mb-1" style={{ color: 'var(--v2-text-muted)' }}>{p.zone}</p>
              <p className="font-mono" style={{ color: 'var(--v2-text-secondary)' }}>{p.pace}</p>
            </div>
          ))}
        </div>
      </CoachSection>

      {/* Seiler - Intensity */}
      <CoachSection
        color={coachColors.seiler}
        name="Stephen Seiler"
        tag="Intensity"
        description="80/20 polarized. Elite endurance athletes spend 80% of training at low intensity, 20% high. The 'moderate' gray zone is avoided — too hard to recover from, too easy to drive adaptation."
      >
        <PolarizedBar />
      </CoachSection>

      {/* Dicharry - Durability */}
      <CoachSection
        color={coachColors.dicharry}
        name="Jay Dicharry"
        tag="Durability"
        description="Running Rewired. 12 movement standards that address the most common limiters in runners. Pre-hab over rehab. Build a body that can handle the training load, not just survive it."
        bestFor="12 movement standards · Daily routines"
      >
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--v2-bg-hover)' }}
            >
              <span className="text-[10px]" style={{ color: 'var(--v2-text-subtle)' }}>{i + 1}</span>
            </div>
          ))}
        </div>
      </CoachSection>

      {/* Starrett - Mobility */}
      <CoachSection
        color={coachColors.starrett}
        name="Kelly Starrett"
        tag="Mobility"
        description="Becoming a Supple Leopard. Systematic mobility work that restores range of motion, tissue quality, and motor control. The foundation that lets you train hard without breaking down."
      >
        <div className="flex gap-4">
          {[
            { label: "Before", value: "Prep & Activation" },
            { label: "After", value: "Recovery & Reset" },
          ].map((p) => (
            <div key={p.label} className="flex-1 v2-card p-4 text-center">
              <p className="text-sm mb-1" style={{ color: 'var(--v2-text-muted)' }}>{p.label}</p>
              <p style={{ color: 'var(--v2-text-tertiary)' }}>{p.value}</p>
            </div>
          ))}
        </div>
      </CoachSection>

      {/* Strength section */}
      <section className="px-6 py-24" style={{ background: 'var(--v2-bg-section)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--v2-text-muted)' }}>Strength Training</p>
          <h2 className="text-4xl md:text-5xl font-light mb-4" style={{ color: 'var(--v2-text-primary)' }}>Lift to run faster</h2>
          <p className="text-lg" style={{ color: 'var(--v2-text-muted)' }}>Runner-specific strength programming proven to improve economy.</p>
        </div>
      </section>

      {/* Støren - Strength */}
      <CoachSection
        color={coachColors.storen}
        name="Øyvind Støren"
        tag="Max Strength Research"
        description="Heavy strength improves running economy. Research shows 4×4 half-squats at 4RM, 3x/week improves economy by 5%. Scheduled strategically — never before key sessions."
      >
        <div className="flex gap-4">
          {[
            { value: "4×4", label: "protocol" },
            { value: "5%", label: "economy gain" },
          ].map((p) => (
            <div key={p.value} className="flex-1 v2-card p-4 text-center">
              <p className="text-2xl font-light" style={{ color: 'var(--v2-text-tertiary)' }}>{p.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--v2-text-subtle)' }}>{p.label}</p>
            </div>
          ))}
        </div>
      </CoachSection>

      {/* The Long Game Strength Engine */}
      <CoachSection
        color={coachColors.engine}
        name="The Long Game Strength Engine"
        tag="Integrated System"
        description="24 runner-friendly WODs with Rx/Scaled/Beginner tiers. Phase-appropriate scheduling: heavy in base, maintain in peak, protect in taper. We never schedule leg-heavy work before your long run."
        bestFor="24 WODs · 6 research sources · Phase-aware scheduling"
      >
        <div className="grid grid-cols-4 gap-2">
          {[
            { phase: "Base", action: "Build strength" },
            { phase: "Build", action: "Convert power" },
            { phase: "Peak", action: "Maintain" },
            { phase: "Taper", action: "Protect" },
          ].map((p) => (
            <div key={p.phase} className="v2-card p-3 text-center">
              <p className="text-sm" style={{ color: 'var(--v2-text-tertiary)' }}>{p.phase}</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--v2-text-subtle)' }}>{p.action}</p>
            </div>
          ))}
        </div>
      </CoachSection>

      {/* Elite section */}
      <section className="px-6 py-24" style={{ background: 'var(--v2-bg-section)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--v2-text-muted)' }}>Elite Methods</p>
          <h2 className="text-4xl md:text-5xl font-light mb-4" style={{ color: 'var(--v2-text-primary)' }}>World-class training</h2>
          <p className="text-lg" style={{ color: 'var(--v2-text-muted)' }}>Methods from Olympic and World Championship programs.</p>
        </div>
      </section>

      {/* Gjert Ingebrigtsen */}
      <CoachSection
        color={coachColors.ingebrigtsen}
        name="Gjert Ingebrigtsen"
        tag="Norwegian Method"
        description="The method behind the Ingebrigtsen brothers (Olympic and World Champions). Double threshold: two lactate-guided sessions in one day. Precise intensity via lactate monitoring at 2.5-3.5 mmol/L."
        bestFor="Elite-level athletes ready for high volume threshold work"
      >
        <div className="flex gap-4">
          {[
            { value: "2×", label: "threshold/day" },
            { value: "3", label: "Olympic sons" },
          ].map((p) => (
            <div key={p.value} className="flex-1 v2-card p-4 text-center">
              <p className="text-2xl font-light" style={{ color: 'var(--v2-text-tertiary)' }}>{p.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--v2-text-subtle)' }}>{p.label}</p>
            </div>
          ))}
        </div>
      </CoachSection>

      {/* Final CTA */}
      <section className="px-6 py-24" style={{ background: 'var(--v2-bg-section)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--v2-text-muted)' }}>Any Distance</p>
          <h2 className="text-4xl md:text-5xl font-light mb-4" style={{ color: 'var(--v2-text-primary)' }}>Base building to 50K.</h2>
          <p className="text-lg mb-8" style={{ color: 'var(--v2-text-muted)' }}>
            Race on the calendar or just building fitness. We'll meet you where you are.
          </p>
          <Link href="/onboarding" className="v2-btn v2-btn-primary v2-btn-lg">
            Get Started
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// =============================================================================
// REUSABLE COMPONENTS
// =============================================================================

function CoachSection({
  color,
  name,
  tag,
  description,
  bestFor,
  children,
}: {
  color: string;
  name: string;
  tag: string;
  description: string;
  bestFor?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="px-6 py-20" style={{ borderTop: '1px solid var(--v2-border)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <h2 className="text-2xl font-light" style={{ color: 'var(--v2-text-primary)' }}>{name}</h2>
          <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--v2-text-subtle)' }}>{tag}</span>
        </div>
        <p className="mb-6 leading-relaxed" style={{ color: 'var(--v2-text-tertiary)' }}>
          {description}
        </p>
        {children}
        {bestFor && (
          <p className="text-xs mt-3" style={{ color: 'var(--v2-text-ghost)' }}>Best for: {bestFor}</p>
        )}
      </div>
    </section>
  );
}

function PolarizedBar() {
  return (
    <div className="flex gap-2">
      <div
        className="flex-[80] h-10 rounded-lg flex items-center justify-center"
        style={{ background: 'var(--v2-accent-subtle)' }}
      >
        <span className="text-sm" style={{ color: 'var(--v2-accent-muted)' }}>80% Easy</span>
      </div>
      <div
        className="flex-[20] h-10 rounded-lg flex items-center justify-center"
        style={{ background: 'rgba(239, 68, 68, 0.1)' }}
      >
        <span className="text-xs" style={{ color: 'rgba(239, 68, 68, 0.8)' }}>20% Hard</span>
      </div>
    </div>
  );
}
