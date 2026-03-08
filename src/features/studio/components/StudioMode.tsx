'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, X, Video, Maximize2, Info, MousePointer2 } from 'lucide-react'
import { MermaidPreview } from '@/components/ui/mermaid-preview'
import { VideoUploadModal } from '@/features/projects/components/VideoUploadModal'
import { HeroCodeSnippet } from './HeroCodeSnippet'
import { HeroAsset } from './HeroAsset'
import { StatBoard } from './StatBoard'
import { ProductUI } from './ProductUI'
import { DecisionTreeNode } from '@/features/portfolio/components/DecisionTreeNode'
import type { Project } from '@/features/projects/types'
import type { HeroCommitCodeSnippet } from '@/features/narrative-storyboarder/api/github-actions'
import type { LogicMap } from '@/features/portfolio/types/logic-map'

/**
 * Formats script content with markdown-style bold and highlighted visual cues
 */
function FormattedScript({ content }: { content: string }) {
  const elements: React.ReactElement[] = []
  let elementKey = 0

  // First, extract and separate visual cues from regular text
  const segments = content.split(/(\[(?:VISUAL CUE|Transition):[^\]]+\])/)

  segments.forEach((segment) => {
    if (!segment.trim()) return

    // Check if this segment is a visual cue
    const isVisualCue = segment.trim().startsWith('[VISUAL CUE:') ||
                       segment.trim().startsWith('[Transition:')

    if (isVisualCue) {
      // Render visual cue as distinct yellow block
      elements.push(
        <div key={elementKey++} className="flex items-start gap-3 py-3 px-4 bg-yellow-900/20 border-l-4 border-yellow-400 rounded-r-lg my-6">
          <MousePointer2 className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <p className="text-lg font-semibold text-yellow-300 leading-loose">
            {segment.trim()}
          </p>
        </div>
      )
    } else {
      // Regular text: split into sentences and group into 2-3 sentence chunks
      const sentences = segment
        .split(/([.!?]+\s+)/)
        .reduce((acc: string[], part, i, arr) => {
          if (i % 2 === 0 && part.trim()) {
            acc.push(part + (arr[i + 1] || ''))
          }
          return acc
        }, [])
        .filter(s => s.trim())

      // Group sentences into paragraphs of 2-3 sentences
      let currentChunk: string[] = []

      sentences.forEach((sentence, idx) => {
        currentChunk.push(sentence.trim())

        // Create paragraph every 2-3 sentences or at the end
        if (currentChunk.length >= 2 || idx === sentences.length - 1) {
          const paragraphText = currentChunk.join(' ')

          // Parse **bold** markdown
          const parts = paragraphText.split(/(\*\*.*?\*\*)/)

          elements.push(
            <p key={elementKey++} className="text-lg leading-loose text-slate-200 mb-5">
              {parts.map((part, partIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  const boldText = part.slice(2, -2)
                  return <strong key={partIdx} className="font-bold text-white">{boldText}</strong>
                }
                return <span key={partIdx}>{part}</span>
              })}
            </p>
          )

          currentChunk = []
        }
      })
    }
  })

  return <div>{elements}</div>
}

interface StudioScript extends Record<string, any> {
  type?: string
  totalDuration?: number
}

interface StudioModeProps {
  project: Project
  script: StudioScript | null
  diagram: { mermaidCode: string; type: string } | null
  logicMap: LogicMap | null
}

interface ScriptChapter {
  title: string
  content: string
  duration: number
}

type ChapterContentType = 'hero' | 'diagram' | 'code' | 'metrics' | 'decisionTree'

