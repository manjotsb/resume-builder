'use client'
import { Groq } from 'groq-sdk';

const groq = new Groq();

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { personal, employer } = req.body;

    if (!personal || !employer) {
      return res.status(400).json({ error: 'Personal and employer information are required' });
    }

    const {
      fullName,
      phone,
      email,
      address,
      city,
      province,
    } = personal;

    const {
      managerName,
      companyName,
      companyAddress,
      jobTitle,
      lastWorkingDay,
    } = employer;

    // Validate required fields
    if (!fullName || !phone || !email || !address || !city || !province ||
        !managerName || !companyName || !jobTitle || !lastWorkingDay) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = `
You are a professional career advisor. Generate a professional resignation letter that starts directly with an address header, followed by the body of the letter. STRICTLY FOLLOW THE RESIGNATION LETTER FORMAT PROVIDED BELOW. Do NOT include an introductory line like "Here is a resignation letter...". The letter should have:

**Address Header Format**:
${fullName}
${address}
${city}, ${province}
${phone}
${email}

${managerName}
${companyName}
${companyAddress || 'Address Not Provided'}

[Date: Current date in format MMMM DD, YYYY]

**Body Requirements**:
- 2-3 paragraphs
- Professional and courteous tone
- Clearly state resignation and last working day
- Express gratitude for opportunities
- Offer to assist with transition
- Keep it between 150-250 words
- Start with "Dear ${managerName},"
- End with a closing like "Sincerely," followed by the full name

**Details**:
- Job Title: ${jobTitle}
- Last Working Day: ${lastWorkingDay}
- Manager Name: ${managerName}
- Company Name: ${companyName}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a professional career advisor.' },
        { role: 'user', content: prompt },
      ],
      model: 'llama3-70b-8192',
      temperature: 0.7,
      max_tokens: 512,
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
      error: error.message || 'Failed to generate resignation letter',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}