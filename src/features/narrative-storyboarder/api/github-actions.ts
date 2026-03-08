'use server';

/**
 * GitHub integration for Narrative Storyboarder
 */

import { createClient } from '@/lib/supabase/server';
import { decryptToken } from '@/lib/encryption/crypto';
import { AuthenticationError, ValidationError } from '@/utils/errors';
import type { ApiResponse } from '@/types';
import { getOpenAIClient, HERO_COMMIT_FILTER_PROMPT } from '@/lib/ai/openai';

/**
 * Gets the authenticated user or throws error
 */
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthenticationError('You must be signed in');
  }

  return user;
}

/**
 * Gets the user's decrypted GitHub token
 */
async function getUserToken(): Promise<string> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('github_tokens')
    .select('encrypted_token, encryption_iv')
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    throw new ValidationError(
      'No GitHub token found. Please add your token in the dashboard first.'
    );
  }

  return await decryptToken({
    encrypted: data.encrypted_token,
    iv: data.encryption_iv,
  });
}

/**
 * Fetches README content from a GitHub repository
 * Tries multiple common README filenames
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns ApiResponse with README content
 */
export async function fetchReadmeFromGitHub(
  owner: string,
  repo: string
): Promise<ApiResponse<string>> {
  try {
    // Get user's GitHub token
    const token = await getUserToken();

    // Try the default README endpoint first
    let response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.raw+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    // If 404, try common README variations
    if (response.status === 404) {
      const readmeVariations = [
        'README.md',
        'readme.md',
        'README',
        'readme',
        'README.txt',
        'Readme.md',
      ];

      for (const filename of readmeVariations) {
        response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${filename}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github.raw+json',
              'X-GitHub-Api-Version': '2022-11-28',
            },
          }
        );

        if (response.ok) {
          break; // Found one!
        }
      }
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new ValidationError(
          `README not found in ${owner}/${repo}. Tried default endpoint and common variations. You can write one manually.`
        );
      }
      if (response.status === 403) {
        throw new ValidationError(
          'Access denied. Check your GitHub token permissions.'
        );
      }
      if (response.status === 401) {
        throw new ValidationError(
          'Authentication failed. Your GitHub token may be invalid or expired.'
        );
      }
      throw new Error(`GitHub API error (${response.status}): ${response.statusText}`);
    }

    const readmeContent = await response.text();

    if (!readmeContent || readmeContent.trim().length === 0) {
      throw new ValidationError('README is empty');
    }

    return {
      success: true,
      data: readmeContent,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch README from GitHub',
    };
  }
}

/**
 * Fetches recent commit history from a GitHub repository
 * Analyzes commits for complexity metrics and technical insights
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param limit - Maximum number of commits to fetch (default: 100)
 * @returns ApiResponse with commit history data
 */
export async function fetchCommitHistory(
  owner: string,
  repo: string,
  limit: number = 100
): Promise<ApiResponse<CommitHistoryData>> {
  try {
    // Get user's GitHub token
    const token = await getUserToken();

    // Fetch recent commits
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new ValidationError(`Repository ${owner}/${repo} not found`);
      }
      if (response.status === 403) {
        throw new ValidationError('Access denied. Check your GitHub token permissions.');
      }
      throw new Error(`GitHub API error (${response.status}): ${response.statusText}`);
    }

    const commits = await response.json() as GitHubCommit[];

    // Analyze commit history for metrics
    const analysis = analyzeCommits(commits);

    return {
      success: true,
      data: analysis,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch commit history from GitHub',
    };
  }
}

/**
 * Fetches detailed commit metadata with diff stats (without full code)
 * Used for Hero Commit AI filtering
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param limit - Maximum number of commits to fetch (default: 50)
 * @returns ApiResponse with commit metadata including diff stats
 */
