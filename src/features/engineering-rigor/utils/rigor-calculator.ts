/**
 * Engineering Rigor Calculator
 * Analyzes repository data to compute engineering rigor scores
 */

import type {
  EngineeringRigorMetrics,
  ToolingIntent,
  StabilityInfrastructure,
  TestingRatio,
  RefactorSignal,
  DocumentationDepth,
  GitHubTreeNode,
  GitHubCommitDetail,
} from '../types'

/**
 * Analyze tooling configuration files
 */
export function analyzeToolingIntent(tree: GitHubTreeNode[]): ToolingIntent {
  const configFiles = tree
    .filter((node) => node.type === 'blob')
    .map((node) => node.path.toLowerCase())

  const has_prettier =
    configFiles.includes('.prettierrc') ||
    configFiles.includes('.prettierrc.json') ||
    configFiles.includes('.prettierrc.js') ||
    configFiles.some((f) => f.includes('prettier.config'))

  const has_eslint =
    configFiles.includes('.eslintrc') ||
    configFiles.includes('.eslintrc.json') ||
    configFiles.includes('.eslintrc.js') ||
    configFiles.includes('eslint.config.mjs') ||
    configFiles.includes('eslint.config.js')

  const has_typescript_config =
    configFiles.includes('tsconfig.json') ||
    configFiles.includes('tsconfig.build.json')

  const has_ruff = configFiles.includes('ruff.toml') || configFiles.includes('pyproject.toml')
  const has_black = configFiles.includes('.black') || configFiles.includes('pyproject.toml')
  const has_pylint = configFiles.includes('.pylintrc') || configFiles.includes('pylintrc')
  const has_editorconfig = configFiles.includes('.editorconfig')

  const config_files_found = tree
    .filter((node) => {
      const path = node.path.toLowerCase()
      return (
        node.type === 'blob' &&
        (path.includes('prettier') ||
          path.includes('eslint') ||
          path === 'tsconfig.json' ||
          path.includes('ruff.toml') ||
          path.includes('.editorconfig') ||
          path.includes('.black') ||
          path.includes('pylint'))
      )
    })
    .map((node) => node.path)

  // Scoring: 2 points max
  let score = 0
  if (has_prettier || has_black) score += 0.5
  if (has_eslint || has_pylint || has_ruff) score += 0.75
  if (has_typescript_config) score += 0.5
  if (has_editorconfig) score += 0.25

  return {
    has_prettier,
    has_eslint,
    has_typescript_config,
    has_ruff,
    has_black,
    has_pylint,
    has_editorconfig,
    config_files_found,
    score: Math.min(2, score),
  }
}

/**
 * Analyze CI/CD workflow complexity
 */
export function analyzeStabilityInfrastructure(
  workflowFiles: string[],
  workflowContents: string[]
): StabilityInfrastructure {
  const has_ci_cd = workflowFiles.length > 0

  // Analyze workflow contents for features
  const allContent = workflowContents.join('\n').toLowerCase()

  const ci_features = {
    has_testing:
      allContent.includes('test') ||
      allContent.includes('jest') ||
      allContent.includes('pytest') ||
      allContent.includes('vitest'),
    has_linting:
      allContent.includes('lint') ||
      allContent.includes('eslint') ||
      allContent.includes('ruff') ||
      allContent.includes('black'),
    has_deployment:
      allContent.includes('deploy') ||
      allContent.includes('vercel') ||
      allContent.includes('netlify') ||
      allContent.includes('aws') ||
      allContent.includes('docker'),
    has_security_scanning:
      allContent.includes('security') ||
      allContent.includes('snyk') ||
      allContent.includes('dependabot') ||
      allContent.includes('trivy') ||
      allContent.includes('semgrep'),
    has_multi_stage:
      allContent.includes('needs:') ||
      allContent.includes('depends-on') ||
      (allContent.match(/jobs:/g) || []).length > 2,
    has_caching:
      allContent.includes('cache') ||
      allContent.includes('actions/cache') ||
      allContent.includes('setup-node@'),
  }

  // Determine complexity
  let complexity: StabilityInfrastructure['workflow_complexity'] = 'none'
  let complexity_score = 0

  if (!has_ci_cd) {
    complexity = 'none'
    complexity_score = 0
  } else {
    const featureCount = Object.values(ci_features).filter((v) => v).length

    if (featureCount <= 1) {
      complexity = 'basic' // Just runs tests or lint
      complexity_score = 1
    } else if (featureCount <= 3) {
      complexity = 'intermediate' // Tests + linting + some other feature
      complexity_score = 2
    } else {
      complexity = 'advanced' // Multi-stage, security, deployment, caching
      complexity_score = 3
    }
  }

  // Score: 3 points max
  let score = complexity_score

  return {
    has_ci_cd,
    workflow_files: workflowFiles,
    workflow_complexity: complexity,
    complexity_score,
    ci_features,
    score: Math.min(3, score),
  }
}

