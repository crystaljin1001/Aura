/**
 * Debug endpoint specifically for Aura repository
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        authenticated: false,
        error: 'Not authenticated'
      })
    }

    const repositoryUrl = 'crystaljin1001/Aura'

    // Query 1: Check user_repositories (what getCaseStudyData does)
    const { data: repoData, error: repoError } = await supabase
      .from('user_repositories')
      .select('*')
      .eq('user_id', user.id)
      .eq('repo_owner', 'crystaljin1001')
      .eq('repo_name', 'Aura')
      .single()

    // Query 2: Check impact_cache WITH user_id filter (what getCaseStudyData does)
    const { data: impactWithUser, error: impactWithUserError } = await supabase
      .from('impact_cache')
      .select('*')
      .eq('user_id', user.id)
      .eq('repo_full_name', repositoryUrl)
      .single()

    // Query 3: Check impact_cache WITHOUT user_id filter (to see if it exists at all)
    const { data: impactAny, error: impactAnyError } = await supabase
      .from('impact_cache')
      .select('*')
      .eq('repo_full_name', repositoryUrl)

    // Query 4: Check ALL impact_cache for this user
    const { data: allUserImpacts, error: allImpactsError } = await supabase
      .from('impact_cache')
      .select('repo_full_name, user_id, cached_at')
      .eq('user_id', user.id)

    return NextResponse.json({
      authenticated: true,
      currentUserId: user.id,

      // What getCaseStudyData queries
      userRepository: {
        found: !!repoData,
        data: repoData,
        error: repoError?.message
      },

      // Impact cache with user_id filter (getCaseStudyData query)
      impactCacheWithUserId: {
        found: !!impactWithUser,
        data: impactWithUser ? {
          user_id: impactWithUser.user_id,
          repo_full_name: impactWithUser.repo_full_name,
          cached_at: impactWithUser.cached_at,
          hasMetrics: Array.isArray(impactWithUser.impact_metrics) && impactWithUser.impact_metrics.length > 0
        } : null,
        error: impactWithUserError?.message
      },

      // Impact cache without user_id filter (to check if entry exists)
      impactCacheAnyUser: {
        found: impactAny && impactAny.length > 0,
        count: impactAny?.length || 0,
        data: impactAny?.map((item: any) => ({
          user_id: item.user_id,
          repo_full_name: item.repo_full_name,
          cached_at: item.cached_at,
          userIdMatches: item.user_id === user.id
        })),
        error: impactAnyError?.message
      },

      // All impact cache entries for this user
      allUserImpacts: {
        count: allUserImpacts?.length || 0,
        repos: allUserImpacts?.map(item => item.repo_full_name),
        error: allImpactsError?.message
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
