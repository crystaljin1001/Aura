'use server'

/**
 * Server actions for Portfolio Case Study
 */

import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient } from '@/lib/ai/openai'
import { AuthenticationError, ValidationError } from '@/utils/errors'
import type { ApiResponse } from '@/types'
import type { ContextBlock, CaseStudyProject, ArchitectureDiagram, TechnicalJourney, TechDecision } from '../types'
import { calculateHealthScore } from '../utils/health-score'
import { calculateCompleteness } from '../utils/completeness-checker'
import { z } from 'zod'

/**
 * System prompt for AI Context Block generation
 */
const CONTEXT_BLOCK_SYSTEM_PROMPT = `You are a professional portfolio writer specializing in technical case studies. Your task is to create compelling, concise context blocks that tell the story behind a software project.

**YOUR TASK:**
Write three distinct sentences that follow this pattern:

1. **Problem Context** - One clear sentence describing the technical challenge or business problem this project addresses. Focus on what users were struggling with before this solution existed.

2. **Your Solution** - One clear sentence describing the approach, architecture, or key innovation that solves the problem. Focus on the "how" and what makes this solution effective.

3. **Impact Delivered** - One clear sentence describing the measurable results, improvements, or value created by this project. Use concrete metrics when available.

**GUIDELINES:**
- Each sentence should be 20-35 words
- Use active voice and present tense
- Be specific and concrete, avoid vague statements
- Focus on real technical or business value
- No marketing fluff or buzzwords
- Write as if explaining to a technical hiring manager

**FORMAT:**
Return your response as a JSON object with exactly three keys:
{
  "problem": "...",
  "solution": "...",
  "impact": "..."
}

Each value should be ONE well-crafted sentence.`

/**
 * System prompt for architecture diagram generation
 */
const ARCHITECTURE_DIAGRAM_SYSTEM_PROMPT = `You are a technical architect specializing in creating clear, professional system architecture diagrams using Mermaid.js syntax.

**YOUR TASK:**
Create a Mermaid.js diagram that visualizes the technical architecture of a software project based on ACTUAL code structure and dependencies. Choose the most appropriate diagram type:
- **flowchart TB** - For application flow, data pipelines, or process flows
- **graph LR** - For system architecture, microservices, or component relationships
- **sequenceDiagram** - For API interactions or user flows
- **classDiagram** - For data models or object relationships

**CONTEXT PROVIDED:**
You will receive:
1. README - Project overview and documentation
2. TECH STACK - Actual technologies detected from package.json
3. FILE STRUCTURE - Real directory layout (use this to infer architecture)
4. PACKAGE.JSON - Dependencies (shows integrations, databases, frameworks)
5. SIGNIFICANT COMMITS - Historical architecture changes

**GUIDELINES:**
- Infer architecture from FILE STRUCTURE (e.g., /api, /components, /lib, /middleware indicates layers)
- Use ACTUAL dependencies from package.json (if you see 'redis', show Redis; if 'supabase', show Supabase)
- Reference real directories from file tree (e.g., "User uploads → /api/upload → Supabase Storage")
- Keep it focused (6-12 nodes maximum)
- Show data flow and key integrations
- Use clear, specific labels (not generic "Backend" but "Next.js Server Actions" if that's what's used)
- Make it readable and professional

**FORMAT:**
Return your response as a JSON object:
{
  "mermaidCode": "...",
  "type": "flowchart|sequence|class|architecture"
}

The mermaidCode should be valid Mermaid.js syntax without markdown code fences.`

/**
 * Validation schema for context block generation
 */
const contextBlockInputSchema = z.object({
  projectName: z.string().min(1).max(200),
  description: z.string().min(10).max(1000),
  readmeContent: z.string().min(50).max(10000),
  techStack: z.array(z.string()).optional(),
  metrics: z.array(z.any()).optional(),
})

/**
 * Gets the authenticated user or throws error
 */
async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AuthenticationError('You must be signed in to generate context blocks')
  }

  return user
}

/**
 * Generates AI context blocks for a project
 */
