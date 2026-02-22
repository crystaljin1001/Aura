/**
 * Project Timeline Server Actions
 * Allows users to define project start/end dates for more accurate velocity calculation
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'

export interface ProjectTimelineInput {
  repository_url: string
  project_start_date: string | null // ISO date string
  project_end_date: string | null // ISO date string (null if ongoing)
}

/**
 * Save or update project timeline
 */
export async function saveProjectTimeline(
  input: ProjectTimelineInput
): Promise<ApiResponse<{ success: true }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Validate and normalize dates to UTC midnight (prevents timezone shifting)
    let normalizedStartDate: string | null = null
    let normalizedEndDate: string | null = null

    if (input.project_start_date) {
      const dateStr = input.project_start_date.split('T')[0] // Get YYYY-MM-DD part only
      normalizedStartDate = `${dateStr}T00:00:00.000Z` // Force UTC midnight

      const startDate = new Date(normalizedStartDate)
      if (isNaN(startDate.getTime())) {
        return {
          success: false,
          error: 'Invalid start date format',
        }
      }
    }

    if (input.project_end_date) {
      const dateStr = input.project_end_date.split('T')[0] // Get YYYY-MM-DD part only
      normalizedEndDate = `${dateStr}T00:00:00.000Z` // Force UTC midnight

      const endDate = new Date(normalizedEndDate)
      if (isNaN(endDate.getTime())) {
        return {
          success: false,
          error: 'Invalid end date format',
        }
      }

      // Ensure end date is after start date
      if (normalizedStartDate) {
        const startDate = new Date(normalizedStartDate)
        if (endDate < startDate) {
          return {
            success: false,
            error: 'End date must be after start date',
          }
        }
      }
    }

    // Upsert timeline with conflict resolution on user_id + repository_url
    const { error } = await supabase
      .from('project_timeline')
      .upsert(
        {
          user_id: user.id,
          repository_url: input.repository_url,
          project_start_date: normalizedStartDate,
          project_end_date: normalizedEndDate,
        },
        {
          onConflict: 'user_id,repository_url', // Specify unique constraint columns
        }
      )

    if (error) {
      console.error('Error saving project timeline:', error)
      return {
        success: false,
        error: 'Failed to save project timeline',
      }
    }

    // Invalidate pulse metrics cache to force recalculation
    await supabase
      .from('pulse_metrics_cache')
      .delete()
      .eq('user_id', user.id)
      .eq('repository_url', input.repository_url)

    return {
      success: true,
      data: { success: true },
    }
  } catch (error) {
    console.error('Error in saveProjectTimeline:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save project timeline',
    }
  }
}

/**
 * Get project timeline for a repository
 */
export async function getProjectTimeline(
  repositoryUrl: string
): Promise<ApiResponse<ProjectTimelineInput | null>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    const { data, error } = await supabase
      .from('project_timeline')
      .select('repository_url, project_start_date, project_end_date')
      .eq('user_id', user.id)
      .eq('repository_url', repositoryUrl)
      .single()

    if (error) {
      // No timeline found is not an error - just return null
      if (error.code === 'PGRST116') {
        return {
          success: true,
          data: null,
        }
      }

      console.error('Error fetching project timeline:', error)
      return {
        success: false,
        error: 'Failed to fetch project timeline',
      }
    }

    return {
      success: true,
      data: {
        repository_url: data.repository_url,
        project_start_date: data.project_start_date,
        project_end_date: data.project_end_date,
      },
    }
  } catch (error) {
    console.error('Error in getProjectTimeline:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch project timeline',
    }
  }
}

/**
 * Delete project timeline
 */
export async function deleteProjectTimeline(
  repositoryUrl: string
): Promise<ApiResponse<{ success: true }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    const { error } = await supabase
      .from('project_timeline')
      .delete()
      .eq('user_id', user.id)
      .eq('repository_url', repositoryUrl)

    if (error) {
      console.error('Error deleting project timeline:', error)
      return {
        success: false,
        error: 'Failed to delete project timeline',
      }
    }

    // Invalidate pulse metrics cache to force recalculation
    await supabase
      .from('pulse_metrics_cache')
      .delete()
      .eq('user_id', user.id)
      .eq('repository_url', repositoryUrl)

    return {
      success: true,
      data: { success: true },
    }
  } catch (error) {
    console.error('Error in deleteProjectTimeline:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete project timeline',
    }
  }
}
