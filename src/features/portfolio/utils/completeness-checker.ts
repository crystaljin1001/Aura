/**
 * Project Completeness Checker
 *
 * Checks what exists in a project (no grades, no scores, just facts)
 * Replaces the "Health Score" with objective quality signals
 */

import type { ProjectCompleteness, TechnicalJourney } from '../types'

interface CompletenessInput {
  // Repository data
  description?: string | null
  language?: string | null
  hasReadme?: boolean
  readmeLength?: number

  // Tech indicators (detected from files)
  hasTypeScript?: boolean
  hasTests?: boolean
  hasEnvExample?: boolean
  hasLicense?: boolean
  hasGitignore?: boolean

  // Deployment
  websiteUrl?: string | null

  // User content
  technicalJourney?: TechnicalJourney | null
}

/**
 * Calculates project completeness based on what exists
 * No grading, no scoring - just objective facts
 */
export function calculateCompleteness(input: CompletenessInput): ProjectCompleteness {
  return {
    documentation: {
      hasReadme: input.hasReadme || false,
      hasDescription: !!input.description,
      readmeLength: input.readmeLength,
    },
    codeQuality: {
      hasTypeScript: input.hasTypeScript || input.language === 'TypeScript' || false,
      hasEnvExample: input.hasEnvExample || false,
      hasTests: input.hasTests || false,
    },
    production: {
      isDeployed: !!input.websiteUrl,
      hasLicense: input.hasLicense || false,
      hasGitignore: input.hasGitignore || false,
    },
    story: {
      hasTechnicalJourney: !!input.technicalJourney,
      hasTechDecisions: !!(input.technicalJourney?.techDecisions && input.technicalJourney.techDecisions.length > 0),
    },
  }
}

/**
 * Gets improvement suggestions based on what's missing
 */
export function getImprovementSuggestions(completeness: ProjectCompleteness): string[] {
  const suggestions: string[] = []

  // Documentation suggestions
  if (!completeness.documentation.hasReadme) {
    suggestions.push('Add a README.md explaining your project')
  } else if (completeness.documentation.readmeLength && completeness.documentation.readmeLength < 500) {
    suggestions.push('Expand your README (aim for 500+ characters)')
  }

  if (!completeness.documentation.hasDescription) {
    suggestions.push('Add a description to your GitHub repository')
  }

  // Code quality suggestions
  if (!completeness.codeQuality.hasTypeScript) {
    suggestions.push('Consider using TypeScript for type safety')
  }

  if (!completeness.codeQuality.hasEnvExample) {
    suggestions.push('Add .env.example to document environment variables')
  }

  if (!completeness.codeQuality.hasTests) {
    suggestions.push('Add tests to improve code reliability (optional for personal projects)')
  }

  // Production suggestions
  if (!completeness.production.isDeployed) {
    suggestions.push('Deploy your project (Vercel, Railway, Render, etc.)')
  }

  if (!completeness.production.hasLicense) {
    suggestions.push('Add a LICENSE file (MIT, Apache, etc.)')
  }

  // Story suggestions (most important!)
  if (!completeness.story.hasTechnicalJourney) {
    suggestions.push('⭐ Write your technical journey (problem, approach, challenges, outcome)')
  }

  if (!completeness.story.hasTechDecisions) {
    suggestions.push('⭐ Explain why you chose each technology')
  }

  return suggestions
}

/**
 * Counts how many items are complete
 */
export function getCompletenessStats(completeness: ProjectCompleteness): {
  completed: number
  total: number
  percentage: number
  category: 'getting-started' | 'in-progress' | 'complete'
} {
  const checks = [
    // Documentation (2 items)
    completeness.documentation.hasDescription,
    completeness.documentation.readmeLength && completeness.documentation.readmeLength >= 500,

    // Code Quality (3 items)
    completeness.codeQuality.hasTypeScript,
    completeness.codeQuality.hasEnvExample,
    completeness.codeQuality.hasTests,

    // Production (3 items)
    completeness.production.isDeployed,
    completeness.production.hasLicense,
    completeness.production.hasGitignore,

    // Story (2 items) - WEIGHTED MORE
    completeness.story.hasTechnicalJourney,
    completeness.story.hasTechDecisions,
  ]

  const completed = checks.filter(Boolean).length
  const total = checks.length
  const percentage = Math.round((completed / total) * 100)

  let category: 'getting-started' | 'in-progress' | 'complete'
  if (percentage < 40) {
    category = 'getting-started'
  } else if (percentage < 75) {
    category = 'in-progress'
  } else {
    category = 'complete'
  }

  return { completed, total, percentage, category }
}
