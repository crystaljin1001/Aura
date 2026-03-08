import { ArrowRight, Github, Linkedin, Twitter, Mail } from 'lucide-react';
import Link from 'next/link';

export function ContactSection() {
  return (
    <section id="contact" className="py-28 px-4 relative">
      {/* Subtle section separator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent via-border to-transparent" />

      <div className="max-w-3xl mx-auto">
        <div className="glass-card-glow rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
          {/* Background gradient accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

          <div className="relative">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
              Get in Touch
            </p>

            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-5 leading-tight">
              Let&apos;s build something{' '}
              <span className="gradient-text">together</span>
            </h2>

            <p className="text-base text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
              Open to new opportunities, collaborations, and interesting conversations.
              Reach out — I respond to every message.
            </p>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors group"
              >
                <Mail className="w-4 h-4" />
                Send a Message
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground/50 font-mono">or find me on</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Social icons */}
            <div className="flex items-center justify-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl glass-card flex items-center justify-center hover:bg-glass-hover transition-colors hover:border-white/20 group"
              >
                <Github className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl glass-card flex items-center justify-center hover:bg-glass-hover transition-colors hover:border-white/20 group"
              >
                <Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl glass-card flex items-center justify-center hover:bg-glass-hover transition-colors hover:border-white/20 group"
              >
                <Twitter className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
