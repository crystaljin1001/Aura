/**
 * GitHub README Fetcher
 * Fetches README content from GitHub repositories
 */

interface GitHubReadmeResponse {
  content: string
  encoding: string
}

/**
 * Fetches README content from a GitHub repository
 */
export async function fetchGitHubReadme(
  owner: string,
  repo: string,
  githubToken?: string
): Promise<string | null> {
  try {
    // Try to fetch README.md
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(githubToken && {
            Authorization: `token ${githubToken}`,
          }),
        },
        next: {
          revalidate: 3600, // Cache for 1 hour
        },
      }
    )

    if (!response.ok) {
      console.error(`Failed to fetch README for ${owner}/${repo}:`, response.status)
      return null
    }

    const data: GitHubReadmeResponse = await response.json()

    // Decode base64 content
    if (data.encoding === 'base64') {
      const decoded = Buffer.from(data.content, 'base64').toString('utf-8')
      return decoded
    }

    return data.content
  } catch (error) {
    console.error(`Error fetching README for ${owner}/${repo}:`, error)
    return null
  }
}
