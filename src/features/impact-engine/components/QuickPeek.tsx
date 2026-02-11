/**
 * QuickPeek component - Server Component
 * Container for Impact Cards with loading/error/empty states
 */

import { hasGitHubToken, getImpactData } from '../api/actions';
import { ImpactCard } from './ImpactCard';
import { PatTokenForm } from './PatTokenForm';
import { RateLimitWarning } from './RateLimitWarning';
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

  // Fetch impact data
  // For now, we'll fetch for a default repository or allow configuration
  // You can modify this to fetch multiple repos or make it configurable
  const impactResult = await getImpactData([
    // Example: fetch your own repository
    // { owner: 'yourusername', repo: 'yourrepo' },
  ]);

  // Handle error state
  if (!impactResult.success || !impactResult.data) {
    return (
      <section className="w-full py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
              Unable to Load Impact Data
            </h3>
            <p className="text-yellow-800 dark:text-yellow-300">
              {impactResult.error ||
                'Please configure your repositories to display impact metrics.'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Get all metrics from all repositories
  const allMetrics = impactResult.data.flatMap((repo) => repo.metrics);

  // If no metrics, show empty state
  if (allMetrics.length === 0) {
    return (
      <section className="w-full py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Your Impact Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              No impact metrics found yet. Add repositories to track your
              contributions.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Your Impact Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time metrics from your GitHub repositories
          </p>
        </div>

        {/* Rate Limit Warning */}
        <RateLimitWarning />

        {/* Impact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {allMetrics.map((metric) => (
            <ImpactCard key={metric.id} metric={metric} />
          ))}
        </div>

        {/* Repository Info */}
        {impactResult.data.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Last updated:{' '}
            {new Date(
              impactResult.data[0].lastUpdated
            ).toLocaleString()}
          </div>
        )}
      </div>
    </section>
  );
}
