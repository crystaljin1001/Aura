/**
 * Clear pulse metrics cache for testing
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { repositoryUrl } = await request.json()

    if (!repositoryUrl) {
      return NextResponse.json(
        { success: false, error: 'Repository URL required' },
        { status: 400 }
      )
    }

    // Delete cache
    const { error } = await supabase
      .from('pulse_metrics_cache')
      .delete()
      .eq('user_id', user.id)
      .eq('repository_url', repositoryUrl)

    if (error) {
      console.error('Error clearing cache:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to clear cache' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Cache cleared for ${repositoryUrl}`,
    })
  } catch (error) {
    console.error('Error in clear-cache:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
