'use client';

/**
 * GitHub Personal Access Token input form
 * Glassmorphism card with Linear-style form inputs
 */

import { useState } from 'react';
import { storeGitHubToken } from '../api/actions';

export function PatTokenForm() {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await storeGitHubToken(token);

      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Token saved. Refreshing...',
        });
        setToken('');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to save token',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass-card p-8">
      <h2 className="text-xl font-semibold text-foreground tracking-tight mb-1">
        Connect GitHub
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        Add your Personal Access Token to surface project impact metrics.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="github-token"
            className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2"
          >
            Personal Access Token
          </label>
          <input
            id="github-token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            disabled={isLoading}
            required
            className="w-full px-4 py-3 bg-muted border border-border rounded-lg font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Encrypted and stored securely. Used only to fetch repository data.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full px-6 py-3 bg-foreground text-background font-medium text-sm rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Token'}
        </button>

        {message && (
          <div
            className={`p-4 rounded-lg border text-sm ${
              message.type === 'success'
                ? 'border-success/30 bg-success/5 text-success'
                : 'border-destructive/30 bg-destructive/5 text-destructive'
            }`}
          >
            {message.text}
          </div>
        )}
      </form>

      <div className="mt-8 p-4 rounded-lg border border-border bg-muted/50">
        <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
          How to create a token
        </h3>
        <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside leading-relaxed">
          <li>{'Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)'}</li>
          <li>Click &quot;Generate new token (classic)&quot;</li>
          <li>{'Give it a name and select the "repo" scope'}</li>
          <li>Click &quot;Generate token&quot; and copy it</li>
          <li>Paste it above</li>
        </ol>
      </div>
    </div>
  );
}