/**
 * Analyze testing ratio
 */
export function analyzeTestingRatio(tree: GitHubTreeNode[]): TestingRatio {
  const files = tree.filter((node) => node.type === 'blob')

  // Find test directories
  const test_directories = Array.from(
    new Set(
      tree
        .filter(
          (node) =>
            node.type === 'tree' &&
            (node.path.includes('test') ||
              node.path.includes('spec') ||
              node.path.includes('__tests__'))
        )
        .map((node) => node.path)
    )
  )

  // Count test files
  const test_file_count = files.filter((node) => {
    const path = node.path.toLowerCase()
    return (
      path.includes('test') ||
      path.includes('spec') ||
      path.includes('__tests__') ||
      path.endsWith('.test.ts') ||
      path.endsWith('.test.js') ||
      path.endsWith('.test.tsx') ||
      path.endsWith('.test.jsx') ||
      path.endsWith('.spec.ts') ||
      path.endsWith('.spec.js') ||
      path.endsWith('_test.py') ||
      path.endsWith('_test.go')
    )
  }).length

  // Count source files (exclude node_modules, dist, build, etc.)
  const source_file_count = files.filter((node) => {
    const path = node.path.toLowerCase()
    return (
      !path.includes('node_modules') &&
      !path.includes('dist') &&
      !path.includes('build') &&
      !path.includes('.next') &&
      !path.includes('coverage') &&
      !path.includes('vendor') &&
      !path.includes('test') &&
      !path.includes('spec') &&
      !path.includes('__tests__') &&
      (path.endsWith('.ts') ||
        path.endsWith('.tsx') ||
        path.endsWith('.js') ||
        path.endsWith('.jsx') ||
        path.endsWith('.py') ||
        path.endsWith('.go') ||
        path.endsWith('.java') ||
        path.endsWith('.rb') ||
        path.endsWith('.rs'))
    )
  }).length

  const testing_ratio =
    source_file_count > 0 ? test_file_count / source_file_count : 0
  const has_test_directory = test_directories.length > 0

  // Detect test frameworks
  const test_frameworks_detected: string[] = []
  const allPaths = tree.map((n) => n.path.toLowerCase()).join(' ')
  if (allPaths.includes('jest') || allPaths.includes('jest.config')) {
    test_frameworks_detected.push('Jest')
  }
  if (allPaths.includes('vitest') || allPaths.includes('vitest.config')) {
    test_frameworks_detected.push('Vitest')
  }
  if (allPaths.includes('pytest') || allPaths.includes('conftest.py')) {
    test_frameworks_detected.push('pytest')
  }
  if (allPaths.includes('mocha') || allPaths.includes('.mocharc')) {
    test_frameworks_detected.push('Mocha')
  }
  if (allPaths.includes('cypress')) {
    test_frameworks_detected.push('Cypress')
  }
  if (allPaths.includes('playwright')) {
    test_frameworks_detected.push('Playwright')
  }

  // Scoring: 2.5 points max
  let score = 0
  if (has_test_directory) score += 0.5
  if (test_frameworks_detected.length > 0) score += 0.5

  // Ratio scoring
  if (testing_ratio >= 0.8) {
    score += 1.5 // Excellent coverage
  } else if (testing_ratio >= 0.5) {
    score += 1.0 // Good coverage
  } else if (testing_ratio >= 0.3) {
    score += 0.5 // Moderate coverage
  } else if (testing_ratio >= 0.1) {
    score += 0.25 // Some tests
  }

  return {
    test_file_count,
    source_file_count,
    test_directories,
    testing_ratio: Math.round(testing_ratio * 100) / 100,
    has_test_directory,
    test_frameworks_detected,
    score: Math.min(2.5, score),
  }
}

/**
 * Analyze refactoring signal from commits
 */
