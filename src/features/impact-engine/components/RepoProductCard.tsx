/**
 * RepoProductCard - treats each repository as a "product" in a portfolio.
 * Horizontal layout with interactive demo on left, product details on right.
 */

import type { ImpactMetric } from '@/types';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code2, Eye, Github, Star, GitFork, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { decodeHtmlEntities } from '@/lib/utils/html';

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
  demoCoverUrl?: string | null; // Optional demo video thumbnail/cover
  demoVideoUrl?: string | null; // Optional demo video URL
  websiteUrl?: string | null; // Optional live website URL
  techStack?: string[]; // Optional array of technologies used
}

interface RepoProductCardProps {
  product: RepoProduct;
  /** When true, card spans 2 columns and metrics are larger */
  featured?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function RepoProductCard({ product, featured = false }: RepoProductCardProps) {
  const {
    owner,
    repo,
    description,
    stars,
    forks,
    metrics,
    techStack,
  } = product;

  const nonZeroMetrics = metrics.filter((m) => m.value > 0);
  const topHighlights = nonZeroMetrics.slice(0, 3);

  // Calculate total users from metrics
  const totalUsers = metrics
    .filter(m => m.type === 'users')
    .reduce((sum, m) => sum + m.value, 0);

  // Horizontal layout with interactive demo
  return (
    <div
      className={cn(
        'glass-card-glow group relative overflow-hidden',
        featured ? 'md:col-span-2' : '',
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Interactive Demo Area */}
        <div className="relative bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-cyan-900/40 flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Code2 className="w-12 h-12 text-white" />
            </div>
            <p className="text-base text-muted-foreground">Interactive Demo</p>
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="p-8 lg:p-10 bg-background/95">
          {/* Top badges */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            {featured && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 px-3 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-foreground font-medium">{stars}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <GitFork className="w-4 h-4 text-blue-400" />
              <span className="text-foreground font-medium">{forks}</span>
            </div>
            {totalUsers > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-foreground font-medium">{totalUsers > 1000 ? `${(totalUsers / 1000).toFixed(1)}k` : totalUsers}</span>
              </div>
            )}
          </div>

          {/* Product Title */}
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {repo}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-muted-foreground leading-relaxed mb-6">
              {decodeHtmlEntities(description)}
            </p>
          )}

          {/* Highlights */}
          {topHighlights.length > 0 && (
            <div className="space-y-3 mb-8">
              {topHighlights.map((highlight) => (
                <div key={highlight.id} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{highlight.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tech Stack */}
          {techStack && techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="px-3 py-1 text-xs bg-secondary/50">
                  {tech}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90"
              asChild
            >
              <a href={`/portfolio/${owner}-${repo}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Full Case Study
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border hover:bg-glass-hover"
              asChild
            >
              <a
                href={`https://github.com/${owner}/${repo}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4 mr-2" />
                View Code
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
