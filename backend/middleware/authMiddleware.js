const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

/**
 * Verify Firebase ID Token and attach user to request
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization token provided',
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.firebaseUser = decodedToken;
      req.userId = decodedToken.uid;
      req.userEmail = decodedToken.email;
      next();
    } catch (tokenError) {
      console.error('Token verification error:', tokenError.message);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication verification failed',
    });
  }
};

/**
 * Verify JWT session token
 */
const verifyJWTToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization token provided',
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      next();
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired JWT token',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Token verification failed',
    });
  }
};

/**
 * Check if user has admin role
 */
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    const User = require('../models/User');
    const user = await User.findById(req.userId);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required',
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Permission check failed',
    });
  }
};

module.exports = {
  verifyFirebaseToken,
  verifyJWTToken,
  requireAdmin,
  authMiddleware: verifyFirebaseToken, // Default export for backward compatibility
};

