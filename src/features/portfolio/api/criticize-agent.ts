'use server'

/**
 * Criticize Agent - Red Team AI
 *
 * Identifies architectural debt, production gaps, and narrative gaps
 * Purpose: Help users understand what they need to address or explain
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'
import type { TechnicalJourney } from '../types'
import { fetchTechnicalContext } from './github-context'
import { decryptToken } from '@/lib/encryption/crypto'

export interface ArchitecturalDebt {
  issue: string // "Tight coupling between components"
  severity: 'low' | 'medium' | 'high'
  evidence: string // File/line reference
  suggestion: string // How to fix
  githubLink?: string // Permalink to problematic code
}

export interface ProductionGap {
  gap: string // "No .env.example file"
  category: 'security' | 'testing' | 'documentation' | 'deployment'
  impact: string // Why it matters
  quickFix: string // How to resolve
}

export interface NarrativeGap {
  critique: string // "Doesn't explain database choice"
  missingContext: string // What the user should add
  suggestedPrompt: string // Question to help user write it
}

export interface CritiqueResult {
  architecturalDebt: ArchitecturalDebt[]
  productionGaps: ProductionGap[]
  narrativeGaps: NarrativeGap[]
}

export async function criticizeRepository(
  repositoryUrl: string,
  technicalJourney?: TechnicalJourney
): Promise<ApiResponse<CritiqueResult>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'You must be signed in to critique repository',
      }
    }

    // Fetch GitHub token
    const { data: tokenData } = await supabase
      .from('github_tokens')
      .select('encrypted_token, encryption_iv')
      .eq('user_id', user.id)
      .single()

    if (!tokenData?.encrypted_token || !tokenData?.encryption_iv) {
      return {
        success: false,
        error: 'GitHub token not found. Please connect your GitHub account.',
      }
    }

    // Decrypt the token
    const githubToken = await decryptToken({
      encrypted: tokenData.encrypted_token,
      iv: tokenData.encryption_iv,
    })

    // Fetch repository data
    const [owner, repo] = repositoryUrl.split('/')
    const technicalContext = await fetchTechnicalContext(owner, repo, githubToken)

    // Fetch README
    const readmeUrl = `https://api.github.com/repos/${owner}/${repo}/readme`
    const readmeResponse = await fetch(readmeUrl, {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: 'application/vnd.github.v3.raw',
      },
    })

    const readmeContent = readmeResponse.ok ? await readmeResponse.text() : 'No README'

    // Check for critical production files
    const checkFileExists = async (path: string): Promise<boolean> => {
      const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
      const response = await fetch(fileUrl, {
        headers: { Authorization: `token ${githubToken}` },
      })
      return response.ok
    }

    const hasEnvExample = await checkFileExists('.env.example')
    const hasTests = technicalContext.fileTree?.includes('/test') || technicalContext.fileTree?.includes('/__tests__')
    const hasCIConfig = await checkFileExists('.github/workflows')
    const hasDockerfile = await checkFileExists('Dockerfile')
    const hasLicense = await checkFileExists('LICENSE')

    // Use Claude Opus for deeper critique
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })

    const prompt = `You are a senior engineer conducting a code review. Analyze this repository and identify issues, gaps, and areas for improvement.

Repository: ${repositoryUrl}

=== TECH STACK ===
${technicalContext.techStack.join(', ')}

=== PROJECT STRUCTURE ===
${technicalContext.fileTree?.slice(0, 2000) || 'Not available'}

=== PACKAGE.JSON ===
${technicalContext.packageJson?.slice(0, 2000) || 'Not available'}

=== README ===
${readmeContent.slice(0, 3000)}

=== PRODUCTION FILE CHECKLIST ===
- .env.example: ${hasEnvExample ? '✓' : '✗'}
- Tests: ${hasTests ? '✓' : '✗'}
- CI/CD: ${hasCIConfig ? '✓' : '✗'}
- Docker: ${hasDockerfile ? '✓' : '✗'}
- License: ${hasLicense ? '✓' : '✗'}

${technicalJourney ? `=== USER'S TECHNICAL JOURNEY ===
Problem: ${technicalJourney.problemStatement}
Approach: ${technicalJourney.technicalApproach}
Tech Decisions: ${technicalJourney.techDecisions?.map(d => `${d.technology}: ${d.reason}`).join('; ') || 'None'}
` : ''}

---

As a senior engineer, identify:

1. ARCHITECTURAL DEBT (3-5 issues)
   - Anti-patterns from file structure (e.g., everything in one file, no separation of concerns)
   - Missing abstractions or layers
   - Tight coupling indicators
   - Scalability concerns
   - For each: {"issue": "...", "severity": "high|medium|low", "evidence": "file/directory reference", "suggestion": "how to fix"}

2. PRODUCTION GAPS (3-7 specific gaps)
   - Missing production files (.env.example, tests, CI, Docker)
   - Security concerns (exposed secrets, no auth, SQL injection risks)
   - Deployment readiness
   - Monitoring and observability
   - Error handling
   - For each: {"gap": "...", "category": "security|testing|documentation|deployment", "impact": "why it matters", "quickFix": "how to resolve"}

3. NARRATIVE GAPS (3-5 gaps)
   - Compare user's journey against code reality
   - Technologies used in package.json but not explained in tech decisions
   - Claims without evidence (e.g., "uses Redis" but no Redis in dependencies)
   - Major architectural choices not addressed (database choice, auth strategy, deployment)
   - Missing justifications for key technologies
   - For each: {"critique": "what's missing", "missingContext": "what to add", "suggestedPrompt": "question to help user"}

CRITICAL RULES:
- Be SPECIFIC with file/directory references
- Base findings on ACTUAL evidence from the file structure and package.json
- Flag ALL missing production files
- Identify technologies in package.json that aren't explained
- Be constructively critical - this helps the user improve
- Prioritize high-severity issues (security, scalability, production readiness)

Format as JSON:
{
  "architecturalDebt": [
    {
      "issue": "...",
      "severity": "high|medium|low",
      "evidence": "file or directory reference",
      "suggestion": "..."
    }
  ],
  "productionGaps": [
    {
      "gap": "...",
      "category": "security|testing|documentation|deployment",
      "impact": "...",
      "quickFix": "..."
    }
  ],
  "narrativeGaps": [
    {
      "critique": "...",
      "missingContext": "...",
      "suggestedPrompt": "..."
    }
  ]
}`

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-20250514', // Use Opus for deeper reasoning
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        success: false,
        error: 'Failed to parse critique response',
      }
    }

    const critique = JSON.parse(jsonMatch[0]) as CritiqueResult

    return {
      success: true,
      data: critique,
    }
  } catch (error) {
    console.error('Error critiquing repository:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to critique repository',
    }
  }
}
