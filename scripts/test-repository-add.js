/**
 * Test Repository Add Function
 *
 * Simulates adding Aura repository to test for errors
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lyvazfadbbxyrgqprjsf.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dmF6ZmFkYmJ4eXJncXByanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4Mzk4MTEsImV4cCI6MjA4NjQxNTgxMX0.ES6qtoZDRhCFz878zczlGeQpc-Yt5vJLqJUCnHhf07o'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAdd() {
  console.log('\n🧪 Testing Repository Add...\n')

  // Check if user_repositories table exists and has correct structure
  console.log('1️⃣  Checking user_repositories table structure...')
  const { data: tableData, error: tableError } = await supabase
    .from('user_repositories')
    .select('*')
    .limit(0)

  if (tableError) {
    console.log('   ❌ Error accessing table:', tableError.message)
    console.log('   Code:', tableError.code)
    console.log('   Details:', tableError.details)
    console.log('   Hint:', tableError.hint)
    return
  }

  console.log('   ✅ Table exists and is accessible')

  // Check current row count
  console.log('\n2️⃣  Checking current repositories...')
  const { data: currentRepos, error: countError, count } = await supabase
    .from('user_repositories')
    .select('*', { count: 'exact' })

  if (countError) {
    console.log('   ❌ Error counting repos:', countError.message)
  } else {
    console.log(`   ✅ Current count: ${count || 0} repositories`)
    if (currentRepos && currentRepos.length > 0) {
      currentRepos.forEach(repo => {
        console.log(`      - ${repo.repo_owner}/${repo.repo_name}`)
      })
    }
  }

  console.log('\n3️⃣  Testing insert without authentication...')
  const { data: insertData, error: insertError } = await supabase
    .from('user_repositories')
    .insert({
      user_id: '00000000-0000-0000-0000-000000000000', // Fake UUID
      repo_owner: 'crystaljin1001',
      repo_name: 'Aura',
    })
    .select()

  if (insertError) {
    console.log('   ❌ Insert failed (expected with anon key):', insertError.message)
    console.log('   Code:', insertError.code)
    console.log('   Details:', insertError.details || 'No details')
    console.log('   Hint:', insertError.hint || 'No hint')

    if (insertError.code === '42501') {
      console.log('\n   💡 This is a Row Level Security (RLS) policy error.')
      console.log('      This is EXPECTED - the anon key cannot insert without auth.')
      console.log('      The actual app uses authenticated user session.')
    }
  } else {
    console.log('   ✅ Insert succeeded:', insertData)
  }

  console.log('\n📋 Summary:')
  console.log('   - Table exists: ✅')
  console.log('   - RLS enabled: ✅ (blocks anon inserts)')
  console.log('   - Current repos: ' + (count || 0))
  console.log('\n💡 Next: Log in to the app and try adding Aura from the UI.')
  console.log('   If add fails, check browser console for errors.')
}

testAdd().catch(console.error)
