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
- **IMPORTANT: Keep all node labels SHORT (max 15 characters)** - Use abbreviations if needed (e.g., "Auth" not "Authentication", "Next.js" not "Next.js Frontend")
- **IMPORTANT: Keep edge labels VERY SHORT (max 10 characters)** - Use concise phrases (e.g., "API" not "API Calls", "Data" not "Data Fetch")
- Make it readable and professional

**MERMAID DIAGRAM RULES:**
1. **Use Subgraphs**: Group technologies into logical layers using \`subgraph\` syntax (e.g., "Frontend Application", "Backend Services", "External APIs", "Data Layer")
   Example:
   \`\`\`
   subgraph "Frontend"
     A[▲ Next.js]
     B[⚛️ React]
   end
   subgraph "Backend"
     C[🔥 Supabase]
   end
   \`\`\`

2. **Use Emojis**: ALWAYS include a relevant emoji inside EVERY node text to make it visually scannable
   Examples:
   - A[▲ Next.js] - Frontend framework
   - B[⚡ Supabase] - Backend/Database
   - C[🔐 Auth] - Authentication
   - D[📦 Redis] - Caching
   - E[🎨 Tailwind] - Styling
   - F[🔗 API] - API layer
   - G[💾 PostgreSQL] - Database
   - H[☁️ Vercel] - Deployment
   - I[📊 Analytics] - Analytics service
   - J[🌐 CDN] - Content delivery

3. **Accurate Flow**: Use the correct arrow types for data flow
   - \`<-->\` (bidirectional arrows) for request/response patterns or two-way data flows
   - \`-->\` (one-way arrows) for unidirectional triggers, events, or pipelines
   Example:
   \`\`\`
   A[▲ Next.js] <--> B[⚡ Supabase]  (requests and receives data)
   C[📦 Redis] --> D[💾 Database]    (cache invalidation trigger)
   \`\`\`

4. **Descriptive Edges**: Label ALL edges with SHORT active verbs (max 10 chars) explaining the exact data/action
   Examples:
   - \`A -- "Fetches" --> B\`
   - \`C -- "Caches" --> D\`
   - \`E <-- "Returns" --> F\`
   - \`G -- "Triggers" --> H\`
   - \`I -- "Stores" --> J\`
   Keep labels brief but descriptive!

**ARCHITECTURAL LOGIC RULES (SANITY CHECK):**
Before generating the diagram, verify that arrows follow realistic modern web architecture patterns:

1. **Directional Accuracy**: Ensure arrows represent realistic data flow or dependency in modern web development
   - Data flows FROM client TO server, server TO database
   - Responses flow back in the opposite direction
   - Authentication flows: Client → Auth Service → Database

2. **Next.js / React Flow**: DO NOT show React as a separate node from Next.js
   - ❌ WRONG: \`A[▲ Next.js] <--> B[⚛️ React]\` (they're the same thing!)
   - ❌ WRONG: Multiple arrows between Next.js and React (creates messy frontend)
   - ✅ CORRECT: Just use \`A[▲ Next.js]\` (React is built into Next.js)
   - Next.js should be the ONLY frontend node making API calls
   - Example: \`Next.js -- "Fetches" --> Supabase\` (clean, single arrow)

3. **Hosting vs. Databases**: DO NOT draw arrows from Databases to Hosting platforms
   - ❌ WRONG: \`Supabase -- "Stores" --> Vercel\` (backwards! Supabase doesn't store things IN Vercel)
   - ❌ WRONG: \`PostgreSQL --> Vercel\` (databases don't deploy to hosts)
   - ✅ CORRECT: \`Next.js/Vercel -- "Fetches" --> Supabase\` (frontend hosted on Vercel requests data from Supabase)
   - Hosting platforms (Vercel, Netlify, Railway) = WHERE the app runs
   - Databases (Supabase, PostgreSQL, MongoDB) = WHERE data lives
   - Arrow direction: Frontend@Hosting → Database, NEVER Database → Hosting

4. **Edge Label Verb Constraints** (CRITICAL - Prevent Semantic Errors):
   Ensure verbs match the actual function of each node type:

   **UI Frameworks (Next.js, Vue, React):**
   - ✅ CAN: "Fetches", "Requests", "Calls", "Authenticates", "Queries"
   - ❌ CANNOT: "Renders" a database (renders UI only), "Stores" (UI doesn't store data)

   **Databases (Supabase, PostgreSQL, MongoDB, Redis):**
   - ✅ CAN: "Stores", "Caches", "Persists", "Syncs" (when receiving data)
   - ❌ CANNOT: "Stores" a hosting platform (nonsensical direction)
   - ❌ CANNOT: Send data TO frontend (should be bidirectional <--> or frontend requests)

   **Hosting Platforms (Vercel, Netlify, Railway):**
   - ✅ CAN: "Hosts", "Deploys", "Serves"
   - ❌ CANNOT: Receive "Stores" from a database
   - ❌ CANNOT: Be the target of data storage operations

   **External APIs (GitHub, Stripe, OpenAI):**
   - ✅ CAN: Receive "Calls", "Fetches", "Triggers"
   - ❌ CANNOT: "Renders" anything (they're APIs, not UI)

5. **Common Anti-Patterns to Avoid**:
   - ❌ \`React -- "Renders" --> Supabase\` (React renders UI components, not databases!)
   - ❌ \`Supabase -- "Stores" --> Vercel\` (backwards storage direction!)
   - ❌ \`Database --> CDN\` (CDN serves static assets, not DB connections)
   - ❌ \`Auth Service --> Frontend\` (should be Frontend → Auth Service)
   - ❌ Multiple overlapping arrows between Next.js/React/Framework (keep it clean - one frontend node)
   - ✅ Use logical groupings in subgraphs to clarify layers

**SANITY CHECK EXAMPLES:**

❌ **BAD DIAGRAM** (Multiple errors):
\`\`\`
subgraph "Frontend"
  A[▲ Next.js] <--> B[⚛️ React]
end
subgraph "Backend"
  C[⚡ Supabase]
end
subgraph "Infrastructure"
  D[☁️ Vercel]
end

B -- "Renders" --> C
C -- "Stores" --> D
A -- "Fetches" --> C
\`\`\`
Problems:
- React shown as separate from Next.js with bidirectional arrows (messy)
- "Renders" used incorrectly (React renders UI, not databases)
- "Stores" going backwards (Supabase doesn't store things in Vercel)

✅ **GOOD DIAGRAM** (Clean, accurate):
\`\`\`
subgraph "Frontend"
  A[▲ Next.js]
end
subgraph "Backend"
  B[⚡ Supabase]
  C[💾 PostgreSQL]
end
subgraph "Infrastructure"
  D[☁️ Vercel]
end

A -- "Fetches" --> B
B -- "Stores" --> C
D -- "Hosts" --> A
\`\`\`
Benefits:
- Next.js is the only frontend node (React is implied)
- Clear, unidirectional data flow: Frontend → Backend → Database
- Correct verbs: "Fetches" (data retrieval), "Stores" (data persistence), "Hosts" (deployment)
- Clean layering with minimal arrows

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
  githubToken?: string,
  userInstruction?: string
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
    let userPrompt = `Project: ${projectName}

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

    // Append user instruction if provided
    if (userInstruction) {
      userPrompt += `

---

**IMPORTANT USER INSTRUCTION:**
${userInstruction}

Please update the diagram based on this specific request while maintaining accuracy to the actual tech stack and file structure.`
    }

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

    // Parse TL;DR from draft_data
    const draftData = repoData.draft_data as { tldr?: string } | null
    const tldr = draftData?.tldr || null

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
      tldr,
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

