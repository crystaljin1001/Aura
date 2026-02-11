'use server';

/**
 * GitHub integration for Narrative Storyboarder
 */

import { createClient } from '@/lib/supabase/server';
import { decryptToken } from '@/lib/encryption/crypto';
import { AuthenticationError, ValidationError } from '@/utils/errors';
import type { ApiResponse } from '@/types';

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

    // Fetch README from GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.raw+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new ValidationError(
          'README not found in this repository. You can write one manually.'
        );
      }
      throw new Error(`GitHub API error: ${response.statusText}`);
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
