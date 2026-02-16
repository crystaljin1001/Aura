'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Project, ProjectStatus } from './types'

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
    .select('project_name, repository_url')
    .eq('user_id', user.id)

  if (scriptsError) {
    console.error('Error fetching scripts:', scriptsError)
  }

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
  const repoUrls = repos.map(r => r.full_name)
  const { data: impactCache } = await supabase
    .from('impact_cache')
    .select('*')
    .in('repository_url', repoUrls)

  // Combine data and determine status
  return repos.map(repo => {
    const repoUrl = `${repo.repo_owner}/${repo.repo_name}`
    const hasScript = scripts?.some(s => s.repository_url === repoUrl) || false
    const hasVideo = videos?.some(v => v.repository_url === repoUrl) || false
    const hasDomain = domains?.some(d => d.repository_url === repoUrl && d.is_active) || false

    const video = videos?.find(v => v.repository_url === repoUrl)
    const domain = domains?.find(d => d.repository_url === repoUrl)
    const impact = impactCache?.find(c => c.repository_url === repoUrl)

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
    if (impact?.metrics) {
      const metrics = Array.isArray(impact.metrics) ? impact.metrics : []
      impactMetrics = {
        criticalIssuesResolved: metrics.find((m: any) => m.type === 'issues_resolved')?.value || 0,
        performanceOptimizations: metrics.find((m: any) => m.type === 'performance')?.value || 0,
        userAdoption: metrics.find((m: any) => m.type === 'users')?.value || 0,
        codeQualityImprovements: metrics.find((m: any) => m.type === 'quality')?.value || 0,
        featuresDelivered: metrics.find((m: any) => m.type === 'features')?.value || 0
      }
    }

    return {
      id: repo.id,
      name: repo.repo_name,
      repository: repoUrl,
      description: null, // Not stored in user_repositories table
      status,
      hasScript,
      hasVideo,
      hasDomain,
      stars: 0, // Will be fetched from impact cache
      forks: 0, // Will be fetched from impact cache
      language: null, // Will be fetched from impact cache
      videoUrl: video?.video_url,
      videoThumbnail: video?.thumbnail_url,
      domainUrl: domain?.domain,
      impactMetrics,
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

export async function getProjectScript(repositoryUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: script, error } = await supabase
    .from('narrative_scripts')
    .select('*')
    .eq('user_id', user.id)
    .eq('repository_url', repositoryUrl)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching script:', error)
    return null
  }

  return script
}
