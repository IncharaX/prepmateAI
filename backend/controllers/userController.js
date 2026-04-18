const User = require('../models/User');
const Interview = require('../models/Interview');
const resumeService = require('../services/resumeService');

class UserController {
  async getUserProfile(req, res, next) {
    try {
      const user = await User.findById(req.userId).select('-loginHistory');

      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      res.status(200).json({
        profile: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { displayName, domain, profilePicture } = req.body;
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      if (displayName) user.displayName = displayName;
      if (domain) user.domain = domain;
      if (profilePicture) user.profilePicture = profilePicture;

      await user.save();

      res.status(200).json({
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadResume(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const resumeText = await resumeService.extractTextFromResume(req.file.path);
      const analysis = await resumeService.analyzeResume(resumeText);

      user.resume = {
        fileName: req.file.filename,
        uploadedAt: new Date(),
      };

      user.resumeAnalysis = analysis;

      await user.save();

      res.status(200).json({
        message: 'Resume uploaded successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Return resume metadata or download URL
  async getResume(req, res, next) {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.resume || !user.resume.fileName) {
        return res.status(404).json({ error: 'No resume found for user' });
      }

      const fileUrl = `/uploads/${user.resume.fileName}`;

      res.status(200).json({
        resume: {
          fileName: user.resume.fileName,
          uploadedAt: user.resume.uploadedAt || null,
          url: fileUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Return resume analysis stored on the user document
  async getResumeAnalysis(req, res, next) {
    try {
      const user = await User.findById(req.userId).select('resumeAnalysis resume');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.resume || !user.resume.fileName) {
        return res.status(404).json({ error: 'No resume found for user' });
      }

      res.status(200).json({
        resume: user.resume || null,
        analysis: user.resumeAnalysis || null,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete resume file and update user document
  async deleteResume(req, res, next) {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.resume || !user.resume.fileName) {
        return res.status(404).json({ error: 'No resume to delete' });
      }

      const deleted = await resumeService.deleteResume(user.resume.fileName);

      // Clear resume fields on user regardless of file deletion success
      user.resume = undefined;
      user.resumeAnalysis = undefined;
      await user.save();

      res.status(200).json({ message: 'Resume deleted', removedFile: !!deleted });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.resume?.fileName) {
        await resumeService.deleteResume(user.resume.fileName);
      }

      await Interview.deleteMany({ userId: req.userId });
      await User.deleteOne({ _id: req.userId });

      res.status(200).json({
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();