'use client'

/**
 * Profile Picture Upload Component
 *
 * Handles profile picture upload to Supabase Storage
 */

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, User, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ProfilePictureUploadProps {
  currentAvatarUrl?: string
  onUploadComplete: (url: string) => void
  className?: string
}

export function ProfilePictureUpload({
  currentAvatarUrl,
  onUploadComplete,
  className,
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    currentAvatarUrl
  )
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setError('')
      setUploading(true)

      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB')
        return
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        return
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError('Failed to upload image')
        return
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(data.path)

      setPreviewUrl(publicUrl)
      onUploadComplete(publicUrl)
    } catch (err) {
      console.error('Error uploading file:', err)
      setError('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Preview */}
      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted border-4 border-border">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-16 h-16 text-muted-foreground" />
          </div>
        )}

        {/* Upload overlay */}
        {!uploading && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <Upload className="w-8 h-8 text-white" />
          </button>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Upload button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors disabled:opacity-50"
      >
        {previewUrl ? 'Change Photo' : 'Upload Photo'}
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground text-center">
        Max 5MB. JPG, PNG, or GIF.
      </p>
    </div>
  )
}
