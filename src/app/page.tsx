import { QuickPeek } from '@/features/impact-engine/components/QuickPeek';
import { Hero } from '@/components/layout/Hero';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
    </Link>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border backdrop-blur-xl bg-background/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <Link
            href="/"
            className="text-sm font-semibold text-foreground tracking-tight"
          >
            Builder&apos;s OS
          </Link>

          {user ? (
            <div className="flex items-center gap-6">
              <NavLink href="/repositories">Repositories</NavLink>
              <NavLink href="/storyboard">Storyboard</NavLink>
              <div className="h-4 w-px bg-border" />
              <span className="text-xs font-mono text-muted-foreground">
                {user.email}
              </span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/auth"
              className="px-4 py-1.5 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Portfolio Dashboard (authenticated) */}
      <QuickPeek />

      {/* Hero Section for unauthenticated visitors */}
      {!user && (
        <section className="py-32 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">
              A developer portfolio platform
            </p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground text-balance leading-[1.1]">
              Ship. Measure.
              <br />
              <span className="text-muted-foreground">Prove it.</span>
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
      )}

      {/* Spacer for authenticated users */}
      {user && <div className="pb-16" />}
    </div>
  );
}
