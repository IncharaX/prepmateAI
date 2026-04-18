const User = require('../models/User');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

class AuthController {
  /**
   * Register or login user with Firebase ID token
   */
  async registerOrLoginUser(req, res, next) {
    try {
      const { firebaseToken, displayName, photoURL } = req.body;

      if (!firebaseToken) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Firebase token is required',
        });
      }

      // Verify Firebase ID token
      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      } catch (error) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid Firebase token',
        });
      }

      const { uid, email } = decodedToken;

      // Check if user exists
      let user = await User.findOne({ firebaseId: uid });

      if (user) {
        // Update login history
        user.loginHistory = (user.loginHistory || []).slice(-9); // Keep last 10
        user.loginHistory.push({
          timestamp: new Date(),
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });
        user.updatedAt = new Date();
        await user.save();

        // Generate JWT session token
        const sessionToken = jwt.sign(
          { userId: user._id.toString(), email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRY || '7d' }
        );

        return res.status(200).json({
          message: 'User logged in successfully',
          sessionToken,
          user: {
            id: user._id,
            email: user.email,
            displayName: user.displayName,
            profilePicture: user.profilePicture,
            domain: user.domain,
            role: user.role,
            interviewReadinessScore: user.interviewReadinessScore,
            totalSessions: user.totalSessions,
          },
        });
      }

      // Create new user
      user = new User({
        firebaseId: uid,
        email,
        displayName: displayName || email.split('@')[0],
        profilePicture: photoURL || null,
      });

      await user.save();

      // Generate JWT session token
      const sessionToken = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        sessionToken,
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          profilePicture: user.profilePicture,
          domain: user.domain,
          role: user.role,
          interviewReadinessScore: user.interviewReadinessScore,
          totalSessions: user.totalSessions,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(req, res, next) {
    try {
      const user = await User.findById(req.userId).select('-loginHistory');

      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      res.status(200).json({
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          profilePicture: user.profilePicture,
          domain: user.domain,
          role: user.role,
          resume: user.resume,
          resumeAnalysis: user.resumeAnalysis,
          interviewReadinessScore: user.interviewReadinessScore,
          totalSessions: user.totalSessions,
          averageScore: user.averageScore,
          domainStrengths: user.domainStrengths,
          skillsGap: user.skillsGap,
          lastInterviewDate: user.lastInterviewDate,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res, next) {
    try {
      const { displayName, domain } = req.body;

      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      if (displayName && displayName.length >= 2 && displayName.length <= 50) {
        user.displayName = displayName;
      }

      if (domain && ['Software Engineering', 'Marketing', 'Finance', 'HR'].includes(domain)) {
        user.domain = domain;
      }

      user.updatedAt = new Date();
      await user.save();

      res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          displayName: user.displayName,
          domain: user.domain,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user (mainly client-side, server-side can invalidate sessions)
   */
  async logout(req, res, next) {
    try {
      res.status(200).json({
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh JWT session token
   */
  async refreshToken(req, res, next) {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      // Generate new JWT session token
      const sessionToken = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '7d' }
      );

      res.status(200).json({
        message: 'Token refreshed successfully',
        sessionToken,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(req, res, next) {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      // Delete user from database
      await User.deleteOne({ _id: req.userId });

      // Delete user from Firebase Auth
      try {
        await admin.auth().deleteUser(user.firebaseId);
      } catch (error) {
        console.warn('Failed to delete Firebase user:', error.message);
      }

      res.status(200).json({
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
