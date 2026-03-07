'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ImpactMetric } from '@/types'
import type { Project, ProjectStatus } from './types'
import type { TechnicalJourney, TechDecision } from '@/features/portfolio/types'
import { calculateCompleteness, getCompletenessStats } from '@/features/portfolio/utils/completeness-checker'

export async function getUserProjectsWithStatus(): Promise<Project[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Fetch repositories
  const { data: repos, error: reposError } = await supabase
    .from('user_repositories')
    .select('*')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false })

  if (reposError) {
    console.error('Error fetching repositories:', reposError)
    return []
  }

  if (!repos || repos.length === 0) {
    return []
  }

  // Fetch scripts
  const { data: scripts, error: scriptsError } = await supabase
    .from('narrative_scripts')
    .select('project_name, repository_url, script_type')
    .eq('user_id', user.id)

  if (scriptsError) {
    console.error('Error fetching scripts:', scriptsError)
  }

  console.log('[getUserProjectsWithStatus] Fetched scripts:', scripts)

  // Fetch videos
  const { data: videos } = await supabase
    .from('project_videos')
    .select('repository_url, video_url, thumbnail_url')
    .eq('user_id', user.id)

  // Fetch domains
  const { data: domains } = await supabase
    .from('project_domains')
    .select('repository_url, domain, is_active')
    .eq('user_id', user.id)

  // Fetch impact metrics from cache
  const repoUrls = repos.map(r => `${r.repo_owner}/${r.repo_name}`)
  const { data: impactCache } = await supabase
    .from('impact_cache')
    .select('*')
    .eq('user_id', user.id)
    .in('repo_full_name', repoUrls)

  // Fetch technical journeys
  const { data: journeys } = await supabase
    .from('project_technical_journey')
    .select('*')
    .eq('user_id', user.id)
    .in('repository_url', repoUrls)

  // Combine data and determine status
  return repos.map(repo => {
    const repoUrl = `${repo.repo_owner}/${repo.repo_name}`
    const hasScript = scripts?.some(s => s.repository_url === repoUrl) || false
    const hasVideo = videos?.some(v => v.repository_url === repoUrl) || false
    const hasDomain = domains?.some(d => d.repository_url === repoUrl && d.is_active) || false

    console.log(`[getUserProjectsWithStatus] ${repoUrl}:`, {
      hasScript,
      matchingScripts: scripts?.filter(s => s.repository_url === repoUrl),
    })

    const video = videos?.find(v => v.repository_url === repoUrl)
    const domain = domains?.find(d => d.repository_url === repoUrl)
    const impact = impactCache?.find(c => c.repo_full_name === repoUrl)

    // Parse repo data from JSONB
    const repoData = impact?.repo_data as Record<string, unknown> | undefined
    const description = (repoData?.tldr as string | undefined) || (repoData?.description as string | undefined)
    const language = repoData?.language as string | undefined
    const readmeLength = repoData?.readmeLength as number | undefined
    const approvedTitle = repoData?.title as string | undefined

    // Use status from database if it's 'analyzing' or 'draft', otherwise calculate
    let status: ProjectStatus = repo.status || 'new'
    if (status !== 'analyzing' && status !== 'draft') {
      if (hasDomain) {
        status = 'deployed'
      } else if (hasVideo) {
        status = 'video_ready'
      } else if (hasScript) {
        status = 'script_ready'
      }
    }

    // Parse impact metrics
    let impactMetrics
    if (impact?.impact_metrics) {
      const metrics: ImpactMetric[] = Array.isArray(impact.impact_metrics) ? impact.impact_metrics : []
      impactMetrics = {
        criticalIssuesResolved: metrics.find((m) => m.type === 'issues_resolved')?.value || 0,
        performanceOptimizations: metrics.find((m) => m.type === 'performance')?.value || 0,
        userAdoption: metrics.find((m) => m.type === 'users')?.value || 0,
        codeQualityImprovements: metrics.find((m) => m.type === 'quality')?.value || 0,
        featuresDelivered: metrics.find((m) => m.type === 'features')?.value || 0
      }
    }

    // Build technical journey if exists
    const journeyData = journeys?.find(j => j.repository_url === repoUrl)
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

    // Calculate completeness
    const completeness = calculateCompleteness({
      description,
      language,
      hasReadme: !!readmeLength,
      readmeLength,
      hasTypeScript: language === 'TypeScript',
      hasTests: false, // TODO: Fetch from GitHub API
      hasEnvExample: false, // TODO: Fetch from GitHub API
      hasLicense: false, // TODO: Fetch from GitHub API
      hasGitignore: true, // Assume true for now
      websiteUrl: domain?.domain,
      technicalJourney,
    })

    const completenessStats = getCompletenessStats(completeness)

    return {
      id: repo.id,
      name: approvedTitle || repo.repo_name,
      repository: repoUrl,
      description: description,
      status,
      hasScript,
      hasVideo,
      hasDomain,
      stars: 0, // Will be fetched from impact cache
      forks: 0, // Will be fetched from impact cache
      language: language,
      videoUrl: video?.video_url,
      videoThumbnail: video?.thumbnail_url,
      domainUrl: domain?.domain,
      impactMetrics,
      completeness: completenessStats,
      draftData: repo.draft_data || undefined,
      createdAt: repo.added_at,
      updatedAt: repo.added_at
    }
  })
}

