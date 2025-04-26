import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';

export async function extractTextFromPDF(pdfBytes) {
  try {
    // Using pdf-parse for text extraction
    const data = await pdfParse(pdfBytes);
    return data.text;
  } catch (error) {
    console.error('PDF text extraction failed:', error);
    throw new Error('Could not extract text from PDF');
  }
}