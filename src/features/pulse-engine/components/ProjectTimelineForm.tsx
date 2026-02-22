/**
 * Project Timeline Form
 * Allows users to define project start and completion dates
 */

'use client'

import { useState, useEffect } from 'react'
import { Calendar, Save, X } from 'lucide-react'
import {
  saveProjectTimeline,
  getProjectTimeline,
  deleteProjectTimeline,
  type ProjectTimelineInput,
} from '../api/timeline-actions'

interface ProjectTimelineFormProps {
  repositoryUrl: string
  onSave?: () => void
}

export function ProjectTimelineForm({
  repositoryUrl,
  onSave,
}: ProjectTimelineFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [isOngoing, setIsOngoing] = useState(true)

  // Load existing timeline on mount
  useEffect(() => {
    async function loadTimeline() {
      const result = await getProjectTimeline(repositoryUrl)
      if (result.success && result.data) {
        setStartDate(result.data.project_start_date?.split('T')[0] || '')
        setEndDate(result.data.project_end_date?.split('T')[0] || '')
        setIsOngoing(!result.data.project_end_date)
      }
    }
    loadTimeline()
  }, [repositoryUrl])

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate start date
      if (!startDate) {
        setError('Project start date is required')
        setLoading(false)
        return
      }

      // Prepare input - send date strings as-is to preserve the date
      const input: ProjectTimelineInput = {
        repository_url: repositoryUrl,
        project_start_date: startDate, // Keep as YYYY-MM-DD, server will normalize to UTC
        project_end_date: isOngoing ? null : endDate,
      }

      const result = await saveProjectTimeline(input)

      if (result.success) {
        setSuccess(true)
        setIsEditing(false)
        onSave?.()

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || 'Failed to save timeline')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Remove custom timeline? The system will use auto-detected dates.')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await deleteProjectTimeline(repositoryUrl)

      if (result.success) {
        setStartDate('')
        setEndDate('')
        setIsOngoing(true)
        setIsEditing(false)
        onSave?.()
      } else {
        setError(result.error || 'Failed to delete timeline')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const hasTimeline = !!startDate

  if (!isEditing && !hasTimeline) {
    return (
      <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">Define Project Timeline</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Set custom start/end dates to include planning time in your velocity calculation.
              By default, we only count from your first commit.
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-md transition-colors"
            >
              Set Timeline
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isEditing && hasTimeline) {
    return (
      <div className="bg-background/50 p-4 rounded-lg border border-border">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-400" />
            <h4 className="font-semibold text-sm">Custom Timeline</h4>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Started</p>
            <p className="font-medium">
              {(() => {
                // Parse date as UTC to prevent timezone shifting
                const date = new Date(startDate + 'T12:00:00Z') // Add noon UTC to prevent day shift
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  timeZone: 'UTC', // Force UTC interpretation
                })
              })()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              {isOngoing ? 'Status' : 'Completed'}
            </p>
            <p className="font-medium">
              {isOngoing ? (
                <span className="text-green-400">Ongoing</span>
              ) : (
                (() => {
                  const date = new Date(endDate + 'T12:00:00Z')
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: 'UTC',
                  })
                })()
              )}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background/50 p-4 rounded-lg border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          <h4 className="font-semibold text-sm">Set Project Timeline</h4>
        </div>
        <button
          onClick={() => setIsEditing(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Start Date */}
        <div>
          <label className="block text-xs font-medium mb-1.5">
            Project Start Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            placeholder="When did you start planning/building?"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Include planning time before your first commit
          </p>
        </div>

        {/* Ongoing Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="ongoing"
            checked={isOngoing}
            onChange={(e) => setIsOngoing(e.target.checked)}
            className="w-4 h-4 rounded border-border"
          />
          <label htmlFor="ongoing" className="text-sm">
            Project is still ongoing
          </label>
        </div>

        {/* End Date (if not ongoing) */}
        {!isOngoing && (
          <div>
            <label className="block text-xs font-medium mb-1.5">
              Project Completion Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="text-xs text-green-400 bg-green-500/10 p-2 rounded">
            Timeline saved! Pulse metrics will update.
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-md text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Timeline'}
          </button>

          {hasTimeline && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 disabled:bg-red-500/10 rounded-md text-sm text-red-400 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
