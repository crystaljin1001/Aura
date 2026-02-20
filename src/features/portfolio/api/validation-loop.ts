'use server'

/**
 * Validation Loop - Cross-Reference Analysis
 *
 * Compares HR perspective (Technical Assessment) with user perspective (Technical Journey)
 * Identifies narrative discoveries (strengths user missed) and unresolved critiques
 */

import type { TechnicalJourney } from '../types'
import type { CritiqueResult } from './criticize-agent'

export interface TechnicalAssessment {
  technicalSummary: string
  technicalDepth: string
  architecturalInsights: string
  productionReadiness: string
  standoutQualities: string[]
}

export interface NarrativeDiscovery {
  standoutQuality: string // From assessment
  userMentioned: boolean // Did journey cover this?
  suggestedAddition: string // Prompt to add to journey
  priority: 'high' | 'medium' | 'low'
  evidence?: string // Where this quality was observed
}

export interface UnresolvedCritique {
  critique: string
  severity: 'high' | 'medium' | 'low'
  acknowledgmentSuggestion: string // How to address in journey
  category: 'architectural' | 'production' | 'narrative'
}

export interface ValidationResult {
  narrativeDiscoveries: NarrativeDiscovery[] // Assessment found, user missed
  unresolvedCritiques: UnresolvedCritique[] // Critique found, journey didn't address
  overallCompleteness: number // 0-100 score
  suggestions: string[] // High-level recommendations
}

/**
 * Cross-validates assessment, journey, and critique to find gaps and discoveries
 */
export async function crossValidate(
  assessment: TechnicalAssessment | null,
  journey: TechnicalJourney | null,
  critique: CritiqueResult | null
): Promise<ValidationResult> {
  const narrativeDiscoveries: NarrativeDiscovery[] = []
  const unresolvedCritiques: UnresolvedCritique[] = []
  const suggestions: string[] = []

  // 1. NARRATIVE DISCOVERIES: Assessment found strengths user didn't mention
  if (assessment && assessment.standoutQualities && assessment.standoutQualities.length > 0) {
    for (const quality of assessment.standoutQualities) {
      // Check if this quality is mentioned anywhere in the journey
      const journeyText = journey
        ? `${journey.problemStatement} ${journey.technicalApproach} ${journey.keyChallenges || ''} ${journey.outcome || ''} ${journey.learnings?.join(' ') || ''}`
        : ''

      const qualityKeywords = extractKeywords(quality)
      const mentionedInJourney = qualityKeywords.some(keyword =>
        journeyText.toLowerCase().includes(keyword.toLowerCase())
      )

      if (!mentionedInJourney) {
        // This is a strength the user didn't highlight
        narrativeDiscoveries.push({
          standoutQuality: quality,
          userMentioned: false,
          suggestedAddition: generateAdditionPrompt(quality),
          priority: assessPriority(quality),
          evidence: `Technical Assessment identified: "${quality}"`,
        })
      }
    }
  }

  // 2. UNRESOLVED CRITIQUES: High/medium severity issues not addressed
  if (critique) {
    // Check architectural debt
    for (const debt of critique.architecturalDebt) {
      if (debt.severity === 'high' || debt.severity === 'medium') {
        const addressed = journey?.keyChallenges?.toLowerCase().includes(debt.issue.toLowerCase()) ||
          journey?.architecturalTradeoffs?.some(t =>
            t.rationale.toLowerCase().includes(debt.issue.toLowerCase())
          )

        if (!addressed) {
          unresolvedCritiques.push({
            critique: debt.issue,
            severity: debt.severity,
            acknowledgmentSuggestion: `Add to 'Key Challenges' or explain as an architectural trade-off: ${debt.suggestion}`,
            category: 'architectural',
          })
        }
      }
    }

    // Check production gaps
    const criticalProductionGaps = critique.productionGaps.filter(
      gap => gap.category === 'security' || gap.category === 'testing'
    )

    for (const gap of criticalProductionGaps) {
      const addressed = journey?.keyChallenges?.toLowerCase().includes(gap.gap.toLowerCase()) ||
        journey?.learnings?.some(l => l.toLowerCase().includes(gap.gap.toLowerCase()))

      if (!addressed) {
        unresolvedCritiques.push({
          critique: gap.gap,
          severity: gap.category === 'security' ? 'high' : 'medium',
          acknowledgmentSuggestion: `Address in 'Key Challenges' or add to planned improvements: ${gap.quickFix}`,
          category: 'production',
        })
      }
    }

    // Check narrative gaps
    for (const narrativeGap of critique.narrativeGaps) {
      unresolvedCritiques.push({
        critique: narrativeGap.critique,
        severity: 'medium',
        acknowledgmentSuggestion: `Add a tech decision or explanation: ${narrativeGap.suggestedPrompt}`,
        category: 'narrative',
      })
    }
  }

  // 3. CALCULATE COMPLETENESS SCORE
  let completenessScore = 50 // Base score

  if (journey) {
    // Has core sections
    if (journey.problemStatement) completenessScore += 10
    if (journey.technicalApproach) completenessScore += 10
    if (journey.techDecisions && journey.techDecisions.length > 0) completenessScore += 10

    // Has optional sections
    if (journey.keyChallenges) completenessScore += 5
    if (journey.outcome) completenessScore += 5
    if (journey.learnings && journey.learnings.length > 0) completenessScore += 5

    // Has enhanced fields
    if (journey.architecturalTradeoffs && journey.architecturalTradeoffs.length > 0) completenessScore += 5
    if (journey.techDecisions?.some(d => d.alternativesConsidered && d.alternativesConsidered.length > 0)) {
      completenessScore += 5
    }
    if (journey.techDecisions?.some(d => d.evidenceLink)) completenessScore += 5
  }

  // Penalize for unresolved critiques
  completenessScore -= unresolvedCritiques.filter(c => c.severity === 'high').length * 5
  completenessScore -= unresolvedCritiques.filter(c => c.severity === 'medium').length * 2

  // Ensure score is between 0 and 100
  completenessScore = Math.max(0, Math.min(100, completenessScore))

  // 4. GENERATE HIGH-LEVEL SUGGESTIONS
  if (narrativeDiscoveries.length > 0) {
    suggestions.push(
      `You have ${narrativeDiscoveries.length} strength(s) identified by technical assessment that you haven't highlighted in your journey.`
    )
  }

  const highSeverityCritiques = unresolvedCritiques.filter(c => c.severity === 'high')
  if (highSeverityCritiques.length > 0) {
    suggestions.push(
      `${highSeverityCritiques.length} high-priority issue(s) need to be addressed or acknowledged in your narrative.`
    )
  }

  if (!journey?.architecturalTradeoffs || journey.architecturalTradeoffs.length === 0) {
    suggestions.push('Consider adding an "Architectural Trade-offs" section to explain key design decisions.')
  }

  const techDecisionsWithEvidence = journey?.techDecisions?.filter(d => d.evidenceLink).length || 0
  const totalTechDecisions = journey?.techDecisions?.length || 0
  if (totalTechDecisions > 0 && techDecisionsWithEvidence < totalTechDecisions / 2) {
    suggestions.push('Add GitHub permalink evidence to your tech decisions to make them more credible.')
  }

  if (completenessScore < 70) {
    suggestions.push('Your technical narrative could benefit from more depth and trade-off analysis.')
  }

  return {
    narrativeDiscoveries,
    unresolvedCritiques,
    overallCompleteness: completenessScore,
    suggestions,
  }
}

