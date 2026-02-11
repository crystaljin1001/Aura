/**
 * Impact Card component
 * Displays individual impact metric with icon, value, and description
 */

import type { ImpactMetric } from '@/types';

interface ImpactCardProps {
  metric: ImpactMetric;
  variant?: 'compact' | 'detailed';
}

export function ImpactCard({ metric, variant = 'detailed' }: ImpactCardProps) {
  const isCompact = variant === 'compact';

  // Gradient colors based on metric type
  const gradients = {
    issues_resolved: 'from-red-500 to-pink-500',
    performance: 'from-yellow-500 to-orange-500',
    users: 'from-blue-500 to-cyan-500',
    quality: 'from-purple-500 to-pink-500',
    features: 'from-green-500 to-emerald-500',
  };

  const gradient = gradients[metric.type] || 'from-gray-500 to-gray-600';

  // Trend indicator
  const trendIndicator = metric.trend ? (
    <span
      className={`text-xs ${
        metric.trend === 'up'
          ? 'text-green-600 dark:text-green-400'
          : metric.trend === 'down'
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-600 dark:text-gray-400'
      }`}
    >
      {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
    </span>
  ) : null;

  return (
    <div
      className={`
        group relative overflow-hidden rounded-xl
        bg-gradient-to-br ${gradient}
        p-6 text-white shadow-lg
        transition-all duration-300 ease-in-out
        hover:shadow-2xl hover:scale-105
        ${isCompact ? 'p-4' : 'p-6'}
      `}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent" />
      </div>

      {/* Content */}
      <div className="relative">
        {/* Icon and Trend */}
        <div className="flex items-start justify-between mb-4">
          <span className={`${isCompact ? 'text-3xl' : 'text-4xl'}`}>
            {metric.icon}
          </span>
          {trendIndicator}
        </div>

        {/* Value */}
        <div className={`font-bold mb-2 ${isCompact ? 'text-2xl' : 'text-3xl'}`}>
          {metric.value.toLocaleString()}
        </div>

        {/* Title */}
        <h3 className={`font-semibold mb-1 ${isCompact ? 'text-sm' : 'text-base'}`}>
          {metric.title}
        </h3>

        {/* Description */}
        {!isCompact && (
          <p className="text-sm opacity-90 leading-relaxed">
            {metric.description}
          </p>
        )}
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
    </div>
  );
}
