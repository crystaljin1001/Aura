'use client'

/**
 * Next Steps Guidance
 * Shows after user adds their first project
 */

import { useState, useEffect } from 'react'
import { X, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Project } from '../types'

interface NextStepsGuidanceProps {
  projects: Project[]
}

export function NextStepsGuidance({ projects }: NextStepsGuidanceProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  // Load dismissed state from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('nextStepsGuidanceDismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  // Don't show if dismissed or no projects
  if (isDismissed || projects.length === 0) {
    return null
  }

  // Check if user has completed key steps for ALL projects
  const hasAllScripts = projects.every(p => p.hasScript)
  const hasAllVideos = projects.every(p => p.hasVideo)
  const hasAllDomains = projects.every(p => p.hasDomain)

  // If all steps are complete, don't show
  if (hasAllScripts && hasAllVideos && hasAllDomains) {
    return null
  }

  function handleDismiss() {
    setIsDismissed(true)
    localStorage.setItem('nextStepsGuidanceDismissed', 'true')
  }

  return (
    <div className="mb-8 glass-card p-6 border-l-4 border-blue-500">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold">Great! Projects Added</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-muted rounded transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Complete these steps to showcase your projects on your portfolio:
          </p>

          <div className="space-y-3">
            {/* Step 1: Convert README */}
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-6 h-6 rounded-full border-2 ${hasAllScripts ? 'bg-green-500 border-green-500' : 'border-blue-500'} flex items-center justify-center flex-shrink-0`}>
                {hasAllScripts ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <span className="text-xs font-bold text-blue-500">1</span>
                )}
              </div>
              <div>
                <p className={hasAllScripts ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}>
                  Generate Demo Scripts
                </p>
                <p className="text-xs text-muted-foreground">
                  Click <span className="font-semibold">&quot;Convert README&quot;</span> - Aura analyzes your README and generates narration scripts for demo videos
                </p>
              </div>
            </div>

            {/* Step 2: Record Video */}
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-6 h-6 rounded-full border-2 ${hasAllVideos ? 'bg-green-500 border-green-500' : hasAllScripts ? 'border-blue-500' : 'border-muted'} flex items-center justify-center flex-shrink-0`}>
                {hasAllVideos ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <span className={`text-xs font-bold ${hasAllScripts ? 'text-blue-500' : 'text-muted-foreground'}`}>2</span>
                )}
              </div>
              <div>
                <p className={hasAllVideos ? 'text-muted-foreground line-through' : hasAllScripts ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                  Record Your Demo Video
                </p>
                <p className="text-xs text-muted-foreground">
                  Click <span className="font-semibold">&quot;Record Video Demo&quot;</span> - Use the generated script to narrate while recording your project in action
                </p>
              </div>
            </div>

            {/* Step 3: Add Domain (Optional) */}
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-6 h-6 rounded-full border-2 ${hasAllDomains ? 'bg-green-500 border-green-500' : hasAllVideos ? 'border-blue-500' : 'border-muted'} flex items-center justify-center flex-shrink-0`}>
                {hasAllDomains ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <span className={`text-xs font-bold ${hasAllVideos ? 'text-blue-500' : 'text-muted-foreground'}`}>3</span>
                )}
              </div>
              <div>
                <p className={hasAllDomains ? 'text-muted-foreground line-through' : hasAllVideos ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                  Add Domain (Optional)
                </p>
                <p className="text-xs text-muted-foreground">
                  Connect your custom domain or generate an aura.io subdomain for your project
                </p>
              </div>
            </div>

            {/* Final: View Portfolio */}
            <div className="flex items-center gap-3 text-sm pt-2 border-t border-border/50">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">✓</span>
              </div>
              <span className="text-muted-foreground">
                View your live portfolio at{' '}
                <Link href="/" className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1">
                  your portfolio page
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
