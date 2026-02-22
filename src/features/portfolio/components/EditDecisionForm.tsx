/**
 * Edit Decision Form - Pre-filled form to edit existing decision
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { X, Save, Trash2, Plus } from 'lucide-react'
import { saveEnhancedDecisions } from '../api/logic-map-actions'
import type { TechDecisionNode, Alternative } from '../types/logic-map'

interface EditDecisionFormProps {
  decision: TechDecisionNode
  decisionIndex: number
  repositoryUrl: string
  allDecisions: TechDecisionNode[]
  onClose: () => void
}

export function EditDecisionForm({ decision, decisionIndex, repositoryUrl, allDecisions, onClose }: EditDecisionFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill with existing data
  const [technology, setTechnology] = useState(decision.technology)
  const [problem, setProblem] = useState(decision.problem)
  const [alternatives, setAlternatives] = useState<Alternative[]>(decision.alternativesConsidered)
  const [chosenName, setChosenName] = useState(decision.chosenSolution.name)
  const [chosenRationale, setChosenRationale] = useState(decision.chosenSolution.rationale)
  const [tradeoffs, setTradeoffs] = useState<string[]>(
    decision.chosenSolution.tradeoffsAccepted.length > 0
      ? decision.chosenSolution.tradeoffsAccepted
      : ['']
  )
  const [evidenceLink, setEvidenceLink] = useState(decision.chosenSolution.evidenceLink || '')

  const addAlternative = () => {
    setAlternatives([...alternatives, { name: '', pros: [''], cons: [''], whyRejected: '' }])
  }

  const removeAlternative = (index: number) => {
    if (alternatives.length > 1) {
      setAlternatives(alternatives.filter((_, i) => i !== index))
    }
  }

  const addTradeoff = () => {
    setTradeoffs([...tradeoffs, ''])
  }

  const removeTradeoff = (index: number) => {
    if (tradeoffs.length > 1) {
      setTradeoffs(tradeoffs.filter((_, i) => i !== index))
    }
  }

  const handleSave = async () => {
    setError(null)
    setIsSaving(true)

    try {
      // Build updated decision
      const updatedDecision: TechDecisionNode = {
        technology: technology.trim(),
        problem: problem.trim(),
        alternativesConsidered: alternatives.filter(alt => alt.name.trim() && alt.whyRejected.trim()).map(alt => ({
          name: alt.name.trim(),
          pros: alt.pros.filter(p => p.trim()).map(p => p.trim()),
          cons: alt.cons.filter(c => c.trim()).map(c => c.trim()),
          whyRejected: alt.whyRejected.trim(),
        })),
        chosenSolution: {
          name: chosenName.trim(),
          rationale: chosenRationale.trim(),
          tradeoffsAccepted: tradeoffs.filter(t => t.trim()).map(t => t.trim()),
          evidenceLink: evidenceLink.trim() || undefined,
        },
      }

      // Replace the decision at the index
      const updatedDecisions = [...allDecisions]
      updatedDecisions[decisionIndex] = updatedDecision

      const result = await saveEnhancedDecisions(repositoryUrl, updatedDecisions)

      if (!result.success) {
        throw new Error(result.error || 'Failed to update decision')
      }

      onClose()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update decision')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this decision?')) {
      return
    }

    setIsSaving(true)
    try {
      const updatedDecisions = allDecisions.filter((_, i) => i !== decisionIndex)
      const result = await saveEnhancedDecisions(repositoryUrl, updatedDecisions)

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete decision')
      }

      onClose()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete decision')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-background border border-border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Edit Decision</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-glass-hover rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Editable Fields */}
          <div className="space-y-4 mb-6">
            {/* Technology */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Technology / Category <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={technology}
                onChange={e => setTechnology(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Problem */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Problem Statement <span className="text-red-400">*</span>
              </label>
              <textarea
                value={problem}
                onChange={e => setProblem(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
              />
            </div>

            {/* Alternatives */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Alternatives</label>
                <button
                  type="button"
                  onClick={addAlternative}
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Alternative
                </button>
              </div>
              {alternatives.map((alt, idx) => (
                <div key={idx} className="mb-4 p-4 border border-red-500/30 rounded-lg bg-red-500/5 relative">
                  {alternatives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAlternative(idx)}
                      className="absolute top-2 right-2 p-1 text-red-400 hover:bg-red-500/20 rounded"
                      title="Remove alternative"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <input
                    type="text"
                    value={alt.name}
                    onChange={e => {
                      const updated = [...alternatives]
                      updated[idx].name = e.target.value
                      setAlternatives(updated)
                    }}
                    placeholder="Alternative name"
                    className="w-full px-3 py-2 mb-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <label className="block text-xs font-semibold text-red-400 mb-1">Why NOT?</label>
                  <textarea
                    value={alt.whyRejected}
                    onChange={e => {
                      const updated = [...alternatives]
                      updated[idx].whyRejected = e.target.value
                      setAlternatives(updated)
                    }}
                    placeholder="Explain why you rejected this in your context..."
                    className="w-full px-3 py-2 bg-background border border-red-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[60px]"
                  />
                </div>
              ))}
            </div>

            {/* Chosen Solution */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Chosen Solution <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={chosenName}
                onChange={e => setChosenName(e.target.value)}
                className="w-full px-3 py-2 mb-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <textarea
                value={chosenRationale}
                onChange={e => setChosenRationale(e.target.value)}
                placeholder="Why this solution?"
                className="w-full px-3 py-2 bg-background border border-green-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[60px]"
              />
            </div>

            {/* Trade-offs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Trade-offs (optional)</label>
                <button
                  type="button"
                  onClick={addTradeoff}
                  className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Trade-off
                </button>
              </div>
              {tradeoffs.map((tradeoff, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={tradeoff}
                    onChange={e => {
                      const updated = [...tradeoffs]
                      updated[idx] = e.target.value
                      setTradeoffs(updated)
                    }}
                    placeholder="Trade-off accepted..."
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {tradeoffs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTradeoff(idx)}
                      className="p-2 text-muted-foreground hover:text-red-400"
                      title="Remove trade-off"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Evidence Link */}
            <div>
              <label className="block text-sm font-medium mb-2">Evidence Link (optional)</label>
              <input
                type="url"
                value={evidenceLink}
                onChange={e => setEvidenceLink(e.target.value)}
                placeholder="https://github.com/owner/repo/blob/main/src/file.ts#L10-L25"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-muted-foreground mt-1">
                💎 GitHub permalinks will automatically show code snippets - recruiters can see proof without leaving the page!
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-3">
            <button
              onClick={handleDelete}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-border rounded-lg hover:bg-glass-hover transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
