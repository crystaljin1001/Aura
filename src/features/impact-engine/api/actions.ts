'use server';

/**
 * Server actions for Impact Engine
 * Handles GitHub token management, data fetching, and caching
 */

import { createClient } from '@/lib/supabase/server';
import { encryptToken, decryptToken, getTokenLastFour } from '@/lib/encryption/crypto';
import {
  fetchRepository,
  fetchIssues,
  fetchPullRequests,
  getRateLimitStatus as getGitHubRateLimit,
  validateToken,
} from '@/lib/github/client';
import { calculateImpacts, filterNonZeroMetrics } from '../utils/impact-calculator';
import { sanitizeRepoData } from '../utils/sanitize';
import { patTokenSchema, repoIdentifiersArraySchema, type RepoIdentifier } from '@/lib/validations/impact-engine';
import { AuthenticationError, ValidationError } from '@/utils/errors';
import type { ApiResponse, ImpactMetric, RateLimitStatus } from '@/types';
import type { RepositoryImpactData } from '../types';

/**
 * Gets the authenticated user or throws error
 */
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthenticationError('You must be signed in to use this feature');
  }

  return user;
}

/**
 * Stores a GitHub Personal Access Token for the authenticated user
 * @param token - The GitHub PAT to store
 * @returns ApiResponse with success status
 */
export async function storeGitHubToken(token: string): Promise<ApiResponse<void>> {
  try {
    // Validate input
    const validated = patTokenSchema.parse({ token });

    // Validate token with GitHub
    await validateToken(validated.token);

    // Get authenticated user
    const user = await getAuthenticatedUser();

    // Encrypt the token
    const encrypted = await encryptToken(validated.token);
    const lastFour = getTokenLastFour(validated.token);

    // Store in database
    const supabase = await createClient();
    const { error: upsertError } = await supabase
      .from('github_tokens')
      .upsert(
        {
          user_id: user.id,
          encrypted_token: encrypted.encrypted,
          encryption_iv: encrypted.iv,
          token_last_four: lastFour,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (upsertError) {
      throw new Error(`Failed to store token: ${upsertError.message}`);
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to store token',
    };
  }
}

/**
 * Retrieves and decrypts the user's GitHub token
 */
async function getUserToken(): Promise<string> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('github_tokens')
    .select('encrypted_token, encryption_iv')
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    throw new ValidationError(
      'No GitHub token found. Please add your token first.'
    );
  }

  return await decryptToken({
    encrypted: data.encrypted_token,
    iv: data.encryption_iv,
  });
}

/**
 * Updates rate limit tracking in database
 */
