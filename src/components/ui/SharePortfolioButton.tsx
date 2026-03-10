'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'

interface SharePortfolioButtonProps {
  url: string
  label?: string
}

export function SharePortfolioButton({ url, label = 'Share' }: SharePortfolioButtonProps) {
  const [copied, setCopied] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('input')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-all"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Link2 className="w-3.5 h-3.5" />
        )}
        {copied ? 'Copied!' : label}
      </button>

      {/* URL tooltip */}
      {showTooltip && !copied && (
        <div className="absolute top-full mt-2 right-0 z-50 px-3 py-1.5 rounded-md bg-popover border border-border shadow-lg whitespace-nowrap">
          <p className="text-xs text-muted-foreground font-mono">{url}</p>
        </div>
      )}
    </div>
  )
}
