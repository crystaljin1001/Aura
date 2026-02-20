/**
 * Verify Aura Repository Status
 *
 * Checks both user_repositories and impact_cache tables
 * Run: node scripts/verify-aura-status.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lyvazfadbbxyrgqprjsf.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dmF6ZmFkYmJ4eXJncXByanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4Mzk4MTEsImV4cCI6MjA4NjQxNTgxMX0.ES6qtoZDRhCFz878zczlGeQpc-Yt5vJLqJUCnHhf07o'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyStatus() {
  console.log('\n🔍 Checking Aura Repository Status...\n')

  // Check 1: Is it in user_repositories? (Added to tracking list)
  console.log('1️⃣  Checking user_repositories table...')
  const { data: userRepos, error: userReposError } = await supabase
    .from('user_repositories')
    .select('*')
    .or('repo_name.ilike.%aura%,repo_name.eq.Aura')

  if (userReposError) {
    console.log('   ❌ Error:', userReposError.message)
  } else if (!userRepos || userRepos.length === 0) {
    console.log('   ❌ Aura NOT in user_repositories table')
    console.log('\n📝 Action needed:')
    console.log('   1. Go to: http://localhost:3000/repositories')
    console.log('   2. In "Manage Repositories", add: crystaljin1001/Aura')
  } else {
    console.log('   ✅ Found in user_repositories:')
    userRepos.forEach(repo => {
      console.log(`      - ${repo.repo_owner}/${repo.repo_name} (added: ${repo.added_at})`)
    })
  }

  // Check 2: Is it in impact_cache? (Metrics calculated)
  console.log('\n2️⃣  Checking impact_cache table...')
  const { data: impactCache, error: impactError } = await supabase
    .from('impact_cache')
    .select('*')
    .or('repo_full_name.ilike.%aura%,repo_full_name.ilike.%Aura%')

  if (impactError) {
    console.log('   ❌ Error:', impactError.message)
  } else if (!impactCache || impactCache.length === 0) {
    console.log('   ❌ Aura NOT in impact_cache table')
    console.log('\n📝 Action needed:')
    console.log('   1. Go to: http://localhost:3000/repositories')
    console.log('   2. Click the "Refresh Impact Data" button (top right)')
    console.log('   3. Wait for it to fetch and calculate metrics (~5-10 seconds)')
    console.log('   4. You should see: "✅ Impact data refreshed successfully!"')
  } else {
    console.log('   ✅ Found in impact_cache:')
    impactCache.forEach(cache => {
      const metricsCount = Array.isArray(cache.impact_metrics) ? cache.impact_metrics.length : 0
      console.log(`      - ${cache.repo_full_name}`)
      console.log(`        Cached: ${cache.cached_at}`)
      console.log(`        Metrics: ${metricsCount} impact metrics`)
    })
  }

  // Check 3: List all repositories in both tables for comparison
  console.log('\n3️⃣  Summary of all tracked repositories...')

  const { data: allUserRepos } = await supabase
    .from('user_repositories')
    .select('repo_owner, repo_name')
    .order('added_at', { ascending: false })

  const { data: allImpact } = await supabase
    .from('impact_cache')
    .select('repo_full_name')
    .order('cached_at', { ascending: false })

  console.log('\n   📋 In user_repositories:')
  if (allUserRepos && allUserRepos.length > 0) {
    allUserRepos.forEach(repo => {
      const hasImpact = allImpact?.some(i =>
        i.repo_full_name === `${repo.repo_owner}/${repo.repo_name}`
      )
      const status = hasImpact ? '✅' : '⚠️ '
      console.log(`      ${status} ${repo.repo_owner}/${repo.repo_name}`)
    })
  } else {
    console.log('      (none)')
  }

  console.log('\n   💾 In impact_cache:')
  if (allImpact && allImpact.length > 0) {
    allImpact.forEach(cache => {
      console.log(`      ✅ ${cache.repo_full_name}`)
    })
  } else {
    console.log('      (none)')
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n💡 TIP: Repositories in user_repositories without ✅ need')
  console.log('   the "Refresh Impact Data" button clicked to calculate metrics.\n')
}

verifyStatus().catch(console.error)
