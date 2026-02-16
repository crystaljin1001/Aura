import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Film, Wand2, Video } from 'lucide-react';
import Link from 'next/link';

export function StoryboardSection() {
  return (
    <section id="storyboard" className="py-24 px-4 bg-gradient-to-b from-background via-blue-950/5 to-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-muted-foreground">AI-Powered</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
              Transform your README into{' '}
              <span className="gradient-text">demo scripts</span>
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              The Storyboard feature reads your project's README and generates a compelling
              video demo script. AI-powered, narrative-driven, and ready to record.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Film className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Auto-generate Scripts</h3>
                  <p className="text-sm text-muted-foreground">
                    Select any repository and automatically fetch its README to create a structured demo script.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Wand2 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">AI-Powered Narrative</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI analyzes your project's features and creates engaging, professional demo narration.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Video className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Ready to Record</h3>
                  <p className="text-sm text-muted-foreground">
                    Get a complete script with scenes, timing, and narrative flow - perfect for creating product demos.
                  </p>
                </div>
              </div>
            </div>

            <Link href="/storyboard">
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 group">
                Try Storyboard
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Right: Visual Demo */}
          <div className="relative">
            <div className="glass-card-glow p-8">
              <div className="space-y-4">
                {/* Mock script preview */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Film className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Demo Script</h3>
                    <p className="text-sm text-muted-foreground">AI-generated from README</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { scene: 'Scene 1', title: 'Introduction', duration: '15s' },
                    { scene: 'Scene 2', title: 'Key Features', duration: '30s' },
                    { scene: 'Scene 3', title: 'Live Demo', duration: '45s' },
                    { scene: 'Scene 4', title: 'Call to Action', duration: '10s' },
                  ].map((item, idx) => (
                    <div key={idx} className="glass-card p-4 hover:bg-glass-hover transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-foreground">{item.scene}</span>
                        <span className="text-xs text-muted-foreground font-mono">{item.duration}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.title}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Duration</span>
                    <span className="text-foreground font-mono font-semibold">1m 40s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 glass-card p-3 animate-float">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-foreground">AI-Powered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
