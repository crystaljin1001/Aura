'use server'

/**
 * AI-Assisted Technical Journey Generation
 *
 * Uses README and project context to help users write their technical journey
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'
import type { TechDecision, ArchitecturalTradeoff } from '../types'
import { fetchTechnicalContext } from './github-context'
import { decryptToken } from '@/lib/encryption/crypto'

interface GeneratedJourney {
  problemStatement: string
  technicalApproach: string
  keyChallenges: string
  outcome: string
  learnings: string[]
  techDecisions: TechDecision[]
  architecturalTradeoffs?: ArchitecturalTradeoff[]
}

export async function generateTechnicalJourney(
  repositoryUrl: string
): Promise<ApiResponse<GeneratedJourney>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'You must be signed in to generate technical journey',
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

    // Fetch repository data from impact_cache
    const { data: impactData } = await supabase
      .from('impact_cache')
      .select('*')
      .eq('user_id', user.id)
      .eq('repo_full_name', repositoryUrl)
      .single()

    const repoData = impactData?.repo_data as Record<string, unknown> | null
    const description = (repoData?.description as string) || ''
    const language = (repoData?.language as string) || ''

    // Fetch README from GitHub
    const [owner, repo] = repositoryUrl.split('/')
    const readmeUrl = `https://api.github.com/repos/${owner}/${repo}/readme`

    const readmeResponse = await fetch(readmeUrl, {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: 'application/vnd.github.v3.raw',
      },
    })

    if (!readmeResponse.ok) {
      return {
        success: false,
        error: 'Could not fetch README. Make sure your repository has a README file.',
      }
    }

    const readmeContent = await readmeResponse.text()

    // Fetch rich technical context
    const technicalContext = await fetchTechnicalContext(owner, repo, githubToken)

    // Generate technical journey using Claude
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })

    const prompt = `You are a technical writer helping a developer write their project's technical journey for their portfolio. FOCUS ON "WHY" over "WHAT" - explain the reasoning, alternatives considered, and trade-offs made.

Repository: ${repositoryUrl}
Description: ${description}
Language: ${language}

=== README ===
${readmeContent.slice(0, 8000)}

=== TECH STACK ===
${technicalContext.techStack.length > 0 ? technicalContext.techStack.join(', ') : 'Not detected'}

=== PROJECT STRUCTURE ===
${technicalContext.fileTree ? technicalContext.fileTree.slice(0, 1500) : 'Not available'}

=== SIGNIFICANT COMMITS ===
${technicalContext.significantCommits ? technicalContext.significantCommits.slice(0, 1500) : 'Not available'}

=== PACKAGE.JSON ===
${technicalContext.packageJson ? technicalContext.packageJson.slice(0, 1500) : 'Not available'}

---

Based on ALL the context above, generate a compelling technical journey that emphasizes REASONING and TRADE-OFFS:

1. PROBLEM STATEMENT (2-3 sentences)
   - Analyze the README and identify the SPECIFIC problem this solves
   - Why this problem matters (pain point, existing solution gaps)
   - Personal motivation (infer from project description)

2. TECHNICAL APPROACH (3-4 sentences)
   - Reference ACTUAL tech stack: "${technicalContext.techStack.slice(0, 3).join(', ')}"
   - Explain WHY these technologies were chosen (performance, developer experience, ecosystem)
   - Infer architecture from file structure and explain WHY this architecture
   - Focus on the reasoning behind technical choices

3. KEY CHALLENGES (2-3 specific challenges)
   - Look at SIGNIFICANT COMMITS to infer technical obstacles (large refactors, migrations)
   - Reference complex parts of the file structure
   - Mention technical trade-offs that likely occurred
   - Be specific: "Implementing X with Y while maintaining Z"

4. OUTCOME (2-3 sentences)
   - What was achieved (based on README)
   - Any metrics or impact mentioned
   - Current state and learnings

5. LEARNINGS (3-5 bullet points)
   - Specific technical skills developed (reference actual tech stack)
   - Architectural lessons learned
   - Problem domain insights
   - What would be done differently at scale

6. ARCHITECTURAL TRADE-OFFS (2-3 major decisions)
   - Identify key architectural decisions from file structure (e.g., monolithic vs microservices, SSR vs CSR)
   - For each: {"decision": "Monolithic vs Microservices", "chosen": "Monolithic", "rationale": "Team of 2, need fast iteration"}
   - Focus on WHY one approach over another
   - Consider: deployment strategy, data layer, authentication pattern, state management

7. TECH DECISIONS (3-5 key choices with trade-off analysis)
   - For EACH major technology in the tech stack, explain:
     * WHY it was chosen
     * What ALTERNATIVES were likely considered (based on ecosystem)
     * BENEFITS of the choice
     * DRAWBACKS accepted as trade-offs
   - Example format:
     {
       "technology": "Redis",
       "reason": "Needed sub-10ms reads for real-time features",
       "alternativesConsidered": ["Memcached", "DynamoDB", "In-memory cache"],
       "tradeoffs": {
         "benefits": ["Sub-millisecond latency", "Built-in pub/sub", "Data persistence"],
         "drawbacks": ["Additional infrastructure", "Memory limits", "No native ACID transactions"]
       }
     }
   - Use package.json to infer alternatives (e.g., if using React Query, alternatives are SWR, Apollo)
   - Focus on architectural decisions: database, framework, state management, auth, deployment

Format as JSON:
{
  "problemStatement": "...",
  "technicalApproach": "...",
  "keyChallenges": "...",
  "outcome": "...",
  "learnings": ["...", "...", "..."],
  "architecturalTradeoffs": [
    {
      "decision": "question being decided",
      "chosen": "what was chosen",
      "rationale": "why this choice for this context"
    }
  ],
  "techDecisions": [
    {
      "technology": "...",
      "reason": "...",
      "alternativesConsidered": ["...", "..."],
      "tradeoffs": {
        "benefits": ["...", "..."],
        "drawbacks": ["...", "..."]
      }
    }
  ]
}

CRITICAL RULES:
- Write in first person ("I built", "I chose", "I considered")
- Be SPECIFIC using file structure, tech stack, and commits
- For every technology choice, explain WHY over alternatives
- Include realistic alternatives based on the ecosystem
- Mention trade-offs (what you gave up to gain something else)
- Avoid generic statements - use evidence from the codebase
- Focus on engineering reasoning, not just descriptions`

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse JSON response with robust error handling
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', responseText.slice(0, 200))
      return {
        success: false,
        error: 'AI response did not contain valid JSON. Please try again.',
      }
    }

    let jsonString = jsonMatch[0]

    // Multi-pass JSON cleaning and parsing
    try {
      // Attempt 1: Parse as-is
      const journey = JSON.parse(jsonString) as GeneratedJourney
      return { success: true, data: journey }
    } catch (firstError) {
      try {
        // Attempt 2: Clean control characters
        jsonString = jsonString.replace(/[\x00-\x1F\x7F]/g, (char) => {
          const escapes: Record<string, string> = {
            '\n': '\\n', '\r': '\\r', '\t': '\\t', '\b': '\\b', '\f': '\\f',
          }
          return escapes[char] || ''
        })
        const journey = JSON.parse(jsonString) as GeneratedJourney
        return { success: true, data: journey }
      } catch (secondError) {
        try {
          // Attempt 3: Fix unescaped quotes in strings
          jsonString = jsonString
            // Fix unescaped quotes within string values (but not the quotes that delimit strings)
            .replace(/"([^"]*)"(\s*:\s*)"([^"]*)"/g, (match, key, colon, value) => {
              // Escape any unescaped quotes in the value
              const escapedValue = value.replace(/(?<!\\)"/g, '\\"')
              return `"${key}"${colon}"${escapedValue}"`
            })

          const journey = JSON.parse(jsonString) as GeneratedJourney
          return { success: true, data: journey }
        } catch (thirdError) {
          try {
            // Attempt 4: Use regex to extract just the required fields
            const problemMatch = jsonString.match(/"problemStatement"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/s)
            const approachMatch = jsonString.match(/"technicalApproach"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/s)
            const challengesMatch = jsonString.match(/"keyChallenges"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/s)
            const outcomeMatch = jsonString.match(/"outcome"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/s)

            if (problemMatch && approachMatch) {
              const journey: GeneratedJourney = {
                problemStatement: problemMatch[1].replace(/\\"/g, '"'),
                technicalApproach: approachMatch[1].replace(/\\"/g, '"'),
                keyChallenges: challengesMatch ? challengesMatch[1].replace(/\\"/g, '"') : undefined,
                outcome: outcomeMatch ? outcomeMatch[1].replace(/\\"/g, '"') : undefined,
                learnings: [],
                techDecisions: [],
              }
              console.warn('Used fallback JSON extraction')
              return { success: true, data: journey }
            }

            throw thirdError
          } catch (finalError) {
            console.error('JSON parsing failed after 4 attempts:', {
              firstError,
              secondError,
              thirdError,
              finalError,
              preview: jsonString.slice(0, 500),
              fullText: responseText.slice(0, 1000),
            })
            return {
              success: false,
              error: 'AI generated malformed response. Please try again or write manually.',
            }
          }
        }
      }
    }

    return {
      success: true,
      data: journey,
    }
  } catch (error) {
    console.error('Error generating technical journey:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate technical journey',
    }
  }
}
