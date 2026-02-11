/**
 * Zod schemas for GitHub API responses
 * Validates and types data from GitHub REST API v3
 */

import { z } from 'zod';

/**
 * GitHub Repository schema
 */
export const githubRepositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  description: z.string().nullable(),
  html_url: z.string().url(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  open_issues_count: z.number(),
  language: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  pushed_at: z.string(),
  size: z.number(),
  default_branch: z.string(),
  owner: z.object({
    login: z.string(),
    id: z.number(),
    avatar_url: z.string().url(),
    html_url: z.string().url(),
  }),
});

export type GitHubRepository = z.infer<typeof githubRepositorySchema>;

/**
 * GitHub Issue Label schema
 */
export const githubLabelSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
  description: z.string().nullable(),
});

export type GitHubLabel = z.infer<typeof githubLabelSchema>;

/**
 * GitHub Issue schema
 */
export const githubIssueSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  state: z.enum(['open', 'closed']),
  labels: z.array(githubLabelSchema),
  created_at: z.string(),
  updated_at: z.string(),
  closed_at: z.string().nullable(),
  body: z.string().nullable(),
  user: z.object({
    login: z.string(),
    id: z.number(),
  }),
});

export type GitHubIssue = z.infer<typeof githubIssueSchema>;

/**
 * GitHub Pull Request schema
 */
export const githubPullRequestSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  state: z.enum(['open', 'closed']),
  created_at: z.string(),
  updated_at: z.string(),
  merged_at: z.string().nullable(),
  body: z.string().nullable(),
  user: z.object({
    login: z.string(),
    id: z.number(),
  }),
});

export type GitHubPullRequest = z.infer<typeof githubPullRequestSchema>;

/**
 * GitHub Rate Limit schema
 */
export const rateLimitSchema = z.object({
  resources: z.object({
    core: z.object({
      limit: z.number(),
      remaining: z.number(),
      reset: z.number(),
      used: z.number(),
    }),
  }),
  rate: z.object({
    limit: z.number(),
    remaining: z.number(),
    reset: z.number(),
    used: z.number(),
  }),
});

export type GitHubRateLimit = z.infer<typeof rateLimitSchema>;

/**
 * Validates an array of repositories
 */
export const githubRepositoriesArraySchema = z.array(githubRepositorySchema);

/**
 * Validates an array of issues
 */
export const githubIssuesArraySchema = z.array(githubIssueSchema);

/**
 * Validates an array of pull requests
 */
export const githubPullRequestsArraySchema = z.array(githubPullRequestSchema);
