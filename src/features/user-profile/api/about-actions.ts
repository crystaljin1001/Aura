'use server'

/**
 * About Section AI Agent
 * Generates personalized About Me, Skills & Technologies, and Experience
 * from the user's CV, profile data, and project portfolio.
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { AboutSectionData, SoloProject } from '../types'
import type { ApiResponse } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/* ------------------------------------------------------------------ */
/*  Read                                                               */
/* ------------------------------------------------------------------ */

export async function getAboutSection(): Promise<AboutSectionData | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data } = await supabase
      .from('about_sections')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!data) return null

    return {
      headline: data.headline,
      headlineHighlight: data.headline_highlight ?? '',
      bio: data.bio ?? [],
      location: data.location ?? '',
      yearsExperience: data.years_experience ?? '',
      availabilityLabel: data.availability_label ?? '',
      skills: (data.skills as AboutSectionData['skills']) ?? [],
      experience: (data.experience as AboutSectionData['experience']) ?? [],
    }
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/*  Solo Projects                                                      */
/* ------------------------------------------------------------------ */

export async function getSoloProjects(): Promise<SoloProject[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: repos } = await supabase
      .from('user_repositories')
      .select('repo_owner, repo_name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!repos || repos.length === 0) return []

    const projects: SoloProject[] = []

    for (const r of repos) {
      const fullName = `${r.repo_owner}/${r.repo_name}`
      const { data: cached } = await supabase
        .from('impact_cache')
        .select('repo_data')
        .eq('user_id', user.id)
        .eq('repo_full_name', fullName)
        .single()

      const rd = (cached?.repo_data ?? {}) as Record<string, unknown>
      projects.push({
        owner: r.repo_owner,
        repo: r.repo_name,
        description: (rd.tldr as string) || (rd.description as string) || null,
        language: (rd.language as string) || null,
        stars: Number(rd.stargazersCount) || 0,
        forks: Number(rd.forksCount) || 0,
        pushedAt: (rd.pushedAt as string) || null,
      })
    }

    return projects
  } catch {
    return []
  }
}

/* ------------------------------------------------------------------ */
/*  Save                                                               */
/* ------------------------------------------------------------------ */