/**
 * Extract keywords from a standout quality description
 */
function extractKeywords(quality: string): string[] {
  // Remove common words and extract meaningful terms
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during']

  const words = quality
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word))

  return words.slice(0, 5) // Return top 5 keywords
}

/**
 * Generate a prompt for user to add missing quality
 */
function generateAdditionPrompt(quality: string): string {
  if (quality.toLowerCase().includes('performance')) {
    return 'Add a section explaining your performance optimization approach and metrics achieved.'
  } else if (quality.toLowerCase().includes('scale') || quality.toLowerCase().includes('scalability')) {
    return 'Explain how you designed for scalability and what growth you can handle.'
  } else if (quality.toLowerCase().includes('architecture')) {
    return 'Add architectural trade-offs section explaining your design decisions.'
  } else if (quality.toLowerCase().includes('security')) {
    return 'Document your security approach and measures taken.'
  } else if (quality.toLowerCase().includes('test')) {
    return 'Explain your testing strategy and coverage.'
  } else if (quality.toLowerCase().includes('ui') || quality.toLowerCase().includes('ux')) {
    return 'Add details about your user experience design decisions.'
  } else if (quality.toLowerCase().includes('real-time') || quality.toLowerCase().includes('realtime')) {
    return 'Explain how you implemented real-time features and why.'
  } else {
    return `Add a learning or outcome about: ${quality}`
  }
}

/**
 * Assess priority of a missing quality
 */
function assessPriority(quality: string): 'high' | 'medium' | 'low' {
  const highPriorityTerms = ['architecture', 'scale', 'performance', 'security', 'production']
  const mediumPriorityTerms = ['optimization', 'design', 'pattern', 'approach', 'strategy']

  const lowerQuality = quality.toLowerCase()

  if (highPriorityTerms.some(term => lowerQuality.includes(term))) {
    return 'high'
  } else if (mediumPriorityTerms.some(term => lowerQuality.includes(term))) {
    return 'medium'
  } else {
    return 'low'
  }
}
