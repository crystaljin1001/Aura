/**
 * Uptime Checker
 * Checks if a project URL is live and measures latency
 */

import type { UptimeMetrics } from '../types'

interface PingResult {
  success: boolean
  latency: number // milliseconds
  statusCode?: number
  error?: string
}

/**
 * Ping a URL with retries (handles cold starts)
 */
export async function pingUrlWithRetries(
  url: string,
  maxRetries: number = 3,
  retryDelay: number = 2000
): Promise<PingResult> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const startTime = Date.now()

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        // Don't follow redirects to avoid measuring redirect latency
        redirect: 'manual',
      })

      clearTimeout(timeoutId)

      const latency = Date.now() - startTime

      // Success: 2xx or 3xx status codes
      if (response.status >= 200 && response.status < 400) {
        return {
          success: true,
          latency,
          statusCode: response.status,
        }
      }

      // If we got a response but it's an error, still count as "reachable"
      if (attempt === maxRetries) {
        return {
          success: false,
          latency,
          statusCode: response.status,
          error: `HTTP ${response.status}`,
        }
      }
    } catch (error) {
      if (attempt === maxRetries) {
        return {
          success: false,
          latency: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }

      // Wait before retrying (helps with cold starts)
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }
  }

  return {
    success: false,
    latency: 0,
    error: 'Max retries exceeded',
  }
}

/**
 * Check uptime for a project URL
 */
export async function checkUptime(url: string): Promise<UptimeMetrics> {
  const result = await pingUrlWithRetries(url)

  // For MVP, we do a single check
  // In production, you'd query a database of historical checks
  const checksSuccessful = result.success ? 1 : 0
  const checksTotal = 1

  return {
    current_status: result.success ? 'Live' : 'Offline',
    uptime_percentage: result.success ? 100 : 0,
    avg_latency: result.success ? `${result.latency}ms` : 'N/A',
    last_verified: new Date().toISOString(),
    checks_successful: checksSuccessful,
    checks_total: checksTotal,
  }
}

/**
 * Get uptime badge color
 */
export function getUptimeBadgeColor(status: UptimeMetrics['current_status']): string {
  switch (status) {
    case 'Live':
      return 'bg-green-500'
    case 'Offline':
      return 'bg-red-500'
    case 'Unknown':
      return 'bg-gray-500'
  }
}

/**
 * Format latency for display
 */
export function formatLatency(latency: string): string {
  const ms = parseInt(latency)
  if (isNaN(ms)) return latency

  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}
