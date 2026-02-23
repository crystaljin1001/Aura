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
import type { NarrativeScript, ScriptType } from '../types';
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
  const [scriptType, setScriptType] = useState<ScriptType>('user_journey');
  const [isFetchingReadme, setIsFetchingReadme] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<NarrativeScript | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchedFrom, setFetchedFrom] = useState<string | null>(null);
  const [showReadmeEditor, setShowReadmeEditor] = useState(false);

  // Load user's repositories on mount
  useEffect(() => {
    loadRepositories();
  }, []);

  // Auto-fetch README if preSelectedRepo is provided (coming from project card)
  useEffect(() => {
    if (preSelectedRepo && !readmeContent) {
      // Auto-fetch README in background
      handleFetchReadme();
      // Don't show README editor by default when coming from project card
      setShowReadmeEditor(false);
    } else if (!preSelectedRepo) {
      // Show README editor if not coming from project card
      setShowReadmeEditor(true);
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
      const result = await generateScript(projectName, readmeContent, selectedRepo || preSelectedRepo, scriptType);

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
          {preSelectedRepo ? 'Generate Demo Scripts' : 'Create Your Video Demo Script'}
        </h2>
        <p className="text-muted-foreground mb-6">
          {preSelectedRepo ? (
            <>
              Choose between <strong>User Journey</strong> (outcome-focused) or <strong>Technical Architecture</strong> (technical deep-dive) demo.
              README and commit history will be analyzed automatically.
            </>
          ) : (
            <>
              Choose between <strong>User Journey</strong> (outcome-focused) or <strong>Technical Architecture</strong> (technical deep-dive) demo.
              Select a repository to fetch its README, then generate a chaptered narrative with visual cues.
            </>
          )}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Display - Show if pre-selected */}
          {preSelectedRepo && (
            <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg">📂</span>
                <div>
                  <p className="font-semibold text-foreground">{preSelectedRepo}</p>
                  <p className="text-xs text-muted-foreground">
                    {isFetchingReadme ? 'Loading README and project data...' : 'README loaded • Commit history fetched'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Repository Selector - Only show if not pre-selected */}
          {!preSelectedRepo && repositories.length > 0 && (
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

          {/* Demo Type Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              🎬 Choose Demo Type *
            </label>
            <div className="space-y-3">
              {/* User Journey Option */}
              <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                scriptType === 'user_journey'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-border hover:border-blue-500/50 bg-background'
              }`}>
                <input
                  type="radio"
                  name="scriptType"
                  value="user_journey"
                  checked={scriptType === 'user_journey'}
                  onChange={(e) => setScriptType(e.target.value as ScriptType)}
                  disabled={isGenerating}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="font-semibold text-foreground">
                    📖 User Journey Demo
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Outcome-focused narrative showing value through user success.
                    Chapters: The Friction → The Social Brain → The Discovery → The Resolution.
                    Perfect for showcasing AI impact and user wins.
                  </div>
                </div>
              </label>

              {/* Technical Architecture Option */}
              <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                scriptType === 'technical_architecture'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-border hover:border-purple-500/50 bg-background'
              }`}>
                <input
                  type="radio"
                  name="scriptType"
                  value="technical_architecture"
                  checked={scriptType === 'technical_architecture'}
                  onChange={(e) => setScriptType(e.target.value as ScriptType)}
                  disabled={isGenerating}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="font-semibold text-foreground">
                    🏗️ Technical Architecture Demo
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Technical deep-dive with structural constraints.
                    Chapters: Context → The Logic Gate → The Execution → The Moat.
                    Perfect for showcasing engineering decisions and technical depth.
                  </div>
                </div>
              </label>
            </div>
          </div>

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

          {/* README Content - Collapsible if auto-fetched */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="readmeContent"
                className="block text-sm font-medium text-foreground"
              >
                Project README *
                {fetchedFrom && <span className="ml-2 text-xs text-green-400">✓ Auto-fetched</span>}
              </label>
              {preSelectedRepo && fetchedFrom && (
                <button
                  type="button"
                  onClick={() => setShowReadmeEditor(!showReadmeEditor)}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  {showReadmeEditor ? '▼ Hide README' : '▶ View/Edit README'}
                </button>
              )}
            </div>

            {showReadmeEditor && (
              <>
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
                  {fetchedFrom && ' • You can edit before generating'}
                </p>
              </>
            )}

            {!showReadmeEditor && preSelectedRepo && fetchedFrom && (
              <div className="p-3 bg-green-900/20 border border-green-800 rounded-lg text-sm text-green-200">
                README loaded from {fetchedFrom} ({readmeContent.length} characters).
                AI will also use commit history and Logic Map data.
              </div>
            )}
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
            <li>Choose your demo type: <strong>User Journey</strong> (value-focused) or <strong>Technical Architecture</strong> (engineering-focused)</li>
            <li>Select a connected repository to auto-fetch its README</li>
            <li>AI analyzes your README, commit history, and Logic Map using GPT-4o-mini with specialized prompts</li>
            <li>Generates a 3-5 minute chaptered narrative with visual cues</li>
            <li><strong>User Journey</strong>: Shows AI impact through user success stories</li>
            <li><strong>Technical Architecture</strong>: Deep-dive into decisions, trade-offs, and engineering depth</li>
            <li>Ready to use with Tella, Arcade, or any recording tool</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
