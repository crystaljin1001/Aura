/**
 * Test the Criticize Agent
 *
 * This script demonstrates the criticize agent by analyzing a repository
 * Run: node scripts/test-criticize-agent.js
 */

// Note: This needs to be converted to TypeScript or run through the Next.js server
// For now, this shows you what the agent does

console.log(`
🤖 Criticize Agent Demo
========================

The Criticize Agent is a "Red Team" AI that identifies:

1. 🏗️  Architectural Debt
   - Anti-patterns in code structure
   - Tight coupling issues
   - Scalability concerns
   - Evidence: File/directory references

2. 🔒 Production Gaps
   - Missing .env.example
   - No test coverage
   - Missing CI/CD
   - Security vulnerabilities
   - No error handling

3. 📖 Narrative Gaps
   - Technologies used but not explained
   - Claims without evidence
   - Missing architectural decisions

HOW TO USE IT:
--------------

Option 1: Add a "Critique" button to your dashboard (I'll create this next)

Option 2: Call it programmatically in your code:
   import { criticizeRepository } from '@/features/portfolio/api/criticize-agent'

   const result = await criticizeRepository(
     'owner/repo',
     technicalJourney // optional
   )

   console.log(result.data.architecturalDebt)
   console.log(result.data.productionGaps)
   console.log(result.data.narrativeGaps)

Option 3: Try it in the browser console (after logging in):
   - Go to http://localhost:3001/dashboard
   - Open browser console (F12)
   - The critique will be triggered when you click the new button I'm adding

Let me create the UI integration now...
`)
