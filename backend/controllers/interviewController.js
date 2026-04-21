const User = require('../models/User');
const Interview = require('../models/Interview');
const interviewService = require('../services/interviewService');

/**
 * Start Interview API
 * Accepts skills from frontend (extracted from resume)
 */
exports.startInterview = async (req, res, next) => {
  try {
    const { domain, skills, difficulty } = req.body;
    const userId = req.userId;

    if (!domain) {
      return res.status(400).json({ success: false, error: 'Domain is required' });
    }

    const interviewData = await interviewService.startInterview(
      userId,
      domain,
      skills || [],
      difficulty || 'medium'
    );

    res.status(201).json({
      success: true,
      message: 'Interview started successfully',
      data: interviewData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit Answer API
 */
exports.submitAnswer = async (req, res, next) => {
  try {
    const { interviewId, questionText, userAnswer, answerType } = req.body;

    if (!interviewId || !questionText || !userAnswer) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const evaluation = await interviewService.submitAnswer(
      interviewId,
      questionText,
      userAnswer,
      answerType || 'text'
    );

    res.status(200).json({
      success: true,
      message: 'Answer evaluated',
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete Interview and get Report
 */
exports.completeInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.body;

    if (!interviewId) {
      return res.status(400).json({ success: false, error: 'Interview ID is required' });
    }

    const report = await interviewService.completeInterview(interviewId);

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

exports.getInterviewHistory = async (req, res, next) => {
  try {
    const userId = req.userId;
    const history = await interviewService.getInterviewHistory(userId);
    res.status(200).json({ success: true, history });
  } catch (error) {
    next(error);
  }
};

exports.getInterviewDetails = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const userId = req.userId;
    const interview = await interviewService.getInterviewDetails(interviewId, userId);
    res.status(200).json({ success: true, interview });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Dashboard Stats
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Fetch all completed interviews for accurate stats
    const completedInterviews = await Interview.find({ userId: user._id, status: 'completed' })
      .sort({ createdAt: -1 });

    const totalSessions = completedInterviews.length;
    let totalScore = 0;
    
    let totalContent = 0;
    let totalCommunication = 0;
    let totalConfidence = 0;
    let answersCount = 0;

    completedInterviews.forEach(interview => {
      totalScore += (interview.overallScore || 0);
      
      if (interview.answers && interview.answers.length > 0) {
        interview.answers.forEach(ans => {
          totalContent += (ans.contentScore || 0);
          totalCommunication += (ans.communicationScore || 0);
          totalConfidence += (ans.confidenceScore || 0);
          answersCount++;
        });
      }
    });

    const averageScore = totalSessions > 0 ? totalScore / totalSessions : 0;
    const interviewReadinessScore = averageScore; // For now, mirror average score

    const domainStrengths = {
      contentScore: answersCount > 0 ? totalContent / answersCount : 0,
      communicationScore: answersCount > 0 ? totalCommunication / answersCount : 0,
      confidenceScore: answersCount > 0 ? totalConfidence / answersCount : 0,
    };

    // For the chart, we can use the top 10 recent completed interviews
    const recentInterviews = completedInterviews.slice(0, 10).map(i => ({
      _id: i._id,
      overallScore: i.overallScore,
      createdAt: i.createdAt,
      domain: i.domain,
      status: i.status
    }));

    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved',
      stats: {
        interviewReadinessScore,
        totalSessions,
        averageScore,
        domainStrengths,
        recentInterviews,
      },
    });
  } catch (error) {
    next(error);
  }
};