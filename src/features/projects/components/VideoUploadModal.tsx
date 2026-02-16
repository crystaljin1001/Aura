'use client'

import { useState, useTransition } from 'react'
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
import { saveProjectVideo } from '../actions'
import type { Project } from '../types'

interface VideoUploadModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

export function VideoUploadModal({ project, isOpen, onClose }: VideoUploadModalProps) {
  const router = useRouter()
  const [videoUrl, setVideoUrl] = useState(project.videoUrl || '')
  const [thumbnailUrl, setThumbnailUrl] = useState(project.videoThumbnail || '')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
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
        // Refresh the dashboard to show updated project status
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save video')
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
          {/* Recording Tools */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Recommended Recording Tools:</h4>
            <div className="grid grid-cols-2 gap-3">
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
            </div>
          </div>

          {/* Recording Tips */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Recording Tips:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Follow your script timing (2.5-3.5 minutes)</li>
              <li>• Show live app, not slides</li>
              <li>• Use stage directions in your script</li>
              <li>• Test audio before recording</li>
            </ul>
          </div>

          {/* Video URL Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium mb-2">
                Video URL
              </label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://tella.tv/..."
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
