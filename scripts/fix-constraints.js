#!/usr/bin/env node

/**
 * Script to fix constraint violations and add remaining data
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

async function fixConstraints() {
  try {
    console.log('🔧 Fixing constraint violations...');

    // Add round submissions with proper Google Drive links
    console.log('📝 Adding round submissions with proper links...');
    const submissions = [
      // Round 1 submissions
      {
        round_id: 1,
        team_id: 'DH001',
        registration_number: 'DH001',
        google_drive_link:
          'https://drive.google.com/file/d/1abc123def456ghi789jkl/view',
        youtube_link: null,
        status: 'submitted',
      },
      {
        round_id: 1,
        team_id: 'DH002',
        registration_number: 'DH002',
        google_drive_link:
          'https://drive.google.com/file/d/2def456ghi789jkl123abc/view',
        youtube_link: null,
        status: 'submitted',
      },
      {
        round_id: 1,
        team_id: 'DH003',
        registration_number: 'DH003',
        google_drive_link:
          'https://drive.google.com/file/d/3ghi789jkl123abc456def/view',
        youtube_link: null,
        status: 'submitted',
      },
      {
        round_id: 1,
        team_id: 'DH004',
        registration_number: 'DH004',
        google_drive_link:
          'https://drive.google.com/file/d/4jkl123abc456def789ghi/view',
        youtube_link: null,
        status: 'submitted',
      },
      {
        round_id: 1,
        team_id: 'DH005',
        registration_number: 'DH005',
        google_drive_link:
          'https://drive.google.com/file/d/5abc456def789ghi123jkl/view',
        youtube_link: null,
        status: 'submitted',
      },

      // Round 2 submissions
      {
        round_id: 2,
        team_id: 'DH001',
        registration_number: 'DH001',
        google_drive_link:
          'https://drive.google.com/file/d/6def789ghi123jkl456abc/view',
        youtube_link: null,
        status: 'submitted',
      },
      {
        round_id: 2,
        team_id: 'DH002',
        registration_number: 'DH002',
        google_drive_link:
          'https://drive.google.com/file/d/7ghi123jkl456abc789def/view',
        youtube_link: null,
        status: 'submitted',
      },
      {
        round_id: 2,
        team_id: 'DH003',
        registration_number: 'DH003',
        google_drive_link:
          'https://drive.google.com/file/d/8jkl456abc789def123ghi/view',
        youtube_link: null,
        status: 'submitted',
      },
      {
        round_id: 2,
        team_id: 'DH004',
        registration_number: 'DH004',
        google_drive_link:
          'https://drive.google.com/file/d/9abc789def123ghi456jkl/view',
        youtube_link: null,
        status: 'submitted',
      },

      // Round 3 submissions (with YouTube links)
      {
        round_id: 3,
        team_id: 'DH001',
        registration_number: 'DH001',
        google_drive_link:
          'https://drive.google.com/file/d/10def123ghi456jkl789abc/view',
        youtube_link: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        status: 'submitted',
      },
      {
        round_id: 3,
        team_id: 'DH002',
        registration_number: 'DH002',
        google_drive_link:
          'https://drive.google.com/file/d/11ghi456jkl789abc123def/view',
        youtube_link: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        status: 'submitted',
      },
      {
        round_id: 3,
        team_id: 'DH003',
        registration_number: 'DH003',
        google_drive_link:
          'https://drive.google.com/file/d/12jkl789abc123def456ghi/view',
        youtube_link: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        status: 'submitted',
      },
    ];

    const { error: submissionsError } = await supabase
      .from('round_submissions')
      .insert(submissions);

    if (submissionsError) {
      console.error(
        '❌ Error inserting submissions:',
        submissionsError.message
      );
    } else {
      console.log('✅ Round submissions inserted successfully');
    }

    // Add results (only for regular teams, not BIS teams)
    console.log('🏆 Adding results for regular teams...');
    const results = [
      // Round 1 results
      { team_id: 'DH001', round_id: 1, status: 'passed' },
      { team_id: 'DH002', round_id: 1, status: 'passed' },
      { team_id: 'DH003', round_id: 1, status: 'failed' },
      { team_id: 'DH004', round_id: 1, status: 'passed' },
      { team_id: 'DH005', round_id: 1, status: 'pending' },

      // Round 2 results
      { team_id: 'DH001', round_id: 2, status: 'passed' },
      { team_id: 'DH002', round_id: 2, status: 'passed' },
      { team_id: 'DH003', round_id: 2, status: 'passed' },
      { team_id: 'DH004', round_id: 2, status: 'pending' },

      // Round 3 results
      { team_id: 'DH001', round_id: 3, status: 'passed' },
      { team_id: 'DH002', round_id: 3, status: 'pending' },
      { team_id: 'DH003', round_id: 3, status: 'pending' },
    ];

    const { error: resultsError } = await supabase
      .from('results')
      .insert(results);

    if (resultsError) {
      console.error('❌ Error inserting results:', resultsError.message);
    } else {
      console.log('✅ Results inserted successfully');
    }

    // Test CPM verification
    console.log('🧪 Testing CPM verification...');
    const testCpms = ['cpm 25001', 'cpm 25002', 'cpm 25003'];
    const { data: cpmData, error: cpmError } = await supabase.rpc(
      'get_usj_bis_students',
      { p_cpms: testCpms }
    );

    if (cpmError) {
      console.error('❌ CPM verification test failed:', cpmError.message);
    } else {
      console.log(
        '✅ CPM verification working:',
        cpmData?.length || 0,
        'students found'
      );
    }

    // Get summary of all data
    console.log('\n📊 Data Summary:');

    // Count teams
    const { count: teamCount } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true });
    console.log(`- Regular teams: ${teamCount}`);

    // Count BIS registrations
    const { count: bisCount } = await supabase
      .from('usj_bis_registrations')
      .select('*', { count: 'exact', head: true });
    console.log(`- BIS teams: ${bisCount}`);

    // Count members
    const { count: memberCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true });
    console.log(`- Regular members: ${memberCount}`);

    // Count BIS members
    const { count: bisMemberCount } = await supabase
      .from('usj_bis_members')
      .select('*', { count: 'exact', head: true });
    console.log(`- BIS members: ${bisMemberCount}`);

    // Count submissions
    const { count: submissionCount } = await supabase
      .from('round_submissions')
      .select('*', { count: 'exact', head: true });
    console.log(`- Round submissions: ${submissionCount}`);

    // Count BIS submissions
    const { count: bisSubmissionCount } = await supabase
      .from('usj_bis_round_submissions')
      .select('*', { count: 'exact', head: true });
    console.log(`- BIS submissions: ${bisSubmissionCount}`);

    // Count results
    const { count: resultCount } = await supabase
      .from('results')
      .select('*', { count: 'exact', head: true });
    console.log(`- Results: ${resultCount}`);

    console.log('\n🎉 Test data setup completed successfully!');
    console.log('\n🔗 You can now test:');
    console.log('- CPM verification with: cpm 25001, cpm 25002, cpm 25003');
    console.log(
      '- Results check with team IDs: DH001, DH002, DH003, DH004, DH005'
    );
    console.log('- BIS results with: DHBIS001, DHBIS002, DHBIS003');
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  fixConstraints();
}

module.exports = { fixConstraints };

