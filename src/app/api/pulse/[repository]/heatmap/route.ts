/**
 * Velocity Heatmap API Route
 * GET /api/pulse/:repository/heatmap - Get velocity heatmap data
 */

import { NextRequest, NextResponse } from 'next/server'
import { getVelocityHeatmap } from '@/features/pulse-engine/api/actions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repository: string }> }
) {
  try {
    const resolvedParams = await params
    const repositoryUrl = decodeURIComponent(resolvedParams.repository)

    // Get days parameter from query string
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30')

    const result = await getVelocityHeatmap(repositoryUrl, days)

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
    console.error('Heatmap API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
