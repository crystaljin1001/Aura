'use client'

/**
 * CV Upload Component
 * Allows users to upload their CV/Resume as PDF
 */

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Upload, FileText, X, Download } from 'lucide-react'

interface CVUploadProps {
  currentCvUrl?: string | null
  onUploadComplete: (url: string) => void
}

export function CVUpload({ currentCvUrl, onUploadComplete }: CVUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>('')
  const supabase = createClient()

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Delete old CV if exists
      if (currentCvUrl) {
        const oldPath = currentCvUrl.split('/').pop()
        if (oldPath) {
          await supabase.storage.from('cvs').remove([`${user.id}/${oldPath}`])
        }
      }

      // Upload new CV
      const fileName = `cv-${Date.now()}.pdf`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('cvs')
        .getPublicUrl(filePath)

      // Update profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ cv_url: publicUrl })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      onUploadComplete(publicUrl)
    } catch (err) {
      console.error('CV upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload CV')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDelete() {
    if (!currentCvUrl) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const path = currentCvUrl.split('/').pop()
      if (path) {
        await supabase.storage.from('cvs').remove([`${user.id}/${path}`])
      }

      await supabase
        .from('user_profiles')
        .update({ cv_url: null })
        .eq('user_id', user.id)

      onUploadComplete('')
    } catch (err) {
      console.error('CV delete error:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete CV')
    }
  }

  return (
    <div className="space-y-4">
      {currentCvUrl ? (
        <div className="flex items-center gap-4 p-4 bg-muted/50 border border-border rounded-lg">
          <FileText className="w-8 h-8 text-blue-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">CV Uploaded</p>
            <p className="text-xs text-muted-foreground truncate">
              {currentCvUrl.split('/').pop()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={currentCvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Upload your CV/Resume</p>
              <p className="text-xs text-muted-foreground mb-4">
                PDF only, max 5MB
              </p>
              <label htmlFor="cv-upload">
                <Button
                  type="button"
                  disabled={isUploading}
                  className="cursor-pointer"
                  onClick={() => document.getElementById('cv-upload')?.click()}
                >
                  {isUploading ? 'Uploading...' : 'Choose File'}
                </Button>
              </label>
              <input
                id="cv-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  )
}
