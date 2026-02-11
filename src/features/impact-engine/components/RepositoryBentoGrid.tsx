'use client';

/**
 * Repository Bento Grid Component
 * Beautiful responsive grid layout with Framer Motion animations and shimmer effects
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { RepoIdentifier } from '@/lib/validations/impact-engine';

interface RepositoryBentoGridProps {
  repositories: RepoIdentifier[];
}

// Generate mock impact data for visual representation
function getMockImpactData(repoName: string) {
  // Seed random based on repo name for consistency
  const seed = repoName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };

  return {
    stars: random(10, 1500),
    commits: random(50, 500),
    prs: random(5, 150),
    issues: random(10, 200),
    contributionGraph: Array.from({ length: 12 }, () => random(0, 20)),
  };
}

// Shimmer effect component
function ShimmerOverlay() {
  return (
    <motion.div
      className="absolute inset-0 opacity-0 pointer-events-none"
      animate={{
        opacity: [0, 0.5, 0],
        x: ['-100%', '100%'],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        repeatDelay: 3,
        ease: 'linear',
      }}
      style={{
        background:
          'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
      }}
    />
  );
}

// Mini contribution graph component
function MiniContributionGraph({ data }: { data: number[] }) {
  const max = Math.max(...data);

  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((value, index) => {
        const height = max > 0 ? (value / max) * 100 : 0;
        return (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{
              duration: 0.5,
              delay: index * 0.05,
              ease: 'easeOut',
            }}
            className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300 rounded-t-sm min-h-[2px]"
          />
        );
      })}
    </div>
  );
}

// Repository card component
function RepositoryCard({
  repo,
  index,
  isLarge = false,
}: {
  repo: RepoIdentifier;
  index: number;
  isLarge?: boolean;
}) {
  const impact = getMockImpactData(repo.repo);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-shadow ${
        isLarge ? 'col-span-2 row-span-2' : ''
      }`}
    >
      {/* Shimmer effect */}
      <ShimmerOverlay />

      {/* Card content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">📦</div>
            <div>
              <a
                href={`https://github.com/${repo.owner}/${repo.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {repo.repo}
              </a>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {repo.owner}
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
            Active
          </div>
        </div>

        {/* Key Impact Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {impact.stars}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              ⭐ Stars
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {impact.commits}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              💻 Commits
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {impact.prs}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              🔀 Pull Requests
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {impact.issues}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              🐛 Issues
            </div>
          </div>
        </div>

        {/* Mini Contribution Graph */}
        {isLarge && (
          <div className="mt-auto">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Activity (Last 12 weeks)
            </div>
            <MiniContributionGraph data={impact.contributionGraph} />
          </div>
        )}

        {/* Quick stats for small cards */}
        {!isLarge && (
          <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>12 weeks active</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                View details →
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Gradient accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
    </motion.div>
  );
}

export function RepositoryBentoGrid({ repositories }: RepositoryBentoGridProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Connected Repositories
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {repositories.length} {repositories.length === 1 ? 'repository' : 'repositories'} tracking impact
          </p>
        </div>
        <Link
          href="/repositories"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Manage
        </Link>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
        {repositories.map((repo, index) => {
          // Make first card large on desktop
          const isLarge = index === 0 && repositories.length > 1;

          return (
            <RepositoryCard
              key={`${repo.owner}/${repo.repo}`}
              repo={repo}
              index={index}
              isLarge={isLarge}
            />
          );
        })}
      </div>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Real-time Impact Tracking Coming Soon
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              These metrics are currently mock data for visualization. Full GitHub API
              integration with live contribution graphs, issue tracking, and performance
              metrics will be available soon!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
