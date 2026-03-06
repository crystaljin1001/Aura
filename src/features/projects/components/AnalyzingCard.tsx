'use client';

/**
 * AnalyzingCard Component
 * Displays loading state while AI analyzes repository
 */

import type { Project } from '../types';
import { useDraftPolling } from '../hooks/useDraftPolling';

interface AnalyzingCardProps {
  project: Project;
}

export function AnalyzingCard({ project }: AnalyzingCardProps) {
  const { hasTimedOut, elapsedTime, progressPercentage } = useDraftPolling({
    currentStatus: project.status,
    pollingInterval: 2000, // 2 seconds
    timeout: 30000, // 30 seconds
  });

  const elapsedSeconds = Math.floor(elapsedTime / 1000);

  return (
    <div className="relative overflow-hidden rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {project.name}
          </h3>
          <p className="mt-1 text-sm text-gray-600">{project.repository}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
          <span className="text-xl">🤖</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
          </span>
          Analyzing Repository
        </span>
      </div>

      {/* Message */}
      <div className="mb-6">
        {hasTimedOut ? (
          <div className="rounded-md bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              Analysis is taking longer than expected. This may happen for large
              repositories. Please wait or try again later.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm font-medium text-gray-700">
              Aura is analyzing your repository...
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Reading README content</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Analyzing commit history</span>
              </li>
              <li className="flex items-center gap-2">
                {elapsedSeconds > 5 ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></span>
                )}
                <span>Generating draft content with AI</span>
              </li>
            </ul>
          </>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{hasTimedOut ? 'Processing...' : 'Analyzing...'}</span>
          <span>{elapsedSeconds}s</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-blue-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Footer Hint */}
      <p className="mt-4 text-xs text-gray-500">
        This usually takes 10-15 seconds. You'll see AI-generated title, TL;DR,
        and metrics when complete.
      </p>
    </div>
  );
}
