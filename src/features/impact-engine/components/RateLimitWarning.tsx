/**
 * Rate Limit Warning component
 * Displays warning banner when GitHub API rate limit is low
 */

import { getRateLimitStatus } from '../api/actions';

export async function RateLimitWarning() {
  const result = await getRateLimitStatus();

  // Don't show if there's an error or no warning needed
  if (!result.success || !result.data || !result.data.isWarning) {
    return null;
  }

  const { remaining, resetAt } = result.data;
  const resetTime = new Date(resetAt).toLocaleTimeString();

  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-1">
            GitHub API Rate Limit Warning
          </h3>
          <p className="text-sm text-orange-800 dark:text-orange-300">
            You have <strong>{remaining}</strong> API requests remaining. The
            limit resets at <strong>{resetTime}</strong>.
          </p>
          <p className="text-xs text-orange-700 dark:text-orange-400 mt-2">
            Impact data is cached for 24 hours to minimize API usage.
          </p>
        </div>
      </div>
    </div>
  );
}
