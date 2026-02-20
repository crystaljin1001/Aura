/**
 * Check Impact Metrics Status
 *
 * Run: node scripts/check-impact-status.js crystaljin1001/Aura
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lyvazfadbbxyrgqprjsf.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dmF6ZmFkYmJ4eXJncXByanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4Mzk4MTEsImV4cCI6MjA4NjQxNTgxMX0.ES6qtoZDRhCFz878zczlGeQpc-Yt5vJLqJUCnHhf07o'

const repository = process.argv[2] || 'crystaljin1001/Aura'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkStatus() {
  console.log(`\n🔍 Checking impact status for: ${repository}\n`)

  // Check if repository has impact cache
  const { data: impactData, error: impactError } = await supabase
    .from('impact_cache')
    .select('*')
    .eq('repo_full_name', repository)
    .single()

  if (impactError) {
    if (impactError.code === 'PGRST116') {
      console.log('❌ Repository NOT in impact_cache')
      console.log('\n📝 Next steps:')
      console.log('   1. Go to: http://localhost:3000/repositories')
      console.log('   2. Add your GitHub Personal Access Token')
      console.log('   3. Click "Add Repository" or wait for automatic sync')
      return
    }
    console.error('Error:', impactError)
    return
  }

  console.log('✅ Repository found in impact_cache')
  console.log(`   - Cached at: ${impactData.cached_at}`)
  console.log(`   - Has repo data: ${!!impactData.repo_data}`)

  // Check impact metrics
  const { data: metrics, error: metricsError } = await supabase
    .from('impact_metrics')
    .select('*')
    .eq('repository', repository)

  if (metricsError) {
    console.error('Error fetching metrics:', metricsError)
    return
  }

  console.log(`\n📊 Impact Metrics: ${metrics?.length || 0} metrics`)

  if (metrics && metrics.length > 0) {
    const nonZero = metrics.filter(m => m.value > 0)
    console.log(`   - Non-zero metrics: ${nonZero.length}`)

    console.log('\n   Metrics breakdown:')
    metrics.forEach(m => {
      if (m.value > 0) {
        console.log(`   ✓ ${m.metric_type}: ${m.value}`)
      }
    })
  } else {
    console.log('   ⚠️  No metrics calculated yet')
    console.log('\n📝 Next steps:')
    console.log('   1. Make sure GitHub token is configured')
    console.log('   2. Go to: http://localhost:3000/repositories')
    console.log('   3. Click "Refresh Metrics" or wait for automatic sync (24 hours)')
  }
}

checkStatus().catch(console.error)
