/**
 * QuickPeek component - Server Component
 * Bento-grid dashboard for impact metrics with glassmorphism cards
 */

import { hasGitHubToken } from '../api/actions';
import { getUserRepositories } from '../api/repository-actions';
import { PatTokenForm } from './PatTokenForm';
import { RepositoryManager } from './RepositoryManager';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

/** Decorative SVG icon for repo rows */
function RepoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="text-muted-foreground"
    >
      <path
        d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9z"
        fill="currentColor"
        fillOpacity="0.5"
      />
    </svg>
  );
}

/** Section header shared across states */
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

export async function QuickPeek() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const tokenResult = await hasGitHubToken();
  const hasToken = tokenResult.data;

  /* ---------- State: No GitHub token ---------- */
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

  /* ---------- State: No repositories ---------- */
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

  /* ---------- State: Dashboard with repos ---------- */
  const repos = reposResult.data;

  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Proof of Work
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Impact Dashboard
            </h2>
          </div>
          <Link
            href="/repositories"
            className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            Manage repos
          </Link>
        </div>

        {/* Bento Grid - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Summary hero card - spans 2 cols on md+ */}
          <div className="glass-card p-8 md:col-span-2 lg:col-span-2 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Connected
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-6xl font-mono font-bold tracking-tight text-foreground metric-glow">
                  {repos.length}
                </span>
                <span className="text-lg text-muted-foreground">
                  {repos.length === 1 ? 'repository' : 'repositories'}
                </span>
              </div>
            </div>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              Impact metrics are cached for 24 hours. Data refreshes
              automatically on your next visit after the cache expires.
            </p>
          </div>

          {/* Status card */}
          <div className="glass-card p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Pipeline
              </p>
              <p className="text-2xl font-semibold text-foreground tracking-tight">
                Active
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Tracking live
              </span>
            </div>
          </div>

          {/* Repository cards */}
          {repos.map((repo) => (
            <div
              key={`${repo.owner}/${repo.repo}`}
              className="glass-card p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <RepoIcon />
                <a
                  href={`https://github.com/${repo.owner}/${repo.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-foreground hover:text-accent transition-colors truncate"
                >
                  {repo.owner}/{repo.repo}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Ready to track
                </span>
                <span className="flex items-center gap-1.5 text-xs font-mono text-success">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
                  Connected
                </span>
              </div>
            </div>
          ))}

          {/* CTA to add more repos if under limit */}
          {repos.length < 10 && (
            <Link
              href="/repositories"
              className="glass-card p-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <svg
                width="16"
                height="16"
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
                Add repository
              </span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
