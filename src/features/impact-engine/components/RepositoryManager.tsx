'use client';

/**
 * Repository Manager Component
 * Glassmorphism-styled repository management with Linear aesthetics
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
      const parsed = parseGitHubUrl(inputValue.trim());

      if (!parsed) {
        setMessage({
          type: 'error',
          text: 'Invalid format. Use "owner/repo" or a GitHub URL.',
        });
        setIsLoading(false);
        return;
      }

      const result = await addRepository(parsed.owner, parsed.repo);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Added ${parsed.owner}/${parsed.repo}`,
        });
        setInputValue('');
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
    <div className="w-full max-w-4xl mx-auto glass-card p-8">
      <h2 className="text-xl font-semibold text-foreground tracking-tight mb-1">
        Manage Repositories
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        Add repositories you want to track on your Impact Dashboard.
      </p>

      {/* Add Repository Form */}
      <form onSubmit={handleAdd} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="owner/repo or https://github.com/owner/repo"
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-muted border border-border rounded-lg font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-6 py-3 bg-foreground text-background font-medium text-sm rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {isLoading ? 'Adding...' : 'Add'}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground font-mono">
          {'e.g. crystaljin1001/Maestro or https://github.com/crystaljin1001/Maestro'}
        </p>
      </form>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border text-sm ${
            message.type === 'success'
              ? 'border-success/30 bg-success/5 text-success'
              : 'border-destructive/30 bg-destructive/5 text-destructive'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Repository List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Your Repositories
          </h3>
          <span className="text-xs font-mono text-muted-foreground">
            {repositories.length}/10
          </span>
        </div>

        {isLoadingList ? (
          <div className="flex items-center gap-2 py-8 justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" />
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:150ms]" />
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:300ms]" />
          </div>
        ) : repositories.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No repositories yet. Add one above to get started.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {repositories.map((repo) => (
              <li
                key={`${repo.owner}/${repo.repo}`}
                className="flex items-center justify-between py-3 group"
              >
                <a
                  href={`https://github.com/${repo.owner}/${repo.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-foreground hover:text-accent transition-colors"
                >
                  {repo.owner}/{repo.repo}
                </a>
                <button
                  onClick={() => handleRemove(repo.owner, repo.repo)}
                  className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
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
