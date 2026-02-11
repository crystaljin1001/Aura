/**
 * QuickPeek component - Server Component
 * Container for Impact Cards with loading/error/empty states
 */

import { hasGitHubToken } from '../api/actions';
import { getUserRepositories } from '../api/repository-actions';
import { PatTokenForm } from './PatTokenForm';
import { RepositoryManager } from './RepositoryManager';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

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

  // For now, just show connected repositories without fetching impact data
  // TODO: Implement impact data fetching later
  return (
    <section className="w-full py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Your Impact Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Connected repositories ready to track
          </p>
        </div>

        {/* Connected Repositories */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Connected Repositories</h3>
              <Link
                href="/repositories"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Manage
              </Link>
            </div>
            <ul className="space-y-3">
              {reposResult.data.map((repo) => (
                <li
                  key={`${repo.owner}/${repo.repo}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="text-2xl">📊</div>
                  <div className="flex-1">
                    <a
                      href={`https://github.com/${repo.owner}/${repo.repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                    >
                      {repo.owner}/{repo.repo}
                    </a>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Ready to track impact metrics
                    </p>
                  </div>
                  <div className="text-green-600 dark:text-green-400">
                    ✓ Connected
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                💡 Impact metrics will be displayed here soon! We&apos;re currently
                setting up the data pipeline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
