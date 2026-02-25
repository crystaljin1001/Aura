/**
 * Engineering Rigor Actions
 * Server actions for fetching and calculating engineering rigor metrics
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import type { EngineeringRigorMetrics } from '../types'
import {
  fetchWorkflowFiles,
  fetchWorkflowContent,
  fetchRepositoryTree,
  fetchRecentCommitsWithStats,
  fetchReadmeContent,
} from './github-rigor-data'
import {
  analyzeToolingIntent,
  analyzeStabilityInfrastructure,
  analyzeTestingRatio,
  analyzeRefactorSignal,
  analyzeDocumentationDepth,
  calculateEngineeringRigor,
} from '../utils/rigor-calculator'

/**
 * Parse repository URL to extract owner and repo name
 * Accepts both "owner/repo" and "https://github.com/owner/repo" formats
 */
function parseRepoUrl(repositoryUrl: string): { owner: string; repo: string } | null {
  try {
    // If it's already in "owner/repo" format, parse directly
    if (!repositoryUrl.includes('://')) {
      const parts = repositoryUrl.split('/').filter(Boolean)
      if (parts.length >= 2) {
        return { owner: parts[0], repo: parts[1] }
      }
      return null
    }

    // Otherwise parse as full URL
    const url = new URL(repositoryUrl)
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Get GitHub token from database
 */
async function getGitHubToken(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data } = await supabase
      .from('github_tokens')
      .select('encrypted_token')
      .eq('user_id', user.id)
      .single()

    if (!data?.encrypted_token) return null

    // Decrypt token (simplified - in production use proper decryption)
    // For now, assume it's stored as base64
    return Buffer.from(data.encrypted_token, 'base64').toString('utf-8')
  } catch {
    return null
  }
}

/**
 * Calculate engineering rigor for a repository
 */
export async function calculateRepositoryRigor(
  repositoryUrl: string,
  forceRefresh: boolean = false
): Promise<{ success: boolean; data?: EngineeringRigorMetrics; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from('engineering_rigor_cache')
        .select('*')
        .eq('repository_url', repositoryUrl)
        .eq('user_id', user.id)
        .single()

      if (cached) {
        const cacheAge = Date.now() - new Date(cached.cached_at).getTime()
        const ONE_DAY = 24 * 60 * 60 * 1000

        if (cacheAge < ONE_DAY) {
          return {
            success: true,
            data: cached.rigor_metrics as EngineeringRigorMetrics,
          }
        }
      }
    }

    // Parse repository URL
    const parsed = parseRepoUrl(repositoryUrl)
    if (!parsed) {
      return { success: false, error: 'Invalid repository URL' }
    }

    const { owner, repo } = parsed
    const token = await getGitHubToken()

    // Fetch all required data in parallel
    const [workflowFiles, tree, commits, readmeContent] = await Promise.all([
      fetchWorkflowFiles(owner, repo, token || undefined),
      fetchRepositoryTree(owner, repo, token || undefined),
      fetchRecentCommitsWithStats(owner, repo, 30, token || undefined),
      fetchReadmeContent(owner, repo, token || undefined),
    ])

    // Fetch workflow contents
    const workflowContents = await Promise.all(
      workflowFiles.slice(0, 5).map((file) =>
        fetchWorkflowContent(owner, repo, file.path, token || undefined)
      )
    )
    const validWorkflowContents = workflowContents.filter((c): c is string => c !== null)

    // Analyze each dimension
    const tooling = analyzeToolingIntent(tree)
    const infrastructure = analyzeStabilityInfrastructure(
      workflowFiles.map((f) => f.name),
      validWorkflowContents
    )
    const testing = analyzeTestingRatio(tree)
    const refactoring = analyzeRefactorSignal(commits)
    const documentation = analyzeDocumentationDepth(readmeContent, tree)

    // Calculate overall metrics
    const metrics = calculateEngineeringRigor(
      tooling,
      infrastructure,
      testing,
      refactoring,
      documentation
    )

    // Cache the results
    await supabase.from('engineering_rigor_cache').upsert({
      user_id: user.id,
      repository_url: repositoryUrl,
      rigor_metrics: metrics,
      cached_at: new Date().toISOString(),
    })

    return { success: true, data: metrics }
  } catch (error) {
    console.error('Error calculating engineering rigor:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get cached engineering rigor metrics
 */
export async function getCachedRigorMetrics(
  repositoryUrl: string
): Promise<{ success: boolean; data?: EngineeringRigorMetrics; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: cached, error } = await supabase
      .from('engineering_rigor_cache')
      .select('*')
      .eq('repository_url', repositoryUrl)
      .eq('user_id', user.id)
      .single()

    if (error || !cached) {
      return { success: false, error: 'No cached data found' }
    }

    return {
      success: true,
      data: cached.rigor_metrics as EngineeringRigorMetrics,
    }
  } catch (error) {
    console.error('Error fetching cached rigor metrics:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