export async function saveAboutSection(
  data: AboutSectionData
): Promise<ApiResponse<void>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase.from('about_sections').upsert(
      {
        user_id: user.id,
        headline: data.headline,
        headline_highlight: data.headlineHighlight,
        bio: data.bio,
        location: data.location,
        years_experience: data.yearsExperience,
        availability_label: data.availabilityLabel,
        skills: data.skills,
        experience: data.experience,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save',
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Generate                                                           */
/* ------------------------------------------------------------------ */

export async function generateAboutSection(): Promise<ApiResponse<AboutSectionData>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // ── 1. Fetch user profile ──────────────────────────────────────
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // ── 2. Fetch repositories + impact cache ───────────────────────
    const { data: repos } = await supabase
      .from('user_repositories')
      .select('repo_owner, repo_name')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false })

    const repoUrls = (repos ?? []).map(
      (r: { repo_owner: string; repo_name: string }) =>
        `${r.repo_owner}/${r.repo_name}`
    )

    const { data: impactCache } = await supabase
      .from('impact_cache')
      .select('repo_full_name, repo_data, impact_metrics')
      .eq('user_id', user.id)
      .in('repo_full_name', repoUrls)

    // ── 3. Build portfolio context string ─────────────────────────
    const portfolioContext =
      repoUrls.length > 0
        ? repoUrls
            .map((repoUrl: string) => {
              const cache = (impactCache ?? []).find(
                (c: { repo_full_name: string }) => c.repo_full_name === repoUrl
              )
              if (!cache) return `- ${repoUrl}`
              const rd = (cache.repo_data ?? {}) as Record<string, unknown>
              const tldr = rd.tldr ?? rd.description ?? ''
              const lang = rd.language ?? ''
              const stack = rd.techStack ?? ''
              return `- ${repoUrl} (${lang}): ${tldr}${stack ? ` | Stack: ${stack}` : ''}`
            })
            .join('\n')
        : 'No repositories found'

    // ── 4. Build profile context ───────────────────────────────────
    const profileContext = profile
      ? [
          profile.full_name ? `Name: ${profile.full_name}` : null,
          profile.job_title ? `Job title: ${profile.job_title}` : null,
          profile.bio ? `Current bio: ${profile.bio}` : null,
          profile.location ? `Location: ${profile.location}` : null,
          profile.github_username
            ? `GitHub: ${profile.github_username}`
            : null,
          profile.availability_status
            ? `Availability: ${profile.availability_status}`
            : null,
        ]
          .filter(Boolean)
          .join('\n')
      : 'No profile data'

    // ── 5. Download CV from Supabase storage ──────────────────────
    let cvContent:
      | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } }
      | null = null

    if (profile?.cv_url) {
      try {
        // Extract the storage path from the public URL
        // URL format: .../storage/v1/object/public/cvs/<userId>/<filename>
        const match = profile.cv_url.match(/\/storage\/v1\/object\/public\/cvs\/(.+)$/)
        const filePath = match?.[1]

        if (filePath) {
          const { data: fileBlob, error: downloadError } = await supabase.storage
            .from('cvs')
            .download(filePath)

          if (downloadError) {
            console.error('[generateAboutSection] CV download error:', downloadError.message)
          } else if (fileBlob) {
            const buffer = await fileBlob.arrayBuffer()
            const base64 = Buffer.from(buffer).toString('base64')
            cvContent = {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64,
              },
            }
            console.log('[generateAboutSection] CV loaded successfully, size:', buffer.byteLength, 'bytes')
          }
        } else {
          console.error('[generateAboutSection] Could not parse CV path from URL:', profile.cv_url)
        }
      } catch (err) {
        console.error('[generateAboutSection] CV fetch exception:', err)
      }
    } else {
      console.log('[generateAboutSection] No CV URL found on profile')
    }

    // ── 6. Build prompt ───────────────────────────────────────────
    const textPrompt = `You are an expert portfolio copywriter for software engineers. Generate a compelling "About Me" section for a developer's portfolio website.

## Developer Profile
${profileContext}

## Portfolio Projects
${portfolioContext}

${cvContent
  ? '## CV/Resume\nThe developer\'s CV/resume is attached as a PDF document above. You MUST extract real work experience, education, skills, and accomplishments directly from the PDF. Do not use placeholder data.\n'
  : '## Note\nNo CV was available. Base experience and skills strictly on the profile data and portfolio projects above. Do not invent companies or roles.\n'
}

## Instructions
Generate a JSON object with these EXACT keys. Base everything on real information provided — DO NOT invent companies, roles, or skills that aren't in the data.

1. **headline**: A punchy one-line statement of their engineering identity (e.g. "I build products that ship and scale")
2. **headlineHighlight**: The 2-4 word "punchline" within the headline that should be highlighted in gradient (e.g. "ship and scale")
3. **bio**: Array of 2-3 short paragraphs (strings) that tell their authentic story. Reference real projects and timeframes.
4. **location**: Their location (or empty string)
5. **yearsExperience**: E.g. "4+ Years Experience" (or empty string if unknown)
6. **availabilityLabel**: One of: "Open to Work", "Open to Opportunities", "Available for Freelance", or empty string based on availability_status
7. **skills**: Array of skill groups extracted from CV and project tech stacks. Group by category: Frontend, Backend, DevOps, AI/ML, Tools, etc. Only include technologies they actually used.
8. **experience**: Array of work experience entries from the CV. Each entry: { role, company, period, description }. Description should be 1 punchy sentence of real impact.

Return ONLY valid JSON, no markdown, no explanation:
{
  "headline": "...",
  "headlineHighlight": "...",
  "bio": ["paragraph 1", "paragraph 2", "paragraph 3"],
  "location": "...",
  "yearsExperience": "...",
  "availabilityLabel": "...",
  "skills": [{ "category": "...", "items": ["..."] }],
  "experience": [{ "role": "...", "company": "...", "period": "...", "description": "..." }]
}`

    // ── 7. Call Claude ─────────────────────────────────────────────
    const messageContent: Anthropic.MessageParam['content'] = cvContent
      ? [cvContent, { type: 'text', text: textPrompt }]
      : textPrompt

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: messageContent }],
    })

    const rawText =
      response.content[0].type === 'text' ? response.content[0].text : ''

    // ── 8. Parse response ─────────────────────────────────────────
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { success: false, error: 'AI returned invalid format' }
    }
    const generated = JSON.parse(jsonMatch[0]) as AboutSectionData

    // ── 9. Save to DB ─────────────────────────────────────────────
    const saveResult = await saveAboutSection(generated)
    if (!saveResult.success) return saveResult

    return { success: true, data: generated }
  } catch (err) {
    console.error('[generateAboutSection] Error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Generation failed',
    }
  }
}
