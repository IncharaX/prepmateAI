const Interview = require('../models/Interview');
const User = require('../models/User');
const unifiedAIService = require('./unifiedAIService');

class InterviewService {
  /**
   * Start a new interview session
   */
  async startInterview(userId, domain, skills = [], count = 5) {
    try {
      // 1. Generate questions using Gemini (Flash 1.5/2.0)
      const generatedQuestions = await unifiedAIService.generateQuestions(
        domain,
        skills,
        count
      );

      // 2. Create interview record in MongoDB
      const interview = new Interview({
        userId,
        domain,
        questionsCount: generatedQuestions.length,
        difficulty: 'medium',
        status: 'in-progress',
        // Store technical metadata if needed
      });

      // Mapping questions for storage if needed, or just let the frontend track them
      // In this system, we'll return the questions to frontend to display.
      
      await interview.save();

      return {
        interviewId: interview._id,
        questions: generatedQuestions,
        domain,
      };
    } catch (error) {
      console.error('Start interview service error:', error.message);
      throw error;
    }
  }

  /**
   * Submit an answer for evaluation
   */
  async submitAnswer(interviewId, questionText, userAnswer, answerType = 'text') {
    try {
      const interview = await Interview.findById(interviewId);
      if (!interview) throw new Error('Interview not found');

      // 1. Evaluate using Groq
      const evaluation = await unifiedAIService.evaluateAnswer(
        questionText,
        userAnswer,
        interview.domain
      );

      // 2. Add answer to session
      const answerObj = {
        questionText,
        userAnswer,
        answerType,
        contentScore: evaluation.score || 0,
        communicationScore: evaluation.score || 0, // Simplified for now or split if AI provides
        confidenceScore: evaluation.score || 0,
        overallScore: evaluation.score || 0,
        feedback: evaluation.feedback,
      };

      interview.answers.push(answerObj);
      await interview.save();

      return {
        score: evaluation.score,
        feedback: evaluation.feedback,
        improvements: evaluation.improvements,
      };
    } catch (error) {
      console.error('Submit answer service error:', error.message);
      throw error;
    }
  }

  /**
   * Complete session and calculate summary
   */
  async completeInterview(interviewId) {
    try {
      const interview = await Interview.findById(interviewId);
      if (!interview) throw new Error('Interview not found');

      const avgScore = interview.answers.length > 0
        ? Math.round(interview.answers.reduce((sum, a) => sum + a.overallScore, 0) / interview.answers.length)
        : 0;

      interview.overallScore = avgScore;
      interview.status = 'completed';
      interview.endTime = new Date();
      interview.duration = Math.round((interview.endTime - interview.startTime) / 1000);

      await interview.save();

      return {
        interviewId: interview._id,
        overallScore: avgScore,
        totalQuestions: interview.answers.length,
        answers: interview.answers
      };
    } catch (error) {
      console.error('Complete interview service error:', error.message);
      throw error;
    }
  }

  async getInterviewHistory(userId, limit = 10, skip = 0) {
    return await Interview.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
  }

  async getInterviewDetails(interviewId, userId) {
    const interview = await Interview.findById(interviewId);
    if (!interview || interview.userId.toString() !== userId) {
      throw new Error('Interview not found');
    }
    return interview;
  }
}

module.exports = new InterviewService();
