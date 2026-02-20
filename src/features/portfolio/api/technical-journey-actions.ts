'use server'

/**
 * Server actions for Technical Journey management
 */

import { createClient } from '@/lib/supabase/server'
import { AuthenticationError, ValidationError } from '@/utils/errors'
import type { ApiResponse } from '@/types'
import type { TechnicalJourney, TechDecision, ArchitecturalTradeoff } from '../types'
import { z } from 'zod'

/**
 * Validation schema for technical journey
 */
const technicalJourneySchema = z.object({
  repositoryUrl: z.string().min(1),
  problemStatement: z.string().min(50, 'Problem statement must be at least 50 characters').max(1000),
  technicalApproach: z.string().min(100, 'Technical approach must be at least 100 characters').max(2000),
  keyChallenges: z.string().max(1000).optional(),
  outcome: z.string().max(1000).optional(),
  learnings: z.array(z.string()).max(10).optional(),
  techDecisions: z.array(z.object({
    technology: z.string().min(1).max(100),
    reason: z.string().min(10).max(500),
    // ENHANCED: Trade-off analysis fields
    alternativesConsidered: z.array(z.string().max(100)).max(10).optional(),
    tradeoffs: z.object({
      benefits: z.array(z.string().max(200)).max(10).optional(),
      drawbacks: z.array(z.string().max(200)).max(10).optional(),
      rejectionReasons: z.record(z.string().max(100), z.string().max(300)).optional(),
    }).optional(),
    evidenceLink: z.string().url().max(500).optional(),
  })).max(15).optional(),
  // NEW: Architectural trade-offs
  architecturalTradeoffs: z.array(z.object({
    decision: z.string().min(10).max(200),
    chosen: z.string().min(1).max(100),
    rationale: z.string().min(20).max(1000),
    evidenceLink: z.string().url().max(500).optional(),
  })).max(10).optional(),
})

/**
 * Gets the authenticated user or throws error
 */
async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AuthenticationError('You must be signed in to save technical journey')
  }

  return user
}

/**
 * Saves technical journey for a project
 */
export async function saveTechnicalJourney(
  data: TechnicalJourney & { repositoryUrl: string }
): Promise<ApiResponse<void>> {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser()

    // Validate input
    const validated = technicalJourneySchema.parse(data)

    // Save to database
    const supabase = await createClient()
    const { error: dbError } = await supabase
      .from('project_technical_journey')
      .upsert({
        user_id: user.id,
        repository_url: validated.repositoryUrl,
        problem_statement: validated.problemStatement,
        technical_approach: validated.technicalApproach,
        key_challenges: validated.keyChallenges || null,
        outcome: validated.outcome || null,
        learnings: validated.learnings || [],
        tech_decisions: validated.techDecisions || [],
        architectural_tradeoffs: validated.architecturalTradeoffs || [],
      }, {
        onConflict: 'user_id,repository_url',
      })

    if (dbError) {
      console.error('Failed to save technical journey:', dbError)
      throw new Error('Failed to save technical journey')
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error saving technical journey:', error)

    if (error instanceof AuthenticationError || error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      }
    }

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Invalid input',
      }
    }

    return {
      success: false,
      error: 'Failed to save technical journey. Please try again.',
    }
  }
}

/**
 * Gets technical journey for a repository
 */
export async function getTechnicalJourney(
  repositoryUrl: string
): Promise<ApiResponse<TechnicalJourney>> {
  try {
    const user = await getAuthenticatedUser()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('project_technical_journey')
      .select('*')
      .eq('user_id', user.id)
      .eq('repository_url', repositoryUrl)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No journey found - this is ok
        return {
          success: true,
          data: undefined,
        }
      }

      throw error
    }

    const journey: TechnicalJourney = {
      problemStatement: data.problem_statement,
      technicalApproach: data.technical_approach,
      keyChallenges: data.key_challenges,
      outcome: data.outcome,
      learnings: data.learnings || [],
      techDecisions: (data.tech_decisions as TechDecision[]) || [],
      architecturalTradeoffs: (data.architectural_tradeoffs as ArchitecturalTradeoff[]) || [],
    }

    return {
      success: true,
      data: journey,
    }
  } catch (error) {
    console.error('Error fetching technical journey:', error)

    if (error instanceof AuthenticationError) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to fetch technical journey.',
    }
  }
}
