'use client'

/**
 * Hero Asset Component for Chapter 1
 * Shows either the first image from README or an auto-generated title card
 */

interface HeroAssetProps {
  projectName: string
  tagline?: string
  readmeImageUrl?: string
}

export function HeroAsset({ projectName, tagline, readmeImageUrl }: HeroAssetProps) {
  // Option A: If README has an image, show it
  if (readmeImageUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="max-w-4xl w-full">
          <img
            src={readmeImageUrl}
            alt={projectName}
            className="w-full h-auto rounded-xl shadow-2xl border border-slate-700"
          />
        </div>
      </div>
    )
  }

  // Option B (Fallback): Auto-generated title card
  return (
    <div className="w-full h-full flex items-center justify-center p-12 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="max-w-3xl w-full text-center space-y-8">
        {/* Project Name */}
        <h1 className="text-6xl font-bold text-white leading-tight tracking-tight">
          {projectName}
        </h1>

        {/* Tagline */}
        {tagline && (
          <p className="text-2xl text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
            {tagline}
          </p>
        )}

        {/* Decorative Accent Line */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <div className="h-1 w-16 bg-gradient-to-r from-transparent to-blue-500 rounded-full"></div>
          <div className="h-1.5 w-24 bg-blue-500 rounded-full"></div>
          <div className="h-1 w-16 bg-gradient-to-l from-transparent to-blue-500 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}
