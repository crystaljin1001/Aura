/**
 * Velocity Badge Component
 * Shows velocity score and label with color coding
 */

import { Badge } from '@/components/ui/badge'
import { getVelocityBadgeColor } from '../utils/velocity-calculator'
import type { VelocityMetrics } from '../types'

interface VelocityBadgeProps {
  score: number
  label: VelocityMetrics['label']
}

export function VelocityBadge({ score, label }: VelocityBadgeProps) {
  const colorClass = getVelocityBadgeColor(score)

  return (
    <Badge className={`${colorClass} text-white border-none`}>
      {label} ({score}/10)
    </Badge>
  )
}
