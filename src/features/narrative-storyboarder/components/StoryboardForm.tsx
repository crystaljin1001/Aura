'use client';

/**
 * Storyboard Form Component
 * Form for inputting project README to generate video script
 */

import { useState, useEffect } from 'react';
import { generateScript } from '../api/actions';
import { fetchReadmeFromGitHub } from '../api/github-actions';
import { getUserRepositories } from '@/features/impact-engine/api/repository-actions';
import { generateAndSaveArchitectureDiagram, getArchitectureDiagram } from '@/features/projects/actions';
import { ScriptDisplay } from './ScriptDisplay';
import { MermaidPreview } from '@/components/ui/mermaid-preview';
import type { NarrativeScript, ScriptType } from '../types';
import type { RepoIdentifier } from '@/lib/validations/impact-engine';

interface StoryboardFormProps {
  preSelectedRepo?: string
  projectId?: string
  onComplete?: () => void
}

export function StoryboardForm({ preSelectedRepo, projectId, onComplete }: StoryboardFormProps = {}) {
  const [repositories, setRepositories] = useState<RepoIdentifier[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>(preSelectedRepo || '');
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(projectId);
  const [projectName, setProjectName] = useState('');
  const [readmeContent, setReadmeContent] = useState('');
  const [scriptType, setScriptType] = useState<ScriptType>('product_minded_engineer');
  const [isFetchingReadme, setIsFetchingReadme] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<NarrativeScript | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchedFrom, setFetchedFrom] = useState<string | null>(null);
  const [showReadmeEditor, setShowReadmeEditor] = useState(false);
  const [architectureDiagram, setArchitectureDiagram] = useState<{ mermaidCode: string; type: string } | null>(null);
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false);
  const [diagramError, setDiagramError] = useState<string | null>(null);
  const [diagramInstruction, setDiagramInstruction] = useState('');

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

  // Fetch project ID when selectedRepo changes (if not already provided)
  useEffect(() => {
    async function fetchProjectId() {
      if (!selectedRepo || projectId) return; // Skip if repo not selected or projectId already provided

      const [owner, repo] = selectedRepo.split('/');
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data } = await supabase
        .from('user_repositories')
        .select('id')
        .eq('repo_owner', owner)
        .eq('repo_name', repo)
        .single();

      if (data) {
        setCurrentProjectId(data.id);
      }
    }

    fetchProjectId();
  }, [selectedRepo, projectId]);

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
    setArchitectureDiagram(null);
    setDiagramError(null);
  };

  const handleGenerateDiagram = async () => {
    if (!currentProjectId) {
      setDiagramError('Project ID not found. Please select a repository first.');
      return;
    }

    setIsGeneratingDiagram(true);
    setDiagramError(null);

    try {
      const result = await generateAndSaveArchitectureDiagram(currentProjectId, diagramInstruction || undefined);

      if (result.success && result.data) {
        setArchitectureDiagram(result.data);
        setDiagramInstruction(''); // Clear instruction after successful generation
      } else {
        setDiagramError(result.error || 'Failed to generate diagram');
      }
    } catch (err) {
      setDiagramError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGeneratingDiagram(false);
    }
  };

  // Check for existing diagram when script is generated
  useEffect(() => {
    if (generatedScript && currentProjectId) {
      getArchitectureDiagram(currentProjectId).then((diagram) => {
        if (diagram) {
          setArchitectureDiagram(diagram);
        }
      });
    }
  }, [generatedScript, currentProjectId]);

  // If script is generated, show it
  if (generatedScript) {
    return (
      <div>
        <ScriptDisplay script={generatedScript} projectName={projectName} />

        {/* Architecture Diagram Section */}
        <div className="mt-8 border-t border-gray-700 pt-8">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span>📊</span>
            Architecture Diagram
            <span className="text-sm font-normal text-muted-foreground">(Optional - for video reference)</span>
          </h3>

          {!architectureDiagram && !isGeneratingDiagram && (
            <div className="rounded-lg border border-gray-700 bg-gray-900/30 p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Generate an AI-powered architecture diagram to help visualize your project structure during video recording.
              </p>
              <button
                onClick={handleGenerateDiagram}
                disabled={isGeneratingDiagram}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✨ Generate Architecture Diagram
              </button>
              {diagramError && (
                <p className="mt-3 text-sm text-red-400">{diagramError}</p>
              )}
            </div>
          )}

          {isGeneratingDiagram && (
            <div className="rounded-lg border border-gray-700 bg-gray-900/30 p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
              <p className="text-sm text-muted-foreground">
                Analyzing repository structure and generating diagram...
              </p>
            </div>
          )}

          {architectureDiagram && (
            <div className="space-y-4">
              <MermaidPreview mermaidCode={architectureDiagram.mermaidCode} />
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={diagramInstruction}
                    onChange={(e) => setDiagramInstruction(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isGeneratingDiagram) {
                        handleGenerateDiagram();
                      }
                    }}
                    placeholder="Missing something? Tell AI to update it..."
                    className="flex-1 px-4 py-2 text-sm bg-gray-800 border border-gray-600 text-gray-100 placeholder:text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isGeneratingDiagram}
                  />
                  <button
                    onClick={handleGenerateDiagram}
                    disabled={isGeneratingDiagram}
                    className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    🔄 Regenerate
                  </button>
                </div>
                {diagramInstruction && (
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Press Enter or click Regenerate to update the diagram
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => {
              // Warn if user has unsaved diagram instructions
              if (diagramInstruction.trim()) {
                const confirmed = window.confirm(
                  'You have unsaved diagram instructions. Close without regenerating?'
                );
                if (!confirmed) return;
              }

              if (onComplete) {
                onComplete();
              }
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Done - Ready to Record
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
          Generate Video Script
        </h2>
        <p className="text-muted-foreground mb-6">
          Create a unified <strong>Product-Minded Engineer</strong> demo that hooks HR recruiters in 10 seconds
          and impresses technical managers by minute two. README and commit history will be analyzed automatically.
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

          {/* Demo Framework Info */}
          <div className="p-4 border-2 border-blue-500 bg-blue-500/10 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div className="flex-1">
                <div className="font-semibold text-foreground text-lg mb-2">
                  Master Demo Framework (3 Minutes)
                </div>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    A 5-chapter pitch that follows the Steve Jobs flow: Problem → Solution → Architecture → Execution → Impact
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="text-xs">
                      <span className="font-semibold text-blue-300">Chapter I (0:00-0:30):</span> Business Problem
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold text-purple-300">Chapter II (0:30-1:30):</span> User Journey
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold text-cyan-300">Chapter III (1:30-2:00):</span> Pragmatic Architecture
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold text-green-300">Chapter IV (2:00-2:30):</span> Trade-off & Execution
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold text-orange-300">Chapter V (2:30-3:00):</span> Impact & Roadmap
                    </div>
                  </div>
                </div>
              </div>
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
            <li>Select a connected repository to auto-fetch its README</li>
            <li>AI analyzes your README, commit history, and Logic Map using GPT-4o-mini</li>
            <li>Generates a 3-minute Master Demo with 5 chapters</li>
            <li><strong>Chapter I</strong>: Business Problem (define the pain point)</li>
            <li><strong>Chapter II</strong>: User Journey (show the "Aha!" moment)</li>
            <li><strong>Chapter III</strong>: Pragmatic Architecture (explain stack choices)</li>
            <li><strong>Chapter IV</strong>: Trade-off & Execution (prove technical seniority)</li>
            <li><strong>Chapter V</strong>: Impact & Roadmap (hard metrics + next steps)</li>
            <li>Use Studio Mode to record with synchronized script and visuals</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
