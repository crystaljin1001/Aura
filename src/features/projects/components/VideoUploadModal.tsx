'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, Link as LinkIcon } from 'lucide-react'
import { saveProjectVideo, uploadProjectVideo } from '../actions'
import type { Project } from '../types'

interface VideoUploadModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

type UploadMode = 'url' | 'file'

export function VideoUploadModal({ project, isOpen, onClose }: VideoUploadModalProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<UploadMode>('url')
  const [videoUrl, setVideoUrl] = useState(project.videoUrl || '')
  const [thumbnailUrl, setThumbnailUrl] = useState(project.videoThumbnail || '')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file')
      return
    }

    // Validate file size (max 50MB for Supabase free tier)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      setError('Video file must be less than 50MB')
      return
    }

    setSelectedFile(file)
    setError('')
  }

  function handleSubmitUrl(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!videoUrl.trim()) {
      setError('Please enter a video URL')
      return
    }

    startTransition(async () => {
      try {
        await saveProjectVideo(project.repository, videoUrl, thumbnailUrl || undefined)
        onClose()
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save video')
      }
    })
  }

  function handleSubmitFile(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!selectedFile) {
      setError('Please select a video file')
      return
    }

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('video', selectedFile)
        formData.append('repository', project.repository)

        await uploadProjectVideo(formData, (progress) => {
          setUploadProgress(progress)
        })

        onClose()
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload video')
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Video Demo</DialogTitle>
          <DialogDescription>
            Record your video demo and paste the link here
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'url'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LinkIcon className="w-4 h-4 inline mr-2" />
              Paste URL
            </button>
            <button
              type="button"
              onClick={() => setMode('file')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'file'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload File
            </button>
          </div>

          {mode === 'url' ? (
            <>
              {/* Recording Tools */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Recommended Video Hosting:</h4>
                <div className="grid grid-cols-3 gap-3">
                  <a
                    href="https://www.tella.tv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <span className="text-2xl">📹</span>
                    <div>
                      <div className="font-medium text-sm">Tella</div>
                      <div className="text-xs text-muted-foreground">Screen recording</div>
                    </div>
                  </a>
                  <a
                    href="https://www.arcade.software"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <span className="text-2xl">🎬</span>
                    <div>
                      <div className="font-medium text-sm">Arcade</div>
                      <div className="text-xs text-muted-foreground">Product demos</div>
                    </div>
                  </a>
                  <a
                    href="https://www.youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <span className="text-2xl">📺</span>
                    <div>
                      <div className="font-medium text-sm">YouTube</div>
                      <div className="text-xs text-muted-foreground">No size limit</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Recording Tips */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Tips:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Follow your script timing (2.5-3.5 minutes)</li>
                  <li>• Show live app, not slides</li>
                  <li>• Use YouTube for videos over 50MB (unlimited size)</li>
                  <li>• Set YouTube videos to "Unlisted" for portfolio use</li>
                </ul>
              </div>

              {/* Video URL Input */}
              <form onSubmit={handleSubmitUrl} className="space-y-4">
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium mb-2">
                Video URL
              </label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=... or https://tella.tv/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div>
              <label htmlFor="thumbnailUrl" className="block text-sm font-medium mb-2">
                Thumbnail URL (optional)
              </label>
              <Input
                id="thumbnailUrl"
                type="url"
                placeholder="https://..."
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                disabled={isPending}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isPending}
                  >
                    {isPending ? 'Saving...' : 'Save Video URL'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* File Upload Section */}
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">Upload Requirements:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Maximum file size: 50MB</li>
                    <li>• Supported formats: MP4, WebM, MOV</li>
                    <li>• Recommended: 1920x1080 or 1280x720</li>
                    <li>• Keep videos under 5 minutes for best performance</li>
                  </ul>
                </div>

                <form onSubmit={handleSubmitFile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select Video File
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    >
                      {selectedFile ? (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 mx-auto text-green-500" />
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedFile(null)
                              if (fileInputRef.current) {
                                fileInputRef.current.value = ''
                              }
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                          <p className="font-medium">Click to select video</p>
                          <p className="text-sm text-muted-foreground">
                            or drag and drop here
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isPending || !selectedFile}
                    >
                      {isPending ? `Uploading... ${uploadProgress}%` : 'Upload Video'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onClose}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
