/**
 * GitHub Commit Analyzer
 * Fetches and analyzes commits to calculate velocity metrics
 */

import type { CommitData, VelocityHeatmapData } from '../types'

interface GitHubCommit {
  sha: string
  commit: {
    author: {
      date: string
    }
    message: string
  }
  stats?: {
    additions: number
    deletions: number
    total: number
  }
}

/**
 * Detect if a commit is likely boilerplate/generated code
 */
export function isLikelyBoilerplate(message: string, additions: number, deletions: number): boolean {
  const boilerplateKeywords = [
    'initial commit',
    'generated',
    'scaffolded',
    'boilerplate',
    'npm install',
    'yarn add',
    'package-lock',
    'lock file',
    'merge branch',
    'merge pull request',
    'auto-generated',
    'prettier',
    'eslint',
    'formatted',
  ]

  const messageLower = message.toLowerCase()

  // Check for boilerplate keywords
  const hasBoilerplateKeyword = boilerplateKeywords.some(keyword =>
    messageLower.includes(keyword)
  )

  // Huge commit with minimal message is likely generated
  const isHugeCommitNoContext = (additions + deletions) > 5000 && message.length < 30

  // Only deletions (cleanup) is not productive work
  const isOnlyDeletions = deletions > 100 && additions < 10

  return hasBoilerplateKeyword || isHugeCommitNoContext || isOnlyDeletions
}

/**
 * Fetch commits from GitHub API with detailed stats
 */
export async function fetchCommitsWithStats(
  owner: string,
  repo: string,
  token: string,
  since: Date
): Promise<CommitData[]> {
  const sinceISO = since.toISOString()

  // Fetch ALL commits with pagination (not just first 100)
  let allCommits: GitHubCommit[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?since=${sinceISO}&per_page=${perPage}&page=${page}`
    const commitsResponse = await fetch(commitsUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!commitsResponse.ok) {
      throw new Error(`Failed to fetch commits: ${commitsResponse.statusText}`)
    }

    const commits: GitHubCommit[] = await commitsResponse.json()

    if (commits.length === 0) {
      break // No more commits
    }

    allCommits = allCommits.concat(commits)

    if (commits.length < perPage) {
      break // Last page
    }

    page++
  }

  console.log(`📦 Fetched ${allCommits.length} commits from ${owner}/${repo} since ${since.toISOString()}`)

  // Fetch detailed stats for each commit (in batches to respect rate limits)
  const commitDataPromises = allCommits.map(async (commit) => {
    try {
      const commitUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${commit.sha}`
      const commitResponse = await fetch(commitUrl, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })

      if (!commitResponse.ok) {
        // If we hit rate limit or error, use basic data without stats
        return {
          sha: commit.sha,
          date: commit.commit.author.date,
          additions: 0,
          deletions: 0,
          total_changes: 0,
          message: commit.commit.message,
          is_likely_boilerplate: false,
        }
      }

      const detailedCommit: GitHubCommit = await commitResponse.json()
      const additions = detailedCommit.stats?.additions || 0
      const deletions = detailedCommit.stats?.deletions || 0

      return {
        sha: commit.sha,
        date: commit.commit.author.date,
        additions,
        deletions,
        total_changes: additions + deletions,
        message: commit.commit.message,
        is_likely_boilerplate: isLikelyBoilerplate(
          commit.commit.message,
          additions,
          deletions
        ),
      }
    } catch (error) {
      console.error(`Error fetching commit ${commit.sha}:`, error)
      return {
        sha: commit.sha,
        date: commit.commit.author.date,
        additions: 0,
        deletions: 0,
        total_changes: 0,
        message: commit.commit.message,
        is_likely_boilerplate: false,
      }
    }
  })

  // Batch the requests to avoid overwhelming the API
  const batchSize = 10
  const commitData: CommitData[] = []

  for (let i = 0; i < commitDataPromises.length; i += batchSize) {
    const batch = commitDataPromises.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch)
    commitData.push(...batchResults)

    // Small delay between batches
    if (i + batchSize < commitDataPromises.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return commitData
}

/**
 * Calculate days active (days with at least one commit)
 */
export function calculateDaysActive(commits: CommitData[]): number {
  const uniqueDates = new Set(
    commits.map(c => new Date(c.date).toISOString().split('T')[0])
  )
  return uniqueDates.size
}

/**
 * Generate heatmap data for visualization
 */
export function generateHeatmapData(commits: CommitData[], days: number = 30): VelocityHeatmapData[] {
  const now = new Date()
  const heatmapData: VelocityHeatmapData[] = []

  // Generate data for each day in the range
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    // Find commits for this day
    const dayCommits = commits.filter(c =>
      c.date.split('T')[0] === dateStr
    )

    const additions = dayCommits.reduce((sum, c) => sum + c.additions, 0)
    const deletions = dayCommits.reduce((sum, c) => sum + c.deletions, 0)
    const totalChanges = additions + deletions

    // Calculate intensity (0-10 scale for visualization)
    // Scale based on logarithm to handle large spikes
    const intensity = totalChanges > 0
      ? Math.min(10, Math.log10(totalChanges + 1) * 2.5)
      : 0

    heatmapData.push({
      date: dateStr,
      commits: dayCommits.length,
      additions,
      deletions,
      intensity: Math.round(intensity * 10) / 10,
    })
  }

  return heatmapData
}

/**
 * Calculate complexity factor based on lines changed
 * Higher factor = more substantial changes
 */
export function calculateComplexityFactor(
  totalAdditions: number,
  totalDeletions: number,
  commits: number
): number {
  const netChanges = totalAdditions + totalDeletions
  const avgChangesPerCommit = commits > 0 ? netChanges / commits : 0

  // Logarithmic scale to prevent gaming with massive commits
  // Sweet spot: 100-500 lines per commit = factor of 1.0
  const baseFactor = Math.log10(avgChangesPerCommit + 1) / 2.7

  // Cap at 2.0 to prevent extreme outliers
  return Math.min(2.0, Math.max(0.1, baseFactor))
}
