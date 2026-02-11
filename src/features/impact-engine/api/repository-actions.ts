'use server';

/**
 * Server actions for managing user repositories
 */

import { createClient } from '@/lib/supabase/server';
import { repoIdentifierSchema } from '@/lib/validations/impact-engine';
import { AuthenticationError, ValidationError } from '@/utils/errors';
import type { ApiResponse } from '@/types';
import type { RepoIdentifier } from '@/lib/validations/impact-engine';

interface UserRepository {
  id: string;
  user_id: string;
  repo_owner: string;
  repo_name: string;
  added_at: string;
}

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
    throw new AuthenticationError('You must be signed in to manage repositories');
  }

  return user;
}

/**
 * Adds a repository to the user's tracking list
 */
export async function addRepository(
  owner: string,
  repo: string
): Promise<ApiResponse<void>> {
  try {
    // Validate input
    const validated = repoIdentifierSchema.parse({ owner, repo });

    // Get authenticated user
    const user = await getAuthenticatedUser();
    const supabase = await createClient();

    // Insert repository
    const { error } = await supabase.from('user_repositories').insert({
      user_id: user.id,
      repo_owner: validated.owner,
      repo_name: validated.repo,
    });

    if (error) {
      // Check if it's a duplicate
      if (error.code === '23505') {
        throw new ValidationError('Repository already added');
      }
      // Check if it's the limit trigger
      if (error.message.includes('Maximum 10 repositories')) {
        throw new ValidationError('Maximum 10 repositories allowed per user');
      }
      throw new Error(`Failed to add repository: ${error.message}`);
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add repository',
    };
  }
}

/**
 * Removes a repository from the user's tracking list
 */
export async function removeRepository(
  owner: string,
  repo: string
): Promise<ApiResponse<void>> {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser();
    const supabase = await createClient();

    // Delete repository
    const { error } = await supabase
      .from('user_repositories')
      .delete()
      .eq('user_id', user.id)
      .eq('repo_owner', owner)
      .eq('repo_name', repo);

    if (error) {
      throw new Error(`Failed to remove repository: ${error.message}`);
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to remove repository',
    };
  }
}

/**
 * Gets all repositories for the authenticated user
 */
export async function getUserRepositories(): Promise<
  ApiResponse<RepoIdentifier[]>
> {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser();
    const supabase = await createClient();

    // Fetch repositories
    const { data, error } = await supabase
      .from('user_repositories')
      .select('repo_owner, repo_name')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch repositories: ${error.message}`);
    }

    // Transform to RepoIdentifier format
    const repositories: RepoIdentifier[] = (data as UserRepository[]).map(
      (row) => ({
        owner: row.repo_owner,
        repo: row.repo_name,
      })
    );

    return {
      success: true,
      data: repositories,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch repositories',
    };
  }
}
