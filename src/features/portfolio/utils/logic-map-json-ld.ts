/**
 * Logic Map JSON-LD Generator
 * Creates structured data for AI agents to verify decision-making logic
 */

import type { LogicMap, TechDecisionNode, PivotPoint } from '../types/logic-map'

interface LogicMapJsonLd {
  '@context': string
  '@type': string
  name: string
  designProcess: DecisionNodeJsonLd[]
  pivotPoints: PivotPointJsonLd[]
}

interface DecisionNodeJsonLd {
  '@type': string
  identifier: string
  problem: string
  alternativeOptions: AlternativeJsonLd[]
  chosenSolution: SolutionJsonLd
}

interface AlternativeJsonLd {
  '@type': string
  name: string
  advantages: string[]
  disadvantages: string[]
  rejectionReason: string
}

interface SolutionJsonLd {
  '@type': string
  name: string
  rationale: string
  tradeoffs: string[]
  evidenceUrl?: string
}

interface PivotPointJsonLd {
  '@type': string
  identifier: string
  challenge: string
  initialApproach: string
  insight: string
  newApproach: string
  outcome?: string
  evidenceUrl?: string
  timestamp?: string
}

/**
 * Generate JSON-LD for AI agent consumption
 * Follows Schema.org Decision + custom DesignProcess vocabulary
 */
export function generateLogicMapJsonLd(
  logicMap: LogicMap,
  projectName: string,
  repositoryUrl: string
): LogicMapJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `${projectName} - Technical Decision Map`,
    designProcess: logicMap.decisionNodes.map((node, index) =>
      generateDecisionNodeJsonLd(node, index, repositoryUrl)
    ),
    pivotPoints: logicMap.pivotPoints.map((pivot, index) =>
      generatePivotPointJsonLd(pivot, index)
    ),
  }
}

/**
 * Generate JSON-LD for a single decision node
 */
function generateDecisionNodeJsonLd(
  decision: TechDecisionNode,
  index: number,
  repositoryUrl: string
): DecisionNodeJsonLd {
  return {
    '@type': 'Decision',
    identifier: `decision-${index + 1}`,
    problem: decision.problem,
    alternativeOptions: decision.alternativesConsidered.map(alt => ({
      '@type': 'Thing',
      name: alt.name,
      advantages: alt.pros,
      disadvantages: alt.cons,
      rejectionReason: alt.whyRejected,
    })),
    chosenSolution: {
      '@type': 'Thing',
      name: decision.chosenSolution.name,
      rationale: decision.chosenSolution.rationale,
      tradeoffs: decision.chosenSolution.tradeoffsAccepted,
      evidenceUrl: decision.chosenSolution.evidenceLink || generateGitHubSearchUrl(repositoryUrl, decision.technology),
    },
  }
}

/**
 * Generate JSON-LD for a pivot point
 */
function generatePivotPointJsonLd(pivot: PivotPoint, index: number): PivotPointJsonLd {
  return {
    '@type': 'Event',
    identifier: `pivot-${index + 1}`,
    challenge: pivot.challenge,
    initialApproach: pivot.initialApproach,
    insight: pivot.pivotReasoning,
    newApproach: pivot.newApproach,
    outcome: pivot.outcome,
    evidenceUrl: pivot.evidenceLink,
    timestamp: pivot.pivotDate,
  }
}

/**
 * Generate GitHub code search URL for verification
 */
function generateGitHubSearchUrl(repositoryUrl: string, technology: string): string {
  return `https://github.com/${repositoryUrl}/search?q=${encodeURIComponent(technology)}`
}

/**
 * Embed JSON-LD in page head for AI agent discovery
 */
export function generateJsonLdScript(jsonLd: LogicMapJsonLd): string {
  return `<script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>`
}

/**
 * Calculate "Integrity Score" - How well logic matches code
 * AI agents can verify by checking evidence URLs and code presence
 */
export interface IntegrityScore {
  score: number // 0-100
  evidenceLinksPresent: number
  totalDecisions: number
  verifiable: boolean
  recommendations: string[]
}

export function calculateIntegrityScore(logicMap: LogicMap): IntegrityScore {
  const totalDecisions = logicMap.decisionNodes.length
  const evidenceLinksPresent = logicMap.decisionNodes.filter(
    d => !!d.chosenSolution.evidenceLink
  ).length

  const score = totalDecisions > 0 ? (evidenceLinksPresent / totalDecisions) * 100 : 0

  const recommendations: string[] = []
  if (score < 50) {
    recommendations.push('Add evidence links to show implementation proof')
  }
  if (logicMap.pivotPoints.length === 0) {
    recommendations.push('Add pivot points to show adaptability')
  }
  if (logicMap.decisionNodes.some(d => d.alternativesConsidered.length < 2)) {
    recommendations.push('Consider at least 2 alternatives per decision')
  }

  return {
    score: Math.round(score),
    evidenceLinksPresent,
    totalDecisions,
    verifiable: score >= 75,
    recommendations,
  }
}
