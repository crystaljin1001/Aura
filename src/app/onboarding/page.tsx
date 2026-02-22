/**
 * Onboarding Page
 *
 * Appears after user signs up for the first time
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingFlow } from '@/features/user-profile/components/OnboardingFlow'
import { getUserProfile } from '@/features/user-profile/api/actions'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Check if onboarding is already completed
  const profileResult = await getUserProfile()
  if (profileResult.success && profileResult.data?.onboardingCompleted) {
    redirect('/dashboard')
  }

  return <OnboardingFlow />
}
