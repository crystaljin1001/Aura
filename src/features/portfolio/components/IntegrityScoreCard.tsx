/**
 * Integrity Score Card - Shows Logic Map quality metrics
 * Displays evidence coverage and verification score
 */

'use client'

import { motion } from 'framer-motion'
import { Shield, ExternalLink } from 'lucide-react'
import type { IntegrityScore } from '../utils/logic-map-json-ld'

interface IntegrityScoreCardProps {
  score: IntegrityScore
}

export function IntegrityScoreCard({}: IntegrityScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="border border-purple-500/30 rounded-xl p-6 bg-purple-500/5 relative overflow-hidden"
    >
      {/* Coming Soon Badge */}
      <div className="absolute top-4 right-4 px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full">
        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wide">Coming Soon</span>
      </div>
      <div className="flex items-start gap-4">
        {/* Score Badge */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-background/50 border border-purple-500/30 flex flex-col items-center justify-center">
            <Shield className="w-10 h-10 text-purple-400 opacity-50" />
          </div>
        </div>

        {/* Score Details */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-foreground">Integrity Score</h3>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Measure how well your Logic Map is backed by verifiable evidence (GitHub links, commit references, etc.). AI agents will verify your technical claims by checking evidence links.
          </p>

          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                <strong className="text-purple-400">Preview:</strong> Add evidence links to your decisions to see your integrity score and enable AI agent verification.
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
