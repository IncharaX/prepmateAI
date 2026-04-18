const express = require('express');
const router = express.Router();

// ✅ FIXED IMPORTS
const interviewController = require('../controllers/interviewController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

// Protected routes
router.post('/start', verifyFirebaseToken, interviewController.startInterview);
router.post('/submit-answer', verifyFirebaseToken, interviewController.submitAnswer);
router.post('/complete', verifyFirebaseToken, interviewController.completeInterview);

router.get('/history', verifyFirebaseToken, interviewController.getInterviewHistory);
router.get('/stats/dashboard', verifyFirebaseToken, interviewController.getDashboardStats);
router.get('/:interviewId', verifyFirebaseToken, interviewController.getInterviewDetails);

module.exports = router;