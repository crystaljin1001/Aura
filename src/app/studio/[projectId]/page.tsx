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

  // Fetch logic map (decision tree) from project_technical_journey
  const { data: technicalJourneyData, error: logicMapError } = await supabase
    .from('project_technical_journey')
    .select('tech_decisions_enhanced')
    .eq('repository_url', `${project.repo_owner}/${project.repo_name}`)
    .eq('user_id', user.id)
    .single()

  // Fetch pivot points from separate table
  const { data: pivotPointsData } = await supabase
    .from('project_pivot_points')
    .select('*')
    .eq('repository_url', `${project.repo_owner}/${project.repo_name}`)
    .eq('user_id', user.id)

  console.log('[StudioPage] Fetching logic map for:', `${project.repo_owner}/${project.repo_name}`)
  console.log('[StudioPage] Technical journey data:', technicalJourneyData ? 'Found' : 'Not found')
  console.log('[StudioPage] Logic map error:', logicMapError)
  if (technicalJourneyData) {
    console.log('[StudioPage] Decision nodes count:', technicalJourneyData.tech_decisions_enhanced?.length || 0)
    console.log('[StudioPage] Decision nodes:', JSON.stringify(technicalJourneyData.tech_decisions_enhanced, null, 2))
  }
  console.log('[StudioPage] Pivot points count:', pivotPointsData?.length || 0)

  // Build logic map object
  const logicMap = technicalJourneyData ? {
    decisionNodes: technicalJourneyData.tech_decisions_enhanced || [],
    pivotPoints: pivotPointsData || [],
  } : null

  // Parse the generated_script JSONB field
  const parsedScript = scriptData?.generated_script as any
  const scriptType = scriptData?.script_type || 'user_journey'

  // Build script object based on type
  const scriptObject = parsedScript ? {
    ...parsedScript,
    type: scriptType,
    totalDuration: parsedScript.totalDuration || 165,
  } : null

  // Fetch deployed domain for product UI
  const { data: domainData } = await supabase
    .from('project_domains')
    .select('domain')
    .eq('repository_url', `${project.repo_owner}/${project.repo_name}`)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  const deployedUrl = domainData?.domain ? `https://${domainData.domain}` : null
  console.log('[StudioPage] Deployed URL:', deployedUrl)

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
        domainUrl: deployedUrl,
      }}
      script={scriptObject}
      diagram={diagramData ? {
        mermaidCode: diagramData.mermaid_code,
        type: diagramData.diagram_type,
      } : null}
      logicMap={logicMap}
    />
  )
}
