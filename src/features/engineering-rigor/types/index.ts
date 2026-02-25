/**
 * Engineering Rigor Types
 * Measures code quality, testing, infrastructure, and maintenance practices
 */

export interface ToolingIntent {
  has_prettier: boolean
  has_eslint: boolean
  has_typescript_config: boolean
  has_ruff: boolean // Python formatter
  has_black: boolean // Python formatter
  has_pylint: boolean
  has_editorconfig: boolean
  config_files_found: string[]
  score: number // 0-2 points
}

export interface StabilityInfrastructure {
  has_ci_cd: boolean
  workflow_files: string[]
  workflow_complexity: 'none' | 'basic' | 'intermediate' | 'advanced'
  complexity_score: number // 0-3 points
  ci_features: {
    has_testing: boolean
    has_linting: boolean
    has_deployment: boolean
    has_security_scanning: boolean
    has_multi_stage: boolean
    has_caching: boolean
  }
  score: number // 0-3 points
}

export interface TestingRatio {
  test_file_count: number
  source_file_count: number
  test_directories: string[]
  testing_ratio: number // test files / source files
  has_test_directory: boolean
  test_frameworks_detected: string[]
  score: number // 0-2.5 points
}

export interface RefactorSignal {
  total_commits_30d: number
  commits_with_net_deletions: number
  total_additions_30d: number
  total_deletions_30d: number
  net_change_30d: number // positive means growth, negative means refactoring
  refactor_ratio: number // deletions / additions (>1 means active cleanup)
  has_active_refactoring: boolean // true if net negative or high deletion ratio
  score: number // 0-1.5 points
  category: 'Feature Bloat' | 'Balanced' | 'Technical Debt Management'
}

export interface DocumentationDepth {
  readme_length: number
  has_readme: boolean
  sections_found: {
    setup: boolean
    architecture: boolean
    api_reference: boolean
    contributing: boolean
    testing: boolean
    deployment: boolean
  }
  section_count: number
  has_other_docs: boolean
  doc_files: string[]
  score: number // 0-1 point
}

export interface EngineeringRigorMetrics {
  overall_score: number // 0-10 scale
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F'
  category: 'Production Ready' | 'Professional' | 'Growing' | 'Hobby Project' | 'Early Stage'
  badge: 'Clean Architect' | 'Quality Focused' | 'Active Builder' | 'Learning' | 'Quick Prototype'

  breakdown: {
    tooling: ToolingIntent
    infrastructure: StabilityInfrastructure
    testing: TestingRatio
    refactoring: RefactorSignal
    documentation: DocumentationDepth
  }

  key_signals: string[] // Top 3 signals for AI context
  improvements: string[] // Suggestions for improvement

  ai_context: string // One-line summary for AI systems
}

export interface DualPulseMetrics {
  repository_url: string
  velocity: {
    score: number // 0-10
    label: string
    badge: string
    key_signal: string
    ai_context: string
  }
  engineering_rigor: {
    score: number // 0-10
    label: string
    badge: string
    key_signal: string
    ai_context: string
  }
  last_updated: string
}

// GitHub API Response Types
export interface GitHubWorkflowFile {
  name: string
  path: string
  sha: string
  size: number
  url: string
  content?: string // Base64 encoded
}

export interface GitHubTreeNode {
  path: string
  mode: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
  url: string
}

export interface GitHubCommitDetail {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  stats: {
    additions: number
    deletions: number
    total: number
  }
  files?: Array<{
    filename: string
    additions: number
    deletions: number
    changes: number
    status: string
  }>
}