export async function addRepository(repoUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Parse repository URL
  let owner: string
  let repo: string

  // Clean the URL - remove .git extension
  const cleanUrl = repoUrl.replace(/\.git$/, '')

  if (cleanUrl.includes('github.com')) {
    const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      throw new Error('Invalid GitHub URL')
    }
    owner = match[1]
    repo = match[2]
  } else if (cleanUrl.includes('/')) {
    const parts = cleanUrl.split('/')
    owner = parts[0]
    repo = parts[1]
  } else {
    throw new Error('Invalid repository format. Use "owner/repo" or GitHub URL')
  }

  // Check if already exists
  const { data: existing } = await supabase
    .from('user_repositories')
    .select('id')
    .eq('user_id', user.id)
    .eq('repo_owner', owner)
    .eq('repo_name', repo)
    .single()

  if (existing) {
    throw new Error('Repository already added')
  }

  // Check max repositories (10)
  const { count } = await supabase
    .from('user_repositories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (count && count >= 10) {
    throw new Error('Maximum 10 repositories allowed')
  }

  // Insert repository with analyzing status
  const { data: insertedRepo, error } = await supabase
    .from('user_repositories')
    .insert({
      user_id: user.id,
      repo_owner: owner,
      repo_name: repo,
      status: 'analyzing'
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding repository:', error)
    throw new Error('Failed to add repository')
  }

  // Trigger AI analysis asynchronously (don't await)
  if (insertedRepo) {
    const { analyzeRepositoryDraft } = await import('./api/draft-analyzer')
    analyzeRepositoryDraft(insertedRepo.id, owner, repo).catch((err) => {
      console.error('AI analysis failed:', err)
    })
  }

  revalidatePath('/dashboard')
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // First, fetch the repository info to get the repository_url
  const { data: repo, error: fetchError } = await supabase
    .from('user_repositories')
    .select('repo_owner, repo_name')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !repo) {
    console.error('Error fetching repository:', fetchError)
    throw new Error('Project not found')
  }

  const repositoryUrl = `${repo.repo_owner}/${repo.repo_name}`

  // Delete all related records manually (since there are no foreign key constraints)
  // Delete narrative scripts
  await supabase
    .from('narrative_scripts')
    .delete()
    .eq('user_id', user.id)
    .eq('repository_url', repositoryUrl)

  // Delete project videos
  await supabase
    .from('project_videos')
    .delete()
    .eq('user_id', user.id)
    .eq('repository_url', repositoryUrl)

  // Delete project domains
  await supabase
    .from('project_domains')
    .delete()
    .eq('user_id', user.id)
    .eq('repository_url', repositoryUrl)

  // Delete technical journey
  await supabase
    .from('project_technical_journey')
    .delete()
    .eq('user_id', user.id)
    .eq('repository_url', repositoryUrl)

  // Delete impact cache (uses repo_full_name instead of repository_url)
  await supabase
    .from('impact_cache')
    .delete()
    .eq('user_id', user.id)
    .eq('repo_full_name', repositoryUrl)

  // Delete pulse metrics cache
  await supabase
    .from('pulse_metrics_cache')
    .delete()
    .eq('user_id', user.id)
    .eq('repo_full_name', repositoryUrl)

  // Delete engineering rigor cache
  await supabase
    .from('engineering_rigor_cache')
    .delete()
    .eq('user_id', user.id)
    .eq('repo_full_name', repositoryUrl)

  // Finally, delete the repository itself
  const { error } = await supabase
    .from('user_repositories')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting project:', error)
    throw new Error('Failed to delete project')
  }

  revalidatePath('/dashboard')
}

