const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const TIMEOUT_MS = 30000;

class GroqAIService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.model = process.env.GROQ_MODEL || 'mixtral-8x7b-32768';

    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }
  }

  /**
   * Retry logic with exponential backoff
   */
  async retryWithBackoff(fn, retries = MAX_RETRIES, delay = RETRY_DELAY_MS) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === retries - 1) throw error;

        const backoffDelay = delay * Math.pow(2, attempt);
        console.warn(`⚠ Retry attempt ${attempt + 1}/${retries} after ${backoffDelay}ms`);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }
  }

  /**
   * Make API request to Groq
   */
  async makeRequest(messages) {
    return this.retryWithBackoff(async () => {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: TIMEOUT_MS,
        }
      );

      return response.data?.choices?.[0]?.message?.content;
    });
  }

  /**
   * Generate interview feedback based on answer
   */
  async generateInterviewFeedback(question, userAnswer, domain = 'Software Engineering') {
    try {
      const prompt = `You are an expert interview coach for ${domain} roles. 
Evaluate this interview response and provide constructive feedback.

Question: "${question}"
User's Answer: "${userAnswer}"

Please provide:
1. Score (0-100): Rate the answer quality
2. Feedback: 2-3 sentences of specific feedback
3. Improvements: 2-3 bullet points for improvement

Format your response as JSON with keys: score, feedback, improvements (array of strings).`;

      const content = await this.makeRequest([
        {
          role: 'system',
          content: 'You are an expert interview coach. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.getFallbackResponse(userAnswer.length);
      }

      const result = JSON.parse(jsonMatch[0]);

      // Validate parsed response
      if (!result.score || !result.feedback || !Array.isArray(result.improvements)) {
        return this.getFallbackResponse(userAnswer.length);
      }

      return {
        score: Math.min(100, Math.max(0, result.score)),
        feedback: result.feedback,
        improvements: result.improvements.slice(0, 3), // Limit to 3
      };
    } catch (error) {
      console.error('Error generating feedback:', error.message);
      return this.getFallbackResponse(userAnswer.length);
    }
  }

  /**
   * Analyze resume for skills
   */
  async analyzeResume(resumeText, domain = 'Software Engineering') {
    try {
      const prompt = `You are a resume analyzer. Extract key skills and match them with ${domain} requirements.

Resume text: "${resumeText}"

Provide JSON response with:
- extractedSkills: array of 5-10 skills found
- relevantSkills: array of skills relevant to ${domain}
- missingSkills: array of 3-5 skills needed for ${domain}
- overallScore: 0-100 relevance score

Respond with valid JSON only.`;

      const content = await this.makeRequest([
        {
          role: 'system',
          content: 'You are a professional resume analyzer. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.getFallbackResumeAnalysis();
      }

      const result = JSON.parse(jsonMatch[0]);

      return {
        extractedSkills: result.extractedSkills || [],
        relevantSkills: result.relevantSkills || [],
        missingSkills: result.missingSkills || [],
        overallScore: Math.min(100, Math.max(0, result.overallScore || 50)),
      };
    } catch (error) {
      console.error('Error analyzing resume:', error.message);
      return this.getFallbackResumeAnalysis();
    }
  }

  /**
   * Generate interview questions based on domain and resume
   */
  async generateInterviewQuestions(domain, skills = [], count = 5) {
    try {
      const skillsText = skills.length > 0 ? `Focus on: ${skills.join(', ')}` : '';

      const prompt = `Generate ${count} difficult but fair interview questions for a ${domain} position.
${skillsText}

Provide JSON response with:
- questions: array of ${count} interview questions

Each question should test both technical knowledge and soft skills.
Respond with valid JSON only.`;

      const content = await this.makeRequest([
        {
          role: 'system',
          content: `You are an expert interviewer for ${domain}. Generate challenging interview questions. Always respond with valid JSON only.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.getFallbackQuestions();
      }

      const result = JSON.parse(jsonMatch[0]);

      return {
        questions: (result.questions || []).slice(0, count),
      };
    } catch (error) {
      console.error('Error generating questions:', error.message);
      return this.getFallbackQuestions();
    }
  }

  /**
   * Fallback response when AI fails
   */
  getFallbackResponse(answerLength) {
    const score = Math.min(100, Math.max(30, Math.floor((answerLength / 100) * 100)));

    return {
      score,
      feedback: 'Your answer shows good effort. Structure your response with clear examples and outcomes for better impact.',
      improvements: [
        'Use the STAR method (Situation, Task, Action, Result) for behavioral questions',
        'Include quantifiable achievements and metrics',
        'Connect your experience directly to the role requirements',
      ],
    };
  }

  /**
   * Fallback resume analysis
   */
  getFallbackResumeAnalysis() {
    return {
      extractedSkills: ['Communication', 'Problem Solving', 'Leadership', 'Technical Skills'],
      relevantSkills: ['Problem Solving', 'Technical Skills'],
      missingSkills: ['Specialized Domain Knowledge', 'Advanced Certifications', 'Specific Tools Experience'],
      overallScore: 65,
    };
  }

  /**
   * Fallback questions
   */
  getFallbackQuestions() {
    return {
      questions: [
        'Tell me about your biggest professional achievement and the challenges you overcame.',
        'How do you stay updated with the latest technologies and industry trends?',
        'Describe a time when you had to collaborate with a difficult team member.',
        'What are your long-term career goals, and how does this role fit into your plans?',
        'How do you approach problem-solving when you face a complex technical challenge?',
      ],
    };
  }
}

// Export singleton instance
module.exports = new GroqAIService();
