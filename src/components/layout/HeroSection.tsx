'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowDown, Download, Github, Linkedin, Twitter, Star, Package } from 'lucide-react';
import { decodeHtmlEntities } from '@/lib/utils/html';
import type { UserProfile } from '@/features/user-profile/types';

interface HeroSectionProps {
  profile: UserProfile | null;
  githubStars: number;
  productsShipped: number;
}

export function HeroSection({ profile, githubStars, productsShipped }: HeroSectionProps) {
  const titles = ['Product Engineer', 'Full-Stack Builder', 'Open Source Creator', 'Solo Founder'];
  const [currentTitle, setCurrentTitle] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitle((prev) => (prev + 1) % titles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [titles.length]);

  const displayName = profile?.fullName || 'Your Name';
  const firstName = displayName.split(' ')[0];
  const bio = profile?.bio || 'I build products that solve real problems. From concept to deployment, I ship fast and iterate faster.';
  const avatarUrl = profile?.avatarUrl;
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const availabilityColor =
    profile?.availabilityStatus === 'unavailable' ? 'bg-gray-400' : 'bg-emerald-400';
  const availabilityText =
    profile?.availabilityStatus === 'available'
      ? 'Available for opportunities'
      : profile?.availabilityStatus === 'open_to_opportunities'
      ? 'Open to opportunities'
      : 'Not currently looking';

  const formatNumber = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

  return (
    <section className="min-h-screen flex items-center pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto w-full">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* ── Left: Content ── */}
          <div className="order-2 lg:order-1 space-y-6">
            {/* Availability pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card">
              <span className={`w-2 h-2 rounded-full ${availabilityColor} animate-pulse`} />
              <span className="text-xs font-medium text-muted-foreground">{availabilityText}</span>
            </div>

            {/* Name */}
            <div>
              <p className="text-sm font-mono text-muted-foreground mb-2 tracking-widest uppercase">
                Hello, world
              </p>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
                I&apos;m{' '}
                <span className="gradient-text">{firstName}</span>
              </h1>
            </div>

            {/* Animated title */}
            <div className="h-9 overflow-hidden">
              <p
                key={currentTitle}
                className="text-xl md:text-2xl text-muted-foreground font-light animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                {profile?.jobTitle || titles[currentTitle]}
              </p>
            </div>

            {/* Bio */}
            <p className="text-base text-muted-foreground leading-relaxed max-w-md whitespace-pre-wrap">
              {decodeHtmlEntities(bio)}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 group" asChild>
                <a href="#products" className="flex items-center">
                  View My Work
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              {profile?.cvUrl && (
                <Button size="lg" variant="outline" className="border-border hover:bg-glass-hover" asChild>
                  <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Download CV
                  </a>
                </Button>
              )}
            </div>

            {/* Social links */}
            <div className="flex items-center gap-5 pt-1">
              {profile?.githubUsername && (
                <a
                  href={`https://github.com/${profile.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}
              {profile?.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
              {profile?.twitterUsername && (
                <a
                  href={`https://twitter.com/${profile.twitterUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
              )}
            </div>
          </div>

          {/* ── Right: Avatar card ── */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative">
              {/* Glow rings */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-cyan-500/20 blur-2xl scale-110" />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-xl scale-105" />

              {/* Avatar */}
              <div className="relative w-72 h-72 md:w-[340px] md:h-[340px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-500/10">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                    <span className="text-5xl font-bold text-white/60">{initials}</span>
                  </div>
                )}
                {/* Subtle inner glow overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
              </div>

              {/* Stat: Products Shipped */}
              <div className="absolute -bottom-5 -left-6 glass-card border border-white/10 px-4 py-3 rounded-2xl animate-float shadow-xl shadow-black/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Package className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground leading-none">{productsShipped}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Products Shipped</p>
                  </div>
                </div>
              </div>

              {/* Stat: GitHub Stars */}
              <div className="absolute -top-5 -right-6 glass-card border border-white/10 px-4 py-3 rounded-2xl animate-float-delayed shadow-xl shadow-black/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground leading-none">{formatNumber(githubStars)}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">GitHub Stars</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center mt-20">
          <a
            href="#products"
            className="flex flex-col items-center gap-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors animate-float"
          >
            <span className="text-[11px] font-mono uppercase tracking-widest">Scroll</span>
            <ArrowDown className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
