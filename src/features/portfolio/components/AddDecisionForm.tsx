/**
 * Add Decision Form - Manual input for Logic Map
 * Users can add technical decisions without AI generation
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Trash2, Link as LinkIcon } from 'lucide-react'
import { saveEnhancedDecisions } from '../api/logic-map-actions'
import type { TechDecisionNode, Alternative } from '../types/logic-map'

interface AddDecisionFormProps {
  repositoryUrl: string
  existingDecisions: TechDecisionNode[]
  onSuccess: () => void
}

export function AddDecisionForm({ repositoryUrl, existingDecisions, onSuccess }: AddDecisionFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [technology, setTechnology] = useState('')
  const [problem, setProblem] = useState('')
  const [alternatives, setAlternatives] = useState<Alternative[]>([
    { name: '', pros: [''], cons: [''], whyRejected: '' },
  ])
  const [chosenName, setChosenName] = useState('')
  const [chosenRationale, setChosenRationale] = useState('')
  const [tradeoffs, setTradeoffs] = useState<string[]>([''])
  const [evidenceLink, setEvidenceLink] = useState('')

  const addAlternative = () => {
    setAlternatives([...alternatives, { name: '', pros: [''], cons: [''], whyRejected: '' }])
  }

  const removeAlternative = (index: number) => {
    setAlternatives(alternatives.filter((_, i) => i !== index))
  }

  const updateAlternative = (index: number, field: keyof Alternative, value: string | string[]) => {
    const updated = [...alternatives]
    // @ts-expect-error - Dynamic field update
    updated[index][field] = value
    setAlternatives(updated)
  }

  const addProCon = (altIndex: number, type: 'pros' | 'cons') => {
    const updated = [...alternatives]
    updated[altIndex][type].push('')
    setAlternatives(updated)
  }

  const updateProCon = (altIndex: number, type: 'pros' | 'cons', itemIndex: number, value: string) => {
    const updated = [...alternatives]
    updated[altIndex][type][itemIndex] = value
    setAlternatives(updated)
  }

  const removeProCon = (altIndex: number, type: 'pros' | 'cons', itemIndex: number) => {
    const updated = [...alternatives]
    updated[altIndex][type] = updated[altIndex][type].filter((_, i) => i !== itemIndex)
    setAlternatives(updated)
  }

  const addTradeoff = () => {
    setTradeoffs([...tradeoffs, ''])
  }

  const updateTradeoff = (index: number, value: string) => {
    const updated = [...tradeoffs]
    updated[index] = value
    setTradeoffs(updated)
  }

  const removeTradeoff = (index: number) => {
    setTradeoffs(tradeoffs.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      // Validate required fields
      if (!technology.trim() || !problem.trim() || !chosenName.trim() || !chosenRationale.trim()) {
        throw new Error('Please fill in all required fields')
      }

      // Filter out empty alternatives
      const validAlternatives = alternatives.filter(
        alt => alt.name.trim() && alt.whyRejected.trim()
      )

      if (validAlternatives.length === 0) {
        throw new Error('Please add at least one alternative with "Why NOT?" reasoning')
      }

      // Build new decision
      const newDecision: TechDecisionNode = {
        technology: technology.trim(),
        problem: problem.trim(),
        alternativesConsidered: validAlternatives.map(alt => ({
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

      // Save to database
      const result = await saveEnhancedDecisions(repositoryUrl, [...existingDecisions, newDecision])

      if (!result.success) {
        throw new Error(result.error || 'Failed to save decision')
      }

      // Success - reset form
      setIsOpen(false)
      resetForm()
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save decision')
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setTechnology('')
    setProblem('')
    setAlternatives([{ name: '', pros: [''], cons: [''], whyRejected: '' }])
    setChosenName('')
    setChosenRationale('')
    setTradeoffs([''])
    setEvidenceLink('')
    setError(null)
  }

  return (
    <>
      {/* Add Decision Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Decision Manually
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit} className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Add Technical Decision</h3>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
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

                {/* Technology & Problem */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Technology / Category <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={technology}
                      onChange={e => setTechnology(e.target.value)}
                      placeholder="e.g., State Management, Database, API Framework"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Problem Statement <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={problem}
                      onChange={e => setProblem(e.target.value)}
                      placeholder="What problem needed solving? e.g., 'How to manage complex client-side state with frequent updates'"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
                      required
                    />
                  </div>
                </div>

                {/* Alternatives Considered */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Alternatives Considered (Why NOT?)</h4>
                    <button
                      type="button"
                      onClick={addAlternative}
                      className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Alternative
                    </button>
                  </div>

                  <div className="space-y-4">
                    {alternatives.map((alt, altIndex) => (
                      <div key={altIndex} className="border border-red-500/30 rounded-lg p-4 bg-red-500/5">
                        <div className="flex items-start justify-between mb-3">
                          <input
                            type="text"
                            value={alt.name}
                            onChange={e => updateAlternative(altIndex, 'name', e.target.value)}
                            placeholder="Alternative name (e.g., Redux)"
                            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          {alternatives.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAlternative(altIndex)}
                              className="ml-2 p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Why Rejected - THE MOST IMPORTANT FIELD */}
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-red-400 mb-1">
                            Why NOT {alt.name || 'this'}? <span className="text-red-400">*</span>
                          </label>
                          <p className="text-xs text-muted-foreground mb-2">
                            This is the most important field! Explain why you rejected this <strong>in your specific context</strong>, not just generic cons.
                          </p>
                          <textarea
                            value={alt.whyRejected}
                            onChange={e => updateAlternative(altIndex, 'whyRejected', e.target.value)}
                            placeholder={`Example: "Redux's boilerplate would delay our 2-week MVP. We needed state management in 1 day, not 3. Its benefits (DevTools, middleware) weren't worth the time cost for our simple use case."`}
                            className="w-full px-3 py-2 text-sm bg-background border border-red-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[80px]"
                          />
                        </div>

                        {/* Pros/Cons - Optional */}
                        <details className="mb-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            + Add structured pros/cons (optional)
                          </summary>
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            {/* Pros */}
                            <div>
                              <label className="block text-xs font-medium text-green-400 mb-2">Pros</label>
                              {alt.pros.map((pro, proIndex) => (
                                <div key={proIndex} className="flex items-center gap-2 mb-2">
                                  <input
                                    type="text"
                                    value={pro}
                                    onChange={e => updateProCon(altIndex, 'pros', proIndex, e.target.value)}
                                    placeholder="Advantage..."
                                    className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                  />
                                  {alt.pros.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeProCon(altIndex, 'pros', proIndex)}
                                      className="text-muted-foreground hover:text-red-400"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addProCon(altIndex, 'pros')}
                                className="text-xs text-green-400 hover:text-green-300"
                              >
                                + Add Pro
                              </button>
                            </div>

                            {/* Cons */}
                            <div>
                              <label className="block text-xs font-medium text-red-400 mb-2">Cons</label>
                              {alt.cons.map((con, conIndex) => (
                                <div key={conIndex} className="flex items-center gap-2 mb-2">
                                  <input
                                    type="text"
                                    value={con}
                                    onChange={e => updateProCon(altIndex, 'cons', conIndex, e.target.value)}
                                    placeholder="Disadvantage..."
                                    className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                                  />
                                  {alt.cons.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeProCon(altIndex, 'cons', conIndex)}
                                      className="text-muted-foreground hover:text-red-400"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addProCon(altIndex, 'cons')}
                                className="text-xs text-red-400 hover:text-red-300"
                              >
                                + Add Con
                              </button>
                            </div>
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chosen Solution */}
                <div className="border border-green-500/30 rounded-lg p-4 bg-green-500/5 mb-6">
                  <h4 className="font-medium text-green-400 mb-3">Chosen Solution</h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Solution Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={chosenName}
                        onChange={e => setChosenName(e.target.value)}
                        placeholder="e.g., Zustand"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Why This? <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={chosenRationale}
                        onChange={e => setChosenRationale(e.target.value)}
                        placeholder="Explain why you chose this solution..."
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[80px]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Trade-offs Accepted</label>
                      {tradeoffs.map((tradeoff, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={tradeoff}
                            onChange={e => updateTradeoff(index, e.target.value)}
                            placeholder="What did you sacrifice? e.g., 'Steeper learning curve'"
                            className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          {tradeoffs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTradeoff(index)}
                              className="p-2 text-muted-foreground hover:text-red-400"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addTradeoff}
                        className="text-sm text-orange-400 hover:text-orange-300"
                      >
                        + Add Trade-off
                      </button>
                    </div>

                    {/* Evidence Link - Optional, Hidden by Default */}
                    <details>
                      <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground mb-2">
                        + Add evidence link (optional)
                      </summary>
                      <div className="mt-2">
                        <input
                          type="url"
                          value={evidenceLink}
                          onChange={e => setEvidenceLink(e.target.value)}
                          placeholder="https://github.com/owner/repo/blob/main/src/file.ts#L10-L25"
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          💎 GitHub permalinks will automatically show code snippets - recruiters can see proof without leaving the page!
                        </p>
                      </div>
                    </details>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-glass-hover transition-colors"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Add Decision'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
