'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, X, Video, Maximize2, Info, MousePointer2 } from 'lucide-react'
import { MermaidPreview } from '@/components/ui/mermaid-preview'
import { VideoUploadModal } from '@/features/projects/components/VideoUploadModal'
import type { Project } from '@/features/projects/types'
import type { NarrativeScript } from '@/features/narrative-storyboarder/types'

/**
 * Formats script content with markdown-style bold and highlighted visual cues
 */
function FormattedScript({ content }: { content: string }) {
  // Split into paragraphs
  const paragraphs = content.split('\n').filter(p => p.trim())

  return (
    <div className="space-y-5">
      {paragraphs.map((paragraph, idx) => {
        // Check if this is a visual cue line
        const isVisualCue = paragraph.trim().startsWith('[VISUAL CUE:') ||
                           paragraph.trim().startsWith('[Transition:')

        if (isVisualCue) {
          return (
            <div key={idx} className="flex items-start gap-3 py-3 px-4 bg-yellow-900/20 border-l-4 border-yellow-400 rounded-r-lg">
              <MousePointer2 className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-lg font-semibold text-yellow-300 leading-loose">
                {paragraph}
              </p>
            </div>
          )
        }

        // Parse **bold** markdown
        const parts = paragraph.split(/(\*\*.*?\*\*)/)

        return (
          <p key={idx} className="text-lg leading-loose text-slate-200">
            {parts.map((part, partIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                const boldText = part.slice(2, -2)
                return <strong key={partIdx} className="font-bold text-white">{boldText}</strong>
              }
              return <span key={partIdx}>{part}</span>
            })}
          </p>
        )
      })}
    </div>
  )
}

interface StudioModeProps {
  project: Project
  script: NarrativeScript | null
  diagram: { mermaidCode: string; type: string } | null
}

interface ScriptChapter {
  title: string
  content: string
  duration: number
}

export function StudioMode({ project, script, diagram }: StudioModeProps) {
  const router = useRouter()
  const [currentChapter, setCurrentChapter] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)

  // Convert script to chapters based on script type
  const chapters: ScriptChapter[] = script ? (
    script.type === 'technical_architecture' ? [
      { title: 'I. The Context', content: (script as any).context, duration: 50 },
      { title: 'II. The Logic Gate', content: (script as any).logicGate, duration: 80 },
      { title: 'III. The Execution', content: (script as any).execution, duration: 70 },
      { title: 'IV. The Moat', content: (script as any).moat, duration: 50 },
    ] : [
      { title: '1. Hook', content: script.hook, duration: 15 },
      { title: '2. Problem', content: script.problem, duration: 30 },
      { title: '3. Solution', content: script.solution, duration: 60 },
      { title: '4. Impact', content: script.impact, duration: 45 },
      { title: '5. Call to Action', content: script.cta, duration: 15 },
    ]
  ) : []

  const hasScript = chapters.length > 0
  const hasDiagram = !!diagram

  function handlePrevChapter() {
    setCurrentChapter((prev) => Math.max(0, prev - 1))
  }

  function handleNextChapter() {
    setCurrentChapter((prev) => Math.min(chapters.length - 1, prev + 1))
  }

  function handleExit() {
    router.push('/dashboard')
  }

  function handleDoneRecording() {
    setShowUploadModal(true)
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={handleExit}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            title="Exit Studio Mode"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">{project.name}</h1>
            <p className="text-sm text-slate-400">Studio Mode</p>
          </div>
        </div>

        <button
          onClick={handleDoneRecording}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Video className="w-4 h-4" />
          Done Recording - Upload Video
        </button>
      </div>

      {/* Instructions Banner */}
      {showInstructions && (
        <div className="bg-blue-900/30 border-b border-blue-800 px-6 py-3 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-blue-100 font-medium mb-1">
              🎥 Pro Tip: How to Record Like a Pro
            </p>
            <p className="text-xs text-blue-200">
              Open <strong>Loom</strong>, <strong>Tella</strong>, or <strong>OBS</strong> →
              Select "Custom Size" or "Window" recording →
              Drag the recording box over the <strong>diagram on the right</strong> →
              Read your script from the left while pointing to the diagram →
              You'll look like a genius speaking off the cuff!
            </p>
          </div>
          <button
            onClick={() => setShowInstructions(false)}
            className="text-blue-300 hover:text-blue-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Teleprompter */}
        <div className="w-[30%] bg-slate-900 border-r border-slate-800 flex flex-col">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              Your Script
            </h2>
          </div>

          {hasScript ? (
            <>
              {/* Chapter Content */}
              <div className="flex-1 overflow-y-auto px-6 py-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-blue-400">
                      {chapters[currentChapter].title}
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">
                      ~{chapters[currentChapter].duration}s
                    </span>
                  </div>
                  <FormattedScript content={chapters[currentChapter].content} />
                </div>
              </div>

              {/* Chapter Navigation */}
              <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={handlePrevChapter}
                  disabled={currentChapter === 0}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg flex items-center gap-2 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="text-sm text-slate-400">
                  Chapter {currentChapter + 1} of {chapters.length}
                </div>

                <button
                  onClick={handleNextChapter}
                  disabled={currentChapter === chapters.length - 1}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg flex items-center gap-2 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center px-6 text-center">
              <div className="space-y-3">
                <p className="text-slate-400">No script available</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-sm text-blue-400 hover:text-blue-300 underline"
                >
                  Generate script first
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Pane: Presentation Stage (Diagram) */}
        <div className="flex-1 bg-slate-950 flex flex-col">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              Architecture Diagram
            </h2>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div className={`flex-1 overflow-auto p-6 ${isFullscreen ? 'absolute inset-0 z-50 bg-slate-950' : ''}`}>
            {hasDiagram ? (
              <div className="h-full flex items-center justify-center">
                <MermaidPreview
                  mermaidCode={diagram.mermaidCode}
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                  <p className="text-slate-400">No architecture diagram available</p>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                  >
                    Generate diagram first
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Upload Modal */}
      <VideoUploadModal
        project={project}
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false)
          router.push('/dashboard')
        }}
      />
    </div>
  )
}
