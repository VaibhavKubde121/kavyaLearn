const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

// Get list of children for logged-in parent
router.get('/children', protect, authorize('parent'), reportController.getParentChildren);

// Get student report (student data, enrollments, quiz scores)
router.get('/student/:studentId', protect, authorize('parent'), reportController.getStudentReport);

// Add child to parent account
router.post('/add-child', protect, authorize('parent'), reportController.addChildToParent);

module.exports = router;