export async function generateContextBlock(
  projectName: string,
  description: string,
  readmeContent: string,
  techStack?: string[],
  repositoryUrl?: string
): Promise<ApiResponse<ContextBlock>> {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser()

    // Validate input
    const validated = contextBlockInputSchema.parse({
      projectName,
      description,
      readmeContent,
      techStack,
    })

    // Create user prompt
    const userPrompt = `Project: ${validated.projectName}

Description: ${description}

${techStack && techStack.length > 0 ? `Tech Stack: ${techStack.join(', ')}` : ''}

README Content:
${validated.readmeContent.slice(0, 5000)}

Generate the three context block sentences for this project.`

    // Call OpenAI
    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CONTEXT_BLOCK_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const parsed = JSON.parse(content) as ContextBlock

    // Save to database
    const supabase = await createClient()
    const { error: dbError } = await supabase.from('portfolio_context_blocks').insert({
      user_id: user.id,
      repository_url: repositoryUrl || null,
      project_name: validated.projectName,
      problem_context: parsed.problem,
      solution_context: parsed.solution,
      impact_context: parsed.impact,
    })

    if (dbError) {
      console.error('Failed to save context block:', dbError)
      // Don't throw - still return the generated content
    }

    return {
      success: true,
      data: parsed,
    }
  } catch (error) {
    console.error('Error generating context block:', error)

    if (error instanceof AuthenticationError || error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to generate context blocks. Please try again.',
    }
  }
}

/**
 * Generates architecture diagram for a project using comprehensive technical context
 */
export async function generateArchitectureDiagram(
  projectName: string,
  description: string,
  readmeContent: string,
  techStack?: string[],
  githubToken?: string
): Promise<ApiResponse<ArchitectureDiagram>> {
  try {
    // Authenticate user
    await getAuthenticatedUser()

    // Fetch rich technical context if GitHub token is available
    let technicalContext = {
      packageJson: null,
      fileTree: null,
      significantCommits: null,
      techStack: techStack || [],
    }

    if (githubToken) {
      const [owner, repo] = projectName.includes('/') ? projectName.split('/') : [null, projectName]
      if (owner && repo) {
        const { fetchTechnicalContext } = await import('./github-context')
        try {
          technicalContext = await fetchTechnicalContext(owner, repo, githubToken)
        } catch (error) {
          console.warn('Failed to fetch technical context for diagram, using basic context:', error)
        }
      }
    }

    // Create enhanced user prompt with rich context
    const userPrompt = `Project: ${projectName}

Description: ${description}

=== README ===
${readmeContent.slice(0, 4000)}

=== TECH STACK (Auto-Detected) ===
${technicalContext.techStack.length > 0 ? technicalContext.techStack.join(', ') : 'Not detected'}

=== FILE STRUCTURE ===
${technicalContext.fileTree ? technicalContext.fileTree.slice(0, 2000) : 'Not available'}

=== PACKAGE.JSON (Dependencies) ===
${technicalContext.packageJson ? technicalContext.packageJson.slice(0, 1500) : 'Not available'}

=== SIGNIFICANT COMMITS ===
${technicalContext.significantCommits ? technicalContext.significantCommits.slice(0, 1000) : 'Not available'}

---

Based on ALL the context above (especially FILE STRUCTURE and TECH STACK), create a professional architecture diagram that shows:
1. The actual layers/components from the file structure
2. Real integrations from package.json dependencies
3. Data flow between components
4. External services (databases, APIs, cloud providers)

Be specific using the actual tech stack detected, not generic labels.`

    // Call OpenAI
    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: ARCHITECTURE_DIAGRAM_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const parsed = JSON.parse(content) as ArchitectureDiagram

    return {
      success: true,
      data: parsed,
    }
  } catch (error) {
    console.error('Error generating architecture diagram:', error)

    if (error instanceof AuthenticationError || error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to generate architecture diagram. Please try again.',
    }
  }
}

/**
 * Gets case study data for a repository
 */
