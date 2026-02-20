'use server'

/**
 * Diagnostic actions to debug GitHub API issues
 */

import { createClient } from '@/lib/supabase/server'
import { AuthenticationError } from '@/utils/errors'
import type { ApiResponse } from '@/types'

interface RepoCheck {
  repository: string
  existsInDb: boolean
  githubStatus: 'success' | 'not_found' | 'unauthorized' | 'error'
  githubMessage?: string
  actualName?: string
  isPrivate?: boolean
  stars?: number
}

async function getUserToken(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('github_tokens')
    .select('encrypted_token, encryption_iv')
    .eq('user_id', user.id)
    .single()

  if (error || !data) return null

  // Import encryption dynamically
  const { decryptToken } = await import('@/lib/encryption/crypto')
  return decryptToken({
    encrypted: data.encrypted_token,
    iv: data.encryption_iv,
  })
}

export async function checkRepositories(): Promise<ApiResponse<RepoCheck[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new AuthenticationError('Not authenticated')
    }

    // Get stored repositories
    const { data: repos, error: reposError } = await supabase
      .from('user_repositories')
      .select('repo_owner, repo_name')
      .eq('user_id', user.id)

    if (reposError) {
      return { success: false, error: reposError.message }
    }

    if (!repos || repos.length === 0) {
      return {
        success: true,
        data: [],
      }
    }

    // Get GitHub token
    const token = await getUserToken()

    const results: RepoCheck[] = []

    for (const repo of repos) {
      const repoPath = `${repo.repo_owner}/${repo.repo_name}`

      const check: RepoCheck = {
        repository: repoPath,
        existsInDb: true,
        githubStatus: 'error',
      }

      if (!token) {
        check.githubStatus = 'unauthorized'
        check.githubMessage = 'No GitHub token found'
        results.push(check)
        continue
      }

      // Check if repository exists on GitHub
      try {
        const response = await fetch(
          `https://api.github.com/repos/${repoPath}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28',
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          check.githubStatus = 'success'
          check.actualName = data.full_name
          check.isPrivate = data.private
          check.stars = data.stargazers_count
          check.githubMessage = `✅ Found: ${data.full_name} (${data.private ? 'private' : 'public'}, ${data.stargazers_count} stars)`
        } else if (response.status === 404) {
          check.githubStatus = 'not_found'
          check.githubMessage = `❌ Repository not found on GitHub. Check if it exists, is spelled correctly, or has been deleted.`
        } else if (response.status === 401 || response.status === 403) {
          check.githubStatus = 'unauthorized'
          const errorData = await response.json().catch(() => ({}))
          check.githubMessage = `🔒 Access denied: ${(errorData as any).message || 'Token may not have correct permissions'}`
        } else {
          check.githubStatus = 'error'
          check.githubMessage = `⚠️ HTTP ${response.status}: ${response.statusText}`
        }
      } catch (error) {
        check.githubStatus = 'error'
        check.githubMessage = `⚠️ Network error: ${error instanceof Error ? error.message : 'Unknown'}`
      }

      results.push(check)
    }

    return {
      success: true,
      data: results,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
