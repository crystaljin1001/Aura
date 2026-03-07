import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudioMode } from '@/features/studio/components/StudioMode'

interface StudioPageProps {
  params: Promise<{ projectId: string }>
}

export default async function StudioPage({ params }: StudioPageProps) {
  const { projectId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch project data
  const { data: project } = await supabase
    .from('user_repositories')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) {
    redirect('/dashboard')
  }

  // Fetch script
  const { data: scriptData } = await supabase
    .from('narrative_scripts')
    .select('*')
    .eq('repository_url', `${project.repo_owner}/${project.repo_name}`)
    .eq('user_id', user.id)
    .single()

  // Fetch architecture diagram
  const { data: diagramData } = await supabase
    .from('architecture_diagrams')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .single()

  return (
    <StudioMode
      project={{
        id: project.id,
        name: project.title || `${project.repo_owner}/${project.repo_name}`,
        repository: `${project.repo_owner}/${project.repo_name}`,
        description: project.description,
        hasScript: !!scriptData,
        hasVideo: !!project.video_url,
        status: project.status || 'new',
        completeness: null,
        draftData: project.draft_data,
      }}
      script={scriptData ? {
        hook: scriptData.hook,
        problem: scriptData.problem,
        solution: scriptData.solution,
        impact: scriptData.impact,
        cta: scriptData.cta,
        totalDuration: scriptData.total_duration,
        type: scriptData.script_type || 'user_journey',
      } : null}
      diagram={diagramData ? {
        mermaidCode: diagramData.mermaid_code,
        type: diagramData.diagram_type,
      } : null}
    />
  )
}
