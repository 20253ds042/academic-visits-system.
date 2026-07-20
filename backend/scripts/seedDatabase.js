const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'academic_visits',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function seedDatabase() {
  try {
    console.log('Seeding database...');

    // Get role IDs
    const rolesResult = await pool.query('SELECT id, name FROM roles');
    const roleMap = {};
    rolesResult.rows.forEach(role => {
      roleMap[role.name] = role.id;
    });

    // Get division IDs
    const divisionsResult = await pool.query('SELECT id, name FROM divisions');
    const divisionMap = {};
    divisionsResult.rows.forEach(division => {
      divisionMap[division.name] = division.id;
    });

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Create sample users
    const users = [
      {
        email: 'admin@university.edu',
        password_hash: passwordHash,
        first_name: 'System',
        last_name: 'Administrator',
        role_id: roleMap['Administrator'],
        division_id: null
      },
      {
        email: 'instructor1@university.edu',
        password_hash: passwordHash,
        first_name: 'John',
        last_name: 'Smith',
        role_id: roleMap['Instructor'],
        division_id: divisionMap['Engineering']
      },
      {
        email: 'instructor2@university.edu',
        password_hash: passwordHash,
        first_name: 'Sarah',
        last_name: 'Johnson',
        role_id: roleMap['Instructor'],
        division_id: divisionMap['Business']
      },
      {
        email: 'director@university.edu',
        password_hash: passwordHash,
        first_name: 'Robert',
        last_name: 'Williams',
        role_id: roleMap['Director'],
        division_id: divisionMap['Engineering']
      },
      {
        email: 'studyabroad@university.edu',
        password_hash: passwordHash,
        first_name: 'Emily',
        last_name: 'Brown',
        role_id: roleMap['StudyAbroad'],
        division_id: divisionMap['Sciences']
      }
    ];

    for (const user of users) {
      await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role_id, division_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO NOTHING`,
        [user.email, user.password_hash, user.first_name, user.last_name, user.role_id, user.division_id]
      );
    }

    console.log('Sample users created');

    // Get user IDs for creating sample visits
    const usersResult = await pool.query('SELECT id, email FROM users WHERE email LIKE $1', ['instructor%']);
    const instructorIds = usersResult.rows.map(u => u.id);

    // Create sample visits
    if (instructorIds.length > 0) {
      const visits = [
        {
          user_id: instructorIds[0],
          division_id: divisionMap['Engineering'],
          visit_title: 'Research Collaboration at MIT',
          visit_purpose: 'Collaborate with MIT researchers on renewable energy projects',
          destination_institution: 'Massachusetts Institute of Technology',
          visit_date_start: '2024-03-15',
          visit_date_end: '2024-03-20',
          status: 'Approved'
        },
        {
          user_id: instructorIds[0],
          division_id: divisionMap['Engineering'],
          visit_title: 'Conference Presentation in Tokyo',
          visit_purpose: 'Present research findings at International Engineering Conference',
          destination_institution: 'University of Tokyo',
          visit_date_start: '2024-05-10',
          visit_date_end: '2024-05-15',
          status: 'Pending'
        },
        {
          user_id: instructorIds[1] || instructorIds[0],
          division_id: divisionMap['Business'],
          visit_title: 'Industry Partnership Visit',
          visit_purpose: 'Establish partnership with leading tech companies',
          destination_institution: 'Stanford University',
          visit_date_start: '2024-04-01',
          visit_date_end: '2024-04-05',
          status: 'Rejected',
          rejection_reason: 'Insufficient justification for business impact'
        }
      ];

      for (const visit of visits) {
        const result = await pool.query(
          `INSERT INTO visits (user_id, division_id, visit_title, visit_purpose, destination_institution, visit_date_start, visit_date_end, status, rejection_reason)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id`,
          [visit.user_id, visit.division_id, visit.visit_title, visit.visit_purpose, 
           visit.destination_institution, visit.visit_date_start, visit.visit_date_end, 
           visit.status, visit.rejection_reason || null]
        );

        const visitId = result.rows[0].id;

        // Add history entries
        await pool.query(
          `INSERT INTO visit_history (visit_id, status, changed_by, notes)
           VALUES ($1, $2, $3, $4)`,
          [visitId, visit.status, 1, `Initial status: ${visit.status}`]
        );
      }

      console.log('Sample visits created');
    }

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Email: admin@university.edu | Password: password123');
    console.log('Email: instructor1@university.edu | Password: password123');
    console.log('Email: director@university.edu | Password: password123');
    console.log('Email: studyabroad@university.edu | Password: password123');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
