/**
 * RepoProductCard - treats each repository as a "product" in a portfolio.
 * Displays repo metadata, language badge, and impact metrics
 * as prominent hero numbers inside a glassmorphism bento card.
 */

import type { ImpactMetric } from '@/types';
import { cn } from '@/utils/cn';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface RepoProduct {
  owner: string;
  repo: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  pushedAt: string;
  metrics: ImpactMetric[];
  lastUpdated: Date | null;
}

interface RepoProductCardProps {
  product: RepoProduct;
  /** When true, card spans 2 columns and metrics are larger */
  featured?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Language dot colors (subset of GitHub's) */
const langColors: Record<string, string> = {
  TypeScript: 'bg-blue-400',
  JavaScript: 'bg-yellow-400',
  Python: 'bg-emerald-400',
  Rust: 'bg-orange-400',
  Go: 'bg-cyan-400',
  Java: 'bg-red-400',
  Ruby: 'bg-red-500',
  'C++': 'bg-pink-400',
  C: 'bg-violet-400',
  Swift: 'bg-orange-500',
  Kotlin: 'bg-purple-400',
  Shell: 'bg-green-500',
};

/** Accent color per metric type for the big number */
const metricColors: Record<string, string> = {
  issues_resolved: 'text-red-400',
  performance: 'text-amber-400',
  users: 'text-blue-400',
  quality: 'text-emerald-400',
  features: 'text-cyan-400',
};

function formatRelativeTime(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
    </svg>
  );
}

function ForkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function RepoProductCard({ product, featured = false }: RepoProductCardProps) {
  const {
    owner,
    repo,
    description,
    language,
    stars,
    forks,
    pushedAt,
    metrics,
  } = product;

  const nonZeroMetrics = metrics.filter((m) => m.value > 0);
  const topMetrics = featured ? nonZeroMetrics.slice(0, 5) : nonZeroMetrics.slice(0, 3);
  const langDot = language ? (langColors[language] ?? 'bg-muted-foreground') : null;

  return (
    <div
      className={cn(
        'glass-card group relative flex flex-col overflow-hidden',
        featured ? 'md:col-span-2 p-8' : 'p-6',
      )}
    >
      {/* ---- Header: repo name + pushed-at ---- */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0 flex-1">
          <a
            href={`https://github.com/${owner}/${repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'block font-semibold text-foreground hover:text-accent transition-colors truncate',
              featured ? 'text-xl' : 'text-base',
            )}
          >
            {repo}
          </a>
          <span className="text-xs text-muted-foreground font-mono">{owner}</span>
        </div>
        {pushedAt && (
          <span className="shrink-0 text-xs text-muted-foreground font-mono">
            {formatRelativeTime(pushedAt)}
          </span>
        )}
      </div>

      {/* ---- Description ---- */}
      {description && (
        <p className={cn(
          'text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-2',
          featured && 'line-clamp-3',
        )}>
          {description}
        </p>
      )}

      {/* ---- Impact metrics grid (hero numbers) ---- */}
      {topMetrics.length > 0 && (
        <div className={cn(
          'grid gap-4 mb-6',
          featured
            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
            : 'grid-cols-2 sm:grid-cols-3',
        )}>
          {topMetrics.map((m) => (
            <div key={m.id} className="flex flex-col">
              <span
                className={cn(
                  'font-mono font-bold tracking-tight leading-none',
                  featured ? 'text-4xl' : 'text-3xl',
                  metricColors[m.type] ?? 'text-foreground',
                )}
              >
                {m.value.toLocaleString()}
              </span>
              <span className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {m.title.replace(/^(Critical )?/, '')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* No metrics yet state */}
      {topMetrics.length === 0 && (
        <div className="flex-1 flex items-center justify-center py-6">
          <span className="text-xs text-muted-foreground">
            Impact data processing...
          </span>
        </div>
      )}

      {/* ---- Footer: language + stars/forks ---- */}
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-3">
          {language && langDot && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn('inline-block h-2 w-2 rounded-full', langDot)} />
              {language}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <StarIcon />
            <span className="font-mono">{stars.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-1">
            <ForkIcon />
            <span className="font-mono">{forks.toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* Hover accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-accent/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
