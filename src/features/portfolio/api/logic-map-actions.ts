/**
 * Logic Map Server Actions
 * Save and retrieve technical decisions with alternatives and pivot points
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'
import type { PivotPoint, TechDecisionNode } from '../types/logic-map'
import { extractLogicMap } from './ai-logic-map'

/**
 * Save enhanced technical decisions with alternatives
 */
export async function saveEnhancedDecisions(
  repositoryUrl: string,
  decisions: TechDecisionNode[]
): Promise<ApiResponse<{ success: true }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Check if journey exists first - get ALL fields to preserve them
    const { data: existingJourney, error: queryError } = await supabase
      .from('project_technical_journey')
      .select('*')
      .eq('user_id', user.id)
      .eq('repository_url', repositoryUrl)
      .maybeSingle()

    console.log('🔍 Existing journey:', {
      exists: !!existingJourney,
      hasProblemStatement: !!existingJourney?.problem_statement,
    })

    // Prepare upsert data - preserve existing fields!
    const upsertData: Record<string, unknown> = {
      user_id: user.id,
      repository_url: repositoryUrl,
      tech_decisions_enhanced: decisions,
      logic_map_enabled: true,
      // Preserve existing fields
      problem_statement: existingJourney?.problem_statement || 'Technical decisions documented via Logic Map',
      technical_approach: existingJourney?.technical_approach || 'See Logic Map for detailed technical decisions',
      key_challenges: existingJourney?.key_challenges || null,
      outcome: existingJourney?.outcome || null,
      learnings: existingJourney?.learnings || null,
      tech_decisions: existingJourney?.tech_decisions || null,
    }

    console.log('💾 Saving decisions with data:', {
      ...upsertData,
      tech_decisions_enhanced: `${decisions.length} decisions`
    })

    // Update the technical journey with enhanced decisions
    const { error } = await supabase
      .from('project_technical_journey')
      .upsert(upsertData, {
        onConflict: 'user_id,repository_url',
      })

    if (error) {
      console.error('❌ Error saving enhanced decisions:', error)
      return {
        success: false,
        error: `Failed to save decisions: ${error.message || 'Unknown error'}`
      }
    }

    console.log('✅ Decisions saved successfully')
    return { success: true, data: { success: true } }
  } catch (error) {
    console.error('Error in saveEnhancedDecisions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save decisions',
    }
  }
}

/**
 * Get enhanced technical decisions
 */
export async function getEnhancedDecisions(
  repositoryUrl: string
): Promise<ApiResponse<TechDecisionNode[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data, error } = await supabase
      .from('project_technical_journey')
      .select('tech_decisions_enhanced, logic_map_enabled')
      .eq('user_id', user.id)
      .eq('repository_url', repositoryUrl)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: true, data: [] }
      }
      console.error('Error fetching enhanced decisions:', error)
      return { success: false, error: 'Failed to fetch decisions' }
    }

    return {
      success: true,
      data: (data?.tech_decisions_enhanced as TechDecisionNode[]) || [],
    }
  } catch (error) {
    console.error('Error in getEnhancedDecisions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch decisions',
    }
  }
}

/**
 * Save a pivot point
 */
export async function savePivotPoint(
  repositoryUrl: string,
  pivot: Omit<PivotPoint, 'id'>
): Promise<ApiResponse<PivotPoint>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data, error } = await supabase
      .from('project_pivot_points')
      .insert({
        user_id: user.id,
        repository_url: repositoryUrl,
        challenge: pivot.challenge,
        initial_approach: pivot.initialApproach,
        pivot_reasoning: pivot.pivotReasoning,
        new_approach: pivot.newApproach,
        outcome: pivot.outcome || null,
        impact_metric: pivot.impactMetric || null,
        evidence_link: pivot.evidenceLink || null,
        commit_sha: pivot.commitSha || null,
        pivot_date: pivot.pivotDate || null,
        sequence_order: pivot.sequenceOrder || 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving pivot point:', error)
      return { success: false, error: 'Failed to save pivot point' }
    }

    return {
      success: true,
      data: {
        id: data.id,
        challenge: data.challenge,
        initialApproach: data.initial_approach,
        pivotReasoning: data.pivot_reasoning,
        newApproach: data.new_approach,
        outcome: data.outcome,
        impactMetric: data.impact_metric,
        evidenceLink: data.evidence_link,
        commitSha: data.commit_sha,
        pivotDate: data.pivot_date,
        sequenceOrder: data.sequence_order,
      },
    }
  } catch (error) {
    console.error('Error in savePivotPoint:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save pivot point',
    }
  }
}

/**
 * Get all pivot points for a repository
 */
