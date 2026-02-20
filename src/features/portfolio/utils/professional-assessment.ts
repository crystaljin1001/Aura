/**
 * Professional Project Assessment
 *
 * Provides weighted scoring and professional evaluation of project quality
 */

import type { ProjectCompleteness } from '../types'

export interface CategoryScore {
  name: string
  score: number // 0-100
  weight: number // importance factor
  items: {
    name: string
    present: boolean
    critical: boolean
  }[]
}

export interface ProfessionalAssessment {
  overallScore: number // 0-100
  categories: CategoryScore[]
  strengths: string[]
  improvements: string[]
  readinessLevel: 'early-stage' | 'developing' | 'production-ready' | 'exemplary'
}

/**
 * Calculates professional assessment with weighted scoring
 */
export function calculateProfessionalAssessment(
  completeness: ProjectCompleteness
): ProfessionalAssessment {
  // Documentation Category (25% weight)
  const documentation: CategoryScore = {
    name: 'Documentation',
    score: 0,
    weight: 0.25,
    items: [
      {
        name: 'Project Description',
        present: completeness.documentation.hasDescription,
        critical: true,
      },
      {
        name: 'Comprehensive README',
        present: !!(completeness.documentation.readmeLength && completeness.documentation.readmeLength >= 500),
        critical: true,
      },
    ],
  }
  documentation.score = (documentation.items.filter(i => i.present).length / documentation.items.length) * 100

  // Code Quality Category (20% weight)
  const codeQuality: CategoryScore = {
    name: 'Code Quality',
    score: 0,
    weight: 0.20,
    items: [
      {
        name: 'Type Safety (TypeScript)',
        present: completeness.codeQuality.hasTypeScript,
        critical: false,
      },
      {
        name: 'Environment Configuration',
        present: completeness.codeQuality.hasEnvExample,
        critical: false,
      },
      {
        name: 'Test Coverage',
        present: completeness.codeQuality.hasTests,
        critical: false,
      },
    ],
  }
  codeQuality.score = (codeQuality.items.filter(i => i.present).length / codeQuality.items.length) * 100

  // Production Readiness Category (20% weight)
  const production: CategoryScore = {
    name: 'Production Readiness',
    score: 0,
    weight: 0.20,
    items: [
      {
        name: 'Live Deployment',
        present: completeness.production.isDeployed,
        critical: true,
      },
      {
        name: 'License',
        present: completeness.production.hasLicense,
        critical: false,
      },
      {
        name: 'Repository Configuration',
        present: completeness.production.hasGitignore,
        critical: false,
      },
    ],
  }
  production.score = (production.items.filter(i => i.present).length / production.items.length) * 100

  // Technical Storytelling Category (35% weight - most important)
  const storytelling: CategoryScore = {
    name: 'Technical Storytelling',
    score: 0,
    weight: 0.35,
    items: [
      {
        name: 'Technical Journey',
        present: completeness.story.hasTechnicalJourney,
        critical: true,
      },
      {
        name: 'Technology Decisions',
        present: completeness.story.hasTechDecisions,
        critical: true,
      },
    ],
  }
  storytelling.score = (storytelling.items.filter(i => i.present).length / storytelling.items.length) * 100

  const categories = [documentation, codeQuality, production, storytelling]

  // Calculate weighted overall score
  const overallScore = Math.round(
    categories.reduce((sum, cat) => sum + (cat.score * cat.weight), 0)
  )

  // Determine readiness level
  let readinessLevel: ProfessionalAssessment['readinessLevel']
  if (overallScore >= 85) {
    readinessLevel = 'exemplary'
  } else if (overallScore >= 65) {
    readinessLevel = 'production-ready'
  } else if (overallScore >= 40) {
    readinessLevel = 'developing'
  } else {
    readinessLevel = 'early-stage'
  }

  // Identify strengths
  const strengths: string[] = []
  if (documentation.score >= 80) {
    strengths.push('Well-documented with clear project overview')
  }
  if (codeQuality.score >= 80) {
    strengths.push('Strong engineering practices and code quality')
  }
  if (production.score >= 80) {
    strengths.push('Production-ready with proper deployment')
  }
  if (storytelling.score === 100) {
    strengths.push('Excellent technical storytelling and context')
  }

  // Identify critical improvements
  const improvements: string[] = []

  // Prioritize technical storytelling (highest weight)
  if (!completeness.story.hasTechnicalJourney) {
    improvements.push('Write technical journey: problem, approach, challenges, and outcomes')
  }
  if (!completeness.story.hasTechDecisions) {
    improvements.push('Document key technology decisions and architectural choices')
  }

  // Documentation gaps
  if (!completeness.documentation.hasDescription) {
    improvements.push('Add project description to GitHub repository')
  }
  if (!completeness.documentation.readmeLength || completeness.documentation.readmeLength < 500) {
    improvements.push('Expand README with setup instructions, features, and use cases')
  }

  // Production readiness
  if (!completeness.production.isDeployed) {
    improvements.push('Deploy to production (Vercel, Railway, AWS, etc.)')
  }

  // Code quality (lower priority)
  if (!completeness.codeQuality.hasTypeScript) {
    improvements.push('Consider TypeScript for better type safety and maintainability')
  }
  if (!completeness.codeQuality.hasEnvExample) {
    improvements.push('Add .env.example to document required environment variables')
  }

  return {
    overallScore,
    categories,
    strengths,
    improvements: improvements.slice(0, 4), // Top 4 improvements
    readinessLevel,
  }
}

/**
 * Get readiness level description
 */
export function getReadinessDescription(level: ProfessionalAssessment['readinessLevel']): {
  label: string
  description: string
  color: string
} {
  switch (level) {
    case 'exemplary':
      return {
        label: 'Exemplary',
        description: 'Production-grade project with comprehensive documentation and storytelling',
        color: 'text-green-400',
      }
    case 'production-ready':
      return {
        label: 'Production Ready',
        description: 'Well-documented project ready for professional showcase',
        color: 'text-blue-400',
      }
    case 'developing':
      return {
        label: 'In Development',
        description: 'Good foundation, needs documentation and deployment',
        color: 'text-amber-400',
      }
    case 'early-stage':
      return {
        label: 'Early Stage',
        description: 'Needs core documentation and technical context',
        color: 'text-gray-400',
      }
  }
}
