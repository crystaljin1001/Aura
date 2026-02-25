/**
 * GitHub Rigor Data Fetcher
 * Fetches repository data for engineering rigor analysis
 */

import type {
  GitHubWorkflowFile,
  GitHubTreeNode,
  GitHubCommitDetail,
} from '../types'

/**
 * Fetches CI/CD workflow files from .github/workflows
 */
export async function fetchWorkflowFiles(
  owner: string,
  repo: string,
  token?: string
): Promise<GitHubWorkflowFile[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/.github/workflows`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(token && { Authorization: `token ${token}` }),
        },
      }
    )

    if (!response.ok) return []
    const files = await response.json()

    if (!Array.isArray(files)) return []

    // Filter for YAML workflow files
    return files.filter(
      (file: any) =>
        file.type === 'file' &&
        (file.name.endsWith('.yml') || file.name.endsWith('.yaml'))
    )
  } catch (error) {
    console.error('Error fetching workflow files:', error)
    return []
  }
}

/**
 * Fetches workflow file content
 */
export async function fetchWorkflowContent(
  owner: string,
  repo: string,
  path: string,
  token?: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3.raw',
          ...(token && { Authorization: `token ${token}` }),
        },
      }
    )

    if (!response.ok) return null
    return await response.text()
  } catch (error) {
    console.error('Error fetching workflow content:', error)
    return null
  }
}

/**
 * Fetches complete file tree for the repository
 */
export async function fetchRepositoryTree(
  owner: string,
  repo: string,
  token?: string
): Promise<GitHubTreeNode[]> {
  try {
    // Get default branch first
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(token && { Authorization: `token ${token}` }),
        },
      }
    )

    if (!repoResponse.ok) return []
    const repoData = await repoResponse.json()
    const defaultBranch = repoData.default_branch || 'main'

    // Get tree recursively
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(token && { Authorization: `token ${token}` }),
        },
      }
    )

    if (!treeResponse.ok) return []
    const treeData = await treeResponse.json()
    return treeData.tree as GitHubTreeNode[]
  } catch (error) {
    console.error('Error fetching repository tree:', error)
    return []
  }
}

/**
 * Fetches commits from the last N days with full stats
 */
export async function fetchRecentCommitsWithStats(
  owner: string,
  repo: string,
  days: number = 30,
  token?: string
): Promise<GitHubCommitDetail[]> {
  try {
    const since = new Date()
    since.setDate(since.getDate() - days)

    // Get commits
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?since=${since.toISOString()}&per_page=100`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(token && { Authorization: `token ${token}` }),
        },
      }
    )

    if (!response.ok) return []
    const commits = await response.json()

    // Fetch stats for each commit (parallel requests)
    const commitsWithStats = await Promise.all(
      commits.slice(0, 100).map(async (commit: any) => {
        try {
          const detailResponse = await fetch(commit.url, {
            headers: {
              Accept: 'application/vnd.github.v3+json',
              ...(token && { Authorization: `token ${token}` }),
            },
          })

          if (!detailResponse.ok) {
            return {
              sha: commit.sha,
              commit: commit.commit,
              stats: { additions: 0, deletions: 0, total: 0 },
            }
          }

          const detail = await detailResponse.json()
          return {
            sha: detail.sha,
            commit: detail.commit,
            stats: detail.stats || { additions: 0, deletions: 0, total: 0 },
            files: detail.files,
          }
        } catch {
          return {
            sha: commit.sha,
            commit: commit.commit,
            stats: { additions: 0, deletions: 0, total: 0 },
          }
        }
      })
    )

    return commitsWithStats
  } catch (error) {
    console.error('Error fetching commits with stats:', error)
    return []
  }
}

/**
 * Check if a file exists in the repository
 */
export async function fileExists(
  owner: string,
  repo: string,
  path: string,
  token?: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'HEAD',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(token && { Authorization: `token ${token}` }),
        },
      }
    )

    return response.ok
  } catch {
    return false
  }
}

/**
 * Fetch README content
 */
export async function fetchReadmeContent(
  owner: string,
  repo: string,
  token?: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Accept: 'application/vnd.github.v3.raw',
          ...(token && { Authorization: `token ${token}` }),
        },
      }
    )

    if (!response.ok) return null
    return await response.text()
  } catch (error) {
    console.error('Error fetching README:', error)
    return null
  }
}
