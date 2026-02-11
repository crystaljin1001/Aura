import { QuickPeek } from '@/features/impact-engine/components/QuickPeek';
import { Hero } from '@/components/layout/Hero';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 glass border-b-0 shadow-premium">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h2 className="text-xl font-bold">Builder&apos;s OS</h2>
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/repositories"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Repositories
              </Link>
              <Link
                href="/storyboard"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Storyboard
              </Link>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {user.email}
              </span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/auth"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section with Code-to-Impact Animation */}
      <Hero />

      {/* Impact Engine Dashboard - Only for authenticated users with repos */}
      <QuickPeek />
    </div>
  );
}