export function StudioMode({ project, script, diagram, logicMap }: StudioModeProps) {
  const router = useRouter()
  const [currentChapter, setCurrentChapter] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [heroCodeSnippet, setHeroCodeSnippet] = useState<HeroCommitCodeSnippet | null>(null)
  const [isLoadingCode, setIsLoadingCode] = useState(false)

  // Debug: Log logicMap prop
  console.log('[StudioMode] Received props:', {
    hasProject: !!project,
    hasScript: !!script,
    hasDiagram: !!diagram,
    hasLogicMap: !!logicMap,
    logicMapDecisionNodes: logicMap?.decisionNodes?.length || 0,
    logicMapPivotPoints: logicMap?.pivotPoints?.length || 0,
  })
  if (logicMap?.decisionNodes) {
    console.log('[StudioMode] Decision nodes data:', JSON.stringify(logicMap.decisionNodes, null, 2))
  }

  // Convert script to chapters based on script type
  const chapters: ScriptChapter[] = script ? (
    script.type === 'product_minded_engineer' ? [
      { title: 'I. Business Problem', content: (script as any).businessProblem, duration: 30 }, // Visual: Hero Asset
      { title: 'II. User Journey', content: (script as any).userJourney, duration: 60 }, // Visual: App UI
      { title: 'III. Pragmatic Architecture', content: (script as any).pragmaticArchitecture, duration: 30 }, // Visual: Architecture Diagram
      { title: 'IV. Trade-off & Execution', content: (script as any).tradeoffExecution, duration: 30 }, // Visual: Decision Tree
      { title: 'V. Impact & Roadmap', content: (script as any).impactRoadmap, duration: 30 }, // Visual: Metrics
    ] : script.type === 'technical_architecture' ? [
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

  // Fetch hero commit code snippet on mount
  useEffect(() => {
    async function fetchHeroCode() {
      // Check if project has hero commit
      const heroCommit = project.draftData?.heroCommit

      if (!heroCommit || !heroCommit.userApproved || !heroCommit.keyFiles.length) {
        return
      }

      setIsLoadingCode(true)

      try {
        // Parse repository owner/name from project.repository
        const [owner, repo] = project.repository.split('/')

        // Get the first meaningful file from keyFiles
        const targetFile = heroCommit.keyFiles[0]

        // Fetch code snippet
        const response = await fetch('/api/studio/fetch-hero-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            owner,
            repo,
            commitSha: heroCommit.sha,
            filename: targetFile,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setHeroCodeSnippet(data.data)
          }
        }
      } catch (error) {
        console.error('[StudioMode] Failed to fetch hero code:', error)
      } finally {
        setIsLoadingCode(false)
      }
    }

    fetchHeroCode()
  }, [project])

  // Universal 5-Chapter Visual Framework for Master Demo
  // Follows Steve Jobs pitch flow: Problem → Solution → Architecture → Execution → Impact
  function getChapterContentType(): ChapterContentType {
    // For Product-Minded Engineer (5-chapter Master Demo)
    if (script?.type === 'product_minded_engineer') {
      switch (currentChapter) {
        case 0: // Chapter I: Business Problem → Hero Asset (title card)
          return 'hero'
        case 1: // Chapter II: User Journey → Live App/Product UI
          return 'hero' // Show app interface/product UI
        case 2: // Chapter III: Pragmatic Architecture → Architecture Diagram
          return 'diagram'
        case 3: // Chapter IV: Trade-off & Execution → Decision Tree (Logic Map)
          return 'decisionTree'
        case 4: // Chapter V: Impact & Roadmap → Metrics
          return 'metrics'
        default:
          return 'hero'
      }
    }

    // For other script types, use universal 4-chapter framework
    switch (currentChapter) {
      case 0: // Chapter 1: The Hero Asset
        return 'hero'
      case 1: // Chapter 2: Architecture Diagram
        return 'diagram'
      case 2: // Chapter 3: Hero Code
        return 'code'
      case 3: // Chapter 4: Stat Board (metrics)
        return 'metrics'
      default:
        return 'hero'
    }
  }

  const currentContentType = getChapterContentType()

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
              Drag the recording box over the <strong>visual on the right</strong> →
              Read your script from the left while the visual changes per chapter (Hero → App UI → Diagram → Decision Tree → Metrics) →
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

        {/* Right Pane: Presentation Stage (Dynamic Content) */}
        <div className="flex-1 bg-slate-950 flex flex-col">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              {currentContentType === 'hero' && (
                script?.type === 'product_minded_engineer' && currentChapter === 1
                  ? 'Live App Interface'
                  : 'Project Overview'
              )}
              {currentContentType === 'diagram' && 'Architecture Diagram'}
              {currentContentType === 'code' && 'Hero Commit Code'}
              {currentContentType === 'decisionTree' && 'Technical Decisions'}
              {currentContentType === 'metrics' && 'Impact Metrics'}
            </h2>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div className={`flex-1 overflow-auto ${currentContentType === 'code' || currentContentType === 'hero' ? 'p-0' : 'p-6'} ${isFullscreen ? 'absolute inset-0 z-50 bg-slate-950' : ''}`}>
            {/* Hero Asset (Chapter 1) OR Product UI (Chapter 2) */}
            {currentContentType === 'hero' && (
              <>
                {/* Chapter I: Hero Asset (title card) */}
                {script?.type === 'product_minded_engineer' && currentChapter === 0 && (
                  <HeroAsset
                    projectName={project.name}
                    tagline={project.draftData?.tagline || `A portfolio project showcasing ${project.name}`}
                    readmeImageUrl={project.draftData?.readmeImageUrl}
                  />
                )}

                {/* Chapter II: Product UI (live app) */}
                {script?.type === 'product_minded_engineer' && currentChapter === 1 && (
                  <ProductUI
                    deployedUrl={project.domainUrl}
                    projectName={project.name}
                  />
                )}

                {/* For other script types or chapters, show hero asset */}
                {!(script?.type === 'product_minded_engineer' && (currentChapter === 0 || currentChapter === 1)) && (
                  <HeroAsset
                    projectName={project.name}
                    tagline={project.draftData?.tagline || `A portfolio project showcasing ${project.name}`}
                    readmeImageUrl={project.draftData?.readmeImageUrl}
                  />
                )}
              </>
            )}

            {/* Architecture Diagram (Chapter 2) */}
            {currentContentType === 'diagram' && (
              <>
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
              </>
            )}

            {/* Hero Commit Code (Chapter 3) */}
            {currentContentType === 'code' && (
              <>
                {isLoadingCode ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                      <p className="text-slate-400">Loading code snippet...</p>
                    </div>
                  </div>
                ) : heroCodeSnippet ? (
                  <HeroCodeSnippet
                    code={heroCodeSnippet.code}
                    filename={heroCodeSnippet.filename}
                    language={heroCodeSnippet.language}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <p className="text-slate-400">No hero commit code available</p>
                      <p className="text-xs text-slate-500">
                        Select a hero commit before entering Studio Mode
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Decision Tree / Logic Map (Chapter 4 for Master Demo) */}
            {currentContentType === 'decisionTree' && (
              <>
                {(() => {
                  console.log('[StudioMode] Rendering decision tree section:', {
                    currentContentType,
                    currentChapter,
                    hasLogicMap: !!logicMap,
                    hasDecisionNodes: !!logicMap?.decisionNodes,
                    decisionNodesLength: logicMap?.decisionNodes?.length || 0,
                  })
                  return null
                })()}
                {logicMap && logicMap.decisionNodes && logicMap.decisionNodes.length > 0 ? (
                  <div className="w-full h-full overflow-y-auto p-8 bg-slate-950">
                    <div className="max-w-4xl mx-auto">
                      <div className="mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">Technical Decisions</h3>
                        <p className="text-sm text-slate-400">
                          Each tree shows: <strong className="text-slate-300">The Challenge</strong> (problem) → <strong className="text-slate-300">Pivot / Alternative</strong> (rejected alternatives with "Why NOT?") → <strong className="text-slate-300">Chosen Solution</strong> (chosen solution)
                        </p>
                      </div>

                      <div className="space-y-12">
                        {logicMap.decisionNodes.map((decision, index) => {
                          console.log(`[StudioMode] Rendering DecisionTreeNode ${index}:`, decision)
                          return (
                            <DecisionTreeNode
                              key={index}
                              decision={decision}
                              index={index}
                              allDecisions={logicMap.decisionNodes}
                              repositoryUrl={project.repository}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <p className="text-slate-400">No technical decisions available</p>
                      <p className="text-xs text-slate-500">
                        Add decision trees in your Logic Map to display them here
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Impact Metrics (Chapter 5 for Master Demo) */}
            {currentContentType === 'metrics' && (
              <>
                {project.draftData?.metrics && project.draftData.metrics.length > 0 ? (
                  <StatBoard
                    metrics={project.draftData.metrics.map((m: any) => ({
                      label: m.title || m.label,
                      value: m.value,
                      description: m.description,
                    }))}
                    projectName={project.name}
                  />
                ) : (
                  <StatBoard
                    metrics={[
                      {
                        label: 'Commits',
                        value: '50+',
                        description: 'Total commits in repository',
                      },
                      {
                        label: 'Files Changed',
                        value: '100+',
                        description: 'Files modified across all commits',
                      },
                      {
                        label: 'Lines of Code',
                        value: '5K+',
                        description: 'Total lines written',
                      },
                    ]}
                    projectName={project.name}
                  />
                )}
              </>
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
