/**
 * Pulse Metrics API Route
 * GET /api/pulse/:repository - Get pulse metrics for a repository
 */

import { NextRequest, NextResponse } from 'next/server'
import { calculatePulseMetrics } from '@/features/pulse-engine/api/actions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repository: string }> }
) {
  try {
    const resolvedParams = await params
    const repositoryUrl = decodeURIComponent(resolvedParams.repository)

    const result = await calculatePulseMetrics(repositoryUrl)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Pulse API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
