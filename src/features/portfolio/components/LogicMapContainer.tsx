/**
 * Logic Map Container - Server Component
 * Fetches and displays Logic Map data
 */

import { getEnhancedDecisions, getPivotPoints } from '../api/logic-map-actions'
import { LogicMapSection } from './LogicMapSection'
import { GenerateLogicMapButton } from './GenerateLogicMapButton'
import { LogicMapControls } from './LogicMapControls'

interface LogicMapContainerProps {
  repositoryUrl: string
}

export async function LogicMapContainer({ repositoryUrl }: LogicMapContainerProps) {
  // Fetch decisions and pivot points
  const [decisionsResult, pivotsResult] = await Promise.all([
    getEnhancedDecisions(repositoryUrl),
    getPivotPoints(repositoryUrl),
  ])

  const decisions = decisionsResult.success && decisionsResult.data ? decisionsResult.data : []
  const pivots = pivotsResult.success && pivotsResult.data ? pivotsResult.data : []

  const hasData = decisions.length > 0 || pivots.length > 0

  if (!hasData) {
    return (
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="glass-card border border-purple-500/30 rounded-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Logic Map Not Created Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Add your technical decisions to show your decision-making process with "Why NOT X?" reasoning
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <GenerateLogicMapButton repositoryUrl={repositoryUrl} />
            <LogicMapControls repositoryUrl={repositoryUrl} existingDecisions={[]} />
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <LogicMapSection
        logicMap={{
          decisionNodes: decisions,
          pivotPoints: pivots,
          enabled: true,
        }}
        repositoryUrl={repositoryUrl}
      />
      {/* Add controls at the bottom */}
      <section className="max-w-5xl mx-auto px-6 pb-8">
        <LogicMapControls repositoryUrl={repositoryUrl} existingDecisions={decisions} />
      </section>
    </>
  )
}
