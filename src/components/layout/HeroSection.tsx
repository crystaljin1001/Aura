'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Download, Github, Linkedin, Twitter, Star, CheckCircle2 } from 'lucide-react';
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitle((prev) => (prev + 1) % titles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [titles.length]);

  // Use profile data or fallback to defaults
  const displayName = profile?.fullName || 'Your Name';
  const firstName = displayName.split(' ')[0];
  const bio = profile?.bio || 'I build products that solve real problems. From concept to deployment, I ship fast and iterate faster. Currently focused on developer tools and productivity apps.';
  const avatarUrl = profile?.avatarUrl;
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Availability status
  const availabilityText = profile?.availabilityStatus === 'available'
    ? 'Available for opportunities'
    : profile?.availabilityStatus === 'open_to_opportunities'
    ? 'Open to opportunities'
    : 'Not currently looking';

  const availabilityColor = profile?.availabilityStatus === 'unavailable'
    ? 'bg-gray-400'
    : 'bg-emerald-400';

  // Format stats
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <section className="min-h-screen flex items-center pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card mb-6">
              <span className={`w-2 h-2 rounded-full ${availabilityColor} animate-pulse`} />
              <span className="text-xs font-medium text-muted-foreground">{availabilityText}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-4">
              Hi, I&apos;m{' '}
              <span className="gradient-text">{firstName}</span>
            </h1>

            <div className="h-8 mb-6">
              <span className="text-xl md:text-2xl text-muted-foreground font-light">
                {profile?.jobTitle || titles[currentTitle]}
              </span>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg whitespace-pre-wrap">
              {decodeHtmlEntities(bio)}
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 group">
                <a href="#products" className="flex items-center">
                  View My Work
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              {profile?.cvUrl ? (
                <Button size="lg" variant="outline" className="border-border hover:bg-glass-hover">
                  <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Download CV
                  </a>
                </Button>
              ) : null}
            </div>

            <div className="flex items-center gap-6">
              {profile?.githubUsername && (
                <a
                  href={`https://github.com/${profile.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
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
                  <span>LinkedIn</span>
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
                  <span>Twitter</span>
                </a>
              )}
            </div>
          </div>

          {/* Right: Profile Card */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden glass-card-glow">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={displayName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-4xl font-bold text-white">{initials}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{displayName}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Stats */}
              <div className="absolute -bottom-4 -left-4 glass-card p-4 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{productsShipped}</p>
                    <p className="text-xs text-muted-foreground">Products Shipped</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 glass-card p-4 animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{formatNumber(githubStars)}</p>
                    <p className="text-xs text-muted-foreground">GitHub Stars</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