export async function getPivotPoints(
  repositoryUrl: string
): Promise<ApiResponse<PivotPoint[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data, error } = await supabase
      .from('project_pivot_points')
      .select('*')
      .eq('user_id', user.id)
      .eq('repository_url', repositoryUrl)
      .order('sequence_order', { ascending: true })

    if (error) {
      console.error('Error fetching pivot points:', error)
      return { success: false, error: 'Failed to fetch pivot points' }
    }

    return {
      success: true,
      data: data.map(p => ({
        id: p.id,
        challenge: p.challenge,
        initialApproach: p.initial_approach,
        pivotReasoning: p.pivot_reasoning,
        newApproach: p.new_approach,
        outcome: p.outcome,
        impactMetric: p.impact_metric,
        evidenceLink: p.evidence_link,
        commitSha: p.commit_sha,
        pivotDate: p.pivot_date,
        sequenceOrder: p.sequence_order,
      })),
    }
  } catch (error) {
    console.error('Error in getPivotPoints:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch pivot points',
    }
  }
}

/**
 * Delete a pivot point
 */
export async function deletePivotPoint(
  pivotId: string
): Promise<ApiResponse<{ success: true }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { error } = await supabase
      .from('project_pivot_points')
      .delete()
      .eq('id', pivotId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting pivot point:', error)
      return { success: false, error: 'Failed to delete pivot point' }
    }

    return { success: true, data: { success: true } }
  } catch (error) {
    console.error('Error in deletePivotPoint:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete pivot point',
    }
  }
}

/**
 * Generate Logic Map using AI
 * Enhanced with Video-to-Map and Commit-to-Map extraction
 */
export async function generateLogicMapFromProject(
  repositoryUrl: string
): Promise<ApiResponse<{ decisions: TechDecisionNode[]; pivots: PivotPoint[] }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Parse repository URL (format: "owner/repo")
    const [owner, repo] = repositoryUrl.split('/')

    // Fetch comprehensive project data
    const [repoData, journeyData, videoData] = await Promise.all([
      supabase
        .from('user_repositories')
        .select('*')
        .eq('user_id', user.id)
        .eq('repo_owner', owner)
        .eq('repo_name', repo)
        .single(),
      supabase
        .from('project_technical_journey')
        .select('problem_statement, technical_approach, key_challenges, learnings')
        .eq('user_id', user.id)
        .eq('repository_url', repositoryUrl)
        .single(),
      supabase
        .from('project_videos')
        .select('video_url, transcript, duration_seconds')
        .eq('user_id', user.id)
        .eq('repository_url', repositoryUrl)
        .single(),
    ])

    if (repoData.error || !repoData.data) {
      return { success: false, error: 'Project not found. Please add this repository first.' }
    }

    // Get GitHub token for commit history analysis
    const { data: tokenData } = await supabase
      .from('github_tokens')
      .select('encrypted_token, encryption_iv')
      .eq('user_id', user.id)
      .single()

    let commitHistory: string | undefined
    if (tokenData?.encrypted_token && tokenData?.encryption_iv) {
      try {
        const { decryptToken } = await import('@/lib/encryption/crypto')
        const githubToken = await decryptToken({
          encrypted: tokenData.encrypted_token,
          iv: tokenData.encryption_iv,
        })

        // Fetch recent commits to identify pivot points (pulse spikes)
        const { fetchCommitsWithStats } = await import('@/features/pulse-engine/utils/github-commit-analyzer')
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const commits = await fetchCommitsWithStats(owner, repo, githubToken, thirtyDaysAgo)

        // Format commit history for AI
        commitHistory = commits
          .slice(0, 20) // Last 20 commits
          .map(c => `[${new Date(c.date).toLocaleDateString()}] ${c.message} (+${c.additions} -${c.deletions})`)
          .join('\n')
      } catch (error) {
        console.log('Could not fetch commits:', error)
        // Continue without commit history
      }
    }

    // Build comprehensive context for AI
    const existingJourney = journeyData.data
      ? [
          journeyData.data.problem_statement,
          journeyData.data.technical_approach,
          journeyData.data.key_challenges,
          journeyData.data.learnings,
        ]
          .filter(Boolean)
          .join('\n\n')
      : undefined

    // Extract Logic Map using AI with all available context
    const result = await extractLogicMap({
      projectName: repo,
      description: `${owner}/${repo}`,
      existingJourney,
      commitHistory,
    })

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'AI extraction failed. Try adding more context to your Technical Journey first.'
      }
    }

    // Save the extracted decisions
    await saveEnhancedDecisions(repositoryUrl, result.data.decisions)

    // Save pivot points
    for (const pivot of result.data.pivots) {
      await savePivotPoint(repositoryUrl, pivot)
    }

    return {
      success: true,
      data: {
        decisions: result.data.decisions,
        pivots: result.data.pivots,
      },
    }
  } catch (error) {
    console.error('Error in generateLogicMapFromProject:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate logic map',
    }
  }
}
