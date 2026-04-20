const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');
const aiService = require('../services/unifiedAIService');

/**
 * Handle Resume Upload and Skill Extraction
 */
exports.uploadAndExtract = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        let extractedText = '';

        // 1. Extract text based on file type
        if (fileExt === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            extractedText = data.text;
        } else if (fileExt === '.docx' || fileExt === '.doc') {
            const data = await mammoth.extractRawText({ path: filePath });
            extractedText = data.value;
        } else {
            return res.status(400).json({ success: false, message: 'Unsupported file format' });
        }

        if (!extractedText.trim()) {
            return res.status(400).json({ success: false, message: 'Could not extract text from resume' });
        }

        // 2. Send to Gemini for skill extraction
        const analysis = await aiService.extractResumeSkills(extractedText);

        // 3. Cleanup: Delete the uploaded file after processing
        // (Optional: keep if you want to store it, but for privacy/space we delete)
        fs.unlinkSync(filePath);

        res.status(200).json({
            success: true,
            data: {
                skills: analysis.skills,
                experience_level: analysis.experience_level,
                domain: analysis.domain || 'Software Engineering'
            }
        });
    } catch (error) {
        console.error('Resume Extraction Error:', error);
        next(error);
    }
};