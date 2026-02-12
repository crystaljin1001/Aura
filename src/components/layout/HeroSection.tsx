'use client';

/**
 * HeroSection - Landing page hero with animated flipping words
 */

import Link from 'next/link';
import { FlippingWords } from '@/components/ui/flipping-words';

export function HeroSection() {
  const words = ['Prove it.', 'Build it.', 'Ship it.', 'Own it.'];

  return (
    <section className="py-32 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">
          A developer portfolio platform
        </p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground text-balance leading-[1.1]">
          Ship. Measure.
          <br />
          <span className="text-muted-foreground">
            <FlippingWords words={words} duration={2500} />
          </span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Turn your GitHub repositories into a high-signal portfolio.
          Each project becomes a product card with real impact metrics
          extracted from your commits, issues, and pull requests.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth"
            className="px-8 py-3 bg-foreground text-background font-medium text-sm rounded-lg hover:bg-foreground/90 transition-colors"
          >
            Get Started
          </Link>
          <a
            href="#how-it-works"
            className="px-8 py-3 border border-border text-foreground font-medium text-sm rounded-lg hover:bg-glass-hover transition-colors"
          >
            How it works
          </a>
        </div>

        {/* Value propositions */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="glass-card p-6">
            <span className="text-2xl font-mono font-bold text-blue-400 metric-glow">01</span>
            <h3 className="mt-3 text-sm font-semibold text-foreground">Connect</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Add your GitHub PAT and select the repositories you want to showcase.
            </p>
          </div>
          <div className="glass-card p-6">
            <span className="text-2xl font-mono font-bold text-cyan-400 metric-glow">02</span>
            <h3 className="mt-3 text-sm font-semibold text-foreground">Analyze</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              We scan issues, PRs, and metadata to compute five impact dimensions per project.
            </p>
          </div>
          <div className="glass-card p-6">
            <span className="text-2xl font-mono font-bold text-emerald-400 metric-glow">03</span>
            <h3 className="mt-3 text-sm font-semibold text-foreground">Present</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Each repo appears as a product card with prominent metrics. Your work, quantified.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