export async function getCaseStudyData(
  repositoryUrl: string
): Promise<ApiResponse<CaseStudyProject>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new AuthenticationError('You must be signed in to view case studies')
    }

    // Parse repository URL
    const [owner, repo] = repositoryUrl.split('/')

    // Fetch repository data
    const { data: repoData, error: repoError } = await supabase
      .from('user_repositories')
      .select('*')
      .eq('user_id', user.id)
      .eq('repo_owner', owner)
      .eq('repo_name', repo)
      .single()

    if (repoError || !repoData) {
      throw new Error('Repository not found')
    }

    // Fetch impact metrics from cache
    const { data: impactData } = await supabase
      .from('impact_cache')
      .select('*')
      .eq('user_id', user.id)
      .eq('repo_full_name', repositoryUrl)
      .single()

    // Fetch video data
    const { data: videoData } = await supabase
      .from('project_videos')
      .select('*')
      .eq('user_id', user.id)
      .eq('repository_url', repositoryUrl)
      .single()

    // Fetch domain data
    const { data: domainData } = await supabase
      .from('project_domains')
      .select('*')
      .eq('user_id', user.id)
      .eq('repository_url', repositoryUrl)
      .eq('is_active', true)
      .single()

    // Fetch context block
    const { data: contextData } = await supabase
      .from('portfolio_context_blocks')
      .select('*')
      .eq('user_id', user.id)
      .eq('repository_url', repositoryUrl)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Fetch technical journey
    const { data: journeyData } = await supabase
      .from('project_technical_journey')
      .select('*')
      .eq('user_id', user.id)
      .eq('repository_url', repositoryUrl)
      .single()

    // Parse repo data from JSONB
    const cachedRepoData = impactData?.repo_data as Record<string, unknown> | null
    const description = cachedRepoData?.description as string | null
    const language = cachedRepoData?.language as string | null
    const readmeLength = cachedRepoData?.readmeLength as number | undefined
    const stars = Number(cachedRepoData?.stargazersCount) || 0
    const forks = Number(cachedRepoData?.forksCount) || 0
    const openIssues = Number(cachedRepoData?.openIssuesCount) || 0
    const pushedAt = (cachedRepoData?.pushedAt as string) || new Date().toISOString()

    // Parse metrics
    const metrics = Array.isArray(impactData?.impact_metrics) ? impactData.impact_metrics : []

    // Calculate health score
    const healthScore = calculateHealthScore(metrics)

    // Build technical journey
    let technicalJourney: TechnicalJourney | null = null
    if (journeyData) {
      technicalJourney = {
        problemStatement: journeyData.problem_statement,
        technicalApproach: journeyData.technical_approach,
        keyChallenges: journeyData.key_challenges,
        outcome: journeyData.outcome,
        learnings: journeyData.learnings || [],
        techDecisions: (journeyData.tech_decisions as TechDecision[]) || [],
      }
    }

    // Calculate completeness (objective quality checks)
    const completeness = calculateCompleteness({
      description,
      language,
      hasReadme: !!readmeLength,
      readmeLength,
      hasTypeScript: language === 'TypeScript',
      hasTests: false, // TODO: Check from GitHub API
      hasEnvExample: false, // TODO: Check from GitHub API
      hasLicense: false, // TODO: Check from GitHub API
      hasGitignore: true, // Assume true for now
      websiteUrl: domainData?.domain,
      technicalJourney,
    })

    // Build context block
    let contextBlock: ContextBlock | undefined
    if (contextData) {
      contextBlock = {
        problem: contextData.problem_context,
        solution: contextData.solution_context,
        impact: contextData.impact_context,
      }
    }

    // Build case study project
    const caseStudy: CaseStudyProject = {
      owner,
      repo,
      repositoryUrl,
      description,
      language,
      stars,
      forks,
      openIssues,
      pushedAt,
      videoUrl: videoData?.video_url || null,
      videoThumbnail: videoData?.thumbnail_url || null,
      websiteUrl: domainData?.domain || null,
      techStack: [], // TODO: Extract from repo data or generate
      metrics,
      healthScore,
      completeness,
      impactDataCached: !!impactData, // Track if impact_cache entry exists
      technicalJourney,
      contextBlock: contextBlock || null,
      architectureDiagram: null, // Generated on demand
      lastUpdated: impactData?.cached_at || null,
      createdAt: repoData.added_at,
    }

    return {
      success: true,
      data: caseStudy,
    }
  } catch (error) {
    console.error('Error fetching case study data:', error)

    if (error instanceof AuthenticationError) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to fetch case study data. Please try again.',
    }
  }
}
