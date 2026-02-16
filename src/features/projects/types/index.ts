export type ProjectStatus = 'new' | 'script_ready' | 'video_ready' | 'deployed'

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
