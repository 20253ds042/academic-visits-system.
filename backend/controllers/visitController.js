const pool = require('../config/database');

exports.createVisit = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const {
      visitTitle,
      visitPurpose,
      destinationInstitution,
      visitDateStart,
      visitDateEnd
    } = req.body;
    
    const result = await client.query(
      `INSERT INTO visits (user_id, division_id, visit_title, visit_purpose, destination_institution, visit_date_start, visit_date_end, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending')
       RETURNING *`,
      [req.user.id, req.user.division_id, visitTitle, visitPurpose, destinationInstitution, visitDateStart, visitDateEnd]
    );
    
    // Add initial status to history
    await client.query(
      `INSERT INTO visit_history (visit_id, status, changed_by, notes)
       VALUES ($1, 'Pending', $2, 'Initial visit request created')`,
      [result.rows[0].id, req.user.id]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Visit request created successfully',
      visit: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create visit error:', error);
    res.status(500).json({ error: 'Server error creating visit request' });
  } finally {
    client.release();
  }
};

exports.getMyVisits = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, d.name as division_name, 
              (SELECT COUNT(*) FROM documents WHERE visit_id = v.id) as document_count,
              (SELECT COUNT(*) FROM visit_images WHERE visit_id = v.id) as image_count
       FROM visits v
       LEFT JOIN divisions d ON v.division_id = d.id
       WHERE v.user_id = $1
       ORDER BY v.created_at DESC`,
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get my visits error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllVisits = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT v.*, u.first_name, u.last_name, u.email, d.name as division_name,
             (SELECT COUNT(*) FROM documents WHERE visit_id = v.id) as document_count,
             (SELECT COUNT(*) FROM visit_images WHERE visit_id = v.id) as image_count
      FROM visits v
      JOIN users u ON v.user_id = u.id
      LEFT JOIN divisions d ON v.division_id = d.id
    `;
    
    const params = [];
    
    if (status) {
      query += ' WHERE v.status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY v.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get all visits error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getDivisionVisits = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, u.first_name, u.last_name, u.email, d.name as division_name,
              (SELECT COUNT(*) FROM documents WHERE visit_id = v.id) as document_count,
              (SELECT COUNT(*) FROM visit_images WHERE visit_id = v.id) as image_count
       FROM visits v
       JOIN users u ON v.user_id = u.id
       LEFT JOIN divisions d ON v.division_id = d.id
       WHERE v.division_id = $1 AND v.status = 'Approved'
       ORDER BY v.created_at DESC`,
      [req.user.division_id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get division visits error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getVisitById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT v.*, u.first_name, u.last_name, u.email, d.name as division_name
       FROM visits v
       JOIN users u ON v.user_id = u.id
       LEFT JOIN divisions d ON v.division_id = d.id
       WHERE v.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }
    
    // Check permissions
    const visit = result.rows[0];
    
    if (req.user.role_name === 'Instructor' && visit.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (req.user.role_name === 'Director' && visit.division_id !== req.user.division_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get documents
    const documents = await pool.query(
      'SELECT * FROM documents WHERE visit_id = $1',
      [id]
    );
    
    // Get images
    const images = await pool.query(
      'SELECT * FROM visit_images WHERE visit_id = $1',
      [id]
    );
    
    // Get history
    const history = await pool.query(
      `SELECT vh.*, u.first_name, u.last_name
       FROM visit_history vh
       LEFT JOIN users u ON vh.changed_by = u.id
       WHERE vh.visit_id = $1
       ORDER BY vh.changed_at DESC`,
      [id]
    );
    
    res.json({
      ...visit,
      documents: documents.rows,
      images: images.rows,
      history: history.rows
    });
  } catch (error) {
    console.error('Get visit by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateVisitStatus = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Update visit status
    const result = await client.query(
      `UPDATE visits 
       SET status = $1, rejection_reason = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, rejectionReason || null, id]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Visit not found' });
    }
    
    // Add to history
    await client.query(
      `INSERT INTO visit_history (visit_id, status, changed_by, notes)
       VALUES ($1, $2, $3, $4)`,
      [id, status, req.user.id, rejectionReason || `Status changed to ${status}`]
    );
    
    await client.query('COMMIT');
    
    res.json({
      message: 'Visit status updated successfully',
      visit: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update visit status error:', error);
    res.status(500).json({ error: 'Server error updating visit status' });
  } finally {
    client.release();
  }
};

exports.getVisitHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, u.first_name, u.last_name, d.name as division_name
       FROM visits v
       JOIN users u ON v.user_id = u.id
       LEFT JOIN divisions d ON v.division_id = d.id
       ORDER BY v.created_at DESC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get visit history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
