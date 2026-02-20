/**
 * GitHub Permalink Generator
 *
 * Generates GitHub source permalinks from file paths with line number support
 */

export interface PermalinkConfig {
  owner: string
  repo: string
  branch?: string // Default to main/master
  filePath: string
  startLine?: number
  endLine?: number
}

export interface FileLocation {
  filePath: string
  lineNumber: number
}

/**
 * Generates a GitHub permalink to a specific file or line range
 *
 * @example
 * generateGitHubPermalink({
 *   owner: 'facebook',
 *   repo: 'react',
 *   filePath: 'src/index.js',
 *   startLine: 10,
 *   endLine: 20
 * })
 * // Returns: https://github.com/facebook/react/blob/main/src/index.js#L10-L20
 */
export function generateGitHubPermalink(config: PermalinkConfig): string {
  const {
    owner,
    repo,
    branch = 'main',
    filePath,
    startLine,
    endLine,
  } = config

  // Clean file path (remove leading slash)
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath

  // Base URL
  let url = `https://github.com/${owner}/${repo}/blob/${branch}/${cleanPath}`

  // Add line numbers if provided
  if (startLine !== undefined) {
    if (endLine !== undefined && endLine !== startLine) {
      url += `#L${startLine}-L${endLine}`
    } else {
      url += `#L${startLine}`
    }
  }

  return url
}

/**
 * Parses a GitHub URL to extract permalink components
 *
 * @example
 * parseGitHubPermalink('https://github.com/facebook/react/blob/main/src/index.js#L10-L20')
 * // Returns: { owner: 'facebook', repo: 'react', branch: 'main', filePath: 'src/index.js', startLine: 10, endLine: 20 }
 */
export function parseGitHubPermalink(url: string): PermalinkConfig | null {
  try {
    const urlObj = new URL(url)

    // Check if it's a GitHub URL
    if (urlObj.hostname !== 'github.com') {
      return null
    }

    // Parse path: /owner/repo/blob/branch/file/path#L10-L20
    const pathParts = urlObj.pathname.split('/')
    if (pathParts.length < 5 || pathParts[3] !== 'blob') {
      return null
    }

    const owner = pathParts[1]
    const repo = pathParts[2]
    const branch = pathParts[4]
    const filePath = pathParts.slice(5).join('/')

    // Parse line numbers from hash
    let startLine: number | undefined
    let endLine: number | undefined

    if (urlObj.hash) {
      const lineMatch = urlObj.hash.match(/^#L(\d+)(?:-L(\d+))?$/)
      if (lineMatch) {
        startLine = parseInt(lineMatch[1], 10)
        if (lineMatch[2]) {
          endLine = parseInt(lineMatch[2], 10)
        }
      }
    }

    return {
      owner,
      repo,
      branch,
      filePath,
      startLine,
      endLine,
    }
  } catch {
    return null
  }
}

/**
 * Validates a GitHub permalink
 */
export function isValidGitHubPermalink(url: string): boolean {
  return parseGitHubPermalink(url) !== null
}

/**
 * Searches for a specific term in repository files and returns location
 * Note: This requires GitHub API access with authentication
 */
export async function findImplementationLine(
  owner: string,
  repo: string,
  searchTerm: string,
  token: string,
  branch = 'main'
): Promise<FileLocation | null> {
  try {
    // Use GitHub Code Search API
    const searchUrl = `https://api.github.com/search/code?q=${encodeURIComponent(searchTerm)}+repo:${owner}/${repo}`

    const response = await fetch(searchUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      console.error('GitHub search failed:', response.status)
      return null
    }

    const data = await response.json()

    if (data.items && data.items.length > 0) {
      const firstResult = data.items[0]
      const filePath = firstResult.path

      // Fetch file content to find exact line number
      const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`
      const fileResponse = await fetch(fileUrl, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3.raw',
        },
      })

      if (fileResponse.ok) {
        const content = await fileResponse.text()
        const lines = content.split('\n')
        const lineNumber = lines.findIndex(line => line.includes(searchTerm)) + 1

        if (lineNumber > 0) {
          return {
            filePath,
            lineNumber,
          }
        }
      }

      // Return without line number if file content fetch fails
      return {
        filePath,
        lineNumber: 1,
      }
    }

    return null
  } catch (error) {
    console.error('Error finding implementation line:', error)
    return null
  }
}

/**
 * Generates a permalink from a search term
 */
export async function generatePermalinkFromSearch(
  owner: string,
  repo: string,
  searchTerm: string,
  token: string,
  branch = 'main'
): Promise<string | null> {
  const location = await findImplementationLine(owner, repo, searchTerm, token, branch)

  if (!location) {
    return null
  }

  return generateGitHubPermalink({
    owner,
    repo,
    branch,
    filePath: location.filePath,
    startLine: location.lineNumber,
    endLine: location.lineNumber + 10, // Show 10 lines of context
  })
}

/**
 * Fetches code snippet from a GitHub permalink
 * Useful for displaying code previews
 */
export async function fetchCodeSnippet(
  permalink: string,
  token: string,
  contextLines = 5
): Promise<{ code: string; language: string } | null> {
  try {
    const parsed = parseGitHubPermalink(permalink)
    if (!parsed) {
      return null
    }

    const { owner, repo, branch, filePath, startLine } = parsed

    // Fetch file content
    const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`
    const response = await fetch(fileUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3.raw',
      },
    })

    if (!response.ok) {
      return null
    }

    const content = await response.text()
    const lines = content.split('\n')

    // Extract snippet with context
    if (startLine !== undefined) {
      const start = Math.max(0, startLine - 1 - contextLines)
      const end = Math.min(lines.length, startLine + contextLines)
      const snippet = lines.slice(start, end).join('\n')

      // Detect language from file extension
      const ext = filePath.split('.').pop() || ''
      const languageMap: Record<string, string> = {
        js: 'javascript',
        jsx: 'javascript',
        ts: 'typescript',
        tsx: 'typescript',
        py: 'python',
        go: 'go',
        rs: 'rust',
        java: 'java',
        rb: 'ruby',
        cpp: 'cpp',
        c: 'c',
        cs: 'csharp',
        php: 'php',
        swift: 'swift',
        kt: 'kotlin',
        md: 'markdown',
        json: 'json',
        yaml: 'yaml',
        yml: 'yaml',
        css: 'css',
        scss: 'scss',
        html: 'html',
      }

      return {
        code: snippet,
        language: languageMap[ext] || 'text',
      }
    }

    // Return first 20 lines if no specific line specified
    return {
      code: lines.slice(0, 20).join('\n'),
      language: 'text',
    }
  } catch (error) {
    console.error('Error fetching code snippet:', error)
    return null
  }
}
