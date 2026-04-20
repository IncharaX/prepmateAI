const { generate } = require("../services/aiService");

exports.extractSkills = async (req, res) => {
    try {
        const { resumeText } = req.body;

        const prompt = `
Extract structured data from this resume.

Return JSON format:
{
  "skills": [],
  "experience_level": "",
  "projects": []
}

Resume:
${resumeText}
`;

        const result = await generate(prompt);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};