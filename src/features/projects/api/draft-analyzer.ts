'use server';

/**
 * AI Draft Analyzer
 * Automatically analyzes GitHub repositories and generates draft content
 */

import { createClient } from '@/lib/supabase/server';
import { getOpenAIClient } from '@/lib/ai/openai';
import {
  DRAFT_GENERATION_SYSTEM_PROMPT,
  buildDraftGenerationPrompt,
} from '@/lib/ai/draft-prompts';
import { fetchGitHubReadme } from '@/features/portfolio/api/github-readme';
import type { DraftData, DraftMetric } from '@/features/projects/types';
import { z } from 'zod';

// Validation schema for OpenAI response
const draftMetricSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['impact', 'technical', 'business']),
  title: z.string(),
  description: z.string(),
  value: z.string(),
  source: z.string(),
  confidence: z.enum(['high', 'medium', 'low']),
});

const draftResponseSchema = z.object({
  title: z.string(),
  tldr: z.string().max(120),
  metrics: z.array(draftMetricSchema).min(4).max(5),
});

interface GitHubRepoData {
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  owner: {
    login: string;
  };
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    } | null;
  };
}

/**
 * Gets GitHub token for authenticated user
 */
async function getGitHubToken(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Use environment variable fallback for testing
  const envToken = process.env.GITHUB_TOKEN;
  if (envToken) {
    return envToken;
  }

  // Try to get user's encrypted token
  try {
    const { decryptToken } = await import('@/lib/encryption/crypto');
    const { data, error } = await supabase
      .from('github_tokens')
      .select('encrypted_token, encryption_iv')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return null;
    }

    const token = decryptToken({
      encrypted: data.encrypted_token,
      iv: data.encryption_iv,
    });
    return token;
  } catch {
    return null;
  }
}

/**
 * Fetches repository metadata from GitHub
 */
async function fetchRepoMetadata(
  owner: string,
  repo: string,
  token?: string
): Promise<GitHubRepoData | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch repo metadata: ${response.status}`);
      return null;
    }

    const data: GitHubRepoData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching repo metadata:', error);
    return null;
  }
}

/**
 * Fetches recent commits from GitHub
 */
async function fetchRecentCommits(
  owner: string,
  repo: string,
  token?: string,
  limit: number = 20
): Promise<GitHubCommit[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch commits: ${response.status}`);
      return [];
    }

    const data: GitHubCommit[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching commits:', error);
    return [];
  }
}

/**
 * Generates fallback metrics from GitHub stats when AI fails
 */
function generateFallbackMetrics(
  repoData: GitHubRepoData | null,
  commits: GitHubCommit[]
): DraftMetric[] {
  const metrics: DraftMetric[] = [];

  if (repoData) {
    // Stars metric
    if (repoData.stargazers_count > 0) {
      metrics.push({
        id: crypto.randomUUID(),
        type: 'impact',
        title: `${repoData.stargazers_count.toLocaleString()} GitHub stars`,
        description: `Community validation with ${repoData.stargazers_count.toLocaleString()} stars, indicating strong developer interest and adoption.`,
        value: `${repoData.stargazers_count.toLocaleString()} stars`,
        source: 'GitHub repository statistics',
        confidence: 'high',
      });
    }

    // Forks metric
    if (repoData.forks_count > 0) {
      metrics.push({
        id: crypto.randomUUID(),
        type: 'technical',
        title: `${repoData.forks_count.toLocaleString()} repository forks`,
        description: `Active developer community with ${repoData.forks_count.toLocaleString()} forks, showing practical reuse and adaptation.`,
        value: `${repoData.forks_count.toLocaleString()} forks`,
        source: 'GitHub repository statistics',
        confidence: 'high',
      });
    }
  }

  // Commits metric
  if (commits.length > 0) {
    metrics.push({
      id: crypto.randomUUID(),
      type: 'technical',
      title: `${commits.length}+ commits`,
      description: `Active development with ${commits.length}+ recent commits, demonstrating ongoing maintenance and feature development.`,
      value: `${commits.length}+ commits`,
      source: 'GitHub commit history',
      confidence: 'high',
    });
  }

  // Language metric
  if (repoData?.language) {
    metrics.push({
      id: crypto.randomUUID(),
      type: 'technical',
      title: `Built with ${repoData.language}`,
      description: `Implemented using ${repoData.language}, chosen for its ecosystem and performance characteristics.`,
      value: repoData.language,
      source: 'GitHub repository metadata',
      confidence: 'high',
    });
  }

  return metrics.slice(0, 4); // Return max 4 fallback metrics
}

