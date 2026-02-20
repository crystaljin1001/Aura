/**
 * GitHub Context Fetcher
 * Fetches rich technical context for AI analysis
 */

interface GitHubTreeNode {
  path: string
  mode: string
  type: string
  size?: number
  sha: string
  url: string
}

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  stats?: {
    additions: number
    deletions: number
    total: number
  }
}

export interface TechnicalContext {
  packageJson: string | null
  fileTree: string | null
  significantCommits: string | null
  techStack: string[]
}

/**
 * Fetches package.json content
 */
async function fetchPackageJson(
  owner: string,
  repo: string,
  token?: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
      {
        headers: {
          Accept: 'application/vnd.github.v3.raw',
          ...(token && { Authorization: `token ${token}` }),
        },
      }
    )

    if (!response.ok) return null
    return await response.text()
  } catch {
    return null
  }
}

/**
 * Fetches repository file tree (limited depth)
 */
async function fetchFileTree(
  owner: string,
  repo: string,
  token?: string
): Promise<string | null> {
  try {
    // Get default branch first
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(token && { Authorization: `token ${token}` }),
        },
      }
    )

    if (!repoResponse.ok) return null
    const repoData = await repoResponse.json()
    const defaultBranch = repoData.default_branch || 'main'

    // Get tree
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(token && { Authorization: `token ${token}` }),
        },
      }
    )

    if (!treeResponse.ok) return null
    const treeData = await treeResponse.json()
    const tree = treeData.tree as GitHubTreeNode[]

    // Filter and format tree (exclude node_modules, .git, etc.)
    const relevantFiles = tree
      .filter((node) => {
        const path = node.path.toLowerCase()
        return (
          node.type === 'blob' &&
          !path.includes('node_modules') &&
          !path.includes('.git') &&
          !path.includes('dist') &&
          !path.includes('build') &&
          !path.startsWith('.') &&
          !path.includes('package-lock') &&
          !path.includes('yarn.lock')
        )
      })
      .slice(0, 200) // Limit to first 200 files

    // Group by directory
    const dirStructure: Record<string, string[]> = {}
    relevantFiles.forEach((file) => {
      const parts = file.path.split('/')
      const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : 'root'
      if (!dirStructure[dir]) dirStructure[dir] = []
      dirStructure[dir].push(parts[parts.length - 1])
    })

    // Format as tree string
    let treeString = 'Project Structure:\n'
    Object.entries(dirStructure)
      .sort()
      .forEach(([dir, files]) => {
        treeString += `\n${dir}/\n`
        files.forEach((file) => {
          treeString += `  - ${file}\n`
        })
      })

    return treeString
  } catch {
    return null
  }
}

/**
 * Fetches significant commits (largest changes)
 */
async function fetchSignificantCommits(
  owner: string,
  repo: string,
  token?: string
): Promise<string | null> {
  try {
    // Get recent commits
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(token && { Authorization: `token ${token}` }),
        },
      }
    )

    if (!response.ok) return null
    const commits = (await response.json()) as GitHubCommit[]

    // Fetch stats for each commit (expensive, so limit to top 10)
    const commitsWithStats = await Promise.all(
      commits.slice(0, 10).map(async (commit) => {
        try {
          const detailResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/commits/${commit.sha}`,
            {
              headers: {
                Accept: 'application/vnd.github.v3+json',
                ...(token && { Authorization: `token ${token}` }),
              },
            }
          )
          if (!detailResponse.ok) return { ...commit, stats: { total: 0 } }
          const detail = await detailResponse.json()
          return { ...commit, stats: detail.stats }
        } catch {
          return { ...commit, stats: { total: 0 } }
        }
      })
    )

    // Sort by total changes and get top 5
    const significant = commitsWithStats
      .filter((c) => c.stats && c.stats.total > 0)
      .sort((a, b) => (b.stats?.total || 0) - (a.stats?.total || 0))
      .slice(0, 5)

    if (significant.length === 0) return null

    // Format commits
    let commitsString = 'Significant Commits (by code changes):\n\n'
    significant.forEach((commit, i) => {
      commitsString += `${i + 1}. ${commit.commit.message.split('\n')[0]}\n`
      commitsString += `   Author: ${commit.commit.author.name}\n`
      commitsString += `   Date: ${new Date(commit.commit.author.date).toLocaleDateString()}\n`
      if (commit.stats) {
        commitsString += `   Changes: +${commit.stats.additions || 0} -${commit.stats.deletions || 0}\n`
      }
      commitsString += '\n'
    })

    return commitsString
  } catch {
    return null
  }
}

/**
 * Extracts tech stack from package.json
 */
function extractTechStack(packageJson: string): string[] {
  try {
    const pkg = JSON.parse(packageJson)
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    const techStack: string[] = []

    // Common frameworks and libraries
    const frameworks: Record<string, string> = {
      next: 'Next.js',
      react: 'React',
      vue: 'Vue.js',
      angular: '@angular/core',
      svelte: 'Svelte',
      express: 'Express',
      fastify: 'Fastify',
      nestjs: '@nestjs/core',
    }

    // Database & ORM
    const databases: Record<string, string> = {
      prisma: 'Prisma',
      mongoose: 'Mongoose',
      typeorm: 'TypeORM',
      sequelize: 'Sequelize',
      '@supabase/supabase-js': 'Supabase',
    }

    // UI Libraries
    const uiLibs: Record<string, string> = {
      '@radix-ui': 'Radix UI',
      'shadcn-ui': 'shadcn/ui',
      '@mui/material': 'Material-UI',
      'framer-motion': 'Framer Motion',
      tailwindcss: 'Tailwind CSS',
    }

    // Check for each category
    Object.entries({ ...frameworks, ...databases, ...uiLibs }).forEach(([key, name]) => {
      if (Object.keys(deps).some((dep) => dep.includes(key))) {
        techStack.push(name)
      }
    })

    return techStack
  } catch {
    return []
  }
}

/**
 * Fetches all technical context for AI analysis
 */
export async function fetchTechnicalContext(
  owner: string,
  repo: string,
  token?: string
): Promise<TechnicalContext> {
  const [packageJson, fileTree, significantCommits] = await Promise.all([
    fetchPackageJson(owner, repo, token),
    fetchFileTree(owner, repo, token),
    fetchSignificantCommits(owner, repo, token),
  ])

  const techStack = packageJson ? extractTechStack(packageJson) : []

  return {
    packageJson,
    fileTree,
    significantCommits,
    techStack,
  }
}
