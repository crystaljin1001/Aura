'use client';

/**
 * Repository Manager Component
 * Allows users to add and remove repositories they want to track
 */

import { useState, useEffect } from 'react';
import {
  addRepository,
  removeRepository,
  getUserRepositories,
} from '../api/repository-actions';
import { parseGitHubUrl } from '@/lib/validations/impact-engine';

interface Repository {
  owner: string;
  repo: string;
}

export function RepositoryManager() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Load repositories on mount
  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    setIsLoadingList(true);
    const result = await getUserRepositories();
    if (result.success && result.data) {
      setRepositories(result.data);
    }
    setIsLoadingList(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Parse the input (supports URLs or owner/repo format)
      const parsed = parseGitHubUrl(inputValue.trim());

      if (!parsed) {
        setMessage({
          type: 'error',
          text: 'Invalid format. Use "owner/repo" or GitHub URL',
        });
        setIsLoading(false);
        return;
      }

      // Add repository
      const result = await addRepository(parsed.owner, parsed.repo);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Added ${parsed.owner}/${parsed.repo}`,
        });
        setInputValue('');
        // Reload list and refresh page to show new data
        await loadRepositories();
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to add repository',
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

  const handleRemove = async (owner: string, repo: string) => {
    if (!confirm(`Remove ${owner}/${repo}?`)) return;

    const result = await removeRepository(owner, repo);

    if (result.success) {
      setMessage({
        type: 'success',
        text: `Removed ${owner}/${repo}`,
      });
      // Reload list and refresh page
      await loadRepositories();
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setMessage({
        type: 'error',
        text: result.error || 'Failed to remove repository',
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2">Manage Repositories</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Add repositories you want to track on your Impact Dashboard
      </p>

      {/* Add Repository Form */}
      <form onSubmit={handleAdd} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="owner/repo or https://github.com/owner/repo"
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Adding...' : 'Add'}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Examples: crystaljin1001/Maestro or
          https://github.com/crystaljin1001/Maestro
        </p>
      </form>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Repository List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Your Repositories ({repositories.length}/10)
        </h3>

        {isLoadingList ? (
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : repositories.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">
            No repositories added yet. Add one above to get started!
          </p>
        ) : (
          <ul className="space-y-2">
            {repositories.map((repo) => (
              <li
                key={`${repo.owner}/${repo.repo}`}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <a
                  href={`https://github.com/${repo.owner}/${repo.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  {repo.owner}/{repo.repo}
                </a>
                <button
                  onClick={() => handleRemove(repo.owner, repo.repo)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
