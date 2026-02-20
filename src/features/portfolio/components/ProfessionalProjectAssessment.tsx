'use client'

/**
 * Professional Project Assessment
 *
 * Replaces the simple checklist with a professional assessment
 */

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProjectCompleteness } from '../types'
import { calculateProfessionalAssessment, getReadinessDescription } from '../utils/professional-assessment'
import { generateTechnicalAssessment } from '../api/ai-technical-assessment'

interface ProfessionalProjectAssessmentProps {
  completeness: ProjectCompleteness
  repositoryUrl: string
}

export function ProfessionalProjectAssessment({
  completeness,
  repositoryUrl,
}: ProfessionalProjectAssessmentProps) {
  const [expanded, setExpanded] = useState(false)
  const [aiAssessment, setAiAssessment] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string>('')

  const assessment = calculateProfessionalAssessment(completeness)
  const readiness = getReadinessDescription(assessment.readinessLevel)

  async function handleGenerateAssessment() {
    setIsGenerating(true)
    setError('')
    try {
      const result = await generateTechnicalAssessment(repositoryUrl)
      if (result.success && result.data) {
        setAiAssessment(result.data)
        setExpanded(true)
      } else {
        setError(result.error || 'Failed to generate assessment. Please check your ANTHROPIC_API_KEY environment variable.')
      }
    } catch (error) {
      console.error('Failed to generate assessment:', error)
      setError('Failed to generate assessment. Please check your ANTHROPIC_API_KEY environment variable.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="glass-card p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Project Assessment</h2>
          <p className="text-sm text-muted-foreground">
            Professional evaluation of technical depth and production readiness
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold mb-1">{assessment.overallScore}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Overall Score
          </div>
        </div>
      </div>

      {/* Readiness Level */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border">
        <div className={`text-2xl ${readiness.color}`}>●</div>
        <div>
          <div className="font-semibold">{readiness.label}</div>
          <div className="text-sm text-muted-foreground">{readiness.description}</div>
        </div>
      </div>

      {/* Category Scores */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Category Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessment.categories.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{category.name}</span>
                <span className="text-sm font-bold">{Math.round(category.score)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    category.score >= 80
                      ? 'bg-green-500'
                      : category.score >= 50
                      ? 'bg-amber-500'
                      : 'bg-gray-500'
                  }`}
                  style={{ width: `${category.score}%` }}
                />
              </div>
              <div className="space-y-1">
                {category.items.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    {item.present ? (
                      <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                    ) : (
                      <Circle className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={item.present ? 'text-foreground' : 'text-muted-foreground'}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        {assessment.strengths.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3">
              Strengths
            </h3>
            <ul className="space-y-2">
              {assessment.strengths.map((strength, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {assessment.improvements.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
              Recommended Actions
            </h3>
            <ul className="space-y-2">
              {assessment.improvements.map((improvement, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-amber-400 mt-1">→</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* AI Technical Assessment */}
      <div className="border-t border-border pt-6">
        {!aiAssessment ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Get a detailed technical assessment</span>
            </div>
            <Button
              onClick={handleGenerateAssessment}
              disabled={isGenerating}
              variant="outline"
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  Generating Assessment...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Technical Assessment
                </>
              )}
            </Button>
            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold">Technical Assessment</h3>
              </div>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expanded && (
              <div className="space-y-4 bg-blue-500/5 border border-blue-500/20 rounded-lg p-6">
                {/* Summary */}
                <div>
                  <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                    Summary
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {aiAssessment.summary}
                  </p>
                </div>

                {/* Technical Depth */}
                <div>
                  <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                    Technical Depth
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {aiAssessment.technicalDepth}
                  </p>
                </div>

                {/* Architectural Insights */}
                <div>
                  <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                    Architectural Insights
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {aiAssessment.architecturalInsights}
                  </p>
                </div>

                {/* Production Readiness */}
                <div>
                  <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                    Production Readiness
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {aiAssessment.productionReadiness}
                  </p>
                </div>

                {/* Standout Qualities */}
                <div>
                  <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                    Standout Technical Qualities
                  </h4>
                  <ul className="space-y-2">
                    {aiAssessment.standoutQualities.map((quality: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{quality}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
