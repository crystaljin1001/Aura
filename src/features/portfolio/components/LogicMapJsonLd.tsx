/**
 * Logic Map JSON-LD - Embed structured data for AI agents
 * Makes Logic Map discoverable and verifiable by AI agents
 *
 * CRITICAL: This uses a regular <script> tag (not Next.js Script component)
 * to ensure JSON-LD is in the initial HTML for bot discovery.
 */

import { getEnhancedDecisions, getPivotPoints } from '../api/logic-map-actions'
import { generateLogicMapJsonLd } from '../utils/logic-map-json-ld'

interface LogicMapJsonLdProps {
  repositoryUrl: string
  projectName: string
}

export async function LogicMapJsonLd({ repositoryUrl, projectName }: LogicMapJsonLdProps) {
  // Fetch decisions and pivot points
  const [decisionsResult, pivotsResult] = await Promise.all([
    getEnhancedDecisions(repositoryUrl),
    getPivotPoints(repositoryUrl),
  ])

  const decisions = decisionsResult.success && decisionsResult.data ? decisionsResult.data : []
  const pivots = pivotsResult.success && pivotsResult.data ? pivotsResult.data : []

  // Don't render if no Logic Map data
  if (decisions.length === 0 && pivots.length === 0) {
    return null
  }

  // Generate JSON-LD
  const jsonLd = generateLogicMapJsonLd(
    {
      decisionNodes: decisions,
      pivotPoints: pivots,
      enabled: true,
    },
    projectName,
    repositoryUrl
  )

  // ✅ FIX: Use regular script tag for SSR, not Next.js Script component
  // This ensures JSON-LD is in the initial HTML that bots see
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      suppressHydrationWarning
    />
  )
}
