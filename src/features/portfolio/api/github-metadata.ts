'use server'

/**
 * GitHub Repository Metadata Fetcher
 *
 * Fetches repository metadata for completeness checking:
 * - README length
 * - File existence (.env.example, LICENSE, .gitignore)
 * - Tests detection
 */

import { Octokit } from '@octokit/rest'
import { createClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/encryption/crypto'

export interface RepositoryMetadata {
  hasReadme: boolean
  readmeLength: number
  hasEnvExample: boolean
  hasLicense: boolean
  hasGitignore: boolean
  hasTests: boolean
  lastChecked: Date
}

/**
 * Gets GitHub token for the authenticated user
 */
async function getGitHubToken(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('github_tokens')
    .select('encrypted_token, encryption_iv')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return null
  }

  try {
    const token = decryptToken({
      encrypted: data.encrypted_token,
      iv: data.encryption_iv,
    })
    return token
  } catch {
    return null
  }
}

/**
 * Checks if a file exists in the repository
 */
async function fileExists(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string
): Promise<boolean> {
  try {
    await octokit.repos.getContent({
      owner,
      repo,
      path,
    })
    return true
  } catch {
    return false
  }
}

/**
 * Gets README content and length
 */
async function getReadmeInfo(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<{ exists: boolean; length: number }> {
  try {
    const { data } = await octokit.repos.getReadme({
      owner,
      repo,
    })

    if ('content' in data && data.content) {
      // Content is base64 encoded
      const content = Buffer.from(data.content, 'base64').toString('utf-8')
      return { exists: true, length: content.length }
    }

    return { exists: false, length: 0 }
  } catch {
    return { exists: false, length: 0 }
  }
}

/**
 * Checks for test files/folders
 */
async function hasTestFiles(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<boolean> {
  // Check common test directories
  const testPaths = [
    'test',
    'tests',
    '__tests__',
    'spec',
    'src/test',
    'src/tests',
    'src/__tests__',
  ]

  for (const path of testPaths) {
    try {
      await octokit.repos.getContent({
        owner,
        repo,
        path,
      })
      return true
    } catch {
      // Continue checking other paths
    }
  }

  // Check root directory for common test file patterns
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: '',
    })

    if (Array.isArray(data)) {
      const hasTestFile = data.some(
        (item) =>
          item.name.includes('.test.') ||
          item.name.includes('.spec.') ||
          item.name === 'jest.config.js' ||
          item.name === 'vitest.config.ts' ||
          item.name === 'playwright.config.ts'
      )
      return hasTestFile
    }
  } catch {
    // Ignore errors
  }

  return false
}

/**
 * Fetches repository metadata for completeness checking
 */
export async function fetchRepositoryMetadata(
  owner: string,
  repo: string
): Promise<RepositoryMetadata | null> {
  try {
    // Get GitHub token
    const token = await getGitHubToken()
    if (!token) {
      console.warn('No GitHub token found for metadata fetching')
      return null
    }

    const octokit = new Octokit({ auth: token })

    // Fetch all metadata in parallel
    const [readmeInfo, hasEnvExample, hasLicense, hasGitignore, hasTests] =
      await Promise.all([
        getReadmeInfo(octokit, owner, repo),
        fileExists(octokit, owner, repo, '.env.example'),
        // Check multiple license file names
        Promise.any([
          fileExists(octokit, owner, repo, 'LICENSE'),
          fileExists(octokit, owner, repo, 'LICENSE.md'),
          fileExists(octokit, owner, repo, 'LICENSE.txt'),
          fileExists(octokit, owner, repo, 'LICENCE'),
        ]).catch(() => false),
        fileExists(octokit, owner, repo, '.gitignore'),
        hasTestFiles(octokit, owner, repo),
      ])

    return {
      hasReadme: readmeInfo.exists,
      readmeLength: readmeInfo.length,
      hasEnvExample,
      hasLicense: hasLicense as boolean,
      hasGitignore,
      hasTests,
      lastChecked: new Date(),
    }
  } catch (error) {
    console.error('Error fetching repository metadata:', error)
    return null
  }
}

/**
 * Stores repository metadata in database for caching
 */
export async function cacheRepositoryMetadata(
  repositoryUrl: string,
  metadata: RepositoryMetadata
): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  // Store in impact_cache table (extend existing structure)
  await supabase
    .from('impact_cache')
    .update({
      repository_metadata: metadata,
      last_updated: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('repository_url', repositoryUrl)
}
