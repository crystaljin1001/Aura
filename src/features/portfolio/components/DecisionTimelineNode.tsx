/**
 * Decision Timeline Node - Vertical Story Flow
 * Shows: Problem → Rejected Ideas (with Why) → Final Solution
 * Focus Mode: Click to reveal full reasoning
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X, Check, ChevronRight, ExternalLink } from 'lucide-react'
import type { TechDecisionNode } from '../types/logic-map'

interface DecisionTimelineNodeProps {
  decision: TechDecisionNode
  index: number
}

export function DecisionTimelineNode({ decision, index }: DecisionTimelineNodeProps) {
  const [focusedNode, setFocusedNode] = useState<number | null>(null)

  const toggleFocus = (nodeIndex: number) => {
    setFocusedNode(focusedNode === nodeIndex ? null : nodeIndex)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
      // Semantic structure for AI parsing
      itemScope
      itemType="https://schema.org/Decision"
    >
      {/* Decision Number Badge */}
      <div className="absolute -left-12 top-6">
        <div className="w-8 h-8 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center">
          <span className="text-sm font-bold text-purple-400">{index + 1}</span>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="ml-4 border-l-2 border-border pl-8 pb-8">
        {/* Problem Statement */}
        <div className="mb-6" itemProp="about">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-orange-400 uppercase tracking-wide">
                Problem
              </h4>
              <p className="text-sm font-medium text-foreground mt-1" itemProp="name">
                {decision.problem}
              </p>
            </div>
          </div>
        </div>

        {/* Rejected Ideas (Vertical Flow) */}
        <div className="space-y-4 mb-6">
          {decision.alternativesConsidered.map((alternative, altIndex) => (
            <div
              key={altIndex}
              className="relative"
              itemProp="option"
              itemScope
              itemType="https://schema.org/Thing"
            >
              {/* Connector Line */}
              <div className="absolute -left-8 top-0 w-8 h-px bg-border" />
              <div className="absolute -left-8 top-0 w-2 h-2 rounded-full bg-red-500 -translate-x-1" />

              {/* Rejected Node */}
              <button
                onClick={() => toggleFocus(altIndex)}
                className={`
                  w-full text-left transition-all duration-200
                  ${focusedNode === altIndex ? 'bg-red-500/10' : 'bg-background/50 hover:bg-red-500/5'}
                  border border-red-500/30 rounded-lg p-4
                `}
                aria-label={`Show why ${alternative.name} was rejected`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="font-semibold text-sm" itemProp="name">
                        {alternative.name}
                      </span>
                    </div>

                    {/* Why Rejected (Always Visible - Critical for AI) */}
                    <div className="mt-2" itemProp="description">
                      <p className="text-xs font-semibold text-red-400 mb-1">Why NOT?</p>
                      <p className="text-sm text-muted-foreground">{alternative.whyRejected}</p>
                    </div>
                  </div>

                  {/* Focus Mode Indicator */}
                  <motion.div
                    animate={{ rotate: focusedNode === altIndex ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                </div>

                {/* Expanded Details (Focus Mode) */}
                <AnimatePresence>
                  {focusedNode === altIndex && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-red-500/20">
                        <div className="grid grid-cols-2 gap-3">
                          {/* Pros */}
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2">
                              Pros
                            </p>
                            <ul className="space-y-1">
                              {alternative.pros.map((pro, i) => (
                                <li
                                  key={i}
                                  className="text-xs text-muted-foreground flex items-start gap-2"
                                >
                                  <span className="text-green-400">+</span>
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Cons */}
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2">
                              Cons
                            </p>
                            <ul className="space-y-1">
                              {alternative.cons.map((con, i) => (
                                <li
                                  key={i}
                                  className="text-xs text-muted-foreground flex items-start gap-2"
                                >
                                  <span className="text-red-400">−</span>
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          ))}
        </div>

        {/* Final Solution */}
        <div className="relative" itemProp="result" itemScope itemType="https://schema.org/Thing">
          {/* Connector Line */}
          <div className="absolute -left-8 top-6 w-8 h-px bg-border" />
          <div className="absolute -left-8 top-6 w-2 h-2 rounded-full bg-green-500 -translate-x-1" />

          {/* Solution Node */}
          <button
            onClick={() => toggleFocus(9999)} // Use high number for solution
            className={`
              w-full text-left transition-all duration-200
              ${focusedNode === 9999 ? 'bg-green-500/10' : 'bg-green-500/5 hover:bg-green-500/10'}
              border border-green-500/30 rounded-lg p-4
            `}
            aria-label={`Show why ${decision.chosenSolution.name} was chosen`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="font-semibold text-sm" itemProp="name">
                    {decision.chosenSolution.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                    Chosen
                  </span>
                </div>

                {/* Why Chosen (Always Visible - Critical for AI) */}
                <div className="mt-2" itemProp="description">
                  <p className="text-xs font-semibold text-green-400 mb-1">Why This?</p>
                  <p className="text-sm text-muted-foreground">
                    {decision.chosenSolution.rationale}
                  </p>
                </div>
              </div>

              <motion.div
                animate={{ rotate: focusedNode === 9999 ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </div>

            {/* Expanded Details (Focus Mode) */}
            <AnimatePresence>
              {focusedNode === 9999 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-green-500/20">
                    {/* Trade-offs Accepted */}
                    {decision.chosenSolution.tradeoffsAccepted.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-orange-400 mb-2">
                          Trade-offs Accepted
                        </p>
                        <ul className="space-y-1">
                          {decision.chosenSolution.tradeoffsAccepted.map((tradeoff, i) => (
                            <li
                              key={i}
                              className="text-xs text-muted-foreground flex items-start gap-2"
                            >
                              <span className="text-orange-400">⚠</span>
                              {tradeoff}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Evidence Link */}
                    {decision.chosenSolution.evidenceLink && (
                      <a
                        href={decision.chosenSolution.evidenceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Implementation
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Technology Label (Top Right) */}
      <div className="absolute top-0 right-0">
        <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">
          <span className="text-xs font-semibold text-blue-400">{decision.technology}</span>
        </div>
      </div>
    </motion.div>
  )
}
