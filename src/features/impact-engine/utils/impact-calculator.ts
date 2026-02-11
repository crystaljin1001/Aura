/**
 * Impact calculation algorithms
 * Transforms GitHub repository data into business impact metrics
 */

import type { GitHubRepository, GitHubIssue, GitHubPullRequest } from '@/lib/github/schemas';

export type ImpactType =
  | 'issues_resolved'
  | 'performance'
  | 'users'
  | 'quality'
  | 'features';

export interface ImpactMetric {
  id: string;
  type: ImpactType;
  title: string;
  description: string;
  value: number;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
}

/**
 * Checks if an issue/PR title contains specific keywords
 */
function containsKeywords(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some((keyword) => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Checks if labels contain specific keywords
 */
function hasLabelKeywords(labels: string[], keywords: string[]): boolean {
  return labels.some((label) => containsKeywords(label, keywords));
}

/**
 * Calculates Critical Issues Resolved metric
 * Counts closed issues with critical, bug, or security labels
 */
function calculateIssuesResolved(
  issues: GitHubIssue[],
  repoName: string
): ImpactMetric {
  const criticalKeywords = [
    'bug',
    'critical',
    'security',
    'urgent',
    'hotfix',
    'vulnerability',
  ];

  const resolvedCritical = issues.filter(
    (issue) =>
      issue.state === 'closed' &&
      (containsKeywords(issue.title, criticalKeywords) ||
        hasLabelKeywords(
          issue.labels.map((l) => l.name),
          criticalKeywords
        ))
  );

  return {
    id: `issues-resolved-${repoName}`,
    type: 'issues_resolved',
    title: 'Critical Issues Resolved',
    description: `Fixed ${resolvedCritical.length} critical bugs and security vulnerabilities`,
    value: resolvedCritical.length,
    icon: '🔧',
    trend: resolvedCritical.length > 5 ? 'up' : 'stable',
  };
}

/**
 * Calculates Performance Optimization metric
 * Counts PRs with performance-related keywords
 */
function calculatePerformance(
  prs: GitHubPullRequest[],
  repoName: string
): ImpactMetric {
  const performanceKeywords = [
    'optimize',
    'performance',
    'speed',
    'faster',
    'cache',
    'efficiency',
    'latency',
  ];

  const performancePRs = prs.filter(
    (pr) =>
      pr.merged_at &&
      containsKeywords(pr.title, performanceKeywords)
  );

  return {
    id: `performance-${repoName}`,
    type: 'performance',
    title: 'Performance Optimizations',
    description: `Implemented ${performancePRs.length} performance improvements`,
    value: performancePRs.length,
    icon: '⚡',
    trend: performancePRs.length > 3 ? 'up' : 'stable',
  };
}

/**
 * Calculates User Adoption metric
 * Uses stars + (forks * 2) as proxy for user adoption
 */
function calculateUserAdoption(
  repo: GitHubRepository,
  repoName: string
): ImpactMetric {
  const adoptionScore = repo.stargazers_count + repo.forks_count * 2;

  let description = '';
  if (adoptionScore > 1000) {
    description = `High community adoption with ${repo.stargazers_count.toLocaleString()} stars`;
  } else if (adoptionScore > 100) {
    description = `Growing community with ${repo.stargazers_count.toLocaleString()} stars`;
  } else {
    description = `Building community with ${repo.stargazers_count.toLocaleString()} stars`;
  }

  return {
    id: `users-${repoName}`,
    type: 'users',
    title: 'User Adoption',
    description,
    value: adoptionScore,
    icon: '👥',
    trend: repo.stargazers_count > 50 ? 'up' : 'stable',
  };
}

/**
 * Calculates Code Quality metric
 * Counts refactoring and cleanup work
 */
function calculateCodeQuality(
  issues: GitHubIssue[],
  prs: GitHubPullRequest[],
  repoName: string
): ImpactMetric {
  const qualityKeywords = [
    'refactor',
    'cleanup',
    'tech-debt',
    'technical debt',
    'clean',
    'quality',
    'maintainability',
  ];

  const qualityIssues = issues.filter(
    (issue) =>
      issue.state === 'closed' &&
      (containsKeywords(issue.title, qualityKeywords) ||
        hasLabelKeywords(
          issue.labels.map((l) => l.name),
          qualityKeywords
        ))
  );

  const qualityPRs = prs.filter(
    (pr) =>
      pr.merged_at &&
      containsKeywords(pr.title, qualityKeywords)
  );

  const totalQuality = qualityIssues.length + qualityPRs.length;

  return {
    id: `quality-${repoName}`,
    type: 'quality',
    title: 'Code Quality Improvements',
    description: `Completed ${totalQuality} refactoring and cleanup tasks`,
    value: totalQuality,
    icon: '✨',
    trend: totalQuality > 5 ? 'up' : 'stable',
  };
}

/**
 * Calculates Feature Delivery metric
 * Counts feature and enhancement work
 */
function calculateFeatureDelivery(
  issues: GitHubIssue[],
  prs: GitHubPullRequest[],
  repoName: string
): ImpactMetric {
  const featureKeywords = [
    'feature',
    'enhancement',
    'add',
    'new',
    'implement',
  ];

  const featureIssues = issues.filter(
    (issue) =>
      issue.state === 'closed' &&
      (containsKeywords(issue.title, featureKeywords) ||
        hasLabelKeywords(
          issue.labels.map((l) => l.name),
          featureKeywords
        ))
  );

  const featurePRs = prs.filter(
    (pr) =>
      pr.merged_at &&
      containsKeywords(pr.title, featureKeywords)
  );

  const totalFeatures = featureIssues.length + featurePRs.length;

  return {
    id: `features-${repoName}`,
    type: 'features',
    title: 'Features Delivered',
    description: `Shipped ${totalFeatures} new features and enhancements`,
    value: totalFeatures,
    icon: '🚀',
    trend: totalFeatures > 5 ? 'up' : 'stable',
  };
}

/**
 * Main function to calculate all impact metrics
 * @param repo - Repository data from GitHub
 * @param issues - Array of issues
 * @param prs - Array of pull requests
 * @returns Array of impact metrics
 */
export function calculateImpacts(
  repo: GitHubRepository,
  issues: GitHubIssue[],
  prs: GitHubPullRequest[]
): ImpactMetric[] {
  const repoName = repo.name;

  return [
    calculateIssuesResolved(issues, repoName),
    calculatePerformance(prs, repoName),
    calculateUserAdoption(repo, repoName),
    calculateCodeQuality(issues, prs, repoName),
    calculateFeatureDelivery(issues, prs, repoName),
  ];
}

/**
 * Filters out metrics with zero value
 * @param metrics - Array of impact metrics
 * @returns Filtered array with only non-zero metrics
 */
export function filterNonZeroMetrics(metrics: ImpactMetric[]): ImpactMetric[] {
  return metrics.filter((metric) => metric.value > 0);
}
