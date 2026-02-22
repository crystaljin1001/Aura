/**
 * GitHub Permalink Parser
 * Extracts owner, repo, branch, path, and line numbers from GitHub URLs
 */

export interface GitHubPermalink {
  owner: string
  repo: string
  branch: string       // Branch name (e.g., "main") OR commit SHA (e.g., "abc123def456")
  path: string         // Full file path from repo root
  startLine?: number   // Starting line number (from #L10)
  endLine?: number     // Ending line number (from #L10-L20)
}

/**
 * Parse a GitHub permalink URL
 * Supports formats:
 * - Branch: https://github.com/owner/repo/blob/main/path/to/file.ts
 * - Commit SHA: https://github.com/owner/repo/blob/abc123def456/path/to/file.ts
 * - With line: https://github.com/owner/repo/blob/main/path/to/file.ts#L10
 * - With range: https://github.com/owner/repo/blob/main/path/to/file.ts#L10-L20
 *
 * VERIFIED: This parser supports both branches AND commit SHAs for evidence deep-linking.
 * The "branch" field can hold either a branch name (e.g., "main") or a commit SHA.
 */
export function parseGitHubPermalink(url: string): GitHubPermalink | null {
  try {
    const urlObj = new URL(url)

    // Must be github.com
    if (urlObj.hostname !== 'github.com') {
      return null
    }

    // Parse pathname: /owner/repo/blob/branch-or-sha/path/to/file.ts
    const pathParts = urlObj.pathname.split('/').filter(Boolean)

    if (pathParts.length < 5 || pathParts[2] !== 'blob') {
      return null
    }

    const owner = pathParts[0]
    const repo = pathParts[1]
    const branch = pathParts[3] // This can be branch name OR commit SHA
    const path = pathParts.slice(4).join('/')

    // Parse line numbers from hash: #L10 or #L10-L20
    let startLine: number | undefined
    let endLine: number | undefined

    if (urlObj.hash) {
      const lineMatch = urlObj.hash.match(/^#L(\d+)(?:-L(\d+))?$/)
      if (lineMatch) {
        startLine = parseInt(lineMatch[1], 10)
        endLine = lineMatch[2] ? parseInt(lineMatch[2], 10) : startLine
      }
    }

    return {
      owner,
      repo,
      branch, // Can be "main", "develop", or full commit SHA like "abc123def456"
      path,
      startLine,
      endLine,
    }
  } catch {
    return null
  }
}

/**
 * Check if a URL is a valid GitHub permalink
 */
export function isGitHubPermalink(url: string): boolean {
  return parseGitHubPermalink(url) !== null
}
