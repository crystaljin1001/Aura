import { ArrowUpRight, Github, Linkedin, Twitter, Mail } from 'lucide-react';
import Link from 'next/link';
import type { UserProfile } from '@/features/user-profile/types';

interface ContactSectionProps {
  profile?: UserProfile | null;
}

export function ContactSection({ profile }: ContactSectionProps) {
  const links = [
    profile?.githubUsername && {
      icon: Github,
      label: 'GitHub',
      handle: `@${profile.githubUsername}`,
      href: `https://github.com/${profile.githubUsername}`,
      color: 'group-hover:text-white',
      bg: 'group-hover:bg-white/10',
    },
    profile?.linkedinUrl && {
      icon: Linkedin,
      label: 'LinkedIn',
      handle: profile.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, ''),
      href: profile.linkedinUrl,
      color: 'group-hover:text-blue-400',
      bg: 'group-hover:bg-blue-500/10',
    },
    profile?.twitterUsername && {
      icon: Twitter,
      label: 'Twitter',
      handle: `@${profile.twitterUsername}`,
      href: `https://twitter.com/${profile.twitterUsername}`,
      color: 'group-hover:text-sky-400',
      bg: 'group-hover:bg-sky-500/10',
    },
  ].filter(Boolean) as {
    icon: React.ElementType;
    label: string;
    handle: string;
    href: string;
    color: string;
    bg: string;
  }[];

  return (
    <section id="contact" className="py-28 px-4 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent via-border to-transparent" />

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: Copy ── */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-5">
              Contact
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              Open to{' '}
              <span className="gradient-text">new roles</span>
              <br />& collaborations
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-sm">
              Whether it&apos;s a full-time role, contract, or an interesting project — let&apos;s talk.
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors group"
            >
              <Mail className="w-4 h-4" />
              Send a Message
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* ── Right: Contact method cards ── */}
          <div className="space-y-3">
            {links.map(({ icon: Icon, label, handle, href, color, bg }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center justify-between px-5 py-4 rounded-2xl border border-border hover:border-white/20 transition-all duration-200 ${bg}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center transition-colors ${bg}`}>
                    <Icon className={`w-5 h-5 text-muted-foreground transition-colors ${color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">{label}</p>
                    <p className={`text-sm font-semibold text-foreground transition-colors ${color}`}>{handle}</p>
                  </div>
                </div>
                <ArrowUpRight className={`w-4 h-4 text-muted-foreground/40 transition-all ${color} group-hover:translate-x-0.5 group-hover:-translate-y-0.5`} />
              </a>
            ))}

            {/* Email fallback if no social links */}
            {links.length === 0 && (
              <Link
                href="/auth"
                className="group flex items-center justify-between px-5 py-4 rounded-2xl border border-border hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Email</p>
                    <p className="text-sm font-semibold text-foreground">Get in touch</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground/40" />
              </Link>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
