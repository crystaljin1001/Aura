/**
 * Types for Impact Engine feature
 */

import type { ImpactMetric } from '../utils/impact-calculator';

/**
 * Encrypted token data stored in database
 */
export interface EncryptedTokenData {
  id: string;
  user_id: string;
  encrypted_token: string;
  encryption_iv: string;
  token_last_four: string;
  created_at: string;
  updated_at: string;
}

/**
 * Cached impact data stored in database
 */
export interface CachedImpactData {
  id: string;
  user_id: string;
  repo_full_name: string;
  repo_data: Record<string, unknown>;
  impact_metrics: ImpactMetric[];
  cached_at: string;
  expires_at: string;
}

/**
 * Rate limit tracking data
 */
export interface RateLimitData {
  id: string;
  user_id: string;
  requests_made: number;
  rate_limit: number;
  rate_remaining: number;
  rate_reset_at: string;
  last_updated: string;
}

/**
 * Rate limit status for display
 */
export interface RateLimitStatus {
  limit: number;
  remaining: number;
  resetAt: Date;
  percentage: number;
  isWarning: boolean;
}

/**
 * Repository identifier
 */
export interface RepoIdentifier {
  owner: string;
  repo: string;
}

/**
 * Impact data for a single repository
 */
export interface RepositoryImpactData {
  repoFullName: string;
  metrics: ImpactMetric[];
  lastUpdated: Date;
}

/**
 * Impact Engine configuration
 */
export interface ImpactEngineConfig {
  cacheExpiryHours: number;
  rateLimitWarningThreshold: number;
  maxRepositoriesPerUser: number;
  githubApiVersion: string;
}
