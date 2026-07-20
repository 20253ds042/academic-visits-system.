const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadDocument, uploadImages } = require('../middleware/upload');

router.post('/:visitId/document', authenticate, authorize('Instructor', 'Administrator'), uploadDocument.single('document'), documentController.uploadDocument);

router.post('/:visitId/images', authenticate, authorize('Instructor', 'Administrator'), uploadImages.array('images', 3), documentController.uploadVisitImages);

router.get('/document/:id', authenticate, documentController.getDocument);

router.get('/image/:id', authenticate, documentController.getImage);

module.exports = router;
