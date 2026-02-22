/**
 * Pulse Engine Server Actions
 * Calculates and caches pulse metrics (velocity + uptime)
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/encryption/crypto'
import type { ApiResponse } from '@/types'
import type { PulseMetrics } from '../types'
import { fetchCommitsWithStats, generateHeatmapData } from '../utils/github-commit-analyzer'
import { calculateVelocityScore } from '../utils/velocity-calculator'
import { checkUptime } from '../utils/uptime-checker'
import {
  detectSprintWindow,
  determineLifecycleStatus,
  daysSinceLastCommit,
  getSprintLabel,
} from '../utils/sprint-detector'
import { calculateProjectTimeline } from '../utils/timeline-calculator'

/**
 * Calculate pulse metrics for a repository
 * Caches results for 24 hours
 */
export async function calculatePulseMetrics(
  repositoryUrl: string
): Promise<ApiResponse<PulseMetrics>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Check cache first (24 hour TTL)
    const { data: cachedPulse } = await supabase
      .from('pulse_metrics_cache')
      .select('*')
      .eq('user_id', user.id)
      .eq('repository_url', repositoryUrl)
      .single()

    if (cachedPulse) {
      const cacheAge = Date.now() - new Date(cachedPulse.cached_at).getTime()
      const twentyFourHours = 24 * 60 * 60 * 1000

      if (cacheAge < twentyFourHours) {
        return {
          success: true,
          data: cachedPulse.metrics as PulseMetrics,
        }
      }
    }

    // Get GitHub token
    const { data: tokenData } = await supabase
      .from('github_tokens')
      .select('encrypted_token, encryption_iv')
      .eq('user_id', user.id)
      .single()

    if (!tokenData?.encrypted_token || !tokenData?.encryption_iv) {
      return {
        success: false,
        error: 'GitHub token not found. Please connect your GitHub account.',
      }
    }

    const githubToken = await decryptToken({
      encrypted: tokenData.encrypted_token,
      iv: tokenData.encryption_iv,
    })

    // Parse repository URL
    const [owner, repo] = repositoryUrl.split('/')

    // Fetch commits from last 30 days for current velocity
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentCommits = await fetchCommitsWithStats(owner, repo, githubToken, thirtyDaysAgo)

    // Calculate current velocity
    const velocityMetrics = calculateVelocityScore(recentCommits)

    // Fetch ALL commits to detect sprint signature (up to 1 year)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const allCommits = await fetchCommitsWithStats(owner, repo, githubToken, oneYearAgo)

    console.log(`🔍 Sprint Detection for ${repositoryUrl}:`, {
      totalCommits: allCommits.length,
      dateRange: allCommits.length > 0 ? {
        oldest: allCommits[allCommits.length - 1]?.date,
        newest: allCommits[0]?.date,
      } : null,
    })

    // Detect sprint window (peak velocity period)
    const sprintSignature = detectSprintWindow(allCommits)

    console.log(`📊 Sprint Result for ${repositoryUrl}:`, sprintSignature ? {
      duration: sprintSignature.duration_days,
      commits: sprintSignature.commits,
      velocity: sprintSignature.velocity_score,
    } : 'NO SPRINT DETECTED')

    // Calculate recent activity for lifecycle status
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentCommits7d = allCommits.filter(
      c => new Date(c.date) >= sevenDaysAgo
    ).length
    const recentCommits30d = recentCommits.length
    const daysSince = daysSinceLastCommit(allCommits)

    // Check uptime (if project has a domain)
    let uptimeMetrics = null
    const { data: domainData } = await supabase
      .from('project_domains')
      .select('domain, is_active')
      .eq('user_id', user.id)
      .eq('repository_url', repositoryUrl)
      .eq('is_active', true)
      .single()

    if (domainData?.domain) {
      // Ensure domain has protocol
      const domainUrl = domainData.domain.startsWith('http')
        ? domainData.domain
        : `https://${domainData.domain}`

      uptimeMetrics = await checkUptime(domainUrl)
    }

    // Fetch user-defined project timeline (if exists) BEFORE lifecycle determination
    const { data: timelineData } = await supabase
      .from('project_timeline')
      .select('project_start_date, project_end_date')
      .eq('user_id', user.id)
      .eq('repository_url', repositoryUrl)
      .single()

    // Determine if user marked project as ongoing (no end date)
    const userDefinedOngoing = timelineData && !timelineData.project_end_date

    console.log(`📋 Lifecycle Input for ${repositoryUrl}:`, {
      timelineExists: !!timelineData,
      hasEndDate: !!timelineData?.project_end_date,
      userDefinedOngoing,
      recentCommits7d,
      recentCommits30d,
      isLive: uptimeMetrics?.current_status === 'Live',
    })

    // Determine lifecycle status
    const isLive = uptimeMetrics?.current_status === 'Live'
    const lifecycleStatus = determineLifecycleStatus(
      recentCommits7d,
      recentCommits30d,
      isLive,
      daysSince,
      userDefinedOngoing || undefined
    )

    console.log(`✅ Lifecycle Result for ${repositoryUrl}:`, {
      status: lifecycleStatus.status,
      reasoning: lifecycleStatus.reasoning,
    })

    // Build sprint signature with label
    let sprintSignatureWithLabel = null
    if (sprintSignature) {
      sprintSignatureWithLabel = {
        ...sprintSignature,
        label: getSprintLabel(sprintSignature.velocity_score),
      }
    }

    // Calculate project timeline metrics
    const projectTimeline = calculateProjectTimeline({
      project_start_date: timelineData?.project_start_date || null,
      project_end_date: timelineData?.project_end_date || null,
      commits: allCommits,
      sprint_signature: sprintSignatureWithLabel,
    })

    // Build pulse metrics
    const pulseMetrics: PulseMetrics = {
      project_id: `${owner}-${repo}`,
      repository_url: repositoryUrl,
      metrics: {
        velocity: velocityMetrics,
        uptime: uptimeMetrics,
        sprint_signature: sprintSignatureWithLabel,
        lifecycle: {
          ...lifecycleStatus,
          days_since_last_commit: daysSince,
        },
        timeline: projectTimeline,
      },
      verification_badge: 'Verified by Aura Agent',
      last_updated: new Date().toISOString(),
    }

    // Cache the results
    await supabase
      .from('pulse_metrics_cache')
      .upsert({
        user_id: user.id,
        repository_url: repositoryUrl,
        metrics: pulseMetrics,
        cached_at: new Date().toISOString(),
      })

    return {
      success: true,
      data: pulseMetrics,
    }
  } catch (error) {
    console.error('Error calculating pulse metrics:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate pulse metrics',
    }
  }
}

/**
 * Get heatmap data for a repository
 */
export async function getVelocityHeatmap(
  repositoryUrl: string,
  days: number = 30
): Promise<ApiResponse<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Get GitHub token
    const { data: tokenData } = await supabase
      .from('github_tokens')
      .select('encrypted_token, encryption_iv')
      .eq('user_id', user.id)
      .single()

    if (!tokenData?.encrypted_token || !tokenData?.encryption_iv) {
      return {
        success: false,
        error: 'GitHub token not found',
      }
    }

    const githubToken = await decryptToken({
      encrypted: tokenData.encrypted_token,
      iv: tokenData.encryption_iv,
    })

    // Parse repository URL
    const [owner, repo] = repositoryUrl.split('/')

    // Fetch commits
    const since = new Date()
    since.setDate(since.getDate() - days)

    const commits = await fetchCommitsWithStats(owner, repo, githubToken, since)

    // Generate heatmap data
    const heatmapData = generateHeatmapData(commits, days)

    return {
      success: true,
      data: heatmapData,
    }
  } catch (error) {
    console.error('Error generating heatmap:', error)
    return {
      success: false,
      error: 'Failed to generate heatmap',
    }
  }
}
