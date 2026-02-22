/**
 * Global Navigation Header
 * Provides navigation back to dashboard and other key pages
 */

import Link from 'next/link'
import { ArrowLeft, LayoutDashboard, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  showBackButton?: boolean
  backHref?: string
  backLabel?: string
}

export function Header({ showBackButton = false, backHref = '/dashboard', backLabel = 'Back to Dashboard' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Left: Back button or logo */}
        <div className="flex items-center gap-4">
          {showBackButton ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link href={backHref}>
                <ArrowLeft className="w-4 h-4" />
                {backLabel}
              </Link>
            </Button>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Aura
              </span>
            </Link>
          )}
        </div>

        {/* Right: Navigation links */}
        <nav className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            asChild
          >
            <Link href="/dashboard">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            asChild
          >
            <Link href="/storyboard">
              <BookOpen className="w-4 h-4" />
              Storyboard
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
