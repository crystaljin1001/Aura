'use server'

/**
 * Server Actions for Critique Management
 *
 * Save and retrieve critique results from database
 */

import { createClient } from '@/lib/supabase/server'
import { AuthenticationError } from '@/utils/errors'
import type { ApiResponse } from '@/types'
import type { CritiqueResult } from './criticize-agent'

/**
 * Save critique results to database
 */
export async function saveCritique(
  repositoryUrl: string,
  critique: CritiqueResult
): Promise<ApiResponse<void>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new AuthenticationError('You must be signed in to save critique')
    }

    const { error: dbError } = await supabase.from('project_critiques').upsert(
      {
        user_id: user.id,
        repository_url: repositoryUrl,
        architectural_debt: critique.architecturalDebt,
        production_gaps: critique.productionGaps,
        narrative_gaps: critique.narrativeGaps,
      },
      {
        onConflict: 'user_id,repository_url',
      }
    )

    if (dbError) {
      console.error('Failed to save critique:', dbError)
      throw new Error('Failed to save critique')
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error saving critique:', error)

    if (error instanceof AuthenticationError) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to save critique. Please try again.',
    }
  }
}

/**
 * Get critique for a repository
 */
export async function getCritique(repositoryUrl: string): Promise<ApiResponse<CritiqueResult>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new AuthenticationError('You must be signed in to view critique')
    }

    const { data, error } = await supabase
      .from('project_critiques')
      .select('*')
      .eq('user_id', user.id)
      .eq('repository_url', repositoryUrl)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No critique found
        return {
          success: true,
          data: undefined,
        }
      }

      throw error
    }

    const critique: CritiqueResult = {
      architecturalDebt: data.architectural_debt || [],
      productionGaps: data.production_gaps || [],
      narrativeGaps: data.narrative_gaps || [],
    }

    return {
      success: true,
      data: critique,
    }
  } catch (error) {
    console.error('Error fetching critique:', error)

    if (error instanceof AuthenticationError) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to fetch critique.',
    }
  }
}
