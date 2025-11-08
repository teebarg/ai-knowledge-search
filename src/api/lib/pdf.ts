import pdfParse from "pdf-parse";

/**
 * Extract text from PDF using pdf-parse
 * For more advanced extraction, you can integrate Gemini's file processing API in the future
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text || "";
}
