/**
 * AI Logic Map Extraction
 * Extracts "Why THIS over THAT" reasoning from project context
 * Focus: Negation logic (Why NOT X?) is stronger signal than affirmation (Why Y?)
 */

'use server'

import Anthropic from '@anthropic-ai/sdk'
import type { LogicMapExtraction, TechDecisionNode, PivotPoint } from '../types/logic-map'
import type { ApiResponse } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface LogicMapInput {
  projectName: string
  description: string
  readmeContent?: string
  existingJourney?: string // Existing technical journey if available
  commitHistory?: string // Optional: recent commits to identify pivots
}

/**
 * Extract Logic Map from project context
 * Uses Claude to identify technical decisions with alternatives and pivot points
 */
export async function extractLogicMap(
  input: LogicMapInput
): Promise<ApiResponse<LogicMapExtraction>> {
  try {
    const prompt = buildLogicMapPrompt(input)

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251101', // Use Opus for deep reasoning extraction
      max_tokens: 4096,
      temperature: 0.3, // Lower temp for more consistent extraction
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Log the raw response for debugging
    console.log('🤖 AI Response (first 500 chars):', responseText.slice(0, 500))

    // Parse the JSON response
    const parsed = parseLogicMapResponse(responseText)

    if (!parsed) {
      console.error('❌ Failed to parse AI response. Full response:', responseText)
      return {
        success: false,
        error: 'Failed to parse AI response. The AI may not have generated valid JSON. Try adding more context to your Technical Journey.',
      }
    }

    return {
      success: true,
      data: parsed,
    }
  } catch (error) {
    console.error('Error extracting logic map:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract logic map',
    }
  }
}

/**
 * Build the AI prompt focused on "Why NOT" logic
 */
function buildLogicMapPrompt(input: LogicMapInput): string {
  return `You are analyzing a developer's project to extract their technical decision-making logic.

**CRITICAL FOCUS**: We want to understand "Why NOT X?" reasoning, not just "Why Y?" affirmations.
A developer who can articulate why they REJECTED alternatives shows deeper judgment than one who only explains their choice.

**Project Context:**
Project Name: ${input.projectName}
Description: ${input.description}

${input.readmeContent ? `README Content:\n${input.readmeContent.slice(0, 8000)}\n` : ''}

${input.existingJourney ? `Existing Technical Journey:\n${input.existingJourney}\n` : ''}

${input.commitHistory ? `Recent Commits:\n${input.commitHistory}\n` : ''}

**Your Task:**

1. **Extract Technical Decisions with Alternatives**
   For each major technical choice (framework, architecture pattern, library):
   - What problem needed solving?
   - What alternatives were likely considered? (Even if not explicitly mentioned, infer based on the problem space)
   - For each alternative: What are the pros/cons, and why was it rejected?
   - What was chosen and why? What trade-offs were accepted?

   **FOCUS ON NEGATION**: Prioritize extracting "why NOT X" reasoning over "why Y" reasoning.
   Example:
   - Good: "Rejected Redux because the boilerplate overhead would slow down our 2-week timeline"
   - Weak: "Chose Zustand because it's simple"

2. **Identify Pivot Points**
   Look for moments where the developer changed course:
   - What was the initial approach?
   - What new information/problem caused them to pivot?
   - What did they switch to?
   - What was the outcome?

   **LOOK FOR**: Phrases like "initially tried", "switched to", "realized", "after testing", "had to change"

3. **Confidence Score**
   Rate 0-1 how confident you are in the extraction:
   - 1.0: Explicit mentions of alternatives and pivots
   - 0.5: Can infer reasonable alternatives from context
   - 0.0: Not enough info to extract meaningful logic

**Output Format (Valid JSON only):**

{
  "decisions": [
    {
      "technology": "LangGraph",
      "problem": "How to manage complex multi-agent workflows with state",
      "alternativesConsidered": [
        {
          "name": "Custom workflow system",
          "pros": ["Full control", "Lightweight", "No external dependencies"],
          "cons": ["Reinventing the wheel", "2+ weeks of development", "Maintenance burden"],
          "whyRejected": "Building state management from scratch would delay MVP by 2 weeks. LangGraph provides battle-tested workflow orchestration out of the box."
        },
        {
          "name": "LangChain (without LangGraph)",
          "pros": ["Simpler", "Smaller footprint"],
          "cons": ["No built-in state management", "Manual workflow handling"],
          "whyRejected": "Without LangGraph's state management, we'd still need to build custom persistence layer."
        }
      ],
      "chosenSolution": {
        "name": "LangGraph",
        "rationale": "Provides robust state management and workflow orchestration designed specifically for LLM agents. Critical for our multi-agent architecture where agents need to coordinate state.",
        "tradeoffsAccepted": ["Steeper learning curve", "Framework lock-in", "Larger bundle size"],
        "evidenceLink": "https://github.com/user/repo/blob/main/src/workflow.ts#L10-L50"
      }
    }
  ],
  "pivots": [
    {
      "challenge": "Agent interpretations conflicted 40% of the time",
      "initialApproach": "Single model with majority vote among responses",
      "pivotReasoning": "Testing showed single model couldn't capture nuance needed for political interpretation. Needed diverse perspectives like real humans have.",
      "newApproach": "Social Brain adversarial multi-agent system with conservative/liberal/centrist agents",
      "outcome": "Conflict resolution improved to 85% accuracy, interpretations became more nuanced",
      "impactMetric": "accuracy",
      "commitSha": "abc123",
      "pivotDate": "2026-01-15"
    }
  ],
  "confidence": 0.8
}

**RULES:**
- Return ONLY valid JSON, no markdown, no explanation
- If you can't find alternatives, infer reasonable ones based on the problem space
- Focus on "why NOT X" over "why Y"
- Pivot points should show judgment evolution, not just implementation steps
- If confidence < 0.3, return empty arrays but valid JSON

Generate the Logic Map now:`
}

