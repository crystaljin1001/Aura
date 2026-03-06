'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteProject } from '../actions'
import type { Project } from '../types'
import { ScriptEditorModal } from './ScriptEditorModal'
import { VideoUploadModal } from './VideoUploadModal'
import { ViewScriptModal } from './ViewScriptModal'
import { EditScriptTextModal } from './EditScriptTextModal'
import { CompletnessBadge } from '@/features/portfolio/components/CompletnessBadge'
import { AnalyzingCard } from './AnalyzingCard'
import { DraftCard } from './DraftCard'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Show AnalyzingCard for 'analyzing' status
  if (project.status === 'analyzing') {
    return <AnalyzingCard project={project} />
  }

  // Show DraftCard for 'draft' status
  if (project.status === 'draft') {
    return <DraftCard project={project} />
  }

  // Continue with normal ProjectCard for other statuses
  const [showScriptModal, setShowScriptModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showViewScriptModal, setShowViewScriptModal] = useState(false)
  const [showEditScriptModal, setShowEditScriptModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (confirm(`Are you sure you want to delete ${project.name}?`)) {
      startTransition(async () => {
        await deleteProject(project.id)
      })
    }
  }

  function handleViewOnGitHub() {
    window.open(`https://github.com/${project.repository}`, '_blank')
  }

  return (
    <>
      <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">{project.name}</h3>
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Completeness Badge */}
          {project.completeness && (
            <div className="flex items-center">
              <CompletnessBadge
                completed={project.completeness.completed}
                total={project.completeness.total}
                percentage={project.completeness.percentage}
                category={project.completeness.category}
                variant="compact"
              />
            </div>
          )}

          {/* GitHub Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>⭐</span>
              <span>{project.stars}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🍴</span>
              <span>{project.forks}</span>
            </div>
            {project.language && (
              <Badge variant="secondary" className="text-xs">
                {project.language}
              </Badge>
            )}
          </div>

          {/* Impact Metrics Preview */}
          {project.impactMetrics && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Top Impact:</p>
              <div className="space-y-1">
                {project.impactMetrics.criticalIssuesResolved > 0 && (
                  <p className="text-sm">• {project.impactMetrics.criticalIssuesResolved} critical bugs fixed</p>
                )}
                {project.impactMetrics.featuresDelivered > 0 && (
                  <p className="text-sm">• {project.impactMetrics.featuresDelivered} features delivered</p>
                )}
                {project.impactMetrics.userAdoption > 0 && (
                  <p className="text-sm">• {project.impactMetrics.userAdoption}+ users</p>
                )}
              </div>
            </div>
          )}

          {/* Status Indicators */}
          <div className="flex items-center gap-4 py-2">
            <StatusIndicator
              icon="📝"
              label="Script"
              completed={project.hasScript}
            />
            <StatusIndicator
              icon="🎥"
              label="Video"
              completed={project.hasVideo}
            />
          </div>

          {/* Primary CTA */}
          <PrimaryCTAButton
            project={project}
            onConvertREADME={() => setShowScriptModal(true)}
            onRecordVideo={() => setShowVideoModal(true)}
          />

          {/* Secondary Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                disabled={isPending}
              >
                ⋯ More Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {project.hasScript && (
                <>
                  <DropdownMenuItem onClick={() => setShowViewScriptModal(true)}>
                    📄 View Script
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowEditScriptModal(true)}>
                    ✏️ Edit Script Text
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowScriptModal(true)}>
                    🔄 Regenerate Script
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleViewOnGitHub}>
                🔗 View on GitHub
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={`/portfolio/${project.repository.replace('/', '-')}`}>
                  👁️ View Case Study
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                🗑️ Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Modals */}
      <ScriptEditorModal
        project={project}
        isOpen={showScriptModal}
        onClose={() => setShowScriptModal(false)}
      />
      <VideoUploadModal
        project={project}
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
      />
      <ViewScriptModal
        project={project}
        isOpen={showViewScriptModal}
        onClose={() => setShowViewScriptModal(false)}
      />
      <EditScriptTextModal
        project={project}
        isOpen={showEditScriptModal}
        onClose={() => setShowEditScriptModal(false)}
      />
    </>
  )
}

function StatusIndicator({
  icon,
  label,
  completed,
}: {
  icon: string
  label: string
  completed: boolean
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={completed ? 'text-green-500' : 'text-gray-400'}>
        {completed ? '✓' : '○'}
      </span>
      <span className="text-xs text-muted-foreground">
        {icon} {label}
      </span>
    </div>
  )
}

function PrimaryCTAButton({
  project,
  onConvertREADME,
  onRecordVideo,
}: {
  project: Project
  onConvertREADME: () => void
  onRecordVideo: () => void
}) {
  switch (project.status) {
    case 'new':
    case 'draft': // Draft status is handled by DraftCard, but include here for completeness
      return (
        <Button
          size="lg"
          onClick={onConvertREADME}
          className="w-full bg-green-600 hover:bg-green-700 h-12"
        >
          ✨ Convert README
        </Button>
      )

    case 'script_ready':
      return (
        <Button
          size="lg"
          onClick={onRecordVideo}
          className="w-full bg-blue-600 hover:bg-blue-700 h-12"
        >
          🎥 Record Video Demo
        </Button>
      )

    case 'video_ready':
    case 'deployed':
      return (
        <div className="w-full h-12 flex items-center justify-center text-sm text-green-400">
          ✅ Project Complete
        </div>
      )

    case 'analyzing':
      // Analyzing status is handled by AnalyzingCard, but include here for completeness
      return (
        <div className="w-full h-12 flex items-center justify-center text-sm text-blue-400">
          🔄 Analyzing...
        </div>
      )

    default:
      // Fallback for any future status values
      return (
        <Button
          size="lg"
          onClick={onConvertREADME}
          className="w-full bg-green-600 hover:bg-green-700 h-12"
        >
          ✨ Convert README
        </Button>
      )
  }
}