export function analyzeRefactorSignal(commits: GitHubCommitDetail[]): RefactorSignal {
  const total_commits_30d = commits.length

  let total_additions_30d = 0
  let total_deletions_30d = 0
  let commits_with_net_deletions = 0

  commits.forEach((commit) => {
    const additions = commit.stats?.additions || 0
    const deletions = commit.stats?.deletions || 0

    total_additions_30d += additions
    total_deletions_30d += deletions

    if (deletions > additions) {
      commits_with_net_deletions++
    }
  })

  const net_change_30d = total_additions_30d - total_deletions_30d
  const refactor_ratio =
    total_additions_30d > 0 ? total_deletions_30d / total_additions_30d : 0

  // Determine if actively refactoring
  const has_active_refactoring =
    net_change_30d < 0 || // Net negative lines
    refactor_ratio > 0.7 || // High deletion ratio
    (commits_with_net_deletions / total_commits_30d > 0.3 &&
      total_commits_30d > 5) // 30%+ commits are refactoring

  // Categorize
  let category: RefactorSignal['category'] = 'Balanced'
  if (has_active_refactoring) {
    category = 'Technical Debt Management'
  } else if (refactor_ratio < 0.2 && net_change_30d > 1000) {
    category = 'Feature Bloat' // Adding lots of code without cleanup
  }

  // Scoring: 1.5 points max
  let score = 0
  if (category === 'Technical Debt Management') {
    score = 1.5 // Bonus for active refactoring
  } else if (category === 'Balanced') {
    score = 1.0 // Neutral
  } else {
    score = 0.5 // Penalty for feature bloat
  }

  return {
    total_commits_30d,
    commits_with_net_deletions,
    total_additions_30d,
    total_deletions_30d,
    net_change_30d,
    refactor_ratio: Math.round(refactor_ratio * 100) / 100,
    has_active_refactoring,
    score,
    category,
  }
}

/**
 * Analyze documentation depth
 */
export function analyzeDocumentationDepth(
  readmeContent: string | null,
  tree: GitHubTreeNode[]
): DocumentationDepth {
  const has_readme = readmeContent !== null
  const readme_length = readmeContent?.length || 0

  // Analyze README sections
  const readme = (readmeContent || '').toLowerCase()
  const sections_found = {
    setup:
      readme.includes('## setup') ||
      readme.includes('## installation') ||
      readme.includes('## getting started') ||
      readme.includes('## quick start'),
    architecture:
      readme.includes('## architecture') ||
      readme.includes('## design') ||
      readme.includes('## structure') ||
      readme.includes('## technical'),
    api_reference:
      readme.includes('## api') ||
      readme.includes('## endpoints') ||
      readme.includes('## reference'),
    contributing:
      readme.includes('## contributing') ||
      readme.includes('## contribution') ||
      readme.includes('## development'),
    testing:
      readme.includes('## testing') ||
      readme.includes('## tests') ||
      readme.includes('## test'),
    deployment:
      readme.includes('## deployment') ||
      readme.includes('## deploy') ||
      readme.includes('## production'),
  }

  const section_count = Object.values(sections_found).filter((v) => v).length

  // Check for other documentation files
  const doc_files = tree
    .filter((node) => {
      const path = node.path.toLowerCase()
      return (
        node.type === 'blob' &&
        (path.includes('docs/') ||
          path === 'contributing.md' ||
          path === 'architecture.md' ||
          path === 'api.md' ||
          path.includes('changelog'))
      )
    })
    .map((node) => node.path)

  const has_other_docs = doc_files.length > 0

  // Scoring: 1 point max
  let score = 0
  if (has_readme) score += 0.2
  if (readme_length > 500) score += 0.2
  if (readme_length > 2000) score += 0.1
  score += section_count * 0.1 // 0.1 per section
  if (has_other_docs) score += 0.2

  return {
    readme_length,
    has_readme,
    sections_found,
    section_count,
    has_other_docs,
    doc_files,
    score: Math.min(1, score),
  }
}

/**
 * Calculate overall engineering rigor metrics
 */
