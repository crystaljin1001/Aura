'use client'

/**
 * Technical Journey Form - Enhanced for Evidence Engine
 *
 * Allows users to write their project story with trade-off analysis:
 * - Problem statement
 * - Technical approach
 * - Architectural trade-offs (NEW)
 * - Tech decisions with alternatives and evidence (ENHANCED)
 * - Challenges faced
 * - Outcome/results
 * - Key learnings
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, Save, Eye, Sparkles, Link as LinkIcon } from 'lucide-react'
import type { TechnicalJourney, TechDecision, ArchitecturalTradeoff } from '../types'
import { saveTechnicalJourney } from '../api/technical-journey-actions'
import { generateTechnicalJourney } from '../api/ai-technical-journey'
import { TechnicalJourneyPreviewModal } from './TechnicalJourneyPreviewModal'

interface TechnicalJourneyFormProps {
  repositoryUrl: string
  initialData?: TechnicalJourney
  onSaved?: () => void
}

export function TechnicalJourneyForm({
  repositoryUrl,
  initialData,
  onSaved,
}: TechnicalJourneyFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isGenerating, setIsGenerating] = useState(false)

  const [problemStatement, setProblemStatement] = useState(initialData?.problemStatement || '')
  const [technicalApproach, setTechnicalApproach] = useState(initialData?.technicalApproach || '')
  const [keyChallenges, setKeyChallenges] = useState(initialData?.keyChallenges || '')
  const [outcome, setOutcome] = useState(initialData?.outcome || '')
  const [learnings, setLearnings] = useState<string[]>(initialData?.learnings || [])
  const [techDecisions, setTechDecisions] = useState<TechDecision[]>(initialData?.techDecisions || [])
  const [architecturalTradeoffs, setArchitecturalTradeoffs] = useState<ArchitecturalTradeoff[]>(
    initialData?.architecturalTradeoffs || []
  )
  const [error, setError] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)

  // New learning input
  const [newLearning, setNewLearning] = useState('')

  // New architectural tradeoff inputs
  const [newArchDecision, setNewArchDecision] = useState('')
  const [newArchChosen, setNewArchChosen] = useState('')
  const [newArchRationale, setNewArchRationale] = useState('')
  const [newArchEvidence, setNewArchEvidence] = useState('')

  // Enhanced tech decision inputs
  const [newTech, setNewTech] = useState('')
  const [newReason, setNewReason] = useState('')
  const [newAlternatives, setNewAlternatives] = useState('')
  const [newBenefits, setNewBenefits] = useState('')
  const [newDrawbacks, setNewDrawbacks] = useState('')
  const [newEvidence, setNewEvidence] = useState('')
  const [showEnhancedFields, setShowEnhancedFields] = useState(false)

  function handleAddLearning() {
    if (newLearning.trim() && learnings.length < 10) {
      setLearnings([...learnings, newLearning.trim()])
      setNewLearning('')
    }
  }

  function handleRemoveLearning(index: number) {
    setLearnings(learnings.filter((_, i) => i !== index))
  }

  function handleAddArchitecturalTradeoff() {
    if (newArchDecision.trim() && newArchChosen.trim() && newArchRationale.trim() && architecturalTradeoffs.length < 10) {
      setArchitecturalTradeoffs([
        ...architecturalTradeoffs,
        {
          decision: newArchDecision.trim(),
          chosen: newArchChosen.trim(),
          rationale: newArchRationale.trim(),
          evidenceLink: newArchEvidence.trim() || undefined,
        },
      ])
      setNewArchDecision('')
      setNewArchChosen('')
      setNewArchRationale('')
      setNewArchEvidence('')
    }
  }

  function handleRemoveArchitecturalTradeoff(index: number) {
    setArchitecturalTradeoffs(architecturalTradeoffs.filter((_, i) => i !== index))
  }

  function handleAddTechDecision() {
    if (newTech.trim() && newReason.trim() && techDecisions.length < 15) {
      const decision: TechDecision = {
        technology: newTech.trim(),
        reason: newReason.trim(),
      }

      // Add enhanced fields if provided
      if (newAlternatives.trim()) {
        decision.alternativesConsidered = newAlternatives
          .split(',')
          .map((alt) => alt.trim())
          .filter((alt) => alt.length > 0)
      }

      if (newBenefits.trim() || newDrawbacks.trim()) {
        decision.tradeoffs = {}
        if (newBenefits.trim()) {
          decision.tradeoffs.benefits = newBenefits
            .split('\n')
            .map((b) => b.trim())
            .filter((b) => b.length > 0)
        }
        if (newDrawbacks.trim()) {
          decision.tradeoffs.drawbacks = newDrawbacks
            .split('\n')
            .map((d) => d.trim())
            .filter((d) => d.length > 0)
        }
      }

      if (newEvidence.trim()) {
        decision.evidenceLink = newEvidence.trim()
      }

      setTechDecisions([...techDecisions, decision])
      setNewTech('')
      setNewReason('')
      setNewAlternatives('')
      setNewBenefits('')
      setNewDrawbacks('')
      setNewEvidence('')
      setShowEnhancedFields(false)
    }
  }

  function handleRemoveTechDecision(index: number) {
    setTechDecisions(techDecisions.filter((_, i) => i !== index))
  }

  async function handleAIGenerate() {
    setIsGenerating(true)
    setError('')

    try {
      const result = await generateTechnicalJourney(repositoryUrl)

      if (result.success && result.data) {
        setProblemStatement(result.data.problemStatement)
        setTechnicalApproach(result.data.technicalApproach)
        setKeyChallenges(result.data.keyChallenges)
        setOutcome(result.data.outcome)
        setLearnings(result.data.learnings)
        setTechDecisions(result.data.techDecisions)
        setArchitecturalTradeoffs(result.data.architecturalTradeoffs || [])
      } else {
        setError(result.error || 'Failed to generate')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    startTransition(async () => {
      try {
        const result = await saveTechnicalJourney({
          repositoryUrl,
          problemStatement,
          technicalApproach,
          keyChallenges,
          outcome,
          learnings,
          techDecisions,
          architecturalTradeoffs,
        })

        if (result.success) {
          onSaved?.()
          router.refresh()
        } else {
          setError(result.error || 'Failed to save')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* AI Generate Button */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">AI-Assisted Writing</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Let AI analyze your repository (README, code structure, commits, dependencies) and generate a draft technical journey with trade-off analysis. You can edit and customize it afterwards.
            </p>
            <Button
              type="button"
              onClick={handleAIGenerate}
              disabled={isGenerating || isPending}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Draft with AI
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Problem Statement */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          🎯 The Problem <span className="text-red-400">*</span>
        </label>
        <p className="text-sm text-muted-foreground mb-3">
          What were you trying to solve? What pain point or need prompted this project?
        </p>
        <textarea
          value={problemStatement}
          onChange={(e) => setProblemStatement(e.target.value)}
          placeholder="I needed a way to track my side project ideas and automatically categorize them by tech stack. Notion was too slow, and spreadsheets couldn't handle tags..."
          required
          minLength={50}
          maxLength={1000}
          rows={4}
          className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2">
          {problemStatement.length}/1000 characters (min 50)
        </p>
      </div>

      {/* Technical Approach */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          🛠️ My Approach <span className="text-red-400">*</span>
        </label>
        <p className="text-sm text-muted-foreground mb-3">
          How did you solve it? What technologies did you use? What was your architecture?
        </p>
        <textarea
          value={technicalApproach}
          onChange={(e) => setTechnicalApproach(e.target.value)}
          placeholder="I chose Next.js 14 with server actions to eliminate API boilerplate. Used Redis for caching because I wanted sub-10ms reads. Deployed on Vercel Edge for global low latency..."
          required
          minLength={100}
          maxLength={2000}
          rows={6}
          className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2">
          {technicalApproach.length}/2000 characters (min 100)
        </p>
      </div>

      {/* NEW: Architectural Trade-offs Section */}
      <div className="border-l-4 border-purple-500 pl-6">
        <label className="block text-sm font-semibold text-foreground mb-2">
          🏗️ Engineering Trade-offs <span className="text-muted-foreground text-xs">(optional, max 10)</span>
        </label>
        <p className="text-sm text-muted-foreground mb-3">
          What architectural decisions did you make? Why did you choose one approach over another?
        </p>

        {/* Existing trade-offs */}
        {architecturalTradeoffs.length > 0 && (
          <div className="space-y-3 mb-3">
            {architecturalTradeoffs.map((tradeoff, i) => (
              <div key={i} className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-xs text-purple-400 mb-1">{tradeoff.decision}</p>
                    <p className="font-semibold text-sm text-foreground">Chose: {tradeoff.chosen}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveArchitecturalTradeoff(i)}
                    className="text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{tradeoff.rationale}</p>
                {tradeoff.evidenceLink && (
                  <a
                    href={tradeoff.evidenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    View Evidence
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add new trade-off */}
        {architecturalTradeoffs.length < 10 && (
          <div className="space-y-2">
            <Input
              value={newArchDecision}
              onChange={(e) => setNewArchDecision(e.target.value)}
              placeholder="Decision question (e.g., Monolithic vs Microservices)"
              maxLength={200}
            />
            <Input
              value={newArchChosen}
              onChange={(e) => setNewArchChosen(e.target.value)}
              placeholder="What you chose (e.g., Monolithic)"
              maxLength={100}
            />
            <textarea
              value={newArchRationale}
              onChange={(e) => setNewArchRationale(e.target.value)}
              placeholder="Why this choice for this context? (e.g., Team of 2, need fast iteration, simpler deployment)"
              maxLength={1000}
              rows={3}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none"
            />
            <Input
              value={newArchEvidence}
              onChange={(e) => setNewArchEvidence(e.target.value)}
              placeholder="GitHub link (optional, e.g., https://github.com/user/repo/blob/main/architecture.md)"
              maxLength={500}
            />
            <Button
              type="button"
              onClick={handleAddArchitecturalTradeoff}
              disabled={!newArchDecision.trim() || !newArchChosen.trim() || !newArchRationale.trim()}
              size="sm"
              variant="outline"
              className="w-full border-purple-500/30 hover:bg-purple-500/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Architectural Trade-off
            </Button>
          </div>
        )}
      </div>

      {/* ENHANCED: Tech Decisions with Trade-offs */}
      <div className="border-l-4 border-blue-500 pl-6">
        <label className="block text-sm font-semibold text-foreground mb-2">
          🧠 Technical Decisions <span className="text-muted-foreground text-xs">(optional, max 15)</span>
        </label>
        <p className="text-sm text-muted-foreground mb-3">
          Why did you choose each technology? What alternatives did you consider? What trade-offs did you make?
        </p>

        {/* Existing decisions */}
        {techDecisions.length > 0 && (
          <div className="space-y-3 mb-3">
            {techDecisions.map((decision, i) => (
              <div key={i} className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-semibold text-sm text-foreground">{decision.technology}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTechDecision(i)}
                    className="text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{decision.reason}</p>

                {decision.alternativesConsidered && decision.alternativesConsidered.length > 0 && (
                  <p className="text-xs text-blue-400 mb-1">
                    Alternatives: {decision.alternativesConsidered.join(', ')}
                  </p>
                )}

                {decision.tradeoffs && (
                  <div className="mt-2 space-y-1">
                    {decision.tradeoffs.benefits && decision.tradeoffs.benefits.length > 0 && (
                      <div className="text-xs text-green-400">
                        ✓ {decision.tradeoffs.benefits.join(', ')}
                      </div>
                    )}
                    {decision.tradeoffs.drawbacks && decision.tradeoffs.drawbacks.length > 0 && (
                      <div className="text-xs text-orange-400">
                        ✗ {decision.tradeoffs.drawbacks.join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {decision.evidenceLink && (
                  <a
                    href={decision.evidenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2"
                  >
                    <LinkIcon className="w-3 h-3" />
                    View Code
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add new decision */}
        {techDecisions.length < 15 && (
          <div className="space-y-2">
            <Input
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              placeholder="Technology (e.g., Redis, Next.js, tRPC)"
              maxLength={100}
            />
            <textarea
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="Why did you choose it? (e.g., Needed sub-10ms reads for real-time features)"
              maxLength={500}
              rows={2}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none"
            />

            {/* Enhanced fields toggle */}
            <Button
              type="button"
              onClick={() => setShowEnhancedFields(!showEnhancedFields)}
              size="sm"
              variant="ghost"
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              {showEnhancedFields ? '− Hide' : '+ Add'} trade-off details
            </Button>

            {showEnhancedFields && (
              <div className="space-y-2 pl-4 border-l-2 border-blue-500/30">
                <Input
                  value={newAlternatives}
                  onChange={(e) => setNewAlternatives(e.target.value)}
                  placeholder="Alternatives considered (comma-separated, e.g., Memcached, DynamoDB)"
                  maxLength={300}
                />
                <textarea
                  value={newBenefits}
                  onChange={(e) => setNewBenefits(e.target.value)}
                  placeholder="Benefits (one per line, e.g., Type-safe, Less boilerplate)"
                  rows={2}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none"
                />
                <textarea
                  value={newDrawbacks}
                  onChange={(e) => setNewDrawbacks(e.target.value)}
                  placeholder="Drawbacks (one per line, e.g., Learning curve, Bundle size)"
                  rows={2}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none"
                />
                <Input
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  placeholder="GitHub link to implementation (optional)"
                  maxLength={500}
                />
              </div>
            )}

            <Button
              type="button"
              onClick={handleAddTechDecision}
              disabled={!newTech.trim() || !newReason.trim()}
              size="sm"
              variant="outline"
              className="w-full border-blue-500/30 hover:bg-blue-500/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Technical Decision
            </Button>
          </div>
        )}
      </div>

      {/* Key Challenges */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          💡 Key Challenges <span className="text-muted-foreground text-xs">(optional)</span>
        </label>
        <p className="text-sm text-muted-foreground mb-3">
          What didn&apos;t work? What did you learn? How did you overcome obstacles?
        </p>
        <textarea
          value={keyChallenges}
          onChange={(e) => setKeyChallenges(e.target.value)}
          placeholder="Initially tried client-side filtering, but with 1000+ items it got laggy. Moved filtering to the backend using Postgres full-text search. Cut response time from 800ms to 45ms..."
          maxLength={1000}
          rows={4}
          className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2">
          {keyChallenges.length}/1000 characters
        </p>
      </div>

      {/* Outcome */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          🎉 Outcome <span className="text-muted-foreground text-xs">(optional)</span>
        </label>
        <p className="text-sm text-muted-foreground mb-3">
          Who uses it? What changed? What impact did it have?
        </p>
        <textarea
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          placeholder="Now using it daily for my 15+ side projects. Shared with 3 friends who find it faster than Notion for quick idea capture..."
          maxLength={1000}
          rows={3}
          className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2">
          {outcome.length}/1000 characters
        </p>
      </div>

      {/* Key Learnings */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          📚 Key Learnings <span className="text-muted-foreground text-xs">(optional, max 10)</span>
        </label>
        <p className="text-sm text-muted-foreground mb-3">
          What did you learn from building this project?
        </p>

        {/* Existing learnings */}
        {learnings.length > 0 && (
          <div className="space-y-2 mb-3">
            {learnings.map((learning, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <span className="flex-1 text-sm text-foreground">• {learning}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveLearning(i)}
                  className="text-muted-foreground hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new learning */}
        {learnings.length < 10 && (
          <div className="flex gap-2">
            <Input
              value={newLearning}
              onChange={(e) => setNewLearning(e.target.value)}
              placeholder="e.g., Redis pub/sub for real-time updates"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddLearning()
                }
              }}
            />
            <Button
              type="button"
              onClick={handleAddLearning}
              disabled={!newLearning.trim()}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={() => setShowPreview(true)}
          disabled={!problemStatement || !technicalApproach}
          variant="outline"
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          Preview
        </Button>
        <Button
          type="submit"
          disabled={isPending || !problemStatement || !technicalApproach}
          className="flex-1 gap-2"
        >
          <Save className="w-4 h-4" />
          {isPending ? 'Saving...' : 'Save Technical Journey'}
        </Button>
      </div>

      {/* Preview Modal */}
      <TechnicalJourneyPreviewModal
        journey={{
          problemStatement,
          technicalApproach,
          keyChallenges: keyChallenges || undefined,
          outcome: outcome || undefined,
          learnings: learnings.length > 0 ? learnings : undefined,
          techDecisions: techDecisions.length > 0 ? techDecisions : undefined,
          architecturalTradeoffs: architecturalTradeoffs.length > 0 ? architecturalTradeoffs : undefined,
        }}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </form>
  )
}
