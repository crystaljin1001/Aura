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
import { createClient } from '@/lib/supabase/server';

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

// @ts-expect-error - AggregateStats is planned for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        demoCoverUrl: null, // TODO: Fetch from storyboard/demo data
        demoVideoUrl: null, // TODO: Fetch from storyboard/demo data
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
        demoCoverUrl: null,
        demoVideoUrl: null,
      });
    }
  }

  /* -------- Render: Portfolio -------- */
  return (
    <section id="products" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
            Products
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Things I've{' '}
            <span className="gradient-text">built</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            A collection of products I've shipped. Each one solves a real problem I faced as a builder.
          </p>
        </div>

        {/* Product stack - horizontal cards */}
        <div className="space-y-8 mb-12">
          {products.map((product, i) => (
            <RepoProductCard
              key={`${product.owner}/${product.repo}`}
              product={product}
              featured={i === 0 && products.length > 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
