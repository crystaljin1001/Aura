'use server'

/**
 * User Profile Server Actions
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { UserProfile, OnboardingFormData, AvailabilityStatus } from '../types'
import type { ApiResponse } from '@/types'

/**
 * Validation schema for profile data
 */
const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  jobTitle: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  githubUsername: z.string().max(39).optional(), // GitHub max username length
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  twitterUsername: z.string().max(15).optional(), // Twitter max username length
  availabilityStatus: z.enum(['available', 'unavailable', 'open_to_opportunities']),
})

/**
 * Gets the user profile for the authenticated user
 */
export async function getUserProfile(): Promise<ApiResponse<UserProfile>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        return {
          success: true,
          data: undefined,
        }
      }
      throw error
    }

    const profile: UserProfile = {
      id: data.id,
      userId: data.user_id,
      fullName: data.full_name,
      jobTitle: data.job_title,
      bio: data.bio,
      location: data.location,
      website: data.website,
      avatarUrl: data.avatar_url,
      cvUrl: data.cv_url,
      githubUsername: data.github_username,
      linkedinUrl: data.linkedin_url,
      twitterUsername: data.twitter_username,
      availabilityStatus: data.availability_status as AvailabilityStatus,
      onboardingCompleted: data.onboarding_completed,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    return {
      success: true,
      data: profile,
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return {
      success: false,
      error: 'Failed to fetch profile',
    }
  }
}

/**
 * Creates or updates user profile
 */
export async function saveUserProfile(
  data: OnboardingFormData
): Promise<ApiResponse<void>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    // Validate input
    const validated = profileSchema.parse(data)

    // Upsert profile
    const { error } = await supabase.from('user_profiles').upsert(
      {
        user_id: user.id,
        full_name: validated.fullName,
        job_title: validated.jobTitle || null,
        bio: validated.bio || null,
        location: validated.location || null,
        website: validated.website || null,
        github_username: validated.githubUsername || null,
        linkedin_url: validated.linkedinUrl || null,
        twitter_username: validated.twitterUsername || null,
        availability_status: validated.availabilityStatus,
        onboarding_completed: true,
      },
      {
        onConflict: 'user_id',
      }
    )

    if (error) {
      console.error('Error saving profile:', error)
      return {
        success: false,
        error: 'Failed to save profile',
      }
    }

    revalidatePath('/')
    revalidatePath('/dashboard')
    revalidatePath('/settings')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error saving profile:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Invalid input',
      }
    }

    return {
      success: false,
      error: 'Failed to save profile',
    }
  }
}

/**
 * Updates profile picture URL
 */
export async function updateProfilePicture(
  avatarUrl: string
): Promise<ApiResponse<void>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({ avatar_url: avatarUrl })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating profile picture:', error)
      return {
        success: false,
        error: 'Failed to update profile picture',
      }
    }

    revalidatePath('/')
    revalidatePath('/dashboard')
    revalidatePath('/settings')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error updating profile picture:', error)
    return {
      success: false,
      error: 'Failed to update profile picture',
    }
  }
}

/**
 * Calculates total GitHub stars from user's repositories
 */
export async function calculateGitHubStars(): Promise<number> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return 0
    }

    const { data } = await supabase
      .from('impact_cache')
      .select('stars')
      .eq('user_id', user.id)

    if (!data || data.length === 0) {
      return 0
    }

    return data.reduce((total, repo) => total + (repo.stars || 0), 0)
  } catch {
    return 0
  }
}

/**
 * Calculates total products shipped (completed projects)
 */
export async function calculateProductsShipped(): Promise<number> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return 0
    }

    // Count repositories with videos (completed demos)
    const { count } = await supabase
      .from('project_videos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return count || 0
  } catch {
    return 0
  }
}
