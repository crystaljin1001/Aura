'use server';

/**
 * Server actions for Narrative Storyboarder
 */

import { createClient } from '@/lib/supabase/server';
import { getOpenAIClient, NARRATIVE_SYSTEM_PROMPT } from '@/lib/ai/openai';
import { AuthenticationError, ValidationError } from '@/utils/errors';
import type { ApiResponse } from '@/types';
import type { NarrativeScript, GeneratedScript } from '../types';
import { z } from 'zod';

/**
 * Input validation schema
 */
const scriptInputSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(200),
  readmeContent: z.string().min(50, 'README must be at least 50 characters').max(10000, 'README too long (max 10,000 characters)'),
});

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
    throw new AuthenticationError('You must be signed in to generate scripts');
  }

  return user;
}

/**
 * Generates a video demo script using AI
 * @param projectName - Name of the project
 * @param readmeContent - Project README content
 * @returns ApiResponse with generated script
 */
export async function generateScript(
  projectName: string,
  readmeContent: string
): Promise<ApiResponse<NarrativeScript>> {
  try {
    // Validate input
    const validated = scriptInputSchema.parse({
      projectName,
      readmeContent,
    });

    // Get authenticated user
    const user = await getAuthenticatedUser();

    // Initialize OpenAI client
    const openai = getOpenAIClient();

    // Generate script using GPT-4o-mini with prompt caching
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: NARRATIVE_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Project: ${validated.projectName}\n\nREADME:\n${validated.readmeContent}\n\nGenerate a compelling video demo script following the Context → Problem → Process → Outcome narrative structure.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    });

    // Parse the response
    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error('No response from AI');
    }

    const parsedScript = JSON.parse(responseContent) as NarrativeScript;

    // Validate the script structure
    if (!parsedScript.context || !parsedScript.problem || !parsedScript.process || !parsedScript.outcome) {
      throw new ValidationError('Generated script is missing required sections');
    }

    // Save to database
    const supabase = await createClient();
    const { error: dbError } = await supabase.from('narrative_scripts').insert({
      user_id: user.id,
      project_name: validated.projectName,
      readme_content: validated.readmeContent,
      generated_script: parsedScript,
    });

    if (dbError) {
      console.error('Failed to save script to database:', dbError);
      // Don't fail the request if DB save fails - user still gets the script
    }

    return {
      success: true,
      data: parsedScript,
    };
  } catch (error) {
    console.error('Script generation error:', error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to generate script. Please try again.',
    };
  }
}

/**
 * Gets all scripts for the authenticated user
 * @returns ApiResponse with array of scripts
 */
export async function getUserScripts(): Promise<ApiResponse<GeneratedScript[]>> {
  try {
    const user = await getAuthenticatedUser();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('narrative_scripts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch scripts: ${error.message}`);
    }

    return {
      success: true,
      data: data as GeneratedScript[],
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch scripts',
    };
  }
}

/**
 * Deletes a script
 * @param scriptId - ID of the script to delete
 * @returns ApiResponse with success status
 */
export async function deleteScript(scriptId: string): Promise<ApiResponse<void>> {
  try {
    const user = await getAuthenticatedUser();
    const supabase = await createClient();

    const { error } = await supabase
      .from('narrative_scripts')
      .delete()
      .eq('id', scriptId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to delete script: ${error.message}`);
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to delete script',
    };
  }
}
