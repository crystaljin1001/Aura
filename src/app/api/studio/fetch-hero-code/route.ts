import { NextRequest, NextResponse } from 'next/server'
import { fetchHeroCommitCode } from '@/features/narrative-storyboarder/api/github-actions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { owner, repo, commitSha, filename } = body

    if (!owner || !repo || !commitSha || !filename) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const result = await fetchHeroCommitCode(owner, repo, commitSha, filename)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[fetch-hero-code] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch code',
      },
      { status: 500 }
    )
  }
}
