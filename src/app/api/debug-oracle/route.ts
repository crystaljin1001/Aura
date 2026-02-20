/**
 * Debug endpoint for oracle-plan-craft
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

    // Get the full impact_cache entry
    const { data: impactData, error } = await supabase
      .from('impact_cache')
      .select('*')
      .eq('user_id', user.id)
      .eq('repo_full_name', 'crystaljin1001/oracle-plan-craft')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message })
    }

    const repoData = impactData?.repo_data as Record<string, unknown> | null

    return NextResponse.json({
      found: !!impactData,
      cached_at: impactData?.cached_at,
      impact_metrics: impactData?.impact_metrics || [],
      metrics_count: Array.isArray(impactData?.impact_metrics)
        ? impactData.impact_metrics.length
        : 0,
      non_zero_count: Array.isArray(impactData?.impact_metrics)
        ? impactData.impact_metrics.filter((m: any) => m.value > 0).length
        : 0,
      repo_data: {
        stars: repoData?.stargazersCount || repoData?.stargazers_count || 0,
        forks: repoData?.forksCount || repoData?.forks_count || 0,
        watchers: repoData?.watchersCount || repoData?.watchers_count || 0,
        openIssues: repoData?.openIssuesCount || repoData?.open_issues_count || 0,
        language: repoData?.language,
        description: repoData?.description,
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
