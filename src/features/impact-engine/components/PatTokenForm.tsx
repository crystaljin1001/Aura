'use client';

/**
 * GitHub Personal Access Token input form
 * Allows users to securely store their GitHub PAT
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
          text: 'GitHub token saved successfully! Refreshing page...',
        });
        setToken('');
        // Refresh the page to show impact data
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
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2">Connect Your GitHub</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Add your GitHub Personal Access Token to display your project impact
        metrics.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="github-token"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            GitHub Personal Access Token
          </label>
          <input
            id="github-token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            disabled={isLoading}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Your token is encrypted and stored securely. We only use it to fetch
            your repository data.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Token'}
        </button>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
      </form>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
          How to create a GitHub token:
        </h3>
        <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
          <li>Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)</li>
          <li>Click &quot;Generate new token (classic)&quot;</li>
          <li>Give it a name and select &quot;repo&quot; scope</li>
          <li>Click &quot;Generate token&quot; and copy it</li>
          <li>Paste it here</li>
        </ol>
      </div>
    </div>
  );
}