/**
 * Analyzes repository and generates draft content using AI
 */
export async function analyzeRepositoryDraft(
  repoId: string,
  owner: string,
  repo: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Starting AI analysis for ${owner}/${repo} (ID: ${repoId})`);

    // Get GitHub token
    const token = await getGitHubToken();

    // Fetch data in parallel
    const [repoMetadata, readmeContent, recentCommits] = await Promise.all([
      fetchRepoMetadata(owner, repo, token || undefined),
      fetchGitHubReadme(owner, repo, token || undefined),
      fetchRecentCommits(owner, repo, token || undefined, 20),
    ]);

    console.log('GitHub data fetched:', {
      hasMetadata: !!repoMetadata,
      hasReadme: !!readmeContent,
      commitsCount: recentCommits.length,
    });

    // Prepare commit data for prompt
    const commits = recentCommits.map((c) => ({
      message: c.commit.message.split('\n')[0], // First line only
      date: c.commit.author?.date || new Date().toISOString(),
      author: c.commit.author?.name || 'Unknown',
    }));

    // Build prompt context
    const promptContext = {
      repoName: repo,
      repoOwner: owner,
      description: repoMetadata?.description || undefined,
      readmeContent: readmeContent || undefined,
      recentCommits: commits,
      stars: repoMetadata?.stargazers_count,
      forks: repoMetadata?.forks_count,
      language: repoMetadata?.language || undefined,
      topics: repoMetadata?.topics || [],
    };

    let draftData: DraftData;

    try {
      // Call OpenAI to generate draft
      const openai = getOpenAIClient();
      const userPrompt = buildDraftGenerationPrompt(promptContext);

      console.log('Calling OpenAI API...');
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: DRAFT_GENERATION_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response from OpenAI');
      }

      console.log('OpenAI response received');

      // Parse and validate response
      const parsedResponse = JSON.parse(responseContent);
      const validated = draftResponseSchema.parse(parsedResponse);

      // Add UUIDs to metrics if missing
      const metricsWithIds: DraftMetric[] = validated.metrics.map((metric) => ({
        ...metric,
        id: metric.id || crypto.randomUUID(),
      }));

      draftData = {
        title: validated.title,
        tldr: validated.tldr,
        metrics: metricsWithIds,
        generatedAt: new Date().toISOString(),
      };
    } catch (aiError) {
      console.error('AI generation failed, using fallback metrics:', aiError);

      // Fallback: generate basic metrics from GitHub stats
      const fallbackMetrics = generateFallbackMetrics(repoMetadata, recentCommits);

      draftData = {
        title: `${repo} - ${repoMetadata?.description || 'GitHub Project'}`,
        tldr:
          repoMetadata?.description?.slice(0, 120) ||
          'A GitHub project worth showcasing in your portfolio',
        metrics: fallbackMetrics,
        generatedAt: new Date().toISOString(),
      };
    }

    // Update database with draft data
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from('user_repositories')
      .update({
        draft_data: draftData,
        status: 'draft',
      })
      .eq('id', repoId);

    if (updateError) {
      console.error('Failed to update database:', updateError);
      return {
        success: false,
        error: 'Failed to save draft data',
      };
    }

    console.log(`Successfully generated draft for ${owner}/${repo}`);
    return { success: true };
  } catch (error) {
    console.error('Error in analyzeRepositoryDraft:', error);

    // Set status to 'new' with error state
    const supabase = await createClient();
    await supabase
      .from('user_repositories')
      .update({
        status: 'new',
        draft_data: null,
      })
      .eq('id', repoId);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Retries draft analysis for a repository
 */
export async function retryDraftAnalysis(
  repoId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get repository info
    const supabase = await createClient();
    const { data: repo, error } = await supabase
      .from('user_repositories')
      .select('repo_owner, repo_name')
      .eq('id', repoId)
      .single();

    if (error || !repo) {
      return { success: false, error: 'Repository not found' };
    }

    // Set status to analyzing
    await supabase
      .from('user_repositories')
      .update({ status: 'analyzing' })
      .eq('id', repoId);

    // Trigger analysis
    return await analyzeRepositoryDraft(
      repoId,
      repo.repo_owner,
      repo.repo_name
    );
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Retry failed',
    };
  }
}
