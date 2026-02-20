/**
 * Interactive Architecture Diagram Section
 *
 * Displays Mermaid.js diagrams showing project architecture
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ArchitectureDiagram } from '../types'

interface ArchitectureDiagramSectionProps {
  diagram: ArchitectureDiagram
  projectName: string
}

export function ArchitectureDiagramSection({
  diagram,
  projectName,
}: ArchitectureDiagramSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    // Initialize Mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#fff',
        primaryBorderColor: '#1e40af',
        lineColor: '#60a5fa',
        secondaryColor: '#10b981',
        tertiaryColor: '#8b5cf6',
        background: '#0f172a',
        mainBkg: '#1e293b',
        secondBkg: '#334155',
        tertiaryBkg: '#475569',
        darkMode: true,
      },
      fontFamily: 'ui-monospace, monospace',
    })

    // Render diagram
    if (containerRef.current) {
      const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`
      containerRef.current.innerHTML = `<div class="mermaid" id="${id}">${diagram.mermaidCode}</div>`

      mermaid.contentLoaded()
    }
  }, [diagram.mermaidCode])

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          System Architecture
        </h2>
        <p className="text-muted-foreground">
          Visual representation of {projectName}&apos;s technical architecture and data flow
        </p>
      </div>

      <div className="glass-card-glow p-6 rounded-2xl border border-border">
        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleZoomIn}
              disabled={scale >= 2}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleFullscreen}
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Fullscreen
          </Button>
        </div>

        {/* Diagram Container */}
        <div className="overflow-auto bg-background/50 rounded-xl p-6 min-h-[400px] flex items-center justify-center">
          <div
            ref={containerRef}
            className="transition-transform"
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      </div>
    </section>
  )
}
