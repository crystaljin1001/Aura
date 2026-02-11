'use client';

/**
 * Storyboard Form Component
 * Form for inputting project README to generate video script
 */

import { useState } from 'react';
import { generateScript } from '../api/actions';
import { ScriptDisplay } from './ScriptDisplay';
import type { NarrativeScript } from '../types';

export function StoryboardForm() {
  const [projectName, setProjectName] = useState('');
  const [readmeContent, setReadmeContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<NarrativeScript | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setGeneratedScript(null);

    try {
      const result = await generateScript(projectName, readmeContent);

      if (result.success && result.data) {
        setGeneratedScript(result.data);
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
        <div className="mt-8 text-center">
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Create Your Video Demo Script
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Provide your project README and get a professionally structured video
          script following the Context → Problem → Process → Outcome narrative.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <label
              htmlFor="projectName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* README Content */}
          <div>
            <label
              htmlFor="readmeContent"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Project README *
            </label>
            <textarea
              id="readmeContent"
              value={readmeContent}
              onChange={(e) => setReadmeContent(e.target.value)}
              placeholder="Paste your project README here... Include key features, purpose, and benefits."
              disabled={isGenerating}
              required
              minLength={50}
              maxLength={10000}
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {readmeContent.length}/10,000 characters • Minimum 50 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200">{error}</p>
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
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
            💡 How it works:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>AI analyzes your README using GPT-4o-mini</li>
            <li>Generates a 2.5-3.5 minute structured script</li>
            <li>Follows proven Context → Problem → Process → Outcome narrative</li>
            <li>Ready to use with Tella, Arcade, or any recording tool</li>
            <li>Includes timing guidance for each section</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
