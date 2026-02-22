/**
 * Portfolio Grid Component
 * Displays all user projects in a grid layout
 * Each project card is clickable and links to the full case study
 */

import Link from 'next/link'
import Image from 'next/image'
import { Star, GitFork, ExternalLink, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { CaseStudyProject } from '../types'

interface PortfolioGridProps {
  projects: CaseStudyProject[]
  username: string
}

export function PortfolioGrid({ projects, username }: PortfolioGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <Eye className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
        <p className="text-muted-foreground">
          Start building your portfolio by adding projects to your dashboard.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const projectUrl = `/u/${username}/${project.repo.toLowerCase()}`

        return (
          <Link
            key={project.repositoryUrl}
            href={projectUrl}
            className="group relative block"
          >
            <div className="glass-card h-full rounded-xl border border-border hover:border-blue-500/50 transition-all duration-300 overflow-hidden">
              {/* Project Thumbnail/Video */}
              <div className="relative aspect-video bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-cyan-900/40">
                {project.videoThumbnail ? (
                  <Image
                    src={project.videoThumbnail}
                    alt={`${project.repo} thumbnail`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Eye className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>

              {/* Project Info */}
              <div className="p-6">
                {/* Language Badge */}
                {project.language && (
                  <Badge className="mb-3 bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                    {project.language}
                  </Badge>
                )}

                {/* Project Name */}
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-blue-400 transition-colors">
                  {project.repo}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description || 'No description available'}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>{project.stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="w-4 h-4 text-blue-400" />
                    <span>{project.forks}</span>
                  </div>
                  {project.websiteUrl && (
                    <div className="ml-auto">
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                    </div>
                  )}
                </div>

                {/* Health Score Badge */}
                {project.healthScore && project.healthScore.score > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Health Score</span>
                      <span
                        className={`font-semibold ${
                          project.healthScore.score >= 80
                            ? 'text-green-400'
                            : project.healthScore.score >= 60
                            ? 'text-yellow-400'
                            : 'text-orange-400'
                        }`}
                      >
                        {project.healthScore.score}/100
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
