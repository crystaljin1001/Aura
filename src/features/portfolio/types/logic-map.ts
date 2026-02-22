/**
 * Logic Map Types
 * Captures "Why THIS over THAT" reasoning for technical decisions
 */

/**
 * Alternative solution that was considered but rejected
 */
export interface Alternative {
  name: string // e.g., "Custom workflow system"
  pros: string[] // Benefits of this approach
  cons: string[] // Drawbacks of this approach
  whyRejected: string // The critical reasoning for not choosing this
}

/**
 * The chosen solution with explicit trade-offs
 */
export interface ChosenSolution {
  name: string // e.g., "LangGraph"
  rationale: string // Why THIS solution for THIS specific problem
  tradeoffsAccepted: string[] // What you gave up to gain the benefits
  evidenceLink?: string // GitHub permalink to implementation
}

/**
 * Enhanced technical decision with alternatives context
 */
export interface TechDecisionNode {
  technology: string // Primary tech being discussed
  problem: string // What decision needed to be made
  alternativesConsidered: Alternative[] // Other options evaluated
  chosenSolution: ChosenSolution // What you picked and why
}

/**
 * Critical pivot point in project development
 * Represents a moment where you changed course based on new learnings
 */
export interface PivotPoint {
  id?: string
  challenge: string // The problem you faced
  initialApproach: string // Your first attempt
  pivotReasoning: string // Why you changed course (new insight/data)
  newApproach: string // What you switched to
  outcome?: string // Result of the pivot
  impactMetric?: string // e.g., "accuracy", "performance", "user satisfaction"
  evidenceLink?: string // GitHub permalink to the pivot commit/PR
  commitSha?: string // Specific commit where pivot happened
  pivotDate?: string // ISO date when decision was made
  sequenceOrder?: number // For ordering multiple pivots
}

/**
 * Logic Map data structure
 * Combines decision trees and pivot points for a complete "judgment" narrative
 */
export interface LogicMap {
  decisionNodes: TechDecisionNode[] // Technical decisions with alternatives
  pivotPoints: PivotPoint[] // Critical course corrections
  enabled: boolean // Whether to show Logic Map (vs. standard Technical Journey)
}

/**
 * AI extraction prompt result
 */
export interface LogicMapExtraction {
  decisions: TechDecisionNode[]
  pivots: PivotPoint[]
  confidence: number // 0-1 score for how well AI could extract reasoning
}
