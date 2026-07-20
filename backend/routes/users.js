const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('Administrator'), userController.getAllUsers);

router.get('/roles', authenticate, userController.getRoles);

router.get('/divisions', authenticate, userController.getDivisions);

router.get('/:id', authenticate, authorize('Administrator'), userController.getUserById);

router.post('/', authenticate, authorize('Administrator'), [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('roleId').isInt(),
  body('divisionId').isInt()
], userController.createUser);

router.patch('/:id', authenticate, authorize('Administrator'), [
  body('email').isEmail().normalizeEmail(),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('roleId').isInt(),
  body('divisionId').isInt()
], userController.updateUser);

router.delete('/:id', authenticate, authorize('Administrator'), userController.deleteUser);

module.exports = router;
