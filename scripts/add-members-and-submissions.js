#!/usr/bin/env node

/**
 * Script to add members and submissions to the existing test data
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

async function addMembersAndSubmissions() {
  try {
    console.log('🚀 Adding members and submissions...');

    // Add regular team members
    console.log('👥 Adding regular team members...');
    const regularMembers = [
      // Team Phoenix (DH001)
      {
        team_id: 'DH001',
        full_name: 'Alex Johnson',
        name_with_initials: 'A. Johnson',
        nic: '200012345678',
        university_reg_no: '2021/CS/001',
        faculty: 'Faculty of Science',
        academic_year: 3,
        email: 'alex.johnson@email.com',
        whatsapp_number: '0771234567',
        linkedin_profile: 'https://linkedin.com/in/alexjohnson',
        is_leader: true,
      },
      {
        team_id: 'DH001',
        full_name: 'Sarah Williams',
        name_with_initials: 'S. Williams',
        nic: '200112345678',
        university_reg_no: '2021/CS/002',
        faculty: 'Faculty of Science',
        academic_year: 3,
        email: 'sarah.williams@email.com',
        whatsapp_number: '0771234568',
        linkedin_profile: 'https://linkedin.com/in/sarahwilliams',
        is_leader: false,
      },
      {
        team_id: 'DH001',
        full_name: 'Michael Brown',
        name_with_initials: 'M. Brown',
        nic: '200212345678',
        university_reg_no: '2021/CS/003',
        faculty: 'Faculty of Science',
        academic_year: 3,
        email: 'michael.brown@email.com',
        whatsapp_number: '0771234569',
        linkedin_profile: 'https://linkedin.com/in/michaelbrown',
        is_leader: false,
      },

      // Team Innovators (DH002)
      {
        team_id: 'DH002',
        full_name: 'Emma Davis',
        name_with_initials: 'E. Davis',
        nic: '200312345678',
        university_reg_no: '2021/IT/001',
        faculty: 'Faculty of Engineering',
        academic_year: 3,
        email: 'emma.davis@email.com',
        whatsapp_number: '0771234570',
        linkedin_profile: 'https://linkedin.com/in/emmadavis',
        is_leader: true,
      },
      {
        team_id: 'DH002',
        full_name: 'James Wilson',
        name_with_initials: 'J. Wilson',
        nic: '200412345678',
        university_reg_no: '2021/IT/002',
        faculty: 'Faculty of Engineering',
        academic_year: 3,
        email: 'james.wilson@email.com',
        whatsapp_number: '0771234571',
        linkedin_profile: 'https://linkedin.com/in/jameswilson',
        is_leader: false,
      },
      {
        team_id: 'DH002',
        full_name: 'Lisa Anderson',
        name_with_initials: 'L. Anderson',
        nic: '200512345678',
        university_reg_no: '2021/IT/003',
        faculty: 'Faculty of Engineering',
        academic_year: 3,
        email: 'lisa.anderson@email.com',
        whatsapp_number: '0771234572',
        linkedin_profile: 'https://linkedin.com/in/lisaanderson',
        is_leader: false,
      },

      // Team Tech Titans (DH003)
      {
        team_id: 'DH003',
        full_name: 'David Miller',
        name_with_initials: 'D. Miller',
        nic: '200612345678',
        university_reg_no: '2021/SE/001',
        faculty: 'Faculty of Engineering',
        academic_year: 3,
        email: 'david.miller@email.com',
        whatsapp_number: '0771234573',
        linkedin_profile: 'https://linkedin.com/in/davidmiller',
        is_leader: true,
      },
      {
        team_id: 'DH003',
        full_name: 'Jennifer Taylor',
        name_with_initials: 'J. Taylor',
        nic: '200712345678',
        university_reg_no: '2021/SE/002',
        faculty: 'Faculty of Engineering',
        academic_year: 3,
        email: 'jennifer.taylor@email.com',
        whatsapp_number: '0771234574',
        linkedin_profile: 'https://linkedin.com/in/jennifertaylor',
        is_leader: false,
      },
      {
        team_id: 'DH003',
        full_name: 'Robert Garcia',
        name_with_initials: 'R. Garcia',
        nic: '200812345678',
        university_reg_no: '2021/SE/003',
        faculty: 'Faculty of Engineering',
        academic_year: 3,
        email: 'robert.garcia@email.com',
        whatsapp_number: '0771234575',
        linkedin_profile: 'https://linkedin.com/in/robertgarcia',
        is_leader: false,
      },

      // Team Code Warriors (DH004)
      {
        team_id: 'DH004',
        full_name: 'Maria Rodriguez',
        name_with_initials: 'M. Rodriguez',
        nic: '200912345678',
        university_reg_no: '2021/CS/004',
        faculty: 'Faculty of Science',
        academic_year: 3,
        email: 'maria.rodriguez@email.com',
        whatsapp_number: '0771234576',
        linkedin_profile: 'https://linkedin.com/in/mariarodriguez',
        is_leader: true,
      },
      {
        team_id: 'DH004',
        full_name: 'Christopher Lee',
        name_with_initials: 'C. Lee',
        nic: '201012345678',
        university_reg_no: '2021/CS/005',
        faculty: 'Faculty of Science',
        academic_year: 3,
        email: 'christopher.lee@email.com',
        whatsapp_number: '0771234577',
        linkedin_profile: 'https://linkedin.com/in/christopherlee',
        is_leader: false,
      },
      {
        team_id: 'DH004',
        full_name: 'Amanda White',
        name_with_initials: 'A. White',
        nic: '201112345678',
        university_reg_no: '2021/CS/006',
        faculty: 'Faculty of Science',
        academic_year: 3,
        email: 'amanda.white@email.com',
        whatsapp_number: '0771234578',
        linkedin_profile: 'https://linkedin.com/in/amandawhite',
        is_leader: false,
      },

      // Team Digital Dreamers (DH005)
      {
        team_id: 'DH005',
        full_name: 'Daniel Martinez',
        name_with_initials: 'D. Martinez',
        nic: '201212345678',
        university_reg_no: '2021/IT/004',
        faculty: 'Faculty of Engineering',
        academic_year: 3,
        email: 'daniel.martinez@email.com',
        whatsapp_number: '0771234579',
        linkedin_profile: 'https://linkedin.com/in/danielmartinez',
        is_leader: true,
      },
      {
        team_id: 'DH005',
        full_name: 'Jessica Thompson',
        name_with_initials: 'J. Thompson',
        nic: '201312345678',
        university_reg_no: '2021/IT/005',
        faculty: 'Faculty of Engineering',
        academic_year: 3,
        email: 'jessica.thompson@email.com',
        whatsapp_number: '0771234580',
        linkedin_profile: 'https://linkedin.com/in/jessicathompson',
        is_leader: false,
      },
      {
        team_id: 'DH005',
        full_name: 'Kevin Harris',
        name_with_initials: 'K. Harris',
        nic: '201412345678',
        university_reg_no: '2021/IT/006',
        faculty: 'Faculty of Engineering',
        academic_year: 3,
        email: 'kevin.harris@email.com',
        whatsapp_number: '0771234581',
        linkedin_profile: 'https://linkedin.com/in/kevinharris',
        is_leader: false,
      },
    ];

    const { error: membersError } = await supabase
      .from('members')
      .insert(regularMembers);

    if (membersError) {
      console.error(
        '❌ Error inserting regular members:',
        membersError.message
      );
    } else {
      console.log('✅ Regular team members inserted successfully');
    }

    // Add BIS members
    console.log('🎓 Adding USJ BIS members...');
    const bisMembers = [
      // Team BIS Innovators (DHBIS001)
      {
        bis_id: 'DHBIS001',
        full_name: 'Niruma Fernando',
        name_with_initials: 'N. Fernando',
        nic: '200012345001',
        university_reg_no: '2021/BIS/001',
        academic_year: 3,
        email: 'niruma.fernando@usj.ac.lk',
        whatsapp_number: '0771234601',
        linkedin_profile: 'https://linkedin.com/in/nirumafernando',
        is_leader: true,
      },
      {
        bis_id: 'DHBIS001',
        full_name: 'Samantha Perera',
        name_with_initials: 'S. Perera',
        nic: '200112345001',
        university_reg_no: '2021/BIS/002',
        academic_year: 3,
        email: 'samantha.perera@usj.ac.lk',
        whatsapp_number: '0771234602',
        linkedin_profile: 'https://linkedin.com/in/samanthaperera',
        is_leader: false,
      },
      {
        bis_id: 'DHBIS001',
        full_name: 'Dilshan Rajapaksa',
        name_with_initials: 'D. Rajapaksa',
        nic: '200212345001',
        university_reg_no: '2021/BIS/003',
        academic_year: 3,
        email: 'dilshan.rajapaksa@usj.ac.lk',
        whatsapp_number: '0771234603',
        linkedin_profile: 'https://linkedin.com/in/dilshanrajapaksa',
        is_leader: false,
      },

      // Team BIS Tech Leaders (DHBIS002)
      {
        bis_id: 'DHBIS002',
        full_name: 'Priya Silva',
        name_with_initials: 'P. Silva',
        nic: '200312345001',
        university_reg_no: '2022/BIS/001',
        academic_year: 2,
        email: 'priya.silva@usj.ac.lk',
        whatsapp_number: '0771234604',
        linkedin_profile: 'https://linkedin.com/in/priyasilva',
        is_leader: true,
      },
      {
        bis_id: 'DHBIS002',
        full_name: 'Kavindu Jayawardena',
        name_with_initials: 'K. Jayawardena',
        nic: '200412345001',
        university_reg_no: '2022/BIS/002',
        academic_year: 2,
        email: 'kavindu.jayawardena@usj.ac.lk',
        whatsapp_number: '0771234605',
        linkedin_profile: 'https://linkedin.com/in/kavindujayawardena',
        is_leader: false,
      },
      {
        bis_id: 'DHBIS002',
        full_name: 'Anjali Wickramasinghe',
        name_with_initials: 'A. Wickramasinghe',
        nic: '200512345001',
        university_reg_no: '2022/BIS/003',
        academic_year: 2,
        email: 'anjali.wickramasinghe@usj.ac.lk',
        whatsapp_number: '0771234606',
        linkedin_profile: 'https://linkedin.com/in/anjaliwickramasinghe',
        is_leader: false,
      },

      // Team BIS Digital Solutions (DHBIS003)
      {
        bis_id: 'DHBIS003',
        full_name: 'Ravindu Bandara',
        name_with_initials: 'R. Bandara',
        nic: '200612345001',
        university_reg_no: '2023/BIS/001',
        academic_year: 1,
        email: 'ravindu.bandara@usj.ac.lk',
        whatsapp_number: '0771234607',
        linkedin_profile: 'https://linkedin.com/in/ravindubandara',
        is_leader: true,
      },
      {
        bis_id: 'DHBIS003',
        full_name: 'Tharushi Gunasekara',
        name_with_initials: 'T. Gunasekara',
        nic: '200712345001',
        university_reg_no: '2023/BIS/002',
        academic_year: 1,
        email: 'tharushi.gunasekara@usj.ac.lk',
        whatsapp_number: '0771234608',
        linkedin_profile: 'https://linkedin.com/in/tharushigunasekara',
        is_leader: false,
      },
      {
        bis_id: 'DHBIS003',
        full_name: 'Dinuka Mendis',
        name_with_initials: 'D. Mendis',
        nic: '200812345001',
        university_reg_no: '2023/BIS/003',
        academic_year: 1,
        email: 'dinuka.mendis@usj.ac.lk',
        whatsapp_number: '0771234609',
        linkedin_profile: 'https://linkedin.com/in/dinukamendis',
        is_leader: false,
      },
    ];

    const { error: bisMembersError } = await supabase
      .from('usj_bis_members')
      .insert(bisMembers);

    if (bisMembersError) {
      console.error('❌ Error inserting BIS members:', bisMembersError.message);
    } else {
      console.log('✅ USJ BIS members inserted successfully');
    }

    // Add round submissions
    console.log('📝 Adding round submissions...');
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

    // Add BIS round submissions
    console.log('🎓 Adding USJ BIS round submissions...');
    const bisSubmissions = [
      // Round 1 BIS submissions
      {
        round_id: 1,
        bis_id: 'DHBIS001',
        registration_number: 'DHBIS001',
        google_drive_link:
          'https://drive.google.com/file/d/13abc123def456ghi789jkl/view',
        youtube_link: null,
        status: 'submitted',
      },
      {
        round_id: 1,
        bis_id: 'DHBIS002',
        registration_number: 'DHBIS002',
        google_drive_link:
          'https://drive.google.com/file/d/14def456ghi789jkl123abc/view',
        youtube_link: null,
        status: 'submitted',
      },
      {
        round_id: 1,
        bis_id: 'DHBIS003',
        registration_number: 'DHBIS003',
        google_drive_link:
          'https://drive.google.com/file/d/15ghi789jkl123abc456def/view',
        youtube_link: null,
        status: 'submitted',
      },

      // Round 2 BIS submissions
      {
        round_id: 2,
        bis_id: 'DHBIS001',
        registration_number: 'DHBIS001',
        google_drive_link:
          'https://drive.google.com/file/d/16jkl123abc456def789ghi/view',
        youtube_link: null,
        status: 'submitted',
      },
      {
        round_id: 2,
        bis_id: 'DHBIS002',
        registration_number: 'DHBIS002',
        google_drive_link:
          'https://drive.google.com/file/d/17abc456def789ghi123jkl/view',
        youtube_link: null,
        status: 'submitted',
      },

      // Round 3 BIS submissions (with YouTube links)
      {
        round_id: 3,
        bis_id: 'DHBIS001',
        registration_number: 'DHBIS001',
        google_drive_link:
          'https://drive.google.com/file/d/18def789ghi123jkl456abc/view',
        youtube_link: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        status: 'submitted',
      },
      {
        round_id: 3,
        bis_id: 'DHBIS002',
        registration_number: 'DHBIS002',
        google_drive_link:
          'https://drive.google.com/file/d/19ghi123jkl456abc789def/view',
        youtube_link: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        status: 'submitted',
      },
    ];

    const { error: bisSubmissionsError } = await supabase
      .from('usj_bis_round_submissions')
      .insert(bisSubmissions);

    if (bisSubmissionsError) {
      console.error(
        '❌ Error inserting BIS submissions:',
        bisSubmissionsError.message
      );
    } else {
      console.log('✅ USJ BIS round submissions inserted successfully');
    }

    // Add results
    console.log('🏆 Adding results...');
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

      // BIS results
      { team_id: 'DHBIS001', round_id: 1, status: 'passed' },
      { team_id: 'DHBIS002', round_id: 1, status: 'passed' },
      { team_id: 'DHBIS003', round_id: 1, status: 'pending' },
      { team_id: 'DHBIS001', round_id: 2, status: 'passed' },
      { team_id: 'DHBIS002', round_id: 2, status: 'pending' },
      { team_id: 'DHBIS001', round_id: 3, status: 'passed' },
      { team_id: 'DHBIS002', round_id: 3, status: 'pending' },
    ];

    const { error: resultsError } = await supabase
      .from('results')
      .insert(results);

    if (resultsError) {
      console.error('❌ Error inserting results:', resultsError.message);
    } else {
      console.log('✅ Results inserted successfully');
    }

    console.log('\n🎉 All test data added successfully!');
    console.log('\n📊 Final Summary:');
    console.log('- 9 USJ BIS students for CPM verification');
    console.log('- 5 regular teams with 15 members total');
    console.log('- 3 USJ BIS teams with 9 members total');
    console.log('- 12 round submissions (regular teams)');
    console.log('- 7 BIS round submissions');
    console.log('- 19 results entries');
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  addMembersAndSubmissions();
}

module.exports = { addMembersAndSubmissions };

