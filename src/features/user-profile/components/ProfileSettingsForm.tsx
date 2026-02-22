'use client'

/**
 * Profile Settings Form
 *
 * Allows users to edit their profile information
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, ExternalLink } from 'lucide-react'
import { ProfilePictureUpload } from './ProfilePictureUpload'
import { CVUpload } from './CVUpload'
import { saveUserProfile, updateProfilePicture } from '../api/actions'
import type { UserProfile, OnboardingFormData, AvailabilityStatus } from '../types'

interface ProfileSettingsFormProps {
  initialData?: UserProfile
  userEmail: string
}

export function ProfileSettingsForm({
  initialData,
  userEmail,
}: ProfileSettingsFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  // Form data
  const [fullName, setFullName] = useState(initialData?.fullName || '')
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || '')
  const [bio, setBio] = useState(initialData?.bio || '')
  const [location, setLocation] = useState(initialData?.location || '')
  const [website, setWebsite] = useState(initialData?.website || '')
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl || '')
  const [cvUrl, setCvUrl] = useState(initialData?.cvUrl || '')
  const [githubUsername, setGithubUsername] = useState(
    initialData?.githubUsername || ''
  )
  const [linkedinUrl, setLinkedinUrl] = useState(initialData?.linkedinUrl || '')
  const [twitterUsername, setTwitterUsername] = useState(
    initialData?.twitterUsername || ''
  )
  const [availabilityStatus, setAvailabilityStatus] =
    useState<AvailabilityStatus>(
      initialData?.availabilityStatus || 'available'
    )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

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

        // Update avatar if changed
        if (avatarUrl !== initialData?.avatarUrl) {
          await updateProfilePicture(avatarUrl)
        }

        setSuccess('Profile updated successfully!')
        router.refresh()
      } catch (err) {
        console.error('Save profile error:', err)
        setError('Failed to save profile')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Profile Picture */}
      <div className="bg-muted/30 border border-border rounded-2xl p-8">
        <h2 className="text-xl font-semibold mb-6">Profile Picture</h2>
        <ProfilePictureUpload
          currentAvatarUrl={avatarUrl}
          onUploadComplete={setAvatarUrl}
        />
      </div>

      {/* CV Upload */}
      <div className="bg-muted/30 border border-border rounded-2xl p-8">
        <h2 className="text-xl font-semibold mb-6">CV/Resume</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Upload your CV to enable the &quot;Download CV&quot; button on your portfolio
        </p>
        <CVUpload
          currentCvUrl={cvUrl}
          onUploadComplete={setCvUrl}
        />
      </div>

      {/* Basic Information */}
      <div className="bg-muted/30 border border-border rounded-2xl p-8">
        <h2 className="text-xl font-semibold mb-6">Basic Information</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <Input value={userEmail} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground mt-2">
              Email cannot be changed
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
              Job Title
            </label>
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Product Engineer"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Bio</label>
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
            <label className="block text-sm font-semibold mb-2">Location</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., San Francisco, CA"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Availability Status
            </label>
            <select
              value={availabilityStatus}
              onChange={(e) =>
                setAvailabilityStatus(e.target.value as AvailabilityStatus)
              }
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            >
              <option value="available">Available for opportunities</option>
              <option value="open_to_opportunities">
                Open to opportunities
              </option>
              <option value="unavailable">Not looking</option>
            </select>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-muted/30 border border-border rounded-2xl p-8">
        <h2 className="text-xl font-semibold mb-6">Social Links</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">
              GitHub Username
            </label>
            <Input
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="e.g., alexjohnson"
              maxLength={39}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              LinkedIn URL
            </label>
            <Input
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/alexjohnson"
              type="url"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Twitter Username
            </label>
            <Input
              value={twitterUsername}
              onChange={(e) => setTwitterUsername(e.target.value)}
              placeholder="e.g., alexjohnson"
              maxLength={15}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Personal Website
            </label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
              type="url"
            />
          </div>
        </div>
      </div>

      {/* Preview Link */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">👀</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Preview Your Portfolio</h3>
            <p className="text-sm text-muted-foreground mb-4">
              See how your profile looks on your public portfolio page
            </p>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              View Portfolio
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          {success}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isPending || !fullName}
          className="flex-1 gap-2"
        >
          <Save className="w-4 h-4" />
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
