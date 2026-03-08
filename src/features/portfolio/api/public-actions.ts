'use server'

/**
 * Public portfolio data actions — no auth required.
 * Uses public RLS policies to read data for the portfolio owner.
 */

import { createClient } from '@/lib/supabase/server'
import type { ImpactMetric } from '@/types'
import type { TechDecisionNode, PivotPoint } from '../types/logic-map'

export interface PublicProjectData {
  owner: string
  repo: string
  repositoryUrl: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  videoUrl: string | null
  thumbnailUrl: string | null
  websiteUrl: string | null
  metrics: ImpactMetric[]
  architectureDiagram: { mermaidCode: string; type: string } | null
  logicMap: {
    decisionNodes: TechDecisionNode[]
    pivotPoints: PivotPoint[]
    enabled: boolean
  }
}

export async function getPublicProjectData(
  repositoryParam: string
): Promise<{ success: true; data: PublicProjectData } | { success: false; error: string }> {
  try {
    const db = await createClient()

    // Parse owner/repo from URL param (format: owner-repo, first hyphen is separator)
    const firstHyphen = repositoryParam.indexOf('-')
    if (firstHyphen === -1) return { success: false, error: 'Invalid repository format' }

    const owner = repositoryParam.slice(0, firstHyphen)
    const repo = repositoryParam.slice(firstHyphen + 1)
    const repositoryUrl = `${owner}/${repo}`

    // ── Find the portfolio owner ──────────────────────────────────
    const { data: repoRow } = await db
      .from('user_repositories')
      .select('user_id, repo_owner, repo_name')
      .eq('repo_owner', owner)
      .eq('repo_name', repo)
      .single()

    if (!repoRow) return { success: false, error: 'Project not found' }

    const userId = repoRow.user_id

    // ── Parallel data fetch ───────────────────────────────────────
    const [
      impactResult,
      videoResult,
      diagramResult,
      journeyResult,
      pivotsResult,
    ] = await Promise.all([
      db
        .from('impact_cache')
        .select('repo_data, impact_metrics')
        .eq('user_id', userId)
        .eq('repo_full_name', repositoryUrl)
        .single(),
      db
        .from('project_videos')
        .select('video_url, thumbnail_url')
        .eq('user_id', userId)
        .eq('repository_url', repositoryUrl)
        .single(),
      db
        .from('architecture_diagrams')
        .select('mermaid_code, diagram_type')
        .eq('user_id', userId)
        .eq('repository_url', repositoryUrl)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      db
        .from('project_technical_journey')
        .select('tech_decisions_enhanced, logic_map_enabled')
        .eq('user_id', userId)
        .eq('repository_url', repositoryUrl)
        .single(),
      db
        .from('project_pivot_points')
        .select('*')
        .eq('user_id', userId)
        .eq('repository_url', repositoryUrl)
        .order('sequence_order', { ascending: true }),
    ])

    // ── Parse repo metadata ───────────────────────────────────────
    const rd = (impactResult.data?.repo_data ?? {}) as Record<string, unknown>
    const rawMetrics = impactResult.data?.impact_metrics

    const metrics: ImpactMetric[] = Array.isArray(rawMetrics)
      ? (rawMetrics as ImpactMetric[]).filter((m) => m.value > 0)
      : []

    // ── Architecture diagram ──────────────────────────────────────
    const architectureDiagram = diagramResult.data
      ? {
          mermaidCode: diagramResult.data.mermaid_code,
          type: diagramResult.data.diagram_type ?? 'flowchart',
        }
      : null

    // ── Logic Map ─────────────────────────────────────────────────
    const decisionNodes = (journeyResult.data?.tech_decisions_enhanced as TechDecisionNode[]) || []
    const logicMapEnabled = journeyResult.data?.logic_map_enabled ?? false

    const pivotPoints: PivotPoint[] = (pivotsResult.data ?? []).map((p) => ({
      id: p.id,
      challenge: p.challenge,
      initialApproach: p.initial_approach,
      pivotReasoning: p.pivot_reasoning,
      newApproach: p.new_approach,
      outcome: p.outcome ?? undefined,
      impactMetric: p.impact_metric ?? undefined,
      evidenceLink: p.evidence_link ?? undefined,
      commitSha: p.commit_sha ?? undefined,
      pivotDate: p.pivot_date ?? undefined,
      sequenceOrder: p.sequence_order ?? 0,
    }))

    return {
      success: true,
      data: {
        owner,
        repo,
        repositoryUrl,
        description: (rd.description as string) || (rd.tldr as string) || null,
        language: (rd.language as string) || null,
        stars: Number(rd.stargazersCount) || 0,
        forks: Number(rd.forksCount) || 0,
        videoUrl: videoResult.data?.video_url ?? null,
        thumbnailUrl: videoResult.data?.thumbnail_url ?? null,
        websiteUrl: null,
        metrics,
        architectureDiagram,
        logicMap: {
          decisionNodes,
          pivotPoints,
          enabled: logicMapEnabled,
        },
      },
    }
  } catch (err) {
    console.error('[getPublicProjectData]', err)
    return { success: false, error: 'Failed to load project' }
  }
}
