import { QuickPeek } from '@/features/impact-engine/components/QuickPeek';
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

      {/* Impact Engine Dashboard */}
      <QuickPeek />

      {/* Hero Section - shown for all users, serves as the brand anchor */}
      {!user && (
        <section className="py-32 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">
              For builders who ship
            </p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground text-balance leading-[1.1]">
              Your code.
              <br />
              <span className="text-muted-foreground">Quantified.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              A high-signal portfolio that transforms your GitHub activity into
              compelling proof of work. No fluff, just impact.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth"
                className="px-8 py-3 bg-foreground text-background font-medium text-sm rounded-lg hover:bg-foreground/90 transition-colors"
              >
                Get Started
              </Link>
              <a
                href="#about"
                className="px-8 py-3 border border-border text-foreground font-medium text-sm rounded-lg hover:bg-glass-hover transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Spacer for authenticated users */}
      {user && <div className="pb-16" />}
    </div>
  );
}
