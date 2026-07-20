const pool = require('../config/database');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active, u.created_at,
              r.name as role_name, d.name as division_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN divisions d ON u.division_id = d.id
       ORDER BY u.created_at DESC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active, u.created_at,
              r.name as role_name, d.name as division_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN divisions d ON u.division_id = d.id
       WHERE u.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, roleId, divisionId } = req.body;
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Insert user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role_id, division_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, is_active, created_at`,
      [email, passwordHash, firstName, lastName, roleId, divisionId]
    );
    
    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error creating user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, roleId, divisionId, isActive } = req.body;
    
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );
    
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user
    const result = await pool.query(
      `UPDATE users 
       SET email = $1, first_name = $2, last_name = $3, role_id = $4, division_id = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, email, first_name, last_name, is_active, updated_at`,
      [email, firstName, lastName, roleId, divisionId, isActive, id]
    );
    
    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error deleting user' });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getDivisions = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM divisions ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Get divisions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
