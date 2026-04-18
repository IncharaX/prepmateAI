const express = require('express');
const router = express.Router();
const { verifyJWTToken, requireAdmin } = require('../middleware/authMiddleware');
const analyticsService = require('../services/analyticsService');

/**
 * GET /api/analytics/overview
 * Get user's overview analytics
 */
router.get('/overview', verifyJWTToken, async (req, res, next) => {
  try {
    const overview = await analyticsService.getUserOverview(req.userId);
    res.status(200).json(overview);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/progress
 * Get user's interview progress
 */
router.get('/progress', verifyJWTToken, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const progress = await analyticsService.getUserProgress(req.userId, limit);
    res.status(200).json(progress);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/skills
 * Get user's skill analysis
 */
router.get('/skills', verifyJWTToken, async (req, res, next) => {
  try {
    const skillsAnalysis = await analyticsService.getUserSkillsAnalysis(req.userId);
    res.status(200).json(skillsAnalysis);
  } catch (error) {
    next(error);
  }
});

/**
 * Admin Analytics
 */

/**
 * GET /api/analytics/admin/stats
 * Get admin dashboard stats
 */
router.get('/admin/stats', verifyJWTToken, requireAdmin, async (req, res, next) => {
  try {
    const stats = await analyticsService.getAdminStats();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/admin/top-users
 * Get top performing users
 */
router.get('/admin/top-users', verifyJWTToken, requireAdmin, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topUsers = await analyticsService.getTopUsers(limit);
    res.status(200).json({ topUsers });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
