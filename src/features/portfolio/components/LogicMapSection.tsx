/**
 * Logic Map Section - Complete Decision & Pivot Visualization
 * Shows "Why THIS over THAT" reasoning for technical decisions
 */

'use client'

import { motion } from 'framer-motion'
import { Brain, GitBranch } from 'lucide-react'
import { DecisionTreeNode } from './DecisionTreeNode'
import { PivotPointCard } from './PivotPointCard'
import { IntegrityScoreCard } from './IntegrityScoreCard'
import { calculateIntegrityScore } from '../utils/logic-map-json-ld'
import type { LogicMap } from '../types/logic-map'

interface LogicMapSectionProps {
  logicMap: LogicMap
  repositoryUrl?: string
}

export function LogicMapSection({ logicMap, repositoryUrl = '' }: LogicMapSectionProps) {
  const { decisionNodes, pivotPoints } = logicMap

  if (decisionNodes.length === 0 && pivotPoints.length === 0) {
    return null
  }

  // Calculate Integrity Score
  const integrityScore = calculateIntegrityScore(logicMap)

  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="w-8 h-8 text-purple-400" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Logic Map</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Technical decisions with alternatives considered and critical pivot points that shaped
          the project
        </p>
      </motion.div>

      {/* Integrity Score */}
      {decisionNodes.length > 0 && (
        <div className="mb-12">
          <IntegrityScoreCard score={integrityScore} />
        </div>
      )}

      {/* Decision Timeline Section */}
      {decisionNodes.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-orange-500 via-red-500 to-green-500 rounded-full" />
            <h3 className="text-xl font-semibold">Technical Decisions</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>

          <p className="text-sm text-muted-foreground mb-8">
            Each tree shows: <strong>The Challenge</strong> (problem) → <strong>Pivot / Alternative</strong> (rejected alternatives with "Why NOT?") → <strong>Chosen Solution</strong> (chosen solution). Click nodes to expand details.
          </p>

          <div className="space-y-16">
            {decisionNodes.map((decision, index) => (
              <DecisionTreeNode
                key={index}
                decision={decision}
                index={index}
                allDecisions={decisionNodes}
                repositoryUrl={repositoryUrl}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pivot Points Section */}
      {pivotPoints.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <GitBranch className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-semibold">Critical Pivots</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/30 via-purple-500/20 to-transparent" />

            <div className="space-y-8">
              {pivotPoints
                .sort((a, b) => {
                  // Sort by pivot date if available, otherwise by sequence order
                  if (a.pivotDate && b.pivotDate) {
                    return new Date(a.pivotDate).getTime() - new Date(b.pivotDate).getTime()
                  }
                  return (a.sequenceOrder || 0) - (b.sequenceOrder || 0)
                })
                .map((pivot, index) => (
                  <PivotPointCard key={pivot.id || index} pivot={pivot} index={index} />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Why This Matters Explainer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6"
      >
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Why This Matters
        </h4>
        <p className="text-sm text-muted-foreground mb-3">
          This Logic Map shows <strong>technical discernment</strong> through the decision journey.
          The "Why NOT?" reasoning for rejected alternatives demonstrates:
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>
              <strong>Trade-off Analysis:</strong> Understanding what you gain and sacrifice
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>
              <strong>Context Awareness:</strong> The best tool depends on the constraints
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>
              <strong>Judgment Under Uncertainty:</strong> Choosing with incomplete information
            </span>
          </li>
        </ul>

        <div className="mt-4 pt-4 border-t border-purple-500/20">
          <p className="text-xs text-muted-foreground">
            <strong>For AI Agents:</strong> All reasoning is semantically structured with Schema.org markup
            for verification and analysis.
          </p>
        </div>
      </motion.div>
    </section>
  )
}
