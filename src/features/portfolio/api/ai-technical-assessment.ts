'use server'

/**
 * AI Technical Assessment
 *
 * Generates professional technical analysis from a senior engineer's perspective
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'
import { fetchTechnicalContext } from './github-context'
import { decryptToken } from '@/lib/encryption/crypto'

interface TechnicalAssessment {
  summary: string // 2-3 sentences
  technicalDepth: string // What this reveals about technical skills
  architecturalInsights: string // Key architectural decisions or patterns
  productionReadiness: string // Assessment of production quality
  standoutQualities: string[] // 3-4 specific strengths
}

export async function generateTechnicalAssessment(
  repositoryUrl: string
): Promise<ApiResponse<TechnicalAssessment>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'You must be signed in',
      }
    }

    // Fetch repository data
    const { data: impactData } = await supabase
      .from('impact_cache')
      .select('*')
      .eq('user_id', user.id)
      .eq('repo_full_name', repositoryUrl)
      .single()

    const repoData = impactData?.repo_data as Record<string, unknown> | null
    const description = (repoData?.description as string) || ''
    const language = (repoData?.language as string) || ''

    // Fetch GitHub token
    const { data: tokenData } = await supabase
      .from('github_tokens')
      .select('encrypted_token, encryption_iv')
      .eq('user_id', user.id)
      .single()

    if (!tokenData?.encrypted_token || !tokenData?.encryption_iv) {
      return {
        success: false,
        error: 'GitHub token not found',
      }
    }

    // Decrypt the token
    const githubToken = await decryptToken({
      encrypted: tokenData.encrypted_token,
      iv: tokenData.encryption_iv,
    })

    // Fetch comprehensive technical context
    const [owner, repo] = repositoryUrl.split('/')

    // Fetch README
    const readmeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3.raw',
        },
      }
    )

    let readmeContent = ''
    if (readmeResponse.ok) {
      readmeContent = await readmeResponse.text()
    }

    // Fetch rich technical context (package.json, file tree, commits)
    const technicalContext = await fetchTechnicalContext(owner, repo, githubToken)

    // Generate assessment using Claude
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })

    const prompt = `You are a senior engineering manager reviewing a candidate's portfolio project for a technical assessment. Analyze the comprehensive technical context provided and write a professional, specific evaluation.

Repository: ${repositoryUrl}
Description: ${description}
Primary Language: ${language}

=== README ===
${readmeContent.slice(0, 5000)}

=== TECH STACK (from package.json) ===
${technicalContext.techStack.length > 0 ? technicalContext.techStack.join(', ') : 'Not detected'}

=== PACKAGE.JSON (dependencies) ===
${technicalContext.packageJson ? technicalContext.packageJson.slice(0, 2000) : 'Not available'}

=== PROJECT STRUCTURE ===
${technicalContext.fileTree ? technicalContext.fileTree.slice(0, 1500) : 'Not available'}

=== SIGNIFICANT COMMITS ===
${technicalContext.significantCommits ? technicalContext.significantCommits.slice(0, 1500) : 'Not available'}

---

Using ALL the context above (README, tech stack, file structure, and commit history), provide a targeted technical assessment:

1. **Summary** (2-3 sentences): What problem does this project solve? What specific engineering capabilities does it demonstrate?

2. **Technical Depth** (3-4 sentences): Analyze the ACTUAL technologies used:
   - Reference specific libraries/frameworks from package.json (e.g., "${technicalContext.techStack[0] || 'the chosen tech stack'}")
   - Infer complexity from the file structure (e.g., presence of /middleware, /api, /hooks)
   - Note any advanced patterns (server actions, real-time features, complex state management)
   - Comment on engineering maturity based on project organization

3. **Architectural Insights** (2-3 sentences): Based on the file structure and tech stack:
   - What architectural approach was taken? (monolith, microservices, serverless)
   - How are concerns separated? (note specific directories like /components, /lib, /server)
   - What design patterns are evident?

4. **Production Readiness** (2-3 sentences):
   - Documentation quality (based on README length and detail)
   - Code organization (based on file structure)
   - Engineering best practices (TypeScript, testing setup, environment configs)

5. **Standout Qualities** (3-4 bullet points): Be EXTREMELY specific using the context:
   - Reference actual technologies: "Uses Prisma with PostgreSQL for type-safe database access"
   - Cite file structure evidence: "Implements middleware pattern for auth/logging (/middleware directory)"
   - Reference commit patterns: "Shows iterative improvement with ${technicalContext.significantCommits ? 'significant refactoring' : 'continuous development'}"
   - Call out complexity: "Handles [specific feature] with [specific approach]"

Be concrete and evidence-based. Reference the actual tech stack and file structure. Avoid generic praise.

Format as JSON:
{
  "summary": "...",
  "technicalDepth": "...",
  "architecturalInsights": "...",
  "productionReadiness": "...",
  "standoutQualities": ["...", "...", "..."]
}`

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
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
        error: 'Failed to parse AI response',
      }
    }

    const assessment = JSON.parse(jsonMatch[0]) as TechnicalAssessment

    return {
      success: true,
      data: assessment,
    }
  } catch (error) {
    console.error('Error generating technical assessment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate assessment',
    }
  }
}
