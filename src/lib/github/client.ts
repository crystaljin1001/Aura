/**
 * GitHub REST API v3 client with rate limiting
 * Documentation: https://docs.github.com/en/rest
 */

import { GitHubApiError, RateLimitError } from '@/utils/errors';
import {
  githubRepositorySchema,
  githubIssuesArraySchema,
  githubPullRequestsArraySchema,
  rateLimitSchema,
  type GitHubRepository,
  type GitHubIssue,
  type GitHubPullRequest,
  type GitHubRateLimit,
} from './schemas';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_API_VERSION = '2022-11-28';

interface FetchOptions {
  token: string;
  method?: string;
  body?: unknown;
}

/**
 * Makes a request to GitHub API with proper headers
 */
async function githubFetch<T>(
  endpoint: string,
  options: FetchOptions,
  retries: number = 2
): Promise<T> {
  const url = `${GITHUB_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${options.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Check rate limit headers
  const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
  const rateLimitReset = response.headers.get('x-ratelimit-reset');

  if (rateLimitRemaining && parseInt(rateLimitRemaining) === 0) {
    const resetDate = rateLimitReset
      ? new Date(parseInt(rateLimitReset) * 1000)
      : undefined;
    throw new RateLimitError(
      `GitHub API rate limit exceeded. Resets at ${resetDate?.toISOString() || 'unknown'}`,
      resetDate
    );
  }

  // Handle errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      (errorData as Record<string, unknown>).message || response.statusText;

    // Retry on 5xx errors
    if (response.status >= 500 && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return githubFetch<T>(endpoint, options, retries - 1);
    }

    throw new GitHubApiError(
      `GitHub API error: ${message}`,
      response.status
    );
  }

  return response.json();
}

/**
 * Fetches repository information
 * @param owner - Repository owner (username or organization)
 * @param repo - Repository name
 * @param token - GitHub Personal Access Token
 * @returns Promise containing repository data
 */
export async function fetchRepository(
  owner: string,
  repo: string,
  token: string
): Promise<GitHubRepository> {
  const data = await githubFetch<unknown>(
    `/repos/${owner}/${repo}`,
    { token }
  );

  // Validate response with Zod
  const validated = githubRepositorySchema.parse(data);
  return validated;
}

/**
 * Fetches issues for a repository
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param token - GitHub Personal Access Token
 * @param state - Filter by state (open, closed, all)
 * @returns Promise containing array of issues
 */
export async function fetchIssues(
  owner: string,
  repo: string,
  token: string,
  state: 'open' | 'closed' | 'all' = 'all'
): Promise<GitHubIssue[]> {
  const data = await githubFetch<unknown>(
    `/repos/${owner}/${repo}/issues?state=${state}&per_page=100`,
    { token }
  );

  // Validate response with Zod
  const validated = githubIssuesArraySchema.parse(data);
  return validated;
}

/**
 * Fetches pull requests for a repository
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param token - GitHub Personal Access Token
 * @param state - Filter by state (open, closed, all)
 * @returns Promise containing array of pull requests
 */
export async function fetchPullRequests(
  owner: string,
  repo: string,
  token: string,
  state: 'open' | 'closed' | 'all' = 'all'
): Promise<GitHubPullRequest[]> {
  const data = await githubFetch<unknown>(
    `/repos/${owner}/${repo}/pulls?state=${state}&per_page=100`,
    { token }
  );

  // Validate response with Zod
  const validated = githubPullRequestsArraySchema.parse(data);
  return validated;
}

/**
 * Gets the current rate limit status
 * @param token - GitHub Personal Access Token
 * @returns Promise containing rate limit information
 */
export async function getRateLimitStatus(
  token: string
): Promise<GitHubRateLimit> {
  const data = await githubFetch<unknown>('/rate_limit', { token });

  // Validate response with Zod
  const validated = rateLimitSchema.parse(data);
  return validated;
}

/**
 * Validates a GitHub token by making a test request
 * @param token - GitHub Personal Access Token to validate
 * @returns Promise<true> if valid, throws error if invalid
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    await githubFetch<unknown>('/user', { token });
    return true;
  } catch (error) {
    if (error instanceof GitHubApiError && error.statusCode === 401) {
      throw new GitHubApiError('Invalid GitHub token', 401);
    }
    throw error;
  }
}
