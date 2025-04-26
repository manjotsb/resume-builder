import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse JSON body
    const { userDetails, jobDescription } = req.body;

    if (!userDetails || !jobDescription) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const {
      name,
      email,
      phone,
      linkedIn,
      summary,
      education,
      experience,
      skills,
      certifications,
      achievements,
    } = userDetails;

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([612, 792]); // Letter size: 8.5x11 inches
    const { width, height } = page.getSize();

    // Load fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Define margins and starting position
    const margin = 50;
    let currentY = height - margin;

    // Helper function to add text with wrapping
    const addText = (text, font, size, x, y, maxWidth, lineHeight) => {
      const words = text.split(' ');
      let line = '';
      let lines = [];

      for (let word of words) {
        const testLine = line + word + ' ';
        const testWidth = font.widthOfTextAtSize(testLine, size);
        if (testWidth > maxWidth && line !== '') {
          lines.push(line.trim());
          line = word + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line.trim());

      lines.forEach((line, index) => {
        page.drawText(line, {
          x,
          y: y - index * lineHeight,
          font,
          size,
          color: rgb(0, 0, 0),
        });
      });

      return lines.length * lineHeight;
    };

    // Helper function to add section with bullet points
    const addSectionWithBullets = (title, content, sectionX, sectionY) => {
      if (!content) return sectionY;

      // Add section title
      page.drawText(title, {
        x: sectionX,
        y: sectionY,
        size: 14,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
      sectionY -= 20;

      // Split content into lines (assuming user inputs lines separated by \n)
      const lines = content.split('\n').filter((line) => line.trim());
      for (let line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine) {
          // Add bullet point
          page.drawText('•', {
            x: sectionX + 10,
            y: sectionY,
            size: 12,
            font: helvetica,
            color: rgb(0, 0, 0),
          });
          // Add text next to bullet
          sectionY -= addText(
            trimmedLine,
            helvetica,
            12,
            sectionX + 25,
            sectionY,
            width - sectionX - margin - 25,
            14
          );
        }
      }
      return sectionY;
    };

    // Helper function to check page overflow and add new page if needed
    const checkPageOverflow = (y) => {
      if (y < margin) {
        page = pdfDoc.addPage([612, 792]);
        return height - margin;
      }
      return y;
    };

    // Add Job Title (from job description, simplified)
    const jobTitle = jobDescription
      .split('\n')[0]
      .replace(/[*_]/g, '')
      .trim()
      .toUpperCase() || 'LARGE LANGUAGE MODEL ENGINEER';
    page.drawText(jobTitle, {
      x: margin,
      y: currentY,
      size: 16,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    currentY -= 30;

    // Contact Information
    currentY = addSectionWithBullets('Contact Information:', [
      `Email: ${email || 'Not provided'}`,
      phone ? `Phone: ${phone}` : '',
      linkedIn ? `LinkedIn: ${linkedIn}` : '',
    ].filter(Boolean).join('\n'), margin, currentY);
    currentY -= 20;
    currentY = checkPageOverflow(currentY);

    // Summary
    if (summary) {
      page.drawText('Summary:', {
        x: margin,
        y: currentY,
        size: 14,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
      currentY -= 20;
      currentY -= addText(summary, helvetica, 12, margin, currentY, width - 2 * margin, 14);
      currentY -= 20;
      currentY = checkPageOverflow(currentY);
    }

    // Technical Skills
    currentY = addSectionWithBullets('Technical Skills:', skills, margin, currentY);
    currentY -= 20;
    currentY = checkPageOverflow(currentY);

    // Professional Experience
    currentY = addSectionWithBullets('Professional Experience:', experience, margin, currentY);
    currentY -= 20;
    currentY = checkPageOverflow(currentY);

    // Education
    currentY = addSectionWithBullets('Education:', education, margin, currentY);
    currentY -= 20;
    currentY = checkPageOverflow(currentY);

    // Certifications
    currentY = addSectionWithBullets('Certifications:', certifications, margin, currentY);
    currentY -= 20;
    currentY = checkPageOverflow(currentY);

    // Achievements
    currentY = addSectionWithBullets('Achievements:', achievements, margin, currentY);
    currentY -= 20;
    currentY = checkPageOverflow(currentY);

    // References
    page.drawText('References:', {
      x: margin,
      y: currentY,
      size: 14,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    currentY -= 20;
    currentY -= addText(
      'Available upon request.',
      helvetica,
      12,
      margin,
      currentY,
      width - 2 * margin,
      14
    );
    currentY -= 20;
    currentY = checkPageOverflow(currentY);

    // Optional: Tailoring note (placeholder for AI optimization)
    if (jobDescription) {
      page.drawText('Tailored For:', {
        x: margin,
        y: currentY,
        size: 14,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
      currentY -= 20;
      const summary = `This resume is tailored to the provided job description for a Large Language Model Engineer.`;
      currentY -= addText(summary, helvetica, 12, margin, currentY, width - 2 * margin, 14);
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const base64Pdf = Buffer.from(pdfBytes).toString('base64');

    // Return response
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      pdfBytes: base64Pdf,
      fileName: `resume_${name.replace(/\s+/g, '_') || 'candidate'}.pdf`,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Failed to generate resume',
      details: error.message,
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};