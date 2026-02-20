'use client'

/**
 * Technical Journey Modal Wrapper
 *
 * Handles opening the Technical Journey form based on query parameters
 */

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TechnicalJourneyForm } from './TechnicalJourneyForm'
import { X } from 'lucide-react'

export function TechnicalJourneyModalWrapper() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editRepo = searchParams.get('edit')

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(!!editRepo)
  }, [editRepo])

  function handleClose() {
    setIsOpen(false)
    router.push('/dashboard')
  }

  function handleSaved() {
    setIsOpen(false)
    // Redirect to case study page to see the result
    const portfolioPath = editRepo ? `/portfolio/${editRepo.replace('/', '-')}` : '/dashboard'
    router.push(portfolioPath)
    router.refresh()
  }

  if (!isOpen || !editRepo) {
    return null
  }

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-screen px-4 flex items-center justify-center">
          <div className="relative bg-background border border-border rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-border px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Write Technical Journey</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Tell the story behind {editRepo}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-8">
              <TechnicalJourneyForm
                repositoryUrl={editRepo}
                onSaved={handleSaved}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
