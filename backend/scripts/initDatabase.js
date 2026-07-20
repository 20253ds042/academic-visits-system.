const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function initDatabase() {
  try {
    console.log('Creating database...');
    
    // Create database if it doesn't exist
    await pool.query(`CREATE DATABASE academic_visits`);
    console.log('Database created successfully');
    
    // Connect to the new database
    const dbPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: 'academic_visits',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
    });
    
    console.log('Creating tables...');
    
    // Create roles table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create divisions table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS divisions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create users table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role_id INTEGER REFERENCES roles(id),
        division_id INTEGER REFERENCES divisions(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create visits table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        division_id INTEGER REFERENCES divisions(id) NOT NULL,
        visit_title VARCHAR(255) NOT NULL,
        visit_purpose TEXT NOT NULL,
        destination_institution VARCHAR(255) NOT NULL,
        visit_date_start DATE NOT NULL,
        visit_date_end DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create documents table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        visit_id INTEGER REFERENCES visits(id) ON DELETE CASCADE,
        document_type VARCHAR(50) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size INTEGER,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create visit_images table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS visit_images (
        id SERIAL PRIMARY KEY,
        visit_id INTEGER REFERENCES visits(id) ON DELETE CASCADE,
        image_path VARCHAR(500) NOT NULL,
        image_name VARCHAR(255) NOT NULL,
        image_size INTEGER,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create visit_history table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS visit_history (
        id SERIAL PRIMARY KEY,
        visit_id INTEGER REFERENCES visits(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        changed_by INTEGER REFERENCES users(id),
        notes TEXT,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default roles
    await dbPool.query(`
      INSERT INTO roles (name, description) VALUES
        ('Administrator', 'Full system access with CRUD operations on users and roles'),
        ('Instructor', 'Can create and track their own visit requests'),
        ('Director', 'Can view approved requests for their division'),
        ('StudyAbroad', 'Can evaluate and approve/reject visit requests')
      ON CONFLICT (name) DO NOTHING
    `);
    
    // Insert default divisions
    await dbPool.query(`
      INSERT INTO divisions (name, description) VALUES
        ('Engineering', 'School of Engineering'),
        ('Business', 'School of Business'),
        ('Arts', 'School of Arts and Humanities'),
        ('Sciences', 'School of Sciences'),
        ('Health', 'School of Health Sciences')
      ON CONFLICT (name) DO NOTHING
    `);
    
    console.log('Tables created successfully');
    console.log('Default roles and divisions inserted');
    
    // Create indexes for better performance
    await dbPool.query(`CREATE INDEX IF NOT EXISTS idx_visits_user_id ON visits(user_id)`);
    await dbPool.query(`CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status)`);
    await dbPool.query(`CREATE INDEX IF NOT EXISTS idx_visits_division_id ON visits(division_id)`);
    await dbPool.query(`CREATE INDEX IF NOT EXISTS idx_documents_visit_id ON documents(visit_id)`);
    await dbPool.query(`CREATE INDEX IF NOT EXISTS idx_visit_images_visit_id ON visit_images(visit_id)`);
    await dbPool.query(`CREATE INDEX IF NOT EXISTS idx_visit_history_visit_id ON visit_history(visit_id)`);
    
    console.log('Indexes created successfully');
    
    await dbPool.end();
    await pool.end();
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
