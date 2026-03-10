export type ProjectStatus = 'analyzing' | 'draft' | 'new' | 'script_ready' | 'video_ready' | 'deployed'

export interface DraftMetric {
  id: string
  type: 'impact' | 'technical' | 'business'
  title: string
  description: string
  value: string
  confidence: 'high' | 'medium' | 'low'
  source: string
}

export interface DraftData {
  title: string
  tldr: string
  metrics: DraftMetric[]
  generatedAt: string
  userApproved?: {
    title: boolean
    tldr: boolean
    metrics: boolean[]
  }
  heroCommit?: HeroCommit
}

export interface HeroCommit {
  sha: string
  message: string
  date: string
  author: string
  url: string
  stats: {
    filesChanged: number
    insertions: number
    deletions: number
  }
  keyFiles: string[]
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
  userApproved?: boolean
}

export interface Project {
  id: string
  name: string
  repository: string
  description?: string
  status: ProjectStatus
  hasScript: boolean
  hasVideo: boolean
  hasDomain: boolean
  stars: number
  forks: number
  language?: string
  videoUrl?: string
  videoThumbnail?: string
  domainUrl?: string
  impactMetrics?: {
    criticalIssuesResolved: number
    performanceOptimizations: number
    userAdoption: number
    codeQualityImprovements: number
    featuresDelivered: number
  }
  completeness?: {
    completed: number
    total: number
    percentage: number
    category: 'getting-started' | 'in-progress' | 'complete'
  }
  draftData?: DraftData
  createdAt?: string
  updatedAt?: string
}

export interface ProjectVideo {
  id: string
  userId: string
  repositoryUrl: string
  videoUrl: string
  thumbnailUrl?: string
  durationSeconds?: number
  createdAt: string
  updatedAt: string
}

export interface ProjectDomain {
  id: string
  userId: string
  repositoryUrl: string
  domain: string
  cloudflareZoneId?: string
  sslStatus: 'pending' | 'active' | 'error'
  isActive: boolean
  purchasedAt: string
  expiresAt?: string
  createdAt: string
}