export async function saveProjectVideo(repositoryUrl: string, videoUrl: string, thumbnailUrl?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Check if video already exists
  const { data: existing } = await supabase
    .from('project_videos')
    .select('id')
    .eq('user_id', user.id)
    .eq('repository_url', repositoryUrl)
    .single()

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('project_videos')
      .update({
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (error) {
      throw new Error('Failed to update video')
    }
  } else {
    // Insert new
    const { error } = await supabase
      .from('project_videos')
      .insert({
        user_id: user.id,
        repository_url: repositoryUrl,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl
      })

    if (error) {
      throw new Error('Failed to save video')
    }
  }

  revalidatePath('/dashboard')
}

/**
 * Upload project video file to Supabase Storage
 */
export async function uploadProjectVideo(
  formData: FormData,
  onProgress?: (progress: number) => void
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const videoFile = formData.get('video') as File
  const repositoryUrl = formData.get('repository') as string

  if (!videoFile || !repositoryUrl) {
    throw new Error('Missing video file or repository URL')
  }

  // Validate file size (50MB max for Supabase free tier)
  const maxSize = 50 * 1024 * 1024
  if (videoFile.size > maxSize) {
    throw new Error('Video file must be less than 50MB')
  }

  // Generate unique filename
  const fileExt = videoFile.name.split('.').pop()
  const fileName = `${user.id}/${repositoryUrl.replace('/', '-')}-${Date.now()}.${fileExt}`

  try {
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-videos')
      .upload(fileName, videoFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Failed to upload video: ${uploadError.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('project-videos')
      .getPublicUrl(fileName)

    // Save video URL to database
    await saveProjectVideo(repositoryUrl, publicUrl)

    onProgress?.(100)

    revalidatePath('/dashboard')

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Error uploading video:', error)
    throw error
  }
}

export async function getProjectScript(repositoryUrl: string, scriptType?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  let query = supabase
    .from('narrative_scripts')
    .select('*')
    .eq('user_id', user.id)
    .eq('repository_url', repositoryUrl)

  // If scriptType specified, filter by it
  if (scriptType) {
    query = query.eq('script_type', scriptType)
  }

  const { data: script, error } = await query
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching script:', error)
    return null
  }

  return script
}

/**
 * Get all scripts for a project (both User Journey and Technical Architecture if they exist)
 */
export async function getProjectScripts(repositoryUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  console.log('[getProjectScripts] Fetching scripts for repository:', repositoryUrl)
  console.log('[getProjectScripts] User ID:', user.id)

  const { data: scripts, error } = await supabase
    .from('narrative_scripts')
    .select('*')
    .eq('user_id', user.id)
    .eq('repository_url', repositoryUrl)
    .order('script_type', { ascending: true }) // user_journey comes before technical_architecture
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getProjectScripts] Error fetching scripts:', error)
    return []
  }

  console.log('[getProjectScripts] Found', scripts?.length || 0, 'script(s)')
  if (scripts && scripts.length > 0) {
    scripts.forEach((s, i) => {
      console.log(`  [${i + 1}] Type: ${s.script_type || 'NULL'}, Repo: ${s.repository_url}`)
    })
  }

  return scripts || []
}

/**
 * Maps draft metric type to impact metric type
 */
function mapDraftMetricType(draftType: 'impact' | 'technical' | 'business'): 'issues_resolved' | 'performance' | 'users' | 'quality' | 'features' {
  // Map based on common patterns
  switch (draftType) {
    case 'impact':
      return 'users'
    case 'technical':
      return 'performance'
    case 'business':
      return 'features'
    default:
      return 'quality'
  }
}

/**
 * Extracts numeric value from string (e.g., "60% reduction" -> 60, "10K+ users" -> 10000)
 */
