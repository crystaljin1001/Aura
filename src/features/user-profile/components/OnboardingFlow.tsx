'use client'

/**
 * Onboarding Flow
 *
 * Multi-step form for new users to set up their profile
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { ProfilePictureUpload } from './ProfilePictureUpload'
import { saveUserProfile, updateProfilePicture } from '../api/actions'
import type { OnboardingFormData, AvailabilityStatus } from '../types'
import { cn } from '@/utils/cn'

export function OnboardingFlow() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string>('')

  // Form data
  const [fullName, setFullName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [githubUsername, setGithubUsername] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [twitterUsername, setTwitterUsername] = useState('')
  const [availabilityStatus, setAvailabilityStatus] =
    useState<AvailabilityStatus>('available')

  const totalSteps = 3

  function canProceed(): boolean {
    if (step === 1) {
      return fullName.trim().length >= 2
    }
    return true // Steps 2 and 3 are optional
  }

  function handleNext() {
    if (canProceed() && step < totalSteps) {
      setStep(step + 1)
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  async function handleComplete() {
    setError('')

    startTransition(async () => {
      try {
        // Save profile
        const profileData: OnboardingFormData = {
          fullName,
          jobTitle: jobTitle || undefined,
          bio: bio || undefined,
          location: location || undefined,
          website: website || undefined,
          githubUsername: githubUsername || undefined,
          linkedinUrl: linkedinUrl || undefined,
          twitterUsername: twitterUsername || undefined,
          availabilityStatus,
        }

        const result = await saveUserProfile(profileData)

        if (!result.success) {
          setError(result.error || 'Failed to save profile')
          return
        }

        // Update avatar if uploaded
        if (avatarUrl) {
          await updateProfilePicture(avatarUrl)
        }

        // Redirect to dashboard
        router.push('/dashboard')
      } catch (err) {
        console.error('Onboarding error:', err)
        setError('Failed to complete onboarding')
      }
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to Aura! 👋</h1>
          <p className="text-muted-foreground text-lg">
            Let&apos;s set up your profile to make your portfolio stand out
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 rounded-full transition-all',
                i + 1 === step
                  ? 'w-16 bg-blue-500'
                  : i + 1 < step
                  ? 'w-8 bg-green-500'
                  : 'w-8 bg-muted'
              )}
            />
          ))}
        </div>

        {/* Form card */}
        <div className="bg-muted/30 border border-border rounded-2xl p-8 mb-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Tell us about yourself</h2>
                <p className="text-sm text-muted-foreground">
                  Start with the basics
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Alex Johnson"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Job Title <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Product Engineer"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Bio <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your work, interests, and what you're passionate about..."
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {bio.length}/500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Location <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                  maxLength={100}
                />
              </div>
            </div>
          )}

          {/* Step 2: Profile Picture */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Add a profile picture</h2>
                <p className="text-sm text-muted-foreground">
                  Help people recognize you
                </p>
              </div>

              <ProfilePictureUpload
                currentAvatarUrl={avatarUrl}
                onUploadComplete={setAvatarUrl}
                className="py-8"
              />
            </div>
          )}

          {/* Step 3: Social Links */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Connect your profiles</h2>
                <p className="text-sm text-muted-foreground">
                  All fields are optional
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">GitHub Username</label>
                <Input
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="e.g., alexjohnson"
                  maxLength={39}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">LinkedIn URL</label>
                <Input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/alexjohnson"
                  type="url"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Twitter Username</label>
                <Input
                  value={twitterUsername}
                  onChange={(e) => setTwitterUsername(e.target.value)}
                  placeholder="e.g., alexjohnson"
                  maxLength={15}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Personal Website</label>
                <Input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  type="url"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Availability Status</label>
                <select
                  value={availabilityStatus}
                  onChange={(e) =>
                    setAvailabilityStatus(e.target.value as AvailabilityStatus)
                  }
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                >
                  <option value="available">Available for opportunities</option>
                  <option value="open_to_opportunities">Open to opportunities</option>
                  <option value="unavailable">Not looking</option>
                </select>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || isPending}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isPending}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed() || isPending}
              className="gap-2"
            >
              {isPending ? (
                'Completing...'
              ) : (
                <>
                  Complete
                  <Check className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
