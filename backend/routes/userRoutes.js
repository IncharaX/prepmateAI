const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyJWTToken } = require('../middleware/authMiddleware');
const { strictLimiter } = require('../middleware/rateLimiter');
const resumeService = require('../services/resumeService');

// Protected routes
router.get('/profile', verifyJWTToken, userController.getUserProfile);
router.put('/profile', verifyJWTToken, userController.updateProfile);

// Resume routes
router.post(
  '/resume/upload',
  verifyJWTToken,
  strictLimiter,
  resumeService.uploadMiddleware(),
  userController.uploadResume
);

router.get('/resume', verifyJWTToken, userController.getResume);
router.get('/resume/analysis', verifyJWTToken, userController.getResumeAnalysis);
router.delete('/resume', verifyJWTToken, userController.deleteResume);

// Account routes
router.delete('/account', verifyJWTToken, userController.deleteAccount);

module.exports = router;

