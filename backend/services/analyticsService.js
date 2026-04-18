const User = require('../models/User');
const Interview = require('../models/Interview');

class AnalyticsService {
  /**
   * Get user overview analytics
   */
  async getUserOverview(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        averageScore: user.averageScore || 0,
        totalSessions: user.totalSessions || 0,
        interviewReadinessScore: user.interviewReadinessScore || 0,
        domainStrengths: user.domainStrengths || {
          contentScore: 0,
          communicationScore: 0,
          confidenceScore: 0,
        },
        domain: user.domain,
        lastInterviewDate: user.lastInterviewDate || null,
      };
    } catch (error) {
      throw new Error(`Failed to get user overview: ${error.message}`);
    }
  }

  /**
   * Get user progress over time
   */
  async getUserProgress(userId, limit = 10) {
    try {
      const interviews = await Interview.find({ userId })
        .select('overallScore createdAt domain')
        .sort({ createdAt: -1 })
        .limit(limit);

      return {
        interviews: interviews.map((interview) => ({
          date: interview.createdAt,
          score: interview.overallScore,
          domain: interview.domain,
        })),
        trend: this.calculateTrend(interviews),
      };
    } catch (error) {
      throw new Error(`Failed to get user progress: ${error.message}`);
    }
  }

  /**
   * Get user's skill analysis
   */
  async getUserSkillsAnalysis(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const interviews = await Interview.find({ userId }).select('answers');

      // Aggregate scores by question difficulty
      const difficultyScores = {
        easy: [],
        medium: [],
        hard: [],
      };

      interviews.forEach((interview) => {
        interview.answers.forEach((answer) => {
          if (answer.difficulty && difficultyScores[answer.difficulty]) {
            difficultyScores[answer.difficulty].push(answer.overallScore || 0);
          }
        });
      });

      // Calculate averages
      const averagesByDifficulty = Object.entries(difficultyScores).reduce(
        (acc, [difficulty, scores]) => {
          acc[difficulty] =
            scores.length > 0
              ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
              : 0;
          return acc;
        },
        {}
      );

      return {
        performanceByDifficulty: averagesByDifficulty,
        strongAreas: this.getStrongAreas(user.domainStrengths),
        weakAreas: this.getWeakAreas(user.domainStrengths),
        skillsGap: user.skillsGap || [],
      };
    } catch (error) {
      throw new Error(`Failed to get skills analysis: ${error.message}`);
    }
  }

  /**
   * Calculate trend (improving, stable, declining)
   */
  calculateTrend(interviews) {
    if (interviews.length < 2) return 'insufficient_data';

    const recent = interviews.slice(0, 5);
    const older = interviews.slice(5, 10);

    if (recent.length === 0 || older.length === 0) return 'insufficient_data';

    const recentAvg = recent.reduce((sum, i) => sum + (i.overallScore || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, i) => sum + (i.overallScore || 0), 0) / older.length;

    const difference = recentAvg - olderAvg;

    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  /**
   * Get strong areas based on domain strengths
   */
  getStrongAreas(domainStrengths) {
    const areas = [];
    const threshold = 70;

    if ((domainStrengths?.contentScore || 0) >= threshold) {
      areas.push({ area: 'Content Knowledge', score: domainStrengths.contentScore });
    }
    if ((domainStrengths?.communicationScore || 0) >= threshold) {
      areas.push({ area: 'Communication', score: domainStrengths.communicationScore });
    }
    if ((domainStrengths?.confidenceScore || 0) >= threshold) {
      areas.push({ area: 'Confidence', score: domainStrengths.confidenceScore });
    }

    return areas;
  }

  /**
   * Get weak areas based on domain strengths
   */
  getWeakAreas(domainStrengths) {
    const areas = [];
    const threshold = 60;

    if ((domainStrengths?.contentScore || 0) < threshold) {
      areas.push({ area: 'Content Knowledge', score: domainStrengths?.contentScore || 0 });
    }
    if ((domainStrengths?.communicationScore || 0) < threshold) {
      areas.push({ area: 'Communication', score: domainStrengths?.communicationScore || 0 });
    }
    if ((domainStrengths?.confidenceScore || 0) < threshold) {
      areas.push({ area: 'Confidence', score: domainStrengths?.confidenceScore || 0 });
    }

    return areas;
  }

  /**
   * Get admin dashboard stats
   */
  async getAdminStats() {
    try {
      const totalUsers = await User.countDocuments();
      const totalInterviews = await Interview.countDocuments();

      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('email displayName domain createdAt totalSessions averageScore');

      const avgUserScore = await User.aggregate([
        {
          $group: {
            _id: null,
            average: { $avg: '$averageScore' },
          },
        },
      ]);

      const usersByDomain = await User.aggregate([
        {
          $group: {
            _id: '$domain',
            count: { $sum: 1 },
          },
        },
      ]);

      return {
        totalUsers,
        totalInterviews,
        averageUserScore: avgUserScore[0]?.average || 0,
        recentUsers,
        usersByDomain: usersByDomain || [],
        topUsers: await this.getTopUsers(10),
      };
    } catch (error) {
      throw new Error(`Failed to get admin stats: ${error.message}`);
    }
  }

  /**
   * Get top performing users
   */
  async getTopUsers(limit = 10) {
    try {
      return await User.find()
        .sort({ averageScore: -1, totalSessions: -1 })
        .limit(limit)
        .select('email displayName domain totalSessions averageScore');
    } catch (error) {
      throw new Error(`Failed to get top users: ${error.message}`);
    }
  }
}

module.exports = new AnalyticsService();
