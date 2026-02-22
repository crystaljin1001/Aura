/**
 * Uptime Badge Component
 * Shows uptime status with color coding
 */

import { Badge } from '@/components/ui/badge'
import { getUptimeBadgeColor } from '../utils/uptime-checker'
import type { UptimeMetrics } from '../types'

interface UptimeBadgeProps {
  status: UptimeMetrics['current_status']
}

export function UptimeBadge({ status }: UptimeBadgeProps) {
  const colorClass = getUptimeBadgeColor(status)

  const icon = status === 'Live' ? '●' : status === 'Offline' ? '○' : '?'

  return (
    <Badge className={`${colorClass} text-white border-none`}>
      {icon} {status}
    </Badge>
  )
}
