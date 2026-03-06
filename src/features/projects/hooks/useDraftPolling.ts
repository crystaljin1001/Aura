'use client';

/**
 * Hook for polling repository analysis status
 * Polls every 2 seconds while status is 'analyzing' by refreshing the route
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProjectStatus } from '../types';

interface UseDraftPollingOptions {
  currentStatus: ProjectStatus;
  pollingInterval?: number;
  timeout?: number;
}

interface UseDraftPollingResult {
  isAnalyzing: boolean;
  hasTimedOut: boolean;
  elapsedTime: number;
  progressPercentage: number;
}

/**
 * Hook for polling repository status during AI analysis
 * Uses Next.js router.refresh() to revalidate server component data
 */
export function useDraftPolling({
  currentStatus,
  pollingInterval = 2000, // 2 seconds
  timeout = 30000, // 30 seconds
}: UseDraftPollingOptions): UseDraftPollingResult {
  const router = useRouter();
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const isAnalyzing = currentStatus === 'analyzing';

  // Calculate progress percentage (0-100)
  const progressPercentage = Math.min(
    Math.round((elapsedTime / timeout) * 100),
    100
  );

  // Start timer when analyzing begins
  useEffect(() => {
    if (isAnalyzing && !startTime) {
      setStartTime(Date.now());
    } else if (!isAnalyzing && startTime) {
      // Reset when analysis completes
      setStartTime(null);
      setElapsedTime(0);
      setHasTimedOut(false);
    }
  }, [isAnalyzing, startTime]);

  // Update elapsed time
  useEffect(() => {
    if (!isAnalyzing || !startTime) return;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(elapsed);

      if (elapsed >= timeout) {
        setHasTimedOut(true);
      }
    }, 500); // Update every 500ms for smooth progress

    return () => clearInterval(timer);
  }, [isAnalyzing, startTime, timeout]);

  // Polling effect - refresh route to get updated data
  useEffect(() => {
    if (!isAnalyzing || hasTimedOut) return;

    // Initial refresh
    router.refresh();

    // Set up polling interval
    const interval = setInterval(() => {
      router.refresh();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [isAnalyzing, hasTimedOut, pollingInterval, router]);

  return {
    isAnalyzing,
    hasTimedOut,
    elapsedTime,
    progressPercentage,
  };
}
