import { RepositoryManager } from '@/features/impact-engine/components/RepositoryManager';
import { PatTokenForm } from '@/features/impact-engine/components/PatTokenForm';
import { RepositoryDiagnostic } from '@/features/impact-engine/components/RepositoryDiagnostic';
import { RefreshImpactButton } from '@/features/impact-engine/components/RefreshImpactButton';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function RepositoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

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
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/storyboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Storyboard
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

      {/* Repository Manager */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  Settings
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Repositories
                </h1>
              </div>
              <RefreshImpactButton />
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Refresh impact data to update README lengths and repository metrics
            </p>
          </div>

          {/* GitHub Token Form */}
          <div className="mb-12">
            <PatTokenForm />
          </div>

          {/* Repository List */}
          <RepositoryManager />

          {/* Diagnostic Tool */}
          <div className="mt-12">
            <RepositoryDiagnostic />
          </div>
        </div>
      </section>
    </div>
  );
}
