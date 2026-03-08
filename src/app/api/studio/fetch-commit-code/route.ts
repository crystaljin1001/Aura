import { NextRequest, NextResponse } from 'next/server'
import { fetchCommitCodeBySha } from '@/features/narrative-storyboarder/api/github-actions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { owner, repo, commitSha } = body

    if (!owner || !repo || !commitSha) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const result = await fetchCommitCodeBySha(owner, repo, commitSha)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch code' },
      { status: 500 }
    )
  }
}
