import { StoryboardForm } from '@/features/narrative-storyboarder/components/StoryboardForm';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function StoryboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border backdrop-blur-xl bg-background/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <Link
            href="/"
            className="text-sm font-semibold text-foreground tracking-tight"
          >
            Aura
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/repositories"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Repositories
            </Link>
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
        </div>
      </nav>

      {/* Header */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Narrative Engine
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              Storyboarder
            </h1>
            <p className="text-base text-muted-foreground max-w-xl">
              Transform your project README into a compelling video demo script.
              AI-powered, narrative-driven, and ready to record.
            </p>
          </div>

          <StoryboardForm />
        </div>
      </section>
    </div>
  );
}
