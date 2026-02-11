import { StoryboardForm } from '@/features/narrative-storyboarder/components/StoryboardForm';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function StoryboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to auth if not signed in
  if (!user) {
    redirect('/auth');
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Navigation */}
      <nav className="py-4 px-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold hover:text-blue-600">
            Builder&apos;s OS
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Dashboard
            </Link>
            <Link
              href="/repositories"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Repositories
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
        </div>
      </nav>

      {/* Header */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            🎬 Narrative Storyboarder
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Transform your project README into a compelling video demo script.
            AI-powered, narrative-driven, and ready to record.
          </p>
        </div>

        {/* Storyboard Form */}
        <StoryboardForm />
      </section>
    </div>
  );
}
