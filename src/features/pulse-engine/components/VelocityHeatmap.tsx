/**
 * Velocity Heatmap Component
 * Visual representation of commit activity over time
 */

'use client'

import { useEffect, useState } from 'react'
import type { VelocityHeatmapData } from '../types'

interface VelocityHeatmapProps {
  repositoryUrl: string
  days?: number
}

export function VelocityHeatmap({ repositoryUrl, days = 30 }: VelocityHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<VelocityHeatmapData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadHeatmap() {
      try {
        const response = await fetch(
          `/api/pulse/${encodeURIComponent(repositoryUrl)}/heatmap?days=${days}`
        )
        const data = await response.json()

        if (data.success) {
          setHeatmapData(data.data)
        }
      } catch (err) {
        console.error('Failed to load heatmap:', err)
      } finally {
        setLoading(false)
      }
    }

    loadHeatmap()
  }, [repositoryUrl, days])

  if (loading) {
    return (
      <div className="bg-background/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">Loading activity heatmap...</p>
      </div>
    )
  }

  if (heatmapData.length === 0) {
    return null
  }

  // Get intensity color
  const getIntensityColor = (intensity: number): string => {
    if (intensity === 0) return 'bg-muted/30'
    if (intensity < 2) return 'bg-green-900/40'
    if (intensity < 4) return 'bg-green-700/60'
    if (intensity < 6) return 'bg-green-500/80'
    if (intensity < 8) return 'bg-green-400'
    return 'bg-green-300'
  }

  // Group by week for display
  const weeks: VelocityHeatmapData[][] = []
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7))
  }

  return (
    <div className="bg-background/50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium">Activity Heatmap (Last {days} Days)</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 2, 4, 6, 8].map((intensity) => (
              <div
                key={intensity}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex gap-1">
            {week.map((day) => {
              const date = new Date(day.date)
              const tooltip = `${date.toLocaleDateString()}: ${day.commits} commits, ${day.additions}+ ${day.deletions}-`

              return (
                <div
                  key={day.date}
                  className={`w-3 h-3 rounded-sm ${getIntensityColor(day.intensity)} transition-all hover:scale-125 cursor-pointer`}
                  title={tooltip}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Week labels */}
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>{heatmapData[0]?.date ? new Date(heatmapData[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
        <span>{heatmapData[heatmapData.length - 1]?.date ? new Date(heatmapData[heatmapData.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
      </div>
    </div>
  )
}
