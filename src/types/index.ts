/**
 * Shared types and interfaces
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PageProps {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Impact Engine types
 */
export interface ImpactMetric {
  id: string;
  type: 'issues_resolved' | 'performance' | 'users' | 'quality' | 'features';
  title: string;
  description: string;
  value: number;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  resetAt: Date;
  percentage: number;
  isWarning: boolean;
}
