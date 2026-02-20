/**
 * Portfolio Case Study types
 */

import type { ImpactMetric } from '@/types'

export interface ProductHealthScore {
  score: number // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  color: 'green' | 'yellow' | 'red'
  breakdown: {
    issuesResolved: number
    performance: number
    quality: number
    features: number
    adoption: number
  }
}

export interface ProjectCompleteness {
  documentation: {
    hasReadme: boolean
    hasDescription: boolean
    readmeLength?: number
  }
  codeQuality: {
    hasTypeScript: boolean
    hasEnvExample: boolean
    hasTests: boolean
  }
  production: {
    isDeployed: boolean
    hasLicense: boolean
    hasGitignore: boolean
  }
  story: {
    hasTechnicalJourney: boolean
    hasTechDecisions: boolean
  }
}

export interface TechDecision {
  technology: string
  reason: string
  // ENHANCED: Trade-off analysis fields
  alternativesConsidered?: string[] // e.g., ["Redux", "Zustand", "Jotai"]
  tradeoffs?: {
    benefits?: string[] // e.g., ["Type-safe", "Less boilerplate"]
    drawbacks?: string[] // e.g., ["Bundle size", "Learning curve"]
    rejectionReasons?: Record<string, string> // e.g., {"Redux": "Too much boilerplate"}
  }
  evidenceLink?: string // GitHub permalink to implementation
}

export interface ArchitecturalTradeoff {
  decision: string // e.g., "Monolithic vs Microservices"
  chosen: string // e.g., "Monolithic"
  rationale: string // Why this choice for this context
  evidenceLink?: string // Link to architecture file
}

export interface TechnicalJourney {
  problemStatement: string
  technicalApproach: string
  keyChallenges?: string
  outcome?: string
  learnings?: string[]
  techDecisions?: TechDecision[]
  // NEW: Engineering trade-offs section
  architecturalTradeoffs?: ArchitecturalTradeoff[]
}

export interface ContextBlock {
  problem: string
  solution: string
  impact: string
}

export interface ArchitectureDiagram {
  mermaidCode: string
  type: 'flowchart' | 'sequence' | 'class' | 'architecture'
}

export interface CaseStudyProject {
  // Basic Info
  owner: string
  repo: string
  repositoryUrl: string
  description: string | null
  language: string | null

  // GitHub Stats
  stars: number
  forks: number
  openIssues: number
  pushedAt: string

  // Media
  videoUrl?: string | null
  videoThumbnail?: string | null
  screenshots?: string[]
  websiteUrl?: string | null

  // Tech
  techStack?: string[]

  // Impact
  metrics: ImpactMetric[]
  healthScore: ProductHealthScore
  completeness: ProjectCompleteness
  impactDataCached: boolean // Whether impact_cache entry exists (regardless of metrics)

  // User-Generated Content (NEW!)
  technicalJourney?: TechnicalJourney | null

  // AI-Generated Content (Legacy - being phased out)
  contextBlock?: ContextBlock | null
  architectureDiagram?: ArchitectureDiagram | null

  // Metadata
  lastUpdated: Date | null
  createdAt?: string
}