async function updateRateLimitTracking(
  userId: string,
  rateLimit: number,
  remaining: number,
  resetAt: Date
): Promise<void> {
  const supabase = await createClient();

  await supabase.from('rate_limit_tracking').upsert(
    {
      user_id: userId,
      rate_limit: rateLimit,
      rate_remaining: remaining,
      rate_reset_at: resetAt.toISOString(),
      last_updated: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
}

/**
 * Checks if cached data is still valid
 */
function isCacheValid(expiresAt: string): boolean {
  return new Date(expiresAt) > new Date();
}

/**
 * Fetches impact data for specified repositories
 * Uses 24-hour cache to minimize GitHub API calls
 * @param repos - Array of repository identifiers
 * @param forceRefresh - If true, bypasses cache and fetches fresh data
 * @returns ApiResponse with impact data
 */
export async function getImpactData(
  repos: RepoIdentifier[],
  forceRefresh = false
): Promise<ApiResponse<RepositoryImpactData[]>> {
  try {
    // Validate input
    const validated = repoIdentifiersArraySchema.parse(repos);

    // Get authenticated user and token
    const user = await getAuthenticatedUser();
    const token = await getUserToken();
    const supabase = await createClient();

    const results: RepositoryImpactData[] = [];

    for (const repo of validated) {
      const repoFullName = `${repo.owner}/${repo.repo}`;

      // Check cache first (unless force refresh)
      const { data: cached } = await supabase
        .from('impact_cache')
        .select('*')
        .eq('user_id', user.id)
        .eq('repo_full_name', repoFullName)
        .single();

      if (!forceRefresh && cached && isCacheValid(cached.expires_at)) {
        // Use cached data
        results.push({
          repoFullName,
          metrics: cached.impact_metrics as ImpactMetric[],
          lastUpdated: new Date(cached.cached_at),
        });
        continue;
      }

      // Fetch fresh data from GitHub
      const [repoData, issues, prs] = await Promise.all([
        fetchRepository(repo.owner, repo.repo, token),
        fetchIssues(repo.owner, repo.repo, token),
        fetchPullRequests(repo.owner, repo.repo, token),
      ]);

      // Fetch README length
      let readmeLength: number | undefined;
      try {
        const readmeResponse = await fetch(
          `https://api.github.com/repos/${repo.owner}/${repo.repo}/readme`,
          {
            headers: {
              Authorization: `token ${token}`,
              Accept: 'application/vnd.github.v3.raw',
            },
          }
        );
        if (readmeResponse.ok) {
          const readmeContent = await readmeResponse.text();
          readmeLength = readmeContent.length;
        }
      } catch {
        // README not found or fetch failed - that's okay
      }

      // Sanitize data
      const repoDataWithReadme = {
        ...(repoData as Record<string, unknown>),
        readmeLength,
      };
      const sanitizedRepo = sanitizeRepoData(repoDataWithReadme);

      // Calculate impacts
      const impacts = calculateImpacts(
        repoData,
        issues,
        prs
      );
      const nonZeroImpacts = filterNonZeroMetrics(impacts);

      // Cache the results
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      await supabase.from('impact_cache').upsert(
        {
          user_id: user.id,
          repo_full_name: repoFullName,
          repo_data: sanitizedRepo,
          impact_metrics: nonZeroImpacts,
          cached_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        },
        { onConflict: 'user_id,repo_full_name' }
      );

      results.push({
        repoFullName,
        metrics: nonZeroImpacts,
        lastUpdated: now,
      });

      // Update rate limit tracking
      const rateLimitData = await getGitHubRateLimit(token);
      await updateRateLimitTracking(
        user.id,
        rateLimitData.rate.limit,
        rateLimitData.rate.remaining,
        new Date(rateLimitData.rate.reset * 1000)
      );
    }

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch impact data',
    };
  }
}

/**
 * Deletes the user's stored GitHub token
 * @returns ApiResponse with success status
 */
export async function deleteGitHubToken(): Promise<ApiResponse<void>> {
  try {
    const user = await getAuthenticatedUser();
    const supabase = await createClient();

    const { error } = await supabase
      .from('github_tokens')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to delete token: ${error.message}`);
    }

    // Also clear cache and rate limit data
    await Promise.all([
      supabase.from('impact_cache').delete().eq('user_id', user.id),
      supabase.from('rate_limit_tracking').delete().eq('user_id', user.id),
    ]);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete token',
    };
  }
}

/**
 * Gets the current rate limit status for the user
 * @returns ApiResponse with rate limit status
 */
export async function getRateLimitStatus(): Promise<ApiResponse<RateLimitStatus>> {
  try {
    const user = await getAuthenticatedUser();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('rate_limit_tracking')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      // No rate limit data yet, return default
      return {
        success: true,
        data: {
          limit: 5000,
          remaining: 5000,
          resetAt: new Date(Date.now() + 60 * 60 * 1000),
          percentage: 100,
          isWarning: false,
        },
      };
    }

    const percentage = (data.rate_remaining / data.rate_limit) * 100;
    const isWarning = data.rate_remaining < 100;

    return {
      success: true,
      data: {
        limit: data.rate_limit,
        remaining: data.rate_remaining,
        resetAt: new Date(data.rate_reset_at),
        percentage,
        isWarning,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch rate limit status',
    };
  }
}

/**
 * Checks if the user has a stored GitHub token
 * @returns ApiResponse with boolean indicating if token exists
 */
export async function hasGitHubToken(): Promise<ApiResponse<boolean>> {
  try {
    const user = await getAuthenticatedUser();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('github_tokens')
      .select('id')
      .eq('user_id', user.id)
      .single();

    return {
      success: true,
      data: !!data && !error,
    };
  } catch (error) {
    return {
      success: false,
      data: false,
      error: error instanceof Error ? error.message : 'Failed to check token',
    };
  }
}