function extractNumericValue(valueString: string): number {
  // Remove common formatting
  const cleaned = valueString.replace(/,/g, '').toLowerCase()

  // Try to extract percentage
  const percentMatch = cleaned.match(/(\d+\.?\d*)%/)
  if (percentMatch) {
    return parseFloat(percentMatch[1])
  }

  // Try to extract K (thousands)
  const kMatch = cleaned.match(/(\d+\.?\d*)k/)
  if (kMatch) {
    return parseFloat(kMatch[1]) * 1000
  }

  // Try to extract M (millions)
  const mMatch = cleaned.match(/(\d+\.?\d*)m/)
  if (mMatch) {
    return parseFloat(mMatch[1]) * 1000000
  }

  // Try to extract any number
  const numberMatch = cleaned.match(/(\d+\.?\d*)/)
  if (numberMatch) {
    return parseFloat(numberMatch[1])
  }

  // Default to 1 if no number found
  return 1
}

/**
 * Gets icon for metric type
 */
function getMetricIcon(type: 'issues_resolved' | 'performance' | 'users' | 'quality' | 'features'): string {
  switch (type) {
    case 'issues_resolved':
      return '🐛'
    case 'performance':
      return '⚡'
    case 'users':
      return '👥'
    case 'quality':
      return '✨'
    case 'features':
      return '🚀'
    default:
      return '📊'
  }
}

/**
 * Approve draft content and transition to 'new' status
 * Also populates impact_cache with approved metrics
 */
export async function approveDraft(
  repoId: string,
  approvedData: { title: boolean; tldr: boolean; metrics: boolean[] }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get current draft data and repository info
  const { data: repo, error: fetchError } = await supabase
    .from('user_repositories')
    .select('draft_data, repo_owner, repo_name')
    .eq('id', repoId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !repo || !repo.draft_data) {
    throw new Error('Repository not found or no draft data')
  }

  const repoFullName = `${repo.repo_owner}/${repo.repo_name}`

  // Update draft data with user approval
  const updatedDraftData = {
    ...repo.draft_data,
    userApproved: approvedData
  }

  // Extract selected metrics
  const selectedMetrics = repo.draft_data.metrics.filter(
    (_: unknown, index: number) => approvedData.metrics[index]
  )

  // Convert draft metrics to impact metrics format
  const impactMetrics = selectedMetrics.map((metric: {
    id: string;
    type: 'impact' | 'technical' | 'business';
    title: string;
    description: string;
    value: string;
    confidence: string;
    source: string;
  }) => {
    const mappedType = mapDraftMetricType(metric.type)
    return {
      id: metric.id,
      type: mappedType,
      title: metric.title,
      description: metric.description,
      value: extractNumericValue(metric.value),
      icon: getMetricIcon(mappedType),
      trend: 'up' as const,
      source: metric.source,
      confidence: metric.confidence,
    }
  })

  // Prepare repo_data with title and tldr
  const repoData = {
    title: repo.draft_data.title,
    tldr: repo.draft_data.tldr,
    approvedAt: new Date().toISOString(),
  }

  // Upsert into impact_cache
  const { error: cacheError } = await supabase
    .from('impact_cache')
    .upsert({
      user_id: user.id,
      repo_full_name: repoFullName,
      repo_data: repoData,
      impact_metrics: impactMetrics,
      cached_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    }, {
      onConflict: 'user_id,repo_full_name'
    })

  if (cacheError) {
    console.error('Error updating impact cache:', cacheError)
    // Don't fail the whole operation, just log the error
  }

  // Update repository status to 'new' and save approval
  const { error } = await supabase
    .from('user_repositories')
    .update({
      status: 'new',
      draft_data: updatedDraftData
    })
    .eq('id', repoId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error approving draft:', error)
    throw new Error('Failed to approve draft')
  }

  revalidatePath('/dashboard')
}

/**
 * Discard draft content and reset to 'new' status
 */
export async function discardDraft(repoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('user_repositories')
    .update({
      status: 'new',
      draft_data: null
    })
    .eq('id', repoId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error discarding draft:', error)
    throw new Error('Failed to discard draft')
  }

  revalidatePath('/dashboard')
}

/**
 * Update a specific field in draft data
 */
