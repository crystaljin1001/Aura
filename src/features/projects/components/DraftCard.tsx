'use client';

/**
 * DraftCard Component
 * Displays AI-generated draft content for user review and approval
 */

import { useState, useTransition } from 'react';
import type { Project, DraftMetric } from '../types';
import {
  approveDraft,
  discardDraft,
  updateDraftField,
  updateDraftMetric,
} from '../actions';
import { retryDraftAnalysis } from '../api/draft-analyzer';

interface DraftCardProps {
  project: Project;
}

export function DraftCard({ project }: DraftCardProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedMetrics, setSelectedMetrics] = useState<boolean[]>(
    new Array(project.draftData?.metrics.length || 0).fill(false)
  );
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingMetricId, setEditingMetricId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const draftData = project.draftData;

  if (!draftData) {
    return null;
  }

  const selectedCount = selectedMetrics.filter(Boolean).length;
  const canApprove = selectedCount >= 3; // At least 3 metrics must be selected

  const handleToggleMetric = (index: number) => {
    const newSelected = [...selectedMetrics];
    newSelected[index] = !newSelected[index];
    setSelectedMetrics(newSelected);
  };

  const handleApprove = () => {
    startTransition(async () => {
      try {
        await approveDraft(project.id, {
          title: true,
          tldr: true,
          metrics: selectedMetrics,
        });
      } catch (error) {
        console.error('Failed to approve draft:', error);
        alert('Failed to approve draft. Please try again.');
      }
    });
  };

  const handleDiscard = () => {
    if (
      !confirm(
        'Are you sure you want to discard this AI-generated draft? You can always retry analysis later.'
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await discardDraft(project.id);
      } catch (error) {
        console.error('Failed to discard draft:', error);
        alert('Failed to discard draft. Please try again.');
      }
    });
  };

  const handleRetry = () => {
    startTransition(async () => {
      try {
        await retryDraftAnalysis(project.id);
      } catch (error) {
        console.error('Failed to retry analysis:', error);
        alert('Failed to retry analysis. Please try again.');
      }
    });
  };

  const handleEditField = (field: 'title' | 'tldr') => {
    setEditingField(field);
    setEditValues({ ...editValues, [field]: draftData[field] });
  };

  const handleSaveField = (field: 'title' | 'tldr') => {
    const value = editValues[field];
    if (!value || value === draftData[field]) {
      setEditingField(null);
      return;
    }

    startTransition(async () => {
      try {
        await updateDraftField(project.id, field, value);
        setEditingField(null);
      } catch (error) {
        console.error('Failed to update field:', error);
        alert('Failed to update field. Please try again.');
      }
    });
  };

  const handleEditMetric = (metricId: string, metric: DraftMetric) => {
    setEditingMetricId(metricId);
    setEditValues({
      ...editValues,
      [`${metricId}-title`]: metric.title,
      [`${metricId}-description`]: metric.description,
      [`${metricId}-value`]: metric.value,
    });
  };

  const handleSaveMetric = (metricId: string) => {
    const updates = {
      title: editValues[`${metricId}-title`],
      description: editValues[`${metricId}-description`],
      value: editValues[`${metricId}-value`],
    };

    startTransition(async () => {
      try {
        await updateDraftMetric(project.id, metricId, updates);
        setEditingMetricId(null);
      } catch (error) {
        console.error('Failed to update metric:', error);
        alert('Failed to update metric. Please try again.');
      }
    });
  };

  const getConfidenceBadgeColor = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-orange-100 text-orange-700';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-lg">
      {/* Header Badge */}
      <div className="mb-4 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
          <span>🎯</span>
          <span>DRAFT - Review AI Suggestions</span>
        </div>
        <button
          onClick={handleRetry}
          disabled={isPending}
          className="text-sm text-purple-600 hover:text-purple-800 disabled:opacity-50"
        >
          🔄 Retry
        </button>
      </div>

      {/* Title */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium uppercase tracking-wide text-gray-600">
            Title
          </label>
          {editingField !== 'title' && (
            <button
              onClick={() => handleEditField('title')}
              className="text-xs text-purple-600 hover:text-purple-800"
            >
              Edit
            </button>
          )}
        </div>
        {editingField === 'title' ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editValues.title || ''}
              onChange={(e) =>
                setEditValues({ ...editValues, title: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleSaveField('title')}
                disabled={isPending}
                className="rounded-md bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setEditingField(null)}
                className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-base font-semibold text-gray-900">
            {draftData.title}
          </p>
        )}
      </div>

      {/* TL;DR */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium uppercase tracking-wide text-gray-600">
            TL;DR
          </label>
          {editingField !== 'tldr' && (
            <button
              onClick={() => handleEditField('tldr')}
              className="text-xs text-purple-600 hover:text-purple-800"
            >
              Edit
            </button>
          )}
        </div>
        {editingField === 'tldr' ? (
          <div className="space-y-2">
            <textarea
              value={editValues.tldr || ''}
              onChange={(e) =>
                setEditValues({ ...editValues, tldr: e.target.value })
              }
              maxLength={120}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {editValues.tldr?.length || 0}/120 characters
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveField('tldr')}
                  disabled={isPending}
                  className="rounded-md bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700">{draftData.tldr}</p>
        )}
      </div>

      {/* Metrics */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-xs font-medium uppercase tracking-wide text-gray-600">
            Impact Metrics (Select at least 3)
          </label>
          <span className="text-xs text-gray-500">
            {selectedCount} selected
          </span>
        </div>
        <div className="space-y-3">
          {draftData.metrics.map((metric, index) => (
            <div
              key={metric.id}
              className={`rounded-lg border p-4 transition-colors ${
                selectedMetrics[index]
                  ? 'border-purple-300 bg-purple-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {editingMetricId === metric.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Metric title"
                    value={editValues[`${metric.id}-title`] || ''}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        [`${metric.id}-title`]: e.target.value,
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <textarea
                    placeholder="Metric description"
                    value={editValues[`${metric.id}-description`] || ''}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        [`${metric.id}-description`]: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={editValues[`${metric.id}-value`] || ''}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        [`${metric.id}-value`]: e.target.value,
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveMetric(metric.id)}
                      disabled={isPending}
                      className="rounded-md bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingMetricId(null)}
                      className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedMetrics[index]}
                        onChange={() => handleToggleMetric(index)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {metric.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          {metric.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEditMetric(metric.id, metric)}
                      className="text-xs text-purple-600 hover:text-purple-800"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="ml-7 mt-2 flex items-center gap-2">
                    <span className="text-xs font-medium text-purple-600">
                      {metric.value}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${getConfidenceBadgeColor(
                        metric.confidence
                      )}`}
                    >
                      {metric.confidence}
                    </span>
                    <span className="text-xs text-gray-500">
                      • {metric.source}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 border-t border-purple-200 pt-4">
        <button
          onClick={handleDiscard}
          disabled={isPending}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          🗑️ Discard All
        </button>
        <button
          onClick={handleApprove}
          disabled={!canApprove || isPending}
          className="rounded-md bg-purple-600 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {canApprove
            ? `✅ Approve Draft (${selectedCount} metrics)`
            : `Select at least 3 metrics (${selectedCount}/3)`}
        </button>
      </div>

      {/* Helper Text */}
      <p className="mt-3 text-xs text-gray-500">
        Review and edit the AI suggestions above, then select at least 3 metrics
        to approve. You can continue to the normal workflow after approval.
      </p>
    </div>
  );
}
