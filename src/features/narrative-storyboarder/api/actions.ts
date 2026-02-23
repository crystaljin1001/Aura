'use server';

/**
 * Server actions for Narrative Storyboarder
 */

import { createClient } from '@/lib/supabase/server';
import { getOpenAIClient, NARRATIVE_SYSTEM_PROMPT, USER_JOURNEY_SYSTEM_PROMPT, TECHNICAL_ARCHITECTURE_SYSTEM_PROMPT } from '@/lib/ai/openai';
import { AuthenticationError, ValidationError } from '@/utils/errors';
import type { ApiResponse } from '@/types';
import type { NarrativeScript, GeneratedScript, ScriptType, UserJourneyScript, TechnicalArchitectureScript, LegacyNarrativeScript } from '../types';
import { z } from 'zod';
import { fetchCommitHistory, type CommitHistoryData } from './github-actions';
import { getLogicMapForScriptGeneration, type LogicMapData } from '@/features/portfolio/api/logic-map-actions';

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
 * @param repositoryUrl - Optional repository URL
 * @param scriptType - Type of script to generate ('user_journey' or 'technical_architecture')
 * @returns ApiResponse with generated script
 */
export async function generateScript(
  projectName: string,
  readmeContent: string,
  repositoryUrl?: string,
  scriptType: ScriptType = 'user_journey'
): Promise<ApiResponse<NarrativeScript>> {
  try {
    // Validate input
    const validated = scriptInputSchema.parse({
      projectName,
      readmeContent,
    });

    // Get authenticated user
    const user = await getAuthenticatedUser();

    // Fetch additional context data if repository URL is provided
    let commitHistory: CommitHistoryData | null = null;
    let logicMapData: LogicMapData | null = null;

    if (repositoryUrl) {
      // Parse owner/repo from repositoryUrl
      const [owner, repo] = repositoryUrl.split('/');

      // Fetch commit history (best effort - don't fail if it errors)
      const commitResult = await fetchCommitHistory(owner, repo, 100);
      if (commitResult.success && commitResult.data) {
        commitHistory = commitResult.data;
      }

      // Fetch Logic Map data (best effort)
      const logicMapResult = await getLogicMapForScriptGeneration(repositoryUrl);
      if (logicMapResult.success && logicMapResult.data) {
        logicMapData = logicMapResult.data;
      }
    }

    // Initialize OpenAI client
    const openai = getOpenAIClient();

    // Select appropriate system prompt and user prompt based on script type
    let systemPrompt: string;
    let userPrompt: string;
    let expectedFields: string[];

    if (scriptType === 'user_journey') {
      systemPrompt = USER_JOURNEY_SYSTEM_PROMPT;

      // Build user prompt with additional context
      let contextData = '';
      if (logicMapData && logicMapData.hasLogicMap) {
        contextData += `\n\n## TECHNICAL DECISIONS (from Logic Map):\n`;
        logicMapData.decisions.forEach((decision, idx) => {
          contextData += `\nDecision ${idx + 1}: ${decision.problem}\n`;
          contextData += `Chosen: ${decision.chosenSolution.name} - ${decision.chosenSolution.rationale}\n`;
          if (decision.alternativesConsidered && decision.alternativesConsidered.length > 0) {
            contextData += `Alternatives considered: ${decision.alternativesConsidered.map(alt => alt.name).join(', ')}\n`;
          }
        });
      }

      if (commitHistory) {
        contextData += `\n\n## DEVELOPMENT METRICS:\n`;
        contextData += `Total commits: ${commitHistory.totalCommits}\n`;
        contextData += `Commit frequency: ${commitHistory.complexityMetrics.commitFrequency}\n`;
        if (commitHistory.complexityMetrics.largestCommit) {
          contextData += `Most complex commit: "${commitHistory.complexityMetrics.largestCommit.message}"\n`;
        }
      }

      userPrompt = `Project: ${validated.projectName}\n\nREADME:\n${validated.readmeContent}${contextData}\n\nGenerate a User Journey Demo script following the Friction → Social Brain → Discovery → Resolution narrative structure. Focus on showing value through user success and AI proficiency. Use the technical decisions and development metrics above to ground your narrative in real evidence.`;
      expectedFields = ['friction', 'socialBrain', 'discovery', 'resolution'];
    } else if (scriptType === 'technical_architecture') {
      systemPrompt = TECHNICAL_ARCHITECTURE_SYSTEM_PROMPT;

      // Build technical context
      let technicalContext = '';

      if (logicMapData && logicMapData.hasLogicMap) {
        technicalContext += `\n\n## LOGIC MAP DATA (Technical Decisions Tree):\n`;
        logicMapData.decisions.forEach((decision, idx) => {
          technicalContext += `\n### Decision ${idx + 1}: ${decision.technology}\n`;
          technicalContext += `Problem: ${decision.problem}\n`;

          if (decision.alternativesConsidered && decision.alternativesConsidered.length > 0) {
            technicalContext += `\nAlternatives Considered:\n`;
            decision.alternativesConsidered.forEach(alt => {
              technicalContext += `- ${alt.name}:\n`;
              if (alt.whyRejected) {
                technicalContext += `  WHY NOT: ${alt.whyRejected}\n`;
              }
            });
          }

          technicalContext += `\nChosen Solution: ${decision.chosenSolution.name}\n`;
          technicalContext += `WHY THIS: ${decision.chosenSolution.rationale}\n`;
          if (decision.chosenSolution.tradeoffsAccepted && decision.chosenSolution.tradeoffsAccepted.length > 0) {
            technicalContext += `Trade-offs accepted: ${decision.chosenSolution.tradeoffsAccepted.join(', ')}\n`;
          }
          if (decision.chosenSolution.evidenceLink) {
            technicalContext += `Evidence: ${decision.chosenSolution.evidenceLink}\n`;
          }
        });

        if (logicMapData.pivotPoints && logicMapData.pivotPoints.length > 0) {
          technicalContext += `\n## PIVOT POINTS (Major Strategic Shifts):\n`;
          logicMapData.pivotPoints.forEach((pivot, idx) => {
            technicalContext += `\nPivot ${idx + 1}: ${pivot.challenge}\n`;
            technicalContext += `Initial approach: ${pivot.initialApproach}\n`;
            technicalContext += `Why pivoted: ${pivot.pivotReasoning}\n`;
            technicalContext += `New approach: ${pivot.newApproach}\n`;
            if (pivot.outcome) {
              technicalContext += `Outcome: ${pivot.outcome}\n`;
            }
          });
        }
      }

      if (commitHistory) {
        technicalContext += `\n\n## COMMIT HISTORY (Complexity Metrics):\n`;
        technicalContext += `Total commits: ${commitHistory.totalCommits}\n`;
        technicalContext += `Commit frequency: ${commitHistory.complexityMetrics.commitFrequency}\n`;
        technicalContext += `Average files per commit: ~${commitHistory.complexityMetrics.averageFilesPerCommit}\n`;

        if (commitHistory.complexityMetrics.largestCommit) {
          const commit = commitHistory.complexityMetrics.largestCommit;
          technicalContext += `\nMost complex commit (${commit.sha.substring(0, 7)}):\n`;
          technicalContext += `"${commit.message}"\n`;
          technicalContext += `Author: ${commit.author}\n`;
          technicalContext += `Date: ${new Date(commit.date).toLocaleDateString()}\n`;
        }

        if (commitHistory.recentCommits && commitHistory.recentCommits.length > 0) {
          technicalContext += `\nRecent meaningful commits:\n`;
          commitHistory.recentCommits.slice(0, 5).forEach(c => {
            technicalContext += `- ${c.message} (${new Date(c.date).toLocaleDateString()})\n`;
          });
        }
      }

      userPrompt = `Project: ${validated.projectName}\n\nREADME:\n${validated.readmeContent}${technicalContext}\n\nGenerate a Technical Architecture Demo script following the Context → Logic Gate → Execution → Moat narrative structure. Focus on technical decisions, trade-offs, and architectural depth. Include visual cues and intent-based transitions.\n\nIMPORTANT: Reference the Logic Map data and commit history above. Use specific examples from the technical decisions, pivot points, and commit messages. This is REAL data from the project - cite it!`;
      expectedFields = ['context', 'logicGate', 'execution', 'moat'];
    } else {
      // Fallback to legacy format
      systemPrompt = NARRATIVE_SYSTEM_PROMPT;
      userPrompt = `Project: ${validated.projectName}\n\nREADME:\n${validated.readmeContent}\n\nGenerate a compelling video demo script following the Context → Problem → Process → Outcome narrative structure.`;
      expectedFields = ['context', 'problem', 'process', 'outcome'];
    }

    // Generate script using GPT-4o-mini with prompt caching
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 3000, // Increased for more detailed scripts
    });

    // Parse the response
    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error('No response from AI');
    }

    const parsedScript = JSON.parse(responseContent) as NarrativeScript;

    // Validate the script structure based on type
    const missingFields = expectedFields.filter(field => !(field in parsedScript));
    if (missingFields.length > 0) {
      throw new ValidationError(`Generated script is missing required sections: ${missingFields.join(', ')}`);
    }

    // Save to database using UPSERT to allow both script types per repository
    // The unique constraint is on (user_id, repository_url, script_type)
    const supabase = await createClient();

    console.log('[generateScript] Attempting to save script:', {
      userId: user.id,
      projectName: validated.projectName,
      repositoryUrl,
      scriptType,
      readmeLength: validated.readmeContent.length,
    });

    if (scriptType && repositoryUrl) {
      // First, try to find existing script of this type
      const { data: existing } = await supabase
        .from('narrative_scripts')
        .select('id')
        .eq('user_id', user.id)
        .eq('repository_url', repositoryUrl)
        .eq('script_type', scriptType)
        .maybeSingle();

      if (existing) {
        // Update existing script
        const { data: updateData, error: dbError } = await supabase
          .from('narrative_scripts')
          .update({
            project_name: validated.projectName,
            readme_content: validated.readmeContent,
            generated_script: parsedScript,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select();

        if (dbError) {
          console.error('[generateScript] Database update error:', dbError);
        } else {
          console.log('[generateScript] Script updated successfully:', updateData);
        }
      } else {
        // Insert new script
        const { data: insertData, error: dbError } = await supabase
          .from('narrative_scripts')
          .insert({
            user_id: user.id,
            project_name: validated.projectName,
            readme_content: validated.readmeContent,
            generated_script: parsedScript,
            script_type: scriptType,
            repository_url: repositoryUrl,
          })
          .select();

        if (dbError) {
          console.error('[generateScript] Database insert error:', dbError);
        } else {
          console.log('[generateScript] Script inserted successfully:', insertData);
        }
      }
    } else {
      console.log('[generateScript] WARNING: Missing scriptType or repositoryUrl, using fallback insert');
      // Fallback to insert for legacy scripts without type or repo
      const { data: insertData, error: dbError } = await supabase.from('narrative_scripts').insert({
        user_id: user.id,
        project_name: validated.projectName,
        readme_content: validated.readmeContent,
        generated_script: parsedScript,
        script_type: scriptType,
        repository_url: repositoryUrl || null,
      })
      .select();

      if (dbError) {
        console.error('[generateScript] Database insert error:', dbError);
      } else {
        console.log('[generateScript] Script inserted successfully:', insertData);
      }
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
 * Updates an existing script with manually edited content
 * @param repositoryUrl - Repository URL
 * @param editedScript - The edited script content
 * @param scriptType - Type of script being edited
 * @returns ApiResponse with success status
 */
export async function updateScript(
  repositoryUrl: string,
  editedScript: NarrativeScript,
  scriptType?: ScriptType
): Promise<ApiResponse<void>> {
  try {
    const user = await getAuthenticatedUser();
    const supabase = await createClient();

    // Find the script for this repository and type
    let query = supabase
      .from('narrative_scripts')
      .select('id')
      .eq('user_id', user.id)
      .eq('repository_url', repositoryUrl);

    // Filter by script_type if provided
    if (scriptType) {
      query = query.eq('script_type', scriptType);
    } else {
      // For legacy scripts, find ones with null script_type
      query = query.is('script_type', null);
    }

    const { data: existingScript, error: fetchError } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError || !existingScript) {
      throw new Error('Script not found');
    }

    // Update the script
    const { error: updateError } = await supabase
      .from('narrative_scripts')
      .update({
        generated_script: editedScript,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingScript.id)
      .eq('user_id', user.id);

    if (updateError) {
      throw new Error(`Failed to update script: ${updateError.message}`);
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
          : 'Failed to update script',
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
