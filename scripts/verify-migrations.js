/**
 * Verify Evidence Engine migrations
 *
 * Checks that:
 * 1. architectural_tradeoffs column exists on project_technical_journey
 * 2. project_critiques table exists
 * 3. project_improvements table exists
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyMigrations() {
  console.log('🔍 Verifying Evidence Engine migrations...\n')

  try {
    // Check 1: Verify project_technical_journey has new column
    console.log('1️⃣  Checking project_technical_journey table...')
    const { data: journeyTest, error: journeyError } = await supabase
      .from('project_technical_journey')
      .select('architectural_tradeoffs')
      .limit(1)

    if (journeyError) {
      console.error('❌ Error querying project_technical_journey:', journeyError.message)
      if (journeyError.message.includes('column')) {
        console.error('   → Migration #1 may not be applied correctly')
      }
    } else {
      console.log('✅ project_technical_journey has architectural_tradeoffs column')
    }

    // Check 2: Verify project_critiques table
    console.log('\n2️⃣  Checking project_critiques table...')
    const { data: critiqueTest, error: critiqueError } = await supabase
      .from('project_critiques')
      .select('id')
      .limit(1)

    if (critiqueError) {
      console.error('❌ Error accessing project_critiques:', critiqueError.message)
      if (critiqueError.code === '42P01') {
        console.error('   → Table does not exist. Migration #2 may not be applied.')
      }
    } else {
      console.log('✅ project_critiques table exists and is accessible')
    }

    // Check 3: Verify project_improvements table
    console.log('\n3️⃣  Checking project_improvements table...')
    const { data: improvementTest, error: improvementError } = await supabase
      .from('project_improvements')
      .select('id')
      .limit(1)

    if (improvementError) {
      console.error('❌ Error accessing project_improvements:', improvementError.message)
      if (improvementError.code === '42P01') {
        console.error('   → Table does not exist. Migration #2 may not be applied.')
      }
    } else {
      console.log('✅ project_improvements table exists and is accessible')
    }

    console.log('\n✨ Migration verification complete!')
    console.log('\n📝 Next steps:')
    console.log('   1. Go to: http://localhost:3001/dashboard')
    console.log('   2. Edit a project\'s Technical Journey')
    console.log('   3. Try adding:')
    console.log('      - Architectural Trade-offs (new section)')
    console.log('      - Tech Decisions with alternatives and benefits/drawbacks')
    console.log('      - GitHub evidence links')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

verifyMigrations()