export function calculateEngineeringRigor(
  tooling: ToolingIntent,
  infrastructure: StabilityInfrastructure,
  testing: TestingRatio,
  refactoring: RefactorSignal,
  documentation: DocumentationDepth
): EngineeringRigorMetrics {
  // Calculate overall score (0-10 scale)
  const overall_score =
    tooling.score + infrastructure.score + testing.score + refactoring.score + documentation.score

  // Determine grade
  let grade: EngineeringRigorMetrics['grade']
  if (overall_score >= 9.5) grade = 'A+'
  else if (overall_score >= 8.5) grade = 'A'
  else if (overall_score >= 7.5) grade = 'B+'
  else if (overall_score >= 6.5) grade = 'B'
  else if (overall_score >= 5.5) grade = 'C+'
  else if (overall_score >= 4.5) grade = 'C'
  else if (overall_score >= 3.5) grade = 'D'
  else grade = 'F'

  // Determine category and badge
  let category: EngineeringRigorMetrics['category']
  let badge: EngineeringRigorMetrics['badge']

  if (overall_score >= 8.5) {
    category = 'Production Ready'
    badge = 'Clean Architect'
  } else if (overall_score >= 7) {
    category = 'Professional'
    badge = 'Quality Focused'
  } else if (overall_score >= 5) {
    category = 'Growing'
    badge = 'Active Builder'
  } else if (overall_score >= 3) {
    category = 'Hobby Project'
    badge = 'Learning'
  } else {
    category = 'Early Stage'
    badge = 'Quick Prototype'
  }

  // Generate key signals (top 3)
  const key_signals: string[] = []

  if (testing.testing_ratio >= 0.5) {
    key_signals.push(`${Math.round(testing.testing_ratio * 100)}% Test Coverage`)
  }
  if (infrastructure.workflow_complexity === 'advanced') {
    key_signals.push('CI/CD Verified')
  } else if (infrastructure.has_ci_cd) {
    key_signals.push(`CI/CD: ${infrastructure.workflow_complexity}`)
  }
  if (refactoring.category === 'Technical Debt Management') {
    key_signals.push('Active Refactoring')
  }
  if (tooling.config_files_found.length >= 3) {
    key_signals.push(`${tooling.config_files_found.length} Config Files`)
  }
  if (documentation.section_count >= 4) {
    key_signals.push('Comprehensive Docs')
  }

  // Fill in with next best signals if less than 3
  if (key_signals.length < 3 && testing.test_file_count > 0) {
    key_signals.push(`${testing.test_file_count} Test Files`)
  }
  if (key_signals.length < 3 && infrastructure.has_ci_cd) {
    key_signals.push('Has CI/CD')
  }
  if (key_signals.length < 3 && tooling.has_typescript_config) {
    key_signals.push('TypeScript')
  }

  // Generate improvements
  const improvements: string[] = []
  if (testing.testing_ratio < 0.3) {
    improvements.push('Add more unit tests to increase coverage')
  }
  if (!infrastructure.has_ci_cd) {
    improvements.push('Set up CI/CD pipeline (GitHub Actions)')
  }
  if (tooling.config_files_found.length < 2) {
    improvements.push('Add linting and formatting configuration')
  }
  if (documentation.section_count < 3) {
    improvements.push('Add Setup, Architecture, and API sections to README')
  }
  if (refactoring.category === 'Feature Bloat') {
    improvements.push('Consider refactoring to reduce codebase complexity')
  }

  // Generate AI context (only mention refactoring if noteworthy)
  const refactorSuffix = refactoring.category === 'Technical Debt Management'
    ? ' Active technical debt management.'
    : refactoring.category === 'Feature Bloat'
    ? ' High code growth without proportional refactoring.'
    : ''

  // Build AI context with proper formatting
  const keySignalsText = key_signals.slice(0, 2).filter(Boolean).join(', ')
  console.log('🐛 AI Context Debug:', {
    category,
    grade,
    key_signals,
    keySignalsText,
    refactoring_category: refactoring.category,
    refactorSuffix,
  })
  const ai_context = keySignalsText
    ? `${category} project with ${grade} grade. ${keySignalsText}.${refactorSuffix}`
    : `${category} project with ${grade} grade.${refactorSuffix}`
  console.log('🐛 Final ai_context:', ai_context)

  return {
    overall_score: Math.round(overall_score * 10) / 10,
    grade,
    category,
    badge,
    breakdown: {
      tooling,
      infrastructure,
      testing,
      refactoring,
      documentation,
    },
    key_signals: key_signals.slice(0, 3),
    improvements,
    ai_context,
  }
}
