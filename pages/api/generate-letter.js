import { Groq } from 'groq-sdk';
import { tmpdir } from 'os';
import { promises as fs } from 'fs';
import pdf from 'pdf-parse';

const groq = new Groq();

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parsePDF(buffer) {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    throw new Error('Failed to parse PDF: ' + error.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const multer = require('multer');
    const upload = multer({ dest: tmpdir() });

    const formData = await new Promise((resolve, reject) => {
      upload.any()(req, res, (err) => {
        if (err) return reject(err);
        resolve({
          files: req.files,
          fields: req.body,
        });
      });
    });

    const resumeFile = formData.files.find((f) => f.fieldname === 'resume');
    if (!resumeFile) {
      return res.status(400).json({ error: 'No resume file provided' });
    }

    const jobData = JSON.parse(formData.fields.jobDescription);
    if (!jobData.description) {
      return res.status(400).json({ error: 'No job description provided' });
    }

    // Parse PDF
    const fileBuffer = await fs.readFile(resumeFile.path);
    const resumeText = await parsePDF(fileBuffer);
    await fs.unlink(resumeFile.path);

    const prompt = `
You are a professional career advisor. Generate a tailored cover letter that starts directly with an address header, followed by the body of the cover letter.STRICTLY FOLLOW THE COVER LETTER FORMAT PROVIDED BELOW. Do NOT include an introductory line like "Here is a tailored cover letter...". The cover letter should have:

**Address Header Format**:
[Your Name]
[Your Phone]
[Your Email]

${jobData.contactName || 'Hiring Manager'}
${jobData.companyName || 'Company Name'}
${jobData.city || 'City'}, ${jobData.province || 'Province'}

**Body Requirements**:
- 3-4 paragraphs
- Professional tone
- Address key requirements from the job description
- Use specific examples from the resume
- Keep it between 300-400 words
- Start with "Dear ${jobData.contactName || 'Hiring Manager'},"

**Job Details**:
- Job Title: ${jobData.roleTitle || 'Not specified'}
- Salary Range: ${
      jobData.currency && jobData.minSalary && jobData.maxSalary
        ? `${jobData.currency}${jobData.minSalary}-${jobData.maxSalary}`
        : 'Not specified'
    }
- Job Description:
${jobData.description}

**Resume Content**:
${resumeText}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a professional career advisor.' },
        { role: 'user', content: prompt },
      ],
      model: 'llama3-70b-8192',
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const generatedContent = chatCompletion.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('Unexpected response format from Groq API');
    }

    res.status(200).json({ letter: generatedContent });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate cover letter',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}