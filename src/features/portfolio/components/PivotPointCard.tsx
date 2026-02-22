/**
 * Pivot Point Card - Shows Critical Course Corrections
 * Represents moments of judgment where the developer changed approach
 */

'use client'

import { motion } from 'framer-motion'
import { TrendingUp, ExternalLink, Calendar } from 'lucide-react'
import type { PivotPoint } from '../types/logic-map'

interface PivotPointCardProps {
  pivot: PivotPoint
  index: number
}

export function PivotPointCard({ pivot, index }: PivotPointCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {/* Timeline Connector */}
      {index > 0 && (
        <div className="absolute top-0 left-5 -translate-y-full h-8 w-0.5 bg-gradient-to-b from-purple-500/50 to-transparent" />
      )}

      <div className="glass-card border border-purple-500/30 rounded-xl p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-lg">Pivot {index + 1}</h4>
              {pivot.pivotDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(pivot.pivotDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{pivot.challenge}</p>
          </div>
        </div>

        {/* Pivot Flow */}
        <div className="space-y-4">
          {/* Initial Approach */}
          <div className="relative pl-6">
            <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-red-500/20 border-2 border-red-500" />
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-400 mb-1">Initial Approach</p>
              <p className="text-sm">{pivot.initialApproach}</p>
            </div>
          </div>

          {/* Pivot Reasoning (The Critical Insight) */}
          <div className="relative pl-6">
            <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-orange-500/20 border-2 border-orange-500" />
            <div className="absolute left-2 -top-2 bottom-2 w-0.5 bg-gradient-to-b from-red-500 to-orange-500" />
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
              <p className="text-xs font-semibold text-orange-400 mb-1">
                💡 Critical Insight
              </p>
              <p className="text-sm font-medium">{pivot.pivotReasoning}</p>
            </div>
          </div>

          {/* New Approach */}
          <div className="relative pl-6">
            <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-green-500/20 border-2 border-green-500" />
            <div className="absolute left-2 -top-2 bottom-2 w-0.5 bg-gradient-to-b from-orange-500 to-green-500" />
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-400 mb-1">New Approach</p>
              <p className="text-sm">{pivot.newApproach}</p>
            </div>
          </div>

          {/* Outcome */}
          {pivot.outcome && (
            <div className="relative pl-6">
              <div className="absolute left-2 -top-2 h-2 w-0.5 bg-gradient-to-b from-green-500 to-transparent" />
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-blue-400 mb-1">Outcome</p>
                    <p className="text-sm">{pivot.outcome}</p>
                  </div>
                  {pivot.impactMetric && (
                    <div className="bg-blue-500/20 px-2 py-1 rounded text-xs font-medium text-blue-400">
                      {pivot.impactMetric}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Evidence Link */}
        {pivot.evidenceLink && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <a
              href={pivot.evidenceLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
            >
              <ExternalLink className="w-3 h-3" />
              View Pivot Commit
              {pivot.commitSha && (
                <span className="text-muted-foreground ml-1">
                  ({pivot.commitSha.slice(0, 7)})
                </span>
              )}
            </a>
          </div>
        )}
      </div>
    </motion.div>
  )
}