/**
 * Get all projects for a user's public portfolio
 */
export async function getUserProjects(userId: string): Promise<ApiResponse<CaseStudyProject[]>> {
  try {
    const supabase = await createClient()

    // Fetch user's repositories
    const { data: repos, error: reposError } = await supabase
      .from('user_repositories')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })

    if (reposError) {
      throw reposError
    }

    if (!repos || repos.length === 0) {
      return { success: true, data: [] }
    }

    const repoUrls = repos.map(r => `${r.repo_owner}/${r.repo_name}`)

    // Fetch all data in parallel
    const [impactData, videosData, domainsData, journeysData] = await Promise.all([
      supabase
        .from('impact_cache')
        .select('*')
        .eq('user_id', userId)
        .in('repo_full_name', repoUrls),
      supabase
        .from('project_videos')
        .select('*')
        .eq('user_id', userId),
      supabase
        .from('project_domains')
        .select('*')
        .eq('user_id', userId),
      supabase
        .from('project_technical_journey')
        .select('*')
        .eq('user_id', userId),
    ])

    // Map repositories to CaseStudyProject format
    const projects: CaseStudyProject[] = repos.map(repo => {
      const repositoryUrl = `${repo.repo_owner}/${repo.repo_name}`
      const impact = impactData.data?.find(i => i.repo_full_name === repositoryUrl)
      const video = videosData.data?.find(v => v.repository_url === repositoryUrl)
      const domain = domainsData.data?.find(d => d.repository_url === repositoryUrl)
      const journey = journeysData.data?.find(j => j.repository_url === repositoryUrl)

      // Parse repo data
      const repoData = impact?.repo_data as Record<string, unknown> | undefined
      const description = repoData?.description as string | undefined
      const language = repoData?.language as string | undefined
      const stars = (repoData?.stargazersCount || repoData?.stargazers_count || 0) as number
      const forks = (repoData?.forksCount || repoData?.forks_count || 0) as number

      // Parse impact metrics
      const metrics = impact?.impact_metrics ? (Array.isArray(impact.impact_metrics) ? impact.impact_metrics : []) : []
      const impactMetrics = metrics.filter((m: any) => m.value > 0)

      // Calculate health score and completeness
      const healthScore = calculateHealthScore({
        hasReadme: !!repoData?.readmeLength,
        hasTests: false,
        hasCI: false,
        hasDocumentation: !!description,
        hasLicense: false,
        lastCommitDays: 0,
        openIssuesCount: 0,
        hasActiveContributors: true,
      })

      const completeness = calculateCompleteness({
        description,
        language,
        hasReadme: !!repoData?.readmeLength,
        hasTypeScript: language === 'TypeScript',
        hasTests: false,
        hasEnvExample: false,
        hasLicense: false,
        hasGitignore: true,
        websiteUrl: domain?.domain,
        technicalJourney: journey ? {
          problemStatement: journey.problem_statement,
          technicalApproach: journey.technical_approach,
          keyChallenges: journey.key_challenges,
          outcome: journey.outcome,
        } : null,
      })

      return {
        repositoryUrl,
        repo: repo.repo_name,
        owner: repo.repo_owner,
        description,
        language,
        stars,
        forks,
        videoUrl: video?.video_url,
        videoThumbnail: video?.thumbnail_url,
        websiteUrl: domain?.domain,
        metrics: impactMetrics,
        healthScore,
        completeness,
        contextBlock: null,
        architectureDiagram: null,
        technicalJourney: null,
        techStack: [],
        impactDataCached: !!impact,
      }
    })

    return { success: true, data: projects }
  } catch (error) {
    console.error('Error fetching user projects:', error)
    return {
      success: false,
      error: 'Failed to fetch projects',
      data: [],
    }
  }
}
