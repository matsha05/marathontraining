"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { Badge } from "@/components/ui/Badge";
import { Metric } from "@/components/ui/Metric";
import { colors } from "@/lib/design-tokens";

/**
 * THE LONG GAME - Landing Page
 * 
 * V3 Design System - Uses centralized design-tokens.ts
 * Logged-in users stay here but see "Dashboard" in the header nav.
 * No forced redirects - better UX to let users choose their path.
 */

// Animation ease curve - typed for Framer Motion
const ease = [0.25, 0.46, 0.45, 0.94] as const;

// Coach color tokens - using design system variables
const coachColors = {
  hansons: 'var(--color-coach-hansons)',
  higdon: 'var(--color-coach-higdon)',
  pfitzinger: 'var(--color-coach-pfitzinger)',
  fitzgerald: 'var(--color-coach-fitzgerald)',
  magness: 'var(--color-coach-magness)',
  daniels: 'var(--color-coach-daniels)',
  seiler: 'var(--color-coach-seiler)',
  dicharry: 'var(--color-coach-dicharry)',
  starrett: 'var(--color-coach-starrett)',
  storen: 'var(--color-coach-storen)',
  engine: 'var(--color-coach-engine)',
  ingebrigtsen: 'var(--color-coach-ingebrigtsen)',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-base)' }}>
      <SiteHeader />

      {/* Hero - Big text + Week preview with animations */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Subtle radial glow behind content */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(800px circle at 50% 55%, color-mix(in srgb, var(--color-accent) 4%, transparent) 0%, transparent 60%)' }}
        />

        <div className="text-center w-full max-w-4xl relative z-10">
          {/* Big title - staggered */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease }}
            className="text-5xl md:text-7xl font-light mb-4 tracking-tight"
            style={{ color: 'var(--text-base)' }}
          >
            The Long Game
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease }}
            className="text-lg mb-12"
            style={{ color: 'var(--text-muted)' }}
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
            <p className="text-xs mb-4 font-mono" style={{ color: 'var(--text-subtle)' }}>
              Week 8 · Build Phase · 42 miles
            </p>
            {/* Grid with padding to accommodate hover scale */}
            <div className="grid grid-cols-7 gap-1 py-2 px-1">
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
                  className="p-4 rounded-xl text-center"
                  style={{
                    background: d.type === "long"
                      ? 'color-mix(in srgb, var(--color-accent) 12%, transparent)'
                      : d.type === "rest"
                        ? 'var(--bg-elevated)'
                        : 'var(--bg-muted)',
                  }}
                  whileHover={{
                    scale: 1.03,
                    y: -4,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                >
                  <p className="text-[10px] mb-3" style={{ color: 'var(--text-subtle)' }}>{d.day}</p>
                  <p
                    className="text-sm mb-1 whitespace-nowrap"
                    style={{ color: d.type === "rest" ? 'var(--text-subtle)' : 'var(--text-muted)' }}
                  >
                    {d.label}
                  </p>
                  {d.sub && (
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-subtle)' }}>{d.sub}</p>
                  )}
                  {d.strength && (
                    <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border-base)' }}>
                      <p className="text-[10px]" style={{ color: 'var(--color-strength)' }}>+ Strength</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA - last to animate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5, ease }}
          >
            <Link href="/onboarding" className="v3-btn v3-btn-primary">
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
          <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-subtle)' }}>Scroll</p>
        </motion.div>
      </section>

      {/* === RUNNING SCIENCE — PLAN STRUCTURE === */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Running Science</p>
          <h2 className="text-4xl md:text-5xl font-light mb-4" style={{ color: 'var(--text-base)' }}>Evidence-based training</h2>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>7 methodologies. We'll match you with the right one during setup.</p>
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
        <div className="v3-card p-4">
          <div className="grid grid-cols-7 gap-2 text-center">
            {["Easy", "Speed", "Rest", "Tempo", "Easy", "Easy", "Long"].map((day, i) => (
              <div key={i}>
                <p className="text-[10px] mb-1" style={{ color: 'var(--text-subtle)' }}>{["M", "T", "W", "T", "F", "S", "S"][i]}</p>
                <p
                  className="text-xs"
                  style={{
                    color: day === "Rest"
                      ? 'var(--text-subtle)'
                      : day === "Long"
                        ? coachColors.hansons
                        : 'var(--text-muted)'
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
            <div key={p.level} className="v3-card p-4 text-center">
              <p className="text-lg font-light" style={{ color: 'var(--text-muted)' }}>{p.level}</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-subtle)' }}>{p.sub}</p>
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
            <div key={p.range} className="flex-1 v3-card p-4 text-center">
              <p className="text-lg font-mono" style={{ color: 'var(--text-muted)' }}>{p.range}</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-subtle)' }}>{p.unit}</p>
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
            <div key={p.label} className="v3-card p-4 text-center">
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{p.label}</p>
              <p style={{ color: 'var(--text-muted)' }}>{p.value}</p>
            </div>
          ))}
        </div>
      </CoachSection>

      {/* Foundation section */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>The Foundation</p>
          <h2 className="text-4xl md:text-5xl font-light mb-4" style={{ color: 'var(--text-base)' }}>Built on every plan</h2>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>These apply to every training philosophy.</p>
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
            <div key={p.zone} className="v3-card p-3 text-center">
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{p.zone}</p>
              <p className="font-mono" style={{ color: 'var(--text-muted)' }}>{p.pace}</p>
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
          {[
            { id: 1, name: "Toe Yoga", tooltip: "Can you raise your big toe while keeping others down? Tests foot control and arch stability." },
            { id: 2, name: "Balance", tooltip: "45 seconds single-leg stance, barefoot, eyes open. Tests proprioception and stability." },
            { id: 3, name: "Squat", tooltip: "Full-depth squat, heels down, knees tracking over toes. Tests hip, ankle, and thoracic mobility." },
            { id: 4, name: "Ankle DF", tooltip: "Knee-to-wall test: 4+ inches from wall. Tests ankle dorsiflexion for proper running mechanics." },
            { id: 5, name: "Hallux DF", tooltip: "Big toe mobility: 50-70° of extension. Essential for push-off power and preventing plantar issues." },
            { id: 6, name: "Calf Raise", tooltip: "20+ single-leg calf raises per side. Tests Achilles capacity and calf endurance." },
            { id: 7, name: "SL Bridge", tooltip: "10-second single-leg bridge hold, hips level. Tests glute strength and hip stability." },
            { id: 8, name: "Hip Flexor", tooltip: "Doorway test: can you extend your hip without arching your back? Tests hip extension mobility." },
            { id: 9, name: "Hip Flexion", tooltip: "Knee to chest while opposite leg stays flat. Tests hip flexion range for proper leg swing." },
            { id: 10, name: "Rotation", tooltip: "Thoracic spine rotation: 45°+ each way. Essential for arm swing and preventing low back compensation." },
            { id: 11, name: "Core Ctrl", tooltip: "Can you maintain neutral spine under load? Tests deep core stabilizers, not six-pack muscles." },
            { id: 12, name: "SL Hop", tooltip: "Single-leg hop and stick the landing. Integration test: foot, hip, and core working together." },
          ].map((standard) => (
            <div
              key={standard.id}
              className="group relative h-10 rounded-lg flex items-center justify-center transition-all hover:bg-[var(--bg-elevated)]"
              style={{ background: 'var(--bg-muted)' }}
            >
              <span className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>{standard.id}</span>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 w-48 text-center"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-base)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-base)' }}>{standard.name}</p>
                <p className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>{standard.tooltip}</p>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 -mt-1" style={{ background: 'var(--bg-elevated)', borderRight: '1px solid var(--border-base)', borderBottom: '1px solid var(--border-base)' }} />
              </div>
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
            {
              label: "Before",
              value: "Prep & Activation",
              tooltip: "10-15 min routine: Deep squat hold (2 min), couch stretch (90s each side), ankle knee-to-wall (10 reps each side), leg swings, A-skips. Checks your squat depth, hip extension, and ankle mobility before you run."
            },
            {
              label: "After",
              value: "Recovery & Reset",
              tooltip: "5-10 min routine: Foam roll calves and quads (2 min each), lacrosse ball glutes if hotspots present, pigeon stretch (90s each side). Compression socks post-hard sessions. Address tissue restrictions same-day."
            },
          ].map((p) => (
            <div key={p.label} className="group relative flex-1 v3-card p-4 text-center transition-all hover:border-[var(--color-coach-starrett)]">
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{p.label}</p>
              <p style={{ color: 'var(--text-muted)' }}>{p.value}</p>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 w-64 text-center"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-base)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{p.tooltip}</p>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 -mt-1" style={{ background: 'var(--bg-elevated)', borderRight: '1px solid var(--border-base)', borderBottom: '1px solid var(--border-base)' }} />
              </div>
            </div>
          ))}
        </div>
      </CoachSection>

      {/* Strength section */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Strength Training</p>
          <h2 className="text-4xl md:text-5xl font-light mb-4" style={{ color: 'var(--text-base)' }}>Lift to run faster</h2>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>Runner-specific strength programming proven to improve economy.</p>
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
            <div key={p.value} className="flex-1 v3-card p-4 text-center">
              <p className="text-2xl font-light" style={{ color: 'var(--text-muted)' }}>{p.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-subtle)' }}>{p.label}</p>
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
            <div key={p.phase} className="v3-card p-3 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{p.phase}</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-subtle)' }}>{p.action}</p>
            </div>
          ))}
        </div>
      </CoachSection>

      {/* Elite section */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Elite Methods</p>
          <h2 className="text-4xl md:text-5xl font-light mb-4" style={{ color: 'var(--text-base)' }}>World-class training</h2>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>Methods from Olympic and World Championship programs.</p>
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
            <div key={p.value} className="flex-1 v3-card p-4 text-center">
              <p className="text-2xl font-light" style={{ color: 'var(--text-muted)' }}>{p.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-subtle)' }}>{p.label}</p>
            </div>
          ))}
        </div>
      </CoachSection>

      {/* Final CTA */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Any Distance</p>
          <h2 className="text-4xl md:text-5xl font-light mb-4" style={{ color: 'var(--text-base)' }}>Base building to 50K.</h2>
          <p className="text-lg mb-8" style={{ color: 'var(--text-muted)' }}>
            Race on the calendar or just building fitness. We'll meet you where you are.
          </p>
          <Link href="/onboarding" className="v3-btn v3-btn-primary v3-btn-lg">
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
    <section className="px-6 py-20" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <h2 className="text-2xl font-light" style={{ color: 'var(--text-base)' }}>{name}</h2>
          <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>{tag}</span>
        </div>
        <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
        {children}
        {bestFor && (
          <p className="text-xs mt-3" style={{ color: 'var(--text-subtle)' }}>Best for: {bestFor}</p>
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
        style={{ background: 'var(--color-accent-subtle)' }}
      >
        <span className="text-sm" style={{ color: 'var(--color-accent-muted)' }}>80% Easy</span>
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
