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
    const description = repoData?.description as string | undefined
    const language = repoData?.language as string | undefined
    const readmeLength = repoData?.readmeLength as number | undefined

    let status: ProjectStatus = 'new'
    if (hasDomain) {
      status = 'deployed'
    } else if (hasVideo) {
      status = 'video_ready'
    } else if (hasScript) {
      status = 'script_ready'
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
      name: repo.repo_name,
      repository: repoUrl,
      description: undefined, // Not stored in user_repositories table
      status,
      hasScript,
      hasVideo,
      hasDomain,
      stars: 0, // Will be fetched from impact cache
      forks: 0, // Will be fetched from impact cache
      language: undefined, // Will be fetched from impact cache
      videoUrl: video?.video_url,
      videoThumbnail: video?.thumbnail_url,
      domainUrl: domain?.domain,
      impactMetrics,
      completeness: completenessStats,
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

  // Insert repository
  const { error } = await supabase
    .from('user_repositories')
    .insert({
      user_id: user.id,
      repo_owner: owner,
      repo_name: repo
    })

  if (error) {
    console.error('Error adding repository:', error)
    throw new Error('Failed to add repository')
  }

  revalidatePath('/dashboard')
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Delete repository (cascade will handle related records)
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
