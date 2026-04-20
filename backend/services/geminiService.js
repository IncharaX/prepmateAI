const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use fast model for interview system
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

/**
 * Generic Gemini call function
 */
async function generateFromGemini(prompt) {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Error:", error.message);
        throw new Error("Gemini API failed");
    }
}

module.exports = {
    generateFromGemini,
};