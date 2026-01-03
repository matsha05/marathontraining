"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { COACHES } from '@/config/coach-spec/methodology';
import { ActivityIcon } from '@/components/ui/activity';
import { ChartLineIcon } from '@/components/ui/chart-line';
import { CalendarDaysIcon } from '@/components/ui/calendar-days';
import { HeartIcon } from '@/components/ui/heart';
import { FlameIcon } from '@/components/ui/flame';
import { CheckIcon } from '@/components/ui/check';
import { ArrowRightIcon } from '@/components/ui/arrow-right';
import { SiteHeader } from '@/components/ui/SiteHeader';
import { Footer } from '@/components/ui/Footer';

/**
 * THE LONG GAME - Landing Page
 * 
 * Athletic, data-forward, premium
 */

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen landing-shell flex flex-col">
      {/* Header */}
      <SiteHeader isDark={isDark} onToggleTheme={toggleTheme} />

      {/* Hero */}
      <section className="hero-section hero-surface">
        <div className="container-page">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <p className="text-label text-[var(--color-accent)] mb-4 flex items-center gap-2">
                <ActivityIcon size={14} />
                PRECISION TRAINING
              </p>

              <h1 className="text-display-xl mb-6">
                A daily plan you can<br />
                <span className="gradient-text">actually trust.</span>
              </h1>

              <p className="text-body-lg text-[var(--text-muted)] mb-10 max-w-2xl">
                Running, strength, mobility—all in one place. Every pace calculated from your race time.
                Every workout based on science from coaches who've trained world-class athletes.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/onboarding" className="btn btn-gradient btn-lg group">
                  Build Your Plan
                  <ArrowRightIcon size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="#methodology" className="btn btn-secondary btn-lg">
                  See the Science
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="hero-visual">
                <div className="hero-visual-inner">
                  <div className="flex items-center justify-between">
                    <p className="text-label">Today</p>
                    <span className="metric-chip">Week 3 · Build Phase</span>
                  </div>
                  <div>
                    <p className="text-display-md text-data">8.2 mi</p>
                    <p className="text-body-sm text-[var(--text-muted)]">
                      Tempo @ 6:45/mi · 60 min total
                    </p>
                  </div>
                  <div className="signal-line" />
                  <div className="stat-grid">
                    <div className="hero-visual-card">
                      <p className="text-label mb-1">Weekly Load</p>
                      <p className="text-heading-md text-data">32.4 mi</p>
                      <p className="text-caption">+6% vs last week</p>
                    </div>
                    <div className="hero-visual-card">
                      <p className="text-label mb-1">Durability</p>
                      <p className="text-heading-md text-data">92%</p>
                      <p className="text-caption">Movement readiness</p>
                    </div>
                  </div>
                  <div className="hero-visual-card">
                    <div className="flex items-center justify-between">
                      <p className="text-label">Next Up</p>
                      <span className="text-caption text-[var(--color-strength)]">Strength</span>
                    </div>
                    <p className="text-body-md">Posterior chain + core stability</p>
                    <p className="text-caption">45 min · No equipment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="section-tight section-contrast">
        <div className="container-page">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: CalendarDaysIcon, label: 'Daily Plan', desc: 'Know exactly what to do' },
              { icon: ChartLineIcon, label: 'VDOT Paces', desc: 'Calculated from your race' },
              { icon: HeartIcon, label: 'Garmin Sync', desc: 'Adapts to your recovery' },
              { icon: FlameIcon, label: 'Stay Strong', desc: 'Strength training built in' },
            ].map((item, i) => (
              <div key={item.label} className="card p-5 text-center md:text-left animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto md:mx-0 mb-4">
                  <item.icon size={24} className="text-[var(--color-accent)]" />
                </div>
                <p className="text-heading-sm mb-1">{item.label}</p>
                <p className="text-caption">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="section">
        <div className="container-page">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-label mb-3 text-[var(--text-subtle)]">THE PROBLEM</p>
              <h2 className="text-display-md mb-6">
                Plans don't talk to each other.
              </h2>
              <p className="text-body-lg text-[var(--text-muted)] mb-6">
                Running plans ignore strength. Strength plans ignore running. You end up guessing
                how to combine them, hoping the load adds up, and often getting injured.
              </p>
              <p className="text-body-md text-[var(--text-muted)]">
                Or worse—you drop lifting entirely and become "skinny runner."
              </p>
            </div>

            <div>
              <p className="text-label mb-3 text-[var(--color-accent)]">THE SOLUTION</p>
              <h2 className="text-display-md mb-6">
                One integrated plan.
              </h2>
              <ul className="space-y-4">
                {[
                  'Running is the priority—we build toward your race',
                  'Strength keeps you healthy (and not skinny)',
                  'Every workout is prescribed—no guessing',
                  'Every pace is calculated from YOUR race time',
                  'Syncs with Garmin to adjust for recovery',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckIcon size={20} className="text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                    <span className="text-body-md">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section id="methodology" className="section section-contrast">
        <div className="container-page">
          <p className="text-label mb-3">BUILT ON SCIENCE</p>
          <h2 className="text-display-md mb-4">
            Coaches who've trained<br />
            world-class athletes.
          </h2>
          <p className="text-body-lg text-[var(--text-muted)] mb-12 max-w-xl">
            We don't make this up. Every workout is rooted in proven methodologies.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['hansons', 'daniels', 'seiler', 'dicharry'].map((id) => {
              const coach = COACHES[id];
              return (
                <div key={id} className="card p-6 hover:border-[var(--color-accent)] transition-colors">
                  <p className="text-label text-[var(--color-accent)] mb-3">
                    {coach?.name.toUpperCase()}
                  </p>
                  <p className="text-heading-sm mb-2">{coach?.keyConceptShort}</p>
                  <p className="text-caption">{coach?.keyConceptFull?.split('—')[0]}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-page">
          <div className="cta-panel text-center">
            <h2 className="text-display-md mb-6">
              What do you do today?
            </h2>
            <p className="text-body-lg text-[var(--text-muted)] mb-10 max-w-lg mx-auto">
              Get your personalized plan in 2 minutes. See your paces. Start training.
            </p>
            <Link href="/onboarding" className="btn btn-gradient btn-lg group">
              Build Your Plan
              <ArrowRightIcon size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

