/**
 * Hiring Dashboard Types
 * Types for the AI-powered hiring dashboard mockup
 */

export interface SpiderMapDimension {
  label: string
  value: number // 0-10
}

export interface Candidate {
  id: string
  name: string
  rank: number
  title: string
  avatarColor: string
  aiRanking: string // One sentence explanation
  spiderMap: SpiderMapDimension[]
  githubUrl: string
  portfolioUrl: string
}

export interface VideoDemo {
  title: string
  thumbnail: string
  duration: string
  type: 'product' | 'architecture'
}