/**
 * Parse AI response with multiple fallback strategies
 */
function parseLogicMapResponse(response: string): LogicMapExtraction | null {
  // Strategy 1: Try parsing as-is
  try {
    const parsed = JSON.parse(response)
    const validated = validateLogicMap(parsed)
    if (validated) {
      console.log('✅ Parsed JSON as-is')
      return validated
    }
  } catch (error) {
    console.log('⚠️ Direct JSON parse failed:', error instanceof Error ? error.message : 'Unknown error')
  }

  // Strategy 2: Try to extract JSON from markdown code block
  const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1])
      const validated = validateLogicMap(parsed)
      if (validated) {
        console.log('✅ Parsed JSON from markdown code block')
        return validated
      }
    } catch (error) {
      console.log('⚠️ Markdown block parse failed:', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // Strategy 3: Try to find JSON object in text
  const objectMatch = response.match(/\{[\s\S]*\}/)
  if (objectMatch) {
    try {
      const parsed = JSON.parse(objectMatch[0])
      const validated = validateLogicMap(parsed)
      if (validated) {
        console.log('✅ Parsed JSON from object match')
        return validated
      }
    } catch (error) {
      console.log('⚠️ Object match parse failed:', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  console.error('❌ All parsing strategies failed')
  return null
}

/**
 * Validate and type-check the parsed response
 */
function validateLogicMap(data: unknown): LogicMapExtraction | null {
  if (!data || typeof data !== 'object') return null

  const obj = data as Record<string, unknown>

  if (!Array.isArray(obj.decisions) || !Array.isArray(obj.pivots)) {
    return null
  }

  return {
    decisions: obj.decisions as TechDecisionNode[],
    pivots: obj.pivots as PivotPoint[],
    confidence: typeof obj.confidence === 'number' ? obj.confidence : 0.5,
  }
}
