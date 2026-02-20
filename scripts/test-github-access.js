/**
 * Test GitHub API Access
 *
 * Tests if your GitHub token can access the Aura repository
 * Run: node scripts/test-github-access.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://lyvazfadbbxyrgqprjsf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dmF6ZmFkYmJ4eXJncXByanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4Mzk4MTEsImV4cCI6MjA4NjQxNTgxMX0.ES6qtoZDRhCFz878zczlGeQpc-Yt5vJLqJUCnHhf07o'

async function testGitHubAccess() {
  console.log('\n🔍 Testing GitHub API Access...\n')

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Get GitHub token (you'll need to be logged in)
  console.log('⚠️  Note: This requires you to be logged in to Supabase')
  console.log('   If you see errors, try accessing from the browser with auth\n')

  // Test 1: Check if token exists
  console.log('1️⃣  Checking if GitHub token exists...')
  const { data: tokenData, error: tokenError } = await supabase
    .from('github_tokens')
    .select('created_at')
    .limit(1)
    .single()

  if (tokenError) {
    console.log('❌ No GitHub token found or access denied')
    console.log('   Error:', tokenError.message)
    console.log('\n📝 Next steps:')
    console.log('   1. Go to: http://localhost:3000/repositories')
    console.log('   2. Add your GitHub Personal Access Token')
    return
  }

  console.log('✅ GitHub token exists (created:', tokenData.created_at, ')\n')

  // Test 2: Check which repos are tracked
  console.log('2️⃣  Checking tracked repositories...')
  const { data: repos, error: reposError } = await supabase
    .from('impact_cache')
    .select('repo_full_name, cached_at')
    .order('cached_at', { ascending: false })
    .limit(10)

  if (reposError) {
    console.log('❌ Error fetching repositories:', reposError.message)
    return
  }

  if (!repos || repos.length === 0) {
    console.log('❌ No repositories tracked yet\n')
    console.log('📝 Next steps:')
    console.log('   1. Go to: http://localhost:3000/repositories')
    console.log('   2. Click "Add Repository"')
    console.log('   3. Enter: crystaljin1001/Aura')
    return
  }

  console.log(`✅ Found ${repos.length} tracked repositories:\n`)
  repos.forEach((repo, i) => {
    const isAura = repo.repo_full_name.toLowerCase().includes('aura')
    const prefix = isAura ? '  👉' : '    '
    console.log(`${prefix} ${i + 1}. ${repo.repo_full_name}`)
  })

  const hasAura = repos.some(r =>
    r.repo_full_name.toLowerCase() === 'crystaljin1001/aura' ||
    r.repo_full_name === 'crystaljin1001/Aura'
  )

  console.log('')

  if (!hasAura) {
    console.log('❌ Aura repository NOT in tracking system\n')
    console.log('📝 To add it:')
    console.log('   1. Go to: http://localhost:3000/repositories')
    console.log('   2. Look for "Add Repository" or "Import Repository"')
    console.log('   3. Enter: crystaljin1001/Aura')
    console.log('   4. Click "Add" or "Track"')
  } else {
    console.log('✅ Aura repository IS tracked!\n')
    console.log('   If you still see warnings, try:')
    console.log('   1. Hard refresh: Cmd+Shift+R')
    console.log('   2. Check metrics: node scripts/check-impact-status.js crystaljin1001/Aura')
  }
}

testGitHubAccess().catch(err => {
  console.error('\n❌ Error:', err.message)
  console.log('\n💡 This script needs authentication.')
  console.log('   Try using the browser at: http://localhost:3000/repositories')
})
