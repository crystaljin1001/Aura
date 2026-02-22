/**
 * User Profile types
 */

export type AvailabilityStatus = 'available' | 'unavailable' | 'open_to_opportunities'

export interface UserProfile {
  id: string
  userId: string
  fullName: string
  jobTitle?: string
  bio?: string
  location?: string
  website?: string
  avatarUrl?: string
  cvUrl?: string
  githubUsername?: string
  linkedinUrl?: string
  twitterUsername?: string
  availabilityStatus: AvailabilityStatus
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface OnboardingFormData {
  fullName: string
  jobTitle?: string
  bio?: string
  location?: string
  website?: string
  githubUsername?: string
  linkedinUrl?: string
  twitterUsername?: string
  availabilityStatus: AvailabilityStatus
}
