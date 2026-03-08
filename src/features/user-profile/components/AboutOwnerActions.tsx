'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2, Pencil } from 'lucide-react'
import { generateAboutSection } from '../api/about-actions'
import { EditAboutModal } from './EditAboutModal'
import type { AboutSectionData } from '../types'

interface AboutOwnerActionsProps {
  currentData: AboutSectionData
}

export function AboutOwnerActions({ currentData }: AboutOwnerActionsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [liveData, setLiveData] = useState<AboutSectionData>(currentData)
  const router = useRouter()

  async function handleGenerate() {
    setIsGenerating(true)
    setGenerateError(null)
    try {
      const result = await generateAboutSection()
      if (result.success && result.data) {
        setLiveData(result.data)
        router.refresh()
      } else {
        setGenerateError(result.error ?? 'Generation failed')
      }
    } catch {
      setGenerateError('Something went wrong')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isGenerating ? 'Generating…' : 'Generate with AI'}
        </button>

        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </button>

        {generateError && (
          <p className="text-xs text-red-400 w-full">{generateError}</p>
        )}
      </div>

      <EditAboutModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        initialData={liveData}
      />
    </>
  )
}
