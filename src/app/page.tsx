import { QuickPeek } from '@/features/impact-engine/components/QuickPeek';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { HeroSection } from '@/components/layout/HeroSection';

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
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border backdrop-blur-xl bg-background/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <Link
            href="/"
            className="text-sm font-semibold text-foreground tracking-tight"
          >
            Aura
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
      {!user && <HeroSection />}

      {/* Spacer for authenticated users */}
      {user && <div className="pb-16" />}
    </div>
  );
}