export async function updateDraftField(
  repoId: string,
  field: 'title' | 'tldr',
  value: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get current draft data
  const { data: repo, error: fetchError } = await supabase
    .from('user_repositories')
    .select('draft_data')
    .eq('id', repoId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !repo || !repo.draft_data) {
    throw new Error('Draft data not found')
  }

  // Update the specific field
  const updatedDraftData = {
    ...repo.draft_data,
    [field]: value
  }

  const { error } = await supabase
    .from('user_repositories')
    .update({
      draft_data: updatedDraftData
    })
    .eq('id', repoId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating draft field:', error)
    throw new Error('Failed to update draft')
  }

  revalidatePath('/dashboard')
}

/**
 * Update a specific metric in draft data
 */
export async function updateDraftMetric(
  repoId: string,
  metricId: string,
  updates: Partial<{ title: string; description: string; value: string }>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get current draft data
  const { data: repo, error: fetchError } = await supabase
    .from('user_repositories')
    .select('draft_data')
    .eq('id', repoId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !repo || !repo.draft_data) {
    throw new Error('Draft data not found')
  }

  // Update the specific metric
  const updatedMetrics = repo.draft_data.metrics.map((metric: { id: string }) =>
    metric.id === metricId ? { ...metric, ...updates } : metric
  )

  const updatedDraftData = {
    ...repo.draft_data,
    metrics: updatedMetrics
  }

  const { error } = await supabase
    .from('user_repositories')
    .update({
      draft_data: updatedDraftData
    })
    .eq('id', repoId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating draft metric:', error)
    throw new Error('Failed to update metric')
  }

  revalidatePath('/dashboard')
}

/**
 * Generate and save architecture diagram for a project
 */
export async function generateAndSaveArchitectureDiagram(projectId: string, userInstruction?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  try {
    // Get project info
    const { data: project } = await supabase
      .from('user_repositories')
      .select('id, repo_owner, repo_name, draft_data')
      .eq('user_id', user.id)
      .eq('id', projectId)
      .single()

    if (!project) {
      throw new Error('Project not found')
    }

    const owner = project.repo_owner
    const repo = project.repo_name
    const repositoryUrl = `${owner}/${repo}`

    // Get GitHub token
    let githubToken: string | null = null
    const { data: tokenData } = await supabase
      .from('github_tokens')
      .select('encrypted_token, encryption_iv')
      .eq('user_id', user.id)
      .single()

    if (tokenData?.encrypted_token && tokenData?.encryption_iv) {
      const { decryptToken } = await import('@/lib/encryption/crypto')
      try {
        githubToken = await decryptToken({
          encrypted: tokenData.encrypted_token,
          iv: tokenData.encryption_iv,
        })
      } catch (error) {
        console.error('Failed to decrypt GitHub token:', error)
      }
    }

    // Fetch README
    const { fetchGitHubReadme } = await import('@/features/portfolio/api/github-readme')
    const readmeContent = await fetchGitHubReadme(owner, repo, githubToken || undefined)

    // Get title and description from draft data if available
    const draftData = project.draft_data as { title?: string; tldr?: string } | null
    const projectTitle = draftData?.title || `${owner}/${repo}`
    const description = draftData?.tldr || `${repo} architecture`

    // Generate diagram using existing portfolio API
    const { generateArchitectureDiagram } = await import('@/features/portfolio/api/actions')
    const result = await generateArchitectureDiagram(
      repositoryUrl,
      description,
      readmeContent || '',
      undefined,
      githubToken || undefined,
      userInstruction
    )

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to generate diagram')
    }

    const diagram = result.data

    // Save to database
    const { error: saveError } = await supabase
      .from('architecture_diagrams')
      .upsert({
        user_id: user.id,
        project_id: projectId,
        mermaid_code: diagram.mermaidCode,
        diagram_type: diagram.type,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'project_id'
      })

    if (saveError) {
      console.error('Error saving diagram:', saveError)
      throw new Error('Failed to save diagram')
    }

    revalidatePath('/dashboard')

    return {
      success: true,
      data: diagram,
    }
  } catch (error) {
    console.error('Error generating architecture diagram:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate diagram',
    }
  }
}

/**
 * Get saved architecture diagram for a project
 */
export async function getArchitectureDiagram(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('architecture_diagrams')
    .select('*')
    .eq('user_id', user.id)
    .eq('project_id', projectId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    mermaidCode: data.mermaid_code,
    type: data.diagram_type as 'flowchart' | 'sequence' | 'class' | 'architecture',
  }
}
