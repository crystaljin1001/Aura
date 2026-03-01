/**
 * Orchestration Diagram Types
 * Types for the Aura backend architecture visualization
 */

export type NodeTier = 'input' | 'processing' | 'synthesis' | 'output'

export interface AgentNodeData {
  label: string
  description: string
  dataSource: string
  tier: NodeTier
  icon?: string
}

export type OrchestrationNodeType =
  | 'input'
  | 'agent'
  | 'synthesis'
  | 'output'
