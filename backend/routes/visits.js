const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const visitController = require('../controllers/visitController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('Instructor', 'Administrator'), [
  body('visitTitle').trim().notEmpty(),
  body('visitPurpose').trim().notEmpty(),
  body('destinationInstitution').trim().notEmpty(),
  body('visitDateStart').isISO8601().toDate(),
  body('visitDateEnd').isISO8601().toDate()
], visitController.createVisit);

router.get('/my-visits', authenticate, authorize('Instructor'), visitController.getMyVisits);

router.get('/all', authenticate, authorize('StudyAbroad', 'Administrator'), visitController.getAllVisits);

router.get('/division', authenticate, authorize('Director'), visitController.getDivisionVisits);

router.get('/history', authenticate, authorize('Administrator', 'StudyAbroad'), visitController.getVisitHistory);

router.get('/:id', authenticate, visitController.getVisitById);

router.patch('/:id/status', authenticate, authorize('StudyAbroad', 'Administrator'), [
  body('status').isIn(['Pending', 'Approved', 'Rejected'])
], visitController.updateVisitStatus);

module.exports = router;
