/**
 * Site configuration
 * Centralized app configuration
 */

export const siteConfig = {
  name: "Builder's OS",
  description: 'A specialized portfolio platform for builders',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  links: {
    github: 'https://github.com/yourusername/aura',
  },
} as const;

export const appConfig = {
  maxUploadSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
} as const;

export const impactEngineConfig = {
  cacheExpiryHours: 24,
  rateLimitWarningThreshold: 100,
  maxRepositoriesPerUser: 10,
  githubApiVersion: '2022-11-28',
} as const;
