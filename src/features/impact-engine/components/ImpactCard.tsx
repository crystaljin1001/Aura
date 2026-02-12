/**
 * Impact Card component
 * Displays individual impact metric in a glassmorphism card
 * with prominent metric value as the hero element
 */

import type { ImpactMetric } from '@/types';
import { cn } from '@/utils/cn';

interface ImpactCardProps {
  metric: ImpactMetric;
  variant?: 'compact' | 'detailed' | 'hero';
}

/** Accent dot color per metric type */
const accentColors: Record<string, string> = {
  issues_resolved: 'bg-red-500',
  performance: 'bg-amber-500',
  users: 'bg-accent',
  quality: 'bg-emerald-500',
  features: 'bg-cyan-500',
};

/** Subtle glow color per metric type for the value */
const valueGlows: Record<string, string> = {
  issues_resolved: 'text-red-400',
  performance: 'text-amber-400',
  users: 'text-accent',
  quality: 'text-emerald-400',
  features: 'text-cyan-400',
};

export function ImpactCard({ metric, variant = 'detailed' }: ImpactCardProps) {
  const isCompact = variant === 'compact';
  const isHero = variant === 'hero';
  const dotColor = accentColors[metric.type] ?? 'bg-muted-foreground';
  const valueColor = valueGlows[metric.type] ?? 'text-foreground';

  const trendArrow =
    metric.trend === 'up' ? '\u2191' : metric.trend === 'down' ? '\u2193' : null;

  const trendColor =
    metric.trend === 'up'
      ? 'text-success'
      : metric.trend === 'down'
        ? 'text-destructive'
        : 'text-muted-foreground';

  return (
    <div
      className={cn(
        'glass-card group relative flex flex-col justify-between overflow-hidden',
        isHero ? 'p-8' : isCompact ? 'p-4' : 'p-6',
      )}
    >
      {/* Header row: dot label + trend */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={cn('inline-block h-2 w-2 rounded-full', dotColor)} />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {metric.title}
          </span>
        </div>
        {trendArrow && (
          <span className={cn('text-xs font-mono font-medium', trendColor)}>
            {trendArrow}
          </span>
        )}
      </div>

      {/* Hero metric value */}
      <div
        className={cn(
          'font-mono font-bold tracking-tight leading-none',
          isHero ? 'text-6xl' : isCompact ? 'text-3xl' : 'text-5xl',
          valueColor,
          isHero && 'metric-glow',
        )}
      >
        {metric.value.toLocaleString()}
      </div>

      {/* Description */}
      {!isCompact && (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {metric.description}
        </p>
      )}

      {/* Subtle bottom highlight on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border-hover opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
