/**
 * Types for Narrative Storyboarder feature
 */

export interface NarrativeScript {
  context: string;
  problem: string;
  process: string;
  outcome: string;
}

export interface GeneratedScript {
  id: string;
  user_id: string;
  project_name: string;
  readme_content: string;
  generated_script: NarrativeScript;
  created_at: string;
  updated_at: string;
}

export interface ScriptGenerationInput {
  projectName: string;
  readmeContent: string;
}
