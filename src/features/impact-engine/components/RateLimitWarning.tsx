/**
 * Rate Limit Warning component
 * Minimal warning banner with glassmorphism styling
 */

import { getRateLimitStatus } from '../api/actions';

export async function RateLimitWarning() {
  const result = await getRateLimitStatus();

  if (!result.success || !result.data || !result.data.isWarning) {
    return null;
  }

  const { remaining, resetAt } = result.data;
  const resetTime = new Date(resetAt).toLocaleTimeString();

  return (
    <div className="glass-card p-4 border-amber-500/20">
      <div className="flex items-center gap-3">
        <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
        <div className="flex-1">
          <p className="text-sm text-foreground">
            <strong className="font-mono">{remaining}</strong>{' '}
            <span className="text-muted-foreground">
              API requests remaining. Resets at{' '}
            </span>
            <strong className="font-mono">{resetTime}</strong>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Impact data is cached for 24h to minimize API usage.
          </p>
        </div>
      </div>
    </div>
  );
}
