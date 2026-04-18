const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyJWTToken, verifyFirebaseToken } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRequest, sanitizeBody, schemas } = require('../middleware/validation');

// Public routes
router.post('/register', authLimiter, sanitizeBody, validateRequest(schemas.register), authController.registerOrLoginUser);
router.post('/login', authLimiter, sanitizeBody, validateRequest(schemas.login), authController.registerOrLoginUser);

// Protected routes
router.get('/me', verifyJWTToken, authController.getCurrentUser);
router.put('/profile', verifyJWTToken, sanitizeBody, validateRequest(schemas.profileUpdate), authController.updateProfile);
router.post('/logout', verifyJWTToken, authController.logout);
router.post('/refresh-token', verifyJWTToken, authController.refreshToken);
router.delete('/account', verifyJWTToken, authController.deleteAccount);

module.exports = router;

