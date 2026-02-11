/**
 * QuickPeek component - Server Component
 * Container for Impact Cards with loading/error/empty states
 */

import { hasGitHubToken } from '../api/actions';
import { getUserRepositories } from '../api/repository-actions';
import { PatTokenForm } from './PatTokenForm';
import { RepositoryManager } from './RepositoryManager';
import { RepositoryBentoGrid } from './RepositoryBentoGrid';
import { createClient } from '@/lib/supabase/server';

export async function QuickPeek() {
  // Check if user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not authenticated, don't show anything
  if (!user) {
    return null;
  }

  // Check if user has a GitHub token
  const tokenResult = await hasGitHubToken();
  const hasToken = tokenResult.data;

  // If no token, show the token form
  if (!hasToken) {
    return (
      <section className="w-full py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Your Impact Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your GitHub account to showcase your project impact
            </p>
          </div>
          <PatTokenForm />
        </div>
      </section>
    );
  }

  // Get user's repositories from database
  const reposResult = await getUserRepositories();

  // If no repositories configured, show repository manager
  if (!reposResult.success || !reposResult.data || reposResult.data.length === 0) {
    return (
      <section className="w-full py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Your Impact Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Add repositories to start tracking your impact
            </p>
          </div>
          <RepositoryManager />
        </div>
      </section>
    );
  }

  // Show Bento Grid with connected repositories
  return (
    <section className="w-full py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Impact Dashboard
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Track your projects&apos; impact at a glance
          </p>
        </div>

        {/* Bento Grid */}
        <RepositoryBentoGrid repositories={reposResult.data} />
      </div>
    </section>
  );
}
