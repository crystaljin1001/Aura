'use client';

/**
 * Storyboard Form Component
 * Form for inputting project README to generate video script
 */

import { useState, useEffect } from 'react';
import { generateScript } from '../api/actions';
import { fetchReadmeFromGitHub } from '../api/github-actions';
import { getUserRepositories } from '@/features/impact-engine/api/repository-actions';
import { ScriptDisplay } from './ScriptDisplay';
import type { NarrativeScript } from '../types';
import type { RepoIdentifier } from '@/lib/validations/impact-engine';

interface StoryboardFormProps {
  preSelectedRepo?: string
  onComplete?: () => void
}

export function StoryboardForm({ preSelectedRepo, onComplete }: StoryboardFormProps = {}) {
  const [repositories, setRepositories] = useState<RepoIdentifier[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>(preSelectedRepo || '');
  const [projectName, setProjectName] = useState('');
  const [readmeContent, setReadmeContent] = useState('');
  const [isFetchingReadme, setIsFetchingReadme] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<NarrativeScript | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchedFrom, setFetchedFrom] = useState<string | null>(null);

  // Load user's repositories on mount
  useEffect(() => {
    loadRepositories();
  }, []);

  // Auto-fetch README if preSelectedRepo is provided
  useEffect(() => {
    if (preSelectedRepo && !readmeContent) {
      handleFetchReadme();
    }
  }, [preSelectedRepo]);

  const loadRepositories = async () => {
    const result = await getUserRepositories();
    if (result.success && result.data) {
      setRepositories(result.data);
    }
  };

  const handleFetchReadme = async () => {
    if (!selectedRepo) return;

    setIsFetchingReadme(true);
    setError(null);
    setFetchedFrom(null);

    try {
      const [owner, repo] = selectedRepo.split('/');
      const result = await fetchReadmeFromGitHub(owner, repo);

      if (result.success && result.data) {
        setReadmeContent(result.data);
        setProjectName(repo); // Auto-fill project name
        setFetchedFrom(selectedRepo);
      } else {
        setError(result.error || 'Failed to fetch README');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsFetchingReadme(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setGeneratedScript(null);

    try {
      const result = await generateScript(projectName, readmeContent, selectedRepo || preSelectedRepo);

      if (result.success && result.data) {
        setGeneratedScript(result.data);
        // Don't auto-close - let user read and close manually
      } else {
        setError(result.error || 'Failed to generate script');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setGeneratedScript(null);
    setError(null);
  };

  // If script is generated, show it
  if (generatedScript) {
    return (
      <div>
        <ScriptDisplay script={generatedScript} projectName={projectName} />
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => {
              if (onComplete) {
                onComplete();
              }
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Done
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Generate Another Script
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          Create Your Video Demo Script
        </h2>
        <p className="text-muted-foreground mb-6">
          Select a connected repository to fetch its README, or write your own.
          Then generate a professionally structured video script.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Repository Selector */}
          {repositories.length > 0 && (
            <div>
              <label
                htmlFor="repository"
                className="block text-sm font-medium text-foreground mb-2"
              >
                📂 Select Repository (Optional)
              </label>
              <div className="flex gap-2">
                <select
                  id="repository"
                  value={selectedRepo}
                  onChange={(e) => setSelectedRepo(e.target.value)}
                  disabled={isFetchingReadme || isGenerating}
                  className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground disabled:opacity-50"
                >
                  <option value="">-- Choose a repository --</option>
                  {repositories.map((repo) => (
                    <option
                      key={`${repo.owner}/${repo.repo}`}
                      value={`${repo.owner}/${repo.repo}`}
                    >
                      {repo.owner}/{repo.repo}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleFetchReadme}
                  disabled={!selectedRepo || isFetchingReadme || isGenerating}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isFetchingReadme ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Fetching...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Fetch README
                    </>
                  )}
                </button>
              </div>
              {fetchedFrom && (
                <p className="mt-2 text-sm text-green-400">
                  ✓ Fetched from {fetchedFrom} - You can edit it below before
                  generating
                </p>
              )}
            </div>
          )}

          {/* Project Name */}
          <div>
            <label
              htmlFor="projectName"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Project Name *
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Aura - Builder's OS"
              disabled={isGenerating}
              required
              maxLength={200}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* README Content */}
          <div>
            <label
              htmlFor="readmeContent"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Project README *
            </label>
            <textarea
              id="readmeContent"
              value={readmeContent}
              onChange={(e) => setReadmeContent(e.target.value)}
              placeholder="Fetch from a repository above, or paste your project README here..."
              disabled={isGenerating}
              required
              minLength={50}
              maxLength={10000}
              rows={12}
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              {readmeContent.length}/10,000 characters • Minimum 50 characters
              {fetchedFrom && ' • Editable'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isGenerating || !projectName || readmeContent.length < 50}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating Script with AI...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Generate Video Script
              </>
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-900/20 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-200 mb-2">
            💡 How it works:
          </h3>
          <ul className="text-sm text-blue-300 space-y-1 list-disc list-inside">
            <li>Select a connected repository to auto-fetch its README</li>
            <li>Edit the README if needed before generating</li>
            <li>AI analyzes your README using GPT-4o-mini</li>
            <li>Generates a 2.5-3.5 minute structured script</li>
            <li>Follows proven Context → Problem → Process → Outcome narrative</li>
            <li>Ready to use with Tella, Arcade, or any recording tool</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
