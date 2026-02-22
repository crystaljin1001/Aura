/**
 * Decision Tree Node - Tree/Flowchart Visualization
 * Root Node (Problem) → Branch Nodes (Alternatives) → Leaf Node (Solution)
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X, Check, ChevronDown, ExternalLink } from 'lucide-react'
import { EditDecisionButton } from './EditDecisionButton'
import { CodeSnippetPreview } from './CodeSnippetPreview'
import { isGitHubPermalink } from '@/lib/github/parse-permalink'
import type { TechDecisionNode } from '../types/logic-map'

interface DecisionTreeNodeProps {
  decision: TechDecisionNode
  index: number
  allDecisions: TechDecisionNode[]
  repositoryUrl: string
}

export function DecisionTreeNode({ decision, index, allDecisions, repositoryUrl }: DecisionTreeNodeProps) {
  const [expandedAlt, setExpandedAlt] = useState<number | null>(null)

  const numAlternatives = decision.alternativesConsidered.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative mb-20"
      itemScope
      itemType="https://schema.org/Decision"
    >
      {/* Edit Button */}
      <EditDecisionButton
        decision={decision}
        decisionIndex={index}
        repositoryUrl={repositoryUrl}
        allDecisions={allDecisions}
      />

      {/* Decision Number */}
      <div className="text-center mb-6">
        <span className="inline-block px-4 py-1.5 bg-purple-500/20 border border-purple-500 rounded-full text-sm font-bold text-purple-400">
          Decision #{index + 1}: {decision.technology}
        </span>
      </div>

      {/* ROOT NODE: The Problem */}
      <div className="flex justify-center mb-12">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="relative w-80 bg-orange-500/10 border-2 border-orange-500/50 rounded-xl p-6 text-center"
          itemProp="about"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-background border border-orange-500 rounded-full">
            <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">The Challenge</span>
          </div>

          <AlertCircle className="w-6 h-6 text-orange-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground" itemProp="name">
            {decision.problem}
          </p>

          {/* Trunk line down */}
          <div className="absolute -bottom-12 left-1/2 w-0.5 h-12 bg-border" />
        </motion.div>
      </div>

      {/* BRANCH NODES: Alternatives (Middle Layer) */}
      <div className="relative mb-20">
        {/* Horizontal connecting line across alternatives */}
        {numAlternatives > 1 && (
          <div
            className="absolute top-0 left-0 right-0 h-0.5 bg-border"
            style={{
              left: `${100 / (numAlternatives * 2)}%`,
              right: `${100 / (numAlternatives * 2)}%`
            }}
          />
        )}

        <div className="grid gap-4 pt-12" style={{
          gridTemplateColumns: numAlternatives > 0 ? `repeat(${numAlternatives}, minmax(0, 1fr))` : '1fr'
        }}>
          {/* REJECTED ALTERNATIVES (Branch Nodes) */}
          {decision.alternativesConsidered.map((alt, altIndex) => (
            <div key={altIndex} className="relative">
              {/* Branch line up to root */}
              <div className="absolute -top-12 left-1/2 w-0.5 h-12 bg-red-500/30" />

              {/* Branch line down to leaf */}
              <div className="absolute -bottom-12 left-1/2 w-0.5 h-12 bg-border" />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setExpandedAlt(expandedAlt === altIndex ? null : altIndex)}
                className="w-full bg-red-500/10 border-2 border-red-500/50 rounded-xl p-4 text-left hover:bg-red-500/20 transition-colors"
                itemProp="option"
                itemScope
                itemType="https://schema.org/Thing"
              >
                {/* Branch Node Label */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-background border border-red-500/50 rounded text-xs font-semibold text-red-400 whitespace-nowrap">
                  Pivot / Alternative
                </div>

                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="font-semibold text-sm" itemProp="name">{alt.name}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedAlt === altIndex ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                </div>

                {/* Why NOT? - Rejection Logic (Always Visible) */}
                <div className="mt-3" itemProp="description">
                  <p className="text-xs font-bold text-red-400 mb-1">🚫 Why NOT?</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{alt.whyRejected}</p>
                </div>

                {/* Expanded: Pros/Cons Details */}
                <AnimatePresence>
                  {expandedAlt === altIndex && (alt.pros.length > 0 || alt.cons.length > 0) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mt-3 pt-3 border-t border-red-500/30"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {alt.pros.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-green-400 mb-1">Pros</p>
                            <ul className="space-y-1">
                              {alt.pros.map((pro, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                  <span className="text-green-400">+</span>
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {alt.cons.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-red-400 mb-1">Cons</p>
                            <ul className="space-y-1">
                              {alt.cons.map((con, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                  <span className="text-red-400">−</span>
                                  <span>{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          ))}
        </div>

        {/* Horizontal connecting line at bottom of alternatives (if multiple) */}
        {numAlternatives > 1 && (
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-border"
            style={{
              left: `${100 / (numAlternatives * 2)}%`,
              right: `${100 / (numAlternatives * 2)}%`
            }}
          />
        )}

        {/* Single vertical line down from center to leaf */}
        <div className="absolute -bottom-12 left-1/2 w-0.5 h-12 bg-green-500/30" />
      </div>

      {/* LEAF NODE: Chosen Solution (Bottom Layer) */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setExpandedAlt(expandedAlt === 9999 ? null : 9999)}
          className="w-80 bg-green-500/10 border-2 border-green-500/50 rounded-xl p-4 text-left hover:bg-green-500/20 transition-colors relative"
          itemProp="result"
          itemScope
          itemType="https://schema.org/Thing"
        >
          {/* Leaf Node Label */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-background border border-green-500/50 rounded text-xs font-semibold text-green-400 whitespace-nowrap">
            Chosen Solution
          </div>

          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="font-semibold text-sm" itemProp="name">{decision.chosenSolution.name}</span>
            </div>
            <motion.div
              animate={{ rotate: expandedAlt === 9999 ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          </div>

          {/* Why This? - Solution Rationale (Always Visible) */}
          <div className="mt-3" itemProp="description">
            <p className="text-xs font-bold text-green-400 mb-1">✓ Why This?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{decision.chosenSolution.rationale}</p>
          </div>

          {/* Expanded: Trade-offs & Evidence */}
          <AnimatePresence>
            {expandedAlt === 9999 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-3 pt-3 border-t border-green-500/30"
              >
                {/* Trade-offs */}
                {decision.chosenSolution.tradeoffsAccepted.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-orange-400 mb-1">⚠ Trade-offs Accepted</p>
                    <ul className="space-y-1">
                      {decision.chosenSolution.tradeoffsAccepted.map((tradeoff, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                          <span className="text-orange-400">⚠</span>
                          <span>{tradeoff}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Verification Link & Code Proof */}
                {decision.chosenSolution.evidenceLink && (
                  <div>
                    {/* Show code snippet if it's a GitHub permalink */}
                    {isGitHubPermalink(decision.chosenSolution.evidenceLink) ? (
                      <CodeSnippetPreview
                        githubUrl={decision.chosenSolution.evidenceLink}
                        title="💎 Code Proof"
                      />
                    ) : (
                      /* Fallback for non-GitHub links */
                      <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                        <p className="text-xs font-semibold text-blue-400 mb-1">🔗 Verification Link</p>
                        <a
                          href={decision.chosenSolution.evidenceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 break-all"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          {decision.chosenSolution.evidenceLink}
                        </a>
                        <p className="text-xs text-muted-foreground mt-1">
                          AI agents can verify this implementation
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  )
}
