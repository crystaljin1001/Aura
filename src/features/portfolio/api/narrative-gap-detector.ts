'use server'

/**
 * Narrative Gap Detector
 *
 * Cross-references critique results against user's technical journey
 * Identifies what the user failed to address or explain
 */

import type { TechnicalJourney } from '../types'
import type { CritiqueResult } from './criticize-agent'

export interface NarrativeGap {
  type: 'unaddressed_flaw' | 'missing_justification' | 'evidence_mismatch'
  critique: string // From criticize agent
  userClaim?: string // From technical journey
  evidenceConflict?: string // Where code contradicts narrative
  suggestedAddition: string // What to add to journey
  priority: 'high' | 'medium' | 'low'
}

/**
 * Detects gaps between critique and user's narrative
 */
export async function detectNarrativeGaps(
  critique: CritiqueResult,
  journey: TechnicalJourney
): Promise<NarrativeGap[]> {
  const gaps: NarrativeGap[] = []

  // 1. Check for unaddressed high-severity architectural debt
  for (const debt of critique.architecturalDebt) {
    if (debt.severity === 'high') {
      const mentionedInChallenges = journey.keyChallenges?.toLowerCase().includes(debt.issue.toLowerCase())
      const mentionedInTradeoffs = journey.architecturalTradeoffs?.some(
        tradeoff => tradeoff.rationale.toLowerCase().includes(debt.issue.toLowerCase())
      )

      if (!mentionedInChallenges && !mentionedInTradeoffs) {
        gaps.push({
          type: 'unaddressed_flaw',
          critique: debt.issue,
          suggestedAddition: `Consider addressing this in 'Key Challenges' or 'Architectural Trade-offs': ${debt.suggestion}`,
          priority: 'high',
        })
      }
    }
  }

  // 2. Check for missing production gap acknowledgments
  const securityGaps = critique.productionGaps.filter(g => g.category === 'security')
  const testingGaps = critique.productionGaps.filter(g => g.category === 'testing')

  if (securityGaps.length > 0) {
    const mentionsSecurity = journey.keyChallenges?.toLowerCase().includes('security') ||
      journey.technicalApproach?.toLowerCase().includes('security')

    if (!mentionsSecurity) {
      gaps.push({
        type: 'unaddressed_flaw',
        critique: `Security gaps: ${securityGaps.map(g => g.gap).join(', ')}`,
        suggestedAddition: `Add a section explaining your security strategy or acknowledge these as future improvements`,
        priority: 'high',
      })
    }
  }

  if (testingGaps.length > 0) {
    const mentionsTesting = journey.keyChallenges?.toLowerCase().includes('test') ||
      journey.learnings?.some(l => l.toLowerCase().includes('test'))

    if (!mentionsTesting) {
      gaps.push({
        type: 'unaddressed_flaw',
        critique: `Testing gaps: ${testingGaps.map(g => g.gap).join(', ')}`,
        suggestedAddition: `Explain your testing approach or acknowledge this as a planned improvement`,
        priority: 'medium',
      })
    }
  }

  // 3. Check for missing technology justifications
  for (const narrativeGap of critique.narrativeGaps) {
    const isTechDecisionGap = narrativeGap.critique.toLowerCase().includes('technology') ||
      narrativeGap.critique.toLowerCase().includes('database') ||
      narrativeGap.critique.toLowerCase().includes('framework')

    if (isTechDecisionGap) {
      gaps.push({
        type: 'missing_justification',
        critique: narrativeGap.critique,
        suggestedAddition: `Add a tech decision explaining: ${narrativeGap.suggestedPrompt}`,
        priority: 'medium',
      })
    }
  }

  // 4. Check for evidence mismatches in tech decisions
  if (journey.techDecisions) {
    for (const decision of journey.techDecisions) {
      // Check if the technology claim is supported by code
      const productionGap = critique.productionGaps.find(
        gap => gap.gap.toLowerCase().includes(decision.technology.toLowerCase())
      )

      if (productionGap) {
        gaps.push({
          type: 'evidence_mismatch',
          critique: productionGap.gap,
          userClaim: `User claims to use ${decision.technology}: "${decision.reason}"`,
          evidenceConflict: productionGap.impact,
          suggestedAddition: `Either remove this tech decision or address why the implementation is missing: ${productionGap.quickFix}`,
          priority: 'high',
        })
      }
    }
  }

  // 5. Check for architectural trade-off completeness
  if (journey.architecturalTradeoffs && journey.architecturalTradeoffs.length > 0) {
    for (const tradeoff of journey.architecturalTradeoffs) {
      // Check if trade-off has evidence link
      if (!tradeoff.evidenceLink) {
        gaps.push({
          type: 'missing_justification',
          critique: `Architectural trade-off "${tradeoff.decision}" lacks evidence link`,
          userClaim: tradeoff.rationale,
          suggestedAddition: `Add a GitHub link to the relevant architecture file or code`,
          priority: 'low',
        })
      }
    }
  } else if (critique.architecturalDebt.length > 0) {
    // User has no architectural trade-offs but critique found architectural decisions
    gaps.push({
      type: 'missing_justification',
      critique: 'No architectural trade-offs documented',
      suggestedAddition: 'Add an "Architectural Trade-offs" section explaining key architectural decisions',
      priority: 'medium',
    })
  }

  // 6. Check for learnings completeness
  if (!journey.learnings || journey.learnings.length === 0) {
    gaps.push({
      type: 'missing_justification',
      critique: 'No key learnings documented',
      suggestedAddition: 'Add learnings based on challenges faced and technologies used',
      priority: 'low',
    })
  }

  // Sort by priority (high > medium > low)
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return gaps
}

/**
 * Generate suggestions for filling narrative gaps
 */
export function generateGapSuggestions(gaps: NarrativeGap[]): string[] {
  const suggestions: string[] = []

  const highPriorityGaps = gaps.filter(g => g.priority === 'high')
  if (highPriorityGaps.length > 0) {
    suggestions.push(`You have ${highPriorityGaps.length} high-priority gap(s) in your technical narrative.`)
  }

  const unadddressedFlaws = gaps.filter(g => g.type === 'unaddressed_flaw')
  if (unadddressedFlaws.length > 0) {
    suggestions.push(`Consider addressing these issues in your 'Key Challenges' or as 'Planned Improvements'.`)
  }

  const missingJustifications = gaps.filter(g => g.type === 'missing_justification')
  if (missingJustifications.length > 0) {
    suggestions.push(`Add explanations for ${missingJustifications.length} technology or architectural choice(s).`)
  }

  const evidenceMismatches = gaps.filter(g => g.type === 'evidence_mismatch')
  if (evidenceMismatches.length > 0) {
    suggestions.push(`${evidenceMismatches.length} claim(s) in your journey don't match the code evidence.`)
  }

  return suggestions
}
