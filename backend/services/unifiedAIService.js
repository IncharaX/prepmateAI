const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Using 1.5 Flash as requested/stable
});

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * AI Service Layer
 */
class UnifiedAIService {
    /**
     * Extract skills and experience level from resume text using Gemini
     */
    async extractResumeSkills(resumeText) {
        try {
            const prompt = `
            Extract structured data from this resume text.
            Text: "${resumeText}"

            Respond in JSON format:
            {
              "skills": ["skill1", "skill2", ...],
              "experience_level": "Entry/Mid/Senior",
              "domain": "e.g. Software Engineering"
            }
            Provide 8-12 most relevant technical and soft skills.
            Respond with valid JSON only.
            `;

            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Clean JSON response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Invalid AI response format");
            
            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error("Gemini Skill Extraction Error:", error.message);
            throw new Error("Failed to extract skills from resume");
        }
    }

    /**
     * Generate interview questions using Gemini
     */
    async generateQuestions(domain, skills = [], count = 5) {
        try {
            const prompt = `
            You are an expert interviewer for ${domain} roles.
            Based on these skills: ${skills.join(", ")}, generate ${count} professional interview questions.
            
            Requirements:
            - Include 2 technical questions based on the skills.
            - Include 2 behavioral questions.
            - Include 1 problem-solving scenario.
            - Questions should be challenging but fair.

            Respond in JSON format:
            {
              "questions": [
                {
                  "id": "1",
                  "text": "Question text here",
                  "category": "Technical/Behavioral/System Design",
                  "skills_tested": ["skill1", "skill2"]
                },
                ...
              ]
            }
            Respond with valid JSON only.
            `;

            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Invalid AI response format");

            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.questions || [];
        } catch (error) {
            console.error("Gemini Question Generation Error:", error.message);
            throw new Error("Failed to generate interview questions");
        }
    }

    /**
     * Evaluate interview answer using Groq (Llama 3)
     */
    async evaluateAnswer(question, userAnswer, domain = "Software Engineering") {
        try {
            const prompt = `
            You are an expert interview evaluator for ${domain}.
            Evaluate the following response to an interview question.

            Question: "${question}"
            Candidate Answer: "${userAnswer}"

            Evaluation criteria (0-100 score):
            - Technical accuracy
            - Communication clarity
            - Confidence and articulation

            Respond in JSON format:
            {
              "score": <0-100 number>,
              "feedback": "2-3 sentences of specific feedback",
              "improvements": ["improvement1", "improvement2"]
            }
            Respond with valid JSON only.
            `;

            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a professional technical interviewer evaluator. You provide honest, constructive feedback in JSON format.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                model: "llama-3.1-70b-versatile",
                temperature: 0.5,
                response_format: { type: "json_object" },
            });

            const content = chatCompletion.choices[0]?.message?.content;
            return JSON.parse(content);
        } catch (error) {
            console.error("Groq Evaluation Error:", error.message);
            // Fallback response
            return {
                score: 50,
                feedback: "We encountered an issue during evaluation. Your answer was recorded.",
                improvements: ["Try to be more specific next time."],
            };
        }
    }
}

module.exports = new UnifiedAIService();
