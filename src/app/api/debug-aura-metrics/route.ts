/**
 * Debug endpoint to see actual metrics data for Aura
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' })
    }

    // Get the full impact_cache entry including metrics and repo_data
    const { data: impactData, error } = await supabase
      .from('impact_cache')
      .select('*')
      .eq('user_id', user.id)
      .eq('repo_full_name', 'crystaljin1001/Aura')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message })
    }

    // Extract repo_data to see what GitHub returned
    const repoData = impactData?.repo_data as Record<string, unknown> | null

    return NextResponse.json({
      found: !!impactData,
      cached_at: impactData?.cached_at,

      // The metrics array
      impact_metrics: impactData?.impact_metrics || [],
      metrics_count: Array.isArray(impactData?.impact_metrics)
        ? impactData.impact_metrics.length
        : 0,

      // Raw GitHub data
      repo_data: {
        stars: repoData?.stargazersCount || repoData?.stargazers_count || 0,
        forks: repoData?.forksCount || repoData?.forks_count || 0,
        watchers: repoData?.watchersCount || repoData?.watchers_count || 0,
        openIssues: repoData?.openIssuesCount || repoData?.open_issues_count || 0,
        size: repoData?.size || 0,
        language: repoData?.language,
        hasIssues: repoData?.hasIssues || repoData?.has_issues,
        hasProjects: repoData?.hasProjects || repoData?.has_projects,
        hasWiki: repoData?.hasWiki || repoData?.has_wiki,
        description: repoData?.description,
        createdAt: repoData?.createdAt || repoData?.created_at,
        updatedAt: repoData?.updatedAt || repoData?.updated_at,
        pushedAt: repoData?.pushedAt || repoData?.pushed_at,

        // Show first 5 keys to debug structure
        availableKeys: repoData ? Object.keys(repoData).slice(0, 10) : []
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
