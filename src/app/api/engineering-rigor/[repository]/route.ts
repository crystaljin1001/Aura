/**
 * Engineering Rigor API Route
 * GET /api/engineering-rigor/[repository]
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  calculateRepositoryRigor,
  getCachedRigorMetrics,
} from '@/features/engineering-rigor/api/actions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repository: string }> }
) {
  try {
    const resolvedParams = await params
    const repositoryUrl = decodeURIComponent(resolvedParams.repository)
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('refresh') === 'true'

    // Try to get cached data first unless force refresh
    if (!forceRefresh) {
      const cached = await getCachedRigorMetrics(repositoryUrl)
      if (cached.success && cached.data) {
        return NextResponse.json({
          success: true,
          data: cached.data,
          cached: true,
        })
      }
    }

    // Calculate fresh metrics
    const result = await calculateRepositoryRigor(repositoryUrl, forceRefresh)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to calculate engineering rigor',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      cached: false,
    })
  } catch (error) {
    console.error('Error in engineering-rigor API route:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
