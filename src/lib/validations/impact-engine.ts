/**
 * Validation schemas for Impact Engine
 */

import { z } from 'zod';

/**
 * GitHub Personal Access Token validation
 * Format: ghp_* or ghs_* followed by alphanumeric characters and underscores
 */
export const patTokenSchema = z.object({
  token: z
    .string()
    .min(1, 'Token is required')
    .regex(
      /^gh[ps]_[A-Za-z0-9_]+$/,
      'Invalid GitHub token format. Token must start with ghp_ or ghs_'
    ),
});

export type PatTokenInput = z.infer<typeof patTokenSchema>;

/**
 * Repository identifier validation
 */
export const repoIdentifierSchema = z.object({
  owner: z
    .string()
    .min(1, 'Owner is required')
    .max(39, 'Owner must be 39 characters or less')
    .regex(
      /^[a-zA-Z0-9-]+$/,
      'Owner must contain only alphanumeric characters and hyphens'
    ),
  repo: z
    .string()
    .min(1, 'Repository name is required')
    .max(100, 'Repository name must be 100 characters or less')
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      'Repository name must contain only alphanumeric characters, hyphens, periods, and underscores'
    ),
});

export type RepoIdentifier = z.infer<typeof repoIdentifierSchema>;

/**
 * Array of repository identifiers
 */
export const repoIdentifiersArraySchema = z
  .array(repoIdentifierSchema)
  .min(1, 'At least one repository is required')
  .max(10, 'Maximum 10 repositories allowed');

export type RepoIdentifiersArray = z.infer<typeof repoIdentifiersArraySchema>;

/**
 * Parses a GitHub repository URL into owner and repo
 * Supports formats:
 * - https://github.com/owner/repo
 * - github.com/owner/repo
 * - owner/repo
 */
export function parseGitHubUrl(url: string): RepoIdentifier | null {
  // Remove trailing slashes and whitespace
  const cleaned = url.trim().replace(/\/+$/, '');

  // Try to match different URL formats
  const patterns = [
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)$/i,
    /^github\.com\/([^/]+)\/([^/]+)$/i,
    /^([^/]+)\/([^/]+)$/,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      const [, owner, repo] = match;
      try {
        return repoIdentifierSchema.parse({ owner, repo });
      } catch {
        return null;
      }
    }
  }

  return null;
}