export async function fetchCommitMetadata(
  owner: string,
  repo: string,
  limit: number = 50
): Promise<ApiResponse<GitHubCommitDetailed[]>> {
  try {
    const token = await getUserToken();

    // Fetch recent commits (lightweight list)
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error (${response.status}): ${response.statusText}`);
    }

    const commits = await response.json() as GitHubCommit[];

    // Filter out merge commits and fetch detailed stats for remaining commits
    const meaningfulCommits = commits.filter((c) => {
      const message = c.commit.message.toLowerCase();
      return (
        !message.startsWith('merge ') &&
        !message.startsWith('merge pull request') &&
        message.length > 15
      );
    }).slice(0, 20); // Limit to top 20 to avoid rate limits

    // Fetch detailed stats for each commit (parallel requests)
    const detailedCommitsPromises = meaningfulCommits.map(async (commit) => {
      const detailResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits/${commit.sha}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        }
      );

      if (detailResponse.ok) {
        return detailResponse.json() as Promise<GitHubCommitDetailed>;
      }
      return null;
    });

    const detailedCommits = (await Promise.all(detailedCommitsPromises)).filter(
      (c): c is GitHubCommitDetailed => c !== null
    );

    return {
      success: true,
      data: detailedCommits,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch commit metadata from GitHub',
    };
  }
}

/**
 * Finds the "Hero Commit" using AI filtering
 * Analyzes commit metadata to identify the most impressive technical work
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns ApiResponse with hero commit candidates
 */
export async function findHeroCommit(
  owner: string,
  repo: string
): Promise<ApiResponse<HeroCommitCandidate[]>> {
  try {
    // Fetch commit metadata with diff stats
    const metadataResult = await fetchCommitMetadata(owner, repo, 50);

    if (!metadataResult.success || !metadataResult.data) {
      throw new Error(metadataResult.error || 'Failed to fetch commit metadata');
    }

    const commits = metadataResult.data;

    if (commits.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Build context for AI: lightweight commit metadata
    const commitContext = commits.map((c) => ({
      sha: c.sha.substring(0, 7),
      message: c.commit.message.split('\n')[0], // First line only
      author: c.commit.author?.name || 'Unknown',
      date: c.commit.author?.date || new Date().toISOString(),
      stats: {
        filesChanged: c.files?.length || 0,
        insertions: c.stats?.additions || 0,
        deletions: c.stats?.deletions || 0,
      },
      files: c.files?.map((f) => f.filename).slice(0, 10) || [], // Top 10 files only
    }));

    // Call OpenAI to filter and rank commits
    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: HERO_COMMIT_FILTER_PROMPT,
        },
        {
          role: 'user',
          content: `Analyze these commits and identify the top 3 "Hero Commit" candidates:\n\n${JSON.stringify(commitContext, null, 2)}\n\nRepository: ${owner}/${repo}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Low temperature for consistent filtering
      max_tokens: 2000,
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error('No response from AI');
    }

    // Parse AI response
    interface AIResponse {
      candidates: Array<{
        sha: string;
        confidence: 'high' | 'medium' | 'low';
        reasoning: string;
        keyFiles: string[];
        score?: number;
      }>;
    }

    const aiResult: AIResponse = JSON.parse(responseContent);

    // Map AI results back to full commit data
    const heroCandidates: HeroCommitCandidate[] = aiResult.candidates.map((candidate) => {
      const fullCommit = commits.find((c) => c.sha.startsWith(candidate.sha));

      if (!fullCommit) {
        throw new Error(`Commit ${candidate.sha} not found in fetched data`);
      }

      return {
        sha: fullCommit.sha,
        message: fullCommit.commit.message.split('\n')[0],
        date: fullCommit.commit.author?.date || new Date().toISOString(),
        author: fullCommit.commit.author?.name || 'Unknown',
        url: `https://github.com/${owner}/${repo}/commit/${fullCommit.sha}`,
        stats: {
          filesChanged: fullCommit.files?.length || 0,
          insertions: fullCommit.stats?.additions || 0,
          deletions: fullCommit.stats?.deletions || 0,
        },
        keyFiles: candidate.keyFiles,
        confidence: candidate.confidence,
        reasoning: candidate.reasoning,
      };
    });

    return {
      success: true,
      data: heroCandidates,
    };
  } catch (error) {
    console.error('[findHeroCommit] Error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to find hero commit',
    };
  }
}

/**
 * Fetches code snippet from hero commit for display in Studio Mode
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param commitSha - Commit SHA
 * @param filename - File to fetch from the commit
 * @returns ApiResponse with code snippet
 */
export async function fetchHeroCommitCode(
  owner: string,
  repo: string,
  commitSha: string,
  filename: string
): Promise<ApiResponse<HeroCommitCodeSnippet>> {
  try {
    const token = await getUserToken();

    // Fetch the specific file from the commit
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filename}?ref=${commitSha}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.raw+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const code = await response.text();

    // Detect language from file extension
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'tsx',
      js: 'javascript',
      jsx: 'jsx',
      py: 'python',
      go: 'go',
      rs: 'rust',
      java: 'java',
      rb: 'ruby',
      php: 'php',
      c: 'c',
      cpp: 'cpp',
      cs: 'csharp',
      swift: 'swift',
      kt: 'kotlin',
      scala: 'scala',
      sql: 'sql',
      yml: 'yaml',
      yaml: 'yaml',
      json: 'json',
      md: 'markdown',
    };

    const language = languageMap[extension] || 'typescript';
    const lineCount = code.split('\n').length;

    // Limit to first 100 lines for better display
    const displayCode = code.split('\n').slice(0, 100).join('\n');

    return {
      success: true,
      data: {
        filename,
        language,
        code: displayCode,
        lineCount,
      },
    };
  } catch (error) {
    console.error('[fetchHeroCommitCode] Error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch code snippet',
    };
  }
}

export interface CommitCodeSnippet {
  filename: string
  language: string
  code: string
  commitMessage: string
  filesChanged: number
}

/**
 * Fetches the most relevant changed file's code from a commit SHA.
 * Used in Chapter IV to show evidence code alongside decision trees.
 */
