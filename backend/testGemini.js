require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const model = genAI.getGenerativeModel({
            model: "models/gemini-2.5-flash",
        });

        const result = await model.generateContent(
            "Say hello in one line and introduce yourself as an AI interview assistant"
        );

        const response = await result.response;

        console.log("✅ Gemini Response:");
        console.log(response.text());
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

testGemini();