/**
 * Types for Narrative Storyboarder feature
 */

// Script type enum
export type ScriptType = 'user_journey' | 'technical_architecture';

// Legacy script structure (Context → Problem → Process → Outcome)
export interface LegacyNarrativeScript {
  context: string;
  problem: string;
  process: string;
  outcome: string;
}

// User Journey Demo script (outcome-focused, shows value through user success)
export interface UserJourneyScript {
  friction: string;        // Chapter 1: The specific pain point (e.g., lawyer missing $25M loophole)
  socialBrain: string;     // Chapter 2: The interface + Adversarial Debate in real-time
  discovery: string;       // Chapter 3: The $25M Delta - catching what ChatGPT missed
  resolution: string;      // Chapter 4: The Reciprocal Protection remediation
}

// Technical Architecture Demo script (technical deep-dive with structural constraints)
export interface TechnicalArchitectureScript {
  context: string;         // Chapter I: Why this exists (problem from README)
  logicGate: string;       // Chapter II: Why built this way (Technical Decisions tree)
  execution: string;       // Chapter III: Prove you built it (complex commit, Planning-to-Coding ratio)
  moat: string;            // Chapter IV: Why it's hard to copy (proprietary logic, Negative Logic datasets)
}

// Union type for all script structures
export type NarrativeScript = LegacyNarrativeScript | UserJourneyScript | TechnicalArchitectureScript;

export interface GeneratedScript {
  id: string;
  user_id: string;
  project_name: string;
  readme_content: string;
  generated_script: NarrativeScript;
  script_type?: ScriptType;  // Optional for backwards compatibility
  created_at: string;
  updated_at: string;
}

export interface ScriptGenerationInput {
  projectName: string;
  readmeContent: string;
  scriptType?: ScriptType;
}

// Type guards for script structure detection
export function isUserJourneyScript(script: NarrativeScript): script is UserJourneyScript {
  return 'friction' in script && 'socialBrain' in script && 'discovery' in script && 'resolution' in script;
}

export function isTechnicalArchitectureScript(script: NarrativeScript): script is TechnicalArchitectureScript {
  return 'logicGate' in script && 'execution' in script && 'moat' in script && 'context' in script && !('problem' in script);
}

export function isLegacyScript(script: NarrativeScript): script is LegacyNarrativeScript {
  return 'context' in script && 'problem' in script && 'process' in script && 'outcome' in script;
}
