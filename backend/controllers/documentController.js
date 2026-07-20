const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

exports.uploadDocument = async (req, res) => {
  try {
    const { visitId } = req.params;
    const { documentType } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const validTypes = ['request_form', 'response_letter', 'visit_report'];
    if (!validTypes.includes(documentType)) {
      return res.status(400).json({ error: 'Invalid document type' });
    }
    
    // Check if visit exists and user has permission
    const visitResult = await pool.query(
      'SELECT * FROM visits WHERE id = $1',
      [visitId]
    );
    
    if (visitResult.rows.length === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }
    
    const visit = visitResult.rows[0];
    
    if (req.user.role_name === 'Instructor' && visit.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Insert document record
    const result = await pool.query(
      `INSERT INTO documents (visit_id, document_type, file_path, file_name, file_size)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [visitId, documentType, req.file.path, req.file.originalname, req.file.size]
    );
    
    res.status(201).json({
      message: 'Document uploaded successfully',
      document: result.rows[0]
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Server error uploading document' });
  }
};

exports.uploadVisitImages = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { visitId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }
    
    if (req.files.length !== 3) {
      return res.status(400).json({ error: 'Exactly 3 images are required for visit report' });
    }
    
    // Check if visit exists and user has permission
    const visitResult = await client.query(
      'SELECT * FROM visits WHERE id = $1',
      [visitId]
    );
    
    if (visitResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Visit not found' });
    }
    
    const visit = visitResult.rows[0];
    
    if (req.user.role_name === 'Instructor' && visit.user_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Delete existing images for this visit
    await client.query('DELETE FROM visit_images WHERE visit_id = $1', [visitId]);
    
    // Insert new images
    const imagePromises = req.files.map(file => 
      client.query(
        `INSERT INTO visit_images (visit_id, image_path, image_name, image_size)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [visitId, file.path, file.originalname, file.size]
      )
    );
    
    const results = await Promise.all(imagePromises);
    
    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Visit images uploaded successfully',
      images: results.map(r => r.rows[0])
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Upload visit images error:', error);
    res.status(500).json({ error: 'Server error uploading visit images' });
  } finally {
    client.release();
  }
};

exports.getDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT d.*, v.user_id, v.division_id
       FROM documents d
       JOIN visits v ON d.visit_id = v.id
       WHERE d.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const document = result.rows[0];
    
    // Check permissions
    if (req.user.role_name === 'Instructor' && document.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (req.user.role_name === 'Director' && document.division_id !== req.user.division_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if file exists
    if (!fs.existsSync(document.file_path)) {
      return res.status(404).json({ error: 'File not found on server' });
    }
    
    res.download(document.file_path, document.file_name);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT vi.*, v.user_id, v.division_id
       FROM visit_images vi
       JOIN visits v ON vi.visit_id = v.id
       WHERE vi.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    const image = result.rows[0];
    
    // Check permissions
    if (req.user.role_name === 'Instructor' && image.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (req.user.role_name === 'Director' && image.division_id !== req.user.division_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if file exists
    if (!fs.existsSync(image.image_path)) {
      return res.status(404).json({ error: 'File not found on server' });
    }
    
    res.sendFile(image.image_path);
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
