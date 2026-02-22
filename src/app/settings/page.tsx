/**
 * Settings Page
 *
 * User profile settings and customization
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/features/user-profile/api/actions'
import { ProfileSettingsForm } from '@/features/user-profile/components/ProfileSettingsForm'
import Link from 'next/link'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const profileResult = await getUserProfile()

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-2xl font-bold">
                Aura
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Portfolio
                </Link>
                <Link
                  href="/settings"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Settings
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your profile information and portfolio display
            </p>
          </div>

          <ProfileSettingsForm
            initialData={profileResult.data}
            userEmail={user.email || ''}
          />
        </div>
      </main>
    </div>
  )
}
