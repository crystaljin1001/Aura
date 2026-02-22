'use server'

/**
 * Fetch code snippet from GitHub
 * Uses GitHub API to retrieve file content
 */

import { parseGitHubPermalink } from '@/lib/github/parse-permalink'

export interface CodeSnippet {
  code: string
  language: string
  startLine: number
  endLine: number
  fileUrl: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Fetch code snippet from GitHub permalink
 */
export async function fetchGitHubCode(url: string): Promise<ApiResponse<CodeSnippet>> {
  try {
    // Parse the GitHub URL
    const parsed = parseGitHubPermalink(url)
    if (!parsed) {
      return {
        success: false,
        error: 'Invalid GitHub URL format',
      }
    }

    // Fetch raw file content from GitHub
    const rawUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${parsed.branch}/${parsed.path}`

    const response = await fetch(rawUrl, {
      headers: {
        'User-Agent': 'Aura-Portfolio',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch file: ${response.status} ${response.statusText}`,
      }
    }

    const fullContent = await response.text()
    const lines = fullContent.split('\n')

    // Extract specified lines or show context around them
    const startLine = parsed.startLine || 1
    const endLine = parsed.endLine || Math.min(startLine + 20, lines.length)

    // Add context: 3 lines before and after
    const contextStart = Math.max(1, startLine - 3)
    const contextEnd = Math.min(lines.length, endLine + 3)

    const codeLines = lines.slice(contextStart - 1, contextEnd)
    const code = codeLines.join('\n')

    // Detect language from file extension
    const language = detectLanguage(parsed.path)

    return {
      success: true,
      data: {
        code,
        language,
        startLine: contextStart,
        endLine: contextEnd,
        fileUrl: url,
      },
    }
  } catch (error) {
    console.error('Error fetching GitHub code:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch code',
    }
  }
}

/**
 * Detect programming language from file path
 */
function detectLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()

  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    java: 'java',
    go: 'go',
    rs: 'rust',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    rb: 'ruby',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    sql: 'sql',
    sh: 'bash',
    yml: 'yaml',
    yaml: 'yaml',
    json: 'json',
    md: 'markdown',
    html: 'html',
    css: 'css',
    scss: 'scss',
  }

  return languageMap[ext || ''] || 'plaintext'
}
