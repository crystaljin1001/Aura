/**
 * Sanitization utilities for XSS prevention
 * All GitHub data must be sanitized before rendering
 */

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Strips HTML tags from a string
 */
function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

/**
 * Removes dangerous URL protocols (javascript:, data:, etc.)
 */
function sanitizeUrl(url: string): string {
  const dangerous = /^(javascript|data|vbscript|file|about):/i;
  if (dangerous.test(url)) {
    return '';
  }
  return url;
}

/**
 * Limits string length and adds ellipsis if needed
 */
function limitLength(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Sanitizes a generic string from GitHub
 * @param input - The input string
 * @param maxLength - Maximum allowed length (default: 500)
 * @returns Sanitized string
 */
export function sanitizeString(
  input: string,
  maxLength: number = 500
): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Strip HTML tags first
  let sanitized = stripHtml(input);

  // Escape HTML characters
  sanitized = escapeHtml(sanitized);

  // Limit length
  sanitized = limitLength(sanitized, maxLength);

  // Trim whitespace
  return sanitized.trim();
}

/**
 * Sanitizes a URL from GitHub
 * @param url - The URL to sanitize
 * @returns Sanitized URL or empty string if dangerous
 */
export function sanitizeGitHubUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Remove any HTML tags
  let sanitized = stripHtml(url);

  // Remove dangerous protocols
  sanitized = sanitizeUrl(sanitized);

  // Limit length
  sanitized = limitLength(sanitized, 2000);

  return sanitized.trim();
}

/**
 * Sanitizes repository data from GitHub API
 */
export interface SanitizedRepository {
  name: string;
  fullName: string;
  description: string;
  htmlUrl: string;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  language: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  readmeLength?: number;
}

export function sanitizeRepoData(repo: Record<string, unknown>): SanitizedRepository {
  return {
    name: sanitizeString(String(repo.name || ''), 100),
    fullName: sanitizeString(String(repo.full_name || ''), 200),
    description: sanitizeString(String(repo.description || ''), 500),
    htmlUrl: sanitizeGitHubUrl(repo.html_url as string),
    stargazersCount: Math.max(0, Number(repo.stargazers_count) || 0),
    forksCount: Math.max(0, Number(repo.forks_count) || 0),
    openIssuesCount: Math.max(0, Number(repo.open_issues_count) || 0),
    language: sanitizeString(String(repo.language || 'Unknown'), 50),
    createdAt: String(repo.created_at || ''),
    updatedAt: String(repo.updated_at || ''),
    pushedAt: String(repo.pushed_at || ''),
    readmeLength: repo.readmeLength ? Number(repo.readmeLength) : undefined,
  };
}

/**
 * Sanitizes issue data from GitHub API
 */
export interface SanitizedIssue {
  id: number;
  number: number;
  title: string;
  state: string;
  labels: string[];
  createdAt: string;
  closedAt: string | null;
}

export function sanitizeIssue(issue: Record<string, unknown>): SanitizedIssue {
  const labels = Array.isArray(issue.labels)
    ? issue.labels.map((label: Record<string, unknown>) =>
        sanitizeString(String(label.name || ''), 50)
      )
    : [];

  return {
    id: Number(issue.id) || 0,
    number: Number(issue.number) || 0,
    title: sanitizeString(String(issue.title || ''), 200),
    state: sanitizeString(String(issue.state || ''), 20),
    labels,
    createdAt: String(issue.created_at || ''),
    closedAt: issue.closed_at ? String(issue.closed_at) : null,
  };
}

/**
 * Sanitizes pull request data from GitHub API
 */
export interface SanitizedPullRequest {
  id: number;
  number: number;
  title: string;
  state: string;
  createdAt: string;
  mergedAt: string | null;
}

export function sanitizePullRequest(
  pr: Record<string, unknown>
): SanitizedPullRequest {
  return {
    id: Number(pr.id) || 0,
    number: Number(pr.number) || 0,
    title: sanitizeString(String(pr.title || ''), 200),
    state: sanitizeString(String(pr.state || ''), 20),
    createdAt: String(pr.created_at || ''),
    mergedAt: pr.merged_at ? String(pr.merged_at) : null,
  };
}