export async function fetchCommitCodeBySha(
  owner: string,
  repo: string,
  commitSha: string
): Promise<ApiResponse<CommitCodeSnippet>> {
  try {
    const token = await getUserToken()

    const commitRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    )

    if (!commitRes.ok) {
      return { success: false, error: `Failed to fetch commit: ${commitRes.statusText}` }
    }

    const commit = await commitRes.json()
    const files: Array<{ filename: string; additions: number; deletions: number }> = commit.files || []

    if (files.length === 0) {
      return { success: false, error: 'No files changed in this commit' }
    }

    const SKIP = /\.(lock|json|md|txt|env|yml|yaml|toml|gitignore)$|node_modules|dist\//
    const sourceFiles = files.filter(f => !SKIP.test(f.filename))
    const target = (sourceFiles.length > 0 ? sourceFiles : files)
      .sort((a, b) => (b.additions + b.deletions) - (a.additions + a.deletions))[0]

    const fileRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${target.filename}?ref=${commitSha}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.raw+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    )

    if (!fileRes.ok) {
      return { success: false, error: `Failed to fetch file: ${fileRes.statusText}` }
    }

    const code = await fileRes.text()
    const extMap: Record<string, string> = {
      ts: 'typescript', tsx: 'tsx', js: 'javascript', jsx: 'jsx',
      py: 'python', go: 'go', rs: 'rust', java: 'java',
      rb: 'ruby', php: 'php', c: 'c', cpp: 'cpp', cs: 'csharp',
      swift: 'swift', kt: 'kotlin', sql: 'sql',
    }
    const ext = target.filename.split('.').pop()?.toLowerCase() || ''

    return {
      success: true,
      data: {
        filename: target.filename,
        language: extMap[ext] || 'typescript',
        code: code.split('\n').slice(0, 120).join('\n'),
        commitMessage: commit.commit?.message?.split('\n')[0] || '',
        filesChanged: files.length,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch commit code',
    }
  }
}

/**
 * Analyzes commits to extract technical insights and complexity metrics
 */
function analyzeCommits(commits: GitHubCommit[]): CommitHistoryData {
  if (commits.length === 0) {
    return {
      totalCommits: 0,
      recentCommits: [],
      complexityMetrics: {
        averageFilesPerCommit: 0,
        largestCommit: null,
        commitFrequency: 'low',
      },
    };
  }

  // Extract meaningful recent commits (skip merge commits and tiny fixes)
  const meaningfulCommits = commits
    .filter((c) => {
      const message = c.commit.message.toLowerCase();
      return (
        !message.startsWith('merge ') &&
        !message.startsWith('merge pull request') &&
        message.length > 15 // Skip very short commit messages
      );
    })
    .slice(0, 10)
    .map((c) => ({
      sha: c.sha,
      message: c.commit.message.split('\n')[0], // First line only
      date: c.commit.author?.date || c.commit.committer?.date || new Date().toISOString(),
      author: c.commit.author?.name || 'Unknown',
    }));

  // Find the most complex commit (approximation based on message complexity)
  const largestCommit = meaningfulCommits.reduce((largest, commit) => {
    const complexity = commit.message.length + (commit.message.match(/,/g) || []).length * 10;
    const largestComplexity = largest ? largest.message.length + (largest.message.match(/,/g) || []).length * 10 : 0;
    return complexity > largestComplexity ? commit : largest;
  }, meaningfulCommits[0]);

  // Determine commit frequency
  const daysSinceFirstCommit = commits.length > 1
    ? Math.max(
        1,
        Math.floor(
          (new Date(commits[0].commit.author?.date || Date.now()).getTime() -
            new Date(commits[commits.length - 1].commit.author?.date || Date.now()).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 1;
  const commitsPerDay = commits.length / daysSinceFirstCommit;

  let frequency: 'low' | 'medium' | 'high';
  if (commitsPerDay >= 2) {
    frequency = 'high';
  } else if (commitsPerDay >= 0.5) {
    frequency = 'medium';
  } else {
    frequency = 'low';
  }

  return {
    totalCommits: commits.length,
    recentCommits: meaningfulCommits,
    complexityMetrics: {
      averageFilesPerCommit: Math.round(commits.length / Math.max(1, meaningfulCommits.length)), // Approximation
      largestCommit: largestCommit || null,
      commitFrequency: frequency,
    },
  };
}

// Type definitions for commit data
interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author?: {
      name?: string;
      date?: string;
    };
    committer?: {
      date?: string;
    };
  };
  stats?: {
    total: number;
    additions: number;
    deletions: number;
  };
  files?: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
  }>;
}

interface GitHubCommitDetailed extends GitHubCommit {
  stats: {
    total: number;
    additions: number;
    deletions: number;
  };
  files: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
  }>;
}

export interface CommitHistoryData {
  totalCommits: number;
  recentCommits: Array<{
    sha: string;
    message: string;
    date: string;
    author: string;
  }>;
  complexityMetrics: {
    averageFilesPerCommit: number;
    largestCommit: {
      sha: string;
      message: string;
      date: string;
      author: string;
    } | null;
    commitFrequency: 'low' | 'medium' | 'high';
  };
}

export interface HeroCommitCandidate {
  sha: string;
  message: string;
  date: string;
  author: string;
  url: string;
  stats: {
    filesChanged: number;
    insertions: number;
    deletions: number;
  };
  keyFiles: string[];
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface HeroCommitCodeSnippet {
  filename: string;
  language: string;
  code: string;
  lineCount: number;
}
