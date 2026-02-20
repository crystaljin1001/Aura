/**
 * Debug endpoint to check repository access
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
        error: 'Not authenticated',
        authError: authError?.message
      })
    }

    // Check user_repositories
    const { data: repos, error: reposError } = await supabase
      .from('user_repositories')
      .select('*')

    // Check impact_cache
    const { data: cache, error: cacheError } = await supabase
      .from('impact_cache')
      .select('repo_full_name, cached_at')

    return NextResponse.json({
      authenticated: true,
      userId: user.id,
      email: user.email,
      userRepositories: {
        count: repos?.length || 0,
        data: repos,
        error: reposError?.message
      },
      impactCache: {
        count: cache?.length || 0,
        data: cache,
        error: cacheError?.message
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
