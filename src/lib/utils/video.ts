/**
 * Video URL utilities
 * Handles conversion of various video URLs to embeddable format
 */

/**
 * Detect video type from URL
 */
export function getVideoType(url: string): 'youtube' | 'vimeo' | 'direct' | 'iframe' {
  if (!url) return 'direct'

  const urlLower = url.toLowerCase()

  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'youtube'
  }
  if (urlLower.includes('vimeo.com')) {
    return 'vimeo'
  }
  // Check if it's a direct video file (mp4, webm, mov, avi)
  if (urlLower.match(/\.(mp4|webm|mov|avi|ogv)(\?|$)/)) {
    return 'direct'
  }
  // Default to iframe for other URLs (Tella, Arcade, Loom, etc.)
  return 'iframe'
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,           // https://www.youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/embed\/)([^?]+)/,             // https://www.youtube.com/embed/VIDEO_ID
    /(?:youtu\.be\/)([^?]+)/,                       // https://youtu.be/VIDEO_ID
    /(?:youtube\.com\/shorts\/)([^?]+)/,            // https://www.youtube.com/shorts/VIDEO_ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

/**
 * Convert YouTube URL to embed format
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url)
  if (!videoId) return null

  return `https://www.youtube.com/embed/${videoId}`
}

/**
 * Extract Vimeo video ID from URL
 */
export function getVimeoVideoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

/**
 * Convert Vimeo URL to embed format
 */
export function getVimeoEmbedUrl(url: string): string | null {
  const videoId = getVimeoVideoId(url)
  if (!videoId) return null

  return `https://player.vimeo.com/video/${videoId}`
}

/**
 * Get embeddable video URL based on video type
 */
export function getEmbeddableVideoUrl(url: string): string {
  if (!url) return ''

  const videoType = getVideoType(url)

  switch (videoType) {
    case 'youtube':
      return getYouTubeEmbedUrl(url) || url
    case 'vimeo':
      return getVimeoEmbedUrl(url) || url
    case 'direct':
    case 'iframe':
    default:
      return url
  }
}
