/**
 * Case Study Hero Section
 *
 * Displays project video/screenshot, title, description, stats, and health score
 */

import Image from 'next/image'
import { Star, GitFork, Eye, Github, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { decodeHtmlEntities } from '@/lib/utils/html'
import type { CaseStudyProject } from '../types'

interface HeroSectionProps {
  project: CaseStudyProject
}

export function HeroSection({ project }: HeroSectionProps) {
  const {
    repo,
    owner,
    repositoryUrl,
    description,
    language,
    stars,
    forks,
    videoUrl,
    videoThumbnail,
    websiteUrl,
    techStack,
  } = project

  return (
    <section className="relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Video/Screenshot */}
          <div className="order-2 lg:order-1">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-cyan-900/40 border border-border shadow-2xl">
              {videoUrl ? (
                <iframe
                  src={videoUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${repo} demo video`}
                />
              ) : videoThumbnail ? (
                <div className="absolute inset-0">
                  <Image
                    src={videoThumbnail}
                    alt={`${repo} thumbnail`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-black border-b-8 border-b-transparent ml-1" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <Eye className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-muted-foreground">Project Preview</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tech Stack Tags */}
            {techStack && techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {techStack.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="px-3 py-1 text-xs bg-secondary/50"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Right: Project Details */}
          <div className="order-1 lg:order-2">
            {/* Language Badge */}
            {language && (
              <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">
                {language}
              </Badge>
            )}

            {/* Project Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
              {repo}
            </h1>

            {/* Owner */}
            <p className="text-lg text-muted-foreground mb-6">
              by <span className="text-foreground font-medium">{owner}</span>
            </p>

            {/* Description */}
            {description ? (
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {decodeHtmlEntities(description)}
              </p>
            ) : (
              <p className="text-lg text-muted-foreground/70 italic leading-relaxed mb-8">
                No description available. Add a description to your GitHub repository to display it here.
              </p>
            )}

            {/* GitHub Stats */}
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                <span className="text-foreground font-semibold">{stars}</span>
              </div>
              <div className="flex items-center gap-2">
                <GitFork className="w-5 h-5 text-blue-400" />
                <span className="text-foreground font-semibold">{forks}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {websiteUrl && (
                <Button
                  size="lg"
                  className="bg-foreground text-background hover:bg-foreground/90"
                  asChild
                >
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Live Site
                  </a>
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="border-border hover:bg-glass-hover"
                asChild
              >
                <a
                  href={`https://github.com/${repositoryUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-2" />
                  View Source Code
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
