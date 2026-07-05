#!/usr/bin/env node

/**
 * Script to insert test data into the DHACK database
 * This creates dummy teams, members, and submissions for testing the admin dashboard
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error(
    'Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

async function executeSQLFile() {
  try {
    console.log('🚀 Starting test data insertion...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-test-data.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          // Some errors are expected (like conflicts), so we'll log them but continue
          if (
            error.message.includes('duplicate key') ||
            error.message.includes('conflict') ||
            error.message.includes('already exists')
          ) {
            console.log(
              `⚠️  Statement ${i + 1}: ${error.message} (expected - skipping)`
            );
          } else {
            console.error(`❌ Statement ${i + 1} failed:`, error.message);
            errorCount++;
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Statement ${i + 1} error:`, err.message);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 All test data inserted successfully!');
    } else {
      console.log(
        '\n⚠️  Some statements had errors, but this might be expected (duplicates, etc.)'
      );
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Alternative approach: Execute statements directly
async function executeStatementsDirectly() {
  try {
    console.log('🚀 Starting test data insertion (direct approach)...');

    // Test connection first
    console.log('🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('teams')
      .select('count')
      .limit(1);

    if (testError) {
      throw new Error(`Database connection failed: ${testError.message}`);
    }

    console.log('✅ Database connection successful');

    // Insert USJ BIS students
    console.log('👥 Inserting USJ BIS students...');
    const bisStudents = [
      {
        cpm_number: 'cpm 25001',
        full_name: 'Niruma Fernando',
        name_with_initials: 'N. Fernando',
        university_reg_no: '2021/BIS/001',
        email: 'niruma.fernando@usj.ac.lk',
        academic_year: 3,
      },
      {
        cpm_number: 'cpm 25002',
        full_name: 'Samantha Perera',
        name_with_initials: 'S. Perera',
        university_reg_no: '2021/BIS/002',
        email: 'samantha.perera@usj.ac.lk',
        academic_year: 3,
      },
      {
        cpm_number: 'cpm 25003',
        full_name: 'Dilshan Rajapaksa',
        name_with_initials: 'D. Rajapaksa',
        university_reg_no: '2021/BIS/003',
        email: 'dilshan.rajapaksa@usj.ac.lk',
        academic_year: 3,
      },
      {
        cpm_number: 'cpm 25004',
        full_name: 'Priya Silva',
        name_with_initials: 'P. Silva',
        university_reg_no: '2022/BIS/001',
        email: 'priya.silva@usj.ac.lk',
        academic_year: 2,
      },
      {
        cpm_number: 'cpm 25005',
        full_name: 'Kavindu Jayawardena',
        name_with_initials: 'K. Jayawardena',
        university_reg_no: '2022/BIS/002',
        email: 'kavindu.jayawardena@usj.ac.lk',
        academic_year: 2,
      },
      {
        cpm_number: 'cpm 25006',
        full_name: 'Anjali Wickramasinghe',
        name_with_initials: 'A. Wickramasinghe',
        university_reg_no: '2022/BIS/003',
        email: 'anjali.wickramasinghe@usj.ac.lk',
        academic_year: 2,
      },
      {
        cpm_number: 'cpm 25007',
        full_name: 'Ravindu Bandara',
        name_with_initials: 'R. Bandara',
        university_reg_no: '2023/BIS/001',
        email: 'ravindu.bandara@usj.ac.lk',
        academic_year: 1,
      },
      {
        cpm_number: 'cpm 25008',
        full_name: 'Tharushi Gunasekara',
        name_with_initials: 'T. Gunasekara',
        university_reg_no: '2023/BIS/002',
        email: 'tharushi.gunasekara@usj.ac.lk',
        academic_year: 1,
      },
      {
        cpm_number: 'cpm 25009',
        full_name: 'Dinuka Mendis',
        name_with_initials: 'D. Mendis',
        university_reg_no: '2023/BIS/003',
        email: 'dinuka.mendis@usj.ac.lk',
        academic_year: 1,
      },
    ];

    const { error: bisError } = await supabase
      .from('usj_bis_students')
      .upsert(bisStudents, { onConflict: 'cpm_number' });

    if (bisError) {
      console.error('❌ Error inserting BIS students:', bisError.message);
    } else {
      console.log('✅ USJ BIS students inserted successfully');
    }

    // Insert regular teams
    console.log('🏆 Inserting regular teams...');
    const teams = [
      { team_name: 'Team Phoenix', university: 'University of Colombo' },
      { team_name: 'Team Innovators', university: 'University of Moratuwa' },
      { team_name: 'Team Tech Titans', university: 'University of Peradeniya' },
      { team_name: 'Team Code Warriors', university: 'University of Kelaniya' },
      {
        team_name: 'Team Digital Dreamers',
        university: 'University of Ruhuna',
      },
    ];

    const { data: insertedTeams, error: teamsError } = await supabase
      .from('teams')
      .insert(teams)
      .select('team_id, team_name');

    if (teamsError) {
      console.error('❌ Error inserting teams:', teamsError.message);
    } else {
      console.log(
        '✅ Teams inserted successfully:',
        insertedTeams?.map(t => t.team_id).join(', ')
      );
    }

    // Insert USJ BIS registrations
    console.log('🎓 Inserting USJ BIS registrations...');
    const bisRegistrations = [
      {
        team_name: 'Team BIS Innovators',
        university: 'University of Sri Jayewardenepura',
      },
      {
        team_name: 'Team BIS Tech Leaders',
        university: 'University of Sri Jayewardenepura',
      },
      {
        team_name: 'Team BIS Digital Solutions',
        university: 'University of Sri Jayewardenepura',
      },
    ];

    const { data: insertedBisRegs, error: bisRegsError } = await supabase
      .from('usj_bis_registrations')
      .insert(bisRegistrations)
      .select('bis_id, team_name');

    if (bisRegsError) {
      console.error(
        '❌ Error inserting BIS registrations:',
        bisRegsError.message
      );
    } else {
      console.log(
        '✅ BIS registrations inserted successfully:',
        insertedBisRegs?.map(r => r.bis_id).join(', ')
      );
    }

    console.log('\n🎉 Test data insertion completed!');
    console.log('\n📋 Summary of created data:');
    console.log('- 9 USJ BIS students for CPM verification');
    console.log('- 5 regular teams (DH001-DH005)');
    console.log('- 3 USJ BIS teams (DHBIS001-DHBIS003)');
    console.log('- Members will be added in the next step');
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  executeStatementsDirectly();
}

module.exports = { executeStatementsDirectly };

