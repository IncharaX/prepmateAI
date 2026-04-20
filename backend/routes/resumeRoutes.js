const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const upload = require('../middleware/uploadMiddleware');
const { verifyJWTToken } = require('../middleware/authMiddleware');

// Public or Protected: In this case, protected by JWT
router.post('/upload', verifyJWTToken, upload.single('resume'), resumeController.uploadAndExtract);

module.exports = router;
