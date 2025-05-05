import puppeteer from 'puppeteer';
import { Groq } from 'groq-sdk';
import { tmpdir } from 'os';
import { promises as fs } from 'fs';
import pdf from 'pdf-parse';
import multer from 'multer';

const groq = new Groq();

export const config = {
  api: {
    bodyParser: false, // Use multer for file uploads
  },
};

// Configure multer for file upload
const upload = multer({ dest: tmpdir() });

// Helper function to parse PDF
async function parsePDF(buffer) {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    throw new Error('Failed to parse PDF: ' + error.message);
  }
}

// Helper function to extract structured data from resume text using Grok
async function extractResumeData(resumeText) {
  const prompt = `
You are a professional resume parser. Extract structured user information from the provided resume text into JSON format. Include the following fields if present: name, email, phone, linkedIn, summary, education, experience, skills, certifications, achievements. For sections like experience, certifications, and achievements, return each entry as a single string (join multiple lines if needed). For skills, return a comma-separated string. For education, parse each entry into "School Name|Course Name|From - To" format, joining multiple entries with newlines. If a field is not found, return it as an empty string. Do not include any formatting or styling instructions.

**Resume Text**:
${resumeText}

**Output Format**:
{
  "name": "",
  "email": "",
  "phone": "",
  "linkedIn": "",
  "summary": "",
  "education": "",
  "experience": "",
  "skills": "",
  "certifications": "",
  "achievements": ""
}
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a professional resume parser.' },
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

    // Parse the JSON output (Grok may return it as a code block)
    const jsonMatch = generatedContent.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Groq response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    throw new Error('Failed to extract resume data: ' + error.message);
  }
}

// Helper function to fetch job description from a URL
async function fetchJobDescription(url) {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    let jobDescription = '';
    let jobTitle = '';

    // Try LinkedIn selectors
    if (url.includes('linkedin.com')) {
      // Job title
      jobTitle = await page.evaluate(() => {
        const titleElement = document.querySelector('h1.top-card-layout__title');
        return titleElement ? titleElement.textContent.trim() : '';
      });
      // Job description
      jobDescription = await page.evaluate(() => {
        const descElement = document.querySelector('.description__text');
        return descElement ? descElement.textContent.trim() : '';
      });
    }
    // Try Indeed selectors
    else if (url.includes('indeed.com')) {
      // Job title
      jobTitle = await page.evaluate(() => {
        const titleElement = document.querySelector('h1.jobsearch-JobInfoHeader-title');
        return titleElement ? titleElement.textContent.trim() : '';
      });
      // Job description
      jobDescription = await page.evaluate(() => {
        const descElement = document.querySelector('#jobDescriptionText');
        return descElement ? descElement.textContent.trim() : '';
      });
    }

    if (!jobDescription) {
      throw new Error('Failed to extract job description from the provided URL');
    }

    // Clean up job description (remove extra whitespace, newlines)
    jobDescription = jobDescription.replace(/\s+/g, ' ').trim();

    return { jobTitle, jobDescription };
  } catch (error) {
    throw new Error('Failed to fetch job description: ' + error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Handle file upload and form data
    const formData = await new Promise((resolve, reject) => {
      upload.any()(req, res, (err) => {
        if (err) return reject(err);
        resolve({
          files: req.files,
          fields: req.body,
        });
      });
    });

    // Extract resume file, job posting URL, and job description
    const resumeFile = formData.files.find((f) => f.fieldname === 'resume');
    const jobPostingUrl = formData.fields.jobPostingUrl;
    const jobDescription = formData.fields.jobDescription;

    if (!resumeFile) {
      return res.status(400).json({ error: 'No resume file provided' });
    }
    if (!jobPostingUrl && !jobDescription) {
      return res.status(400).json({ error: 'No job posting URL or description provided' });
    }

    // Parse resume PDF
    const fileBuffer = await fs.readFile(resumeFile.path);
    const resumeText = await parsePDF(fileBuffer);
    await fs.unlink(resumeFile.path); // Clean up temporary file

    // Extract user details
    const userDetails = await extractResumeData(resumeText);

    // Validate user details
    if (!userDetails.name) {
      return res.status(400).json({ error: 'Failed to extract name from resume' });
    }

    // Fetch job description from URL if provided
    let fetchedJobDescription = jobDescription;
    let jobTitle = jobDescription
      ? jobDescription.split('\n')[0].replace(/[*_]/g, '').trim().toUpperCase() || 'SOFTWARE ENGINEER'
      : 'SOFTWARE ENGINEER';

    if (jobPostingUrl) {
      try {
        const { jobTitle: fetchedTitle, jobDescription: fetchedDesc } = await fetchJobDescription(jobPostingUrl);
        fetchedJobDescription = fetchedDesc;
        jobTitle = fetchedTitle.toUpperCase() || jobTitle;
      } catch (error) {
        if (!jobDescription) {
          return res.status(400).json({ error: error.message });
        }
        // Fallback to provided jobDescription if URL fetch fails
      }
    }

    // Process inputs for template
    const educationEntries = userDetails.education
      ? userDetails.education.split('\n').filter(Boolean).map(entry => {
          const [school, course, date] = entry.split('|').map(s => s.trim());
          return { school, course, date };
        })
      : [];
    const projectLines = userDetails.experience ? userDetails.experience.split('\n').filter(Boolean) : [];
    const skillsArray = userDetails.skills
      ? userDetails.skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    const certificationsLines = userDetails.certifications ? userDetails.certifications.split('\n').filter(Boolean) : [];
    const achievementsLines = userDetails.achievements ? userDetails.achievements.split('\n').filter(Boolean) : [];

    // HTML template with Tailwind CSS, inspired by manjotRes, using full A4 page
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="font-sans leading-normal tracking-normal bg-white w-[595px] h-[842px] m-0 p-0 box-border">
  <!-- Content -->
  <div class="w-full max-w-[595px] h-full mx-auto">
    <!-- Header -->
    <div class="text-center mb-4 pt-4 px-2">
      <h1 class="text-3xl font-bold text-gray-900 uppercase">${userDetails.name || 'CANDIDATE'}</h1>
      <p class="text-sm text-gray-600 mt-2">
        ${userDetails.phone ? `${userDetails.phone} • ` : ''}${userDetails.email || ''}${userDetails.linkedIn ? ` • ${userDetails.linkedIn}` : ''}
      </p>
    </div>

    <!-- Projects -->
    ${projectLines.length ? `
      <div class="mb-4 px-2">
        <h2 class="text-lg font-semibold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-3">Projects</h2>
        ${projectLines.map((line, index) => {
          // Assume lines starting with a title-like format (e.g., "Project Name (Tech)") are project titles
          const isTitle = line.match(/^[^\•-]+(\([^)]+\))?$/) && !line.startsWith('•');
          return isTitle
            ? `
              <div class="mb-3">
                <h3 class="text-base font-semibold text-gray-900">${line}</h3>
                <ul class="text-sm text-gray-700 list-disc pl-5 mt-1">
                  ${projectLines.slice(index + 1).map(nextLine => {
                    if (nextLine.startsWith('•')) {
                      return `<li>${nextLine.slice(1).trim()}</li>`;
                    }
                    return '';
                  }).filter(Boolean).join('')}
                </ul>
              </div>
            `
            : '';
        }).filter(Boolean).join('')}
      </div>
    ` : ''}

    <!-- Education -->
    ${educationEntries.length ? `
      <div class="mb-4 px-2">
        <h2 class="text-lg font-semibold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-3">Education</h2>
        <div>
          ${educationEntries.map(entry => `
            <div class="mb-2">
              <div class="flex justify-between">
                <p class="text-sm text-gray-700">${entry.school || ''}</p>
                <p class="text-sm text-gray-700">${entry.date || ''}</p>
              </div>
              <p class="text-sm text-gray-700">${entry.course || ''}</p>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Technical Skills -->
    ${skillsArray.length ? `
      <div class="mb-4 px-2">
        <h2 class="text-lg font-semibold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-3">Technical Skills</h2>
        <ul class="text-sm text-gray-700">
          <li><span class="font-semibold">Skills:</span> ${skillsArray.join(', ')}</li>
        </ul>
      </div>
    ` : ''}

    <!-- Certifications -->
    ${certificationsLines.length ? `
      <div class="mb-4 px-2">
        <h2 class="text-lg font-semibold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-3">Certifications</h2>
        <ul class="text-sm text-gray-700 list-disc pl-5">
          ${certificationsLines.map(line => `<li>${line}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <!-- Achievements -->
    ${achievementsLines.length ? `
      <div class="mb-4 px-2">
        <h2 class="text-lg font-semibold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-3">Achievements</h2>
        <ul class="text-sm text-gray-700 list-disc pl-5">
          ${achievementsLines.map(line => `<li>${line}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <!-- Additional Information -->
    <div class="mb-4 px-2">
      <h2 class="text-lg font-semibold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-3">Additional Information</h2>
      <ul class="text-sm text-gray-700">
        <li><span class="font-semibold">Version Control:</span> Proficient in Git & GitHub</li>
        <li><span class="font-semibold">Tailored For:</span> This resume is optimized for the ${jobTitle} role.</li>
      </ul>
    </div>
  </div>
</body>
</html>
`;

    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set HTML content
    await page.setContent(htmlTemplate, { waitUntil: 'domcontentloaded' });

    // Generate PDF
    const pdfBytes = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });

    // Close browser
    await browser.close();

    // Convert PDF to base64
    const base64Pdf = Buffer.from(pdfBytes).toString('base64');

    // Return response
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      pdfBytes: base64Pdf,
      fileName: `resume_${userDetails.name ? userDetails.name.replace(/\s+/g, '_') : 'candidate'}.pdf`,
      userDetails,
      fetchedJobDescription
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Failed to generate resume',
      details: error.message,
    });
  }
}