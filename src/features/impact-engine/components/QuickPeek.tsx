/**
 * QuickPeek - Server Component
 * Portfolio-style dashboard that treats each repo as a "product".
 * Fetches real impact data and renders a responsive bento grid.
 */

import { hasGitHubToken, getImpactData } from '../api/actions';
import { getUserRepositories } from '../api/repository-actions';
import { PatTokenForm } from './PatTokenForm';
import { RepositoryManager } from './RepositoryManager';
import { RepoProductCard, type RepoProduct } from './RepoProductCard';
import { RateLimitWarning } from './RateLimitWarning';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Shared section header                                              */
/* ------------------------------------------------------------------ */

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-10">
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
        Proof of Work
      </p>
      <h2 className="text-3xl font-bold tracking-tight text-foreground text-balance">
        {title}
      </h2>
      <p className="mt-2 text-base text-muted-foreground max-w-xl">
        {description}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Aggregate stats row                                                */
/* ------------------------------------------------------------------ */

function AggregateStats({ products }: { products: RepoProduct[] }) {
  const totalMetrics = products.flatMap((p) => p.metrics);
  const totalStars = products.reduce((s, p) => s + p.stars, 0);
  const totalForks = products.reduce((s, p) => s + p.forks, 0);

  const byType = (type: string) =>
    totalMetrics.filter((m) => m.type === type).reduce((s, m) => s + m.value, 0);

  const stats = [
    { label: 'Stars', value: totalStars, color: 'text-amber-400' },
    { label: 'Forks', value: totalForks, color: 'text-blue-400' },
    { label: 'Issues Fixed', value: byType('issues_resolved'), color: 'text-red-400' },
    { label: 'Features', value: byType('features'), color: 'text-cyan-400' },
    { label: 'Quality Fixes', value: byType('quality'), color: 'text-emerald-400' },
  ].filter((s) => s.value > 0);

  if (stats.length === 0) return null;

  return (
    <div className="glass-card p-6 md:p-8 mb-4">
      <div className="flex flex-wrap gap-x-10 gap-y-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col">
            <span className={`font-mono font-bold text-3xl md:text-4xl tracking-tight leading-none ${s.color}`}>
              {s.value.toLocaleString()}
            </span>
            <span className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export async function QuickPeek() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const tokenResult = await hasGitHubToken();
  const hasToken = tokenResult.data;

  /* -------- State: No GitHub token -------- */
  if (!hasToken) {
    return (
      <section className="w-full py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            title="Impact Dashboard"
            description="Connect your GitHub account to surface the metrics that matter."
          />
          <PatTokenForm />
        </div>
      </section>
    );
  }

  /* -------- State: No repositories -------- */
  const reposResult = await getUserRepositories();

  if (
    !reposResult.success ||
    !reposResult.data ||
    reposResult.data.length === 0
  ) {
    return (
      <section className="w-full py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            title="Impact Dashboard"
            description="Add repositories to begin tracking your proof of work."
          />
          <RepositoryManager />
        </div>
      </section>
    );
  }

  /* -------- Fetch impact data for all repos -------- */
  const repos = reposResult.data;
  const impactResult = await getImpactData(repos);

  // Build product objects by pairing repo identifiers with impact data + cached metadata
  const products: RepoProduct[] = [];

  if (impactResult.success && impactResult.data) {
    for (const repoId of repos) {
      const fullName = `${repoId.owner}/${repoId.repo}`;
      const impact = impactResult.data.find((d) => d.repoFullName === fullName);

      // Try to pull cached repo_data for richer metadata
      let description: string | null = null;
      let language: string | null = null;
      let stars = 0;
      let forks = 0;
      let openIssues = 0;
      let pushedAt = '';

      const { data: cached } = await supabase
        .from('impact_cache')
        .select('repo_data')
        .eq('user_id', user.id)
        .eq('repo_full_name', fullName)
        .single();

      if (cached?.repo_data) {
        const rd = cached.repo_data as Record<string, unknown>;
        description = (rd.description as string) || null;
        language = (rd.language as string) || null;
        stars = Number(rd.stargazersCount) || 0;
        forks = Number(rd.forksCount) || 0;
        openIssues = Number(rd.openIssuesCount) || 0;
        pushedAt = (rd.pushedAt as string) || '';
      }

      products.push({
        owner: repoId.owner,
        repo: repoId.repo,
        description,
        language,
        stars,
        forks,
        openIssues,
        pushedAt,
        metrics: impact?.metrics ?? [],
        lastUpdated: impact?.lastUpdated ?? null,
      });
    }
  } else {
    // Fallback: no impact data but we still know which repos exist
    for (const repoId of repos) {
      products.push({
        owner: repoId.owner,
        repo: repoId.repo,
        description: null,
        language: null,
        stars: 0,
        forks: 0,
        openIssues: 0,
        pushedAt: '',
        metrics: [],
        lastUpdated: null,
      });
    }
  }

  /* -------- Render: Portfolio -------- */
  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header row */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Proof of Work
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Portfolio
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              {products.length} {products.length === 1 ? 'project' : 'projects'} tracked
            </p>
          </div>
          <Link
            href="/repositories"
            className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            Manage
          </Link>
        </div>

        {/* Rate limit warning */}
        <div className="mb-4">
          <RateLimitWarning />
        </div>

        {/* Aggregate stats row */}
        <AggregateStats products={products} />

        {/* Product bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product, i) => (
            <RepoProductCard
              key={`${product.owner}/${product.repo}`}
              product={product}
              featured={i === 0 && products.length > 1}
            />
          ))}

          {/* Add more CTA */}
          {products.length < 10 && (
            <Link
              href="/repositories"
              className="glass-card p-8 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-foreground transition-colors group min-h-[160px]"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="text-muted-foreground group-hover:text-foreground transition-colors"
              >
                <path
                  d="M8 1v14M1 8h14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-mono text-xs uppercase tracking-wider">
                Add project
              </span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
